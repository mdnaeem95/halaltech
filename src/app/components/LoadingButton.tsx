import { Loader2 } from 'lucide-react'

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean
  children: React.ReactNode
}

export const LoadingButton = ({ isLoading, children, className = '', disabled, ...props }: LoadingButtonProps) => {
  return (
    <button
      disabled={isLoading || disabled}
      className={`bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        children
      )}
    </button>
  )
}