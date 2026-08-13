import {
  UserCog, CreditCard, Crown, Award, Shield,
  FileText, Clock, UserCheck, UserX, RotateCcw,
  Edit, X, Send, MessageSquare, AlertCircle,
  ShoppingCart, FileCheck, Users, Truck, Receipt,
  Leaf, MinusCircle, Flame, Zap, CheckCircle,
  Package, DollarSign, User, Building2, Calendar,
  ArrowRight, Repeat, AlertTriangle
} from 'lucide-react';

export const APPROVER_ROLES = ['HOD', 'ACCOUNTANT', 'HEAD OF INSTITUTION', 'FINAL_APPROVER', 'ADMIN', 'SUPER_ADMIN'];
export const APPROVABLE_STATUSES = ['submitted', 'hod_approved', 'accountant_approved', 'principal_approved'];
export const FINAL_STATES = ['final_approved', 'final_declined', 'cancelled'];
export const DECLINED_STATUSES = ['hod_declined', 'accountant_declined', 'principal_declined', 'final_declined'];
export const RETURNED_STATUS = 'returned';

export const ROLE_LABELS: Record<string, string> = {
  'ADMIN': 'Administrator',
  'HOD': 'Head of Department',
  'ACCOUNTANT': 'Accountant/Finance',
  'HEAD OF INSTITUTION': 'Principal/Head of Institution',
  'FINAL_APPROVER': 'Director/Finance Administrator',
  'PROCUREMENT': 'Procurement Officer',
  'SUPPLIER': 'Supplier/Vendor',
  'AUDITOR': 'Auditorial Staff Officer',
};

export const APPROVAL_LEVEL_MAP: Record<string, { level: number; name: string; icon: any; color: string; bgColor: string }> = {
  hod: {
    level: 1,
    name: 'Head of Department',
    icon: UserCog,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  accountant: {
    level: 2,
    name: 'Accountant/Finance',
    icon: CreditCard,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
  },
  principal: {
    level: 3,
    name: 'Principal/Head of Institution',
    icon: Crown,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
  },
  final: {
    level: 4,
    name: 'Director/Finance Administrator',
    icon: Award,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
  },
};

export const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string; gradient: string }> = {
  draft: {
    color: 'bg-muted/50 text-muted-foreground border-muted',
    icon: FileText,
    label: 'Draft',
    gradient: 'from-muted to-muted-foreground/50',
  },
  submitted: {
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-800',
    icon: Clock,
    label: 'Submitted',
    gradient: 'from-yellow-500 to-amber-500',
  },
  hod_approved: {
    color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800',
    icon: UserCheck,
    label: 'HOD Approved',
    gradient: 'from-blue-500 to-indigo-500',
  },
  hod_declined: {
    color: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-800',
    icon: UserX,
    label: 'HOD Declined',
    gradient: 'from-red-500 to-rose-500',
  },
  accountant_approved: {
    color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-800',
    icon: CreditCard,
    label: 'Accountant Approved',
    gradient: 'from-indigo-500 to-purple-500',
  },
  accountant_declined: {
    color: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-800',
    icon: CreditCard,
    label: 'Accountant Declined',
    gradient: 'from-red-500 to-rose-500',
  },
  principal_approved: {
    color: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800',
    icon: Crown,
    label: 'Principal Approved',
    gradient: 'from-purple-500 to-violet-500',
  },
  principal_declined: {
    color: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-800',
    icon: Crown,
    label: 'Principal Declined',
    gradient: 'from-red-500 to-rose-500',
  },
  final_approved: {
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800',
    icon: Award,
    label: 'Final Approved',
    gradient: 'from-emerald-500 to-teal-500',
  },
  final_declined: {
    color: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-800',
    icon: Award,
    label: 'Final Declined',
    gradient: 'from-red-500 to-rose-500',
  },
  returned: {
    color: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800',
    icon: RotateCcw,
    label: 'Returned',
    gradient: 'from-amber-500 to-orange-500',
  },
  revised: {
    color: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800',
    icon: Edit,
    label: 'Revised',
    gradient: 'from-purple-500 to-violet-500',
  },
  cancelled: {
    color: 'bg-muted/30 text-muted-foreground border-muted',
    icon: X,
    label: 'Cancelled',
    gradient: 'from-muted to-muted-foreground/30',
  },
};

export const HISTORY_ACTION_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  created: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: FileText, label: 'Created' },
  updated: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Edit, label: 'Updated' },
  submitted: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Send, label: 'Submitted' },
  hod_approved: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: UserCheck, label: 'HOD Approved' },
  hod_declined: { color: 'bg-red-100 text-red-700 border-red-200', icon: UserX, label: 'HOD Declined' },
  accountant_approved: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: CreditCard, label: 'Accountant Approved' },
  accountant_declined: { color: 'bg-red-100 text-red-700 border-red-200', icon: CreditCard, label: 'Accountant Declined' },
  principal_approved: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Crown, label: 'Principal Approved' },
  principal_declined: { color: 'bg-red-100 text-red-700 border-red-200', icon: Crown, label: 'Principal Declined' },
  final_approved: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Award, label: 'Final Approved' },
  final_declined: { color: 'bg-red-100 text-red-700 border-red-200', icon: Award, label: 'Final Declined' },
  returned: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: RotateCcw, label: 'Returned' },
  cancelled: { color: 'bg-gray-100 text-gray-500 border-gray-200', icon: X, label: 'Cancelled' },
  commented: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: MessageSquare, label: 'Commented' },
  revised: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Edit, label: 'Revised' },
  escalated: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle, label: 'Escalated' },
  delegated: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: User, label: 'Delegated' },
  procurement_started: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: ShoppingCart, label: 'Procurement Started' },
  qtn_generated: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: FileCheck, label: 'QTN Generated' },
  qtn_sent: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Send, label: 'QTN Sent' },
  quote_received: { color: 'bg-green-100 text-green-700 border-green-200', icon: Users, label: 'Quote Received' },
  supplier_selected: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: CheckCircle, label: 'Supplier Selected' },
  lpo_generated: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: ShoppingCart, label: 'LPO/LSO Generated' },
  grn_generated: { color: 'bg-teal-100 text-teal-700 border-teal-200', icon: Truck, label: 'GRN/SAN Generated' },
  payment_voucher: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Receipt, label: 'Payment Voucher' },
  cheque_issued: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: DollarSign, label: 'Cheque Issued' },
};

export const PRIORITY_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  low: { color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800', icon: Leaf, label: 'Low' },
  medium: { color: 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800', icon: MinusCircle, label: 'Medium' },
  high: { color: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800', icon: Flame, label: 'High' },
  emergency: { color: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800', icon: Zap, label: 'Emergency' },
};
