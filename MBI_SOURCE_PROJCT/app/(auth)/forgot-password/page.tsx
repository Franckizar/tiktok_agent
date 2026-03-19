'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authApi } from '@/lib/api/auth'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth'
import styles from '../login/login.module.scss'

export default function ForgotPasswordPage() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      await authApi.forgotPassword(data)
      setSuccess(true)
      reset()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className={styles.main}>
        <div className={styles.container}>
          <div className={styles.form}>
            <div className="h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <h2 className={styles.title}>Reset Password</h2>
          
          {error && (
            <Alert variant="destructive" className={styles.alert}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200 mb-4">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Password reset link sent to your email. Check your inbox.
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className={styles.input}
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && <p className={styles.error}>{errors.email.message}</p>}
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || success} 
            className={styles.button}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <div className={styles.footer}>
            <Link href="/login" className={styles.signupLink}>
              <ArrowLeft className="mr-2 h-4 w-4 inline" />
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}