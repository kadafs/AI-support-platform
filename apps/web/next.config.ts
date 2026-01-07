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
        outputFileTracingIncludes: {
            '/api/**/*': ['../../packages/database/node_modules/.prisma/client/**/*'],
        },
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.externals.push({
                '@prisma/client': 'commonjs @prisma/client',
            });
        }
        return config;
    },
};

export default nextConfig;
