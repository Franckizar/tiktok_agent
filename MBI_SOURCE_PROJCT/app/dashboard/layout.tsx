// app/dashboard/layout.tsx
'use client'

import { useEffect, useRef } from 'react'
import DashboardHeader from '@/components/dashboard/Dashboardheader'
import DashboardSidebar from '@/components/dashboard/Dashboardsidebar'
import DashboardFooter from '@/components/dashboard/Dashboardfooter'
import ErrorBoundary from '@/components/ErrorBoundary'
import { useAuthStore } from '@/lib/store/auth'
import { Loader2 } from 'lucide-react'
import logger from '@/lib/utils/logger'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, checkAuth } = useAuthStore()
  const hasChecked = useRef(false)

  useEffect(() => {
    if (!hasChecked.current) {
      hasChecked.current = true
      logger.auth('Dashboard mounted - checking auth')
      checkAuth()
    }
  }, [])

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      <div className="flex-1 flex">
        <DashboardSidebar />
        {/* ✅ Catches crashes only in main content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
      <DashboardFooter />
    </div>
  )
}