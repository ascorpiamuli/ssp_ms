import Link from 'next/link'
import { Heart, ExternalLink } from 'lucide-react'

export function DashboardFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-4 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Mobile Layout (stacked) */}
        <div className="flex flex-col items-center gap-3 text-center sm:hidden">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>© {currentYear} SSPMIS</span>
            <Heart className="h-2.5 w-2.5 text-red-500" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
            <a
              href="https://pasbestventures.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-0.5"
            >
              Pasbest Ventures
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
            <span className="text-gray-400">•</span>
            <a
              href="https://ascorpi.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-0.5"
            >
              Developer
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>

          <div className="flex gap-4 text-xs">
            <Link href="/privacy" className="text-gray-500 hover:text-blue-600 dark:text-gray-400">Privacy</Link>
            <Link href="/code-of-conduct" className="text-gray-500 hover:text-blue-600 dark:text-gray-400">Code of Conduct</Link>
            <Link href="/contact" className="text-gray-500 hover:text-blue-600 dark:text-gray-400">Contact</Link>
          </div>
        </div>

        {/* Desktop Layout (inline) */}
        <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-3 sm:gap-y-1 text-xs text-gray-500 dark:text-gray-400">
          <span>© {currentYear} SSPMIS</span>

          <Heart className="h-2.5 w-2.5 text-red-500" />

          <a
            href="https://pasbestventures.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-0.5"
          >
            Pasbest Ventures
            <ExternalLink className="h-2.5 w-2.5" />
          </a>

          <span>•</span>

          <a
            href="https://ascorpi.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-0.5"
          >
            Developer
            <ExternalLink className="h-2.5 w-2.5" />
          </a>

          <span>•</span>

          <div className="flex gap-3">
            <Link href="/privacy" className="hover:text-blue-600">Privacy</Link>
            <Link href="/code-of-conduct" className="hover:text-blue-600">Code of Conduct</Link>
            <Link href="/contact" className="hover:text-blue-600">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
