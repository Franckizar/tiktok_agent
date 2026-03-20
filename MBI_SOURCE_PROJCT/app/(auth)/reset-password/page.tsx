// app/(auth)/reset-password/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle, Lock, Zap, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authApi } from '@/lib/api/auth'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/auth'

// ========================================
// Background component — reused
// ========================================
function Background() {
  return (
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-black/60"></div>
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: `url('/textures/texture.jpg')`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,107,53,0.15) 0%, rgba(0,0,0,0.9) 70%)'
        }}
      />
    </div>
  )
}

// ========================================
// Inner component — uses useSearchParams
// ========================================
function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    setMounted(true)
    const tokenParam = searchParams.get('token')
    setToken(tokenParam)
    if (!tokenParam) {
      setError('Invalid or missing reset token')
    }
  }, [searchParams])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return
    setIsLoading(true)
    setError('')
    setSuccess('')
    try {
      await authApi.resetPassword(token, data.password)
      setSuccess('Password reset successfully! Redirecting to login...')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password reset failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <Background />
        <div
          className="relative z-10 w-10 h-10 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin"
          style={{ boxShadow: '0 0 20px rgba(255,107,53,0.5)' }}
        />
      </div>
    )
  }

  if (!token) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#0a0a0f]">
        <Background />
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-[#ff6b35]/30 rounded-2xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-[#ff6b35] mx-auto mb-4" />
            <h2 className="text-xl font-black text-white mb-2">INVALID LINK</h2>
            <p className="text-gray-400 text-sm mb-6">
              This reset link is invalid or has expired.
            </p>
            <Button
              onClick={() => router.push('/forgot-password')}
              className="w-full py-2 bg-gradient-to-r from-[#ff6b35] to-[#ff0000] text-white font-bold rounded-xl"
            >
              REQUEST NEW LINK
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#0a0a0f]">
      <Background />

      <div className="relative z-10 w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#ff6b35] via-[#ff0000] to-[#ff6b35] rounded-2xl opacity-20 blur-xl"></div>

        <div className="relative bg-[#0a0a0f]/80 backdrop-blur-xl border border-[#ff6b35]/30 rounded-2xl p-8 shadow-2xl">

          {/* Header */}
          <div className="text-center mb-6">
            <button
              onClick={() => router.push('/login')}
              className="absolute left-4 top-4 text-gray-400 hover:text-[#ff6b35] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="inline-flex mb-3">
              <div className="relative">
                <Lock
                  className="w-8 h-8 text-[#ff6b35]"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(255,107,53,0.8))' }}
                />
                <div className="absolute inset-0 blur-lg bg-[#ff6b35]/30 rounded-full"></div>
              </div>
            </div>
            <h1 className="text-3xl font-black text-white mb-1 tracking-tight">
              RESET
              <span
                className="text-[#ff6b35] ml-2"
                style={{ textShadow: '0 0 20px rgba(255,107,53,0.5)' }}
              >PASSWORD</span>
            </h1>
            <p className="text-gray-400 text-xs">Enter your new password below</p>
          </div>

          {/* Messages */}
          {success && (
            <Alert className="mb-4 bg-green-500/10 border-green-500/30 text-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-500/10 border-red-500/30 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 group-focus-within:text-[#ff6b35] transition-colors" />
              <Input
                type="password"
                placeholder="New Password (min 6 characters)"
                className="w-full pl-8 pr-3 py-2.5 text-sm bg-[#1a1a24]/50 border border-[#ff6b35]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35]/30 transition-all"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-[#ff6b35]">{errors.password.message}</p>
              )}
            </div>

            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 group-focus-within:text-[#ff6b35] transition-colors" />
              <Input
                type="password"
                placeholder="Confirm New Password"
                className="w-full pl-8 pr-3 py-2.5 text-sm bg-[#1a1a24]/50 border border-[#ff6b35]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35]/30 transition-all"
                {...register('confirmPassword')}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-[#ff6b35]">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="relative w-full py-2.5 mt-2 bg-gradient-to-r from-[#ff6b35] to-[#ff0000] text-white font-bold rounded-xl overflow-hidden group text-sm"
            >
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    RESETTING...
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3" />
                    RESET PASSWORD
                    <Zap className="w-3 h-3" />
                  </>
                )}
              </span>
            </Button>
          </form>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent opacity-50"></div>
        </div>
      </div>
    </div>
  )
}

// ========================================
// Default export — wraps in Suspense
// ========================================
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div
          className="w-10 h-10 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin"
          style={{ boxShadow: '0 0 20px rgba(255,107,53,0.5)' }}
        />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}