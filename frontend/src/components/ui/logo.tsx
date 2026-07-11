import Image from 'next/image'
import { cn } from '../../lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
  collapsed?: boolean
}

export function Logo({ className, showText = true, collapsed = false }: LogoProps) {
  return (
    <div className={cn("flex items-center justify-center group", className)}>
      {/* Logo Image - Hidden in dark mode */}
      <div className={cn(
        "relative flex-shrink-0 transition-all duration-300",
        "hover:scale-105 active:scale-95",
        "dark:hidden", // Hide in dark mode
        collapsed ? "h-12 w-12" : "h-18 w-38"
      )}>
        <Image
          src="/images/logo.png"
          alt="SSPMIS"
          fill
          className="object-cover drop-shadow-lg transition-all duration-300"
          priority
        />
      </div>

      {/* Text - Always visible in dark mode, controlled by showText in light mode */}
      <div className={cn(
        "flex flex-col min-w-0 ml-3 transition-all duration-300",
        // In dark mode: always show
        // In light mode: show only if showText is true and not collapsed
        (!showText || collapsed) ? "hidden dark:flex" : "flex"
      )}>
        <span className={cn(
          "font-extrabold text-2xl leading-tight tracking-tight",
          // Light mode: gradient, Dark mode: white text
          "bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent",
          "dark:text-white dark:bg-none",
          "drop-shadow-sm",
          "transition-all duration-300",
          "group-hover:scale-105 group-hover:origin-left"
        )}>
          SSPMIS
        </span>
        <span className={cn(
          "text-xs font-medium tracking-wider uppercase",
          "text-gray-500 dark:text-blue-200",
          "transition-all duration-300",
          "group-hover:text-blue-600 dark:group-hover:text-white"
        )}>
          School Supplies & Purchases
        </span>
      </div>

      {/* Show only text on mobile when collapsed */}
      {showText && collapsed && (
        <span className="sr-only">School Supplies & Purchases Management Information System</span>
      )}
    </div>
  )
}
