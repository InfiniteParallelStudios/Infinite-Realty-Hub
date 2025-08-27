'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  BarChart3,
  Zap
} from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { apiManager, ApiStatus } from '@/services/api-integrations/api-manager'

interface ApiStatusWidgetProps {
  showDetails?: boolean
}

export function ApiStatusWidget({ showDetails = true }: ApiStatusWidgetProps) {
  const [apiStats, setApiStats] = useState<Array<{
    provider: string
    status: ApiStatus
    dailyUsage: number
  }>>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    loadApiStats()
    // Refresh every 5 minutes
    const interval = setInterval(loadApiStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadApiStats = async () => {
    setLoading(true)
    try {
      // Refresh API statuses first
      await apiManager.refreshApiStatuses()
      
      // Get current stats
      const stats = apiManager.getApiUsageStats()
      setApiStats(stats)
      setLastUpdated(new Date())
    } catch (error) {
      // Silently handle API stats loading errors
    }
    setLoading(false)
  }

  const getStatusIcon = (provider: string, available: boolean, remaining?: number) => {
    if (!available) {
      return <XCircle className="w-4 h-4 text-red-400" />
    } else if (remaining && remaining < 10) {
      return <AlertCircle className="w-4 h-4 text-yellow-400" />
    } else {
      return <CheckCircle2 className="w-4 h-4 text-green-400" />
    }
  }

  const getStatusColor = (available: boolean, remaining?: number) => {
    if (!available) return 'border-red-500/20 bg-red-500/10'
    if (remaining && remaining < 10) return 'border-yellow-500/20 bg-yellow-500/10'
    return 'border-green-500/20 bg-green-500/10'
  }

  const getProviderDisplayName = (provider: string) => {
    switch (provider) {
      case 'realtor': return 'Realtor API'
      case 'rentcast': return 'RentCast API'
      case 'public': return 'Public Data'
      default: return provider
    }
  }

  const totalDailyUsage = (apiStats || []).reduce((sum, stat) => sum + (stat?.dailyUsage || 0), 0)
  const totalRemaining = (apiStats || []).reduce((sum, stat) => sum + (stat?.status?.remaining || 0), 0)
  const availableProviders = (apiStats || []).filter(stat => stat?.status?.available).length

  if (loading) {
    return (
      <GlassCard>
        <div className="p-4 flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
          <span className="text-gray-600 dark:text-gray-400">Checking API status...</span>
        </div>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <GlassCard>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  API Status
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Real-time market data sources
                </p>
              </div>
            </div>
            
            <button
              onClick={loadApiStats}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Refresh Status"
            >
              <RefreshCw className="w-4 h-4 text-gray-400 hover:text-cyan-400" />
            </button>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle2 className="w-3 h-3 text-green-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Active</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {availableProviders}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <BarChart3 className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Used Today</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {totalDailyUsage}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Remaining</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {totalRemaining}
              </p>
            </div>
          </div>

          {lastUpdated && (
            <p className="text-xs text-gray-500 text-center">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </GlassCard>

      {/* Detailed Status */}
      {showDetails && (
        <div className="space-y-3">
          {(apiStats || []).map((stat, index) => (
            <motion.div
              key={stat.provider}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`p-4 rounded-lg border ${getStatusColor(stat.status.available, stat.status.remaining)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(stat.provider, stat.status.available, stat.status.remaining)}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {getProviderDisplayName(stat.provider)}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Priority: {stat.status.priority}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {stat.status.remaining ? `${stat.status.remaining} left` : 'Unlimited'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {stat.dailyUsage} used today
                    </p>
                  </div>
                </div>

                {/* Usage Bar */}
                {stat.status.remaining && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Usage</span>
                      <span>
                        {stat.dailyUsage} / {stat.status.remaining + stat.dailyUsage}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          stat.dailyUsage / (stat.status.remaining + stat.dailyUsage) > 0.8
                            ? 'bg-red-500'
                            : stat.dailyUsage / (stat.status.remaining + stat.dailyUsage) > 0.6
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            (stat.dailyUsage / (stat.status.remaining + stat.dailyUsage)) * 100,
                            100
                          )}%`
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Status Messages */}
                {!stat.status.available && (
                  <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-sm text-blue-400">
                    💡 Using cached data - API temporarily rate limited
                  </div>
                )}
                
                {stat.status.available && stat.status.remaining && stat.status.remaining < 10 && (
                  <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm text-yellow-400">
                    🔄 Low on API calls - consider upgrading or switching providers
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Usage Tips */}
      <GlassCard>
        <div className="p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            💡 API Usage Tips
          </h4>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>• <strong>Realtor API:</strong> 100 free requests/month - Best for current listings</p>
            <p>• <strong>RentCast API:</strong> 50 free requests/month - Best for property valuations</p>
            <p>• <strong>Weekly Caching:</strong> Data is cached for 7 days to minimize API usage</p>
            <p>• <strong>Smart Fallback:</strong> System automatically switches to available providers</p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}