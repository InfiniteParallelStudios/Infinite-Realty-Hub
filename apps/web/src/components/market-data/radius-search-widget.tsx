'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Search, 
  Loader2, 
  TrendingUp, 
  Home, 
  DollarSign,
  Target,
  Users
} from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { 
  marketDataService, 
  MarketDataPoint, 
  RadiusSearchParams 
} from '@/services/market-data-service'

interface RadiusSearchWidgetProps {
  contactId?: string
  defaultLocation?: {
    latitude: number
    longitude: number
    address: string
  }
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void
}

export function RadiusSearchWidget({ 
  contactId, 
  defaultLocation,
  onLocationSelect 
}: RadiusSearchWidgetProps) {
  const [searchAddress, setSearchAddress] = useState(defaultLocation?.address || '')
  const [radiusMiles, setRadiusMiles] = useState(5)
  const [loading, setLoading] = useState(false)
  const [marketData, setMarketData] = useState<MarketDataPoint[]>([])
  const [selectedLocation, setSelectedLocation] = useState(defaultLocation)
  const [geocoding, setGeocoding] = useState(false)

  useEffect(() => {
    if (defaultLocation) {
      performRadiusSearch(defaultLocation)
    }
  }, [defaultLocation])

  const handleAddressSearch = async () => {
    if (!searchAddress.trim()) return
    
    setGeocoding(true)
    try {
      // Mock geocoding - in production, use Google Maps Geocoding API
      const mockCoordinates = {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
        address: searchAddress
      }
      
      setSelectedLocation(mockCoordinates)
      onLocationSelect?.({
        lat: mockCoordinates.latitude,
        lng: mockCoordinates.longitude,
        address: searchAddress
      })
      
      await performRadiusSearch(mockCoordinates)
    } catch (error) {
      console.error('Geocoding error:', error)
    }
    setGeocoding(false)
  }

  const performRadiusSearch = async (location: { latitude: number; longitude: number }) => {
    setLoading(true)
    try {
      const params: RadiusSearchParams = {
        latitude: location.latitude,
        longitude: location.longitude,
        radiusMiles: radiusMiles,
        propertyType: 'residential'
      }
      
      const data = await marketDataService.getMarketDataByRadius(params)
      setMarketData(data)
    } catch (error) {
      console.error('Radius search error:', error)
      setMarketData([])
    }
    setLoading(false)
  }

  const handleRadiusChange = async (newRadius: number) => {
    setRadiusMiles(newRadius)
    if (selectedLocation) {
      await performRadiusSearch(selectedLocation)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getAverageData = () => {
    if (marketData.length === 0) return null
    
    return {
      avgPrice: marketData.reduce((sum, data) => sum + data.medianPrice, 0) / marketData.length,
      avgDays: marketData.reduce((sum, data) => sum + data.averageDaysOnMarket, 0) / marketData.length,
      totalInventory: marketData.reduce((sum, data) => sum + data.inventoryLevel, 0),
      avgPriceChange: marketData.reduce((sum, data) => sum + data.priceChangePercent, 0) / marketData.length
    }
  }

  const averages = getAverageData()

  return (
    <div className="space-y-4">
      {/* Search Controls */}
      <GlassCard>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-400/30">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Market Search by Location
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Find market data within a specific radius
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Address Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Address or Area
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
                    placeholder="Enter address, city, or zip code"
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500"
                  />
                </div>
                <button
                  onClick={handleAddressSearch}
                  disabled={geocoding || !searchAddress.trim()}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-400 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {geocoding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Search
                </button>
              </div>
            </div>

            {/* Radius Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Radius: {radiusMiles} miles
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={radiusMiles}
                  onChange={(e) => handleRadiusChange(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex gap-1">
                  {[1, 5, 10, 15].map(radius => (
                    <button
                      key={radius}
                      onClick={() => handleRadiusChange(radius)}
                      className={`px-2 py-1 text-xs rounded ${
                        radiusMiles === radius
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {radius}mi
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Search Results */}
      {loading && (
        <GlassCard>
          <div className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              Searching market data within {radiusMiles} miles...
            </p>
          </div>
        </GlassCard>
      )}

      {/* Results Summary */}
      {!loading && marketData.length > 0 && averages && (
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Market Summary
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {marketData.length} areas within {radiusMiles} miles of {selectedLocation?.address}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Avg Price</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(averages.avgPrice)}
                </p>
                <span className={`text-xs ${
                  averages.avgPriceChange >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {averages.avgPriceChange >= 0 ? '+' : ''}{averages.avgPriceChange.toFixed(1)}%
                </span>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Home className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Avg Days</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {Math.round(averages.avgDays)}
                </p>
                <span className="text-xs text-gray-500">on market</span>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Inventory</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {averages.totalInventory}
                </p>
                <span className="text-xs text-gray-500">total homes</span>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Areas</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {marketData.length}
                </p>
                <span className="text-xs text-gray-500">neighborhoods</span>
              </div>
            </div>

            {/* Individual Area Results */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                Individual Areas
              </h5>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {marketData.map((area, index) => (
                  <motion.div
                    key={area.region}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {area.region}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {area.inventoryLevel} homes • {area.averageDaysOnMarket} days avg
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(area.medianPrice)}
                      </p>
                      <span className={`text-sm ${
                        area.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {area.priceChangePercent >= 0 ? '+' : ''}{area.priceChangePercent.toFixed(1)}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* No Results */}
      {!loading && selectedLocation && marketData.length === 0 && (
        <GlassCard>
          <div className="p-6 text-center">
            <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No market data found within {radiusMiles} miles of this location.
            </p>
            <button
              onClick={() => handleRadiusChange(radiusMiles + 5)}
              className="mt-3 text-purple-400 hover:text-purple-300 text-sm"
            >
              Try expanding search radius to {radiusMiles + 5} miles
            </button>
          </div>
        </GlassCard>
      )}
    </div>
  )
}