// Job Types and Payloads

export const QUEUE_NAMES = {
    AI_RESPONSE: 'ai-response',
    KNOWLEDGE_INGESTION: 'knowledge-ingestion',
    EMAIL_SEND: 'email-send',
    EMAIL_RECEIVE: 'email-receive',
    WHATSAPP_SEND: 'whatsapp-send',
    WHATSAPP_RECEIVE: 'whatsapp-receive',
    ANALYTICS: 'analytics',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

// AI Response Job
export interface AIResponseJobData {
    conversationId: string;
    messageId: string;
    workspaceId: string;
    customerMessage: string;
}

// Knowledge Ingestion Job
export interface KnowledgeIngestionJobData {
    workspaceId: string;
    sourceId: string;
    sourceType: 'URL' | 'QA' | 'CSV' | 'MANUAL';
    sourceUrl?: string;
    content?: string;
}

// Email Send Job
export interface EmailSendJobData {
    workspaceId: string;
    conversationId: string;
    to: string;
    subject: string;
    body: string;
    replyToMessageId?: string;
}

// Email Receive Job
export interface EmailReceiveJobData {
    workspaceId: string;
    from: string;
    to: string;
    subject: string;
    body: string;
    threadId?: string;
    rawPayload: Record<string, unknown>;
}

// WhatsApp Send Job
export interface WhatsAppSendJobData {
    workspaceId: string;
    conversationId: string;
    to: string;
    body: string;
    mediaUrl?: string;
}

// WhatsApp Receive Job
export interface WhatsAppReceiveJobData {
    workspaceId: string;
    from: string;
    body: string;
    mediaUrl?: string;
    rawPayload: Record<string, unknown>;
}

// Analytics Job
export interface AnalyticsJobData {
    workspaceId: string;
    eventType: 'conversation_started' | 'conversation_resolved' | 'message_sent' | 'ai_response' | 'escalation';
    metadata: Record<string, unknown>;
}

// Job Results
export interface AIResponseJobResult {
    success: boolean;
    messageId?: string;
    escalated?: boolean;
    error?: string;
}

export interface KnowledgeIngestionJobResult {
    success: boolean;
    chunksCreated: number;
    error?: string;
}
