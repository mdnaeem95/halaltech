// src/components/auth/SessionRefresh.tsx
'use client'

import { useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import authService from '@/services/auth.service'

export default function SessionRefresh() {
  const { session, timeUntilExpiry } = useSession()

  useEffect(() => {
    if (!session) return

    // Refresh token 5 minutes before expiry
    const refreshTime = timeUntilExpiry! - (5 * 60 * 1000)
    
    if (refreshTime > 0) {
      const timeout = setTimeout(async () => {
        try {
          await authService.refreshToken()
          toast.success('Session refreshed', { duration: 2000 })
        } catch (error) {
          toast.error('Session expired. Please login again.')
          console.log('Session expired. Please login again. Error: ', error)
        }
      }, refreshTime)

      return () => clearTimeout(timeout)
    }
  }, [session, timeUntilExpiry])

  return null
}
