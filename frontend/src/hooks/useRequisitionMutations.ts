// frontend/src/hooks/useRequisitionMutations.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requisitionService } from '@/services/requisition.service';
import { requisitionAttachmentService } from '@/services/requisition-attachment.service';
import { useToast } from '@/components/ui/toast-context';
import type {
  CreateRequisitionData,
  UpdateRequisitionData,
  SubmitRequisitionData,
  ReturnRequisitionData,
  CancelRequisitionData,
  AttachmentCategory,
  RequisitionTypeEnum,
  ProcurementTypeEnum,
  ServiceCategory,
} from '@/types/requisition.types';
import { REQUISITIONS_QUERY_KEY } from './useRequisitionQueries';

// ============================================
// REQUISITION MUTATIONS WITH TOASTS
// ============================================

export const useCreateRequisition = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateRequisitionData) => requisitionService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [REQUISITIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['my-requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['requisition-stats'] });
      queryClient.invalidateQueries({ queryKey: ['my-requisition-stats'] });

      // Invalidate type-specific queries
      if (data.requisition_type === 'services') {
        queryClient.invalidateQueries({ queryKey: ['service-requisitions'] });
        if (data.service_category) {
          queryClient.invalidateQueries({ queryKey: ['requisitions-by-category', data.service_category] });
        }
        queryClient.invalidateQueries({ queryKey: ['requisitions-for-lso'] });
      } else if (data.requisition_type === 'goods') {
        queryClient.invalidateQueries({ queryKey: ['goods-requisitions'] });
        queryClient.invalidateQueries({ queryKey: ['requisitions-for-lpo'] });
      }

      const typeLabel = data.requisition_type === 'services' ? 'Service' : 'Goods';
      success(`${typeLabel} requisition "${data.reference_number}" created successfully`);
    },
    onError: (err: any) => {
      let errorMessage = 'Failed to create requisition';

      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.errors) {
        const errors = err.response.data.errors;
        const messages: string[] = [];
        Object.values(errors).forEach((value) => {
          if (Array.isArray(value)) {
            messages.push(...value);
          } else if (typeof value === 'string') {
            messages.push(value);
          }
        });
        errorMessage = messages.join(', ') || 'Validation failed';
      }

      error(errorMessage);
    },
  });
};

export const useUpdateRequisition = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRequisitionData }) =>
      requisitionService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [REQUISITIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['requisition', data.id] });
      queryClient.invalidateQueries({ queryKey: ['my-requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['requisition-stats'] });

      // Invalidate type-specific queries based on updated data
      if (variables.data.requisition_type === 'services') {
        queryClient.invalidateQueries({ queryKey: ['service-requisitions'] });
        if (variables.data.service_category) {
          queryClient.invalidateQueries({ queryKey: ['requisitions-by-category', variables.data.service_category] });
        }
        queryClient.invalidateQueries({ queryKey: ['requisitions-for-lso'] });
      } else if (variables.data.requisition_type === 'goods') {
        queryClient.invalidateQueries({ queryKey: ['goods-requisitions'] });
        queryClient.invalidateQueries({ queryKey: ['requisitions-for-lpo'] });
      }

      const typeLabel = variables.data.requisition_type === 'services' ? 'Service' : 'Goods';
      success(`${typeLabel} requisition "${data.reference_number}" updated successfully`);
    },
    onError: (err: any) => {
      let errorMessage = 'Failed to update requisition';

      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.errors) {
        const errors = err.response.data.errors;
        const messages: string[] = [];
        Object.values(errors).forEach((value) => {
          if (Array.isArray(value)) {
            messages.push(...value);
          } else if (typeof value === 'string') {
            messages.push(value);
          }
        });
        errorMessage = messages.join(', ') || 'Validation failed';
      }

      error(errorMessage);
    },
  });
};

export const useDeleteRequisition = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => requisitionService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [REQUISITIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['my-requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['requisition-stats'] });
      queryClient.invalidateQueries({ queryKey: ['my-requisition-stats'] });
      queryClient.invalidateQueries({ queryKey: ['service-requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['goods-requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['requisitions-for-lpo'] });
      queryClient.invalidateQueries({ queryKey: ['requisitions-for-lso'] });
      success('Requisition deleted successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to delete requisition');
    },
  });
};

