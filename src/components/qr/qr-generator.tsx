'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { QrCode, Download, Share2, Copy, User, Mail, Phone, Globe, MapPin } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useAuth } from '@/contexts/auth-context'

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
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: user?.user_metadata?.full_name || '',
    title: 'Real Estate Agent',
    company: 'Infinite Realty Hub',
    phone: '',
    email: user?.email || '',
    website: '',
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

  // Generate capture form URL
  const generateCaptureFormURL = () => {
    const params = new URLSearchParams({
      agent_name: contactInfo.name,
      agent_email: contactInfo.email,
      agent_phone: contactInfo.phone,
      agent_company: contactInfo.company
    })
    
    return `${window.location.origin}/capture?${params.toString()}`
  }

  // Simple QR code generator (basic implementation)
  const generateQRCode = (data: string, size: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = size
    canvas.height = size

    // Clear canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)

    // This is a placeholder - in a real implementation you'd use a QR code library
    // For now, we'll create a simple pattern that represents a QR code
    const moduleSize = size / 25
    const modules = generateQRPattern(data)

    ctx.fillStyle = '#000000'
    
    modules.forEach((row, y) => {
      row.forEach((module, x) => {
        if (module) {
          const xPos = x * moduleSize
          const yPos = y * moduleSize
          
          switch (qrStyle) {
            case 'rounded':
              ctx.beginPath()
              ctx.roundRect(xPos, yPos, moduleSize - 1, moduleSize - 1, 2)
              ctx.fill()
              break
            case 'dots':
              ctx.beginPath()
              ctx.arc(xPos + moduleSize/2, yPos + moduleSize/2, moduleSize/3, 0, 2 * Math.PI)
              ctx.fill()
              break
            default:
              ctx.fillRect(xPos, yPos, moduleSize - 1, moduleSize - 1)
          }
        }
      })
    })

    // Add logo in center (simplified)
    const logoSize = size * 0.15
    const logoX = (size - logoSize) / 2
    const logoY = (size - logoSize) / 2
    
    ctx.fillStyle = '#00d4ff'
    ctx.beginPath()
    ctx.roundRect(logoX, logoY, logoSize, logoSize, 8)
    ctx.fill()
    
    // Add infinity symbol (simplified)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.ellipse(logoX + logoSize * 0.3, logoY + logoSize * 0.5, logoSize * 0.15, logoSize * 0.25, 0, 0, Math.PI * 2)
    ctx.ellipse(logoX + logoSize * 0.7, logoY + logoSize * 0.5, logoSize * 0.15, logoSize * 0.25, 0, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Generate a simple QR-like pattern (placeholder)
  const generateQRPattern = (data: string): boolean[][] => {
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
    
    // Add some data pattern based on input
    const hash = data.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    for (let i = 8; i < 17; i++) {
      for (let j = 8; j < 17; j++) {
        pattern[i][j] = (hash + i + j) % 3 === 0
      }
    }
    
    return pattern
  }

  const handleInputChange = (field: keyof ContactInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactInfo(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleGenerateQR = () => {
    const data = generateCaptureFormURL()
    generateQRCode(data, qrSize)
    setShowPreview(true)
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
        <div className="flex items-center gap-3 mb-6">
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

            <div className="flex items-end">
              <motion.button
                onClick={handleGenerateQR}
                className="w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Generate QR Code
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
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto"
                style={{ imageRendering: 'pixelated' }}
              />
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