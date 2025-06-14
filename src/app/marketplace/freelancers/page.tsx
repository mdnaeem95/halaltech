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
  ChevronDown,
  Check,
  X,
  Lock,
  MapPin,
  Clock,
  Award
} from 'lucide-react'
import { FreelancerProfile, FreelancerSearchFilters } from '@/types/freelancer'
import toast from 'react-hot-toast'

// Marketplace-focused freelancer card component
function MarketplaceFreelancerCard({ freelancer }: { freelancer: FreelancerProfile }) {
  const getAvailabilityBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
      available: { bg: 'bg-green-100', text: 'text-green-800', icon: Check },
      busy: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Lock },
      unavailable: { bg: 'bg-red-100', text: 'text-red-800', icon: X },
    }

    const config = statusConfig[status] || statusConfig.available
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 font-semibold text-lg">
                  {freelancer.full_name?.charAt(0) || freelancer.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {freelancer.full_name || 'Professional Freelancer'}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>Singapore</span>
                </div>
              </div>
            </div>
          </div>
          {getAvailabilityBadge(freelancer.availability_status)}
        </div>

        {freelancer.bio && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{freelancer.bio}</p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm">
            <DollarSign className="w-4 h-4 text-emerald-600 mr-2" />
            <span className="font-medium text-gray-900">
              ${freelancer.hourly_rate}/hour
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <Star className="w-4 h-4 text-yellow-400 mr-2" />
            <span className="text-gray-700">
              {freelancer.rating} ({freelancer.total_reviews})
            </span>
          </div>

          <div className="flex items-center text-sm">
            <Code className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-700">
              {freelancer.years_experience}+ years
            </span>
          </div>

          <div className="flex items-center text-sm">
            <Award className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-gray-700">
              ${freelancer.total_earnings.toLocaleString()} earned
            </span>
          </div>
        </div>

        {/* Skills */}
        {freelancer.freelancer_skills && freelancer.freelancer_skills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {freelancer.freelancer_skills.slice(0, 4).map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                >
                  {skill.skill_name}
                </span>
              ))}
              {freelancer.freelancer_skills.length > 4 && (
                <span className="inline-block px-3 py-1 text-xs text-gray-500 bg-gray-50 rounded-full">
                  +{freelancer.freelancer_skills.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Link
            href={`/marketplace/freelancers/${freelancer.id}`}
            className="flex-1 bg-emerald-600 text-white py-2.5 px-4 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center font-medium"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Profile
          </Link>
          <Link
            href={`/hire/${freelancer.id}`}
            className="px-4 py-2.5 border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition font-medium"
          >
            Hire Now
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function MarketplaceFreelancersPage() {
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FreelancerSearchFilters>({
    skills: [],
    min_rating: undefined,
    max_hourly_rate: undefined,
    availability_status: 'available', // Default to available only in marketplace
    sort_by: 'rating',
    sort_order: 'desc',
  })

  const skillOptions = [
    'React', 'Next.js', 'TypeScript', 'Node.js', 'Python',
    'Flutter', 'React Native', 'UI/UX Design', 'WordPress',
    'Vue.js', 'Angular', 'Laravel', 'Django', 'MongoDB'
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
      availability_status: 'available',
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
      freelancer.freelancer_skills?.some(skill => 
        skill.skill_name.toLowerCase().includes(searchLower)
      )
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Expert Tech Talent
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with skilled Muslim freelancers specializing in web development, 
            mobile apps, UI/UX design, and more. All vetted professionals ready to bring your project to life.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm mb-8 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, skills, or expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition flex items-center justify-center lg:justify-start"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-2 transition ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Skills Filter */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Skills</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {skillOptions.map(skill => (
                    <label key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.skills?.includes(skill) || false}
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
                <h3 className="font-medium text-gray-900 mb-3">Minimum Rating</h3>
                <select
                  value={filters.min_rating || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    min_rating: e.target.value ? parseFloat(e.target.value) : undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3">3+ Stars</option>
                </select>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Max Hourly Rate</h3>
                <select
                  value={filters.max_hourly_rate || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    max_hourly_rate: e.target.value ? parseFloat(e.target.value) : undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Any Price</option>
                  <option value="25">Under $25/hr</option>
                  <option value="50">Under $50/hr</option>
                  <option value="75">Under $75/hr</option>
                  <option value="100">Under $100/hr</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Sort By</h3>
                <select
                  value={`${filters.sort_by}_${filters.sort_order}`}
                  onChange={(e) => {
                    const [sort_by, sort_order] = e.target.value.split('_')
                    setFilters(prev => ({ ...prev, sort_by: sort_by as any, sort_order: sort_order as any }))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="rating_desc">Highest Rated</option>
                  <option value="hourly_rate_asc">Lowest Price</option>
                  <option value="hourly_rate_desc">Highest Price</option>
                  <option value="experience_desc">Most Experienced</option>
                </select>
              </div>

              <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {filteredFreelancers.length} freelancer{filteredFreelancers.length !== 1 ? 's' : ''} found
          </p>
          {filters.skills && filters.skills.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Filtering by:</span>
              <div className="flex gap-1">
                {filters.skills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-full"
                  >
                    {skill}
                    <button
                      onClick={() => toggleSkill(skill)}
                      className="ml-1 hover:text-emerald-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Freelancer Grid */}
        {filteredFreelancers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFreelancers.map((freelancer) => (
              <MarketplaceFreelancerCard
                key={freelancer.id}
                freelancer={freelancer}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No freelancers found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or removing some filters.
              </p>
              <button
                onClick={resetFilters}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}