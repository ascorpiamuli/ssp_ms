'use client'
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose?: () => void
  visible: boolean
}

const toastIcons = {
  success: <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />,
  error: <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-300" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-300" />,
  info: <Info className="h-5 w-5 text-sky-600 dark:text-sky-300" />
}

const toastStyles = {
  success: 'bg-emerald-500/90 dark:bg-emerald-600/90 backdrop-blur-md border-emerald-400/50 dark:border-emerald-500/50 shadow-lg shadow-emerald-500/20',
  error: 'bg-rose-500/90 dark:bg-rose-600/90 backdrop-blur-md border-rose-400/50 dark:border-rose-500/50 shadow-lg shadow-rose-500/20',
  warning: 'bg-amber-500/90 dark:bg-amber-600/90 backdrop-blur-md border-amber-400/50 dark:border-amber-500/50 shadow-lg shadow-amber-500/20',
  info: 'bg-sky-500/90 dark:bg-sky-600/90 backdrop-blur-md border-sky-400/50 dark:border-sky-500/50 shadow-lg shadow-sky-500/20'
}

export function Toast({ message, type = 'info', duration = 5000, onClose, visible }: ToastProps) {
  const [isVisible, setIsVisible] = useState(visible)
  const [isExiting, setIsExiting] = useState(false)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (visible) {
      setIsVisible(true)
      setIsExiting(false)
      setProgress(100)

      const startTime = Date.now()
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
        setProgress(remaining)

        if (remaining <= 0) {
          clearInterval(interval)
        }
      }, 10)

      return () => clearInterval(interval)
    }
  }, [visible, duration])

  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true)
        setTimeout(() => {
          setIsVisible(false)
          onClose?.()
        }, 500)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [visible, duration, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] overflow-hidden">
      <div
        className={cn(
          "relative flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl",
          toastStyles[type],
          "transition-all duration-500 ease-out w-80",
          isExiting
            ? "translate-x-[120%] opacity-0"
            : "translate-x-0 opacity-100"
        )}
      >
        {/* Progress bar */}
        <div
          className="absolute bottom-0 left-0 h-1 bg-white/70 rounded-b-xl transition-all duration-150 ease-linear"
          style={{ width: `${progress}%` }}
        />

        {/* Icon container */}
        <div className="relative flex-shrink-0">
          <div className={cn(
            "absolute inset-0 animate-pulse rounded-full opacity-30 blur-md",
            type === 'success' && 'bg-emerald-300',
            type === 'error' && 'bg-rose-300',
            type === 'warning' && 'bg-amber-300',
            type === 'info' && 'bg-sky-300'
          )} />
          <div className={cn(
            "relative rounded-full p-2 bg-white/30 dark:bg-white/20 backdrop-blur-sm",
          )}>
            {toastIcons[type]}
          </div>
        </div>

        {/* Message */}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={() => {
            setIsExiting(true)
            setTimeout(() => {
              setIsVisible(false)
              onClose?.()
            }, 500)
          }}
          className="flex-shrink-0 rounded-lg p-1.5 bg-white/30 hover:bg-white/50 dark:bg-white/20 dark:hover:bg-white/30 transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-sm"
        >
          <X className="h-4 w-4 text-gray-700 dark:text-gray-200" />
        </button>
      </div>
    </div>
  )
}
