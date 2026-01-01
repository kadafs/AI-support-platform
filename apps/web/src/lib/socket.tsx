'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '@support-platform/shared';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    joinConversation: (conversationId: string) => void;
    leaveConversation: (conversationId: string) => void;
    sendMessage: (conversationId: string, content: string) => void;
    startTyping: (conversationId: string) => void;
    stopTyping: (conversationId: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}

interface SocketProviderProps {
    children: ReactNode;
    userId?: string;
    workspaceId?: string;
}

export function SocketProvider({ children, userId, workspaceId }: SocketProviderProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!userId || !workspaceId) return;

        // Initialize socket connection
        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
            auth: {
                userId,
                workspaceId,
            },
            transports: ['websocket', 'polling'],
        });

        socketInstance.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [userId, workspaceId]);

    const joinConversation = (conversationId: string) => {
        socket?.emit(SOCKET_EVENTS.CONVERSATION_JOIN, { conversationId });
    };

    const leaveConversation = (conversationId: string) => {
        socket?.emit(SOCKET_EVENTS.CONVERSATION_LEAVE, { conversationId });
    };

    const sendMessage = (conversationId: string, content: string) => {
        socket?.emit(SOCKET_EVENTS.MESSAGE_SEND, { conversationId, content });
    };

    const startTyping = (conversationId: string) => {
        socket?.emit(SOCKET_EVENTS.TYPING_START, { conversationId });
    };

    const stopTyping = (conversationId: string) => {
        socket?.emit(SOCKET_EVENTS.TYPING_STOP, { conversationId });
    };

    return (
        <SocketContext.Provider
            value={{
                socket,
                isConnected,
                joinConversation,
                leaveConversation,
                sendMessage,
                startTyping,
                stopTyping,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
}
