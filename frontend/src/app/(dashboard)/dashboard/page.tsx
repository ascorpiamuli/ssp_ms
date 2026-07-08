// app/dashboard/page.tsx

'use client'

import { useAuthContext } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  FileText,
  Users,
  ShoppingCart,
  Package,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  PlusCircle,
  Bell,
  ChevronRight,
  Download,
  Printer,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Building2,
  Truck,
  Receipt,
  Wallet,
  BarChart3,
  PieChart,
  Activity,
  ArrowUp,
  ArrowDown,
  Calendar,
  Filter,
  Search,
  MoreVertical,
  Send,
  MessageSquare,
  HelpCircle,
  Settings,
  User,
  LogOut,
  Shield,
  Award,
  Star,
  Users2,
  Briefcase,
  Box,
  DoorOpen,
  Wrench,
  Megaphone,
  AlertTriangle,
  Check,
  X,
  FileCheck,
  ClipboardList,
  DollarSign,
  TrendingDown,
  RefreshCw,
  CalendarDays,
  Clock8,
  Timer,
  Target,
  EyeOff,
  Lock,
  Key,
  Mail,
  Phone,
  MapPin,
  Globe,
  Link as LinkIcon,
  ExternalLink,
  Zap,
  Flame,
  Gift,
  Crown,
  Sparkles,
  Info,
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

// ============================================================
// TYPES
// ============================================================

interface Stats {
  totalRequisitions: number
  pendingApprovals: number
  activeOrders: number
  totalSpent: string
  approvedRequisitions: number
  declinedRequisitions: number
  totalSuppliers: number
  pendingInvoices: number
  budgetUtilization: string
  onTimeDeliveries: string
  averageApprovalTime: string
}

interface Activity {
  id: string
  icon: any
  title: string
  description: string
  time: string
  color: string
  type: 'requisition' | 'approval' | 'order' | 'payment' | 'supplier' | 'system'
}

interface Requisition {
  id: string
  number: string
  title: string
  department: string
  type: 'goods' | 'service'
  amount: string
  status: 'draft' | 'pending_hod' | 'pending_accountant' | 'pending_principal' | 'pending_final_approval' | 'approved' | 'declined' | 'returned'
  date: string
  requester: string
  isEmergency: boolean
}

interface Order {
  id: string
  number: string
  type: 'lpo' | 'lso'
  supplier: string
  amount: string
  status: 'draft' | 'approved' | 'issued' | 'completed' | 'cancelled'
  date: string
  department: string
}

interface Supplier {
  id: string
  name: string
  company: string
  email: string
  phone: string
  rating: number
  status: 'active' | 'blacklisted'
  orders: number
}

interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'info' | 'success' | 'warning' | 'error'
}

