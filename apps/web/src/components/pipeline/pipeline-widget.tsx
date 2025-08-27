'use client'

import { motion } from 'framer-motion'
import { TrendingUp, ArrowRight, Users, DollarSign } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import Link from 'next/link'

// Mock pipeline summary data
const pipelineSummary = {
  totalLeads: 12,
  totalValue: 2400000,
  stagesData: [
    { name: 'New', count: 3, color: 'bg-blue-500' },
    { name: 'Contacted', count: 2, color: 'bg-yellow-500' },
    { name: 'Qualified', count: 4, color: 'bg-purple-500' },
    { name: 'Showing', count: 2, color: 'bg-orange-500' },
    { name: 'Closing', count: 1, color: 'bg-green-500' }
  ]
}

export function PipelineWidget() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="h-40 sm:h-48 overflow-hidden"
    >
      <Link href="/pipeline" className="block h-full">
        <GlassCard className="h-full p-3 sm:p-4 hover:shadow-lg hover:shadow-cyan-500/20 transition-all cursor-pointer group overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-400/30 flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                  Lead Pipeline
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  Track your sales progress
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-2 overflow-hidden">
            <div className="min-w-0 overflow-hidden">
              <div className="flex items-center gap-1 mb-0.5 overflow-hidden">
                <Users className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate overflow-hidden">Total Leads</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate overflow-hidden w-full">
                {pipelineSummary.totalLeads}
              </p>
            </div>
            <div className="min-w-0 overflow-hidden">
              <div className="flex items-center gap-1 mb-0.5 overflow-hidden">
                <DollarSign className="w-3 h-3 text-green-400 flex-shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate overflow-hidden">Pipeline Value</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate overflow-hidden w-full block" title={formatCurrency(pipelineSummary.totalValue)}>
                {formatCurrency(pipelineSummary.totalValue)}
              </p>
            </div>
          </div>

          {/* Pipeline Stages Mini Chart */}
          <div className="space-y-1 mb-2 overflow-hidden">
            <h4 className="text-xs font-medium text-gray-900 dark:text-white truncate">
              Pipeline Stages
            </h4>
            <div className="space-y-1 overflow-hidden">
              {pipelineSummary.stagesData.slice(0, 3).map((stage, index) => (
                <motion.div
                  key={stage.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex items-center justify-between overflow-hidden"
                >
                  <div className="flex items-center gap-1 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${stage.color}`} />
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {stage.name}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-white flex-shrink-0">
                    {stage.count}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 mb-2">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1 overflow-hidden">
              <span className="truncate">Pipeline Progress</span>
              <span className="flex-shrink-0">75% Active</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-2 text-center overflow-hidden">
            <span className="text-xs text-cyan-400 group-hover:text-cyan-300 transition-colors truncate block">
              View Full Pipeline →
            </span>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  )
}