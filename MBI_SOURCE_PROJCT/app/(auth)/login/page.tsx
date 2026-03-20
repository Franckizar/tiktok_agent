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
// import { authApi } from '@/lib/api/auth'

export default function LoginPage() {
  const router = useRouter()
  const { checkAuth } = useAuthStore()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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

      // ✅ Fetch fresh user from API to get correct role
      await checkAuth()

      // ✅ Get updated user from store and redirect correctly
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

          {/* Social Icons */}
          <div className="flex justify-center gap-2 mb-4">
            {[
              { name: 'facebook', icon: 'facebook' },
              { name: 'google', icon: 'google' },
              { name: 'discord', icon: 'discord' }
            ].map((social) => (
              <button
                key={social.name}
                className="relative group w-9 h-9 rounded-full bg-[#1a1a24] border border-[#ff6b35]/20 flex items-center justify-center transition-all hover:border-[#ff6b35] hover:scale-110"
              >
                <div className="absolute inset-0 rounded-full bg-[#ff6b35] opacity-0 group-hover:opacity-20 blur-md transition-opacity"></div>
                <img src={`/icons/${social.icon}.svg`} alt={social.name} className="w-4 h-4 opacity-70 group-hover:opacity-100" />
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#ff6b35]/20"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#0a0a0f]/80 text-gray-400">or login with email</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-500/10 border-red-500/30 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

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
              disabled={isLoading}
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