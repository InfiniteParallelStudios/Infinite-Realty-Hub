'use client'

import { useState, useEffect, useCallback } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { NewsletterGenerator } from '@/components/newsletter/newsletter-generator'
import { RadiusSearchWidget } from '@/components/market-data/radius-search-widget'
import { MarketInsightsWidget } from '@/components/market-data/market-insights-widget'
import { ApiStatusWidget } from '@/components/market-data/api-status-widget'
import { GlassCard } from '@/components/ui/glass-card'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { motion } from 'framer-motion'
import { Mail, Users, TrendingUp, MapPin } from 'lucide-react'

export default function NewsletterPage() {
  const { user } = useAuth()
  const [contacts, setContacts] = useState<Array<{
    id: string
    name: string
    email: string
    role: 'client'
    location?: string
  }>>([])
  const [loading, setLoading] = useState(true)

  const loadContacts = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, email, phone, address')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Contacts table not accessible, using demo data:', error.message)
        // Use demo contacts if table doesn't exist or has access issues
        const demoContacts = [
          {
            id: '1',
            name: 'John Smith',
            email: 'john@example.com',
            role: 'client' as const,
            location: 'New York, NY'
          },
          {
            id: '2', 
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            role: 'client' as const,
            location: 'Los Angeles, CA'
          },
          {
            id: '3',
            name: 'Mike Davis',
            email: 'mike@example.com', 
            role: 'client' as const,
            location: 'Miami, FL'
          }
        ]
        setContacts(demoContacts)
        return
      }

      // Format contacts for newsletter component
      const formattedContacts = data.map(contact => ({
        id: contact.id,
        name: `${contact.first_name} ${contact.last_name}`,
        email: contact.email,
        role: 'client' as const,
        location: contact.address
      }))

      setContacts(formattedContacts.length > 0 ? formattedContacts : [
        {
          id: 'demo1',
          name: 'Demo Contact',
          email: 'demo@example.com',
          role: 'client' as const,
          location: 'Sample City, ST'
        }
      ])
    } catch (error) {
      console.warn('Using demo contacts due to database access issues')
      // Set demo contacts array on error
      setContacts([
        {
          id: 'demo1',
          name: 'Demo Contact',
          email: 'demo@example.com',
          role: 'client' as const,
          location: 'Sample City, ST'
        }
      ])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadContacts()
  }, [user, loadContacts])

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="p-4 sm:p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
            <div className="h-48 bg-gray-300 rounded"></div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Market Newsletter
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Generate and send weekly market updates to your clients and contacts
            </p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-4 text-center">
              <Users className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {contacts.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Contacts
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-4 text-center">
              <Mail className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                Weekly
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Frequency
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                Live
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Market Data
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="p-4 text-center">
              <MapPin className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                Radius
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Search
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Newsletter Generator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <NewsletterGenerator contactList={contacts} />
        </motion.div>

        {/* Market Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Market Insights */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <MarketInsightsWidget showSettings={true} />
          </motion.div>

          {/* Radius Search */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <RadiusSearchWidget />
          </motion.div>
        </div>

        {/* API Status Monitoring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <ApiStatusWidget showDetails={true} />
        </motion.div>

        {/* Usage Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <GlassCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                How to Use the Newsletter System
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-cyan-400 font-bold text-xl">1</span>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Generate Newsletter
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click "Generate Newsletter" to create weekly market insights based on your preferences and contact locations.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-400 font-bold text-xl">2</span>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Select Recipients
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose which contacts should receive the newsletter. You can select all or specific clients and agents.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-400 font-bold text-xl">3</span>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Send & Track
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Preview your newsletter, then send it out. The system will track delivery and provide insights for future campaigns.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-400/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-cyan-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-cyan-300 mb-1">
                      Pro Tip: Radius Search
                    </h4>
                    <p className="text-sm text-cyan-200">
                      Use the radius search tool to find market data for specific areas where your contacts are looking to buy or sell. 
                      This creates highly personalized newsletters with relevant local market insights.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </ProtectedRoute>
  )
}