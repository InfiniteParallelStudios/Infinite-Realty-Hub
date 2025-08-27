'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { QrCode, Download, Share2, Copy, User, Mail, Phone, Globe, MapPin } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useAuth } from '@/contexts/auth-context'
import { config, getQRBaseUrl } from '@/lib/config'
import QRCodeLib from 'qrcode'

interface ContactInfo {
  name: string
  title: string
  company: string
  phone: string
  email: string
  website: string
  address: string
}

interface QRGeneratorProps {
  onClose?: () => void
}

export function QRGenerator({ onClose }: QRGeneratorProps) {
  const { user } = useAuth()
  
  // Demo mode for development/testing (disabled in production)
  const demoUser = config.enableDemoMode ? {
    user_metadata: { full_name: 'Demo Agent' },
    email: 'demo@infiniterealtyhub.com'
  } : null
  
  const activeUser = user || demoUser
  
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: activeUser?.user_metadata?.full_name || 'Demo Agent',
    title: 'Real Estate Agent',
    company: 'Infinite Realty Hub',
    phone: '',
    email: activeUser?.email || 'demo@infiniteparallelstudios.com',
    website: config.isProduction ? 'https://irh.infiniteparallelstudios.com' : '',
    address: ''
  })
  const [qrSize, setQrSize] = useState(256)
  const [qrStyle, setQrStyle] = useState<'square' | 'rounded' | 'dots'>('rounded')
  const [showPreview, setShowPreview] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Generate vCard data
  const generateVCardData = () => {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${contactInfo.name}`,
      `TITLE:${contactInfo.title}`,
      `ORG:${contactInfo.company}`,
      `TEL:${contactInfo.phone}`,
      `EMAIL:${contactInfo.email}`,
      `URL:${contactInfo.website}`,
      `ADR:;;${contactInfo.address};;;;`,
      'END:VCARD'
    ].filter(line => !line.endsWith(':')) // Remove empty fields
     .join('\n')
    
    return vcard
  }

  // Generate capture form URL with production-ready configuration
  const generateCaptureFormURL = () => {
    const params = new URLSearchParams({
      agent_name: contactInfo.name,
      agent_email: contactInfo.email,
      agent_phone: contactInfo.phone,
      agent_company: contactInfo.company
    })
    
    const baseUrl = getQRBaseUrl()
    return `${baseUrl}/capture?${params.toString()}`
  }

  // Enhanced QR code generator with comprehensive debugging
  const generateQRCode = async (data: string, size: number) => {
    // Wait for canvas to be ready
    await new Promise(resolve => setTimeout(resolve, 200))
    
    let canvas = canvasRef.current
    if (!canvas) {
      // Try multiple times with longer delays
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 300))
        canvas = canvasRef.current
        if (canvas) break
      }
      
      if (!canvas) {
        // Silent fallback - don't show error in console
        console.log('QR generation skipped - canvas not ready')
        return
      }
    }

    console.log('🔍 Starting QR generation...')
    console.log('📋 Data:', data)
    console.log('📐 Size:', size)

    try {
      // Step 1: Prepare canvas
      canvas.width = size
      canvas.height = size
      console.log('📏 Canvas dimensions set:', canvas.width, 'x', canvas.height)
      
      // Step 2: Test basic canvas functionality
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Cannot get 2D context from canvas')
      }
      
      // Clear canvas
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)
      console.log('🧹 Canvas cleared')
      
      // Step 3: Generate QR code
      console.log('📱 Calling QRCode library...')
      await QRCodeLib.toCanvas(canvas, data, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      })
      
      console.log('✅ QRCode library finished')
      
      // Step 4: Verify canvas content
      setTimeout(() => {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        let blackPixels = 0
        let whitePixels = 0
        
        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i]
          const g = imageData.data[i + 1]
          const b = imageData.data[i + 2]
          
          if (r < 128 && g < 128 && b < 128) {
            blackPixels++
          } else if (r > 200 && g > 200 && b > 200) {
            whitePixels++
          }
        }
        
        console.log('🔍 Canvas analysis:')
        console.log('  - Black pixels:', blackPixels)
        console.log('  - White pixels:', whitePixels)
        console.log('  - Total pixels:', imageData.data.length / 4)
        
        if (blackPixels > 10) {
          console.log('✅ QR code successfully generated and visible!')
          
          // Add subtle logo overlay
          const logoSize = Math.floor(size * 0.1)
          const logoX = Math.floor((size - logoSize) / 2)
          const logoY = Math.floor((size - logoSize) / 2)
          
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4)
          
          ctx.fillStyle = '#00d4ff'
          ctx.fillRect(logoX, logoY, logoSize, logoSize)
          
          console.log('🎯 Logo overlay added')
        } else {
          console.error('❌ QR code generation failed - no visible content')
          
          // Draw fallback pattern
          ctx.fillStyle = '#ff0000'
          ctx.font = '14px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('QR GENERATION FAILED', size / 2, size / 2 - 10)
          ctx.fillText('Check browser console', size / 2, size / 2 + 10)
          
          // Draw red border
          ctx.strokeStyle = '#ff0000'
          ctx.lineWidth = 4
          ctx.strokeRect(2, 2, size - 4, size - 4)
        }
      }, 100) // Small delay to ensure library completion
      
    } catch (error) {
      console.error('❌ QR generation error:', error)
      
      // Draw comprehensive error display
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#ffe6e6'
        ctx.fillRect(0, 0, size, size)
        
        ctx.fillStyle = '#ff0000'
        ctx.font = 'bold 16px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('ERROR', size / 2, size / 2 - 20)
        
        ctx.font = '12px Arial'
        ctx.fillText('QR generation failed', size / 2, size / 2)
        ctx.fillText('Check console for details', size / 2, size / 2 + 20)
        
        ctx.strokeStyle = '#ff0000'
        ctx.lineWidth = 3
        ctx.strokeRect(1, 1, size - 2, size - 2)
      }
      
      alert(`QR Generation Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }


  const handleInputChange = (field: keyof ContactInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactInfo(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleGenerateQR = async () => {
    try {
      const data = generateCaptureFormURL()
      console.log('🔍 Starting QR generation process...')
      console.log('📋 Data to encode:', data)
      console.log('📏 Size:', qrSize)
      
      if (!data || data.trim() === '') {
        console.error('❌ No data to encode')
        alert('Error: No URL data to generate QR code')
        return
      }
      
      await generateQRCode(data, qrSize)
      setShowPreview(true)
      console.log('✅ QR generation process completed')
    } catch (error) {
      console.error('❌ Error in handleGenerateQR:', error)
      alert('Error generating QR code. Check console for details.')
    }
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `${contactInfo.name.replace(/\s+/g, '_')}_contact_qr.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const handleShare = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (navigator.share) {
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'contact_qr.png', { type: 'image/png' })
          try {
            await navigator.share({
              title: `Contact ${contactInfo.name}`,
              text: `Scan to connect with ${contactInfo.name}`,
              files: [file]
            })
          } catch (error) {
            console.log('Error sharing:', error)
          }
        }
      })
    }
  }

  const handleCopyURL = async () => {
    const url = generateCaptureFormURL()
    try {
      await navigator.clipboard.writeText(url)
      // Show success message
    } catch (error) {
      console.log('Error copying to clipboard:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Contact Information Form */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-400/30">
              <QrCode className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                QR Code Generator
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create QR codes for lead capture
              </p>
            </div>
          </div>
          <motion.button
            onClick={() => window.location.href = '/qr-leads'}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <User className="w-4 h-4" />
            View Leads
          </motion.button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="inline w-4 h-4 mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={contactInfo.name}
              onChange={handleInputChange('name')}
              className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Title
            </label>
            <input
              type="text"
              value={contactInfo.title}
              onChange={handleInputChange('title')}
              className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="Real Estate Agent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company
            </label>
            <input
              type="text"
              value={contactInfo.company}
              onChange={handleInputChange('company')}
              className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="Infinite Realty Hub"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="inline w-4 h-4 mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              value={contactInfo.phone}
              onChange={handleInputChange('phone')}
              className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="inline w-4 h-4 mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={contactInfo.email}
              onChange={handleInputChange('email')}
              className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Globe className="inline w-4 h-4 mr-2" />
              Website
            </label>
            <input
              type="url"
              value={contactInfo.website}
              onChange={handleInputChange('website')}
              className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="inline w-4 h-4 mr-2" />
              Business Address
            </label>
            <input
              type="text"
              value={contactInfo.address}
              onChange={handleInputChange('address')}
              className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="123 Main St, City, State 12345"
            />
          </div>
        </div>

        {/* QR Code Customization */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            QR Code Style
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Size
              </label>
              <select
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              >
                <option value={192}>Small (192px)</option>
                <option value={256}>Medium (256px)</option>
                <option value={384}>Large (384px)</option>
                <option value={512}>Extra Large (512px)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Style
              </label>
              <select
                value={qrStyle}
                onChange={(e) => setQrStyle(e.target.value as any)}
                className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              >
                <option value="square">Square</option>
                <option value="rounded">Rounded</option>
                <option value="dots">Dots</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <motion.button
                onClick={handleGenerateQR}
                className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Generate QR Code
              </motion.button>
              <motion.button
                onClick={async () => {
                  console.log('🧪 Testing simple QR')
                  await generateQRCode('Hello World!', qrSize)
                  setShowPreview(true)
                }}
                className="px-3 py-2 bg-green-500 hover:bg-green-400 text-white rounded-lg font-medium transition-colors text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Test simple QR"
              >
                Simple QR
              </motion.button>
              <motion.button
                onClick={() => {
                  console.log('🧪 Testing canvas drawing')
                  const canvas = canvasRef.current
                  if (canvas) {
                    const ctx = canvas.getContext('2d')
                    if (ctx) {
                      canvas.width = qrSize
                      canvas.height = qrSize
                      
                      // Draw test pattern
                      ctx.fillStyle = '#ffffff'
                      ctx.fillRect(0, 0, qrSize, qrSize)
                      
                      ctx.fillStyle = '#000000'
                      for (let i = 0; i < qrSize; i += 20) {
                        for (let j = 0; j < qrSize; j += 20) {
                          if ((i / 20 + j / 20) % 2 === 0) {
                            ctx.fillRect(i, j, 20, 20)
                          }
                        }
                      }
                      
                      ctx.fillStyle = '#ff0000'
                      ctx.fillRect(qrSize/2 - 20, qrSize/2 - 20, 40, 40)
                      console.log('✅ Test pattern drawn')
                    }
                  }
                  setShowPreview(true)
                }}
                className="px-3 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg font-medium transition-colors text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Test canvas drawing"
              >
                Test Canvas
              </motion.button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* QR Code Preview */}
      {showPreview && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            QR Code Preview
          </h3>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-300">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto block border border-red-500"
                style={{ 
                  imageRendering: 'pixelated',
                  minWidth: '256px',
                  minHeight: '256px',
                  backgroundColor: '#f0f0f0'
                }}
              />
              <p className="text-xs text-gray-500 mt-2">Canvas should appear above this text</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-4 h-4" />
                Download
              </motion.button>

              <motion.button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Share2 className="w-4 h-4" />
                Share
              </motion.button>

              <motion.button
                onClick={handleCopyURL}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Copy className="w-4 h-4" />
                Copy URL
              </motion.button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Capture Form URL:
              </p>
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded font-mono break-all">
                {generateCaptureFormURL()}
              </code>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  )
}