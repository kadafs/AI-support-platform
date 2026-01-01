import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@support-platform/database';
import { addKnowledgeIngestionJob } from '@support-platform/jobs';

// GET /api/knowledge - List knowledge sources
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get('workspaceId');

        if (!workspaceId) {
            return NextResponse.json(
                { error: 'workspaceId is required' },
                { status: 400 }
            );
        }

        const sources = await prisma.knowledgeSource.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { chunks: true },
                },
            },
        });

        return NextResponse.json(sources);
    } catch (error) {
        console.error('Error fetching knowledge sources:', error);
        return NextResponse.json(
            { error: 'Failed to fetch knowledge sources' },
            { status: 500 }
        );
    }
}

// POST /api/knowledge - Create knowledge source
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { workspaceId, type, name, sourceUrl, content } = body;

        if (!workspaceId || !type || !name) {
            return NextResponse.json(
                { error: 'workspaceId, type, and name are required' },
                { status: 400 }
            );
        }

        const source = await prisma.knowledgeSource.create({
            data: {
                workspaceId,
                type,
                name,
                sourceUrl,
                content,
                status: 'PENDING',
            },
        });

        // Trigger background job to process the knowledge source
        await addKnowledgeIngestionJob({
            workspaceId,
            sourceId: source.id,
            sourceType: type,
            sourceUrl,
            content,
        });

        return NextResponse.json(source, { status: 201 });
    } catch (error) {
        console.error('Error creating knowledge source:', error);
        return NextResponse.json(
            { error: 'Failed to create knowledge source' },
            { status: 500 }
        );
    }
}

// DELETE /api/knowledge - Delete knowledge source
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'id is required' },
                { status: 400 }
            );
        }

        await prisma.knowledgeSource.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting knowledge source:', error);
        return NextResponse.json(
            { error: 'Failed to delete knowledge source' },
            { status: 500 }
        );
    }
}
