#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Creating Missing Tables...')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTable(tableName, createSQL) {
  console.log(`\n📝 Creating table: ${tableName}`)
  
  try {
    // First try to query the table to see if it exists
    const { error: checkError } = await supabase
      .from(tableName)
      .select('id')
      .limit(1)
    
    if (!checkError) {
      console.log(`✅ Table '${tableName}' already exists`)
      return true
    }
    
    // If table doesn't exist, try to create it using a raw query approach
    // Since RPC doesn't work, let's try INSERT with conflict handling
    const testInsert = await supabase
      .from(tableName + '_creation_test')
      .insert({ test: 'test' })
    
    // This will fail but might give us more info about the database state
    console.log(`⚠️  Table '${tableName}' does not exist, needs manual creation`)
    return false
    
  } catch (error) {
    console.log(`⚠️  Table '${tableName}' check failed: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('🔍 Checking database table status...\n')
  
  const expectedTables = {
    'organizations': 'Already exists',
    'profiles': 'Already exists', 
    'contacts': 'Already exists',
    'tasks': 'Already exists',
    'module_subscriptions': 'Missing - needed for billing',
    'communications': 'Missing - needed for contact history',
    'leads': 'Missing - needed for sales pipeline',
    'appointments': 'Missing - needed for calendar',
    'widget_configs': 'Missing - needed for dashboard',
    'notifications': 'Missing - needed for alerts',
    'audit_logs': 'Missing - needed for tracking'
  }
  
  let existingCount = 0
  let missingCount = 0
  
  for (const [tableName, description] of Object.entries(expectedTables)) {
    const exists = await createTable(tableName, '')
    if (exists) {
      existingCount++
    } else {
      missingCount++
    }
  }
  
  console.log(`\n📊 Database Status Summary:`)
  console.log(`✅ Existing tables: ${existingCount}`)
  console.log(`❌ Missing tables: ${missingCount}`)
  
  if (missingCount > 0) {
    console.log(`\n🚨 CRITICAL: ${missingCount} tables are missing!`)
    console.log(`\n📋 REQUIRED ACTION:`)
    console.log(`1. Open: https://supabase.com/dashboard/project/fncqxcmkylscjjbcxriu/sql`)
    console.log(`2. Copy content from: packages/database/src/schema.sql`)
    console.log(`3. Paste and run in SQL editor`)
    console.log(`4. This will create all missing tables and enable full functionality`)
    
    console.log(`\n🎯 What's broken without these tables:`)
    console.log(`- Contact management will show foreign key errors`)
    console.log(`- Lead pipeline won't work`)
    console.log(`- Calendar/appointments won't work`) 
    console.log(`- Dashboard widgets won't work`)
    console.log(`- Notifications won't work`)
    console.log(`- Billing/subscriptions won't work`)
  } else {
    console.log(`\n🎉 All tables exist! Database is ready.`)
  }
  
  process.exit(missingCount > 0 ? 1 : 0)
}

main()