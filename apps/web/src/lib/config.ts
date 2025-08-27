// Production configuration for QR code system
export const config = {
  // Environment detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Demo mode (only enabled in development)
  enableDemoMode: process.env.NODE_ENV === 'development' || process.env.ENABLE_DEMO_MODE === 'true',
  
  // Production domain configuration
  productionDomain: process.env.NEXT_PUBLIC_DOMAIN || 'https://irh.infiniteparallelstudios.com',
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
    useInMemoryStore: process.env.NODE_ENV === 'development'
  },
  
  // Authentication settings
  auth: {
    requireAuth: process.env.NODE_ENV === 'production',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  },
  
  // QR code settings
  qr: {
    baseUrl: process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_DOMAIN 
      : 'http://192.168.1.218:3000',
    defaultErrorCorrection: 'M' as const,
    defaultSize: 256
  }
}

export const getQRBaseUrl = () => {
  if (typeof window === 'undefined') return config.qr.baseUrl
  
  // In development, use network IP for mobile testing
  if (config.isDevelopment && window.location.hostname === 'localhost') {
    return 'http://192.168.1.218:3000'
  }
  
  // In production, use the configured domain
  return config.isProduction ? config.productionDomain : window.location.origin
}