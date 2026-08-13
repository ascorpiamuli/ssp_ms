// frontend/src/app/(dashboard)/requisitions/[id]/edit/page.tsx

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Package,
  Building2,
  FileText,
  Hash,
  DollarSign,
  User,
  Mail,
  Calendar as CalendarIcon,
  Info,
  AlertCircle,
  Loader2,
  CheckCircle,
  Tag,
  Box,
  Truck,
  Layers,
  Briefcase,
  Shield,
  HelpCircle,
  MinusCircle,
  Flame,
  Leaf,
  Zap,
  Clock,
  TrendingUp,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Star,
  Award,
  Globe,
  Home,
  Heart,
  Target,
  ShieldCheck,
  PenTool,
  Coffee,
  Users,
  Briefcase as BriefcaseIcon,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

// Hooks
import { useAuthContext } from '@/contexts/AuthContext';
import { useRequisition } from '@/hooks/useRequisitionQueries';
import { useUpdateRequisition } from '@/hooks/useRequisitionMutations';
import { useDepartments } from '@/hooks/useDepartments';
import { useSuppliers } from '@/hooks/useSuppliers';

// Types
import type { Department } from '@/types/common.types';
import type { UpdateRequisitionData } from '@/types/requisition.types';

// ============================================
// CONSTANTS
// ============================================

