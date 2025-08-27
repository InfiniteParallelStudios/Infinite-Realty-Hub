'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  QrCode, 
  User, 
  Mail, 
  Phone, 
  MessageSquare, 
  Calendar,
  Star,
  Archive,
  Edit,
  Eye,
  ArrowRight,
  Building,
  DollarSign
} from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { GlassCard } from '@/components/ui/glass-card'
import { useAuth } from '@/contexts/auth-context'
import { leadsStore, CapturedLead } from '@/lib/leads-store'

export default function QRLeadsPage() {
  const { user } = useAuth()
  const [leads, setLeads] = useState<CapturedLead[]>([])
  const [selectedLead, setSelectedLead] = useState<CapturedLead | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Get leads for current user
    if (user?.email) {
      const userLeads = leadsStore.getLeadsByAgent(user.email)
      setLeads(userLeads)
    }
    
    // For demo purposes, also get leads for John Doe
    const demoLeads = leadsStore.getLeadsByAgent('john.doe@email.com')
    setLeads(prev => [...prev, ...demoLeads])
  }, [user])

  const handleViewDetails = (lead: CapturedLead) => {
    setSelectedLead(lead)
    setShowDetails(true)
  }

  const handleAddToPipeline = (lead: CapturedLead) => {
    const pipelineLead = leadsStore.convertToPipelineLead(lead)
    console.log('📋 Converting to pipeline lead:', pipelineLead)
    
    // In a real app, this would add to the actual pipeline
    // For now, we'll just update the stage
    leadsStore.updateLeadStage(lead.id, 'contacted')
    
    // Refresh leads
    const updatedLeads = leadsStore.getLeadsByAgent(user?.email || 'john.doe@email.com')
    setLeads(updatedLeads)
    
    alert(`${lead.firstName} ${lead.lastName} has been added to your pipeline!`)
  }

  const handleArchiveLead = (leadId: string) => {
    leadsStore.deleteLead(leadId)
    const updatedLeads = leadsStore.getLeadsByAgent(user?.email || 'john.doe@email.com')
    setLeads(updatedLeads)
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'new': return 'bg-blue-500'
      case 'contacted': return 'bg-yellow-500'
      case 'qualified': return 'bg-purple-500'
      case 'showing': return 'bg-orange-500'
      case 'offer': return 'bg-pink-500'
      case 'negotiating': return 'bg-indigo-500'
      case 'closed': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              QR Code Leads
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage leads captured from your QR codes
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{leads.length}</div>
            <div className="text-sm text-gray-500">Total Leads</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {leads.filter(l => l.stage === 'new').length}
                </div>
                <div className="text-sm text-gray-500">New Leads</div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {leads.filter(l => l.stage === 'contacted').length}
                </div>
                <div className="text-sm text-gray-500">Contacted</div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {leads.filter(l => l.interestedIn === 'buying').length}
                </div>
                <div className="text-sm text-gray-500">Buyers</div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {leads.filter(l => l.interestedIn === 'selling').length}
                </div>
                <div className="text-sm text-gray-500">Sellers</div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Leads List */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-400/30">
              <QrCode className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Recent QR Leads
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Leads captured from your QR codes
              </p>
            </div>
          </div>

          {leads.length === 0 ? (
            <div className="text-center py-12">
              <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No QR Leads Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create QR codes and share them to start capturing leads
              </p>
              <motion.button
                onClick={() => window.location.href = '/qr-generator'}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Create QR Code
              </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-cyan-400/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-400/30">
                        <User className="w-6 h-6 text-cyan-400" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {lead.firstName} {lead.lastName}
                          </h3>
                          <span className="text-sm">{getPriorityIcon(lead.priority)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStageColor(lead.stage)}`}>
                            {lead.stage.charAt(0).toUpperCase() + lead.stage.slice(1)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {lead.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {lead.phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            Interested in {lead.interestedIn}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {lead.capturedAt.toLocaleDateString()}
                          </div>
                        </div>

                        {lead.message && (
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <MessageSquare className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Message:</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {lead.message}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <motion.button
                        onClick={() => handleViewDetails(lead)}
                        className="p-2 text-gray-600 hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>

                      {lead.stage === 'new' && (
                        <motion.button
                          onClick={() => handleAddToPipeline(lead)}
                          className="p-2 text-gray-600 hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Add to Pipeline"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.button>
                      )}

                      <motion.button
                        onClick={() => handleArchiveLead(lead.id)}
                        className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Archive Lead"
                      >
                        <Archive className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Lead Details Modal */}
        <AnimatePresence>
          {showDetails && selectedLead && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Lead Details
                    </h3>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedLead.firstName} {selectedLead.lastName}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          Interested in {selectedLead.interestedIn}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Contact Info</h5>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">{selectedLead.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">{selectedLead.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Lead Info</h5>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">Source: QR Code</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {selectedLead.capturedAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedLead.message && (
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Message</h5>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <p className="text-gray-700 dark:text-gray-300">{selectedLead.message}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={() => setShowDetails(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                    {selectedLead.stage === 'new' && (
                      <button
                        onClick={() => {
                          handleAddToPipeline(selectedLead)
                          setShowDetails(false)
                        }}
                        className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors"
                      >
                        Add to Pipeline
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  )
}