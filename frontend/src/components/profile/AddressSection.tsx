'use client'

import { MapPinned, Home, MapPin, Flag, Hash, Loader2 } from 'lucide-react'
import Section from '@/components/profile/Section'
import ProfileField from '@/components/profile/ProfileField'

interface AddressSectionProps {
  profile: any
  isEditing: boolean
  onUpdateField: (field: string, value: any) => void
  counties: { name: string; code: number }[]
  constituencies: { name: string; code: number }[]
  wards: { name: string; code: number }[]
  isLoadingConstituencies: boolean
  isLoadingWards: boolean
}

export function AddressSection({
  profile,
  isEditing,
  onUpdateField,
  counties,
  constituencies,
  wards,
  isLoadingConstituencies,
  isLoadingWards
}: AddressSectionProps) {
  return (
    <Section title="Address & Location" icon={MapPinned}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <ProfileField
            label="Residential Address"
            value={profile.residential_address}
            icon={Home}
            field="residential_address"
            isEditing={isEditing}
            onChange={onUpdateField}
          />
        </div>

        <ProfileField
          label="County"
          value={profile.county}
          icon={Flag}
          field="county"
          type="select"
          options={counties.map(county => ({ value: county.name, label: county.name }))}
          isEditing={isEditing}
          onChange={(field, value) => {
            onUpdateField(field, value)
            onUpdateField('constituency', '')
            onUpdateField('ward', '')
          }}
          required
        />

        <ProfileField
          label="Constituency"
          value={profile.constituency}
          icon={MapPin}
          field="constituency"
          type="select"
          options={constituencies.map(c => ({ value: c.name, label: c.name }))}
          isEditing={isEditing && !!profile.county}
          onChange={(field, value) => {
            onUpdateField(field, value)
            onUpdateField('ward', '')
          }}
          required
        />

        <ProfileField
          label="Ward"
          value={profile.ward}
          icon={MapPin}
          field="ward"
          type="select"
          options={wards.map(w => ({ value: w.name, label: w.name }))}
          isEditing={isEditing && !!profile.constituency}
          required
        />

        <ProfileField
          label="Postal Code"
          value={profile.postal_code}
          icon={Hash}
          field="postal_code"
          isEditing={isEditing}
          onChange={onUpdateField}
        />

        <div className="md:col-span-2">
          <ProfileField
            label="Physical Address"
            value={profile.physical_address}
            icon={MapPin}
            field="physical_address"
            isEditing={isEditing}
            onChange={onUpdateField}
          />
        </div>
      </div>
      {(isLoadingConstituencies || isLoadingWards) && (
        <div className="flex items-center gap-2 mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin text-brand-blue" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Loading location data...</span>
        </div>
      )}
    </Section>
  )
}
