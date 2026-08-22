// frontend/src/components/ui/horizontal-corner-tag.tsx

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface HorizontalCornerTagProps {
  label: string;
  color?: 'blue' | 'emerald' | 'amber' | 'gray' | 'indigo' | 'teal' | 'red' | 'purple' | 'slate' | 'gold' | 'pink' | 'orange' | 'rose';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl';
  className?: string;
  shadow?: boolean;
  animated?: boolean;
  // Custom sizing overrides
  width?: string;
  height?: string;
  fontSize?: string;
  tracking?: string;
  // Custom positioning overrides
  offsetX?: string;
  offsetY?: string;
  left?: string;
  top?: string;
  right?: string;
  bottom?: string;
  // Style variants
  variant?: 'default' | 'rounded' | 'pill' | 'sharp';
}

const colorMap = {
  blue: {
    bg: 'bg-blue-600',
    text: 'text-white',
    border: 'border-blue-400',
    shadow: 'shadow-blue-600/30',
    hover: 'hover:bg-blue-700',
  },
  emerald: {
    bg: 'bg-emerald-600',
    text: 'text-white',
    border: 'border-emerald-400',
    shadow: 'shadow-emerald-600/30',
    hover: 'hover:bg-emerald-700',
  },
  amber: {
    bg: 'bg-amber-600',
    text: 'text-white',
    border: 'border-amber-400',
    shadow: 'shadow-amber-600/30',
    hover: 'hover:bg-amber-700',
  },
  gray: {
    bg: 'bg-gray-700',
    text: 'text-white',
    border: 'border-gray-500',
    shadow: 'shadow-gray-700/30',
    hover: 'hover:bg-gray-800',
  },
  indigo: {
    bg: 'bg-indigo-600',
    text: 'text-white',
    border: 'border-indigo-400',
    shadow: 'shadow-indigo-600/30',
    hover: 'hover:bg-indigo-700',
  },
  teal: {
    bg: 'bg-teal-600',
    text: 'text-white',
    border: 'border-teal-400',
    shadow: 'shadow-teal-600/30',
    hover: 'hover:bg-teal-700',
  },
  red: {
    bg: 'bg-red-600',
    text: 'text-white',
    border: 'border-red-400',
    shadow: 'shadow-red-600/30',
    hover: 'hover:bg-red-700',
  },
  purple: {
    bg: 'bg-purple-600',
    text: 'text-white',
    border: 'border-purple-400',
    shadow: 'shadow-purple-600/30',
    hover: 'hover:bg-purple-700',
  },
  slate: {
    bg: 'bg-slate-600',
    text: 'text-white',
    border: 'border-slate-400',
    shadow: 'shadow-slate-600/30',
    hover: 'hover:bg-slate-700',
  },
  gold: {
    bg: 'bg-amber-600',
    text: 'text-white',
    border: 'border-amber-400',
    shadow: 'shadow-amber-600/30',
    hover: 'hover:bg-amber-700',
  },
  pink: {
    bg: 'bg-pink-600',
    text: 'text-white',
    border: 'border-pink-400',
    shadow: 'shadow-pink-600/30',
    hover: 'hover:bg-pink-700',
  },
  orange: {
    bg: 'bg-orange-600',
    text: 'text-white',
    border: 'border-orange-400',
    shadow: 'shadow-orange-600/30',
    hover: 'hover:bg-orange-700',
  },
  rose: {
    bg: 'bg-rose-600',
    text: 'text-white',
    border: 'border-rose-400',
    shadow: 'shadow-rose-600/30',
    hover: 'hover:bg-rose-700',
  },
};

const sizeMap = {
  xs: {
    width: 'w-[60px]',
    height: 'h-[18px]',
    fontSize: 'text-[6px]',
    tracking: 'tracking-[0.08em]',
    padding: 'px-1.5',
    offsetX: '4px',
    offsetY: '4px',
  },
  sm: {
    width: 'w-[80px]',
    height: 'h-[22px]',
    fontSize: 'text-[7px]',
    tracking: 'tracking-[0.1em]',
    padding: 'px-2',
    offsetX: '6px',
    offsetY: '6px',
  },
  default: {
    width: 'w-[100px]',
    height: 'h-[26px]',
    fontSize: 'text-[9px]',
    tracking: 'tracking-[0.12em]',
    padding: 'px-2.5',
    offsetX: '8px',
    offsetY: '8px',
  },
  lg: {
    width: 'w-[120px]',
    height: 'h-[30px]',
    fontSize: 'text-[10px]',
    tracking: 'tracking-[0.15em]',
    padding: 'px-3',
    offsetX: '10px',
    offsetY: '10px',
  },
  xl: {
    width: 'w-[140px]',
    height: 'h-[34px]',
    fontSize: 'text-[11px]',
    tracking: 'tracking-[0.18em]',
    padding: 'px-4',
    offsetX: '12px',
    offsetY: '12px',
  },
};

const variantMap = {
  default: {
    borderRadius: 'rounded',
    borderWidth: 'border',
    shadowSize: 'shadow',
  },
  rounded: {
    borderRadius: 'rounded-full',
    borderWidth: 'border',
    shadowSize: 'shadow',
  },
  pill: {
    borderRadius: 'rounded-full',
    borderWidth: 'border-2',
    shadowSize: 'shadow-lg',
  },
  sharp: {
    borderRadius: 'rounded-none',
    borderWidth: 'border',
    shadowSize: 'shadow-sm',
  },
};

