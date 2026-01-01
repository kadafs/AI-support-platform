import { WidgetConfig, Message, ConversationState } from './types';

export class Widget {
    private config: WidgetConfig;
    private container: HTMLDivElement | null = null;
    private isOpen = false;
    private state: ConversationState = {
        id: null,
        messages: [],
        isTyping: false,
        handler: 'ai',
    };

    constructor(config: WidgetConfig) {
        this.config = config;
    }

    mount(): void {
        this.createContainer();
        this.render();
        this.addEventListeners();
    }

    destroy(): void {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }

    private createContainer(): void {
        this.container = document.createElement('div');
        this.container.id = 'support-widget-container';
        this.container.className = `sw-container sw-${this.config.position}`;
        document.body.appendChild(this.container);

        // Apply custom primary color
        this.container.style.setProperty('--sw-primary', this.config.primaryColor);
    }

    private render(): void {
        if (!this.container) return;

        this.container.innerHTML = `
      <button class="sw-launcher" aria-label="Open chat">
        <svg class="sw-launcher-icon sw-icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <svg class="sw-launcher-icon sw-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      
      <div class="sw-window">
        <div class="sw-header">
          <div class="sw-header-info">
            ${this.config.companyLogo
                ? `<img src="${this.config.companyLogo}" alt="" class="sw-header-logo" />`
                : `<div class="sw-header-avatar">${this.config.companyName?.charAt(0) || 'S'}</div>`
            }
            <div>
              <div class="sw-header-title">${this.config.companyName || 'Support'}</div>
              <div class="sw-header-status">
                <span class="sw-status-dot"></span>
                Typically replies instantly
              </div>
            </div>
          </div>
          <button class="sw-close-btn" aria-label="Close chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="sw-messages">
          <div class="sw-greeting">
            <div class="sw-greeting-avatar">${this.config.companyName?.charAt(0) || 'S'}</div>
            <p class="sw-greeting-text">${this.config.greeting}</p>
          </div>
        </div>
        
        <div class="sw-typing" style="display: none;">
          <span></span><span></span><span></span>
        </div>
        
        <form class="sw-input-form">
          <input 
            type="text" 
            class="sw-input" 
            placeholder="${this.config.placeholder}"
            autocomplete="off"
          />
          <button type="submit" class="sw-send-btn" aria-label="Send message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
        
        <div class="sw-footer">
          Powered by <a href="https://supportai.com" target="_blank">SupportAI</a>
        </div>
      </div>
    `;
    }

    private addEventListeners(): void {
        if (!this.container) return;

        // Launcher click
        const launcher = this.container.querySelector('.sw-launcher');
        launcher?.addEventListener('click', () => this.toggle());

        // Close button
        const closeBtn = this.container.querySelector('.sw-close-btn');
        closeBtn?.addEventListener('click', () => this.close());

        // Form submit
        const form = this.container.querySelector('.sw-input-form') as HTMLFormElement;
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('.sw-input') as HTMLInputElement;
            const message = input.value.trim();
            if (message) {
                this.sendMessage(message);
                input.value = '';
            }
        });
    }

    private toggle(): void {
        this.isOpen = !this.isOpen;
        this.container?.classList.toggle('sw-open', this.isOpen);
    }

    private close(): void {
        this.isOpen = false;
        this.container?.classList.remove('sw-open');
    }

    private async sendMessage(content: string): Promise<void> {
        const message: Message = {
            id: `msg-${Date.now()}`,
            content,
            sender: 'customer',
            timestamp: new Date(),
            status: 'sending',
        };

        this.state.messages.push(message);
        this.renderMessages();

        // Show typing indicator
        this.setTyping(true);

        try {
            // TODO: Send to backend via WebSocket or API
            // For now, simulate AI response
            await this.simulateAIResponse(content);
        } catch (error) {
            message.status = 'error';
            this.renderMessages();
        }
    }

    private async simulateAIResponse(userMessage: string): Promise<void> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

        this.setTyping(false);

        const response: Message = {
            id: `msg-${Date.now()}`,
            content: this.generateMockResponse(userMessage),
            sender: 'ai',
            timestamp: new Date(),
        };

        this.state.messages.push(response);
        this.renderMessages();
    }

    private generateMockResponse(query: string): string {
        const responses = [
            "I'd be happy to help you with that! Let me look into it.",
            "Thanks for reaching out! I can definitely assist you with this.",
            "Great question! Here's what I found...",
            "I understand. Let me provide you with the information you need.",
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    private setTyping(isTyping: boolean): void {
        this.state.isTyping = isTyping;
        const typingEl = this.container?.querySelector('.sw-typing') as HTMLElement;
        if (typingEl) {
            typingEl.style.display = isTyping ? 'flex' : 'none';
        }
    }

    private renderMessages(): void {
        const messagesContainer = this.container?.querySelector('.sw-messages');
        if (!messagesContainer) return;

        // Keep greeting, add messages after
        const greeting = messagesContainer.querySelector('.sw-greeting');
        messagesContainer.innerHTML = '';
        if (greeting) messagesContainer.appendChild(greeting);

        this.state.messages.forEach(msg => {
            const msgEl = document.createElement('div');
            msgEl.className = `sw-message sw-message-${msg.sender}`;
            msgEl.innerHTML = `
        <div class="sw-message-content">${this.escapeHtml(msg.content)}</div>
        <div class="sw-message-time">${this.formatTime(msg.timestamp)}</div>
      `;
            messagesContainer.appendChild(msgEl);
        });

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    private formatTime(date: Date): string {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}
