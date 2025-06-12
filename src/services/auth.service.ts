/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/client'
import { AuthError, User } from '@supabase/supabase-js'

export interface AuthResponse<T = any> {
  data?: T
  error?: AuthError | Error
}

export interface SignUpData {
  email: string
  password: string
  fullName: string
  companyName?: string
  phone?: string
}

export interface ProfileData {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  phone: string | null
  role: 'client' | 'admin' | 'service_provider'
  is_verified: boolean
  created_at: string
  updated_at: string
}

class AuthService {
  private supabase = createClient()

  /**
   * Sign up a new user
   */
  async signUp(data: SignUpData): Promise<AuthResponse<User>> {
    try {
      // Check if email already exists
      const { data: existingProfile } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email)
        .single()

      if (existingProfile) {
        return {
          error: new Error('An account with this email already exists'),
        }
      }

      // Create auth user
      const { data: authData, error } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            company_name: data.companyName,
            phone: data.phone,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      // Log signup event
      this.logAuthEvent('signup', { email: data.email })

      return { data: authData.user! }
    } catch (error) {
      console.error('SignUp error:', error)
      return { error: error as AuthError }
    }
  }

  /**
   * Sign in an existing user
   */
  async signIn(email: string, password: string): Promise<AuthResponse<User>> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Log signin event
      this.logAuthEvent('signin', { email })

      return { data: data.user }
    } catch (error) {
      console.error('SignIn error:', error)
      return { error: error as AuthError }
    }
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithProvider(provider: 'google' | 'github') {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      return { data }
    } catch (error) {
      console.error(`${provider} auth error:`, error)
      return { error: error as AuthError }
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<AuthResponse<void>> {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) throw error

      // Clear any cached data
      this.clearCache()

      return { data: undefined }
    } catch (error) {
      console.error('SignOut error:', error)
      return { error: error as AuthError }
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string): Promise<AuthResponse<void>> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      // Log password reset event
      this.logAuthEvent('password_reset_requested', { email })

      return { data: undefined }
    } catch (error) {
      console.error('Password reset error:', error)
      return { error: error as AuthError }
    }
  }

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<AuthResponse<User>> {
    try {
      const { data, error } = await this.supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      // Log password update event
      this.logAuthEvent('password_updated', { userId: data.user?.id })

      return { data: data.user }
    } catch (error) {
      console.error('Update password error:', error)
      return { error: error as AuthError }
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<AuthResponse<void>> {
    try {
      const { error } = await this.supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (error) throw error

      return { data: undefined }
    } catch (error) {
      console.error('Resend verification error:', error)
      return { error: error as AuthError }
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string): Promise<AuthResponse<ProfileData>> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      return { data }
    } catch (error) {
      console.error('Get profile error:', error)
      return { error: error as Error }
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<ProfileData>
  ): Promise<AuthResponse<ProfileData>> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return { data }
    } catch (error) {
      console.error('Update profile error:', error)
      return { error: error as Error }
    }
  }

  /**
   * Check if user session is valid
   */
  async checkSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession()
      
      if (error) throw error
      
      return { 
        isValid: !!session,
        session,
        expiresAt: session?.expires_at,
      }
    } catch (error) {
      console.error('Session check error:', error)
      return { isValid: false, session: null }
    }
  }

  /**
   * Refresh auth token
   */
  async refreshToken() {
    try {
      const { data, error } = await this.supabase.auth.refreshSession()
      
      if (error) throw error
      
      return { data }
    } catch (error) {
      console.error('Token refresh error:', error)
      return { error: error as AuthError }
    }
  }

  /**
   * Log auth events for analytics
   */
  private logAuthEvent(event: string, data?: any) {
    // Implement your analytics here
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, data)
    }
    
    // Or use your preferred analytics service
    console.log('Auth event:', event, data)
  }

  /**
   * Clear cached data
   */
  private clearCache() {
    // Clear any app-specific cache
    if (typeof window !== 'undefined') {
      // Clear specific localStorage items if needed
      localStorage.removeItem('app_cache')
    }
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean
    score: number
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0

    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters')
    } else {
      score++
    }

    if (password.length >= 12) score++

    if (!/[a-z]/.test(password)) {
      feedback.push('Include lowercase letters')
    } else if (!/[A-Z]/.test(password)) {
      feedback.push('Include uppercase letters')
    } else {
      score++
    }

    if (!/\d/.test(password)) {
      feedback.push('Include numbers')
    } else {
      score++
    }

    if (!/[^a-zA-Z\d]/.test(password)) {
      feedback.push('Include special characters')
    } else {
      score++
    }

    return {
      isValid: score >= 3 && password.length >= 8,
      score,
      feedback,
    }
  }

  /**
   * Format auth errors for better UX
   */
  static formatAuthError(error: AuthError | Error): string {
    const errorMessages: Record<string, string> = {
      'Invalid login credentials': 'Invalid email or password',
      'Email not confirmed': 'Please verify your email before signing in',
      'User already registered': 'An account with this email already exists',
      'Password should be at least 6 characters': 'Password must be at least 6 characters',
      'User not found': 'No account found with this email',
      'Invalid email': 'Please enter a valid email address',
      'Email rate limit exceeded': 'Too many attempts. Please try again later',
    }

    return errorMessages[error.message] || error.message || 'An unexpected error occurred'
  }
}

const authService = new AuthService()
export default authService
export { AuthService }