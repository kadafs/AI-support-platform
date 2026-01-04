// Knowledge Ingestion Processor
import { Job, UnrecoverableError } from 'bullmq';
import { prisma } from '@support-platform/database';
import { KnowledgeIngester } from '@support-platform/ai-engine';
import { KnowledgeIngestionJobData, KnowledgeIngestionJobResult } from '../types';
import OpenAI from 'openai';

// Lazy initialization to avoid build-time errors when OPENAI_API_KEY isn't available
let _openai: OpenAI | null = null;
let _ingester: KnowledgeIngester | null = null;

function getOpenAI(): OpenAI {
    if (!_openai) {
        _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return _openai;
}

function getIngester(): KnowledgeIngester {
    if (!_ingester) {
        _ingester = new KnowledgeIngester(getOpenAI());
    }
    return _ingester;
}

export async function processKnowledgeIngestion(
    job: Job<KnowledgeIngestionJobData>
): Promise<KnowledgeIngestionJobResult> {
    const { sourceId, sourceType, sourceUrl, content } = job.data;

    try {
        await job.updateProgress(10);

        // Get the knowledge source
        const source = await prisma.knowledgeSource.findUnique({
            where: { id: sourceId },
        });

        if (!source) {
            throw new UnrecoverableError('Knowledge source not found');
        }

        // Update status to processing
        await prisma.knowledgeSource.update({
            where: { id: sourceId },
            data: { status: 'PROCESSING' },
        });

        await job.updateProgress(20);

        let chunks;

        switch (sourceType) {
            case 'URL':
                if (!sourceUrl) throw new UnrecoverableError('URL is required');
                chunks = await getIngester().ingestURL(sourceId, source.name, sourceUrl);
                break;

            case 'QA':
                if (!content) throw new UnrecoverableError('Q&A content is required');
                const qaPairs = JSON.parse(content);
                chunks = await getIngester().ingestQA(sourceId, source.name, qaPairs);
                break;

            case 'CSV':
                if (!content) throw new UnrecoverableError('CSV content is required');
                chunks = await getIngester().ingestCSV(sourceId, source.name, content);
                break;

            case 'MANUAL':
                if (!content) throw new UnrecoverableError('Text content is required');
                chunks = await getIngester().ingestText(sourceId, source.name, content);
                break;

            default:
                throw new UnrecoverableError(`Unknown source type: ${sourceType}`);
        }

        await job.updateProgress(80);

        // Store chunks in database
        await prisma.knowledgeChunk.createMany({
            data: chunks.map((chunk) => ({
                sourceId,
                content: chunk.content,
                embedding: chunk.embedding,
                metadata: chunk.metadata,
            })),
        });

        // Update source status
        await prisma.knowledgeSource.update({
            where: { id: sourceId },
            data: {
                status: 'ACTIVE',
                lastSyncedAt: new Date(),
            },
        });

        await job.updateProgress(100);

        return {
            success: true,
            chunksCreated: chunks.length,
        };
    } catch (error) {
        console.error('Knowledge ingestion error:', error);

        // Update source status to failed
        await prisma.knowledgeSource.update({
            where: { id: sourceId },
            data: {
                status: 'FAILED',
                metadata: {
                    ...(typeof source?.metadata === 'object' ? source.metadata : {}),
                    error: String(error),
                },
            },
        });

        throw error;
    }
}
