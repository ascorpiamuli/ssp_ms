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

  // 9. ADMINISTRATION
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
      // ==========================================
      // ➕ NEW: SIGNATURE VERIFICATION LOGS TAB
      // ==========================================
      {
        id: 'signature-verification-logs',
        name: 'Signature Verification Logs',
        href: '/admin/signatures/logs',
        icon: getIcon('History'),
        description: 'View audit trail for all signature actions',
        roles: ['admin']
      },
      // ==========================================
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
        description: 'Funds verification (Level 2)',
        roles: ['accountant']
      },
      {
        id: 'head of institution_approvals',
        name: 'Head of Institution Approvals',
        href: '/approvals/head of institution',
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
      {
        id: 'approval_history',
        name: 'Approval History',
        href: '/approvals/history',
        icon: getIcon('Timer'),
        description: 'View approval history and timelines',
        roles: ['admin', 'accountant', 'head of institution', 'hod', 'auditor']
      }
    ]
  },

  // 4. PROCUREMENT - COMPLETE WORKFLOW WITH SUPPLIER TABS
  {
    id: 'procurement-quotations',
    title: 'Quotations',
    icon: getIcon('ShoppingCart'),
    defaultOpen: false,
    items: [
      // ============================================
      // INTERNAL PROCUREMENT TABS (Staff/Admin)
      // ============================================

      // 2. CREATE RFQ
      {
        id: 'create-request-for-quotations',
        name: 'Create RFQ',
        href: '/procurement/request-for-quotations/create',
        icon: getIcon('FilePlus'),
        description: 'Create new Request for Quotations',
        roles: ['admin', 'procurement','accountant']
      },

      // 3. RFQ MANAGEMENT
      {
        id: 'request-for-quotations-management',
        name: 'RFQ Management',
        href: '/procurement/request-for-quotations/manage',
        icon: getIcon('FileText'),
        description: 'Manage RFQs and supplier responses',
        roles: ['admin', 'procurement', 'accountant']
      },

      // 4. RFQ RESPONSES
      {
        id: 'rfq-responses',
        name: 'RFQ Responses',
        href: '/procurement/request-for-quotations/responses',
        icon: getIcon('MessageSquare'),
        description: 'View and evaluate supplier quotations',
        roles: ['admin', 'procurement', 'accountant', 'hod']
      },
      // 16. APPROVED QUOTATIONS - View approved quotations and LPO/LSO
      {
        id: 'supplier_quotations',
        name: 'Supplier Quotations',
        href: '/procurement/supplier-quotations',
        icon: getIcon('CheckCircle'),
        description: 'View your suppliers quotations and awarded contracts',
        roles: ['admin', 'procurement', 'accountant']
      },


      // ============================================
      // SUPPLIER PORTAL TABS
      // ============================================

      // 13. SUPPLIER DASHBOARD - Overview
      {
        id: 'supplier_dashboard',
        name: 'Dashboard',
        href: '/procurement/supplier/dashboard',
        icon: getIcon('LayoutDashboard'),
        description: 'Your RFQ and requisition overview',
        roles: ['supplier']
      },

      // 14. RFQ INVITATIONS - View and respond to RFQs
      {
        id: 'supplier_rfq_invitations',
        name: 'RFQ Invitations',
        href: '/procurement/supplier/rfq-invitations',
        icon: getIcon('Mail'),
        description: 'View and respond to RFQ invitations',
        roles: ['supplier']
      },

      // 15. MY QUOTATIONS - Track submitted quotations
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
  // 5. ORDERS
  {
    id: 'orders',
    title: 'Purchase Orders',
    icon: getIcon('Package'),
    defaultOpen: false,
    items: [
      // 1. MANAGE ORDERS - Main dashboard for all orders
      {
        id: 'manage_orders',
        name: 'Manage Orders',
        href: '/procurement/purchase-orders/manage-orders',
        icon: getIcon('ShoppingCart'),
        description: 'Create and manage LPO/LSO, GRN/SAN',
        roles: ['admin', 'procurement', 'accountant', 'head of institution', 'final_approver', 'hod', 'auditor', 'storekeeper']
      },

      // 2. PENDING CHECK - HOD review dashboard
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

      // 3. PENDING ENDORSEMENT - Accountant review dashboard
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

      // 4. PENDING APPROVAL - Director review dashboard
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

      // 5. SUPPLIER ACKNOWLEDGMENTS - Supplier view LPOs (NEW)
      {
        id: 'supplier_acknowledgments',
        name: 'Supplier Acknowledgments',
        href: '/procurement/purchase-orders/supplier-acknowledgments',
        icon: getIcon('Handshake'),
        description: 'LPOs sent for Aknowledgement',
        roles: ['admin', 'supplier'],
        badge: 'Supplier',
        badgeColor: 'indigo'
      },


      // 8. TRACK ORDERS - Order tracking dashboard
      {
        id: 'track_orders',
        name: 'Track Orders',
        href: '/procurement/purchase-orders/track-orders',
        icon: getIcon('Target'),
        description: 'Track order status and delivery progress',
        roles: ['admin', 'procurement', 'accountant','head of institution',]
      },

      // 9. ORDER HISTORY - Historical orders
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
        description: 'View, verify, and manage invoices',
        roles: ['admin', 'accountant', 'procurement', 'auditor', 'supplier']
      },
      {
        id: 'payment_vouchers',
        name: 'Payment Vouchers',
        href: '/payments/vouchers',
        icon: getIcon('FileCheck'),
        description: 'Create, manage, and endorse payment vouchers',
        roles: ['admin', 'accountant', 'head of institution']
      },
      {
        id: 'cheque_management',
        name: 'Cheque Management',
        href: '/payments/cheques',
        icon: getIcon('Wallet'),
        description: 'Track and record cheques',
        roles: ['admin', 'accountant']
      },
      {
        id: 'payment_analytics',
        name: 'Payment Analytics',
        href: '/payments/analytics',
        icon: getIcon('TrendingUp'),
        description: 'Payment history, reconciliation, and outstanding payments',
        roles: ['admin', 'accountant', 'auditor', 'head of institution', 'supplier']
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
        href: '/budget',
        icon: getIcon('PieChart'),
        description: 'Budget allocation, planning, and utilization',
        roles: ['admin', 'accountant', 'head of institution']
      },
      {
        id: 'expenditure',
        name: 'Expenditure',
        href: '/budget/expenditure',
        icon: getIcon('TrendingUp'),
        description: 'Track expenditures',
        roles: ['admin', 'accountant', 'head of institution', 'hod', 'auditor']
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
        id: 'reports',
        name: 'All Reports',
        href: '/reports',
        icon: getIcon('FileText'),
        description: 'Requisition, approval, spending, supplier, audit, and financial reports',
        roles: ['admin', 'accountant', 'head of institution', 'hod', 'procurement', 'auditor', 'supplier']
      },
      {
        id: 'custom_reports',
        name: 'Custom Reports',
        href: '/reports/custom',
        icon: getIcon('Filter'),
        description: 'Build custom reports',
        roles: ['admin', 'accountant', 'auditor']
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
        roles: ['admin', 'hod', 'accountant', 'head of institution', 'final_approver', 'procurement', 'staff', 'auditor', 'supplier']
      },
      {
        id: 'messages',
        name: 'Messages',
        href: '/messages',
        icon: getIcon('MessageSquare'),
        description: 'Internal messages',
        roles: ['admin', 'hod', 'accountant', 'head of institution', 'procurement', 'staff', 'supplier']
      },
      {
        id: 'announcements',
        name: 'Announcements',
        href: '/announcements',
        icon: getIcon('Megaphone'),
        description: 'View and create announcements',
        roles: ['admin', 'hod', 'accountant', 'head of institution', 'final_approver', 'procurement', 'staff', 'auditor', 'supplier']
      }
    ]
  },

  // 11. PROFILE
  {
    id: 'department-settings',
    title: 'Department Settings',
    icon: getIcon('Settings'),
    defaultOpen: false,
    items: [
      {
        id: 'staff-management',
        name: 'Staff Management',
        href: '/department/staff-management',
        icon: getIcon('FIle'),
        description: 'Manage and assign staff to Depts',
        roles: ['admin', 'hod']
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
        id: 'support_tickets',
        name: 'Support Tickets',
        href: '/help/tickets',
        icon: getIcon('MessageSquare'),
        description: 'Support ticket management',
        roles: ['admin', 'hod', 'accountant', 'head of institution', 'procurement', 'staff', 'supplier']
      },
      {
        id: 'knowledge_base',
        name: 'Knowledge Base',
        href: '/help',
        icon: getIcon('BookOpen'),
        description: 'Documentation, FAQ, and knowledge base',
        roles: ['admin', 'hod', 'accountant', 'head of institution', 'final_approver', 'procurement', 'staff', 'auditor', 'supplier']
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
        id: 'staff',
        name: 'Staff Management',
        href: '/hr',
        icon: getIcon('Users'),
        description: 'Staff directory, attendance, and leave management',
        roles: ['admin', 'hod', 'head of institution', 'staff']
      },
      {
        id: 'performance',
        name: 'Performance & Training',
        href: '/hr/performance',
        icon: getIcon('Award'),
        description: 'Performance reviews and training programs',
        roles: ['admin', 'head of institution', 'hod']
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
        name: 'Assets & Inventory',
        href: '/assets',
        icon: getIcon('Briefcase'),
        description: 'Manage assets, inventory, and maintenance',
        roles: ['admin', 'accountant', 'procurement', 'auditor']
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
        name: 'Facilities & Rooms',
        href: '/facilities',
        icon: getIcon('Building2'),
        description: 'Manage facilities, rooms, and maintenance',
        roles: ['admin', 'head of institution', 'hod', 'staff']
      }
    ]
  }
]
