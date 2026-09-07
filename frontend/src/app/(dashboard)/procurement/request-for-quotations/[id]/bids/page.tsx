// frontend/src/app/(dashboard)/procurement/request-for-quotations/[id]/bids/page.tsx

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Award,
  CheckCircle,
  Crown,
  FileCheck,
  FileText,
  Loader2,
  RefreshCw,
  Scale,
  Users,
  XCircle,
  Info,
  AlertTriangle,
  Package,
  ListChecks,
  Building2,
  DollarSign,
  Truck,
  CreditCard,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Building,
  Briefcase,
  Star,
  StarHalf,
  StarOff,
  TrendingDown,
  TrendingUp,
  Eye,
  Download,
  Printer,
  Send,
  Check,
  X,
  Shield,
  BadgeCheck,
  FileSpreadsheet,
  ClipboardList,
  Calculator,
  Target,
  Gauge,
  Percent,
  BarChart3,
  PieChart,
  Zap,
  Flame,
  Heart,
  ThumbsUp,
  Gift,
  Leaf,
  Sparkle,
  Gem,
  Diamond,
  Sparkles,
  AlertCircle,
  ExternalLink,
  PlusCircle,
  Hash,
  Tag,
  AlertOctagon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Hooks
import { useAuthContext } from '@/contexts/AuthContext';
import {
  useQuotation,
  useSelectSupplier,
} from '@/hooks/useQuotation';
import {
  useSupplierQuotationsByQtn,
  useVerifySupplierQuotation,
  useEvaluateSupplierQuotation,
} from '@/hooks/useSupplierQuotation';
import { useSuppliers } from '@/hooks/useSuppliers';

// Types
import type { SupplierQuotation } from '@/types/supplierQuotation.types';
import type { Supplier } from '@/services/supplier.service';

// ============================================
// CONSTANTS
// ============================================

const VERIFICATION_ALLOWED_ROLES = ['ADMIN', 'ACCOUNTANT', 'FINANCE_ADMIN', 'PROCUREMENT'];

// ============================================
// HELPERS
// ============================================

const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return 'KES 0.00';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 'KES 0.00';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
  }).format(numAmount);
};

// Get the actual amount from quotation (prefer net_amount, fallback to total_amount)
const getQuotationAmount = (sq: any): number => {
  const netAmount = parseFloat(sq.net_amount?.toString() || '0');
  if (netAmount > 0) return netAmount;
  const totalAmount = parseFloat(sq.total_amount?.toString() || '0');
  return totalAmount;
};

const getInitials = (name: string | null | undefined): string => {
  if (!name) return '?';
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
};

const formatDate = (date: string | Date | number | null): string => {
  if (!date) return 'N/A';
  try {
    let dateObj: Date;
    if (typeof date === 'number') {
      const timestamp = date;
      if (timestamp.toString().length === 10) {
        dateObj = new Date(timestamp * 1000);
      } else {
        dateObj = new Date(timestamp);
      }
    } else if (typeof date === 'string') {
      const numDate = parseFloat(date);
      if (!isNaN(numDate) && date.match(/^\d+$/)) {
        if (numDate.toString().length === 10) {
          dateObj = new Date(numDate * 1000);
        } else {
          dateObj = new Date(numDate);
        }
      } else {
        dateObj = new Date(date);
      }
    } else {
      dateObj = new Date(date);
    }
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    if (dateObj.getFullYear() < 2000) {
      return 'Invalid Date';
    }
    return dateObj.toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
};

const formatDateTime = (date: string | Date | number | null): string => {
  if (!date) return 'N/A';
  try {
    let dateObj: Date;
    if (typeof date === 'number') {
      const timestamp = date;
      if (timestamp.toString().length === 10) {
        dateObj = new Date(timestamp * 1000);
      } else {
        dateObj = new Date(timestamp);
      }
    } else if (typeof date === 'string') {
      const numDate = parseFloat(date);
      if (!isNaN(numDate) && date.match(/^\d+$/)) {
        if (numDate.toString().length === 10) {
          dateObj = new Date(numDate * 1000);
        } else {
          dateObj = new Date(numDate);
        }
      } else {
        dateObj = new Date(date);
      }
    } else {
      dateObj = new Date(date);
    }
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    if (dateObj.getFullYear() < 2000) {
      return 'Invalid Date';
    }
    return dateObj.toLocaleString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid Date';
  }
};

// ============================================
// DIALOGS
// ============================================

interface VerifyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: SupplierQuotation | null;
  onConfirm: (data: { status: 'verified' | 'rejected'; notes: string }) => void;
  isSubmitting: boolean;
  supplierName: string;
}

