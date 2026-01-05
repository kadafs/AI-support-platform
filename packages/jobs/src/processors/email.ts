// Email Job Processors
import { Job } from 'bullmq';
import { prisma } from '@support-platform/database';
import { Resend } from 'resend';
import { EmailSendJobData, EmailReceiveJobData } from '../types';

// Lazy initialization to avoid build-time errors
let _resend: Resend | null = null;

function getResend(): Resend {
    if (!_resend) {
        _resend = new Resend(process.env.RESEND_API_KEY || '');
    }
    return _resend;
}

/**
 * Process outbound email send job
 */
export async function processEmailSend(job: Job<EmailSendJobData>): Promise<{
    success: boolean;
    emailId?: string;
    error?: string;
}> {
    const { conversationId, to, subject, body, workspaceId } = job.data;

    try {
        // Get workspace info for sender details
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
        });

        const settings = (workspace?.settings || {}) as Record<string, any>;
        const fromEmail = settings.emailFromAddress || process.env.EMAIL_FROM_ADDRESS || 'support@oh-liro.com';
        const fromName = settings.emailFromName || workspace?.name || 'Oh-liro Support';

        // Send email via Resend
        const resend = getResend();
        const { data, error } = await resend.emails.send({
            from: `${fromName} <${fromEmail}>`,
            to: to,
            subject: subject.startsWith('Re:') ? subject : `Re: ${subject}`,
            text: body,
        });

        if (error) {
            console.error('[Email] Send failed:', error);
            throw new Error(error.message);
        }

        // Create message record
        await prisma.message.create({
            data: {
                conversationId,
                content: body,
                sender: 'AI',
                metadata: {
                    emailId: data?.id,
                    emailTo: to,
                    emailSubject: subject,
                    sentViaJob: true,
                },
            },
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });

        console.log(`[Email] Sent successfully, emailId: ${data?.id}`);

        return {
            success: true,
            emailId: data?.id,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Email] Job failed:', errorMessage);
        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Process inbound email receive job
 */
export async function processEmailReceive(job: Job<EmailReceiveJobData>): Promise<{
    success: boolean;
    conversationId?: string;
    error?: string;
}> {
    const { from, to, subject, body, workspaceId, messageId, threadId } = job.data;

    try {
        // Find or create customer
        let customer = await prisma.customer.findFirst({
            where: {
                workspaceId,
                email: from,
            },
        });

        if (!customer) {
            const nameMatch = from.match(/^(.+?)\s*<.*>$/);
            const name = nameMatch ? nameMatch[1].trim() : from.split('@')[0];

            customer = await prisma.customer.create({
                data: {
                    workspaceId,
                    email: from,
                    name,
                    metadata: {
                        source: 'email',
                        firstSubject: subject,
                    },
                },
            });
        }

        // Find existing conversation or create new
        let conversation = null;

        if (threadId) {
            conversation = await prisma.conversation.findFirst({
                where: {
                    workspaceId,
                    customerId: customer.id,
                    metadata: {
                        path: ['emailThreadId'],
                        equals: threadId,
                    },
                },
            });
        }

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    workspaceId,
                    customerId: customer.id,
                    channel: 'EMAIL',
                    status: 'OPEN',
                    handler: 'AI',
                    metadata: {
                        emailSubject: subject,
                        emailThreadId: messageId,
                    },
                },
            });
        }

        // Create message
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                content: body,
                sender: 'CUSTOMER',
                metadata: {
                    emailFrom: from,
                    emailSubject: subject,
                    emailMessageId: messageId,
                },
            },
        });

        console.log(`[Email] Processed inbound, conversationId: ${conversation.id}`);

        return {
            success: true,
            conversationId: conversation.id,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Email] Receive job failed:', errorMessage);
        return {
            success: false,
            error: errorMessage,
        };
    }
}
