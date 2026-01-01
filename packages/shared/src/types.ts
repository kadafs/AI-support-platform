// Shared type definitions for the platform

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: ApiError;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

// ============================================================================
// WebSocket Event Types
// ============================================================================

export interface WebSocketEvent<T = unknown> {
    type: string;
    payload: T;
    timestamp: number;
}

export interface MessageEvent {
    conversationId: string;
    message: {
        id: string;
        content: string;
        sender: 'CUSTOMER' | 'AI' | 'AGENT' | 'SYSTEM';
        createdAt: string;
    };
}

export interface TypingEvent {
    conversationId: string;
    userId?: string;
    isTyping: boolean;
}

export interface ConversationUpdateEvent {
    conversationId: string;
    status?: string;
    handler?: string;
    assignedToId?: string;
}

// ============================================================================
// Widget Configuration Types
// ============================================================================

export interface WidgetConfig {
    workspaceId: string;
    primaryColor: string;
    position: 'bottom-right' | 'bottom-left';
    greeting: string;
    placeholder: string;
    launcherIcon?: string;
    companyName?: string;
    companyLogo?: string;
}

// ============================================================================
// AI Types
// ============================================================================

export interface AIResponse {
    content: string;
    confidence: number;
    sources: string[];
    shouldEscalate: boolean;
    escalationReason?: string;
}

export interface KnowledgeChunk {
    id: string;
    content: string;
    similarity: number;
    sourceId: string;
    sourceName: string;
}
