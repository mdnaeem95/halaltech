'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const serviceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  category: z.enum(['web', 'mobile', 'design', 'consulting']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  base_price: z.string().optional(),
  price_unit: z.string().optional(),
  duration_estimate: z.string().optional(),
  display_order: z.string().optional(),
  is_active: z.boolean(),
})

type ServiceForm = z.infer<typeof serviceSchema>

export default function NewServicePage() {
  const router = useRouter()
  const [features, setFeatures] = useState<string[]>([])
  const [newFeature, setNewFeature] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      is_active: true,
      category: 'web',
    },
  })

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setValue('slug', generateSlug(title))
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

  const onSubmit = async (data: ServiceForm) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          features: features.length > 0 ? features : undefined,
        }),
      })

      const result = await res.json()

      if (result.success) {
        toast.success(result.message)
        router.push('/dashboard/services')
      } else {
        toast.error(result.error || 'Failed to create service')
      }
    } catch (error) {
      console.error('Failed to create service:', error)
      toast.error('Failed to create service')
    } finally {
      setSubmitting(false)
    }
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
        
        <h1 className="text-3xl font-bold text-gray-900">Create New Service</h1>
        <p className="text-gray-600 mt-2">
          Add a new service to your offerings
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
                {...register('title', { onChange: handleTitleChange })}
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
              'Create Service'
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