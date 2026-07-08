'use client'

import { Cross, Baby, Calendar, FileCheck } from 'lucide-react'
import Section from '@/components/profile/Section'
import ProfileField from '@/components/profile/ProfileField'

interface SacramentalSectionProps {
  profile: any
  isEditing: boolean
  onUpdateField: (field: string, value: any) => void
  latestCertificate: any
}

export function SacramentalSection({ profile, isEditing, onUpdateField, latestCertificate }: SacramentalSectionProps) {
  return (
    <Section title="Sacramental Information" icon={Cross}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ProfileField
          label="Baptismal Name"
          value={profile.baptismal_name}
          icon={Baby}
          field="baptismal_name"
          isEditing={isEditing}
          onChange={onUpdateField}
        />

        <ProfileField
          label="Baptism Date"
          value={profile.baptism_date}
          icon={Calendar}
          field="baptism_date"
          type="date"
          isEditing={isEditing}
          onChange={onUpdateField}
        />

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Baptismal Certificate
          </label>
          {latestCertificate ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <FileCheck className="h-5 w-5 text-green-500" />
              <a
                href={latestCertificate.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-blue hover:underline text-sm font-medium"
              >
                View Certificate (Uploaded: {new Date(latestCertificate.created_at).toLocaleDateString()})
              </a>
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">No certificate uploaded</p>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Cross className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-purple-800 dark:text-purple-300">
                <strong>Sacramental Status:</strong> {profile.is_baptised ? '✅ Baptised' : '❌ Not Baptised'} | {profile.is_confirmed ? '✅ Confirmed' : '❌ Not Confirmed'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
