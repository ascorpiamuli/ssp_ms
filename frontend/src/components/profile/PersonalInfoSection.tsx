'use client'

import { User, Mail, Phone, Calendar, Users, Globe, IdCard, Church, CreditCard } from 'lucide-react'
import Section from '@/components/profile/Section'
import ProfileField from '@/components/profile/ProfileField'

interface PersonalInfoSectionProps {
  profile: any
  isEditing: boolean
  onUpdateField: (field: string, value: any) => void
}

export function PersonalInfoSection({ profile, isEditing, onUpdateField }: PersonalInfoSectionProps) {
  return (
    <Section title="Personal Information" icon={User}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <ProfileField
            label="Member ID"
            value={profile.member_id}
            icon={CreditCard}
            field="member_id"
            isEditing={false}
            readonly={true}
            onChange={onUpdateField}
          />
        </div>

        <ProfileField
          label="Full Name"
          value={profile.full_name}
          icon={User}
          field="full_name"
          isEditing={isEditing}
          onChange={onUpdateField}
          required
        />

        <ProfileField
          label="Email Address"
          value={profile.email}
          icon={Mail}
          field="email"
          type="email"
          isEditing={false}
          readonly={true}
          onChange={onUpdateField}
        />

        <ProfileField
          label="Phone Number"
          value={profile.phone}
          icon={Phone}
          field="phone"
          type="tel"
          isEditing={isEditing}
          onChange={onUpdateField}
          required
        />

        <ProfileField
          label="Date of Birth"
          value={profile.date_of_birth?.split('T')[0] || ''}
          icon={Calendar}
          field="date_of_birth"
          type="date"
          isEditing={isEditing}
          onChange={onUpdateField}
          required
        />

        <ProfileField
          label="Gender"
          value={profile.gender}
          icon={Users}
          field="gender"
          type="select"
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' }
          ]}
          isEditing={isEditing}
          onChange={onUpdateField}
          required
        />

        <ProfileField
          label="Nationality"
          value={profile.nationality}
          icon={Globe}
          field="nationality"
          isEditing={isEditing}
          onChange={onUpdateField}
        />

        <ProfileField
          label="ID Number"
          value={profile.id_number}
          icon={IdCard}
          field="id_number"
          isEditing={isEditing}
          onChange={onUpdateField}
        />

        <ProfileField
          label="Home Parish"
          value={profile.home_parish}
          icon={Church}
          field="home_parish"
          isEditing={isEditing}
          onChange={onUpdateField}
        />
      </div>
    </Section>
  )
}
