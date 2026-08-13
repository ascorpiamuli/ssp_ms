import { APPROVER_ROLES, APPROVABLE_STATUSES, FINAL_STATES } from './constants';
import { isRequisitionDeclined, isRequisitionReturned, hasDeclinedApproval, hasReturnedApproval } from './helpers';

export const usePermissions = (requisition: any, user: any, userRoles: string[]) => {
  const isDeclined = requisition ? isRequisitionDeclined(requisition.status) || hasDeclinedApproval(requisition.approvals || []) : false;
  const isReturned = requisition ? isRequisitionReturned(requisition.status) || hasReturnedApproval(requisition.approvals || []) : false;
  const isFinalState = requisition ? FINAL_STATES.includes(requisition.status) : false;
  const isEmergency = requisition?.type === 'emergency';

  const hasUserApproved = () => {
    if (!requisition || !user || isDeclined) return false;
    const userApprovalRole = userRoles.find(role =>
      ['HOD', 'ACCOUNTANT', 'HEAD OF INSTITUTION', 'FINAL_APPROVER'].includes(role)
    );
    if (!userApprovalRole) return false;
    const approval = requisition.approvals?.find((a: any) =>
      a.level === userApprovalRole.toLowerCase() && a.status === 'approved'
    );
    return !!approval;
  };

  const canEdit = requisition?.is_editable && !isDeclined && !isReturned || false;
  const canSubmit = (requisition?.status === 'draft' || requisition?.status === 'returned' || requisition?.status === 'revised') && !isDeclined;
  const canCancel = (requisition?.status === 'draft' || requisition?.status === 'submitted' || requisition?.status === 'returned' || requisition?.status === 'revised') && !isDeclined;
  const canDelete = requisition?.status === 'draft' && !isDeclined;

  const canReturn = () => {
    if (!requisition || isDeclined || isReturned) return false;
    if (!APPROVABLE_STATUSES.includes(requisition.status)) return false;
    const hasApproverRole = userRoles.some(role => APPROVER_ROLES.includes(role));
    if (!hasApproverRole) return false;
    if (requisition.user?.id === user?.id) return false;
    if (hasUserApproved()) return false;
    if (isFinalState) return false;
    return true;
  };

  const canViewProcurement = userRoles.some(role =>
    role === 'PROCUREMENT' || role === 'ACCOUNTANT' || role === 'ADMIN' || role === 'SUPER_ADMIN'
  );

  return {
    isDeclined,
    isReturned,
    isFinalState,
    isEmergency,
    hasUserApproved: hasUserApproved(),
    canEdit,
    canSubmit,
    canCancel,
    canDelete,
    canReturn: canReturn(),
    canViewProcurement,
  };
};
