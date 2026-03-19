'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, getDashboardPath } from '@/lib/store/auth'
import { Loader2 } from 'lucide-react'
import logger from '@/lib/utils/logger'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading && user) {
      // ✅ Use getDashboardPath helper - handles all roles correctly
      const redirectPath = getDashboardPath(user)
      logger.router('Redirecting user', { role: user.role, to: redirectPath })
      router.replace(redirectPath)
    } else if (!isLoading && !user) {
      logger.warn('No user found, redirecting to login')
      router.replace('/login')
    }
  }, [user, isLoading, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#ff6b35]" />
        <p className="text-gray-400">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}