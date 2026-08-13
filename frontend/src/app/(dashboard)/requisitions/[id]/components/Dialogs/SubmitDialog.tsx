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
import { cn } from '@/lib/utils';

export interface SubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisition: any;
  comment: string;
  setComment: (comment: string) => void;
  isReturned: boolean;
  isEmergency: boolean;
  onConfirm: () => void;
}

export const SubmitDialog: React.FC<SubmitDialogProps> = ({
  open,
  onOpenChange,
  requisition,
  comment,
  setComment,
  isReturned,
  isEmergency,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl">
        <DialogHeader>
          <DialogTitle>{isReturned ? 'Resubmit Requisition' : 'Submit Requisition'}</DialogTitle>
          <DialogDescription>
            {isReturned ? 'Resubmit' : 'Submit'} "{requisition?.reference_number}" for approval.
            {isReturned && ' Please ensure all requested changes have been made.'}
            {isEmergency && ' This is an emergency requisition and will follow fast-track approval.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isReturned && requisition?.return_reason && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Return Reason:</p>
              <p className="text-sm text-amber-600 dark:text-amber-300">{requisition.return_reason}</p>
            </div>
          )}
          {isEmergency && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">🚨 Emergency Requisition</p>
              <p className="text-sm text-red-600 dark:text-red-300">This will follow the fast-track approval process.</p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="submit-comment">Comment (Optional)</Label>
            <Textarea
              id="submit-comment"
              placeholder={isReturned ? "Add a comment about the changes made..." : "Add a comment for the approver..."}
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
          <Button onClick={onConfirm} className={cn(
            "rounded-xl",
            isEmergency ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700" :
              "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          )}>
            {isReturned ? 'Resubmit' : 'Submit'}
            {isEmergency && ' 🚨'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitDialog;
