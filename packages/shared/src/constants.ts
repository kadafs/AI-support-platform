// Platform constants

export const SOCKET_EVENTS = {
    // Connection
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',

    // Conversations
    CONVERSATION_JOIN: 'conversation:join',
    CONVERSATION_LEAVE: 'conversation:leave',
    CONVERSATION_UPDATE: 'conversation:update',

    // Messages
    MESSAGE_NEW: 'message:new',
    MESSAGE_SEND: 'message:send',

    // Typing
    TYPING_START: 'typing:start',
    TYPING_STOP: 'typing:stop',

    // Agent actions
    AGENT_TAKEOVER: 'agent:takeover',
    AGENT_ASSIGN: 'agent:assign',
} as const;

export const AI_CONFIG = {
    MIN_CONFIDENCE_THRESHOLD: 0.7,
    MAX_CONTEXT_CHUNKS: 5,
    MAX_CONVERSATION_HISTORY: 10,
} as const;

export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
} as const;

export const CHANNELS = {
    LIVE_CHAT: 'LIVE_CHAT',
    EMAIL: 'EMAIL',
    WHATSAPP: 'WHATSAPP',
    FACEBOOK: 'FACEBOOK',
    INSTAGRAM: 'INSTAGRAM',
} as const;
