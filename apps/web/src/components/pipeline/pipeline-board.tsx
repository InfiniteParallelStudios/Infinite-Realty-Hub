'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { 
  DragDropContext, 
  Droppable, 
  Draggable,
  DropResult
} from '@hello-pangea/dnd'
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  Users, 
  DollarSign
} from 'lucide-react'
import { Lead, PipelineColumn, PipelineStage, PipelineStats } from '@/types/pipeline'
import { GlassCard } from '@/components/ui/glass-card'
import { BuyerCard } from './buyer-card'

// Mock data for demonstration
const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    source: 'qr_scan',
    stage: 'new',
    value: 450000,
    probability: 25,
    notes: 'Interested in 3BR home, first-time buyer',
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-08-15'),
    tags: ['first-time-buyer', 'pre-approved'],
    priority: 'high',
    propertyInterest: {
      type: 'buying',
      budget: 500000,
      location: 'Downtown',
      timeline: '3 months'
    },
    activities: [
      {
        id: '1',
        type: 'call',
        description: 'Initial consultation call - discussed property requirements',
        date: new Date('2024-08-15'),
        duration: 30,
        outcome: 'positive',
        nextAction: 'Send property listings in Downtown area',
        agentNotes: 'Very motivated buyer, pre-approved financing'
      }
    ]
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike.chen@email.com',
    phone: '(555) 234-5678',
    source: 'website',
    stage: 'contacted',
    value: 750000,
    probability: 40,
    notes: 'Looking to upgrade to luxury home',
    createdAt: new Date('2024-08-10'),
    updatedAt: new Date('2024-08-16'),
    lastContact: new Date('2024-08-16'),
    nextFollowUp: new Date('2024-08-22'),
    tags: ['luxury', 'existing-client'],
    priority: 'medium',
    propertyInterest: {
      type: 'buying',
      budget: 800000,
      location: 'Suburbs',
      timeline: '6 months'
    }
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.r@email.com',
    phone: '(555) 345-6789',
    source: 'referral',
    stage: 'qualified',
    value: 320000,
    probability: 60,
    notes: 'Ready to sell current home and buy new',
    createdAt: new Date('2024-08-05'),
    updatedAt: new Date('2024-08-18'),
    lastContact: new Date('2024-08-18'),
    tags: ['buy-sell', 'motivated'],
    priority: 'high',
    propertyInterest: {
      type: 'buying',
      budget: 350000,
      location: 'City Center',
      timeline: '2 months'
    }
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david.wilson@email.com',
    phone: '(555) 456-7890',
    source: 'cold_call',
    stage: 'showing',
    value: 425000,
    probability: 75,
    notes: 'Scheduled showing for this weekend',
    createdAt: new Date('2024-07-28'),
    updatedAt: new Date('2024-08-19'),
    lastContact: new Date('2024-08-19'),
    nextFollowUp: new Date('2024-08-21'),
    tags: ['showing-scheduled', 'hot-lead'],
    priority: 'high',
    propertyInterest: {
      type: 'buying',
      budget: 450000,
      location: 'Westside',
      timeline: '1 month'
    }
  }
]

const pipelineStages: PipelineColumn[] = [
  {
    id: 'new',
    title: 'New Leads',
    description: 'Fresh leads that need initial contact',
    color: 'bg-blue-500',
    leads: []
  },
  {
    id: 'contacted',
    title: 'Contacted',
    description: 'Initial contact made, waiting for response',
    color: 'bg-yellow-500',
    leads: []
  },
  {
    id: 'qualified',
    title: 'Qualified',
    description: 'Lead shows genuine interest and fits criteria',
    color: 'bg-purple-500',
    leads: []
  },
  {
    id: 'showing',
    title: 'Showing',
    description: 'Property showings scheduled or completed',
    color: 'bg-orange-500',
    leads: []
  },
  {
    id: 'offer',
    title: 'Offer',
    description: 'Offer submitted or being prepared',
    color: 'bg-pink-500',
    leads: []
  },
  {
    id: 'negotiating',
    title: 'Negotiating',
    description: 'In negotiations with seller/buyer',
    color: 'bg-indigo-500',
    leads: []
  },
  {
    id: 'closing',
    title: 'Closing',
    description: 'Moving through closing process',
    color: 'bg-teal-500',
    leads: []
  },
  {
    id: 'closed',
    title: 'Closed',
    description: 'Deal successfully closed',
    color: 'bg-green-500',
    leads: []
  }
]

