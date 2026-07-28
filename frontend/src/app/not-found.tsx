
'use client'

import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 px-4">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
        {/* 404 Text */}
        <div className="space-y-2">
          <h1 className="text-8xl font-bold text-blue-600 dark:text-blue-400">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">
            Page Not Found
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3">
          <span className="w-8 h-px bg-slate-300 dark:bg-slate-700" />
          <span className="text-xs text-slate-400 dark:text-slate-500">PASBEST VENTURES</span>
          <span className="w-8 h-px bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/dashboard">
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
