// frontend/src/app/procurement/quotations/create/page.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Building2,
  User,
  Mail,
  Info,
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Eye,
  FileCheck,
  Sparkles,
  Store,
  BadgeCheck,
  FileText,
  Package,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Plus,
  Send,
  TrendingUp,
  Award,
  Shield,
  CreditCard,
  Crown,
  Briefcase,
  Hash,
  MapPin,
  Globe,
  Phone,
  MailCheck,
  Building,
  UserCog,
  Check,
  ChevronRight,
  Edit,
  Bell,
} from 'lucide-react';

import { format } from 'date-fns';
import { useToast } from '@/components/ui/toast-context';
import { PageTemplate } from '@/components/dashboard/PageTemplate';

// UI Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

// Hooks
import { useSuppliers } from '@/hooks/useSuppliers';
import { useCreateQuotation } from '@/hooks/useQuotation';
import { useReadyRequisitions } from '@/hooks/useProcurement';

// Types
import type { Requisition } from '@/types/requisition.types';

// Animation utilities
const fadeInUp = 'animate-in fade-in slide-in-from-bottom-4 duration-500';

// ============================================
// STATUS BADGE
// ============================================

function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    draft: {
      label: 'Draft',
      color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
      icon: <FileText className="h-3 w-3" />
    },
    submitted: {
      label: 'Submitted',
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      icon: <Send className="h-3 w-3" />
    },
    hod_approved: {
      label: 'HOD Approved',
      color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
      icon: <UserCog className="h-3 w-3" />
    },
    accountant_approved: {
      label: 'Accountant Approved',
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      icon: <CreditCard className="h-3 w-3" />
    },
    principal_approved: {
      label: 'Principal Approved',
      color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      icon: <Crown className="h-3 w-3" />
    },
    final_approved: {
      label: 'Final Approved',
      color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      icon: <Award className="h-3 w-3" />
    },
    hod_declined: {
      label: 'HOD Declined',
      color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
      icon: <XCircle className="h-3 w-3" />
    },
    accountant_declined: {
      label: 'Accountant Declined',
      color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
      icon: <XCircle className="h-3 w-3" />
    },
    principal_declined: {
      label: 'Principal Declined',
      color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
      icon: <XCircle className="h-3 w-3" />
    },
    final_declined: {
      label: 'Final Declined',
      color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
      icon: <XCircle className="h-3 w-3" />
    },
    returned: {
      label: 'Returned',
      color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      icon: <ArrowLeft className="h-3 w-3" />
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
      icon: <XCircle className="h-3 w-3" />
    },
    revised: {
      label: 'Revised',
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      icon: <Edit className="h-3 w-3" />
    },
  };

  const { label, color, icon } = statusMap[status] || {
    label: status,
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    icon: <FileText className="h-3 w-3" />
  };

  return (
    <Badge variant="outline" className={`${color} border text-xs font-medium px-2.5 py-1 flex items-center gap-1.5 rounded-full`}>
      {icon}
      {label}
    </Badge>
  );
}

// ============================================
// CUSTOM DROPDOWN COMPONENT
// ============================================

interface CustomDropdownProps {
  options: Requisition[];
  value: number;
  onChange: (value: number) => void;
  placeholder: string;
  isLoading: boolean;
  disabled?: boolean;
}

