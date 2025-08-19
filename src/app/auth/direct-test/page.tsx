'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function DirectAuthTest() {
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }
  
  useEffect(() => {
    // Check if we're returning from OAuth
    const hash = window.location.hash
    const params = new URLSearchParams(window.location.search)
    
    addLog(`Current URL: ${window.location.href}`)
    addLog(`Hash: ${hash || 'none'}`)
    addLog(`Search params: ${params.toString() || 'none'}`)
    
    // Check for Supabase session in URL
    if (hash && hash.includes('access_token')) {
      addLog('✅ Found access token in URL hash!')
    }
    
    if (params.get('code')) {
      addLog(`✅ Found authorization code: ${params.get('code')?.substring(0, 20)}...`)
    }
    
    if (params.get('error')) {
      addLog(`❌ OAuth error: ${params.get('error')}`)
    }
  }, [])
  
  const testDirectAuth = async () => {
    addLog('Starting direct Supabase OAuth test...')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Check current session first
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      addLog(`❌ Session error: ${sessionError.message}`)
    } else if (sessionData.session) {
      addLog(`✅ Existing session found: ${sessionData.session.user.email}`)
      return
    } else {
      addLog('No existing session')
    }
    
    // Initiate OAuth
    addLog('Initiating Google OAuth...')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.href, // Redirect back to this same page
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    
    if (error) {
      addLog(`❌ OAuth error: ${error.message}`)
    } else {
      addLog('✅ OAuth initiated, redirecting to Google...')
      addLog(`Provider URL: ${data.url}`)
    }
  }
  
  const checkSession = async () => {
    addLog('Checking current session...')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      addLog(`❌ Error: ${error.message}`)
    } else if (data.session) {
      addLog(`✅ Session active: ${data.session.user.email}`)
      addLog(`User ID: ${data.session.user.id}`)
      addLog(`Provider: ${data.session.user.app_metadata.provider}`)
    } else {
      addLog('❌ No active session')
    }
  }
  
  const handleSessionFromURL = async () => {
    addLog('Attempting to handle session from URL...')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // This should automatically handle the session from the URL
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      addLog(`❌ Error: ${error.message}`)
    } else if (data.session) {
      addLog(`✅ Session established: ${data.session.user.email}`)
    } else {
      addLog('❌ No session could be established from URL')
    }
  }
  
  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Direct OAuth Test</h1>
        
        <div className="flex gap-4">
          <button
            onClick={testDirectAuth}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded"
          >
            Test Google OAuth
          </button>
          
          <button
            onClick={checkSession}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded"
          >
            Check Session
          </button>
          
          <button
            onClick={handleSessionFromURL}
            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded"
          >
            Handle URL Session
          </button>
          
          <button
            onClick={() => setLogs([])}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 rounded"
          >
            Clear Logs
          </button>
        </div>
        
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Configuration:</h2>
          <p className="text-sm text-gray-400">URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
          <p className="text-sm text-gray-400">Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30)}...</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Logs:</h2>
          <div className="space-y-1 text-sm font-mono">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-green-400' : 'text-gray-300'}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}