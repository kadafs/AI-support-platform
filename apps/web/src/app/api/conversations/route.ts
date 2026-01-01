import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@support-platform/database';

// GET /api/conversations - List conversations for workspace
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get('workspaceId');
        const status = searchParams.get('status');
        const handler = searchParams.get('handler');
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '20');

        if (!workspaceId) {
            return NextResponse.json(
                { error: 'workspaceId is required' },
                { status: 400 }
            );
        }

        const where: any = { workspaceId };
        if (status) where.status = status;
        if (handler) where.handler = handler;

        const [conversations, total] = await Promise.all([
            prisma.conversation.findMany({
                where,
                include: {
                    customer: true,
                    assignedTo: {
                        select: { id: true, name: true, email: true, avatarUrl: true },
                    },
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                },
                orderBy: { updatedAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.conversation.count({ where }),
        ]);

        return NextResponse.json({
            items: conversations,
            total,
            page,
            pageSize,
            hasMore: page * pageSize < total,
        });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversations' },
            { status: 500 }
        );
    }
}

// POST /api/conversations - Create new conversation
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { workspaceId, customerId, channel, subject } = body;

        if (!workspaceId || !customerId || !channel) {
            return NextResponse.json(
                { error: 'workspaceId, customerId, and channel are required' },
                { status: 400 }
            );
        }

        const conversation = await prisma.conversation.create({
            data: {
                workspaceId,
                customerId,
                channel,
                subject,
                status: 'OPEN',
                handler: 'AI',
            },
            include: {
                customer: true,
            },
        });

        return NextResponse.json(conversation, { status: 201 });
    } catch (error) {
        console.error('Error creating conversation:', error);
        return NextResponse.json(
            { error: 'Failed to create conversation' },
            { status: 500 }
        );
    }
}
