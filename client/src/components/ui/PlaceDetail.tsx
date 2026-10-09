import React from 'react'
import { motion } from 'framer-motion'
import { X, Star, MapPin, Clock, Phone, Globe, Heart, ExternalLink, Share2, Navigation } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'

interface Props {
  place: any
  onClose: () => void
}

export default function PlaceDetail({ place, onClose }: Props) {
  const { user } = useAuth()

  const handleSave = async () => {
    if (!user) { toast.error('Login to save places'); return }
    try {
      await axios.post('/api/places/save', { placeId: place._id })
      toast.success('Saved to your list!')
    } catch { toast.error('Could not save') }
  }

  const handleNavigate = () => {
    if (!place.location?.coordinates) return
    const [lng, lat] = place.location.coordinates
    window.open(`https://www.openstreetmap.org/directions?to=${lat},${lng}`, '_blank')
  }

  return (
    <div className="glass-dark rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 capitalize">
              {place.category}
            </span>
            {place.isDemo && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">Demo</span>
            )}
          </div>
          <h3 className="font-bold text-white text-base leading-tight">{place.name}</h3>
          {place.address && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {place.address}
            </p>
          )}
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center flex-shrink-0">
          <X className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm">
          {place.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-white">{place.rating.toFixed(1)}</span>
              <span className="text-slate-600">rating</span>
            </div>
          )}
          {place.priceRange && (
            <div className="text-emerald-400 font-medium">{place.priceRange}</div>
          )}
          {place.distance != null && (
            <div className="flex items-center gap-1 text-cyan-400">
              <Navigation className="w-3.5 h-3.5" />
              {place.distance < 1000 ? `${Math.round(place.distance)}m` : `${(place.distance / 1000).toFixed(1)}km`}
            </div>
          )}
        </div>

        {/* Description */}
        {place.description && (
          <p className="text-sm text-slate-400 leading-relaxed">{place.description}</p>
        )}

        {/* Details */}
        <div className="space-y-2">
          {place.openHours && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" /> {place.openHours}
            </div>
          )}
          {place.phone && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Phone className="w-3.5 h-3.5" /> {place.phone}
            </div>
          )}
          {place.website && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Globe className="w-3.5 h-3.5" />
              <a href={place.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline truncate">
                {place.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>

        {/* Tags */}
        {place.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {place.tags.map((tag: string) => (
              <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-500">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Source */}
        {place.sourceMetadata && (
          <div className="text-[10px] text-slate-700 border-t border-white/5 pt-2">
            Source: {place.sourceMetadata.name} · Updated: {new Date(place.updatedAt).toLocaleDateString()}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button onClick={handleNavigate} className="btn-primary flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-xl">
            <Navigation className="w-4 h-4" /> Navigate
          </button>
          <button onClick={handleSave} className="btn-ghost flex items-center justify-center gap-2 px-3 py-2 rounded-xl">
            <Heart className="w-4 h-4 text-rose-400" />
          </button>
          <button
            onClick={() => { navigator.clipboard?.writeText(place.name); toast.success('Copied!') }}
            className="btn-ghost flex items-center justify-center gap-2 px-3 py-2 rounded-xl"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
