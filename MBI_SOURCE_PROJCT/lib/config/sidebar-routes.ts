// lib/config/sidebar-routes.ts
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  FileText, 
  BarChart3,
  CheckSquare,
  Briefcase,
  PieChart,
  Folder,
  Calendar,
  MessageSquare
} from 'lucide-react'

export interface SidebarRoute {
  name: string
  href: string
  icon: any
}

export const sidebarConfig: Record<string, SidebarRoute[]> = {
  ADMIN: [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/dashboard/admin/users', icon: Users },
    { name: 'Reports', href: '/dashboard/admin/reports', icon: FileText },
    { name: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
  ],
  SUPERADMIN: [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/dashboard/admin/users', icon: Users },
    { name: 'Reports', href: '/dashboard/admin/reports', icon: FileText },
    { name: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
  ],
  
  // ✅ Keep ROLE_1 format (matches profile API response)
  PLAYER: [
    { name: 'Dashboard', href: '/dashboard/player', icon: LayoutDashboard },
    { name: 'Tasks', href: '/dashboard/role-1/tasks', icon: CheckSquare },
    { name: 'Projects', href: '/dashboard/role-1/projects', icon: Briefcase },
    { name: 'Reports', href: '/dashboard/role-1/reports', icon: FileText },
  ],
  ROLE_1: [
    { name: 'Dashboard', href: '/dashboard/role-1', icon: LayoutDashboard },
    { name: 'Tasks', href: '/dashboard/role-1/tasks', icon: CheckSquare },
    { name: 'Projects', href: '/dashboard/role-1/projects', icon: Briefcase },
    { name: 'Reports', href: '/dashboard/role-1/reports', icon: FileText },
  ],
  
  ROLE_2: [
    { name: 'Dashboard', href: '/dashboard/role-2', icon: LayoutDashboard },
    { name: 'Analytics', href: '/dashboard/role-2/analytics', icon: PieChart },
    { name: 'Reports', href: '/dashboard/role-2/reports', icon: FileText },
    { name: 'Settings', href: '/dashboard/role-2/settings', icon: Settings },
  ],
  
  ROLE_3: [
    { name: 'Dashboard', href: '/dashboard/role-3', icon: LayoutDashboard },
    { name: 'Documents', href: '/dashboard/role-3/documents', icon: Folder },
    { name: 'Calendar', href: '/dashboard/role-3/calendar', icon: Calendar },
  ],
  
  ROLE_4: [
    { name: 'Dashboard', href: '/dashboard/role-4', icon: LayoutDashboard },
    { name: 'Messages', href: '/dashboard/role-4/messages', icon: MessageSquare },
    { name: 'Settings', href: '/dashboard/role-4/settings', icon: Settings },
  ],
  
  ROLE_5: [
    { name: 'Dashboard', href: '/dashboard/role-5', icon: LayoutDashboard },
    { name: 'Reports', href: '/dashboard/role-5/reports', icon: FileText },
  ],
}

// Helper function to get routes for a specific role
export function getSidebarRoutes(role: string): SidebarRoute[] {
  return sidebarConfig[role] || []
}