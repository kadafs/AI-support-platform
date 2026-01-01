'use client';

import { useState } from 'react';
import {
    Globe,
    FileQuestion,
    FileSpreadsheet,
    Plus,
    Search,
    MoreHorizontal,
    CheckCircle,
    Clock,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const knowledgeSources = [
    {
        id: '1',
        name: 'Main Website',
        type: 'URL',
        status: 'READY',
        pages: 45,
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    {
        id: '2',
        name: 'Product FAQ',
        type: 'QA',
        status: 'READY',
        items: 28,
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
        id: '3',
        name: 'Shipping Policies',
        type: 'CSV',
        status: 'PROCESSING',
        items: 150,
        lastUpdated: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
    },
];

export default function KnowledgePage() {
    const [showAddModal, setShowAddModal] = useState(false);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'URL': return <Globe className="w-5 h-5" />;
            case 'QA': return <FileQuestion className="w-5 h-5" />;
            case 'CSV': return <FileSpreadsheet className="w-5 h-5" />;
            default: return <FileQuestion className="w-5 h-5" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'READY':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        Ready
                    </span>
                );
            case 'PROCESSING':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Processing
                    </span>
                );
            case 'FAILED':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <AlertCircle className="w-3 h-3" />
                        Failed
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        <Clock className="w-3 h-3" />
                        Pending
                    </span>
                );
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="h-16 px-6 border-b flex items-center justify-between bg-card">
                <div>
                    <h1 className="font-semibold text-lg">Knowledge Base</h1>
                    <p className="text-sm text-muted-foreground">Train your AI with your business data</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-4 h-4" />
                    Add Source
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="p-4 rounded-xl border bg-card">
                        <p className="text-2xl font-bold">3</p>
                        <p className="text-sm text-muted-foreground">Total Sources</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card">
                        <p className="text-2xl font-bold">223</p>
                        <p className="text-sm text-muted-foreground">Knowledge Items</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card">
                        <p className="text-2xl font-bold">92%</p>
                        <p className="text-sm text-muted-foreground">AI Confidence</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card">
                        <p className="text-2xl font-bold">1.2k</p>
                        <p className="text-sm text-muted-foreground">Queries Answered</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search knowledge sources..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>

                {/* Sources Table */}
                <div className="rounded-xl border bg-card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Source</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Type</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Items</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Status</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Last Updated</th>
                                <th className="w-12"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {knowledgeSources.map((source) => (
                                <tr key={source.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                                {getTypeIcon(source.type)}
                                            </div>
                                            <span className="font-medium">{source.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-muted-foreground">{source.type}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm">{source.pages || source.items}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(source.status)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-muted-foreground">
                                            {source.lastUpdated.toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Add Source Buttons */}
                <div className="mt-8">
                    <h2 className="font-medium mb-4">Add Knowledge Source</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <button className="p-6 rounded-xl border bg-card hover:border-primary hover:shadow-md transition-all text-left group">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h3 className="font-medium mb-1">Scrape Website</h3>
                            <p className="text-sm text-muted-foreground">
                                Import content from your website pages
                            </p>
                        </button>
                        <button className="p-6 rounded-xl border bg-card hover:border-primary hover:shadow-md transition-all text-left group">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <FileQuestion className="w-6 h-6" />
                            </div>
                            <h3 className="font-medium mb-1">Add Q&A</h3>
                            <p className="text-sm text-muted-foreground">
                                Create manual question and answer pairs
                            </p>
                        </button>
                        <button className="p-6 rounded-xl border bg-card hover:border-primary hover:shadow-md transition-all text-left group">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <FileSpreadsheet className="w-6 h-6" />
                            </div>
                            <h3 className="font-medium mb-1">Upload CSV</h3>
                            <p className="text-sm text-muted-foreground">
                                Bulk import from spreadsheet files
                            </p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
