// frontend/src/components/ui/vertical-ribbon.tsx

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface VerticalRibbonProps {
  label: string;
  color?: 'emerald' | 'blue' | 'purple' | 'amber' | 'red' | 'teal' | 'indigo' | 'gray' | 'pink' | 'slate';
  position?: 'left' | 'right';
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  icon?: React.ReactNode;
}

const colorMap = {
  emerald: {
    bg: 'bg-emerald-500 dark:bg-emerald-600',
    text: 'text-white',
    border: 'border-emerald-600 dark:border-emerald-700',
    glow: 'shadow-emerald-500/30',
    hover: 'hover:bg-emerald-600 dark:hover:bg-emerald-700',
  },
  blue: {
    bg: 'bg-blue-500 dark:bg-blue-600',
    text: 'text-white',
    border: 'border-blue-600 dark:border-blue-700',
    glow: 'shadow-blue-500/30',
    hover: 'hover:bg-blue-600 dark:hover:bg-blue-700',
  },
  purple: {
    bg: 'bg-purple-500 dark:bg-purple-600',
    text: 'text-white',
    border: 'border-purple-600 dark:border-purple-700',
    glow: 'shadow-purple-500/30',
    hover: 'hover:bg-purple-600 dark:hover:bg-purple-700',
  },
  amber: {
    bg: 'bg-amber-500 dark:bg-amber-600',
    text: 'text-white',
    border: 'border-amber-600 dark:border-amber-700',
    glow: 'shadow-amber-500/30',
    hover: 'hover:bg-amber-600 dark:hover:bg-amber-700',
  },
  red: {
    bg: 'bg-red-500 dark:bg-red-600',
    text: 'text-white',
    border: 'border-red-600 dark:border-red-700',
    glow: 'shadow-red-500/30',
    hover: 'hover:bg-red-600 dark:hover:bg-red-700',
  },
  teal: {
    bg: 'bg-teal-500 dark:bg-teal-600',
    text: 'text-white',
    border: 'border-teal-600 dark:border-teal-700',
    glow: 'shadow-teal-500/30',
    hover: 'hover:bg-teal-600 dark:hover:bg-teal-700',
  },
  indigo: {
    bg: 'bg-indigo-500 dark:bg-indigo-600',
    text: 'text-white',
    border: 'border-indigo-600 dark:border-indigo-700',
    glow: 'shadow-indigo-500/30',
    hover: 'hover:bg-indigo-600 dark:hover:bg-indigo-700',
  },
  pink: {
    bg: 'bg-pink-500 dark:bg-pink-600',
    text: 'text-white',
    border: 'border-pink-600 dark:border-pink-700',
    glow: 'shadow-pink-500/30',
    hover: 'hover:bg-pink-600 dark:hover:bg-pink-700',
  },
  gray: {
    bg: 'bg-gray-500 dark:bg-gray-600',
    text: 'text-white',
    border: 'border-gray-600 dark:border-gray-700',
    glow: 'shadow-gray-500/30',
    hover: 'hover:bg-gray-600 dark:hover:bg-gray-700',
  },
  slate: {
    bg: 'bg-slate-500 dark:bg-slate-600',
    text: 'text-white',
    border: 'border-slate-600 dark:border-slate-700',
    glow: 'shadow-slate-500/30',
    hover: 'hover:bg-slate-600 dark:hover:bg-slate-700',
  },
};

const sizeMap = {
  sm: {
    padding: 'py-2 px-1.5',
    fontSize: 'text-[8px]',
    iconSize: 'h-3 w-3',
    gap: 'gap-0.5',
    letterSpacing: 'tracking-wider',
    width: 'w-7',
    borderRadius: 'rounded-r-lg',
    margin: 'mr-1.5',
  },
  default: {
    padding: 'py-3 px-2',
    fontSize: 'text-[10px]',
    iconSize: 'h-3.5 w-3.5',
    gap: 'gap-1',
    letterSpacing: 'tracking-widest',
    width: 'w-9',
    borderRadius: 'rounded-r-xl',
    margin: 'mr-2',
  },
  lg: {
    padding: 'py-4 px-2.5',
    fontSize: 'text-xs',
    iconSize: 'h-4 w-4',
    gap: 'gap-1.5',
    letterSpacing: 'tracking-widest',
    width: 'w-11',
    borderRadius: 'rounded-r-2xl',
    margin: 'mr-2.5',
  },
};

