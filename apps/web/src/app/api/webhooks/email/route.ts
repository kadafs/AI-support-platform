// Email Inbound Webhook API Route
// Handles incoming emails from Resend webhook

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@support-platform/database';
import { getEmailChannel } from '@/lib/channels/email';
import crypto from 'crypto';

// Verify Resend webhook signature
function verifySignature(
    payload: string,
    signature: string,
    secret: string
): boolean {
    if (!secret) return true; // Skip verification if no secret configured

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('resend-signature') || '';
        const webhookSecret = process.env.RESEND_WEBHOOK_SECRET || '';

        // Verify webhook signature in production
        if (process.env.NODE_ENV === 'production' && webhookSecret) {
            if (!verifySignature(rawBody, signature, webhookSecret)) {
                return NextResponse.json(
                    { error: 'Invalid signature' },
                    { status: 401 }
                );
            }
        }

        const payload = JSON.parse(rawBody);

        // Handle different webhook event types
        if (payload.type === 'email.received') {
            // Extract workspace from the receiving email address
            // Format: support+{workspaceId}@mail.oh-liro.com
            const toAddress = payload.data?.to?.[0] || payload.data?.to;
            const workspaceIdMatch = toAddress?.match(/support\+([^@]+)@/);

            let workspaceId: string;

            if (workspaceIdMatch) {
                workspaceId = workspaceIdMatch[1];
            } else {
                // Fallback: look up workspace by domain
                const domain = toAddress?.split('@')[1];
                const workspace = await prisma.workspace.findFirst({
                    where: {
                        settings: {
                            path: ['emailDomain'],
                            equals: domain,
                        },
                    },
                });

                if (!workspace) {
                    console.error('No workspace found for email:', toAddress);
                    return NextResponse.json(
                        { error: 'Workspace not found' },
                        { status: 404 }
                    );
                }
                workspaceId = workspace.id;
            }

            // Process the inbound email
            const emailChannel = getEmailChannel();
            const result = await emailChannel.processInbound(workspaceId, payload);

            console.log(
                `[Email] Processed inbound email: ${result.isNewConversation ? 'new' : 'existing'} conversation ${result.conversationId}`
            );

            return NextResponse.json({
                success: true,
                conversationId: result.conversationId,
                messageId: result.messageId,
            });
        }

        // Handle delivery status webhooks
        if (payload.type === 'email.delivered') {
            console.log('[Email] Delivery confirmed:', payload.data?.email_id);
            return NextResponse.json({ success: true });
        }

        if (payload.type === 'email.bounced') {
            console.error('[Email] Bounce:', payload.data);
            // TODO: Update message status and notify agent
            return NextResponse.json({ success: true });
        }

        if (payload.type === 'email.complained') {
            console.error('[Email] Spam complaint:', payload.data);
            // TODO: Handle spam complaint
            return NextResponse.json({ success: true });
        }

        // Unknown event type
        console.log('[Email] Unhandled webhook event:', payload.type);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Email webhook error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Resend tests webhook endpoints with GET
export async function GET() {
    return NextResponse.json({ status: 'Email webhook ready' });
}
