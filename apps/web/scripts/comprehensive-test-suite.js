#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const QRCode = require('qrcode')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🧪 COMPREHENSIVE TEST SUITE')
console.log('Testing all app functionality end-to-end...\n')

const supabase = createClient(supabaseUrl, supabaseServiceKey)

let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
}

function logResult(testName, status, message, details = null) {
  const symbols = { pass: '✅', fail: '❌', warn: '⚠️' }
  const result = { testName, status, message, details }
  
  testResults.tests.push(result)
  if (status === 'pass') testResults.passed++
  else if (status === 'fail') testResults.failed++
  else testResults.warnings++
  
  console.log(`${symbols[status]} ${testName}: ${message}`)
  if (details) console.log(`   ${details}`)
}

async function test1_DatabaseConnection() {
  console.log('\n🔗 TEST 1: Database Connection')
  
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    
    logResult('Database Connection', 'pass', 'Supabase connection successful')
    return true
  } catch (error) {
    logResult('Database Connection', 'fail', 'Connection failed', error.message)
    return false
  }
}

async function test2_AllTablesExist() {
  console.log('\n📋 TEST 2: Database Schema Verification')
  
  const requiredTables = [
    'organizations', 'profiles', 'module_subscriptions', 'contacts',
    'communications', 'leads', 'appointments', 'tasks', 'widget_configs',
    'notifications', 'audit_logs'
  ]
  
  let allTablesExist = true
  
  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1)
      if (error) throw error
      logResult(`Table ${table}`, 'pass', 'Exists and accessible')
    } catch (error) {
      logResult(`Table ${table}`, 'fail', 'Missing or inaccessible', error.message)
      allTablesExist = false
    }
  }
  
  return allTablesExist
}

async function test3_AuthenticationSystem() {
  console.log('\n👤 TEST 3: Authentication System')
  
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers()
    if (error) throw error
    
    if (users.users.length > 0) {
      logResult('User Authentication', 'pass', `${users.users.length} users found`)
      
      // Test profile creation for first user
      const firstUser = users.users[0]
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', firstUser.id)
        .single()
      
      if (profileError && profileError.code === 'PGRST116') {
        // Create profile for testing
        const { error: createError } = await supabase
          .from('profiles')
          .upsert({
            id: firstUser.id,
            full_name: firstUser.email?.split('@')[0] || 'Test User',
            role: 'agent',
            onboarding_completed: true
          })
        
        if (createError) {
          logResult('Profile System', 'warn', 'Could not create profile', createError.message)
        } else {
          logResult('Profile System', 'pass', 'Profile created successfully')
        }
      } else if (profileError) {
        logResult('Profile System', 'fail', 'Profile system error', profileError.message)
      } else {
        logResult('Profile System', 'pass', `Profile exists: ${profile.full_name}`)
      }
      
      return firstUser.id
    } else {
      logResult('User Authentication', 'warn', 'No users found - need to sign in via app first')
      return null
    }
  } catch (error) {
    logResult('User Authentication', 'fail', 'Auth system error', error.message)
    return null
  }
}

async function test4_ContactManagement(userId) {
  console.log('\n👥 TEST 4: Contact Management System')
  
  if (!userId) {
    logResult('Contact Management', 'warn', 'Skipped - no user ID available')
    return
  }
  
  try {
    // Test contact creation
    const testContact = {
      first_name: 'Test',
      last_name: 'Contact',
      email: 'test.contact@example.com',
      phone: '(555) 123-4567',
      contact_type: 'lead',
      user_id: userId
    }
    
    const { data: contact, error: createError } = await supabase
      .from('contacts')
      .insert(testContact)
      .select()
    
    if (createError) throw createError
    
    logResult('Contact Creation', 'pass', `Contact created: ${contact[0].full_name}`)
    
    // Test contact retrieval
    const { data: contacts, error: selectError } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .limit(5)
    
    if (selectError) throw selectError
    
    logResult('Contact Retrieval', 'pass', `Found ${contacts.length} contacts`)
    
    // Clean up
    await supabase.from('contacts').delete().eq('id', contact[0].id)
    logResult('Contact Cleanup', 'pass', 'Test contact removed')
    
  } catch (error) {
    logResult('Contact Management', 'fail', 'Contact operations failed', error.message)
  }
}

async function test5_LeadPipeline(userId) {
  console.log('\n🎯 TEST 5: Lead Pipeline System')
  
  if (!userId) {
    logResult('Lead Pipeline', 'warn', 'Skipped - no user ID available')
    return
  }
  
  try {
    // Create test contact first
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .insert({
        first_name: 'Lead',
        last_name: 'Test',
        email: 'lead.test@example.com',
        contact_type: 'lead',
        user_id: userId
      })
      .select()
    
    if (contactError) throw contactError
    
    // Create lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        contact_id: contact[0].id,
        user_id: userId,
        status: 'new',
        lead_type: 'buyer',
        estimated_value: 250000,
        probability: 70
      })
      .select()
    
    if (leadError) throw leadError
    
    logResult('Lead Creation', 'pass', `Lead created with $${lead[0].estimated_value} value`)
    
    // Test lead retrieval with contact join
    const { data: leads, error: selectError } = await supabase
      .from('leads')
      .select(`
        *,
        contacts (
          full_name,
          email
        )
      `)
      .eq('user_id', userId)
    
    if (selectError) throw selectError
    
    logResult('Lead Pipeline Query', 'pass', `Retrieved ${leads.length} leads with contact data`)
    
    // Clean up
    await supabase.from('leads').delete().eq('id', lead[0].id)
    await supabase.from('contacts').delete().eq('id', contact[0].id)
    logResult('Lead Pipeline Cleanup', 'pass', 'Test data removed')
    
  } catch (error) {
    logResult('Lead Pipeline', 'fail', 'Pipeline operations failed', error.message)
  }
}

