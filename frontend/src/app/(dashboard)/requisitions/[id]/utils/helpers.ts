import { format } from 'date-fns';
import {
  DECLINED_STATUSES,
  RETURNED_STATUS,
  APPROVAL_LEVEL_MAP,
  ROLE_LABELS
} from './constants';
import { Shield } from 'lucide-react';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd MMM yyyy, HH:mm');
  } catch {
    return 'Invalid Date';
  }
};

export const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getFullName = (user: any): string => {
  if (!user) return 'Unknown';
  if (user.full_name) return user.full_name;
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  return [firstName, lastName].filter(Boolean).join(' ') || 'Unknown';
};

export const getRoleLabel = (roleName: string): string => {
  if (!roleName) return 'Unknown Role';
  const upperRole = roleName.toUpperCase();
  return ROLE_LABELS[upperRole] || roleName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const getApprovalLevelInfo = (level: string) => {
  return APPROVAL_LEVEL_MAP[level] || {
    level: 0,
    name: level || 'Unknown',
    icon: Shield,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/30',
  };
};

export const isRequisitionDeclined = (status: string): boolean => {
  return DECLINED_STATUSES.includes(status);
};

export const isRequisitionReturned = (status: string): boolean => {
  return status === RETURNED_STATUS;
};

export const hasDeclinedApproval = (approvals: any[]): boolean => {
  if (!approvals) return false;
  return approvals.some((a: any) => a.status === 'declined' || a.status === 'cancelled');
};

export const hasReturnedApproval = (approvals: any[]): boolean => {
  if (!approvals) return false;
  return approvals.some((a: any) => a.status === 'returned');
};

export const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    'draft': 'bg-gray-500',
    'submitted': 'bg-yellow-500',
    'hod_approved': 'bg-blue-500',
    'hod_declined': 'bg-red-500',
    'accountant_approved': 'bg-indigo-500',
    'accountant_declined': 'bg-red-500',
    'principal_approved': 'bg-purple-500',
    'principal_declined': 'bg-red-500',
    'final_approved': 'bg-emerald-500',
    'final_declined': 'bg-red-500',
    'returned': 'bg-amber-500',
    'revised': 'bg-purple-500',
    'cancelled': 'bg-gray-500',
  };
  return statusMap[status] || 'bg-gray-500';
};