export const VerticalRibbon = ({
  label,
  color = 'emerald',
  position = 'left',
  className,
  size = 'default',
  icon,
}: VerticalRibbonProps) => {
  const colors = colorMap[color] || colorMap.gray;
  const sizes = sizeMap[size] || sizeMap.default;

  // For left position, we use negative margin to wrap around the left edge
  // For right position, we use negative margin to wrap around the right edge
  const marginClass = position === 'left' ? '-ml-3' : '-mr-3';

  return (
    <div
      className={cn(
        "absolute top-1/2 -translate-y-1/2 z-10 flex items-center",
        position === 'left' ? 'left-0' : 'right-0',
        marginClass,
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl",
          colors.bg,
          colors.text,
          colors.glow,
          colors.hover,
          sizes.padding,
          sizes.width,
          sizes.borderRadius,
          "border",
          colors.border,
        )}
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
        }}
      >
        <div className={cn(
          "flex flex-col items-center justify-center",
          sizes.gap
        )}>
          {icon && (
            <span className={cn("flex-shrink-0", sizes.iconSize)}>
              {icon}
            </span>
          )}
          <span className={cn(
            "font-bold uppercase text-center leading-tight",
            sizes.fontSize,
            sizes.letterSpacing
          )}>
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// PRE-CONFIGURED RIBBONS
// ============================================

export const StatusRibbon = ({
  status,
  size = 'default',
  position = 'left',
  className
}: {
  status: string;
  size?: 'sm' | 'default' | 'lg';
  position?: 'left' | 'right';
  className?: string;
}) => {
  const statusConfig: Record<string, { label: string; color: keyof typeof colorMap; icon: React.ReactNode }> = {
    draft: { label: 'DRAFT', color: 'gray', icon: null },
    issued: { label: 'ISSUED', color: 'blue', icon: null },
    sent: { label: 'SENT', color: 'indigo', icon: null },
    acknowledged: { label: 'ACKNOWLEDGED', color: 'purple', icon: null },
    delivered: { label: 'DELIVERED', color: 'emerald', icon: null },
    partial: { label: 'PARTIAL', color: 'amber', icon: null },
    completed: { label: 'COMPLETED', color: 'teal', icon: null },
    cancelled: { label: 'CANCELLED', color: 'red', icon: null },
    closed: { label: 'CLOSED', color: 'slate', icon: null },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <VerticalRibbon
      label={config.label}
      color={config.color}
      position={position}
      size={size}
      className={className}
      icon={config.icon}
    />
  );
};

export const DraftRibbon = (props: Partial<VerticalRibbonProps>) => (
  <VerticalRibbon label="DRAFT" color="gray" size="default" {...props} />
);

export const IssuedRibbon = (props: Partial<VerticalRibbonProps>) => (
  <VerticalRibbon label="ISSUED" color="blue" size="default" {...props} />
);

export const SentRibbon = (props: Partial<VerticalRibbonProps>) => (
  <VerticalRibbon label="SENT" color="indigo" size="default" {...props} />
);

export const DeliveredRibbon = (props: Partial<VerticalRibbonProps>) => (
  <VerticalRibbon label="DELIVERED" color="emerald" size="default" {...props} />
);

export const CompletedRibbon = (props: Partial<VerticalRibbonProps>) => (
  <VerticalRibbon label="COMPLETED" color="teal" size="default" {...props} />
);

export const CancelledRibbon = (props: Partial<VerticalRibbonProps>) => (
  <VerticalRibbon label="CANCELLED" color="red" size="default" {...props} />
);

export const PartialRibbon = (props: Partial<VerticalRibbonProps>) => (
  <VerticalRibbon label="PARTIAL" color="amber" size="default" {...props} />
);

export const ClosedRibbon = (props: Partial<VerticalRibbonProps>) => (
  <VerticalRibbon label="CLOSED" color="slate" size="default" {...props} />
);
