'use client'

import { ReactNode, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronRight, Sparkles, LayoutGrid } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface PageTemplateProps {
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  actions?: ReactNode
  className?: string
  breadcrumbs?: { label: string; href?: string }[]
  variant?: 'default' | 'centered' | 'compact' | 'full'
  background?: 'default' | 'gradient' | 'glass' | 'minimal'
  animated?: boolean
  modals?: ReactNode
}

export function PageTemplate({
  title,
  description,
  icon,
  children,
  actions,
  className,
  breadcrumbs,
  variant = 'default',
  background = 'default',
  animated = true,
  modals,
}: PageTemplateProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Background variants - UPDATED to use bg-background for pure black in dark mode
  const getBackgroundStyles = () => {
    switch (background) {
      case 'gradient':
        return {
          main: 'bg-gradient-to-br from-blue-50/50 via-background to-indigo-50/50 dark:from-background dark:via-background dark:to-indigo-950/30',
          header: 'bg-white/80 dark:bg-background/80 backdrop-blur-xl',
          content: 'bg-white/60 dark:bg-background/60 backdrop-blur-sm',
        }
      case 'glass':
        return {
          main: 'bg-background/50 backdrop-blur-sm',
          header: 'bg-white/70 dark:bg-background/70 backdrop-blur-xl border border-white/20 dark:border-gray-800/20',
          content: 'bg-white/40 dark:bg-background/40 backdrop-blur-sm border border-white/10 dark:border-gray-800/10',
        }
      case 'minimal':
        return {
          main: 'bg-background',
          header: 'bg-background',
          content: 'bg-background',
        }
      default:
        return {
          main: 'bg-background/80',
          header: 'bg-white/90 dark:bg-background/90 backdrop-blur-xl',
          content: 'bg-transparent',
        }
    }
  }

  const bgStyles = getBackgroundStyles()

  // Animation variants
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.05,
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  }

  const headerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  }

  const contentVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, delay: 0.1 }
    }
  }

  const iconVariants = {
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, -5, 0],
      transition: { duration: 0.5 }
    }
  }

  // Content wrapper styles based on variant
  const getContentWrapperStyles = () => {
    switch (variant) {
      case 'centered':
        return 'max-w-4xl mx-auto'
      case 'compact':
        return 'max-w-5xl mx-auto'
      case 'full':
        return 'w-full'
      default:
        return 'w-full'
    }
  }

  const Wrapper = animated ? motion.div : 'div'
  const ContentWrapper = animated ? motion.div : 'div'
  const HeaderWrapper = animated ? motion.div : 'div'

  return (
    <>
      <Wrapper
        className={cn(
          "min-h-screen transition-all duration-300 relative",
          bgStyles.main,
          className
        )}
        initial={animated ? "hidden" : undefined}
        animate={animated ? "visible" : undefined}
      >
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/3 dark:bg-indigo-500/5 rounded-full blur-3xl" />

          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
            <div className="h-full w-full" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }} />
          </div>
        </div>

        {/* Animated Gradient Orbs */}
        <div className="fixed inset-0 pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, -100, 0],
              y: [0, -50, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -100, 100, 0],
              y: [0, 50, -50, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute bottom-20 right-20 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl"
          />
        </div>

        {/* Sticky Header */}
        <HeaderWrapper
          className={cn(
            "sticky top-0 z-20 transition-all duration-300",
            bgStyles.header,
            isScrolled
              ? "shadow-lg shadow-gray-200/20 dark:shadow-black/40 border-b border-gray-200/50 dark:border-gray-800/50"
              : "border-b border-gray-200/30 dark:border-gray-800/30",
            variant === 'full' && "border-b-0"
          )}
          variants={animated ? headerVariants : undefined}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={cn(
            "px-4 sm:px-6 lg:px-8 py-4",
            variant === 'centered' ? "max-w-4xl mx-auto" : "",
            variant === 'compact' ? "max-w-5xl mx-auto" : ""
          )}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* Icon with animation */}
                {icon && (
                  <motion.div
                    className="hidden sm:flex p-2.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 flex-shrink-0 ring-1 ring-blue-500/20 dark:ring-blue-400/20 shadow-lg shadow-blue-500/5"
                    variants={iconVariants}
                    whileHover="hover"
                    animate={isHovered ? "hover" : undefined}
                  >
                    <div className="text-blue-600 dark:text-blue-400">
                      {icon}
                    </div>
                  </motion.div>
                )}

                {/* Title Section */}
                <div className="min-w-0 flex-1">
                  {/* Breadcrumbs with animated separator */}
                  {breadcrumbs && breadcrumbs.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-1 text-xs text-gray-500 dark:text-gray-400 overflow-x-auto">
                      {breadcrumbs.map((crumb, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center gap-1.5 whitespace-nowrap"
                        >
                          {idx > 0 && <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />}
                          {crumb.href ? (
                            <a
                              href={crumb.href}
                              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:underline"
                            >
                              {crumb.label}
                            </a>
                          ) : (
                            <span className={cn(
                              idx === breadcrumbs.length - 1
                                ? "text-gray-700 dark:text-gray-300 font-medium"
                                : ""
                            )}>
                              {crumb.label}
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Title with gradient */}
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent truncate">
                      {title}
                    </h1>
                    {isHovered && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                      >
                        <Sparkles className="h-4 w-4 text-blue-500" />
                      </motion.div>
                    )}
                  </div>

                  {/* Description */}
                  {description && (
                    <motion.p
                      className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {description}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Actions with glass effect */}
              {actions && (
                <motion.div
                  className="flex items-center gap-2 flex-shrink-0 p-1 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 }}
                >
                  {actions}
                </motion.div>
              )}
            </div>
          </div>
        </HeaderWrapper>

        {/* Main Content */}
        <div className="relative z-10">
          <div className={cn(
            "px-4 sm:px-6 lg:px-8 py-6",
            getContentWrapperStyles()
          )}>
            <ContentWrapper
              className={cn(
                "rounded-2xl transition-all duration-300",
                bgStyles.content,
                variant !== 'full' && "shadow-sm shadow-gray-200/20 dark:shadow-black/40",
                variant === 'centered' && "p-6 sm:p-8",
                variant === 'compact' && "p-6 sm:p-8",
                variant === 'default' && "p-4 sm:p-6",
                variant === 'full' && "p-0"
              )}
              variants={animated ? contentVariants : undefined}
            >
              {children}
            </ContentWrapper>
          </div>
        </div>
      </Wrapper>

      {/* Modals - Rendered at root level with proper backdrop */}
      {modals && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {modals}
        </div>
      )}
    </>
  )
}
