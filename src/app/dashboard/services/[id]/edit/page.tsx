/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Package, Plus, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import Link from 'next/link'

const serviceFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  category: z.enum(['web', 'mobile', 'design', 'consulting']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  base_price: z.string().optional(),
  price_unit: z.string().optional(),
  duration_estimate: z.string().optional(),
  display_order: z.string(),
  is_active: z.boolean(),
})

type ServiceFormData = z.infer<typeof serviceFormSchema >

export default function EditServicePage() {
  const params = useParams()
  const router = useRouter()
  const [service, setService] = useState<any>(null)
  const [features, setFeatures] = useState<string[]>([])
  const [newFeature, setNewFeature] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
  })

  useEffect(() => {
    if (params.id) {
      fetchService()
    }
  }, [params.id])

  const fetchService = async () => {
    try {
      const res = await fetch(`/api/admin/services/${params.id}`)
      const data = await res.json()
      
      if (data.success) {
        setService(data.data)
        setFeatures(data.data.features || [])
        
        // Reset form with service data
        reset({
          title: data.data.title,
          slug: data.data.slug,
          category: data.data.category,
          description: data.data.description,
          base_price: data.data.base_price?.toString() || '',
          price_unit: data.data.price_unit || '',
          duration_estimate: data.data.duration_estimate || '',
          display_order: data.data.display_order?.toString() || '',
          is_active: data.data.is_active,
        })
      } else {
        toast.error('Failed to fetch service')
        router.push('/dashboard/services')
      }
    } catch (error) {
      console.error('Failed to fetch service:', error)
      toast.error('Failed to fetch service')
      router.push('/dashboard/services')
    } finally {
      setLoading(false)
    }
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()])
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: ServiceFormData) => {
    setSubmitting(true)
    try {
      // Transform the data to match API expectations
      const transformedData = {
        title: data.title,
        slug: data.slug,
        category: data.category,
        description: data.description,
        base_price: data.base_price && data.base_price.trim() !== '' 
          ? parseFloat(data.base_price) 
          : undefined,
        price_unit: data.price_unit && data.price_unit.trim() !== '' 
          ? data.price_unit 
          : undefined,
        duration_estimate: data.duration_estimate && data.duration_estimate.trim() !== '' 
          ? data.duration_estimate 
          : undefined,
        display_order: data.display_order && data.display_order.trim() !== '' 
          ? parseInt(data.display_order) 
          : undefined,
        is_active: data.is_active,
      }

      const res = await fetch(`/api/admin/services/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transformedData,
          features: features.length > 0 ? features : null,
        }),
      })

      const result = await res.json()

      if (result.success) {
        toast.success(result.message)
        router.push('/dashboard/services')
      } else {
        toast.error(result.error || 'Failed to update service')
      }
    } catch (error) {
      console.error('Failed to update service:', error)
      toast.error('Failed to update service')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Service not found</p>
        <button
          onClick={() => router.push('/dashboard/services')}
          className="mt-4 text-emerald-600 hover:text-emerald-700"
        >
          Back to services
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/services')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to services
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">Edit Service</h1>
        <p className="text-gray-600 mt-2">
          Update service information and settings
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Title *
              </label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., E-commerce Website Development"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug *
              </label>
              <input
                {...register('slug')}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., ecommerce-website-development"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                {...register('category')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="web">Web Development</option>
                <option value="mobile">Mobile Apps</option>
                <option value="design">Design</option>
                <option value="consulting">Consulting</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                {...register('display_order')}
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="1"
              />
              <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Describe what this service includes and who it's for..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Timeline</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price
              </label>
              <input
                {...register('base_price')}
                type="number"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="2500"
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty for custom pricing</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Unit
              </label>
              <input
                {...register('price_unit')}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="per project"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration Estimate
              </label>
              <input
                {...register('duration_estimate')}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="4-6 weeks"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Features</h2>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Add a feature..."
              />
              <button
                type="button"
                onClick={addFeature}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {features.length > 0 && (
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg"
                  >
                    <span className="text-gray-700">{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Service Packages Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Service Packages</h2>
            <Link
              href={`/dashboard/services/${params.id}/packages`}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center text-sm"
            >
              <Package className="w-4 h-4 mr-2" />
              Manage Packages
            </Link>
          </div>
          
          {service.service_packages && service.service_packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {service.service_packages.map((pkg: any) => (
                <div key={pkg.id} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{pkg.name}</h3>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    ${pkg.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {pkg.delivery_days} days delivery
                  </p>
                  {pkg.is_popular && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                      Popular
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No packages created yet</p>
              <Link
                href={`/dashboard/services/${params.id}/packages`}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Create your first package
              </Link>
            </div>
          )}
        </div>        

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
          
          <label className="flex items-center space-x-3">
            <input
              {...register('is_active')}
              type="checkbox"
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <span className="text-gray-700">Service is active and visible to clients</span>
          </label>
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
              'Update Service'
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/services')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}