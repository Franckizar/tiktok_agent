// components/ProtectedRoute.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter()
  const { user, isLoading } = useAuthStore()  // ✅ REMOVED checkAuth

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }

    if (!isLoading && user && requiredRole && user.role !== requiredRole) {
      if (requiredRole === 'ADMIN' && user.role !== 'ADMIN') {
        router.push('/user')
      }
    }
  }, [user, isLoading, requiredRole, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-600 mx-auto"></div>
          <p className="text-sky-700 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}