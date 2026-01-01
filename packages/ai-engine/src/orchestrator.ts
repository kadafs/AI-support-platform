import OpenAI from 'openai';
import { AIConfig, ConversationContext, AIResponse, KnowledgeSource } from './types';
import { EmbeddingService } from './embeddings';
import { EscalationEngine } from './escalation';

const DEFAULT_SYSTEM_PROMPT = `You are a helpful customer support AI assistant. Your role is to:
1. Answer customer questions accurately and helpfully
2. Use ONLY the provided knowledge base context to answer questions
3. If you're not confident about an answer, say so honestly
4. Be concise but thorough
5. Maintain a friendly, professional tone
6. If the customer seems frustrated or the question is complex, suggest escalating to a human agent

IMPORTANT: Never make up information. Only use facts from the provided context.
If you cannot answer from the context, politely say you'll need to connect them with a team member.`;

export class AIOrchestrator {
    private openai: OpenAI;
    private config: Required<AIConfig>;
    private embeddingService: EmbeddingService;
    private escalationEngine: EscalationEngine;

    constructor(config: AIConfig) {
        this.config = {
            openaiApiKey: config.openaiApiKey,
            model: config.model || 'gpt-4o',
            maxTokens: config.maxTokens || 500,
            temperature: config.temperature || 0.7,
            confidenceThreshold: config.confidenceThreshold || 0.7,
        };

        this.openai = new OpenAI({ apiKey: this.config.openaiApiKey });
        this.embeddingService = new EmbeddingService(this.openai);
        this.escalationEngine = new EscalationEngine();
    }

    async generateResponse(
        context: ConversationContext,
        userMessage: string,
        knowledgeChunks: KnowledgeSource[]
    ): Promise<AIResponse> {
        // Check for escalation triggers first
        const escalationCheck = this.escalationEngine.checkEscalation(
            userMessage,
            context.messageHistory
        );

        if (escalationCheck.shouldEscalate) {
            return {
                content: this.getEscalationMessage(escalationCheck.reason!),
                confidence: 0,
                sources: [],
                shouldEscalate: true,
                escalationReason: escalationCheck.reason,
            };
        }

        // Build context from knowledge chunks
        const knowledgeContext = knowledgeChunks
            .map((chunk, i) => `[Source ${i + 1}: ${chunk.name}]\n${chunk.content}`)
            .join('\n\n');

        // Build messages for OpenAI
        const messages: OpenAI.ChatCompletionMessageParam[] = [
            { role: 'system', content: DEFAULT_SYSTEM_PROMPT },
            {
                role: 'system',
                content: `KNOWLEDGE BASE CONTEXT:\n${knowledgeContext || 'No relevant context found.'}`,
            },
            // Add conversation history
            ...context.messageHistory.slice(-10).map((msg) => ({
                role: msg.role === 'customer' ? 'user' : msg.role,
                content: msg.content,
            })) as OpenAI.ChatCompletionMessageParam[],
            { role: 'user', content: userMessage },
        ];

        try {
            const completion = await this.openai.chat.completions.create({
                model: this.config.model,
                messages,
                max_tokens: this.config.maxTokens,
                temperature: this.config.temperature,
            });

            const responseContent = completion.choices[0]?.message?.content || '';

            // Calculate confidence based on knowledge context availability and response
            const confidence = this.calculateConfidence(
                knowledgeChunks,
                responseContent,
                userMessage
            );

            // Check if we should escalate due to low confidence
            const shouldEscalate = confidence < this.config.confidenceThreshold;

            return {
                content: responseContent,
                confidence,
                sources: knowledgeChunks,
                shouldEscalate,
                escalationReason: shouldEscalate ? 'low_confidence' : undefined,
            };
        } catch (error) {
            console.error('AI generation error:', error);
            return {
                content: "I apologize, but I'm having trouble processing your request. Let me connect you with a team member who can help.",
                confidence: 0,
                sources: [],
                shouldEscalate: true,
                escalationReason: 'complex_query',
            };
        }
    }

    private calculateConfidence(
        sources: KnowledgeSource[],
        response: string,
        query: string
    ): number {
        let confidence = 0.5; // Base confidence

        // Higher confidence with more relevant sources
        if (sources.length > 0) {
            const avgSimilarity = sources.reduce((sum, s) => sum + s.similarity, 0) / sources.length;
            confidence += avgSimilarity * 0.3;
        }

        // Lower confidence for uncertain language
        const uncertainPhrases = [
            "i'm not sure",
            "i don't know",
            "i cannot",
            "i'm unable",
            "might be",
            "could be",
            "perhaps",
            "maybe",
        ];

        const responseLower = response.toLowerCase();
        const hasUncertainty = uncertainPhrases.some(phrase => responseLower.includes(phrase));
        if (hasUncertainty) {
            confidence -= 0.2;
        }

        // Boost confidence for direct answers
        if (response.length > 50 && sources.length > 0) {
            confidence += 0.1;
        }

        return Math.max(0, Math.min(1, confidence));
    }

    private getEscalationMessage(reason: string): string {
        const messages: Record<string, string> = {
            customer_request: "Of course! I'll connect you with a team member right away. They'll be with you shortly.",
            negative_sentiment: "I understand this is frustrating. Let me connect you with a team member who can help resolve this for you.",
            sensitive_topic: "I'd like to make sure you get the best possible help with this. Let me connect you with a team member.",
            low_confidence: "That's a great question! To make sure you get accurate information, let me connect you with a team member.",
            complex_query: "This requires some detailed attention. Let me connect you with a specialist who can help.",
            action_required: "To complete this request, I'll need to connect you with a team member who can take action on your behalf.",
        };
        return messages[reason] || "Let me connect you with a team member who can assist you further.";
    }

    async createEmbedding(text: string): Promise<number[]> {
        return this.embeddingService.createEmbedding(text);
    }
}
