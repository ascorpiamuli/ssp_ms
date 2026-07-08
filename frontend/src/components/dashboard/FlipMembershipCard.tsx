'use client'

import { useState } from 'react'
import { Logo } from '@/components/ui/logo'
import { BadgeCheck, QrCode, Phone, Heart, Shield, AlertTriangle, ExternalLink } from 'lucide-react'

interface MembershipCardData {
  fullName: string;
  registrationNumber: string;
  memberId: string;
  scc: string;
  joinedDate?: string;
  phone?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  yearOfCompletion?: string;
  familyName?: string;
}

interface FlipMembershipCardProps {
  userData: MembershipCardData;
  frontRef?: React.RefObject<HTMLDivElement>;
  backRef?: React.RefObject<HTMLDivElement>;
  isPrinting?: boolean;
}

export function FlipMembershipCard({ userData, frontRef, backRef, isPrinting = false }: FlipMembershipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    if (!isPrinting) {
      setIsFlipped(!isFlipped)
    }
  }

  // Kenyan ID Card inspired colors
  const primaryColor = '#1a3c34' // Dark green like Kenyan ID
  const secondaryColor = '#2d5a4f'
  const accentColor = '#c4a747' // Gold accent
  const textLight = '#ffffff'
  const textMuted = 'rgba(255,255,255,0.7)'
  const textDim = 'rgba(255,255,255,0.5)'

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '400px',
    height: 'auto',
    minHeight: '380px',
    borderRadius: '16px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s ease'
  }

  const frontCardStyle: React.CSSProperties = {
    ...cardStyle,
    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
    position: 'relative'
  }

  const backCardStyle: React.CSSProperties = {
    ...cardStyle,
    background: `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%)`,
    position: 'relative'
  }

  const contentStyle: React.CSSProperties = {
    padding: '20px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 2,
    minHeight: '380px'
  }

  const watermarkStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '15px',
    right: '15px',
    opacity: 0.06,
    pointerEvents: 'none',
    zIndex: 1
  }

  const patternOverlay: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    opacity: 0.03,
    backgroundImage: 'radial-gradient(circle at 2px 2px, #ffffff 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    pointerEvents: 'none',
    zIndex: 0
  }

  // FRONT STYLES
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: `1px solid ${accentColor}`,
    paddingBottom: '12px'
  }

  const logoStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    color: textLight
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '12px',
    color: textMuted,
    textTransform: 'uppercase',
    letterSpacing: '1px'
  }

  const idNumberStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: accentColor,
    fontFamily: 'monospace'
  }

  const nameStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: textLight,
    marginBottom: '4px',
    letterSpacing: '-0.3px'
  }

  const subtitleStyle: React.CSSProperties = {
    fontSize: '11px',
    color: textMuted,
    marginBottom: '16px'
  }

  const detailRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '10px',
    color: textDim,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }

  const valueStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 500,
    color: textLight
  }

  const statusBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(74, 222, 128, 0.15)',
    padding: '4px 12px',
    borderRadius: '20px',
    marginTop: '8px'
  }

  const footerStyle: React.CSSProperties = {
    marginTop: 'auto',
    paddingTop: '16px',
    borderTop: `1px solid ${accentColor}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }

  const qrPlaceholder: React.CSSProperties = {
    width: '40px',
    height: '40px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  const smallText: React.CSSProperties = {
    fontSize: '8px',
    color: textDim,
    letterSpacing: '0.3px'
  }

  // BACK STYLES - Simple and clean
  const backHeaderStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '20px',
    borderBottom: `1px solid ${accentColor}`,
    paddingBottom: '12px'
  }

  const backTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: accentColor,
    marginTop: '4px'
  }

  const emergencyBoxStyle: React.CSSProperties = {
    background: 'rgba(220, 38, 38, 0.15)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
    border: `1px solid rgba(220, 38, 38, 0.3)`
  }

  const emergencyHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center',
    marginBottom: '12px'
  }

  const emergencyTextStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#ef4444'
  }

  const emergencyDetailStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0'
  }

  const warningBoxStyle: React.CSSProperties = {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    padding: '10px',
    marginBottom: '12px'
  }

  const warningTextStyle: React.CSSProperties = {
    fontSize: '9px',
    color: textMuted,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    lineHeight: 1.3
  }

  const instructionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '10px',
    background: 'rgba(0,0,0,0.15)',
    borderRadius: '8px',
    marginTop: '8px'
  }

  const instructionItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '8px',
    color: textDim
  }

  const flipContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: '400px',
    height: 'auto',
    minHeight: '380px',
    cursor: 'pointer',
    perspective: '1500px',
    margin: '0 auto'
  }

  const flipInnerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    transition: 'transform 0.6s ease-in-out',
    transformStyle: 'preserve-3d',
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
  }

  const flipFrontStyle: React.CSSProperties = {
    ...frontCardStyle,
    backfaceVisibility: 'hidden',
    position: 'relative'
  }

  const flipBackStyle: React.CSSProperties = {
    ...backCardStyle,
    position: 'absolute',
    top: 0,
    left: 0,
    transform: 'rotateY(180deg)',
    backfaceVisibility: 'hidden'
  }

  const frontContent = (
    <>
      <div style={patternOverlay} />
      <div style={contentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={logoStyle}>
            <Logo collapsed={false} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={titleStyle}>MEMBER ID</div>
            <div style={idNumberStyle}>{userData.memberId || '—'}</div>
          </div>
        </div>

        {/* Name Section */}
        <div>
          <div style={nameStyle}>{userData.fullName || 'Member Name'}</div>
          <div style={subtitleStyle}>{userData.familyName || userData.scc || 'SCC Member'}</div>
          <div style={statusBadgeStyle}>
            <BadgeCheck style={{ height: '10px', width: '10px', color: '#4ade80' }} />
            <span style={{ fontSize: '9px', color: textLight }}>ACTIVE</span>
          </div>
        </div>

        {/* Details */}
        <div style={{ marginTop: '16px' }}>
          <div style={detailRowStyle}>
            <span style={labelStyle}>REGISTRATION NO.</span>
            <span style={valueStyle}>{userData.registrationNumber || '—'}</span>
          </div>
          <div style={detailRowStyle}>
            <span style={labelStyle}>SCC</span>
            <span style={valueStyle}>{userData.scc || '—'}</span>
          </div>
          <div style={detailRowStyle}>
            <span style={labelStyle}>PHONE</span>
            <span style={valueStyle}>{userData.phone || '—'}</span>
          </div>
          <div style={detailRowStyle}>
            <span style={labelStyle}>BLOOD GROUP</span>
            <span style={valueStyle}>{userData.bloodGroup || '—'}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <div style={qrPlaceholder}>
            <QrCode style={{ height: '24px', width: '24px', color: textMuted }} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={smallText}>EXPIRY</div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: textLight }}>
              {userData.yearOfCompletion || 'LIFETIME'}
            </div>
          </div>
        </div>
      </div>
      <div style={watermarkStyle}>
        <Logo collapsed={false} />
      </div>
    </>
  )

  const backContent = (
    <>
      <div style={patternOverlay} />
      <div style={contentStyle}>
        {/* Header */}
        <div style={backHeaderStyle}>
          <Shield style={{ height: '24px', width: '24px', color: accentColor }} />
          <div style={backTitleStyle}>MEMBER INFORMATION</div>
        </div>

        {/* Emergency Contact - Prominent but clean */}
        <div style={emergencyBoxStyle}>
          <div style={emergencyHeaderStyle}>
            <Heart style={{ height: '14px', width: '14px', color: '#ef4444' }} />
            <span style={emergencyTextStyle}>EMERGENCY CONTACT</span>
          </div>
          <div style={emergencyDetailStyle}>
            <span style={labelStyle}>Name</span>
            <span style={valueStyle}>{userData.emergencyContact || 'Not provided'}</span>
          </div>
          <div style={emergencyDetailStyle}>
            <span style={labelStyle}>Phone</span>
            <span style={valueStyle}>
              {userData.emergencyPhone ? (
                <a href={`tel:${userData.emergencyPhone}`} style={{ color: textLight, textDecoration: 'none' }}>
                  {userData.emergencyPhone}
                </a>
              ) : 'Not provided'}
            </span>
          </div>
        </div>

        {/* Important Warnings - Simplified */}
        <div style={warningBoxStyle}>
          <div style={warningTextStyle}>
            <AlertTriangle style={{ height: '10px', width: '10px', color: accentColor }} />
            <span>Non-transferable • Report if lost • Property of TUM Catholic Community</span>
          </div>
        </div>

        {/* Simple Instructions */}
        <div style={instructionStyle}>
          <div style={instructionItemStyle}>
            <ExternalLink style={{ height: '10px', width: '10px' }} />
            <span>Present at events</span>
          </div>
          <div style={{ width: '1px', height: '10px', background: textDim }} />
          <div style={instructionItemStyle}>
            <Phone style={{ height: '10px', width: '10px' }} />
            <span>Member benefits</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', textAlign: 'center', paddingTop: '12px' }}>
          <div style={smallText}>TUM Catholic Community • Valid ID Required</div>
        </div>
      </div>
      <div style={watermarkStyle}>
        <Logo collapsed={false} />
      </div>
    </>
  )

  if (isPrinting) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
        <div style={frontCardStyle}>{frontContent}</div>
        <div style={backCardStyle}>{backContent}</div>
      </div>
    )
  }

  return (
    <div style={flipContainerStyle} onClick={handleFlip}>
      <div style={flipInnerStyle}>
        <div ref={frontRef} style={flipFrontStyle}>
          {frontContent}
        </div>
        <div ref={backRef} style={flipBackStyle}>
          {backContent}
        </div>
      </div>
    </div>
  )
}
