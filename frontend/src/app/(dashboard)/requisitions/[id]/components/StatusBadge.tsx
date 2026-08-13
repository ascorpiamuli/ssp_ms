import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { STATUS_CONFIG } from '../utils/constants';
import { isRequisitionDeclined, isRequisitionReturned } from '../utils/helpers';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'default' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'default' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    default: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2',
  };
  const isDeclined = isRequisitionDeclined(status);
  const isReturned = isRequisitionReturned(status);

  return (
    <Badge variant="outline" className={cn(
      "flex items-center font-medium transition-all rounded-full",
      config.color,
      sizeClasses[size],
      isDeclined && "line-through",
      isReturned && "animate-pulse"
    )}>
      <Icon className={cn(
        "flex-shrink-0",
        size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
      )} />
      {config.label}
    </Badge>
  );
};
