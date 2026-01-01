'use client';

import { useState } from 'react';
import { Search, Filter, MoreHorizontal, Bot, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for demo
const conversations = [
    {
        id: '1',
        customer: { name: 'Sarah Chen', email: 'sarah@example.com' },
        lastMessage: 'Hi, I need help with my order #12345',
        handler: 'AI',
        status: 'OPEN',
        channel: 'LIVE_CHAT',
        updatedAt: new Date(Date.now() - 1000 * 60 * 2), // 2 min ago
        unread: true,
    },
    {
        id: '2',
        customer: { name: 'Mike Johnson', email: 'mike@example.com' },
        lastMessage: 'Thanks for the quick response! That solved my issue.',
        handler: 'AI',
        status: 'RESOLVED',
        channel: 'EMAIL',
        updatedAt: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
        unread: false,
    },
    {
        id: '3',
        customer: { name: 'Emma Wilson', email: 'emma@example.com' },
        lastMessage: 'I want to speak with a human please',
        handler: 'HUMAN',
        status: 'OPEN',
        channel: 'WHATSAPP',
        updatedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
        unread: true,
    },
    {
        id: '4',
        customer: { name: 'James Brown', email: 'james@example.com' },
        lastMessage: 'When will my refund be processed?',
        handler: 'AI',
        status: 'PENDING',
        channel: 'LIVE_CHAT',
        updatedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        unread: false,
    },
];

const messages = [
    {
        id: '1',
        content: 'Hi, I need help with my order #12345',
        sender: 'CUSTOMER',
        createdAt: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
        id: '2',
        content: 'Hello Sarah! I\'d be happy to help you with order #12345. Let me look that up for you.\n\nI can see your order was placed on December 28th and is currently in transit. The estimated delivery date is January 3rd.',
        sender: 'AI',
        confidence: 0.92,
        createdAt: new Date(Date.now() - 1000 * 60 * 4),
    },
    {
        id: '3',
        content: 'That\'s great, but I need to change the delivery address. Is that possible?',
        sender: 'CUSTOMER',
        createdAt: new Date(Date.now() - 1000 * 60 * 2),
    },
];

export default function InboxPage() {
    const [selectedId, setSelectedId] = useState(conversations[0].id);
    const [messageInput, setMessageInput] = useState('');

    const selectedConversation = conversations.find(c => c.id === selectedId);

    const formatTime = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        return date.toLocaleDateString();
    };

    return (
        <div className="h-full flex">
            {/* Conversation List */}
            <div className="w-80 border-r flex flex-col bg-card">
                {/* Header */}
                <div className="h-16 px-4 border-b flex items-center justify-between">
                    <h1 className="font-semibold">Inbox</h1>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="p-3 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                    {['All', 'AI', 'Human', 'Unassigned'].map((tab) => (
                        <button
                            key={tab}
                            className={cn(
                                'flex-1 py-2.5 text-sm font-medium transition-colors',
                                tab === 'All'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {conversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => setSelectedId(conv.id)}
                            className={cn(
                                'w-full p-4 text-left border-b hover:bg-muted/50 transition-colors',
                                selectedId === conv.id && 'bg-muted'
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-sm font-medium">
                                        {conv.customer.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    {conv.unread && (
                                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-card" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={cn('text-sm', conv.unread && 'font-semibold')}>
                                            {conv.customer.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatTime(conv.updatedAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {conv.lastMessage}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={cn(
                                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                                            conv.handler === 'AI'
                                                ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        )}>
                                            {conv.handler === 'AI' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                            {conv.handler}
                                        </span>
                                        <span className="text-xs text-muted-foreground capitalize">
                                            {conv.channel.replace('_', ' ').toLowerCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Conversation Detail */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="h-16 px-6 border-b flex items-center justify-between bg-card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-sm font-medium">
                            {selectedConversation?.customer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <h2 className="font-medium">{selectedConversation?.customer.name}</h2>
                            <p className="text-sm text-muted-foreground">{selectedConversation?.customer.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 text-sm font-medium rounded-lg border hover:bg-muted transition-colors">
                            Take Over
                        </button>
                        <button className="px-3 py-1.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                            Resolve
                        </button>
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                'flex gap-3',
                                msg.sender !== 'CUSTOMER' && 'flex-row-reverse'
                            )}
                        >
                            <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs shrink-0',
                                msg.sender === 'CUSTOMER' ? 'bg-gradient-to-br from-primary to-primary/60' :
                                    msg.sender === 'AI' ? 'bg-violet-500' : 'bg-emerald-500'
                            )}>
                                {msg.sender === 'CUSTOMER' ? 'SC' :
                                    msg.sender === 'AI' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            </div>
                            <div className={cn(
                                'max-w-[70%] rounded-2xl px-4 py-3',
                                msg.sender === 'CUSTOMER'
                                    ? 'bg-muted'
                                    : 'bg-primary text-primary-foreground'
                            )}>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                <div className={cn(
                                    'flex items-center gap-2 mt-2 text-xs',
                                    msg.sender === 'CUSTOMER' ? 'text-muted-foreground' : 'text-primary-foreground/70'
                                )}>
                                    <Clock className="w-3 h-3" />
                                    {formatTime(msg.createdAt)}
                                    {msg.sender === 'AI' && msg.confidence && (
                                        <span className="ml-2">
                                            {Math.round(msg.confidence * 100)}% confident
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t bg-card">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Type a message... (AI is handling this conversation)"
                            className="flex-1 px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                            Send
                        </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        <Bot className="w-3 h-3 inline-block mr-1" />
                        AI is currently handling this conversation. Click "Take Over" to respond manually.
                    </p>
                </div>
            </div>

            {/* Customer Context Sidebar */}
            <div className="w-72 border-l bg-card p-4 overflow-y-auto">
                <h3 className="font-medium mb-4">Customer Info</h3>

                <div className="space-y-4">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Email</p>
                        <p className="text-sm">{selectedConversation?.customer.email}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Channel</p>
                        <p className="text-sm capitalize">
                            {selectedConversation?.channel.replace('_', ' ').toLowerCase()}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <span className={cn(
                            'inline-flex px-2 py-1 rounded-full text-xs font-medium',
                            selectedConversation?.status === 'OPEN' && 'bg-blue-100 text-blue-700',
                            selectedConversation?.status === 'PENDING' && 'bg-yellow-100 text-yellow-700',
                            selectedConversation?.status === 'RESOLVED' && 'bg-green-100 text-green-700',
                        )}>
                            {selectedConversation?.status}
                        </span>
                    </div>
                </div>

                <hr className="my-4" />

                <h3 className="font-medium mb-4">Previous Conversations</h3>
                <p className="text-sm text-muted-foreground">No previous conversations</p>

                <hr className="my-4" />

                <h3 className="font-medium mb-4">Quick Actions</h3>
                <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors">
                        📦 Look up order
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors">
                        💳 Process refund
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors">
                        🏷️ Add tag
                    </button>
                </div>
            </div>
        </div>
    );
}
