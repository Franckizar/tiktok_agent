// app/dashboard/role-1/page.tsx
'use client'

import { useAuthStore } from '@/lib/store/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Role1Dashboard() {
  const { user, logout } = useAuthStore()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Role 1 Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.firstname}!
          </p>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Feature 1</CardTitle>
            <CardDescription>Role 1 specific content</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Content here</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature 2</CardTitle>
            <CardDescription>Another feature</CardDescription>
          </CardHeader>
          <CardContent>
            <p>More content</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}