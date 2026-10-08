/** @type {import('next').NextConfig} */
const backendApiUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const backendBaseUrl = backendApiUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '');

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendBaseUrl}/api/v1/:path*`,
      },
      {
        source: '/health',
        destination: `${backendBaseUrl}/health`,
      },
      {
        source: '/docs',
        destination: `${backendBaseUrl}/docs`,
      },
      {
        source: '/openapi.json',
        destination: `${backendBaseUrl}/openapi.json`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
};

export default nextConfig;
