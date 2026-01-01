import { MessageContext, EscalationResult, EscalationReason } from './types';

export class EscalationEngine {
    private humanRequestPatterns = [
        /speak (to|with) (a |an )?human/i,
        /talk to (a |an )?(real |actual )?person/i,
        /speak (to |with )?(a |an )?(real |actual )?person/i,
        /human (agent|support|representative)/i,
        /real person/i,
        /not a bot/i,
        /connect me (to|with)/i,
        /transfer me/i,
        /escalate/i,
        /manager/i,
        /supervisor/i,
    ];

    private negativeSentimentPatterns = [
        /frustrated/i,
        /angry/i,
        /furious/i,
        /unacceptable/i,
        /terrible/i,
        /worst/i,
        /horrible/i,
        /disgusted/i,
        /hate/i,
        /ridiculous/i,
        /absurd/i,
        /incompetent/i,
        /useless/i,
        /waste of time/i,
        /never (again|buying|using)/i,
        /cancel (my |the )?(account|subscription|order)/i,
    ];

    private sensitiveTopicPatterns = [
        /refund/i,
        /money back/i,
        /legal/i,
        /lawyer/i,
        /sue/i,
        /lawsuit/i,
        /complaint/i,
        /report/i,
        /fraud/i,
        /scam/i,
        /unauthorized/i,
        /stolen/i,
        /hacked/i,
        /security (breach|issue|concern)/i,
        /privacy/i,
        /data (breach|leak)/i,
    ];

    private actionRequiredPatterns = [
        /cancel (my |the )?order/i,
        /process (my |the |a )?refund/i,
        /change (my |the )?address/i,
        /update (my |the )?payment/i,
        /delete (my |the )?account/i,
        /close (my |the )?account/i,
        /modify (my |the )?subscription/i,
        /change (my |the )?plan/i,
    ];

    checkEscalation(
        message: string,
        history: MessageContext[] = []
    ): EscalationResult {
        // Check for explicit human request
        if (this.matchesPatterns(message, this.humanRequestPatterns)) {
            return {
                shouldEscalate: true,
                reason: 'customer_request',
                priority: 'high',
            };
        }

        // Check for negative sentiment
        if (this.matchesPatterns(message, this.negativeSentimentPatterns)) {
            // Check history for repeated frustration
            const recentFrustration = history
                .slice(-5)
                .filter((m) => m.role === 'customer')
                .some((m) => this.matchesPatterns(m.content, this.negativeSentimentPatterns));

            return {
                shouldEscalate: true,
                reason: 'negative_sentiment',
                priority: recentFrustration ? 'urgent' : 'high',
            };
        }

        // Check for sensitive topics
        if (this.matchesPatterns(message, this.sensitiveTopicPatterns)) {
            return {
                shouldEscalate: true,
                reason: 'sensitive_topic',
                priority: 'high',
            };
        }

        // Check for actions that require human intervention
        if (this.matchesPatterns(message, this.actionRequiredPatterns)) {
            return {
                shouldEscalate: true,
                reason: 'action_required',
                priority: 'normal',
            };
        }

        // Check for repeated questions (customer not getting help)
        if (this.hasRepeatedQuestions(message, history)) {
            return {
                shouldEscalate: true,
                reason: 'complex_query',
                priority: 'normal',
            };
        }

        return {
            shouldEscalate: false,
            priority: 'normal',
        };
    }

    private matchesPatterns(text: string, patterns: RegExp[]): boolean {
        return patterns.some((pattern) => pattern.test(text));
    }

    private hasRepeatedQuestions(
        currentMessage: string,
        history: MessageContext[]
    ): boolean {
        const customerMessages = history
            .filter((m) => m.role === 'customer')
            .map((m) => m.content.toLowerCase());

        // Simple check: if customer asked similar question 3+ times
        const currentLower = currentMessage.toLowerCase();
        const similarCount = customerMessages.filter((msg) => {
            // Calculate simple word overlap
            const currentWords = new Set(currentLower.split(/\s+/));
            const msgWords = msg.split(/\s+/);
            const overlap = msgWords.filter((w) => currentWords.has(w)).length;
            return overlap > Math.min(currentWords.size, msgWords.length) * 0.5;
        }).length;

        return similarCount >= 2;
    }

    /**
     * Analyze sentiment score (-1 to 1)
     */
    analyzeSentiment(text: string): number {
        let score = 0;
        const lowerText = text.toLowerCase();

        // Negative indicators
        const negativeWords = [
            'bad', 'terrible', 'awful', 'horrible', 'hate', 'angry', 'frustrated',
            'disappointed', 'upset', 'annoyed', 'problem', 'issue', 'broken', 'wrong'
        ];

        // Positive indicators
        const positiveWords = [
            'good', 'great', 'excellent', 'amazing', 'love', 'happy', 'pleased',
            'satisfied', 'helpful', 'thanks', 'thank you', 'appreciate', 'perfect'
        ];

        negativeWords.forEach((word) => {
            if (lowerText.includes(word)) score -= 0.2;
        });

        positiveWords.forEach((word) => {
            if (lowerText.includes(word)) score += 0.2;
        });

        // Clamp to -1 to 1
        return Math.max(-1, Math.min(1, score));
    }
}
