/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Star,
  Code,
  MapPin,
  Clock,
  Award,
  Calendar,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  ArrowLeft,
  Check,
  X,
  Lock,
  MessageCircle
} from 'lucide-react'
import { FreelancerProfile } from '@/types/freelancer'
import toast from 'react-hot-toast'

export default function FreelancerProfilePage() {
  const params = useParams()
  const [freelancer, setFreelancer] = useState<FreelancerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchFreelancer(params.id as string)
    }
  }, [params.id])

  const fetchFreelancer = async (id: string) => {
    try {
      const res = await fetch(`/api/freelancers/${id}`)
      const data = await res.json()
      
      if (data.success) {
        setFreelancer(data.data)
      } else {
        toast.error('Freelancer not found')
      }
    } catch (error) {
      console.error('Failed to fetch freelancer:', error)
      toast.error('Failed to fetch freelancer')
    } finally {
      setLoading(false)
    }
  }

  const getAvailabilityBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: any; label: string }> = {
      available: { bg: 'bg-green-100', text: 'text-green-800', icon: Check, label: 'Available Now' },
      busy: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Lock, label: 'Currently Busy' },
      unavailable: { bg: 'bg-red-100', text: 'text-red-800', icon: X, label: 'Unavailable' },
    }

    const config = statusConfig[status] || statusConfig.available
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4 mr-2" />
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!freelancer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Freelancer Not Found</h1>
            <Link
              href="/marketplace/freelancers"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              Back to Freelancers
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/marketplace/freelancers"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Freelancers
        </Link>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-emerald-600 font-bold text-3xl">
                  {freelancer.full_name?.charAt(0) || freelancer.email.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {freelancer.full_name || 'Professional Freelancer'}
                </h1>
                <div className="flex items-center gap-4 text-emerald-100 mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>Singapore</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{freelancer.years_experience}+ years experience</span>
                  </div>
                </div>
                {getAvailabilityBadge(freelancer.availability_status)}
              </div>

              <div className="text-right">
                <div className="text-white mb-2">
                  <span className="text-3xl font-bold">${freelancer.hourly_rate}</span>
                  <span className="text-emerald-100">/hour</span>
                </div>
                <div className="flex items-center justify-end text-emerald-100">
                  <Star className="w-4 h-4 text-yellow-300 mr-1" />
                  <span className="font-medium">{freelancer.rating}</span>
                  <span className="ml-1">({freelancer.total_reviews} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <Link
                href={`/hire/${freelancer.id}`}
                className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center font-medium"
              >
                Hire {freelancer.full_name?.split(' ')[0] || 'Freelancer'}
              </Link>
              <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* About */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {freelancer.bio || 'This freelancer has not provided a bio yet.'}
                    </p>
                  </div>
                </div>

                {/* Skills */}
                {freelancer.freelancer_skills && freelancer.freelancer_skills.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills & Expertise</h2>
                    <div className="space-y-3">
                      {freelancer.freelancer_skills.map((skill, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h3 className="font-medium text-gray-900">{skill.skill_name}</h3>
                            <p className="text-sm text-gray-600">{skill.years_experience} years experience</p>
                          </div>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            skill.skill_level === 'expert' ? 'bg-purple-100 text-purple-800' :
                            skill.skill_level === 'advanced' ? 'bg-blue-100 text-blue-800' :
                            skill.skill_level === 'intermediate' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {skill.skill_level.charAt(0).toUpperCase() + skill.skill_level.slice(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Portfolio Links */}
                {(freelancer.portfolio_url || freelancer.github_url || freelancer.linkedin_url) && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio & Links</h2>
                    <div className="space-y-3">
                      {freelancer.portfolio_url && (
                        <a
                          href={freelancer.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                          <Globe className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-900 font-medium">Portfolio Website</span>
                          <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                        </a>
                      )}
                      {freelancer.github_url && (
                        <a
                          href={freelancer.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                          <Github className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-900 font-medium">GitHub Profile</span>
                          <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                        </a>
                      )}
                      {freelancer.linkedin_url && (
                        <a
                          href={freelancer.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                          <Linkedin className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-900 font-medium">LinkedIn Profile</span>
                          <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Stats Card */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Professional Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Award className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">Total Earned</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        ${freelancer.total_earnings.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">Rating</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {freelancer.rating}/5.0
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Code className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">Reviews</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {freelancer.total_reviews}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">Experience</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {freelancer.years_experience}+ years
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-emerald-50 rounded-lg p-6">
                  <h3 className="font-semibold text-emerald-900 mb-4">Ready to get started?</h3>
                  <p className="text-sm text-emerald-700 mb-4">
                    Contact {freelancer.full_name?.split(' ')[0] || 'this freelancer'} to discuss your project requirements and get a custom quote.
                  </p>
                  <Link
                    href={`/hire/${freelancer.id}`}
                    className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center font-medium"
                  >
                    Start a Project
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}