function CustomDropdown({ options, value, onChange, placeholder, isLoading, disabled }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  const filteredOptions = options.filter(opt =>
    opt.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.department?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 rounded-xl border border-border/50 h-[72px]">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-5 w-5" />
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      final_approved: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      hod_approved: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      accountant_approved: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      principal_approved: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      submitted: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    };
    return colors[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      final_approved: 'Approved',
      hod_approved: 'HOD Approved',
      accountant_approved: 'Accountant Approved',
      principal_approved: 'Principal Approved',
      submitted: 'Submitted',
    };
    return labels[status] || status;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 rounded-xl border-2 transition-all cursor-pointer min-h-[72px] ${isOpen
          ? 'border-primary shadow-lg shadow-primary/20 dark:shadow-primary/10'
          : 'border-border/50 dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary/30'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedOption ? (
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm truncate text-foreground">{selectedOption.reference_number}</span>
                <Badge className={`${getStatusColor(selectedOption.status)} text-[10px] px-2 py-0 rounded-full`}>
                  {getStatusLabel(selectedOption.status)}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                <span className="text-sm text-foreground truncate">{selectedOption.title}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  KES {selectedOption.total_amount?.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {selectedOption.items?.length || 0} items
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted/30 dark:bg-muted/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="text-muted-foreground">{placeholder}</span>
          </div>
        )}
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        )}
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 rounded-xl border border-border dark:border-gray-700 shadow-xl dark:shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-border/50 dark:border-gray-700/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requisitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 bg-muted/20 dark:bg-muted/10 border-0 focus-visible:ring-1 rounded-xl"
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm('');
                  }}
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>

          <ScrollArea className="max-h-[400px]">
            {filteredOptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Search className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No requisitions found</p>
                <p className="text-xs text-muted-foreground/70">Try adjusting your search</p>
              </div>
            ) : (
              <div className="p-2 space-y-1.5">
                {filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${option.id === value
                      ? 'bg-primary/10 dark:bg-primary/20 border-2 border-primary'
                      : 'hover:bg-muted/30 dark:hover:bg-muted/20 border-2 border-transparent'
                      }`}
                    onClick={() => {
                      onChange(option.id);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${option.id === value
                        ? 'bg-primary text-white dark:bg-primary dark:text-white'
                        : 'bg-muted/50 dark:bg-muted/30 text-muted-foreground'
                        }`}>
                        <FileText className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{option.reference_number}</span>
                        <Badge className={`${getStatusColor(option.status)} text-[10px] px-2 py-0 rounded-full`}>
                          {getStatusLabel(option.status)}
                        </Badge>
                        {option.id === value && (
                          <Badge className="bg-primary/20 dark:bg-primary/30 text-primary border-primary/30 text-[10px] px-2 py-0 rounded-full">
                            Selected
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground truncate">{option.title}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {option.department?.name || 'N/A'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {option.user?.full_name || 'N/A'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          KES {option.total_amount?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {option.id === value && (
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="p-3 border-t border-border/50 dark:border-gray-700/50 bg-muted/10 dark:bg-muted/5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{filteredOptions.length} requisition{filteredOptions.length !== 1 ? 's' : ''} available</span>
              <span className="flex items-center gap-1">
                <BadgeCheck className="h-3 w-3 text-emerald-500" />
                All are fully approved
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// REQUISITION DETAILS CARD
// ============================================

interface RequisitionDetailsCardProps {
  requisition: Requisition | null;
  isLoading: boolean;
}

function RequisitionDetailsCard({ requisition, isLoading }: RequisitionDetailsCardProps) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Requisition Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-4 w-1/2 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
          <Skeleton className="h-20 w-full rounded" />
          <Skeleton className="h-4 w-1/2 rounded" />
          <Skeleton className="h-4 w-1/3 rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!requisition) {
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Requisition Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/30 dark:bg-muted/20 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No Requisition Selected</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Select a requisition from the dropdown above</p>
            <p className="text-xs text-muted-foreground/50 mt-4">All details will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl sticky top-4 shadow-lg shadow-primary/5 dark:shadow-primary/10">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 dark:bg-primary/30 flex items-center justify-center">
              <FileCheck className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium">Requisition Details</CardTitle>
          </div>
          <StatusBadge status={requisition.status} />
        </div>
        <CardDescription className="text-xs flex items-center gap-2 mt-1">
          <span className="font-mono font-semibold text-foreground dark:text-gray-200">{requisition.reference_number}</span>
          <span className="text-muted-foreground/50">•</span>
          <span>{format(new Date(requisition.created_at), 'MMM d, yyyy')}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground bg-primary/5 dark:bg-primary/10 p-2.5 rounded-xl border border-primary/10 dark:border-primary/20">
            <User className="h-3.5 w-3.5 text-primary" />
            <span className="text-foreground dark:text-gray-200 truncate font-medium">{requisition.user?.full_name || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground bg-blue-500/5 dark:bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/10 dark:border-blue-500/20">
            <Building2 className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-foreground dark:text-gray-200 font-medium">{requisition.department?.name || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground bg-emerald-500/5 dark:bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/10 dark:border-emerald-500/20 col-span-2">
            <Mail className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs truncate text-foreground dark:text-gray-200 font-medium">{requisition.user?.email || 'N/A'}</span>
          </div>
        </div>

        <Separator className="dark:bg-gray-700" />

        <div>
          <p className="text-sm font-semibold text-foreground dark:text-gray-100">{requisition.title}</p>
          {requisition.description && (
            <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1 leading-relaxed">{requisition.description}</p>
          )}
          {requisition.justification && (
            <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/50">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" />
                Justification
              </p>
              <p className="text-sm text-amber-800/80 dark:text-amber-300/80 mt-0.5">{requisition.justification}</p>
            </div>
          )}
        </div>

        <Separator className="dark:bg-gray-700" />

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground dark:text-gray-400 flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
            Financial Summary
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm bg-gradient-to-br from-primary/5 via-blue-500/5 to-emerald-500/5 dark:from-primary/10 dark:via-blue-500/10 dark:to-emerald-500/10 p-3 rounded-xl border border-primary/10 dark:border-primary/20">
            <div className="bg-white/50 dark:bg-black/20 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
              <span className="text-xs text-muted-foreground dark:text-gray-400">Total Amount</span>
              <p className="font-bold text-base text-emerald-600 dark:text-emerald-400">KES {requisition.total_amount?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-white/50 dark:bg-black/20 p-2.5 rounded-lg border border-blue-200 dark:border-blue-800/50">
              <span className="text-xs text-muted-foreground dark:text-gray-400">Budget Code</span>
              <p className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">{requisition.budget_code || 'N/A'}</p>
            </div>
            <div className="bg-white/50 dark:bg-black/20 p-2.5 rounded-lg border border-purple-200 dark:border-purple-800/50">
              <span className="text-xs text-muted-foreground dark:text-gray-400">Project Code</span>
              <p className="font-mono text-sm font-medium text-purple-600 dark:text-purple-400">{requisition.project_code || 'N/A'}</p>
            </div>
            <div className="bg-white/50 dark:bg-black/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800/50">
              <span className="text-xs text-muted-foreground dark:text-gray-400">Budget Source</span>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">{requisition.budget_source || 'N/A'}</p>
            </div>
          </div>
        </div>

        <Separator className="dark:bg-gray-700" />

        {requisition.items && requisition.items.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground dark:text-gray-400 flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-primary" />
                Items ({requisition.items.length})
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30 rounded-full">
                  {requisition.items.reduce((acc, item) => acc + Number(item.quantity), 0)} total units
                </Badge>
              </div>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {requisition.items.map((item, index) => (
                <div key={index} className="bg-muted/5 dark:bg-muted/10 hover:bg-primary/5 dark:hover:bg-primary/10 p-3 rounded-xl border border-border/30 dark:border-gray-700 transition-all hover:border-primary/30 dark:hover:border-primary/30">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-foreground dark:text-gray-200">{item.item_name}</span>
                    <Badge variant="outline" className="text-xs bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30 rounded-full">
                      {item.quantity} {item.unit_of_measure}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground dark:text-gray-400">
                    <span>Unit: KES {item.estimated_unit_cost?.toLocaleString() || 0}</span>
                    <span className="font-medium text-foreground dark:text-gray-200">Total: KES {item.total_cost?.toLocaleString() || 0}</span>
                  </div>
                  {item.specifications && (
                    <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1.5 truncate bg-muted/20 dark:bg-muted/10 p-1.5 rounded-lg">
                      {item.specifications}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator className="dark:bg-gray-700" />

        {requisition.approvals && requisition.approvals.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground dark:text-gray-400 flex items-center gap-1.5 mb-2">
              <Users className="h-3.5 w-3.5 text-primary" />
              Approval Timeline
            </p>
            <div className="space-y-1.5">
              {requisition.approvals.map((approval, index) => (
                <div key={index} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-muted/5 dark:bg-muted/10 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20 dark:hover:border-primary/30">
                  <div className="flex items-center gap-2">
                    {approval.status === 'approved' ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    ) : approval.status === 'declined' ? (
                      <XCircle className="h-3.5 w-3.5 text-red-500" />
                    ) : (
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                    )}
                    <span className="capitalize font-medium text-foreground dark:text-gray-200">{approval.level}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {approval.approver && (
                      <span className="text-muted-foreground dark:text-gray-400">{approval.approver.full_name}</span>
                    )}
                    <span className="text-muted-foreground/50 dark:text-gray-500 text-[10px]">
                      {approval.updated_at ? format(new Date(approval.updated_at), 'MMM d, HH:mm') : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(requisition.required_by_date || requisition.required_delivery_date) && (
          <>
            <Separator className="dark:bg-gray-700" />
            <div className="grid grid-cols-2 gap-2 text-xs">
              {requisition.required_by_date && (
                <div className="bg-amber-500/5 dark:bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/10 dark:border-amber-500/20">
                  <span className="text-muted-foreground dark:text-gray-400">Required By</span>
                  <p className="font-medium text-sm text-amber-600 dark:text-amber-400">{format(new Date(requisition.required_by_date), 'MMM d, yyyy')}</p>
                </div>
              )}
              {requisition.required_delivery_date && (
                <div className="bg-blue-500/5 dark:bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/10 dark:border-blue-500/20">
                  <span className="text-muted-foreground dark:text-gray-400">Delivery Required</span>
                  <p className="font-medium text-sm text-blue-600 dark:text-blue-400">{format(new Date(requisition.required_delivery_date), 'MMM d, yyyy')}</p>
                </div>
              )}
            </div>
          </>
        )}

        {requisition.metadata && Object.keys(requisition.metadata).length > 0 && (
          <>
            <Separator className="dark:bg-gray-700" />
            <div>
              <p className="text-xs font-medium text-muted-foreground dark:text-gray-400 flex items-center gap-1.5 mb-1">
                <Layers className="h-3.5 w-3.5 text-primary" />
                Additional Metadata
              </p>
              <div className="bg-muted/5 dark:bg-muted/10 p-3 rounded-xl border border-border/30 dark:border-gray-700">
                <pre className="text-[10px] font-mono whitespace-pre-wrap break-all text-muted-foreground dark:text-gray-400 max-h-24 overflow-y-auto">
                  {JSON.stringify(requisition.metadata, null, 2)}
                </pre>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// CREATE QUOTATION PAGE
// ============================================

export default function CreateQuotationPage() {
  const router = useRouter();
  const createQuotation = useCreateQuotation();
  const { success, error: toastError } = useToast();

  const {
    data: requisitionsData,
    isLoading: isLoadingRequisitions,
    refetch: refetchRequisitions,
    error: requisitionsError,
  } = useReadyRequisitions({
    per_page: 100,
  });

  const { useAllSuppliers } = useSuppliers();
  const { data: suppliersData, isLoading: isLoadingSuppliers, refetch: refetchSuppliers } = useAllSuppliers();

  const [formData, setFormData] = useState({
    requisition_id: 0,
    title: '',
    description: '',
    issue_date: format(new Date(), 'yyyy-MM-dd'),
    closing_date: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    closing_time: '17:00',
    delivery_terms: '',
    payment_terms: '',
    special_conditions: '',
    instructions: '',
    is_automated: false,
    is_tender: false,
    reminder_days: 2,
    supplier_ids: [] as number[],
  });

  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const approvedRequisitions = Array.isArray(requisitionsData)
    ? requisitionsData
    : requisitionsData?.data || [];

  const suppliers = suppliersData || [];

  useEffect(() => {
    refetchRequisitions();
    refetchSuppliers();
  }, []);

  const handleRequisitionSelect = (requisitionId: number) => {
    const requisition = approvedRequisitions.find((r: Requisition) => r.id === requisitionId);
    setSelectedRequisition(requisition || null);
    setFormData({
      ...formData,
      requisition_id: requisitionId,
      title: requisition?.title || '',
      description: requisition?.description || '',
    });
  };

  const handleSupplierToggle = (supplierId: number) => {
    setSelectedSuppliers((prev) =>
      prev.includes(supplierId)
        ? prev.filter((id) => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  const handleSubmit = async () => {
    if (formData.requisition_id === 0) {
      toastError('Please select a requisition');
      return;
    }

    if (selectedSuppliers.length === 0) {
      toastError('Please select at least one supplier');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        ...formData,
        supplier_ids: selectedSuppliers,
      };
      await createQuotation.mutateAsync(data);
      success('Quotation created successfully!');
      router.push('/procurement/quotations/manage');
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/procurement/quotations/manage');
  };

  const selectAllSuppliers = () => {
    if (selectedSuppliers.length === suppliers.length) {
      setSelectedSuppliers([]);
    } else {
      setSelectedSuppliers(suppliers.map((s: any) => s.id));
    }
  };

  const isLoading = isLoadingRequisitions;

  return (
    <PageTemplate
      title="Create Quotation Request"
      description="Generate a quotation request from an approved requisition and send it to suppliers."
      icon={<FileText className="h-5 w-5" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Quotations', href: '/procurement/quotations/manage' },
        { label: 'Create' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-full whitespace-nowrap">
            <CheckCircle className="h-3 w-3 mr-1" />
            {approvedRequisitions.length} Available
          </Badge>
          <Button variant="outline" size="sm" onClick={handleCancel} className="dark:border-gray-700 dark:hover:bg-gray-800 rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 rounded-t-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 dark:bg-primary/30 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-foreground dark:text-gray-100">Quotation Details</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Fill in the details for the quotation request. All fields marked with <span className="text-red-500">*</span> are required.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {/* Requisition Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground dark:text-gray-200 flex items-center gap-1">
                  Approved Requisition <span className="text-red-500">*</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground dark:text-gray-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="rounded-xl">
                        <p className="max-w-xs">Select a fully approved requisition to create a quotation request from.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <CustomDropdown
                  options={approvedRequisitions}
                  value={formData.requisition_id}
                  onChange={handleRequisitionSelect}
                  placeholder="Search and select a requisition..."
                  isLoading={isLoading}
                  disabled={approvedRequisitions.length === 0}
                />
                {approvedRequisitions.length === 0 && !isLoading && (
                  <Alert variant="destructive" className="mt-3 dark:bg-red-950/50 dark:border-red-800 rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Available Requisitions</AlertTitle>
                    <AlertDescription>
                      No approved requisitions ready for procurement. All approved requisitions may already have quotation requests or are in procurement.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Quotation Title <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter quotation title"
                    className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Quotation Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter a detailed description of the quotation request..."
                  rows={3}
                  className="resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 rounded-xl"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issue_date" className="text-sm font-semibold text-foreground dark:text-gray-200">
                    Issue Date
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="issue_date"
                      type="date"
                      value={formData.issue_date}
                      onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closing_date" className="text-sm font-semibold text-foreground dark:text-gray-200 flex items-center gap-1">
                    Closing Date <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="closing_date"
                      type="date"
                      value={formData.closing_date}
                      onChange={(e) => setFormData({ ...formData, closing_date: e.target.value })}
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 rounded-xl"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Closing Time & Reminder Days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="closing_time" className="text-sm font-semibold text-foreground dark:text-gray-200">
                    Closing Time
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="closing_time"
                      type="time"
                      value={formData.closing_time}
                      onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminder_days" className="text-sm font-semibold text-foreground dark:text-gray-200">
                    Reminder Days
                  </Label>
                  <div className="relative">
                    <Bell className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reminder_days"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.reminder_days}
                      onChange={(e) => setFormData({ ...formData, reminder_days: parseInt(e.target.value) || 2 })}
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="space-y-2">
                <Label htmlFor="delivery_terms" className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Delivery Terms
                </Label>
                <Textarea
                  id="delivery_terms"
                  value={formData.delivery_terms || ''}
                  onChange={(e) => setFormData({ ...formData, delivery_terms: e.target.value })}
                  placeholder="Enter delivery terms and conditions..."
                  rows={2}
                  className="resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_terms" className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Payment Terms
                </Label>
                <Textarea
                  id="payment_terms"
                  value={formData.payment_terms || ''}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  placeholder="Enter payment terms and conditions..."
                  rows={2}
                  className="resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="special_conditions" className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Special Conditions
                </Label>
                <Textarea
                  id="special_conditions"
                  value={formData.special_conditions || ''}
                  onChange={(e) => setFormData({ ...formData, special_conditions: e.target.value })}
                  placeholder="Enter any special conditions..."
                  rows={2}
                  className="resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions" className="text-sm font-semibold text-foreground dark:text-gray-200">
                  Instructions for Suppliers
                </Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions || ''}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Enter instructions for suppliers..."
                  rows={2}
                  className="resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 rounded-xl"
                />
              </div>

              {/* Options */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_automated"
                    checked={formData.is_automated}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_automated: checked as boolean })
                    }
                    className="dark:border-gray-600 dark:data-[state=checked]:bg-primary rounded"
                  />
                  <Label htmlFor="is_automated" className="text-sm cursor-pointer text-foreground dark:text-gray-200">
                    Automated QTN
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_tender"
                    checked={formData.is_tender}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_tender: checked as boolean })
                    }
                    className="dark:border-gray-600 dark:data-[state=checked]:bg-primary rounded"
                  />
                  <Label htmlFor="is_tender" className="text-sm cursor-pointer text-foreground dark:text-gray-200">
                    Tender
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supplier Selection */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 dark:bg-primary/30 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground dark:text-gray-100">Select Suppliers</CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      Choose suppliers to send this quotation request to.
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30 text-foreground dark:text-gray-200 rounded-full">
                  {selectedSuppliers.length} of {suppliers.length} selected
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="border rounded-xl p-4 max-h-60 overflow-y-auto bg-muted/5 dark:bg-muted/10 dark:border-gray-700">
                {isLoadingSuppliers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground dark:text-gray-500" />
                  </div>
                ) : suppliers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Store className="h-10 w-10 text-muted-foreground/30 dark:text-gray-700 mb-2" />
                    <p className="text-sm text-muted-foreground dark:text-gray-400">No suppliers available</p>
                    <p className="text-xs text-muted-foreground/70 dark:text-gray-500 mt-1">Please add suppliers first</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/30 dark:border-gray-700">
                      <span className="text-xs text-muted-foreground dark:text-gray-400">Select all suppliers</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs dark:hover:bg-gray-800 rounded-xl"
                        onClick={selectAllSuppliers}
                      >
                        {selectedSuppliers.length === suppliers.length ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {suppliers.map((supplier: any) => (
                        <div
                          key={supplier.id}
                          className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedSuppliers.includes(supplier.id)
                            ? 'border-primary bg-primary/10 dark:bg-primary/20'
                            : 'border-border/30 dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary/30 hover:bg-muted/5 dark:hover:bg-muted/20'
                            }`}
                          onClick={() => handleSupplierToggle(supplier.id)}
                        >
                          <Checkbox
                            id={`supplier-${supplier.id}`}
                            checked={selectedSuppliers.includes(supplier.id)}
                            onCheckedChange={() => handleSupplierToggle(supplier.id)}
                            className="dark:border-gray-600 dark:data-[state=checked]:bg-primary rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <Label htmlFor={`supplier-${supplier.id}`} className="text-sm cursor-pointer font-medium truncate block text-foreground dark:text-gray-200">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                {supplier.company_name || supplier.full_name || `Supplier #${supplier.id}`}
                              </div>
                            </Label>
                            {supplier.company_email && (
                              <p className="text-xs text-muted-foreground dark:text-gray-400 truncate flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {supplier.company_email}
                              </p>
                            )}
                          </div>
                          {selectedSuppliers.includes(supplier.id) && (
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-muted-foreground dark:text-gray-400">
                  {selectedSuppliers.length} supplier{selectedSuppliers.length !== 1 ? 's' : ''} selected
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs dark:hover:bg-gray-800 rounded-xl"
                  onClick={() => setSelectedSuppliers([])}
                  disabled={selectedSuppliers.length === 0}
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 border-t border-border/50 dark:border-gray-700 pt-4 bg-muted/5 dark:bg-muted/10 rounded-b-xl">
              <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto dark:border-gray-700 dark:hover:bg-gray-800 rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || formData.requisition_id === 0 || selectedSuppliers.length === 0}
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg shadow-primary/20 dark:shadow-primary/10 rounded-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Quotation
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Sidebar - Requisition Details */}
        <div className="lg:col-span-1">
          <RequisitionDetailsCard
            requisition={selectedRequisition}
            isLoading={isLoadingRequisitions}
          />
        </div>
      </div>
    </PageTemplate>
  );
}
