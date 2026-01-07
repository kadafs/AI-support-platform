import type { NextConfig } from 'next';

import path from 'path';

const nextConfig: NextConfig = {
    transpilePackages: ['@support-platform/database', '@support-platform/shared'],
    outputFileTracingRoot: path.join(__dirname, '../../'),
    serverExternalPackages: ['@prisma/client', 'prisma'],
    outputFileTracingIncludes: {
        '/api/**/*': ['../../packages/database/node_modules/.prisma/client/**/*'],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
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
