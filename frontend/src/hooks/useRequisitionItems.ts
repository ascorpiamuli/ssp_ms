// frontend/src/hooks/useRequisitionItems.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { requisitionItemService } from '@/services/requisition-item.service';
import { useToast } from '@/components/ui/toast-context';
import type {
  RequisitionItem,
  CreateRequisitionItemData,
  UpdateRequisitionItemData,
} from '@/types/requisition.types';

// ============================================
// QUERIES (no toasts needed)
// ============================================

export const useRequisitionItems = (
  requisitionId: number,
  options?: Omit<UseQueryOptions<RequisitionItem[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['requisition-items', requisitionId],
    queryFn: () => requisitionItemService.getByRequisitionId(requisitionId),
    enabled: !!requisitionId,
    ...options,
  });
};

export const useRequisitionItem = (
  requisitionId: number,
  itemId: number,
  options?: Omit<UseQueryOptions<RequisitionItem>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['requisition-item', requisitionId, itemId],
    queryFn: () => requisitionItemService.getById(requisitionId, itemId),
    enabled: !!requisitionId && !!itemId,
    ...options,
  });
};

export const useRequisitionItemStats = (
  requisitionId: number,
  options?: Omit<UseQueryOptions<{
    total_items: number;
    total_quantity: number;
    total_cost: number;
    total_received: number;
    total_delivered: number;
    pending_items: number;
    procured_items: number;
    delivered_items: number;
    received_items: number;
  }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['requisition-item-stats', requisitionId],
    queryFn: () => requisitionItemService.getStats(requisitionId),
    enabled: !!requisitionId,
    ...options,
  });
};

// ============================================
// MUTATIONS WITH TOASTS
// ============================================

export const useCreateRequisitionItem = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ requisitionId, data }: { requisitionId: number; data: CreateRequisitionItemData }) =>
      requisitionItemService.create(requisitionId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requisition-items', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['requisition-item-stats', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['requisition', variables.requisitionId] });
      success(`Item "${data.item_name}" added successfully`);
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to add item');
    },
  });
};

export const useBulkCreateRequisitionItems = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ requisitionId, items }: { requisitionId: number; items: CreateRequisitionItemData[] }) =>
      requisitionItemService.bulkCreate(requisitionId, items),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requisition-items', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['requisition-item-stats', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['requisition', variables.requisitionId] });
      success(`${variables.items.length} items added successfully`);
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to add items');
    },
  });
};

export const useUpdateRequisitionItem = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({
      requisitionId,
      itemId,
      data,
    }: {
      requisitionId: number;
      itemId: number;
      data: UpdateRequisitionItemData;
    }) => requisitionItemService.update(requisitionId, itemId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requisition-items', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['requisition-item', variables.requisitionId, variables.itemId] });
      queryClient.invalidateQueries({ queryKey: ['requisition-item-stats', variables.requisitionId] });
      success(`Item "${data.item_name}" updated successfully`);
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to update item');
    },
  });
};

export const useDeleteRequisitionItem = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ requisitionId, itemId }: { requisitionId: number; itemId: number }) =>
      requisitionItemService.delete(requisitionId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requisition-items', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['requisition-item-stats', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['requisition', variables.requisitionId] });
      success('Item deleted successfully');
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to delete item');
    },
  });
};

export const useReceiveRequisitionItem = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({
      requisitionId,
      itemId,
      data,
    }: {
      requisitionId: number;
      itemId: number;
      data: { received_quantity: number; receipt_number?: string };
    }) => requisitionItemService.receiveItem(requisitionId, itemId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requisition-items', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['requisition-item', variables.requisitionId, variables.itemId] });
      queryClient.invalidateQueries({ queryKey: ['requisition-item-stats', variables.requisitionId] });
      success(`Item "${data.item_name}" received (${data.received_quantity} ${data.unit_of_measure})`);
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to receive item');
    },
  });
};

export const useUpdateItemQualityStatus = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({
      requisitionId,
      itemId,
      data,
    }: {
      requisitionId: number;
      itemId: number;
      data: { quality_status: 'pending' | 'inspected' | 'accepted' | 'rejected'; quality_notes?: string };
    }) => requisitionItemService.updateQualityStatus(requisitionId, itemId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requisition-items', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['requisition-item', variables.requisitionId, variables.itemId] });
      const statusMap = {
        pending: 'Pending',
        inspected: 'Inspected',
        accepted: 'Accepted',
        rejected: 'Rejected',
      };
      success(`Item "${data.item_name}" quality status: ${statusMap[data.quality_status]}`);
    },
    onError: (error: any) => {
      error(error?.response?.data?.message || 'Failed to update quality status');
    },
  });
};
