/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  async rewrites() {
  return [
    { source: '/api/:path*', destination: 'http://localhost:8088/api/:path*' },
    { source: '/uploads/:path*', destination: 'http://localhost:8088/uploads/:path*' }, // ✅ add this
  ]
  },
};

module.exports = nextConfig;