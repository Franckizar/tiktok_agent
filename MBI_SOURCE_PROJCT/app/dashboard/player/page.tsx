'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/auth'
import { api } from '@/lib/api'
import { Zap, Trophy, Gamepad2, Target, Star, TrendingUp, User, Globe, Monitor, Settings } from 'lucide-react'
import { Loader2 } from 'lucide-react'

interface PlayerProfile {
  id: number
  nickname: string
  country: string
  platform: string
  mainGame: string
  skillLevel: string
  discordUsername?: string
  bio?: string
  totalGamesPlayed: number
  wins: number
  losses: number
  points: number
  logoPath?: string
}

export default function PlayerDashboard() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/v1/player/profile/me')
        setProfile(response.data)
      } catch (err) {
        console.error('Failed to fetch player profile', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const skillColors: Record<string, string> = {
    BEGINNER: 'text-green-400 border-green-400/30 bg-green-400/10',
    INTERMEDIATE: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    ADVANCED: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    PRO: 'text-[#ff6b35] border-[#ff6b35]/30 bg-[#ff6b35]/10',
  }

  const skillEmojis: Record<string, string> = {
    BEGINNER: '🌱',
    INTERMEDIATE: '⚡',
    ADVANCED: '🔥',
    PRO: '👑',
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      {/* Background texture */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-10 mix-blend-overlay"
          style={{ backgroundImage: `url('/textures/texture.jpg')`, backgroundRepeat: 'repeat', backgroundSize: '200px 200px' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at top right, rgba(255,107,53,0.08) 0%, transparent 60%)' }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              PLAYER
              <span className="text-[#ff6b35] ml-2"
                style={{ textShadow: '0 0 20px rgba(255,107,53,0.5)' }}
              >DASHBOARD</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Welcome back, <span className="text-[#ff6b35] font-semibold">{profile?.nickname || user?.firstname}</span>
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/dashboard/player/settings'}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a24] border border-[#ff6b35]/20 rounded-xl text-gray-400 hover:text-[#ff6b35] hover:border-[#ff6b35]/50 transition-all text-sm"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>

        {/* Profile Card */}
        <div className="relative mb-6">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ff6b35]/30 to-transparent rounded-2xl blur-sm"></div>
          <div className="relative bg-[#0d0d14] border border-[#ff6b35]/20 rounded-2xl p-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl border-2 border-[#ff6b35]/50 overflow-hidden bg-[#1a1a24]">
                  {profile?.logoPath ? (
                    <img src={`http://localhost:8088${profile.logoPath}`} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-[#ff6b35]" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#0d0d14]"></div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-black text-white">{profile?.nickname}</h2>
                  {profile?.skillLevel && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${skillColors[profile.skillLevel]}`}>
                      {skillEmojis[profile.skillLevel]} {profile.skillLevel}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" /> {profile?.country}
                  </span>
                  <span className="flex items-center gap-1">
                    <Monitor className="w-3 h-3" /> {profile?.platform}
                  </span>
                  <span className="flex items-center gap-1">
                    <Gamepad2 className="w-3 h-3" /> {profile?.mainGame}
                  </span>
                </div>
                {profile?.bio && (
                  <p className="text-gray-500 text-sm mt-2">{profile.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Games', value: profile?.totalGamesPlayed ?? 0, icon: Gamepad2, color: 'text-blue-400' },
            { label: 'Wins', value: profile?.wins ?? 0, icon: Trophy, color: 'text-green-400' },
            { label: 'Losses', value: profile?.losses ?? 0, icon: Target, color: 'text-red-400' },
            { label: 'Points', value: profile?.points ?? 0, icon: Star, color: 'text-[#ff6b35]' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0d0d14] border border-[#ff6b35]/10 rounded-2xl p-5 hover:border-[#ff6b35]/30 transition-all">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <TrendingUp className="w-3 h-3 text-gray-600" />
              </div>
              <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Win Rate Bar */}
        {profile && profile.totalGamesPlayed > 0 && (
          <div className="bg-[#0d0d14] border border-[#ff6b35]/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-300">Win Rate</span>
              <span className="text-[#ff6b35] font-bold text-lg">
                {Math.round((profile.wins / profile.totalGamesPlayed) * 100)}%
              </span>
            </div>
            <div className="w-full bg-[#1a1a24] rounded-full h-3">
              <div
                className="bg-gradient-to-r from-[#ff6b35] to-[#ff0000] h-3 rounded-full transition-all"
                style={{ width: `${Math.round((profile.wins / profile.totalGamesPlayed) * 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Empty state when no games */}
        {profile && profile.totalGamesPlayed === 0 && (
          <div className="bg-[#0d0d14] border border-[#ff6b35]/10 rounded-2xl p-12 text-center">
            <Gamepad2 className="w-16 h-16 text-[#ff6b35]/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No Games Yet</h3>
            <p className="text-gray-600 text-sm">Start playing to see your stats here</p>
          </div>
        )}
      </div>
    </div>
  )
}