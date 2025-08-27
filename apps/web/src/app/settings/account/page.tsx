'use client'

import { useState, useEffect } from 'react'
import { SettingsLayout } from '@/components/settings/settings-layout'
import { GlassCard } from '@/components/ui/glass-card'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { User, Save, Edit3, Briefcase } from 'lucide-react'

interface ProfileData {
  full_name: string
  email: string
  phone: string
  license_number: string
  license_state: string
  bio: string
  specialties: string[]
  street_address: string
  city: string
  state: string
  zip_code: string
}

export default function AccountSettingsPage() {
  const { user } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    license_number: '',
    license_state: '',
    bio: '',
    specialties: [],
    street_address: '',
    city: '',
    state: '',
    zip_code: ''
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error

        setProfileData({
          full_name: data.full_name || '',
          email: user.email || '',
          phone: data.phone || '',
          license_number: data.license_number || '',
          license_state: data.license_state || '',
          bio: data.bio || '',
          specialties: data.specialties || [],
          street_address: '',
          city: '',
          state: '',
          zip_code: ''
        })
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          license_number: profileData.license_number,
          license_state: profileData.license_state,
          bio: profileData.bio,
          specialties: profileData.specialties,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setEditMode(false)
      alert('✅ Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('❌ Error saving profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addSpecialty = () => {
    setProfileData(prev => ({
      ...prev,
      specialties: [...prev.specialties, '']
    }))
  }

  const updateSpecialty = (index: number, value: string) => {
    setProfileData(prev => ({
      ...prev,
      specialties: prev.specialties.map((spec, i) => i === index ? value : spec)
    }))
  }

  const removeSpecialty = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <SettingsLayout
        title="Account Information"
        description="Manage your profile and personal details"
        icon={<User className="w-6 h-6 text-cyan-400" />}
      >
        <GlassCard>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading profile...</span>
          </div>
        </GlassCard>
      </SettingsLayout>
    )
  }

  return (
    <SettingsLayout
      title="Account Information"
      description="Manage your profile and personal details"
      icon={<User className="w-6 h-6 text-cyan-400" />}
    >
      <div className="space-y-6">
        {/* Profile Overview */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                {profileData.full_name ? profileData.full_name.split(' ').map(n => n[0]).join('') : 'U'}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {profileData.full_name || 'Your Name'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {profileData.email}
                </p>
              </div>
            </div>
            
            <motion.button
              onClick={() => setEditMode(!editMode)}
              className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit3 className="w-4 h-4" />
              {editMode ? 'Cancel' : 'Edit Profile'}
            </motion.button>
          </div>

          {editMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border-t border-gray-200 dark:border-gray-700 pt-6"
            >
              <div className="flex justify-end">
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-300 text-white rounded-lg transition-colors flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </GlassCard>

        {/* Personal Information */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Personal Information
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                disabled={!editMode}
                value={profileData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors disabled:opacity-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={profileData.email}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed here. Contact support if needed.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                disabled={!editMode}
                value={profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors disabled:opacity-50"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </GlassCard>

        {/* Professional Information */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Professional Information
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                License Number
              </label>
              <input
                type="text"
                disabled={!editMode}
                value={profileData.license_number}
                onChange={(e) => handleInputChange('license_number', e.target.value)}
                className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors disabled:opacity-50"
                placeholder="e.g., RE123456"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                License State
              </label>
              <input
                type="text"
                disabled={!editMode}
                value={profileData.license_state}
                onChange={(e) => handleInputChange('license_state', e.target.value)}
                className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors disabled:opacity-50"
                placeholder="e.g., CA"
                maxLength={2}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Professional Bio
            </label>
            <textarea
              rows={4}
              disabled={!editMode}
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors disabled:opacity-50"
              placeholder="Tell clients about your experience and expertise..."
            />
          </div>
          
          {/* Specialties */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Specialties
              </label>
              {editMode && (
                <button
                  onClick={addSpecialty}
                  className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                  + Add Specialty
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              {profileData.specialties.map((specialty, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    disabled={!editMode}
                    value={specialty}
                    onChange={(e) => updateSpecialty(index, e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-colors disabled:opacity-50"
                    placeholder="e.g., Residential Sales, Commercial, Luxury Homes"
                  />
                  {editMode && (
                    <button
                      onClick={() => removeSpecialty(index)}
                      className="px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              
              {profileData.specialties.length === 0 && !editMode && (
                <p className="text-gray-500 text-sm italic">No specialties added yet</p>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </SettingsLayout>
  )
}