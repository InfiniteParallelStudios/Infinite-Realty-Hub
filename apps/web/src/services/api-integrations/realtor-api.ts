// RapidAPI Realtor Data API Integration
// 100 free requests per month

export interface RealtorApiConfig {
  rapidApiKey: string
  rapidApiHost: string
  baseUrl: string
}

export interface RealtorProperty {
  property_id: string
  listing_id: string
  plan_id?: string
  status: string
  photo_count: number
  list_price: number
  list_date: string
  last_update_date: string
  address: {
    line: string
    street_number: string
    street_name: string
    street_suffix: string
    city: string
    state_code: string
    postal_code: string
    country: string
  }
  description?: {
    sqft: number
    baths_full: number
    baths_half: number
    baths_total: number
    beds: number
    garage: number
    stories: number
    lot_sqft: number
    year_built: number
  }
  location: {
    lat: number
    lon: number
  }
  market_area?: {
    name: string
    type: string
  }
  price_history?: Array<{
    date: string
    price: number
    event: string
  }>
}

export interface RealtorMarketData {
  city: string
  state: string
  median_listing_price: number
  median_days_on_market: number
  active_listing_count: number
  price_change_percent: number
  market_trends: {
    trend: 'up' | 'down' | 'stable'
    hot_market: boolean
    inventory_level: 'low' | 'medium' | 'high'
  }
}

class RealtorApiService {
  private config: RealtorApiConfig
  private DISABLE_ALL_API_CALLS = true;

  constructor() {
    this.config = {
      rapidApiKey: process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '',
      rapidApiHost: 'realtor16.p.rapidapi.com',
      baseUrl: 'https://realtor16.p.rapidapi.com'
    }
  }

  /**
   * Get properties by location using Realtor16 API
   */
  async getPropertiesByLocation(
    city: string, 
    state: string, 
    options: {
      limit?: number
      offset?: number
      status?: 'for_sale' | 'sold' | 'for_rent'
      sort?: 'relevance' | 'price_low_to_high' | 'price_high_to_low' | 'newest'
      min_price?: number
      max_price?: number
    } = {}
  ): Promise<RealtorProperty[]> {
    if (this.DISABLE_ALL_API_CALLS) {
      console.log('🚫 API calls disabled - Realtor properties lookup blocked')
      return []
    }
    try {
      // First get location auto-complete to find proper location format
      const locationResponse = await fetch(`${this.config.baseUrl}/locations/auto-complete?input=${encodeURIComponent(`${city}, ${state}`)}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.config.rapidApiKey,
          'X-RapidAPI-Host': this.config.rapidApiHost
        }
      })

      let locationData = null
      if (locationResponse.ok) {
        const locations = await locationResponse.json()
        locationData = locations.data?.[0] || null
      }

      // Now search for properties
      const params = new URLSearchParams({
        location: locationData?.slug || `${city}-${state.toLowerCase()}`,
        limit: (options.limit || 20).toString(),
        offset: (options.offset || 0).toString()
      })

      if (options.min_price) params.append('price_min', options.min_price.toString())
      if (options.max_price) params.append('price_max', options.max_price.toString())

      const endpoint = options.status === 'sold' ? 'properties/list-sold' : 
                     options.status === 'for_rent' ? 'properties/list-for-rent' :
                     'properties/list-for-sale'

      const response = await fetch(`${this.config.baseUrl}/${endpoint}?${params}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.config.rapidApiKey,
          'X-RapidAPI-Host': this.config.rapidApiHost
        }
      })

