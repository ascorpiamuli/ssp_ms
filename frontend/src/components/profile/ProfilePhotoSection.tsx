'use client'

import { useRef } from 'react'
import { Camera, Upload, Loader2, UserCircle } from 'lucide-react'

interface ProfilePhotoSectionProps {
  photo: string | null
  isEditing: boolean
  isUploading: boolean
  onPhotoUpload: (file: File) => void
}

export function ProfilePhotoSection({ photo, isEditing, isUploading, onPhotoUpload }: ProfilePhotoSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onPhotoUpload(file)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-brand-blue dark:text-brand-purple" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Profile Photo</h3>
        </div>
      </div>
      <div className="p-6 flex flex-col items-center">
        <div className="relative mb-5">
          <div className="w-36 h-36 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center overflow-hidden shadow-lg ring-4 ring-white dark:ring-gray-700">
            {photo ? (
              <img src={photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="h-24 w-24 text-white" />
            )}
          </div>
          {isEditing && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-1 right-1 p-2.5 bg-gradient-to-r from-brand-blue to-brand-purple text-white rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {isEditing ? 'Click the camera icon to change your photo' : 'Your profile photo'}
        </p>
        {isUploading && (
          <p className="text-xs text-gray-400 mt-2 animate-pulse">Uploading...</p>
        )}
      </div>
    </div>
  )
}
