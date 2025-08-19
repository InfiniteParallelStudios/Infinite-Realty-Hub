'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function TestGoogleAuth() {
  const [status, setStatus] = useState<string>('Ready to test')
  const [error, setError] = useState<string | null>(null)
  
  const testGoogleAuth = async () => {
    setStatus('Starting Google OAuth...')
    setError(null)
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Test 1: Check basic connection
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    console.log('Current session:', sessionData)
    
    if (sessionError) {
      setError(`Session error: ${sessionError.message}`)
      return
    }
    
    // Test 2: Initiate Google OAuth
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    
    if (oauthError) {
      setError(`OAuth error: ${oauthError.message}`)
      console.error('OAuth error:', oauthError)
    } else {
      setStatus('Redirecting to Google...')
      console.log('OAuth data:', data)
    }
  }
  
  const checkSession = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      setError(`Session check error: ${error.message}`)
    } else if (data.session) {
      setStatus(`Logged in as: ${data.session.user.email}`)
    } else {
      setStatus('No active session')
    }
  }
  
  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Google OAuth Test Page
        </h1>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Connection Info:</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            <p><strong>Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
            <p><strong>Callback URL:</strong> {window.location.origin}/auth/callback</p>
          </div>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Status:</h2>
          <p className={`text-lg ${error ? 'text-red-500' : 'text-green-500'}`}>
            {error || status}
          </p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={testGoogleAuth}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Test Google Sign In
          </button>
          
          <button
            onClick={checkSession}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Check Current Session
          </button>
        </div>
        
        <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click "Test Google Sign In" to initiate OAuth</li>
            <li>Complete Google sign in</li>
            <li>You should be redirected back to /auth/callback</li>
            <li>Then redirected to /dashboard</li>
            <li>Click "Check Current Session" to verify login</li>
          </ol>
        </div>
        
        <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-2">Console Output:</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Open browser console (F12) to see detailed logs
          </p>
        </div>
      </div>
    </div>
  )
}