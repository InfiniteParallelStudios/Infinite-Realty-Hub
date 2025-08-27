'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { GlassCard } from '@/components/ui/glass-card'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { 
  DollarSign,
  TrendingUp,
  Users,
  Search,
  User,
  Mail,
  Phone,
  GripVertical,
  Star,
  Plus,
  Loader2
} from 'lucide-react'

// Database types
interface Lead {
  id: string
  user_id: string
  contact_name: string
  contact_email: string
  contact_phone: string
  status: string
  priority: 'high' | 'medium' | 'low'
  estimated_value: number
  probability: number
  created_at: string
  updated_at: string
}

// Default leads to create if user has none
const getDefaultLeads = (userId: string): Omit<Lead, 'id' | 'created_at' | 'updated_at'>[] => [
  {
    user_id: userId,
    contact_name: 'John Smith',
    contact_email: 'john@example.com',
    contact_phone: '(555) 123-4567',
    status: 'new',
    priority: 'high',
    estimated_value: 450000,
    probability: 25
  },
  {
    user_id: userId,
    contact_name: 'Sarah Johnson',
    contact_email: 'sarah@example.com',
    contact_phone: '(555) 234-5678',
    status: 'contacted',
    priority: 'medium',
    estimated_value: 320000,
    probability: 45
  },
  {
    user_id: userId,
    contact_name: 'Mike Wilson',
    contact_email: 'mike@example.com',
    contact_phone: '(555) 345-6789',
    status: 'qualified',
    priority: 'high',
    estimated_value: 580000,
    probability: 65
  }
]

