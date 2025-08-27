'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface SettingsLayoutProps {
  title: string
  description: string
  icon: ReactNode
  children: ReactNode
}

export function SettingsLayout({ title, description, icon, children }: SettingsLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/settings">
            <motion.button
              className="p-2 rounded-lg bg-white/20 dark:bg-gray-800/50 hover:bg-white/30 dark:hover:bg-gray-700/50 border border-cyan-400/30 text-gray-900 dark:text-cyan-400 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </Link>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-cyan-500/20 rounded-lg border border-cyan-400/30">
              {icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </ProtectedRoute>
  )
}