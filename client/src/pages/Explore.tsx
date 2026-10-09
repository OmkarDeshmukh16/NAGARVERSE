import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  Search, List, Map, Utensils, Hotel, Landmark,
  Coffee, ShoppingBag, TreePine, Hospital, Bus, MapPin, X
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import PlaceCard from '../components/ui/PlaceCard'
import PlaceDetail from '../components/ui/PlaceDetail'
import { MAP_STYLES, getDefaultMapStyle, MapStyleKey } from '../utils/mapStyles'

const categories = [
  { id: 'all', label: 'All', icon: Map },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'cafe', label: 'Cafes', icon: Coffee },
  { id: 'hotel', label: 'Hotels', icon: Hotel },
  { id: 'heritage', label: 'Heritage', icon: Landmark },
  { id: 'park', label: 'Parks', icon: TreePine },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'hospital', label: 'Hospitals', icon: Hospital },
  { id: 'transit', label: 'Transit', icon: Bus },
]

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'distance', label: 'Distance' },
  { value: 'rating', label: 'Rating' },
  { value: 'affordability', label: 'Affordability' },
]

export default function Explore() {
  const [searchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') || 'all')
  const [sortBy, setSortBy] = useState('relevance')
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split')
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [inputQuery, setInputQuery] = useState(query)
  const [selectedPlace, setSelectedPlace] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  const [currentMapStyle, setCurrentMapStyle] = useState<MapStyleKey>('dark')

  // Get user location
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setUserLocation([pos.coords.longitude, pos.coords.latitude]),
      () => setUserLocation([73.8567, 18.5204]), // Pune center fallback
      { timeout: 5000 }
    )
  }, [])

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getDefaultMapStyle(),
      center: [73.8567, 18.5204],
      zoom: 12,
    })
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')
    map.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }), 'top-right')
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  const handleStyleChange = (styleKey: MapStyleKey) => {
    setCurrentMapStyle(styleKey)
    if (mapRef.current) {
      mapRef.current.setStyle(MAP_STYLES[styleKey] as any)
    }
  }

  // Fetch places
  const { data: places, isLoading, isError } = useQuery({
    queryKey: ['places', activeCategory, query, sortBy],
    queryFn: async () => {
      const res = await axios.get('/api/places', {
        params: {
          category: activeCategory === 'all' ? undefined : activeCategory,
          q: query || undefined,
          sortBy,
          lat: userLocation?.[1] || 18.5204,
          lng: userLocation?.[0] || 73.8567,
          limit: 40,
        },
      })
      return res.data.places || []
    },
  })

  // Update map markers
  useEffect(() => {
    if (!mapRef.current || !places) return
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    places.forEach((place: any) => {
      if (!place.location?.coordinates) return
      const [lng, lat] = place.location.coordinates
      const el = document.createElement('div')
      el.className = 'nv-marker'
      el.innerHTML = `<div style="
        width:32px;height:32px;border-radius:50% 50% 50% 0;
        background:linear-gradient(135deg,#00d4ff,#8b5cf6);
        transform:rotate(-45deg);
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 0 12px rgba(0,212,255,0.4);
        cursor:pointer;border:2px solid rgba(255,255,255,0.3);
      ">
        <div style="transform:rotate(45deg);width:10px;height:10px;border-radius:50%;background:white;"></div>
      </div>`
      el.addEventListener('click', () => setSelectedPlace(place))

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(mapRef.current!)
      markersRef.current.push(marker)
    })
  }, [places, currentMapStyle])

  // Fly to selected place
  useEffect(() => {
    if (!selectedPlace?.location?.coordinates || !mapRef.current) return
    const [lng, lat] = selectedPlace.location.coordinates
    mapRef.current.flyTo({ center: [lng, lat], zoom: 15, duration: 1200 })
  }, [selectedPlace])

  // Select place from URL parameters (e.g. from Navi assistant recommendations)
  useEffect(() => {
    const pId = searchParams.get('placeId')
    const latParam = parseFloat(searchParams.get('lat') || '')
    const lngParam = parseFloat(searchParams.get('lng') || '')

    if (pId) {
      if (places && places.length > 0) {
        const found = places.find((p: any) => p._id === pId || p.osmId === pId)
        if (found) {
          setSelectedPlace(found)
          return
        }
      }
      axios.get(`/api/places/${pId}`).then(res => {
        if (res.data?.place) {
          setSelectedPlace(res.data.place)
        }
      }).catch(() => {
        if (!isNaN(latParam) && !isNaN(lngParam) && mapRef.current) {
          mapRef.current.flyTo({ center: [lngParam, latParam], zoom: 15, duration: 1200 })
        }
      })
    } else if (!isNaN(latParam) && !isNaN(lngParam) && mapRef.current) {
      mapRef.current.flyTo({ center: [lngParam, latParam], zoom: 15, duration: 1200 })
    }
  }, [searchParams, places])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setQuery(inputQuery)
  }

  return (
    <div className="flex flex-col h-screen pt-16">
      {/* Top bar */}
      <div className="flex-shrink-0 glass-dark border-b border-white/5 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              placeholder="Search places, food, landmarks..."
              className="input-city pl-9 py-2 text-sm h-9"
            />
            {inputQuery && (
              <button type="button" onClick={() => { setInputQuery(''); setQuery('') }}
                className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-slate-500" />
              </button>
            )}
          </form>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-white/5 border border-white/10 text-slate-300 text-sm rounded-xl px-3 py-2 outline-none"
          >
            {sortOptions.map(o => <option key={o.value} value={o.value} className="bg-[#060d1f]">{o.label}</option>)}
          </select>

          {/* View mode */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            {(['split', 'list', 'map'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewMode === mode ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {mode === 'split' ? <><List className="w-3 h-3 inline mr-1" /><Map className="w-3 h-3 inline" /></> : mode === 'list' ? <List className="w-3 h-3" /> : <Map className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>

        {/* Category tabs */}
        <div className="max-w-7xl mx-auto mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCategory === id
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
                  : 'bg-white/3 text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Place list */}
        {viewMode !== 'map' && (
          <div className="w-full lg:w-[400px] flex-shrink-0 overflow-y-auto border-r border-white/5 bg-[#060d1f]/80">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton h-24 rounded-xl" />
                ))}
              </div>
            ) : isError ? (
              <div className="p-8 text-center text-slate-500">
                <p>Could not load places. Showing demo data.</p>
              </div>
            ) : places?.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No places found. Try a different search.</p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                <div className="text-xs text-slate-600 px-1 py-2">
                  {places?.length || 0} places found
                  {userLocation && <span className="ml-1">· Near you</span>}
                </div>
                {places?.map((place: any) => (
                  <PlaceCard
                    key={place._id}
                    place={place}
                    isSelected={selectedPlace?._id === place._id}
                    onClick={() => setSelectedPlace(place)}
                    userLocation={userLocation}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Map */}
        {viewMode !== 'list' && (
          <div className="flex-1 relative">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Map Style Switcher */}
            <div className="absolute top-4 left-4 z-10 flex items-center bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-2xl">
              <button
                type="button"
                onClick={() => handleStyleChange('dark')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentMapStyle === 'dark'
                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Dark Cyber
              </button>
              <button
                type="button"
                onClick={() => handleStyleChange('streets')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentMapStyle === 'streets'
                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Streets
              </button>
              <button
                type="button"
                onClick={() => handleStyleChange('satellite')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentMapStyle === 'satellite'
                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Satellite
              </button>
            </div>

            {/* Place detail overlay */}
            <AnimatePresence>
              {selectedPlace && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="absolute top-4 right-4 w-80 z-10"
                >
                  <PlaceDetail place={selectedPlace} onClose={() => setSelectedPlace(null)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Mobile detail sheet */}
      <AnimatePresence>
        {selectedPlace && viewMode !== 'split' && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed bottom-0 left-0 right-0 z-50 glass-dark rounded-t-3xl border-t border-white/10 max-h-[70vh] overflow-y-auto lg:hidden"
          >
            <PlaceDetail place={selectedPlace} onClose={() => setSelectedPlace(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
