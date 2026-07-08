'use client'

import { HeartPulse, User, Phone, Users, Mail } from 'lucide-react'
import Section from '@/components/profile/Section'
import ProfileField from '@/components/profile/ProfileField'

interface EmergencyContactSectionProps {
  profile: any
  isEditing: boolean
  onUpdateField: (field: string, value: any) => void
}

export function EmergencyContactSection({ profile, isEditing, onUpdateField }: EmergencyContactSectionProps) {
  return (
    <Section title="Emergency Contact" icon={HeartPulse}>
      <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 mb-5 border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">
            In case of emergency, please contact:
          </p>
        </div>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Name:</span>
            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
              {profile.emergency_contact_name || 'Not set'}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Phone:</span>
            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
              {profile.emergency_contact_phone || 'Not set'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <ProfileField
            label="Contact Name"
            value={profile.emergency_contact_name}
            icon={User}
            field="emergency_contact_name"
            isEditing={isEditing}
            onChange={onUpdateField}
            required
          />
        </div>

        <div className="md:col-span-2">
          <ProfileField
            label="Contact Phone"
            value={profile.emergency_contact_phone}
            icon={Phone}
            field="emergency_contact_phone"
            type="tel"
            isEditing={isEditing}
            onChange={onUpdateField}
            required
          />
        </div>

        <ProfileField
          label="Relationship"
          value={profile.emergency_contact_relation}
          icon={Users}
          field="emergency_contact_relation"
          isEditing={isEditing}
          onChange={onUpdateField}
        />

        <ProfileField
          label="Contact Email"
          value={profile.emergency_contact_email}
          icon={Mail}
          field="emergency_contact_email"
          type="email"
          isEditing={isEditing}
          onChange={onUpdateField}
        />
      </div>
    </Section>
  )
}