interface PipelineBoardProps {
  onAddLead?: () => void
  onEditLead?: (lead: Lead) => void
  leads?: Lead[]
}

export function PipelineBoard({ onAddLead, onEditLead, leads = mockLeads }: PipelineBoardProps) {
  const [columns, setColumns] = useState<PipelineColumn[]>(pipelineStages)
  const [searchTerm, setSearchTerm] = useState('')
  const [, setSelectedFilters] = useState<string[]>([])
  const [stats, setStats] = useState<PipelineStats | null>(null)

  // Initialize data
  useEffect(() => {
    const initialColumns = pipelineStages.map(column => ({
      ...column,
      leads: leads.filter(lead => lead.stage === column.id)
    }))
    setColumns(initialColumns)
    calculateStats(leads)
  }, [leads])


  const calculateStats = (leads: Lead[]) => {
    const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0)
    const closedLeads = leads.filter(lead => lead.stage === 'closed')
    const conversionRate = leads.length > 0 ? (closedLeads.length / leads.length) * 100 : 0

    const stageStats = pipelineStages.reduce((acc, stage) => {
      const stageLeads = leads.filter(lead => lead.stage === stage.id)
      acc[stage.id] = {
        count: stageLeads.length,
        value: stageLeads.reduce((sum, lead) => sum + lead.value, 0)
      }
      return acc
    }, {} as Record<PipelineStage, { count: number; value: number }>)

    setStats({
      totalLeads: leads.length,
      totalValue,
      averageValue: leads.length > 0 ? totalValue / leads.length : 0,
      conversionRate,
      stageStats
    })
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result
    const sourceColumn = columns.find(col => col.id === source.droppableId)
    const destColumn = columns.find(col => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    const sourceCopy = [...sourceColumn.leads]
    const destCopy = source.droppableId === destination.droppableId ? sourceCopy : [...destColumn.leads]

    const [movedLead] = sourceCopy.splice(source.index, 1)
    movedLead.stage = destination.droppableId as PipelineStage
    movedLead.updatedAt = new Date()

    destCopy.splice(destination.index, 0, movedLead)

    setColumns(columns.map(column => {
      if (column.id === source.droppableId) {
        return { ...column, leads: sourceCopy }
      }
      if (column.id === destination.droppableId) {
        return { ...column, leads: destCopy }
      }
      return column
    }))

    // Recalculate stats
    const allLeads = columns.flatMap(col => col.leads)
    calculateStats(allLeads)
  }


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Lead Pipeline
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage your leads through the sales process
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onAddLead}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLeads}</p>
              </div>
              <Users className="w-8 h-8 text-cyan-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pipeline Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Deal Size</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.averageValue)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.conversionRate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </GlassCard>
        </div>
      )}

      {/* Search and Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            />
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-white/20 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-white/30 dark:hover:bg-gray-700/50 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </GlassCard>

      {/* Pipeline Board */}
      <div className="overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 min-w-max pb-24">
            {columns.map((column) => (
              <div key={column.id} className="w-80 flex-shrink-0">
                <GlassCard className="p-4 h-full">
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${column.color}`} />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {column.title}
                      </h3>
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
                        {column.leads.length}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                    {column.description}
                  </p>

                  {/* Droppable Area */}
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[600px] space-y-3 p-2 pb-16 rounded-lg transition-colors ${
                          snapshot.isDraggingOver 
                            ? 'bg-cyan-500/10 border-2 border-dashed border-cyan-400' 
                            : 'border-2 border-transparent'
                        }`}
                      >
                        <AnimatePresence>
                          {column.leads.map((lead, index) => (
                            <Draggable key={lead.id} draggableId={lead.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="mb-3 relative"
                                >
                                  <BuyerCard
                                    lead={lead}
                                    onEdit={onEditLead || (() => {})}
                                    isDragging={snapshot.isDragging}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                        </AnimatePresence>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </GlassCard>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  )
}