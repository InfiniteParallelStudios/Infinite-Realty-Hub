'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { motion } from 'framer-motion'
import { User, Palette, Bell, Shield, CreditCard, HelpCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function SettingsPage() {
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState({ title: '', content: '' })

  const handlePrivacyPolicy = () => {
    setModalContent({
      title: 'Privacy Policy',
      content: `Last updated: August 2025

At Infinite Realty Hub, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information.

Information We Collect:
• Personal information (name, email, phone number)
• Professional details (license number, brokerage)
• Usage data and analytics
• Contact and lead information you input

How We Use Your Information:
• To provide and improve our services
• To communicate with you about your account
• To analyze usage patterns and improve functionality
• To comply with legal obligations

Data Security:
We use industry-standard encryption and security measures to protect your data. Your information is stored securely and is never shared with third parties without your consent.

Contact Us:
If you have questions about this Privacy Policy, please contact us at privacy@infiniterealtyhub.com`
    })
    setShowModal(true)
  }

  const handleTermsOfService = () => {
    setModalContent({
      title: 'Terms of Service',
      content: `Last updated: August 2025

Welcome to Infinite Realty Hub. By using our service, you agree to these terms.

Acceptable Use:
• Use the service only for lawful real estate business purposes
• Do not share your account credentials
• Respect the intellectual property rights of others
• Do not attempt to access unauthorized areas

Service Availability:
• We strive for 99.9% uptime but cannot guarantee uninterrupted service
• Scheduled maintenance will be announced in advance
• Beta features may have limited availability

Account Responsibilities:
• You are responsible for maintaining the confidentiality of your account
• You must provide accurate and current information
• You are responsible for all activities under your account

Limitation of Liability:
Infinite Realty Hub is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of our service.

Contact Us:
For questions about these Terms, contact us at legal@infiniterealtyhub.com`
    })
    setShowModal(true)
  }

  const handleAbout = () => {
    setModalContent({
      title: 'About Infinite Realty Hub',
      content: `Infinite Realty Hub v1.0.0 Beta

Infinite Realty Hub is an AI-powered real estate platform designed to streamline your business operations and boost productivity.

Key Features:
• CRM & Contact Management
• Lead Pipeline Tracking
• Market Analytics & Insights
• AI-Powered Recommendations
• Document Management
• Transaction Tracking

Our Mission:
To empower real estate professionals with cutting-edge technology that simplifies complex workflows and drives business growth.

Technology Stack:
• Next.js 15 with App Router
• Supabase for backend services
• Tailwind CSS for styling
• Framer Motion for animations
• Modern React patterns

Development Team:
Built with passion by developers who understand the real estate industry.

Support:
For technical support or feature requests, visit our support center or contact us at support@infiniterealtyhub.com`
    })
    setShowModal(true)
  }

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
            <button 
              onClick={handlePrivacyPolicy}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={handleTermsOfService}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Terms of Service
            </button>
            <button 
              onClick={handleAbout}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              About
            </button>
          </div>
        </div>
      </GlassCard>
      </div>

      {/* Modal for Privacy Policy, Terms, and About */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-200 dark:border-gray-800"
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {modalContent.title}
              </h3>
              <div className="text-gray-600 dark:text-gray-400 whitespace-pre-line text-sm leading-relaxed">
                {modalContent.content}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </ProtectedRoute>
  )
}