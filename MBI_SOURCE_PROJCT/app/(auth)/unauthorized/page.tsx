// app/(auth)/unauthorized/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'
import { ShieldX, Home, LogOut, ArrowLeft } from 'lucide-react'
import logger from '@/lib/utils/logger'

export default function UnauthorizedPage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleGoBack = () => {
    logger.router('User clicked go back from unauthorized page')
    router.back()
  }

  const handleGoHome = () => {
    logger.router('User clicked go home from unauthorized page')
    if (user) {
      // ✅ Send logged in users to their dashboard
      const roleRoutes: Record<string, string> = {
        'ADMIN': '/dashboard/admin',
        'ROLE_1': '/dashboard/role-1',
        'ROLE_2': '/dashboard/role-2',
        'ROLE_3': '/dashboard/role-3',
        'ROLE_4': '/dashboard/role-4',
        'ROLE_5': '/dashboard/role-5',
      }
      router.push(roleRoutes[user.role] || '/dashboard')
    } else {
      router.push('/')
    }
  }

  const handleLogout = () => {
    logger.auth('User logging out from unauthorized page')
    logout()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">

        {/* Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-red-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Access Denied
        </h1>

        {/* Message */}
        <p className="text-gray-500 mb-2">
          You don&apos;t have permission to access this page.
        </p>

        {/* Show who is logged in */}
        {user && (
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Logged in as{' '}
              <span className="font-medium text-gray-900">
                {user.email}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Role:{' '}
              <span className="font-medium text-sky-600">
                {user.role}
              </span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            {user ? 'Go to My Dashboard' : 'Go to Home'}
          </button>

          <button
            onClick={handleGoBack}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  )
}