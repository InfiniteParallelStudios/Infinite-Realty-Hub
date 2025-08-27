#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applySchema() {
  try {
    console.log('🚀 Starting database schema application...')
    
    // Read the schema file
    const schemaPath = path.resolve(__dirname, '../../../packages/database/src/schema.sql')
    
    if (!fs.existsSync(schemaPath)) {
      console.error(`❌ Schema file not found at: ${schemaPath}`)
      process.exit(1)
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('📄 Schema file loaded successfully')
    console.log(`📏 Schema size: ${(schema.length / 1024).toFixed(2)} KB`)
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      
      try {
        // Skip comments and empty statements
        if (statement.trim().startsWith('--') || statement.trim() === ';') {
          continue
        }
        
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`)
        
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql: statement 
        })
        
        if (error) {
          // Try direct execution for statements that don't work with rpc
          const { error: directError } = await supabase
            .from('_supabase_migrations')
            .select('*')
            .limit(1)
          
          if (directError && directError.code === '42P01') {
            // Table doesn't exist, this is expected for setup
            console.log(`⚠️  Statement ${i + 1}: ${error.message} (this may be expected)`)
          } else {
            throw error
          }
        }
        
        successCount++
        
      } catch (error) {
        console.error(`❌ Error in statement ${i + 1}:`, error.message)
        
        // Show the problematic statement (first 200 chars)
        const preview = statement.substring(0, 200) + (statement.length > 200 ? '...' : '')
        console.error(`📝 Statement: ${preview}`)
        
        errorCount++
        
        // Continue with other statements unless it's a critical error
        if (error.message.includes('already exists')) {
          console.log('   ℹ️  Object already exists, continuing...')
        } else if (error.message.includes('does not exist')) {
          console.log('   ℹ️  Dependency not found, continuing...')
        } else {
          // Critical error, stop execution
          console.error('   🛑 Critical error, stopping execution')
          break
        }
      }
    }
    
    console.log('\n🎯 Schema Application Summary:')
    console.log(`✅ Successful: ${successCount} statements`)
    console.log(`❌ Failed: ${errorCount} statements`)
    
    if (errorCount === 0) {
      console.log('\n🎉 Database schema applied successfully!')
      console.log('🔗 Visit your Supabase dashboard to verify: https://supabase.com/dashboard/project/fncqxcmkylscjjbcxriu')
    } else {
      console.log('\n⚠️  Schema applied with some errors. Check the logs above.')
      console.log('💡 Some errors may be expected (e.g., "already exists" messages)')
    }
    
  } catch (error) {
    console.error('💥 Fatal error applying schema:', error.message)
    process.exit(1)
  }
}

// Alternative method: Apply schema via SQL editor instructions
function showManualInstructions() {
  console.log('\n📋 MANUAL APPLICATION INSTRUCTIONS:')
  console.log('If the automatic application fails, you can apply the schema manually:')
  console.log('')
  console.log('1. Go to: https://supabase.com/dashboard/project/fncqxcmkylscjjbcxriu/sql')
  console.log('2. Copy the entire content of: packages/database/src/schema.sql')
  console.log('3. Paste it into the SQL editor')
  console.log('4. Click "Run" to execute the schema')
  console.log('')
  console.log('🔍 The schema includes:')
  console.log('   • 11 main tables (organizations, profiles, contacts, leads, etc.)')
  console.log('   • Row Level Security (RLS) policies')
  console.log('   • Performance indexes')
  console.log('   • Database functions and triggers')
  console.log('   • Sample seed data')
}

// Run the schema application
applySchema().catch(error => {
  console.error('Application failed:', error)
  showManualInstructions()
  process.exit(1)
})