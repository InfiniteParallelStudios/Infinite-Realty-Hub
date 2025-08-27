'use client'

import { motion } from 'framer-motion'
import { 
  Mail, 
  Phone, 
  DollarSign,
  Calendar,
  Star,
  AlertCircle,
  Clock,
  Target,
  Home
} from 'lucide-react'
import { Lead } from '@/types/pipeline'

interface BuyerCardProps {
  lead: Lead
  onEdit: (lead: Lead) => void
  isDragging?: boolean
}

export function BuyerCard({ lead, onEdit, isDragging = false }: BuyerCardProps) {
  const getPriorityColor = (priority: Lead['priority']) => {
    switch (priority) {
      case 'high': return 'border-red-400 bg-red-500/10 shadow-red-500/20'
      case 'medium': return 'border-yellow-400 bg-yellow-500/10 shadow-yellow-500/20'
      case 'low': return 'border-gray-400 bg-gray-500/10 shadow-gray-500/20'
    }
  }

  const getPriorityIcon = (priority: Lead['priority']) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-3 h-3 text-red-400" />
      case 'medium': return <Star className="w-3 h-3 text-yellow-400" />
      case 'low': return <Star className="w-3 h-3 text-gray-400" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getDaysInStage = () => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - lead.updatedAt.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white dark:bg-gray-800 rounded-xl border-l-4 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden ${
        getPriorityColor(lead.priority)
      } ${
        isDragging ? 'shadow-xl rotate-3 scale-105' : ''
      }`}
      onClick={(e) => {
        // Only handle click if it's not a drag operation
        if (!isDragging) {
          e.stopPropagation()
          onEdit(lead)
        }
      }}
    >
      {/* Header with Avatar and Priority */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {lead.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                {lead.name}
              </h4>
              <p className="text-xs text-gray-500 capitalize">
                {lead.source.replace('_', ' ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {getPriorityIcon(lead.priority)}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              getDaysInStage() > 7 ? 'bg-orange-500/20 text-orange-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              {getDaysInStage()}d
            </span>
            {/* Drag handle indicator */}
            <div className="flex flex-col gap-0.5 cursor-grab ml-2">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Quick Contact */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Mail className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span>{lead.phone}</span>
          </div>
        </div>
      </div>

      {/* Property Interest & Budget */}
      <div className="px-4 pb-3">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-2">
          {/* Budget */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-3 h-3 text-green-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Budget</span>
            </div>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(lead.value)}
            </span>
          </div>

          {/* Property Interest */}
          {lead.propertyInterest && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Home className="w-3 h-3 text-cyan-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  {lead.propertyInterest.type} • {lead.propertyInterest.location}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Timeline: {lead.propertyInterest.timeline}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tags & Probability */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3 text-purple-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {lead.probability}% chance
            </span>
          </div>
          {lead.lastContact && (
            <span className="text-xs text-gray-500">
              Last: {lead.lastContact.toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Tags */}
        {lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {lead.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 px-2 py-1 rounded-full border border-cyan-400/30"
              >
                {tag}
              </span>
            ))}
            {lead.tags.length > 2 && (
              <span className="text-xs text-gray-500 px-1">
                +{lead.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-gray-50/50 dark:bg-gray-700/30 px-4 py-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {/* Next Follow-up */}
          {lead.nextFollowUp && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-orange-500" />
              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                Follow-up: {lead.nextFollowUp.toLocaleDateString()}
              </span>
            </div>
          )}
          
          {/* Quick Actions Indicator */}
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-cyan-400 rounded-full" />
            <div className="w-1 h-1 bg-cyan-400 rounded-full" />
            <div className="w-1 h-1 bg-cyan-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* Urgent Indicator */}
      {lead.priority === 'high' && lead.nextFollowUp && new Date() > lead.nextFollowUp && (
        <div className="absolute top-2 right-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2 h-2 bg-red-500 rounded-full"
          />
        </div>
      )}
    </motion.div>
  )
}