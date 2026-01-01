// Queue Definitions
import { Queue, QueueOptions } from 'bullmq';
import { Redis } from 'ioredis';
import { QUEUE_NAMES, QueueName } from './types';

let connection: Redis | null = null;

export function getRedisConnection(): Redis {
    if (!connection) {
        connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            maxRetriesPerRequest: null,
        });
    }
    return connection;
}

const defaultQueueOptions: Partial<QueueOptions> = {
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: {
            age: 24 * 60 * 60, // 24 hours
            count: 1000,
        },
        removeOnFail: {
            age: 7 * 24 * 60 * 60, // 7 days
        },
    },
};

export type JobQueues = {
    [K in QueueName]: Queue;
};

let queues: JobQueues | null = null;

export function createQueues(): JobQueues {
    if (queues) return queues;

    const connection = getRedisConnection();

    queues = {
        [QUEUE_NAMES.AI_RESPONSE]: new Queue(QUEUE_NAMES.AI_RESPONSE, {
            connection,
            ...defaultQueueOptions,
            defaultJobOptions: {
                ...defaultQueueOptions.defaultJobOptions,
                priority: 1, // High priority for AI responses
            },
        }),
        [QUEUE_NAMES.KNOWLEDGE_INGESTION]: new Queue(QUEUE_NAMES.KNOWLEDGE_INGESTION, {
            connection,
            ...defaultQueueOptions,
            defaultJobOptions: {
                ...defaultQueueOptions.defaultJobOptions,
                attempts: 2, // Less retries for heavy jobs
            },
        }),
        [QUEUE_NAMES.EMAIL_SEND]: new Queue(QUEUE_NAMES.EMAIL_SEND, {
            connection,
            ...defaultQueueOptions,
        }),
        [QUEUE_NAMES.EMAIL_RECEIVE]: new Queue(QUEUE_NAMES.EMAIL_RECEIVE, {
            connection,
            ...defaultQueueOptions,
        }),
        [QUEUE_NAMES.WHATSAPP_SEND]: new Queue(QUEUE_NAMES.WHATSAPP_SEND, {
            connection,
            ...defaultQueueOptions,
        }),
        [QUEUE_NAMES.WHATSAPP_RECEIVE]: new Queue(QUEUE_NAMES.WHATSAPP_RECEIVE, {
            connection,
            ...defaultQueueOptions,
        }),
        [QUEUE_NAMES.ANALYTICS]: new Queue(QUEUE_NAMES.ANALYTICS, {
            connection,
            ...defaultQueueOptions,
            defaultJobOptions: {
                ...defaultQueueOptions.defaultJobOptions,
                priority: 10, // Lower priority
            },
        }),
    };

    return queues;
}

export async function closeQueues(): Promise<void> {
    if (queues) {
        await Promise.all(Object.values(queues).map((q) => q.close()));
        queues = null;
    }
    if (connection) {
        await connection.quit();
        connection = null;
    }
}
