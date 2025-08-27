'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { 
  X,
  ArrowRight,
  User,
  DollarSign,
  Calendar,
  Save,
  Users,
  Crown,
  UserCheck
} from 'lucide-react'

interface AssignLeadModalProps {
  onClose: () => void
  onSuccess: () => void
  leadId: string
}

interface TeamMember {
  id: string
  full_name: string
  role: string
  avatar_url?: string
  contacts_count?: number
  leads_count?: number
}

interface Lead {
  id: string
  status: string
  lead_type: string
  estimated_value?: number
  expected_close_date?: string
  contact_id: string
  user_id: string
  contacts?: {
    full_name: string
    email: string
  }
  profiles?: {
    full_name: string
  }
}

export function AssignLeadModal({ onClose, onSuccess, leadId }: AssignLeadModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [lead, setLead] = useState<Lead | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [selectedMember, setSelectedMember] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (user && leadId) {
      fetchLeadData()
      fetchTeamMembers()
    }
  }, [user, leadId])

  const fetchLeadData = async () => {
    if (!user || !leadId) return

    try {
      const { data: leadData, error } = await supabase
        .from('leads')
        .select(`
          *,
          contacts (
            full_name,
            email
          ),
          profiles (
            full_name
          )
        `)
        .eq('id', leadId)
        .single()

      if (error) throw error
      setLead(leadData)
    } catch (error) {
      console.error('Error fetching lead:', error)
    }
  }

  const fetchTeamMembers = async () => {
    if (!user) return

    try {
      // Get current user's organization
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      if (profile.organization_id) {
        // Get all team members in the same organization
        const { data: members, error: membersError } = await supabase
          .from('profiles')
          .select('id, full_name, role, avatar_url')
          .eq('organization_id', profile.organization_id)
          .neq('id', user.id) // Exclude current user

        if (membersError) throw membersError

        // Get workload data for each member
        const membersWithWorkload = await Promise.all(
          members.map(async (member) => {
            const { data: contacts } = await supabase
              .from('contacts')
              .select('id')
              .eq('user_id', member.id)

            const { data: leads } = await supabase
              .from('leads')
              .select('id')
              .eq('user_id', member.id)
              .neq('status', 'closed_won')
              .neq('status', 'closed_lost')

            return {
              ...member,
              contacts_count: contacts?.length || 0,
              leads_count: leads?.length || 0
            }
          })
        )

        setTeamMembers(membersWithWorkload)
      }
    } catch (error) {
      console.error('Error fetching team members:', error)
    }
  }

  const handleAssign = async () => {
    if (!selectedMember || !lead) return

    setLoading(true)

    try {
      // Update the lead with new assignment
      const { error: leadError } = await supabase
        .from('leads')
        .update({
          user_id: selectedMember,
          transferred_from: lead.user_id
        })
        .eq('id', leadId)

      if (leadError) throw leadError

      // Log the assignment in communications if notes provided
      if (notes.trim()) {
        const { error: commError } = await supabase
          .from('communications')
          .insert({
            contact_id: lead.contact_id,
            user_id: user.id,
            type: 'note',
            subject: 'Lead Assignment',
            content: `Lead assigned to team member. Notes: ${notes.trim()}`,
            created_at: new Date().toISOString()
          })

        if (commError) {
          console.error('Error logging communication:', commError)
          // Don't fail the assignment if logging fails
        }
      }

      onSuccess()
    } catch (error) {
      console.error('Error assigning lead:', error)
      alert('Error assigning lead. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'broker':
      case 'admin':
        return <Crown className="w-4 h-4" />
      case 'team_lead':
        return <UserCheck className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'broker':
      case 'admin':
        return 'text-yellow-500 bg-yellow-500/20'
      case 'team_lead':
        return 'text-purple-500 bg-purple-500/20'
      default:
        return 'text-blue-500 bg-blue-500/20'
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <GlassCard variant="modal">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Assign Lead
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Transfer this lead to another team member
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {lead && (
                <div className="mb-6">
                  {/* Lead Information */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Lead Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Contact</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {lead.contacts?.full_name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {lead.contacts?.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Current Owner</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {lead.profiles?.full_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {lead.status.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {lead.lead_type}
                        </p>
                      </div>
                      {lead.estimated_value && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Value</p>
                          <p className="font-medium text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(lead.estimated_value)}
                          </p>
                        </div>
                      )}
                      {lead.expected_close_date && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Expected Close</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {new Date(lead.expected_close_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Team Member Selection */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Select Team Member
                    </h3>
                    
                    {teamMembers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-3" />
                        <p>No team members available for assignment</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {teamMembers.map((member) => (
                          <motion.div
                            key={member.id}
                            whileHover={{ scale: 1.02 }}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedMember === member.id
                                ? 'border-cyan-400 bg-cyan-50 dark:bg-cyan-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                            onClick={() => setSelectedMember(member.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                                {member.avatar_url ? (
                                  <img 
                                    src={member.avatar_url} 
                                    alt={member.full_name} 
                                    className="w-full h-full object-cover rounded-xl" 
                                  />
                                ) : (
                                  getInitials(member.full_name)
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-gray-900 dark:text-white">
                                    {member.full_name}
                                  </h4>
                                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                                    {getRoleIcon(member.role)}
                                    <span className="capitalize">{member.role.replace('_', ' ')}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                  <span>{member.contacts_count} contacts</span>
                                  <span>{member.leads_count} active leads</span>
                                </div>
                              </div>
                              {selectedMember === member.id && (
                                <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-3 h-3 bg-white rounded-full"
                                  />
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Assignment Notes */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Assignment Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Add any notes about this assignment..."
                      className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      onClick={handleAssign}
                      disabled={loading || !selectedMember}
                      className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-300 text-white rounded-lg transition-colors shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Assigning...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Assign Lead
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}