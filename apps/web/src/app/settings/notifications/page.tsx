'use client'

import { useState } from 'react'
import { SettingsLayout } from '@/components/settings/settings-layout'
import { GlassCard } from '@/components/ui/glass-card'
import { motion } from 'framer-motion'
import { Bell, Mail, MessageSquare, Volume2 } from 'lucide-react'

interface NotificationSetting {
  id: string
  name: string
  description: string
  email: boolean
  push: boolean
  sms: boolean
}

export default function NotificationsSettingsPage() {
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: 'new_contacts',
      name: 'New Contacts',
      description: 'When new contacts are added to your CRM',
      email: true,
      push: true,
      sms: false
    },
    {
      id: 'lead_updates',
      name: 'Lead Updates',
      description: 'When leads move through your pipeline',
      email: true,
      push: true,
      sms: true
    },
    {
      id: 'appointments',
      name: 'Appointments',
      description: 'Reminders for upcoming appointments',
      email: true,
      push: true,
      sms: true
    },
    {
      id: 'task_reminders',
      name: 'Task Reminders',
      description: 'When tasks are due or overdue',
      email: true,
      push: true,
      sms: false
    },
    {
      id: 'market_updates',
      name: 'Market Updates',
      description: 'Weekly market data and insights',
      email: true,
      push: false,
      sms: false
    },
    {
      id: 'system_updates',
      name: 'System Updates',
      description: 'App updates and maintenance notifications',
      email: true,
      push: false,
      sms: false
    }
  ])

  const [generalSettings, setGeneralSettings] = useState({
    doNotDisturb: false,
    quietHours: true,
    quietStart: '22:00',
    quietEnd: '08:00',
    soundEnabled: true,
    emailDigest: 'daily'
  })

  const toggleNotification = (id: string, type: 'email' | 'push' | 'sms') => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id 
          ? { ...notif, [type]: !notif[type] }
          : notif
      )
    )
  }

  const NotificationToggle = ({ enabled, onChange }: { enabled: boolean, onChange: () => void }) => (
    <motion.button
      onClick={onChange}
      className={`relative w-10 h-6 rounded-full transition-colors ${
        enabled ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'
      }`}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
        animate={{
          x: enabled ? 18 : 2
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </motion.button>
  )

  return (
    <SettingsLayout
      title="Notifications"
      description="Control how you receive updates"
      icon={<Bell className="w-6 h-6 text-cyan-400" />}
    >
      <div className="space-y-6">
        {/* General Settings */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              General Settings
            </h3>
          </div>
          
          <div className="space-y-6">
            {/* Do Not Disturb */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Do Not Disturb
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pause all notifications temporarily
                </p>
              </div>
              <NotificationToggle 
                enabled={generalSettings.doNotDisturb}
                onChange={() => setGeneralSettings(prev => ({ ...prev, doNotDisturb: !prev.doNotDisturb }))}
              />
            </div>
            
            {/* Quiet Hours */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Quiet Hours
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reduce notifications during specified hours
                  </p>
                </div>
                <NotificationToggle 
                  enabled={generalSettings.quietHours}
                  onChange={() => setGeneralSettings(prev => ({ ...prev, quietHours: !prev.quietHours }))}
                />
              </div>
              
              {generalSettings.quietHours && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-2 gap-4 ml-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={generalSettings.quietStart}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, quietStart: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={generalSettings.quietEnd}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, quietEnd: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
                    />
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Sound */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Notification Sounds
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Play sounds for notifications
                  </p>
                </div>
              </div>
              <NotificationToggle 
                enabled={generalSettings.soundEnabled}
                onChange={() => setGeneralSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
              />
            </div>
            
            {/* Email Digest */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Digest Frequency
              </label>
              <select
                value={generalSettings.emailDigest}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, emailDigest: e.target.value }))}
                className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
              >
                <option value="never">Never</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Receive a summary of your activity and important updates</p>
            </div>
          </div>
        </GlassCard>

        {/* Notification Types */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notification Types
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notification
                  </th>
                  <th className="text-center py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center justify-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                  </th>
                  <th className="text-center py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center justify-center gap-1">
                      <Bell className="w-4 h-4" />
                      Push
                    </div>
                  </th>
                  <th className="text-center py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center justify-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      SMS
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification, index) => (
                  <motion.tr
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                  >
                    <td className="py-4 pr-4">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {notification.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {notification.description}
                        </p>
                      </div>
                    </td>
                    <td className="text-center py-4">
                      <NotificationToggle 
                        enabled={notification.email}
                        onChange={() => toggleNotification(notification.id, 'email')}
                      />
                    </td>
                    <td className="text-center py-4">
                      <NotificationToggle 
                        enabled={notification.push}
                        onChange={() => toggleNotification(notification.id, 'push')}
                      />
                    </td>
                    <td className="text-center py-4">
                      <NotificationToggle 
                        enabled={notification.sms}
                        onChange={() => toggleNotification(notification.id, 'sms')}
                      />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Contact Methods */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <Mail className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Contact Methods
            </h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value="joshua.bray@infiniteparallelstudios.com"
                disabled
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1">This is your account email and cannot be changed here</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number (for SMS)
              </label>
              <input
                type="tel"
                placeholder="(555) 123-4567"
                className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Required for SMS notifications</p>
            </div>
          </div>
        </GlassCard>

        {/* Save Button */}
        <motion.div
          className="flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors shadow-lg shadow-cyan-500/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Save Notification Settings
          </motion.button>
        </motion.div>
      </div>
    </SettingsLayout>
  )
}