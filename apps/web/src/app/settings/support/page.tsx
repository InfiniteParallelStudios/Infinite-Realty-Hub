'use client'

import { useState } from 'react'
import { SettingsLayout } from '@/components/settings/settings-layout'
import { GlassCard } from '@/components/ui/glass-card'
import { motion } from 'framer-motion'
import { 
  HelpCircle, 
  MessageCircle, 
  BookOpen, 
  Video, 
  ExternalLink,
  Send,
  Clock,
  User,
  Mail,
  Phone
} from 'lucide-react'

export default function SupportSettingsPage() {
  const [supportForm, setSupportForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: ''
  })

  const [tickets] = useState([
    {
      id: 'TKT-001',
      subject: 'Issues with contact syncing',
      status: 'open',
      priority: 'high',
      created: '2025-01-15',
      lastUpdate: '2 hours ago'
    },
    {
      id: 'TKT-002',
      subject: 'Feature request: Dark mode',
      status: 'closed',
      priority: 'low',
      created: '2025-01-10',
      lastUpdate: '3 days ago'
    }
  ])

  const handleInputChange = (field: string, value: string) => {
    setSupportForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const supportOptions = [
    {
      icon: BookOpen,
      title: 'Help Center',
      description: 'Browse our comprehensive documentation and guides',
      action: 'Visit Help Center',
      href: '#'
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides for all features',
      action: 'Watch Videos',
      href: '#'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      action: 'Start Chat',
      href: '#',
      status: 'Online'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Call us for urgent issues (Professional+ plans)',
      action: 'Call Now',
      href: 'tel:+1-555-REALTY',
      phone: '+1 (555) REALTY-1'
    }
  ]

  const faqItems = [
    {
      question: 'How do I import my existing contacts?',
      answer: 'You can import contacts from CSV files, Google Contacts, or other CRM systems. Go to Contacts > Import and follow the guided process.'
    },
    {
      question: 'Can I customize the lead pipeline stages?',
      answer: 'Yes! Professional and higher plans allow you to customize pipeline stages. Go to Settings > Pipeline to configure your stages.'
    },
    {
      question: 'How does billing work?',
      answer: 'We bill monthly or yearly based on your chosen plan. You can upgrade, downgrade, or cancel at any time from your billing settings.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use enterprise-grade security including SSL encryption, SOC 2 compliance, and regular security audits to protect your data.'
    },
    {
      question: 'Can I integrate with other tools?',
      answer: 'We support integrations with popular tools like Gmail, Outlook, Zapier, and many real estate platforms. Check our integrations page for the full list.'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-yellow-600 bg-yellow-500/20'
      case 'closed': return 'text-green-600 bg-green-500/20'
      case 'pending': return 'text-blue-600 bg-blue-500/20'
      default: return 'text-gray-600 bg-gray-500/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-500/20'
      case 'medium': return 'text-yellow-600 bg-yellow-500/20'
      case 'low': return 'text-green-600 bg-green-500/20'
      default: return 'text-gray-600 bg-gray-500/20'
    }
  }

  return (
    <SettingsLayout
      title="Support"
      description="Get help and contact support"
      icon={<HelpCircle className="w-6 h-6 text-cyan-400" />}
    >
      <div className="space-y-6">
        {/* Quick Support Options */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Get Help
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supportOptions.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-cyan-400/50 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <option.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {option.title}
                      </h4>
                      {option.status && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-xs">
                          {option.status}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {option.description}
                    </p>
                    {option.phone && (
                      <p className="text-sm font-mono text-gray-900 dark:text-white mb-3">
                        {option.phone}
                      </p>
                    )}
                    <motion.button
                      className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {option.action}
                      <ExternalLink className="w-3 h-3" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Create Support Ticket */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Create Support Ticket
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={supportForm.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Brief description of your issue"
                  className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={supportForm.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
                >
                  <option value="">Select category</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="account">Account Issues</option>
                  <option value="billing">Billing Questions</option>
                  <option value="technical">Technical Support</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <div className="flex gap-2">
                {['low', 'medium', 'high'].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => handleInputChange('priority', priority)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      supportForm.priority === priority
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={supportForm.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Please provide as much detail as possible about your issue..."
                className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
              />
            </div>
            
            <motion.button
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-4 h-4" />
              Submit Ticket
            </motion.button>
          </div>
        </GlassCard>

        {/* My Tickets */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              My Support Tickets
            </h3>
          </div>
          
          <div className="space-y-3">
            {tickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-cyan-400/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                      {ticket.id}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {ticket.lastUpdate}
                  </span>
                </div>
                
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {ticket.subject}
                </h4>
                
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Created {new Date(ticket.created).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Frequently Asked Questions */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h3>
          </div>
          
          <div className="space-y-4">
            {faqItems.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {faq.question}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Contact Information */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Contact Information
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Mail className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Email</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                support@infiniteparallelstudios.com
              </p>
            </div>
            
            <div className="text-center">
              <Phone className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Phone</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                +1 (555) REALTY-1
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Professional+ plans only
              </p>
            </div>
            
            <div className="text-center">
              <Clock className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Hours</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mon-Fri: 9 AM - 6 PM PST
              </p>
              <p className="text-xs text-gray-500 mt-1">
                24/7 email support
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </SettingsLayout>
  )
}