'use client'

import { ChurchIcon, Users2, BadgeCheck } from 'lucide-react'
import Section from '@/components/profile/Section'
import ProfileField from '@/components/profile/ProfileField'

interface SCCSectionProps {
  profile: any
  isEditing: boolean
  onUpdateField: (field: string, value: any) => void
}

export function SCCSection({ profile, isEditing, onUpdateField }: SCCSectionProps) {
  return (
    <Section title="SCC & Community" icon={ChurchIcon}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ProfileField
          label="Small Christian Community"
          value={profile.scc}
          icon={ChurchIcon}
          field="scc"
          isEditing={false}
          readonly={true}
          onChange={onUpdateField}
        />

        <ProfileField
          label="Family Name"
          value={profile.family_name}
          icon={Users2}
          field="family_name"
          isEditing={false}
          readonly={true}
          onChange={onUpdateField}
        />

        <div className="md:col-span-2">
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <BadgeCheck className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Membership Status:</strong> {profile.scc_membership?.status === 'active' ? '✅ Active' : '⏳ Pending Verification'}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {profile.scc_membership?.status === 'active'
                  ? 'You are an active member of this SCC family.'
                  : 'Your membership is pending verification by SCC leaders.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
