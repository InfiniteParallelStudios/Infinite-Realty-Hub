'use client'

import { useAuth } from '@/contexts/auth-context'
import { usePathname } from 'next/navigation'
import { BottomNavigation } from './bottom-navigation'
import { HudBackground } from '@/components/ui/hud-background'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  
  // Auth pages that shouldn't show navigation
  const authPages = ['/auth/signin', '/auth/callback']
  const isAuthPage = authPages.some(page => pathname.startsWith(page))
  
  // Show navigation if user is authenticated and not on auth pages
  // Temporarily always show navigation for testing
  const showNavigation = !isAuthPage && !loading

  return (
    <div className="min-h-screen bg-jarvis-light dark:bg-jarvis-hud transition-colors duration-300 relative">
      {/* HUD Background Effects */}
      <HudBackground />
      
      {/* Content Area */}
      <main className={`relative z-10 ${showNavigation ? 'pb-24' : ''}`}>
        {children}
      </main>
      
      {/* Bottom Navigation - Only show when authenticated */}
      {showNavigation && <BottomNavigation />}
    </div>
  )
}