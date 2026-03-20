/** @type {import('next').NextConfig} */

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

// When on VPS with Docker — set NEXT_PUBLIC_API_URL=http://backend:8088 in Docker env
// When on Vercel — falls back to ngrok
// When local — uses localhost
const BACKEND_INTERNAL = process.env.NEXT_PUBLIC_API_URL || (IS_PRODUCTION
  ? 'https://modest-integral-ibex.ngrok-free.app'
  : 'http://localhost:8088')

const BACKEND_PUBLIC = process.env.NEXT_PUBLIC_MEDIA_URL || (IS_PRODUCTION
  ? 'https://modest-integral-ibex.ngrok-free.app'
  : 'http://localhost:8088')

const nextConfig = {
  output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: { unoptimized: true },

  experimental: {
    serverActions: {
      bodySizeLimit: '25mb'
    }
  },

  env: {
    NEXT_PUBLIC_MEDIA_URL: BACKEND_PUBLIC,
    NEXT_PUBLIC_API_URL:   BACKEND_INTERNAL,
  },

  async rewrites() {
    console.log(`🔗 API routing to: ${BACKEND_INTERNAL}`)
    return [
      { source: '/api/actuator/:path*',      destination: `${BACKEND_INTERNAL}/actuator/:path*` },
      { source: '/api/v1/superadmin/:path*', destination: `${BACKEND_INTERNAL}/api/v1/superadmin/:path*` },
      { source: '/api/:path*',               destination: `${BACKEND_INTERNAL}/api/:path*` },
      { source: '/uploads/:path*',           destination: `${BACKEND_INTERNAL}/uploads/:path*` },
    ]
  },

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' }
        ],
      },
    ]
  },
}

module.exports = nextConfig