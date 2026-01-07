'use client';

import { useState } from 'react';
import {
    Search,
    MoreHorizontal,
    Mail,
    Phone,
    MessageSquare,
    Calendar,
    ChevronRight,
    X,
    Bot,
    User as UserIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for demo
const customers = [
    {
        id: '1',
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        phone: '+1 (555) 123-4567',
        conversationCount: 5,
        lastActive: new Date(Date.now() - 1000 * 60 * 30),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    },
    {
        id: '2',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '+1 (555) 234-5678',
        conversationCount: 12,
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
    },
    {
        id: '3',
        name: 'Emma Wilson',
        email: 'emma@example.com',
        phone: null,
        conversationCount: 3,
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
    },
    {
        id: '4',
        name: 'James Brown',
        email: 'james@example.com',
        phone: '+1 (555) 345-6789',
        conversationCount: 8,
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 48),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
    },
    {
        id: '5',
        name: 'Olivia Martinez',
        email: 'olivia@example.com',
        phone: '+1 (555) 456-7890',
        conversationCount: 1,
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    },
];

const conversations = [
    {
        id: 'c1',
        subject: 'Order #12345 inquiry',
        status: 'RESOLVED',
        handler: 'AI',
        channel: 'LIVE_CHAT',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        messageCount: 6,
    },
    {
        id: 'c2',
        subject: 'Product return request',
        status: 'OPEN',
        handler: 'HUMAN',
        channel: 'EMAIL',
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
        messageCount: 4,
    },
    {
        id: 'c3',
        subject: 'Shipping delay question',
        status: 'RESOLVED',
        handler: 'AI',
        channel: 'WHATSAPP',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        messageCount: 3,
    },
];

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    conversationCount: number;
    lastActive: Date;
    createdAt: Date;
}

export default function CustomersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const formatRelativeTime = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const filteredCustomers = customers.filter(
        (customer) =>
            customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="h-16 px-6 border-b flex items-center justify-between bg-card">
                <div>
                    <h1 className="font-semibold text-lg">Customers</h1>
                    <p className="text-sm text-muted-foreground">
                        {customers.length} total customers
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-hidden flex gap-6">
                {/* Customer List */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Search */}
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search customers by name or email..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    {/* Customer Grid */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredCustomers.map((customer) => (
                                <button
                                    key={customer.id}
                                    onClick={() => setSelectedCustomer(customer)}
                                    className={cn(
                                        'p-4 rounded-xl border bg-card text-left hover:border-primary hover:shadow-md transition-all group',
                                        selectedCustomer?.id === customer.id && 'border-primary shadow-md'
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-medium shrink-0">
                                            {customer.name.split(' ').map((n) => n[0]).join('')}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="font-medium truncate">{customer.name}</h3>
                                                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {customer.email}
                                            </p>
                                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <MessageSquare className="w-3 h-3" />
                                                    {customer.conversationCount} conversations
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatRelativeTime(customer.lastActive)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {filteredCustomers.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No customers found matching &quot;{searchQuery}&quot;</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Customer Detail Panel */}
                {selectedCustomer && (
                    <div className="w-96 border rounded-xl bg-card flex flex-col overflow-hidden shrink-0">
                        {/* Detail Header */}
                        <div className="p-4 border-b flex items-center justify-between">
                            <h2 className="font-medium">Customer Details</h2>
                            <button
                                onClick={() => setSelectedCustomer(null)}
                                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Detail Content */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-6">
                            {/* Profile */}
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl font-medium mx-auto mb-3">
                                    {selectedCustomer.name.split(' ').map((n) => n[0]).join('')}
                                </div>
                                <h3 className="font-semibold text-lg">{selectedCustomer.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Customer since {selectedCustomer.createdAt.toLocaleDateString()}
                                </p>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">{selectedCustomer.email}</span>
                                    </div>
                                    {selectedCustomer.phone && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm">{selectedCustomer.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg bg-muted/50 text-center">
                                    <p className="text-2xl font-bold">{selectedCustomer.conversationCount}</p>
                                    <p className="text-xs text-muted-foreground">Conversations</p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/50 text-center">
                                    <p className="text-2xl font-bold">{formatRelativeTime(selectedCustomer.lastActive).replace(' ago', '')}</p>
                                    <p className="text-xs text-muted-foreground">Last Active</p>
                                </div>
                            </div>

                            {/* Conversation History */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-muted-foreground">Recent Conversations</h4>
                                <div className="space-y-2">
                                    {conversations.map((conv) => (
                                        <div
                                            key={conv.id}
                                            className="p-3 rounded-lg border hover:border-primary transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <p className="text-sm font-medium truncate">
                                                    {conv.subject || 'No subject'}
                                                </p>
                                                <button className="p-1 rounded hover:bg-muted transition-colors shrink-0">
                                                    <MoreHorizontal className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                                                        conv.status === 'OPEN' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                                        conv.status === 'RESOLVED' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    )}
                                                >
                                                    {conv.status}
                                                </span>
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                                                        conv.handler === 'AI'
                                                            ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                                                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                    )}
                                                >
                                                    {conv.handler === 'AI' ? <Bot className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                                                    {conv.handler}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatRelativeTime(conv.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
