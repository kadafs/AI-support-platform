import NextAuth, { type NextAuthResult } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@support-platform/database';
import bcrypt from 'bcryptjs';

const nextAuthResult: NextAuthResult = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                    include: { workspace: true },
                });

                if (!user || !user.passwordHash) {
                    return null;
                }

                const isValid = await bcrypt.compare(
                    credentials.password as string,
                    user.passwordHash
                );

                if (!isValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    workspaceId: user.workspaceId,
                    workspaceName: user.workspace.name,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id as string;
                token.role = user.role as string;
                token.workspaceId = user.workspaceId as string;
                token.workspaceName = user.workspaceName as string;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.workspaceId = token.workspaceId as string;
                session.user.workspaceName = token.workspaceName as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        newUser: '/register',
    },
    session: {
        strategy: 'jwt',
    },
});

export const handlers = nextAuthResult.handlers;
export const signIn = nextAuthResult.signIn;
export const signOut = nextAuthResult.signOut;
export const auth = nextAuthResult.auth;
