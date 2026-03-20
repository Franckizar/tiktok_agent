'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LogIn, Loader2, AlertCircle, Zap, Mail, Lock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { authApi } from '@/lib/api/auth'
import { useAuthStore, getDashboardPath } from '@/lib/store/auth'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'

export default function LoginPage() {
  const router = useRouter()
  const { checkAuth } = useAuthStore()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTikTokLoading, setIsTikTokLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError('')
    try {
      await authApi.login(data)
      await checkAuth()
      const { user } = useAuthStore.getState()
      if (user) {
        router.replace(getDashboardPath(user))
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Invalid email or password.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

const handleTikTokLogin = async () => {
  setIsTikTokLoading(true)
  setError('')
  try {
    const response = await authApi.loginWithTikTok()
    console.log('Full response:', response)
    console.log('Response data:', response.data)
    console.log('Auth URL:', response.data?.authUrl)

    const authUrl = response.data?.authUrl
    if (!authUrl) {
      throw new Error(`No authUrl in response: ${JSON.stringify(response.data)}`)
    }
    window.location.href = authUrl
  } catch (err: any) {
    console.error('TikTok error:', err)
    setError(err.message || 'Failed to initiate TikTok login.')
    setIsTikTokLoading(false)
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
          className="absolute inset-0 opacity-20 mix-blend-soft-light"
          style={{ backgroundImage: `url('/textures/texture1.jpg')`, backgroundRepeat: 'repeat', backgroundSize: '300px 300px' }}
        />
        <div
          className="absolute inset-0 opacity-15 mix-blend-multiply"
          style={{ backgroundImage: `url('/textures/texture2.jpg')`, backgroundRepeat: 'repeat', backgroundSize: '150px 150px' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at center, rgba(255,107,53,0.15) 0%, rgba(0,0,0,0.9) 70%)' }}
        />
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent opacity-20"></div>
        <div className="absolute bottom-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent opacity-20"></div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#ff6b35] via-[#ff0000] to-[#ff6b35] rounded-2xl opacity-20 blur-xl"></div>

        <div className="relative bg-[#0a0a0f]/80 backdrop-blur-xl border border-[#ff6b35]/30 rounded-2xl p-8 shadow-2xl">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex mb-3">
              <div className="relative">
                <LogIn className="w-8 h-8 text-[#ff6b35]"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(255,107,53,0.8))' }}
                />
                <div className="absolute inset-0 blur-lg bg-[#ff6b35]/30 rounded-full"></div>
              </div>
            </div>
            <h1 className="text-3xl font-black text-white mb-1 tracking-tight">
              WELCOME
              <span className="text-[#ff6b35] ml-2"
                style={{ textShadow: '0 0 20px rgba(255,107,53,0.5)' }}
              >BACK</span>
            </h1>
            <p className="text-gray-400 text-xs">Enter the arena and continue your journey</p>
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-500/10 border-red-500/30 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* TikTok Login Button */}
          <button
            type="button"
            onClick={handleTikTokLogin}
            disabled={isTikTokLoading || isLoading}
            className="relative w-full group py-2.5 bg-[#1a1a24] border border-[#ff6b35]/20 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 hover:border-[#ff6b35] transition-all mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 rounded-xl bg-[#ff6b35] opacity-0 group-hover:opacity-10 transition-opacity"></div>
            {isTikTokLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
              </svg>
            )}
            {isTikTokLoading ? 'Connecting to TikTok...' : 'Continue with TikTok'}
          </button>

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#ff6b35]/20"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#0a0a0f]/80 text-gray-400">or login with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

            {/* Email */}
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 group-focus-within:text-[#ff6b35] transition-colors" />
              <input
                type="email"
                placeholder="Email address"
                className="w-full pl-8 pr-3 py-2.5 text-sm bg-[#1a1a24]/50 border border-[#ff6b35]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35]/30 transition-all"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && <p className="mt-1 text-xs text-[#ff6b35]">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 group-focus-within:text-[#ff6b35] transition-colors" />
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-8 pr-3 py-2.5 text-sm bg-[#1a1a24]/50 border border-[#ff6b35]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35]/30 transition-all"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && <p className="mt-1 text-xs text-[#ff6b35]">{errors.password.message}</p>}
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-[#ff6b35] hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading || isTikTokLoading}
              className="relative w-full py-2.5 mt-2 bg-gradient-to-r from-[#ff6b35] to-[#ff0000] text-white font-bold rounded-xl overflow-hidden group text-sm"
            >
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    SIGNING IN...
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3" />
                    SIGN IN
                    <Zap className="w-3 h-3" />
                  </>
                )}
              </span>
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-4 text-center text-xs">
            <span className="text-gray-400">Don&apos;t have an account?</span>{' '}
            <Link href="/register" className="text-[#ff6b35] font-semibold hover:underline">
              Sign up
            </Link>
          </div>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent opacity-50"></div>
        </div>
      </div>
    </div>
  )
}