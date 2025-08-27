// Property types for contact tracking and viewing history

export interface Property {
  id: string
  address: string
  city: string
  state: string
  zipCode: string
  price: number
  bedrooms: number
  bathrooms: number
  squareFootage: number
  propertyType: 'single_family' | 'condo' | 'townhouse' | 'multi_family' | 'land' | 'commercial'
  status: 'active' | 'pending' | 'sold' | 'off_market'
  listingDate: Date
  images: string[]
  description?: string
  features: string[]
  agentId?: string
  mlsNumber?: string
}

export interface PropertyViewingNote {
  id: string
  propertyId: string
  contactId: string
  viewingDate: Date
  likes: string[] // Things the client liked about the property
  dislikes: string[] // Things the client wished were different
  overallRating: 1 | 2 | 3 | 4 | 5 // 1-5 star rating
  notes: string // Additional notes from the viewing
  interestedLevel: 'low' | 'medium' | 'high' // Interest level
  followUpRequired: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PropertyInteraction {
  id: string
  contactId: string
  propertyId: string
  interactionType: 'viewed_online' | 'saved' | 'shared' | 'scheduled_showing' | 'attended_showing' | 'made_offer' | 'rejected'
  date: Date
  notes?: string
  metadata?: Record<string, unknown> // Additional data based on interaction type
}

export interface ContactPropertyHistory {
  contactId: string
  properties: {
    property: Property
    interactions: PropertyInteraction[]
    viewingNotes?: PropertyViewingNote[]
    currentStatus: 'interested' | 'considering' | 'not_interested' | 'offer_made' | 'rejected'
    lastInteraction: Date
  }[]
  totalPropertiesViewed: number
  averageRating?: number
  preferredFeatures: string[] // Features they consistently like
  dealBreakers: string[] // Features they consistently dislike
}

// Extended contact type with property history
export interface ContactWithProperties {
  id: string
  name: string
  email: string
  phone: string
  source: 'qr_scan' | 'website' | 'referral' | 'cold_call' | 'social_media' | 'other'
  stage: 'new' | 'contacted' | 'qualified' | 'showing' | 'offer' | 'negotiating' | 'closing' | 'closed'
  tags: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
  lastContact?: Date
  nextFollowUp?: Date
  priority: 'low' | 'medium' | 'high'
  
  // Property-specific fields
  propertyHistory: ContactPropertyHistory
  budget?: {
    min: number
    max: number
  }
  preferredLocations: string[]
  propertyRequirements: {
    minBedrooms?: number
    minBathrooms?: number
    propertyTypes: string[]
    mustHaveFeatures: string[]
    niceToHaveFeatures: string[]
  }
}

export interface PropertyShowingSchedule {
  id: string
  propertyId: string
  contactId: string
  scheduledDate: Date
  duration: number // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  agentId: string
  notes?: string
  reminderSent: boolean
  createdAt: Date
}