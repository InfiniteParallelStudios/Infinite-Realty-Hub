'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
// Temporarily removing ProtectedRoute for testing setup
// import { ProtectedRoute } from '@/components/auth/protected-route'
import { motion } from 'framer-motion'
import { 
  Play, 
  Bug, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Zap,
  Monitor,
  Settings,
  Download,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'

interface TestResult {
  id: string
  name: string
  status: 'running' | 'passed' | 'failed' | 'pending'
  duration?: number
  error?: string
  timestamp: string
}

interface TestSuite {
  id: string
  name: string
  description: string
  tests: TestResult[]
  status: 'idle' | 'running' | 'completed'
}

export default function TestingPage() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      id: 'auth-flow',
      name: 'Authentication Flow',
      description: 'Test Google OAuth login, profile creation, and session management',
      status: 'idle',
      tests: [
        { id: 'login', name: 'Google OAuth Login', status: 'pending', timestamp: '' },
        { id: 'profile-creation', name: 'Profile Creation', status: 'pending', timestamp: '' },
        { id: 'dashboard-access', name: 'Dashboard Access', status: 'pending', timestamp: '' },
        { id: 'logout', name: 'Logout Process', status: 'pending', timestamp: '' }
      ]
    },
    {
      id: 'crm-functionality',
      name: 'CRM Functionality',
      description: 'Test contact management, creation, editing, and search',
      status: 'idle',
      tests: [
        { id: 'contact-list', name: 'Contact List Loading', status: 'pending', timestamp: '' },
        { id: 'add-contact', name: 'Add New Contact', status: 'pending', timestamp: '' },
        { id: 'edit-contact', name: 'Edit Contact', status: 'pending', timestamp: '' },
        { id: 'search-contacts', name: 'Search Contacts', status: 'pending', timestamp: '' },
        { id: 'contact-details', name: 'Contact Details View', status: 'pending', timestamp: '' }
      ]
    },
    {
      id: 'settings-navigation',
      name: 'Settings Navigation',
      description: 'Test all settings pages and functionality',
      status: 'idle',
      tests: [
        { id: 'settings-main', name: 'Main Settings Page', status: 'pending', timestamp: '' },
        { id: 'account-settings', name: 'Account Settings', status: 'pending', timestamp: '' },
        { id: 'appearance-settings', name: 'Appearance Settings', status: 'pending', timestamp: '' },
        { id: 'notifications-settings', name: 'Notifications Settings', status: 'pending', timestamp: '' },
        { id: 'security-settings', name: 'Security Settings', status: 'pending', timestamp: '' }
      ]
    },
    {
      id: 'ui-responsiveness',
      name: 'UI Responsiveness',
      description: 'Test responsive design and theme switching',
      status: 'idle',
      tests: [
        { id: 'mobile-layout', name: 'Mobile Layout', status: 'pending', timestamp: '' },
        { id: 'tablet-layout', name: 'Tablet Layout', status: 'pending', timestamp: '' },
        { id: 'desktop-layout', name: 'Desktop Layout', status: 'pending', timestamp: '' },
        { id: 'theme-toggle', name: 'Dark/Light Theme Toggle', status: 'pending', timestamp: '' },
        { id: 'navigation', name: 'Bottom Navigation', status: 'pending', timestamp: '' }
      ]
    }
  ])

  const [isRunningAll, setIsRunningAll] = useState(false)
  const [browserVisible, setBrowserVisible] = useState(false)

  // Get overall test statistics
  const totalTests = testSuites.reduce((sum, suite) => sum + suite.tests.length, 0)
  const passedTests = testSuites.reduce((sum, suite) => 
    sum + suite.tests.filter(test => test.status === 'passed').length, 0)
  const failedTests = testSuites.reduce((sum, suite) => 
    sum + suite.tests.filter(test => test.status === 'failed').length, 0)
  const runningTests = testSuites.reduce((sum, suite) => 
    sum + suite.tests.filter(test => test.status === 'running').length, 0)

  const runTestSuite = async (suiteId: string) => {
    console.log(`🤖 Starting automated testing for suite: ${suiteId}`)
    
    // Update suite status to running
    setTestSuites(prev => prev.map(suite => 
      suite.id === suiteId 
        ? { ...suite, status: 'running' }
        : suite
    ))

    // This would integrate with the Playwright MCP server
    // For now, we'll simulate the testing process
    const suite = testSuites.find(s => s.id === suiteId)
    if (!suite) return

    for (const test of suite.tests) {
      // Update test to running
      setTestSuites(prev => prev.map(suite => 
        suite.id === suiteId 
          ? {
              ...suite,
              tests: suite.tests.map(t => 
                t.id === test.id 
                  ? { ...t, status: 'running', timestamp: new Date().toISOString() }
                  : t
              )
            }
          : suite
      ))

      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simulate test result (random for demo)
      const success = Math.random() > 0.2 // 80% success rate for demo
      
      setTestSuites(prev => prev.map(suite => 
        suite.id === suiteId 
          ? {
              ...suite,
              tests: suite.tests.map(t => 
                t.id === test.id 
                  ? { 
                      ...t, 
                      status: success ? 'passed' : 'failed',
                      duration: Math.floor(Math.random() * 3000) + 500,
                      error: success ? undefined : 'Element not found or interaction failed'
                    }
                  : t
              )
            }
          : suite
      ))
    }

    // Update suite status to completed
    setTestSuites(prev => prev.map(suite => 
      suite.id === suiteId 
        ? { ...suite, status: 'completed' }
        : suite
    ))
  }

  const runAllTests = async () => {
    setIsRunningAll(true)
    
    for (const suite of testSuites) {
      await runTestSuite(suite.id)
    }
    
    setIsRunningAll(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-500 bg-green-500/20'
      case 'failed': return 'text-red-500 bg-red-500/20'
      case 'running': return 'text-blue-500 bg-blue-500/20'
      default: return 'text-gray-500 bg-gray-500/20'
    }
  }

  return (
    // <ProtectedRoute>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Automated Testing
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Browser automation and bug detection for Infinite Realty Hub
            </p>
          </div>
          
          <div className="flex gap-2">
            <motion.button
              onClick={() => setBrowserVisible(!browserVisible)}
              className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Eye className="w-4 h-4" />
              {browserVisible ? 'Hide' : 'Show'} Browser
            </motion.button>
            
            <motion.button
              onClick={runAllTests}
              disabled={isRunningAll}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-300 text-white rounded-lg transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isRunningAll ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run All Tests
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Test Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Zap, label: 'Total Tests', value: totalTests, color: 'text-cyan-400' },
            { icon: CheckCircle, label: 'Passed', value: passedTests, color: 'text-green-400' },
            { icon: XCircle, label: 'Failed', value: failedTests, color: 'text-red-400' },
            { icon: RefreshCw, label: 'Running', value: runningTests, color: 'text-blue-400' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard variant="glow" className="text-center">
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Test Suites */}
        <div className="space-y-6">
          {testSuites.map((suite, index) => (
            <motion.div
              key={suite.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Bug className="w-5 h-5 text-cyan-400" />
                      {suite.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {suite.description}
                    </p>
                  </div>
                  
                  <motion.button
                    onClick={() => runTestSuite(suite.id)}
                    disabled={suite.status === 'running'}
                    className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {suite.status === 'running' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Running
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Run Suite
                      </>
                    )}
                  </motion.button>
                </div>
                
                <div className="space-y-2">
                  {suite.tests.map((test, testIndex) => (
                    <motion.div
                      key={test.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: testIndex * 0.05 }}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {test.name}
                          </h4>
                          {test.error && (
                            <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                              <AlertTriangle className="w-3 h-3" />
                              {test.error}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {test.duration && (
                          <span className="text-sm text-gray-500">
                            {test.duration}ms
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(test.status)}`}>
                          {test.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Browser Controls */}
        {browserVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <GlassCard>
              <div className="flex items-center gap-2 mb-4">
                <Monitor className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Browser Control
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors">
                    Launch Browser
                  </button>
                  <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors">
                    Navigate to App
                  </button>
                  <button className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-colors">
                    Take Screenshot
                  </button>
                  <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors">
                    Close Browser
                  </button>
                </div>
                
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <p className="text-center text-gray-500">
                    Browser automation window will appear here when testing is active
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    // </ProtectedRoute>
  )
}