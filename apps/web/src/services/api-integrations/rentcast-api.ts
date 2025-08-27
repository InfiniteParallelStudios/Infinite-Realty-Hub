// RentCast API Integration (Formerly Realty Mole)
// 50 free requests per month

export interface RentCastApiConfig {
  apiKey: string
  baseUrl: string
}

export interface RentCastProperty {
  id: string
  address: string
  propertyType: string
  bedrooms: number
  bathrooms: number
  squareFootage: number
  lotSize: number
  yearBuilt: number
  lastSaleDate: string
  lastSalePrice: number
  estimatedValue: number
  rentEstimate: {
    rent: number
    rentRangeLow: number
    rentRangeHigh: number
    confidence: number
  }
  location: {
    latitude: number
    longitude: number
  }
  owner: {
    name: string
    mailingAddress: string
  }
  taxInfo: {
    annualTax: number
    assessedValue: number
    taxYear: number
  }
}

export interface RentCastMarketData {
  zipCode: string
  city: string
  state: string
  medianRent: number
  medianHomePrice: number
  priceToRentRatio: number
  rentAppreciation: number
  priceAppreciation: number
  averageDaysOnMarket: number
  inventoryCount: number
  marketTrends: {
    rentTrend: 'up' | 'down' | 'stable'
    priceTrend: 'up' | 'down' | 'stable'
    marketTemperature: 'hot' | 'warm' | 'cool'
  }
}

export interface RentCastComparable {
  address: string
  distance: number
  bedrooms: number
  bathrooms: number
  squareFootage: number
  lastSalePrice: number
  lastSaleDate: string
  pricePerSqft: number
}

class RentCastApiService {
  private config: RentCastApiConfig
  private DISABLE_ALL_API_CALLS = true;

  constructor() {
    this.config = {
      apiKey: process.env.NEXT_PUBLIC_RENTCAST_API_KEY || '',
      baseUrl: 'https://api.rentcast.io/v1'
    }
  }

