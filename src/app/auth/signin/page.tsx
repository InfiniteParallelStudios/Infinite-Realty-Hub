'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { GlassCard } from '@/components/ui/glass-card'
import { HudBackground } from '@/components/ui/hud-background'
import { Building2, Chrome, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function SignInPage() {
  const { signInWithGoogle, signInWithEmail, user, loading } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isGoogleSignIn, setIsGoogleSignIn] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null) // Clear error when user starts typing
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password')
      return
    }

    try {
      setIsSigningIn(true)
      setError(null)
      console.log('🚀 Starting email sign in...')
      await signInWithEmail(formData.email, formData.password)
      console.log('✅ Email sign in successful')
    } catch (error: any) {
      console.error('❌ Email sign in error:', error)
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.')
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please check your email and click the verification link before signing in.')
      } else {
        setError(error.message || 'Failed to sign in. Please try again.')
      }
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleSignIn(true)
      setError(null)
      console.log('🚀 Starting Google sign in...')
      await signInWithGoogle()
      console.log('✅ Google sign in initiated')
    } catch (error: any) {
      console.error('❌ Sign in error:', error)
      setError(error.message || 'Failed to sign in with Google. Please try again.')
    } finally {
      setIsGoogleSignIn(false)
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
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-6 sm:p-8">
            {/* Logo and Header */}
            <div className="text-center mb-6 sm:mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-cyan-500/20 rounded-xl border border-cyan-400/30 mb-4"
              >
                <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
              </motion.div>
              
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to
              </h1>
              <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-2">
                Infinite Realty Hub
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
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

            {/* Email Sign In Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4 mb-4 sm:mb-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors text-base"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-12 py-2.5 sm:py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors text-base"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSigningIn}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 sm:py-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-300 text-white rounded-lg transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed font-medium"
                whileHover={{ scale: isSigningIn ? 1 : 1.02 }}
                whileTap={{ scale: isSigningIn ? 1 : 0.98 }}
              >
                {isSigningIn ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <motion.button
              onClick={handleGoogleSignIn}
              disabled={isGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 sm:py-4 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mb-4 sm:mb-6 font-medium"
              whileHover={{ scale: isGoogleSignIn ? 1 : 1.02 }}
              whileTap={{ scale: isGoogleSignIn ? 1 : 0.98 }}
            >
              {isGoogleSignIn ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
              ) : (
                <Chrome className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {isGoogleSignIn ? 'Signing in...' : 'Continue with Google'}
              </span>
            </motion.button>

            {/* Sign Up Link */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link 
                  href="/auth/signup" 
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>

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