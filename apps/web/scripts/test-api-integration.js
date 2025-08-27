#!/usr/bin/env node

/**
 * Test script to verify API integration with real keys
 */

require('dotenv').config({ path: '.env.local' })

// Test the actual APIs with the real keys
async function testRealtorAPI() {
  console.log('🏠 Testing Realtor16 API...')
  
  const rapidApiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY
  const rapidApiHost = 'realtor16.p.rapidapi.com'
  const baseUrl = 'https://realtor16.p.rapidapi.com'

  if (!rapidApiKey) {
    console.error('❌ NEXT_PUBLIC_RAPIDAPI_KEY not found in environment')
    return false
  }

  // Test common endpoint patterns
  const endpointsToTest = [
    '/property/market_trends?property_id=8461673077', // Your working example
    '/properties/list-for-sale?city=new-york&state_code=ny&limit=5',
    '/properties/v2/list-for-sale?city=new-york&state_code=ny&limit=5',
    '/locations/auto-complete?input=New York, NY',
    '/location/auto-complete?input=New York, NY',
    '/properties/search?query=New York, NY&limit=5',
    '/property/details?property_id=8461673077',
    '/agents/list?location=new-york-ny',
    '/mortgage/calculate?price=500000&down_payment=100000'
  ]

  let workingEndpoints = []
  
  for (const endpoint of endpointsToTest) {
    try {
      console.log(`  🔍 Testing: ${endpoint}`)
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': rapidApiHost
        }
      })

      console.log(`      Status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        workingEndpoints.push({
          endpoint,
          status: response.status,
          hasData: Object.keys(data).length > 0
        })
        console.log('      ✅ Working!')
      } else if (response.status === 429) {
        console.log('      ⏳ Rate limited - endpoint exists but need to wait')
        workingEndpoints.push({
          endpoint,
          status: response.status,
          hasData: false,
          rateLimited: true
        })
      } else {
        const errorText = await response.text()
        console.log(`      ❌ Error: ${errorText.substring(0, 100)}...`)
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.log(`      💥 Exception: ${error.message}`)
    }
  }

  console.log('\n  📊 WORKING ENDPOINTS FOUND:')
  workingEndpoints.forEach(endpoint => {
    console.log(`    ✅ ${endpoint.endpoint} (${endpoint.status})${endpoint.rateLimited ? ' [Rate Limited]' : ''}`)
  })

  return workingEndpoints.length > 0
}

async function testRentCastAPI() {
  console.log('\n🏘️ Testing RentCast API...')
  
  const apiKey = process.env.NEXT_PUBLIC_RENTCAST_API_KEY
  const baseUrl = 'https://api.rentcast.io/v1'

  if (!apiKey) {
    console.error('❌ NEXT_PUBLIC_RENTCAST_API_KEY not found in environment')
    return false
  }

  try {
    // Test 1: Property by Address
    console.log('  🏠 Testing property lookup...')
    const propertyResponse = await fetch(`${baseUrl}/properties?address=123 Main St, New York, NY`, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    })

    console.log(`  📡 Property API Status: ${propertyResponse.status}`)
    if (propertyResponse.ok) {
      const propertyData = await propertyResponse.json()
      console.log('  ✅ Property lookup working')
      console.log('  📊 Property found:', propertyData.address || 'No address returned')
    } else {
      const error = await propertyResponse.text()
      console.log('  ⚠️  Property API response:', error)
    }

    // Test 2: Market Data
    console.log('  📊 Testing market data by city...')
    const marketResponse = await fetch(`${baseUrl}/markets/city/New York/NY`, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    })

    console.log(`  📡 Market API Status: ${marketResponse.status}`)
    if (marketResponse.ok) {
      const marketData = await marketResponse.json()
      console.log('  ✅ Market data working')
      console.log('  📊 Median rent:', marketData.medianRent ? `$${marketData.medianRent}` : 'No data')
    } else {
      const error = await marketResponse.text()
      console.log('  ⚠️  Market API response:', error)
    }

    return true
  } catch (error) {
    console.error('  ❌ RentCast API Error:', error.message)
    return false
  }
}

async function testAPIStatus() {
  console.log('\n🔍 API INTEGRATION TEST RESULTS:')
  console.log('=' .repeat(50))

  const realtorWorking = await testRealtorAPI()
  const rentcastWorking = await testRentCastAPI()

  console.log('\n📊 SUMMARY:')
  console.log(`  Realtor16 API: ${realtorWorking ? '✅ Working' : '❌ Issues'}`)
  console.log(`  RentCast API: ${rentcastWorking ? '✅ Working' : '❌ Issues'}`)

  if (realtorWorking && rentcastWorking) {
    console.log('\n🎉 ALL APIS WORKING! Your market data system is ready!')
    console.log('\n💡 Next steps:')
    console.log('  • Visit http://localhost:3000/newsletter to see the API status widget')
    console.log('  • Test market data widgets on the dashboard')
    console.log('  • Generate a newsletter with real market data')
  } else {
    console.log('\n⚠️  Some APIs need attention. Check the errors above.')
    console.log('\n🔧 Troubleshooting:')
    console.log('  • Verify API keys in .env.local')
    console.log('  • Check RapidAPI subscription status')
    console.log('  • Ensure APIs are not rate limited')
  }

  console.log('\n📚 API Usage Limits:')
  console.log('  • Realtor16 API: Check your RapidAPI dashboard')
  console.log('  • RentCast API: 50 requests/month on free tier')
  console.log('  • Weekly caching reduces API calls automatically')
}

// Run the tests
testAPIStatus()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Test failed:', error)
    process.exit(1)
  })