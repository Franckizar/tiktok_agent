/** @type {import('next').NextConfig} */

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

const BACKEND_INTERNAL = IS_PRODUCTION
  ? 'http://backend:8088'
  : 'http://localhost:8088'

const BACKEND_PUBLIC = IS_PRODUCTION
  ? 'https://modest-integral-ibex.ngrok-free.app'  // ← update this when you have a domain
  : 'http://localhost:8088'

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
    NEXT_PUBLIC_MEDIA_URL: process.env.NEXT_PUBLIC_MEDIA_URL || BACKEND_PUBLIC,
    NEXT_PUBLIC_API_URL:   process.env.NEXT_PUBLIC_API_URL   || BACKEND_INTERNAL,
  },

  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || BACKEND_INTERNAL
    console.log(`🔗 API routing to: ${backendUrl}`)
    return [
      { source: '/api/actuator/:path*',      destination: `${backendUrl}/actuator/:path*` },
      { source: '/api/v1/superadmin/:path*', destination: `${backendUrl}/api/v1/superadmin/:path*` },
      { source: '/api/:path*',               destination: `${backendUrl}/api/:path*` },
      { source: '/uploads/:path*',           destination: `${backendUrl}/uploads/:path*` },
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