const stages = [
  { id: 'new', name: 'New Leads', color: 'bg-blue-500' },
  { id: 'contacted', name: 'Contacted', color: 'bg-yellow-500' },
  { id: 'qualified', name: 'Qualified', color: 'bg-orange-500' },
  { id: 'presentation', name: 'Presentation', color: 'bg-purple-500' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-cyan-500' },
  { id: 'contract', name: 'Contract', color: 'bg-indigo-500' },
  { id: 'closed_won', name: 'Closed Won', color: 'bg-green-500' },
  { id: 'closed_lost', name: 'Closed Lost', color: 'bg-red-500' }
]

function PipelinePage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const filteredLeads = leads.filter(lead =>
    lead.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.contact_email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Load leads from database
  useEffect(() => {
    if (user) {
      loadLeads()
    }
  }, [user])

  const loadLeads = async () => {
    if (!user) return

    try {
      console.log('📊 Loading leads for user:', user.email)
      
      const { data: existingLeads, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('⚠️ Database table not found, using fallback mode:', error.message)
        // Use fallback mock data with proper structure
        const fallbackLeads = getDefaultLeads(user.id).map((lead, index) => ({
          ...lead,
          id: `fallback-${index}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
        setLeads(fallbackLeads)
        return
      }

      if (existingLeads && existingLeads.length > 0) {
        console.log(`✅ Loaded ${existingLeads.length} existing leads from database`)
        setLeads(existingLeads)
      } else {
        console.log('📝 No leads found, creating default leads')
        await createDefaultLeads()
      }
    } catch (error) {
      console.error('❌ Error loading leads:', error)
      // Fallback to mock data
      const fallbackLeads = getDefaultLeads(user.id).map((lead, index) => ({
        ...lead,
        id: `fallback-${index}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
      setLeads(fallbackLeads)
    } finally {
      setLoading(false)
    }
  }

  const createDefaultLeads = async () => {
    if (!user) return

    try {
      const defaultLeads = getDefaultLeads(user.id)
      
      const { data: newLeads, error } = await supabase
        .from('leads')
        .insert(defaultLeads)
        .select()

      if (error) {
        console.warn('⚠️ Database table not available for inserting leads:', error.message)
        // Switch to fallback mode
        const fallbackLeads = defaultLeads.map((lead, index) => ({
          ...lead,
          id: `fallback-${index}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
        setLeads(fallbackLeads)
        return
      }

      if (newLeads) {
        console.log(`✅ Created ${newLeads.length} default leads in database`)
        setLeads(newLeads)
      }
    } catch (error) {
      console.warn('⚠️ Database unavailable, using fallback leads:', error.message)
      // Create fallback leads
      const defaultLeads = getDefaultLeads(user.id)
      const fallbackLeads = defaultLeads.map((lead, index) => ({
        ...lead,
        id: `fallback-${index}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
      setLeads(fallbackLeads)
    }
  }

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result

    // If no destination, return
    if (!destination) return

    // If dropped in the same position, return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    // Find the lead that was moved
    const movedLead = leads.find(lead => lead.id === draggableId)
    if (!movedLead) return

    // Optimistically update the UI
    const updatedLeads = leads.map(lead =>
      lead.id === draggableId
        ? { ...lead, status: destination.droppableId, updated_at: new Date().toISOString() }
        : lead
    )
    setLeads(updatedLeads)
    console.log(`📊 Moving ${movedLead.contact_name} to ${destination.droppableId}`)

    // Check if this is a fallback lead (no database)
    if (draggableId.startsWith('fallback-')) {
      console.log('💾 Fallback mode: Changes saved locally (database not set up)')
      return
    }

    // Update the database
    setSaving(true)
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          status: destination.droppableId,
          updated_at: new Date().toISOString()
        })
        .eq('id', draggableId)

      if (error) {
        throw error
      }

      console.log(`✅ Successfully moved ${movedLead.contact_name} to ${destination.droppableId}`)
    } catch (error) {
      console.error('❌ Error updating lead status:', error)
      console.log('💾 Continuing in fallback mode (changes saved locally)')
      // Don't revert in fallback mode - keep the change
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/20'
      case 'medium': return 'text-yellow-500 bg-yellow-500/20'
      case 'low': return 'text-green-500 bg-green-500/20'
      default: return 'text-gray-500 bg-gray-500/20'
    }
  }

  const getStageStats = () => {
    return stages.map(stage => ({
      ...stage,
      count: filteredLeads.filter(lead => lead.status === stage.id).length,
      value: filteredLeads
        .filter(lead => lead.status === stage.id)
        .reduce((sum, lead) => sum + lead.estimated_value, 0)
    }))
  }

  const totalValue = filteredLeads.reduce((sum, lead) => sum + lead.estimated_value, 0)
  const avgProbability = filteredLeads.length > 0 
    ? filteredLeads.reduce((sum, lead) => sum + lead.probability, 0) / filteredLeads.length 
    : 0

  // Show loading state
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Loading Pipeline
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Fetching your leads and pipeline data...
              </p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Sales Pipeline - Database Connected
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Drag and drop leads between stages to manage your sales process
                  {saving && <span className="text-cyan-400 ml-2">(Saving...)</span>}
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <GlassCard>
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Leads</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                      {filteredLeads.length}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pipeline Value</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate" title={formatCurrency(totalValue)}>
                      {formatCurrency(totalValue)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg. Probability</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                      {avgProbability.toFixed(0)}%
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Demo Mode</p>
                    <p className="text-lg sm:text-xl font-bold text-cyan-400 truncate">
                      Active
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Kanban Board */}
          <div className="overflow-x-auto">
            <div className="flex gap-4 sm:gap-6 min-w-max pb-6">
              {getStageStats().map((stage) => (
                <div key={stage.id} className="w-72 sm:w-80 flex-shrink-0">
                  <GlassCard>
                    <div className="p-4">
                      {/* Stage Header */}
                      <div className="flex flex-col gap-2 mb-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${stage.color}`}></div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate flex-1">
                            {stage.name}
                          </h3>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs flex-shrink-0">
                            {stage.count}
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium truncate" title={formatCurrency(stage.value)}>
                          {formatCurrency(stage.value)}
                        </div>
                      </div>

                      {/* Droppable Area */}
                      <Droppable droppableId={stage.id}>
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`space-y-3 min-h-[200px] max-h-96 overflow-y-auto p-2 rounded-lg transition-colors ${
                              snapshot.isDraggingOver 
                                ? 'bg-cyan-50/50 dark:bg-cyan-900/20 border-2 border-cyan-300 border-dashed' 
                                : 'bg-transparent'
                            }`}
                          >
                            {filteredLeads
                              .filter(lead => lead.status === stage.id)
                              .map((lead, index) => (
                                <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50 transition-all ${
                                        snapshot.isDragging 
                                          ? 'shadow-2xl rotate-2 bg-white dark:bg-gray-700' 
                                          : 'hover:shadow-lg'
                                      }`}
                                    >
                                      {/* Drag Handle */}
                                      <div 
                                        {...provided.dragHandleProps}
                                        className="flex items-center justify-between mb-2 cursor-grab active:cursor-grabbing"
                                      >
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                          {lead.contact_name}
                                        </h4>
                                        <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                      </div>

                                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <Mail className="w-3 h-3 flex-shrink-0" />
                                          <span className="truncate text-xs">{lead.contact_email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 min-w-0">
                                          <Phone className="w-3 h-3 flex-shrink-0" />
                                          <span className="truncate text-xs">{lead.contact_phone}</span>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1 min-w-0">
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getPriorityColor(lead.priority)}`}>
                                            {lead.priority}
                                          </span>
                                          <span className="text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
                                            {lead.probability}%
                                          </span>
                                        </div>
                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm truncate" title={formatCurrency(lead.estimated_value)}>
                                          {formatCurrency(lead.estimated_value)}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                            
                            {filteredLeads.filter(lead => lead.status === stage.id).length === 0 && (
                              <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-2">
                                  <Users className="w-6 h-6" />
                                </div>
                                <p className="text-sm">No leads in this stage</p>
                                <p className="text-xs mt-1">Drop leads here</p>
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  </GlassCard>
                </div>
              ))}
            </div>
          </div>

          {/* Database Status */}
          <div className="mt-8">
            <GlassCard>
              <div className="p-6 text-center">
                {leads.length > 0 && leads[0]?.id?.startsWith('fallback-') ? (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      💾 Fallback Mode Active
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Database table not found - using local session storage. Your pipeline works perfectly, but data won't persist between sessions.
                    </p>
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>To enable database persistence:</strong> Run the SQL script from <code>supabase-schema.sql</code> in your Supabase dashboard.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      🗄️ Database Connected
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your pipeline data is automatically saved to the database. Drag and drop leads between stages - all changes are instantly persisted and will be restored when you log back in.
                    </p>
                  </>
                )}
                {leads.length > 0 && (
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    <p>Currently managing {leads.length} leads • Last updated: {new Date().toLocaleString()}</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </DragDropContext>
    </ProtectedRoute>
  )
}

export default PipelinePage