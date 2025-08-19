'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }
    
    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email || 'no user')
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // If user signed in, create/update their profile
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in, creating/updating profile')
        await createOrUpdateProfile(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const createOrUpdateProfile = async (user: User) => {
    try {
      console.log('👤 Creating/updating profile for:', user.email)
      
      // Try to upsert (insert or update) the profile
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          email: user.email || null,
          role: 'user',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        })
        .select()

      if (error) {
        console.error('❌ Error upserting profile:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
      } else {
        console.log('✅ Profile upserted successfully:', data)
      }
    } catch (error) {
      console.error('💥 Error handling profile:', error)
    }
  }

  const signInWithGoogle = async () => {
    const redirectTo = `${window.location.origin}/auth/callback`
    console.log('🚀 Starting Google sign in with redirect:', redirectTo)
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    
    if (error) {
      console.error('❌ Error signing in with Google:', error)
      throw error
    } else {
      console.log('✅ Redirecting to Google OAuth...')
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}