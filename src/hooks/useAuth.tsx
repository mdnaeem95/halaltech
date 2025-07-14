'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  phone: string | null
  role: 'client' | 'admin'
  onboarding_completed: boolean
  bio?: string | null
  hourly_rate?: number | null
  years_experience?: number
  portfolio_url?: string | null
  linkedin_url?: string | null
  github_url?: string | null
  availability_status?: string | null
  created_at: string
  updated_at: string
  is_verified?: boolean
  verification_date?: string | null
}

interface SignUpData {
  email: string
  password: string
  fullName: string
  companyName?: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (data: SignUpData) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<void>
  refreshProfile: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  // Fetch profile data
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: user?.email || '',
              role: 'client',
              onboarding_completed: false,
            })
            .select()
            .single()

          if (createError) {
            console.error('Error creating profile:', createError)
            throw createError
          }
          
          setProfile(newProfile)
        } else {
          throw error
        }
      } else {
        console.log('Profile fetched successfully:', data)
        setProfile(data)
      }
    } catch (error) {
      console.error('Profile fetch error:', error)
      toast.error('Failed to load profile')
      // Don't throw here - allow the app to continue with null profile
      setProfile(null)
    }
  }, [supabase, user?.email])

  // Initialize auth state
  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...')
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          throw error
        }

        if (isMounted) {
          console.log('Session:', session)
          setSession(session)
          setUser(session?.user ?? null)
          
          // Fetch profile if user exists
          if (session?.user) {
            await fetchProfile(session.user.id)
          }
          
          setMounted(true)
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (isMounted) {
          setLoading(false)
          setMounted(true)
        }
      }
    }

    initializeAuth()

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session)
        
        if (!isMounted) return

        switch (event) {
          case 'INITIAL_SESSION':
            // Already handled in initializeAuth
            break
            
          case 'SIGNED_IN':
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
              await fetchProfile(session.user.id)
            }
            break
            
          case 'SIGNED_OUT':
            setSession(null)
            setUser(null)
            setProfile(null)
            router.push('/')
            break
            
          case 'TOKEN_REFRESHED':
            setSession(session)
            break
            
          case 'USER_UPDATED':
            setUser(session?.user ?? null)
            if (session?.user) {
              await fetchProfile(session.user.id)
            }
            break
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile, router, supabase])

  // Auth methods
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Sign in error:', error)
        throw error
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUp = async (data: SignUpData) => {
    try {
      const { error } = await supabase.auth.signUp({
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

      if (error) {
        console.error('Sign up error:', error)
        throw error
      }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        throw error
      }
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in')

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      // Refresh profile
      await fetchProfile(user.id)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  const refreshProfile = async () => {
    if (!user) return
    await fetchProfile(user.id)
  }

  const sendPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      })

      if (error) throw error
    } catch (error) {
      console.error('Password reset error:', error)
      throw error
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error
    } catch (error) {
      console.error('Update password error:', error)
      throw error
    }
  }

  const value = {
    user,
    profile,
    session,
    loading: loading || !mounted,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
    sendPasswordReset,
    updatePassword,
  }

  // Always render children - let individual pages/components handle loading states
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for role-based access
export function useRole() {
  const { profile } = useAuth()
  
  return {
    isAdmin: profile?.role === 'admin',
    isClient: profile?.role === 'client',
    role: profile?.role,
  }
}

// Hook for session management
export function useSession() {
  const { session, loading } = useAuth()
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null)

  useEffect(() => {
    if (!session?.expires_at) {
      setTimeUntilExpiry(null)
      return
    }

    const calculateTimeUntilExpiry = () => {
      const expiryTime = new Date(session.expires_at!).getTime()
      const now = Date.now()
      const timeLeft = expiryTime - now
      setTimeUntilExpiry(timeLeft > 0 ? timeLeft : 0)
    }

    // Calculate immediately
    calculateTimeUntilExpiry()

    // Update every minute
    const interval = setInterval(calculateTimeUntilExpiry, 60000)

    return () => clearInterval(interval)
  }, [session?.expires_at])

  return {
    session,
    loading,
    timeUntilExpiry,
    isExpired: timeUntilExpiry !== null && timeUntilExpiry <= 0,
  }
}

// Hook for protected routes
export function useProtectedRoute(
  allowedRoles?: Array<'client' | 'admin'>,
  requireVerified = false
) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!loading) {
      // Check if user is authenticated
      if (!user) {
        router.push(`/login?redirectTo=${window.location.pathname}`)
        return
      }

      // Check if email is verified (if required)
      if (requireVerified && !user.email_confirmed_at) {
        router.push('/auth/verify-email')
        return
      }

      // Check role-based access
      if (allowedRoles && profile) {
        if (!allowedRoles.includes(profile.role)) {
          router.push('/dashboard')
          return
        }
      }

      // All checks passed
      setIsAuthorized(true)
    }
  }, [user, profile, loading, allowedRoles, requireVerified, router])

  return { isAuthorized, loading }
}