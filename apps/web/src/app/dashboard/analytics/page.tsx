'use client';

import { useState } from 'react';
import {
    MessageSquare,
    CheckCircle,
    Clock,
    Bot,
    Users,
    TrendingUp,
    Mail,
    MessageCircle,
    Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock analytics data
const stats = {
    totalConversations: 1247,
    resolvedConversations: 1089,
    avgResponseTime: '2.3 min',
    aiResolutionRate: 78,
};

const handlerBreakdown = [
    { name: 'AI', value: 78, color: 'bg-teal-500' },
    { name: 'Human', value: 22, color: 'bg-purple-500' },
];

const channelBreakdown = [
    { name: 'Live Chat', value: 45, icon: MessageCircle, color: 'bg-blue-500' },
    { name: 'Email', value: 35, icon: Mail, color: 'bg-amber-500' },
    { name: 'WhatsApp', value: 20, icon: Phone, color: 'bg-green-500' },
];

const statusBreakdown = [
    { name: 'Open', value: 23, color: 'bg-blue-500' },
    { name: 'Pending', value: 45, color: 'bg-yellow-500' },
    { name: 'Resolved', value: 189, color: 'bg-green-500' },
];

const trendData = [
    { day: 'Mon', conversations: 45, resolved: 38 },
    { day: 'Tue', conversations: 52, resolved: 47 },
    { day: 'Wed', conversations: 38, resolved: 35 },
    { day: 'Thu', conversations: 65, resolved: 58 },
    { day: 'Fri', conversations: 48, resolved: 42 },
    { day: 'Sat', conversations: 32, resolved: 30 },
    { day: 'Sun', conversations: 28, resolved: 25 },
];

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState('7d');

    const maxTrendValue = Math.max(...trendData.map((d) => d.conversations));

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="h-16 px-6 border-b flex items-center justify-between bg-card">
                <div>
                    <h1 className="font-semibold text-lg">Analytics</h1>
                    <p className="text-sm text-muted-foreground">
                        Track your support performance
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {['24h', '7d', '30d', '90d'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={cn(
                                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                timeRange === range
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted'
                            )}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="p-6 rounded-xl border bg-card">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                +12%
                            </span>
                        </div>
                        <p className="text-3xl font-bold mb-1">{stats.totalConversations.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Total Conversations</p>
                    </div>

                    <div className="p-6 rounded-xl border bg-card">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                +8%
                            </span>
                        </div>
                        <p className="text-3xl font-bold mb-1">{Math.round((stats.resolvedConversations / stats.totalConversations) * 100)}%</p>
                        <p className="text-sm text-muted-foreground">Resolution Rate</p>
                    </div>

                    <div className="p-6 rounded-xl border bg-card">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <Clock className="w-6 h-6" />
                            </div>
                            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                -18%
                            </span>
                        </div>
                        <p className="text-3xl font-bold mb-1">{stats.avgResponseTime}</p>
                        <p className="text-sm text-muted-foreground">Avg Response Time</p>
                    </div>

                    <div className="p-6 rounded-xl border bg-card">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                                <Bot className="w-6 h-6" />
                            </div>
                            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                +5%
                            </span>
                        </div>
                        <p className="text-3xl font-bold mb-1">{stats.aiResolutionRate}%</p>
                        <p className="text-sm text-muted-foreground">AI Resolution Rate</p>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    {/* Handler Breakdown */}
                    <div className="p-6 rounded-xl border bg-card">
                        <h3 className="font-medium mb-6">Handler Breakdown</h3>
                        <div className="flex items-center justify-center mb-6">
                            <div className="relative w-40 h-40">
                                {/* Simple ring chart */}
                                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="15.9"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        className="text-muted"
                                    />
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="15.9"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeDasharray={`${handlerBreakdown[0].value}, 100`}
                                        className="text-teal-500"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <Bot className="w-6 h-6 text-teal-500 mb-1" />
                                    <span className="text-2xl font-bold">{handlerBreakdown[0].value}%</span>
                                    <span className="text-xs text-muted-foreground">AI</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {handlerBreakdown.map((item) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={cn('w-3 h-3 rounded-full', item.color)} />
                                        <span className="text-sm">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-medium">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Channel Distribution */}
                    <div className="p-6 rounded-xl border bg-card">
                        <h3 className="font-medium mb-6">Channel Distribution</h3>
                        <div className="space-y-4">
                            {channelBreakdown.map((channel) => (
                                <div key={channel.name} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <channel.icon className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm">{channel.name}</span>
                                        </div>
                                        <span className="text-sm font-medium">{channel.value}%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={cn('h-full rounded-full transition-all', channel.color)}
                                            style={{ width: `${channel.value}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Conversation Status */}
                    <div className="p-6 rounded-xl border bg-card">
                        <h3 className="font-medium mb-6">Conversation Status</h3>
                        <div className="space-y-4">
                            {statusBreakdown.map((status) => (
                                <div key={status.name} className="flex items-center gap-4">
                                    <div className={cn('w-3 h-3 rounded-full shrink-0', status.color)} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm">{status.name}</span>
                                            <span className="text-sm font-medium">{status.value}</span>
                                        </div>
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={cn('h-full rounded-full', status.color)}
                                                style={{ width: `${(status.value / 257) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Total Open</span>
                                <span className="font-semibold">
                                    {statusBreakdown.reduce((acc, s) => acc + s.value, 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trend Chart */}
                <div className="p-6 rounded-xl border bg-card">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-medium">Conversation Trends</h3>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary" />
                                <span className="text-muted-foreground">Total</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="text-muted-foreground">Resolved</span>
                            </div>
                        </div>
                    </div>

                    {/* Simple Bar Chart */}
                    <div className="h-64 flex items-end gap-4">
                        {trendData.map((data) => (
                            <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full flex items-end gap-1 h-48">
                                    <div
                                        className="flex-1 bg-primary rounded-t-md transition-all hover:opacity-80"
                                        style={{ height: `${(data.conversations / maxTrendValue) * 100}%` }}
                                        title={`${data.conversations} conversations`}
                                    />
                                    <div
                                        className="flex-1 bg-green-500 rounded-t-md transition-all hover:opacity-80"
                                        style={{ height: `${(data.resolved / maxTrendValue) * 100}%` }}
                                        title={`${data.resolved} resolved`}
                                    />
                                </div>
                                <span className="text-xs text-muted-foreground">{data.day}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
