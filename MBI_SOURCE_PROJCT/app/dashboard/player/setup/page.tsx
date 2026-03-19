'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap, User, Globe, Monitor, Gamepad2, Trophy, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store/auth'

const setupSchema = z.object({
  nickname: z.string().min(3, 'Nickname must be at least 3 characters').max(20, 'Nickname too long'),
  country: z.string().min(2, 'Country is required'),
  platform: z.enum(['PC', 'PlayStation', 'Xbox', 'Mobile'], { required_error: 'Platform is required' }),
  mainGame: z.string().min(2, 'Main game is required'),
  skillLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO'], { required_error: 'Skill level is required' }),
  discordUsername: z.string().optional(),
  bio: z.string().max(200, 'Bio too long').optional(),
})

type SetupFormData = z.infer<typeof setupSchema>

export default function PlayerSetupPage() {
  const { user, setUser } = useAuthStore()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
  })

  const onSubmit = async (data: SetupFormData) => {
    setIsLoading(true)
    setError('')

    try {
      await api.post('/v1/player/profile', data)

      // Update store to mark profile as complete
      if (user) {
        setUser({ ...user, hasPlayerProfile: true })
      }

      window.location.href = '/dashboard/player'

    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to save profile. Please try again.'
      )
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#0a0a0f]">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60"></div>
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{ backgroundImage: `url('/textures/texture.jpg')`, backgroundRepeat: 'repeat', backgroundSize: '200px 200px' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at center, rgba(255,107,53,0.15) 0%, rgba(0,0,0,0.9) 70%)' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#ff6b35] via-[#ff0000] to-[#ff6b35] rounded-2xl opacity-20 blur-xl"></div>

        <div className="relative bg-[#0a0a0f]/80 backdrop-blur-xl border border-[#ff6b35]/30 rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex mb-4">
              <div className="relative">
                <Gamepad2 className="w-10 h-10 text-[#ff6b35]"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(255,107,53,0.8))' }}
                />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
              SET UP YOUR
              <span className="text-[#ff6b35] ml-2"
                style={{ textShadow: '0 0 20px rgba(255,107,53,0.5)' }}
              >PROFILE</span>
            </h1>
            <p className="text-gray-400 text-sm">
              Welcome <span className="text-[#ff6b35] font-semibold">{user?.firstname}</span>! Complete your player profile to enter the arena.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/30 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Nickname */}
            <div className="relative group">
              <label className="text-xs text-gray-400 mb-1 block">Nickname <span className="text-[#ff6b35]">*</span></label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#ff6b35] transition-colors" />
                <input
                  type="text"
                  placeholder="Your unique in-game name"
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1a24]/50 border border-[#ff6b35]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35]/30 transition-all"
                  {...register('nickname')}
                  disabled={isLoading}
                />
              </div>
              {errors.nickname && <p className="mt-1 text-xs text-[#ff6b35]">{errors.nickname.message}</p>}
            </div>

            {/* Country */}
            <div className="relative group">
              <label className="text-xs text-gray-400 mb-1 block">Country <span className="text-[#ff6b35]">*</span></label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#ff6b35] transition-colors" />
                <input
                  type="text"
                  placeholder="Your country"
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1a24]/50 border border-[#ff6b35]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35]/30 transition-all"
                  {...register('country')}
                  disabled={isLoading}
                />
              </div>
              {errors.country && <p className="mt-1 text-xs text-[#ff6b35]">{errors.country.message}</p>}
            </div>

            {/* Platform */}
            <div className="relative group">
              <label className="text-xs text-gray-400 mb-1 block">Platform <span className="text-[#ff6b35]">*</span></label>
              <div className="relative">
                <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <select
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1a24]/50 border border-[#ff6b35]/20 rounded-xl text-white focus:outline-none focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35]/30 transition-all appearance-none"
                  {...register('platform')}
                  disabled={isLoading}
                >
                  <option value="" className="bg-[#1a1a24]">Select platform</option>
                  <option value="PC" className="bg-[#1a1a24]">PC</option>
                  <option value="PlayStation" className="bg-[#1a1a24]">PlayStation</option>
                  <option value="Xbox" className="bg-[#1a1a24]">Xbox</option>
                  <option value="Mobile" className="bg-[#1a1a24]">Mobile</option>
                </select>
              </div>
              {errors.platform && <p className="mt-1 text-xs text-[#ff6b35]">{errors.platform.message}</p>}
            </div>

            {/* Main Game */}
            <div className="relative group">
              <label className="text-xs text-gray-400 mb-1 block">Main Game <span className="text-[#ff6b35]">*</span></label>
              <div className="relative">
                <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#ff6b35] transition-colors" />
                <input
                  type="text"
                  placeholder="e.g. Valorant, FIFA, Fortnite"
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1a24]/50 border border-[#ff6b35]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35]/30 transition-all"
                  {...register('mainGame')}
                  disabled={isLoading}
                />
              </div>
              {errors.mainGame && <p className="mt-1 text-xs text-[#ff6b35]">{errors.mainGame.message}</p>}
            </div>

            {/* Skill Level */}
            <div className="relative group">
              <label className="text-xs text-gray-400 mb-1 block">Skill Level <span className="text-[#ff6b35]">*</span></label>
              <div className="relative">
                <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <select
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1a24]/50 border border-[#ff6b35]/20 rounded-xl text-white focus:outline-none focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35]/30 transition-all appearance-none"
                  {...register('skillLevel')}
                  disabled={isLoading}
                >
                  <option value="" className="bg-[#1a1a24]">Select skill level</option>
                  <option value="BEGINNER" className="bg-[#1a1a24]">🌱 Beginner</option>
                  <option value="INTERMEDIATE" className="bg-[#1a1a24]">⚡ Intermediate</option>
                  <option value="ADVANCED" className="bg-[#1a1a24]">🔥 Advanced</option>
                  <option value="PRO" className="bg-[#1a1a24]">👑 Pro</option>
                </select>
              </div>
              {errors.skillLevel && <p className="mt-1 text-xs text-[#ff6b35]">{errors.skillLevel.message}</p>}
            </div>

            {/* Discord - Optional */}
            <div className="relative group">
              <label className="text-xs text-gray-400 mb-1 block">Discord Username <span className="text-gray-600">(optional)</span></label>
              <input
                type="text"
                placeholder="e.g. player#1234"
                className="w-full px-4 py-3 bg-[#1a1a24]/50 border border-[#ff6b35]/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#ff6b35]/50 focus:ring-1 focus:ring-[#ff6b35]/20 transition-all"
                {...register('discordUsername')}
                disabled={isLoading}
              />
            </div>

            {/* Bio - Optional */}
            <div className="relative group">
              <label className="text-xs text-gray-400 mb-1 block">Bio <span className="text-gray-600">(optional)</span></label>
              <textarea
                placeholder="Tell the arena about yourself..."
                rows={3}
                className="w-full px-4 py-3 bg-[#1a1a24]/50 border border-[#ff6b35]/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#ff6b35]/50 focus:ring-1 focus:ring-[#ff6b35]/20 transition-all resize-none"
                {...register('bio')}
                disabled={isLoading}
              />
              {errors.bio && <p className="mt-1 text-xs text-[#ff6b35]">{errors.bio.message}</p>}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="relative w-full py-3 mt-2 bg-gradient-to-r from-[#ff6b35] to-[#ff0000] text-white font-bold rounded-xl overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    SAVING PROFILE...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    ENTER THE ARENA
                    <Zap className="w-4 h-4" />
                  </>
                )}
              </span>
            </Button>
          </form>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-px bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent opacity-50"></div>
        </div>
      </div>
    </div>
  )
}