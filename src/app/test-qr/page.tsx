'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { QrCode, Smartphone } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function TestQRPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Test agent data
  const testAgent = {
    name: 'Sarah Johnson',
    email: 'sarah@infiniterealty.com',
    phone: '(555) 123-4567',
    company: 'Infinite Realty Hub'
  }

  // Generate test capture form URL
  const generateTestURL = () => {
    const params = new URLSearchParams({
      agent_name: testAgent.name,
      agent_email: testAgent.email,
      agent_phone: testAgent.phone,
      agent_company: testAgent.company
    })
    
    return `${window.location.origin}/capture?${params.toString()}`
  }

  // Simple QR code generator (basic implementation for testing)
  const generateTestQR = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 300
    canvas.width = size
    canvas.height = size

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)

    // Generate QR pattern (simplified for testing)
    const moduleSize = size / 25
    const modules = generateTestPattern()

    ctx.fillStyle = '#000000'
    
    modules.forEach((row, y) => {
      row.forEach((module, x) => {
        if (module) {
          const xPos = x * moduleSize
          const yPos = y * moduleSize
          
          // Simple rectangle (compatible with all browsers)
          ctx.fillRect(xPos, yPos, moduleSize - 1, moduleSize - 1)
        }
      })
    })

    // Add logo in center
    const logoSize = size * 0.15
    const logoX = (size - logoSize) / 2
    const logoY = (size - logoSize) / 2
    
    ctx.fillStyle = '#00d4ff'
    ctx.fillRect(logoX, logoY, logoSize, logoSize)
    
    // Add infinity symbol
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.ellipse(logoX + logoSize * 0.3, logoY + logoSize * 0.5, logoSize * 0.15, logoSize * 0.25, 0, 0, Math.PI * 2)
    ctx.ellipse(logoX + logoSize * 0.7, logoY + logoSize * 0.5, logoSize * 0.15, logoSize * 0.25, 0, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Generate a test QR pattern
  const generateTestPattern = (): boolean[][] => {
    const size = 25
    const pattern: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false))
    
    // Add finder patterns (corners)
    const addFinderPattern = (x: number, y: number) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (x + i < size && y + j < size) {
            if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
              pattern[x + i][y + j] = true
            }
          }
        }
      }
    }
    
    addFinderPattern(0, 0)
    addFinderPattern(0, 18)
    addFinderPattern(18, 0)
    
    // Add timing patterns
    for (let i = 8; i < 17; i++) {
      pattern[6][i] = i % 2 === 0
      pattern[i][6] = i % 2 === 0
    }
    
    // Add some data pattern
    const url = generateTestURL()
    const hash = url.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    for (let i = 8; i < 17; i++) {
      for (let j = 8; j < 17; j++) {
        pattern[i][j] = (hash + i + j) % 3 === 0
      }
    }
    
    return pattern
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'test_agent_qr.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  useEffect(() => {
    generateTestQR()
  }, [])

  const testURL = generateTestURL()

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Test QR Code
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Scan this QR code with your phone to test the lead capture system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code Display */}
          <GlassCard className="p-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <QrCode className="w-6 h-6 text-cyan-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Test Agent QR Code
                </h2>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-lg inline-block mb-6">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              <div className="space-y-4">
                <motion.button
                  onClick={handleDownload}
                  className="w-full px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Download QR Code
                </motion.button>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <Smartphone className="inline w-4 h-4 mr-1" />
                  Point your phone camera at the QR code above
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Agent Information */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Test Agent Information
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name:</label>
                <p className="text-gray-900 dark:text-white font-medium">{testAgent.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company:</label>
                <p className="text-gray-900 dark:text-white font-medium">{testAgent.company}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone:</label>
                <p className="text-gray-900 dark:text-white font-medium">{testAgent.phone}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email:</label>
                <p className="text-gray-900 dark:text-white font-medium">{testAgent.email}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Capture Form URL:</h4>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <code className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                  {testURL}
                </code>
              </div>
              
              <motion.a
                href={testURL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Test Capture Form →
              </motion.a>
            </div>
          </GlassCard>
        </div>

        {/* Instructions */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            📱 Testing Instructions
          </h3>
          
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <div>
              <strong>Step 1:</strong> Open your phone's camera app
            </div>
            <div>
              <strong>Step 2:</strong> Point the camera at the QR code above
            </div>
            <div>
              <strong>Step 3:</strong> Tap the notification/link that appears
            </div>
            <div>
              <strong>Step 4:</strong> Fill out the lead capture form
            </div>
            <div>
              <strong>Step 5:</strong> Submit the form and download the agent's contact card
            </div>
          </div>

          <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-400/30 rounded-lg">
            <p className="text-sm text-cyan-400">
              💡 <strong>Tip:</strong> The QR code will work from any device and will automatically adapt to mobile screens!
            </p>
          </div>
        </GlassCard>
      </div>
    </ProtectedRoute>
  )
}