import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { FormInput } from '../FormInput'
import { PasswordInput } from './PasswordInput'
import { LoadingButton } from '../LoadingButton'
import { LoginForm as LoginFormData, loginSchema } from '@/types/auth'

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<boolean>
  onForgotPassword: () => void
  isLoading: boolean
}

export const LoginForm = ({ onSubmit, onForgotPassword, isLoading }: LoginFormProps) => {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  })

  const handleSubmit = async (data: LoginFormData) => {
    const success = await onSubmit(data)
    if (!success) {
      form.setFocus('email')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
        autoComplete="current-password"
        error={form.formState.errors.password?.message}
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            {...form.register('rememberMe')}
            type="checkbox"
            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
          />
          <span className="ml-2 text-sm text-gray-600">Remember me</span>
        </label>
        
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <LoadingButton
        type="submit"
        isLoading={isLoading}
        className="w-full"
      >
        Sign In
      </LoadingButton>
    </form>
  )
}