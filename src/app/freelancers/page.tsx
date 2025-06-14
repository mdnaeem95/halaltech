// src/app/freelancer/onboarding/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  User,
  DollarSign,
  Code,
  Briefcase,
  Calendar,
  Link,
  Loader2,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Check
} from 'lucide-react'
import { FreelancerOnboardingData } from '@/types/freelancer'

const onboardingSchema = z.object({
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  hourly_rate: z.string().min(1, 'Hourly rate is required'),
  years_experience: z.string().min(1, 'Years of experience is required'),
  skills: z.array(z.object({
    skill_name: z.string().min(1, 'Skill name is required'),
    skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    years_experience: z.string(),
  })).min(1, 'Add at least one skill'),
  portfolio_url: z.string().optional(),
  linkedin_url: z.string().optional(),
  github_url: z.string().optional(),
})

type FormData = z.infer<typeof onboardingSchema>

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]

const SKILL_SUGGESTIONS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'Python',
  'Django', 'Flutter', 'React Native', 'iOS Development', 'Android Development',
  'UI/UX Design', 'Figma', 'Adobe XD', 'WordPress', 'Shopify', 'Laravel'
]

export default function FreelancerOnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [availability, setAvailability] = useState(
    DAYS_OF_WEEK.map((_, index) => ({
      day_of_week: index,
      start_time: '09:00',
      end_time: '18:00',
      is_available: index >= 1 && index <= 5, // Mon-Fri by default
    }))
  )

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      skills: [{ skill_name: '', skill_level: 'intermediate', years_experience: '1' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'skills',
  })

  const steps = [
    { title: 'Basic Information', icon: User },
    { title: 'Skills & Experience', icon: Code },
    { title: 'Availability', icon: Calendar },
    { title: 'Links & Portfolio', icon: Link },
  ]

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = []
    
    switch (currentStep) {
      case 0:
        fieldsToValidate = ['bio', 'hourly_rate', 'years_experience']
        break
      case 1:
        fieldsToValidate = ['skills']
        break
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      const transformedData: FreelancerOnboardingData = {
        bio: data.bio,
        hourly_rate: parseFloat(data.hourly_rate),
        years_experience: parseInt(data.years_experience),
        skills: data.skills.map(skill => ({
          ...skill,
          years_experience: parseInt(skill.years_experience),
        })),
        portfolio_url: data.portfolio_url || undefined,
        linkedin_url: data.linkedin_url || undefined,
        github_url: data.github_url || undefined,
        availability,
      }

      const res = await fetch('/api/freelancers/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformedData),
      })

      const result = await res.json()

      if (result.success) {
        toast.success('Welcome to TechHalal! Your freelancer profile is ready.')
        router.push('/dashboard')
      } else {
        toast.error(result.error || 'Failed to complete onboarding')
      }
    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error('Failed to complete onboarding')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleDayAvailability = (dayIndex: number) => {
    setAvailability(prev => prev.map((day, idx) => 
      idx === dayIndex ? { ...day, is_available: !day.is_available } : day
    ))
  }

  const updateDayTime = (dayIndex: number, field: 'start_time' | 'end_time', value: string) => {
    setAvailability(prev => prev.map((day, idx) => 
      idx === dayIndex ? { ...day, [field]: value } : day
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                      index === currentStep
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : index < currentStep
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 w-full max-w-[100px] mx-2 ${
                        index < currentStep ? 'bg-emerald-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <p
                key={index}
                className={`text-sm ${
                  index === currentStep ? 'text-emerald-600 font-medium' : 'text-gray-500'
                }`}
              >
                {step.title}
              </p>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 0: Basic Information */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Tell us about yourself
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Professional Bio *
                    </label>
                    <textarea
                      {...register('bio')}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Describe your experience, expertise, and what makes you unique..."
                    />
                    {errors.bio && (
                      <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {watch('bio')?.length || 0}/50 characters minimum
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Hourly Rate (SGD) *
                      </label>
                      <input
                        {...register('hourly_rate')}
                        type="number"
                        step="5"
                        min="10"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="50"
                      />
                      {errors.hourly_rate && (
                        <p className="mt-1 text-sm text-red-600">{errors.hourly_rate.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Briefcase className="w-4 h-4 inline mr-1" />
                        Years of Experience *
                      </label>
                      <input
                        {...register('years_experience')}
                        type="number"
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="5"
                      />
                      {errors.years_experience && (
                        <p className="mt-1 text-sm text-red-600">{errors.years_experience.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Skills & Experience */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Your Skills & Expertise
                  </h2>

                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-gray-900">Skill {index + 1}</h4>
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

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Skill Name *
                            </label>
                            <input
                              {...register(`skills.${index}.skill_name`)}
                              type="text"
                              list={`skill-suggestions-${index}`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              placeholder="e.g., React"
                            />
                            <datalist id={`skill-suggestions-${index}`}>
                              {SKILL_SUGGESTIONS.map(skill => (
                                <option key={skill} value={skill} />
                              ))}
                            </datalist>
                            {errors.skills?.[index]?.skill_name && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.skills[index]?.skill_name?.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Skill Level *
                            </label>
                            <select
                              {...register(`skills.${index}.skill_level`)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                              <option value="expert">Expert</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Years Experience
                            </label>
                            <input
                              {...register(`skills.${index}.years_experience`)}
                              type="number"
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              placeholder="2"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => append({ skill_name: '', skill_level: 'intermediate', years_experience: '1' })}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Another Skill
                  </button>
                </div>
              )}

              {/* Step 2: Availability */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Your Availability
                  </h2>

                  <p className="text-gray-600 mb-4">
                    Set your typical working hours. You can always adjust these later.
                  </p>

                  <div className="space-y-3">
                    {DAYS_OF_WEEK.map((day, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 ${
                          availability[index].is_available ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={availability[index].is_available}
                              onChange={() => toggleDayAvailability(index)}
                              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                            />
                            <span className="font-medium text-gray-900">{day}</span>
                          </label>

                          {availability[index].is_available && (
                            <div className="flex items-center space-x-2">
                              <input
                                type="time"
                                value={availability[index].start_time}
                                onChange={(e) => updateDayTime(index, 'start_time', e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              />
                              <span className="text-gray-500">to</span>
                              <input
                                type="time"
                                value={availability[index].end_time}
                                onChange={(e) => updateDayTime(index, 'end_time', e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Links & Portfolio */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Portfolio & Social Links
                  </h2>

                  <p className="text-gray-600 mb-4">
                    Add links to showcase your work and professional profiles (optional).
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Portfolio Website
                      </label>
                      <input
                        {...register('portfolio_url')}
                        type="url"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="https://yourportfolio.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn Profile
                      </label>
                      <input
                        {...register('linkedin_url')}
                        type="url"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GitHub Profile
                      </label>
                      <input
                        {...register('github_url')}
                        type="url"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">What&apos;s Next?</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                      <li>Your profile will be reviewed by our team</li>
                      <li>You&apos;ll be able to add portfolio items from your dashboard</li>
                      <li>Start receiving project invitations matched to your skills</li>
                      <li>Track your time and earnings through the platform</li>
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex items-center px-4 py-2 rounded-lg transition ${
                  currentStep === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Complete Onboarding
                      <Check className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}