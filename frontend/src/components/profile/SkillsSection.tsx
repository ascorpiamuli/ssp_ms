'use client'

import { Star, Heart, Sparkles } from 'lucide-react'
import Section from '@/components/profile/Section'

interface SkillsSectionProps {
  profile: any
  isEditing: boolean
  onUpdateField: (field: string, value: any) => void
}

export function SkillsSection({ profile, isEditing, onUpdateField }: SkillsSectionProps) {
  const renderTags = (value: any, label: string, field: string, placeholder: string) => {
    if (isEditing) {
      return (
        <input
          type="text"
          value={typeof value === 'string' ? value : Array.isArray(value) ? value.join(', ') : value || ''}
          onChange={(e) => onUpdateField(field, e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
        />
      )
    }

    const items = (() => {
      if (typeof value === 'string' && value) {
        return value.split(',').map((s: string) => s.trim()).filter((s: string) => s)
      }
      if (Array.isArray(value) && value.length) {
        return value
      }
      return []
    })()

    if (items.length === 0) {
      return <span className="text-sm text-gray-400 dark:text-gray-500 italic">No {label.toLowerCase()} listed</span>
    }

    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item: string, idx: number) => (
          <span key={idx} className="px-3 py-1.5 text-xs bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 rounded-full shadow-sm">
            {item}
          </span>
        ))}
      </div>
    )
  }

  return (
    <Section title="Skills & Interests" icon={Star}>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills</label>
          {renderTags(profile.skills, 'Skills', 'skills', 'e.g., Singing, Teaching, Leadership, Public Speaking')}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interests</label>
          {renderTags(profile.interests, 'Interests', 'interests', 'e.g., Bible Study, Music, Community Service, Sports')}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Talents</label>
          {renderTags(profile.talents, 'Talents', 'talents', 'e.g., Singing, Dancing, Public Speaking, Writing')}
        </div>
      </div>
    </Section>
  )
}
