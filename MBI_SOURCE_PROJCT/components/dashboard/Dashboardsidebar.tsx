'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'
import { getSidebarRoutes } from '@/lib/config/sidebar-routes'
import { cn } from '@/lib/utils/utils'
import logger from '@/lib/utils/logger'
import { useState } from 'react'

export default function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

  const navigation = user?.role ? getSidebarRoutes(user.role) : []

  logger.sidebar('Rendering sidebar', { role: user?.role, routes: navigation.length })

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div className={cn(
        "fixed inset-0 bg-black/60 z-20 md:hidden transition-opacity",
        collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
      )} onClick={() => setCollapsed(true)} />

      <aside className={cn(
        "relative flex flex-col z-30 transition-all duration-300 ease-in-out",
        "bg-[#0a0a0f] border-r border-[#ff6b35]/20",
        collapsed ? "w-16" : "w-64",
        // Mobile: fixed drawer
        "fixed md:relative h-full md:h-auto",
        collapsed ? "-translate-x-full md:translate-x-0" : "translate-x-0"
      )}>

        {/* Ambient glow top */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#ff6b35]/5 to-transparent pointer-events-none" />

        {/* Logo area */}
        <div className={cn(
          "flex items-center border-b border-[#ff6b35]/20 px-4",
          collapsed ? "justify-center py-5" : "justify-between py-5"
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="relative w-7 h-7">
                <div className="absolute inset-0 bg-[#ff6b35] rounded blur-sm opacity-60" />
                <div className="relative w-7 h-7 bg-[#ff6b35] rounded flex items-center justify-center">
                  <span className="text-white font-black text-xs">MBI</span>
                </div>
              </div>
              <span className="text-white font-black tracking-widest text-sm uppercase">
                Arena
              </span>
            </div>
          )}

          {collapsed && (
            <div className="relative w-7 h-7">
              <div className="absolute inset-0 bg-[#ff6b35] rounded blur-sm opacity-60" />
              <div className="relative w-7 h-7 bg-[#ff6b35] rounded flex items-center justify-center">
                <span className="text-white font-black text-xs">M</span>
              </div>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-6 h-6 rounded border border-[#ff6b35]/30 flex items-center justify-center",
              "text-[#ff6b35] hover:bg-[#ff6b35]/10 transition-colors",
              collapsed && "hidden"
            )}
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto mt-3 w-6 h-6 rounded border border-[#ff6b35]/30 flex items-center justify-center text-[#ff6b35] hover:bg-[#ff6b35]/10 transition-colors"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        )}

        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#ff6b35]/20 scrollbar-track-transparent">
          {navigation.length === 0 ? (
            <div className="px-4 py-3 text-gray-500 text-xs">No items</div>
          ) : (
            navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    collapsed ? 'justify-center' : '',
                    isActive
                      ? 'bg-[#ff6b35]/15 text-[#ff6b35] border border-[#ff6b35]/30'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                  )}
                >
                  {/* Active glow */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#ff6b35] rounded-full shadow-[0_0_8px_#ff6b35]" />
                  )}

                  <Icon className={cn(
                    "w-4 h-4 flex-shrink-0 transition-all",
                    isActive ? "text-[#ff6b35] drop-shadow-[0_0_6px_rgba(255,107,53,0.8)]" : "group-hover:text-white"
                  )} />

                  {!collapsed && (
                    <span className="text-sm font-medium tracking-wide">{item.name}</span>
                  )}

                  {/* Tooltip when collapsed */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-[#1a1a24] border border-[#ff6b35]/20 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              )
            })
          )}
        </nav>

        {/* User info + logout */}
        <div className="p-3 border-t border-[#ff6b35]/20">
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg bg-white/5">
              <div className="w-7 h-7 rounded-full bg-[#ff6b35]/20 border border-[#ff6b35]/40 flex items-center justify-center flex-shrink-0">
                <span className="text-[#ff6b35] text-xs font-bold">
                  {user?.firstname?.[0]}{user?.lastname?.[0]}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user?.firstname} {user?.lastname}</p>
                <p className="text-[#ff6b35] text-[10px] uppercase tracking-widest truncate">{user?.role}</p>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              logger.auth('User clicked logout')
              logout()
            }}
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all",
              "text-gray-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20",
              collapsed ? "justify-center" : ""
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0 group-hover:drop-shadow-[0_0_6px_rgba(239,68,68,0.8)] transition-all" />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}