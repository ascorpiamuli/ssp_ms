// lib/navigation/sections.ts

import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  FileCheck,
  ClipboardList,
  Shield,
  UserCog,
  CreditCard,
  Building2,
  ShoppingCart,
  Users,
  AlertTriangle,
  Package,
  Truck,
  Receipt,
  BarChart3,
  TrendingUp,
  Settings,
  User,
  Bell,
  Calendar,
  Clock,
  DollarSign,
  PieChart,
  Activity,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Lock,
  Key,
  Mail,
  Filter,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  Info,
  Award,
  CalendarDays,
  GraduationCap,
  Briefcase,
  Box,
  DoorOpen,
  Wrench,
  Megaphone,
  Sliders,
  Archive,
  FileSpreadsheet,
  Printer,
  Download,
  Upload,
  RefreshCw,
  Send,
  Share,
  ShieldCheck,
  UserCheck,
  UserPlus,
  UserMinus,
  Users2,
  Wallet,
  Watch,
  Timer,
  Target,
  Telescope,
  Ticket,
  type LucideIcon
} from 'lucide-react'
import { NavigationSection } from '@/lib/types/navigation.types'

// Map icon names to components
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  PlusCircle,
  FileCheck,
  ClipboardList,
  Shield,
  UserCog,
  CreditCard,
  Building2,
  ShoppingCart,
  Users,
  AlertTriangle,
  Package,
  Truck,
  Receipt,
  BarChart3,
  TrendingUp,
  Settings,
  User,
  Bell,
  Calendar,
  Clock,
  DollarSign,
  PieChart,
  Activity,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Lock,
  Key,
  Mail,
  Filter,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  Info,
  Award,
  CalendarDays,
  GraduationCap,
  Briefcase,
  Box,
  DoorOpen,
  Wrench,
  Megaphone,
  Sliders,
  Archive,
  FileSpreadsheet,
  Printer,
  Download,
  Upload,
  RefreshCw,
  Send,
  Share,
  ShieldCheck,
  UserCheck,
  UserPlus,
  UserMinus,
  Users2,
  Wallet,
  Watch,
  Timer,
  Target,
  Telescope,
  Ticket
}

// Helper to get icon component
const getIcon = (name: string): LucideIcon => iconMap[name] || FileText

