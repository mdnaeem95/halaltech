// src/app/components/auth/ProtectedRoute.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Array<'client' | 'admin' | 'service_provider'>
  requireVerified?: boolean
  fallbackPath?: string
  loadingComponent?: React.ReactNode
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  requireVerified = false,
  fallbackPath = '/dashboard',
  loadingComponent,
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Only check once loading is complete
    if (!loading) {
      console.log('ProtectedRoute check:', { user, profile, allowedRoles })
      
      // Check if user is authenticated
      if (!user) {
        console.log('No user, redirecting to login')
        router.push(`/login?redirectTo=${window.location.pathname}`)
        return
      }

      // Check if email is verified (if required)
      if (requireVerified && !user.email_confirmed_at) {
        console.log('Email not verified, redirecting')
        router.push('/auth/verify-email')
        return
      }

      // Check role-based access (only if profile is loaded)
      if (allowedRoles && allowedRoles.length > 0) {
        // If profile is still null after auth loading is complete, there might be an issue
        if (!profile) {
          console.log('No profile found, redirecting to fallback')
          router.push(fallbackPath)
          return
        }

        if (!allowedRoles.includes(profile.role)) {
          console.log('Role not allowed:', profile.role, 'Required:', allowedRoles)
          router.push(fallbackPath)
          return
        }
      }

      // All checks passed
      console.log('All checks passed, showing content')
      setIsChecking(false)
    }
  }, [user, profile, loading, allowedRoles, requireVerified, router, fallbackPath])

  // Show loading while auth is loading or checking
  if (loading || isChecking) {
    return (
      loadingComponent || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto" />
            <p className="text-gray-600 mt-4">Verifying access...</p>
          </div>
        </div>
      )
    )
  }

  // If we reach here, user is authorized
  return <>{children}</>
}

// Role-specific wrapper components with better error handling
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth()
  const router = useRouter()
  
  // Quick check for non-admin users to avoid unnecessary loading
  useEffect(() => {
    if (!loading && profile && profile.role !== 'admin') {
      console.log('AdminOnly: User is not admin, redirecting')
      router.push('/dashboard')
    }
  }, [profile, loading, router])

  return (
    <ProtectedRoute 
      allowedRoles={['admin']} 
      fallbackPath="/dashboard"
      loadingComponent={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto" />
            <p className="text-gray-600 mt-4">Checking admin access...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a moment...</p>
          </div>
        </div>
      }
    >
      {children}
    </ProtectedRoute>
  )
}

export function ClientOnly({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['client']} fallbackPath="/dashboard">
      {children}
    </ProtectedRoute>
  )
}

export function ServiceProviderOnly({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['service_provider']} fallbackPath="/dashboard">
      {children}
    </ProtectedRoute>
  )
}

// HOC version for pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}