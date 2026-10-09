import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Star, Navigation, Heart, Share2, ExternalLink } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Place {
  _id: string
  name: string
  category: string
  address?: string
  rating?: number
  priceRange?: string
  description?: string
  openHours?: string
  phone?: string
  website?: string
  isDemo?: boolean
  distance?: number
  location?: { coordinates: [number, number] }
  tags?: string[]
}

interface Props {
  place: Place
  isSelected: boolean
  onClick: () => void
  userLocation: [number, number] | null
}

const categoryColors: Record<string, string> = {
  food: '#f97316',
  cafe: '#f59e0b',
  hotel: '#10b981',
  heritage: '#8b5cf6',
  park: '#22c55e',
  shopping: '#3b82f6',
  hospital: '#f43f5e',
  transit: '#00d4ff',
}

function getDistanceText(distance?: number) {
  if (!distance) return null
  if (distance < 1000) return `${Math.round(distance)}m`
  return `${(distance / 1000).toFixed(1)}km`
}

export default function PlaceCard({ place, isSelected, onClick, userLocation }: Props) {
  const { user } = useAuth()
  const color = categoryColors[place.category] || '#94a3b8'

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) { toast.error('Please login to save places'); return }
    try {
      await axios.post('/api/places/save', { placeId: place._id })
      toast.success('Place saved!')
    } catch { toast.error('Could not save place') }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.share?.({ title: place.name, text: place.description, url: window.location.href })
    } catch {
      navigator.clipboard?.writeText(`${place.name} — ${place.address}`)
      toast.success('Copied to clipboard!')
    }
  }

  return (
    <motion.div
      whileHover={{ x: 2 }}
      onClick={onClick}
      className={`p-3 rounded-xl cursor-pointer transition-all border ${
        isSelected
          ? 'border-cyan-500/40 bg-cyan-500/5'
          : 'border-white/5 bg-white/2 hover:border-white/10'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Category dot */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: `${color}20` }}
        >
          <div className="w-3 h-3 rounded-full" style={{ background: color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-white text-sm truncate">{place.name}</h3>
              <span className="text-xs capitalize" style={{ color }}>{place.category}</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {place.isDemo && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Demo</span>
              )}
              {place.rating && (
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs text-slate-400">{place.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {place.address && (
            <p className="text-xs text-slate-600 mt-0.5 truncate flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" /> {place.address}
            </p>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {place.distance != null && (
                <span className="text-xs text-cyan-400 font-medium flex items-center gap-0.5">
                  <Navigation className="w-2.5 h-2.5" /> {getDistanceText(place.distance)}
                </span>
              )}
              {place.priceRange && (
                <span className="text-xs text-emerald-400">{place.priceRange}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleSave} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/5 transition-colors">
                <Heart className="w-3 h-3 text-slate-600 hover:text-rose-400" />
              </button>
              <button onClick={handleShare} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/5 transition-colors">
                <Share2 className="w-3 h-3 text-slate-600 hover:text-cyan-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
