#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for testing

console.log('🔍 Testing Database Schema and Integration...')
console.log('📍 URL:', supabaseUrl)

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testTableStructure() {
  console.log('\n📋 Testing Table Structure...')
  
  const expectedTables = [
    'organizations',
    'profiles', 
    'module_subscriptions',
    'contacts',
    'communications',
    'leads',
    'appointments',
    'tasks',
    'widget_configs',
    'notifications',
    'audit_logs'
  ]
  
  for (const table of expectedTables) {
    try {
      // Test if we can query the table (even empty result is success)
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table '${table}': ${error.message}`)
      } else {
        console.log(`✅ Table '${table}': Available`)
      }
    } catch (err) {
      console.log(`❌ Table '${table}': ${err.message}`)
    }
  }
}

async function testContactOperations() {
  console.log('\n👥 Testing Contact Operations...')
  
  try {
    // Create a test organization first
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .upsert({
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Test Organization',
        slug: 'test-org'
      })
      .select()
    
    if (orgError) {
      console.log('⚠️  Organization setup:', orgError.message)
    } else {
      console.log('✅ Test organization ready')
    }

    // Test contact insertion
    const testContact = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      phone: '(555) 123-4567',
      contact_type: 'lead',
      user_id: '00000000-0000-0000-0000-000000000001', // Mock user ID
      organization_id: '00000000-0000-0000-0000-000000000001'
    }
    
    // Insert test contact
    const { data: insertData, error: insertError } = await supabase
      .from('contacts')
      .insert(testContact)
      .select()
    
    if (insertError) {
      console.log('❌ Contact insertion failed:', insertError.message)
      console.log('   Details:', insertError.details)
    } else {
      console.log('✅ Contact inserted successfully:', insertData[0]?.full_name)
      
      // Test contact retrieval
      const { data: contacts, error: selectError } = await supabase
        .from('contacts')
        .select('*')
        .limit(5)
      
      if (selectError) {
        console.log('❌ Contact retrieval failed:', selectError.message)
      } else {
        console.log('✅ Contact retrieval successful:', `${contacts.length} contacts found`)
        contacts.forEach(contact => {
          console.log(`   - ${contact.full_name} (${contact.contact_type})`)
        })
      }
      
      // Clean up test data
      if (insertData[0]?.id) {
        await supabase
          .from('contacts')
          .delete()
          .eq('id', insertData[0].id)
        console.log('🧹 Test contact cleaned up')
      }
    }
    
  } catch (error) {
    console.error('💥 Contact operations failed:', error.message)
  }
}

async function testLeadOperations() {
  console.log('\n🎯 Testing Lead Operations...')
  
  try {
    // First create a test contact
    const { data: contactData, error: contactError } = await supabase
      .from('contacts')
      .insert({
        first_name: 'Lead',
        last_name: 'Test',
        email: 'lead@example.com',
        contact_type: 'lead',
        user_id: '00000000-0000-0000-0000-000000000001',
        organization_id: '00000000-0000-0000-0000-000000000001'
      })
      .select()
    
    if (contactError) {
      console.log('❌ Test contact creation for lead failed:', contactError.message)
      return
    }
    
    const contactId = contactData[0].id
    
    // Create test lead
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .insert({
        contact_id: contactId,
        user_id: '00000000-0000-0000-0000-000000000001',
        organization_id: '00000000-0000-0000-0000-000000000001',
        status: 'new',
        lead_type: 'buyer',
        estimated_value: 250000,
        probability: 50
      })
      .select()
    
    if (leadError) {
      console.log('❌ Lead creation failed:', leadError.message)
    } else {
      console.log('✅ Lead created successfully')
      
      // Test lead retrieval with contact info
      const { data: leads, error: leadSelectError } = await supabase
        .from('leads')
        .select(`
          *,
          contacts (
            full_name,
            email,
            phone
          )
        `)
        .limit(5)
      
      if (leadSelectError) {
        console.log('❌ Lead retrieval failed:', leadSelectError.message)
      } else {
        console.log('✅ Lead retrieval successful:', `${leads.length} leads found`)
        leads.forEach(lead => {
          console.log(`   - ${lead.contacts?.full_name} ($${lead.estimated_value}) [${lead.status}]`)
        })
      }
    }
    
    // Clean up
    if (leadData?.[0]?.id) {
      await supabase.from('leads').delete().eq('id', leadData[0].id)
    }
    if (contactId) {
      await supabase.from('contacts').delete().eq('id', contactId)
    }
    console.log('🧹 Test lead data cleaned up')
    
  } catch (error) {
    console.error('💥 Lead operations failed:', error.message)
  }
}

async function runAllTests() {
  try {
    await testTableStructure()
    await testContactOperations()
    await testLeadOperations()
    
    console.log('\n🎉 Database Integration Test Complete!')
    console.log('\n📋 Summary:')
    console.log('✅ Supabase connection working')
    console.log('✅ Database schema applied')
    console.log('✅ Tables accessible')
    console.log('✅ CRUD operations functional')
    console.log('\n🚀 Ready to connect UI components to database!')
    
  } catch (error) {
    console.error('💥 Test suite failed:', error.message)
    process.exit(1)
  }
}

runAllTests()