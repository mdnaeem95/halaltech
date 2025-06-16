/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      })

      if (error) {
        throw error
      }

      setSubmitted(true)
      toast.success('Password reset link sent!')
    } catch (error: any) {
      console.error('Password reset error:', error)
      
      // Handle specific errors
      if (error.message?.includes('rate limit')) {
        toast.error('Too many requests. Please try again later.')
      } else if (error.message?.includes('not found')) {
        toast.error('No account found with this email address.')
      } else {
        toast.error(error.message || 'Failed to send reset link')
      }
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-xl shadow-lg p-8"
        >
          <div className="text-center">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-6">
              We&apos;ve sent a password reset link to <strong>{email}</strong>
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Next steps:</h3>
              <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the password reset link in the email</li>
                <li>Create your new password</li>
              </ol>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setSubmitted(false)
                  setEmail('')
                }}
                className="w-full text-gray-600 hover:text-gray-800 text-sm"
              >
                Didn&apos;t receive the email? Try again
              </button>
              
              <Link
                href="/"
                className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Forgot Your Password?
            </h1>
            <p className="text-gray-600">
              No worries! Enter your email and we&apos;ll send you reset instructions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}