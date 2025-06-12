/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeft } from 'lucide-react'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { AuthMode } from '@/types/auth'
import { useAuthModal } from '@/hooks/useAuthModal'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'


interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: AuthMode
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const user = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(defaultMode)
  const { login, signup, forgotPassword, isLoading } = useAuthModal()

  const justLoggedIn = useRef(false)

  useEffect(() => {
    if (user && isOpen && justLoggedIn.current) {
      // User is now authenticated, close modal and redirect
      justLoggedIn.current = false
      onClose()
      
      const redirectTo = searchParams.get('redirectTo') || '/dashboard'
      router.push(redirectTo)
      router.refresh()
    }
  }, [user, isOpen, onClose, router, searchParams])

  const handleLoginSuccess = async (data: any) => {
    justLoggedIn.current = true
    const success = await login(data)
    if (!success) {
      justLoggedIn.current = false
    }
    if (success) onClose()
    return success
  }

  const handleSignupResult = async (data: any) => {
    const result = await signup(data)
    if (result.success) {
      onClose()
    } else if (result.switchToLogin) {
      setMode('login')
      // Could pre-fill email here if needed
    }
    return result
  }

  const handleForgotPasswordSuccess = async (data: any) => {
    const success = await forgotPassword(data)
    if (success) setMode('login')
    return success
  }

  if (!isOpen) return null

  const titles = {
    login: 'Welcome Back',
    signup: 'Create Your Account',
    forgot: 'Reset Password'
  }

  const descriptions = {
    login: 'Enter your credentials to access your dashboard',
    signup: 'Join TechHalal to grow your business',
    forgot: "We'll send you a link to reset your password"
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="mb-6">
            {mode === 'forgot' && (
              <button
                onClick={() => setMode('login')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to login
              </button>
            )}
            
            <h2 className="text-2xl font-bold text-gray-900">
              {titles[mode]}
            </h2>
            <p className="text-gray-600 mt-2">
              {descriptions[mode]}
            </p>
          </div>

          {mode === 'login' && (
            <LoginForm
              onSubmit={handleLoginSuccess}
              onForgotPassword={() => setMode('forgot')}
              isLoading={isLoading}
            />
          )}

          {mode === 'signup' && (
            <SignupForm
              onSubmit={handleSignupResult}
              isLoading={isLoading}
            />
          )}

          {mode === 'forgot' && (
            <ForgotPasswordForm
              onSubmit={handleForgotPasswordSuccess}
              isLoading={isLoading}
            />
          )}

          {mode !== 'forgot' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}