export const useSubmitRequisition = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SubmitRequisitionData }) =>
      requisitionService.submit(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [REQUISITIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['requisition', data.id] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals-list'] });
      queryClient.invalidateQueries({ queryKey: ['requisition-stats'] });
      queryClient.invalidateQueries({ queryKey: ['my-requisition-stats'] });
      queryClient.invalidateQueries({ queryKey: ['service-requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['goods-requisitions'] });

      const typeLabel = data.requisition_type === 'services' ? 'Service' : 'Goods';
      success(`${typeLabel} requisition "${data.reference_number}" submitted for approval`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to submit requisition');
    },
  });
};

export const useReturnRequisition = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReturnRequisitionData }) =>
      requisitionService.return(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [REQUISITIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['requisition', data.id] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals-list'] });
      queryClient.invalidateQueries({ queryKey: ['requisition-stats'] });

      const typeLabel = data.requisition_type === 'services' ? 'Service' : 'Goods';
      success(`${typeLabel} requisition "${data.reference_number}" returned for revision`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to return requisition');
    },
  });
};

export const useCancelRequisition = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CancelRequisitionData }) =>
      requisitionService.cancel(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [REQUISITIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['requisition', data.id] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals-list'] });
      queryClient.invalidateQueries({ queryKey: ['requisition-stats'] });
      queryClient.invalidateQueries({ queryKey: ['my-requisition-stats'] });

      const typeLabel = data.requisition_type === 'services' ? 'Service' : 'Goods';
      success(`${typeLabel} requisition "${data.reference_number}" cancelled successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to cancel requisition');
    },
  });
};

// ============================================
// ADMIN REQUISITION MUTATIONS WITH TOASTS
// ============================================

export const useAdminForceApprove = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: number) => requisitionService.adminForceApprove(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [REQUISITIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['requisition', data.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['requisition-stats'] });
      queryClient.invalidateQueries({ queryKey: ['service-requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['goods-requisitions'] });

      const typeLabel = data.requisition_type === 'services' ? 'Service' : 'Goods';
      success(`${typeLabel} requisition "${data.reference_number}" force approved`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to force approve requisition');
    },
  });
};

export const useAdminForceDecline = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { reason: string } }) =>
      requisitionService.adminForceDecline(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [REQUISITIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['requisition', data.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['requisition-stats'] });

      const typeLabel = data.requisition_type === 'services' ? 'Service' : 'Goods';
      success(`${typeLabel} requisition "${data.reference_number}" force declined`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to force decline requisition');
    },
  });
};

export const useAdminForceReturn = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { reason: string } }) =>
      requisitionService.adminForceReturn(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [REQUISITIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['requisition', data.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-requisitions'] });

      const typeLabel = data.requisition_type === 'services' ? 'Service' : 'Goods';
      success(`${typeLabel} requisition "${data.reference_number}" force returned`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to force return requisition');
    },
  });
};

export const useAdminAssignApprover = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { user_id: number; level: string } }) =>
      requisitionService.adminAssignApprover(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['requisition', data.id] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals-list'] });
      success(`Approver assigned for requisition "${data.reference_number}"`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to assign approver');
    },
  });
};

// ============================================
// ATTACHMENT MUTATIONS WITH TOASTS
// ============================================

export const useUploadAttachment = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({
      requisitionId,
      file,
      data,
    }: {
      requisitionId: number;
      file: File;
      data?: {
        category?: AttachmentCategory;
        description?: string;
        is_required?: boolean;
      };
    }) => requisitionAttachmentService.upload(requisitionId, file, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requisition-attachments', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['requisition', variables.requisitionId] });
      success(`File "${data.file_name}" uploaded successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to upload attachment');
    },
  });
};

