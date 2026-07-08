
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
        <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-brand-blue dark:border-brand-purple border-t-transparent animate-spin"></div>
      </div>
    </div>
  )
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="h-5 w-5 rounded-full border-2 border-brand-blue dark:border-brand-purple border-t-transparent animate-spin"></div>
          <p className="text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
          <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-brand-blue dark:border-brand-purple border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
}

export function LoadingButton() {
  return (
    <div className="inline-flex items-center space-x-2">
      <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
      <span>Loading...</span>
    </div>
  )
}
