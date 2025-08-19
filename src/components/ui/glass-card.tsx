'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { forwardRef } from 'react'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glow' | 'interactive'
  blur?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', blur = 'md', children, ...props }, ref) => {
    const baseClasses = cn(
      // HUD Glass morphism base
      'relative backdrop-blur-md border',
      'dark:bg-hud-panel dark:border-glass-border',
      'bg-white/20 border-black/10',
      
      // Blur variants
      blur === 'sm' && 'backdrop-blur-sm',
      blur === 'md' && 'backdrop-blur-md', 
      blur === 'lg' && 'backdrop-blur-lg',
      
      // Variant styles
      variant === 'glow' && 'shadow-hud-glow dark:shadow-hud-pulse',
      variant === 'interactive' && 'hover:bg-white/30 dark:hover:bg-hud-panel dark:hover:shadow-hud-glow transition-all duration-300 cursor-pointer',
      
      // Base styling
      'rounded-xl p-6',
      
      className
    )

    if (variant === 'interactive') {
      return (
        <motion.div
          ref={ref}
          className={baseClasses}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          {...props}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div ref={ref} className={baseClasses} {...props}>
        {children}
      </div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

export { GlassCard }