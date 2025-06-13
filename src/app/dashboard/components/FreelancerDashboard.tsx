/* eslint-disable  @typescript-eslint/no-explicit-any */
// src/app/dashboard/components/FreelancerDashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  DollarSign, 
  Clock, 
  FileText, 
  Star, 
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import { format } from 'date-fns'
import { FreelancerStats, ProjectAssignment } from '@/types/freelancer'
import toast from 'react-hot-toast'

interface FreelancerDashboardProps {
  userId: string
  profile: any
}

export default function FreelancerDashboard({ userId, profile }: FreelancerDashboardProps) {
  const [stats, setStats] = useState<FreelancerStats | null>(null)
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([])
  const [earnings, setEarnings] = useState({
    thisMonth: 0,
    lastMonth: 0,
    pending: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFreelancerData()
  }, [])

  const fetchFreelancerData = async () => {
    try {
      // Fetch stats
      const statsRes = await fetch(`/api/freelancers/${userId}/stats`)
      const statsData = await statsRes.json()
      if (statsData.success) {
        setStats(statsData.data)
      }

      // Fetch active assignments
      const assignmentsRes = await fetch('/api/freelancers/assignments')
      const assignmentsData = await assignmentsRes.json()
      if (assignmentsData.success) {
        setAssignments(assignmentsData.data)
      }

      // Fetch earnings
      const earningsRes = await fetch('/api/freelancers/earnings')
      const earningsData = await earningsRes.json()
      if (earningsData.success) {
        setEarnings(earningsData.data)
      }
    } catch (error) {
      console.error('Failed to fetch freelancer data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignmentAction = async (assignmentId: string, action: 'accept' | 'reject') => {
    try {
      const res = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        fetchFreelancerData()
      } else {
        toast.error(data.error || `Failed to ${action} assignment`)
      }
    } catch (error) {
      console.error(`Failed to ${action} assignment:`, error)
      toast.error(`Failed to ${action} assignment`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile.full_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here&apos;s your freelancer dashboard overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Earnings"
          value={`$${stats?.total_earnings.toLocaleString() || 0}`}
          icon={DollarSign}
          color="emerald"
          trend={earnings.thisMonth > earnings.lastMonth ? 'up' : 'down'}
          trendValue={`${Math.abs(((earnings.thisMonth - earnings.lastMonth) / earnings.lastMonth) * 100).toFixed(1)}%`}
        />
        
        <StatsCard
          title="Active Projects"
          value={stats?.active_projects || 0}
          icon={FileText}
          color="blue"
        />
        
        <StatsCard
          title="Your Rating"
          value={stats?.rating || 0}
          icon={Star}
          color="yellow"
          subtitle={`${stats?.total_reviews || 0} reviews`}
        />
        
        <StatsCard
          title="Pending Earnings"
          value={`$${earnings.pending.toLocaleString()}`}
          icon={Clock}
          color="orange"
        />
      </div>

      {/* Pending Assignments */}
      {assignments.filter(a => a.status === 'pending').length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-4">
            New Project Assignments
          </h2>
          <div className="space-y-4">
            {assignments
              .filter(a => a.status === 'pending')
              .map(assignment => (
                <PendingAssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onAccept={() => handleAssignmentAction(assignment.id, 'accept')}
                  onReject={() => handleAssignmentAction(assignment.id, 'reject')}
                />
              ))}
          </div>
        </div>
      )}

      {/* Active Projects */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Active Projects</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {assignments
            .filter(a => a.status === 'active')
            .map(assignment => (
              <ActiveProjectCard key={assignment.id} assignment={assignment} />
            ))}
          
          {assignments.filter(a => a.status === 'active').length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No active projects at the moment
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <QuickActionCard
          title="Update Profile"
          description="Keep your skills and portfolio up to date"
          href="/dashboard/profile"
          icon={<CheckCircle className="w-8 h-8 text-emerald-600" />}
        />
        
        <QuickActionCard
          title="View Earnings"
          description="Track your earnings and payment history"
          href="/dashboard/earnings"
          icon={<TrendingUp className="w-8 h-8 text-blue-600" />}
        />
        
        <QuickActionCard
          title="Manage Availability"
          description="Update your working hours and availability"
          href="/dashboard/availability"
          icon={<Calendar className="w-8 h-8 text-purple-600" />}
        />
      </div>
    </div>
  )
}

// Stats Card Component
function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendValue,
  subtitle
}: {
  title: string
  value: string | number
  icon: any
  color: string
  trend?: 'up' | 'down'
  trendValue?: string
  subtitle?: string
}) {
  const colorClasses = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
  }[color]

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${colorClasses} text-white p-3 rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && trendValue && (
          <div className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <p className="text-gray-600 text-sm mt-1">{title}</p>
      {subtitle && (
        <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
      )}
    </div>
  )
}

// Pending Assignment Card
function PendingAssignmentCard({
  assignment,
  onAccept,
  onReject
}: {
  assignment: ProjectAssignment
  onAccept: () => void
  onReject: () => void
}) {
  return (
    <div className="bg-white rounded-lg border border-yellow-200 p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">
            {assignment.project?.title || 'Project Assignment'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {assignment.payment_type === 'hourly' 
              ? `$${assignment.hourly_rate}/hour - Est. ${assignment.estimated_hours} hours`
              : `Fixed: $${assignment.fixed_price}`
            }
          </p>
        </div>
        <AlertCircle className="w-5 h-5 text-yellow-500" />
      </div>
      
      {assignment.notes && (
        <p className="text-sm text-gray-600 mb-3">{assignment.notes}</p>
      )}
      
      <div className="flex gap-2">
        <button
          onClick={onAccept}
          className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition"
        >
          Accept
        </button>
        <button
          onClick={onReject}
          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Decline
        </button>
      </div>
    </div>
  )
}

// Active Project Card
function ActiveProjectCard({ assignment }: { assignment: ProjectAssignment }) {
  return (
    <Link
      href={`/dashboard/projects/${assignment.project_id}`}
      className="block p-6 hover:bg-gray-50 transition"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {assignment.project?.title || 'Project'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {assignment.payment_type === 'hourly' 
              ? `$${assignment.hourly_rate}/hour`
              : `Fixed: $${assignment.fixed_price}`
            }
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Started {format(new Date(assignment.accepted_at!), 'MMM d, yyyy')}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </div>
    </Link>
  )
}

// Quick Action Card
function QuickActionCard({
  title,
  description,
  href,
  icon
}: {
  title: string
  description: string
  href: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition block"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">{icon}</div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </Link>
  )
}