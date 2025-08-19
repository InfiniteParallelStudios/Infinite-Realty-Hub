#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('🔍 Testing Supabase connection and schema...')
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact' }).limit(0)
    
    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Profiles table does not exist!')
        console.log('📋 You need to apply the database schema first.')
        console.log('📁 Copy content from: scripts/essential-schema.sql')
        console.log('🔗 Paste into: https://supabase.com/dashboard/project/fncqxcmkylscjjbcxriu/sql')
        return false
      } else {
        console.error('❌ Database error:', error.message)
        return false
      }
    }
    
    console.log('✅ Profiles table exists!')
    console.log(`📊 Current profile count: ${data?.length || 0}`)
    
    // Test organizations table
    const { data: orgData, error: orgError } = await supabase.from('organizations').select('count', { count: 'exact' }).limit(0)
    
    if (orgError) {
      console.log('❌ Organizations table missing')
      return false
    }
    
    console.log('✅ Organizations table exists!')
    console.log('🎉 Database schema is properly configured!')
    return true
    
  } catch (error) {
    console.error('💥 Connection test failed:', error.message)
    return false
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1)
})