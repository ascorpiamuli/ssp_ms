// app/components/modals/PrivacyPolicyModal.tsx
'use client';

import Link from 'next/link';
import { X, Shield, Database, Lock, Server, Globe, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Privacy Policy</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Data Protection Header */}
          <div className="bg-gradient-to-r from-brand-blue/10 to-brand-purple/10 rounded-xl p-6 border border-brand-blue/20">
            <div className="flex items-center gap-4 flex-wrap">
              <img
                src="https://pasbestventures.com/images/6-logo-dark.png"
                alt="Pasbest Ventures Limited"
                className="h-12 w-auto object-contain"
              />
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600" />
              <div>
                <p className="text-sm font-semibold text-brand-blue dark:text-brand-purple">Data Protection & Security</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Your data is protected under the management of Pasbest Ventures Limited</p>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {/* Data Controller */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                <Database className="h-5 w-5 text-brand-blue" />
                Data Controller
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Your personal data is collected and processed by <strong className="text-foreground">Pasbest Ventures Limited</strong>, a technology company committed to protecting your privacy and ensuring the security of your information. As the data controller, Pasbest Ventures Limited is responsible for how your personal data is used and protected.
              </p>
            </div>

            {/* Information We Collect */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                <Lock className="h-5 w-5 text-brand-blue" />
                Information We Collect
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-brand-blue mt-1">•</span>
                  <span><strong>Personal Identification Information:</strong> Full name, email address, phone number, date of birth, gender</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-blue mt-1">•</span>
                  <span><strong>Academic Information:</strong> Student ID, course, year of study, registration number</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-blue mt-1">•</span>
                  <span><strong>Community Information:</strong> Small Christian Community (SCC) assignment, leadership roles, participation records</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-blue mt-1">•</span>
                  <span><strong>Technical Data:</strong> IP address, browser type, device information, login activity</span>
                </li>
              </ul>
            </div>

            {/* How We Use Your Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                <Server className="h-5 w-5 text-brand-blue" />
                How We Use Your Information
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-brand-blue mt-1">•</span>
                  <span>Manage your membership and participation in the TUM Catholic Community</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-blue mt-1">•</span>
                  <span>Communicate community events, activities, and important announcements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-blue mt-1">•</span>
                  <span>Process registrations, subscriptions, and contributions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-blue mt-1">•</span>
                  <span>Ensure the security and integrity of our systems and data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-blue mt-1">•</span>
                  <span>Comply with legal and regulatory requirements</span>
                </li>
              </ul>
            </div>

            {/* Data Protection & Security */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-brand-blue" />
                Data Protection & Security
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                Pasbest Ventures Limited implements robust security measures to protect your personal information, including:
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-brand-blue mt-1">•</span>
                  <span>End-to-end encryption for data transmission</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-blue mt-1">•</span>
                  <span>Secure servers with 24/7 monitoring and intrusion detection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-blue mt-1">•</span>
                  <span>Regular security audits and vulnerability assessments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-blue mt-1">•</span>
                  <span>Strict access controls and authentication protocols</span>
                </li>
              </ul>
            </div>

            {/* Data Sharing */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                <Globe className="h-5 w-5 text-brand-blue" />
                Data Sharing & Disclosure
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                We do not sell your personal information. Your data may be shared with:
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-brand-blue mt-1">•</span>
                  <span><strong>St. Joseph Catholic Parish Tudor:</strong> For pastoral coordination and sacramental records</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-blue mt-1">•</span>
                  <span><strong>Technical University of Mombasa:</strong> For academic coordination and official recognition</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-blue mt-1">•</span>
                  <span><strong>Service Providers:</strong> Third parties who assist in operating our platform (under strict confidentiality agreements)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-blue mt-1">•</span>
                  <span><strong>Legal Authorities:</strong> When required by law or to protect our rights</span>
                </li>
              </ul>
            </div>

            {/* Your Rights */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-brand-blue" />
                Your Rights
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-brand-blue mt-1">•</span>
                  <span>Access your personal data and request a copy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-blue mt-1">•</span>
                  <span>Rectify inaccurate or incomplete information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-blue mt-1">•</span>
                  <span>Request deletion of your data (subject to legal obligations)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-blue mt-1">•</span>
                  <span>Withdraw consent at any time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-blue mt-1">•</span>
                  <span>Lodge a complaint with the relevant data protection authority</span>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-brand-blue" />
                Contact Information
              </h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Pasbest Ventures Limited</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">1413, Kitui, Kenya (Near Kalundu Market)</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email: info@pasbestventures.com</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Phone: +254 727 200002</p>
                <Link
                  href="https://pasbestventures.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-blue hover:underline mt-2 inline-block"
                >
                  www.pasbestventures.com
                </Link>
              </div>
            </div>

            {/* Last Updated */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                <strong>Last Updated:</strong> October 5, 2025. This Privacy Policy may be updated periodically. You will be notified of any material changes.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-brand-blue to-brand-purple text-white hover:shadow-lg transition-shadow"
          >
            I Understand
          </Button>
        </div>
      </div>
    </div>
  );
}