const UNITS = [
  { value: 'each', label: 'Each', icon: Package },
  { value: 'box', label: 'Box', icon: Box },
  { value: 'carton', label: 'Carton', icon: Package },
  { value: 'kg', label: 'Kilogram (kg)', icon: Package },
  { value: 'g', label: 'Gram (g)', icon: Package },
  { value: 'l', label: 'Litre (L)', icon: Package },
  { value: 'ml', label: 'Millilitre (ml)', icon: Package },
  { value: 'm', label: 'Metre (m)', icon: Package },
  { value: 'cm', label: 'Centimetre (cm)', icon: Package },
  { value: 'piece', label: 'Piece', icon: Package },
  { value: 'set', label: 'Set', icon: Package },
  { value: 'pack', label: 'Pack', icon: Package },
  { value: 'roll', label: 'Roll', icon: Package },
  { value: 'ream', label: 'Ream', icon: Package },
  { value: 'dozen', label: 'Dozen', icon: Package },
  { value: 'pair', label: 'Pair', icon: Package },
  { value: 'bundle', label: 'Bundle', icon: Package },
  { value: 'case', label: 'Case', icon: Package },
  { value: 'bottle', label: 'Bottle', icon: Package },
  { value: 'tin', label: 'Tin', icon: Package },
  { value: 'bag', label: 'Bag', icon: Package },
  { value: 'sack', label: 'Sack', icon: Package },
  { value: 'drum', label: 'Drum', icon: Package },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', icon: Leaf, color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' },
  { value: 'medium', label: 'Medium', icon: MinusCircle, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  { value: 'high', label: 'High', icon: Flame, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { value: 'emergency', label: 'Emergency', icon: Zap, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
];

const URGENCY_OPTIONS = [
  { value: 'routine', label: 'Routine', icon: Clock, color: 'text-gray-400' },
  { value: 'urgent', label: 'Urgent', icon: Zap, color: 'text-amber-500' },
  { value: 'critical', label: 'Critical', icon: AlertCircle, color: 'text-red-500' },
];

const TYPE_OPTIONS = [
  { value: 'normal', label: 'Normal', icon: FileText, color: 'text-blue-500' },
  { value: 'emergency', label: 'Emergency', icon: AlertCircle, color: 'text-red-500' },
];

const RISK_LEVELS = [
  { value: 'low', label: 'Low', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  { value: 'medium', label: 'Medium', icon: Shield, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { value: 'high', label: 'High', icon: Shield, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
  { value: 'critical', label: 'Critical', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-200 dark:bg-red-900/50' },
];

const BUDGET_SOURCES = [
  { value: 'recurrent', label: 'Recurrent', icon: RefreshCw, color: 'text-blue-500' },
  { value: 'development', label: 'Development', icon: TrendingUp, color: 'text-emerald-500' },
  { value: 'donor', label: 'Donor Funded', icon: Globe, color: 'text-purple-500' },
  { value: 'internal', label: 'Internal', icon: Home, color: 'text-amber-500' },
];

const FUNDING_SOURCES = [
  { value: 'government', label: 'Government', icon: Building2, color: 'text-blue-500' },
  { value: 'donor', label: 'Donor', icon: Heart, color: 'text-red-500' },
  { value: 'internal', label: 'Internal', icon: Home, color: 'text-emerald-500' },
  { value: 'private', label: 'Private Sector', icon: BriefcaseIcon, color: 'text-purple-500' },
];

const PROCUREMENT_METHODS = [
  { value: 'direct_purchase', label: 'Direct Purchase', icon: ShoppingCart, color: 'text-blue-500' },
  { value: 'request_for_quotation', label: 'Request for Quotation', icon: FileText, color: 'text-amber-500' },
  { value: 'tender', label: 'Tender', icon: Target, color: 'text-emerald-500' },
  { value: 'framework_agreement', label: 'Framework Agreement', icon: Award, color: 'text-purple-500' },
  { value: 'emergency_procurement', label: 'Emergency Procurement', icon: AlertCircle, color: 'text-red-500' },
];

// ============================================
// ICON SELECT COMPONENT
// ============================================

interface IconSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: { value: string; label: string; icon: any; color?: string; bg?: string }[];
  disabled?: boolean;
  className?: string;
}

const IconSelect = ({ value, onValueChange, placeholder, options, disabled, className }: IconSelectProps) => {
  const selectedOption = options.find(opt => opt.value === value);
  const SelectedIcon = selectedOption?.icon;

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={cn("h-11 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-xl", className)}>
        <div className="flex items-center gap-2 truncate">
          {SelectedIcon && (
            <SelectedIcon className={cn("h-4 w-4 flex-shrink-0", selectedOption?.color)} />
          )}
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <SelectItem key={option.value} value={option.value} className="py-2.5">
              <div className="flex items-center gap-2.5">
                <Icon className={cn("h-4 w-4 flex-shrink-0", option.color)} />
                <span>{option.label}</span>
                {option.bg && (
                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", option.bg)}>
                    {option.value}
                  </Badge>
                )}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

// ============================================
// ITEM ROW COMPONENT
// ============================================

interface ItemRowProps {
  index: number;
  item: any;
  onChange: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  suppliers: any[];
}

const ItemRow = ({ index, item, onChange, onRemove, canRemove, suppliers }: ItemRowProps) => {
  const total = (item.quantity || 0) * (item.estimated_unit_cost || 0);

  return (
    <div className="border rounded-xl p-5 bg-white dark:bg-gray-900 hover:shadow-md transition-all duration-200 relative group">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onRemove(index)}
        disabled={!canRemove}
        className="absolute top-3 right-3 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <div className="grid grid-cols-12 gap-4 items-end">
        <div className="col-span-12 md:col-span-3 space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            Item Name <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter item name"
              value={item.item_name || ''}
              onChange={(e) => onChange(index, 'item_name', e.target.value)}
              className="pl-9 h-11 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-xl"
            />
          </div>
        </div>

        <div className="col-span-12 md:col-span-3 space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Description</Label>
          <Input
            placeholder="Item description"
            value={item.description || ''}
            onChange={(e) => onChange(index, 'description', e.target.value)}
            className="h-11 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-xl"
          />
        </div>

        <div className="col-span-3 md:col-span-1 space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            Qty <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0"
            value={item.quantity || ''}
            onChange={(e) => onChange(index, 'quantity', parseFloat(e.target.value) || 0)}
            className="h-11 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-xl text-center"
          />
        </div>

        <div className="col-span-3 md:col-span-1 space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            Unit <span className="text-red-500">*</span>
          </Label>
          <Select
            value={item.unit_of_measure || undefined}
            onValueChange={(value) => onChange(index, 'unit_of_measure', value)}
          >
            <SelectTrigger className="h-11 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-xl">
              <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
              {UNITS.map((unit) => {
                const Icon = unit.icon;
                return (
                  <SelectItem key={unit.value} value={unit.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {unit.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-3 md:col-span-1 space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            Unit Cost <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">KES</span>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={item.estimated_unit_cost || ''}
              onChange={(e) => onChange(index, 'estimated_unit_cost', parseFloat(e.target.value) || 0)}
              className="pl-12 h-11 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-xl"
            />
          </div>
        </div>

        <div className="col-span-3 md:col-span-1 space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Tax %</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="0"
            value={item.tax_rate || 0}
            onChange={(e) => onChange(index, 'tax_rate', parseFloat(e.target.value) || 0)}
            className="h-11 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-xl"
          />
        </div>

        <div className="col-span-3 md:col-span-1 space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Discount %</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="0"
            value={item.discount_percentage || 0}
            onChange={(e) => onChange(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
            className="h-11 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-xl"
          />
        </div>

        <div className="col-span-3 md:col-span-1 space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Total</Label>
          <div className="h-11 flex items-center text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl px-3">
            KES {total.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Expandable details */}
      <details className="mt-4">
        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-1">
          <ChevronDown className="h-3 w-3" />
          More options
        </summary>
        <div className="mt-4 grid grid-cols-12 gap-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
          <div className="col-span-12 md:col-span-3 space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Specifications</Label>
            <Input
              placeholder="Specifications"
              value={item.specifications || ''}
              onChange={(e) => onChange(index, 'specifications', e.target.value)}
              className="h-10 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-xl"
            />
          </div>
          <div className="col-span-4 md:col-span-2 space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Catalog #</Label>
            <Input
              placeholder="Catalog"
              value={item.catalog_number || ''}
              onChange={(e) => onChange(index, 'catalog_number', e.target.value)}
              className="h-10 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-xl"
            />
          </div>
          <div className="col-span-4 md:col-span-2 space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Manufacturer</Label>
            <Input
              placeholder="Manufacturer"
              value={item.manufacturer || ''}
              onChange={(e) => onChange(index, 'manufacturer', e.target.value)}
              className="h-10 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-xl"
            />
          </div>
          <div className="col-span-4 md:col-span-2 space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Model</Label>
            <Input
              placeholder="Model"
              value={item.model_number || ''}
              onChange={(e) => onChange(index, 'model_number', e.target.value)}
              className="h-10 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-xl"
            />
          </div>
          <div className="col-span-12 md:col-span-2 space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Supplier</Label>
            <Select
              value={item.supplier_id?.toString() || undefined}
              onValueChange={(value) => onChange(index, 'supplier_id', value && value !== 'none' ? parseInt(value) : null)}
            >
              <SelectTrigger className="h-10 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-xl">
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                <SelectItem value="none">None</SelectItem>
                {suppliers.map((s: any) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.company_name || s.name || 'Unknown'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-12 md:col-span-2 space-y-1.5 flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id={`item-${index}-inventory`}
              checked={item.is_inventory_item || false}
              onChange={(e) => onChange(index, 'is_inventory_item', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor={`item-${index}-inventory`} className="text-xs font-medium cursor-pointer">
              Inventory
            </Label>
            {item.is_inventory_item && (
              <Input
                placeholder="Inv code"
                value={item.inventory_code || ''}
                onChange={(e) => onChange(index, 'inventory_code', e.target.value)}
                className="h-10 text-sm dark:bg-gray-900 dark:border-gray-700 rounded-xl flex-1"
              />
            )}
          </div>
        </div>
      </details>
    </div>
  );
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function EditRequisitionPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const { user } = useAuthContext();

  // Hooks
  const { data: requisition, isLoading, error, refetch } = useRequisition(id);
  const { mutate: updateRequisition, isPending: isUpdating } = useUpdateRequisition();
  const { useAllDepartments } = useDepartments();
  const { useAllSuppliers } = useSuppliers();

  const { data: departmentsData, isLoading: departmentsLoading } = useAllDepartments();
  const { data: suppliersData, isLoading: suppliersLoading } = useAllSuppliers();

  // Memoize departments and suppliers - FIXED type issues
  const departments = useMemo((): Department[] => {
    if (!departmentsData) return [];
    if (Array.isArray(departmentsData)) return departmentsData;
    // Handle different response shapes safely
    if (departmentsData && typeof departmentsData === 'object') {
      // @ts-ignore - safely access data property
      if ('data' in departmentsData && Array.isArray(departmentsData.data)) return departmentsData.data;
      // @ts-ignore - safely access items property
      if ('items' in departmentsData && Array.isArray(departmentsData.items)) return departmentsData.items;
    }
    return [];
  }, [departmentsData]);

  const suppliers = useMemo((): any[] => {
    if (!suppliersData) return [];
    if (Array.isArray(suppliersData)) return suppliersData;
    // Handle different response shapes safely
    if (suppliersData && typeof suppliersData === 'object') {
      // @ts-ignore - safely access data property
      if ('data' in suppliersData && Array.isArray(suppliersData.data)) return suppliersData.data;
      // @ts-ignore - safely access items property
      if ('items' in suppliersData && Array.isArray(suppliersData.items)) return suppliersData.items;
    }
    return [];
  }, [suppliersData]);

  // State
  const [formData, setFormData] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [success, setSuccess] = useState(false);

  // Initialize form data from requisition
  useEffect(() => {
    if (requisition) {
      // Check if requisition is editable
      if (!requisition.is_editable) {
        router.push(`/requisitions/${id}`);
        return;
      }

      setFormData({
        title: requisition.title || '',
        description: requisition.description || '',
        department_id: requisition.department?.id?.toString() || '',
        supplier_id: requisition.supplier?.id?.toString() || '',
        priority: requisition.priority || 'medium',
        type: requisition.type || 'normal',
        urgency: requisition.urgency || 'routine',
        justification: requisition.justification || '',
        required_by_date: requisition.required_by_date || '',
        required_delivery_date: requisition.required_delivery_date || '',
        budget_code: requisition.budget_code || '',
        budget_source: requisition.budget_source || '',
        funding_source: requisition.funding_source || '',
        project_code: requisition.project_code || '',
        procurement_method: requisition.procurement_method || '',
        is_framework_agreement: requisition.is_framework_agreement || false,
        framework_agreement_id: requisition.framework_agreement_id || '',
        risk_level: requisition.risk_level || 'low',
        risk_mitigation: requisition.risk_mitigation || '',
        is_compliant: requisition.is_compliant ?? true,
        compliance_notes: requisition.compliance_notes || '',
        currency: requisition.currency || 'KES',
        exchange_rate: requisition.exchange_rate || 1,
        items: requisition.items?.map((item: any) => ({
          id: item.id,
          item_name: item.item_name || '',
          description: item.description || '',
          unit_of_measure: item.unit_of_measure || '',
          quantity: item.quantity || 1,
          estimated_unit_cost: item.estimated_unit_cost || 0,
          specifications: item.specifications || '',
          catalog_number: item.catalog_number || '',
          manufacturer: item.manufacturer || '',
          model_number: item.model_number || '',
          supplier_id: item.supplier_id || null,
          is_inventory_item: item.is_inventory_item || false,
          inventory_code: item.inventory_code || '',
          tax_rate: item.tax_rate || 0,
          discount_percentage: item.discount_percentage || 0,
        })) || [
            {
              item_name: '',
              description: '',
              unit_of_measure: '',
              quantity: 1,
              estimated_unit_cost: 0,
              specifications: '',
              catalog_number: '',
              manufacturer: '',
              model_number: '',
              supplier_id: null,
              is_inventory_item: false,
              inventory_code: '',
              tax_rate: 0,
              discount_percentage: 0,
            },
          ],
      });
    }
  }, [requisition, id, router]);

  // Handle form field changes
  const handleChange = useCallback((field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }, [formErrors]);

  // Handle item changes
  const handleItemChange = useCallback((index: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      return { ...prev, items: updatedItems };
    });
  }, []);

  // Add item
  const addItem = useCallback(() => {
    setFormData((prev: any) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item_name: '',
          description: '',
          unit_of_measure: '',
          quantity: 1,
          estimated_unit_cost: 0,
          specifications: '',
          catalog_number: '',
          manufacturer: '',
          model_number: '',
          supplier_id: null,
          is_inventory_item: false,
          inventory_code: '',
          tax_rate: 0,
          discount_percentage: 0,
        },
      ],
    }));
  }, []);

  // Remove item
  const removeItem = useCallback((index: number) => {
    setFormData((prev: any) => {
      if (prev.items.length <= 1) return prev;
      const updatedItems = prev.items.filter((_: any, i: number) => i !== index);
      return { ...prev, items: updatedItems };
    });
  }, []);

  // Calculate total amount
  const totalAmount = useMemo(() => {
    if (!formData?.items) return 0;
    return formData.items.reduce((sum: number, item: any) => {
      return sum + ((item.quantity || 0) * (item.estimated_unit_cost || 0));
    }, 0);
  }, [formData]);

  // Validate form
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formData?.title?.trim()) {
      errors.title = 'Title is required';
    }
    if (!formData?.department_id) {
      errors.department_id = 'Department is required';
    }

    const itemErrors: string[] = [];
    formData?.items?.forEach((item: any, index: number) => {
      if (!item.item_name?.trim()) {
        itemErrors.push(`Item ${index + 1}: Name is required`);
      }
      if (!item.unit_of_measure?.trim()) {
        itemErrors.push(`Item ${index + 1}: Unit of measure is required`);
      }
      if (item.quantity <= 0) {
        itemErrors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      }
      if (item.estimated_unit_cost < 0) {
        itemErrors.push(`Item ${index + 1}: Unit cost must be 0 or greater`);
      }
    });

    if (itemErrors.length > 0) {
      errors.items = itemErrors.join('; ');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle submit
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccess(false);

    const submitData: UpdateRequisitionData = {
      title: formData.title,
      description: formData.description || undefined,
      department_id: parseInt(formData.department_id),
      supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : undefined,
      priority: formData.priority,
      type: formData.type,
      urgency: formData.urgency,
      justification: formData.justification || undefined,
      required_by_date: formData.required_by_date || undefined,
      required_delivery_date: formData.required_delivery_date || undefined,
      budget_code: formData.budget_code || undefined,
      budget_source: formData.budget_source || undefined,
      funding_source: formData.funding_source || undefined,
      project_code: formData.project_code || undefined,
      procurement_method: formData.procurement_method || undefined,
      is_framework_agreement: formData.is_framework_agreement,
      framework_agreement_id: formData.framework_agreement_id || undefined,
      risk_level: formData.risk_level,
      risk_mitigation: formData.risk_mitigation || undefined,
      is_compliant: formData.is_compliant,
      compliance_notes: formData.compliance_notes || undefined,
      currency: formData.currency,
      exchange_rate: formData.exchange_rate,
      items: formData.items
        .filter((item: any) => item.item_name?.trim() !== '')
        .map((item: any) => ({
          id: item.id,
          item_name: item.item_name,
          description: item.description || undefined,
          unit_of_measure: item.unit_of_measure,
          quantity: item.quantity,
          estimated_unit_cost: item.estimated_unit_cost,
          specifications: item.specifications || undefined,
          catalog_number: item.catalog_number || undefined,
          manufacturer: item.manufacturer || undefined,
          model_number: item.model_number || undefined,
          supplier_id: item.supplier_id || undefined,
          is_inventory_item: item.is_inventory_item,
          inventory_code: item.inventory_code || undefined,
          tax_rate: item.tax_rate,
          discount_percentage: item.discount_percentage,
        })),
    };

    updateRequisition(
      { id, data: submitData },
      {
        onSuccess: () => {
          setSuccess(true);
          setIsSubmitting(false);
          setTimeout(() => {
            router.push(`/requisitions/${id}`);
          }, 1500);
        },
        onError: () => {
          setIsSubmitting(false);
        },
      }
    );
  }, [formData, validateForm, updateRequisition, id, router]);

  // Loading state
  if (isLoading || departmentsLoading || suppliersLoading) {
    return (
      <PageTemplate
        title="Edit Requisition"
        description="Loading requisition data..."
        icon={<FileText className="h-5 w-5 text-blue-600" />}
        background="gradient"
      >
        <div className="space-y-6">
          <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-64 rounded-xl" />
                <Skeleton className="h-4 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-11 w-full rounded-xl" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTemplate>
    );
  }

  // Error or not found
  if (error || !requisition) {
    return (
      <PageTemplate
        title="Edit Requisition"
        description="Error loading requisition"
        icon={<FileText className="h-5 w-5 text-blue-600" />}
        background="gradient"
      >
        <Alert variant="destructive" className="max-w-2xl mx-auto rounded-xl border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Requisition</AlertTitle>
          <AlertDescription>
            {error?.message || 'Requisition not found or you do not have permission to edit it.'}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center gap-4 mt-6">
          <Button onClick={() => refetch()} className="rounded-xl">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
          <Button variant="outline" onClick={() => router.push('/requisitions/manage')} className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </PageTemplate>
    );
  }

  // Check if editable
  if (!requisition.is_editable) {
    return (
      <PageTemplate
        title="Edit Requisition"
        description="This requisition cannot be edited"
        icon={<FileText className="h-5 w-5 text-blue-600" />}
        background="gradient"
      >
        <Alert className="max-w-2xl mx-auto rounded-xl border-amber-500/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-300">Not Editable</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            This requisition has been submitted for approval and cannot be edited.
            Only draft or returned requisitions can be edited.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={() => router.push(`/requisitions/${id}`)} className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            View Requisition Details
          </Button>
        </div>
      </PageTemplate>
    );
  }

  if (!formData) {
    return (
      <PageTemplate
        title="Edit Requisition"
        description="Loading..."
        icon={<FileText className="h-5 w-5 text-blue-600" />}
        background="gradient"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Edit Requisition"
      description={`Editing: ${requisition.reference_number} - ${requisition.title}`}
      icon={<FileText className="h-5 w-5 text-blue-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Requisitions', href: '/requisitions' },
        { label: requisition.reference_number || 'Details', href: `/requisitions/${id}` },
        { label: 'Edit' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1">
            <FileText className="h-3 w-3" />
            {requisition.reference_number}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/requisitions/${id}`)}
            className="gap-2 h-9 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
            disabled={isSubmitting || isUpdating}
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSubmit}
            className="gap-2 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20"
            disabled={isSubmitting || isUpdating || success}
          >
            {isSubmitting || isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : success ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      }
    >
      {success && (
        <Alert className="mb-6 rounded-xl border-green-500/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700 dark:text-green-300 font-medium">
            ✅ Requisition updated successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950">
          <CardHeader className="pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <CardTitle className="flex items-center gap-2.5 text-xl">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Requisition Details
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Edit the requisition details below. All fields marked with <span className="text-red-500">*</span> are required.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Requester Info - Read Only */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-gradient-to-r from-gray-50/80 to-blue-50/30 dark:from-gray-800/50 dark:to-blue-900/20 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 mb-6">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" />
                  Requisition Number
                </Label>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-mono font-medium text-gray-700 dark:text-gray-300">{requisition.reference_number}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Requester
                </Label>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{requisition.user?.full_name || 'Unknown'}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Status
                </Label>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <Badge variant={requisition.status === 'draft' ? 'secondary' : 'warning'} className="text-xs">
                    {requisition.status_label || requisition.status}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator className="mb-6 dark:border-gray-700/50" />

            {/* Basic Information */}
            <div className="space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 space-y-1.5">
                  <Label htmlFor="title" className="text-sm font-medium flex items-center gap-1.5">
                    Requisition Title <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="title"
                      placeholder="Enter a clear and descriptive requisition title"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      className={cn(
                        "pl-10 h-12 text-base rounded-xl dark:bg-gray-900 dark:border-gray-700",
                        formErrors.title && "border-red-500 focus-visible:ring-red-500"
                      )}
                      disabled={isSubmitting || isUpdating || success}
                    />
                  </div>
                  {formErrors.title && <p className="text-sm text-red-500 mt-1">{formErrors.title}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Select
                      value={formData.department_id || undefined}
                      onValueChange={(value) => handleChange('department_id', value)}
                      disabled={isSubmitting || isUpdating || success}
                    >
                      <SelectTrigger className={cn(
                        "pl-10 h-12 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700",
                        formErrors.department_id && "border-red-500"
                      )}>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                        {departments.map((dept: Department) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              {dept.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {formErrors.department_id && <p className="text-sm text-red-500 mt-1">{formErrors.department_id}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    Preferred Supplier
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Select
                      value={formData.supplier_id || undefined}
                      onValueChange={(value) => handleChange('supplier_id', value)}
                      disabled={isSubmitting || isUpdating || success}
                    >
                      <SelectTrigger className="pl-10 h-12 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700">
                        <SelectValue placeholder="Select supplier (optional)" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                        {suppliers.map((supplier: any) => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              {supplier.company_name || supplier.name || 'Unknown Supplier'}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    Priority
                  </Label>
                  <IconSelect
                    value={formData.priority}
                    onValueChange={(value) => handleChange('priority', value)}
                    placeholder="Select priority"
                    options={PRIORITY_OPTIONS}
                    disabled={isSubmitting || isUpdating || success}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    Type
                  </Label>
                  <IconSelect
                    value={formData.type}
                    onValueChange={(value) => handleChange('type', value)}
                    placeholder="Select type"
                    options={TYPE_OPTIONS}
                    disabled={isSubmitting || isUpdating || success}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Urgency
                  </Label>
                  <IconSelect
                    value={formData.urgency}
                    onValueChange={(value) => handleChange('urgency', value)}
                    placeholder="Select urgency"
                    options={URGENCY_OPTIONS}
                    disabled={isSubmitting || isUpdating || success}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    Required By Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-12 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700",
                          !formData.required_by_date && "text-muted-foreground"
                        )}
                        disabled={isSubmitting || isUpdating || success}
                      >
                        <CalendarIcon className="mr-2.5 h-4 w-4" />
                        {formData.required_by_date ? format(new Date(formData.required_by_date), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl">
                      <CalendarComponent
                        mode="single"
                        selected={formData.required_by_date ? new Date(formData.required_by_date) : undefined}
                        onSelect={(date) => handleChange('required_by_date', date ? format(date, 'yyyy-MM-dd') : '')}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    Required Delivery Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-12 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700",
                          !formData.required_delivery_date && "text-muted-foreground"
                        )}
                        disabled={isSubmitting || isUpdating || success}
                      >
                        <CalendarIcon className="mr-2.5 h-4 w-4" />
                        {formData.required_delivery_date ? format(new Date(formData.required_delivery_date), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl">
                      <CalendarComponent
                        mode="single"
                        selected={formData.required_delivery_date ? new Date(formData.required_delivery_date) : undefined}
                        onSelect={(date) => handleChange('required_delivery_date', date ? format(date, 'yyyy-MM-dd') : '')}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-medium flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter detailed description of the requisition..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  disabled={isSubmitting || isUpdating || success}
                  className="min-h-[80px] resize-none text-base rounded-xl dark:bg-gray-900 dark:border-gray-700"
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="justification" className="text-sm font-medium flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Justification
                </Label>
                <Textarea
                  id="justification"
                  placeholder="Explain why this requisition is needed..."
                  value={formData.justification}
                  onChange={(e) => handleChange('justification', e.target.value)}
                  disabled={isSubmitting || isUpdating || success}
                  className="min-h-[60px] resize-none text-base rounded-xl dark:bg-gray-900 dark:border-gray-700"
                  rows={2}
                />
              </div>
            </div>

            <Separator className="my-6 dark:border-gray-700/50" />

            {/* Items Section */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Requisition Items</h3>
                  <Badge variant="secondary" className="ml-1 rounded-full px-3 py-0.5">
                    {formData.items?.filter((i: any) => i.item_name?.trim()).length || 0}
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  disabled={isSubmitting || isUpdating || success}
                  className="gap-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {formData.items?.map((item: any, index: number) => (
                  <ItemRow
                    key={index}
                    index={index}
                    item={item}
                    onChange={handleItemChange}
                    onRemove={removeItem}
                    canRemove={formData.items.length > 1}
                    suppliers={suppliers}
                  />
                ))}
              </div>

              {formErrors.items && (
                <p className="text-sm text-red-500">{formErrors.items}</p>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Items: <span className="font-medium">{formData.items?.filter((i: any) => i.item_name?.trim()).length || 0}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Grand Total</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    KES {totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-6 dark:border-gray-700/50" />

            {/* Advanced Options */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full h-12 text-base rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
              disabled={isSubmitting || isUpdating || success}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="h-4 w-4" />
                {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </Button>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    Budget Code
                  </Label>
                  <Input
                    placeholder="Enter budget code"
                    value={formData.budget_code}
                    onChange={(e) => handleChange('budget_code', e.target.value)}
                    disabled={isSubmitting || isUpdating || success}
                    className="h-11 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Budget Source
                  </Label>
                  <IconSelect
                    value={formData.budget_source || ''}
                    onValueChange={(value) => handleChange('budget_source', value)}
                    placeholder="Select budget source"
                    options={BUDGET_SOURCES}
                    disabled={isSubmitting || isUpdating || success}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Funding Source
                  </Label>
                  <IconSelect
                    value={formData.funding_source || ''}
                    onValueChange={(value) => handleChange('funding_source', value)}
                    placeholder="Select funding source"
                    options={FUNDING_SOURCES}
                    disabled={isSubmitting || isUpdating || success}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    Project Code
                  </Label>
                  <Input
                    placeholder="Enter project code"
                    value={formData.project_code}
                    onChange={(e) => handleChange('project_code', e.target.value)}
                    disabled={isSubmitting || isUpdating || success}
                    className="h-11 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    Procurement Method
                  </Label>
                  <IconSelect
                    value={formData.procurement_method || ''}
                    onValueChange={(value) => handleChange('procurement_method', value)}
                    placeholder="Select procurement method"
                    options={PROCUREMENT_METHODS}
                    disabled={isSubmitting || isUpdating || success}
                  />
                </div>

                <div className="space-y-1.5 flex items-end gap-3 pt-2">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="framework_agreement"
                      checked={formData.is_framework_agreement}
                      onChange={(e) => handleChange('is_framework_agreement', e.target.checked)}
                      disabled={isSubmitting || isUpdating || success}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="framework_agreement" className="text-sm font-medium cursor-pointer">
                      Framework Agreement
                    </Label>
                  </div>
                  {formData.is_framework_agreement && (
                    <div className="flex-1">
                      <Input
                        placeholder="Framework ID"
                        value={formData.framework_agreement_id}
                        onChange={(e) => handleChange('framework_agreement_id', e.target.value)}
                        disabled={isSubmitting || isUpdating || success}
                        className="h-11 text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    Risk Level
                  </Label>
                  <IconSelect
                    value={formData.risk_level}
                    onValueChange={(value) => handleChange('risk_level', value)}
                    placeholder="Select risk level"
                    options={RISK_LEVELS}
                    disabled={isSubmitting || isUpdating || success}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    Risk Mitigation
                  </Label>
                  <Textarea
                    placeholder="Describe risk mitigation measures..."
                    value={formData.risk_mitigation}
                    onChange={(e) => handleChange('risk_mitigation', e.target.value)}
                    disabled={isSubmitting || isUpdating || success}
                    className="min-h-[60px] resize-none text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700"
                    rows={2}
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    Compliance Notes
                  </Label>
                  <Textarea
                    placeholder="Enter compliance notes..."
                    value={formData.compliance_notes}
                    onChange={(e) => handleChange('compliance_notes', e.target.value)}
                    disabled={isSubmitting || isUpdating || success}
                    className="min-h-[60px] resize-none text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t border-gray-200/50 dark:border-gray-700/50 py-4 px-6 bg-gray-50/50 dark:bg-gray-800/30 rounded-b-2xl">
            <div className="flex justify-between items-center w-full">
              <p className="text-xs text-muted-foreground">
                <span className="text-red-500">*</span> Required fields. Only draft requisitions can be edited.
              </p>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/requisitions/${id}`)}
                  disabled={isSubmitting || isUpdating || success}
                  className="rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20"
                  disabled={isSubmitting || isUpdating || success}
                >
                  {isSubmitting || isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </form>
    </PageTemplate>
  );
}
