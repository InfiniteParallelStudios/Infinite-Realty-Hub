'use client'

import { motion } from 'framer-motion'
import { QrCode } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'

export default function SimpleQRPage() {
  const testURL = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/capture?agent_name=Sarah%20Johnson&agent_email=sarah@infiniterealty.com&agent_phone=(555)%20123-4567&agent_company=Infinite%20Realty%20Hub`

  return (
    <div className="min-h-screen p-6 space-y-6">
      <GlassCard className="p-8 text-center">
        <QrCode className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          QR Code Test
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Test the lead capture system
        </p>

        {/* Simple QR Code placeholder */}
        <div className="bg-white p-8 rounded-lg shadow-lg inline-block mb-6">
          <div className="w-64 h-64 bg-black relative">
            {/* Simple QR pattern */}
            <div className="absolute inset-4 bg-white"></div>
            <div className="absolute top-4 left-4 w-12 h-12 bg-black"></div>
            <div className="absolute top-4 right-4 w-12 h-12 bg-black"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 bg-black"></div>
            
            {/* Center logo */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-cyan-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">∞</span>
            </div>
            
            {/* Data pattern */}
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className={`absolute w-2 h-2 bg-black`} style={{
                top: `${20 + (i * 6)}%`,
                left: `${30 + (i % 3) * 8}%`
              }} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <motion.a
            href={testURL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Test Capture Form →
          </motion.a>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Or copy this URL to test on your phone:
            </p>
            <input
              type="text"
              value={testURL}
              readOnly
              className="w-full max-w-lg px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm font-mono"
              onClick={(e) => e.currentTarget.select()}
            />
          </div>
        </div>

        <div className="mt-8 text-left bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-4">
          <h3 className="font-semibold text-cyan-400 mb-2">Test Agent Info:</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li><strong>Name:</strong> Sarah Johnson</li>
            <li><strong>Company:</strong> Infinite Realty Hub</li>
            <li><strong>Phone:</strong> (555) 123-4567</li>
            <li><strong>Email:</strong> sarah@infiniterealty.com</li>
          </ul>
        </div>
      </GlassCard>
    </div>
  )
}