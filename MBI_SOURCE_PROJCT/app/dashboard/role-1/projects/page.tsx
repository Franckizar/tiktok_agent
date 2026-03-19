// app/dashboard/role-1/projects/page.tsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-gray-600 mt-2">View your projects</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project List</CardTitle>
          <CardDescription>Active projects</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Project content here</p>
        </CardContent>
      </Card>
    </div>
  )
}