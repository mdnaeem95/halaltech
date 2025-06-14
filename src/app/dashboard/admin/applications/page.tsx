// src/app/dashboard/admin/applications/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Clock, 
  Check, 
  X, 
  Eye, 
  User,
  ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { AdminOnly } from '@/app/components/auth/ProtectedRoute'

interface FreelancerApplication {
  id: string
  email: string
  full_name: string
  phone: string
  bio: string
  hourly_rate: number
  years_experience: number
  portfolio_url?: string
  linkedin_url?: string
  github_url?: string
  created_at: string
  onboarding_completed: boolean
  freelancer_skills: Array<{
    skill_name: string
    skill_level: string
    years_experience: number
  }>
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<FreelancerApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('pending')
  const [selectedApplication, setSelectedApplication] = useState<FreelancerApplication | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/admin/freelancer-applications')
      const data = await res.json()
      if (data.success) {
        setApplications(data.data)
      } else {
        toast.error('Failed to fetch applications')
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (applicationId: string) => {
    setActionLoading(applicationId)
    try {
      const res = await fetch(`/api/admin/freelancer-applications/${applicationId}/approve`, {
        method: 'POST'
      })
      const data = await res.json()
      
      if (data.success) {
        toast.success('Application approved successfully')
        await fetchApplications()
      } else {
        toast.error(data.error || 'Failed to approve application')
      }
    } catch (error) {
      console.error('Error approving application:', error)
      toast.error('Failed to approve application')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (applicationId: string, reason?: string) => {
    setActionLoading(applicationId)
    try {
      const res = await fetch(`/api/admin/freelancer-applications/${applicationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      const data = await res.json()
      
      if (data.success) {
        toast.success('Application rejected')
        await fetchApplications()
      } else {
        toast.error(data.error || 'Failed to reject application')
      }
    } catch (error) {
      console.error('Error rejecting application:', error)
      toast.error('Failed to reject application')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.freelancer_skills.some(skill => 
        skill.skill_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'pending' && !app.onboarding_completed) ||
      (filterStatus === 'approved' && app.onboarding_completed)
    
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: applications.length,
    pending: applications.filter(app => !app.onboarding_completed).length,
    approved: applications.filter(app => app.onboarding_completed).length
  }

  return (
    <AdminOnly>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Freelancer Applications</h1>
          <p className="text-gray-600 mt-2">Review and manage freelancer applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <User className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <Check className="w-10 h-10 text-green-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === 'approved'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Approved ({stats.approved})
              </button>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 animate-spin rounded-full border-b-2 border-emerald-600 mx-auto" />
              <p className="text-gray-600 mt-4">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-8 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Experience
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skills
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {app.full_name || 'Unnamed'}
                          </div>
                          <div className="text-sm text-gray-500">{app.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {app.years_experience} years
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${app.hourly_rate}/hour
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {app.freelancer_skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                            >
                              {skill.skill_name}
                            </span>
                          ))}
                          {app.freelancer_skills.length > 3 && (
                            <span className="inline-block px-2 py-1 text-xs text-gray-500">
                              +{app.freelancer_skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {app.onboarding_completed ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Approved
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedApplication(app)}
                            className="text-gray-600 hover:text-gray-900"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {!app.onboarding_completed && (
                            <>
                              <button
                                onClick={() => handleApprove(app.id)}
                                disabled={actionLoading === app.id}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                title="Approve"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to reject this application?')) {
                                    handleReject(app.id)
                                  }
                                }}
                                disabled={actionLoading === app.id}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                title="Reject"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Application Detail Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div 
                className="fixed inset-0 bg-black bg-opacity-50" 
                onClick={() => setSelectedApplication(null)}
              />
              <div className="relative bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Application Details</h3>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Applicant Info */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">{selectedApplication.full_name || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{selectedApplication.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{selectedApplication.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Applied</p>
                        <p className="font-medium">
                          {new Date(selectedApplication.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Professional Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Years of Experience</p>
                        <p className="font-medium">{selectedApplication.years_experience} years</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Hourly Rate</p>
                        <p className="font-medium">${selectedApplication.hourly_rate}/hour</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Bio</p>
                      <p className="text-gray-700">{selectedApplication.bio}</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Skills</h4>
                    <div className="space-y-2">
                      {selectedApplication.freelancer_skills.map((skill, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                          <div>
                            <span className="font-medium">{skill.skill_name}</span>
                            <span className="ml-2 text-sm text-gray-600">
                              ({skill.skill_level})
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {skill.years_experience} years
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Links */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Links</h4>
                    <div className="space-y-2">
                      {selectedApplication.portfolio_url && (
                        <a
                          href={selectedApplication.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-emerald-600 hover:text-emerald-700"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Portfolio
                        </a>
                      )}
                      {selectedApplication.linkedin_url && (
                        <a
                          href={selectedApplication.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-emerald-600 hover:text-emerald-700"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          LinkedIn
                        </a>
                      )}
                      {selectedApplication.github_url && (
                        <a
                          href={selectedApplication.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-emerald-600 hover:text-emerald-700"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          GitHub
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {!selectedApplication.onboarding_completed && (
                    <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to reject this application?')) {
                            handleReject(selectedApplication.id)
                            setSelectedApplication(null)
                          }
                        }}
                        disabled={actionLoading === selectedApplication.id}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          handleApprove(selectedApplication.id)
                          setSelectedApplication(null)
                        }}
                        disabled={actionLoading === selectedApplication.id}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Approve Application
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminOnly>
  )
}