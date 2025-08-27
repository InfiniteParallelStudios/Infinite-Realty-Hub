'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { 
  X,
  UserPlus,
  Mail,
  Send,
  Copy,
  Check,
  User,
  Crown,
  UserCheck
} from 'lucide-react'

interface InviteUserModalProps {
  onClose: () => void
  onSuccess: () => void
  organizationId: string
}

export function InviteUserModal({ onClose, onSuccess, organizationId }: InviteUserModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'link'>('form')
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    role: 'agent',
    full_name: '',
    phone: '',
    personal_message: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const generateInviteLink = async () => {
    if (!user || !organizationId) return

    setLoading(true)

    try {
      // In a real implementation, you would:
      // 1. Create an invitation record in the database
      // 2. Send an email with the invitation link
      // 3. Generate a secure token for the invitation

      // For now, we'll create a mock invitation system
      const inviteToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      
      // Store invitation in database (you'd create an 'invitations' table for this)
      const invitationData = {
        id: inviteToken,
        organization_id: organizationId,
        invited_by: user.id,
        email: formData.email,
        role: formData.role,
        full_name: formData.full_name,
        phone: formData.phone,
        personal_message: formData.personal_message,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        created_at: new Date().toISOString()
      }

      // In production, you'd save this to an 'invitations' table
      // For demo, we'll just generate the link
      const baseUrl = window.location.origin
      const generatedLink = `${baseUrl}/invite/${inviteToken}`
      
      setInviteLink(generatedLink)
      setStep('link')

      // In production, send email here
      console.log('Invitation data:', invitationData)
      console.log('Would send email to:', formData.email)

    } catch (error) {
      console.error('Error creating invitation:', error)
      alert('Error creating invitation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const sendEmailInvite = async () => {
    setLoading(true)
    
    try {
      // In production, this would trigger an email service
      // For demo, we'll simulate the email being sent
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert(`Invitation email sent to ${formData.email}`)
      onSuccess()
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Error sending invitation email. Please use the link instead.')
    } finally {
      setLoading(false)
    }
  }

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'agent':
        return {
          icon: User,
          label: 'Agent',
          description: 'Can manage their own contacts and leads',
          color: 'text-blue-500'
        }
      case 'team_lead':
        return {
          icon: UserCheck,
          label: 'Team Lead',
          description: 'Can manage team members and view team performance',
          color: 'text-purple-500'
        }
      case 'broker':
        return {
          icon: Crown,
          label: 'Broker',
          description: 'Full access to all organization features',
          color: 'text-yellow-500'
        }
      case 'admin':
        return {
          icon: Crown,
          label: 'Administrator',
          description: 'Complete system administration access',
          color: 'text-red-500'
        }
      default:
        return {
          icon: User,
          label: 'Agent',
          description: 'Can manage their own contacts and leads',
          color: 'text-blue-500'
        }
    }
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
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Invite Team Member
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {step === 'form' ? 'Send an invitation to join your organization' : 'Share the invitation link'}
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

              {step === 'form' ? (
                /* Invitation Form */
                <form onSubmit={(e) => { e.preventDefault(); generateInviteLink(); }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="colleague@example.com"
                        className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(555) 123-4567"
                        className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role *
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
                      >
                        <option value="agent">Agent</option>
                        <option value="team_lead">Team Lead</option>
                        <option value="broker">Broker</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  </div>

                  {/* Role Description */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    {(() => {
                      const roleInfo = getRoleInfo(formData.role)
                      const Icon = roleInfo.icon
                      return (
                        <div className="flex items-start gap-3">
                          <Icon className={`w-5 h-5 mt-0.5 ${roleInfo.color}`} />
                          <div>
                            <h4 className={`font-medium ${roleInfo.color}`}>
                              {roleInfo.label}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {roleInfo.description}
                            </p>
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Personal Message (Optional)
                    </label>
                    <textarea
                      name="personal_message"
                      value={formData.personal_message}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Hi! I'd like to invite you to join our team..."
                      className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-300 text-white rounded-lg transition-colors shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          Create Invitation
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              ) : (
                /* Invitation Link */
                <div className="space-y-6">
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Invitation Created!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      You can now share this link with {formData.full_name || formData.email}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Invitation Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inviteLink}
                        readOnly
                        className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono"
                      />
                      <button
                        onClick={copyToClipboard}
                        className="px-3 py-2 bg-gray-500 hover:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      This link expires in 7 days
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      onClick={sendEmailInvite}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-400 disabled:bg-blue-300 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Email
                        </>
                      )}
                    </motion.button>

                    <button
                      onClick={onSuccess}
                      className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Done
                    </button>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      What happens next?
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• The invitee will receive the link via email or direct sharing</li>
                      <li>• They'll need to create an account or sign in</li>
                      <li>• Once verified, they'll be added to your organization as a {getRoleInfo(formData.role).label}</li>
                      <li>• You'll receive a notification when they join</li>
                    </ul>
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