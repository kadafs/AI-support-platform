// Widget configuration types
export interface WidgetConfig {
    workspaceId: string;
    apiUrl: string;
    socketUrl: string;
    primaryColor: string;
    position: 'bottom-right' | 'bottom-left';
    greeting: string;
    placeholder: string;
    companyName?: string;
    companyLogo?: string;
}

export interface Message {
    id: string;
    content: string;
    sender: 'customer' | 'ai' | 'agent';
    timestamp: Date;
    status?: 'sending' | 'sent' | 'error';
}

export interface ConversationState {
    id: string | null;
    messages: Message[];
    isTyping: boolean;
    handler: 'ai' | 'human';
}