  /**
   * Get property data by address
   */
  async getPropertyByAddress(address: string): Promise<RentCastProperty | null> {
    if (this.DISABLE_ALL_API_CALLS) {
      console.log('🚫 API calls disabled - RentCast property lookup blocked')
      return null
    }
    try {
      const response = await fetch(`${this.config.baseUrl}/properties?address=${encodeURIComponent(address)}`, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.config.apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`RentCast API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return this.normalizeProperty(data)
    } catch (error) {
      console.error('RentCast property lookup error:', error)
      return null
    }
  }

  /**
   * Get rent estimate for a property
   */
  async getRentEstimate(
    address: string,
    propertyType: 'Single Family' | 'Condo' | 'Townhouse' | 'Multi Family' = 'Single Family',
    bedrooms?: number,
    bathrooms?: number,
    squareFootage?: number
  ): Promise<{ rent: number; rentRangeLow: number; rentRangeHigh: number; confidence: number } | null> {
    if (this.DISABLE_ALL_API_CALLS) {
      console.log('🚫 API calls disabled - RentCast rent estimate blocked')
      return null
    }
    try {
      const params = new URLSearchParams({ address, propertyType })
      if (bedrooms) params.append('bedrooms', bedrooms.toString())
      if (bathrooms) params.append('bathrooms', bathrooms.toString())
      if (squareFootage) params.append('squareFootage', squareFootage.toString())

      const response = await fetch(`${this.config.baseUrl}/avm/rent/long-term?${params}`, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.config.apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Rent estimate error: ${response.status}`)
      }

      const data = await response.json()
      return {
        rent: data.rent || 0,
        rentRangeLow: data.rentRangeLow || 0,
        rentRangeHigh: data.rentRangeHigh || 0,
        confidence: data.confidence || 0
      }
    } catch (error) {
      console.error('RentCast rent estimate error:', error)
      return null
    }
  }

  /**
   * Get property value estimate
   */
  async getValueEstimate(
    address: string,
    propertyType: 'Single Family' | 'Condo' | 'Townhouse' | 'Multi Family' = 'Single Family',
    bedrooms?: number,
    bathrooms?: number,
    squareFootage?: number
  ): Promise<{ value: number; valueLow: number; valueHigh: number; confidence: number } | null> {
    try {
      const params = new URLSearchParams({ address, propertyType })
      if (bedrooms) params.append('bedrooms', bedrooms.toString())
      if (bathrooms) params.append('bathrooms', bathrooms.toString())
      if (squareFootage) params.append('squareFootage', squareFootage.toString())

      const response = await fetch(`${this.config.baseUrl}/avm/value?${params}`, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.config.apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Value estimate error: ${response.status}`)
      }

      const data = await response.json()
      return {
        value: data.value || 0,
        valueLow: data.valueLow || 0,
        valueHigh: data.valueHigh || 0,
        confidence: data.confidence || 0
      }
    } catch (error) {
      console.error('RentCast value estimate error:', error)
      return null
    }
  }

  /**
   * Get comparable sales (comps)
   */
  async getComparableSales(
    address: string,
    radius: number = 0.5,
    count: number = 10
  ): Promise<RentCastComparable[]> {
    try {
      const params = new URLSearchParams({
        address,
        radius: radius.toString(),
        count: count.toString()
      })

      const response = await fetch(`${this.config.baseUrl}/properties/comps?${params}`, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.config.apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Comps error: ${response.status}`)
      }

      const data = await response.json()
      return this.normalizeComparables(data.comps || [])
    } catch (error) {
      console.error('RentCast comps error:', error)
      return []
    }
  }

  /**
   * Get market data by ZIP code
   */
  async getMarketDataByZip(zipCode: string): Promise<RentCastMarketData | null> {
    try {
      const response = await fetch(`${this.config.baseUrl}/markets/zip/${zipCode}`, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.config.apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Market data error: ${response.status}`)
      }

      const data = await response.json()
      return this.normalizeMarketData(data)
    } catch (error) {
      // Silently handle RentCast API errors
      return null
    }
  }

  /**
   * Get market data by city/state
   */
  async getMarketDataByCity(city: string, state: string): Promise<RentCastMarketData | null> {
    try {
      const response = await fetch(`${this.config.baseUrl}/markets/city/${city}/${state}`, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.config.apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Market data error: ${response.status}`)
      }

      const data = await response.json()
      return this.normalizeMarketData(data)
    } catch (error) {
      // Silently handle RentCast city API errors
      return null
    }
  }

  /**
   * Search properties within radius
   */
  async searchPropertiesInRadius(
    latitude: number,
    longitude: number,
    radiusMiles: number,
    limit: number = 25
  ): Promise<RentCastProperty[]> {
    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: radiusMiles.toString(),
        limit: limit.toString()
      })

      const response = await fetch(`${this.config.baseUrl}/properties/search?${params}`, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.config.apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Property search error: ${response.status}`)
      }

      const data = await response.json()
      return this.normalizeProperties(data.properties || [])
    } catch (error) {
      console.error('RentCast property search error:', error)
      return []
    }
  }

  /**
   * Normalize single property data
   */
  private normalizeProperty(data: Record<string, unknown>): RentCastProperty | null {
    if (!data) return null

    return {
      id: data.id || '',
      address: data.address || '',
      propertyType: data.propertyType || 'Single Family',
      bedrooms: data.bedrooms || 0,
      bathrooms: data.bathrooms || 0,
      squareFootage: data.squareFootage || 0,
      lotSize: data.lotSize || 0,
      yearBuilt: data.yearBuilt || 0,
      lastSaleDate: data.lastSaleDate || '',
      lastSalePrice: data.lastSalePrice || 0,
      estimatedValue: data.estimatedValue || 0,
      rentEstimate: {
        rent: data.rentEstimate?.rent || 0,
        rentRangeLow: data.rentEstimate?.rentRangeLow || 0,
        rentRangeHigh: data.rentEstimate?.rentRangeHigh || 0,
        confidence: data.rentEstimate?.confidence || 0
      },
      location: {
        latitude: data.latitude || 0,
        longitude: data.longitude || 0
      },
      owner: {
        name: data.owner?.name || '',
        mailingAddress: data.owner?.mailingAddress || ''
      },
      taxInfo: {
        annualTax: data.taxInfo?.annualTax || 0,
        assessedValue: data.taxInfo?.assessedValue || 0,
        taxYear: data.taxInfo?.taxYear || new Date().getFullYear()
      }
    }
  }

  private normalizeProperties(properties: Record<string, unknown>[]): RentCastProperty[] {
    return properties.map(property => this.normalizeProperty(property)).filter(Boolean) as RentCastProperty[]
  }

  private normalizeComparables(comps: Record<string, unknown>[]): RentCastComparable[] {
    return comps.map(comp => ({
      address: comp.address || '',
      distance: comp.distance || 0,
      bedrooms: comp.bedrooms || 0,
      bathrooms: comp.bathrooms || 0,
      squareFootage: comp.squareFootage || 0,
      lastSalePrice: comp.lastSalePrice || 0,
      lastSaleDate: comp.lastSaleDate || '',
      pricePerSqft: comp.squareFootage > 0 ? (comp.lastSalePrice / comp.squareFootage) : 0
    }))
  }

  private normalizeMarketData(data: Record<string, unknown>): RentCastMarketData {
    const rentAppreciation = data.rentAppreciation || 0
    const priceAppreciation = data.priceAppreciation || 0

    return {
      zipCode: data.zipCode || '',
      city: data.city || '',
      state: data.state || '',
      medianRent: data.medianRent || 0,
      medianHomePrice: data.medianHomePrice || 0,
      priceToRentRatio: data.priceToRentRatio || 0,
      rentAppreciation,
      priceAppreciation,
      averageDaysOnMarket: data.averageDaysOnMarket || 0,
      inventoryCount: data.inventoryCount || 0,
      marketTrends: {
        rentTrend: rentAppreciation > 2 ? 'up' : rentAppreciation < -2 ? 'down' : 'stable',
        priceTrend: priceAppreciation > 3 ? 'up' : priceAppreciation < -3 ? 'down' : 'stable',
        marketTemperature: data.averageDaysOnMarket < 30 ? 'hot' : data.averageDaysOnMarket < 60 ? 'warm' : 'cool'
      }
    }
  }

  /**
   * Check API status and remaining requests
   */
  async checkApiStatus(): Promise<{ available: boolean; remaining?: number; resetDate?: string }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/properties?address=123 Main St`, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.config.apiKey,
          'Content-Type': 'application/json'
        }
      })

      return {
        available: response.status !== 429, // Not rate limited
        remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0'),
        resetDate: response.headers.get('X-RateLimit-Reset') || undefined
      }
    } catch {
      return { available: false }
    }
  }
}

// Export singleton instance
export const rentCastApiService = new RentCastApiService()
export type { RentCastProperty, RentCastMarketData, RentCastComparable }