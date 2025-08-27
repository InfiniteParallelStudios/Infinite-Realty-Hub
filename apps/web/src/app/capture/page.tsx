'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Building2, User, Mail, Phone, MessageSquare, Download, Check } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { HudBackground } from '@/components/ui/hud-background'
import { leadsStore } from '@/lib/leads-store'

interface AgentInfo {
  name: string
  email: string
  phone: string
  company: string
}

interface LeadData {
  firstName: string
  lastName: string
  email: string
  phone: string
  message: string
  interestedIn: string
}

function CaptureFormContent() {
  const searchParams = useSearchParams()
  const [agentInfo, setAgentInfo] = useState<AgentInfo>({
    name: '',
    email: '',
    phone: '',
    company: ''
  })
  const [leadData, setLeadData] = useState<LeadData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    interestedIn: 'buying'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showContactCard, setShowContactCard] = useState(false)

  useEffect(() => {
    // Get agent info from URL parameters
    setAgentInfo({
      name: searchParams.get('agent_name') || 'Real Estate Agent',
      email: searchParams.get('agent_email') || '',
      phone: searchParams.get('agent_phone') || '',
      company: searchParams.get('agent_company') || 'Infinite Realty Hub'
    })
  }, [searchParams])

  const handleInputChange = (field: keyof LeadData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setLeadData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Save lead to store
      const savedLead = leadsStore.addLead({
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        email: leadData.email,
        phone: leadData.phone,
        message: leadData.message,
        interestedIn: leadData.interestedIn,
        agentInfo: agentInfo
      })
      
      console.log('✅ Lead captured and saved:', savedLead)
      
      setIsSubmitted(true)
      setShowContactCard(true)
    } catch (error) {
      console.error('❌ Error submitting lead:', error)
      alert('There was an error submitting your information. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateVCard = () => {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${agentInfo.name}`,
      `ORG:${agentInfo.company}`,
      `TEL:${agentInfo.phone}`,
      `EMAIL:${agentInfo.email}`,
      `TITLE:Real Estate Agent`,
      'END:VCARD'
    ].join('\n')
    
    const blob = new Blob([vcard], { type: 'text/vcard' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${agentInfo.name.replace(/\s+/g, '_')}.vcf`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <HudBackground />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg"
          >
            <GlassCard className="p-6 sm:p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30"
              >
                <Check className="w-8 h-8 text-green-400" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Thank You!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your information has been sent to {agentInfo.name}. They will contact you soon!
              </p>

              {/* Agent Contact Card */}
              <div className="bg-white/10 dark:bg-gray-800/30 rounded-lg p-4 mb-6 border border-cyan-400/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {agentInfo.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {agentInfo.company}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-left">
                  {agentInfo.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-cyan-400" />
                      <a href={`tel:${agentInfo.phone}`} className="text-cyan-400 hover:text-cyan-300">
                        {agentInfo.phone}
                      </a>
                    </div>
                  )}
                  {agentInfo.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      <a href={`mailto:${agentInfo.email}`} className="text-cyan-400 hover:text-cyan-300">
                        {agentInfo.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <motion.button
                onClick={generateVCard}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-5 h-5" />
                Save Contact to Phone
              </motion.button>

              <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                Click the button above to add {agentInfo.name} to your contacts
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <HudBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <GlassCard className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/20 rounded-xl border border-cyan-400/30 mb-4"
              >
                <Building2 className="w-8 h-8 text-cyan-400" />
              </motion.div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Connect with {agentInfo.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {agentInfo.company}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Let us know how we can help you with your real estate needs
              </p>
            </div>

            {/* Lead Capture Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={leadData.firstName}
                    onChange={handleInputChange('firstName')}
                    required
                    className="w-full px-3 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-base"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={leadData.lastName}
                    onChange={handleInputChange('lastName')}
                    required
                    className="w-full px-3 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-base"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={leadData.email}
                  onChange={handleInputChange('email')}
                  required
                  className="w-full px-3 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-base"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={leadData.phone}
                  onChange={handleInputChange('phone')}
                  required
                  className="w-full px-3 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-base"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  I'm interested in:
                </label>
                <select
                  value={leadData.interestedIn}
                  onChange={handleInputChange('interestedIn')}
                  className="w-full px-3 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-base"
                >
                  <option value="buying">Buying a home</option>
                  <option value="selling">Selling a home</option>
                  <option value="renting">Renting a property</option>
                  <option value="investing">Real estate investing</option>
                  <option value="consultation">Free consultation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MessageSquare className="inline w-4 h-4 mr-2" />
                  Message (Optional)
                </label>
                <textarea
                  value={leadData.message}
                  onChange={handleInputChange('message')}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-base resize-none"
                  placeholder="Tell us about your real estate needs..."
                />
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-300 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Connect with {agentInfo.name}
                  </>
                )}
              </motion.button>
            </form>

            <p className="text-xs text-gray-500 dark:text-gray-500 mt-4 text-center">
              Your information is secure and will only be shared with {agentInfo.name}
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}

export default function CapturePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    }>
      <CaptureFormContent />
    </Suspense>
  )
}