// frontend/src/components/ui/wrapped-corner-tag.tsx

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface WrappedCornerTagProps {
  label: string;
  color?: 'blue' | 'emerald' | 'amber' | 'gray' | 'indigo' | 'teal' | 'red' | 'purple' | 'slate' | 'gold' | 'pink' | 'orange' | 'rose';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: 'sm' | 'default' | 'lg' | 'xs' | 'xl';
  className?: string;
  shadow?: boolean;
  animated?: boolean;
  // Custom sizing overrides
  width?: string;
  height?: string;
  fontSize?: string;
  tracking?: string;
  containerWidth?: string;
  containerHeight?: string;
  offsetX?: string;
  offsetY?: string;
  // Custom positioning overrides
  left?: string;
  top?: string;
  right?: string;
  bottom?: string;
  transform?: string;
  transformOrigin?: string;
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

// Predefined size configurations
const sizeMap = {
  xs: {
    width: 'w-[60px]',
    height: 'h-[18px]',
    fontSize: 'text-[6px]',
    tracking: 'tracking-[0.08em]',
    container: 'w-[70px] h-[70px]',
    offsetX: '10px',
    offsetY: '22px',
    translate: 'translateX(-26%) translateY(-28%)',
  },
  sm: {
    width: 'w-[80px]',
    height: 'h-[22px]',
    fontSize: 'text-[7px]',
    tracking: 'tracking-[0.12em]',
    container: 'w-[90px] h-[90px]',
    offsetX: '12px',
    offsetY: '28px',
    translate: 'translateX(-28%) translateY(-32%)',
  },
  default: {
    width: 'w-[120px]',
    height: 'h-[28px]',
    fontSize: 'text-[9px]',
    tracking: 'tracking-[0.15em]',
    container: 'w-[130px] h-[130px]',
    offsetX: '15px',
    offsetY: '40px',
    translate: 'translateX(-29%) translateY(-34%)',
  },
  lg: {
    width: 'w-[150px]',
    height: 'h-[32px]',
    fontSize: 'text-[11px]',
    tracking: 'tracking-[0.2em]',
    container: 'w-[160px] h-[160px]',
    offsetX: '20px',
    offsetY: '50px',
    translate: 'translateX(-30%) translateY(-35%)',
  },
  xl: {
    width: 'w-[180px]',
    height: 'h-[38px]',
    fontSize: 'text-[13px]',
    tracking: 'tracking-[0.25em]',
    container: 'w-[190px] h-[190px]',
    offsetX: '25px',
    offsetY: '60px',
    translate: 'translateX(-32%) translateY(-36%)',
  },
};

// Define a type for position config
interface PositionConfig {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  rotation: string;
  borderRadius: string;
  borderSide: string;
}

const positionMap: Record<string, PositionConfig> = {
  'top-left': {
    top: 'top-0',
    left: 'left-0',
    rotation: '-45deg',
    borderRadius: 'rounded-tl-none rounded-tr-lg rounded-br-lg rounded-bl-none',
    borderSide: 'border-t-0 border-l-0',
  },
  'top-right': {
    top: 'top-0',
    right: 'right-0',
    rotation: '45deg',
    borderRadius: 'rounded-tr-none rounded-br-lg rounded-bl-lg rounded-tl-none',
    borderSide: 'border-t-0 border-r-0',
  },
  'bottom-left': {
    bottom: 'bottom-0',
    left: 'left-0',
    rotation: '45deg',
    borderRadius: 'rounded-bl-none rounded-tl-lg rounded-tr-lg rounded-br-none',
    borderSide: 'border-b-0 border-l-0',
  },
  'bottom-right': {
    bottom: 'bottom-0',
    right: 'right-0',
    rotation: '-45deg',
    borderRadius: 'rounded-br-none rounded-tr-lg rounded-tl-lg rounded-bl-none',
    borderSide: 'border-b-0 border-r-0',
  },
};

export const WrappedCornerTag = ({
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
  containerWidth,
  containerHeight,
  offsetX,
  offsetY,
  left,
  top,
  right,
  bottom,
  transform,
  transformOrigin,
}: WrappedCornerTagProps) => {
  const colors = colorMap[color] || colorMap.blue;
  const sizes = sizeMap[size] || sizeMap.default;
  const pos = positionMap[position] || positionMap['top-left'];

  // Build position styles based on position prop with custom overrides
  const getPositionStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
    };

    // Use custom offset values or fallback to size defaults
    const xOffset = offsetX || sizes.offsetX;
    const yOffset = offsetY || sizes.offsetY;
    const defaultTransform = sizes.translate;

    switch (position) {
      case 'top-left':
        return {
          ...baseStyles,
          transform: transform || `rotate(-45deg) ${defaultTransform}`,
          transformOrigin: transformOrigin || 'top left',
          left: left || xOffset,
          top: top || yOffset,
        };
      case 'top-right':
        return {
          ...baseStyles,
          transform: transform || `rotate(45deg) translateX(29%) translateY(-34%)`,
          transformOrigin: transformOrigin || 'top right',
          right: right || xOffset,
          top: top || yOffset,
        };
      case 'bottom-left':
        return {
          ...baseStyles,
          transform: transform || `rotate(45deg) translateX(-29%) translateY(34%)`,
          transformOrigin: transformOrigin || 'bottom left',
          left: left || xOffset,
          bottom: bottom || yOffset,
        };
      case 'bottom-right':
        return {
          ...baseStyles,
          transform: transform || `rotate(-45deg) translateX(29%) translateY(34%)`,
          transformOrigin: transformOrigin || 'bottom right',
          right: right || xOffset,
          bottom: bottom || yOffset,
        };
      default:
        return {
          ...baseStyles,
          transform: transform || `rotate(-45deg) ${defaultTransform}`,
          transformOrigin: transformOrigin || 'top left',
          left: left || xOffset,
          top: top || yOffset,
        };
    }
  };

  // Container classes with custom overrides
  const containerClasses = cn(
    "absolute z-20 overflow-hidden pointer-events-none",
    pos.top,
    pos.left,
    pos.right,
    pos.bottom,
    containerWidth || sizes.container,
    containerHeight || sizes.container,
  );

  // Tag classes with custom overrides
  const tagClasses = cn(
    "absolute flex items-center justify-center",
    "font-extrabold uppercase",
    colors.bg,
    colors.text,
    colors.border,
    shadow && colors.shadow,
    animated && "transition-all duration-300 hover:scale-105",
    width || sizes.width,
    height || sizes.height,
    fontSize || sizes.fontSize,
    tracking || sizes.tracking,
    pos.borderRadius,
    pos.borderSide,
    "border-2 border-white/30 dark:border-white/20 shadow-lg",
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
// PRE-CONFIGURED TAGS FOR COMMON USE CASES
// ============================================

// Extra small for table rows
export const XSTag = (props: Omit<WrappedCornerTagProps, 'size'>) => (
  <WrappedCornerTag size="xs" {...props} />
);

// Small tags
export const TotalTag = (props: Omit<WrappedCornerTagProps, 'label' | 'color' | 'size'>) => (
  <WrappedCornerTag label="TOTAL" color="blue" size="sm" {...props} />
);

export const ValueTag = (props: Omit<WrappedCornerTagProps, 'label' | 'color' | 'size'>) => (
  <WrappedCornerTag label="VALUE" color="emerald" size="sm" {...props} />
);

export const ActiveTag = (props: Omit<WrappedCornerTagProps, 'label' | 'color' | 'size'>) => (
  <WrappedCornerTag label="ACTIVE" color="amber" size="sm" {...props} />
);

export const DraftTag = (props: Omit<WrappedCornerTagProps, 'label' | 'color' | 'size'>) => (
  <WrappedCornerTag label="DRAFT" color="gray" size="sm" {...props} />
);

export const IssuedTag = (props: Omit<WrappedCornerTagProps, 'label' | 'color' | 'size'>) => (
  <WrappedCornerTag label="ISSUED" color="indigo" size="sm" {...props} />
);

export const DeliveredTag = (props: Omit<WrappedCornerTagProps, 'label' | 'color' | 'size'>) => (
  <WrappedCornerTag label="DELIVERED" color="teal" size="sm" {...props} />
);

export const DoneTag = (props: Omit<WrappedCornerTagProps, 'label' | 'color' | 'size'>) => (
  <WrappedCornerTag label="DONE" color="emerald" size="sm" {...props} />
);

export const CancelledTag = (props: Omit<WrappedCornerTagProps, 'label' | 'color' | 'size'>) => (
  <WrappedCornerTag label="CANCELLED" color="red" size="sm" {...props} />
);

// Large tags
export const LuxuryTag = (props: Omit<WrappedCornerTagProps, 'label' | 'color' | 'size'>) => (
  <WrappedCornerTag label="LUXURY" color="gold" size="lg" {...props} />
);

export const HighwayTag = (props: Omit<WrappedCornerTagProps, 'label' | 'color' | 'size'>) => (
  <WrappedCornerTag label="HIGHWAY" color="amber" size="lg" {...props} />
);

// Extra small tags for table rows - with required label
export const TableStatusTag = ({
  label,
  color = 'gray',
  ...props
}: {
  label: string;
  color?: WrappedCornerTagProps['color'];
} & Omit<WrappedCornerTagProps, 'label' | 'color' | 'size'>) => (
  <WrappedCornerTag
    label={label}
    color={color}
    size="xs"
    width="w-[55px]"
    height="h-[16px]"
    fontSize="text-[5px]"
    tracking="tracking-[0.06em]"
    offsetX="6px"
    offsetY="16px"
    {...props}
  />
);

export default WrappedCornerTag;
