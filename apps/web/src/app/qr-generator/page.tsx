'use client'

import { QRGenerator } from '@/components/qr/qr-generator'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { HudBackground } from '@/components/ui/hud-background'
import { config } from '@/lib/config'

export default function QRGeneratorPage() {
  // In production, require authentication. In development, allow demo mode.
  if (config.auth.requireAuth && !config.enableDemoMode) {
    return (
      <ProtectedRoute>
        <QRGeneratorPageContent />
      </ProtectedRoute>
    )
  }
  
  return <QRGeneratorPageContent />
}

function QRGeneratorPageContent() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <HudBackground />
      
      <div className="relative z-10 min-h-screen">
        <div className="p-4 sm:p-6 space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              QR Code Generator
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create QR codes for lead capture and contact sharing
            </p>
            {config.enableDemoMode && (
              <div className="mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  ✓ Demo Mode - No Login Required
                </span>
              </div>
            )}
          </div>
          
          <QRGenerator />
        </div>
      </div>
    </div>
  )
}