'use client'

import { ReactNode, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

interface PageTemplateProps {
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  actions?: ReactNode
  className?: string
  breadcrumbs?: { label: string; href?: string }[]
}

export function PageTemplate({
  title,
  description,
  icon,
  children,
  actions,
  className,
  breadcrumbs
}: PageTemplateProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div>

      {/* Sticky Header */}
      <div className={cn(
        "sticky top-0 z-20 transition-all duration-300",
        isScrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-800/80 shadow-lg shadow-gray-200/20 dark:shadow-gray-950/20"
          : "bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800/50"
      )}>
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Icon */}
              {icon && (
                <div className="hidden sm:flex p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 flex-shrink-0 ring-1 ring-blue-500/10 dark:ring-blue-400/10">
                  {icon}
                </div>
              )}

              {/* Title Section */}
              <div className="min-w-0 flex-1">
                {/* Breadcrumbs */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-1 text-xs text-gray-500 dark:text-gray-400 overflow-x-auto">
                    {breadcrumbs.map((crumb, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 whitespace-nowrap">
                        {idx > 0 && <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />}
                        {crumb.href ? (
                          <a href={crumb.href} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {crumb.label}
                          </a>
                        ) : (
                          <span className={idx === breadcrumbs.length - 1 ? "text-gray-700 dark:text-gray-300 font-medium" : ""}>
                            {crumb.label}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {title}
                </h1>

                {/* Description */}
                {description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            {actions && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - FULL WIDTH, NO RESTRICTIONS */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full">
          {children}
        </div>
      </div>

    </div>
  )
}
