// AI Engine Types

export interface AIConfig {
    openaiApiKey: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    confidenceThreshold?: number;
}

export interface ConversationContext {
    workspaceId: string;
    conversationId: string;
    customerId: string;
    channel: 'LIVE_CHAT' | 'EMAIL' | 'WHATSAPP';
    messageHistory: MessageContext[];
}

export interface MessageContext {
    role: 'customer' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

export interface AIResponse {
    content: string;
    confidence: number;
    sources: KnowledgeSource[];
    shouldEscalate: boolean;
    escalationReason?: EscalationReason;
    suggestedActions?: string[];
}

export interface KnowledgeSource {
    id: string;
    name: string;
    content: string;
    similarity: number;
}

export type EscalationReason =
    | 'low_confidence'
    | 'customer_request'
    | 'negative_sentiment'
    | 'sensitive_topic'
    | 'complex_query'
    | 'action_required';

export interface EscalationResult {
    shouldEscalate: boolean;
    reason?: EscalationReason;
    priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface ScrapedPage {
    url: string;
    title: string;
    content: string;
    links: string[];
}

export interface KnowledgeChunk {
    content: string;
    embedding: number[];
    metadata: {
        sourceId: string;
        sourceName: string;
        sourceType: string;
        chunkIndex: number;
    };
}
