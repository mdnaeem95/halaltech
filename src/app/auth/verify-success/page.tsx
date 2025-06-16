// src/app/auth/verify-success/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function VerifySuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6"
        >
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Email Verified!
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Your email has been successfully verified. You&apos;ll be redirected to your dashboard in a few seconds.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-medium"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>

        <p className="text-sm text-gray-500 mt-6">
          Redirecting automatically in 5 seconds...
        </p>
      </motion.div>
    </div>
  )
}