'use client'

import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <this.props.fallback error={this.state.error!} resetError={this.resetError} />
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-md">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Something went wrong
              </h3>
              <p className="text-gray-600">
                An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={this.resetError} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Refresh Page
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Alert variant="destructive" className="mt-4 text-left">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-mono text-xs">
                  {this.state.error.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 