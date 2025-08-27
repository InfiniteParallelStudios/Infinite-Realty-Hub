'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { OrganizationSettings } from '@/components/team/organization-settings'
import { InviteUserModal } from '@/components/team/invite-user-modal'
import { 
  Users, 
  UserPlus, 
  Settings, 
  Crown,
  TrendingUp,
  DollarSign,
  Building,
  Mail,
  Phone,
  Calendar,
  Award,
  BarChart3,
  UserCheck
} from 'lucide-react'

interface TeamMember {
  id: string
  full_name: string
  email: string
  role: string
  avatar_url?: string
  phone?: string
  created_at: string
  license_number?: string
  specialties?: string[]
  contacts_count?: number
  leads_count?: number
  deals_closed?: number
  total_volume?: number
}

interface Organization {
  id: string
  name: string
  plan_type: string
  logo_url?: string
  primary_color: string
  settings: any
}

export default function TeamPage() {
  const { user } = useAuth()
  const [currentUserRole, setCurrentUserRole] = useState<string>('')
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  useEffect(() => {
    if (user) {
      fetchTeamData()
    } else {
      // Set a timeout to stop loading if user is not authenticated
      const timeout = setTimeout(() => {
        setLoading(false)
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [user])

  const fetchTeamData = async () => {
    if (!user) return

    try {
      // Get current user's profile and organization
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          role,
          organization_id,
          organizations (
            id,
            name,
            plan_type,
            logo_url,
            primary_color,
            settings
          )
        `)
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        setLoading(false)
        return
      }

      setCurrentUserRole(profile?.role || '')
      setOrganization(profile?.organizations || null)

      // Only fetch team data if user has permissions
      if (['broker', 'admin', 'team_lead'].includes(profile.role) && profile.organization_id) {
        // Get all team members
        const { data: members, error: membersError } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            role,
            avatar_url,
            phone,
            license_number,
            specialties,
            created_at
          `)
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: false })

        if (membersError) {
          console.error('Error fetching team members:', membersError)
          // Continue without throwing - just use empty array
          setTeamMembers([])
        } else if (members) {

        // Get performance data for each member
        const membersWithStats = await Promise.all(
          members.map(async (member) => {
            const { data: contacts } = await supabase
              .from('contacts')
              .select('id')
              .eq('user_id', member.id)

            const { data: leads } = await supabase
              .from('leads')
              .select('id, status, actual_value')
              .eq('user_id', member.id)

            const dealsWon = leads?.filter(lead => lead.status === 'closed_won') || []
            const totalVolume = dealsWon.reduce((sum, lead) => sum + (lead.actual_value || 0), 0)

            return {
              ...member,
              contacts_count: contacts?.length || 0,
              leads_count: leads?.length || 0,
              deals_closed: dealsWon.length,
              total_volume: totalVolume
            }
          })
        )

        setTeamMembers(membersWithStats)
        } // Close the else if (members) block
      }
    } catch (error) {
      console.error('Error fetching team data:', error)
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
        return <Users className="w-4 h-4" />
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading team data...</span>
        </div>
      </div>
    )
  }

  // Check permissions
  if (!['broker', 'admin', 'team_lead'].includes(currentUserRole)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <GlassCard>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Access Restricted
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Team management is only available to brokers, team leads, and administrators.
            </p>
          </div>
        </GlassCard>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="container mx-auto px-4 py-8">
        <GlassCard>
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Organization
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You need to be part of an organization to access team management.
            </p>
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Team Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your organization and team members
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors shadow-lg shadow-cyan-500/20 flex items-center gap-2"
              onClick={() => setShowInviteModal(true)}
            >
              <UserPlus className="w-4 h-4" />
              Invite User
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
              onClick={() => setShowSettingsModal(true)}
            >
              <Settings className="w-4 h-4" />
              Settings
            </motion.button>
          </div>
        </div>
      </div>

      {/* Organization Info */}
      <GlassCard className="mb-6">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: organization.primary_color }}
            >
              {organization.logo_url ? (
                <img src={organization.logo_url} alt={organization.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                getInitials(organization.name)
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {organization.name}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 rounded-full text-sm font-medium">
                  {organization.plan_type}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {teamMembers.length} team member{teamMembers.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {teamMembers.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Contacts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {teamMembers.reduce((sum, member) => sum + (member.contacts_count || 0), 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Deals Closed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {teamMembers.reduce((sum, member) => sum + (member.deals_closed || 0), 0)}
                </p>
              </div>
              <Award className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(teamMembers.reduce((sum, member) => sum + (member.total_volume || 0), 0))}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Team Members */}
      <GlassCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Team Members</h3>
          
          {teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No team members found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg border border-white/20 dark:border-gray-700/20"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-semibold">
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          getInitials(member.full_name || 'Unknown')
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {member.full_name || 'Unknown User'}
                        </h4>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                          {getRoleIcon(member.role)}
                          <span className="capitalize">{member.role.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {member.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    {member.license_number && (
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        <span>License: {member.license_number}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {member.contacts_count || 0}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Contacts</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {member.leads_count || 0}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Leads</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Deals Closed:</span>
                      <span className="font-semibold text-green-500">{member.deals_closed || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-gray-600 dark:text-gray-400">Total Volume:</span>
                      <span className="font-semibold text-emerald-500">
                        {formatCurrency(member.total_volume || 0)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Modals */}
      {showInviteModal && organization && (
        <InviteUserModal
          organizationId={organization.id}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false)
            fetchTeamData() // Refresh data
          }}
        />
      )}

      {showSettingsModal && (
        <OrganizationSettings
          onClose={() => setShowSettingsModal(false)}
          onSuccess={() => {
            setShowSettingsModal(false)
            fetchTeamData() // Refresh data
          }}
        />
      )}
    </div>
  )
}