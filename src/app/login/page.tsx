// app/login/page.tsx
'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import AuthModal from '@/app/components/auth/AuthModal'

export default function LoginPage() {
  const [authModalOpen, setAuthModalOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Link href="/" className="text-3xl font-bold text-emerald-600 mb-8 inline-block">
          TechHalal
        </Link>
        <Suspense>
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => {
              setAuthModalOpen(false)
              window.location.href = '/'
            }}
            defaultMode="login"
          />
        </Suspense>
      </div>
    </div>
  )
}