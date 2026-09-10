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
  Database,
  History,
  FileSignature,
  Handshake,
  Signature,
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
  Database,
  History,
  FileSignature,
  Handshake,
  Signature,
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
        roles: ['admin', 'hod', 'accountant', 'head of institution', 'final_approver', 'procurement', 'staff', 'auditor', 'supplier']
      },
      {
        id: 'procurement-dashboard',
        name: 'Procurement Dashboard',
        href: '/procurement/dashboard',
        icon: getIcon('PieChart'),
        description: 'Detailed procurement analytics and insights',
        roles: ['admin', 'accountant', 'head of institution', 'auditor']
      },
      {
        id: 'activity',
        name: 'Activity & Notifications',
        href: '/dashboard/activity',
        icon: getIcon('Bell'),
        description: 'Recent activity and notifications',
        roles: ['admin', 'hod', 'accountant', 'head of institution', 'final_approver', 'procurement', 'staff', 'auditor', 'supplier']
      }
    ]
  },

  // 2. ADMINISTRATION
  {
    id: 'administration',
    title: 'Administration',
    icon: getIcon('Settings'),
    defaultOpen: false,
    items: [
      {
        id: 'users',
        name: 'User Management',
        href: '/admin/users',
        icon: getIcon('Users'),
        description: 'Manage users',
        roles: ['admin']
      },
      {
        id: 'supplier-management',
        name: 'Supplier Management',
        href: '/admin/suppliers',
        icon: getIcon('Users'),
        description: 'Manage Suppliers',
        roles: ['admin']
      },
      {
        id: 'signature-verification',
        name: 'Signature Verification',
        href: '/admin/signatures/pending',
        icon: getIcon('FileSignature'),
        description: 'Verify and manage user signatures',
        roles: ['admin'],
        badge: 'Pending',
        badgeColor: 'warning'
      },
      {
        id: 'signature-verification-logs',
        name: 'Signature Verification Logs',
        href: '/admin/signatures/logs',
        icon: getIcon('History'),
        description: 'View audit trail for all signature actions',
        roles: ['admin']
      },
      {
        id: 'permissions',
        name: 'Permission Matrix',
        href: '/admin/permissions',
        icon: getIcon('Shield'),
        description: 'Manage user permissions',
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
        id: 'system_settings',
        name: 'System Settings',
        href: '/admin/settings',
        icon: getIcon('Settings'),
        description: 'Configure system settings and reference formats',
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
        id: 'system_status',
        name: 'System Status',
        href: '/admin/status',
        icon: getIcon('Activity'),
        description: 'System health monitoring',
        roles: ['admin']
      },
      {
        id: 'backup_restore',
        name: 'Backup & Restore',
        href: '/admin/backup',
        icon: getIcon('Database'),
        description: 'System backup and restore',
        roles: ['admin']
      }
    ]
  },

  // 3. REQUISITIONS
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
        roles: ['admin', 'hod', 'accountant', 'head of institution', 'procurement', 'staff']
      },
      {
        id: 'requisitions_list',
        name: 'Manage Requisitions',
        href: '/requisitions/manage',
        icon: getIcon('FileCheck'),
        description: 'Manage all requisitions',
        roles: ['admin', 'hod', 'accountant', 'head of institution', 'final_approver', 'procurement', 'staff', 'auditor']
      },
      {
        id: 'requisitions_history',
        name: 'Requisitions History',
        href: '/requisitions/history',
        icon: getIcon('History'),
        description: 'Track all requisitions',
        roles: ['admin', 'hod', 'accountant', 'head of institution', 'final_approver', 'procurement', 'staff', 'auditor']
      },
      {
        id: 'pending_approvals',
        name: 'Pending Approvals',
        href: '/requisitions/pending',
        icon: getIcon('ClipboardList'),
        description: 'Requisitions awaiting your approval',
        roles: ['hod', 'accountant', 'head of institution', 'final_approver'],
      }
    ]
  },

  // 4. APPROVALS
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
        description: 'Funds verification (Level 2)',
        roles: ['accountant']
      },
      {
        id: 'head_of_institution_approvals',
        name: 'Head of Institution Approvals',
        href: '/approvals/head-of-institution',
        icon: getIcon('Building2'),
        description: 'Institutional approvals (Level 3)',
        roles: ['head of institution']
      },
      {
        id: 'final_approvals',
        name: 'Final Approvals',
        href: '/approvals/final',
        icon: getIcon('Shield'),
        description: 'Final authorization (Level 4)',
        roles: ['final_approver']
      },
    ]
  },

  // 5. QUOTATIONS
  {
    id: 'procurement-quotations',
    title: 'Quotations',
    icon: getIcon('ShoppingCart'),
    defaultOpen: false,
    items: [
      {
        id: 'create-request-for-quotations',
        name: 'Create RFQ',
        href: '/procurement/request-for-quotations/create',
        icon: getIcon('FilePlus'),
        description: 'Create new Request for Quotations',
        roles: ['admin', 'procurement', 'accountant']
      },
      {
        id: 'request-for-quotations-management',
        name: 'RFQ Management',
        href: '/procurement/request-for-quotations/manage',
        icon: getIcon('FileText'),
        description: 'Manage RFQs and supplier responses',
        roles: ['admin', 'procurement', 'accountant']
      },
      {
        id: 'rfq-responses',
        name: 'RFQ Responses',
        href: '/procurement/request-for-quotations/responses',
        icon: getIcon('MessageSquare'),
        description: 'View and evaluate supplier quotations',
        roles: ['admin', 'procurement', 'accountant', 'hod']
      },
      {
        id: 'supplier_quotations',
        name: 'Supplier Quotations',
        href: '/procurement/supplier-quotations',
        icon: getIcon('CheckCircle'),
        description: 'View your suppliers quotations and awarded contracts',
        roles: ['admin', 'procurement', 'accountant']
      },
      {
        id: 'supplier_dashboard',
        name: 'Dashboard',
        href: '/procurement/supplier/dashboard',
        icon: getIcon('LayoutDashboard'),
        description: 'Your RFQ and requisition overview',
        roles: ['supplier']
      },
      {
        id: 'supplier_rfq_invitations',
        name: 'RFQ Invitations',
        href: '/procurement/supplier/rfq-invitations',
        icon: getIcon('Mail'),
        description: 'View and respond to RFQ invitations',
        roles: ['supplier']
      },
      {
        id: 'supplier_my_quotations',
        name: 'My Quotations',
        href: '/procurement/supplier/quotations',
        icon: getIcon('FileText'),
        description: 'Track your submitted quotations',
        roles: ['supplier']
      },
    ]
  },

  // 6. PURCHASE ORDERS
  {
    id: 'orders',
    title: 'Purchase Orders',
    icon: getIcon('Package'),
    defaultOpen: false,
    items: [
      {
        id: 'manage_orders',
        name: 'Manage Orders',
        href: '/procurement/purchase-orders/manage-orders',
        icon: getIcon('ShoppingCart'),
        description: 'Create and manage LPO/LSO, GRN/SAN',
        roles: ['admin', 'procurement', 'accountant', 'head of institution', 'final_approver', 'hod', 'auditor', 'storekeeper']
      },
      {
        id: 'pending_check',
        name: 'Pending Check (HOD)',
        href: '/procurement/purchase-orders/pending-check',
        icon: getIcon('UserCheck'),
        description: 'Review and check purchase orders awaiting HOD approval',
        roles: ['admin', 'hod'],
        badge: 'HOD',
        badgeColor: 'amber'
      },
      {
        id: 'pending_endorsement',
        name: 'Pending Endorsement',
        href: '/procurement/purchase-orders/pending-endorsement',
        icon: getIcon('Signature'),
        description: 'Review and endorse purchase orders awaiting Accountant approval',
        roles: ['admin', 'accountant'],
        badge: 'Accountant',
        badgeColor: 'blue'
      },
      {
        id: 'pending_approval',
        name: 'Pending Approval',
        href: '/procurement/purchase-orders/pending-approval',
        icon: getIcon('ShieldCheck'),
        description: 'Review and approve purchase orders awaiting Director approval',
        roles: ['admin', 'director', 'final_approver'],
        badge: 'Director',
        badgeColor: 'purple'
      },
      {
        id: 'supplier_acknowledgments',
        name: 'Supplier Acknowledgments',
        href: '/procurement/purchase-orders/supplier-acknowledgments',
        icon: getIcon('Handshake'),
        description: 'LPOs sent for Acknowledgement',
        roles: ['admin', 'supplier'],
        badge: 'Supplier',
        badgeColor: 'indigo'
      },
      {
        id: 'track_orders',
        name: 'Track Orders',
        href: '/procurement/purchase-orders/track-orders',
        icon: getIcon('Target'),
        description: 'Track order status and delivery progress',
        roles: ['admin', 'procurement', 'accountant', 'head of institution']
      },
      {
        id: 'order_history',
        name: 'Order History',
        href: '/procurement/purchase-orders/order-history',
        icon: getIcon('Clock'),
        description: 'View historical purchase orders and receipts',
        roles: ['supplier']
      }
    ]
  },

  // 7. DELIVERY NOTES
  {
    id: 'delivery-notes',
    title: 'Delivery Notes',
    icon: getIcon('ClipboardList'),
    defaultOpen: false,
    items: [
      {
        id: 'goods_received_notes',
        name: 'Goods Received Notes',
        href: '/procurement/delivery-notes/goods-received',
        icon: getIcon('Package'),
        description: 'Manage GRN for goods deliveries',
        roles: ['admin', 'procurement', 'accountant', 'storekeeper', 'hod', 'auditor']
      },
      {
        id: 'service_acknowledgment_notes',
        name: 'Service Acknowledgment Notes',
        href: '/procurement/delivery-notes/service-acknowledgment',
        icon: getIcon('FileCheck'),
        description: 'Manage SAN for service deliveries',
        roles: ['admin', 'procurement', 'accountant', 'hod', 'auditor']
      },
      {
        id: 'delivery_tracking',
        name: 'Delivery Tracking',
        href: '/procurement/delivery-notes/tracking',
        icon: getIcon('Truck'),
        description: 'Track delivery progress and status',
        roles: ['admin', 'procurement', 'accountant', 'hod', 'supplier']
      }
    ]
  },

  // 8. INVOICES (COMING SOON)
  {
    id: 'invoices',
    title: 'Invoices',
    icon: getIcon('Receipt'),
    defaultOpen: false,
    comingSoon: true,
    items: [
      {
        id: 'invoices_management',
        name: 'Manage Invoices',
        href: '/procurement/invoices',
        icon: getIcon('Receipt'),
        description: 'View, verify, and manage invoices',
        roles: ['admin', 'accountant', 'procurement', 'auditor', 'supplier'],
        disabled: true,
        badge: 'Coming Soon',
        badgeColor: 'gray'
      },
      {
        id: 'invoice_verification',
        name: 'Invoice Verification',
        href: '/procurement/invoices/verify',
        icon: getIcon('ShieldCheck'),
        description: 'Verify and approve supplier invoices',
        roles: ['admin', 'accountant', 'procurement', 'auditor'],
        disabled: true,
        badge: 'Coming Soon',
        badgeColor: 'gray'
      },
      {
        id: 'invoice_history',
        name: 'Invoice History',
        href: '/procurement/invoices/history',
        icon: getIcon('History'),
        description: 'View historical invoices and payment status',
        roles: ['admin', 'accountant', 'procurement', 'auditor', 'supplier'],
        disabled: true,
        badge: 'Coming Soon',
        badgeColor: 'gray'
      }
    ]
  },

  // 9. PAYMENTS (COMING SOON)
  {
    id: 'payments',
    title: 'Payments',
    icon: getIcon('DollarSign'),
    defaultOpen: false,
    comingSoon: true,
    items: [
      {
        id: 'payment_vouchers',
        name: 'Payment Vouchers',
        href: '/procurement/payments/vouchers',
        icon: getIcon('FileCheck'),
        description: 'Create, manage, and endorse payment vouchers',
        roles: ['admin', 'accountant', 'head of institution'],
        disabled: true,
        badge: 'Coming Soon',
        badgeColor: 'gray'
      },
      {
        id: 'cheque_management',
        name: 'Cheque Management',
        href: '/procurement/payments/cheques',
        icon: getIcon('Wallet'),
        description: 'Track and record cheques',
        roles: ['admin', 'accountant'],
        disabled: true,
        badge: 'Coming Soon',
        badgeColor: 'gray'
      },
      {
        id: 'payment_analytics',
        name: 'Payment Analytics',
        href: '/procurement/payments/analytics',
        icon: getIcon('TrendingUp'),
        description: 'Payment history, reconciliation, and outstanding payments',
        roles: ['admin', 'accountant', 'auditor', 'head of institution', 'supplier'],
        disabled: true,
        badge: 'Coming Soon',
        badgeColor: 'gray'
      },
      {
        id: 'payment_approvals',
        name: 'Payment Approvals',
        href: '/procurement/payments/approvals',
        icon: getIcon('Shield'),
        description: 'Approve pending payments',
        roles: ['admin', 'accountant', 'head of institution', 'final_approver'],
        disabled: true,
        badge: 'Coming Soon',
        badgeColor: 'gray'
      }
    ]
  },

  // 10. CONTRACTS (COMING SOON)
  {
    id: 'contracts',
    title: 'Contracts',
    icon: getIcon('FileCheck'),
    defaultOpen: false,
    comingSoon: true,
    items: [
      {
        id: 'contracts_management',
        name: 'Manage Contracts',
        href: '/procurement/contracts',
        icon: getIcon('FileCheck'),
        description: 'Create and manage contracts',
        roles: ['admin', 'procurement'],
        disabled: true,
        badge: 'Coming Soon',
        badgeColor: 'gray'
      },
      {
        id: 'contracts_approvals',
        name: 'Contract Approvals',
        href: '/procurement/contracts/approvals',
        icon: getIcon('ShieldCheck'),
        description: 'Review and approve contracts',
        roles: ['admin', 'head of institution', 'final_approver'],
        disabled: true,
        badge: 'Coming Soon',
        badgeColor: 'gray'
      },
      {
        id: 'contracts_tracking',
        name: 'Contract Tracking',
        href: '/procurement/contracts/tracking',
        icon: getIcon('Target'),
        description: 'Track contract status and renewals',
        roles: ['admin', 'procurement', 'accountant'],
        disabled: true,
        badge: 'Coming Soon',
        badgeColor: 'gray'
      }
    ]
  },

  // 11. TENDERS (COMING SOON)
  {
    id: 'tenders',
    title: 'Tenders',
    icon: getIcon('Award'),
    defaultOpen: false,
    comingSoon: true,
    items: [
      {
        id: 'tenders_management',
        name: 'Manage Tenders',
        href: '/procurement/tenders',
        icon: getIcon('Award'),
        description: 'Create and manage tender notices',
        roles: ['admin', 'procurement'],
        disabled: true,
        badge: 'Coming Soon',
        badgeColor: 'gray'
      },
      {
        id: 'tenders_bidders',
        name: 'Bidder Management',
        href: '/procurement/tenders/bidders',
        icon: getIcon('Users'),
        description: 'Manage tender bidders and responses',
        roles: ['admin', 'procurement'],
        disabled: true,
        badge: 'Coming Soon',
        badgeColor: 'gray'
      },
      {
        id: 'tenders_evaluation',
        name: 'Tender Evaluation',
        href: '/procurement/tenders/evaluation',
        icon: getIcon('BarChart3'),
        description: 'Evaluate and award tenders',
        roles: ['admin', 'procurement', 'accountant'],
        disabled: true,
        badge: 'Coming Soon',
        badgeColor: 'gray'
      }
    ]
  },

  // 12. BUDGET & FINANCE (COMING SOON)
  {
    id: 'budget',
    title: 'Budget & Finance',
    icon: getIcon('DollarSign'),
    defaultOpen: false,
    comingSoon: true,
    items: [
      {
        id: 'budget_overview',
        name: 'Budget Overview',
        href: '/budget',
        icon: getIcon('PieChart'),
        description: 'Budget allocation, planning, and utilization',
        roles: ['admin', 'accountant', 'head of institution'],
        disabled: true,
        badge: 'Coming Soon',
        badgeColor: 'gray'
      },
      {
        id: 'expenditure',
        name: 'Expenditure',
        href: '/budget/expenditure',
        icon: getIcon('TrendingUp'),
        description: 'Track expenditures',
        roles: ['admin', 'accountant', 'head of institution', 'hod', 'auditor'],
        disabled: true,
        badge: 'Coming Soon',
        badgeColor: 'gray'
      }
    ]
  },

  // 13. REPORTS & ANALYTICS (COMING SOON)
  {
    id: 'reports',
    title: 'Reports & Analytics',
    icon: getIcon('BarChart3'),
    defaultOpen: false,
    comingSoon: true,
    items: [
      {
        id: 'reports',
        name: 'All Reports',
        href: '/reports',
        icon: getIcon('FileText'),
        description: 'Requisition, approval, spending, supplier, audit, and financial reports',
        roles: ['admin', 'accountant', 'head of institution', 'hod', 'procurement', 'auditor', 'supplier'],
        disabled: true,
        badge: 'Coming Soon',
        badgeColor: 'gray'
      },
      {
        id: 'custom_reports',
        name: 'Custom Reports',
        href: '/reports/custom',
        icon: getIcon('Filter'),
        description: 'Build custom reports',
        roles: ['admin', 'accountant', 'auditor'],
        disabled: true,
        badge: 'Coming Soon',
        badgeColor: 'gray'
      }
    ]
  },

  // 14. HELP & SUPPORT (COMING SOON)
  {
    id: 'support',
    title: 'Help & Support',
    icon: getIcon('HelpCircle'),
    defaultOpen: false,
    comingSoon: true,
    items: [
      {
        id: 'support_tickets',
        name: 'Support Tickets',
        href: '/help/tickets',
        icon: getIcon('MessageSquare'),
        description: 'Support ticket management',
        roles: ['admin', 'hod', 'accountant', 'head of institution', 'procurement', 'staff', 'supplier'],
        disabled: true,
        badge: 'Coming Soon',
        badgeColor: 'gray'
      },
      {
        id: 'knowledge_base',
        name: 'Knowledge Base',
        href: '/help',
        icon: getIcon('BookOpen'),
        description: 'Documentation, FAQ, and knowledge base',
        roles: ['admin', 'hod', 'accountant', 'head of institution', 'final_approver', 'procurement', 'staff', 'auditor', 'supplier'],
        disabled: true,
        badge: 'Coming Soon',
        badgeColor: 'gray'
      }
    ]
  }
]
