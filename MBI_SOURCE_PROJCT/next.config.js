/** @type {import('next').NextConfig} */

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

const BACKEND_URL = IS_PRODUCTION
  ? 'https://modest-integral-ibex.ngrok-free.app'
  : 'http://localhost:8088'

const nextConfig = {
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  experimental: {
    serverActions: { bodySizeLimit: '25mb' }
  },
  env: {
    NEXT_PUBLIC_MEDIA_URL: IS_PRODUCTION
      ? 'https://modest-integral-ibex.ngrok-free.app'
      : 'http://localhost:8088',
  },
  async rewrites() {
    console.log(`🔗 API routing to: ${BACKEND_URL}`)
    return [
      {
        source: '/api/actuator/:path*',
        destination: `${BACKEND_URL}/actuator/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${BACKEND_URL}/uploads/:path*`,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'ngrok-skip-browser-warning', value: 'true' }, // ← ADD THIS
        ],
      },
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'ngrok-skip-browser-warning', value: 'true' }, // ← AND THIS
        ],
      },
    ]
  },
}

module.exports = nextConfig