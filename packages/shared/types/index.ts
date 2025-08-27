// Database types
export interface Lead {
  id: string
  user_id: string
  contact_name: string
  contact_email: string
  contact_phone: string
  status: LeadStatus
  priority: 'high' | 'medium' | 'low'
  estimated_value: number
  probability: number
  created_at: string
  updated_at: string
}

export type LeadStatus = 
  | 'new' 
  | 'contacted' 
  | 'qualified' 
  | 'presentation' 
  | 'negotiation' 
  | 'contract' 
  | 'closed_won' 
  | 'closed_lost'

export interface Contact {
  id: string
  user_id: string
  name: string
  email?: string
  phone?: string
  company?: string
  notes?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface PipelineStage {
  id: string
  name: string
  color: string
  order: number
}

export interface User {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

export interface MarketDataPoint {
  region: string
  regionType: 'city' | 'county' | 'state' | 'national'
  medianPrice: number
  averageDaysOnMarket: number
  inventoryLevel: number
  priceChangePercent: number
  salesVolume: number
  newListings: number
  pricePerSqft: number
  lastUpdated: string
}

export interface MarketInsight {
  message: string
  trend: 'up' | 'down' | 'stable'
  severity: 'positive' | 'negative' | 'neutral'
  confidence: number
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

// Form types
export interface ContactFormData {
  name: string
  email?: string
  phone?: string
  company?: string
  notes?: string
  tags?: string[]
}

export interface LeadFormData {
  contact_name: string
  contact_email?: string
  contact_phone?: string
  status: LeadStatus
  priority: 'high' | 'medium' | 'low'
  estimated_value: number
  probability: number
}