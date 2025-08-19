'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useTheme } from '@/contexts/theme-context'
import { useAuth } from '@/contexts/auth-context'
import { motion } from 'framer-motion'
import { Moon, Sun, Zap, BarChart3, Users, Calendar, LogOut } from 'lucide-react'

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {user?.user_metadata?.full_name || user?.email}
          </p>
        </div>
        
        <div className="flex gap-2">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            <GlassCard variant="glow" className="text-center">
              <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Welcome Widget */}
      <GlassCard variant="interactive">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            <span className="text-cyan-400 font-bold">Welcome to Infinite Realty Hub</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Your AI-powered real estate command center is ready
          </p>
          <div className="flex justify-center space-x-4">
            <button className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors shadow-lg shadow-cyan-500/20">
              Get Started
            </button>
            <button className="px-6 py-2 bg-white/20 dark:bg-gray-800/50 hover:bg-white/30 dark:hover:bg-gray-700/50 border border-cyan-400/30 text-gray-900 dark:text-cyan-400 rounded-lg transition-colors backdrop-blur-md">
              Learn More
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Feature Widgets */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.a
            href="/contacts"
            className="block h-48"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <GlassCard className="h-full flex flex-col justify-center items-center text-center cursor-pointer hover:shadow-lg hover:shadow-cyan-500/20 transition-shadow">
              <Users className="w-12 h-12 text-cyan-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                CRM Module
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Manage your contacts and leads
              </p>
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">
                Available Now
              </span>
            </GlassCard>
          </motion.a>
        </motion.div>

        {[
          { title: 'Lead Pipeline', subtitle: 'Track your deals', status: 'Coming Soon' },
          { title: 'Market Data', subtitle: 'Local market insights', status: 'Coming Soon' },
        ].map((widget, index) => (
          <motion.div
            key={widget.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <GlassCard className="h-48 flex flex-col justify-center items-center text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {widget.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {widget.subtitle}
              </p>
              <span className="px-3 py-1 bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded-full text-sm">
                {widget.status}
              </span>
            </GlassCard>
          </motion.div>
        ))}
      </div>
      </div>
    </ProtectedRoute>
  )
}