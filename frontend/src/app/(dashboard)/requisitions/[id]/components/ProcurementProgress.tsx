// frontend/src/app/(dashboard)/requisitions/[id]/components/ProcurementProgress.tsx

'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  FileCheck,
  Users,
  ShoppingCart,
  Truck,
  Receipt,
  Target,
  Loader2,
  Activity,
  Sparkles,
  Award,
  Zap,
  ArrowRight,
  Circle,
  Check,
  Gem,
  Rocket,
  Crown,
  Shield,
  Star,
  Heart,
  Flame,
  Compass,
  Navigation,
  MapPin,
  Milestone,
  Flag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ProcurementProgressProps {
  hasProcurementStarted: boolean;
  isProcurementComplete: boolean;
  procurementProgress: number;
  currentProcurementStatus: string | null;
  quotesCount: number;
  qtnDetails: any;
  steps?: any;
}

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

const stageConfigs = [
  {
    id: 'qtn',
    label: 'Quotation Request',
    icon: FileCheck,
    color: 'indigo',
    description: 'Generate and send QTN to suppliers',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
  },
  {
    id: 'supplier_quotations',
    label: 'Supplier Quotes',
    icon: Users,
    color: 'blue',
    description: 'Receive and review supplier quotations',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
  },
  {
    id: 'supplier_selection',
    label: 'Supplier Selection',
    icon: Target,
    color: 'amber',
    description: 'Select the best supplier for the job',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
  },
  {
    id: 'po_generation',
    label: 'LPO/LSO Generation',
    icon: ShoppingCart,
    color: 'purple',
    description: 'Generate purchase or service order',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
    textColor: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
  },
  {
    id: 'delivery',
    label: 'Delivery & Receipt',
    icon: Truck,
    color: 'emerald',
    description: 'Receive goods or acknowledge service',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
  },
  {
    id: 'payment',
    label: 'Payment Processing',
    icon: Receipt,
    color: 'rose',
    description: 'Process payment and issue cheque',
    bgColor: 'bg-rose-50 dark:bg-rose-950/30',
    borderColor: 'border-rose-200 dark:border-rose-800',
    textColor: 'text-rose-600 dark:text-rose-400',
    iconBg: 'bg-rose-100 dark:bg-rose-900/40',
  },
];

