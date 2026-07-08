'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // SSPMS is a management system - always redirect to login
    // No public website, only authenticated access
    router.push('/login');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/40">
      <div className="flex flex-col items-center gap-4">
        {/* Logo/Icon */}
        <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
          <Building2 className="h-8 w-8 text-white" />
        </div>

        {/* Loading Spinner */}
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />

        {/* Loading Text */}
        <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
          Redirecting to login...
        </p>
      </div>
    </div>
  );
}
