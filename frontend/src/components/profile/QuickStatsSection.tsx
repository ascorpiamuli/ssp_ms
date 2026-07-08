// src/components/profile/QuickStatsSection.tsx
'use client'

import { Calendar, Users, Award, Droplet, Heart, Shield } from 'lucide-react'

interface QuickStatsSectionProps {
  joinedDate?: string
  scc?: string | null  // Changed to accept null
  leadershipRole?: string
  bloodGroup?: string | null  // Changed to accept null
  familyName?: string | null  // Changed to accept null
  sccStatus?: string
}

export function QuickStatsSection({
  joinedDate,
  scc,
  leadershipRole,
  bloodGroup,
  familyName,
  sccStatus
}: QuickStatsSectionProps) {
  const stats = [
    {
      icon: Calendar,
      label: 'Member Since',
      value: joinedDate ? new Date(joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'N/A',
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: Users,
      label: 'SCC Family',
      value: familyName || scc || 'Not Assigned',
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      icon: Shield,
      label: 'SCC Status',
      value: sccStatus || 'Pending',
      color: sccStatus === 'active' ? 'text-green-500' : 'text-yellow-500',
      bg: sccStatus === 'active' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    {
      icon: Award,
      label: 'Role',
      value: leadershipRole || 'Member',
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: Droplet,
      label: 'Blood Group',
      value: bloodGroup || 'Not Specified',
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20'
    },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-brand-blue dark:text-brand-purple" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Quick Stats</h3>
        </div>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className={`${stat.bg} rounded-xl p-3 transition-all hover:scale-105`}>
                <div className="flex items-center gap-3">
                  <div className={`${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
