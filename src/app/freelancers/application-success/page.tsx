/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Mail, ArrowRight, Clock, Lock } from 'lucide-react'
import Link from 'next/link'

export default function ApplicationSuccessPage() {
  const searchParams = useSearchParams()
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    // Check if this is a new user from query params
    const newUser = searchParams.get('newUser') === 'true'
    setIsNewUser(newUser)
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          {/* Success Icon */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-4"
            >
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Application Submitted Successfully!
            </h1>
            
            <p className="text-lg text-gray-600">
              Thank you for applying to join the TechHalal Freelancer Network.
            </p>
          </div>

          {/* New User Password Setup Alert */}
          {isNewUser && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8"
            >
              <div className="flex items-start">
                <Lock className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Action Required: Set Up Your Password
                  </h3>
                  <p className="text-blue-800 mb-3">
                    We&apos;ve created an account for you and sent a password setup link to your email. 
                    Please check your inbox to complete your account setup.
                  </p>
                  <p className="text-sm text-blue-700">
                    <strong>Can&apos;t find the email?</strong> Check your spam folder or{' '}
                    <Link href="/auth/forgot-password" className="underline hover:text-blue-900">
                      request a new password reset link
                    </Link>.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* What Happens Next */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                What happens next?
              </h2>
              
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-start"
                >
                  <div className="bg-emerald-100 rounded-full p-2 mr-4 flex-shrink-0">
                    <Mail className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Check Your Email</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      We&apos;ve sent a confirmation email with your application details
                      {isNewUser && ' and password setup instructions'}.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-start"
                >
                  <div className="bg-emerald-100 rounded-full p-2 mr-4 flex-shrink-0">
                    <Clock className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Application Review</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Our team will review your application within 2-3 business days.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-start"
                >
                  <div className="bg-emerald-100 rounded-full p-2 mr-4 flex-shrink-0">
                    <ArrowRight className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Get Started</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Once approved, you&apos;ll be able to complete your profile and start accepting projects.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gray-50 rounded-lg p-6 mt-8">
              <h3 className="font-semibold text-gray-900 mb-3">
                💡 While you wait...
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Prepare your portfolio pieces to showcase your best work</li>
                <li>• Think about your hourly rates and project preferences</li>
                <li>• Review our freelancer guidelines and best practices</li>
                {isNewUser && <li>• Complete your password setup to secure your account</li>}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link
                href="/"
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg text-center hover:bg-gray-200 transition font-medium"
              >
                Return to Homepage
              </Link>
              
              {isNewUser && (
                <Link
                  href="/auth/forgot-password"
                  className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-lg text-center hover:bg-emerald-700 transition font-medium"
                >
                  Set Up Password
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Contact Support */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            Have questions? Contact us at{' '}
            <a href="mailto:support@techhalal.sg" className="text-emerald-600 hover:text-emerald-700">
              support@techhalal.sg
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}