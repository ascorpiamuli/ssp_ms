'use client'

import { forwardRef } from 'react'
import { Logo } from '@/components/ui/logo'
import { BadgeCheck, QrCode, Mail, Phone, Heart, Shield, Cross } from 'lucide-react'

interface DownloadableCardProps {
  side: 'front' | 'back'
  userData: {
    fullName: string;
    registrationNumber: string;
    scc: string;
    joinedDate?: string;
    email?: string;
    phone?: string;
    bloodGroup?: string;
    emergencyContact?: string;
    yearOfCompletion?: string;
    familyName?: string;
    parentsName?: string;
  }
}

export const DownloadableCard = forwardRef<HTMLDivElement, DownloadableCardProps>(
  ({ side, userData }, ref) => {
    const currentYear = new Date().getFullYear()
    const memberId = `TUMC-${currentYear}-${Math.floor(Math.random() * 10000)}`

    const purple = '#7c3aed'
    const darkPurple = '#6d28d9'

    const cardStyle: React.CSSProperties = {
      width: '480px',
      minHeight: '420px',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      overflow: 'hidden',
      background: side === 'front' ? purple : darkPurple,
      position: 'relative'
    }

    const contentStyle: React.CSSProperties = {
      position: 'relative',
      zIndex: 10,
      padding: '24px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '420px'
    }

    const patternOverlay: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      opacity: 0.05,
      backgroundImage: 'repeating-linear-gradient(45deg, #ffffff 0px, #ffffff 2px, transparent 2px, transparent 8px)',
      pointerEvents: 'none'
    }

    if (side === 'front') {
      return (
        <div ref={ref} style={cardStyle}>
          <div style={patternOverlay} />
          <div style={contentStyle}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '8px' }}>
                  <div style={{ width: '40px', height: '40px', color: 'white' }}>
                    <Logo collapsed={false} />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>MEMBER ID</p>
                  <p style={{ fontSize: '10px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.8)' }}>{memberId}</p>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '6px' }}>{userData.fullName || 'Member Name'}</h3>
                {userData.familyName && <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>Family: {userData.familyName}</p>}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <BadgeCheck style={{ height: '12px', width: '12px', color: '#4ade80' }} />
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>Active Member</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', margin: '20px 0' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px' }}>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', textTransform: 'uppercase' }}>Reg No.</p>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: 'white' }}>{userData.registrationNumber || '—'}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px' }}>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', textTransform: 'uppercase' }}>SCC</p>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: 'white' }}>{userData.scc || '—'}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px' }}>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', textTransform: 'uppercase' }}>Year of Completion</p>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: 'white' }}>{userData.yearOfCompletion || '—'}</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode style={{ height: '20px', width: '20px', color: 'rgba(255,255,255,0.5)' }} />
                <div>
                  <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)' }}>VALID</p>
                  <p style={{ fontSize: '10px', fontWeight: 600, color: 'white' }}>{currentYear + 1}</p>
                </div>
              </div>
              <div>
                <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)' }}>Member since</p>
                <p style={{ fontSize: '10px', color: 'white' }}>{userData.joinedDate || currentYear}</p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Back card
    return (
      <div ref={ref} style={cardStyle}>
        <div style={patternOverlay} />
        <div style={{ ...contentStyle, justifyContent: 'flex-start' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '8px' }}>
              <Cross style={{ height: '24px', width: '24px', color: 'white' }} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', marginTop: '8px' }}>Emergency Information</h4>
          </div>

          <div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Mail style={{ height: '14px', width: '14px', color: 'rgba(255,255,255,0.7)' }} />
              <span style={{ fontSize: '12px', color: 'white' }}>{userData.email || 'Email not provided'}</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Phone style={{ height: '14px', width: '14px', color: 'rgba(255,255,255,0.7)' }} />
              <span style={{ fontSize: '12px', color: 'white' }}>{userData.phone || 'Phone not provided'}</span>
            </div>

            {userData.emergencyContact && (
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Heart style={{ height: '14px', width: '14px', color: 'rgba(255,255,255,0.7)' }} />
                <span style={{ fontSize: '12px', color: 'white' }}>Emergency: {userData.emergencyContact}</span>
              </div>
            )}

            {userData.bloodGroup && (
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Shield style={{ height: '14px', width: '14px', color: 'rgba(255,255,255,0.7)' }} />
                <span style={{ fontSize: '12px', color: 'white' }}>Blood Group: {userData.bloodGroup}</span>
              </div>
            )}
          </div>

          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            This card is the property of TUM Catholic Community.<br />
            If found, please return to the community office or contact any SCC leader.
          </div>
        </div>
      </div>
    )
  }
)

DownloadableCard.displayName = 'DownloadableCard'
