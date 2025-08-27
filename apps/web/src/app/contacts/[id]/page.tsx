'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Star, 
  Plus,
  Home,
  Heart,
  HeartOff,
  Eye,
  DollarSign,
  Bed,
  Bath,
  Square,
  MessageSquare,
  Clock
} from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { GlassCard } from '@/components/ui/glass-card'
import { ContactWithProperties } from '@/types/property'

// Mock data for demonstration
const mockContact: ContactWithProperties = {
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  phone: '(555) 123-4567',
  source: 'qr_scan',
  stage: 'qualified',
  tags: ['first-time-buyer', 'pre-approved'],
  notes: 'Very motivated buyer, pre-approved up to $500k. Looking for move-in ready home.',
  createdAt: new Date('2024-08-15'),
  updatedAt: new Date('2024-08-15'),
  lastContact: new Date('2024-08-20'),
  nextFollowUp: new Date('2024-08-22'),
  priority: 'high',
  budget: {
    min: 350000,
    max: 500000
  },
  preferredLocations: ['Downtown', 'Midtown', 'Suburbs'],
  propertyRequirements: {
    minBedrooms: 2,
    minBathrooms: 2,
    propertyTypes: ['single_family', 'condo'],
    mustHaveFeatures: ['parking', 'laundry'],
    niceToHaveFeatures: ['garden', 'modern_kitchen', 'hardwood_floors']
  },
  propertyHistory: {
    contactId: '1',
    totalPropertiesViewed: 8,
    averageRating: 3.2,
    preferredFeatures: ['hardwood_floors', 'modern_kitchen', 'parking'],
    dealBreakers: ['no_parking', 'carpet', 'small_kitchen'],
    properties: [
      {
        property: {
          id: '1',
          address: '123 Oak Street',
          city: 'Downtown',
          state: 'CA',
          zipCode: '90210',
          price: 450000,
          bedrooms: 3,
          bathrooms: 2,
          squareFootage: 1800,
          propertyType: 'single_family',
          status: 'active',
          listingDate: new Date('2024-08-01'),
          images: ['/api/placeholder/300/200'],
          features: ['hardwood_floors', 'modern_kitchen', 'parking', 'garden'],
          description: 'Beautiful single-family home with modern updates'
        },
        interactions: [
          {
            id: '1',
            contactId: '1',
            propertyId: '1',
            interactionType: 'attended_showing',
            date: new Date('2024-08-18'),
            notes: 'Client loved the kitchen and hardwood floors'
          }
        ],
        viewingNotes: [
          {
            id: '1',
            propertyId: '1',
            contactId: '1',
            viewingDate: new Date('2024-08-18'),
            likes: ['Modern kitchen with granite counters', 'Hardwood floors throughout', 'Private backyard'],
            dislikes: ['Small master bedroom', 'Only one car garage', 'Needs paint in guest bedroom'],
            overallRating: 4,
            notes: 'Client very interested, main concern is the small master bedroom. Willing to overlook if price is right.',
            interestedLevel: 'high',
            followUpRequired: true,
            createdAt: new Date('2024-08-18'),
            updatedAt: new Date('2024-08-18')
          }
        ],
        currentStatus: 'interested',
        lastInteraction: new Date('2024-08-18')
      },
      {
        property: {
          id: '2',
          address: '456 Pine Avenue',
          city: 'Midtown',
          state: 'CA',
          zipCode: '90211',
          price: 380000,
          bedrooms: 2,
          bathrooms: 2,
          squareFootage: 1400,
          propertyType: 'condo',
          status: 'active',
          listingDate: new Date('2024-07-15'),
          images: ['/api/placeholder/300/200'],
          features: ['modern_kitchen', 'parking', 'pool', 'gym'],
          description: 'Modern condo with amenities'
        },
        interactions: [
          {
            id: '2',
            contactId: '1',
            propertyId: '2',
            interactionType: 'attended_showing',
            date: new Date('2024-08-15'),
          }
        ],
        viewingNotes: [
          {
            id: '2',
            propertyId: '2',
            contactId: '1',
            viewingDate: new Date('2024-08-15'),
            likes: ['Great amenities', 'Modern finishes', 'Good location'],
            dislikes: ['No outdoor space', 'Small rooms', 'HOA fees too high'],
            overallRating: 2,
            notes: 'Client not impressed with the size and HOA fees. Looking for more space.',
            interestedLevel: 'low',
            followUpRequired: false,
            createdAt: new Date('2024-08-15'),
            updatedAt: new Date('2024-08-15')
          }
        ],
        currentStatus: 'not_interested',
        lastInteraction: new Date('2024-08-15')
      }
    ]
  }
}