const statusStyles = {
  completed: {
    dot: 'bg-emerald-500 border-emerald-500 shadow-emerald-500/30',
    line: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    label: 'text-emerald-700 dark:text-emerald-300',
  },
  in_progress: {
    dot: 'bg-blue-500 border-blue-500 shadow-blue-500/30 animate-pulse',
    line: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    label: 'text-blue-700 dark:text-blue-300',
  },
  waiting: {
    dot: 'bg-gray-300 dark:bg-gray-600 border-gray-300 dark:border-gray-600',
    line: 'bg-gray-300 dark:bg-gray-600',
    badge: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    label: 'text-gray-400 dark:text-gray-500',
  },
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
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const progressRounded = Math.round(procurementProgress);
  const statusLabel = formatStatusLabel(currentProcurementStatus);

  const stageStatuses = {
    qtn: qtnDetails.hasQtn ? 'completed' : 'waiting',
    supplier_quotations: steps?.supplier_quotations?.status || 'waiting',
    supplier_selection: steps?.supplier_selection?.status || 'waiting',
    po_generation: steps?.po_generation?.status || 'waiting',
    delivery: steps?.delivery?.status || 'waiting',
    payment: steps?.payment?.status || 'waiting',
  };

  const completedCount = Object.values(stageStatuses).filter(s => s === 'completed').length;
  const totalStages = stageConfigs.length;

  const getStageDetails = (stageId: string) => {
    const map: Record<string, string | null> = {
      qtn: qtnDetails.hasQtn ? `QTN: ${qtnDetails.number}` : null,
      supplier_quotations: quotesCount > 0 ? `${quotesCount} quote(s) received` : null,
      supplier_selection: steps?.supplier_selection?.selected_supplier_id ? 'Supplier selected' : null,
      po_generation: steps?.po_generation?.po_number ? `${steps.po_generation.po_type || 'PO'}: ${steps.po_generation.po_number}` : null,
      delivery: steps?.delivery?.grn_number ? `GRN: ${steps.delivery.grn_number}` : null,
      payment: steps?.payment?.voucher_number ? `Voucher: ${steps.payment.voucher_number}` : null,
    };
    return map[stageId] || null;
  };

  const getStageTimestamp = (stageId: string) => {
    const map: Record<string, string | null> = {
      qtn: qtnDetails.created_at || null,
      supplier_quotations: steps?.supplier_quotations?.updated_at || null,
      supplier_selection: steps?.supplier_selection?.updated_at || null,
      po_generation: steps?.po_generation?.updated_at || null,
      delivery: steps?.delivery?.updated_at || null,
      payment: steps?.payment?.updated_at || null,
    };
    return map[stageId] || null;
  };

  // Ready state
  if (!hasProcurementStarted && !isProcurementComplete) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
                <ShoppingCart className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Ready for Procurement</p>
                <p className="text-sm text-muted-foreground">This requisition is approved and ready to be procured</p>
              </div>
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5 text-sm">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Ready
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Complete state
  if (isProcurementComplete) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl">
                <Award className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Procurement Complete</p>
                <p className="text-sm text-muted-foreground">All procurement activities completed successfully</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-full px-4 py-1.5 text-sm">
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                100% Complete
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl overflow-hidden">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/25">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Procurement Progress</h3>
                <p className="text-sm text-muted-foreground">{statusLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{progressRounded}%</p>
                <p className="text-sm text-muted-foreground">{completedCount}/{totalStages} stages</p>
              </div>
              <Badge className={cn(
                "rounded-full px-3 py-1 text-sm border",
                progressRounded >= 80 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" :
                  progressRounded >= 40 ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800" :
                    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
              )}>
                {progressRounded >= 80 ? 'Almost Done' : progressRounded >= 40 ? 'In Progress' : 'Started'}
              </Badge>
            </div>
          </div>

          {/* Vertical Timeline */}
          <div className="relative pl-8">
            {/* Vertical Line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <motion.div
              className="absolute left-3 top-0 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full"
              initial={{ height: 0 }}
              animate={{ height: `${(completedCount / totalStages) * 100}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />

            {stageConfigs.map((stage, index) => {
              const status = stageStatuses[stage.id as keyof typeof stageStatuses] || 'waiting';
              const isCompleted = status === 'completed';
              const isActive = status === 'in_progress';
              const Icon = stage.icon;
              const details = getStageDetails(stage.id);
              const timestamp = getStageTimestamp(stage.id);
              const isExpanded = expandedStage === stage.id;
              const statusStyle = statusStyles[status as keyof typeof statusStyles] || statusStyles.waiting;

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="relative mb-6 last:mb-0"
                >
                  {/* Timeline Dot - Larger */}
                  <motion.div
                    className={cn(
                      "absolute -left-8 top-2 w-6 h-6 rounded-full border-2 z-10 transition-all duration-300",
                      statusStyle.dot
                    )}
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Check className="h-3.5 w-3.5 text-white" />
                      </motion.div>
                    )}
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                      </div>
                    )}
                  </motion.div>

                  {/* Stage Content - Larger text */}
                  <div
                    className={cn(
                      "rounded-xl border p-5 transition-all duration-300 cursor-pointer",
                      isCompleted
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                        : isActive
                          ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 shadow-lg shadow-blue-500/5"
                          : "bg-gray-50/50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700 opacity-60",
                      isExpanded && "shadow-md"
                    )}
                    onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={cn(
                          "p-2.5 rounded-lg flex-shrink-0",
                          stage.iconBg
                        )}>
                          <Icon className={cn(
                            "h-5 w-5",
                            stage.textColor
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={cn(
                              "text-base font-semibold",
                              isCompleted ? "text-emerald-700 dark:text-emerald-300" :
                                isActive ? "text-blue-700 dark:text-blue-300" :
                                  "text-gray-500 dark:text-gray-400"
                            )}>
                              {stage.label}
                            </span>
                            <Badge className={cn(
                              "text-sm px-3 py-0.5 rounded-full border",
                              statusStyle.badge
                            )}>
                              {isCompleted ? 'Done' : isActive ? 'In Progress' : 'Waiting'}
                            </Badge>
                            {isActive && (
                              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-sm px-2.5 py-0.5 rounded-full animate-pulse">
                                <Activity className="h-3.5 w-3.5 mr-1.5" />
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                          {details && (
                            <div className="mt-2 flex items-center gap-3 flex-wrap">
                              <Badge variant="outline" className="text-sm font-mono bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 rounded-full px-3 py-1">
                                {details}
                              </Badge>
                              {timestamp && (
                                <span className="text-sm text-muted-foreground">
                                  {new Date(timestamp).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0"
                      >
                        <ArrowRight className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-200",
                          isExpanded && "rotate-90"
                        )} />
                      </Button>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                        >
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <p className="text-base font-medium">{isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Not Started'}</p>
                            </div>
                            {details && (
                              <div>
                                <p className="text-sm text-muted-foreground">Reference</p>
                                <p className="text-base font-mono font-medium">{details}</p>
                              </div>
                            )}
                            {timestamp && (
                              <div>
                                <p className="text-sm text-muted-foreground">Last Updated</p>
                                <p className="text-base font-medium">{new Date(timestamp).toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer Stats */}
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>{completedCount} of {totalStages} stages complete</span>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last updated {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProcurementProgress;
