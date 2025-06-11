/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Loader2, 
  Plus, 
  Trash2, 
  DollarSign,
  Calendar,
  Send,
  Package,
  CheckCircle,
  Info,
  RefreshCw
} from 'lucide-react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { format, addDays } from 'date-fns'

const quoteSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  deliverables: z.array(z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
  })).min(1, 'At least one deliverable is required'),
  payment_terms: z.string().min(10, 'Payment terms are required'),
  valid_days: z.string().min(1, 'Validity period is required'),
})

type QuoteForm = z.infer<typeof quoteSchema>

interface Project {
  id: string
  title: string
  description: string
  client: {
    full_name: string
    email: string
    company_name?: string
  }
  service: {
    title: string
    base_price?: number
  }
  package?: {
    id: string
    name: string
    price: number
    delivery_days: number
    revisions?: number
    features?: string[]
  }
  quoted_price?: number
  status: string
}

export default function CreateQuotePage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [existingQuote, setExistingQuote] = useState<any>(null)
  const [packageLoaded, setPackageLoaded] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<QuoteForm>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      amount: '',
      deliverables: [{ title: '', description: '' }],
      payment_terms: '50% upfront upon quote acceptance, 50% upon project completion',
      valid_days: '7',
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'deliverables',
  })

  const watchedAmount = watch('amount')
  const watchedValidDays = watch('valid_days')

  useEffect(() => {
    if (params.id) {
      fetchProjectAndQuote()
    }
  }, [params.id])

  // Auto-populate with package data using proper timing
  useEffect(() => {
    if (project && !packageLoaded) {
      // Use setTimeout to ensure form fields are registered before setting values
      setTimeout(() => {
        loadPackageData()
        setPackageLoaded(true)
      }, 0)
    }
  }, [project])

  const fetchProjectAndQuote = async () => {
    try {
      // Fetch project details
      const projectRes = await fetch(`/api/projects/${params.id}`)
      const projectData = await projectRes.json()
      
      if (projectData.success) {
        setProject(projectData.data)
        console.log('Project data loaded:', projectData.data) // Debug log
      } else {
        toast.error('Failed to fetch project')
        router.push('/dashboard/projects')
        return
      }

      // Check for existing quote
      const quoteRes = await fetch(`/api/projects/${params.id}/quote`)
      const quoteData = await quoteRes.json()
      
      if (quoteData.success && quoteData.data) {
        setExistingQuote(quoteData.data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load project details')
    } finally {
      setLoading(false)
    }
  }

  const loadPackageData = () => {
    if (!project) return

    console.log('Loading package data:', project.package) // Debug log

    // Prepare the form data object
    const formData: any = {}
    const packageDeliverables: { title: string; description: string }[] = []

    // Set initial amount based on package or service price
    if (project.package?.price) {
      formData.amount = project.package.price.toString()
      console.log('Setting amount from package:', project.package.price) // Debug log
      toast.success(`Amount pre-filled from ${project.package.name} package (${project.package.price})`)
    } else if (project.service?.base_price) {
      formData.amount = project.service.base_price.toString()
      console.log('Setting amount from service:', project.service.base_price) // Debug log
      toast.success('Amount pre-filled from service base price')
    }

    // Set deliverables based on package features
    if (project.package?.features && project.package.features.length > 0) {
      project.package.features.forEach(feature => {
        packageDeliverables.push({
          title: feature,
          description: ''
        })
      })
      
      // Add some default deliverables based on service type
      const additionalDeliverables = getDefaultDeliverablesForService(project.service.title)
      packageDeliverables.push(...additionalDeliverables)
      
      toast.success(`${project.package.features.length} deliverables loaded from ${project.package.name} package`)
    } else {
      // Load default deliverables based on service type
      const defaultDeliverables = getDefaultDeliverablesForService(project.service.title)
      packageDeliverables.push(...defaultDeliverables)
      
      if (defaultDeliverables.length > 0) {
        toast.success('Default deliverables loaded based on service type')
      }
    }

    // Update payment terms if package has specific terms
    if (project.package) {
      formData.payment_terms = `50% upfront upon quote acceptance, 50% upon project completion. Estimated delivery: ${project.package.delivery_days} days${project.package.revisions ? `. Includes ${project.package.revisions} rounds of revisions` : ''}.`
    }

    // Use reset instead of setValue for bulk updates (more reliable)
    reset({
      amount: formData.amount || '',
      deliverables: packageDeliverables.length > 0 ? packageDeliverables : [{ title: '', description: '' }],
      payment_terms: formData.payment_terms || '50% upfront upon quote acceptance, 50% upon project completion',
      valid_days: '7',
    })

    console.log('Form reset with:', {
      amount: formData.amount,
      deliverables: packageDeliverables.length,
      payment_terms: formData.payment_terms
    }) // Debug log
  }

  const getDefaultDeliverablesForService = (serviceTitle: string): { title: string; description: string }[] => {
    const serviceLower = serviceTitle.toLowerCase()
    
    if (serviceLower.includes('website') || serviceLower.includes('web')) {
      return [
        { title: 'Responsive Web Design', description: 'Mobile-friendly design that works on all devices' },
        { title: 'Content Management System', description: 'Easy-to-use admin panel for content updates' },
        { title: 'SEO Optimization', description: 'Basic search engine optimization setup' },
        { title: 'Testing & Quality Assurance', description: 'Comprehensive testing across browsers and devices' },
        { title: 'Training & Documentation', description: 'User guide and training session' }
      ]
    } else if (serviceLower.includes('mobile') || serviceLower.includes('app')) {
      return [
        { title: 'Native Mobile Application', description: 'iOS and/or Android native app development' },
        { title: 'User Interface Design', description: 'Intuitive and engaging mobile UI/UX' },
        { title: 'Backend Integration', description: 'API development and database setup' },
        { title: 'App Store Optimization', description: 'App store listing setup and optimization' },
        { title: 'Testing & Deployment', description: 'Comprehensive testing and app store submission' }
      ]
    } else if (serviceLower.includes('design')) {
      return [
        { title: 'Brand Identity Design', description: 'Logo, colors, typography, and brand guidelines' },
        { title: 'Digital Assets', description: 'Business cards, letterheads, and marketing materials' },
        { title: 'Style Guide', description: 'Comprehensive brand style guide document' },
        { title: 'Revisions & Refinements', description: 'Multiple rounds of design iterations' }
      ]
    }
    
    return [
      { title: 'Project Analysis & Planning', description: 'Detailed project requirements and timeline' },
      { title: 'Development & Implementation', description: 'Core development work and features' },
      { title: 'Testing & Quality Assurance', description: 'Comprehensive testing and bug fixes' },
      { title: 'Delivery & Support', description: 'Final delivery with documentation and support' }
    ]
  }

  const resetToPackageDefaults = () => {
    if (project) {
      setPackageLoaded(false)
      // Use setTimeout to ensure proper timing
      setTimeout(() => {
        loadPackageData()
        setPackageLoaded(true)
      }, 0)
    }
  }

  const calculateTax = (amount: number) => {
    return amount * 0.09 // 9% GST in Singapore
  }

  const onSubmit = async (data: QuoteForm) => {
    setSubmitting(true)
    try {
      const amount = parseFloat(data.amount)
      const validUntil = addDays(new Date(), parseInt(data.valid_days))

      const quoteData = {
        amount,
        deliverables: data.deliverables,
        payment_terms: data.payment_terms,
        valid_until: validUntil.toISOString(),
      }

      const res = await fetch(`/api/projects/${params.id}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      })

      const result = await res.json()

      if (result.success) {
        toast.success('Quote created and sent to client!')
        router.push(`/dashboard/projects/${params.id}`)
      } else {
        toast.error(result.error || 'Failed to create quote')
      }
    } catch (error) {
      console.error('Failed to create quote:', error)
      toast.error('Failed to create quote')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Project not found</p>
        <button
          onClick={() => router.push('/dashboard/projects')}
          className="mt-4 text-emerald-600 hover:text-emerald-700"
        >
          Back to projects
        </button>
      </div>
    )
  }

  if (existingQuote) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push(`/dashboard/projects/${params.id}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to project
          </button>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">Quote Already Exists</h2>
            <p className="text-yellow-800">
              A quote has already been created for this project on {format(new Date(existingQuote.created_at), 'MMM d, yyyy')}.
            </p>
            <div className="mt-3 text-sm text-yellow-700 space-y-1">
              <p>• Amount: ${existingQuote.amount.toLocaleString()}</p>
              <p>• Valid until: {format(new Date(existingQuote.valid_until), 'MMM d, yyyy')}</p>
              <p>• Status: {existingQuote.is_accepted ? 'Accepted' : 'Pending'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const amount = parseFloat(watchedAmount) || 0
  const tax = calculateTax(amount)
  const total = amount + tax

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/dashboard/projects/${params.id}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to project
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">Create Quote</h1>
        <p className="text-gray-600 mt-2">
          Prepare a detailed quote for {project.client.full_name}
        </p>
      </div>

      {/* Package Information Banner */}
      {project.package && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <Package className="w-5 h-5 text-emerald-600 mr-3" />
              <div>
                <h3 className="font-semibold text-emerald-900">
                  Package: {project.package.name}
                </h3>
                <p className="text-emerald-700 text-sm">
                  ${project.package.price.toLocaleString()} • {project.package.delivery_days} days
                  {project.package.revisions && ` • ${project.package.revisions} revisions`}
                </p>
                {project.package.features && (
                  <p className="text-emerald-600 text-xs mt-1">
                    {project.package.features.length} features auto-loaded as deliverables
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={resetToPackageDefaults}
              className="text-emerald-600 hover:text-emerald-800 text-sm flex items-center"
              title="Reset to package defaults"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Project Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Project</p>
            <p className="font-medium">{project.title}</p>
          </div>
          <div>
            <p className="text-gray-600">Client</p>
            <p className="font-medium">
              {project.client.full_name}
              {project.client.company_name && ` - ${project.client.company_name}`}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Service</p>
            <p className="font-medium">{project.service.title}</p>
          </div>
          {project.package && (
            <div>
              <p className="text-gray-600">Package</p>
              <p className="font-medium">{project.package.name} - ${project.package.price.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Pricing */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quote Amount (SGD) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('amount')}
                  type="number"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="5000"
                />
              </div>
              {project.package && (
                <p className="mt-1 text-xs text-gray-500">
                  <CheckCircle className="w-3 h-3 inline mr-1 text-emerald-500" />
                  Pre-filled from {project.package.name} package
                </p>
              )}
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quote Valid For (Days) *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('valid_days')}
                  type="number"
                  min="1"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="7"
                />
              </div>
              {watchedValidDays && (
                <p className="mt-1 text-xs text-gray-500">
                  Valid until: {format(addDays(new Date(), parseInt(watchedValidDays)), 'MMM d, yyyy')}
                </p>
              )}
              {errors.valid_days && (
                <p className="mt-1 text-sm text-red-600">{errors.valid_days.message}</p>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Price Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GST (9%)</span>
                <span className="font-medium">${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold">Total</span>
                <span className="font-semibold text-emerald-600">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deliverables */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Deliverables</h2>
            <button
              type="button"
              onClick={() => append({ title: '', description: '' })}
              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Deliverable
            </button>
          </div>

          {project.package && project.package.features && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center text-blue-800 text-sm">
                <Info className="w-4 h-4 mr-2" />
                <span>
                  {project.package.features.length} deliverables loaded from {project.package.name} package. 
                  You can modify, add, or remove items as needed.
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-gray-900">Deliverable {index + 1}</h4>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <input
                      {...register(`deliverables.${index}.title`)}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., Responsive Website Design"
                    />
                    {errors.deliverables?.[index]?.title && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.deliverables[index]?.title?.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <textarea
                      {...register(`deliverables.${index}.description`)}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Optional: Add more details about this deliverable"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Terms */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Terms</h2>
          <textarea
            {...register('payment_terms')}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="e.g., 50% upfront payment upon quote acceptance, 50% upon project completion"
          />
          {project.package && (
            <p className="mt-1 text-xs text-gray-500">
              <CheckCircle className="w-3 h-3 inline mr-1 text-emerald-500" />
              Terms updated to include {project.package.delivery_days} day delivery timeline
            </p>
          )}
          {errors.payment_terms && (
            <p className="mt-1 text-sm text-red-600">{errors.payment_terms.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send Quote to Client
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/projects/${params.id}`)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Quote Preview */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>Quote will be sent to {project.client.full_name} via email</li>
          <li>Client can review and accept/reject the quote from their dashboard</li>
          <li>If accepted, project status will automatically update to &quot;In Progress&quot;</li>
          <li>An invoice will be automatically generated for payment</li>
          <li>You&apos;ll receive a notification when the client responds</li>
        </ol>
      </div>
    </div>
  )
}