/* eslint-disable  @typescript-eslint/no-explicit-any */
// src/app/auth/reset-password/page.tsx
'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Loader2, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { AuthService } from '@/services/auth.service'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasValidSession, setHasValidSession] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Check for welcome message (new freelancer account)
  const isWelcome = searchParams.get('type') === 'welcome'

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Checking session...')
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          toast.error('Session error. Please request a new password reset link.')
          router.push('/auth/forgot-password')
          return
        }

        if (!session) {
          console.log('No session found')
          toast.error('Invalid or expired reset link. Please request a new one.')
          router.push('/auth/forgot-password')
          return
        }

        console.log('Session found:', session.user?.email)
        setHasValidSession(true)
      } catch (error) {
        console.error('Error checking session:', error)
        toast.error('An error occurred. Please try again.')
        router.push('/auth/forgot-password')
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [router, supabase])

  const validatePasswords = useCallback(() => {
    const { isValid: strengthValid } = AuthService.validatePasswordStrength(password)
    const matchValid = password === confirmPassword
    setIsValid(strengthValid && matchValid && password.length > 0)
  }, [password, confirmPassword])

  useEffect(() => {
    validatePasswords()
  }, [validatePasswords])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValid || !hasValidSession) return

    setUpdating(true)
    try {
      console.log('Updating password...')
      
      // Update the user's password
      const { data, error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        console.error('Password update error:', error)
        throw error
      }

      console.log('Password updated successfully')
      toast.success('Password updated successfully!')
      
      // Redirect based on user type
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user?.id)
        .single()

      if (profile?.role === 'service_provider') {
        router.push('/freelancer/onboarding')
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Update error:', error)
      
      // Specific error handling
      if (error.message?.includes('Auth session missing')) {
        toast.error('Session expired. Please request a new password reset link.')
        router.push('/auth/forgot-password')
      } else {
        toast.error(error.message || 'Failed to update password')
      }
    } finally {
      setUpdating(false)
    }
  }

  const passwordStrength = AuthService.validatePasswordStrength(password)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!hasValidSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Invalid Reset Link
          </h2>
          <p className="text-gray-600">
            This password reset link is invalid or has expired.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isWelcome ? 'Welcome! Set Your Password' : 'Set New Password'}
            </h1>
            <p className="text-gray-600">
              {isWelcome 
                ? 'Create a secure password for your new account'
                : 'Choose a strong password for your account'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10"
                  placeholder="Enter new password"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Password strength:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.score >= 4 ? 'text-green-600' : 
                      passwordStrength.score >= 3 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {passwordStrength.score >= 4 ? 'Very Strong' : 
                       passwordStrength.score >= 3 ? 'Strong' : 
                       passwordStrength.score >= 2 ? 'Fair' : 'Weak'}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.score >= 4 ? 'bg-green-500' : 
                        passwordStrength.score >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="mt-1 text-xs text-gray-600">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Confirm new password"
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isValid || updating}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {updating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {isWelcome ? 'Set Password & Continue' : 'Update Password'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Having trouble? <a href="/auth/forgot-password" className="text-emerald-600 hover:text-emerald-700">Request a new link</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}