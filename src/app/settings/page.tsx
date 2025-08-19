'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { motion } from 'framer-motion'
import { User, Palette, Bell, Shield, CreditCard, HelpCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {

  const settingsSections = [
    {
      icon: User,
      title: 'Account Information',
      description: 'Manage your profile and personal details',
      items: ['Profile Settings', 'Contact Information', 'License Details'],
      href: '/settings/account'
    },
    {
      icon: Palette,
      title: 'Appearance',
      description: 'Customize your app theme and layout',
      items: ['Theme Selection', 'Dashboard Layout', 'Widget Preferences'],
      href: '/settings/appearance'
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Control how you receive updates',
      items: ['Email Notifications', 'SMS Alerts', 'Push Notifications'],
      href: '/settings/notifications'
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'Manage your data and security settings',
      items: ['Password', 'Two-Factor Auth', 'Data Privacy'],
      href: '/settings/security'
    },
    {
      icon: CreditCard,
      title: 'Billing',
      description: 'Manage subscriptions and payment methods',
      items: ['Payment Methods', 'Subscription History', 'Invoices'],
      href: '/settings/billing'
    },
    {
      icon: HelpCircle,
      title: 'Support',
      description: 'Get help and contact support',
      items: ['Help Center', 'Contact Support', 'Feature Requests'],
      href: '/settings/support'
    }
  ]

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your Infinite Realty Hub experience
        </p>
      </div>


      {/* Settings Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        {settingsSections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={section.href}>
              <GlassCard variant="interactive" className="h-full group">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-cyan-500/20 rounded-lg border border-cyan-400/30">
                    <section.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {section.title}
                      </h3>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {section.description}
                    </p>
                    <ul className="space-y-1">
                      {section.items.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* App Information */}
      <GlassCard>
        <div className="text-center py-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Infinite Realty Hub
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Version 1.0.0 Beta
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Privacy Policy
            </button>
            <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Terms of Service
            </button>
            <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
              About
            </button>
          </div>
        </div>
      </GlassCard>
      </div>
    </ProtectedRoute>
  )
}