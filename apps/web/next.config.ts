import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    transpilePackages: ['@support-platform/database', '@support-platform/shared'],
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
};

export default nextConfig;
