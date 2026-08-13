'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  History, Clock, ArrowRight, MessageSquare, RotateCcw,
  Zap, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, getFullName, getInitials, getRoleLabel } from '../utils/helpers';
import { HISTORY_ACTION_CONFIG } from '../utils/constants';

export interface RequisitionHistoryTabProps {
  historyItems: any[];
  historyLoading: boolean;
  isReturned: boolean;
  isEmergency: boolean;
}

export const RequisitionHistoryTab: React.FC<RequisitionHistoryTabProps> = ({
  historyItems,
  historyLoading,
  isReturned,
  isEmergency,
}) => {
  if (historyLoading) {
    return (
      <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
      <CardHeader className={cn(
        "pb-3 rounded-t-xl",
        isReturned ? "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20" :
          isEmergency ? "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20" :
            "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
      )}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className={cn(
                "h-5 w-5",
                isReturned ? "text-amber-600" :
                  isEmergency ? "text-red-600" :
                    "text-blue-600"
              )} />
              History Log
            </CardTitle>
            <CardDescription>
              {historyItems.length} activities and changes made to this requisition
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isReturned && (
              <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 flex items-center gap-1.5 font-medium shadow-sm text-xs rounded-full">
                <RotateCcw className="h-3 w-3" />
                Returned
              </Badge>
            )}
            {isEmergency && (
              <Badge variant="destructive" className="text-xs rounded-full">
                <Zap className="h-3 w-3 mr-1" />
                Emergency
              </Badge>
            )}
            <Badge variant="outline" className="text-xs rounded-full">
              {historyItems.length} entries
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {historyItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
              <History className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No History Found</h3>
            <p className="text-sm text-muted-foreground">
              No activities have been recorded for this requisition yet.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 border-l-2 border-muted space-y-4">
            {historyItems.map((history: any, index: number) => {
              const config = HISTORY_ACTION_CONFIG[history.action] || {
                color: 'bg-muted/50 text-muted-foreground border-muted',
                icon: Clock,
                label: history.action_label || history.action,
              };
              const Icon = config.icon;
              const isFirst = index === 0;
              const isDeclinedAction = history.action?.includes('declined') || false;
              const isReturnedAction = history.action === 'returned';

              return (
                <motion.div
                  key={history.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  <div className={cn(
                    "absolute -left-[9px] top-4 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm",
                    config.color.split(' ')[0]
                  )}>
                    <div className="absolute inset-0 rounded-full bg-current opacity-20" />
                  </div>
                  <div className={cn(
                    "bg-card rounded-xl p-4 border hover:shadow-md transition-all duration-200",
                    isDeclinedAction && "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20",
                    isReturnedAction && "border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20"
                  )}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={cn("text-xs font-medium rounded-full", config.color)}>
                            <Icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                          {isFirst && (
                            <Badge variant="default" className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 rounded-full">
                              Latest
                            </Badge>
                          )}
                          {history.is_status_change && history.new_status && (
                            <Badge variant="outline" className="text-[10px] rounded-full">
                              Status: {history.new_status}
                            </Badge>
                          )}
                        </div>

                        <div className="mt-2 space-y-1">
                          {history.comment && (
                            <p className="text-sm text-card-foreground flex items-start gap-1.5">
                              <MessageSquare className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                              <span>{history.comment}</span>
                            </p>
                          )}

                          {history.old_values && history.new_values && (
                            <div className="mt-2 text-xs bg-muted/30 rounded-lg p-3 border">
                              <p className="font-medium text-muted-foreground mb-2">Changes:</p>
                              <div className="space-y-1">
                                {Object.keys(history.old_values).map((key) => {
                                  if (history.old_values?.[key] !== history.new_values?.[key]) {
                                    return (
                                      <div key={key} className="flex items-center gap-2 text-xs font-mono">
                                        <span className="text-muted-foreground">{key}:</span>
                                        <span className="text-red-500 line-through">{String(history.old_values?.[key] ?? 'N/A')}</span>
                                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-emerald-600 dark:text-emerald-400">{String(history.new_values?.[key] ?? 'N/A')}</span>
                                      </div>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs font-medium text-muted-foreground">{formatDate(history.created_at)}</p>
                        <div className="flex items-center justify-end gap-2 mt-1">
                          {history.user && (
                            <div className="flex items-center gap-1.5">
                              <Avatar className="h-6 w-6 border">
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                  {getInitials(getFullName(history.user))}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">{getFullName(history.user)}</span>
                              {history.user.role && (
                                <span className="text-[10px] text-muted-foreground">({getRoleLabel(history.user.role)})</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
