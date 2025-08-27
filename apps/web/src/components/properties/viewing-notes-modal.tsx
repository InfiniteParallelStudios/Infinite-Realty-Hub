'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Star, Heart, HeartOff } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { PropertyViewingNote } from '@/types/property'

interface ViewingNotesModalProps {
  isOpen: boolean
  onClose: () => void
  propertyAddress: string
  onSave: (note: Omit<PropertyViewingNote, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function ViewingNotesModal({ isOpen, onClose, propertyAddress, onSave }: ViewingNotesModalProps) {
  const [likes, setLikes] = useState<string[]>([''])
  const [dislikes, setDislikes] = useState<string[]>([''])
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [notes, setNotes] = useState('')
  const [interestedLevel, setInterestedLevel] = useState<'low' | 'medium' | 'high'>('medium')
  const [followUpRequired, setFollowUpRequired] = useState(false)
  const [viewingDate, setViewingDate] = useState(new Date().toISOString().split('T')[0])

  const addLike = () => {
    setLikes([...likes, ''])
  }

  const removeLike = (index: number) => {
    setLikes(likes.filter((_, i) => i !== index))
  }

  const updateLike = (index: number, value: string) => {
    const newLikes = [...likes]
    newLikes[index] = value
    setLikes(newLikes)
  }

  const addDislike = () => {
    setDislikes([...dislikes, ''])
  }

  const removeDislike = (index: number) => {
    setDislikes(dislikes.filter((_, i) => i !== index))
  }

  const updateDislike = (index: number, value: string) => {
    const newDislikes = [...dislikes]
    newDislikes[index] = value
    setDislikes(newDislikes)
  }

  const handleSave = () => {
    const filteredLikes = likes.filter(like => like.trim() !== '')
    const filteredDislikes = dislikes.filter(dislike => dislike.trim() !== '')

    const viewingNote: Omit<PropertyViewingNote, 'id' | 'createdAt' | 'updatedAt'> = {
      propertyId: '', // This would be set by the parent
      contactId: '', // This would be set by the parent
      viewingDate: new Date(viewingDate),
      likes: filteredLikes,
      dislikes: filteredDislikes,
      overallRating: rating,
      notes: notes.trim(),
      interestedLevel,
      followUpRequired
    }

    onSave(viewingNote)
    onClose()

    // Reset form
    setLikes([''])
    setDislikes([''])
    setRating(3)
    setNotes('')
    setInterestedLevel('medium')
    setFollowUpRequired(false)
    setViewingDate(new Date().toISOString().split('T')[0])
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <GlassCard className="p-6 rounded-xl border-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Property Viewing Notes
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {propertyAddress}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form className="space-y-6">
              {/* Viewing Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Viewing Date
                </label>
                <input
                  type="date"
                  value={viewingDate}
                  onChange={(e) => setViewingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                />
              </div>

              {/* Overall Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star as 1 | 2 | 3 | 4 | 5)}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-400 hover:text-yellow-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {rating} star{rating !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Things They Liked */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-green-400" />
                  <label className="text-sm font-medium text-green-600 dark:text-green-400">
                    What did they like about this property?
                  </label>
                </div>
                <div className="space-y-2">
                  {likes.map((like, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={like}
                        onChange={(e) => updateLike(index, e.target.value)}
                        placeholder="e.g., Beautiful hardwood floors throughout"
                        className="flex-1 px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent text-sm"
                      />
                      {likes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLike(index)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addLike}
                    className="flex items-center gap-2 px-3 py-2 text-green-600 dark:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add another thing they liked
                  </button>
                </div>
              </div>

              {/* Things They Wished Were Different */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <HeartOff className="w-4 h-4 text-red-400" />
                  <label className="text-sm font-medium text-red-600 dark:text-red-400">
                    What did they wish was different?
                  </label>
                </div>
                <div className="space-y-2">
                  {dislikes.map((dislike, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={dislike}
                        onChange={(e) => updateDislike(index, e.target.value)}
                        placeholder="e.g., Kitchen needs updating, small master bedroom"
                        className="flex-1 px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent text-sm"
                      />
                      {dislikes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDislike(index)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addDislike}
                    className="flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add another concern
                  </button>
                </div>
              </div>

              {/* Interest Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Interest Level
                </label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setInterestedLevel(level)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        interestedLevel === level
                          ? level === 'high'
                            ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                            : level === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30'
                            : 'bg-red-500/20 text-red-400 border border-red-400/30'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Any additional observations, client comments, or follow-up actions..."
                  className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
                />
              </div>

              {/* Follow-up Required */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="followUp"
                  checked={followUpRequired}
                  onChange={(e) => setFollowUpRequired(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500 focus:ring-2"
                />
                <label htmlFor="followUp" className="text-sm text-gray-700 dark:text-gray-300">
                  Follow-up required for this property
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors"
                >
                  Save Notes
                </button>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}