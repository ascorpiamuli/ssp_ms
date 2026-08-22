// frontend/src/components/ui/animated-counter.tsx

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  animateOnMount?: boolean;
  className?: string;
  formatter?: (value: number) => string;
  prefix?: string;
  suffix?: string;
  separator?: boolean;
  decimalPlaces?: number;
  triggerOnScroll?: boolean;
  threshold?: number;
  once?: boolean;
}

export const AnimatedCounter = ({
  value,
  duration = 1200,
  delay = 0,
  animateOnMount = false,
  className,
  formatter,
  prefix = '',
  suffix = '',
  separator = true,
  decimalPlaces = 0,
  triggerOnScroll = true,
  threshold = 0.1,
  once = true,
}: AnimatedCounterProps) => {
  const [count, setCount] = useState(animateOnMount ? 0 : value);
  const [isVisible, setIsVisible] = useState(animateOnMount);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<number | null>(null);

  // Format the number
  const formatNumber = (num: number): string => {
    if (formatter) {
      return formatter(num);
    }

    let formatted = num;

    // Apply decimal places
    if (decimalPlaces > 0) {
      formatted = parseFloat(num.toFixed(decimalPlaces));
    }

    // Add separators
    if (separator) {
      const parts = formatted.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }

    return formatted.toString();
  };

  // Intersection Observer for scroll triggering
  useEffect(() => {
    if (!triggerOnScroll || animateOnMount || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
          setCount(0);
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [triggerOnScroll, animateOnMount, threshold, once, hasAnimated]);

  // Counter animation
  useEffect(() => {
    // Don't animate if already done
    if (hasAnimated && once) return;

    // If not visible and trigger on scroll, wait
    if (triggerOnScroll && !isVisible && !animateOnMount) {
      setCount(0);
      return;
    }

    // Don't animate if value is 0
    if (value === 0) {
      setCount(0);
      setHasAnimated(true);
      return;
    }

    // Start animation after delay
    const delayTimeout = setTimeout(() => {
      const startTime = performance.now();
      const startValue = 0;

      const animateCounter = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (value - startValue) * eased;

        // Use Math.round for better precision on large numbers
        const roundedValue = decimalPlaces > 0
          ? parseFloat(currentValue.toFixed(decimalPlaces))
          : Math.round(currentValue);

        setCount(roundedValue);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animateCounter);
        } else {
          setCount(value);
          setHasAnimated(true);
        }
      };

      animationRef.current = requestAnimationFrame(animateCounter);
    }, delay);

    return () => {
      clearTimeout(delayTimeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, delay, isVisible, triggerOnScroll, animateOnMount, once, hasAnimated, decimalPlaces]);

  // Reset animation when value changes
  useEffect(() => {
    if (hasAnimated && once) {
      setHasAnimated(false);
    }
    setCount(0);
    setIsVisible(animateOnMount);
  }, [value, animateOnMount, once]);

  const displayValue = formatNumber(count);
  const fullDisplay = `${prefix}${displayValue}${suffix}`;

  return (
    <span ref={elementRef} className={cn("inline-block", className)}>
      {fullDisplay}
    </span>
  );
};

// ============================================
// PRE-CONFIGURED COUNTERS
// ============================================

export const CurrencyCounter = ({
  value,
  duration = 1200,
  className,
}: Omit<AnimatedCounterProps, 'prefix' | 'suffix' | 'formatter'>) => (
  <AnimatedCounter
    value={value}
    duration={duration}
    prefix="KES "
    separator={true}
    className={className}
  />
);

export const CompactCounter = ({
  value,
  duration = 1000,
  className,
}: Omit<AnimatedCounterProps, 'separator' | 'decimalPlaces'>) => (
  <AnimatedCounter
    value={value}
    duration={duration}
    separator={false}
    className={className}
  />
);

export const DecimalCounter = ({
  value,
  duration = 1200,
  decimalPlaces = 2,
  className,
  ...props
}: Omit<AnimatedCounterProps, 'separator'> & { decimalPlaces?: number }) => (
  <AnimatedCounter
    value={value}
    duration={duration}
    decimalPlaces={decimalPlaces}
    separator={true}
    className={className}
    {...props}
  />
);

export const PercentageCounter = ({
  value,
  duration = 1200,
  className,
}: Omit<AnimatedCounterProps, 'suffix' | 'separator'>) => (
  <AnimatedCounter
    value={value}
    duration={duration}
    suffix="%"
    separator={false}
    className={className}
  />
);

export default AnimatedCounter;
