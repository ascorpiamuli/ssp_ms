// app/components/modals/CodeOfConductModal.tsx
'use client';

import { X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CodeOfConductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CodeOfConductModal({ isOpen, onClose }: CodeOfConductModalProps) {
  if (!isOpen) return null;

  const sections = [
    {
      id: 'general',
      title: '1. General Responsibilities',
      content: [
        'All members shall carry out their responsibilities as defined in Chapter II (2) of the Constitution.',
        'Each member shall pay the subscription fee as agreed upon by the community.',
        'Every member is mandated to uphold and maintain the dignity of the community and its members.'
      ]
    },
    {
      id: 'discipline',
      title: '2. Discipline and Accountability',
      content: [
        'The Disciplinary Committee shall decide on disciplinary measures depending on the offense committed.',
        'The Chairperson has the mandate to usher out any member(s) who show misconduct during meetings.',
        'No official or member shall represent the community in any external events without the approval of the Main Office.'
      ]
    },
    {
      id: 'political',
      title: '3. Political Neutrality',
      content: [
        'No member shall be allowed to hold political campaigns in the chapel, whether during prayers, Mass, or any other religious forums.',
        'The community is centered solely on spiritual, academic, and welfare activities and shall explicitly take no part in political affairs.'
      ]
    },
    {
      id: 'obligations',
      title: '4. Membership Obligations',
      content: [
        'Active Participation: Endeavor to actively participate in spiritual, social, and service activities.',
        'Upholding Catholic Teaching: Strive to live in accordance with Catholic moral and social teachings.',
        'Respect for Authority: Show respect for the Chaplain, Patron, Community council leadership, and fellow members.',
        'Adherence to Constitution: Abide by the provisions of this Constitution and any by-laws or regulations.',
        'Positive Representation: Represent the Catholic Students of TUM positively within the university community and beyond.'
      ]
    },
    {
      id: 'termination',
      title: '5. Termination of Membership',
      content: [
        'Voluntary Withdrawal: A member may voluntarily terminate their membership by informing the Main Office.',
        'Graduation/Withdrawal: Membership automatically ceases upon graduation from or withdrawal from TUM.',
        'Breach of Constitution: Membership may be terminated for serious and persistent breach of this Constitution or conduct contrary to community values.'
      ]
    },
    {
      id: 'leadership',
      title: '6. Leadership Accountability',
      content: [
        'Officials shall have a collective responsibility of ensuring smooth running of the community.',
        'All financial transactions shall be accompanied by legal documents where necessary.',
        'Any official who develops interest in politics, is found guilty of gross misconduct, or abandons duty may be relieved of their duties.'
      ]
    }
  ];

  const coreValues = ['Equality', 'Integrity', 'Self-control', 'Time Management', 'Modesty'];
  const reviewParticipants = [
    { name: 'Jerome Wekesa', role: 'Chairperson' },
    { name: 'Cynthia Chellagat', role: 'Vice Chairperson' },
    { name: 'Mary Syokau', role: 'Secretary' },
    { name: 'Stacy Nzula', role: 'Vice Secretary' },
    { name: 'Boaz Kiplagat', role: 'Treasurer' },
    { name: 'Arnold Onguti', role: 'Organizing Secretary' },
    { name: 'Francis Thuo', role: 'Library & Asset Manager' },
    { name: 'Emmanuel Adriano', role: 'Liturgical Coordinator' },
    { name: 'Hellena Faith', role: 'Hospitality Manager' },
    { name: 'Levis Maina', role: 'SCC Coordinator' }
  ];

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
              <span className="text-white text-xl">⚖️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Code of Conduct</h2>
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
          {/* Introduction */}
          <div className="bg-gradient-to-r from-brand-blue/10 to-brand-purple/10 rounded-xl p-4 border border-brand-blue/20">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              As members of the Saint Francis of Assisi TUM Catholic Community, we pledge to uphold these principles
              that guide our conduct, foster spiritual growth, and strengthen our fellowship in Christ.
            </p>
          </div>

          {/* Sections */}
          {sections.map((section) => (
            <div key={section.id}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-gradient-to-r from-brand-blue to-brand-purple rounded-full" />
                {section.title}
              </h3>
              <ul className="space-y-2 pl-4">
                {section.content.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-brand-blue mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Review Committee */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white text-center mb-3">
              Constitution Review Committee
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {reviewParticipants.map((participant, idx) => (
                <div key={idx} className="text-center p-2 bg-white dark:bg-gray-700 rounded-lg">
                  <div className="text-xs font-medium text-gray-900 dark:text-white">{participant.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{participant.role}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
              Last reviewed: October 5, 2025 | With acknowledgment to Fr. Gregory Mwakio
            </p>
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
