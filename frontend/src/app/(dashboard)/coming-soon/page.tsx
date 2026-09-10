// app/coming-soon/page.tsx

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageTemplate } from '@/components/dashboard/PageTemplate';
import { useNavigation } from '@/hooks/useNavigation';
import {
  Construction,
  ArrowLeft,
  Calendar,
  Mail,
  Bell,
  Clock,
  Sparkles,
  Rocket,
  Building2,
  Users,
  Package,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// ============================================
// ANIMATION VARIANTS
// ============================================

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const floatAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// ============================================
// FEATURE CARD COMPONENT
// ============================================

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'coming-soon';
}

const FeatureCard = ({ icon, title, description, status }: FeatureCardProps) => {
  const statusConfig = {
    'planned': {
      label: 'Planned',
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      icon: <Calendar className="h-3 w-3" />,
    },
    'in-progress': {
      label: 'In Progress',
      color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
    },
    'coming-soon': {
      label: 'Coming Soon',
      color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      icon: <Sparkles className="h-3 w-3" />,
    },
  };

  const config = statusConfig[status] || statusConfig['coming-soon'];

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative"
    >
      <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border border-white/20 dark:border-gray-700/50 group-hover:scale-110 transition-transform duration-300">
              <div className="h-8 w-8 text-blue-600 dark:text-blue-400">
                {icon}
              </div>
            </div>
            <Badge className={cn(
              "rounded-full text-[10px] font-medium border px-2.5 py-0.5 flex items-center gap-1",
              config.color
            )}>
              {config.icon}
              {config.label}
            </Badge>
          </div>

          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {title}
          </h4>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ============================================
// MAIN COMING SOON PAGE
// ============================================

export default function ComingSoonPage() {
  const { getRedirectedFrom, clearRedirectedInfo } = useNavigation();
  const [redirectInfo, setRedirectInfo] = useState<{
    name: string | null;
    path: string | null;
    id: string | null;
  }>({
    name: null,
    path: null,
    id: null,
  });

  useEffect(() => {
    const info = getRedirectedFrom();
    if (info) {
      setRedirectInfo(info);
    }

    return () => {
      clearRedirectedInfo();
    };
  }, [getRedirectedFrom, clearRedirectedInfo]);

  // Features that are coming soon
  const features = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: 'Invoice Management',
      description: 'Create, verify, and manage supplier invoices with automated workflows.',
      status: 'in-progress' as const,
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: 'Contract Management',
      description: 'Create, track, and manage procurement contracts with renewals.',
      status: 'planned' as const,
    },
    {
      icon: <Building2 className="h-8 w-8" />,
      title: 'Tender Management',
      description: 'Manage tender notices, bidders, and evaluation processes.',
      status: 'planned' as const,
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Payment Approvals',
      description: 'Streamline payment vouchers, cheque management, and approvals.',
      status: 'in-progress' as const,
    },
    {
      icon: <AlertCircle className="h-8 w-8" />,
      title: 'Budget & Finance',
      description: 'Track budget allocation, planning, and expenditure monitoring.',
      status: 'planned' as const,
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: 'Reports & Analytics',
      description: 'Generate custom reports with advanced filtering and insights.',
      status: 'coming-soon' as const,
    },
  ];

  // Quick actions for the user
  const quickActions = [
    { label: 'Go to Dashboard', href: '/dashboard', icon: <ArrowLeft className="h-4 w-4" /> },
    { label: 'View Requisitions', href: '/requisitions/manage', icon: <FileText className="h-4 w-4" /> },
    { label: 'Check Purchase Orders', href: '/procurement/purchase-orders/manage-orders', icon: <Package className="h-4 w-4" /> },
    { label: 'Contact Support', href: '/help', icon: <Mail className="h-4 w-4" /> },
  ];

  return (
    <PageTemplate
      title={redirectInfo.name ? `${redirectInfo.name} - Coming Soon` : 'Coming Soon'}
      description="Exciting new features are on the horizon. Stay tuned for these upcoming enhancements to improve your procurement experience."
      icon={<Construction className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />}
      background="gradient"
      variant="default"
      breadcrumbs={[
        { label: 'Coming Soon' },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 rounded-full px-4 py-1.5">
            <Construction className="h-3.5 w-3.5 mr-1.5" />
            Under Development
          </Badge>
          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            Q4 2024
          </Badge>
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-10 rounded-xl dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      }
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        {/* ============================================ */}
        {/* FEATURES GRID */}
        {/* ============================================ */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upcoming Features
              </h3>
              <p className="text-sm text-muted-foreground">
                Features currently in development or planned for future releases
              </p>
            </div>
            <Badge variant="outline" className="rounded-full px-3 py-1">
              {features.length} Features
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                status={feature.status}
              />
            ))}
          </div>
        </motion.div>

        {/* ============================================ */}
        {/* QUICK ACTIONS */}
        {/* ============================================ */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Quick Actions
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Navigate to other parts of the system
                  </p>
                </div>
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className="group flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-200 border border-gray-200/30 dark:border-gray-700/30"
                  >
                    <span className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {action.icon}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                      {action.label}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ============================================ */}
        {/* NOTIFICATION SECTION */}
        {/* ============================================ */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/30 dark:border-blue-800/30">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-blue-100/50 dark:bg-blue-900/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/50">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-white">
                      Stay Updated
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      Get notified when these features are released
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-white/20 dark:border-gray-700/50"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notify Me
                  </Button>
                  <Link href="/help">
                    <Button
                      size="sm"
                      className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/20"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </PageTemplate>
  );
}
