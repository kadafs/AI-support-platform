import type { NextConfig } from 'next';

import path from 'path';

const nextConfig: NextConfig = {
    transpilePackages: ['@support-platform/database', '@support-platform/shared'],
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
        outputFileTracingRoot: path.join(__dirname, '../../'),
    },
};

export default nextConfig;
