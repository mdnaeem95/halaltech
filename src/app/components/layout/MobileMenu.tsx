// src/app/components/layout/MobileMenu.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'

interface NavLink {
  href: string
  label: string
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onAuthClick: () => void
  navLinks: NavLink[]
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  onAuthClick,
  navLinks 
}) => {
  if (!isOpen) return null

  const handleNavClick = () => {
    onClose()
  }

  const handleAuthClick = () => {
    onClose()
    onAuthClick()
  }

  return (
    <div className="md:hidden bg-white border-t">
      <div className="px-2 pt-2 pb-3 space-y-1">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={handleNavClick}
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
          >
            {link.label}
          </a>
        ))}
        {user ? (
          <Link
            href="/dashboard"
            onClick={handleNavClick}
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
          >
            Dashboard
          </Link>
        ) : (
          <button
            onClick={handleAuthClick}
            className="w-full text-left bg-emerald-600 text-white px-3 py-2 rounded"
          >
            Get Started
          </button>
        )}
      </div>
    </div>
  )
}

export default MobileMenu