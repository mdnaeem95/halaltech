// src/components/auth/ProtectedRoute.tsx
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
          router.push(fallbackPath)
          return
        }
      }

      // All checks passed
      setIsAuthorized(true)
    }
  }, [user, profile, loading, allowedRoles, requireVerified, router, fallbackPath])

  // Custom loading component
  if (loading || !isAuthorized) {
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

  return <>{children}</>
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

// Role-specific wrapper components
export function AdminOnly({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin']} fallbackPath="/dashboard">
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