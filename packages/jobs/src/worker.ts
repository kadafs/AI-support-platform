// Background Job Worker
import { Worker, Job } from 'bullmq';
import { getRedisConnection } from './queues';
import { QUEUE_NAMES } from './types';
import { processAIResponse } from './processors/ai-response';
import { processKnowledgeIngestion } from './processors/knowledge-ingestion';
import { processEmailSend, processEmailReceive } from './processors/email';

const workers: Worker[] = [];

export function startWorker(): void {
    const connection = getRedisConnection();

    console.log('🚀 Starting background job workers...');

    // AI Response Worker
    const aiWorker = new Worker(
        QUEUE_NAMES.AI_RESPONSE,
        async (job) => {
            console.log(`[AI] Processing job ${job.id}`);
            return processAIResponse(job);
        },
        {
            connection,
            concurrency: 5,
            limiter: {
                max: 10,
                duration: 1000, // 10 jobs per second max
            },
        }
    );

    aiWorker.on('completed', (job) => {
        console.log(`[AI] Job ${job.id} completed`);
    });

    aiWorker.on('failed', (job, err) => {
        console.error(`[AI] Job ${job?.id} failed:`, err.message);
    });

    workers.push(aiWorker);

    // Knowledge Ingestion Worker
    const knowledgeWorker = new Worker(
        QUEUE_NAMES.KNOWLEDGE_INGESTION,
        async (job) => {
            console.log(`[Knowledge] Processing job ${job.id}`);
            return processKnowledgeIngestion(job);
        },
        {
            connection,
            concurrency: 2, // Lower concurrency for heavy jobs
        }
    );

    knowledgeWorker.on('completed', (job) => {
        console.log(`[Knowledge] Job ${job.id} completed`);
    });

    knowledgeWorker.on('failed', (job, err) => {
        console.error(`[Knowledge] Job ${job?.id} failed:`, err.message);
    });

    workers.push(knowledgeWorker);

    // Email Send Worker
    const emailSendWorker = new Worker(
        QUEUE_NAMES.EMAIL_SEND,
        async (job) => {
            console.log(`[Email] Processing send job ${job.id}`);
            return processEmailSend(job);
        },
        { connection, concurrency: 5 }
    );

    emailSendWorker.on('completed', (job) => {
        console.log(`[Email] Send job ${job.id} completed`);
    });

    emailSendWorker.on('failed', (job, err) => {
        console.error(`[Email] Send job ${job?.id} failed:`, err.message);
    });

    workers.push(emailSendWorker);

    // Email Receive Worker
    const emailReceiveWorker = new Worker(
        QUEUE_NAMES.EMAIL_RECEIVE,
        async (job) => {
            console.log(`[Email] Processing receive job ${job.id}`);
            return processEmailReceive(job);
        },
        { connection, concurrency: 5 }
    );

    emailReceiveWorker.on('completed', (job) => {
        console.log(`[Email] Receive job ${job.id} completed`);
    });

    emailReceiveWorker.on('failed', (job, err) => {
        console.error(`[Email] Receive job ${job?.id} failed:`, err.message);
    });

    workers.push(emailReceiveWorker);

    // WhatsApp Send Worker (placeholder)
    const whatsappSendWorker = new Worker(
        QUEUE_NAMES.WHATSAPP_SEND,
        async (job) => {
            console.log(`[WhatsApp] Processing send job ${job.id}`);
            // TODO: Implement with Twilio API
            return { success: true };
        },
        { connection, concurrency: 5 }
    );

    workers.push(whatsappSendWorker);

    // WhatsApp Receive Worker (placeholder)
    const whatsappReceiveWorker = new Worker(
        QUEUE_NAMES.WHATSAPP_RECEIVE,
        async (job) => {
            console.log(`[WhatsApp] Processing receive job ${job.id}`);
            // TODO: Implement WhatsApp parsing and conversation creation
            return { success: true };
        },
        { connection, concurrency: 5 }
    );

    workers.push(whatsappReceiveWorker);

    // Analytics Worker
    const analyticsWorker = new Worker(
        QUEUE_NAMES.ANALYTICS,
        async (job) => {
            console.log(`[Analytics] Processing job ${job.id}`);
            // TODO: Store analytics events
            return { success: true };
        },
        { connection, concurrency: 10 }
    );

    workers.push(analyticsWorker);

    console.log(`✅ Started ${workers.length} workers`);

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        console.log('Shutting down workers...');
        await stopWorkers();
        process.exit(0);
    });

    process.on('SIGINT', async () => {
        console.log('Shutting down workers...');
        await stopWorkers();
        process.exit(0);
    });
}

async function stopWorkers(): Promise<void> {
    await Promise.all(workers.map((w) => w.close()));
}

// CLI entry point
if (require.main === module) {
    startWorker();
}
