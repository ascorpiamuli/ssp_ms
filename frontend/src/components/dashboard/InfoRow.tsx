'use client'

import { Edit2 } from 'lucide-react'

interface InfoRowProps {
  label: string;
  value: string;
  icon: React.ElementType;
  editable?: boolean;
  onEdit?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function InfoRow({ label, value, icon: Icon, editable = false, onEdit }: InfoRowProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid #e5e7eb'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Icon style={{ height: '16px', width: '16px', color: '#9ca3af' }} />
        <span style={{ fontSize: '14px', color: '#6b7280' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {editable ? (
          <input
            type="text"
            value={value}
            onChange={onEdit}
            style={{
              fontSize: '14px',
              textAlign: 'right',
              background: 'transparent',
              borderBottom: '1px solid #d1d5db',
              outline: 'none',
              padding: '4px 0'
            }}
          />
        ) : (
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{value || '—'}</span>
        )}
      </div>
    </div>
  )
}
