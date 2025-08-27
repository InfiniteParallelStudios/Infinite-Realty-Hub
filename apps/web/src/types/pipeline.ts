export interface Activity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'property_showing' | 'follow_up' | 'other'
  description: string
  date: Date
  duration?: number // in minutes
  outcome?: 'positive' | 'neutral' | 'negative' | 'no_response'
  nextAction?: string
  agentNotes?: string
}

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  source: 'qr_scan' | 'website' | 'referral' | 'cold_call' | 'social_media' | 'other'
  stage: PipelineStage
  value: number
  probability: number
  notes: string
  createdAt: Date
  updatedAt: Date
  assignedTo?: string
  lastContact?: Date
  nextFollowUp?: Date
  tags: string[]
  priority: 'low' | 'medium' | 'high'
  activities?: Activity[]
  propertyInterest?: {
    type: 'buying' | 'selling' | 'renting' | 'investing'
    budget?: number
    location?: string
    timeline?: string
  }
}

export type PipelineStage = 
  | 'new'
  | 'contacted' 
  | 'qualified'
  | 'showing'
  | 'offer'
  | 'negotiating'
  | 'closing'
  | 'closed'
  | 'lost'

export interface PipelineColumn {
  id: PipelineStage
  title: string
  description: string
  color: string
  leads: Lead[]
  maxLeads?: number
}

export interface PipelineStats {
  totalLeads: number
  totalValue: number
  averageValue: number
  conversionRate: number
  stageStats: Record<PipelineStage, {
    count: number
    value: number
    averageTime?: number
  }>
}

export interface PipelineFilters {
  search?: string
  source?: Lead['source']
  priority?: Lead['priority']
  assignedTo?: string
  dateRange?: {
    start: Date
    end: Date
  }
}