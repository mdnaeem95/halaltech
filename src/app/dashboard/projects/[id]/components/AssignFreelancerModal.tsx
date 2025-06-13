'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Search, 
  Star, 
  DollarSign, 
  Check,
  Loader2,
  Clock,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { FreelancerProfile } from '@/types/freelancer'

const assignmentSchema = z.object({
  freelancer_id: z.string().min(1, 'Please select a freelancer'),
  payment_type: z.enum(['hourly', 'fixed']),
  hourly_rate: z.string().optional(),
  fixed_price: z.string().optional(),
  estimated_hours: z.string().optional(),
  notes: z.string().optional(),
})

type AssignmentForm = z.infer<typeof assignmentSchema>

interface AssignFreelancerModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectTitle: string
  serviceCategory: string
  onSuccess: () => void
}

export default function AssignFreelancerModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  serviceCategory,
  onSuccess
}: AssignFreelancerModalProps) {
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([])
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerProfile | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<AssignmentForm>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      payment_type: 'hourly',
    },
  })

  const paymentType = watch('payment_type')

  useEffect(() => {
    if (isOpen) {
      fetchFreelancers()
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedFreelancer) {
      setValue('freelancer_id', selectedFreelancer.id)
      if (paymentType === 'hourly' && selectedFreelancer.hourly_rate) {
        setValue('hourly_rate', selectedFreelancer.hourly_rate.toString())
      }
    }
  }, [selectedFreelancer, paymentType, setValue])

  const fetchFreelancers = async () => {
    try {
      const params = new URLSearchParams({
        availability_status: 'available',
        category: serviceCategory,
      })

      const res = await fetch(`/api/freelancers?${params.toString()}`)
      const data = await res.json()
      
      if (data.success) {
        setFreelancers(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch freelancers:', error)
      toast.error('Failed to load freelancers')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: AssignmentForm) => {
    setSubmitting(true)
    try {
      const assignmentData = {
        freelancer_id: data.freelancer_id,
        payment_type: data.payment_type,
        ...(data.payment_type === 'hourly' 
          ? { 
              hourly_rate: parseFloat(data.hourly_rate!),
              estimated_hours: data.estimated_hours ? parseInt(data.estimated_hours) : undefined
            }
          : { fixed_price: parseFloat(data.fixed_price!) }
        ),
        notes: data.notes,
      }

      const res = await fetch(`/api/projects/${projectId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData),
      })

      const result = await res.json()

      if (result.success) {
        toast.success('Freelancer assigned successfully!')
        reset()
        onSuccess()
        onClose()
      } else {
        toast.error(result.error || 'Failed to assign freelancer')
      }
    } catch (error) {
      console.error('Assignment error:', error)
      toast.error('Failed to assign freelancer')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredFreelancers = freelancers.filter(freelancer => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      freelancer.full_name?.toLowerCase().includes(searchLower) ||
      freelancer.email.toLowerCase().includes(searchLower) ||
      freelancer.freelancer_skills?.some(skill => 
        skill.skill_name.toLowerCase().includes(searchLower)
      )
    )
  })

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Assign Freelancer</h2>
                  <p className="text-sm text-gray-600 mt-1">For: {projectTitle}</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              {/* Freelancer Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Freelancer
                </label>
                
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by name or skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  </div>
                ) : (
                  <div className="grid gap-3 max-h-64 overflow-y-auto">
                    {filteredFreelancers.map(freelancer => (
                      <label
                        key={freelancer.id}
                        className={`relative rounded-lg border-2 p-4 cursor-pointer transition ${
                          selectedFreelancer?.id === freelancer.id
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          value={freelancer.id}
                          {...register('freelancer_id')}
                          onChange={() => setSelectedFreelancer(freelancer)}
                          className="sr-only"
                        />
                        
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h4 className="font-medium text-gray-900">
                                {freelancer.full_name || 'Freelancer'}
                              </h4>
                              {selectedFreelancer?.id === freelancer.id && (
                                <Check className="w-5 h-5 text-emerald-600 ml-2" />
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <span className="flex items-center">
                                <DollarSign className="w-3 h-3 mr-1" />
                                ${freelancer.hourly_rate}/hour
                              </span>
                              <span className="flex items-center">
                                <Star className="w-3 h-3 mr-1 text-yellow-400" />
                                {freelancer.rating} ({freelancer.total_reviews})
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {freelancer.years_experience} years
                              </span>
                            </div>
                            
                            {freelancer.freelancer_skills && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {freelancer.freelancer_skills.slice(0, 4).map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                                  >
                                    {skill.skill_name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                    
                    {filteredFreelancers.length === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        No available freelancers found
                      </p>
                    )}
                  </div>
                )}
                
                {errors.freelancer_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.freelancer_id.message}</p>
                )}
              </div>

              {/* Payment Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`relative rounded-lg border-2 p-3 cursor-pointer transition ${
                        paymentType === 'hourly'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          value="hourly"
                          {...register('payment_type')}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <Clock className="w-6 h-6 mx-auto mb-1 text-gray-600" />
                          <span className="font-medium">Hourly</span>
                        </div>
                      </label>
                      
                      <label className={`relative rounded-lg border-2 p-3 cursor-pointer transition ${
                        paymentType === 'fixed'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          value="fixed"
                          {...register('payment_type')}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <DollarSign className="w-6 h-6 mx-auto mb-1 text-gray-600" />
                          <span className="font-medium">Fixed Price</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {paymentType === 'hourly' ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hourly Rate (SGD) *
                        </label>
                        <input
                          {...register('hourly_rate')}
                          type="number"
                          step="5"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="50"
                        />
                        {selectedFreelancer && (
                          <p className="mt-1 text-xs text-gray-500">
                            Freelancer&apos;s rate: ${selectedFreelancer.hourly_rate}/hour
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estimated Hours
                        </label>
                        <input
                          {...register('estimated_hours')}
                          type="number"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="40"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fixed Price (SGD) *
                      </label>
                      <input
                        {...register('fixed_price')}
                        type="number"
                        step="50"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="5000"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes for Freelancer
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Any special instructions or requirements..."
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  type="submit"
                  disabled={submitting || !selectedFreelancer}
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Assign Freelancer'
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}