const VerifyDialog = ({
  open,
  onOpenChange,
  quotation,
  onConfirm,
  isSubmitting,
  supplierName,
}: VerifyDialogProps) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) setNotes('');
  }, [open]);

  if (!quotation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-lg border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            Verify Quotation
          </DialogTitle>
          <DialogDescription className="text-base">
            Verify quotation from <span className="font-semibold text-foreground">{supplierName}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="bg-muted/30 dark:bg-gray-800/30 rounded-2xl p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Supplier</p>
                <p className="font-semibold">{supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(getQuotationAmount(quotation))}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quotation Number</p>
                <p className="font-semibold">{quotation.quotation_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Items</p>
                <p className="font-semibold">{quotation.items?.length || 0} items</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Verification Notes (Optional)</Label>
            <Textarea
              placeholder="Add any verification notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="rounded-xl resize-none"
            />
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-semibold">Verification Checklist:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>All items are correctly quoted</li>
                  <li>Unit prices are reasonable</li>
                  <li>Delivery terms are acceptable</li>
                  <li>Supplier is in good standing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl px-6">Cancel</Button>
          <Button variant="destructive" onClick={() => onConfirm({ status: 'rejected', notes })} disabled={isSubmitting} className="rounded-xl px-6">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><XCircle className="h-4 w-4 mr-2" />Reject</>}
          </Button>
          <Button onClick={() => onConfirm({ status: 'verified', notes })} disabled={isSubmitting} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 px-6">
            {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verifying...</> : <><CheckCircle className="h-4 w-4 mr-2" />Verify</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface EvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: SupplierQuotation | null;
  onConfirm: (data: { score: number; notes: string }) => void;
  isSubmitting: boolean;
  supplierName: string;
}

const EvaluationDialog = ({
  open,
  onOpenChange,
  quotation,
  onConfirm,
  isSubmitting,
  supplierName,
}: EvaluationDialogProps) => {
  const [score, setScore] = useState(70);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) { setScore(70); setNotes(''); }
  }, [open]);

  if (!quotation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-lg border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            Evaluate Quotation
          </DialogTitle>
          <DialogDescription className="text-base">
            Evaluate quotation from <span className="font-semibold text-foreground">{supplierName}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="bg-muted/30 dark:bg-gray-800/30 rounded-2xl p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Supplier</p>
                <p className="font-semibold">{supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(getQuotationAmount(quotation))}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quotation Number</p>
                <p className="font-semibold">{quotation.quotation_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Items</p>
                <p className="font-semibold">{quotation.items?.length || 0} items</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Evaluation Score</Label>
              <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">{score}%</span>
            </div>
            <Input
              type="range"
              min={0}
              max={100}
              value={score}
              onChange={(e) => setScore(parseInt(e.target.value))}
              className="h-2 rounded-full accent-purple-600"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0%</span>
              <span className="text-purple-600 font-medium">Score: {score}%</span>
              <span>100%</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Evaluation Notes</Label>
            <Textarea
              placeholder="Add your evaluation notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="rounded-xl resize-none"
            />
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-semibold">Evaluation Criteria:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>Price competitiveness</li>
                  <li>Delivery terms</li>
                  <li>Warranty and support</li>
                  <li>Supplier track record</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl px-6">Cancel</Button>
          <Button onClick={() => onConfirm({ score, notes })} disabled={isSubmitting} className="rounded-xl bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20 px-6">
            {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Evaluating...</> : <><Award className="h-4 w-4 mr-2" />Submit Evaluation</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface SelectSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierQuotation: SupplierQuotation | null;
  onConfirm: (data: { notes: string }) => void;
  isSubmitting: boolean;
  supplierName: string;
}

const SelectSupplierDialog = ({
  open,
  onOpenChange,
  supplierQuotation,
  onConfirm,
  isSubmitting,
  supplierName,
}: SelectSupplierDialogProps) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) setNotes('');
  }, [open]);

  if (!supplierQuotation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-lg border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <Crown className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            Select Supplier
          </DialogTitle>
          <DialogDescription className="text-base">
            Confirm selection of <span className="font-semibold text-foreground">{supplierName}</span> as the winning bidder
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Supplier</p>
                <p className="font-semibold">{supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(getQuotationAmount(supplierQuotation))}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quotation Number</p>
                <p className="font-semibold">{supplierQuotation.quotation_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Items</p>
                <p className="font-semibold">{supplierQuotation.items?.length || 0} items</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Selection Notes (Optional)</Label>
            <Textarea
              placeholder="Add notes about why this supplier was selected..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="rounded-xl resize-none"
            />
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700 dark:text-amber-300">
                <p className="font-semibold">Please confirm:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>This supplier has the best evaluated bid</li>
                  <li>All compliance requirements are met</li>
                  <li>Budget is available for this selection</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl px-6">Cancel</Button>
          <Button onClick={() => onConfirm({ notes })} disabled={isSubmitting} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 px-6">
            {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Selecting...</> : <><Crown className="h-4 w-4 mr-2" />Select Supplier</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// AUXILIARY ITEMS ALERT COMPONENT
// ============================================

const AuxiliaryItemsAlert = ({ auxiliaryCount, supplierName, totalAuxiliaryAmount }: {
  auxiliaryCount: number;
  supplierName: string;
  totalAuxiliaryAmount: number;
}) => {
  if (auxiliaryCount === 0) return null;

  return (
    <Alert className="border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl mb-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex-shrink-0">
          <AlertOctagon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <AlertTitle className="text-blue-800 dark:text-blue-300 font-semibold">
            {supplierName} has added {auxiliaryCount} auxiliary item{auxiliaryCount > 1 ? 's' : ''}
          </AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm">
            <p>
              These items ({formatCurrency(totalAuxiliaryAmount)}) are not part of the original requisition.
              They are additional offerings from the supplier and should be evaluated separately.
            </p>
            <p className="mt-1 text-xs text-blue-600/80 dark:text-blue-400/80">
              <strong>Note:</strong> The total bid amount shown includes auxiliary items.
              The comparison against budget only considers requisition items for fair evaluation.
            </p>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

// ============================================
// MAIN PAGE
// ============================================

export default function BidComparisonPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const { user } = useAuthContext();

  // State
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showEvaluateDialog, setShowEvaluateDialog] = useState(false);
  const [showSelectDialog, setShowSelectDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierQuotation | null>(null);

  // Hooks
  const { data: quotation, isLoading: isLoadingQtn, refetch } = useQuotation(id, { enabled: !!id });
  const { data: supplierQuotations, isLoading: isLoadingQuotes, refetch: refetchQuotes } = useSupplierQuotationsByQtn(id, { enabled: !!id });
  const suppliersHook = useSuppliers();
  const { data: allSuppliers, isLoading: isLoadingSuppliers } = suppliersHook.useAllSuppliers();

  // Mutations
  const verifyMutation = useVerifySupplierQuotation();
  const evaluateMutation = useEvaluateSupplierQuotation();
  const selectSupplierMutation = useSelectSupplier();

  // User roles for permissions
  const userRoles = useMemo(() => {
    const roles: string[] = [];
    if (user?.role) roles.push(user.role.toUpperCase());
    if (user?.roles) {
      user.roles.forEach((r: any) => {
        const roleName = typeof r === 'string' ? r.toUpperCase() : r.name?.toUpperCase();
        if (roleName) roles.push(roleName);
      });
    }
    return roles;
  }, [user]);

  const canVerify = useMemo(() => userRoles.some(role => VERIFICATION_ALLOWED_ROLES.includes(role)), [userRoles]);
  const canEvaluate = useMemo(() => userRoles.some(role => VERIFICATION_ALLOWED_ROLES.includes(role)), [userRoles]);

  // Supplier map
  const supplierMap = useMemo(() => {
    const map = new Map<number, Supplier>();
    if (allSuppliers) allSuppliers.forEach(s => map.set(s.id, s));
    return map;
  }, [allSuppliers]);

  const getSupplierName = (sq: any): string => {
    const supplier = supplierMap.get(sq.supplier_id);
    return supplier?.company_name || supplier?.contact_person_name || `Supplier ${sq.supplier_id}`;
  };

  const getSupplierDetails = (sq: any): Supplier | undefined => {
    return supplierMap.get(sq.supplier_id);
  };

  // Calculate estimated total
  const estimatedTotal = useMemo(() => {
    if (!quotation?.requisition?.items) return 0;
    return quotation.requisition.items.reduce((sum, item) => {
      const cost = typeof item.total_cost === 'string' ? parseFloat(item.total_cost) : Number(item.total_cost) || 0;
      return sum + cost;
    }, 0);
  }, [quotation]);

  const requisitionItems = useMemo(() => {
    return quotation?.requisition?.items || [];
  }, [quotation]);

  // Process quotations with all details
  const processedQuotations = useMemo(() => {
    if (!supplierQuotations) return [];
    return supplierQuotations.map((sq: any) => {
      const amount = getQuotationAmount(sq);
      const supplier = getSupplierDetails(sq);
      const name = getSupplierName(sq);

      // Get evaluation data
      const evaluation = sq.evaluation || null;
      const evaluationScore = evaluation?.score || null;
      const evaluatedBy = evaluation?.evaluated_by || null;
      const evaluatedAt = evaluation?.evaluated_at || null;

      // Separate items into requisition items and auxiliary items
      const items = sq.items || [];
      const requisitionItemsInQuote = items.filter((item: any) =>
        item.requisition_item_id && !item.is_custom && !item.is_alternative
      );
      const auxiliaryItems = items.filter((item: any) =>
        !item.requisition_item_id || item.is_custom || item.is_alternative
      );

      // Calculate total for requisition items only (for fair comparison)
      const requisitionTotal = requisitionItemsInQuote.reduce((sum: number, item: any) => {
        return sum + (parseFloat(item.total_price) || 0);
      }, 0);

      // Calculate total for auxiliary items
      const auxiliaryTotal = auxiliaryItems.reduce((sum: number, item: any) => {
        return sum + (parseFloat(item.total_price) || 0);
      }, 0);

      return {
        ...sq,
        amount,
        supplierName: name,
        supplier,
        evaluationScore,
        evaluatedBy,
        evaluatedAt,
        requisitionItems: requisitionItemsInQuote,
        auxiliaryItems: auxiliaryItems,
        requisitionTotal: requisitionTotal,
        auxiliaryTotal: auxiliaryTotal,
        isSelected: sq.status === 'accepted',
        isRejected: sq.status === 'rejected',
        canVerify: canVerify && sq.verification_status === 'pending',
        canEvaluate: canEvaluate && sq.verification_status === 'verified' && sq.status === 'submitted',
      };
    });
  }, [supplierQuotations, canVerify, canEvaluate, supplierMap]);

  // Find lowest bid based on requisition items only (not including auxiliary)
  const lowestBidAmount = useMemo(() => {
    if (processedQuotations.length === 0) return 0;
    const validBids = processedQuotations
      .filter(sq => sq.requisitionTotal > 0)
      .map(sq => sq.requisitionTotal);
    if (validBids.length === 0) return 0;
    return Math.min(...validBids);
  }, [processedQuotations]);

  // Find highest bid
  const highestBidAmount = useMemo(() => {
    if (processedQuotations.length === 0) return 0;
    const validBids = processedQuotations
      .filter(sq => sq.requisitionTotal > 0)
      .map(sq => sq.requisitionTotal);
    if (validBids.length === 0) return 0;
    return Math.max(...validBids);
  }, [processedQuotations]);

  // Check if supplier can be selected
  const canSelectSupplier = useMemo(() => {
    if (!quotation) return false;
    if (!['evaluating', 'closed'].includes(quotation.status)) return false;
    if (!supplierQuotations || supplierQuotations.length === 0) return false;
    return supplierQuotations.some(sq => sq.verification_status === 'verified' && sq.status === 'evaluated');
  }, [quotation, supplierQuotations]);

  // Dialog handlers
  const handleVerifySupplier = (supplierId: number) => {
    const supplier = supplierQuotations?.find(sq => sq.id === supplierId);
    if (supplier) { setSelectedSupplier(supplier); setShowVerifyDialog(true); }
  };

  const handleConfirmVerify = (data: { status: 'verified' | 'rejected'; notes: string }) => {
    if (!selectedSupplier) return;
    verifyMutation.mutate({ id: selectedSupplier.id, data }, {
      onSuccess: () => { setShowVerifyDialog(false); setSelectedSupplier(null); refetchQuotes(); },
    });
  };

  const handleEvaluateSupplier = (supplierId: number) => {
    const supplier = supplierQuotations?.find(sq => sq.id === supplierId);
    if (supplier) { setSelectedSupplier(supplier); setShowEvaluateDialog(true); }
  };

  const handleConfirmEvaluate = (data: { score: number; notes: string }) => {
    if (!selectedSupplier) return;
    evaluateMutation.mutate({ id: selectedSupplier.id, data }, {
      onSuccess: () => { setShowEvaluateDialog(false); setSelectedSupplier(null); refetchQuotes(); },
    });
  };

  const handleSelectSupplier = (supplierId: number) => {
    const supplier = supplierQuotations?.find(sq => sq.id === supplierId);
    if (supplier) { setSelectedSupplier(supplier); setShowSelectDialog(true); }
  };

  const handleConfirmSelectSupplier = (data: { notes: string }) => {
    if (!selectedSupplier || !quotation) return;
    selectSupplierMutation.mutate({
      quotation_id: quotation.id,
      supplier_id: selectedSupplier.supplier_id,
    } as any, {
      onSuccess: () => { setShowSelectDialog(false); setSelectedSupplier(null); refetchQuotes(); },
    });
  };

  // Navigation
  const handleBack = () => router.push(`/procurement/request-for-quotations/${id}`);
  const handleRefresh = () => { refetch(); refetchQuotes(); };

  // Navigate to full supplier quotation detail
  const handleViewSupplierQuotation = (quotationId: number) => {
    router.push(`/procurement/supplier-quotations/${quotationId}`);
  };

  // Loading state
  if (isLoadingQtn || isLoadingQuotes || isLoadingSuppliers) {
    return (
      <PageTemplate
        title="Bid Comparison"
        description="Loading supplier bids..."
        icon={<Scale className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
        background="gradient"
        variant="default"
      >
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 dark:text-emerald-400" />
            <p className="text-muted-foreground">Loading bids...</p>
          </div>
        </div>
      </PageTemplate>
    );
  }

  if (!quotation) {
    return (
      <PageTemplate
        title="Bid Comparison"
        description="RFQ not found"
        icon={<Scale className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
        background="gradient"
        variant="default"
      >
        <Alert variant="destructive" className="rounded-2xl bg-white/60 dark:bg-gray-900/80 border border-red-200/50 dark:border-red-800/50 shadow-xl">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-lg text-red-700 dark:text-red-300">RFQ Not Found</AlertTitle>
          <AlertDescription className="text-red-600 dark:text-red-400">
            The Request for Quotation you're looking for doesn't exist or has been removed.
          </AlertDescription>
        </Alert>
        <Button onClick={handleBack} className="mt-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20">
          <ArrowLeft className="h-4 w-4 mr-2" />Back to RFQ
        </Button>
      </PageTemplate>
    );
  }

  if (processedQuotations.length === 0) {
    return (
      <PageTemplate
        title="Bid Comparison"
        description={`Comparing bids for ${quotation.qtn_number}`}
        icon={<Scale className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
        background="gradient"
        variant="default"
        breadcrumbs={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Request for Quotations', href: '/procurement/request-for-quotations' },
          { label: quotation.qtn_number, href: `/procurement/request-for-quotations/${id}` },
          { label: 'Bid Comparison' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5 h-9 rounded-xl border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleBack} className="gap-1.5 h-9 rounded-xl border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
          </div>
        }
      >
        <Card className="border shadow-lg rounded-2xl bg-white dark:bg-gray-900 overflow-hidden">
          <CardContent className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No Supplier Bids</h3>
            <p className="text-gray-500 dark:text-gray-400">No suppliers have submitted bids for this RFQ yet.</p>
            <Button onClick={handleBack} className="mt-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20">
              <ArrowLeft className="h-4 w-4 mr-2" />Back to RFQ
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Bid Comparison"
      description={`${processedQuotations.length} supplier bids for ${quotation.qtn_number}`}
      icon={<Scale className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Procurement', href: '/procurement' },
        { label: 'Request for Quotations', href: '/procurement/request-for-quotations' },
        { label: quotation.qtn_number, href: `/procurement/request-for-quotations/${id}` },
        { label: 'Bid Comparison' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5 h-9 rounded-xl border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleBack} className="gap-1.5 h-9 rounded-xl border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
        </div>
      }
    >
      {/* Info Alert - About Bid Comparison */}
      <Alert className="border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex-shrink-0">
            <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <AlertTitle className="text-emerald-800 dark:text-emerald-300 font-semibold">
              Bid Comparison - Fair Evaluation
            </AlertTitle>
            <AlertDescription className="text-emerald-700 dark:text-emerald-400 text-sm">
              <p>
                The <strong>Lowest</strong> and <strong>Highest</strong> bid indicators are calculated based on
                <strong> requisition items only</strong>. Auxiliary items added by suppliers are shown separately
                and should be evaluated for their value-add.
              </p>
              <p className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-400/80">
                <strong>Tip:</strong> When comparing bids, focus on the requisition items first.
                Auxiliary items can provide additional value but should not be the primary factor in selection.
              </p>
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {/* Supplier Cards Grid - Fixed Height with Scrollable Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {processedQuotations.map((sq: any, index: number) => {
          // Determine if this supplier has the lowest requisition total
          const isLowest = sq.requisitionTotal > 0 && sq.requisitionTotal === lowestBidAmount;
          const isHighest = sq.requisitionTotal > 0 && sq.requisitionTotal === highestBidAmount && sq.requisitionTotal !== lowestBidAmount;
          const isSelected = sq.isSelected;
          const isRejected = sq.isRejected;
          const difference = sq.requisitionTotal - estimatedTotal;
          const savings = difference < 0 ? Math.abs(difference) : 0;
          const overBudget = difference > 0 ? difference : 0;
          const savingsPercentage = difference < 0 && estimatedTotal > 0 ? (savings / estimatedTotal) * 100 : 0;
          const overBudgetPercentage = difference > 0 && estimatedTotal > 0 ? (overBudget / estimatedTotal) * 100 : 0;

          const hasAuxiliaryItems = sq.auxiliaryItems && sq.auxiliaryItems.length > 0;
          const totalAuxiliaryAmount = sq.auxiliaryTotal || 0;

          return (
            <motion.div
              key={sq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="h-full"
            >
              <Card className={cn(
                "border shadow-lg rounded-2xl overflow-hidden bg-white dark:bg-gray-900 hover:shadow-xl transition-shadow h-full flex flex-col",
                isSelected && "border-2 border-emerald-500 dark:border-emerald-500",
                isLowest && !isSelected && "border-2 border-amber-500 dark:border-amber-500",
                isRejected && "opacity-75"
              )}>
                <CardContent className="p-0 flex flex-col h-full">
                  {/* Supplier Header */}
                  <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 border border-gray-200 dark:border-gray-700 flex-shrink-0">
                          <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-base font-bold">
                            {getInitials(sq.supplierName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg font-bold text-gray-900 dark:text-white truncate">
                              {sq.supplierName}
                            </span>
                            {isLowest && (
                              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-0 flex-shrink-0">
                                <Crown className="h-3.5 w-3.5 mr-1" />
                                Lowest
                              </Badge>
                            )}
                            {isHighest && !isLowest && (
                              <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0 flex-shrink-0">
                                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                                Highest
                              </Badge>
                            )}
                            {isSelected && (
                              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-0 flex-shrink-0">
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                Selected
                              </Badge>
                            )}
                            {isRejected && (
                              <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0 flex-shrink-0">
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                Rejected
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{sq.quotation_number}</span>
                            <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                            <Badge className={cn(
                              "text-xs border-0",
                              sq.verification_status === 'verified' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" :
                                sq.verification_status === 'rejected' ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" :
                                  "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            )}>
                              {sq.verification_status_label || 'Pending'}
                            </Badge>
                            {sq.evaluationScore !== null && (
                              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border-0">
                                <Award className="h-3 w-3 mr-1" />
                                Score: {sq.evaluationScore}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Bid</p>
                        <p className={cn(
                          "text-xl font-bold",
                          isLowest ? "text-amber-600 dark:text-amber-400" :
                            isSelected ? "text-emerald-600 dark:text-emerald-400" :
                              isRejected ? "text-gray-500 dark:text-gray-400" :
                                "text-gray-900 dark:text-white"
                        )}>
                          {formatCurrency(sq.amount)}
                        </p>
                        {hasAuxiliaryItems && (
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            + {formatCurrency(totalAuxiliaryAmount)} auxiliary
                          </p>
                        )}
                        {sq.requisitionTotal > 0 && difference !== 0 && (
                          <p className={cn(
                            "text-xs font-medium",
                            difference < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                          )}>
                            {difference < 0 ? (
                              <>↓ {formatCurrency(savings)} ({savingsPercentage.toFixed(1)}%)</>
                            ) : (
                              <>↑ {formatCurrency(overBudget)} ({overBudgetPercentage.toFixed(1)}%)</>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Auxiliary Items Alert */}
                  {hasAuxiliaryItems && (
                    <div className="px-4 pt-2">
                      <AuxiliaryItemsAlert
                        auxiliaryCount={sq.auxiliaryItems.length}
                        supplierName={sq.supplierName}
                        totalAuxiliaryAmount={totalAuxiliaryAmount}
                      />
                    </div>
                  )}

                  {/* Stats Row */}
                  <div className="grid grid-cols-5 gap-0 p-4 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
                    <div className="text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Items</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{sq.items?.length || 0}</p>
                    </div>
                    <div className="text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Requisition</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{sq.requisitionItems?.length || 0}</p>
                    </div>
                    <div className="text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Auxiliary</p>
                      <p className="text-base font-semibold text-blue-600 dark:text-blue-400">{sq.auxiliaryItems?.length || 0}</p>
                    </div>
                    <div className="text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                      <Badge className={cn(
                        "text-xs border-0 mt-1",
                        sq.status === 'submitted' ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" :
                          sq.status === 'evaluated' ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" :
                            sq.status === 'accepted' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" :
                              sq.status === 'rejected' ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" :
                                "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      )}>
                        {sq.status_label || sq.status || 'Submitted'}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Downloads</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{sq.download_count || 0}</p>
                    </div>
                  </div>

                  {/* Items List - Scrollable with fixed height */}
                  <div className="p-4 flex-1 min-h-0">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Quoted Items
                        {hasAuxiliaryItems && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full ml-1">
                            <PlusCircle className="h-3 w-3 inline mr-0.5" />
                            {sq.auxiliaryItems.length} auxiliary
                          </span>
                        )}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {sq.items?.length || 0} items
                      </span>
                    </div>

                    <ScrollArea className="h-[200px] w-full pr-2">
                      <div className="space-y-2">
                        {/* Requisition Items */}
                        {sq.requisitionItems?.map((item: any, idx: number) => {
                          const reqItem = requisitionItems.find((ri: any) => ri.id === item.requisition_item_id);
                          // Check if this is the best price for this item
                          const allPrices = processedQuotations
                            .map((sq2: any) => {
                              const found = sq2.requisitionItems?.find((i: any) => i.requisition_item_id === item.requisition_item_id);
                              return found ? parseFloat(found.total_price) || 0 : null;
                            })
                            .filter((p: any): p is number => p !== null && p > 0);
                          const isBestPrice = allPrices.length > 0 && parseFloat(item.total_price) === Math.min(...allPrices);

                          return (
                            <div
                              key={`req-${idx}`}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-lg border",
                                isBestPrice
                                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                              )}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {reqItem?.item_name || item.item_name || `Item ${idx + 1}`}
                                  </p>
                                  <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                                    <FileCheck className="h-2.5 w-2.5 inline mr-0.5" />
                                    Requisition
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {reqItem?.description || reqItem?.unit_of_measure || 'Service'}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Qty: {parseFloat(item.quantity || reqItem?.quantity || 0).toLocaleString()}
                                </span>
                                <span className={cn(
                                  "text-sm font-semibold",
                                  isBestPrice ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white"
                                )}>
                                  {formatCurrency(item.total_price)}
                                </span>
                                {isBestPrice && (
                                  <Sparkles className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Auxiliary Items (Custom/Alternative) - Shown with neutral styling */}
                        {sq.auxiliaryItems?.map((item: any, idx: number) => (
                          <div
                            key={`aux-${idx}`}
                            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                  {item.item_name || `Auxiliary Item ${idx + 1}`}
                                </p>
                                <span className="text-[10px] bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                                  <PlusCircle className="h-2.5 w-2.5 inline mr-0.5" />
                                  Auxiliary
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {item.description || 'Added by supplier'}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Qty: {parseFloat(item.quantity || 0).toLocaleString()}
                              </span>
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {formatCurrency(item.total_price)}
                              </span>
                            </div>
                          </div>
                        ))}

                        {(!sq.items || sq.items.length === 0) && (
                          <div className="text-center py-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400">No items in this quotation</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Supplier Details */}
                  {sq.supplier && (
                    <div className="px-4 pb-2 flex-shrink-0">
                      <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                        {sq.supplier.company_email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {sq.supplier.company_email}
                          </span>
                        )}
                        {sq.supplier.company_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {sq.supplier.company_phone}
                          </span>
                        )}
                        {sq.supplier.company_registration && (
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {sq.supplier.company_registration}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex-shrink-0">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {sq.canVerify && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerifySupplier(sq.id)}
                            className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-xl"
                          >
                            <FileCheck className="h-3.5 w-3.5 mr-1.5" />
                            Verify
                          </Button>
                        )}
                        {sq.canEvaluate && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEvaluateSupplier(sq.id)}
                            className="border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/30 rounded-xl"
                          >
                            <Award className="h-3.5 w-3.5 mr-1.5" />
                            Evaluate
                          </Button>
                        )}
                        {canSelectSupplier && sq.verification_status === 'verified' && sq.status === 'evaluated' && !sq.isSelected && !sq.isRejected && (
                          <Button
                            size="sm"
                            onClick={() => handleSelectSupplier(sq.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20"
                          >
                            <Crown className="h-3.5 w-3.5 mr-1.5" />
                            Select
                          </Button>
                        )}
                        {sq.isSelected && (
                          <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 px-4 py-1.5 rounded-full text-sm font-medium">
                            <CheckCircle className="h-4 w-4 inline mr-1.5" />
                            Winner Selected
                          </span>
                        )}
                        {sq.isRejected && (
                          <span className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-4 py-1.5 rounded-full text-sm font-medium">
                            <XCircle className="h-4 w-4 inline mr-1.5" />
                            Rejected
                          </span>
                        )}
                      </div>

                      {/* View Full Supplier Quotation Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewSupplierQuotation(sq.id)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 rounded-xl w-full"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        View Full Quotation Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Dialogs */}
      <VerifyDialog
        open={showVerifyDialog}
        onOpenChange={setShowVerifyDialog}
        quotation={selectedSupplier}
        onConfirm={handleConfirmVerify}
        isSubmitting={verifyMutation.isPending}
        supplierName={selectedSupplier ? getSupplierName(selectedSupplier) : ''}
      />

      <EvaluationDialog
        open={showEvaluateDialog}
        onOpenChange={setShowEvaluateDialog}
        quotation={selectedSupplier}
        onConfirm={handleConfirmEvaluate}
        isSubmitting={evaluateMutation.isPending}
        supplierName={selectedSupplier ? getSupplierName(selectedSupplier) : ''}
      />

      <SelectSupplierDialog
        open={showSelectDialog}
        onOpenChange={setShowSelectDialog}
        supplierQuotation={selectedSupplier}
        onConfirm={handleConfirmSelectSupplier}
        isSubmitting={selectSupplierMutation.isPending}
        supplierName={selectedSupplier ? getSupplierName(selectedSupplier) : ''}
      />
    </PageTemplate>
  );
}
