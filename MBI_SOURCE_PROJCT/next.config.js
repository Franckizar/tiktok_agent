/** @type {import('next').NextConfig} */

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

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
      // Actuator — backend exposes at /actuator/ directly
      {
        source: '/api/actuator/:path*',
        destination: `${BACKEND_INTERNAL}/actuator/:path*`
      },
      // All other /api/* — backend also has /api/* so keep the prefix
      {
        source: '/api/:path*',
        destination: `${BACKEND_INTERNAL}/api/:path*`
      },
      // Uploads
      {
        source: '/uploads/:path*',
        destination: `${BACKEND_INTERNAL}/uploads/:path*`
      },
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