// ============================================================
// STATS CARD COMPONENT
// ============================================================

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  href,
  trend,
  trendValue,
}: {
  title: string
  value: string | number
  icon: any
  color: string
  href?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}) {
  const card = (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 truncate">
            {value}
          </p>
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-1">
              {trend === 'up' && <ArrowUp className="h-3 w-3 text-green-500" />}
              {trend === 'down' && <ArrowDown className="h-3 w-3 text-red-500" />}
              <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} flex-shrink-0 transition-transform group-hover:scale-110`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{card}</Link>
  }

  return card
}

// ============================================================
// QUICK ACTION BUTTON
// ============================================================

function QuickAction({
  title,
  icon: Icon,
  href,
  color,
  description,
}: {
  title: string
  icon: any
  href: string
  color: string
  description?: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all group"
    >
      <div className={`p-3 rounded-lg ${color} transition-transform group-hover:scale-110`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-gray-900 dark:text-white block">{title}</span>
        {description && (
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate block">{description}</span>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
    </Link>
  )
}

// ============================================================
// ACTIVITY ITEM
// ============================================================

function ActivityItem({
  icon: Icon,
  title,
  description,
  time,
  color,
}: {
  icon: any
  title: string
  description: string
  time: string
  color: string
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-2 px-2 rounded-lg transition-colors">
      <div className={`p-2 rounded-lg ${color} mt-0.5 flex-shrink-0`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{description}</p>
      </div>
      <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0">{time}</span>
    </div>
  )
}

// ============================================================
// REQUISITION TABLE ROW
// ============================================================

function RequisitionRow({ requisition }: { requisition: Requisition }) {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    pending_hod: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    pending_accountant: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    pending_principal: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    pending_final_approval: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    returned: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  }

  const statusLabels = {
    draft: 'Draft',
    pending_hod: 'Pending HOD',
    pending_accountant: 'Pending Accountant',
    pending_principal: 'Pending Principal',
    pending_final_approval: 'Pending Final',
    approved: 'Approved',
    declined: 'Declined',
    returned: 'Returned',
  }

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-white">{requisition.number}</span>
          {requisition.isEmergency && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-medium rounded-full">
              <Flame className="h-2.5 w-2.5" />
              Emergency
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">{requisition.title}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{requisition.department}</div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-sm text-gray-900 dark:text-white">{requisition.type}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-sm font-medium text-gray-900 dark:text-white">{requisition.amount}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[requisition.status]}`}>
          {statusLabels[requisition.status]}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {requisition.date}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <button className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <Eye className="h-4 w-4" />
          </button>
          {requisition.status === 'draft' && (
            <button className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <Edit className="h-4 w-4" />
            </button>
          )}
          {requisition.status === 'pending_hod' && (
            <button className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

// ============================================================
// ORDER CARD
// ============================================================

function OrderCard({ order }: { order: Order }) {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    issued: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    completed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white">{order.number}</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Supplier: {order.supplier}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Department: {order.department}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{order.amount}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{order.date}</p>
          <div className="flex items-center gap-1 mt-1 justify-end">
            <button className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// SUPPLIER CARD
// ============================================================

function SupplierCard({ supplier }: { supplier: Supplier }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
          <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white truncate">{supplier.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{supplier.company}</p>
            </div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${supplier.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
              {supplier.status}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-400" />
              {supplier.rating} / 5
            </span>
            <span>•</span>
            <span>{supplier.orders} orders</span>
            <span>•</span>
            <span>{supplier.email}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// NOTIFICATION ITEM
// ============================================================

function NotificationItem({ notification }: { notification: Notification }) {
  const colors = {
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <div className={`flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10 -mx-2 px-2 rounded-lg' : ''}`}>
      <div className={`p-2 rounded-lg ${colors[notification.type]} flex-shrink-0 mt-0.5`}>
        {notification.type === 'info' && <Info className="h-3.5 w-3.5" />}
        {notification.type === 'success' && <CheckCircle className="h-3.5 w-3.5" />}
        {notification.type === 'warning' && <AlertCircle className="h-3.5 w-3.5" />}
        {notification.type === 'error' && <AlertTriangle className="h-3.5 w-3.5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{notification.message}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notification.time}</p>
      </div>
      {!notification.read && (
        <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0 mt-2"></span>
      )}
    </div>
  )
}

// ============================================================
// CHART PLACEHOLDER
// ============================================================

function ChartPlaceholder({ title, height = 200 }: { title: string; height?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">{title}</h3>
      <div className={`h-[${height}px] bg-gradient-to-b from-gray-100/50 to-gray-50/50 dark:from-gray-700/30 dark:to-gray-800/30 rounded-lg flex items-center justify-center`}>
        <div className="text-center">
          <BarChart3 className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-xs text-gray-400 dark:text-gray-500">Chart visualization will appear here</p>
          <p className="text-[10px] text-gray-300 dark:text-gray-600">(Data will be loaded from API)</p>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MAIN DASHBOARD PAGE
// ============================================================

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthContext()
  const [activeTab, setActiveTab] = useState<'overview' | 'requisitions' | 'orders' | 'suppliers'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  // ============================================================
  // MOCK DATA
  // ============================================================

  const stats: Stats = {
    totalRequisitions: 47,
    pendingApprovals: 8,
    activeOrders: 12,
    totalSpent: 'KSh 1,245,000',
    approvedRequisitions: 32,
    declinedRequisitions: 5,
    totalSuppliers: 18,
    pendingInvoices: 6,
    budgetUtilization: '72%',
    onTimeDeliveries: '94%',
    averageApprovalTime: '2.4 days',
  }

  const recentActivities: Activity[] = [
    {
      id: '1',
      icon: FileText,
      title: 'Requisition MR-2026-0045 submitted',
      description: 'Submitted by John Doe (Mathematics Department)',
      time: '5 min ago',
      color: 'bg-blue-500',
      type: 'requisition'
    },
    {
      id: '2',
      icon: CheckCircle,
      title: 'LPO-2026-0032 approved',
      description: 'Approved by Principal',
      time: '25 min ago',
      color: 'bg-green-500',
      type: 'order'
    },
    {
      id: '3',
      icon: AlertCircle,
      title: 'Requisition MR-2026-0043 returned',
      description: 'Returned by Accountant for revision',
      time: '1 hour ago',
      color: 'bg-red-500',
      type: 'approval'
    },
    {
      id: '4',
      icon: Users,
      title: 'New supplier registered',
      description: 'ABC Supplies Ltd - Approved',
      time: '2 hours ago',
      color: 'bg-purple-500',
      type: 'supplier'
    },
    {
      id: '5',
      icon: CreditCard,
      title: 'Payment voucher PV-2026-0018 generated',
      description: 'For supplier XYZ Services - KSh 45,000',
      time: '3 hours ago',
      color: 'bg-green-500',
      type: 'payment'
    },
    {
      id: '6',
      icon: Truck,
      title: 'GRN-2026-0024 confirmed',
      description: 'Goods received from Tech Solutions Ltd',
      time: '4 hours ago',
      color: 'bg-blue-500',
      type: 'order'
    }
  ]

  const requisitions: Requisition[] = [
    {
      id: '1',
      number: 'MR-2026-0045',
      title: 'Laboratory Equipment',
      department: 'Science Department',
      type: 'goods',
      amount: 'KSh 78,500',
      status: 'pending_hod',
      date: '2026-06-15',
      requester: 'John Doe',
      isEmergency: false
    },
    {
      id: '2',
      number: 'MR-2026-0044',
      title: 'Computer Lab Maintenance',
      department: 'ICT Department',
      type: 'service',
      amount: 'KSh 45,000',
      status: 'pending_accountant',
      date: '2026-06-14',
      requester: 'Jane Smith',
      isEmergency: false
    },
    {
      id: '3',
      number: 'MR-2026-0043',
      title: 'Classroom Furniture',
      department: 'Administration',
      type: 'goods',
      amount: 'KSh 120,000',
      status: 'returned',
      date: '2026-06-13',
      requester: 'Mike Johnson',
      isEmergency: false
    },
    {
      id: '4',
      number: 'MR-2026-0042',
      title: 'Network Infrastructure Upgrade',
      department: 'ICT Department',
      type: 'service',
      amount: 'KSh 250,000',
      status: 'pending_principal',
      date: '2026-06-12',
      requester: 'Jane Smith',
      isEmergency: true
    },
    {
      id: '5',
      number: 'MR-2026-0041',
      title: 'Science Lab Chemicals',
      department: 'Science Department',
      type: 'goods',
      amount: 'KSh 34,200',
      status: 'approved',
      date: '2026-06-11',
      requester: 'John Doe',
      isEmergency: false
    }
  ]

  const orders: Order[] = [
    {
      id: '1',
      number: 'LPO-2026-0032',
      type: 'lpo',
      supplier: 'ABC Supplies Ltd',
      amount: 'KSh 78,500',
      status: 'issued',
      date: '2026-06-14',
      department: 'Science Department'
    },
    {
      id: '2',
      number: 'LSO-2026-0018',
      type: 'lso',
      supplier: 'Tech Solutions Ltd',
      amount: 'KSh 45,000',
      status: 'approved',
      date: '2026-06-13',
      department: 'ICT Department'
    },
    {
      id: '3',
      number: 'LPO-2026-0031',
      type: 'lpo',
      supplier: 'ABC Supplies Ltd',
      amount: 'KSh 120,000',
      status: 'completed',
      date: '2026-06-10',
      department: 'Administration'
    },
    {
      id: '4',
      number: 'LSO-2026-0017',
      type: 'lso',
      supplier: 'Tech Solutions Ltd',
      amount: 'KSh 250,000',
      status: 'issued',
      date: '2026-06-12',
      department: 'ICT Department'
    }
  ]

  const suppliers: Supplier[] = [
    {
      id: '1',
      name: 'ABC Supplies Ltd',
      company: 'ABC Supplies Ltd',
      email: 'info@abcsupplies.com',
      phone: '+254 700 000 000',
      rating: 4.5,
      status: 'active',
      orders: 12
    },
    {
      id: '2',
      name: 'Tech Solutions Ltd',
      company: 'Tech Solutions Ltd',
      email: 'info@techsolutions.com',
      phone: '+254 700 000 001',
      rating: 4.0,
      status: 'active',
      orders: 8
    },
    {
      id: '3',
      name: 'XYZ Services',
      company: 'XYZ Services',
      email: 'info@xyzservices.com',
      phone: '+254 700 000 002',
      rating: 3.5,
      status: 'active',
      orders: 5
    },
    {
      id: '4',
      name: 'Global Supplies',
      company: 'Global Supplies Ltd',
      email: 'info@globalsupplies.com',
      phone: '+254 700 000 003',
      rating: 2.0,
      status: 'blacklisted',
      orders: 3
    }
  ]

  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Requisition MR-2026-0045 requires approval',
      message: 'John Doe submitted a requisition for Laboratory Equipment',
      time: '5 min ago',
      read: false,
      type: 'info'
    },
    {
      id: '2',
      title: 'LPO-2026-0032 was approved',
      message: 'The purchase order was approved by the Principal',
      time: '25 min ago',
      read: false,
      type: 'success'
    },
    {
      id: '3',
      title: 'Requisition MR-2026-0043 was returned',
      message: 'Accountant requested revision for Classroom Furniture',
      time: '1 hour ago',
      read: true,
      type: 'warning'
    },
    {
      id: '4',
      title: 'Payment due in 3 days',
      message: 'Invoice INV-2026-0015 is due for payment',
      time: '2 hours ago',
      read: true,
      type: 'error'
    }
  ]

  // ============================================================
  // FILTERED DATA
  // ============================================================

  const filteredRequisitions = requisitions.filter(req => {
    const matchesSearch = req.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || req.status === selectedFilter
    return matchesSearch && matchesFilter
  })

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ============================================================
             PAGE HEADER
             ============================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.full_name || 'User'}!
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Here's what's happening with your requisitions and purchases today.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Download className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Export Report</span>
            </button>
            <Link
              href="/requisitions/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
            >
              <PlusCircle className="h-5 w-5" />
              <span className="text-sm font-medium">New Requisition</span>
            </Link>
          </div>
        </div>

        {/* ============================================================
             QUICK STATS GRID
             ============================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Requisitions"
            value={stats.totalRequisitions}
            icon={FileText}
            color="bg-blue-500"
            href="/requisitions/my"
            trend="up"
            trendValue="+12% from last month"
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={Clock}
            color="bg-yellow-500"
            href="/requisitions/pending"
            trend="down"
            trendValue="-3 from last week"
          />
          <StatCard
            title="Active Orders"
            value={stats.activeOrders}
            icon={ShoppingCart}
            color="bg-green-500"
            href="/orders"
            trend="up"
            trendValue="+5 new this week"
          />
          <StatCard
            title="Total Spent"
            value={stats.totalSpent}
            icon={TrendingUp}
            color="bg-purple-500"
            href="/reports/spending"
            trend="up"
            trendValue="+8% from last month"
          />
        </div>

        {/* ============================================================
             SECONDARY STATS
             ============================================================ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Approved</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">{stats.approvedRequisitions}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Declined</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">{stats.declinedRequisitions}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Suppliers</p>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.totalSuppliers}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Pending Invoices</p>
            <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingInvoices}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Budget Used</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.budgetUtilization}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">On-Time Delivery</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">{stats.onTimeDeliveries}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Approval Time</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.averageApprovalTime}</p>
          </div>
        </div>

        {/* ============================================================
             MAIN CONTENT: TWO COLUMN LAYOUT
             ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN - Quick Actions & Notifications */}
          <div className="lg:col-span-1 space-y-6">

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Quick Actions
              </h2>
              <div className="space-y-2">
                <QuickAction
                  title="Create Requisition"
                  icon={PlusCircle}
                  href="/requisitions/create"
                  color="bg-blue-500"
                  description="Submit new requisition"
                />
                <QuickAction
                  title="View Pending Approvals"
                  icon={Clock}
                  href="/requisitions/pending"
                  color="bg-yellow-500"
                  description="Review pending requisitions"
                />
                <QuickAction
                  title="Manage Suppliers"
                  icon={Users}
                  href="/procurement/suppliers"
                  color="bg-purple-500"
                  description="Add or edit suppliers"
                />
                <QuickAction
                  title="Generate LPO/LSO"
                  icon={Package}
                  href="/orders/lpo/create"
                  color="bg-green-500"
                  description="Create purchase orders"
                />
                <QuickAction
                  title="Submit Invoice"
                  icon={Receipt}
                  href="/invoices"
                  color="bg-red-500"
                  description="Process supplier invoices"
                />
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-500" />
                  Notifications
                  <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    {notifications.filter(n => !n.read).length}
                  </span>
                </h2>
                <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  Mark all read
                </button>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
              <Link
                href="/notifications"
                className="mt-3 block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all notifications
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN - Activity & Charts */}
          <div className="lg:col-span-2 space-y-6">

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Recent Activity
                </h2>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <Link
                    href="/reports/audit"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {recentActivities.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    icon={activity.icon}
                    title={activity.title}
                    description={activity.description}
                    time={activity.time}
                    color={activity.color}
                  />
                ))}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ChartPlaceholder title="Requisitions by Department" height={200} />
              <ChartPlaceholder title="Monthly Spending Trend" height={200} />
            </div>
          </div>
        </div>

        {/* ============================================================
             REQUISITIONS TABLE
             ============================================================ */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-500" />
              Recent Requisitions
              <span className="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({requisitions.length} total)
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requisitions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
                />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending_hod">Pending HOD</option>
                <option value="pending_accountant">Pending Accountant</option>
                <option value="pending_principal">Pending Principal</option>
                <option value="pending_final_approval">Pending Final</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
                <option value="returned">Returned</option>
              </select>
              <Link
                href="/requisitions/all"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requisition No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title / Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequisitions.length > 0 ? (
                  filteredRequisitions.map((req) => (
                    <RequisitionRow key={req.id} requisition={req} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                        <p>No requisitions found</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or filter</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================
             ORDERS & SUPPLIERS GRID
             ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-green-500" />
                Recent Orders
              </h2>
              <Link
                href="/orders"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>

          {/* Suppliers */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                Top Suppliers
              </h2>
              <Link
                href="/procurement/suppliers"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {suppliers.slice(0, 3).map((supplier) => (
                <SupplierCard key={supplier.id} supplier={supplier} />
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================
             QUICK LINKS FOOTER
             ============================================================ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { name: 'My Requisitions', href: '/requisitions/my', icon: FileText },
            { name: 'Quotations', href: '/procurement/quotations', icon: FileText },
            { name: 'LPO/LSO', href: '/orders', icon: ShoppingCart },
            { name: 'Invoices', href: '/invoices', icon: CreditCard },
            { name: 'Reports', href: '/reports/requisitions', icon: TrendingUp },
            { name: 'Settings', href: '/admin/settings', icon: Settings },
          ].map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <link.icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{link.name}</span>
            </Link>
          ))}
        </div>

        {/* ============================================================
             SYSTEM STATUS
             ============================================================ */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">System Operational</span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">|</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">Last updated: 2 min ago</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                12 online
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Peak hours: 8AM - 5PM
              </span>
              <Link href="/help" className="text-blue-600 dark:text-blue-400 hover:underline">
                Need help?
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
