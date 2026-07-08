'use client'

import { useRef } from 'react'
import { Layers, CreditCard, User, Mail, Phone, Calendar, Droplet, Heart, Shield, Users, MapPin } from 'lucide-react'
import { FlipMembershipCard } from '@/components/dashboard/FlipMembershipCard'

interface MembershipCardSectionProps {
  userData: {
    fullName: string
    memberId: string
    registrationNumber: string
    scc: string
    joinedDate: string
    email: string
    phone: string
    bloodGroup: string
    emergencyContact: string
    emergencyPhone: string
    yearOfCompletion: string
    familyName: string
    parentsName: string
  }
}

export function MembershipCardSection({ userData }: MembershipCardSectionProps) {
  const frontCardRef = useRef<HTMLDivElement>(null)
  const backCardRef = useRef<HTMLDivElement>(null)

  // Custom styles for wider card
  const cardStyles = {
    width: '100%',
    maxWidth: '420px',
    minWidth: '320px',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-brand-blue/5 to-brand-purple/5 dark:from-brand-blue/10 dark:to-brand-purple/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-r from-brand-blue to-brand-purple rounded-lg">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Membership Card</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">Tap to flip</span>
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">↻</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 overflow-x-auto scrollbar-thin">
        <div className="flex justify-center" style={cardStyles}>
          <FlipMembershipCard
            userData={userData}
            frontRef={frontCardRef as React.RefObject<HTMLDivElement>}
            backRef={backCardRef as React.RefObject<HTMLDivElement>}
            isPrinting={false}
          />
        </div>
      </div>

    </div>
  )
}