export const useUpdateAttachment = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({
      requisitionId,
      attachmentId,
      data,
    }: {
      requisitionId: number;
      attachmentId: number;
      data: {
        category?: AttachmentCategory;
        description?: string;
        is_required?: boolean;
      };
    }) => requisitionAttachmentService.update(requisitionId, attachmentId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requisition-attachments', variables.requisitionId] });
      queryClient.invalidateQueries({
        queryKey: ['requisition-attachment', variables.requisitionId, variables.attachmentId],
      });
      queryClient.invalidateQueries({ queryKey: ['requisition', variables.requisitionId] });
      success(`Attachment "${data.file_name}" updated successfully`);
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to update attachment');
    },
  });
};

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ requisitionId, attachmentId }: { requisitionId: number; attachmentId: number }) =>
      requisitionAttachmentService.delete(requisitionId, attachmentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requisition-attachments', variables.requisitionId] });
      queryClient.invalidateQueries({ queryKey: ['requisition', variables.requisitionId] });
      success('Attachment deleted successfully');
    },
    onError: (err: any) => {
      error(err?.response?.data?.message || 'Failed to delete attachment');
    },
  });
};

// ============================================
// SERVICE-SPECIFIC MUTATIONS
// ============================================

/**
 * Hook for creating a service requisition (LSO)
 * Pre-fills requisition_type and procurement_type as 'services'
 */
export const useCreateServiceRequisition = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateRequisitionData) => {
      // Ensure service-specific fields are set
      const serviceData: CreateRequisitionData = {
        ...data,
        requisition_type: 'services',
        procurement_type: 'services',
      };
      return requisitionService.create(serviceData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [REQUISITIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['service-requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['my-requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['requisition-stats'] });
      queryClient.invalidateQueries({ queryKey: ['my-requisition-stats'] });
      queryClient.invalidateQueries({ queryKey: ['requisitions-for-lso'] });

      if (data.service_category) {
        queryClient.invalidateQueries({ queryKey: ['requisitions-by-category', data.service_category] });
      }

      success(`Service requisition "${data.reference_number}" created successfully`);
    },
    onError: (err: any) => {
      let errorMessage = 'Failed to create service requisition';

      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.errors) {
        const errors = err.response.data.errors;
        const messages: string[] = [];
        Object.values(errors).forEach((value) => {
          if (Array.isArray(value)) {
            messages.push(...value);
          } else if (typeof value === 'string') {
            messages.push(value);
          }
        });
        errorMessage = messages.join(', ') || 'Validation failed';
      }

      error(errorMessage);
    },
  });
};

/**
 * Hook for creating a goods requisition (LPO)
 * Pre-fills requisition_type and procurement_type as 'goods'
 */
export const useCreateGoodsRequisition = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateRequisitionData) => {
      // Ensure goods-specific fields are set
      const goodsData: CreateRequisitionData = {
        ...data,
        requisition_type: 'goods',
        procurement_type: 'goods',
      };
      return requisitionService.create(goodsData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [REQUISITIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['goods-requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['my-requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['requisition-stats'] });
      queryClient.invalidateQueries({ queryKey: ['my-requisition-stats'] });
      queryClient.invalidateQueries({ queryKey: ['requisitions-for-lpo'] });

      success(`Goods requisition "${data.reference_number}" created successfully`);
    },
    onError: (err: any) => {
      let errorMessage = 'Failed to create goods requisition';

      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.errors) {
        const errors = err.response.data.errors;
        const messages: string[] = [];
        Object.values(errors).forEach((value) => {
          if (Array.isArray(value)) {
            messages.push(...value);
          } else if (typeof value === 'string') {
            messages.push(value);
          }
        });
        errorMessage = messages.join(', ') || 'Validation failed';
      }

      error(errorMessage);
    },
  });
};

// ============================================
// EXPORT ALL MUTATIONS
// ============================================

export const useRequisitionMutations = () => {
  return {
    create: useCreateRequisition(),
    createService: useCreateServiceRequisition(),
    createGoods: useCreateGoodsRequisition(),
    update: useUpdateRequisition(),
    delete: useDeleteRequisition(),
    submit: useSubmitRequisition(),
    return: useReturnRequisition(),
    cancel: useCancelRequisition(),
    adminForceApprove: useAdminForceApprove(),
    adminForceDecline: useAdminForceDecline(),
    adminForceReturn: useAdminForceReturn(),
    adminAssignApprover: useAdminAssignApprover(),
    uploadAttachment: useUploadAttachment(),
    updateAttachment: useUpdateAttachment(),
    deleteAttachment: useDeleteAttachment(),
  };
};
