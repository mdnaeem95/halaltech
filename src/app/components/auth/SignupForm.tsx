/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { Mail, User, Building, Phone, AlertCircle } from 'lucide-react'
import { FormInput } from '../FormInput'
import { PasswordInput } from './PasswordInput'
import { LoadingButton } from '../LoadingButton'
import { type SignupFormData, signupSchema } from '@/types/auth'
import { getPasswordStrength } from '@/utils/auth/password-utils'

interface SignupFormProps {
  onSubmit: (data: SignupFormData) => Promise<any>
  isLoading: boolean
}

export const SignupForm = ({ onSubmit, isLoading }: SignupFormProps) => {
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' })
  
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      companyName: '',
      phone: '',
      agreeToTerms: false,
    },
  })

  const watchedPassword = form.watch('password')
  
  useEffect(() => {
    if (watchedPassword) {
      setPasswordStrength(getPasswordStrength(watchedPassword))
    }
  }, [watchedPassword])

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormInput
        {...form.register('fullName')}
        label="Full Name"
        type="text"
        icon={User}
        placeholder="Ahmad Ibrahim"
        autoComplete="name"
        error={form.formState.errors.fullName?.message}
        required
      />

      <FormInput
        {...form.register('email')}
        label="Email"
        type="email"
        icon={Mail}
        placeholder="you@example.com"
        autoComplete="email"
        error={form.formState.errors.email?.message}
        required
      />

      <PasswordInput
        {...form.register('password')}
        label="Password"
        placeholder="••••••••"
        autoComplete="new-password"
        error={form.formState.errors.password?.message}
        showStrength
        strengthScore={passwordStrength}
        value={watchedPassword}
      />

      <FormInput
        {...form.register('companyName')}
        label="Company Name"
        type="text"
        icon={Building}
        placeholder="Halal Fresh Groceries"
        autoComplete="organization"
      />

      <FormInput
        {...form.register('phone')}
        label="Phone"
        type="tel"
        icon={Phone}
        placeholder="+65 8123 4567"
        autoComplete="tel"
        error={form.formState.errors.phone?.message}
      />

      <div>
        <label className="flex items-start">
          <input
            {...form.register('agreeToTerms')}
            type="checkbox"
            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-0.5"
          />
          <span className="ml-2 text-sm text-gray-600">
            I agree to the{' '}
            <a href="/terms" target="_blank" className="text-emerald-600 hover:text-emerald-700 underline">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="/privacy" target="_blank" className="text-emerald-600 hover:text-emerald-700 underline">
              Privacy Policy
            </a>
          </span>
        </label>
        {form.formState.errors.agreeToTerms && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {form.formState.errors.agreeToTerms.message}
          </p>
        )}
      </div>

      <LoadingButton
        type="submit"
        isLoading={isLoading}
        className="w-full"
      >
        Create Account
      </LoadingButton>
    </form>
  )
}