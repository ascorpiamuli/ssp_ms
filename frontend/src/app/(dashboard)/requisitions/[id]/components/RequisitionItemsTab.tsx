'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package, DollarSign, Hash, ChevronDown, Box, Zap,
  RotateCcw, CheckCircle, XCircle, Briefcase, FileText,
  Loader2, AlertCircle, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '../utils/helpers';

export interface RequisitionItemsTabProps {
  requisition: any;
  isDeclined: boolean;
  isReturned: boolean;
  isEmergency: boolean;
  expandedRows: Set<number>;
  toggleRow: (id: number) => void;
}

export const RequisitionItemsTab: React.FC<RequisitionItemsTabProps> = ({
  requisition,
  isDeclined,
  isReturned,
  isEmergency,
  expandedRows,
  toggleRow,
}) => {
  const isService = requisition?.requisition_type === 'services';
  const isGoods = requisition?.requisition_type === 'goods';
  const items = requisition?.items || [];
  const totalItems = items.length;

  // For services, we don't show items - just a message
  if (isService) {
    const hasItems = totalItems > 0;
    const serviceTitle = requisition?.title || 'Service Requisition';
    const serviceDesc = requisition?.service_scope_of_work || requisition?.description || '';

    return (
      <Card className="overflow-hidden shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
        <CardHeader className={cn(
          "pb-3 rounded-t-xl",
          isReturned ? "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20" :
            isEmergency ? "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20" :
              "bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20"
        )}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className={cn(
                  "h-5 w-5",
                  isReturned ? "text-amber-600" :
                    isEmergency ? "text-red-600" :
                      "text-purple-600"
                )} />
                Service Components
              </CardTitle>
              <CardDescription>
                {hasItems
                  ? 'Service components will be quoted by suppliers'
                  : 'This is a service requisition - items will be auto-created'}
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
              <Badge variant="outline" className="text-sm font-medium rounded-full bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
                <Briefcase className="h-3 w-3 mr-1" />
                LSO
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-50 dark:bg-purple-900/20 mb-4">
              <Briefcase className="h-10 w-10 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Service Requisition
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {hasItems
                ? 'Service components have been auto-generated and will be quoted by suppliers.'
                : 'No service components needed. Suppliers will provide technical breakdown in their quotations.'}
            </p>

            {hasItems && (
              <div className="mt-6 max-w-md mx-auto">
                <div className="bg-muted/30 rounded-lg p-4 text-left">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
                    Auto-generated Service Item
                  </p>
                  {items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.item_name}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{item.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                          To be quoted
                        </p>
                        <p className="text-xs text-muted-foreground">{item.quantity} {item.unit_of_measure}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Pricing will be determined by supplier quotations</span>
            </div>

            {/* Service details summary */}
            {(requisition?.service_category || requisition?.service_scope_of_work) && (
              <div className="mt-6 max-w-md mx-auto text-left">
                <div className="bg-muted/20 rounded-lg p-4">
                  {requisition?.service_category && (
                    <div className="flex items-center gap-2 py-1">
                      <span className="text-xs text-muted-foreground">Category:</span>
                      <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-[10px]">
                        {requisition.service_category.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </Badge>
                    </div>
                  )}
                  {requisition?.service_expected_start_date && requisition?.service_expected_end_date && (
                    <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
                      <span>Service Period:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {new Date(requisition.service_expected_start_date).toLocaleDateString()} - {new Date(requisition.service_expected_end_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {requisition?.service_estimated_duration_days && (
                    <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
                      <span>Duration:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{requisition.service_estimated_duration_days} days</span>
                    </div>
                  )}
                  {requisition?.service_requires_onsite_visit && (
                    <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
                      <span>Onsite Visit:</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">Required</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/30 pt-4 rounded-b-xl">
          <div className="flex justify-between w-full">
            <span className="text-sm text-muted-foreground">
              Service Requisition (LSO)
            </span>
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Pricing TBD by Supplier
            </span>
          </div>
        </CardFooter>
      </Card>
    );
  }

  // For Goods: Show items table with proper price handling
  const allItemsHaveZeroCost = items.length > 0 && items.every((item: any) => (item.estimated_unit_cost || 0) === 0);
  const allItemsHaveCost = items.length > 0 && items.every((item: any) => (item.estimated_unit_cost || 0) > 0);

  return (
    <Card className="overflow-hidden shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 rounded-xl">
      <CardHeader className={cn(
        "pb-3 rounded-t-xl",
        isReturned ? "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20" :
          isEmergency ? "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20" :
            "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
      )}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className={cn(
                "h-5 w-5",
                isReturned ? "text-amber-600" :
                  isEmergency ? "text-red-600" :
                    "text-blue-600"
              )} />
              Requisition Items
            </CardTitle>
            <CardDescription>
              {totalItems} item{totalItems !== 1 ? 's' : ''} requested
              {allItemsHaveCost && ` • Total: ${formatCurrency(requisition?.total_amount || 0)}`}
              {allItemsHaveZeroCost && ' • Prices to be determined by suppliers'}
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
            <Badge variant="outline" className="text-sm font-medium rounded-full">
              {totalItems} items
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {requisition?.items && requisition.items.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[250px]">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      Item
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      Quantity
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      Unit Cost
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      Total
                    </div>
                  </TableHead>
                  <TableHead className="w-[50px]">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {requisition.items.map((item: any, index: number) => {
                    const isExpanded = expandedRows.has(item.id);
                    const hasZeroCost = (item.estimated_unit_cost || 0) === 0;

                    return (
                      <React.Fragment key={item.id}>
                        <motion.tr
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          className={cn(
                            "group hover:bg-muted/50 transition-colors cursor-pointer",
                            (isDeclined || isReturned) && "opacity-75"
                          )}
                          onClick={() => toggleRow(item.id)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0">
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform",
                                  isDeclined ? "bg-red-50 dark:bg-red-900/20" :
                                    isReturned ? "bg-amber-50 dark:bg-amber-900/20" :
                                      isEmergency ? "bg-red-50 dark:bg-red-900/20" :
                                        "bg-blue-50 dark:bg-blue-900/20"
                                )}>
                                  <Package className={cn(
                                    "h-4 w-4",
                                    isDeclined ? "text-red-600" :
                                      isReturned ? "text-amber-600" :
                                        isEmergency ? "text-red-600" :
                                          "text-blue-600"
                                  )} />
                                </div>
                              </div>
                              <div>
                                <p className="font-medium">{item.item_name}</p>
                                {item.specifications && (
                                  <p className="text-xs text-muted-foreground">{item.specifications}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{item.quantity}</span>
                              <span className="text-xs text-muted-foreground">{item.unit_of_measure}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {hasZeroCost ? (
                              <span className="text-amber-600 dark:text-amber-400 text-sm flex items-center justify-end gap-1">
                                <Sparkles className="h-3 w-3" />
                                TBD
                              </span>
                            ) : (
                              formatCurrency(item.estimated_unit_cost || 0)
                            )}
                          </TableCell>
                          <TableCell className={cn(
                            "text-right font-bold",
                            hasZeroCost ? "text-amber-600 dark:text-amber-400" :
                              isDeclined ? "text-red-600" :
                                isReturned ? "text-amber-600" :
                                  isEmergency ? "text-red-600" :
                                    "text-blue-600"
                          )}>
                            {hasZeroCost ? (
                              <span className="flex items-center justify-end gap-1">
                                <Sparkles className="h-3 w-3" />
                                To be quoted
                              </span>
                            ) : (
                              formatCurrency(item.total_cost || 0)
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(item.id);
                              }}
                            >
                              <ChevronDown className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                isExpanded && "rotate-180"
                              )} />
                            </Button>
                          </TableCell>
                        </motion.tr>
                        {isExpanded && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <TableCell colSpan={5} className="p-0">
                              <div className={cn(
                                "p-4 rounded-lg m-2",
                                isDeclined ? "bg-red-50/30 dark:bg-red-950/10" :
                                  isReturned ? "bg-amber-50/30 dark:bg-amber-950/10" :
                                    isEmergency ? "bg-red-50/30 dark:bg-red-950/10" :
                                      "bg-muted/30"
                              )}>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  {item.description && (
                                    <div className="col-span-2">
                                      <p className="text-xs text-muted-foreground">Description</p>
                                      <p className={cn(
                                        "text-sm",
                                        (isDeclined || isReturned) && "text-muted-foreground"
                                      )}>{item.description}</p>
                                    </div>
                                  )}
                                  {item.manufacturer && (
                                    <div>
                                      <p className="text-xs text-muted-foreground">Manufacturer</p>
                                      <p className="text-sm">{item.manufacturer}</p>
                                    </div>
                                  )}
                                  {item.model_number && (
                                    <div>
                                      <p className="text-xs text-muted-foreground">Model</p>
                                      <p className="text-sm">{item.model_number}</p>
                                    </div>
                                  )}
                                  {item.catalog_number && (
                                    <div>
                                      <p className="text-xs text-muted-foreground">Catalog #</p>
                                      <p className="text-sm font-mono">{item.catalog_number}</p>
                                    </div>
                                  )}
                                  {(item.tax_rate > 0 || item.discount_percentage > 0) && (
                                    <div className="col-span-2 flex gap-4">
                                      {item.tax_rate > 0 && (
                                        <div>
                                          <p className="text-xs text-muted-foreground">Tax Rate</p>
                                          <p className="text-sm">{item.tax_rate}%</p>
                                        </div>
                                      )}
                                      {item.discount_percentage > 0 && (
                                        <div>
                                          <p className="text-xs text-muted-foreground">Discount</p>
                                          <p className="text-sm">{item.discount_percentage}%</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {item.is_inventory_item && (
                                    <div>
                                      <p className="text-xs text-muted-foreground">Inventory</p>
                                      <p className="text-sm flex items-center gap-1">
                                        <Box className="h-3 w-3" />
                                        {item.inventory_code || 'Yes'}
                                      </p>
                                    </div>
                                  )}
                                  {item.supplier && (
                                    <div className="col-span-2">
                                      <p className="text-xs text-muted-foreground">Preferred Supplier</p>
                                      <p className="text-sm">{item.supplier.company_name || 'N/A'}</p>
                                    </div>
                                  )}

                                  {/* Show price warning for zero-cost items */}
                                  {hasZeroCost && (
                                    <div className="col-span-2 md:col-span-4 mt-2 p-2 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50 flex items-center gap-2">
                                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                      <p className="text-xs text-amber-700 dark:text-amber-300">
                                        Unit cost is 0.00. Supplier will provide pricing in their quotation.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </motion.tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No Items Found</h3>
            <p className="text-sm text-muted-foreground">This requisition has no items added yet.</p>
          </div>
        )}
      </CardContent>
      {requisition?.items && requisition.items.length > 0 && (
        <CardFooter className="border-t bg-muted/30 pt-4 rounded-b-xl">
          <div className="flex justify-between w-full">
            <span className="text-sm text-muted-foreground">
              Total Items: <span className="font-medium">{totalItems}</span>
            </span>
            <span className={cn(
              "text-sm font-semibold",
              allItemsHaveZeroCost ? "text-amber-600 dark:text-amber-400 flex items-center gap-2" :
                isDeclined ? "text-red-600" :
                  isReturned ? "text-amber-600" :
                    isEmergency ? "text-red-600" :
                      requisition?.status === 'final_approved' ? "text-emerald-600" :
                        "text-blue-600"
            )}>
              {allItemsHaveZeroCost ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Prices to be determined by supplier quotations
                </>
              ) : (
                <>Grand Total: {formatCurrency(requisition?.total_amount || 0)}</>
              )}
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
