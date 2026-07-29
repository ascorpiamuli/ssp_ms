// frontend/src/hooks/usePurchaseOrder.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { purchaseOrderService } from '@/services/purchaseOrder.service';
import { useToast } from '@/components/ui/toast-context';
import type {
  PurchaseOrder,
  PurchaseOrderFilters,
  PurchaseOrderSummary,
  CreatePurchaseOrderData,
  UpdatePurchaseOrderData,
} from '@/types/purchaseOrder.types';
import type { PaginatedResponse } from '@/types/common.types';

export const PURCHASE_ORDERS_QUERY_KEY = 'purchase-orders';

// ============================================
// QUERIES
// ============================================

export const usePurchaseOrders = (
  filters?: PurchaseOrderFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<PurchaseOrder>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [PURCHASE_ORDERS_QUERY_KEY, filters],
    queryFn: () => purchaseOrderService.getAll(filters),
    ...options,
  });
};

export const usePurchaseOrder = (
  id: number,
  options?: Omit<UseQueryOptions<PurchaseOrder>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['purchase-order', id],
    queryFn: () => purchaseOrderService.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const usePurchaseOrderSummary = (
  id: number,
  options?: Omit<UseQueryOptions<PurchaseOrderSummary>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['purchase-order-summary', id],
    queryFn: () => purchaseOrderService.getSummary(id),
    enabled: !!id,
    ...options,
  });
};

export const usePurchaseOrderDeliveryProgress = (
  id: number,
  options?: Omit<UseQueryOptions<{ progress: number }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['purchase-order-delivery-progress', id],
    queryFn: () => purchaseOrderService.getDeliveryProgress(id),
    enabled: !!id,
    ...options,
  });
};

export const useOverduePurchaseOrders = (
  options?: Omit<UseQueryOptions<PurchaseOrder[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['overdue-purchase-orders'],
    queryFn: () => purchaseOrderService.getOverdue(),
    ...options,
  });
};

export const usePurchaseOrdersByRequisition = (
  requisitionId: number,
  options?: Omit<UseQueryOptions<PurchaseOrder[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['purchase-orders-by-requisition', requisitionId],
    queryFn: () => purchaseOrderService.getByRequisition(requisitionId),
    enabled: !!requisitionId,
    ...options,
  });
};

// ============================================
// MUTATIONS
// ============================================

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreatePurchaseOrderData) => purchaseOrderService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PURCHASE_ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders-by-requisition', data.requisition_id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-status', data.requisition_id] });
      success(`Purchase Order "${data.po_number}" generated successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to generate purchase order');
    },
  });
};

export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePurchaseOrderData }) =>
      purchaseOrderService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PURCHASE_ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-summary', data.id] });
      success(`Purchase Order updated successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to update purchase order');
    },
  });
};

export const useApprovePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, comment }: { id: number; comment?: string }) =>
      purchaseOrderService.approve(id, comment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PURCHASE_ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-approvals'] });
      success(`Purchase Order "${data.po_number}" approved successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to approve purchase order');
    },
  });
};

export const useIssuePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => purchaseOrderService.issue(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PURCHASE_ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-summary', data.id] });
      success(`Purchase Order "${data.po_number}" issued successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to issue purchase order');
    },
  });
};

export const useSendPurchaseOrderToSupplier = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => purchaseOrderService.sendToSupplier(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PURCHASE_ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-summary', data.id] });
      success(`Purchase Order "${data.po_number}" sent to supplier successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to send purchase order to supplier');
    },
  });
};

export const useAcknowledgePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, supplierId }: { id: number; supplierId: number }) =>
      purchaseOrderService.acknowledge(id, supplierId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PURCHASE_ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-summary', data.id] });
      success(`Purchase Order "${data.po_number}" acknowledged by supplier`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to acknowledge purchase order');
    },
  });
};

export const useMarkPurchaseOrderDelivered = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => purchaseOrderService.markDelivered(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PURCHASE_ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-delivery-progress', data.id] });
      success(`Purchase Order "${data.po_number}" marked as delivered`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to mark purchase order as delivered');
    },
  });
};

export const useCompletePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => purchaseOrderService.complete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PURCHASE_ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-summary', data.id] });
      queryClient.invalidateQueries({ queryKey: ['procurement-status', data.requisition_id] });
      success(`Purchase Order "${data.po_number}" completed successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to complete purchase order');
    },
  });
};

export const useCancelPurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      purchaseOrderService.cancel(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PURCHASE_ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-summary', data.id] });
      success(`Purchase Order "${data.po_number}" cancelled successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to cancel purchase order');
    },
  });
};

export const useGetPurchaseOrderPdf = () => {
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => purchaseOrderService.getPdf(id),
    onSuccess: () => {
      success('PDF downloaded successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to generate PDF');
    },
  });
};
