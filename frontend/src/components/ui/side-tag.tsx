// frontend/src/components/ui/side-tag.tsx

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SideTagProps {
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
  },
  blue: {
    bg: 'bg-blue-500 dark:bg-blue-600',
    text: 'text-white',
    border: 'border-blue-600 dark:border-blue-700',
    glow: 'shadow-blue-500/30',
  },
  purple: {
    bg: 'bg-purple-500 dark:bg-purple-600',
    text: 'text-white',
    border: 'border-purple-600 dark:border-purple-700',
    glow: 'shadow-purple-500/30',
  },
  amber: {
    bg: 'bg-amber-500 dark:bg-amber-600',
    text: 'text-white',
    border: 'border-amber-600 dark:border-amber-700',
    glow: 'shadow-amber-500/30',
  },
  red: {
    bg: 'bg-red-500 dark:bg-red-600',
    text: 'text-white',
    border: 'border-red-600 dark:border-red-700',
    glow: 'shadow-red-500/30',
  },
  teal: {
    bg: 'bg-teal-500 dark:bg-teal-600',
    text: 'text-white',
    border: 'border-teal-600 dark:border-teal-700',
    glow: 'shadow-teal-500/30',
  },
  indigo: {
    bg: 'bg-indigo-500 dark:bg-indigo-600',
    text: 'text-white',
    border: 'border-indigo-600 dark:border-indigo-700',
    glow: 'shadow-indigo-500/30',
  },
  pink: {
    bg: 'bg-pink-500 dark:bg-pink-600',
    text: 'text-white',
    border: 'border-pink-600 dark:border-pink-700',
    glow: 'shadow-pink-500/30',
  },
  gray: {
    bg: 'bg-gray-500 dark:bg-gray-600',
    text: 'text-white',
    border: 'border-gray-600 dark:border-gray-700',
    glow: 'shadow-gray-500/30',
  },
  slate: {
    bg: 'bg-slate-500 dark:bg-slate-600',
    text: 'text-white',
    border: 'border-slate-600 dark:border-slate-700',
    glow: 'shadow-slate-500/30',
  },
};

const sizeMap = {
  sm: {
    padding: 'px-1.5 py-0.5',
    fontSize: 'text-[7px]',
    iconSize: 'h-2 w-2',
    gap: 'gap-0.5',
    letterSpacing: 'tracking-wider',
  },
  default: {
    padding: 'px-2 py-1',
    fontSize: 'text-[9px]',
    iconSize: 'h-2.5 w-2.5',
    gap: 'gap-1',
    letterSpacing: 'tracking-widest',
  },
  lg: {
    padding: 'px-2.5 py-1.5',
    fontSize: 'text-xs',
    iconSize: 'h-3 w-3',
    gap: 'gap-1.5',
    letterSpacing: 'tracking-widest',
  },
};

export const SideTag = ({
  label,
  color = 'amber',
  position = 'left',
  size = 'default',
  className,
  icon,
}: SideTagProps) => {
  const colors = colorMap[color] || colorMap.gray;
  const sizes = sizeMap[size] || sizeMap.default;

  const positionClasses = {
    left: 'left-0 rounded-r-lg',
    right: 'right-0 rounded-l-lg',
  };

  const marginClass = position === 'left' ? '-ml-2' : '-mr-2';

  return (
    <div
      className={cn(
        "absolute top-1/2 -translate-y-1/2 z-10",
        position === 'left' ? 'left-0' : 'right-0',
        marginClass,
        className
      )}
    >
      <div
        className={cn(
          "inline-flex items-center shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-105",
          colors.bg,
          colors.text,
          colors.glow,
          sizes.padding,
          sizes.fontSize,
          positionClasses[position],
          "border",
          colors.border,
        )}
      >
        {icon && (
          <span className={cn("flex-shrink-0", sizes.iconSize)}>
            {icon}
          </span>
        )}
        <span className={cn(
          "font-bold uppercase whitespace-nowrap",
          sizes.letterSpacing
        )}>
          {label}
        </span>
      </div>
    </div>
  );
};
