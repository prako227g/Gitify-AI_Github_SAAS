import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8'
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  )
}

interface LoadingPageProps {
  text?: string
  className?: string
}

export function LoadingPage({ text = 'Loading...', className }: LoadingPageProps) {
  return (
    <div className={cn('flex min-h-[400px] items-center justify-center', className)}>
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  )
}

interface LoadingCardProps {
  text?: string
  className?: string
}

export function LoadingCard({ text = 'Loading...', className }: LoadingCardProps) {
  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <div className="text-center space-y-3">
        <LoadingSpinner size="md" />
        <p className="text-sm text-gray-500">{text}</p>
      </div>
    </div>
  )
} 