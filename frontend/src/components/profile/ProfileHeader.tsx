'use client'

import { Edit2, Save, X, Loader2, Check } from 'lucide-react'

interface ProfileHeaderProps {
  isEditing: boolean
  saveStatus: 'idle' | 'saving' | 'success' | 'error'
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
}

export function ProfileHeader({ isEditing, saveStatus, onEdit, onCancel, onSave }: ProfileHeaderProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your personal information and community details
          </p>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={saveStatus === 'saving'}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-blue-dark hover:to-brand-purple-dark text-white transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saveStatus === 'saving' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : saveStatus === 'success' ? (
                  <>
                    <Check className="h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={onEdit}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md transition-all duration-200 flex items-center gap-2 text-sm font-medium"
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
