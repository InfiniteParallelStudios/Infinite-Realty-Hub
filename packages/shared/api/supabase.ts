import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient

export const initializeSupabase = (url: string, anonKey: string) => {
  if (!supabase) {
    supabase = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'infinite-realty-hub-auth'
      }
    })
  }
  return supabase
}

export const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase not initialized. Call initializeSupabase first.')
  }
  return supabase
}

// Auth methods
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000/auth/callback'
        : `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    }
  })
  return { data, error }
}

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000/auth/callback'
        : `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    }
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}