import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { FormInput } from '../FormInput'
import { LoadingButton } from '../LoadingButton'
import { ForgotPasswordFormData } from '@/types/auth'
import { forgotPasswordSchema } from '@/types/auth'

interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordFormData) => Promise<boolean>
  isLoading: boolean
}

export const ForgotPasswordForm = ({ onSubmit, isLoading }: ForgotPasswordFormProps) => {
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormInput
        {...form.register('email')}
        label="Email Address"
        type="email"
        icon={Mail}
        placeholder="you@example.com"
        autoComplete="email"
        error={form.formState.errors.email?.message}
        required
      />

      <LoadingButton
        type="submit"
        isLoading={isLoading}
        className="w-full"
      >
        Send Reset Link
      </LoadingButton>
    </form>
  )
}