'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { Toast, ToastType } from './toast'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

interface ToastItem {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Minimal styles - only essential animations
const useToastStyles = () => {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleId = 'toast-animation-styles'
      if (!document.getElementById(styleId)) {
        const styleSheet = document.createElement('style')
        styleSheet.id = styleId
        styleSheet.textContent = `
          @keyframes toastIn {
            0% { transform: translateY(-80px) scale(0.9); opacity: 0; }
            60% { transform: translateY(8px) scale(1.02); opacity: 1; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
          }
          @keyframes toastOut {
            0% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(-80px) scale(0.9); opacity: 0; }
          }
          @keyframes progressShrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `
        document.head.appendChild(styleSheet)
      }
    }
  }, [])
}

// Toast component with animations
const ToastItem = ({
  toast,
  onClose,
  index
}: {
  toast: ToastItem
  onClose: () => void
  index: number
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50 + (index * 60))
    return () => clearTimeout(timer)
  }, [index])

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => handleClose(), toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast.duration])

  const handleClose = () => {
    setIsExiting(true)
    setIsVisible(false)
    setTimeout(() => onClose(), 400)
  }

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  }

  const Icon = icons[toast.type]

  const colors = {
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      icon: 'text-emerald-500 dark:text-emerald-400',
      text: 'text-emerald-800 dark:text-emerald-200',
      progress: 'bg-emerald-500',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-950/40',
      border: 'border-red-200 dark:border-red-800/50',
      icon: 'text-red-500 dark:text-red-400',
      text: 'text-red-800 dark:text-red-200',
      progress: 'bg-red-500',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-200 dark:border-blue-800/50',
      icon: 'text-blue-500 dark:text-blue-400',
      text: 'text-blue-800 dark:text-blue-200',
      progress: 'bg-blue-500',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800/50',
      icon: 'text-amber-500 dark:text-amber-400',
      text: 'text-amber-800 dark:text-amber-200',
      progress: 'bg-amber-500',
    },
  }

  const color = colors[toast.type]

  return (
    <div
      className={cn(
        "w-full max-w-[500px] mx-auto transition-all duration-400",
        isVisible ? "animate-[toastIn_0.5s_ease-out_forwards]" : "opacity-0",
        isExiting && "animate-[toastOut_0.4s_ease-in_forwards]"
      )}
    >
      <div
        className={cn(
          "relative flex items-center gap-3 px-4 py-3.5 rounded-xl",
          "border shadow-lg",
          color.bg,
          color.border,
          "backdrop-blur-sm",
          "hover:shadow-xl transition-shadow duration-200"
        )}
      >
        {/* Icon */}
        <div className="flex-shrink-0">
          <Icon className={cn("h-5 w-5", color.icon)} />
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-medium leading-relaxed", color.text)}>
            {toast.message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className={cn(
            "flex-shrink-0 rounded-lg p-1 transition-all duration-200",
            "hover:bg-white/50 dark:hover:bg-white/10",
            "hover:scale-110 active:scale-95",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            color.icon
          )}
          aria-label="Close toast"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Progress bar */}
        {toast.duration && toast.duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-xl">
            <div
              className={cn("h-full rounded-b-xl", color.progress)}
              style={{
                width: '100%',
                animation: `progressShrink ${toast.duration}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useToastStyles()

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback((
    message: string,
    type: ToastType = 'info',
    duration: number = 4000
  ) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { id, message, type, duration }])

    setTimeout(() => removeToast(id), duration + 400)
  }, [removeToast])

  const success = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration)
  }, [showToast])

  const error = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration)
  }, [showToast])

  const info = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration)
  }, [showToast])

  const warning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration)
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      {/* Toast container - centered at top */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-[500px] px-4 pointer-events-none">
        <div className="flex flex-col items-center gap-2 pointer-events-auto">
          {toasts.map((toast, index) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onClose={() => removeToast(toast.id)}
              index={index}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
