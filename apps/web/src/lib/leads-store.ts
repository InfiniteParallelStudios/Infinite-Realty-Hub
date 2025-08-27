// Simple in-memory leads store (in real app, this would be a database)
export interface CapturedLead {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  message: string
  interestedIn: string
  agentInfo: {
    name: string
    email: string
    phone: string
    company: string
  }
  source: 'qr_scan'
  capturedAt: Date
  priority: 'low' | 'medium' | 'high'
  stage: 'new' | 'contacted' | 'qualified' | 'showing' | 'offer' | 'negotiating' | 'closed'
}

// In-memory storage (in real app, this would be in a database)
let capturedLeads: CapturedLead[] = []

export const leadsStore = {
  // Add a new captured lead
  addLead: (leadData: Omit<CapturedLead, 'id' | 'capturedAt' | 'priority' | 'stage' | 'source'>) => {
    const newLead: CapturedLead = {
      ...leadData,
      id: Date.now().toString(),
      source: 'qr_scan',
      capturedAt: new Date(),
      priority: 'medium', // Default priority
      stage: 'new'
    }
    
    capturedLeads.push(newLead)
    console.log('📋 Lead added to store:', newLead)
    return newLead
  },

  // Get all leads for an agent
  getLeadsByAgent: (agentEmail: string): CapturedLead[] => {
    return capturedLeads.filter(lead => lead.agentInfo.email === agentEmail)
  },

  // Get all leads (for admin)
  getAllLeads: (): CapturedLead[] => {
    return [...capturedLeads]
  },

  // Convert captured lead to pipeline lead format
  convertToPipelineLead: (capturedLead: CapturedLead) => {
    const fullName = `${capturedLead.firstName} ${capturedLead.lastName}`
    
    return {
      id: capturedLead.id,
      name: fullName,
      email: capturedLead.email,
      phone: capturedLead.phone,
      source: 'qr_scan' as const,
      stage: capturedLead.stage,
      value: 0, // Will be updated by agent
      probability: 25, // Default for new QR leads
      notes: capturedLead.message || `Interested in ${capturedLead.interestedIn}`,
      createdAt: capturedLead.capturedAt,
      updatedAt: capturedLead.capturedAt,
      tags: ['qr-lead', capturedLead.interestedIn],
      priority: capturedLead.priority,
      propertyInterest: {
        type: capturedLead.interestedIn as 'buying' | 'selling',
        budget: 0,
        location: '',
        timeline: 'Not specified'
      }
    }
  },

  // Update lead stage
  updateLeadStage: (leadId: string, stage: CapturedLead['stage']) => {
    const lead = capturedLeads.find(l => l.id === leadId)
    if (lead) {
      lead.stage = stage
      console.log(`📝 Lead ${leadId} stage updated to ${stage}`)
    }
  },

  // Delete lead
  deleteLead: (leadId: string) => {
    const index = capturedLeads.findIndex(l => l.id === leadId)
    if (index !== -1) {
      const deletedLead = capturedLeads.splice(index, 1)[0]
      console.log('🗑️ Lead deleted:', deletedLead)
      return deletedLead
    }
  }
}

// For demo purposes, add some sample captured leads
if (typeof window !== 'undefined') {
  // Only run in browser
  setTimeout(() => {
    leadsStore.addLead({
      firstName: 'Alex',
      lastName: 'Johnson',
      email: 'alex.johnson@email.com',
      phone: '(555) 987-6543',
      message: 'I saw your QR code at the open house. Very interested in similar properties!',
      interestedIn: 'buying',
      agentInfo: {
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '(555) 123-4567',
        company: 'Infinite Realty Hub'
      }
    })

    leadsStore.addLead({
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria.garcia@email.com',
      phone: '(555) 456-7890',
      message: 'Need to sell my current home before buying. Can we schedule a consultation?',
      interestedIn: 'selling',
      agentInfo: {
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '(555) 123-4567',
        company: 'Infinite Realty Hub'
      }
    })
  }, 1000)
}