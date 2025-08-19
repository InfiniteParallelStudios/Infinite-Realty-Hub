'use client'

import { motion } from 'framer-motion'
import { LayoutDashboard, Store, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    id: 'dashboard'
  },
  {
    href: '/store',
    icon: Store,
    label: 'Store',
    id: 'store'
  },
  {
    href: '/settings',
    icon: Settings,
    label: 'Settings',
    id: 'settings'
  }
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* HUD Glass Background */}
      <div className="absolute inset-0 backdrop-blur-xl bg-white/10 dark:bg-hud-panel border-t border-white/20 dark:border-glass-border shadow-hud-panel" />
      
      {/* Navigation Content */}
      <div className="relative flex items-center justify-around px-6 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className="relative flex flex-col items-center space-y-1 px-4 py-2 rounded-xl transition-colors"
            >
              {/* Active Background */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-cyan-500/20 dark:bg-cyan-500/20 rounded-xl border border-cyan-400/30"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              {/* Icon */}
              <div className="relative">
                <Icon
                  className={cn(
                    "w-6 h-6 transition-colors",
                    isActive 
                      ? "text-cyan-500 dark:text-cyan-400" 
                      : "text-gray-600 dark:text-gray-400"
                  )}
                />
                
                {/* HUD Glow Effect */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-cyan-400/30 dark:bg-cyan-400/30 rounded-full blur-lg"
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>
              
              {/* Label */}
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  isActive
                    ? "text-cyan-500 dark:text-cyan-400"
                    : "text-gray-600 dark:text-gray-400"
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}