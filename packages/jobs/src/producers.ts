// Job Producers - Add jobs to queues
import { createQueues, JobQueues } from './queues';
import {
    QUEUE_NAMES,
    AIResponseJobData,
    KnowledgeIngestionJobData,
    EmailSendJobData,
    EmailReceiveJobData,
    WhatsAppSendJobData,
    WhatsAppReceiveJobData,
    AnalyticsJobData,
} from './types';

// Lazy initialization to avoid connecting to Redis at build time
let _queues: JobQueues | null = null;

function getQueues(): JobQueues {
    if (!_queues) {
        _queues = createQueues();
    }
    return _queues;
}

/**
 * Add AI response job - triggered when customer sends a message
 */
export async function addAIResponseJob(data: AIResponseJobData): Promise<string> {
    const job = await getQueues()[QUEUE_NAMES.AI_RESPONSE].add(
        'generate-response',
        data,
        {
            jobId: `ai-${data.conversationId}-${Date.now()}`,
        }
    );
    return job.id!;
}

/**
 * Add knowledge ingestion job - triggered when new knowledge source is added
 */
export async function addKnowledgeIngestionJob(data: KnowledgeIngestionJobData): Promise<string> {
    const job = await getQueues()[QUEUE_NAMES.KNOWLEDGE_INGESTION].add(
        'ingest-knowledge',
        data,
        {
            jobId: `ingest-${data.sourceId}`,
        }
    );
    return job.id!;
}

/**
 * Add email send job
 */
export async function addEmailSendJob(data: EmailSendJobData): Promise<string> {
    const job = await getQueues()[QUEUE_NAMES.EMAIL_SEND].add(
        'send-email',
        data,
        {
            jobId: `email-${data.conversationId}-${Date.now()}`,
        }
    );
    return job.id!;
}

/**
 * Add email receive job (from webhook)
 */
export async function addEmailReceiveJob(data: EmailReceiveJobData): Promise<string> {
    const job = await getQueues()[QUEUE_NAMES.EMAIL_RECEIVE].add(
        'process-email',
        data
    );
    return job.id!;
}

/**
 * Add WhatsApp send job
 */
export async function addWhatsAppSendJob(data: WhatsAppSendJobData): Promise<string> {
    const job = await getQueues()[QUEUE_NAMES.WHATSAPP_SEND].add(
        'send-whatsapp',
        data,
        {
            jobId: `wa-${data.conversationId}-${Date.now()}`,
        }
    );
    return job.id!;
}

/**
 * Add WhatsApp receive job (from webhook)
 */
export async function addWhatsAppReceiveJob(data: WhatsAppReceiveJobData): Promise<string> {
    const job = await getQueues()[QUEUE_NAMES.WHATSAPP_RECEIVE].add(
        'process-whatsapp',
        data
    );
    return job.id!;
}

/**
 * Add analytics job
 */
export async function addAnalyticsJob(data: AnalyticsJobData): Promise<string> {
    const job = await getQueues()[QUEUE_NAMES.ANALYTICS].add(
        'track-event',
        data
    );
    return job.id!;
}
