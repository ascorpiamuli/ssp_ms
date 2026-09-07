// ============================================
// STATS CARDS - Flexible Premium Design with Counter Animation
// ============================================

import { Card, CardContent } from "@/components/ui/card";
import {
  Package,
  DollarSign,
  Truck,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Award,
  Clock,
  Download,
  FileCheck,
  Building2,
  Users,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ShoppingCart,
  Calendar,
  Star,
  Zap,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Rocket,
  Gem,
  Crown,
  Flame,
  Leaf,
  Shield,
  Briefcase,
  Layers,
  Grid,
  List,
  Filter,
  Eye,
  Bell,
  MessageSquare,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Flag,
  Camera,
  Video,
  Music,
  Code,
  Cloud,
  Database,
  Server,
  Wifi,
  Bluetooth,
  Battery,
  Lightbulb,
  HeartPulse,
  Brain,
  Cpu,
  HardDrive,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Speaker,
  Mic,
  Phone,
  Mail,
  Globe,
  MapPin,
  Clock as ClockIcon,
  User,
  Settings,
  Menu,
  MoreHorizontal,
  MoreVertical,
  BarChart,
  BarChart2,
  BarChart4,
  ChartBar,
  ChartLine,
  ChartArea,
  ChartPie,
  ChartScatter,
  ChartBarStacked,
  ChartColumnStacked,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WrappedCornerTag } from "@/components/ui/wrapped-corner-tag";
import HorizontalCornerTag from "@/components/ui/horizontal-corner-tag";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LucideIcon } from "lucide-react";

// ============================================
// TYPES
// ============================================

export interface StatCardItem {
  label: string;
  value: number | string;
  icon?: LucideIcon | string;
  tagLabel?: string;
  tagColor?: 'blue' | 'emerald' | 'amber' | 'gray' | 'indigo' | 'teal' | 'red' | 'purple' | 'slate' | 'gold' | 'pink' | 'orange' | 'rose';
  cardBg?: string;
  iconBg?: string;
  iconColor?: string;
  borderColor?: string;
  textColor?: string;
  valueColor?: string;
  isCurrency?: boolean;
  subtitle?: string;
  href?: string;
  onClick?: () => void;
  tooltip?: string;
  suffix?: string;
  prefix?: string;
  compact?: boolean;
  iconComponent?: React.ReactNode;
}

interface StatsCardsProps {
  stats: StatCardItem[];
  isLoading?: boolean;
  variant?: 'compact' | 'default' | 'detailed';
  showIcons?: boolean;
  columns?: 2 | 3 | 4 | 5 | 6 | 7 | 8;
  animateCounter?: boolean;
  counterDuration?: number;
  formatCompact?: boolean;
  renderAs?: 'cards' | 'grid' | 'list';
  className?: string;
  // New props for tag orientation
  tagOrientation?: 'wrapped' | 'horizontal' | 'none';
  tagPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  tagSize?: 'xs' | 'sm' | 'default' | 'lg' | 'xl';
  tagVariant?: 'default' | 'rounded' | 'pill' | 'sharp';
  tagAnimated?: boolean;
  // Default icon for when no tag is shown
  defaultIcon?: LucideIcon | string;
}

// ============================================
// HELPERS
// ============================================

// Format number with abbreviations (K, M, B)
const formatCompactNumber = (num: number): string => {
  if (num === 0) return '0';
  if (!num) return '0';

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1_000_000_000) {
    return sign + (absNum / 1_000_000_000).toFixed(1) + 'B';
  }
  if (absNum >= 1_000_000) {
    return sign + (absNum / 1_000_000).toFixed(1) + 'M';
  }
  if (absNum >= 1_000) {
    return sign + (absNum / 1_000).toFixed(1) + 'K';
  }
  return sign + absNum.toString();
};

// Format currency with abbreviations
const formatCompactCurrency = (amount: number): string => {
  if (amount === 0) return 'KES 0';
  if (!amount) return 'KES 0';

  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (absAmount >= 1_000_000_000) {
    return `${sign}KES ${(absAmount / 1_000_000_000).toFixed(1)}B`;
  }
  if (absAmount >= 1_000_000) {
    return `${sign}KES ${(absAmount / 1_000_000).toFixed(1)}M`;
  }
  if (absAmount >= 1_000) {
    return `${sign}KES ${(absAmount / 1_000).toFixed(1)}K`;
  }
  return `${sign}KES ${absAmount}`;
};

// Format full number with commas
const formatFullNumber = (num: number): string => {
  return num.toLocaleString();
};

