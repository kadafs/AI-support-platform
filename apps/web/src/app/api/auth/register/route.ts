import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@support-platform/database';
import bcrypt from 'bcryptjs';
import { slugify } from '@support-platform/shared';

// POST /api/auth/register - Register new user and workspace
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, password, companyName } = body;

        // Validate inputs
        if (!name || !email || !password || !companyName) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists with this email' },
                { status: 409 }
            );
        }

        // Create workspace slug
        let slug = slugify(companyName);
        let slugExists = await prisma.workspace.findUnique({ where: { slug } });
        let counter = 1;
        while (slugExists) {
            slug = `${slugify(companyName)}-${counter}`;
            slugExists = await prisma.workspace.findUnique({ where: { slug } });
            counter++;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create workspace and user in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create workspace
            const workspace = await tx.workspace.create({
                data: {
                    name: companyName,
                    slug,
                    settings: {
                        widgetColor: '#3b82f6',
                        widgetPosition: 'bottom-right',
                        greeting: 'Hi there! 👋 How can we help you today?',
                    },
                },
            });

            // Create admin user
            const user = await tx.user.create({
                data: {
                    email,
                    name,
                    passwordHash,
                    role: 'ADMIN',
                    workspaceId: workspace.id,
                },
            });

            // Create default live chat channel
            await tx.channel.create({
                data: {
                    workspaceId: workspace.id,
                    type: 'LIVE_CHAT',
                    name: 'Website Chat',
                    enabled: true,
                },
            });

            return { workspace, user };
        });

        return NextResponse.json(
            {
                success: true,
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    name: result.user.name,
                },
                workspace: {
                    id: result.workspace.id,
                    name: result.workspace.name,
                    slug: result.workspace.slug,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to create account', details: errorMessage },
            { status: 500 }
        );
    }
}
