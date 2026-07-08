// Section Component
const Section = ({ title, icon: Icon, children, className = "" }: { title: string; icon: React.ElementType; children: React.ReactNode; className?: string }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm ${className}`}>
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-brand-blue dark:text-brand-purple" />
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
)
export default Section;
