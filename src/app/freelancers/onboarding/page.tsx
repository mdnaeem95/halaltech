// src/app/freelancers/onboarding/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  User,
  DollarSign,
  Code,
  Calendar,
  Link,
  Loader2,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle
} from 'lucide-react'

const onboardingSchema = z.object({
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  hourly_rate: z.string().min(1, 'Hourly rate is required'),
  years_experience: z.string().min(1, 'Years of experience is required'),
  skills: z.array(z.object({
    skill_name: z.string().min(1, 'Skill name is required'),
    skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    years_experience: z.string(),
  })).min(1, 'Add at least one skill'),
  portfolio_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  github_url: z.string().url('Invalid URL').optional().or(z.literal('')),
})

type FormData = z.infer<typeof onboardingSchema>

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]

const SKILL_SUGGESTIONS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'Python',
  'Django', 'Flutter', 'React Native', 'iOS Development', 'Android Development',
  'UI/UX Design', 'Figma', 'Adobe XD', 'WordPress', 'Shopify', 'Laravel',
  'PHP', 'MySQL', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes'
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
      case 3:
        fieldsToValidate = ['portfolio_url', 'linkedin_url', 'github_url']
        break
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate)
      if (!isValid) return
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      const formattedData = {
        ...data,
        hourly_rate: parseFloat(data.hourly_rate),
        years_experience: parseInt(data.years_experience),
        skills: data.skills.map(skill => ({
          ...skill,
          years_experience: parseInt(skill.years_experience),
        })),
        availability,
      }

      const response = await fetch('/api/freelancers/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Profile completed successfully!')
        router.push('/dashboard/freelancer')
      } else {
        toast.error(result.error || 'Failed to complete profile')
      }
    } catch (error) {
      console.error('Error submitting onboarding:', error)
      toast.error('Something went wrong. Please try again.')
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

  const addSkillSuggestion = (skillName: string) => {
    const existingIndex = fields.findIndex(field => field.skill_name === skillName)
    if (existingIndex === -1) {
      append({ skill_name: skillName, skill_level: 'intermediate', years_experience: '1' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm">
          {/* Progress Bar */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      index <= currentStep
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 w-24 mx-2 ${
                        index < currentStep ? 'bg-emerald-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {steps[currentStep].title}
            </h1>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <AnimatePresence mode="wait">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Professional Bio *
                      </label>
                      <textarea
                        {...register('bio')}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Tell clients about your experience, expertise, and what makes you unique..."
                      />
                      {errors.bio && (
                        <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hourly Rate (USD) *
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            {...register('hourly_rate')}
                            type="number"
                            min="10"
                            step="5"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="50"
                          />
                        </div>
                        {errors.hourly_rate && (
                          <p className="mt-1 text-sm text-red-600">{errors.hourly_rate.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Years of Experience *
                        </label>
                        <input
                          {...register('years_experience')}
                          type="number"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Your Skills</h3>
                        <button
                          type="button"
                          onClick={() => append({ skill_name: '', skill_level: 'intermediate', years_experience: '1' })}
                          className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                        >
                          + Add Skill
                        </button>
                      </div>

                      {/* Skill Suggestions */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Quick add:</p>
                        <div className="flex flex-wrap gap-2">
                          {SKILL_SUGGESTIONS.slice(0, 8).map(skill => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => addSkillSuggestion(skill)}
                              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition"
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        {fields.map((field, index) => (
                          <div key={field.id} className="bg-gray-50 p-4 rounded-lg">
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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Skill Name *
                                </label>
                                <input
                                  {...register(`skills.${index}.skill_name`)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                  placeholder="e.g., React"
                                />
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

                      {errors.skills && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.skills.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Availability */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Set Your Working Hours
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Select the days you&apos;re available and set your preferred working hours.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {DAYS_OF_WEEK.map((day, index) => (
                        <div
                          key={day}
                          className={`border rounded-lg p-4 transition ${
                            availability[index].is_available
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={availability[index].is_available}
                                onChange={() => toggleDayAvailability(index)}
                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                              />
                              <span className="ml-2 font-medium text-gray-900">{day}</span>
                            </label>

                            {availability[index].is_available && (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="time"
                                  value={availability[index].start_time}
                                  onChange={(e) => updateDayTime(index, 'start_time', e.target.value)}
                                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                  type="time"
                                  value={availability[index].end_time}
                                  onChange={(e) => updateDayTime(index, 'end_time', e.target.value)}
                                  className="px-3 py-1 border border-gray-300 rounded text-sm"
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
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Share Your Work
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Add links to showcase your portfolio and professional profiles.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Portfolio Website
                        </label>
                        <div className="relative">
                          <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            {...register('portfolio_url')}
                            type="url"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="https://yourportfolio.com"
                          />
                        </div>
                        {errors.portfolio_url && (
                          <p className="mt-1 text-sm text-red-600">{errors.portfolio_url.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          LinkedIn Profile
                        </label>
                        <div className="relative">
                          <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            {...register('linkedin_url')}
                            type="url"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="https://linkedin.com/in/yourprofile"
                          />
                        </div>
                        {errors.linkedin_url && (
                          <p className="mt-1 text-sm text-red-600">{errors.linkedin_url.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          GitHub Profile
                        </label>
                        <div className="relative">
                          <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            {...register('github_url')}
                            type="url"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="https://github.com/yourusername"
                          />
                        </div>
                        {errors.github_url && (
                          <p className="mt-1 text-sm text-red-600">{errors.github_url.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-900">
                            Profile Review Process
                          </h4>
                          <p className="mt-1 text-sm text-blue-700">
                            After submission, your profile will be reviewed by our team. You&apos;ll receive an email notification once approved, typically within 24-48 hours.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`px-6 py-2 rounded-lg font-medium transition flex items-center ${
                  currentStep === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </button>

              {currentStep === steps.length - 1 ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Complete Profile
                      <Check className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition flex items-center"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}