export const HorizontalCornerTag = ({
  label,
  color = 'blue',
  position = 'top-left',
  size = 'default',
  className,
  shadow = true,
  animated = true,
  // Custom overrides
  width,
  height,
  fontSize,
  tracking,
  offsetX,
  offsetY,
  left,
  top,
  right,
  bottom,
  variant = 'default',
}: HorizontalCornerTagProps) => {
  const colors = colorMap[color] || colorMap.blue;
  const sizes = sizeMap[size] || sizeMap.default;
  const variantStyles = variantMap[variant] || variantMap.default;

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return {
          container: 'top-0 left-0',
          tag: `top-${offsetY || sizes.offsetY} left-${offsetX || sizes.offsetX}`,
        };
      case 'top-right':
        return {
          container: 'top-0 right-0',
          tag: `top-${offsetY || sizes.offsetY} right-${offsetX || sizes.offsetX}`,
        };
      case 'bottom-left':
        return {
          container: 'bottom-0 left-0',
          tag: `bottom-${offsetY || sizes.offsetY} left-${offsetX || sizes.offsetX}`,
        };
      case 'bottom-right':
        return {
          container: 'bottom-0 right-0',
          tag: `bottom-${offsetY || sizes.offsetY} right-${offsetX || sizes.offsetX}`,
        };
      default:
        return {
          container: 'top-0 left-0',
          tag: `top-${offsetY || sizes.offsetY} left-${offsetX || sizes.offsetX}`,
        };
    }
  };

  const posClasses = getPositionClasses();

  // Build custom position styles
  const getPositionStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {};

    if (left) styles.left = left;
    if (top) styles.top = top;
    if (right) styles.right = right;
    if (bottom) styles.bottom = bottom;

    return styles;
  };

  // Container classes
  const containerClasses = cn(
    "absolute z-20 pointer-events-none",
    posClasses.container,
  );

  // Tag classes
  const tagClasses = cn(
    "absolute flex items-center justify-center",
    "font-extrabold uppercase whitespace-nowrap",
    colors.bg,
    colors.text,
    colors.border,
    shadow && colors.shadow,
    shadow && variantStyles.shadowSize,
    animated && "transition-all duration-300 hover:scale-105",
    variantStyles.borderRadius,
    variantStyles.borderWidth,
    "border-white/20 dark:border-white/10",
    width || sizes.width,
    height || sizes.height,
    fontSize || sizes.fontSize,
    tracking || sizes.tracking,
    sizes.padding,
    posClasses.tag,
    className
  );

  return (
    <div className={containerClasses}>
      <div
        className={tagClasses}
        style={getPositionStyles()}
      >
        {label}
      </div>
    </div>
  );
};

// ============================================
// PRE-CONFIGURED HORIZONTAL TAGS
// ============================================

// Extra small for table rows
export const HorizontalXSTag = (props: Omit<HorizontalCornerTagProps, 'size'>) => (
  <HorizontalCornerTag size="xs" {...props} />
);

// Small tags
export const HorizontalTotalTag = (props: Omit<HorizontalCornerTagProps, 'label' | 'color' | 'size'>) => (
  <HorizontalCornerTag label="TOTAL" color="blue" size="sm" {...props} />
);

export const HorizontalValueTag = (props: Omit<HorizontalCornerTagProps, 'label' | 'color' | 'size'>) => (
  <HorizontalCornerTag label="VALUE" color="emerald" size="sm" {...props} />
);

export const HorizontalActiveTag = (props: Omit<HorizontalCornerTagProps, 'label' | 'color' | 'size'>) => (
  <HorizontalCornerTag label="ACTIVE" color="amber" size="sm" {...props} />
);

export const HorizontalDraftTag = (props: Omit<HorizontalCornerTagProps, 'label' | 'color' | 'size'>) => (
  <HorizontalCornerTag label="DRAFT" color="gray" size="sm" {...props} />
);

export const HorizontalIssuedTag = (props: Omit<HorizontalCornerTagProps, 'label' | 'color' | 'size'>) => (
  <HorizontalCornerTag label="ISSUED" color="indigo" size="sm" {...props} />
);

export const HorizontalDeliveredTag = (props: Omit<HorizontalCornerTagProps, 'label' | 'color' | 'size'>) => (
  <HorizontalCornerTag label="DELIVERED" color="teal" size="sm" {...props} />
);

export const HorizontalDoneTag = (props: Omit<HorizontalCornerTagProps, 'label' | 'color' | 'size'>) => (
  <HorizontalCornerTag label="DONE" color="emerald" size="sm" {...props} />
);

export const HorizontalCancelledTag = (props: Omit<HorizontalCornerTagProps, 'label' | 'color' | 'size'>) => (
  <HorizontalCornerTag label="CANCELLED" color="red" size="sm" {...props} />
);

// Large tags
export const HorizontalLuxuryTag = (props: Omit<HorizontalCornerTagProps, 'label' | 'color' | 'size'>) => (
  <HorizontalCornerTag label="LUXURY" color="gold" size="lg" {...props} />
);

export const HorizontalHighwayTag = (props: Omit<HorizontalCornerTagProps, 'label' | 'color' | 'size'>) => (
  <HorizontalCornerTag label="HIGHWAY" color="amber" size="lg" {...props} />
);

// Table status tag
export const HorizontalTableStatusTag = ({
  label,
  color = 'gray',
  ...props
}: {
  label: string;
  color?: HorizontalCornerTagProps['color'];
} & Omit<HorizontalCornerTagProps, 'label' | 'color' | 'size'>) => (
  <HorizontalCornerTag
    label={label}
    color={color}
    size="xs"
    width="w-[50px]"
    height="h-[14px]"
    fontSize="text-[5px]"
    tracking="tracking-[0.06em]"
    offsetX="2px"
    offsetY="2px"
    variant="rounded"
    {...props}
  />
);

export default HorizontalCornerTag;
