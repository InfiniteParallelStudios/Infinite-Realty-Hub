#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔗 Testing Supabase Connection...')
console.log('📍 URL:', supabaseUrl)
console.log('🔑 Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testBasicConnection() {
  try {
    // Test basic auth endpoint
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Auth error:', error.message)
      if (error.message.includes('Invalid API key')) {
        console.log('💡 This suggests:')
        console.log('   1. Your Supabase project may be paused')
        console.log('   2. The API key is incorrect')
        console.log('   3. The project URL is wrong')
        console.log('🔗 Check: https://supabase.com/dashboard/project/fncqxcmkylscjjbcxriu/settings/api')
      }
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('📊 Current session:', data.session ? 'Active' : 'None')
    
    return true
    
  } catch (error) {
    console.error('💥 Connection failed:', error.message)
    return false
  }
}

testBasicConnection().then(success => {
  if (success) {
    console.log('🎉 Supabase is properly configured!')
  } else {
    console.log('🔧 Please check your Supabase configuration')
  }
  process.exit(success ? 0 : 1)
})