'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { 
  X,
  Building,
  Palette,
  Save,
  Upload,
  Settings,
  Bell,
  Shield,
  Users,
  DollarSign
} from 'lucide-react'

interface OrganizationSettingsProps {
  onClose: () => void
  onSuccess: () => void
}

interface OrganizationData {
  id: string
  name: string
  slug: string
  plan_type: string
  logo_url?: string
  primary_color: string
  settings: any
}

export function OrganizationSettings({ onClose, onSuccess }: OrganizationSettingsProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [organization, setOrganization] = useState<OrganizationData | null>(null)
  const [activeTab, setActiveTab] = useState('general')
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    primary_color: '#3B82F6',
    logo_url: '',
    plan_type: 'free',
    settings: {
      allow_lead_sharing: true,
      require_approval_for_new_members: false,
      default_contact_visibility: 'team',
      email_notifications: true,
      sms_notifications: false,
      auto_assign_leads: false,
      lead_rotation: false
    }
  })

  useEffect(() => {
    if (user) {
      fetchOrganizationData()
    }
  }, [user])

  const fetchOrganizationData = async () => {
    if (!user) return

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          organization_id,
          organizations (
            id,
            name,
            slug,
            plan_type,
            logo_url,
            primary_color,
            settings
          )
        `)
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      if (profile.organizations) {
        const org = profile.organizations
        setOrganization(org)
        setFormData({
          name: org.name || '',
          slug: org.slug || '',
          primary_color: org.primary_color || '#3B82F6',
          logo_url: org.logo_url || '',
          plan_type: org.plan_type || 'free',
          settings: {
            allow_lead_sharing: true,
            require_approval_for_new_members: false,
            default_contact_visibility: 'team',
            email_notifications: true,
            sms_notifications: false,
            auto_assign_leads: false,
            lead_rotation: false,
            ...org.settings
          }
        })
      }
    } catch (error) {
      console.error('Error fetching organization:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const inputValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    
    if (name.startsWith('settings.')) {
      const settingKey = name.replace('settings.', '')
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingKey]: inputValue
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: inputValue
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organization) return

    setLoading(true)

    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: formData.name,
          slug: formData.slug,
          primary_color: formData.primary_color,
          logo_url: formData.logo_url || null,
          settings: formData.settings
        })
        .eq('id', organization.id)

      if (error) throw error

      onSuccess()
    } catch (error) {
      console.error('Error updating organization:', error)
      alert('Error updating organization settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
    
    setFormData(prev => ({ ...prev, slug }))
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Building },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ]

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
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <GlassCard variant="modal">
            <div className="flex h-[80vh]">
              {/* Sidebar */}
              <div className="w-64 border-r border-gray-200/50 dark:border-gray-700/50 p-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Organization Settings
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {organization?.name}
                    </p>
                  </div>
                </div>

                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400/50'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {tabs.find(tab => tab.id === activeTab)?.label}
                    </h3>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {activeTab === 'general' && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Organization Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Organization Slug
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              name="slug"
                              value={formData.slug}
                              onChange={handleInputChange}
                              className="flex-1 px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
                              placeholder="organization-name"
                              required
                            />
                            <button
                              type="button"
                              onClick={generateSlug}
                              className="px-3 py-2 bg-gray-500 hover:bg-gray-400 text-white rounded-lg transition-colors"
                            >
                              Generate
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Used in URLs and integrations
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Plan Type
                          </label>
                          <select
                            name="plan_type"
                            value={formData.plan_type}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
                          >
                            <option value="free">Free</option>
                            <option value="professional">Professional</option>
                            <option value="team">Team</option>
                            <option value="enterprise">Enterprise</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {activeTab === 'branding' && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Primary Color
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              name="primary_color"
                              value={formData.primary_color}
                              onChange={handleInputChange}
                              className="w-12 h-12 rounded-lg border border-gray-200 dark:border-gray-700"
                            />
                            <input
                              type="text"
                              name="primary_color"
                              value={formData.primary_color}
                              onChange={handleInputChange}
                              className="flex-1 px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Logo URL
                          </label>
                          <input
                            type="url"
                            name="logo_url"
                            value={formData.logo_url}
                            onChange={handleInputChange}
                            placeholder="https://example.com/logo.png"
                            className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
                          />
                          {formData.logo_url && (
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Logo Preview:</p>
                              <img 
                                src={formData.logo_url} 
                                alt="Logo preview" 
                                className="w-16 h-16 object-contain rounded-lg"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'team' && (
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              name="settings.allow_lead_sharing"
                              checked={formData.settings.allow_lead_sharing}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-cyan-400 bg-gray-100 border-gray-300 rounded focus:ring-cyan-400"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Allow Lead Sharing
                              </span>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Team members can share leads with each other
                              </p>
                            </div>
                          </label>

                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              name="settings.auto_assign_leads"
                              checked={formData.settings.auto_assign_leads}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-cyan-400 bg-gray-100 border-gray-300 rounded focus:ring-cyan-400"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Auto-assign Leads
                              </span>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Automatically assign new leads to team members
                              </p>
                            </div>
                          </label>

                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              name="settings.lead_rotation"
                              checked={formData.settings.lead_rotation}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-cyan-400 bg-gray-100 border-gray-300 rounded focus:ring-cyan-400"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Lead Rotation
                              </span>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Rotate lead assignments among team members
                              </p>
                            </div>
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Default Contact Visibility
                          </label>
                          <select
                            name="settings.default_contact_visibility"
                            value={formData.settings.default_contact_visibility}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
                          >
                            <option value="private">Private (Owner only)</option>
                            <option value="team">Team (All team members)</option>
                            <option value="organization">Organization (All organization members)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {activeTab === 'notifications' && (
                      <div className="space-y-4">
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            name="settings.email_notifications"
                            checked={formData.settings.email_notifications}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-cyan-400 bg-gray-100 border-gray-300 rounded focus:ring-cyan-400"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Email Notifications
                            </span>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Send notifications via email
                            </p>
                          </div>
                        </label>

                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            name="settings.sms_notifications"
                            checked={formData.settings.sms_notifications}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-cyan-400 bg-gray-100 border-gray-300 rounded focus:ring-cyan-400"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              SMS Notifications
                            </span>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Send notifications via SMS (additional charges may apply)
                            </p>
                          </div>
                        </label>
                      </div>
                    )}

                    {activeTab === 'security' && (
                      <div className="space-y-4">
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            name="settings.require_approval_for_new_members"
                            checked={formData.settings.require_approval_for_new_members}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-cyan-400 bg-gray-100 border-gray-300 rounded focus:ring-cyan-400"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Require Approval for New Members
                            </span>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              New team member invitations must be approved by an admin
                            </p>
                          </div>
                        </label>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
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
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}