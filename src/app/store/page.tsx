'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { motion } from 'framer-motion'
import { ShoppingBag, Star, Download } from 'lucide-react'

export default function StorePage() {
  const apps = [
    {
      id: 'crm',
      name: 'CRM Module',
      description: 'Complete contact and relationship management',
      price: '$29/month',
      features: ['Contact Management', 'Communication Tracking', 'Tags & Categories', 'Import/Export'],
      status: 'available',
      rating: 4.9
    },
    {
      id: 'pipeline',
      name: 'Lead Pipeline',
      description: 'Visual lead tracking and conversion optimization',
      price: '$39/month',
      features: ['Pipeline Management', 'Lead Scoring', 'Conversion Analytics', 'Automated Follow-ups'],
      status: 'coming-soon',
      rating: 0
    },
    {
      id: 'scheduling',
      name: 'Scheduling System',
      description: 'Appointment and calendar management',
      price: '$19/month',
      features: ['Calendar Integration', 'Client Booking', 'Reminders', 'Availability Management'],
      status: 'coming-soon',
      rating: 0
    }
  ]

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          App Store
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Enhance your real estate business with powerful modules
        </p>
      </div>

      {/* My Subscriptions */}
      <GlassCard>
        <div className="flex items-center space-x-3 mb-4">
          <ShoppingBag className="w-6 h-6 text-hud-cyan" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            My Subscriptions
          </h2>
        </div>
        <div className="text-gray-600 dark:text-gray-400 text-center py-8">
          <p>No active subscriptions</p>
          <p className="text-sm mt-2">Subscribe to modules below to get started</p>
        </div>
      </GlassCard>

      {/* Available Apps */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app, index) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard variant="interactive" className="h-full">
              <div className="flex flex-col h-full">
                {/* App Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {app.name}
                    </h3>
                    {app.status === 'available' && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {app.rating}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-hud-cyan dark:text-hud-cyan">
                      {app.price}
                    </div>
                    {app.status === 'coming-soon' && (
                      <span className="text-xs text-gray-500">Coming Soon</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                  {app.description}
                </p>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Features:
                  </h4>
                  <ul className="space-y-1">
                    {app.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <div className="w-1.5 h-1.5 bg-hud-blue rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                    app.status === 'available'
                      ? 'bg-hud-blue hover:bg-hud-electric text-white shadow-hud-glow'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={app.status === 'coming-soon'}
                >
                  {app.status === 'available' ? (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Subscribe</span>
                    </>
                  ) : (
                    <span>Coming Soon</span>
                  )}
                </button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
      </div>
    </ProtectedRoute>
  )
}