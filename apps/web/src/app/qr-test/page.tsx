'use client'

import { useState } from 'react'
import { QrCode, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function QRTestPage() {
  const [testUrl, setTestUrl] = useState('')
  const [testResults, setTestResults] = useState<{
    urlGenerated: boolean
    qrGenerated: boolean
    formAccessible: boolean
    leadsCaptured: boolean
  }>({
    urlGenerated: false,
    qrGenerated: false,
    formAccessible: false,
    leadsCaptured: false
  })

  const runQRTest = async () => {
    console.log('🧪 Starting QR Code End-to-End Test')
    
    // Step 1: Generate test capture URL
    const params = new URLSearchParams({
      agent_name: 'Test Agent',
      agent_email: 'test@example.com',
      agent_phone: '(555) 123-4567',
      agent_company: 'Infinite Realty Hub'
    })
    
    const captureUrl = `${window.location.origin}/capture?${params.toString()}`
    setTestUrl(captureUrl)
    setTestResults(prev => ({ ...prev, urlGenerated: true }))
    console.log('✅ Step 1: Capture URL generated:', captureUrl)
    
    // Step 2: Test QR generation (simulate)
    try {
      const response = await fetch('/qr-generator')
      if (response.ok) {
        setTestResults(prev => ({ ...prev, qrGenerated: true }))
        console.log('✅ Step 2: QR Generator page accessible')
      }
    } catch (error) {
      console.error('❌ Step 2: QR Generator not accessible')
    }
    
    // Step 3: Test capture form accessibility
    try {
      const response = await fetch(captureUrl)
      if (response.ok) {
        setTestResults(prev => ({ ...prev, formAccessible: true }))
        console.log('✅ Step 3: Capture form accessible')
      }
    } catch (error) {
      console.error('❌ Step 3: Capture form not accessible')
    }
    
    // Step 4: Check leads dashboard
    try {
      const response = await fetch('/qr-leads')
      if (response.ok) {
        setTestResults(prev => ({ ...prev, leadsCaptured: true }))
        console.log('✅ Step 4: QR Leads dashboard accessible')
      }
    } catch (error) {
      console.error('❌ Step 4: QR Leads dashboard not accessible')
    }
    
    console.log('🧪 QR Code End-to-End Test Complete')
  }

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-400" />
    ) : (
      <AlertCircle className="w-5 h-5 text-gray-400" />
    )
  }

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-400/30">
            <QrCode className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              QR Code System Test
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              End-to-end testing of QR code lead capture system
            </p>
          </div>
        </div>

        {/* Test Controls */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            System Test
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Click the button below to run a comprehensive test of the QR code lead capture system.
          </p>
          
          <button
            onClick={runQRTest}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            Run QR System Test
          </button>
        </GlassCard>

        {/* Test Results */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Test Results
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              {getStatusIcon(testResults.urlGenerated)}
              <span className="text-gray-700 dark:text-gray-300">
                Capture URL Generation
              </span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              {getStatusIcon(testResults.qrGenerated)}
              <span className="text-gray-700 dark:text-gray-300">
                QR Generator Page Access
              </span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              {getStatusIcon(testResults.formAccessible)}
              <span className="text-gray-700 dark:text-gray-300">
                Capture Form Accessibility
              </span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              {getStatusIcon(testResults.leadsCaptured)}
              <span className="text-gray-700 dark:text-gray-300">
                Leads Dashboard Access
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Generated URL */}
        {testUrl && (
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Generated Test URL
            </h2>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
              <code className="text-sm break-all text-gray-700 dark:text-gray-300">
                {testUrl}
              </code>
            </div>
            <a
              href={testUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Test Capture Form
            </a>
          </GlassCard>
        )}

        {/* Quick Links */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Access
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="/qr-generator"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-cyan-400 transition-colors"
            >
              <QrCode className="w-8 h-8 text-cyan-400 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">QR Generator</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create QR codes</p>
            </a>
            
            <a
              href="/qr-leads"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-cyan-400 transition-colors"
            >
              <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">QR Leads</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">View captured leads</p>
            </a>
            
            <a
              href="/pipeline"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-cyan-400 transition-colors"
            >
              <ExternalLink className="w-8 h-8 text-purple-400 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Pipeline</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage leads</p>
            </a>
          </div>
        </GlassCard>
      </div>
    </ProtectedRoute>
  )
}