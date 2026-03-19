// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

function parseJwt(token: string): { roles?: string[]; exp?: number } | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = parseJwt(token)
    if (!payload || !payload.exp) return true
    const now = Math.floor(Date.now() / 1000)
    return payload.exp < now
  } catch {
    return true
  }
}

const protectedRoutes: Record<string, string[]> = {
  '/dashboard/superadmin': ['SUPERADMIN'],
  '/dashboard/admin': ['SUPERADMIN', 'ADMIN'],
  '/dashboard/player': ['PLAYER'],
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const matchedRoute = Object.keys(protectedRoutes).find(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  if (matchedRoute) {
    const allowedRoles = protectedRoutes[matchedRoute]
    const token = request.cookies.get('accessToken')?.value

    // No token → let client handle refresh
    if (!token) {
      console.log(`🔒 No token for ${pathname} - letting client handle`)
      return NextResponse.next()
    }

    // ✅ FIXED: Expired token → do NOT delete cookies, let axios interceptor refresh
    if (isTokenExpired(token)) {
      console.log(`⏰ Token expired for ${pathname} - letting client refresh`)
      return NextResponse.next()
    }

    const payload = parseJwt(token)

    if (!payload || !payload.roles || payload.roles.length === 0) {
      console.log(`❌ Invalid token for ${pathname}`)
      return NextResponse.next()
    }

    const userRole = payload.roles[0].toUpperCase()

    if (!allowedRoles.includes(userRole)) {
      console.log(`🚫 Access denied for ${pathname}. Role: ${userRole}`)
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    console.log(`✅ Access granted for ${pathname}. Role: ${userRole}`)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}