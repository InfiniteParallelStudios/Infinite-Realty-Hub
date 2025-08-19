'use client'

import { QRGenerator } from '@/components/qr/qr-generator'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function QRGeneratorPage() {
  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            QR Code Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create QR codes for lead capture and contact sharing
          </p>
        </div>
        
        <QRGenerator />
      </div>
    </ProtectedRoute>
  )
}