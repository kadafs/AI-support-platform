import type { NextConfig } from 'next';

import path from 'path';

const nextConfig: NextConfig = {
    transpilePackages: ['@support-platform/database', '@support-platform/shared'],
    outputFileTracingRoot: path.join(__dirname, '../../'),
    serverExternalPackages: ['@prisma/client', 'prisma'],
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
};

export default nextConfig;
