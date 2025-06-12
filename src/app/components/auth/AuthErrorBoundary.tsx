// src/components/auth/AuthErrorBoundary.tsx
import React from 'react'
import toast from 'react-hot-toast'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

export class AuthErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Auth error:', error, errorInfo)
    toast.error('An authentication error occurred. Please try again.')
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center">
          <p className="text-red-600">Something went wrong with authentication.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-blue-600 underline"
          >
            Reload page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}