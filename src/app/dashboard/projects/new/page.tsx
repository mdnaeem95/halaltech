/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const projectSchema = z.object({
  service_id: z.string().min(1, 'Please select a service'),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  requirements: z.string().optional(),
})

type ProjectForm = z.infer<typeof projectSchema>

export default function NewProjectPage() {
  const router = useRouter()
  const [services, setServices] = useState<any[]>([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services')
      const data = await res.json()
      if (data.success) {
        setServices(data.data)
      } else {
        toast.error('Failed to load services')
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
      toast.error('Failed to load services')
    } finally {
      setLoadingServices(false)
    }
  }

  const onSubmit = async (data: ProjectForm) => {
    setSubmitting(true)
    try {
      console.log('Submitting project data:', data) // Debug log

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()
      console.log('API Response:', result) // Debug log

      if (result.success) {
        toast.success(result.message || 'Project inquiry submitted successfully!')
        router.push('/dashboard/projects')
      } else {
        toast.error(result.error || 'Failed to create project')
      }
    } catch (error) {
      console.error('Failed to create project:', error)
      toast.error('Failed to create project')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingServices) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/projects')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to projects
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">Start a New Project</h1>
        <p className="text-gray-600 mt-2">
          Tell us about your project and we&apos;ll get back to you with a quote
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Type *
            </label>
            <select
              {...register('service_id')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title} - From ${service.base_price?.toLocaleString() || 'Custom Pricing'}
                </option>
              ))}
            </select>
            {errors.service_id && (
              <p className="mt-1 text-sm text-red-600">{errors.service_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Title *
            </label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="e.g., E-commerce Website for Halal Cosmetics"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Description *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Describe your project goals, target audience, and what you hope to achieve..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specific Requirements (Optional)
            </label>
            <textarea
              {...register('requirements')}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="List any specific features, integrations, or technical requirements..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Submit Project Inquiry'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/projects')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>We&apos;ll review your project requirements within 24 hours</li>
          <li>Our team will prepare a detailed quote and timeline</li>
          <li>We&apos;ll schedule a consultation call to discuss your project</li>
          <li>Once approved, we&apos;ll begin work on your project immediately</li>
        </ol>
      </div>
    </div>
  )
}