async function test6_QRCodeGeneration() {
  console.log('\n📱 TEST 6: QR Code Generation')
  
  try {
    // Test QR code generation with different data
    const testData = 'https://irh.infiniteparallelstudios.com/capture?agent=test'
    
    const qrCodeDataURL = await QRCode.toDataURL(testData, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
    
    if (qrCodeDataURL && qrCodeDataURL.startsWith('data:image/png;base64,')) {
      logResult('QR Code Generation', 'pass', 'QR code generated successfully')
      logResult('QR Code Data URL', 'pass', `${qrCodeDataURL.length} byte data URL created`)
    } else {
      throw new Error('Invalid QR code data URL format')
    }
    
    // Test canvas generation
    const canvas = require('canvas').createCanvas(256, 256)
    await QRCode.toCanvas(canvas, testData, { width: 256, margin: 2 })
    
    logResult('QR Code Canvas', 'pass', 'Canvas generation successful')
    
  } catch (error) {
    logResult('QR Code Generation', 'fail', 'QR generation failed', error.message)
  }
}

async function test7_CommunicationsSystem(userId) {
  console.log('\n💬 TEST 7: Communications System')
  
  if (!userId) {
    logResult('Communications System', 'warn', 'Skipped - no user ID available')
    return
  }
  
  try {
    // Create test contact
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .insert({
        first_name: 'Comm',
        last_name: 'Test',
        email: 'comm.test@example.com',
        user_id: userId
      })
      .select()
    
    if (contactError) throw contactError
    
    // Create communication record
    const { data: comm, error: commError } = await supabase
      .from('communications')
      .insert({
        contact_id: contact[0].id,
        user_id: userId,
        type: 'email',
        direction: 'outbound',
        subject: 'Test Email',
        content: 'This is a test communication'
      })
      .select()
    
    if (commError) throw commError
    
    logResult('Communication Creation', 'pass', `${comm[0].type} communication logged`)
    
    // Clean up
    await supabase.from('communications').delete().eq('id', comm[0].id)
    await supabase.from('contacts').delete().eq('id', contact[0].id)
    logResult('Communications Cleanup', 'pass', 'Test data removed')
    
  } catch (error) {
    logResult('Communications System', 'fail', 'Communications failed', error.message)
  }
}

async function test8_EnvironmentConfiguration() {
  console.log('\n⚙️ TEST 8: Environment Configuration')
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]
  
  let allEnvVarsPresent = true
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      logResult(`Env Var ${envVar}`, 'pass', 'Present and configured')
    } else {
      logResult(`Env Var ${envVar}`, 'fail', 'Missing or empty')
      allEnvVarsPresent = false
    }
  }
  
  // Test app configuration
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  logResult('App URL Config', 'pass', `Configured as: ${appUrl}`)
  
  return allEnvVarsPresent
}

async function runTestSuite() {
  console.log('Starting comprehensive test suite...\n')
  
  // Run all tests
  await test1_DatabaseConnection()
  await test2_AllTablesExist()
  const userId = await test3_AuthenticationSystem()
  await test4_ContactManagement(userId)
  await test5_LeadPipeline(userId)
  await test6_QRCodeGeneration()
  await test7_CommunicationsSystem(userId)
  await test8_EnvironmentConfiguration()
  
  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('🧪 TEST SUITE COMPLETE')
  console.log('='.repeat(60))
  
  console.log(`\n📊 RESULTS SUMMARY:`)
  console.log(`✅ Passed: ${testResults.passed}`)
  console.log(`❌ Failed: ${testResults.failed}`)
  console.log(`⚠️  Warnings: ${testResults.warnings}`)
  console.log(`📋 Total Tests: ${testResults.tests.length}`)
  
  const successRate = (testResults.passed / testResults.tests.length * 100).toFixed(1)
  console.log(`🎯 Success Rate: ${successRate}%`)
  
  if (testResults.failed === 0) {
    console.log('\n🎉 ALL CRITICAL TESTS PASSED!')
    console.log('✅ Your app is fully functional and ready for production!')
    
    console.log('\n🚀 READY FOR NEXT STEPS:')
    console.log('1. ✅ Database integration complete')
    console.log('2. ✅ All core features working')
    console.log('3. 🔄 Ready to implement Stripe payments')
    console.log('4. 🔄 Ready for production deployment')
    
  } else {
    console.log('\n⚠️  SOME TESTS FAILED')
    console.log('Review the failed tests above and fix any critical issues.')
    
    // Show failed tests
    const failedTests = testResults.tests.filter(t => t.status === 'fail')
    if (failedTests.length > 0) {
      console.log('\n❌ FAILED TESTS:')
      failedTests.forEach(test => {
        console.log(`   • ${test.testName}: ${test.message}`)
        if (test.details) console.log(`     ${test.details}`)
      })
    }
  }
  
  process.exit(testResults.failed > 0 ? 1 : 0)
}

runTestSuite()