import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@support-platform/database';

// GET /api/widget/config - Get widget configuration for a workspace
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get('workspaceId');

        if (!workspaceId) {
            return NextResponse.json(
                { error: 'workspaceId is required' },
                { status: 400 }
            );
        }

        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: {
                id: true,
                name: true,
                settings: true,
            },
        });

        if (!workspace) {
            return NextResponse.json(
                { error: 'Workspace not found' },
                { status: 404 }
            );
        }

        const settings = workspace.settings as Record<string, any>;

        // Return widget configuration
        return NextResponse.json({
            workspaceId: workspace.id,
            companyName: workspace.name,
            primaryColor: settings.widgetColor || '#3b82f6',
            position: settings.widgetPosition || 'bottom-right',
            greeting: settings.greeting || 'Hi there! 👋 How can we help you today?',
            placeholder: settings.placeholder || 'Type your message...',
            companyLogo: settings.companyLogo || null,
        });
    } catch (error) {
        console.error('Error fetching widget config:', error);
        return NextResponse.json(
            { error: 'Failed to fetch widget config' },
            { status: 500 }
        );
    }
}

// POST /api/widget/conversation - Start a new widget conversation
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { workspaceId, customerEmail, customerName, initialMessage } = body;

        if (!workspaceId || !initialMessage) {
            return NextResponse.json(
                { error: 'workspaceId and initialMessage are required' },
                { status: 400 }
            );
        }

        // Find or create customer
        let customer = await prisma.customer.findFirst({
            where: {
                workspaceId,
                email: customerEmail || null,
            },
        });

        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    workspaceId,
                    email: customerEmail,
                    name: customerName,
                },
            });
        }

        // Create conversation
        const conversation = await prisma.conversation.create({
            data: {
                workspaceId,
                customerId: customer.id,
                channel: 'LIVE_CHAT',
                status: 'OPEN',
                handler: 'AI',
            },
        });

        // Create initial message
        const message = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                content: initialMessage,
                sender: 'CUSTOMER',
            },
        });

        // TODO: Trigger AI response via background job

        return NextResponse.json({
            conversationId: conversation.id,
            customerId: customer.id,
            message,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating widget conversation:', error);
        return NextResponse.json(
            { error: 'Failed to create conversation' },
            { status: 500 }
        );
    }
}
