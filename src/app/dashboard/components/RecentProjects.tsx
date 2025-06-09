/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowRight } from 'lucide-react'

interface RecentProjectsProps {
  userId: string
  role: string
}

export default function RecentProjects({ role }: RecentProjectsProps) {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      if (data.success) {
        setProjects(data.data.slice(0, 5)) // Show only 5 recent projects
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      inquiry: { bg: 'bg-gray-100', text: 'text-gray-800' },
      quoted: { bg: 'bg-blue-100', text: 'text-blue-800' },
      in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      review: { bg: 'bg-purple-100', text: 'text-purple-800' },
      completed: { bg: 'bg-green-100', text: 'text-green-800' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
    }

    const config = statusConfig[status] || statusConfig.inquiry

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/dashboard/projects/${project.id}`}
            className="block p-6 hover:bg-gray-50 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  {project.title}
                </h3>
                {role === 'admin' && project.client && (
                  <p className="text-sm text-gray-600 mt-1">
                    {project.client.company_name || project.client.full_name}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(project.created_at), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {getStatusBadge(project.status)}
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="p-4 bg-gray-50">
        <Link
          href="/dashboard/projects"
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center"
        >
          View all projects
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  )
}