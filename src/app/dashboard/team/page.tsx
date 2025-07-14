'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  User,
  Code,
  Palette,
  FileCheck,
  Briefcase,
  CheckCircle,
  XCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminOnly } from '@/app/components/auth/ProtectedRoute'

interface TeamMember {
  id: string
  user_id: string
  department: 'development' | 'design' | 'project_management' | 'qa'
  position: string
  specializations: string[]
  is_active: boolean
  joined_at: string
  profile?: {
    full_name: string
    email: string
  }
  active_projects?: number
}

export default function TeamManagementPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const [, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch('/api/admin/team')
      const data = await res.json()
      
      if (data.success) {
        setTeamMembers(data.data)
      } else {
        toast.error('Failed to fetch team members')
      }
    } catch (error) {
      console.error('Error fetching team members:', error)
      toast.error('Failed to fetch team members')
    } finally {
      setLoading(false)
    }
  }

  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case 'development':
        return <Code className="w-5 h-5" />
      case 'design':
        return <Palette className="w-5 h-5" />
      case 'qa':
        return <FileCheck className="w-5 h-5" />
      case 'project_management':
        return <Briefcase className="w-5 h-5" />
      default:
        return <User className="w-5 h-5" />
    }
  }

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'development':
        return 'bg-blue-100 text-blue-800'
      case 'design':
        return 'bg-purple-100 text-purple-800'
      case 'qa':
        return 'bg-yellow-100 text-yellow-800'
      case 'project_management':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleMemberStatus = async (memberId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/team/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`Team member ${!currentStatus ? 'activated' : 'deactivated'}`)
        fetchTeamMembers()
      } else {
        toast.error('Failed to update member status')
      }
    } catch (error) {
      console.error('Failed to update member:', error)
      toast.error('Failed to update member status')
    }
  }

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = 
      member.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.specializations.some(spec => 
        spec.toLowerCase().includes(searchQuery.toLowerCase())
      )
    
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment
    
    return matchesSearch && matchesDepartment
  })

  const departmentStats = {
    development: teamMembers.filter(m => m.department === 'development').length,
    design: teamMembers.filter(m => m.department === 'design').length,
    qa: teamMembers.filter(m => m.department === 'qa').length,
    project_management: teamMembers.filter(m => m.department === 'project_management').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <AdminOnly>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
            <p className="text-gray-600 mt-2">Manage your internal team</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Team Member
          </button>
        </div>

        {/* Department Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Development</p>
                <p className="text-2xl font-bold text-gray-900">{departmentStats.development}</p>
              </div>
              <Code className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Design</p>
                <p className="text-2xl font-bold text-gray-900">{departmentStats.design}</p>
              </div>
              <Palette className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">QA</p>
                <p className="text-2xl font-bold text-gray-900">{departmentStats.qa}</p>
              </div>
              <FileCheck className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Project Mgmt</p>
                <p className="text-2xl font-bold text-gray-900">{departmentStats.project_management}</p>
              </div>
              <Briefcase className="w-8 h-8 text-green-400" />
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
                  placeholder="Search by name, email, position, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              <option value="development">Development</option>
              <option value="design">Design</option>
              <option value="qa">Quality Assurance</option>
              <option value="project_management">Project Management</option>
            </select>
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${
                !member.is_active ? 'opacity-60' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 p-3 rounded-full">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {member.profile?.full_name || 'Team Member'}
                    </h3>
                    <p className="text-sm text-gray-600">{member.position}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleMemberStatus(member.id, member.is_active)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {member.is_active ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDepartmentColor(member.department)}`}>
                    {getDepartmentIcon(member.department)}
                    <span className="ml-1 capitalize">{member.department.replace('_', ' ')}</span>
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Specializations:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {member.specializations.map((spec, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    Active Projects: <span className="font-medium">{member.active_projects || 0}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex space-x-2 pt-3">
                  <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition text-sm flex items-center justify-center">
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No team members found</p>
          </div>
        )}
      </div>
    </AdminOnly>
  )
}