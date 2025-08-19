'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { GlassCard } from '@/components/ui/glass-card'

export default function TestDbPage() {
  const { user } = useAuth()
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [fixing, setFixing] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const testResults: any = {}

    try {
      // Test 1: Check if user is authenticated
      testResults.auth = user ? 'Authenticated' : 'Not authenticated'
      testResults.userId = user?.id || 'No user ID'

      // Test 2: Check organizations table
      const { data: orgs, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .limit(5)
      
      testResults.organizations = orgError 
        ? `Error: ${orgError.message}` 
        : `Found ${orgs?.length || 0} organizations`

      // Test 3: Check profiles table
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id || '')
      
      testResults.profile = profileError 
        ? `Error: ${profileError.message}` 
        : profiles?.length 
        ? `Profile found: ${JSON.stringify(profiles[0])}` 
        : 'No profile found'

      // Test 4: Check contacts table (this is what's failing)
      const { data: contacts, error: contactError } = await supabase
        .from('contacts')
        .select('*')
        .limit(5)
      
      testResults.contacts = contactError 
        ? `Error: ${contactError.message}` 
        : `Found ${contacts?.length || 0} contacts`

      // Test 5: Check pipeline_stages table
      const { data: stages, error: stageError } = await supabase
        .from('pipeline_stages')
        .select('*')
        .limit(5)
      
      testResults.pipeline_stages = stageError 
        ? `Error: ${stageError.message}` 
        : `Found ${stages?.length || 0} pipeline stages`

    } catch (error: any) {
      testResults.generalError = error.message || 'Unknown error'
    }

    setResults(testResults)
    setLoading(false)
  }

  const fixUserOrganization = async () => {
    if (!user) return

    setFixing(true)
    try {
      // Create organizations if they don't exist
      const { error: orgError } = await supabase
        .from('organizations')
        .upsert([
          {
            id: '00000000-0000-0000-0000-000000000001',
            name: 'Demo Realty Group',
            slug: 'demo-realty',
            plan_type: 'professional'
          }
        ], { onConflict: 'id' })

      if (orgError) {
        console.error('Error creating organization:', orgError)
        alert(`Error creating organization: ${orgError.message}`)
        setFixing(false)
        return
      }

      // Update user's profile to assign organization
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          organization_id: '00000000-0000-0000-0000-000000000001',
          role: 'agent',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) {
        console.error('Error updating profile:', profileError)
        alert(`Error updating profile: ${profileError.message}`)
        setFixing(false)
        return
      }

      alert('✅ Fixed! Your profile has been assigned to an organization. Refresh the page to test again.')
      
      // Rerun tests
      await runTests()
      
    } catch (error: any) {
      console.error('Fix error:', error)
      alert(`Error: ${error.message}`)
    }
    
    setFixing(false)
  }

  useEffect(() => {
    if (user) {
      runTests()
    }
  }, [user])

  if (!user) {
    return (
      <div className="p-6">
        <GlassCard>
          <h1 className="text-2xl font-bold mb-4">Database Test</h1>
          <p>Please sign in to test database connectivity.</p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Database Connectivity Test
          </h1>
          <div className="flex gap-2">
            <button
              onClick={runTests}
              disabled={loading}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-300 text-white rounded-lg transition-colors"
            >
              {loading ? 'Testing...' : 'Run Tests'}
            </button>
            <button
              onClick={fixUserOrganization}
              disabled={fixing}
              className="px-4 py-2 bg-green-500 hover:bg-green-400 disabled:bg-green-300 text-white rounded-lg transition-colors"
            >
              {fixing ? 'Fixing...' : 'Auto-Fix'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(results).map(([key, value]) => (
            <div key={key} className="border-l-4 border-cyan-400 pl-4">
              <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                {key.replace('_', ' ')}:
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1 font-mono text-sm">
                {String(value)}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Fix Instructions
        </h2>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <strong>If contacts table doesn't exist:</strong>
            <ol className="list-decimal list-inside ml-4 mt-2 space-y-1">
              <li>Go to your Supabase dashboard</li>
              <li>Open the SQL Editor</li>
              <li>Copy and run the content from <code>scripts/essential-schema.sql</code></li>
              <li>Then copy and run the content from <code>scripts/crm-schema.sql</code></li>
            </ol>
          </div>
          <div>
            <strong>If profile is missing:</strong>
            <p className="ml-4 mt-1">Sign out and sign back in to trigger profile creation.</p>
          </div>
          <div>
            <strong>If permission errors:</strong>
            <p className="ml-4 mt-1">Check that Row Level Security policies are properly set up.</p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}