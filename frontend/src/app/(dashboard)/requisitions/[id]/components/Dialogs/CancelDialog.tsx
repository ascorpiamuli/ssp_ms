'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface CancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisition: any;
  comment: string;
  setComment: (comment: string) => void;
  hasProcurementStarted: boolean;
  isProcurementComplete: boolean;
  onConfirm: () => void;
}

export const CancelDialog: React.FC<CancelDialogProps> = ({
  open,
  onOpenChange,
  requisition,
  comment,
  setComment,
  hasProcurementStarted,
  isProcurementComplete,
  onConfirm,
}) => {
  const isProcurementCancel = hasProcurementStarted && !isProcurementComplete;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl">
        <DialogHeader>
          <DialogTitle>
            {isProcurementCancel ? 'Cancel Procurement' : 'Cancel Requisition'}
          </DialogTitle>
          <DialogDescription>
            {isProcurementCancel
              ? `Are you sure you want to cancel procurement for "${requisition?.reference_number}"?`
              : `Are you sure you want to cancel requisition "${requisition?.reference_number}"?`}
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Reason for Cancellation <span className="text-red-500">*</span></Label>
            <Textarea
              id="cancel-reason"
              placeholder={isProcurementCancel ? "Explain why you're cancelling procurement..." : "Explain why you're cancelling this requisition..."}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="rounded-xl"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 rounded-xl"
            disabled={!comment.trim()}
          >
            {isProcurementCancel ? 'Cancel Procurement' : 'Cancel Requisition'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
