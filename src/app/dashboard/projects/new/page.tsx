/* eslint-disable  @typescript-eslint/no-explicit-any */
// src/app/dashboard/projects/new/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

// Updated import to include package_id in the schema
const projectSchema = z.object({
  service_id: z.string().min(1, 'Please select a service'),
  package_id: z.string().optional(),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  requirements: z.string().optional(),
})

type ProjectForm = z.infer<typeof projectSchema>

interface ServicePackage {
  id: string
  name: string
  price: number
  delivery_days: number
  revisions: number | null
  features: string[] | null
  is_popular: boolean
}

export default function NewProjectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [services, setServices] = useState<any[]>([])
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [loadingPackages, setLoadingPackages] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      service_id: searchParams.get('service') || '',
      package_id: searchParams.get('package') || '',
    }
  })

  const watchedServiceId = watch('service_id')
  const watchedPackageId = watch('package_id')

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    if (watchedServiceId) {
      fetchServicePackages(watchedServiceId)
    } else {
      setPackages([])
      setValue('package_id', '')
    }
  }, [watchedServiceId])

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

  const fetchServicePackages = async (serviceId: string) => {
    setLoadingPackages(true)
    try {
      const res = await fetch(`/api/services/${serviceId}/packages`)
      const data = await res.json()
      if (data.success) {
        setPackages(data.data)
        
        // If we came from service detail modal with a package selected, ensure it's still selected
        const preselectedPackage = searchParams.get('package')
        if (preselectedPackage && data.data.some((pkg: ServicePackage) => pkg.id === preselectedPackage)) {
          setValue('package_id', preselectedPackage)
        }
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error)
    } finally {
      setLoadingPackages(false)
    }
  }

  const onSubmit = async (data: ProjectForm) => {
    setSubmitting(true)
    try {
      const submitData = {
        ...data,
        package_id: data.package_id || undefined,
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      const result = await res.json()

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

  const selectedPackage = packages.find(pkg => pkg.id === watchedPackageId)

  if (loadingServices) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Selection</h2>
          
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
                  {service.title} - {service.base_price ? `From $${service.base_price.toLocaleString()}` : 'Custom Pricing'}
                </option>
              ))}
            </select>
            {errors.service_id && (
              <p className="mt-1 text-sm text-red-600">{errors.service_id.message}</p>
            )}
          </div>

          {/* Package Selection */}
          {watchedServiceId && packages.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Package (Optional)
              </label>
              {loadingPackages ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-3 gap-4">
                    {packages.map((pkg) => (
                      <label
                        key={pkg.id}
                        className={`relative rounded-lg border-2 p-4 cursor-pointer transition ${
                          watchedPackageId === pkg.id
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          {...register('package_id')}
                          value={pkg.id}
                          className="sr-only"
                        />
                        
                        {pkg.is_popular && (
                          <span className="absolute -top-2 left-4 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full inline-flex items-center">
                            <Check className="w-3 h-3 mr-0.5" />
                            Popular
                          </span>
                        )}
                        
                        <div className="font-semibold text-gray-900">{pkg.name}</div>
                        <div className="text-xl font-bold text-emerald-600 mt-1">
                          ${pkg.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          {pkg.delivery_days} days delivery
                        </div>
                        {pkg.revisions && (
                          <div className="text-sm text-gray-600">
                            {pkg.revisions} revisions
                          </div>
                        )}
                        
                        {pkg.features && pkg.features.length > 0 && (
                          <ul className="mt-3 space-y-1">
                            {pkg.features.slice(0, 3).map((feature, idx) => (
                              <li key={idx} className="text-xs text-gray-600 flex items-start">
                                <Check className="w-3 h-3 text-emerald-500 mr-1 mt-0.5 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                            {pkg.features.length > 3 && (
                              <li className="text-xs text-gray-500">
                                +{pkg.features.length - 3} more
                              </li>
                            )}
                          </ul>
                        )}
                      </label>
                    ))}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setValue('package_id', '')}
                    className="mt-3 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear selection (request custom quote)
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Selected Package Summary */}
        {selectedPackage && (
          <div className="bg-emerald-50 rounded-lg p-4">
            <h3 className="font-semibold text-emerald-900 mb-2">Selected Package: {selectedPackage.name}</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-emerald-700">Price:</span>
                <span className="font-semibold ml-1">${selectedPackage.price.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-emerald-700">Delivery:</span>
                <span className="font-semibold ml-1">{selectedPackage.delivery_days} days</span>
              </div>
              {selectedPackage.revisions && (
                <div>
                  <span className="text-emerald-700">Revisions:</span>
                  <span className="font-semibold ml-1">{selectedPackage.revisions}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h2>
          
          <div className="space-y-4">
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
          </div>
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

      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>We&apos;ll review your project requirements within 24 hours</li>
          {!selectedPackage && <li>Our team will prepare a detailed quote and timeline</li>}
          <li>We&apos;ll schedule a consultation call to discuss your project</li>
          <li>Once approved, we&apos;ll begin work on your project immediately</li>
        </ol>
      </div>
    </div>
  )
}