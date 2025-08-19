'use client'

import { useState } from 'react'
import { SettingsLayout } from '@/components/settings/settings-layout'
import { GlassCard } from '@/components/ui/glass-card'
import { motion } from 'framer-motion'
import { CreditCard, Star, Download, Calendar, Check, Users, BarChart3, Crown } from 'lucide-react'

export default function BillingSettingsPage() {
  const [currentPlan] = useState('professional')
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [paymentMethodsState, setPaymentMethodsState] = useState([])

  const handleSetAsDefault = (methodId: string) => {
    alert(`Setting payment method ${methodId} as default. This would update the payment method in a real application.`)
  }

  const handleEditPaymentMethod = (methodId: string) => {
    alert(`Opening edit dialog for payment method ${methodId}. This would show an edit form in a real application.`)
  }

  const handleRemovePaymentMethod = (methodId: string) => {
    if (confirm('Are you sure you want to remove this payment method?')) {
      alert(`Removing payment method ${methodId}. This would delete the payment method in a real application.`)
    }
  }

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Perfect for getting started',
      features: [
        'Up to 100 contacts',
        'Basic CRM features',
        'Email support',
        '1 user account'
      ],
      icon: Users,
      color: 'gray'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 29,
      description: 'For growing real estate professionals',
      features: [
        'Unlimited contacts',
        'Advanced CRM features',
        'Lead pipeline management',
        'Email & phone support',
        'Up to 5 users',
        'Custom reports',
        'Integrations'
      ],
      icon: BarChart3,
      color: 'cyan',
      popular: true
    },
    {
      id: 'team',
      name: 'Team',
      price: 99,
      description: 'For real estate teams and brokerages',
      features: [
        'Everything in Professional',
        'Unlimited users',
        'Team management',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'API access'
      ],
      icon: Users,
      color: 'purple'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      description: 'For large organizations',
      features: [
        'Everything in Team',
        'Dedicated support',
        'Custom integrations',
        'SLA guarantee',
        'Training sessions',
        'Data migration',
        'White-label options'
      ],
      icon: Crown,
      color: 'gold'
    }
  ]

  const paymentMethods = [
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiry: '12/25',
      default: true
    },
    {
      id: '2',
      type: 'card', 
      last4: '8888',
      brand: 'Mastercard',
      expiry: '06/26',
      default: false
    }
  ]

  const invoices = [
    {
      id: 'INV-001',
      date: '2025-01-01',
      amount: 29.00,
      status: 'paid',
      plan: 'Professional'
    },
    {
      id: 'INV-002',
      date: '2024-12-01',
      amount: 29.00,
      status: 'paid',
      plan: 'Professional'
    },
    {
      id: 'INV-003',
      date: '2024-11-01',
      amount: 29.00,
      status: 'paid',
      plan: 'Professional'
    }
  ]

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free'
    const monthlyPrice = billingCycle === 'yearly' ? price * 0.8 : price
    return `$${monthlyPrice.toFixed(0)}/${billingCycle === 'yearly' ? 'year' : 'month'}`
  }

  return (
    <SettingsLayout
      title="Billing"
      description="Manage subscriptions and payment methods"
      icon={<CreditCard className="w-6 h-6 text-cyan-400" />}
    >
      <div className="space-y-6">
        {/* Current Plan */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Current Plan
            </h3>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Professional Plan
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  $29/month • Next billing: February 1, 2025
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <motion.button
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Manage Plan
              </motion.button>
            </div>
          </div>
        </GlassCard>

        {/* Billing Cycle Toggle */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Choose Your Plan
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Upgrade or downgrade your plan at any time
              </p>
            </div>
            
            <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Yearly
                <span className="ml-1 text-xs text-green-500">20% off</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-4 border-2 rounded-lg transition-all ${
                  plan.id === currentPlan
                    ? 'border-cyan-400 bg-cyan-500/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-cyan-400/50'
                } ${plan.popular ? 'ring-2 ring-cyan-400/20' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-3 py-1 bg-cyan-500 text-white text-xs font-medium rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <plan.icon className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {plan.name}
                  </h4>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {formatPrice(plan.price)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {plan.description}
                  </p>
                </div>
                
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <motion.button
                  className={`w-full py-2 rounded-lg transition-colors ${
                    plan.id === currentPlan
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-white'
                  }`}
                  disabled={plan.id === currentPlan}
                  whileHover={plan.id !== currentPlan ? { scale: 1.02 } : {}}
                  whileTap={plan.id !== currentPlan ? { scale: 0.98 } : {}}
                >
                  {plan.id === currentPlan ? 'Current Plan' : 'Select Plan'}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Payment Methods */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Payment Methods
              </h3>
            </div>
            <motion.button
              className="px-4 py-2 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/30 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add Payment Method
            </motion.button>
          </div>
          
          <div className="space-y-3">
            {paymentMethods.map((method, index) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  method.default 
                    ? 'border-cyan-400 bg-cyan-500/10'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {method.brand} •••• {method.last4}
                      </span>
                      {method.default && (
                        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-full text-xs">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Expires {method.expiry}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!method.default && (
                    <button 
                      onClick={() => handleSetAsDefault(method.id)}
                      className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Set as Default
                    </button>
                  )}
                  <button 
                    onClick={() => handleEditPaymentMethod(method.id)}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleRemovePaymentMethod(method.id)}
                    className="text-sm text-red-500 hover:text-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Billing History */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Billing History
              </h3>
            </div>
            <motion.button
              className="px-4 py-2 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/30 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Download All
            </motion.button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Invoice
                  </th>
                  <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date
                  </th>
                  <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Plan
                  </th>
                  <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Amount
                  </th>
                  <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="text-right py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, index) => (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                  >
                    <td className="py-4 font-mono text-sm text-gray-900 dark:text-white">
                      {invoice.id}
                    </td>
                    <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                      {invoice.plan}
                    </td>
                    <td className="py-4 text-sm font-medium text-gray-900 dark:text-white">
                      ${invoice.amount.toFixed(2)}
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-xs capitalize">
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <motion.button
                        className="text-cyan-400 hover:text-cyan-300 text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Download className="w-4 h-4" />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </SettingsLayout>
  )
}