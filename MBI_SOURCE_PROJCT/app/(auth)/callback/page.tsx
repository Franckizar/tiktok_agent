'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { checkAuth } = useAuthStore()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const errorParam = searchParams.get('error')

    if (errorParam) {
      setError(decodeURIComponent(errorParam))
      setTimeout(() => {
        router.push('/login?error=' + encodeURIComponent(errorParam))
      }, 3000)
      return
    }

    const completeLogin = async () => {
      try {
        console.log('🔗 Completing TikTok login...')
        await checkAuth()
        console.log('✅ Auth verified, redirecting...')
        router.replace('/dashboard')
      } catch (err) {
        console.error('💥 Failed to complete login:', err)
        router.push('/login?error=login_failed')
      }
    }

    completeLogin()
  }, [])

  if (error) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">✗</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Authentication Failed</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="text-center p-8">
        <div className="relative mb-6">
          <Loader2
            className="w-16 h-16 animate-spin text-[#ff6b35] mx-auto"
            style={{ filter: 'drop-shadow(0 0 10px rgba(255,107,53,0.8))' }}
          />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Completing Login...</h2>
        <p className="text-gray-400">Please wait</p>
      </div>
    </div>
  )
}