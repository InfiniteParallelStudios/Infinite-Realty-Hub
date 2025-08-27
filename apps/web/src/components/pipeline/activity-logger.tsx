'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Home, 
  FileText, 
  Clock,
  User,
  CheckCircle
} from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'

export interface Activity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'property_showing' | 'follow_up' | 'other'
  description: string
  date: Date
  duration?: number // in minutes
  outcome?: 'positive' | 'neutral' | 'negative' | 'no_response'
  nextAction?: string
  agentNotes?: string
}

interface ActivityLoggerProps {
  isOpen: boolean
  onClose: () => void
  leadName: string
  onSaveActivity: (activity: Omit<Activity, 'id'>) => void
}

export function ActivityLogger({ isOpen, onClose, leadName, onSaveActivity }: ActivityLoggerProps) {
  const [activityType, setActivityType] = useState<Activity['type']>('call')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16)) // datetime-local format
  const [duration, setDuration] = useState<number | ''>('')
  const [outcome, setOutcome] = useState<Activity['outcome']>('positive')
  const [nextAction, setNextAction] = useState('')
  const [agentNotes, setAgentNotes] = useState('')

  const activityTypes = [
    { value: 'call', label: 'Phone Call', icon: Phone, color: 'text-green-500' },
    { value: 'email', label: 'Email', icon: Mail, color: 'text-blue-500' },
    { value: 'meeting', label: 'Meeting', icon: User, color: 'text-purple-500' },
    { value: 'property_showing', label: 'Property Showing', icon: Home, color: 'text-orange-500' },
    { value: 'follow_up', label: 'Follow-up', icon: Clock, color: 'text-cyan-500' },
    { value: 'note', label: 'General Note', icon: FileText, color: 'text-gray-500' },
    { value: 'other', label: 'Other', icon: MessageSquare, color: 'text-indigo-500' }
  ] as const

  const outcomes = [
    { value: 'positive', label: 'Positive', color: 'bg-green-500/20 text-green-600 border-green-400/30' },
    { value: 'neutral', label: 'Neutral', color: 'bg-gray-500/20 text-gray-600 border-gray-400/30' },
    { value: 'negative', label: 'Negative', color: 'bg-red-500/20 text-red-600 border-red-400/30' },
    { value: 'no_response', label: 'No Response', color: 'bg-yellow-500/20 text-yellow-600 border-yellow-400/30' }
  ] as const

  const handleSave = () => {
    if (!description.trim()) return

    const activity: Omit<Activity, 'id'> = {
      type: activityType,
      description: description.trim(),
      date: new Date(date),
      duration: duration === '' ? undefined : Number(duration),
      outcome,
      nextAction: nextAction.trim() || undefined,
      agentNotes: agentNotes.trim() || undefined
    }

    onSaveActivity(activity)
    
    // Reset form
    setDescription('')
    setDuration('')
    setNextAction('')
    setAgentNotes('')
    setActivityType('call')
    setOutcome('positive')
    setDate(new Date().toISOString().slice(0, 16))
    
    onClose()
  }

  const selectedActivityType = activityTypes.find(type => type.value === activityType)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[75] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 max-w-2xl w-full max-h-[75vh] flex flex-col"
        >
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 pb-2">
            <GlassCard className="rounded-xl border-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Log Activity
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Recording activity for {leadName}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

            <form className="space-y-6">
              {/* Activity Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Activity Type
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {activityTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setActivityType(type.value)}
                        className={`p-3 rounded-lg text-sm font-medium transition-all flex flex-col items-center gap-2 ${
                          activityType === type.value
                            ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-400/30'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${activityType === type.value ? 'text-cyan-500' : type.color}`} />
                        <span className="text-xs">{type.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                </div>
                
                {(activityType === 'call' || activityType === 'meeting' || activityType === 'property_showing') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      placeholder="15"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Activity Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
                  placeholder={`Describe the ${selectedActivityType?.label.toLowerCase()}...`}
                />
              </div>

              {/* Outcome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Outcome
                </label>
                <div className="flex flex-wrap gap-2">
                  {outcomes.map((outcomeOption) => (
                    <button
                      key={outcomeOption.value}
                      type="button"
                      onClick={() => setOutcome(outcomeOption.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        outcome === outcomeOption.value
                          ? outcomeOption.color
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border-transparent'
                      }`}
                    >
                      {outcomeOption.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Next Action */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Next Action Required
                </label>
                <input
                  type="text"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="e.g., Schedule property viewing, Send listing info, Follow up next week"
                />
              </div>

              {/* Agent Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Private Agent Notes
                </label>
                <textarea
                  value={agentNotes}
                  onChange={(e) => setAgentNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
                  placeholder="Internal notes about this interaction (not visible to client)"
                />
              </div>

            </form>
            </GlassCard>
          </div>

          {/* Fixed Bottom Action Bar */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 rounded-b-xl">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!description.trim()}
                className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Log Activity
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}