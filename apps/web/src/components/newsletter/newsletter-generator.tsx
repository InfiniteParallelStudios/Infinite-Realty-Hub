'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Send, 
  Calendar, 
  Users, 
  Eye, 
  Download,
  Settings,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { 
  marketDataService, 
  MarketInsight, 
  MarketDataPoint,
  NewsletterPreferences 
} from '@/services/market-data-service'
import { useAuth } from '@/contexts/auth-context'

interface NewsletterContent {
  subject: string
  marketInsights: MarketInsight[]
  regionData: MarketDataPoint[]
  personalMessage: string
  footerMessage: string
}

interface NewsletterGeneratorProps {
  contactList?: Array<{
    id: string
    name: string
    email: string
    role: 'client' | 'agent'
    location?: string
  }>
}

export function NewsletterGenerator({ contactList = [] }: NewsletterGeneratorProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [newsletterContent, setNewsletterContent] = useState<NewsletterContent | null>(null)
  const [preferences, setPreferences] = useState<NewsletterPreferences | null>(null)
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [previewMode, setPreviewMode] = useState(false)
  const [sendingStatus, setSendingStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  useEffect(() => {
    loadUserPreferences()
  }, [user])

  const loadUserPreferences = async () => {
    if (!user) return
    
    const prefs = await marketDataService.getNewsletterPreferences(user.id)
    setPreferences(prefs)
  }

  const generateNewsletter = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const weeklyData = await marketDataService.generateWeeklyNewsletter(user.id)
      
      const content: NewsletterContent = {
        subject: `Weekly Market Update - ${new Date().toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })}`,
        marketInsights: weeklyData.marketInsights,
        regionData: weeklyData.regionData,
        personalMessage: generatePersonalMessage(weeklyData.personalized),
        footerMessage: generateFooterMessage()
      }
      
      setNewsletterContent(content)
    } catch (error) {
      console.error('Error generating newsletter:', error)
    }
    setLoading(false)
  }

  const generatePersonalMessage = (personalized: boolean): string => {
    if (!user) return "Hello!"
    
    const agentName = user.user_metadata?.full_name || 'Your Real Estate Agent'
    
    if (personalized) {
      return `Hello from ${agentName}! Here's your personalized weekly market update based on the areas you're interested in. I've included the latest trends and insights to help you stay informed about your local real estate market.`
    } else {
      return `Hello from ${agentName}! Here's this week's general market update. If you'd like to receive personalized insights for specific areas, just let me know and I'll customize future newsletters for you.`
    }
  }

  const generateFooterMessage = (): string => {
    const agentName = user?.user_metadata?.full_name || 'Your Real Estate Agent'
    return `Questions about the market? I'm here to help! Contact ${agentName} for personalized real estate guidance.`
  }

  const handleRecipientToggle = (contactId: string) => {
    setSelectedRecipients(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const handleSelectAll = () => {
    if (selectedRecipients.length === contactList.length) {
      setSelectedRecipients([])
    } else {
      setSelectedRecipients(contactList.map(contact => contact.id))
    }
  }

  const sendNewsletter = async () => {
    if (!newsletterContent || selectedRecipients.length === 0) return
    
    setSendingStatus('sending')
    try {
      // Mock newsletter sending - in production, integrate with email service
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Here you would integrate with email service like:
      // - SendGrid
      // - AWS SES
      // - Mailgun
      // - Resend
      
      setSendingStatus('sent')
      setTimeout(() => setSendingStatus('idle'), 3000)
    } catch (error) {
      console.error('Error sending newsletter:', error)
      setSendingStatus('error')
      setTimeout(() => setSendingStatus('idle'), 3000)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <GlassCard>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Generating your weekly market newsletter...
          </p>
        </div>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Newsletter Controls */}
      <GlassCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-400/30">
                <Mail className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Weekly Market Newsletter
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate and send market updates to your contacts
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={generateNewsletter}
                disabled={loading}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Generate Newsletter
              </button>
            </div>
          </div>

          {/* Recipient Selection */}
          {contactList.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Recipients ({selectedRecipients.length} of {contactList.length} selected)
                </h4>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                  {selectedRecipients.length === contactList.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {contactList.map(contact => (
                  <label
                    key={contact.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRecipients.includes(contact.id)}
                      onChange={() => handleRecipientToggle(contact.id)}
                      className="w-4 h-4 text-cyan-400 bg-transparent border-gray-300 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {contact.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {contact.email} • {contact.role}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Newsletter Actions */}
          {newsletterContent && (
            <div className="flex gap-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-cyan-400/30 text-gray-900 dark:text-cyan-400 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                {previewMode ? 'Hide Preview' : 'Preview'}
              </button>
              
              <button
                onClick={sendNewsletter}
                disabled={selectedRecipients.length === 0 || sendingStatus === 'sending'}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {sendingStatus === 'sending' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : sendingStatus === 'sent' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Sent!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Newsletter
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Newsletter Preview */}
      {previewMode && newsletterContent && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-cyan-400" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Newsletter Preview
                </h4>
              </div>

              {/* Email Preview */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                {/* Email Header */}
                <div className="bg-cyan-500 text-white p-4">
                  <h2 className="text-xl font-bold mb-1">
                    {newsletterContent.subject}
                  </h2>
                  <p className="text-cyan-100 text-sm">
                    Weekly Market Update from {user?.user_metadata?.full_name || 'Your Agent'}
                  </p>
                </div>

                {/* Email Content */}
                <div className="p-6 space-y-6">
                  {/* Personal Message */}
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {newsletterContent.personalMessage}
                    </p>
                  </div>

                  {/* Market Insights */}
                  {newsletterContent.marketInsights.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        🎯 This Week's Market Insights
                      </h3>
                      <div className="space-y-3">
                        {newsletterContent.marketInsights.map((insight, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border ${
                              insight.severity === 'positive' 
                                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                                : insight.severity === 'negative'
                                ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                                : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                            }`}
                          >
                            <p className={`font-medium ${
                              insight.severity === 'positive' ? 'text-green-800 dark:text-green-300' :
                              insight.severity === 'negative' ? 'text-red-800 dark:text-red-300' :
                              'text-blue-800 dark:text-blue-300'
                            }`}>
                              {insight.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Regional Data */}
                  {newsletterContent.regionData.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        📊 Market Data Summary
                      </h3>
                      <div className="grid gap-4">
                        {newsletterContent.regionData.map((region, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {region.region}
                              </h4>
                              <span className="text-sm text-gray-500">
                                Updated {new Date(region.lastUpdated).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Median Price</span>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {formatCurrency(region.medianPrice)}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Avg Days</span>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {region.averageDaysOnMarket}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Inventory</span>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {region.inventoryLevel} homes
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Price Change</span>
                                <p className={`font-semibold ${
                                  region.priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {region.priceChangePercent >= 0 ? '+' : ''}{region.priceChangePercent.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {newsletterContent.footerMessage}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      You're receiving this because you're subscribed to weekly market updates. 
                      <a href="#" className="text-cyan-500 hover:text-cyan-400 ml-1">Unsubscribe</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}