import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@support-platform/database';
import { Prisma } from '@prisma/client';

// GET /api/analytics - Get analytics data
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get('workspaceId');
        const range = searchParams.get('range') || '7d'; // 24h, 7d, 30d, 90d

        if (!workspaceId) {
            return NextResponse.json(
                { error: 'workspaceId is required' },
                { status: 400 }
            );
        }

        // Calculate date range
        const now = new Date();
        const past = new Date();
        if (range === '24h') past.setHours(past.getHours() - 24);
        else if (range === '7d') past.setDate(past.getDate() - 7);
        else if (range === '30d') past.setDate(past.getDate() - 30);
        else if (range === '90d') past.setDate(past.getDate() - 90);

        const where: Prisma.ConversationWhereInput = {
            workspaceId,
            createdAt: { gte: past },
        };

        // Run aggregations in parallel
        const [
            totalConversations,
            byStatus,
            byHandler,
            byChannel,
            trendData
        ] = await Promise.all([
            // 1. Total Count
            prisma.conversation.count({ where }),

            // 2. Status Breakdown
            prisma.conversation.groupBy({
                by: ['status'],
                where,
                _count: true,
            }),

            // 3. Handler Breakdown
            prisma.conversation.groupBy({
                by: ['handler'],
                where,
                _count: true,
            }),

            // 4. Channel Breakdown
            prisma.conversation.groupBy({
                by: ['channel'],
                where,
                _count: true,
            }),

            // 5. Trend Data (fetch necessary fields to aggregate in JS)
            prisma.conversation.findMany({
                where,
                select: {
                    createdAt: true,
                    status: true,
                },
                orderBy: { createdAt: 'asc' },
            }),
        ]);

        // Process Trend Data
        const trendMap = new Map<string, { conversations: number; resolved: number }>();

        // Initialize map with all days/hours in range
        // For simplicity in this iteration, we'll just group the returned data
        // Ideally we'd fill gaps here.

        trendData.forEach((c) => {
            const date = range === '24h'
                ? c.createdAt.toISOString().slice(0, 13) + ':00' // Hour precision
                : c.createdAt.toISOString().slice(0, 10); // Day precision

            const existing = trendMap.get(date) || { conversations: 0, resolved: 0 };
            existing.conversations++;
            if (c.status === 'RESOLVED' || c.status === 'CLOSED') {
                existing.resolved++;
            }
            trendMap.set(date, existing);
        });

        const formattedTrend = Array.from(trendMap.entries()).map(([date, data]) => ({
            period: date,
            ...data,
        }));

        // Calculate Derived Stats
        const resolvedCount = byStatus
            .filter(s => s.status === 'RESOLVED' || s.status === 'CLOSED')
            .reduce((acc, curr) => acc + curr._count, 0);

        const resolutionRate = totalConversations > 0
            ? Math.round((resolvedCount / totalConversations) * 100)
            : 0;

        const aiHandled = byHandler.find(h => h.handler === 'AI')?._count || 0;
        const totalHandled = byHandler.reduce((acc, curr) => acc + curr._count, 0); // Should match totalConversations roughly

        // Calculate AI Resolution Rate (AI Resolved / Total Resolved) - approximation since we only have global breakdown
        // For better accuracy we'd need a filtered count.
        // Let's use AI Handled % for now as a simpler metric or do another query.
        // Let's do a specific query for AI Resolutions.
        const aiResolvedCount = await prisma.conversation.count({
            where: {
                ...where,
                handler: 'AI',
                status: { in: ['RESOLVED', 'CLOSED'] }
            }
        });

        const aiResolutionRate = resolvedCount > 0
            ? Math.round((aiResolvedCount / resolvedCount) * 100)
            : 0;

        return NextResponse.json({
            stats: {
                totalConversations,
                resolvedConversations: resolvedCount,
                avgResponseTime: '2.3 min', // Placeholder
                aiResolutionRate,
                resolutionRate
            },
            breakdown: {
                handler: byHandler.map(h => ({ name: h.handler, value: h._count })),
                channel: byChannel.map(c => ({ name: c.channel, value: c._count })),
                status: byStatus.map(s => ({ name: s.status, value: s._count })),
            },
            trends: formattedTrend
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
