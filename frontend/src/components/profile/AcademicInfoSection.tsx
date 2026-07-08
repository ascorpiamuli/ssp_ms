'use client'

import { GraduationCap, BookOpen, Award, School, Building2, Calendar, Hash } from 'lucide-react'
import Section from '@/components/profile/Section'
import ProfileField from '@/components/profile/ProfileField'

interface AcademicInfoSectionProps {
  profile: any
  isEditing: boolean
  onUpdateField: (field: string, value: any) => void
  years: number[]
  futureYears: number[]
}

export function AcademicInfoSection({ profile, isEditing, onUpdateField, years, futureYears }: AcademicInfoSectionProps) {
  return (
    <Section title="Academic Information" icon={GraduationCap}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <ProfileField
            label="Registration Number"
            value={profile.registration_number}
            icon={Hash}
            field="registration_number"
            isEditing={isEditing}
            onChange={onUpdateField}
            required
          />
        </div>

        <div className="md:col-span-2">
          <ProfileField
            label="Course / Program"
            value={profile.course}
            icon={BookOpen}
            field="course"
            isEditing={isEditing}
            onChange={onUpdateField}
            required
          />
        </div>

        <ProfileField
          label="Year of Study"
          value={profile.year_of_study}
          icon={Award}
          field="year_of_study"
          type="select"
          options={[
            { value: '1', label: 'Year 1' },
            { value: '2', label: 'Year 2' },
            { value: '3', label: 'Year 3' },
            { value: '4', label: 'Year 4' },
            { value: '5+', label: 'Year 5+' }
          ]}
          isEditing={isEditing}
          onChange={onUpdateField}
          required
        />

        <ProfileField
          label="Faculty"
          value={profile.faculty}
          icon={School}
          field="faculty"
          isEditing={isEditing}
          onChange={onUpdateField}
        />

        <ProfileField
          label="Department"
          value={profile.department}
          icon={Building2}
          field="department"
          isEditing={isEditing}
          onChange={onUpdateField}
        />

        <ProfileField
          label="Admission Year"
          value={profile.admission_year}
          icon={Calendar}
          field="admission_year"
          type="select"
          options={years.map(year => ({ value: year.toString(), label: year.toString() }))}
          isEditing={isEditing}
          onChange={onUpdateField}
          required
        />

        <ProfileField
          label="Expected Graduation"
          value={profile.expected_graduation}
          icon={Calendar}
          field="expected_graduation"
          type="select"
          options={[{ value: '', label: 'Not specified' }, ...futureYears.map(year => ({ value: year.toString(), label: year.toString() }))]}
          isEditing={isEditing}
          onChange={onUpdateField}
        />
      </div>
    </Section>
  )
}
