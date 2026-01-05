'use client';

export default function WidgetDemoPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <div className="container mx-auto px-4 py-16">
                <header className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">
                        Live Chat Widget Demo
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Test the Oh-liro support chat widget
                    </p>
                </header>

                <div className="max-w-2xl mx-auto bg-slate-800/50 rounded-xl p-8 border border-slate-700">
                    <h2 className="text-xl font-semibold mb-4">Instructions</h2>
                    <ol className="list-decimal list-inside space-y-3 text-slate-300">
                        <li>Look for the chat bubble in the bottom-right corner</li>
                        <li>Click to open the chat window</li>
                        <li>Type a message and press Enter or click Send</li>
                        <li>Wait for the AI response</li>
                    </ol>

                    <div className="mt-8 p-4 bg-slate-900/50 rounded-lg">
                        <h3 className="font-medium mb-2">Widget Configuration</h3>
                        <code className="text-sm text-emerald-400">
                            {`workspaceId: "demo-workspace"`}
                        </code>
                    </div>

                    <div className="mt-6 text-sm text-slate-500">
                        <p>Note: This demo uses a test workspace. In production, replace the workspace ID with your actual workspace.</p>
                    </div>
                </div>
            </div>

            {/* Widget Script */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        (function() {
                            // Create the widget inline for demo
                            const style = document.createElement('style');
                            style.textContent = \`
                                :root {
                                    --sw-primary: #3b82f6;
                                }
                                .sw-container {
                                    position: fixed;
                                    z-index: 9999;
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                }
                                .sw-bottom-right {
                                    bottom: 20px;
                                    right: 20px;
                                }
                                .sw-launcher {
                                    width: 60px;
                                    height: 60px;
                                    border-radius: 50%;
                                    background: var(--sw-primary);
                                    border: none;
                                    cursor: pointer;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                                    transition: transform 0.2s, box-shadow 0.2s;
                                }
                                .sw-launcher:hover {
                                    transform: scale(1.05);
                                }
                                .sw-launcher-icon {
                                    width: 28px;
                                    height: 28px;
                                    color: white;
                                }
                                .sw-icon-close { display: none; }
                                .sw-open .sw-icon-chat { display: none; }
                                .sw-open .sw-icon-close { display: block; }
                                .sw-window {
                                    position: absolute;
                                    bottom: 70px;
                                    right: 0;
                                    width: 380px;
                                    height: 520px;
                                    background: white;
                                    border-radius: 16px;
                                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                                    display: none;
                                    flex-direction: column;
                                    overflow: hidden;
                                }
                                .sw-open .sw-window { display: flex; }
                                .sw-header {
                                    background: var(--sw-primary);
                                    color: white;
                                    padding: 16px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                }
                                .sw-header-info {
                                    display: flex;
                                    align-items: center;
                                    gap: 12px;
                                }
                                .sw-header-avatar {
                                    width: 40px;
                                    height: 40px;
                                    border-radius: 50%;
                                    background: rgba(255,255,255,0.2);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-weight: 600;
                                }
                                .sw-header-title { font-weight: 600; }
                                .sw-header-status {
                                    font-size: 12px;
                                    opacity: 0.8;
                                    display: flex;
                                    align-items: center;
                                    gap: 4px;
                                }
                                .sw-status-dot {
                                    width: 8px;
                                    height: 8px;
                                    border-radius: 50%;
                                    background: #22c55e;
                                }
                                .sw-close-btn {
                                    background: none;
                                    border: none;
                                    cursor: pointer;
                                    padding: 4px;
                                    color: white;
                                }
                                .sw-close-btn svg { width: 20px; height: 20px; }
                                .sw-messages {
                                    flex: 1;
                                    overflow-y: auto;
                                    padding: 16px;
                                }
                                .sw-greeting {
                                    display: flex;
                                    gap: 12px;
                                    align-items: flex-start;
                                    margin-bottom: 16px;
                                }
                                .sw-greeting-avatar {
                                    width: 32px;
                                    height: 32px;
                                    border-radius: 50%;
                                    background: var(--sw-primary);
                                    color: white;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 14px;
                                    flex-shrink: 0;
                                }
                                .sw-greeting-text {
                                    background: #f3f4f6;
                                    padding: 12px 16px;
                                    border-radius: 16px;
                                    border-top-left-radius: 4px;
                                    color: #374151;
                                    margin: 0;
                                }
                                .sw-message {
                                    margin-bottom: 12px;
                                }
                                .sw-message-customer {
                                    text-align: right;
                                }
                                .sw-message-customer .sw-message-content {
                                    background: var(--sw-primary);
                                    color: white;
                                    display: inline-block;
                                    padding: 10px 14px;
                                    border-radius: 16px;
                                    border-bottom-right-radius: 4px;
                                    max-width: 80%;
                                }
                                .sw-message-ai .sw-message-content,
                                .sw-message-agent .sw-message-content {
                                    background: #f3f4f6;
                                    color: #374151;
                                    display: inline-block;
                                    padding: 10px 14px;
                                    border-radius: 16px;
                                    border-bottom-left-radius: 4px;
                                    max-width: 80%;
                                }
                                .sw-message-time {
                                    font-size: 10px;
                                    color: #9ca3af;
                                    margin-top: 4px;
                                }
                                .sw-typing {
                                    padding: 0 16px 16px;
                                    display: flex;
                                    gap: 4px;
                                }
                                .sw-typing span {
                                    width: 8px;
                                    height: 8px;
                                    background: #9ca3af;
                                    border-radius: 50%;
                                    animation: typing 1s infinite;
                                }
                                .sw-typing span:nth-child(2) { animation-delay: 0.2s; }
                                .sw-typing span:nth-child(3) { animation-delay: 0.4s; }
                                @keyframes typing {
                                    0%, 100% { opacity: 0.3; transform: scale(1); }
                                    50% { opacity: 1; transform: scale(1.2); }
                                }
                                .sw-input-form {
                                    display: flex;
                                    padding: 12px;
                                    border-top: 1px solid #e5e7eb;
                                    gap: 8px;
                                }
                                .sw-input {
                                    flex: 1;
                                    border: 1px solid #e5e7eb;
                                    border-radius: 24px;
                                    padding: 10px 16px;
                                    outline: none;
                                }
                                .sw-input:focus {
                                    border-color: var(--sw-primary);
                                }
                                .sw-send-btn {
                                    width: 40px;
                                    height: 40px;
                                    border-radius: 50%;
                                    background: var(--sw-primary);
                                    border: none;
                                    cursor: pointer;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    color: white;
                                }
                                .sw-send-btn svg { width: 18px; height: 18px; }
                                .sw-footer {
                                    text-align: center;
                                    padding: 8px;
                                    font-size: 11px;
                                    color: #9ca3af;
                                    border-top: 1px solid #e5e7eb;
                                }
                                .sw-footer a { color: var(--sw-primary); text-decoration: none; }
                            \`;
                            document.head.appendChild(style);

                            // Widget state
                            let isOpen = false;
                            let conversationId = null;
                            let messages = [];

                            // Create widget container
                            const container = document.createElement('div');
                            container.id = 'support-widget-container';
                            container.className = 'sw-container sw-bottom-right';
                            container.innerHTML = \`
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
                                            <div class="sw-header-avatar">O</div>
                                            <div>
                                                <div class="sw-header-title">Oh-liro</div>
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
                                            <div class="sw-greeting-avatar">O</div>
                                            <p class="sw-greeting-text">Hi there! 👋 How can we help you today?</p>
                                        </div>
                                    </div>
                                    <div class="sw-typing" style="display: none;">
                                        <span></span><span></span><span></span>
                                    </div>
                                    <form class="sw-input-form">
                                        <input type="text" class="sw-input" placeholder="Type your message..." autocomplete="off" />
                                        <button type="submit" class="sw-send-btn" aria-label="Send message">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                            </svg>
                                        </button>
                                    </form>
                                    <div class="sw-footer">
                                        Powered by <a href="https://oh-liro.com" target="_blank">Oh-liro</a>
                                    </div>
                                </div>
                            \`;
                            document.body.appendChild(container);

                            // Event handlers
                            const launcher = container.querySelector('.sw-launcher');
                            const closeBtn = container.querySelector('.sw-close-btn');
                            const form = container.querySelector('.sw-input-form');
                            const input = container.querySelector('.sw-input');
                            const messagesEl = container.querySelector('.sw-messages');
                            const typingEl = container.querySelector('.sw-typing');

                            launcher.addEventListener('click', () => {
                                isOpen = !isOpen;
                                container.classList.toggle('sw-open', isOpen);
                                if (isOpen) input.focus();
                            });

                            closeBtn.addEventListener('click', () => {
                                isOpen = false;
                                container.classList.remove('sw-open');
                            });

                            form.addEventListener('submit', async (e) => {
                                e.preventDefault();
                                const content = input.value.trim();
                                if (!content) return;
                                input.value = '';
                                
                                // Add user message
                                addMessage(content, 'customer');
                                typingEl.style.display = 'flex';

                                // Simulate AI response (demo mode)
                                setTimeout(() => {
                                    typingEl.style.display = 'none';
                                    const responses = [
                                        "Thanks for your message! I'm here to help you.",
                                        "Great question! Let me look into that for you.",
                                        "I understand. Here's what I can tell you...",
                                        "I'd be happy to help with that!",
                                    ];
                                    const response = responses[Math.floor(Math.random() * responses.length)];
                                    addMessage(response, 'ai');
                                }, 1500);
                            });

                            function addMessage(content, sender) {
                                const msgEl = document.createElement('div');
                                msgEl.className = 'sw-message sw-message-' + sender;
                                msgEl.innerHTML = \`
                                    <div class="sw-message-content">\${escapeHtml(content)}</div>
                                    <div class="sw-message-time">\${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                \`;
                                messagesEl.appendChild(msgEl);
                                messagesEl.scrollTop = messagesEl.scrollHeight;
                            }

                            function escapeHtml(text) {
                                const div = document.createElement('div');
                                div.textContent = text;
                                return div.innerHTML;
                            }
                        })();
                    `,
                }}
            />
        </div>
    );
}
