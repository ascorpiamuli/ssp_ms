'use client'

import { Sparkles, FileText, Globe2 } from 'lucide-react'
import Section from '@/components/profile/Section'
import ProfileField from '@/components/profile/ProfileField'

interface AboutSectionProps {
  profile: any
  isEditing: boolean
  onUpdateField: (field: string, value: any) => void
}

export function AboutSection({ profile, isEditing, onUpdateField }: AboutSectionProps) {
  return (
    <Section title="About Me" icon={Sparkles}>
      <div className="space-y-5">
        <ProfileField
          label="Bio"
          value={profile.bio}
          icon={FileText}
          field="bio"
          type="textarea"
          isEditing={isEditing}
          onChange={onUpdateField}
        />

        <ProfileField
          label="Website"
          value={profile.website}
          icon={Globe2}
          field="website"
          type="url"
          isEditing={isEditing}
          onChange={onUpdateField}
        />
      </div>
    </Section>
  )
}
