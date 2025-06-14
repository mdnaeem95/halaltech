// src/app/components/layout/Navigation.tsx
'use client'

import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import UserMenu from '../auth/UserMenu'
import MobileMenu from './MobileMenu'

interface NavigationProps {
  user: User | null
  onAuthClick: () => void
}

const Navigation: React.FC<NavigationProps> = ({ user, onAuthClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '#services', label: 'Services' },
    { href: '/marketplace/freelancers', label: 'Find Talent'},
    { href: '#about', label: 'About' },
    { href: '#testimonials', label: 'Testimonials' },
    { href: '#contact', label: 'Contact' },
  ]

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-emerald-600">
              TechHalal
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-emerald-600 transition"
              >
                {link.label}
              </a>
            ))}
            
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-emerald-600 transition"
                >
                  Dashboard
                </Link>
                <UserMenu />
              </>
            ) : (
              <button
                onClick={onAuthClick}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
              >
                Get Started
              </button>
            )}
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        onAuthClick={onAuthClick}
        navLinks={navLinks}
      />
    </nav>
  )
}

export default Navigation