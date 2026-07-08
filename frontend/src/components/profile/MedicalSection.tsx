'use client'

import { Stethoscope, Activity, AlertTriangle, AlertCircle } from 'lucide-react'
import Section from '@/components/profile/Section'
import ProfileField from '@/components/profile/ProfileField'

interface MedicalSectionProps {
  profile: any
  isEditing: boolean
  onUpdateField: (field: string, value: any) => void
}

export function MedicalSection({ profile, isEditing, onUpdateField }: MedicalSectionProps) {
  return (
    <Section title="Medical Information" icon={Stethoscope}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ProfileField
          label="Blood Group"
          value={profile.blood_group}
          icon={Activity}
          field="blood_group"
          type="select"
          options={[
            { value: 'A+', label: 'A+' },
            { value: 'A-', label: 'A-' },
            { value: 'B+', label: 'B+' },
            { value: 'B-', label: 'B-' },
            { value: 'O+', label: 'O+' },
            { value: 'O-', label: 'O-' },
            { value: 'AB+', label: 'AB+' },
            { value: 'AB-', label: 'AB-' }
          ]}
          isEditing={isEditing}
          onChange={onUpdateField}
        />

        <div className="md:col-span-2">
          <ProfileField
            label="Medical Conditions"
            value={profile.medical_conditions}
            icon={AlertTriangle}
            field="medical_conditions"
            type="textarea"
            isEditing={isEditing}
            onChange={onUpdateField}
          />
        </div>

        <div className="md:col-span-2">
          <ProfileField
            label="Allergies"
            value={profile.allergies}
            icon={AlertCircle}
            field="allergies"
            type="textarea"
            isEditing={isEditing}
            onChange={onUpdateField}
          />
        </div>
      </div>
    </Section>
  )
}
