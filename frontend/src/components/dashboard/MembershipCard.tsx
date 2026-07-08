'use client'

import { Logo } from '@/components/ui/logo'
import { BadgeCheck, QrCode } from 'lucide-react'

interface MembershipCardData {
  fullName: string;
  registrationNumber: string;
  scc: string;
  joinedDate?: string;
}

export function MembershipCard({ userData, cardRef }: { userData: MembershipCardData; cardRef?: React.RefObject<HTMLDivElement> }) {
  const currentYear = new Date().getFullYear()
  const memberId = `TUMC-${currentYear}-${Math.floor(Math.random() * 10000)}`

  // Pure hex gradient - no lab() colors
  const cardStyle = {
    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4c1d95 100%)',
    borderRadius: '16px',
    maxWidth: '400px',
    width: '100%',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  }

  const patternStyle = {
    position: 'absolute' as const,
    inset: 0,
    opacity: 0.1,
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M54 12L48 6 42 12 48 18 54 12zM12 48L6 42 0 48 6 54 12 48z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
    backgroundRepeat: 'repeat'
  }

  const blurTopStyle = {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    width: '128px',
    height: '128px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '9999px',
    filter: 'blur(32px)'
  }

  const blurBottomStyle = {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    width: '128px',
    height: '128px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '9999px',
    filter: 'blur(32px)'
  }

  const contentStyle = {
    position: 'relative' as const,
    zIndex: 10,
    padding: '20px'
  }

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: '16px'
  }

  const logoContainerStyle = {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(4px)',
    borderRadius: '12px',
    padding: '8px'
  }

  const logoStyle = {
    width: '40px',
    height: '40px',
    color: 'white'
  }

  const memberIdContainerStyle = {
    textAlign: 'right' as const
  }

  const memberIdLabelStyle = {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: '0.05em'
  }

  const memberIdValueStyle = {
    fontSize: '10px',
    fontFamily: 'monospace',
    color: 'rgba(255,255,255,0.8)'
  }

  const memberInfoStyle = {
    marginBottom: '16px'
  }

  const memberNameStyle = {
    fontSize: '18px',
    fontWeight: 'bold' as const,
    color: 'white'
  }

  const statusStyle = {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '8px',
    marginTop: '4px'
  }

  const statusTextStyle = {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.7)'
  }

  const detailsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    marginBottom: '16px'
  }

  const detailBoxStyle = {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '8px'
  }

  const detailLabelStyle = {
    fontSize: '9px',
    color: 'rgba(255,255,255,0.5)'
  }

  const detailValueStyle = {
    fontSize: '11px',
    fontWeight: 500,
    color: 'white',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis'
  }

  const footerStyle = {
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingTop: '12px',
    borderTop: '1px solid rgba(255,255,255,0.2)'
  }

  const qrSectionStyle = {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '8px'
  }

  const validLabelStyle = {
    fontSize: '8px',
    color: 'rgba(255,255,255,0.4)'
  }

  const validValueStyle = {
    fontSize: '10px',
    fontWeight: 600,
    color: 'white'
  }

  const memberSinceStyle = {
    textAlign: 'right' as const
  }

  const watermarkStyle = {
    position: 'absolute' as const,
    bottom: '8px',
    right: '8px',
    opacity: 0.05
  }

  return (
    <div ref={cardRef} style={cardStyle}>
      <div style={patternStyle} />
      <div style={blurTopStyle} />
      <div style={blurBottomStyle} />

      <div style={contentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={logoContainerStyle}>
            <div style={logoStyle}>
              <Logo collapsed={false} />
            </div>
          </div>
          <div style={memberIdContainerStyle}>
            <p style={memberIdLabelStyle}>MEMBER ID</p>
            <p style={memberIdValueStyle}>{memberId}</p>
          </div>
        </div>

        {/* Member Info */}
        <div style={memberInfoStyle}>
          <h3 style={memberNameStyle}>{userData.fullName || 'Member Name'}</h3>
          <div style={statusStyle}>
            <BadgeCheck style={{ height: '12px', width: '12px', color: '#4ade80' }} />
            <span style={statusTextStyle}>Active Member</span>
          </div>
        </div>

        {/* Details Grid */}
        <div style={detailsGridStyle}>
          <div style={detailBoxStyle}>
            <p style={detailLabelStyle}>SCC</p>
            <p style={detailValueStyle}>{userData.scc || '—'}</p>
          </div>
          <div style={detailBoxStyle}>
            <p style={detailLabelStyle}>Reg No.</p>
            <p style={detailValueStyle}>{userData.registrationNumber || '—'}</p>
          </div>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <div style={qrSectionStyle}>
            <QrCode style={{ height: '20px', width: '20px', color: 'rgba(255,255,255,0.5)' }} />
            <div>
              <p style={validLabelStyle}>VALID THROUGH</p>
              <p style={validValueStyle}>{currentYear + 1}</p>
            </div>
          </div>
          <div style={memberSinceStyle}>
            <p style={validLabelStyle}>Member since</p>
            <p style={validValueStyle}>{userData.joinedDate || currentYear}</p>
          </div>
        </div>

        {/* Watermark Logo */}
        <div style={watermarkStyle}>
          <Logo collapsed={false} />
        </div>
      </div>
    </div>
  )
}
