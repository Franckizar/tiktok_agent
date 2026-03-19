// app/(auth)/verify-email/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Loader2, AlertCircle, CheckCircle, Zap, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { authApi } from '@/lib/api/auth'
import { verificationSchema, type VerificationFormData } from '@/lib/validations/auth'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [canResend, setCanResend] = useState(true)
  const [countdown, setCountdown] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      email: email,
    },
  })

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const onSubmit = async (data: VerificationFormData) => {
    setIsLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await authApi.verifyEmail(data)
      setSuccess(response.data.message || 'Email verified successfully!')
      
      setTimeout(() => {
        router.push('/login')
      }, 2000)
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.error 
        || err.response?.data?.message 
        || 'Verification failed. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!canResend) return
    
    setIsResending(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await authApi.resendVerificationCode({ email })
      setSuccess(response.data.message || 'Verification code sent! Check your email.')
      setCanResend(false)
      setCountdown(60)
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.error 
        || err.response?.data?.message 
        || 'Failed to resend code. Please try again.'
      setError(errorMessage)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#0a0a0f]">
      {/* Background */}
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
          className="absolute inset-0 opacity-20 mix-blend-soft-light"
          style={{
            backgroundImage: `url('/textures/texture1.jpg')`,
            backgroundRepeat: 'repeat',
            backgroundSize: '300px 300px',
          }}
        />
        <div 
          className="absolute inset-0" 
          style={{
            background: 'radial-gradient(circle at center, rgba(255,107,53,0.15) 0%, rgba(0,0,0,0.9) 70%)'
          }}
        />
      </div>

      {/* Verify Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#ff6b35] via-[#ff0000] to-[#ff6b35] rounded-2xl opacity-20 blur-xl"></div>
        
        <div className="relative bg-[#0a0a0f]/80 backdrop-blur-xl border border-[#ff6b35]/30 rounded-2xl p-8 shadow-2xl">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex mb-3">
              <div className="relative">
                <Mail className="w-10 h-10 text-[#ff6b35]" 
                  style={{ filter: 'drop-shadow(0 0 10px rgba(255,107,53,0.8))' }}
                />
                <div className="absolute inset-0 blur-lg bg-[#ff6b35]/30 rounded-full"></div>
              </div>
            </div>
            <h1 className="text-3xl font-black text-white mb-1 tracking-tight">
              VERIFY 
              <span className="text-[#ff6b35] ml-2" 
                style={{ textShadow: '0 0 20px rgba(255,107,53,0.5)' }}
              >EMAIL</span>
            </h1>
            <p className="text-gray-400 text-xs">
              We&apos;ve sent a 6-digit code to<br />
              <span className="text-[#ff6b35] font-bold">{email}</span>
            </p>
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
            <input type="hidden" {...register('email')} />

            {/* Code Input */}
            <div className="relative group">
              <input
                type="text"
                placeholder="• • • • • •"
                maxLength={6}
                className="w-full px-4 py-3 text-xl tracking-[8px] text-center font-mono bg-[#1a1a24]/50 border border-[#ff6b35]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35]/30 transition-all"
                {...register('code')}
                autoComplete="off"
                autoFocus
                disabled={isLoading}
              />
              {errors.code && (
                <p className="mt-1 text-xs text-[#ff6b35] text-center">{errors.code.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="relative w-full py-2.5 bg-gradient-to-r from-[#ff6b35] to-[#ff0000] text-white font-bold rounded-xl overflow-hidden group text-sm"
            >
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    VERIFYING...
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3" />
                    VERIFY EMAIL
                    <Zap className="w-3 h-3" />
                  </>
                )}
              </span>
            </Button>
          </form>

          {/* Resend Section */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400 mb-2">Didn&apos;t receive the code?</p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={!canResend || isResending}
              className="text-[#ff6b35] text-sm font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 mx-auto"
            >
              <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
              {isResending ? 'SENDING...' : canResend ? 'RESEND CODE' : `RESEND IN ${countdown}S`}
            </button>
          </div>

          {/* Tips */}
          <div className="mt-6 text-xs text-gray-500 text-center space-y-1">
            <p className="flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-[#ff6b35]" /> Code expires in 15 minutes
            </p>
            <p className="flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-[#ff6b35]" /> 5 attempts remaining
            </p>
          </div>

          {/* Bottom accent */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent opacity-50"></div>
        </div>
      </div>
    </div>
  )
}