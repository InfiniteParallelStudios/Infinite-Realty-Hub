'use client'

import { SettingsLayout } from '@/components/settings/settings-layout'
import { GlassCard } from '@/components/ui/glass-card'
import { useTheme } from '@/contexts/theme-context'
import { motion } from 'framer-motion'
import { Palette, Monitor, Sun, Moon, Layout, Eye } from 'lucide-react'

export default function AppearanceSettingsPage() {
  const { theme, toggleTheme } = useTheme()

  const themeOptions = [
    {
      id: 'light',
      name: 'Light Mode',
      description: 'Clean and bright interface',
      icon: Sun,
      preview: 'bg-white border-gray-200'
    },
    {
      id: 'dark', 
      name: 'Dark Mode',
      description: 'Easy on the eyes, great for focus',
      icon: Moon,
      preview: 'bg-gray-900 border-gray-700'
    },
    {
      id: 'auto',
      name: 'System Default',
      description: 'Follows your device settings',
      icon: Monitor,
      preview: 'bg-gradient-to-r from-white to-gray-900 border-gray-400'
    }
  ]

  const layoutOptions = [
    {
      id: 'compact',
      name: 'Compact',
      description: 'More content, less spacing',
      selected: false
    },
    {
      id: 'comfortable',
      name: 'Comfortable',
      description: 'Balanced spacing and content',
      selected: true
    },
    {
      id: 'spacious',
      name: 'Spacious',
      description: 'Extra breathing room',
      selected: false
    }
  ]

  return (
    <SettingsLayout
      title="Appearance"
      description="Customize your app theme and layout"
      icon={<Palette className="w-6 h-6 text-cyan-400" />}
    >
      <div className="space-y-6">
        {/* Theme Selection */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <Palette className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Color Theme
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themeOptions.map((option) => (
              <motion.button
                key={option.id}
                onClick={() => {
                  if (option.id !== 'auto') {
                    if ((option.id === 'dark' && theme === 'light') || (option.id === 'light' && theme === 'dark')) {
                      toggleTheme()
                    }
                  }
                }}
                className={`p-4 rounded-lg border-2 transition-all text-left group ${
                  (option.id === theme) || (option.id === 'dark' && theme === 'dark') || (option.id === 'light' && theme === 'light')
                    ? 'border-cyan-400 bg-cyan-500/10' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-cyan-400/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg border ${option.preview} flex items-center justify-center`}>
                    <option.icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {option.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                </div>
                
                {/* Theme Preview */}
                <div className="h-16 rounded border overflow-hidden">
                  <div className={`h-full ${option.preview} flex items-center justify-center`}>
                    <div className="text-xs text-gray-500">Preview</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </GlassCard>

        {/* Dashboard Layout */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <Layout className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Dashboard Layout
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {layoutOptions.map((option) => (
              <motion.button
                key={option.id}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  option.selected 
                    ? 'border-cyan-400 bg-cyan-500/10' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-cyan-400/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {option.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {option.description}
                </p>
                
                {/* Layout Preview */}
                <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded border flex gap-1 p-1">
                  <div className="flex-1 bg-white dark:bg-gray-700 rounded"></div>
                  <div className="flex-1 bg-white dark:bg-gray-700 rounded"></div>
                  <div className="flex-1 bg-white dark:bg-gray-700 rounded"></div>
                </div>
              </motion.button>
            ))}
          </div>
        </GlassCard>

        {/* Widget Preferences */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <Eye className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Widget Preferences
            </h3>
          </div>
          
          <div className="space-y-4">
            {[
              {
                name: 'Show Quick Stats',
                description: 'Display overview statistics on dashboard',
                enabled: true
              },
              {
                name: 'Show Recent Activity',
                description: 'Display recent contact interactions',
                enabled: true
              },
              {
                name: 'Show Calendar Widget',
                description: 'Display upcoming appointments and tasks',
                enabled: false
              },
              {
                name: 'Show Market Data',
                description: 'Display local market insights',
                enabled: false
              },
              {
                name: 'Compact Navigation',
                description: 'Use smaller navigation elements',
                enabled: false
              }
            ].map((widget, index) => (
              <motion.div
                key={widget.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {widget.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {widget.description}
                  </p>
                </div>
                
                <motion.button
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    widget.enabled ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
                    animate={{
                      x: widget.enabled ? 24 : 2
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Accessibility */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <Eye className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Accessibility
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  High Contrast Mode
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Increase contrast for better visibility
                </p>
              </div>
              <motion.button
                className="relative w-12 h-6 rounded-full bg-gray-300 dark:bg-gray-600 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Reduce Motion
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Minimize animations and transitions
                </p>
              </div>
              <motion.button
                className="relative w-12 h-6 rounded-full bg-gray-300 dark:bg-gray-600 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Font Size
              </label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">Small</span>
                <input
                  type="range"
                  min="0"
                  max="2"
                  defaultValue="1"
                  className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Large</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </SettingsLayout>
  )
}