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

export interface ReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisition: any;
  comment: string;
  setComment: (comment: string) => void;
  onConfirm: () => void;
}

export const ReturnDialog: React.FC<ReturnDialogProps> = ({
  open,
  onOpenChange,
  requisition,
  comment,
  setComment,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl">
        <DialogHeader>
          <DialogTitle>Return Requisition</DialogTitle>
          <DialogDescription>
            Return "{requisition?.reference_number}" for revision.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="return-reason">Reason for Return <span className="text-red-500">*</span></Label>
            <Textarea
              id="return-reason"
              placeholder="Explain why this requisition needs revision..."
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
          <Button onClick={onConfirm} disabled={!comment.trim()} className="bg-amber-600 hover:bg-amber-700 rounded-xl">
            Return
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
