import Image from 'next/image'
import { cn } from '../../lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
  collapsed?: boolean
}

export function Logo({ className, showText = true, collapsed = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "relative flex-shrink-0 transition-all duration-300",
        collapsed ? "h-8 w-8" : "h-10 w-10"
      )}>
        <Image
          src="/images/logo.png"
          alt="SSPMIS"
          fill
          className="object-contain"
          priority
        />
      </div>

      {showText && !collapsed && (
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-lg text-blue-600 dark:text-blue-400 leading-tight truncate">
            SSPMIS
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
            School Supplies & Purchases
          </span>
        </div>
      )}

      {showText && collapsed && (
        <span className="sr-only">School Supplies & Purchases Management Information System</span>
      )}
    </div>
  )
}
