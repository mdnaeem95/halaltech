/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'

import { FileText, Users, DollarSign, Clock } from 'lucide-react'

interface DashboardStatsProps {
  stats: any
  role: string
}

// Helper function to safely format numbers
const safeToLocaleString = (value: any): string => {
  const num = Number(value) || 0
  return num.toLocaleString()
}

// Helper function to safely format currency
const safeCurrencyFormat = (value: any): string => {
  const num = Number(value) || 0
  return `$${num.toLocaleString()}`
}

export default function DashboardStats({ stats, role }: DashboardStatsProps) {
  const adminCards = [
    {
      title: 'Total Projects',
      value: safeToLocaleString(stats?.totalProjects),
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Clients',
      value: safeToLocaleString(stats?.totalClients),
      icon: Users,
      color: 'bg-emerald-500',
    },
    {
      title: 'Pending Inquiries',
      value: safeToLocaleString(stats?.pendingInquiries),
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Total Revenue',
      value: safeCurrencyFormat(stats?.totalRevenue),
      icon: DollarSign,
      color: 'bg-purple-500',
    },
  ]

  const clientCards = [
    {
      title: 'Total Projects',
      value: safeToLocaleString(stats?.totalProjects),
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Projects',
      value: safeToLocaleString(stats?.activeProjects),
      icon: Clock,
      color: 'bg-emerald-500',
    },
    {
      title: 'Total Spent',
      value: safeCurrencyFormat(stats?.totalSpent),
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      title: 'Pending Invoices',
      value: safeToLocaleString(stats?.pendingInvoices),
      icon: DollarSign,
      color: 'bg-yellow-500',
    },
  ]

  const cards = role === 'admin' ? adminCards : clientCards

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} text-white p-3 rounded-lg`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
            <p className="text-gray-600 text-sm mt-1">{card.title}</p>
          </div>
        )
      })}
    </div>
  )
}