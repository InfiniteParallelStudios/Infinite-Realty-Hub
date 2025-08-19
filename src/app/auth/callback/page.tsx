'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔄 Processing auth callback...')
      
      // The access token will be in the URL hash for implicit flow
      // Supabase client will automatically handle it when we call getSession
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Error getting session:', error)
        router.push('/auth/signin?error=session_error')
        return
      }

      if (data.session) {
        console.log('✅ Session established for:', data.session.user.email)
        console.log('👤 User name:', data.session.user.user_metadata?.full_name)
        router.push('/dashboard')
      } else {
        console.log('⏳ No session yet, waiting for Supabase to process...')
        // Give Supabase a moment to process the hash
        setTimeout(async () => {
          const { data: retryData } = await supabase.auth.getSession()
          if (retryData.session) {
            console.log('✅ Session found on retry!')
            router.push('/dashboard')
          } else {
            console.log('❌ No session after retry')
            router.push('/auth/signin?error=no_session')
          }
        }, 1000)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg-light to-bg-light-secondary dark:from-bg-dark dark:to-bg-space">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Completing sign in...</p>
      </div>
    </div>
  )
}