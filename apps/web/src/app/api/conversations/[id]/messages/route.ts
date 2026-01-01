import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@support-platform/database';

// GET /api/conversations/[id]/messages - Get messages for conversation
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const cursor = searchParams.get('cursor');
        const limit = parseInt(searchParams.get('limit') || '50');

        const messages = await prisma.message.findMany({
            where: { conversationId: id },
            orderBy: { createdAt: 'asc' },
            take: limit,
            ...(cursor && {
                cursor: { id: cursor },
                skip: 1,
            }),
            include: {
                user: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
        });

        return NextResponse.json({
            messages,
            nextCursor: messages.length === limit ? messages[messages.length - 1]?.id : null,
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

// POST /api/conversations/[id]/messages - Send a message
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { content, sender, userId, metadata } = body;

        if (!content || !sender) {
            return NextResponse.json(
                { error: 'content and sender are required' },
                { status: 400 }
            );
        }

        // Create the message
        const message = await prisma.message.create({
            data: {
                conversationId: id,
                content,
                sender,
                userId: sender === 'AGENT' ? userId : null,
                metadata: metadata || {},
            },
            include: {
                user: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id },
            data: { updatedAt: new Date() },
        });

        // TODO: If sender is CUSTOMER, trigger AI response via background job

        return NextResponse.json(message, { status: 201 });
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json(
            { error: 'Failed to create message' },
            { status: 500 }
        );
    }
}
