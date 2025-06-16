// src/app/auth/error/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, { title: string; description: string }> = {
    'Invalid authentication credentials': {
      title: 'Invalid Credentials',
      description: 'The login link is invalid or has expired. Please request a new one.'
    },
    'Email link is invalid or has expired': {
      title: 'Expired Link',
      description: 'This link has expired. Please request a new password reset link.'
    },
    'callback_error': {
      title: 'Authentication Error',
      description: 'An error occurred during authentication. Please try again.'
    },
    'access_denied': {
      title: 'Access Denied',
      description: 'You do not have permission to access this resource.'
    },
    default: {
      title: 'Something Went Wrong',
      description: error || 'An unexpected error occurred. Please try again.'
    }
  }

  const errorInfo = errorMessages[error || ''] || errorMessages.default

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {errorInfo.title}
            </h1>
            <p className="text-gray-600">
              {errorInfo.description}
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/"
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center"
            >
              Return to Homepage
            </Link>
            
            <Link
              href="/auth/forgot-password"
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition flex items-center justify-center"
            >
              Request New Password Reset
            </Link>
          </div>

          {process.env.NODE_ENV === 'development' && error && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <p className="text-xs font-mono text-gray-600">
                Error: {error}
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            Need help? Contact us at{' '}
            <a href="mailto:support@techhalal.sg" className="text-emerald-600 hover:text-emerald-700">
              support@techhalal.sg
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}