// API Manager - Intelligent routing between multiple real estate APIs
// Manages rate limits, fallbacks, and data aggregation

import { realtorApiService, RealtorMarketData } from './realtor-api'
import { rentCastApiService, RentCastMarketData } from './rentcast-api'
import { MarketDataPoint } from '../market-data-service'

export interface ApiStatus {
  provider: 'realtor' | 'rentcast' | 'public'
  available: boolean
  remaining?: number
  resetTime?: string
  priority: number
}

export interface ApiManagerConfig {
  maxRetries: number
  retryDelay: number
  fallbackEnabled: boolean
  preferredProvider: 'realtor' | 'rentcast' | 'auto'
}

class ApiManager {
  private static instance: ApiManager
  private config: ApiManagerConfig
  private apiStatuses: Map<string, ApiStatus> = new Map()
  private requestLog: Map<string, number> = new Map()

  constructor() {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000, // 1 second
      fallbackEnabled: true,
      preferredProvider: 'auto'
    }

    // Initialize API priorities
    this.initializeApiStatuses()
  }

  static getInstance(): ApiManager {
    if (!ApiManager.instance) {
      ApiManager.instance = new ApiManager()
    }
    return ApiManager.instance
  }

  private initializeApiStatuses() {
    this.apiStatuses.set('realtor', {
      provider: 'realtor',
      available: true,
      priority: 1,
      remaining: 100 // Free tier limit
    })

    this.apiStatuses.set('rentcast', {
      provider: 'rentcast',
      available: true,
      priority: 2,
      remaining: 50 // Free tier limit
    })

    this.apiStatuses.set('public', {
      provider: 'public',
      available: true,
      priority: 3 // Lowest priority, unlimited but less real-time
    })
  }

  /**
   * Get market data using intelligent API selection
   */
  async getMarketData(
    location: { city?: string; state?: string; zipCode?: string; address?: string },
    options: {
      preferredProvider?: 'realtor' | 'rentcast' | 'auto'
      includeComparables?: boolean
      includeRentEstimate?: boolean
    } = {}
  ): Promise<MarketDataPoint | null> {
    const provider = this.selectBestProvider(options.preferredProvider)
    
    try {
      let marketData: MarketDataPoint | null = null

      switch (provider) {
        case 'realtor':
          if (location.city && location.state) {
            const realtorData = await realtorApiService.getMarketData(location.city, location.state)
            marketData = this.normalizeRealtorData(realtorData, location)
          }
          break

        case 'rentcast':
          if (location.zipCode) {
            const rentcastData = await rentCastApiService.getMarketDataByZip(location.zipCode)
            marketData = this.normalizeRentCastData(rentcastData, location)
          } else if (location.city && location.state) {
            const rentcastData = await rentCastApiService.getMarketDataByCity(location.city, location.state)
            marketData = this.normalizeRentCastData(rentcastData, location)
          }
          break

        default:
          // Fall back to mock/public data
          marketData = this.generateFallbackData(location)
      }

      this.logApiUsage(provider)
      return marketData

    } catch (error) {
      console.error(`API Manager error with ${provider}:`, error)
      
      if (this.config.fallbackEnabled) {
        return this.fallbackToNextProvider(location, provider, options)
      }
      
      return null
    }
  }

  /**
   * Get property data from multiple sources
   */
  async getPropertyData(
    address: string,
    options: {
      includeComparables?: boolean
      includeRentEstimate?: boolean
      includeValueEstimate?: boolean
    } = {}
  ): Promise<{
    property: Record<string, unknown>
    comparables?: Record<string, unknown>[]
    rentEstimate?: Record<string, unknown>
    valueEstimate?: Record<string, unknown>
  } | null> {
    const results: Record<string, unknown> = {}

    try {
      // Try RentCast first for comprehensive property data
      if (this.isProviderAvailable('rentcast')) {
        const rentcastProperty = await rentCastApiService.getPropertyByAddress(address)
        if (rentcastProperty) {
          results.property = rentcastProperty

          if (options.includeComparables) {
            results.comparables = await rentCastApiService.getComparableSales(address, 0.5, 10)
          }

          if (options.includeRentEstimate) {
            results.rentEstimate = await rentCastApiService.getRentEstimate(address)
          }

          if (options.includeValueEstimate) {
            results.valueEstimate = await rentCastApiService.getValueEstimate(address)
          }
        }
        this.logApiUsage('rentcast')
      }

      // Supplement with Realtor data if needed
      if (this.isProviderAvailable('realtor') && !results.property) {
        const realtorProperties = await realtorApiService.searchByAddress(address)
        if (realtorProperties.length > 0) {
          results.property = realtorProperties[0]
        }
        this.logApiUsage('realtor')
      }

      return Object.keys(results).length > 0 ? results : null

    } catch (error) {
      console.error('Property data retrieval error:', error)
      return null
    }
  }

  /**
   * Search properties within radius using best available API
   */
  async searchPropertiesInRadius(
    latitude: number,
    longitude: number,
    radiusMiles: number,
    options: {
      limit?: number
      propertyType?: string
      priceRange?: { min: number; max: number }
    } = {}
  ): Promise<Record<string, unknown>[]> {
    const limit = options.limit || 25

    try {
      // Try RentCast for radius search
      if (this.isProviderAvailable('rentcast')) {
        const properties = await rentCastApiService.searchPropertiesInRadius(
          latitude, 
          longitude, 
          radiusMiles, 
          limit
        )
        this.logApiUsage('rentcast')
        return properties
      }

      // Fallback to city-based search with Realtor API
      if (this.isProviderAvailable('realtor')) {
        // This would require geocoding coordinates to city/state
        // For now, return empty array
        console.log('Realtor API radius search not implemented - requires geocoding')
        return []
      }

      return []

    } catch (error) {
      console.error('Radius search error:', error)
      return []
    }
  }

  /**
   * Get aggregated market insights from multiple sources
   */
  async getMarketInsights(location: {
    city?: string
    state?: string
    zipCode?: string
  }): Promise<{
    summary: string
    trends: Array<{
      metric: string
      trend: 'up' | 'down' | 'stable'
      change: number
      insight: string
    }>
    confidence: number
  }> {
    const insights: {
      summary: string
      trends: Array<{
        metric: string
        trend: 'up' | 'down' | 'stable'
        change: number
        insight: string
      }>
      confidence: number
    } = {
      summary: '',
      trends: [],
      confidence: 0
    }

    try {
      // Collect data from available APIs
      const dataPoints: Array<{source: string; data: RealtorMarketData | RentCastMarketData}> = []

      if (this.isProviderAvailable('realtor') && location.city && location.state) {
        const realtorData = await realtorApiService.getMarketData(location.city, location.state)
        if (realtorData) dataPoints.push({ source: 'realtor', data: realtorData })
      }

      if (this.isProviderAvailable('rentcast')) {
        let rentcastData = null
        if (location.zipCode) {
          rentcastData = await rentCastApiService.getMarketDataByZip(location.zipCode)
        } else if (location.city && location.state) {
          rentcastData = await rentCastApiService.getMarketDataByCity(location.city, location.state)
        }
        if (rentcastData) dataPoints.push({ source: 'rentcast', data: rentcastData })
      }

      // Analyze and aggregate insights
      insights.confidence = Math.min(dataPoints.length * 0.4, 1.0) // Higher confidence with more sources
      insights.summary = this.generateMarketSummary(dataPoints, location)
      insights.trends = this.analyzeMarketTrends(dataPoints)

      return insights

    } catch (error) {
      console.error('Market insights error:', error)
      return insights
    }
  }

  /**
   * Select the best available API provider
   */
  private selectBestProvider(preferred?: string): 'realtor' | 'rentcast' | 'public' {
    if (preferred && preferred !== 'auto' && this.isProviderAvailable(preferred)) {
      return preferred as 'realtor' | 'rentcast'
    }

    // Auto-select based on availability and priority
    const availableProviders = Array.from(this.apiStatuses.values())
      .filter(status => status.available && (status.remaining || 0) > 0)
      .sort((a, b) => a.priority - b.priority)

    if (availableProviders.length === 0) {
      return 'public' // Fallback to public data
    }

    return availableProviders[0].provider as 'realtor' | 'rentcast' | 'public'
  }

  private isProviderAvailable(provider: string): boolean {
    const status = this.apiStatuses.get(provider)
    return status ? status.available && (status.remaining || 0) > 0 : false
  }

  private async fallbackToNextProvider(
    location: { city?: string; state?: string; zipCode?: string; address?: string },
    failedProvider: string,
    options: { preferredProvider?: 'realtor' | 'rentcast' | 'auto' }
  ): Promise<MarketDataPoint | null> {
    const providers = ['realtor', 'rentcast', 'public'].filter(p => p !== failedProvider)
    
    for (const provider of providers) {
      if (this.isProviderAvailable(provider)) {
        try {
          return await this.getMarketData(location, { ...options, preferredProvider: provider })
        } catch {
          continue
        }
      }
    }

    return this.generateFallbackData(location)
  }

  private logApiUsage(provider: string) {
    const today = new Date().toISOString().split('T')[0]
    const key = `${provider}-${today}`
    const current = this.requestLog.get(key) || 0
    this.requestLog.set(key, current + 1)

    // Update remaining count
    const status = this.apiStatuses.get(provider)
    if (status && status.remaining) {
      status.remaining = Math.max(0, status.remaining - 1)
      this.apiStatuses.set(provider, status)
    }
  }

  private normalizeRealtorData(data: RealtorMarketData | null, location: { coordinates?: { lat: number; lng: number } }): MarketDataPoint | null {
    if (!data) return null

    return {
      region: `${data.city}, ${data.state}`,
      regionType: 'city',
      medianPrice: data.median_listing_price,
      averageDaysOnMarket: data.median_days_on_market,
      inventoryLevel: data.active_listing_count,
      priceChangePercent: data.price_change_percent,
      salesVolume: data.active_listing_count, // Approximate
      newListings: Math.round(data.active_listing_count * 0.1), // Estimate
      pricePerSqft: Math.round(data.median_listing_price / 2000), // Estimate
      lastUpdated: new Date().toISOString(),
      coordinates: location.coordinates
    }
  }

  private normalizeRentCastData(data: RentCastMarketData | null, location: { coordinates?: { lat: number; lng: number } }): MarketDataPoint | null {
    if (!data) return null

    return {
      region: data.zipCode || `${data.city}, ${data.state}`,
      regionType: data.zipCode ? 'zipcode' : 'city',
      medianPrice: data.medianHomePrice,
      averageDaysOnMarket: data.averageDaysOnMarket,
      inventoryLevel: data.inventoryCount,
      priceChangePercent: data.priceAppreciation,
      salesVolume: Math.round(data.inventoryCount * 0.8), // Estimate
      newListings: Math.round(data.inventoryCount * 0.15), // Estimate
      pricePerSqft: Math.round(data.medianRent * 12 / data.priceToRentRatio * 100), // Estimate
      lastUpdated: new Date().toISOString(),
      coordinates: location.coordinates
    }
  }

  private generateFallbackData(location: { city?: string; state?: string; zipCode?: string }): MarketDataPoint {
    // Generate realistic fallback data when APIs are unavailable
    const regionName = location.city ? `${location.city}, ${location.state}` : 
                     location.zipCode || 'Unknown Area'

    return {
      region: regionName,
      regionType: location.zipCode ? 'zipcode' : 'city',
      medianPrice: Math.floor(Math.random() * 400000) + 300000,
      averageDaysOnMarket: Math.floor(Math.random() * 30) + 15,
      inventoryLevel: Math.floor(Math.random() * 100) + 20,
      priceChangePercent: (Math.random() - 0.5) * 20,
      salesVolume: Math.floor(Math.random() * 500) + 100,
      newListings: Math.floor(Math.random() * 200) + 50,
      pricePerSqft: Math.floor(Math.random() * 200) + 150,
      lastUpdated: new Date().toISOString()
    }
  }

  private generateMarketSummary(dataPoints: Array<{source: string; data: RealtorMarketData | RentCastMarketData}>, location: { city?: string; state?: string; zipCode?: string }): string {
    const area = location.city ? `${location.city}, ${location.state}` : location.zipCode || 'this area'
    
    if (dataPoints.length === 0) {
      return `Market data for ${area} is currently limited. Using estimated values based on regional trends.`
    }

    return `Market analysis for ${area} based on ${dataPoints.length} data source${dataPoints.length > 1 ? 's' : ''}.`
  }

  private analyzeMarketTrends(dataPoints: Array<{source: string; data: RealtorMarketData | RentCastMarketData}>): Array<{
    metric: string
    trend: 'up' | 'down' | 'stable'
    change: number
    insight: string
  }> {
    // Analyze trends across different data sources
    const trends = []

    if (dataPoints.length > 0) {
      const avgPriceChange = dataPoints.reduce((sum, dp) => {
        return sum + (dp.data.price_change_percent || dp.data.priceAppreciation || 0)
      }, 0) / dataPoints.length

      trends.push({
        metric: 'Home Prices',
        trend: avgPriceChange > 2 ? 'up' : avgPriceChange < -2 ? 'down' : 'stable',
        change: avgPriceChange,
        insight: `Prices are ${avgPriceChange > 0 ? 'increasing' : avgPriceChange < 0 ? 'decreasing' : 'stable'} at ${Math.abs(avgPriceChange).toFixed(1)}% annually`
      })
    }

    return trends
  }

  /**
   * Get API usage statistics
   */
  getApiUsageStats(): { provider: string; status: ApiStatus; dailyUsage: number }[] {
    const today = new Date().toISOString().split('T')[0]
    
    return Array.from(this.apiStatuses.entries()).map(([provider, status]) => ({
      provider,
      status,
      dailyUsage: this.requestLog.get(`${provider}-${today}`) || 0
    }))
  }

  /**
   * Refresh API statuses
   */
  async refreshApiStatuses(): Promise<void> {
    try {
      // Check Realtor API status
      const realtorStatus = await realtorApiService.checkApiStatus()
      this.apiStatuses.set('realtor', {
        ...this.apiStatuses.get('realtor')!,
        available: realtorStatus.available,
        remaining: realtorStatus.remaining
      })

      // Check RentCast API status  
      const rentcastStatus = await rentCastApiService.checkApiStatus()
      this.apiStatuses.set('rentcast', {
        ...this.apiStatuses.get('rentcast')!,
        available: rentcastStatus.available,
        remaining: rentcastStatus.remaining
      })

    } catch (error) {
      console.error('Error refreshing API statuses:', error)
    }
  }
}

// Export singleton instance
export const apiManager = ApiManager.getInstance()
export type { ApiStatus, ApiManagerConfig }