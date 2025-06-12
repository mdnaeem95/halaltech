/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get user email
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email || '')
        // If already verified, redirect
        if (user.email_confirmed_at) {
          router.push('/dashboard')
        }
      } else {
        router.push('/login')
      }
    })
  }, [router, supabase])

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleResendEmail = async () => {
    setResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (error) throw error

      toast.success('Verification email sent!')
      setCountdown(60) // 60 second cooldown
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend email')
    } finally {
      setResending(false)
    }
  }

  const handleChangeEmail = async () => {
    // Sign out and redirect to signup
    await supabase.auth.signOut()
    router.push('/signup')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-600">
              We&apos;ve sent a verification link to:
            </p>
            <p className="font-semibold text-gray-900 mt-1">{email}</p>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the verification link in the email</li>
                <li>You&apos;ll be redirected to your dashboard</li>
              </ol>
            </div>

            <button
              onClick={handleResendEmail}
              disabled={resending || countdown > 0}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {resending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                'Resend Verification Email'
              )}
            </button>

            <div className="text-center space-y-2">
              <button
                onClick={handleChangeEmail}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Wrong email? Change it
              </button>
              <div className="text-sm text-gray-500">
                <Link href="/" className="text-emerald-600 hover:text-emerald-700">
                  Return to homepage
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Didn&apos;t receive the email?
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Check your spam/junk folder</li>
            <li>• Make sure {email} is correct</li>
            <li>• Contact support if issue persists</li>
          </ul>
        </div>
      </div>
    </div>
  )
}