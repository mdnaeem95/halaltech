/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import {
  LayoutDashboard,
  FileText,
  Settings,
  CreditCard,
  Users,
  Package,
  BarChart,
  Briefcase,
  Clock,
  DollarSign,
  Calendar,
  Star,
  UserCheck
} from 'lucide-react'

interface DashboardSidebarProps {
  user: User
  profile: any
}

export default function DashboardSidebar({ user, profile }: DashboardSidebarProps) {
  const pathname = usePathname()

  const clientLinks = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/projects', label: 'Projects', icon: FileText },
    { href: '/dashboard/invoices', label: 'Invoices', icon: CreditCard },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  const freelancerLinks = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/projects', label: 'My Projects', icon: FileText },
    { href: '/dashboard/earnings', label: 'Earnings', icon: DollarSign },
    { href: '/dashboard/time-tracking', label: 'Time Tracking', icon: Clock },
    { href: '/dashboard/availability', label: 'Availability', icon: Calendar },
    { href: '/dashboard/portfolio', label: 'Portfolio', icon: Briefcase },
    { href: '/dashboard/reviews', label: 'Reviews', icon: Star },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  const adminLinks = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/projects', label: 'All Projects', icon: FileText },
    { href: '/dashboard/clients', label: 'Clients', icon: Users },
    { href: '/dashboard/freelancers', label: 'Freelancers', icon: UserCheck },
    { href: '/dashboard/services', label: 'Services', icon: Package },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart },
    { href: '/dashboard/invoices', label: 'Invoices', icon: CreditCard },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  const links = profile?.role === 'admin' 
    ? adminLinks 
    : profile?.role === 'service_provider' 
    ? freelancerLinks 
    : clientLinks

  return (
    <aside className="w-64 bg-white h-screen shadow-sm">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-emerald-600">TechHalal</h2>
        <p className="text-sm text-gray-600 mt-1">
          {profile?.role === 'admin' ? 'Admin' : profile?.role === 'service_provider' ? 'Freelancer' : 'Client'} Dashboard
        </p>
      </div>

      <div className="px-6 pb-4">
        <div className="bg-gray-100 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-900">
            {profile?.full_name || user.email}
          </p>
          {profile?.company_name && (
            <p className="text-xs text-gray-600 mt-1">{profile.company_name}</p>
          )}
          <div className="flex items-center mt-2 space-x-2">
            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
              {profile?.role || 'client'}
            </span>
            {profile?.role === 'service_provider' && profile?.rating > 0 && (
              <span className="inline-flex items-center text-xs text-gray-600">
                <Star className="w-3 h-3 text-yellow-500 mr-1" />
                {profile.rating}
              </span>
            )}
          </div>
        </div>
      </div>

      <nav className="px-4">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition ${
                isActive
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Freelancer Quick Stats */}
      {profile?.role === 'service_provider' && profile?.onboarding_completed && (
        <div className="mt-8 px-6">
          <div className="bg-emerald-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-emerald-900 mb-2">Quick Stats</h3>
            <div className="space-y-1 text-xs text-emerald-700">
              <p>Status: {profile.availability_status || 'Available'}</p>
              <p>Rate: ${profile.hourly_rate}/hour</p>
              {profile.total_earnings > 0 && (
                <p>Earned: ${profile.total_earnings.toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}