// Format full currency
const formatFullCurrency = (amount: number): string => {
  return `KES ${amount.toLocaleString()}`;
};

// Get icon component
const getIconComponent = (icon: LucideIcon | string | undefined): LucideIcon | null => {
  if (!icon) return null;
  if (typeof icon === 'string') {
    const iconMap: Record<string, LucideIcon> = {
      Package, DollarSign, Truck, FileText, Send, CheckCircle, XCircle,
      Award, Clock, Download, FileCheck, Building2, Users, TrendingUp,
      TrendingDown, AlertCircle, ShoppingCart, Calendar, Star, Zap,
      Activity, BarChart3, PieChart, LineChart, Target, Rocket, Gem,
      Crown, Flame, Leaf, Shield, Briefcase, Layers, Grid, List,
      Filter, Eye, Bell, MessageSquare, Heart, ThumbsUp, ThumbsDown,
      Share2, Bookmark, Flag, Camera, Video, Music, Code, Cloud,
      Database, Server, Wifi, Bluetooth, Battery, Lightbulb, HeartPulse,
      Brain, Cpu, HardDrive, Monitor, Smartphone, Tablet, Laptop,
      Headphones, Speaker, Mic, Phone, Mail, Globe, MapPin, ClockIcon,
      User, Settings, Menu, MoreHorizontal, MoreVertical,
      BarChart, BarChart2, BarChart4, ChartBar, ChartLine, ChartArea,
      ChartPie, ChartScatter, ChartBarStacked, ChartColumnStacked,
    };
    return iconMap[icon] || null;
  }
  return icon as LucideIcon || null;
};

// ============================================
// COMPONENT
// ============================================

