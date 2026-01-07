import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@support-platform/database';

// GET /api/customers/[id] - Get customer details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                conversations: {
                    include: {
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                        },
                    },
                    orderBy: { updatedAt: 'desc' },
                },
            },
        });

        if (!customer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(customer);
    } catch (error) {
        console.error('Error fetching customer:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customer' },
            { status: 500 }
        );
    }
}
