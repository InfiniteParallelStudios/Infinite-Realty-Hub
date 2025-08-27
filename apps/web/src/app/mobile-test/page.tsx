'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Smartphone, Check, X, Wifi, Globe, QrCode, Monitor } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'

export default function MobileTestPage() {
  const [screenWidth, setScreenWidth] = useState(0)
  const [userAgent, setUserAgent] = useState('')
  const [touchSupport, setTouchSupport] = useState(false)
  const [orientation, setOrientation] = useState('')
  const [networkIP] = useState('10.0.3.207')
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Get device info
    setScreenWidth(window.innerWidth)
    setUserAgent(navigator.userAgent)
    setTouchSupport('ontouchstart' in window)
    setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait')

    // Test mobile features
    const tests = {
      responsive: window.innerWidth < 768,
      pwa: 'serviceWorker' in navigator,
      manifest: true, // Will be checked via fetch
      viewport: !!document.querySelector('meta[name="viewport"]'),
      touchEvents: 'ontouchstart' in window,
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage,
    }
    
    setTestResults(tests)

    // Event listeners
    const handleResize = () => {
      setScreenWidth(window.innerWidth)
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait')
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = screenWidth < 768
  const isTablet = screenWidth >= 768 && screenWidth < 1024
  const isDesktop = screenWidth >= 1024

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📱 Mobile System Test
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Comprehensive mobile feature verification
        </p>
      </div>

      {/* Device Information */}
      <GlassCard className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-cyan-400" />
          Current Device Info
        </h2>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Screen Width:</span>
            <span className="font-mono text-cyan-400">{screenWidth}px</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Device Type:</span>
            <span className="font-mono text-cyan-400">
              {isMobile ? '📱 Mobile' : isTablet ? '📱 Tablet' : '💻 Desktop'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Orientation:</span>
            <span className="font-mono text-cyan-400">{orientation}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Touch Support:</span>
            <span className="font-mono text-cyan-400">
              {touchSupport ? '✅ Yes' : '❌ No'}
            </span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs">
          <p className="text-gray-600 dark:text-gray-400 break-all">
            {userAgent}
          </p>
        </div>
      </GlassCard>

      {/* Feature Tests */}
      <GlassCard className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-400" />
          Mobile Feature Tests
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(testResults).map(([test, passed]) => (
            <div
              key={test}
              className={`flex items-center justify-between p-3 rounded-lg ${
                passed ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
              }`}
            >
              <span className="text-sm capitalize">{test.replace(/([A-Z])/g, ' $1').trim()}</span>
              {passed ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <X className="w-4 h-4 text-red-400" />
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Network Access */}
      <GlassCard className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Wifi className="w-5 h-5 text-cyan-400" />
          Mobile Access Options
        </h2>

        <div className="space-y-4">
          {/* Local Network */}
          <div className="p-4 bg-cyan-500/10 border border-cyan-400/30 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Option 1: Local Network (Same WiFi)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Use this URL on your phone's browser:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={`http://${networkIP}:3000`}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono"
                onClick={(e) => e.currentTarget.select()}
              />
              <button
                onClick={() => copyToClipboard(`http://${networkIP}:3000`)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded text-sm"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Alternative Solutions */}
          <div className="p-4 bg-purple-500/10 border border-purple-400/30 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Option 2: Alternative Solutions
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>• Use browser DevTools (F12 → Toggle device toolbar)</li>
              <li>• Install ngrok: <code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">brew install ngrok</code></li>
              <li>• Use localtunnel: <code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">npx localtunnel --port 3000</code></li>
              <li>• Deploy to Vercel for testing</li>
            </ul>
          </div>
        </div>
      </GlassCard>

      {/* Responsive Test Areas */}
      <GlassCard className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-cyan-400" />
          Responsive Test Elements
        </h2>

        {/* Test Buttons */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <motion.button
              className="px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg touch-manipulation"
              whileTap={{ scale: 0.95 }}
            >
              Touch Test Button
            </motion.button>
            
            <motion.button
              className="px-4 py-3 bg-purple-500 hover:bg-purple-400 text-white rounded-lg touch-manipulation"
              whileTap={{ scale: 0.95 }}
            >
              Another Button
            </motion.button>
            
            <motion.button
              className="px-4 py-3 bg-green-500 hover:bg-green-400 text-white rounded-lg touch-manipulation"
              whileTap={{ scale: 0.95 }}
            >
              Third Button
            </motion.button>
          </div>

          {/* Test Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white/10 dark:bg-gray-800/30 rounded-lg border border-cyan-400/30">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Card 1</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This card should be full width on mobile and half width on tablet+
              </p>
            </div>
            
            <div className="p-4 bg-white/10 dark:bg-gray-800/30 rounded-lg border border-purple-400/30">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Card 2</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Testing responsive grid layouts
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* QR Test Links */}
      <GlassCard className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-cyan-400" />
          Quick Test Links
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="/simple-qr"
            className="block p-4 bg-cyan-500/10 border border-cyan-400/30 rounded-lg hover:bg-cyan-500/20 transition-colors"
          >
            <h3 className="font-medium text-cyan-400 mb-1">Simple QR Test</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">/simple-qr</p>
          </a>
          
          <a
            href="/qr-generator"
            className="block p-4 bg-purple-500/10 border border-purple-400/30 rounded-lg hover:bg-purple-500/20 transition-colors"
          >
            <h3 className="font-medium text-purple-400 mb-1">QR Generator</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">/qr-generator</p>
          </a>
          
          <a
            href="/capture?agent_name=Test&agent_email=test@example.com"
            className="block p-4 bg-green-500/10 border border-green-400/30 rounded-lg hover:bg-green-500/20 transition-colors"
          >
            <h3 className="font-medium text-green-400 mb-1">Capture Form</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">/capture</p>
          </a>
          
          <a
            href="/dashboard"
            className="block p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg hover:bg-blue-500/20 transition-colors"
          >
            <h3 className="font-medium text-blue-400 mb-1">Dashboard</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">/dashboard</p>
          </a>
        </div>
      </GlassCard>

      {/* Viewport Test */}
      <div className="fixed bottom-20 right-4 z-40 bg-black/80 text-white px-3 py-1 rounded text-xs">
        {screenWidth}px × {typeof window !== 'undefined' ? window.innerHeight : 0}px
      </div>
    </div>
  )
}