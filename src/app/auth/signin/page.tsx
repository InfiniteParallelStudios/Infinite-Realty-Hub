'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { GlassCard } from '@/components/ui/glass-card'
import { HudBackground } from '@/components/ui/hud-background'
import { Building2, Chrome } from 'lucide-react'

export default function SignInPage() {
  const { signInWithGoogle, user, loading } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (user && !loading) {
      console.log('✅ User already authenticated, redirecting to dashboard')
      router.push('/dashboard')
    }

    // Check for error in URL params
    const errorParam = searchParams.get('error')
    if (errorParam) {
      console.log('❌ Auth error from URL:', errorParam)
      switch (errorParam) {
        case 'callback_error':
          setError('There was an error completing your sign in. Please try again.')
          break
        case 'session_error':
          setError('Session could not be established. Please try again.')
          break
        case 'oauth_error':
          setError('Authentication was cancelled or failed. Please try again.')
          break
        case 'no_code':
          setError('No authorization code received. Please try signing in again.')
          break
        case 'exchange_error':
          setError('Failed to complete authentication. Please check your Supabase configuration.')
          break
        case 'no_session':
          setError('Authentication completed but session could not be established. Please try again.')
          break
        case 'auth_timeout':
          setError('Authentication is taking too long. Please try again.')
          break
        default:
          setError('An authentication error occurred. Please try again.')
      }
    }
  }, [user, loading, router, searchParams])

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true)
      setError(null)
      console.log('🚀 Starting Google sign in...')
      await signInWithGoogle()
      console.log('✅ Google sign in initiated')
    } catch (error: any) {
      console.error('❌ Sign in error:', error)
      setError(error.message || 'Failed to sign in with Google. Please try again.')
    } finally {
      setIsSigningIn(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <HudBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-8">
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/20 rounded-xl border border-cyan-400/30 mb-4"
              >
                <Building2 className="w-8 h-8 text-cyan-400" />
              </motion.div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to
              </h1>
              <h2 className="text-3xl font-bold text-cyan-400 mb-2">
                Infinite Realty Hub
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your AI-powered real estate command center
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <p className="text-red-400 text-sm text-center">{error}</p>
              </motion.div>
            )}

            {/* Google Sign In Button */}
            <motion.button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isSigningIn ? 1 : 1.02 }}
              whileTap={{ scale: isSigningIn ? 1 : 0.98 }}
            >
              {isSigningIn ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
              ) : (
                <Chrome className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {isSigningIn ? 'Signing in...' : 'Continue with Google'}
              </span>
            </motion.button>

            {/* Features List */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 text-center">
                What you'll get access to:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {[
                  'AI-powered lead management',
                  'Market data and analytics',
                  'Client relationship tools',
                  'Professional dashboard'
                ].map((feature, index) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center"
                  >
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-3"></div>
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}