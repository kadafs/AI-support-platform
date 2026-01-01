import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@support-platform/database';

// GET /api/conversations/[id] - Get conversation details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include: {
                customer: true,
                assignedTo: {
                    select: { id: true, name: true, email: true, avatarUrl: true },
                },
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        user: {
                            select: { id: true, name: true, avatarUrl: true },
                        },
                    },
                },
            },
        });

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(conversation);
    } catch (error) {
        console.error('Error fetching conversation:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversation' },
            { status: 500 }
        );
    }
}

// PATCH /api/conversations/[id] - Update conversation
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, handler, assignedToId, priority } = body;

        const updateData: any = {};
        if (status) updateData.status = status;
        if (handler) updateData.handler = handler;
        if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
        if (priority) updateData.priority = priority;
        if (status === 'RESOLVED' || status === 'CLOSED') {
            updateData.closedAt = new Date();
        }

        const conversation = await prisma.conversation.update({
            where: { id },
            data: updateData,
            include: {
                customer: true,
                assignedTo: {
                    select: { id: true, name: true, email: true, avatarUrl: true },
                },
            },
        });

        return NextResponse.json(conversation);
    } catch (error) {
        console.error('Error updating conversation:', error);
        return NextResponse.json(
            { error: 'Failed to update conversation' },
            { status: 500 }
        );
    }
}
