'use client'

import { useEffect, useState, createContext, useContext, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Profile {
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

interface SignUpData {
  email: string
  password: string
  fullName: string
  companyName?: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Create profile for new users
  const createProfile = useCallback(async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const profileData = {
        id: userId,
        email: user.email!,
        full_name: user.user_metadata.full_name || null,
        company_name: user.user_metadata.company_name || null,
        phone: user.user_metadata.phone || null,
        role: 'client' as const,
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      if (!error && data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error creating profile:', error)
    }
  }, [supabase])

  // Fetch user profile
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Create profile if it doesn't exist
      await createProfile(userId)
    }
  }, [supabase, createProfile])

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    async function initializeAuth() {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session && mounted) {
          setSession(session)
          setUser(session.user)
          await fetchProfile(session.user.id)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log('Auth event:', event)
      
      switch (event) {
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
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile, router, supabase])

  // Auth methods
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }
  }

  const signUp = async (data: SignUpData) => {
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
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  }

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in')

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
  }

  const refreshProfile = async () => {
    if (!user) return
    await fetchProfile(user.id)
  }

  const sendPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) throw error
  }

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
    sendPasswordReset,
    updatePassword,
  }

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
    isServiceProvider: profile?.role === 'service_provider',
    role: profile?.role,
  }
}

// Hook for protected routes
export function useProtectedRoute(allowedRoles?: Array<'client' | 'admin' | 'service_provider'>) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        toast.error('You do not have permission to access this page')
        router.push('/dashboard')
      }
    }
  }, [user, profile, loading, allowedRoles, router])
  
  return { loading, authorized: !!user && (!allowedRoles || allowedRoles.includes(profile?.role || 'client')) }
}

// Hook for session management
export function useSession() {
  const { session } = useAuth()
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null)
  
  useEffect(() => {
    if (!session) return
    
    const checkExpiry = () => {
      const expiryTime = new Date(session.expires_at!).getTime()
      const now = Date.now()
      const timeLeft = expiryTime - now
      
      setTimeUntilExpiry(timeLeft)
      
      // Warn user when session is about to expire (5 minutes)
      if (timeLeft < 5 * 60 * 1000 && timeLeft > 0) {
        toast('Your session will expire soon. Please save your work.', {
          icon: '⏰',
          duration: 10000,
        })
      }
    }
    
    checkExpiry()
    const interval = setInterval(checkExpiry, 60000) // Check every minute
    
    return () => clearInterval(interval)
  }, [session])
  
  return {
    session,
    isExpired: timeUntilExpiry !== null && timeUntilExpiry <= 0,
    timeUntilExpiry,
  }
}