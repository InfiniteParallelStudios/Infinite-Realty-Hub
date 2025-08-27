'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Star, Calculator } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { PRICING_MODULES, PRICING_BUNDLES, calculateTotalPrice, validateModuleRequirements } from '@/lib/pricing-config'

interface ModularPricingProps {
  onSubscribe?: (moduleIds: string[]) => void
  currentModules?: string[]
}

export function ModularPricing({ onSubscribe, currentModules = [] }: ModularPricingProps) {
  const [selectedModules, setSelectedModules] = useState<string[]>(currentModules.length > 0 ? currentModules : ['contacts'])
  const [showBundles, setShowBundles] = useState(true)

  const handleModuleToggle = (moduleId: string) => {
    if (moduleId === 'contacts') return // Contacts always included

    const newSelection = selectedModules.includes(moduleId)
      ? selectedModules.filter(id => id !== moduleId)
      : [...selectedModules, moduleId]

    // Auto-add required modules
    const finalSelection = [...newSelection]
    for (const id of newSelection) {
      const module = PRICING_MODULES.find(m => m.id === id)
      if (module?.requires) {
        for (const requirement of module.requires) {
          if (!finalSelection.includes(requirement)) {
            finalSelection.push(requirement)
          }
        }
      }
    }

    setSelectedModules(finalSelection)
  }

  const handleBundleSelect = (bundleModules: string[]) => {
    setSelectedModules(bundleModules)
    setShowBundles(false)
  }

  const totalPrice = calculateTotalPrice(selectedModules)
  const isValidSelection = validateModuleRequirements(selectedModules)

  return (
    <div className="space-y-8">
      {/* Toggle View */}
      <div className="flex justify-center">
        <div className="bg-white/10 dark:bg-gray-800/30 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowBundles(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              showBundles
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-cyan-400'
            }`}
          >
            Popular Bundles
          </button>
          <button
            onClick={() => setShowBundles(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              !showBundles
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-cyan-400'
            }`}
          >
            Build Your Own
          </button>
        </div>
      </div>

      {showBundles ? (
        /* Bundle View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRICING_BUNDLES.map((bundle) => (
            <motion.div
              key={bundle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <GlassCard className={`p-6 text-center relative ${
                bundle.popular ? 'ring-2 ring-cyan-400' : ''
              }`}>
                {bundle.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {bundle.name}
                </h3>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold text-cyan-500">
                    ${bundle.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">/month</span>
                  {bundle.savings > 0 && (
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Save ${bundle.savings}/month
                    </div>
                  )}
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                  {bundle.description}
                </p>

                <div className="space-y-2 mb-6">
                  {bundle.modules.map(moduleId => {
                    const module = PRICING_MODULES.find(m => m.id === moduleId)
                    return module ? (
                      <div key={moduleId} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">{module.name}</span>
                        <Check className="w-4 h-4 text-green-500" />
                      </div>
                    ) : null
                  })}
                </div>

                <motion.button
                  onClick={() => handleBundleSelect(bundle.modules)}
                  className="w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Choose Bundle
                </motion.button>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Modular View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRICING_MODULES.map((module) => {
              const isSelected = selectedModules.includes(module.id)
              const isRequired = module.id === 'contacts'
              const isDisabled = module.requires?.some(req => !selectedModules.includes(req))

              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <GlassCard 
                    className={`p-6 cursor-pointer transition-all ${
                      isSelected 
                        ? 'ring-2 ring-cyan-400 bg-cyan-50/50 dark:bg-cyan-900/20' 
                        : isDisabled 
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:ring-1 hover:ring-cyan-300'
                    }`}
                    onClick={() => !isDisabled && handleModuleToggle(module.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          {module.name}
                          {module.popular && (
                            <span className="ml-2 text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full">
                              Popular
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {module.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-cyan-500">
                          ${module.price}
                          {module.price > 0 && (
                            <span className="text-sm text-gray-500">/mo</span>
                          )}
                        </div>
                        {isRequired ? (
                          <div className="text-xs text-green-600 font-medium">Required</div>
                        ) : (
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected 
                              ? 'border-cyan-500 bg-cyan-500' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        )}
                      </div>
                    </div>

                    {module.requires && (
                      <div className="mb-4">
                        <div className="text-xs text-gray-500 mb-1">Requires:</div>
                        <div className="flex gap-1 flex-wrap">
                          {module.requires.map(reqId => {
                            const reqModule = PRICING_MODULES.find(m => m.id === reqId)
                            return reqModule ? (
                              <span key={reqId} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                {reqModule.name}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}

                    <ul className="space-y-1">
                      {module.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </motion.div>
              )
            })}
          </div>

          {/* Price Calculator */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calculator className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Your Custom Plan
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedModules.length} modules selected
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-cyan-500">
                  ${totalPrice.toFixed(2)}
                  <span className="text-lg text-gray-500">/month</span>
                </div>
                {totalPrice > 0 && (
                  <div className="text-sm text-gray-500">
                    vs ${PRICING_BUNDLES[3].price} for everything
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <motion.button
                onClick={() => onSubscribe?.(selectedModules)}
                disabled={!isValidSelection || totalPrice === 0}
                className="flex-1 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                whileHover={{ scale: totalPrice > 0 ? 1.02 : 1 }}
                whileTap={{ scale: totalPrice > 0 ? 0.98 : 1 }}
              >
                {totalPrice === 0 ? 'Start Free' : `Subscribe for $${totalPrice.toFixed(2)}/month`}
              </motion.button>
              
              <button
                onClick={() => setSelectedModules(['contacts'])}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Reset
              </button>
            </div>
          </GlassCard>
        )}
      )}
    </div>
  )
}