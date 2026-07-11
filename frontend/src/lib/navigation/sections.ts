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
  Permissions,
  UserMinus,
  Users2,
  Wallet,
  Watch,
  Timer,
  Target,
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
  Target
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
        id: 'activity',
        name: 'Activity & Notifications',
        href: '/dashboard/activity',
        icon: getIcon('Bell'),
        description: 'Recent activity and notifications',
        roles: ['admin', 'hod', 'accountant', 'principal', 'final_approver', 'procurement', 'staff', 'auditor']
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
        roles: ['admin', 'hod', 'accountant', 'principal', 'procurement', 'staff']
      },
      {
        id: 'requisitions_list',
        name: 'All Requisitions',
        href: '/requisitions',
        icon: getIcon('FileCheck'),
        description: 'View, manage, and track all requisitions',
        roles: ['admin', 'hod', 'accountant', 'principal', 'final_approver', 'procurement', 'staff', 'auditor']
      },
      {
        id: 'pending_approvals',
        name: 'Pending Approvals',
        href: '/requisitions/pending',
        icon: getIcon('ClipboardList'),
        description: 'Requisitions awaiting your approval',
        roles: ['hod', 'accountant', 'principal', 'final_approver'],
        badge: '0',
        badgeColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        isDynamic: true
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
        id: 'principal_approvals',
        name: 'Principal Approvals',
        href: '/approvals/principal',
        icon: getIcon('Building2'),
        description: 'Institutional approvals (Level 3)',
        roles: ['principal']
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
        description: 'Manage suppliers and blacklist',
        roles: ['admin', 'procurement', 'accountant', 'principal']
      },
      {
        id: 'quotations',
        name: 'Quotations',
        href: '/procurement/quotations',
        icon: getIcon('FileText'),
        description: 'Manage quotations, requests, and responses',
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
        id: 'orders',
        name: 'Manage Orders',
        href: '/orders',
        icon: getIcon('ShoppingCart'),
        description: 'Create and manage LPO/LSO, GRN/SAN',
        roles: ['admin', 'procurement', 'accountant', 'principal', 'final_approver', 'staff', 'hod', 'auditor']
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
        description: 'View, verify, and manage invoices',
        roles: ['admin', 'accountant', 'procurement', 'auditor']
      },
      {
        id: 'payment_vouchers',
        name: 'Payment Vouchers',
        href: '/payments/vouchers',
        icon: getIcon('FileCheck'),
        description: 'Create, manage, and endorse payment vouchers',
        roles: ['admin', 'accountant', 'principal']
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
        roles: ['admin', 'accountant', 'auditor', 'principal']
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
        roles: ['admin', 'accountant', 'principal']
      },
      {
        id: 'expenditure',
        name: 'Expenditure',
        href: '/budget/expenditure',
        icon: getIcon('TrendingUp'),
        description: 'Track expenditures',
        roles: ['admin', 'accountant', 'principal', 'hod', 'auditor']
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
        roles: ['admin', 'accountant', 'principal', 'hod', 'procurement', 'auditor']
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
        id: 'announcements',
        name: 'Announcements',
        href: '/announcements',
        icon: getIcon('Megaphone'),
        description: 'View and create announcements',
        roles: ['admin', 'hod', 'accountant', 'principal', 'final_approver', 'procurement', 'staff', 'auditor']
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
        id: 'account_settings',
        name: 'Account Settings',
        href: '/profile/settings',
        icon: getIcon('Settings'),
        description: 'Account settings, security, and preferences',
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
        id: 'support_tickets',
        name: 'Support Tickets',
        href: '/help/tickets',
        icon: getIcon('MessageSquare'),
        description: 'Support ticket management',
        roles: ['admin', 'hod', 'accountant', 'principal', 'procurement', 'staff']
      },
      {
        id: 'knowledge_base',
        name: 'Knowledge Base',
        href: '/help',
        icon: getIcon('BookOpen'),
        description: 'Documentation, FAQ, and knowledge base',
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
        id: 'staff',
        name: 'Staff Management',
        href: '/hr',
        icon: getIcon('Users'),
        description: 'Staff directory, attendance, and leave management',
        roles: ['admin', 'hod', 'principal', 'staff']
      },
      {
        id: 'performance',
        name: 'Performance & Training',
        href: '/hr/performance',
        icon: getIcon('Award'),
        description: 'Performance reviews and training programs',
        roles: ['admin', 'principal', 'hod']
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
        roles: ['admin', 'principal', 'hod', 'staff']
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
        id: 'supplier_dashboard',
        name: 'Supplier Dashboard',
        href: '/supplier',
        icon: getIcon('LayoutDashboard'),
        description: 'Quotations, orders, invoices, and payments',
        roles: ['supplier']
      }
    ]
  }
]
