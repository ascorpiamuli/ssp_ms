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

export interface StartProcurementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisition: any;
  comment: string;
  setComment: (comment: string) => void;
  onConfirm: () => void;
}

export const StartProcurementDialog: React.FC<StartProcurementDialogProps> = ({
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
          <DialogTitle>Start Procurement</DialogTitle>
          <DialogDescription>
            Start the procurement process for "{requisition?.reference_number}".
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">This will:</p>
            <ul className="text-sm text-blue-600 dark:text-blue-300 list-disc list-inside mt-1 space-y-1">
              <li>Create a procurement record</li>
              <li>Generate a Quotation Request (QTN)</li>
              <li>Notify relevant suppliers</li>
              <li>Start the procurement workflow</li>
            </ul>
          </div>
          <div className="space-y-2">
            <Label htmlFor="procurement-comment">Comment (Optional)</Label>
            <Textarea
              id="procurement-comment"
              placeholder="Add any initial notes for procurement..."
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
          <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
            Start Procurement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
