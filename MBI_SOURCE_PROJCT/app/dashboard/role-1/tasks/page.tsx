// app/dashboard/role-1/tasks/page.tsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tasks</h1>
        <p className="text-gray-600 mt-2">Manage your tasks</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
          <CardDescription>Your assigned tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Task content here</p>
        </CardContent>
      </Card>
    </div>
  )
}