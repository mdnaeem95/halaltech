/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from './useAuth'
import { ForgotPasswordFormData, LoginForm, SignupFormData } from '@/types/auth'


export const useAuthModal = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, signUp, sendPasswordReset } = useAuth() // Use your existing auth methods

  const login = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      // Just call your existing signIn method - let AuthProvider handle the rest
      await signIn(data.email, data.password)
      
      // Don't do redirects here - your AuthProvider already handles this in onAuthStateChange
      toast.success('Welcome back!')
      return true
    } catch (error: any) {
      // Enhanced error messages
      const errorMessages: Record<string, string> = {
        'Invalid login credentials': 'Invalid email or password. Please try again.',
        'User not found': 'No account found with this email. Please sign up.',
        'Too many requests': 'Too many login attempts. Please try again later.',
        'Email not confirmed': 'Please check your email to confirm your account'
      }
      
      const message = errorMessages[error.message] || error.message || 'Failed to login'
      toast.error(message)
      
      if (error.message.includes('Email not confirmed')) {
        await resendConfirmationEmail(data.email)
      }
      
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (data: SignupFormData) => {
    setIsLoading(true)
    try {
      // Just call your existing signUp method
      await signUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        companyName: data.companyName,
        phone: data.phone,
      })

      toast.success(
        <div>
          <p className="font-semibold">Account created successfully!</p>
          <p className="text-sm mt-1">Please check your email to verify your account.</p>
        </div>,
        { duration: 6000 }
      )
      
      // Analytics tracking
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'sign_up', { method: 'email' })
      }

      return { success: true }
    } catch (error: any) {
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        toast.error('An account with this email already exists. Please login.')
        return { success: false, switchToLogin: true, email: data.email }
      }
      
      toast.error(error.message || 'Failed to create account')
      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }

  const forgotPassword = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    try {
      // Just call your existing sendPasswordReset method
      await sendPasswordReset(data.email)
      toast.success('Password reset link sent! Check your email.')
      return true
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const resendConfirmationEmail = async (email: string) => {
    try {
      // Direct supabase call for resend (you might want to add this to your AuthProvider)
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })
      if (!error) {
        toast.success('Confirmation email resent!')
      }
    } catch (error) {
      console.error('Failed to resend confirmation:', error)
    }
  }

  return {
    login,
    signup,
    forgotPassword,
    isLoading,
  }
}