export const navigationSections: NavigationSection[] = [
  // 1. DASHBOARD
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: getIcon('LayoutDashboard'),
    defaultOpen: true,
    items: [
      {
        id: 'overview',
        name: 'Overview',
        href: '/dashboard',
        icon: getIcon('LayoutDashboard'),
        description: 'View key metrics and analytics',
        roles: ['admin', 'hod', 'accountant', 'principal', 'final_approver', 'procurement', 'staff', 'auditor']
      },
      {
        id: 'analytics',
        name: 'Analytics',
        href: '/dashboard/analytics',
        icon: getIcon('PieChart'),
        description: 'Detailed analytics and insights',
        roles: ['admin', 'accountant', 'principal', 'auditor']
      },
      {
        id: 'activity_feed',
        name: 'Activity Feed',
        href: '/dashboard/activity',
        icon: getIcon('Activity'),
        description: 'Recent system activity',
        roles: ['admin', 'hod', 'accountant', 'principal', 'procurement', 'staff']
      },
      {
        id: 'notifications_center',
        name: 'Notifications',
        href: '/dashboard/notifications',
        icon: getIcon('Bell'),
        description: 'View all notifications',
        roles: ['admin', 'hod', 'accountant', 'principal', 'final_approver', 'procurement', 'staff', 'auditor']
      }
    ]
  },

  // 2. REQUISITIONS
  {
    id: 'requisitions',
    title: 'Requisitions',
    icon: getIcon('FileText'),
    defaultOpen: false,
    items: [
      {
        id: 'create_requisition',
        name: 'Create Requisition',
        href: '/requisitions/create',
        icon: getIcon('PlusCircle'),
        description: 'Submit new requisition',
        roles: ['admin', 'hod', 'accountant', 'principal', 'procurement', 'staff']
      },
      {
        id: 'my_requisitions',
        name: 'My Requisitions',
        href: '/requisitions/my',
        icon: getIcon('FileCheck'),
        description: 'View your requisitions',
        roles: ['admin', 'hod', 'accountant', 'principal', 'final_approver', 'procurement', 'staff', 'auditor']
      },
      {
        id: 'department_requisitions',
        name: 'Department Requisitions',
        href: '/requisitions/department',
        icon: getIcon('Users'),
        description: 'View department requisitions',
        roles: ['hod', 'accountant', 'principal', 'final_approver', 'procurement', 'admin']
      },
      {
        id: 'pending_approvals',
        name: 'Pending Approvals',
        href: '/requisitions/pending',
        icon: getIcon('ClipboardList'),
        description: 'Requisitions awaiting approval',
        roles: ['hod', 'accountant', 'principal', 'final_approver'],
        badge: '0',
        badgeColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        isDynamic: true
      },
      {
        id: 'all_requisitions',
        name: 'All Requisitions',
        href: '/requisitions/all',
        icon: getIcon('FileCheck'),
        description: 'View all requisitions',
        roles: ['admin', 'accountant', 'principal', 'final_approver', 'auditor']
      },
      {
        id: 'draft_requisitions',
        name: 'Drafts',
        href: '/requisitions/drafts',
        icon: getIcon('FileText'),
        description: 'Draft requisitions',
        roles: ['admin', 'hod', 'accountant', 'principal', 'procurement', 'staff']
      },
      {
        id: 'archived_requisitions',
        name: 'Archived',
        href: '/requisitions/archived',
        icon: getIcon('Archive'),
        description: 'Archived requisitions',
        roles: ['admin', 'accountant', 'auditor']
      }
    ]
  },

  // 3. APPROVALS
  {
    id: 'approvals',
    title: 'Approvals',
    icon: getIcon('Shield'),
    defaultOpen: false,
    items: [
      {
        id: 'hod_approvals',
        name: 'HOD Approvals',
        href: '/approvals/hod',
        icon: getIcon('UserCog'),
        description: 'Department head approvals (Level 1)',
        roles: ['hod']
      },
      {
        id: 'accountant_approvals',
        name: 'Accountant Approvals',
        href: '/approvals/accountant',
        icon: getIcon('CreditCard'),
        description: 'Funds verification approvals (Level 2)',
        roles: ['accountant']
      },
      {
        id: 'principal_approvals',
        name: 'Principal Approvals',
        href: '/approvals/principal',
        icon: getIcon('Building2'),
        description: 'Head of institution approvals (Level 3)',
        roles: ['principal']
      },
      {
        id: 'final_approvals',
        name: 'Final Approvals',
        href: '/approvals/final',
        icon: getIcon('Shield'),
        description: 'Final authorization approvals (Level 4)',
        roles: ['final_approver']
      },
      {
        id: 'all_pending_approvals',
        name: 'All Pending',
        href: '/approvals/pending',
        icon: getIcon('Clock'),
        description: 'View all pending approvals',
        roles: ['admin', 'principal', 'accountant']
      },
      {
        id: 'approval_history',
        name: 'Approval History',
        href: '/approvals/history',
        icon: getIcon('Timer'),
        description: 'Approval history and timelines',
        roles: ['admin', 'accountant', 'principal', 'hod', 'auditor']
      }
    ]
  },

  // 4. PROCUREMENT
  {
    id: 'procurement',
    title: 'Procurement',
    icon: getIcon('ShoppingCart'),
    defaultOpen: false,
    items: [
      {
        id: 'suppliers',
        name: 'Suppliers',
        href: '/procurement/suppliers',
        icon: getIcon('Users'),
        description: 'Manage suppliers',
        roles: ['admin', 'procurement', 'accountant', 'principal']
      },
      {
        id: 'supplier_blacklist',
        name: 'Blacklisted Suppliers',
        href: '/procurement/blacklist',
        icon: getIcon('UserMinus'),
        description: 'View blacklisted suppliers',
        roles: ['admin', 'procurement']
      },
      {
        id: 'quotations',
        name: 'Quotations',
        href: '/procurement/quotations',
        icon: getIcon('FileText'),
        description: 'Manage quotations',
        roles: ['admin', 'procurement', 'accountant']
      },
      {
        id: 'request_quotations',
        name: 'Request Quotations',
        href: '/procurement/request-quotes',
        icon: getIcon('Send'),
        description: 'Send quotation requests to suppliers',
        roles: ['admin', 'procurement', 'accountant']
      },
      {
        id: 'quotation_responses',
        name: 'Quotation Responses',
        href: '/procurement/responses',
        icon: getIcon('Mail'),
        description: 'View supplier quotation responses',
        roles: ['admin', 'procurement', 'accountant']
      },
      {
        id: 'tenders',
        name: 'Tenders',
        href: '/procurement/tenders',
        icon: getIcon('AlertTriangle'),
        description: 'Tender management',
        roles: ['admin', 'procurement', 'accountant']
      },
      {
        id: 'contracts',
        name: 'Contracts',
        href: '/procurement/contracts',
        icon: getIcon('FileCheck'),
        description: 'Contract management',
        roles: ['admin', 'procurement', 'accountant']
      },
      {
        id: 'procurement_planning',
        name: 'Procurement Planning',
        href: '/procurement/planning',
        icon: getIcon('Calendar'),
        description: 'Procurement plans and schedules',
        roles: ['admin', 'procurement', 'accountant', 'principal']
      }
    ]
  },

  // 5. ORDERS
  {
    id: 'orders',
    title: 'Orders',
    icon: getIcon('Package'),
    defaultOpen: false,
    items: [
      {
        id: 'view_orders',
        name: 'LPO/LSO',
        href: '/orders',
        icon: getIcon('ShoppingCart'),
        description: 'Purchase and service orders',
        roles: ['admin', 'procurement', 'accountant', 'principal', 'final_approver', 'auditor']
      },
      {
        id: 'create_lpo',
        name: 'Generate LPO',
        href: '/orders/lpo/create',
        icon: getIcon('FileText'),
        description: 'Create local purchase order',
        roles: ['admin', 'procurement', 'accountant']
      },
      {
        id: 'create_lso',
        name: 'Generate LSO',
        href: '/orders/lso/create',
        icon: getIcon('FileText'),
        description: 'Create local service order',
        roles: ['admin', 'procurement', 'accountant']
      },
      {
        id: 'grn_san',
        name: 'GRN/SAN',
        href: '/orders/grn',
        icon: getIcon('Truck'),
        description: 'Goods received / service acknowledgment',
        roles: ['admin', 'procurement', 'accountant', 'staff', 'hod', 'principal']
      },
      {
        id: 'create_grn',
        name: 'Create GRN',
        href: '/orders/grn/create',
        icon: getIcon('Check'),
        description: 'Create goods received note',
        roles: ['admin', 'procurement', 'accountant', 'staff', 'hod']
      },
      {
        id: 'create_san',
        name: 'Create SAN',
        href: '/orders/san/create',
        icon: getIcon('Check'),
        description: 'Create service acknowledgment note',
        roles: ['admin', 'procurement', 'accountant', 'staff', 'hod']
      },
      {
        id: 'track_orders',
        name: 'Track Orders',
        href: '/orders/track',
        icon: getIcon('Target'),
        description: 'Track order status',
        roles: ['admin', 'procurement', 'accountant', 'staff', 'hod', 'principal']
      },
      {
        id: 'order_history',
        name: 'Order History',
        href: '/orders/history',
        icon: getIcon('Clock'),
        description: 'Historical orders',
        roles: ['admin', 'procurement', 'accountant', 'auditor']
      }
    ]
  },

  // 6. INVOICES & PAYMENTS
  {
    id: 'invoices',
    title: 'Invoices & Payments',
    icon: getIcon('CreditCard'),
    defaultOpen: false,
    items: [
      {
        id: 'invoices',
        name: 'Invoices',
        href: '/invoices',
        icon: getIcon('Receipt'),
        description: 'View and verify invoices',
        roles: ['admin', 'accountant', 'procurement', 'auditor']
      },
      {
        id: 'verify_invoices',
        name: 'Verify Invoices',
        href: '/invoices/verify',
        icon: getIcon('ShieldCheck'),
        description: 'Three-way invoice verification',
        roles: ['admin', 'accountant']
      },
      {
        id: 'pending_invoices',
        name: 'Pending Invoices',
        href: '/invoices/pending',
        icon: getIcon('Clock'),
        description: 'Invoices awaiting verification',
        roles: ['admin', 'accountant', 'procurement']
      },
      {
        id: 'payment_vouchers',
        name: 'Payment Vouchers',
        href: '/payments/vouchers',
        icon: getIcon('FileCheck'),
        description: 'Payment vouchers',
        roles: ['admin', 'accountant', 'principal']
      },
      {
        id: 'create_payment_voucher',
        name: 'Create Payment Voucher',
        href: '/payments/vouchers/create',
        icon: getIcon('PlusCircle'),
        description: 'Generate payment voucher',
        roles: ['admin', 'accountant']
      },
      {
        id: 'endorse_vouchers',
        name: 'Endorse Vouchers',
        href: '/payments/endorse',
        icon: getIcon('UserCheck'),
        description: 'Endorse payment vouchers',
        roles: ['principal']
      },
      {
        id: 'cheque_tracking',
        name: 'Cheque Tracking',
        href: '/payments/cheques',
        icon: getIcon('Wallet'),
        description: 'Track issued cheques',
        roles: ['admin', 'accountant']
      },
      {
        id: 'record_cheque',
        name: 'Record Cheque',
        href: '/payments/cheques/record',
        icon: getIcon('Edit'),
        description: 'Record cheque number',
        roles: ['admin', 'accountant']
      },
      {
        id: 'payment_history',
        name: 'Payment History',
        href: '/payments/history',
        icon: getIcon('Timer'),
        description: 'Payment history',
        roles: ['admin', 'accountant', 'auditor', 'principal']
      },
      {
        id: 'reconciliation',
        name: 'Reconciliation',
        href: '/payments/reconciliation',
        icon: getIcon('RefreshCw'),
        description: 'Payment reconciliation',
        roles: ['admin', 'accountant', 'auditor']
      },
      {
        id: 'outstanding_payments',
        name: 'Outstanding Payments',
        href: '/payments/outstanding',
        icon: getIcon('AlertCircle'),
        description: 'Outstanding payments report',
        roles: ['admin', 'accountant', 'principal']
      }
    ]
  },

  // 7. BUDGET & FINANCE
  {
    id: 'budget',
    title: 'Budget & Finance',
    icon: getIcon('DollarSign'),
    defaultOpen: false,
    items: [
      {
        id: 'budget_overview',
        name: 'Budget Overview',
        href: '/budget/overview',
        icon: getIcon('PieChart'),
        description: 'Budget allocation and tracking',
        roles: ['admin', 'accountant', 'principal']
      },
      {
        id: 'expenditure',
        name: 'Expenditure',
        href: '/budget/expenditure',
        icon: getIcon('TrendingUp'),
        description: 'Track expenditures',
        roles: ['admin', 'accountant', 'principal', 'hod', 'auditor']
      },
      {
        id: 'budget_planning',
        name: 'Budget Planning',
        href: '/budget/planning',
        icon: getIcon('Calendar'),
        description: 'Plan and forecast budgets',
        roles: ['admin', 'accountant']
      },
      {
        id: 'budget_utilization',
        name: 'Budget Utilization',
        href: '/budget/utilization',
        icon: getIcon('Target'),
        description: 'Budget consumption trends',
        roles: ['admin', 'accountant', 'principal']
      }
    ]
  },

  // 8. REPORTS
  {
    id: 'reports',
    title: 'Reports & Analytics',
    icon: getIcon('BarChart3'),
    defaultOpen: false,
    items: [
      {
        id: 'requisition_reports',
        name: 'Requisition Reports',
        href: '/reports/requisitions',
        icon: getIcon('FileText'),
        description: 'Requisition analytics',
        roles: ['admin', 'accountant', 'principal', 'hod', 'auditor']
      },
      {
        id: 'approval_tracking',
        name: 'Approval Tracking',
        href: '/reports/approvals',
        icon: getIcon('Timer'),
        description: 'Track approval timelines',
        roles: ['admin', 'accountant', 'principal', 'auditor']
      },
      {
        id: 'spending_reports',
        name: 'Spending Reports',
        href: '/reports/spending',
        icon: getIcon('TrendingUp'),
        description: 'Department spending reports',
        roles: ['admin', 'accountant', 'principal', 'auditor']
      },
      {
        id: 'supplier_reports',
        name: 'Supplier Reports',
        href: '/reports/suppliers',
        icon: getIcon('Users'),
        description: 'Supplier performance reports',
        roles: ['admin', 'procurement', 'auditor']
      },
      {
        id: 'audit_trail',
        name: 'Audit Trail',
        href: '/reports/audit',
        icon: getIcon('Shield'),
        description: 'System audit logs',
        roles: ['admin', 'auditor']
      },
      {
        id: 'financial_reports',
        name: 'Financial Reports',
        href: '/reports/financial',
        icon: getIcon('DollarSign'),
        description: 'Financial analytics',
        roles: ['admin', 'accountant', 'principal', 'auditor']
      },
      {
        id: 'budget_reports',
        name: 'Budget Reports',
        href: '/reports/budget',
        icon: getIcon('PieChart'),
        description: 'Budget vs actual reports',
        roles: ['admin', 'accountant', 'principal']
      },
      {
        id: 'custom_reports',
        name: 'Custom Reports',
        href: '/reports/custom',
        icon: getIcon('Filter'),
        description: 'Build custom reports',
        roles: ['admin', 'accountant', 'auditor']
      },
      {
        id: 'lpo_lso_register',
        name: 'LPO/LSO Register',
        href: '/reports/orders',
        icon: getIcon('Package'),
        description: 'All issued purchase/service orders',
        roles: ['admin', 'procurement', 'accountant']
      },
      {
        id: 'grn_san_register',
        name: 'GRN/SAN Register',
        href: '/reports/grn',
        icon: getIcon('Truck'),
        description: 'All received goods/services',
        roles: ['admin', 'procurement', 'accountant']
      },
      {
        id: 'payment_register',
        name: 'Payment Register',
        href: '/reports/payments',
        icon: getIcon('Wallet'),
        description: 'All payments with voucher and cheque details',
        roles: ['admin', 'accountant', 'auditor']
      },
      {
        id: 'tender_register',
        name: 'Tender Register',
        href: '/reports/tenders',
        icon: getIcon('AlertTriangle'),
        description: 'All tender-related requisitions',
        roles: ['admin', 'procurement', 'auditor']
      },
      {
        id: 'rejected_requisitions',
        name: 'Rejected Requisitions',
        href: '/reports/rejected',
        icon: getIcon('X'),
        description: 'List of declined requisitions',
        roles: ['admin', 'hod', 'accountant']
      },
      {
        id: 'emergency_reports',
        name: 'Emergency/Fast Track',
        href: '/reports/emergency',
        icon: getIcon('AlertCircle'),
        description: 'All emergency requisitions',
        roles: ['admin', 'principal', 'auditor']
      },
      {
        id: 'average_approval_time',
        name: 'Approval Time Analysis',
        href: '/reports/approval-time',
        icon: getIcon('Watch'),
        description: 'Average time from submission to final approval',
        roles: ['admin', 'principal']
      }
    ]
  },

  // 9. ADMINISTRATION
  {
    id: 'administration',
    title: 'Administration',
    icon: getIcon('Settings'),
    defaultOpen: false,
    items: [
      {
        id: 'users',
        name: 'Users',
        href: '/admin/users',
        icon: getIcon('Users'),
        description: 'Manage users',
        roles: ['admin']
      },
      {
        id: 'create_user',
        name: 'Create User',
        href: '/admin/users/create',
        icon: getIcon('UserPlus'),
        description: 'Add new user',
        roles: ['admin']
      },
      {
        id: 'departments',
        name: 'Departments',
        href: '/admin/departments',
        icon: getIcon('Building2'),
        description: 'Manage departments',
        roles: ['admin']
      },
      {
        id: 'create_department',
        name: 'Create Department',
        href: '/admin/departments/create',
        icon: getIcon('PlusCircle'),
        description: 'Add new department',
        roles: ['admin']
      },
      {
        id: 'system_settings',
        name: 'System Settings',
        href: '/admin/settings',
        icon: getIcon('Settings'),
        description: 'Configure system settings',
        roles: ['admin']
      },
      {
        id: 'reference_formats',
        name: 'Reference Formats',
        href: '/admin/reference-formats',
        icon: getIcon('FileText'),
        description: 'Configure reference number formats',
        roles: ['admin']
      },
      {
        id: 'audit_logs',
        name: 'Audit Logs',
        href: '/admin/audit',
        icon: getIcon('Shield'),
        description: 'System audit logs',
        roles: ['admin', 'auditor']
      },
      {
        id: 'roles_permissions',
        name: 'Roles & Permissions',
        href: '/admin/roles',
        icon: getIcon('Lock'),
        description: 'Manage roles and permissions',
        roles: ['admin']
      },
      {
        id: 'system_status',
        name: 'System Status',
        href: '/admin/status',
        icon: getIcon('Activity'),
        description: 'System health monitoring',
        roles: ['admin']
      },
      {
        id: 'acting_hod',
        name: 'Acting HOD',
        href: '/admin/acting-hod',
        icon: getIcon('UserCheck'),
        description: 'Assign acting HOD temporarily',
        roles: ['admin']
      },
      {
        id: 'backup_restore',
        name: 'Backup & Restore',
        href: '/admin/backup',
        icon: getIcon('Database'),
        description: 'System backup and restore',
        roles: ['admin']
      },
      {
        id: 'email_settings',
        name: 'Email Settings',
        href: '/admin/email',
        icon: getIcon('Mail'),
        description: 'Configure email settings',
        roles: ['admin']
      }
    ]
  },

  // 10. COMMUNICATION
  {
    id: 'communication',
    title: 'Communication',
    icon: getIcon('MessageSquare'),
    defaultOpen: false,
    items: [
      {
        id: 'notifications',
        name: 'Notifications',
        href: '/notifications',
        icon: getIcon('Bell'),
        description: 'View notifications',
        roles: ['admin', 'hod', 'accountant', 'principal', 'final_approver', 'procurement', 'staff', 'auditor']
      },
      {
        id: 'messages',
        name: 'Messages',
        href: '/messages',
        icon: getIcon('MessageSquare'),
        description: 'Internal messages',
        roles: ['admin', 'hod', 'accountant', 'principal', 'procurement', 'staff']
      },
      {
        id: 'send_message',
        name: 'Send Message',
        href: '/messages/send',
        icon: getIcon('Send'),
        description: 'Send internal message',
        roles: ['admin', 'hod', 'accountant', 'principal', 'procurement', 'staff']
      },
      {
        id: 'alerts',
        name: 'Alerts',
        href: '/alerts',
        icon: getIcon('AlertTriangle'),
        description: 'System alerts',
        roles: ['admin', 'accountant', 'principal', 'auditor']
      },
      {
        id: 'announcements',
        name: 'Announcements',
        href: '/announcements',
        icon: getIcon('Megaphone'),
        description: 'View announcements',
        roles: ['admin', 'hod', 'accountant', 'principal', 'final_approver', 'procurement', 'staff', 'auditor']
      },
      {
        id: 'create_announcement',
        name: 'Create Announcement',
        href: '/announcements/create',
        icon: getIcon('PlusCircle'),
        description: 'Post new announcement',
        roles: ['admin', 'principal']
      }
    ]
  },

  // 11. PROFILE
  {
    id: 'profile',
    title: 'Profile',
    icon: getIcon('User'),
    defaultOpen: false,
    items: [
      {
        id: 'my_profile',
        name: 'My Profile',
        href: '/profile',
        icon: getIcon('User'),
        description: 'View and edit profile',
        roles: ['admin', 'hod', 'accountant', 'principal', 'final_approver', 'procurement', 'staff', 'auditor']
      },
      {
        id: 'settings',
        name: 'Settings',
        href: '/profile/settings',
        icon: getIcon('Settings'),
        description: 'Account settings',
        roles: ['admin', 'hod', 'accountant', 'principal', 'final_approver', 'procurement', 'staff', 'auditor']
      },
      {
        id: 'security',
        name: 'Security',
        href: '/profile/security',
        icon: getIcon('Key'),
        description: 'Security settings and 2FA',
        roles: ['admin', 'hod', 'accountant', 'principal', 'final_approver', 'procurement', 'staff', 'auditor']
      },
      {
        id: 'preferences',
        name: 'Preferences',
        href: '/profile/preferences',
        icon: getIcon('Sliders'),
        description: 'App preferences',
        roles: ['admin', 'hod', 'accountant', 'principal', 'final_approver', 'procurement', 'staff', 'auditor']
      }
    ]
  },

  // 12. HELP & SUPPORT
  {
    id: 'support',
    title: 'Help & Support',
    icon: getIcon('HelpCircle'),
    defaultOpen: false,
    items: [
      {
        id: 'documentation',
        name: 'Documentation',
        href: '/help/docs',
        icon: getIcon('BookOpen'),
        description: 'User documentation',
        roles: ['admin', 'hod', 'accountant', 'principal', 'final_approver', 'procurement', 'staff', 'auditor']
      },
      {
        id: 'faq',
        name: 'FAQ',
        href: '/help/faq',
        icon: getIcon('HelpCircle'),
        description: 'Frequently asked questions',
        roles: ['admin', 'hod', 'accountant', 'principal', 'final_approver', 'procurement', 'staff', 'auditor']
      },
      {
        id: 'support_tickets',
        name: 'Support Tickets',
        href: '/help/tickets',
        icon: getIcon('MessageSquare'),
        description: 'Support ticket management',
        roles: ['admin', 'hod', 'accountant', 'principal', 'procurement', 'staff']
      },
      {
        id: 'create_ticket',
        name: 'Create Ticket',
        href: '/help/tickets/create',
        icon: getIcon('PlusCircle'),
        description: 'Create support ticket',
        roles: ['admin', 'hod', 'accountant', 'principal', 'procurement', 'staff']
      },
      {
        id: 'knowledge_base',
        name: 'Knowledge Base',
        href: '/help/knowledge-base',
        icon: getIcon('Book'),
        description: 'Knowledge base articles',
        roles: ['admin', 'hod', 'accountant', 'principal', 'final_approver', 'procurement', 'staff', 'auditor']
      }
    ]
  },

  // 13. HUMAN RESOURCES
  {
    id: 'hr',
    title: 'Human Resources',
    icon: getIcon('Users2'),
    defaultOpen: false,
    items: [
      {
        id: 'staff_directory',
        name: 'Staff Directory',
        href: '/hr/staff',
        icon: getIcon('Users'),
        description: 'View staff members',
        roles: ['admin', 'hod', 'principal']
      },
      {
        id: 'attendance',
        name: 'Attendance',
        href: '/hr/attendance',
        icon: getIcon('Clock'),
        description: 'Track attendance',
        roles: ['admin', 'hod']
      },
      {
        id: 'leave_management',
        name: 'Leave Management',
        href: '/hr/leave',
        icon: getIcon('CalendarDays'),
        description: 'Manage leave requests',
        roles: ['admin', 'hod', 'staff']
      },
      {
        id: 'apply_leave',
        name: 'Apply Leave',
        href: '/hr/leave/apply',
        icon: getIcon('PlusCircle'),
        description: 'Submit leave request',
        roles: ['admin', 'hod', 'staff']
      },
      {
        id: 'performance',
        name: 'Performance Reviews',
        href: '/hr/performance',
        icon: getIcon('Award'),
        description: 'Performance reviews',
        roles: ['admin', 'principal']
      },
      {
        id: 'training',
        name: 'Training Programs',
        href: '/hr/training',
        icon: getIcon('GraduationCap'),
        description: 'Training programs',
        roles: ['admin', 'hod']
      }
    ]
  },

  // 14. ASSETS & INVENTORY
  {
    id: 'assets',
    title: 'Assets & Inventory',
    icon: getIcon('Package'),
    defaultOpen: false,
    items: [
      {
        id: 'assets',
        name: 'Assets',
        href: '/assets',
        icon: getIcon('Briefcase'),
        description: 'Manage assets',
        roles: ['admin', 'accountant', 'procurement']
      },
      {
        id: 'create_asset',
        name: 'Create Asset',
        href: '/assets/create',
        icon: getIcon('PlusCircle'),
        description: 'Add new asset',
        roles: ['admin', 'procurement']
      },
      {
        id: 'inventory',
        name: 'Inventory',
        href: '/assets/inventory',
        icon: getIcon('Box'),
        description: 'Inventory management',
        roles: ['admin', 'procurement', 'accountant']
      },
      {
        id: 'asset_audit',
        name: 'Asset Audit',
        href: '/assets/audit',
        icon: getIcon('ClipboardList'),
        description: 'Asset audit trail',
        roles: ['admin', 'auditor']
      },
      {
        id: 'maintenance',
        name: 'Maintenance',
        href: '/assets/maintenance',
        icon: getIcon('Wrench'),
        description: 'Asset maintenance',
        roles: ['admin', 'procurement']
      }
    ]
  },

  // 15. FACILITIES
  {
    id: 'facilities',
    title: 'Facilities',
    icon: getIcon('Building2'),
    defaultOpen: false,
    items: [
      {
        id: 'facilities',
        name: 'Facilities',
        href: '/facilities',
        icon: getIcon('Building2'),
        description: 'Manage facilities',
        roles: ['admin', 'principal']
      },
      {
        id: 'rooms',
        name: 'Room Management',
        href: '/facilities/rooms',
        icon: getIcon('DoorOpen'),
        description: 'Room booking',
        roles: ['admin', 'hod', 'staff']
      },
      {
        id: 'book_room',
        name: 'Book Room',
        href: '/facilities/rooms/book',
        icon: getIcon('PlusCircle'),
        description: 'Book a room',
        roles: ['admin', 'hod', 'staff']
      },
      {
        id: 'maintenance_requests',
        name: 'Maintenance Requests',
        href: '/facilities/maintenance',
        icon: getIcon('Wrench'),
        description: 'Facility maintenance',
        roles: ['admin', 'staff']
      },
      {
        id: 'create_maintenance',
        name: 'Create Maintenance Request',
        href: '/facilities/maintenance/create',
        icon: getIcon('PlusCircle'),
        description: 'Submit maintenance request',
        roles: ['admin', 'staff']
      }
    ]
  },

  // 16. SUPPLIER PORTAL
  {
    id: 'supplier_portal',
    title: 'Supplier Portal',
    icon: getIcon('Users'),
    defaultOpen: false,
    items: [
      {
        id: 'pending_quotations',
        name: 'Pending Quotations',
        href: '/supplier/quotations',
        icon: getIcon('FileText'),
        description: 'View pending quotation requests',
        roles: ['supplier']
      },
      {
        id: 'respond_quotation',
        name: 'Respond to Quotation',
        href: '/supplier/quotations/respond',
        icon: getIcon('Send'),
        description: 'Submit quotation response',
        roles: ['supplier']
      },
      {
        id: 'my_orders',
        name: 'My Orders',
        href: '/supplier/orders',
        icon: getIcon('Package'),
        description: 'View active orders',
        roles: ['supplier']
      },
      {
        id: 'submit_invoice',
        name: 'Submit Invoice',
        href: '/supplier/invoices/submit',
        icon: getIcon('Receipt'),
        description: 'Submit invoice for payment',
        roles: ['supplier']
      },
      {
        id: 'payment_history',
        name: 'Payment History',
        href: '/supplier/payments',
        icon: getIcon('Wallet'),
        description: 'View payment history',
        roles: ['supplier']
      }
    ]
  }
]
