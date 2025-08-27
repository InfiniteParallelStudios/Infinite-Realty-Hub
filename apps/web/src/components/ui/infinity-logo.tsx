'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface InfinityLogoProps {
  size?: number
  className?: string
  showBackground?: boolean
}

export function InfinityLogo({ size = 200, className = '', showBackground = true }: InfinityLogoProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Calculate responsive sizes
  const orbSize = size * 0.08
  const strokeWidth = size * 0.02
  
  // Infinity path - mathematical infinity symbol (lemniscate)
  const infinityPath = `M ${size * 0.2} ${size * 0.5} 
    C ${size * 0.2} ${size * 0.3}, ${size * 0.3} ${size * 0.2}, ${size * 0.5} ${size * 0.5}
    C ${size * 0.7} ${size * 0.8}, ${size * 0.8} ${size * 0.7}, ${size * 0.8} ${size * 0.5}
    C ${size * 0.8} ${size * 0.3}, ${size * 0.7} ${size * 0.2}, ${size * 0.5} ${size * 0.5}
    C ${size * 0.3} ${size * 0.8}, ${size * 0.2} ${size * 0.7}, ${size * 0.2} ${size * 0.5}`

  // Animation variants for orbs
  const orbVariants = {
    animate: {
      // Infinity motion path
      offsetDistance: ['0%', '100%'],
      transition: {
        duration: 8,
        ease: 'linear',
        repeat: Infinity,
      }
    }
  }

  const backgroundOrbVariants = {
    animate: {
      offsetDistance: ['0%', '100%'],
      opacity: [0.3, 0.8, 0.3],
      scale: [0.5, 1, 0.5],
      transition: {
        duration: 12,
        ease: 'easeInOut',
        repeat: Infinity,
      }
    }
  }

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
      >
        {/* Define the infinity path for motion */}
        <defs>
          <path
            id="infinity-path"
            d={infinityPath}
            fill="none"
          />
          
          {/* Glowing gradient */}
          <radialGradient id="orbGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgb(34, 211, 238)" stopOpacity="1" />
            <stop offset="70%" stopColor="rgb(34, 211, 238)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="rgb(34, 211, 238)" stopOpacity="0.2" />
          </radialGradient>

          <radialGradient id="backgroundOrbGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgb(34, 211, 238)" stopOpacity="0.6" />
            <stop offset="70%" stopColor="rgb(34, 211, 238)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(34, 211, 238)" stopOpacity="0.1" />
          </radialGradient>

          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Main infinity outline */}
        {showBackground && (
          <path
            d={infinityPath}
            fill="none"
            stroke="rgb(34, 211, 238)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity="0.3"
            filter="url(#glow)"
          />
        )}

        {/* Primary animated orbs */}
        {[0, 2, 4, 6].map((delay, index) => (
          <motion.circle
            key={`primary-orb-${index}`}
            r={orbSize}
            fill="url(#orbGradient)"
            filter="url(#glow)"
            variants={orbVariants}
            animate="animate"
            style={{
              offsetPath: 'path("' + infinityPath + '")',
            }}
            transition={{
              delay: delay,
              duration: 8,
              ease: 'linear',
              repeat: Infinity,
            }}
          />
        ))}

        {/* Background fading orbs */}
        {[1, 3, 5, 7, 9].map((delay, index) => (
          <motion.circle
            key={`background-orb-${index}`}
            r={orbSize * 0.7}
            fill="url(#backgroundOrbGradient)"
            variants={backgroundOrbVariants}
            animate="animate"
            style={{
              offsetPath: 'path("' + infinityPath + '")',
            }}
            transition={{
              delay: delay * 1.5,
              duration: 12,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
          />
        ))}
      </svg>

      {/* Central glow effect */}
      {showBackground && (
        <motion.div
          className="absolute inset-0 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgb(34, 211, 238) 0%, transparent 70%)',
          }}
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 4,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
      )}
    </div>
  )
}

// Compact version for navigation/header use
export function InfinityLogoCompact({ size = 40, className = '' }: InfinityLogoProps) {
  return (
    <InfinityLogo 
      size={size} 
      className={className} 
      showBackground={false}
    />
  )
}