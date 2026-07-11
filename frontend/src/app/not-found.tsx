// app/under-development/page.tsx

'use client'

import { useState, useEffect } from 'react'
import {
  Construction,
  Wrench,
  Clock,
  AlertCircle,
  ArrowLeft,
  Home,
  Mail,
  MessageCircle,
  Twitter,
  Github,
  Linkedin,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ============================================
// TYPES
// ============================================

interface Feature {
  id: string
  name: string
  description: string
  status: 'planned' | 'in-progress' | 'completed'
  priority: 'high' | 'medium' | 'low'
  estimated_completion?: string
}

interface Milestone {
  id: string
  title: string
  description: string
  date: string
  status: 'completed' | 'in-progress' | 'pending'
}

// ============================================
// MOCK DATA
// ============================================

const features: Feature[] = [
  {
    id: '1',
    name: 'Advanced Analytics Dashboard',
    description: 'Real-time analytics with interactive charts and reports',
    status: 'in-progress',
    priority: 'high',
    estimated_completion: '2026-08-15',
  },
  {
    id: '2',
    name: 'Mobile App Integration',
    description: 'Native mobile app for iOS and Android with push notifications',
    status: 'planned',
    priority: 'high',
    estimated_completion: '2026-09-01',
  },
  {
    id: '3',
    name: 'AI-Powered Insights',
    description: 'Machine learning algorithms for predictive analytics and recommendations',
    status: 'planned',
    priority: 'medium',
    estimated_completion: '2026-10-01',
  },
  {
    id: '4',
    name: 'Multi-language Support',
    description: 'Support for multiple languages including Swahili, French, and Arabic',
    status: 'in-progress',
    priority: 'medium',
    estimated_completion: '2026-08-30',
  },
  {
    id: '5',
    name: 'API Documentation',
    description: 'Comprehensive API documentation with interactive examples',
    status: 'completed',
    priority: 'low',
    estimated_completion: '2026-07-01',
  },
]

const milestones: Milestone[] = [
  {
    id: '1',
    title: 'Beta Release',
    description: 'Initial beta release to select users',
    date: '2026-07-15',
    status: 'completed',
  },
  {
    id: '2',
    title: 'Performance Optimization',
    description: 'Optimize application performance and response times',
    date: '2026-08-01',
    status: 'in-progress',
  },
  {
    id: '3',
    title: 'Security Audit',
    description: 'Comprehensive security audit and penetration testing',
    date: '2026-08-15',
    status: 'pending',
  },
  {
    id: '4',
    title: 'Public Launch',
    description: 'Full public launch with all features',
    date: '2026-09-01',
    status: 'pending',
  },
]

// ============================================
// COMPONENTS
// ============================================

const StatusBadge = ({ status }: { status: Feature['status'] }) => {
  const variants = {
    'planned': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    'completed': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  }

  const labels = {
    'planned': 'Planned',
    'in-progress': 'In Progress',
    'completed': 'Completed',
  }

  return (
    <Badge className={cn("font-medium border", variants[status])}>
      {labels[status]}
    </Badge>
  )
}

const PriorityBadge = ({ priority }: { priority: Feature['priority'] }) => {
  const variants = {
    'high': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    'medium': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    'low': 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  }

  const labels = {
    'high': 'High Priority',
    'medium': 'Medium Priority',
    'low': 'Low Priority',
  }

  return (
    <Badge variant="outline" className={cn("font-medium border", variants[priority])}>
      {labels[priority]}
    </Badge>
  )
}

const MilestoneStatusIcon = ({ status }: { status: Milestone['status'] }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    case 'in-progress':
      return <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
    default:
      return <Clock className="h-5 w-5 text-gray-400" />
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function UnderDevelopmentPage() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  // Animation on mount
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Calculate overall progress
  const completedFeatures = features.filter(f => f.status === 'completed').length
  const totalFeatures = features.length
  const progressPercentage = totalFeatures > 0 ? Math.round((completedFeatures / totalFeatures) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className={cn(
          "text-center mb-12 transition-all duration-700 transform",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}>
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <Construction className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Under Development
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            We're Building Something
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Amazing
            </span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            This page is currently under development. We're working hard to bring you new features
            and improvements. Check back soon!
          </p>
        </div>

        {/* Progress Section */}
        <div className={cn(
          "mb-12 transition-all duration-700 delay-200 transform",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}>
          <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Development Progress
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {progressPercentage}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {completedFeatures} of {totalFeatures} features completed
                  </p>
                </div>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Upcoming Features
            </h2>
            <Badge variant="outline" className="text-sm">
              {totalFeatures} features
            </Badge>
          </div>

          <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-700 delay-300 transform",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}>
            {features.map((feature) => (
              <Card key={feature.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {feature.name}
                    </h3>
                    <StatusBadge status={feature.status} />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {feature.description}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <PriorityBadge priority={feature.priority} />
                    {feature.estimated_completion && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Est. {new Date(feature.estimated_completion).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Development Milestones
            </h2>
          </div>

          <div className={cn(
            "space-y-4 transition-all duration-700 delay-500 transform",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}>
            {milestones.map((milestone) => (
              <Card key={milestone.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <MilestoneStatusIcon status={milestone.status} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {milestone.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {milestone.status === 'completed' ? '✅ Completed' :
                            milestone.status === 'in-progress' ? '🔄 In Progress' :
                              '⏳ Pending'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {milestone.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(milestone.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Notify Section */}
        <div className={cn(
          "text-center py-8 border-t border-gray-200 dark:border-gray-700 transition-all duration-700 delay-700 transform",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Want to be notified when we launch?
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />
              Subscribe to Updates
            </Button>
            <Button variant="outline" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Join Waitlist
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-8 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Construction className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
              <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
              <Github className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
              <Linkedin className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} SSPMS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