interface ContactDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ContactDetailPage({ params }: ContactDetailPageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [contact, setContact] = useState<ContactWithProperties | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'notes'>('overview')
  const [, setShowAddNote] = useState<string | null>(null) // propertyId when adding note

  useEffect(() => {
    // In real app, fetch contact data by ID
    setContact(mockContact)
  }, [resolvedParams.id])

  if (!contact) {
    return (
      <ProtectedRoute>
        <div className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading contact...</p>
        </div>
      </ProtectedRoute>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'interested': return 'bg-green-500/20 text-green-400 border-green-400/30'
      case 'considering': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30'
      case 'not_interested': return 'bg-red-500/20 text-red-400 border-red-400/30'
      case 'offer_made': return 'bg-blue-500/20 text-blue-400 border-blue-400/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
        }`}
      />
    ))
  }

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/20 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {contact.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 capitalize">
              {contact.stage} • {contact.priority} priority
            </p>
          </div>
        </div>

        {/* Contact Info Card */}
        <GlassCard className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Contact Info</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{contact.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{contact.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Joined {contact.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Budget</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatCurrency(contact.budget?.min || 0)} - {formatCurrency(contact.budget?.max || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Property Stats */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Property Activity</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {contact.propertyHistory.totalPropertiesViewed} properties viewed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {contact.propertyHistory.averageRating?.toFixed(1)} avg rating
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {contact.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full border border-cyan-400/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Navigation Tabs */}
        <GlassCard className="p-1">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'properties', label: 'Properties', icon: Home },
              { id: 'notes', label: 'Notes & Activity', icon: MessageSquare }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </GlassCard>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Requirements */}
              <GlassCard className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Property Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Must Have</h4>
                    <div className="flex flex-wrap gap-2">
                      {contact.propertyRequirements.mustHaveFeatures.map((feature) => (
                        <span
                          key={feature}
                          className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-400/30"
                        >
                          {feature.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nice to Have</h4>
                    <div className="flex flex-wrap gap-2">
                      {contact.propertyRequirements.niceToHaveFeatures.map((feature) => (
                        <span
                          key={feature}
                          className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-400/30"
                        >
                          {feature.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Preferences */}
              <GlassCard className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Learned Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Consistently Likes</h4>
                    <div className="space-y-1">
                      {contact.propertyHistory.preferredFeatures.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <Heart className="w-3 h-3 text-green-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {feature.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Deal Breakers</h4>
                    <div className="space-y-1">
                      {contact.propertyHistory.dealBreakers.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <HeartOff className="w-3 h-3 text-red-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {feature.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'properties' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {contact.propertyHistory.properties.map((propertyData) => (
                <GlassCard key={propertyData.property.id} className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Property Image */}
                    <div className="w-full lg:w-64 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Home className="w-12 h-12 text-gray-400" />
                    </div>

                    {/* Property Details */}
                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {propertyData.property.address}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {propertyData.property.city}, {propertyData.property.state} {propertyData.property.zipCode}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(propertyData.currentStatus)}`}>
                              {propertyData.currentStatus.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(propertyData.property.price)}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Bed className="w-4 h-4" />
                              {propertyData.property.bedrooms}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bath className="w-4 h-4" />
                              {propertyData.property.bathrooms}
                            </span>
                            <span className="flex items-center gap-1">
                              <Square className="w-4 h-4" />
                              {propertyData.property.squareFootage.toLocaleString()} sqft
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Viewing Notes */}
                      {propertyData.viewingNotes && propertyData.viewingNotes.length > 0 && (
                        <div className="space-y-3">
                          {propertyData.viewingNotes.map((note) => (
                            <div key={note.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Viewed {note.viewingDate.toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {renderStars(note.overallRating)}
                                </div>
                              </div>

                              {note.likes.length > 0 && (
                                <div className="mb-2">
                                  <h5 className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Liked:</h5>
                                  <div className="flex flex-wrap gap-1">
                                    {note.likes.map((like, index) => (
                                      <span
                                        key={index}
                                        className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded"
                                      >
                                        {like}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {note.dislikes.length > 0 && (
                                <div className="mb-2">
                                  <h5 className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Wished were different:</h5>
                                  <div className="flex flex-wrap gap-1">
                                    {note.dislikes.map((dislike, index) => (
                                      <span
                                        key={index}
                                        className="text-xs bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-1 rounded"
                                      >
                                        {dislike}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {note.notes && (
                                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                                  "{note.notes}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Note Button */}
                      <button
                        onClick={() => setShowAddNote(propertyData.property.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Viewing Note
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GlassCard className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Notes</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {contact.updatedAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {contact.notes}
                    </p>
                  </div>
                  
                  {/* Activity Feed */}
                  <div className="space-y-2">
                    {contact.propertyHistory.properties.flatMap(p => 
                      p.interactions.map(interaction => (
                        <div key={interaction.id} className="flex items-center gap-3 py-2 border-l-2 border-cyan-400/30 pl-4">
                          <Eye className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {interaction.interactionType.replace('_', ' ')} - {p.property.address}
                          </span>
                          <span className="text-xs text-gray-500 ml-auto">
                            {interaction.date.toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  )
}