const StatsCards = ({
  stats,
  isLoading = false,
  variant = 'default',
  showIcons = true,
  columns = 8,
  animateCounter = true,
  counterDuration = 1200,
  formatCompact = true,
  renderAs = 'cards',
  className,
  tagOrientation = 'wrapped',
  tagPosition = 'top-left',
  tagSize = 'default',
  tagVariant = 'default',
  tagAnimated = true,
  defaultIcon = BarChart,
}: StatsCardsProps) => {
  // Column mapping
  const columnClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    7: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-7',
    8: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-8',
  };

  // Size mapping based on variant - OPTIMIZED SIZES (smaller default)
  const sizeMap = {
    compact: {
      cardHeight: 'h-[90px]',
      padding: 'p-3 pt-3',
      labelSize: 'text-[10px]',
      valueSize: 'text-xl',
      iconSize: 'h-3.5 w-3.5',
      iconPadding: 'p-1.5',
      tagSize: 'sm' as const,
      subtitleSize: 'text-[9px]',
      gap: 'gap-2',
    },
    default: {
      cardHeight: 'h-[110px]',
      padding: 'p-4 pt-4',
      labelSize: 'text-[11px]',
      valueSize: 'text-2xl',
      iconSize: 'h-4 w-4',
      iconPadding: 'p-2',
      tagSize: 'default' as const,
      subtitleSize: 'text-[10px]',
      gap: 'gap-3',
    },
    detailed: {
      cardHeight: 'h-[130px]',
      padding: 'p-5 pt-5',
      labelSize: 'text-[12px]',
      valueSize: 'text-3xl',
      iconSize: 'h-5 w-5',
      iconPadding: 'p-2.5',
      tagSize: 'lg' as const,
      subtitleSize: 'text-[11px]',
      gap: 'gap-4',
    },
  };

  const size = sizeMap[variant] || sizeMap.default;

  // Map tag size from component size to tag size
  const getTagSize = (): 'xs' | 'sm' | 'default' | 'lg' | 'xl' => {
    if (tagSize) return tagSize;
    switch (variant) {
      case 'compact': return 'sm';
      case 'detailed': return 'lg';
      default: return 'default';
    }
  };

  // Default colors if not provided
  const defaultColors = [
    { bg: 'bg-gradient-to-br from-blue-50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10', iconBg: 'bg-blue-100 dark:bg-blue-900/40', iconColor: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800/50', text: 'text-blue-700 dark:text-blue-300', value: 'text-blue-900 dark:text-blue-100' },
    { bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/30 dark:from-emerald-950/20 dark:to-emerald-900/10', iconBg: 'bg-emerald-100 dark:bg-emerald-900/40', iconColor: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/50', text: 'text-emerald-700 dark:text-emerald-300', value: 'text-emerald-900 dark:text-emerald-100' },
    { bg: 'bg-gradient-to-br from-purple-50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10', iconBg: 'bg-purple-100 dark:bg-purple-900/40', iconColor: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800/50', text: 'text-purple-700 dark:text-purple-300', value: 'text-purple-900 dark:text-purple-100' },
    { bg: 'bg-gradient-to-br from-amber-50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10', iconBg: 'bg-amber-100 dark:bg-amber-900/40', iconColor: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800/50', text: 'text-amber-700 dark:text-amber-300', value: 'text-amber-900 dark:text-amber-100' },
    { bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100/30 dark:from-indigo-950/20 dark:to-indigo-900/10', iconBg: 'bg-indigo-100 dark:bg-indigo-900/40', iconColor: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800/50', text: 'text-indigo-700 dark:text-indigo-300', value: 'text-indigo-900 dark:text-indigo-100' },
    { bg: 'bg-gradient-to-br from-teal-50 to-teal-100/30 dark:from-teal-950/20 dark:to-teal-900/10', iconBg: 'bg-teal-100 dark:bg-teal-900/40', iconColor: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800/50', text: 'text-teal-700 dark:text-teal-300', value: 'text-teal-900 dark:text-teal-100' },
    { bg: 'bg-gradient-to-br from-rose-50 to-rose-100/30 dark:from-rose-950/20 dark:to-rose-900/10', iconBg: 'bg-rose-100 dark:bg-rose-900/40', iconColor: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800/50', text: 'text-rose-700 dark:text-rose-300', value: 'text-rose-900 dark:text-rose-100' },
    { bg: 'bg-gradient-to-br from-cyan-50 to-cyan-100/30 dark:from-cyan-950/20 dark:to-cyan-900/10', iconBg: 'bg-cyan-100 dark:bg-cyan-900/40', iconColor: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800/50', text: 'text-cyan-700 dark:text-cyan-300', value: 'text-cyan-900 dark:text-cyan-100' },
  ];

  // Render the appropriate tag component or default icon
  const renderTagOrIcon = (stat: StatCardItem) => {
    if (tagOrientation === 'none') {
      // Show default icon when no tag - placed inside the card on the left
      const DefaultIcon = getIconComponent(defaultIcon);
      if (DefaultIcon) {
        return (
          <div className="absolute top-3 left-3 z-20">
            <div className={cn(
              "p-2 rounded-xl shadow-md",
              "bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-500/15 dark:to-indigo-500/15",
              "border border-white/30 dark:border-gray-700/50",
              "text-blue-600 dark:text-blue-400",
              "backdrop-blur-sm"
            )}>
              <DefaultIcon className="h-5 w-5" />
            </div>
          </div>
        );
      }
      return null;
    }

    if (!stat.tagLabel) return null;

    const tagProps = {
      label: stat.tagLabel,
      color: stat.tagColor || 'blue',
      position: tagPosition,
      size: getTagSize(),
      animated: tagAnimated,
    };

    if (tagOrientation === 'horizontal') {
      return <HorizontalCornerTag {...tagProps} variant={tagVariant} />;
    }

    // Default: wrapped (angled)
    return <WrappedCornerTag {...tagProps} />;
  };

  if (isLoading) {
    return (
      <div className={cn("grid gap-3", columnClasses[columns as keyof typeof columnClasses] || columnClasses[8], className)}>
        {Array.from({ length: Math.min(stats.length || columns, 8) }).map((_, i) => (
          <Card key={i} className="animate-pulse border-0 shadow-sm rounded-2xl bg-gray-100 dark:bg-gray-800 h-[110px]">
            <CardContent className="p-4">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No statistics available
      </div>
    );
  }

  // Custom Animated Value component
  const AnimatedValue = ({
    value,
    isCurrency = false,
    compact = true,
    prefix = '',
    suffix = '',
  }: {
    value: number | string;
    isCurrency?: boolean;
    compact?: boolean;
    prefix?: string;
    suffix?: string;
  }) => {
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) || 0 : value;

    const { displayValue, fullValue, elementRef } = useCompactCounter(
      numValue,
      counterDuration,
      animateCounter,
      isCurrency,
      formatCompact && compact
    );

    const shouldShowTooltip = formatCompact && compact && numValue >= 1000;

    if (!shouldShowTooltip) {
      return <span ref={elementRef} className="font-bold">{prefix}{displayValue}{suffix}</span>;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              ref={elementRef}
              className="cursor-help border-b-2 border-dotted border-gray-400/30 hover:border-gray-400/60 transition-colors font-bold"
            >
              {prefix}{displayValue}{suffix}
            </span>
          </TooltipTrigger>
          <TooltipContent className="rounded-xl bg-gray-900 dark:bg-gray-800 border-gray-700 shadow-2xl px-4 py-2">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-0.5">Full Amount</p>
              <p className="text-lg font-bold text-white">{prefix}{fullValue}{suffix}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Custom hook for animated counter
  const useCompactCounter = (
    target: number,
    duration: number = 1000,
    shouldAnimate: boolean = true,
    isCurrency: boolean = false,
    formatCompact: boolean = true
  ) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [elementRef, setElementRef] = useState<HTMLSpanElement | null>(null);

    useEffect(() => {
      if (!shouldAnimate) {
        setCount(target);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      if (elementRef) {
        observer.observe(elementRef);
      }

      return () => observer.disconnect();
    }, [shouldAnimate, target, elementRef]);

    useEffect(() => {
      if (!isVisible || !shouldAnimate) return;

      const startTime = performance.now();
      const numericTarget = target;

      const animateCounter = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const eased = 1 - Math.pow(1 - progress, 3);
        const currentValue = eased * numericTarget;

        setCount(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animateCounter);
        } else {
          setCount(numericTarget);
        }
      };

      requestAnimationFrame(animateCounter);
    }, [isVisible, target, duration, shouldAnimate]);

    const getDisplayValue = () => {
      const roundedCount = Math.round(count);

      if (!formatCompact) {
        if (isCurrency) {
          return formatFullCurrency(roundedCount);
        }
        return formatFullNumber(roundedCount);
      }

      if (isCurrency) {
        return formatCompactCurrency(roundedCount);
      }
      return formatCompactNumber(roundedCount);
    };

    const getFullValue = () => {
      const roundedCount = Math.round(count);
      if (isCurrency) {
        return formatFullCurrency(roundedCount);
      }
      return formatFullNumber(roundedCount);
    };

    return { displayValue: getDisplayValue(), fullValue: getFullValue(), elementRef: setElementRef };
  };

  return (
    <div className={cn("grid", size.gap, columnClasses[columns as keyof typeof columnClasses] || columnClasses[8], className)}>
      {stats.map((stat, index) => {
        const Icon = getIconComponent(stat.icon);
        const colors = defaultColors[index % defaultColors.length];

        const cardBg = stat.cardBg || colors.bg;
        const iconBg = stat.iconBg || colors.iconBg;
        const iconColor = stat.iconColor || colors.iconColor;
        const borderColor = stat.borderColor || colors.border;
        const textColor = stat.textColor || colors.text;
        const valueColor = stat.valueColor || colors.value;

        const TagComponent = ({ children }: { children: React.ReactNode }) => {
          if (stat.href) {
            return <a href={stat.href} className="block h-full">{children}</a>;
          }
          if (stat.onClick) {
            return <div onClick={stat.onClick} className="cursor-pointer h-full">{children}</div>;
          }
          return <>{children}</>;
        };

        return (
          <div key={stat.label} className="relative group">
            {/* Render the appropriate tag, default icon, or nothing */}
            {renderTagOrIcon(stat)}

            <TagComponent>
              <Card className={cn(
                "border shadow-md rounded-2xl",
                "hover:shadow-xl transition-all duration-300",
                "hover:-translate-y-1",
                "overflow-hidden",
                cardBg,
                borderColor,
                size.cardHeight
              )}>
                <CardContent className={cn(
                  "h-full flex flex-col justify-end",
                  size.padding
                )}>
                  {/* Value at top */}
                  <p className={cn(
                    "font-bold tracking-tight text-right",
                    size.valueSize,
                    valueColor
                  )}>
                    <AnimatedValue
                      value={stat.value}
                      isCurrency={stat.isCurrency || false}
                      compact={stat.compact !== undefined ? stat.compact : true}
                      prefix={stat.prefix || ''}
                      suffix={stat.suffix || ''}
                    />
                  </p>

                  {/* Label and Icon at bottom */}
                  <div className="flex items-center justify-between mt-auto pt-1.5">
                    <div className="flex flex-col">
                      <p className={cn(
                        "font-semibold uppercase tracking-wider truncate",
                        size.labelSize,
                        textColor
                      )}>
                        {stat.label}
                      </p>
                      {stat.subtitle && (
                        <p className={cn(
                          "text-muted-foreground truncate",
                          size.subtitleSize
                        )}>
                          {stat.subtitle}
                        </p>
                      )}
                    </div>
                    {showIcons && (stat.iconComponent || Icon) && (
                      <div className={cn(
                        "rounded-xl flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6",
                        size.iconPadding,
                        iconBg,
                        iconColor
                      )}>
                        {stat.iconComponent || (Icon && <Icon className={size.iconSize} />)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TagComponent>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
