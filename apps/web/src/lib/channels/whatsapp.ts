// WhatsApp Channel Integration Service
// Full implementation with Twilio WhatsApp Business API

import { prisma } from '@support-platform/database';
import twilio from 'twilio';
import { addAIResponseJob, addWhatsAppSendJob } from '@support-platform/jobs';

interface WhatsAppMessage {
    from: string;
    to: string;
    body: string;
    mediaUrl?: string[];
    messageSid?: string;
    profileName?: string;
}

interface WhatsAppConfig {
    accountSid: string;
    authToken: string;
    whatsappNumber: string;
}

export class WhatsAppChannel {
    private client: twilio.Twilio;
    private config: WhatsAppConfig;

    constructor(config: WhatsAppConfig) {
        this.config = config;
        this.client = twilio(config.accountSid, config.authToken);
    }

    /**
     * Process inbound WhatsApp message webhook from Twilio
     */
    async processInbound(
        workspaceId: string,
        payload: any
    ): Promise<{
        conversationId: string;
        messageId: string;
        isNewConversation: boolean;
    }> {
        const message = this.parseWebhookPayload(payload);

        // Normalize phone number (remove whatsapp: prefix)
        const phoneNumber = message.from.replace('whatsapp:', '');

        // Find or create customer
        let customer = await prisma.customer.findFirst({
            where: {
                workspaceId,
                phone: phoneNumber,
            },
        });

        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    workspaceId,
                    phone: phoneNumber,
                    name: message.profileName || phoneNumber,
                    metadata: {
                        source: 'whatsapp',
                        whatsappProfileName: message.profileName,
                    },
                },
            });
        }

        // Find existing conversation or create new
        let conversation = await prisma.conversation.findFirst({
            where: {
                workspaceId,
                customerId: customer.id,
                channel: 'WHATSAPP',
                status: { in: ['OPEN', 'PENDING'] },
            },
            orderBy: { updatedAt: 'desc' },
        });

        let isNewConversation = false;

        if (!conversation) {
            isNewConversation = true;
            conversation = await prisma.conversation.create({
                data: {
                    workspaceId,
                    customerId: customer.id,
                    channel: 'WHATSAPP',
                    status: 'OPEN',
                    handler: 'AI',
                    metadata: {
                        whatsappNumber: phoneNumber,
                    },
                },
            });
        }

        // Create the message
        const dbMessage = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                content: message.body,
                sender: 'CUSTOMER',
                metadata: {
                    whatsappSid: message.messageSid,
                    whatsappFrom: phoneNumber,
                    hasMedia: message.mediaUrl && message.mediaUrl.length > 0,
                    mediaUrls: message.mediaUrl,
                },
            },
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { updatedAt: new Date() },
        });

        // Trigger AI response if handler is AI
        if (conversation.handler === 'AI') {
            await addAIResponseJob({
                conversationId: conversation.id,
                messageId: dbMessage.id,
                workspaceId,
                customerMessage: message.body,
            });
        }

        return {
            conversationId: conversation.id,
            messageId: dbMessage.id,
            isNewConversation,
        };
    }

    /**
     * Send outbound WhatsApp message
     */
    async sendMessage(
        conversationId: string,
        content: string,
        isAI: boolean = false
    ): Promise<{ messageId: string; whatsappSid: string }> {
        // Get conversation with customer info
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { customer: true },
        });

        if (!conversation || !conversation.customer.phone) {
            throw new Error('Conversation or customer phone not found');
        }

        // Send via Twilio
        const twilioMessage = await this.client.messages.create({
            body: content,
            from: `whatsapp:${this.config.whatsappNumber}`,
            to: `whatsapp:${conversation.customer.phone}`,
        });

        // Create message record
        const message = await prisma.message.create({
            data: {
                conversationId,
                content,
                sender: isAI ? 'AI' : 'AGENT',
                metadata: {
                    whatsappSid: twilioMessage.sid,
                    whatsappTo: conversation.customer.phone,
                    whatsappStatus: twilioMessage.status,
                },
            },
        });

        return {
            messageId: message.id,
            whatsappSid: twilioMessage.sid,
        };
    }

    /**
     * Queue WhatsApp send via background job
     */
    async queueMessage(
        conversationId: string,
        content: string,
        isAI: boolean = false
    ): Promise<void> {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { customer: true },
        });

        if (!conversation || !conversation.customer.phone) {
            throw new Error('Conversation or customer phone not found');
        }

        await addWhatsAppSendJob({
            conversationId,
            messageId: '',
            recipientPhone: conversation.customer.phone,
            content,
            workspaceId: conversation.workspaceId,
        });
    }

    /**
     * Send WhatsApp template message (for initiating conversations)
     */
    async sendTemplate(
        phoneNumber: string,
        templateSid: string,
        variables?: Record<string, string>
    ): Promise<{ whatsappSid: string }> {
        const messageParams: any = {
            from: `whatsapp:${this.config.whatsappNumber}`,
            to: `whatsapp:${phoneNumber}`,
            contentSid: templateSid,
        };

        if (variables) {
            messageParams.contentVariables = JSON.stringify(variables);
        }

        const message = await this.client.messages.create(messageParams);

        return { whatsappSid: message.sid };
    }

    /**
     * Verify Twilio webhook signature
     */
    verifyWebhook(
        signature: string,
        url: string,
        params: Record<string, string>
    ): boolean {
        return twilio.validateRequest(
            this.config.authToken,
            signature,
            url,
            params
        );
    }

    /**
     * Parse Twilio webhook payload
     */
    private parseWebhookPayload(payload: any): WhatsAppMessage {
        return {
            from: payload.From,
            to: payload.To,
            body: payload.Body || '',
            messageSid: payload.MessageSid,
            profileName: payload.ProfileName,
            mediaUrl: this.extractMediaUrls(payload),
        };
    }

    /**
     * Extract media URLs from Twilio payload
     */
    private extractMediaUrls(payload: any): string[] {
        const mediaUrls: string[] = [];
        const numMedia = parseInt(payload.NumMedia || '0', 10);

        for (let i = 0; i < numMedia; i++) {
            const url = payload[`MediaUrl${i}`];
            if (url) {
                mediaUrls.push(url);
            }
        }

        return mediaUrls;
    }
}

// Create singleton instance
let whatsappChannel: WhatsAppChannel | null = null;

export function getWhatsAppChannel(): WhatsAppChannel {
    if (!whatsappChannel) {
        whatsappChannel = new WhatsAppChannel({
            accountSid: process.env.TWILIO_ACCOUNT_SID || '',
            authToken: process.env.TWILIO_AUTH_TOKEN || '',
            whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || '',
        });
    }
    return whatsappChannel;
}
