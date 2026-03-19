'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuthStore } from '@/lib/store/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Shield, LogOut } from 'lucide-react'

export default function UserDashboard() {
  const { user, logout } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
            <p className="text-sky-100 text-lg">
              {user?.firstname} {user?.lastname}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Card */}
            <Card className="shadow-lg border-sky-200">
              <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Profile Information</CardTitle>
                      <CardDescription>Your account details</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-2">
                    {user?.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span className="font-medium">Full Name</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {user?.firstname} {user?.lastname}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="font-medium">Email Address</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">Account Role</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{user?.role}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">Account Status</span>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {user?.status || 'ACTIVE'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg border-sky-200">
              <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-200">
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => logout()}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}