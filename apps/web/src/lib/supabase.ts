import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'infinite-realty-hub-auth'
  }
})

// Database types (we'll generate these later)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          organization_id: string | null
          role: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          license_number: string | null
          license_state: string | null
          bio: string | null
          specialties: string[] | null
          work_areas: any | null
          preferences: any | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id?: string | null
          role?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          license_number?: string | null
          license_state?: string | null
          bio?: string | null
          specialties?: string[] | null
          work_areas?: any | null
          preferences?: any | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          role?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          license_number?: string | null
          license_state?: string | null
          bio?: string | null
          specialties?: string[] | null
          work_areas?: any | null
          preferences?: any | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Add other table types as needed
    }
  }
}

// Auth helpers
export const signInWithGoogle = async () => {
  const redirectTo = `${window.location.origin}/auth/callback`
  console.log('🚀 Initiating Google OAuth with redirect to:', redirectTo)
  
  const { data, error } = await supabase.auth.signInWithOAuth({
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
    console.error('❌ OAuth initiation error:', error)
  } else {
    console.log('✅ OAuth initiated, redirecting to Google...')
  }
  
  return { data, error }
}

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
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