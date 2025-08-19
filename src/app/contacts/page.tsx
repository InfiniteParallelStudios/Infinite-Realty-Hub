'use client'

import { useState } from 'react'
import { ContactList } from '@/components/crm/contact-list'
import { AddContactModal } from '@/components/crm/add-contact-modal'
import { GlassCard } from '@/components/ui/glass-card'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/contexts/auth-context'
import { motion } from 'framer-motion'
import { UserPlus, Search, Filter, Download, Users } from 'lucide-react'

export default function ContactsPage() {
  const {} = useAuth()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingContact, setEditingContact] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')

  const handleEditContact = (contact: any) => {
    setEditingContact(contact)
    setShowEditModal(true)
  }

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Contacts
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your real estate contacts and leads
            </p>
          </div>
          
          <motion.button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors shadow-lg shadow-cyan-500/20 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <UserPlus className="w-5 h-5" />
            Add Contact
          </motion.button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Total Contacts', value: '0', color: 'text-cyan-400' },
            { icon: UserPlus, label: 'New This Week', value: '0', color: 'text-blue-400' },
            { icon: Filter, label: 'Active Leads', value: '0', color: 'text-sky-400' },
            { icon: Download, label: 'Converted', value: '0', color: 'text-cyan-300' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard variant="glow" className="text-center">
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Search and Filter Bar */}
        <GlassCard>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
              />
            </div>
            
            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors"
            >
              <option value="all">All Contacts</option>
              <option value="lead">Leads</option>
              <option value="prospect">Prospects</option>
              <option value="client">Clients</option>
              <option value="past_client">Past Clients</option>
            </select>
            
            {/* Export Button */}
            <motion.button
              className="px-4 py-2 bg-white/20 dark:bg-gray-800/50 hover:bg-white/30 dark:hover:bg-gray-700/50 border border-cyan-400/30 text-gray-900 dark:text-cyan-400 rounded-lg transition-colors backdrop-blur-md flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-4 h-4" />
              Export
            </motion.button>
          </div>
        </GlassCard>

        {/* Contact List */}
        <ContactList 
          searchQuery={searchQuery}
          filterType={filterType}
          onEditContact={handleEditContact}
        />

        {/* Add Contact Modal */}
        {showAddModal && (
          <AddContactModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false)
              // Refresh contact list
            }}
          />
        )}

        {/* Edit Contact Modal */}
        {showEditModal && editingContact && (
          <AddContactModal
            contact={editingContact}
            onClose={() => {
              setShowEditModal(false)
              setEditingContact(null)
            }}
            onSuccess={() => {
              setShowEditModal(false)
              setEditingContact(null)
              // Refresh contact list
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}