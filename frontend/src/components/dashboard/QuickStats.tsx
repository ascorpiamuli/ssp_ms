'use client'

import { Sparkles, Calendar, Church, Crown, Droplet, Users, Activity, UserCheck } from 'lucide-react'

interface QuickStatsProps {
  joinedDate?: string;
  scc?: string;
  leadershipRole?: string;
  bloodGroup?: string;
  totalMembers?: number;
  attendance?: number;
}

export function QuickStats({
  joinedDate,
  scc,
  leadershipRole,
  bloodGroup,
  totalMembers = 156,
  attendance = 84
}: QuickStatsProps) {

  const statItems = [
    { label: "Member Since", value: joinedDate || '2024', icon: Calendar, color: "#3b82f6", bgColor: "#eff6ff", darkBgColor: "#1e3a8a" },
    { label: "SCC", value: scc || 'Not Assigned', icon: Church, color: "#8b5cf6", bgColor: "#f5f3ff", darkBgColor: "#4c1d95" },
    { label: "Leadership", value: leadershipRole || 'Member', icon: Crown, color: "#f59e0b", bgColor: "#fffbeb", darkBgColor: "#854d0e" },
    { label: "Blood Group", value: bloodGroup || '—', icon: Droplet, color: "#ef4444", bgColor: "#fef2f2", darkBgColor: "#991b1b" }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-blue dark:text-brand-purple" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Quick Stats</h3>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {statItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700/50">
                <item.icon className="h-4 w-4" style={{ color: item.color }} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Community Engagement */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Community Engagement</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{attendance}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-blue dark:bg-brand-purple rounded-full transition-all duration-500"
              style={{ width: `${attendance}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">Total Members</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{totalMembers}</span>
          </div>
        </div>

        {/* Leadership Badge */}
        {leadershipRole && leadershipRole !== 'Member' && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-300">{leadershipRole} Role</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
