// WhatsApp Webhook API Route
// Handles incoming messages from Twilio WhatsApp

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@support-platform/database';
import { getWhatsAppChannel } from '@/lib/channels/whatsapp';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const payload: Record<string, string> = {};

        formData.forEach((value, key) => {
            payload[key] = value.toString();
        });

        // Verify Twilio signature in production
        if (process.env.NODE_ENV === 'production') {
            const signature = request.headers.get('x-twilio-signature') || '';
            const url = request.url;

            const whatsappChannel = getWhatsAppChannel();
            const isValid = whatsappChannel.verifyWebhook(signature, url, payload);

            if (!isValid) {
                return NextResponse.json(
                    { error: 'Invalid signature' },
                    { status: 401 }
                );
            }
        }

        // Extract workspace from the receiving WhatsApp number
        // Look up workspace by WhatsApp number
        const toNumber = payload.To?.replace('whatsapp:', '');

        const workspace = await prisma.workspace.findFirst({
            where: {
                OR: [
                    { settings: { path: ['whatsappNumber'], equals: toNumber } },
                    { settings: { path: ['twilioWhatsappNumber'], equals: toNumber } },
                ],
            },
        });

        if (!workspace) {
            // Fallback to default workspace or first workspace
            const defaultWorkspace = await prisma.workspace.findFirst();

            if (!defaultWorkspace) {
                console.error('[WhatsApp] No workspace found for number:', toNumber);
                return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
                    headers: { 'Content-Type': 'text/xml' },
                });
            }
        }

        const workspaceId = workspace?.id || '';

        // Process the inbound message
        const whatsappChannel = getWhatsAppChannel();
        const result = await whatsappChannel.processInbound(workspaceId, payload);

        console.log(
            `[WhatsApp] Processed message: ${result.isNewConversation ? 'new' : 'existing'} conversation ${result.conversationId}`
        );

        // Return TwiML response (empty response = no auto-reply)
        return new Response(
            '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
            { headers: { 'Content-Type': 'text/xml' } }
        );
    } catch (error) {
        console.error('WhatsApp webhook error:', error);

        // Return empty TwiML to prevent Twilio retries
        return new Response(
            '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
            { headers: { 'Content-Type': 'text/xml' } }
        );
    }
}

// Twilio tests webhook endpoints with GET
export async function GET() {
    return NextResponse.json({ status: 'WhatsApp webhook ready' });
}
