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

export interface CompleteProcurementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisition: any;
  comment: string;
  setComment: (comment: string) => void;
  onConfirm: () => void;
}

export const CompleteProcurementDialog: React.FC<CompleteProcurementDialogProps> = ({
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
          <DialogTitle>Complete Procurement</DialogTitle>
          <DialogDescription>
            Mark the procurement for "{requisition?.reference_number}" as complete.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Completing procurement will:</p>
            <ul className="text-sm text-emerald-600 dark:text-emerald-300 list-disc list-inside mt-1 space-y-1">
              <li>Mark all stages as complete</li>
              <li>Finalize the procurement record</li>
              <li>Close the procurement workflow</li>
            </ul>
          </div>
          <div className="space-y-2">
            <Label htmlFor="complete-comment">Completion Comment (Optional)</Label>
            <Textarea
              id="complete-comment"
              placeholder="Add any final notes..."
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
          <Button onClick={onConfirm} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">
            Complete Procurement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
