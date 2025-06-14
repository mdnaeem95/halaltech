/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Filter, 
  Star, 
  DollarSign,
  Code,
  Eye,
  UserPlus,
  ChevronDown,
  Check,
  X
} from 'lucide-react'
import { FreelancerProfile, FreelancerSearchFilters } from '@/types/freelancer'
import toast from 'react-hot-toast'

export default function FreelancersPage() {
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FreelancerSearchFilters>({
    skills: [],
    min_rating: undefined,
    max_hourly_rate: undefined,
    availability_status: 'all',
    sort_by: 'rating',
    sort_order: 'desc',
  })

  const skillOptions = [
    'React', 'Next.js', 'TypeScript', 'Node.js', 'Python',
    'Flutter', 'React Native', 'UI/UX Design', 'WordPress'
  ]

  useEffect(() => {
    fetchFreelancers()
  }, [filters])

  const fetchFreelancers = async () => {
    try {
      const params = new URLSearchParams()
      
      if (filters.skills && filters.skills.length > 0) {
        params.append('skills', filters.skills.join(','))
      }
      if (filters.min_rating) {
        params.append('min_rating', filters.min_rating.toString())
      }
      if (filters.max_hourly_rate) {
        params.append('max_hourly_rate', filters.max_hourly_rate.toString())
      }
      if (filters.availability_status && filters.availability_status !== 'all') {
        params.append('availability_status', filters.availability_status)
      }
      if (filters.sort_by) {
        params.append('sort_by', filters.sort_by)
        params.append('sort_order', filters.sort_order || 'desc')
      }

      const res = await fetch(`/api/freelancers?${params.toString()}`)
      const data = await res.json()
      
      if (data.success) {
        setFreelancers(data.data)
      } else {
        toast.error('Failed to fetch freelancers')
      }
    } catch (error) {
      console.error('Failed to fetch freelancers:', error)
      toast.error('Failed to fetch freelancers')
    } finally {
      setLoading(false)
    }
  }

  const toggleSkill = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills?.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...(prev.skills || []), skill]
    }))
  }

  const resetFilters = () => {
    setFilters({
      skills: [],
      min_rating: undefined,
      max_hourly_rate: undefined,
      availability_status: 'all',
      sort_by: 'rating',
      sort_order: 'desc',
    })
  }

  const filteredFreelancers = freelancers.filter(freelancer => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      freelancer.full_name?.toLowerCase().includes(searchLower) ||
      freelancer.bio?.toLowerCase().includes(searchLower) ||
      freelancer.email.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Freelancer Directory</h1>
          <p className="text-gray-600 mt-2">Find and manage talented freelancers</p>
        </div>
        <Link
          href="/dashboard/freelancers/invite"
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Invite Freelancer
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search freelancers by name, skills, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
            <ChevronDown className={`w-4 h-4 ml-2 transition ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Skills Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {skillOptions.map(skill => (
                    <label key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.skills?.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.min_rating || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    min_rating: e.target.value ? parseFloat(e.target.value) : undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Any rating</option>
                  <option value="4.5">4.5+ stars</option>
                  <option value="4">4+ stars</option>
                  <option value="3.5">3.5+ stars</option>
                </select>
              </div>

              {/* Hourly Rate Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Hourly Rate (SGD)
                </label>
                <input
                  type="number"
                  value={filters.max_hourly_rate || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    max_hourly_rate: e.target.value ? parseFloat(e.target.value) : undefined 
                  }))}
                  placeholder="e.g., 100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Availability Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <select
                  value={filters.availability_status || 'all'}
                  onChange={(e) => setFilters(prev => ({ ...prev, availability_status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={resetFilters}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                Reset filters
              </button>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Sort by:</label>
                <select
                  value={filters.sort_by}
                  onChange={(e) => setFilters(prev => ({ ...prev, sort_by: e.target.value as any }))}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                >
                  <option value="rating">Rating</option>
                  <option value="hourly_rate">Hourly Rate</option>
                  <option value="experience">Experience</option>
                  <option value="projects_completed">Projects Completed</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Freelancers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFreelancers.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No freelancers found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          filteredFreelancers.map((freelancer) => (
            <FreelancerCard key={freelancer.id} freelancer={freelancer} />
          ))
        )}
      </div>

      {/* Stats Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Freelancers</p>
          <p className="text-2xl font-bold text-gray-900">{freelancers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Available Now</p>
          <p className="text-2xl font-bold text-emerald-600">
            {freelancers.filter(f => f.availability_status === 'available').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Avg. Hourly Rate</p>
          <p className="text-2xl font-bold text-gray-900">
            ${Math.round(
              freelancers.reduce((sum, f) => sum + (f.hourly_rate || 0), 0) / freelancers.length
            )}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Avg. Rating</p>
          <p className="text-2xl font-bold text-yellow-600">
            {(freelancers.reduce((sum, f) => sum + f.rating, 0) / freelancers.length).toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  )
}

// Freelancer Card Component
function FreelancerCard({ freelancer }: { freelancer: FreelancerProfile }) {
  const getAvailabilityBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
      available: { bg: 'bg-green-100', text: 'text-green-800', icon: Check },
      busy: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Lock },
      unavailable: { bg: 'bg-red-100', text: 'text-red-800', icon: X },
    }

    // Use the config for the status, or default to available
    const config = statusConfig[status] || statusConfig.available
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {freelancer.full_name || 'Freelancer'}
            </h3>
            <p className="text-sm text-gray-600">{freelancer.email}</p>
          </div>
          {getAvailabilityBadge(freelancer.availability_status)}
        </div>

        {freelancer.bio && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{freelancer.bio}</p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-700">
              ${freelancer.hourly_rate}/hour
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <Star className="w-4 h-4 text-yellow-400 mr-2" />
            <span className="text-gray-700">
              {freelancer.rating} ({freelancer.total_reviews} reviews)
            </span>
          </div>

          <div className="flex items-center text-sm">
            <Code className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-700">
              {freelancer.years_experience} years experience
            </span>
          </div>
        </div>

        {/* Skills */}
        {freelancer.freelancer_skills && freelancer.freelancer_skills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {freelancer.freelancer_skills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                >
                  {skill.skill_name}
                </span>
              ))}
              {freelancer.freelancer_skills.length > 3 && (
                <span className="inline-block px-2 py-1 text-xs text-gray-500">
                  +{freelancer.freelancer_skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <Link
            href={`/dashboard/freelancers/${freelancer.id}`}
            className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Profile
          </Link>
          <Link
            href={`/dashboard/freelancers/${freelancer.id}/assign`}
            className="px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition"
          >
            Assign
          </Link>
        </div>
      </div>
    </div>
  )
}