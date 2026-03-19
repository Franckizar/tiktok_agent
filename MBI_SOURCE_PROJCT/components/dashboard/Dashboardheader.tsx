'use client'

import { Bell, Search, User, Menu, Zap } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'
import { useState } from 'react'
import { cn } from '@/lib/utils/utils'

export default function DashboardHeader() {
  const { user } = useAuthStore()
  const [imageError, setImageError] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  // ✅ Fixed: logoPath already starts with /uploads/...
  // Next.js proxy forwards /uploads/* → http://localhost:8088/uploads/*
  const imageUrl = user?.logoPath ?? null

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-[#ff6b35]/20">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent opacity-60" />

      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-4">

          {/* Left: mobile menu + brand */}
          <div className="flex items-center gap-3">
            <button className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-[#ff6b35]/20 text-gray-400 hover:text-[#ff6b35] hover:border-[#ff6b35]/40 transition-all">
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#ff6b35] drop-shadow-[0_0_6px_rgba(255,107,53,0.8)]" />
              <span className="text-white font-black tracking-widest text-sm uppercase hidden sm:block">
                MBI <span className="text-[#ff6b35]">Arena</span>
              </span>
            </div>
          </div>

          {/* Center: search */}
          <div className="hidden md:flex flex-1 max-w-sm">
            <div className={cn(
              "relative w-full transition-all duration-200",
              searchFocused ? "scale-[1.02]" : ""
            )}>
              <Search className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors",
                searchFocused ? "text-[#ff6b35]" : "text-gray-500"
              )} />
              <input
                type="search"
                placeholder="Search players, matches..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={cn(
                  "w-full pl-9 pr-4 py-2 text-sm rounded-lg transition-all",
                  "bg-white/5 border text-white placeholder-gray-500",
                  "focus:outline-none",
                  searchFocused
                    ? "border-[#ff6b35]/50 bg-white/8 shadow-[0_0_15px_rgba(255,107,53,0.1)]"
                    : "border-white/10 hover:border-white/20"
                )}
              />
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:text-[#ff6b35] hover:border-[#ff6b35]/30 hover:bg-[#ff6b35]/5 transition-all"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#ff6b35] rounded-full shadow-[0_0_6px_rgba(255,107,53,0.8)]" />
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <>
                  {/* Backdrop to close on outside click */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 top-10 w-72 bg-[#0f0f1a] border border-[#ff6b35]/20 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                      <span className="text-white text-xs font-bold uppercase tracking-widest">Notifications</span>
                      <span className="text-[#ff6b35] text-xs">3 new</span>
                    </div>
                    {[
                      { text: "New user pending approval", time: "2m ago" },
                      { text: "Player profile updated", time: "1h ago" },
                      { text: "System health: All OK", time: "3h ago" },
                    ].map((n, i) => (
                      <div key={i} className="px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                        <p className="text-gray-300 text-xs">{n.text}</p>
                        <p className="text-gray-500 text-[10px] mt-0.5">{n.time}</p>
                      </div>
                    ))}
                    <div className="px-4 py-2 text-center">
                      <span className="text-[#ff6b35] text-xs cursor-pointer hover:underline">
                        View all notifications
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10" />

            {/* Profile */}
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#ff6b35]/30 bg-[#ff6b35]/10 flex items-center justify-center flex-shrink-0">
                {imageUrl && !imageError ? (
                  <img
                    src={imageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <User className="w-4 h-4 text-[#ff6b35]" />
                )}
                {/* Online dot */}
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-[#0a0a0f] shadow-[0_0_4px_rgba(74,222,128,0.8)]" />
              </div>

              <div className="hidden sm:block">
                <p className="text-white text-xs font-semibold leading-tight">
                  {user?.firstname} {user?.lastname}
                </p>
                <p className="text-[#ff6b35] text-[10px] uppercase tracking-widest leading-tight">
                  {user?.role}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff6b35]/30 to-transparent" />
    </header>
  )
}