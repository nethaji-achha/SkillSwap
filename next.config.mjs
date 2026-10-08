/** @type {import('next').NextConfig} */
const externalApiUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
const isDev = process.env.NODE_ENV !== 'production';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (externalApiUrl) {
      const backendBaseUrl = externalApiUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '');
      return [
        {
          source: '/api/v1/:path*',
          destination: `${backendBaseUrl}/api/v1/:path*`,
        },
      ];
    }
    if (isDev) {
      return [
        {
          source: '/api/v1/:path*',
          destination: 'http://127.0.0.1:8000/api/v1/:path*',
        },
      ];
    }
    // In production on Vercel, route to Python serverless function in api/index.py
    return [
      {
        source: '/api/v1/:path*',
        destination: '/api/index.py',
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