      if (!response.ok) {
        throw new Error(`Realtor API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return this.normalizeProperties(data.data || data.properties || [])
    } catch (error) {
      console.error('Realtor API properties error:', error)
      return []
    }
  }

  /**
   * Get market data for a city/area using Realtor16 API
   */
  async getMarketData(city: string, state: string): Promise<RealtorMarketData | null> {
    try {
      // Use the working market trends endpoint with a sample property ID
      const response = await fetch(
        `${this.config.baseUrl}/property/market_trends?property_id=8461673077`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': this.config.rapidApiKey,
            'X-RapidAPI-Host': this.config.rapidApiHost
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Realtor API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      // Extract market data from the API response
      const cityData = data.home?.location?.city
      const countyData = data.home?.location?.county
      
      if (!cityData && !countyData) {
        throw new Error('No market data found in API response')
      }

      // Use city data if available, fallback to county data
      const marketData = cityData || countyData
      const housing = marketData.geo_statistics?.housing_market?.by_prop_type?.[0]?.attributes

      if (!housing) {
        throw new Error('No housing market data found')
      }

      return {
        city: marketData.city || city,
        state: marketData.state_code || state,
        median_listing_price: housing.median_listing_price || 0,
        median_days_on_market: housing.median_days_on_market || 0,
        active_listing_count: 100, // Estimated - API doesn't provide this directly
        price_change_percent: 0, // Would need historical data to calculate
        market_trends: {
          trend: housing.median_days_on_market < 30 ? 'up' : housing.median_days_on_market > 60 ? 'down' : 'stable',
          hot_market: housing.median_days_on_market < 30,
          inventory_level: housing.median_days_on_market < 30 ? 'low' : housing.median_days_on_market > 60 ? 'high' : 'medium'
        }
      }
    } catch (error) {
      // Silently handle Realtor API errors
      return null
    }
  }

  /**
   * Get property details by property ID using Realtor16 API
   */
  async getPropertyDetails(propertyId: string): Promise<RealtorProperty | null> {
    try {
      const response = await fetch(`${this.config.baseUrl}/property/details?property_id=${propertyId}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.config.rapidApiKey,
          'X-RapidAPI-Host': this.config.rapidApiHost
        }
      })

      if (!response.ok) {
        throw new Error(`Property details error: ${response.status}`)
      }

      const data = await response.json()
      return this.normalizeProperty(data.data || data.property || data)
    } catch (error) {
      console.error('Property details error:', error)
      return null
    }
  }

  /**
   * Search properties by address using Realtor16 API
   */
  async searchByAddress(address: string): Promise<RealtorProperty[]> {
    try {
      // First try to auto-complete the address to get proper location data
      const locationResponse = await fetch(`${this.config.baseUrl}/locations/auto-complete?input=${encodeURIComponent(address)}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.config.rapidApiKey,
          'X-RapidAPI-Host': this.config.rapidApiHost
        }
      })

      let searchLocation = address
      if (locationResponse.ok) {
        const locations = await locationResponse.json()
        searchLocation = locations.data?.[0]?.slug || address
      }

      const response = await fetch(
        `${this.config.baseUrl}/properties/list-for-sale?location=${encodeURIComponent(searchLocation)}&limit=20`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': this.config.rapidApiKey,
            'X-RapidAPI-Host': this.config.rapidApiHost
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Address search error: ${response.status}`)
      }

      const data = await response.json()
      return this.normalizeProperties(data.data || data.properties || [])
    } catch (error) {
      console.error('Address search error:', error)
      return []
    }
  }

  /**
   * Normalize API response to our standard format
   */
  private normalizeProperty(property: Record<string, unknown>): RealtorProperty | null {
    if (!property) return null

    return {
      property_id: property.property_id || '',
      listing_id: property.listing_id || '',
      status: property.status || 'unknown',
      photo_count: property.photo_count || 0,
      list_price: property.list_price || 0,
      list_date: property.list_date || new Date().toISOString(),
      last_update_date: property.last_update_date || new Date().toISOString(),
      address: {
        line: property.address?.line || '',
        street_number: property.address?.street_number || '',
        street_name: property.address?.street_name || '',
        street_suffix: property.address?.street_suffix || '',
        city: property.address?.city || '',
        state_code: property.address?.state_code || '',
        postal_code: property.address?.postal_code || '',
        country: property.address?.country || 'US'
      },
      description: {
        sqft: property.description?.sqft || 0,
        baths_full: property.description?.baths_full || 0,
        baths_half: property.description?.baths_half || 0,
        baths_total: property.description?.baths_total || 0,
        beds: property.description?.beds || 0,
        garage: property.description?.garage || 0,
        stories: property.description?.stories || 1,
        lot_sqft: property.description?.lot_sqft || 0,
        year_built: property.description?.year_built || 2000
      },
      location: {
        lat: property.location?.address?.coordinate?.lat || 0,
        lon: property.location?.address?.coordinate?.lon || 0
      },
      price_history: property.price_history || []
    }
  }

  private normalizeProperties(properties: Record<string, unknown>[]): RealtorProperty[] {
    return properties.map(property => this.normalizeProperty(property)).filter(Boolean) as RealtorProperty[]
  }

  /**
   * Calculate market metrics from property data
   */
  private calculateMarketMetrics(
    city: string, 
    state: string, 
    soldProperties: Record<string, unknown>[], 
    activeListings: Record<string, unknown>[]
  ): RealtorMarketData {
    const soldPrices = soldProperties.map(p => p.list_price || 0).filter(price => price > 0)
    const activePrices = activeListings.map(p => p.list_price || 0).filter(price => price > 0)
    
    const medianSoldPrice = this.calculateMedian(soldPrices)
    const medianActivePrice = this.calculateMedian(activePrices)
    
    const daysOnMarket = soldProperties
      .map(p => {
        if (p.list_date && p.sold_date) {
          const listDate = new Date(p.list_date)
          const soldDate = new Date(p.sold_date)
          return Math.round((soldDate.getTime() - listDate.getTime()) / (1000 * 60 * 60 * 24))
        }
        return 0
      })
      .filter(days => days > 0)

    const medianDaysOnMarket = this.calculateMedian(daysOnMarket)
    const priceChangePercent = medianSoldPrice > 0 
      ? ((medianActivePrice - medianSoldPrice) / medianSoldPrice) * 100 
      : 0

    return {
      city,
      state,
      median_listing_price: medianActivePrice,
      median_days_on_market: medianDaysOnMarket,
      active_listing_count: activeListings.length,
      price_change_percent: priceChangePercent,
      market_trends: {
        trend: priceChangePercent > 2 ? 'up' : priceChangePercent < -2 ? 'down' : 'stable',
        hot_market: medianDaysOnMarket < 30 && activeListings.length < 50,
        inventory_level: activeListings.length < 30 ? 'low' : activeListings.length > 100 ? 'high' : 'medium'
      }
    }
  }

  private calculateMedian(numbers: number[]): number {
    if (numbers.length === 0) return 0
    
    const sorted = [...numbers].sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2
    }
    return sorted[middle]
  }

  /**
   * Check API usage/rate limits
   */
  async checkApiStatus(): Promise<{ available: boolean; remaining?: number; resetTime?: string }> {
    try {
      // Make a minimal test request
      const response = await fetch(`${this.config.baseUrl}/properties/v2/list-for-sale?city=test&state_code=CA&limit=1`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.config.rapidApiKey,
          'X-RapidAPI-Host': this.config.rapidApiHost
        }
      })

      return {
        available: response.ok,
        remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0'),
        resetTime: response.headers.get('X-RateLimit-Reset') || undefined
      }
    } catch {
      return { available: false }
    }
  }
}

// Export singleton instance
export const realtorApiService = new RealtorApiService()
export type { RealtorProperty, RealtorMarketData }