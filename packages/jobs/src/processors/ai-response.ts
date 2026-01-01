// AI Response Processor
import { Job, UnrecoverableError } from 'bullmq';
import { prisma } from '@support-platform/database';
import { AIOrchestrator, EmbeddingService } from '@support-platform/ai-engine';
import { AIResponseJobData, AIResponseJobResult } from '../types';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const orchestrator = new AIOrchestrator({ openaiApiKey: process.env.OPENAI_API_KEY! });
const embeddingService = new EmbeddingService(openai);

export async function processAIResponse(
    job: Job<AIResponseJobData>
): Promise<AIResponseJobResult> {
    const { conversationId, workspaceId, customerMessage, messageId } = job.data;

    try {
        // Update job progress
        await job.updateProgress(10);

        // Get conversation context
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    take: 20,
                },
                customer: true,
            },
        });

        if (!conversation) {
            throw new UnrecoverableError('Conversation not found');
        }

        // Skip if already handled by human
        if (conversation.handler === 'HUMAN') {
            return { success: true, escalated: false };
        }

        await job.updateProgress(30);

        // Get relevant knowledge chunks
        const queryEmbedding = await embeddingService.createEmbedding(customerMessage);

        // Fetch stored embeddings (simplified - in production use vector DB)
        const knowledgeChunks = await prisma.knowledgeChunk.findMany({
            where: { source: { workspaceId } },
            include: { source: true },
            take: 100,
        });

        await job.updateProgress(50);

        // Find similar chunks
        const relevantSources = knowledgeChunks
            .map((chunk) => {
                const embedding = chunk.embedding as number[];
                const similarity = embeddingService.cosineSimilarity(queryEmbedding, embedding);
                return {
                    id: chunk.id,
                    name: chunk.source.name,
                    content: chunk.content,
                    similarity,
                };
            })
            .filter((s) => s.similarity > 0.7)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 5);

        await job.updateProgress(70);

        // Generate AI response
        const context = {
            workspaceId,
            conversationId,
            customerId: conversation.customerId,
            channel: conversation.channel as 'LIVE_CHAT' | 'EMAIL' | 'WHATSAPP',
            messageHistory: conversation.messages.map((m) => ({
                role: m.sender === 'CUSTOMER' ? 'customer' as const : 'assistant' as const,
                content: m.content,
                timestamp: m.createdAt,
            })),
        };

        const aiResponse = await orchestrator.generateResponse(
            context,
            customerMessage,
            relevantSources
        );

        await job.updateProgress(90);

        // Create AI message
        const aiMessage = await prisma.message.create({
            data: {
                conversationId,
                content: aiResponse.content,
                sender: 'AI',
                aiConfidence: aiResponse.confidence,
                metadata: {
                    sources: aiResponse.sources.map((s) => s.id),
                    escalationReason: aiResponse.escalationReason,
                },
            },
        });

        // Handle escalation
        if (aiResponse.shouldEscalate) {
            await prisma.conversation.update({
                where: { id: conversationId },
                data: {
                    handler: 'PENDING',
                    priority: aiResponse.escalationReason === 'negative_sentiment' ? 'HIGH' : 'NORMAL',
                },
            });
        }

        await job.updateProgress(100);

        return {
            success: true,
            messageId: aiMessage.id,
            escalated: aiResponse.shouldEscalate,
        };
    } catch (error) {
        console.error('AI response processing error:', error);

        // Create fallback message on failure
        await prisma.message.create({
            data: {
                conversationId,
                content: "I apologize, but I'm having trouble right now. Let me connect you with a team member.",
                sender: 'AI',
                aiConfidence: 0,
            },
        });

        await prisma.conversation.update({
            where: { id: conversationId },
            data: { handler: 'PENDING' },
        });

        throw error;
    }
}
