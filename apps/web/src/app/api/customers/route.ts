import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@support-platform/database';
import { Prisma } from '@prisma/client';

// GET /api/customers - List customers for workspace
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get('workspaceId');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '20');

        if (!workspaceId) {
            return NextResponse.json(
                { error: 'workspaceId is required' },
                { status: 400 }
            );
        }

        const where: Prisma.CustomerWhereInput = {
            workspaceId,
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                include: {
                    _count: {
                        select: { conversations: true },
                    },
                },
                orderBy: { updatedAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.customer.count({ where }),
        ]);

        const formattedCustomers = customers.map(customer => ({
            ...customer,
            conversationCount: customer._count.conversations,
        }));

        return NextResponse.json({
            items: formattedCustomers,
            total,
            page,
            pageSize,
            hasMore: page * pageSize < total,
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customers' },
            { status: 500 }
        );
    }
}
