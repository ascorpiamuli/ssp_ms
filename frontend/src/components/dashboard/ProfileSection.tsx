'use client'

interface ProfileSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}

export function ProfileSection({ title, icon: Icon, children, className = "" }: ProfileSectionProps) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      marginBottom: '24px'
    }}>
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e5e7eb',
        background: '#f9fafb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon style={{ height: '16px', width: '16px', color: '#3b82f6' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{title}</h3>
        </div>
      </div>
      <div style={{ padding: '16px' }}>
        {children}
      </div>
    </div>
  )
}
