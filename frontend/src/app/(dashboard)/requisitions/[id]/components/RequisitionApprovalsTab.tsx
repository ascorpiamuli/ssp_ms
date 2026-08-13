'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Shield, CheckCircle, XCircle, Loader2, Clock, RotateCcw,
  User, MessageSquare, AlertCircle, Info, Zap, Ban
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFullName, getRoleLabel, formatDate, getApprovalLevelInfo } from '../utils/helpers';

export interface RequisitionApprovalsTabProps {
  requisition: any;
  isDeclined: boolean;
  isReturned: boolean;
  isEmergency: boolean;
}

export const RequisitionApprovalsTab: React.FC<RequisitionApprovalsTabProps> = ({
  requisition,
  isDeclined,
  isReturned,
  isEmergency,
}) => {
  const totalApprovals = requisition?.approvals?.length || 0;
  const completedApprovals = requisition?.approvals?.filter((a: any) => a.status === 'approved').length || 0;
  const pendingCount = requisition?.approvals?.filter((a: any) => a.status === 'pending').length || 0;
  const progressPercentage = totalApprovals > 0 ? (completedApprovals / totalApprovals) * 100 : 0;

  // Check if any approval in the chain is declined
  const hasDeclinedApproval = requisition?.approvals?.some((a: any) =>
    a.status === 'declined' || a.status === 'cancelled'
  );

  // Find the highest declined level (the one that caused the block)
  const getDeclinedLevel = () => {
    if (!requisition?.approvals) return null;
    const declined = requisition.approvals.find((a: any) =>
      a.status === 'declined' || a.status === 'cancelled'
    );
    return declined?.level || null;
  };

  const declinedLevel = getDeclinedLevel();
  const levelOrder = ['hod', 'accountant', 'principal', 'final'];

  // Check if an approval should be blocked (if a higher level declined AND this approval is still pending)
  const isApprovalBlocked = (approval: any) => {
    if (!hasDeclinedApproval || !declinedLevel) return false;
    // If this approval is already approved or declined, don't block it
    if (approval.status === 'approved' || approval.status === 'declined' || approval.status === 'cancelled') {
      return false;
    }
    const levelIndex = levelOrder.indexOf(approval.level);
    const declinedIndex = levelOrder.indexOf(declinedLevel);
    // Only block if this level is below the declined level AND it's pending
    return levelIndex > declinedIndex && approval.status === 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'emerald';
      case 'pending': return 'amber';
      case 'declined': return 'red';
      case 'returned': return 'amber';
      default: return 'gray';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
      className="space-y-6"
    >
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-3 relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Approval Workflow
                </CardTitle>
                <CardDescription>
                  {totalApprovals} approval{totalApprovals !== 1 ? 's' : ''} •
                  {isDeclined ? ' Declined' : isReturned ? ' Returned' : ` ${pendingCount} pending`}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isReturned && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 flex items-center gap-1.5 font-medium shadow-sm text-xs rounded-full px-3 py-1">
                      <RotateCcw className="h-3 w-3" />
                      Returned
                    </Badge>
                  </motion.div>
                )}
                {isEmergency && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <Badge variant="destructive" className="text-xs rounded-full px-3 py-1 animate-pulse">
                      <Zap className="h-3 w-3 mr-1" />
                      Emergency
                    </Badge>
                  </motion.div>
                )}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Badge variant="outline" className="text-xs rounded-full px-3 py-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {Math.round(progressPercentage)}%
                  </Badge>
                </motion.div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Approval Progress</span>
                <span className="font-medium">{completedApprovals} of {totalApprovals} levels completed</span>
              </div>
              <div className="relative h-2.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    isDeclined ? "bg-red-500" :
                      isReturned ? "bg-amber-500" :
                        progressPercentage === 100 ? "bg-emerald-500" :
                          "bg-gradient-to-r from-blue-500 to-indigo-500"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Approvals List */}
      {requisition?.approvals && requisition.approvals.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {requisition.approvals.map((approval: any, index: number) => {
              const levelInfo = getApprovalLevelInfo(approval.level);
              const isPending = approval.status === 'pending';
              const isApproved = approval.status === 'approved';
              const isDeclinedApproval = approval.status === 'declined' || approval.status === 'cancelled';
              const isReturnedApproval = approval.status === 'returned';

              // Check if this approval should be blocked (higher level declined AND this is pending)
              const isBlockedByHigherDecline = isApprovalBlocked(approval);

              // An approval is blocked if:
              // 1. A higher authority declined AND this approval is still pending
              // 2. The requisition is globally returned and this approval isn't the one that did it
              const isBlockedByReturn = (isReturned) && !isReturnedApproval && !isDeclinedApproval && isPending;
              const isBlocked = isBlockedByHigherDecline || isBlockedByReturn;

              const approverRoleLabel = approval.approver?.role_label || getRoleLabel(approval.approver?.role || '');

              const statusConfig = {
                approved: {
                  bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
                  border: 'border-emerald-200 dark:border-emerald-800',
                  iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
                  iconColor: 'text-emerald-500',
                  badge: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
                  statusText: 'Approved',
                },
                pending: {
                  bg: 'bg-amber-50/50 dark:bg-amber-950/20',
                  border: 'border-amber-200 dark:border-amber-800',
                  iconBg: 'bg-amber-100 dark:bg-amber-900/30',
                  iconColor: 'text-amber-500',
                  badge: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-emerald-800',
                  statusText: 'Pending',
                },
                declined: {
                  bg: 'bg-red-50/50 dark:bg-red-950/20',
                  border: 'border-red-200 dark:border-red-800',
                  iconBg: 'bg-red-100 dark:bg-red-900/30',
                  iconColor: 'text-red-500',
                  badge: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
                  statusText: 'Declined',
                },
                returned: {
                  bg: 'bg-amber-50/50 dark:bg-amber-950/20',
                  border: 'border-amber-200 dark:border-amber-800',
                  iconBg: 'bg-amber-100 dark:bg-amber-900/30',
                  iconColor: 'text-amber-500',
                  badge: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
                  statusText: 'Returned',
                },
                blocked: {
                  bg: 'bg-gray-50/50 dark:bg-gray-950/20',
                  border: 'border-gray-200 dark:border-gray-800',
                  iconBg: 'bg-gray-100 dark:bg-gray-900/30',
                  iconColor: 'text-gray-500',
                  badge: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800',
                  statusText: 'Blocked',
                },
                default: {
                  bg: 'bg-gray-50/50 dark:bg-gray-950/20',
                  border: 'border-gray-200 dark:border-gray-800',
                  iconBg: 'bg-gray-100 dark:bg-gray-900/30',
                  iconColor: 'text-gray-500',
                  badge: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800',
                  statusText: 'Waiting',
                },
              };

              // Determine which config to use
              let configKey: keyof typeof statusConfig = 'default';
              if (isBlocked) {
                configKey = 'blocked';
              } else if (isApproved) {
                configKey = 'approved';
              } else if (isDeclinedApproval) {
                configKey = 'declined';
              } else if (isReturnedApproval) {
                configKey = 'returned';
              } else if (isPending) {
                configKey = 'pending';
              }

              const config = statusConfig[configKey];

              // Determine the status display text
              let statusDisplay = config.statusText;
              if (isBlocked) {
                statusDisplay = 'Blocked';
              }

              // Determine the icon
              const getStatusIcon = () => {
                if (isBlocked) {
                  return Ban;
                }
                if (isApproved) return CheckCircle;
                if (isDeclinedApproval) return XCircle;
                if (isReturnedApproval) return RotateCcw;
                if (isPending) return Loader2;
                return Clock;
              };

              const StatusIcon = getStatusIcon();

              return (
                <motion.div
                  key={approval.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                    delay: index * 0.05
                  }}
                  whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                  className="relative"
                >
                  <div
                    className={cn(
                      "rounded-xl p-5 border transition-all duration-300",
                      config.bg,
                      config.border,
                      isBlocked && "opacity-60 grayscale"
                    )}
                  >
                    {/* Glow effect */}
                    {isPending && !isBlocked && (
                      <div className="absolute inset-0 rounded-xl bg-amber-500/5 animate-pulse" />
                    )}
                    {isApproved && (
                      <div className="absolute inset-0 rounded-xl bg-emerald-500/5" />
                    )}
                    {isDeclinedApproval && (
                      <div className="absolute inset-0 rounded-xl bg-red-500/5" />
                    )}

                    <div className="relative flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Animated Icon */}
                        <motion.div
                          className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0 shadow-lg",
                            config.iconBg,
                            isPending && !isBlocked && "animate-pulse"
                          )}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 20,
                            delay: 0.1
                          }}
                        >
                          {isBlocked ? (
                            <Ban className="h-6 w-6 text-gray-500" />
                          ) : isPending && !isBlocked ? (
                            <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
                          ) : isApproved ? (
                            <CheckCircle className="h-6 w-6 text-emerald-500" />
                          ) : isDeclinedApproval ? (
                            <XCircle className="h-6 w-6 text-red-500" />
                          ) : isReturnedApproval ? (
                            <RotateCcw className="h-6 w-6 text-amber-500" />
                          ) : (
                            <levelInfo.icon className="h-6 w-6 text-muted-foreground" />
                          )}
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium text-base">
                              Level {levelInfo.level}: {levelInfo.name}
                            </h4>
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                            >
                              <Badge
                                className={cn(
                                  "text-xs rounded-full capitalize",
                                  config.badge
                                )}
                              >
                                {statusDisplay}
                              </Badge>
                            </motion.div>
                            {isBlocked && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                              >
                                <Badge variant="outline" className="text-xs text-muted-foreground rounded-full">
                                  <Info className="h-3 w-3 mr-0.5" />
                                  {isReturned ? 'Returned - Needs Revision' : 'Blocked by higher authority'}
                                </Badge>
                              </motion.div>
                            )}
                          </div>

                          {/* Approver Info */}
                          {approval.approver && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1"
                            >
                              <User className="h-3.5 w-3.5" />
                              {getFullName(approval.approver)}
                              <span className="text-xs text-muted-foreground">({approverRoleLabel})</span>
                              {approval.approver.email && (
                                <span className="text-xs text-muted-foreground">• {approval.approver.email}</span>
                              )}
                            </motion.p>
                          )}

                          {/* Delegate Info */}
                          {approval.delegate && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                              className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1"
                            >
                              <User className="h-3.5 w-3.5" />
                              Delegated to: {getFullName(approval.delegate)}
                              <span className="text-xs text-muted-foreground">({getRoleLabel(approval.delegate.role)})</span>
                            </motion.p>
                          )}

                          {/* Comment */}
                          {approval.comment && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              transition={{ delay: 0.4 }}
                              className="mt-2 bg-background/50 rounded-lg p-3 border"
                            >
                              <p className="text-sm flex items-start gap-2">
                                <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <span>{approval.comment}</span>
                              </p>
                            </motion.div>
                          )}

                          {/* Reason for Decline */}
                          {approval.reason && (
                            <motion.p
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 }}
                              className="text-sm text-red-600 flex items-start gap-2 mt-1"
                            >
                              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              <span>{approval.reason}</span>
                            </motion.p>
                          )}

                          {/* Blocked Message */}
                          {isBlocked && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 }}
                              className="text-sm text-muted-foreground flex items-start gap-2 mt-1"
                            >
                              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              <span>
                                {isReturned
                                  ? 'This approval is blocked because the requisition was returned for revision'
                                  : 'This approval is blocked because a higher authority declined the requisition'}
                              </span>
                            </motion.p>
                          )}

                          {/* Timestamps */}
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                            {approval.reviewed_at && (
                              <span>Reviewed: {formatDate(approval.reviewed_at)}</span>
                            )}
                            {approval.due_date && (
                              <span>Due: {formatDate(approval.due_date)}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className="flex-shrink-0"
                      >
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                            <Ban className="h-4 w-4" />
                            Blocked
                          </span>
                        ) : isPending && !isBlocked ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full shadow-sm">
                            <Clock className="h-4 w-4 animate-pulse" />
                            Waiting
                          </span>
                        ) : isApproved ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full shadow-sm">
                            <CheckCircle className="h-4 w-4" />
                            Approved
                          </span>
                        ) : isDeclinedApproval ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-red-600 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full shadow-sm">
                            <XCircle className="h-4 w-4" />
                            {approval.status === 'cancelled' ? 'Cancelled' : 'Declined'}
                          </span>
                        ) : isReturnedApproval ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full shadow-sm">
                            <RotateCcw className="h-4 w-4" />
                            Returned
                          </span>
                        ) : null}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="text-center py-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4"
          >
            <Shield className="h-8 w-8 text-muted-foreground" />
          </motion.div>
          <h3 className="text-lg font-medium mb-1">No Approvals Found</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {requisition?.status === 'draft'
              ? 'Submit this requisition to start the approval process.'
              : 'No approval records found for this requisition.'}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RequisitionApprovalsTab;
