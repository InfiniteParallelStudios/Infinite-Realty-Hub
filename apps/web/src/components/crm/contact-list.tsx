'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Building, 
  Clock,
  ChevronRight,
  User,
  Zap
} from 'lucide-react'
import Link from 'next/link'

interface Contact {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  mobile?: string
  company?: string
  contact_type: 'lead' | 'prospect' | 'client' | 'past_client' | 'vendor' | 'colleague'
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'closed' | 'inactive'
  city?: string
  state?: string
  rating?: number
  created_at: string
  last_contact_date?: string
  next_followup_date?: string
}

interface ContactListProps {
  searchQuery: string
  filterType: string
  onEditContact?: (contact: Contact) => void
}

export function ContactList({ searchQuery, filterType, onEditContact }: ContactListProps) {
  const { user } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState<string | null>(null)

  // Use mock data instead of database to prevent errors
  useEffect(() => {
    const fetchContacts = async () => {
      console.log('📋 Loading contacts (demo mode)')
      
      try {
        // Mock contact data
        const mockContacts: Contact[] = [
          {
            id: '1',
            first_name: 'John',
            last_name: 'Smith',
            email: 'john.smith@example.com',
            phone: '(555) 123-4567',
            company: 'Smith Real Estate',
            contact_type: 'lead',
            status: 'new',
            city: 'San Francisco',
            state: 'CA',
            rating: 4,
            created_at: new Date().toISOString(),
            last_contact_date: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '2',
            first_name: 'Sarah',
            last_name: 'Johnson',
            email: 'sarah.j@example.com',
            phone: '(555) 234-5678',
            company: 'Johnson Properties',
            contact_type: 'prospect',
            status: 'contacted',
            city: 'Los Angeles',
            state: 'CA',
            rating: 5,
            created_at: new Date(Date.now() - 172800000).toISOString(),
            last_contact_date: new Date(Date.now() - 43200000).toISOString()
          },
          {
            id: '3',
            first_name: 'Mike',
            last_name: 'Davis',
            email: 'mike.davis@example.com',
            phone: '(555) 345-6789',
            company: 'Davis Investments',
            contact_type: 'client',
            status: 'converted',
            city: 'San Diego',
            state: 'CA',
            rating: 4,
            created_at: new Date(Date.now() - 259200000).toISOString(),
            last_contact_date: new Date(Date.now() - 21600000).toISOString()
          }
        ]

        // Filter by type if needed
        let filteredContacts = mockContacts
        if (filterType !== 'all') {
          filteredContacts = mockContacts.filter(contact => contact.contact_type === filterType)
        }

        setContacts(filteredContacts)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [user, filterType])

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact =>
    `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone?.includes(searchQuery) ||
    contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-500 bg-blue-500/20'
      case 'contacted': return 'text-yellow-500 bg-yellow-500/20'
      case 'qualified': return 'text-green-500 bg-green-500/20'
      case 'unqualified': return 'text-red-500 bg-red-500/20'
      case 'converted': return 'text-purple-500 bg-purple-500/20'
      case 'closed': return 'text-cyan-500 bg-cyan-500/20'
      default: return 'text-gray-500 bg-gray-500/20'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lead': return <Zap className="w-4 h-4" />
      case 'prospect': return <User className="w-4 h-4" />
      case 'client': return <Star className="w-4 h-4" />
      case 'vendor': return <Building className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (loading) {
    return (
      <GlassCard>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading contacts...</span>
        </div>
      </GlassCard>
    )
  }

  if (filteredContacts.length === 0) {
    return (
      <GlassCard>
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {contacts.length === 0 ? 'No contacts yet' : 'No contacts found'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {contacts.length === 0 
              ? 'Add your first contact to get started with your CRM'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard>
      <div className="space-y-1">
        <AnimatePresence>
          {filteredContacts.map((contact) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`rounded-lg transition-all duration-200 ${
                selectedContact === contact.id ? 'bg-cyan-500/10 border-cyan-400/50' : ''
              }`}
            >
              <Link 
                href={`/contacts/${contact.id}`}
                className="block p-4 hover:bg-white/30 dark:hover:bg-gray-800/30 border border-transparent hover:border-cyan-400/30 rounded-lg transition-all"
              >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-semibold">
                    {getInitials(contact.first_name, contact.last_name)}
                  </div>

                  {/* Contact Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {contact.first_name} {contact.last_name}
                      </h3>
                      
                      {/* Contact Type Badge */}
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800/50 text-xs">
                        {getTypeIcon(contact.contact_type)}
                        <span className="text-gray-600 dark:text-gray-400 capitalize">
                          {contact.contact_type}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                        {contact.status.replace('_', ' ')}
                      </span>

                      {/* Rating */}
                      {contact.rating && (
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < contact.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      {contact.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{contact.email}</span>
                        </div>
                      )}
                      {(contact.phone || contact.mobile) && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span>{contact.phone || contact.mobile}</span>
                        </div>
                      )}
                      {contact.company && (
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          <span>{contact.company}</span>
                        </div>
                      )}
                      {(contact.city || contact.state) && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{[contact.city, contact.state].filter(Boolean).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions and Dates */}
                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm">
                    <div className="text-gray-500 dark:text-gray-400">
                      Created: {formatDate(contact.created_at)}
                    </div>
                    {contact.last_contact_date && (
                      <div className="text-gray-500 dark:text-gray-400">
                        Last contact: {formatDate(contact.last_contact_date)}
                      </div>
                    )}
                    {contact.next_followup_date && (
                      <div className="text-cyan-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Follow up: {formatDate(contact.next_followup_date)}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setSelectedContact(selectedContact === contact.id ? null : contact.id)
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <ChevronRight 
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        selectedContact === contact.id ? 'rotate-90' : ''
                      }`} 
                    />
                  </button>
                </div>
              </div>
              </Link>

              {/* Expanded Details */}
              <AnimatePresence>
                {selectedContact === contact.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Contact Details</h4>
                        <div className="space-y-1 text-gray-600 dark:text-gray-400">
                          {contact.email && <div>Email: {contact.email}</div>}
                          {contact.phone && <div>Phone: {contact.phone}</div>}
                          {contact.mobile && <div>Mobile: {contact.mobile}</div>}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Professional</h4>
                        <div className="space-y-1 text-gray-600 dark:text-gray-400">
                          {contact.company && <div>Company: {contact.company}</div>}
                          <div>Type: {contact.contact_type}</div>
                          <div>Status: {contact.status}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Timeline</h4>
                        <div className="space-y-1 text-gray-600 dark:text-gray-400">
                          <div>Added: {formatDate(contact.created_at)}</div>
                          {contact.last_contact_date && (
                            <div>Last Contact: {formatDate(contact.last_contact_date)}</div>
                          )}
                          {contact.next_followup_date && (
                            <div className="text-cyan-400">
                              Next Follow-up: {formatDate(contact.next_followup_date)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="mt-4 flex gap-2">
                      <button 
                        onClick={() => onEditContact?.(contact)}
                        className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => window.open(`tel:${contact.phone || contact.mobile}`)}
                        className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                        disabled={!contact.phone && !contact.mobile}
                      >
                        Call
                      </button>
                      <button 
                        onClick={() => window.open(`mailto:${contact.email}`)}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                        disabled={!contact.email}
                      >
                        Email
                      </button>
                      <button 
                        onClick={() => {
                          // TODO: Implement add note functionality
                          alert(`Add note for ${contact.first_name} ${contact.last_name} - Feature coming soon!`);
                        }}
                        className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
                      >
                        Add Note
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassCard>
  )
}