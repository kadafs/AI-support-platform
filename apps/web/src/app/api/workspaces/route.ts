import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@support-platform/database';

// GET /api/workspaces - Get workspace for current user
export async function GET(request: NextRequest) {
    try {
        // TODO: Get workspace from authenticated user session
        // For now, return first workspace for demo
        const workspace = await prisma.workspace.findFirst({
            include: {
                _count: {
                    select: {
                        users: true,
                        conversations: true,
                        knowledgeSources: true,
                    },
                },
            },
        });

        if (!workspace) {
            return NextResponse.json(
                { error: 'No workspace found' },
                { status: 404 }
            );
        }

        return NextResponse.json(workspace);
    } catch (error) {
        console.error('Error fetching workspace:', error);
        return NextResponse.json(
            { error: 'Failed to fetch workspace' },
            { status: 500 }
        );
    }
}

// POST /api/workspaces - Create workspace
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, slug } = body;

        if (!name || !slug) {
            return NextResponse.json(
                { error: 'name and slug are required' },
                { status: 400 }
            );
        }

        // Check if slug is already taken
        const existing = await prisma.workspace.findUnique({
            where: { slug },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Slug is already taken' },
                { status: 409 }
            );
        }

        const workspace = await prisma.workspace.create({
            data: {
                name,
                slug,
                settings: {
                    widgetColor: '#3b82f6',
                    widgetPosition: 'bottom-right',
                    greeting: 'Hi there! 👋 How can we help you today?',
                },
            },
        });

        return NextResponse.json(workspace, { status: 201 });
    } catch (error) {
        console.error('Error creating workspace:', error);
        return NextResponse.json(
            { error: 'Failed to create workspace' },
            { status: 500 }
        );
    }
}

// PATCH /api/workspaces - Update workspace settings
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name, settings } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'id is required' },
                { status: 400 }
            );
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (settings) updateData.settings = settings;

        const workspace = await prisma.workspace.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(workspace);
    } catch (error) {
        console.error('Error updating workspace:', error);
        return NextResponse.json(
            { error: 'Failed to update workspace' },
            { status: 500 }
        );
    }
}
