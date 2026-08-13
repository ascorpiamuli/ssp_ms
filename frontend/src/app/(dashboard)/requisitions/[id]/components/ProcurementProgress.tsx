// frontend/src/app/(dashboard)/requisitions/[id]/components/ProcurementProgress.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Clock, CheckCircle, FileCheck, Users, ShoppingCart, Truck, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface ProcurementProgressProps {
  hasProcurementStarted: boolean;
  isProcurementComplete: boolean;
  procurementProgress: number;
  currentProcurementStatus: string | null;
  quotesCount: number;
  qtnDetails: any;
  steps?: any;
}

// Helper to format status label
const formatStatusLabel = (status: string | null): string => {
  if (!status) return 'In Progress';

  const statusMap: Record<string, string> = {
    'initiated': 'Initiated',
    'quotation_in_progress': 'Quotation in Progress',
    'awaiting_quotations': 'Awaiting Quotations',
    'evaluating_quotations': 'Evaluating Quotations',
    'supplier_selected': 'Supplier Selected',
    'goods_receipt_pending': 'Goods Receipt Pending',
    'invoicing_pending': 'Invoicing Pending',
    'payment_pending': 'Payment Pending',
    'completed': 'Completed',
  };

  return statusMap[status] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const ProcurementProgress: React.FC<ProcurementProgressProps> = ({
  hasProcurementStarted,
  isProcurementComplete,
  procurementProgress,
  currentProcurementStatus,
  quotesCount,
  qtnDetails,
  steps,
}) => {
  if (!hasProcurementStarted || isProcurementComplete) return null;

  const [animatedProgress, setAnimatedProgress] = useState(0);
  const statusLabel = formatStatusLabel(currentProcurementStatus);
  const progressRounded = Math.round(procurementProgress);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(procurementProgress);
    }, 100);
    return () => clearTimeout(timer);
  }, [procurementProgress]);

  // Get step statuses from steps prop
  const supplierQuotationsStatus = steps?.supplier_quotations?.status || 'waiting';
  const supplierSelectionStatus = steps?.supplier_selection?.status || 'waiting';
  const poGenerationStatus = steps?.po_generation?.status || 'waiting';
  const deliveryStatus = steps?.delivery?.status || 'waiting';
  const paymentStatus = steps?.payment?.status || 'waiting';

  const stages = [
    {
      id: 'qtn',
      label: 'Quotation Request (QTN)',
      icon: FileCheck,
      status: qtnDetails.hasQtn ? 'completed' : 'in_progress',
      description: 'Generate and send QTN to suppliers',
      details: qtnDetails.hasQtn ? `Number: ${qtnDetails.number}` : null,
    },
    {
      id: 'supplier_quotations',
      label: 'Supplier Quotations',
      icon: Users,
      status: supplierQuotationsStatus,
      description: 'Receive and review supplier quotations',
      details: quotesCount > 0 ? `${quotesCount} quote(s) received` : null,
    },
    {
      id: 'supplier_selection',
      label: 'Supplier Selection',
      icon: CheckCircle,
      status: supplierSelectionStatus,
      description: 'Select the best supplier',
      details: steps?.supplier_selection?.selected_supplier_id ? 'Supplier selected' : null,
    },
    {
      id: 'po_generation',
      label: 'LPO/LSO Generation',
      icon: ShoppingCart,
      status: poGenerationStatus,
      description: 'Generate purchase/service order',
      details: steps?.po_generation?.po_number ? `${steps.po_generation.po_type || 'PO'}: ${steps.po_generation.po_number}` : null,
    },
    {
      id: 'delivery',
      label: 'Delivery / Service',
      icon: Truck,
      status: deliveryStatus,
      description: 'Receive goods or acknowledge service',
      details: steps?.delivery?.grn_number ? `GRN: ${steps.delivery.grn_number}` : null,
    },
    {
      id: 'payment',
      label: 'Payment Processing',
      icon: Receipt,
      status: paymentStatus,
      description: 'Process payment and issue cheque',
      details: steps?.payment?.voucher_number ? `Voucher: ${steps.payment.voucher_number}` : null,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500 text-white border-emerald-500';
      case 'in_progress':
        return 'bg-blue-500 text-white border-blue-500';
      case 'waiting':
      default:
        return 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Complete', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
      case 'in_progress':
        return { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
      case 'waiting':
      default:
        return { label: 'Waiting', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl overflow-hidden">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-foreground">Procurement Progress</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs rounded-full">
                {statusLabel}
              </Badge>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {progressRounded}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative mb-4">
            <div className="h-2.5 bg-blue-100/50 dark:bg-blue-900/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30"
                initial={{ width: 0 }}
                animate={{ width: `${animatedProgress}%` }}
                transition={{
                  duration: 1.2,
                  ease: [0.4, 0, 0.2, 1],
                  delay: 0.1
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </motion.div>
            </div>
          </div>

          {/* Stages */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {stages.map((stage) => {
              const statusBadge = getStatusBadge(stage.status);
              const Icon = stage.icon;

              return (
                <div
                  key={stage.id}
                  className={cn(
                    "flex flex-col items-center p-2 rounded-lg border transition-all",
                    stage.status === 'completed' ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800" :
                      stage.status === 'in_progress' ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800" :
                        "bg-gray-50/50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700 opacity-60"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mb-1",
                    getStatusColor(stage.status)
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-[10px] font-medium text-center leading-tight">{stage.label}</p>
                  <Badge className={cn("text-[8px] px-1.5 py-0 mt-0.5 rounded-full", statusBadge.color)}>
                    {statusBadge.label}
                  </Badge>
                  {stage.details && (
                    <p className="text-[8px] text-muted-foreground mt-0.5 text-center truncate max-w-full">
                      {stage.details}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 mt-3 pt-2 border-t border-blue-200/20 dark:border-blue-800/20">
            {qtnDetails.hasQtn && (
              <div className="flex items-center gap-1">
                <FileCheck className="h-3 w-3 text-indigo-500" />
                <span className="text-[10px] font-mono font-medium">{qtnDetails.number}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-blue-500" />
              <span className="text-[10px] font-medium">{quotesCount} quotes</span>
            </div>
            {steps?.supplier_selection?.selected_supplier_id && (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-emerald-500" />
                <span className="text-[10px] font-medium">Supplier Selected</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProcurementProgress;
