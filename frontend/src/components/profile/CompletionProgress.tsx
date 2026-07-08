import { AlertCircle, TrendingUp } from 'lucide-react';

// Completion Progress Component
const CompletionProgress = ({ percentage, completedFields, totalFields }: { percentage: number; completedFields: number; totalFields: number }) => {
  const getColor = () => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400'
    if (percentage >= 60) return 'text-blue-600 dark:text-blue-400'
    if (percentage >= 40) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-orange-600 dark:text-orange-400'
  }

  const getProgressColor = () => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-blue-500'
    if (percentage >= 40) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  return (
    <div className="bg-gradient-to-r from-brand-blue/5 to-brand-purple/5 dark:from-brand-blue/10 dark:to-brand-purple/10 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-brand-blue dark:text-brand-purple" />
          <h4 className="font-semibold text-gray-900 dark:text-white">Profile Completion</h4>
        </div>
        <div className={`text-2xl font-bold ${getColor()}`}>
          {percentage}%
        </div>
      </div>

      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
        <div
          className={`absolute top-0 left-0 h-full ${getProgressColor()} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{percentage === 100 ? 'Complete!' : `${100 - percentage}% remaining`}</span>
        <span>{completedFields}/{totalFields} fields completed</span>
      </div>

      {percentage < 100 && (
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Complete your profile to unlock all features
        </p>
      )}
    </div>
  )
}
export default CompletionProgress;
