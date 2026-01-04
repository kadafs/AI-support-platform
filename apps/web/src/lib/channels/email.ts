// Email Channel Integration Service
// Full implementation with Resend API for outbound and webhook for inbound

import { prisma } from '@support-platform/database';
import { Resend } from 'resend';
import { addAIResponseJob, addEmailSendJob } from '@support-platform/jobs';

interface EmailMessage {
    from: string;
    to: string;
    subject: string;
    body: string;
    html?: string;
    threadId?: string;
    messageId?: string;
    attachments?: { name: string; url: string }[];
}

interface EmailConfig {
    resendApiKey: string;
    inboundDomain: string;
    fromEmail: string;
    fromName: string;
}

export class EmailChannel {
    private resend: Resend;
    private config: EmailConfig;

    constructor(config: EmailConfig) {
        this.config = config;
        this.resend = new Resend(config.resendApiKey);
    }

    /**
     * Process inbound email webhook from Resend
     */
    async processInbound(
        workspaceId: string,
        payload: any
    ): Promise<{
        conversationId: string;
        messageId: string;
        isNewConversation: boolean;
    }> {
        const email = this.parseWebhookPayload(payload);

        // Find or create customer
        let customer = await prisma.customer.findFirst({
            where: {
                workspaceId,
                email: email.from,
            },
        });

        if (!customer) {
            // Extract name from email if possible (e.g., "John Doe <john@example.com>")
            const nameMatch = email.from.match(/^(.+?)\s*<.*>$/);
            const name = nameMatch ? nameMatch[1].trim() : email.from.split('@')[0];

            customer = await prisma.customer.create({
                data: {
                    workspaceId,
                    email: email.from,
                    name,
                    metadata: {
                        source: 'email',
                        firstSubject: email.subject,
                    },
                },
            });
        }

        // Try to find existing conversation by thread ID or email subject
        let conversation = null;
        let isNewConversation = false;

        if (email.threadId) {
            conversation = await prisma.conversation.findFirst({
                where: {
                    workspaceId,
                    customerId: customer.id,
                    metadata: {
                        path: ['emailThreadId'],
                        equals: email.threadId,
                    },
                },
            });
        }

        // Also try matching by subject (Re: Original Subject)
        if (!conversation && email.subject.startsWith('Re:')) {
            const originalSubject = email.subject.replace(/^Re:\s*/i, '').trim();
            conversation = await prisma.conversation.findFirst({
                where: {
                    workspaceId,
                    customerId: customer.id,
                    metadata: {
                        path: ['emailSubject'],
                        equals: originalSubject,
                    },
                },
            });
        }

        if (!conversation) {
            isNewConversation = true;
            conversation = await prisma.conversation.create({
                data: {
                    workspaceId,
                    customerId: customer.id,
                    channel: 'EMAIL',
                    status: 'OPEN',
                    handler: 'AI',
                    metadata: {
                        emailSubject: email.subject,
                        emailThreadId: email.messageId,
                    },
                },
            });
        }

        // Create the message
        const message = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                content: email.body,
                sender: 'CUSTOMER',
                metadata: {
                    emailFrom: email.from,
                    emailSubject: email.subject,
                    emailMessageId: email.messageId,
                    hasAttachments: email.attachments && email.attachments.length > 0,
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
                messageId: message.id,
                workspaceId,
                customerMessage: email.body,
            });
        }

        return {
            conversationId: conversation.id,
            messageId: message.id,
            isNewConversation,
        };
    }

    /**
     * Send outbound email reply
     */
    async sendReply(
        conversationId: string,
        content: string,
        isAI: boolean = false
    ): Promise<{ messageId: string; emailId: string }> {
        // Get conversation with customer info
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                customer: true,
                workspace: true,
            },
        });

        if (!conversation || !conversation.customer.email) {
            throw new Error('Conversation or customer email not found');
        }

        const metadata = conversation.metadata as any;
        const subject = metadata?.emailSubject || 'Support Response';

        // Send via Resend
        const { data, error } = await this.resend.emails.send({
            from: `${conversation.workspace.name || this.config.fromName} <${this.config.fromEmail}>`,
            to: conversation.customer.email,
            subject: subject.startsWith('Re:') ? subject : `Re: ${subject}`,
            text: content,
            headers: metadata?.emailThreadId
                ? { 'In-Reply-To': metadata.emailThreadId }
                : undefined,
        });

        if (error) {
            throw new Error(`Failed to send email: ${error.message}`);
        }

        // Create message record
        const message = await prisma.message.create({
            data: {
                conversationId,
                content,
                sender: isAI ? 'AI' : 'AGENT',
                metadata: {
                    emailId: data?.id,
                    emailTo: conversation.customer.email,
                    emailSubject: subject,
                },
            },
        });

        return {
            messageId: message.id,
            emailId: data?.id || '',
        };
    }

    /**
     * Queue email send via background job
     */
    async queueReply(
        conversationId: string,
        content: string,
        isAI: boolean = false
    ): Promise<void> {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { customer: true },
        });

        if (!conversation || !conversation.customer.email) {
            throw new Error('Conversation or customer email not found');
        }

        const metadata = conversation.metadata as any;

        await addEmailSendJob({
            conversationId,
            to: conversation.customer.email,
            subject: metadata?.emailSubject || 'Support Response',
            body: content,
            workspaceId: conversation.workspaceId,
        });
    }

    /**
     * Parse inbound email webhook payload (Resend format)
     */
    private parseWebhookPayload(payload: any): EmailMessage {
        // Handle Resend inbound email format
        if (payload.type === 'email.received') {
            const data = payload.data;
            return {
                from: data.from,
                to: data.to?.[0] || data.to,
                subject: data.subject || '(No Subject)',
                body: data.text || this.stripHtml(data.html) || '',
                html: data.html,
                threadId: data.headers?.['in-reply-to'],
                messageId: data.message_id,
                attachments: data.attachments?.map((a: any) => ({
                    name: a.filename,
                    url: a.url,
                })),
            };
        }

        // Fallback for generic webhook format
        return {
            from: payload.from || payload.envelope?.from,
            to: payload.to || payload.envelope?.to?.[0],
            subject: payload.subject || '(No Subject)',
            body: payload.text || this.stripHtml(payload.html) || '',
            html: payload.html,
            threadId: payload.headers?.['in-reply-to'],
            messageId: payload.message_id || payload.messageId,
        };
    }

    /**
     * Strip HTML tags for plain text extraction
     */
    private stripHtml(html: string): string {
        if (!html) return '';
        return html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .trim();
    }
}

// Create singleton instance
let emailChannel: EmailChannel | null = null;

export function getEmailChannel(): EmailChannel {
    if (!emailChannel) {
        emailChannel = new EmailChannel({
            resendApiKey: process.env.RESEND_API_KEY || '',
            inboundDomain: process.env.EMAIL_INBOUND_DOMAIN || 'mail.oh-liro.com',
            fromEmail: process.env.EMAIL_FROM_ADDRESS || 'support@oh-liro.com',
            fromName: process.env.EMAIL_FROM_NAME || 'Oh-liro Support',
        });
    }
    return emailChannel;
}
