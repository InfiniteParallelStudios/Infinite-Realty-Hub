'use client'

import { useState } from 'react'
import { SettingsLayout } from '@/components/settings/settings-layout'
import { GlassCard } from '@/components/ui/glass-card'
import { useAuth } from '@/contexts/auth-context'
import { motion } from 'framer-motion'
import { Shield, Key, Smartphone, Eye, EyeOff, AlertTriangle, Check, Globe } from 'lucide-react'

export default function SecuritySettingsPage() {
  const {} = useAuth()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [sessions] = useState([
    {
      id: '1',
      device: 'MacBook Pro',
      location: 'San Francisco, CA',
      lastActive: '2 minutes ago',
      current: true
    },
    {
      id: '2', 
      device: 'iPhone 15 Pro',
      location: 'San Francisco, CA',
      lastActive: '1 hour ago',
      current: false
    },
    {
      id: '3',
      device: 'Chrome - Windows',
      location: 'Los Angeles, CA', 
      lastActive: '2 days ago',
      current: false
    }
  ])

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <SettingsLayout
      title="Privacy & Security"
      description="Manage your data and security settings"
      icon={<Shield className="w-6 h-6 text-cyan-400" />}
    >
      <div className="space-y-6">
        {/* Account Security Overview */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Security Overview
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Strong Password</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your password meets security requirements</p>
            </div>
            
            <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">2FA Recommended</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Enable two-factor authentication</p>
            </div>
            
            <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <Globe className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Secure Connection</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">All data is encrypted in transit</p>
            </div>
          </div>
        </GlassCard>

        {/* Change Password */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <Key className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Change Password
            </h3>
          </div>
          
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.current}
                  onChange={(e) => handlePasswordChange('current', e.target.value)}
                  className="w-full px-3 py-2 pr-10 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.new}
                  onChange={(e) => handlePasswordChange('new', e.target.value)}
                  className="w-full px-3 py-2 pr-10 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
              />
            </div>
            
            <motion.button
              className="w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Update Password
            </motion.button>
          </div>
        </GlassCard>

        {/* Two-Factor Authentication */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Two-Factor Authentication
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Authenticator App
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use an authenticator app like Google Authenticator or Authy
                </p>
              </div>
              <motion.button
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  twoFactorEnabled ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
                  animate={{
                    x: twoFactorEnabled ? 24 : 2
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </div>
            
            {twoFactorEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg"
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Setup Instructions
                </h4>
                <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Download an authenticator app on your phone</li>
                  <li>Scan the QR code with your authenticator app</li>
                  <li>Enter the 6-digit code from your app below</li>
                </ol>
                
                <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
                  <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 mx-auto mb-2 rounded flex items-center justify-center">
                    QR Code
                  </div>
                  <p className="text-xs text-gray-500">Scan this QR code with your authenticator app</p>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    className="w-32 px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors text-center"
                  />
                  <motion.button
                    className="ml-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Verify
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </GlassCard>

        {/* Active Sessions */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Active Sessions
            </h3>
          </div>
          
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  session.current 
                    ? 'border-cyan-400 bg-cyan-500/10' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {session.device}
                      </h4>
                      {session.current && (
                        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-full text-xs">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {session.location} • Last active {session.lastActive}
                    </p>
                  </div>
                </div>
                
                {!session.current && (
                  <motion.button
                    className="px-3 py-1 text-red-500 hover:bg-red-500/10 rounded-lg text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Revoke
                  </motion.button>
                )}
              </motion.div>
            ))}
            
            <motion.button
              className="w-full px-4 py-2 text-red-500 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign out of all other sessions
            </motion.button>
          </div>
        </GlassCard>

        {/* Data Privacy */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Data Privacy
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Download Your Data
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Get a copy of all your data including contacts, interactions, and preferences.
              </p>
              <motion.button
                className="px-4 py-2 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/30 rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Request Data Export
              </motion.button>
            </div>
            
            <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-red-700 dark:text-red-400">
                Delete Account
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <motion.button
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Delete Account
              </motion.button>
            </div>
          </div>
        </GlassCard>
      </div>
    </SettingsLayout>
  )
}