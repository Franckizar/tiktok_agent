'use client'

import { useAuthStore } from '@/lib/store/auth'
import { Users, Heart, Video, UserCheck, ExternalLink, BadgeCheck, Loader2 } from 'lucide-react'

export default function PlayerDashboard() {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" />
      </div>
    )
  }

  const stats = [
    {
      label: 'Followers',
      value: formatNumber(user?.tiktokFollowerCount),
      icon: Users,
      color: 'text-blue-400',
      border: 'border-blue-400/20',
      glow: 'rgba(96,165,250,0.1)',
    },
    {
      label: 'Following',
      value: formatNumber(user?.tiktokFollowingCount),
      icon: UserCheck,
      color: 'text-purple-400',
      border: 'border-purple-400/20',
      glow: 'rgba(192,132,252,0.1)',
    },
    {
      label: 'Total Likes',
      value: formatNumber(user?.tiktokLikesCount),
      icon: Heart,
      color: 'text-pink-400',
      border: 'border-pink-400/20',
      glow: 'rgba(244,114,182,0.1)',
    },
    {
      label: 'Videos',
      value: formatNumber(user?.tiktokVideoCount),
      icon: Video,
      color: 'text-[#ff6b35]',
      border: 'border-[#ff6b35]/20',
      glow: 'rgba(255,107,53,0.1)',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-10 mix-blend-overlay"
          style={{
            backgroundImage: `url('/textures/texture.jpg')`,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at top right, rgba(255,107,53,0.08) 0%, transparent 60%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">
            TIKTOK
            <span
              className="text-[#ff6b35] ml-2"
              style={{ textShadow: '0 0 20px rgba(255,107,53,0.5)' }}
            >
              DASHBOARD
            </span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Your TikTok analytics at a glance
          </p>
        </div>

        {/* Profile Card */}
        <div className="relative mb-6">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ff6b35]/30 to-transparent rounded-2xl blur-sm" />
          <div className="relative bg-[#0d0d14] border border-[#ff6b35]/20 rounded-2xl p-6">
            <div className="flex items-center gap-5">

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl border-2 border-[#ff6b35]/50 overflow-hidden bg-[#1a1a24]">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="TikTok avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-black text-[#ff6b35]">
                      {(user?.displayName || user?.firstname || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#0d0d14]" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-black text-white truncate">
                    {user?.displayName || user?.firstname || 'TikTok User'}
                  </h2>
                  {user?.tiktokVerified && (
                    <BadgeCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  )}
                </div>

                {user?.tiktokBio && (
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                    {user.tiktokBio}
                  </p>
                )}

                {user?.tiktokProfileLink && (
                  <a  // ✅ Fixed: was missing the opening <a tag
                    href={user.tiktokProfileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#ff6b35] hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View TikTok Profile
                  </a>
                )}
              </div>

              {/* Connected badge */}
              {user?.tiktokConnected && (
                <div className="flex-shrink-0 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold">
                  ✓ Connected
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`bg-[#0d0d14] border ${stat.border} rounded-2xl p-5 hover:border-opacity-60 transition-all`}
              style={{
                background: `radial-gradient(circle at top right, ${stat.glow} 0%, #0d0d14 70%)`,
              }}
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Engagement Ratio */}
        {user?.tiktokFollowerCount && user.tiktokFollowerCount > 0 && user?.tiktokLikesCount ? (
          <div className="bg-[#0d0d14] border border-[#ff6b35]/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-300">
                Avg Likes per Follower
              </span>
              <span className="text-[#ff6b35] font-bold text-lg">
                {(user.tiktokLikesCount / user.tiktokFollowerCount).toFixed(1)}x
              </span>
            </div>
            <div className="w-full bg-[#1a1a24] rounded-full h-3">
              <div
                className="bg-gradient-to-r from-[#ff6b35] to-[#ff0000] h-3 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (user.tiktokLikesCount / user.tiktokFollowerCount / 10) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Based on total likes vs total followers
            </p>
          </div>
        ) : null}

        {/* Coming Soon — Videos */}
        <div className="bg-[#0d0d14] border border-[#ff6b35]/10 rounded-2xl p-12 text-center">
          <Video className="w-16 h-16 text-[#ff6b35]/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">Video Analytics</h3>
          <p className="text-gray-600 text-sm">
            Your TikTok videos and performance stats will appear here
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff6b35]/10 border border-[#ff6b35]/20 text-[#ff6b35] text-xs font-bold">
            Coming Soon
          </div>
        </div>

      </div>
    </div>
  )
}

function formatNumber(n?: number | null): string {
  if (n == null) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}