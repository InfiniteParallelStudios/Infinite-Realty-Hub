'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
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
      console.warn('Google sign-in issue:', error.message)
      // Don't throw error to prevent JavaScript chunk failures
      return { error: error.message }
    } else {
      console.log('✅ Redirecting to Google OAuth...')
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    console.log('🚀 Starting email sign in for:', email)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('❌ Error signing in with email:', error)
      throw error
    } else {
      console.log('✅ Email sign in successful')
    }
  }

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    console.log('🚀 Starting email sign up for:', email)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })
    
    if (error) {
      console.error('❌ Error signing up with email:', error)
      throw error
    } else {
      console.log('✅ Email sign up successful:', data)
    }
  }

  const resetPassword = async (email: string) => {
    console.log('🚀 Starting password reset for:', email)
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    
    if (error) {
      console.error('❌ Error sending password reset email:', error)
      throw error
    } else {
      console.log('✅ Password reset email sent')
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
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
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
    console.warn('useAuth hook used outside AuthProvider, using defaults')
    // Return default values instead of throwing error to prevent chunk failures
    return {
      user: null,
      session: null,
      loading: false,
      signInWithGoogle: async () => ({ error: 'Auth not initialized' }),
      signInWithEmail: async () => { throw new Error('Auth not initialized') },
      signUpWithEmail: async () => { throw new Error('Auth not initialized') },
      signOut: async () => { throw new Error('Auth not initialized') },
      resetPassword: async () => { throw new Error('Auth not initialized') }
    }
  }
  return context
}