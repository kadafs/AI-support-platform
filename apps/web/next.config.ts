import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
    output: 'standalone',
    transpilePackages: ['@support-platform/database', '@support-platform/shared'],
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            // Ensure Prisma engine files are copied to the output
            config.externals = [...(config.externals || []), '@prisma/client'];
        }
        return config;
    },
};

export default nextConfig;
