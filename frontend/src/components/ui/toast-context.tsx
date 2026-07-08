
  'use client'

  import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
  import { Toast, ToastType } from './toast'

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

  export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([])

    const removeToast = useCallback((id: string) => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    const showToast = useCallback((
      message: string,
      type: ToastType = 'info',
      duration: number = 5000
    ) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts(prev => [...prev, { id, message, type, duration }])

      // Auto remove after duration
      setTimeout(() => removeToast(id), duration + 300) // Add 300ms for exit animation
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
        {/* Toast container with stacking */}
        <div className="fixed top-6 right-6 z-[9999] space-y-3">
          {toasts.map((toast, index) => (
            <div
              key={toast.id}
              className="transition-all duration-300"
              style={{
                transform: `translateY(-${index * 0}px)`,
              }}
            >
              <Toast
                message={toast.message}
                type={toast.type}
                duration={toast.duration}
                visible={true}
                onClose={() => removeToast(toast.id)}
              />
            </div>
          ))}
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
