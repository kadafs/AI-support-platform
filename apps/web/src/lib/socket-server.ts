// Socket.io Server for Real-time Messaging
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { prisma } from '@support-platform/database';
import { SOCKET_EVENTS } from '@support-platform/shared';

const PORT = process.env.SOCKET_PORT || 3001;

// Create HTTP server and Socket.io instance
const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        methods: ['GET', 'POST'],
    },
});

// Authentication middleware
io.use(async (socket, next) => {
    try {
        const { userId, workspaceId } = socket.handshake.auth;

        if (!userId || !workspaceId) {
            return next(new Error('Authentication required'));
        }

        // Verify user belongs to workspace
        const user = await prisma.user.findFirst({
            where: { id: userId, workspaceId },
        });

        if (!user) {
            return next(new Error('Invalid user or workspace'));
        }

        // Attach user info to socket
        socket.data.userId = userId;
        socket.data.workspaceId = workspaceId;
        socket.data.userRole = user.role;

        next();
    } catch (error) {
        next(new Error('Authentication failed'));
    }
});

// Connection handler
io.on('connection', (socket: Socket) => {
    const { userId, workspaceId } = socket.data;
    console.log(`User ${userId} connected from workspace ${workspaceId}`);

    // Join workspace room
    socket.join(`workspace:${workspaceId}`);

    // Join conversation room
    socket.on(SOCKET_EVENTS.CONVERSATION_JOIN, async ({ conversationId }) => {
        try {
            // Verify conversation belongs to workspace
            const conversation = await prisma.conversation.findFirst({
                where: { id: conversationId, workspaceId },
            });

            if (conversation) {
                socket.join(`conversation:${conversationId}`);
                console.log(`User ${userId} joined conversation ${conversationId}`);
            }
        } catch (error) {
            console.error('Error joining conversation:', error);
        }
    });

    // Leave conversation room
    socket.on(SOCKET_EVENTS.CONVERSATION_LEAVE, ({ conversationId }) => {
        socket.leave(`conversation:${conversationId}`);
    });

    // Handle new message from agent
    socket.on(SOCKET_EVENTS.MESSAGE_SEND, async ({ conversationId, content }) => {
        try {
            // Create message in database
            const message = await prisma.message.create({
                data: {
                    conversationId,
                    content,
                    sender: 'AGENT',
                    userId,
                },
                include: {
                    user: {
                        select: { id: true, name: true, avatarUrl: true },
                    },
                },
            });

            // Update conversation handler to HUMAN
            await prisma.conversation.update({
                where: { id: conversationId },
                data: {
                    handler: 'HUMAN',
                    assignedToId: userId,
                    updatedAt: new Date(),
                },
            });

            // Broadcast to conversation room
            io.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.MESSAGE_NEW, {
                conversationId,
                message,
            });

            // Also broadcast to workspace for inbox updates
            io.to(`workspace:${workspaceId}`).emit(SOCKET_EVENTS.CONVERSATION_UPDATE, {
                conversationId,
                lastMessage: content,
                handler: 'HUMAN',
                updatedAt: new Date(),
            });
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    // Typing indicators
    socket.on(SOCKET_EVENTS.TYPING_START, ({ conversationId }) => {
        socket.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.TYPING_START, {
            conversationId,
            userId,
        });
    });

    socket.on(SOCKET_EVENTS.TYPING_STOP, ({ conversationId }) => {
        socket.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.TYPING_STOP, {
            conversationId,
            userId,
        });
    });

    // Agent takeover
    socket.on(SOCKET_EVENTS.AGENT_TAKEOVER, async ({ conversationId }) => {
        try {
            await prisma.conversation.update({
                where: { id: conversationId },
                data: {
                    handler: 'HUMAN',
                    assignedToId: userId,
                },
            });

            io.to(`workspace:${workspaceId}`).emit(SOCKET_EVENTS.CONVERSATION_UPDATE, {
                conversationId,
                handler: 'HUMAN',
                assignedToId: userId,
            });

            // Add system message
            const message = await prisma.message.create({
                data: {
                    conversationId,
                    content: 'An agent has joined the conversation.',
                    sender: 'SYSTEM',
                },
            });

            io.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.MESSAGE_NEW, {
                conversationId,
                message,
            });
        } catch (error) {
            console.error('Error during takeover:', error);
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected`);
    });
});

// Start server
httpServer.listen(PORT, () => {
    console.log(`Socket.io server running on port ${PORT}`);
});

export { io };
