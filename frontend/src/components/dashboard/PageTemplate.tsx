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
    <div className={cn(
      "min-h-screen bg-gray-50 dark:bg-gray-950",
      className
    )}>

      {/* Sticky Header */}
      <div className={cn(
        "sticky top-0 z-20 transition-all duration-300",
        isScrolled
          ? "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm"
          : "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
      )}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {/* Icon */}
              {icon && (
                <div className="hidden sm:flex p-2 rounded-lg bg-brand-blue/10">
                  {icon}
                </div>
              )}

              {/* Title Section */}
              <div className="min-w-0 flex-1">
                {/* Breadcrumbs */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-1 text-xs text-gray-500 dark:text-gray-400">
                    {breadcrumbs.map((crumb, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        {idx > 0 && <ChevronRight className="h-3 w-3 text-gray-400" />}
                        {crumb.href ? (
                          <a href={crumb.href} className="hover:text-brand-blue transition-colors">
                            {crumb.label}
                          </a>
                        ) : (
                          <span className={idx === breadcrumbs.length - 1 ? "text-gray-700 dark:text-gray-300" : ""}>
                            {crumb.label}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {title}
                </h1>

                {/* Description */}
                {description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            {actions && (
              <div className="flex items-center gap-2 ml-4">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            TUM CATHOLIC COMMUNITY — Treasury Management System
          </p>
        </div>
      </div>

    </div>
  )
}
