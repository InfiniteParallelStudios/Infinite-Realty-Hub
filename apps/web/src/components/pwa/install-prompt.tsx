'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      const event = e as BeforeInstallPromptEvent
      console.log('📱 PWA install prompt available')
      
      // Prevent the default install prompt
      e.preventDefault()
      
      // Store the event for later use
      setDeferredPrompt(event)
      
      // Show our custom install prompt after a delay
      setTimeout(() => {
        setShowPrompt(true)
      }, 5000) // Show after 5 seconds
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('✅ PWA was installed')
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      setIsInstalling(true)
      
      // Show the install prompt
      await deferredPrompt.prompt()
      
      // Wait for the user to respond
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted the install prompt')
        setShowPrompt(false)
      } else {
        console.log('❌ User dismissed the install prompt')
      }
      
      // Clear the deferredPrompt
      setDeferredPrompt(null)
    } catch (error) {
      console.error('❌ Error during PWA installation:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  // Don't show if already installed or dismissed in this session
  if (isInstalled || sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null
  }

  return (
    <AnimatePresence>
      {showPrompt && deferredPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:max-w-md"
        >
          <GlassCard className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-400/30">
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                    Install Infinite Realty Hub
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Get quick access from your home screen
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDismiss}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Not now
              </button>
              
              <motion.button
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-300 text-white rounded-lg transition-colors font-medium text-sm disabled:cursor-not-allowed"
                whileHover={{ scale: isInstalling ? 1 : 1.02 }}
                whileTap={{ scale: isInstalling ? 1 : 0.98 }}
              >
                {isInstalling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Install
                  </>
                )}
              </motion.button>
            </div>

            {/* Features List */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <li>• Works offline</li>
                <li>• Fast loading</li>
                <li>• Home screen access</li>
                <li>• Native app feel</li>
              </ul>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// PWA Status Component - Shows when app is installed
export function PWAStatus() {
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if running as PWA
    const isPWA = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches

    if (isPWA) {
      setIsInstalled(true)
      console.log('✅ Running as PWA')
    }
  }, [])

  if (!isInstalled) return null

  return (
    <div className="fixed top-4 left-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full text-xs font-medium text-green-400"
      >
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        PWA Mode
      </motion.div>
    </div>
  )
}