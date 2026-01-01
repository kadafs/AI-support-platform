// SupportAI Widget - Main Entry Point
import { Widget } from './widget';
import { WidgetConfig } from './types';
import './styles.css';

declare global {
    interface Window {
        SupportWidget: {
            init: (config: Partial<WidgetConfig>) => Widget;
            destroy: () => void;
        };
        __SUPPORT_WIDGET__?: Widget;
    }
}

// Default configuration
const defaultConfig: WidgetConfig = {
    workspaceId: '',
    apiUrl: 'https://api.supportai.com',
    socketUrl: 'wss://socket.supportai.com',
    primaryColor: '#3b82f6',
    position: 'bottom-right',
    greeting: 'Hi there! 👋 How can we help you today?',
    placeholder: 'Type your message...',
    companyName: 'Support',
};

// Initialize widget
function init(userConfig: Partial<WidgetConfig>): Widget {
    if (window.__SUPPORT_WIDGET__) {
        console.warn('SupportWidget is already initialized');
        return window.__SUPPORT_WIDGET__;
    }

    const config = { ...defaultConfig, ...userConfig };

    if (!config.workspaceId) {
        console.error('SupportWidget: workspaceId is required');
        throw new Error('workspaceId is required');
    }

    const widget = new Widget(config);
    window.__SUPPORT_WIDGET__ = widget;
    widget.mount();

    return widget;
}

// Destroy widget
function destroy(): void {
    if (window.__SUPPORT_WIDGET__) {
        window.__SUPPORT_WIDGET__.destroy();
        window.__SUPPORT_WIDGET__ = undefined;
    }
}

// Expose to window
window.SupportWidget = { init, destroy };

// Auto-initialize if config is present
document.addEventListener('DOMContentLoaded', () => {
    const script = document.querySelector('script[data-workspace-id]') as HTMLScriptElement;
    if (script) {
        const config: Partial<WidgetConfig> = {
            workspaceId: script.dataset.workspaceId || '',
            primaryColor: script.dataset.primaryColor,
            position: (script.dataset.position as 'bottom-right' | 'bottom-left') || 'bottom-right',
            greeting: script.dataset.greeting,
            companyName: script.dataset.companyName,
        };
        init(config);
    }
});
