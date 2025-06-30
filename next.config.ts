// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Add this block to disable ESLint during Next.js build
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    // Use this only if you want to completely disable ESLint during 'next build'
    // and you are handling linting in a separate CI/CD step or locally.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;