'use client'

import { QrCode, Smartphone, Wifi } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'

export default function PhoneAccessPage() {
  const phoneURL = 'http://192.168.1.218:3000'
  const testCaptureURL = 'http://192.168.1.218:3000/capture?agent_name=Sarah%20Johnson&agent_email=sarah@infiniterealty.com&agent_phone=(555)%20123-4567&agent_company=Infinite%20Realty%20Hub'

  return (
    <div className="min-h-screen p-6 space-y-6">
      <GlassCard className="p-8 text-center">
        <Smartphone className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Access on Your Phone
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Use these methods to access the app on your mobile device
        </p>

        {/* Method 1: Direct URL */}
        <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-6 mb-6">
          <Wifi className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Method 1: Direct URL
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Open your phone's browser and type this URL:
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mb-4">
            <code className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
              {phoneURL}
            </code>
          </div>
          <button
            onClick={() => navigator.clipboard?.writeText(phoneURL)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg text-sm transition-colors"
          >
            Copy URL
          </button>
        </div>

        {/* Method 2: QR Code */}
        <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-6 mb-6">
          <QrCode className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Method 2: QR Code Scanner
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Use your phone's camera or QR scanner app
          </p>
          
          {/* Simple QR representation */}
          <div className="bg-white p-6 rounded-lg shadow-lg inline-block mb-4">
            <div className="w-48 h-48 bg-black relative">
              {/* Simple QR pattern for the phone URL */}
              <div className="absolute inset-3 bg-white"></div>
              <div className="absolute top-3 left-3 w-8 h-8 bg-black"></div>
              <div className="absolute top-3 right-3 w-8 h-8 bg-black"></div>
              <div className="absolute bottom-3 left-3 w-8 h-8 bg-black"></div>
              
              {/* Center */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-cyan-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">📱</span>
              </div>
              
              {/* Data dots */}
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="absolute w-2 h-2 bg-black" style={{
                  top: `${15 + (i * 4)}%`,
                  left: `${25 + (i % 4) * 6}%`
                }} />
              ))}
            </div>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This QR code represents: {phoneURL}
          </p>
        </div>

        {/* Quick Test Links */}
        <div className="text-left space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🧪 Quick Test Pages:
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <strong>Homepage:</strong><br />
              <code className="text-xs">{phoneURL}</code>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <strong>Simple QR Test:</strong><br />
              <code className="text-xs">{phoneURL}/simple-qr</code>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <strong>Lead Capture Test:</strong><br />
              <code className="text-xs break-all">{testCaptureURL}</code>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-left">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🔧 Troubleshooting:
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li>• Make sure your phone and computer are on the same WiFi network</li>
            <li>• Try using 'http://' not 'https://'</li>
            <li>• If it doesn't work, try your computer's other IP address</li>
            <li>• Some corporate networks block local connections</li>
            <li>• You can also use browser dev tools to simulate mobile</li>
          </ul>
        </div>
      </GlassCard>
    </div>
  )
}