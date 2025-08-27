// Modular Pricing Configuration for IRH
export interface PricingModule {
  id: string
  name: string
  price: number // Monthly price in USD
  description: string
  features: string[]
  requires?: string[] // Other modules required
  stripePriceId: string // Stripe price ID for subscriptions
  popular?: boolean
}

export const PRICING_MODULES: PricingModule[] = [
  {
    id: 'contacts',
    name: 'Contact Management',
    price: 0,
    description: 'Unlimited contact storage and basic management',
    features: [
      'Unlimited contact storage',
      'Basic contact profiles',
      'Contact search and filtering',
      'Mobile app access',
      'Export contacts'
    ],
    stripePriceId: '', // Free tier
    popular: true
  },
  {
    id: 'crm',
    name: 'CRM Module',
    price: 9.99,
    description: 'Professional CRM features for activity tracking',
    features: [
      'Activity logging and history',
      'Detailed contact notes',
      'Task management and reminders',
      'Email integration and tracking',
      'Call logging',
      'Custom fields',
      'Contact timeline view'
    ],
    requires: ['contacts'],
    stripePriceId: 'price_crm_module_999', // Replace with actual Stripe price ID
  },
  {
    id: 'pipeline',
    name: 'Pipeline Management',
    price: 14.99,
    description: 'Visual lead pipeline with deal tracking',
    features: [
      'Kanban-style pipeline board',
      'Customizable lead stages',
      'Deal value tracking',
      'Conversion analytics',
      'Pipeline forecasting',
      'Lead source tracking',
      'Automated stage transitions'
    ],
    requires: ['contacts', 'crm'],
    stripePriceId: 'price_pipeline_module_1499',
    popular: true
  },
  {
    id: 'qr_capture',
    name: 'QR Lead Capture',
    price: 7.99,
    description: 'QR code generation and lead capture system',
    features: [
      'Unlimited QR code generation',
      'Customizable QR styles and sizes',
      'Mobile-optimized capture forms',
      'Automatic lead import',
      'QR scan analytics',
      'vCard contact downloads',
      'Branded capture forms'
    ],
    stripePriceId: 'price_qr_capture_799',
  }
]

// Helper functions for pricing calculations
export const calculateTotalPrice = (moduleIds: string[]): number => {
  return PRICING_MODULES
    .filter(module => moduleIds.includes(module.id))
    .reduce((total, module) => total + module.price, 0)
}

export const validateModuleRequirements = (moduleIds: string[]): boolean => {
  for (const moduleId of moduleIds) {
    const module = PRICING_MODULES.find(m => m.id === moduleId)
    if (module?.requires) {
      for (const requirement of module.requires) {
        if (!moduleIds.includes(requirement)) {
          return false
        }
      }
    }
  }
  return true
}

export const getRequiredModules = (moduleId: string): string[] => {
  const module = PRICING_MODULES.find(m => m.id === moduleId)
  return module?.requires || []
}

// Predefined bundles for common use cases
export const PRICING_BUNDLES = [
  {
    id: 'qr_only',
    name: 'QR Lead Capture',
    modules: ['contacts', 'qr_capture'],
    price: 7.99,
    description: 'Perfect for agents focusing on lead generation',
    savings: 0
  },
  {
    id: 'basic_crm',
    name: 'Basic CRM',
    modules: ['contacts', 'crm'],
    price: 9.99,
    description: 'Essential CRM features for contact management',
    savings: 0
  },
  {
    id: 'full_pipeline',
    name: 'Complete Pipeline',
    modules: ['contacts', 'crm', 'pipeline'],
    price: 22.99, // $1.99 discount
    description: 'Full CRM with visual pipeline management',
    savings: 1.99
  },
  {
    id: 'everything',
    name: 'All Features',
    modules: ['contacts', 'crm', 'pipeline', 'qr_capture'],
    price: 29.99, // $2.98 discount
    description: 'Complete real estate CRM solution',
    savings: 2.98,
    popular: true
  }
]

// Feature gating configuration
export interface FeatureGate {
  feature: string
  requiredModules: string[]
  description: string
}

export const FEATURE_GATES: FeatureGate[] = [
  {
    feature: 'activity_logging',
    requiredModules: ['crm'],
    description: 'Activity logging requires CRM module'
  },
  {
    feature: 'pipeline_board',
    requiredModules: ['crm', 'pipeline'],
    description: 'Pipeline board requires CRM and Pipeline modules'
  },
  {
    feature: 'qr_generation',
    requiredModules: ['qr_capture'],
    description: 'QR code generation requires QR Capture module'
  },
  {
    feature: 'deal_tracking',
    requiredModules: ['crm', 'pipeline'],
    description: 'Deal tracking requires CRM and Pipeline modules'
  }
]

// Usage limits by module
export const USAGE_LIMITS = {
  contacts: {
    free: -1, // Unlimited
    description: 'Unlimited contact storage'
  },
  qr_codes: {
    free: 0,
    qr_capture: -1, // Unlimited with QR module
    description: 'QR code generation limit'
  },
  pipeline_leads: {
    free: 0,
    pipeline: -1, // Unlimited with pipeline module
    description: 'Active leads in pipeline'
  }
}