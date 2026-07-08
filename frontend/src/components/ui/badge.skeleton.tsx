import { Skeleton } from './skeleton'

interface BadgeSkeletonProps {
  count?: number
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "purple" | "pink" | "orange"
  size?: "default" | "sm" | "lg"
  className?: string
}

export function BadgeSkeleton({
  count = 1,
  variant = "default",
  size = "default",
  className = ""
}: BadgeSkeletonProps) {
  const getWidth = () => {
    switch (size) {
      case "sm": return "w-12"
      case "lg": return "w-24"
      default: return "w-16"
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-6 ${getWidth()} rounded-full ${className}`}
        />
      ))}
    </div>
  )
}
