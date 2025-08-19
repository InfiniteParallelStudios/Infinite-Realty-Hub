'use client'

import { motion } from 'framer-motion'
import { InfinityLogo } from './infinity-logo'

export function HudBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Large infinity logo in center background - reduced size on mobile */}
      <div className="absolute inset-0 flex items-center justify-center">
        <InfinityLogo 
          size={600} 
          className="opacity-10 scale-100 sm:scale-150" 
          showBackground={true}
        />
      </div>

      {/* Smaller infinity logos scattered - hidden on mobile for performance */}
      <motion.div
        className="absolute top-1/4 left-1/6 opacity-5 hidden sm:block"
        animate={{
          rotate: 360,
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <InfinityLogo size={120} showBackground={false} />
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 right-1/6 opacity-5 hidden sm:block"
        animate={{
          rotate: -360,
          scale: [1.2, 0.8, 1.2],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <InfinityLogo size={80} showBackground={false} />
      </motion.div>

      {/* Main HUD Grid */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hudGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgb(34 211 238 / 0.3)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hudGrid)" />
        </svg>
      </div>

      {/* Rotating Geometric Elements - reduced size on mobile */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-32 h-32 sm:w-64 sm:h-64 opacity-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <polygon
            points="100,10 190,50 190,150 100,190 10,150 10,50"
            fill="none"
            stroke="rgb(34 211 238 / 0.6)"
            strokeWidth="2"
          />
          <circle cx="100" cy="100" r="50" fill="none" stroke="rgb(6 182 212 / 0.4)" strokeWidth="1" />
          <circle cx="100" cy="100" r="30" fill="none" stroke="rgb(34 211 238 / 0.6)" strokeWidth="1" />
        </svg>
      </motion.div>

      {/* Counter-rotating inner element - hidden on small screens */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-16 h-16 sm:w-32 sm:h-32 opacity-15 translate-x-8 translate-y-8 sm:translate-x-16 sm:translate-y-16 hidden sm:block"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon
            points="50,5 95,25 95,75 50,95 5,75 5,25"
            fill="none"
            stroke="rgb(6 182 212 / 0.8)"
            strokeWidth="1"
          />
        </svg>
      </motion.div>

      {/* Pulsating Circles - reduced size on mobile */}
      <motion.div
        className="absolute bottom-1/3 left-1/4 w-24 h-24 sm:w-48 sm:h-48 opacity-10"
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-full h-full rounded-full border border-cyan-400 shadow-lg shadow-cyan-400/20" />
      </motion.div>

      <motion.div
        className="absolute bottom-1/3 left-1/4 w-16 h-16 sm:w-32 sm:h-32 opacity-15 translate-x-4 translate-y-4 sm:translate-x-8 sm:translate-y-8 hidden sm:block"
        animate={{ scale: [1.2, 0.8, 1.2], opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-full h-full rounded-full border border-cyan-300 shadow-lg shadow-cyan-300/30" />
      </motion.div>

      {/* Data Flow Lines */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-0.5 w-full bg-data-flow opacity-30"
            style={{
              top: `${20 + i * 15}%`,
              transform: 'skewY(-12deg)',
            }}
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.8,
            }}
          />
        ))}
      </div>

      {/* Corner Decorative Elements */}
      <div className="absolute top-8 left-8 opacity-20">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <path d="M0,0 L20,0 L20,2 L2,2 L2,20 L0,20 Z" fill="rgb(34 211 238 / 0.6)" />
          <path d="M0,60 L0,80 L20,80 L20,78 L2,78 L2,60 Z" fill="rgb(34 211 238 / 0.6)" />
        </svg>
      </div>

      <div className="absolute top-8 right-8 opacity-20">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <path d="M60,0 L80,0 L80,20 L78,20 L78,2 L60,2 Z" fill="rgb(34 211 238 / 0.6)" />
          <path d="M78,60 L78,78 L60,78 L60,80 L80,80 L80,60 Z" fill="rgb(34 211 238 / 0.6)" />
        </svg>
      </div>

      <div className="absolute bottom-8 left-8 opacity-20">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <path d="M0,60 L0,80 L20,80 L20,78 L2,78 L2,60 Z" fill="rgb(34 211 238 / 0.6)" />
          <path d="M0,0 L20,0 L20,2 L2,2 L2,20 L0,20 Z" fill="rgb(34 211 238 / 0.6)" />
        </svg>
      </div>

      <div className="absolute bottom-8 right-8 opacity-20">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <path d="M78,60 L78,78 L60,78 L60,80 L80,80 L80,60 Z" fill="rgb(34 211 238 / 0.6)" />
          <path d="M60,0 L80,0 L80,20 L78,20 L78,2 L60,2 Z" fill="rgb(34 211 238 / 0.6)" />
        </svg>
      </div>

      {/* Scanning Lines */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-20 transform rotate-12" />
      </motion.div>
    </div>
  )
}