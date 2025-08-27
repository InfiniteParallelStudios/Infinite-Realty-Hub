'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useTheme } from '@/contexts/theme-context'
import { useAuth } from '@/contexts/auth-context'
import { motion } from 'framer-motion'
import { Moon, Sun, Zap, BarChart3, Users, Calendar, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PipelineWidget } from '@/components/pipeline/pipeline-widget'
import { MarketInsightsWidget } from '@/components/market-data/market-insights-widget'

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleGetStarted = () => {
    // Navigate to contacts page to start using the CRM
    router.push('/contacts')
  }

  const handleLearnMore = () => {
    // Show welcome/help modal with feature overview
    setShowWelcomeModal(true)
  }

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 truncate">
            Welcome back, {user?.user_metadata?.full_name || user?.email}
          </p>
        </div>
        
        <div className="flex gap-2 flex-shrink-0">
          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            className="p-3 rounded-xl bg-white/20 dark:bg-hud-panel backdrop-blur-md border border-white/20 dark:border-glass-border hover:bg-white/30 dark:hover:bg-hud-panel dark:hover:shadow-hud-glow transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-cyan-400" />
            ) : (
              <Moon className="w-5 h-5 text-blue-500" />
            )}
          </motion.button>
          
          {/* Sign Out Button */}
          <motion.button
            onClick={handleSignOut}
            className="p-3 rounded-xl bg-white/20 dark:bg-hud-panel backdrop-blur-md border border-white/20 dark:border-glass-border hover:bg-red-500/20 dark:hover:bg-red-500/20 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-red-500" />
          </motion.button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: Zap, label: 'Active Leads', value: '12', color: 'text-cyan-400' },
          { icon: BarChart3, label: 'YTD Volume', value: '$2.4M', color: 'text-blue-400' },
          { icon: Users, label: 'Contacts', value: '248', color: 'text-sky-400' },
          { icon: Calendar, label: 'This Week', value: '8', color: 'text-cyan-300' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard variant="glow" className="text-center p-4 sm:p-6">
              <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.color} mx-auto mb-2`} />
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Welcome Widget */}
      <GlassCard variant="interactive">
        <div className="text-center py-6 sm:py-8 px-4">
          <div className="text-4xl sm:text-6xl mb-4">🏢</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            <span className="text-cyan-400 font-bold">Welcome to Infinite Realty Hub</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
            Your AI-powered real estate command center is ready
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button 
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors shadow-lg shadow-cyan-500/20 font-medium"
            >
              Get Started
            </button>
            <button 
              onClick={handleLearnMore}
              className="w-full sm:w-auto px-6 py-3 bg-white/20 dark:bg-gray-800/50 hover:bg-white/30 dark:hover:bg-gray-700/50 border border-cyan-400/30 text-gray-900 dark:text-cyan-400 rounded-lg transition-colors backdrop-blur-md font-medium"
            >
              Learn More
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Feature Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.a
            href="/contacts"
            className="block h-40 sm:h-48"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <GlassCard className="h-full flex flex-col justify-center items-center text-center cursor-pointer hover:shadow-lg hover:shadow-cyan-500/20 transition-shadow p-4 sm:p-6">
              <Users className="w-8 h-8 sm:w-12 sm:h-12 text-cyan-400 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                CRM Module
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                Manage your contacts and leads
              </p>
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs sm:text-sm">
                Available Now
              </span>
            </GlassCard>
          </motion.a>
        </motion.div>

        {/* Lead Pipeline Widget */}
        <PipelineWidget />

          {/* Market Data Widget */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="h-40 sm:h-48 overflow-hidden"
        >
          <MarketInsightsWidget compact={true} />
        </motion.div>
      </div>
      </div>

      {/* Welcome/Learn More Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 max-w-md w-full border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Infinite Realty Hub
              </h3>
              <div className="text-gray-600 dark:text-gray-400 space-y-3 text-left">
                <p><strong>🎯 CRM Module:</strong> Manage your contacts, leads, and client relationships</p>
                <p><strong>📊 Analytics:</strong> Track your performance and market insights</p>
                <p><strong>🤖 AI Assistant:</strong> Get intelligent recommendations</p>
                <p><strong>⚙️ Customization:</strong> Personalize your workspace and preferences</p>
              </div>
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="mt-6 px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </ProtectedRoute>
  )
}