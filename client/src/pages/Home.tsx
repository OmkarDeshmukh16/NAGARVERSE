import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, MapPin, Shield, CloudSun, Utensils, Hotel, Landmark, ArrowRight,
  TrendingUp, Activity, Star, Navigation, Globe2, Car, Compass, Play,
  CheckCircle, AlertTriangle, MessageSquare, Sparkles, SlidersHorizontal,
  ChevronDown, Cpu, Eye, Info, Volume2, ShieldAlert
} from 'lucide-react'
import { useNavi } from '../contexts/NaviContext'
import HeroScene from '../components/three/HeroScene'

export default function Home() {
  const navigate = useNavigate()
  const { openNavi, sendMessage } = useNavi()

  // State
  const [selectedCity, setSelectedCity] = useState('Pune')
  const [query, setQuery] = useState('')
  const [show3DScene, setShow3DScene] = useState(false)
  const [exploreTab, setExploreTab] = useState('All')
  const [insightTab, setInsightTab] = useState<'traffic' | 'weather' | 'reports'>('traffic')
  const [bestWorstTab, setBestWorstTab] = useState<'best' | 'worst'>('best')
  const [activePlaceIndex, setActivePlaceIndex] = useState(0)
  const [videoModal, setVideoModal] = useState(false)

  // Quick Action pills matching reference image
  const quickCategories = [
    { label: 'Food & Dining', icon: Utensils, color: '#f97316', bg: 'bg-orange-500/10 border-orange-500/20 text-orange-400', href: '/explore?cat=food' },
    { label: 'Hotels', icon: Hotel, color: '#3b82f6', bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400', href: '/explore?cat=hotels' },
    { label: 'Attractions', icon: Landmark, color: '#10b981', bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', href: '/heritage' },
    { label: 'Safety', icon: Shield, color: '#f43f5e', bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400', href: '/safety' },
    { label: 'Weather', icon: CloudSun, color: '#00d4ff', bg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400', href: '/insights' },
    { label: 'Traffic', icon: Car, color: '#8b5cf6', bg: 'bg-violet-500/10 border-violet-500/20 text-violet-400', href: '/insights' },
  ]

  // 9 3D Elements matching reference image
  const threeElements = [
    { title: '3D Map Pins & Routes', desc: 'Precision GIS route projection', icon: '📍', color: '#f43f5e', gradient: 'from-rose-500/20 to-orange-500/10' },
    { title: '3D Food Icons & Preview', desc: 'Culinary volumetric renders', icon: '🍔', color: '#f97316', gradient: 'from-orange-500/20 to-amber-500/10' },
    { title: '3D Hotel Icons & Stays', desc: 'Hospitality accommodation units', icon: '🏨', color: '#3b82f6', gradient: 'from-blue-500/20 to-cyan-500/10' },
    { title: '3D Landmark Models', desc: 'Ancient stone wadas & forts', icon: '🏛️', color: '#eab308', gradient: 'from-yellow-500/20 to-orange-500/10' },
    { title: '3D Weather Animations', desc: 'Volumetric cloud simulations', icon: '⛅', color: '#00d4ff', gradient: 'from-cyan-500/20 to-blue-500/10' },
    { title: '3D Traffic Vehicles', desc: 'Kinematic congestion flow', icon: '🚗', color: '#ef4444', gradient: 'from-red-500/20 to-rose-500/10' },
    { title: '3D Safety Indicators', desc: 'Dynamic hazard shielding', icon: '🛡️', color: '#10b981', gradient: 'from-emerald-500/20 to-cyan-500/10' },
    { title: '3D Voice & Chat Bubbles', desc: 'Navi conversational AI orb', icon: '💬', color: '#8b5cf6', gradient: 'from-violet-500/20 to-purple-500/10' },
    { title: '3D Interactive Map', desc: 'Planetary WebGL city twin', icon: '🌐', color: '#06b6d4', gradient: 'from-cyan-500/20 to-emerald-500/10' },
  ]

  // Places list in Explore section
  const explorePlaces = [
    { name: 'Vada Pav Corner', category: 'Local Food • 1.2 km', rating: '4.5', reviews: '3.2k', cost: '₹50–₹100', img: '🍔', tag: 'Fast Bite' },
    { name: 'Shaniwar Wada', category: 'Historical Landmark • 2.1 km', rating: '4.6', reviews: '12k', cost: '₹20 Entry', img: '🏛️', tag: 'Heritage' },
    { name: 'The Westin Pune', category: 'Hotel • 3.4 km', rating: '4.4', reviews: '8.9k', cost: '₹4,500/night', img: '🏨', tag: 'Luxury' },
    { name: 'Phoenix Mall', category: 'Shopping • 4.2 km', rating: '4.3', reviews: '7.6k', cost: 'Premier Mall', img: '🛍️', tag: 'Shopping' },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    if (query.length > 15) {
      openNavi()
      sendMessage(query)
    } else {
      navigate(`/explore?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#060b17] text-slate-100 overflow-x-hidden selection:bg-cyan-500/30">
      {/* Ambient background glow dots */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[450px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[550px] h-[450px] bg-violet-600/10 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/3 w-[600px] h-[500px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 1. HERO SECTION (FULLSCREEN BACKGROUND MATCHING REFERENCE DESIGN)      */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Fullscreen Panoramic Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/cityquest-hero-backdrop.jpg"
            alt="CityQuest 3D Hero Backdrop"
            className="w-full h-full object-cover object-right sm:object-center pointer-events-none select-none"
          />
          {/* Subtle gradient vignette on bottom to blend into the next section */}
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#060b17] via-[#060b17]/80 to-transparent pointer-events-none" />
          {/* Subtle gradient vignette on top under navbar */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#060b17]/80 to-transparent pointer-events-none" />
          {/* Soft ambient mobile readability overlay */}
          <div className="absolute inset-0 bg-[#060b17]/50 lg:hidden pointer-events-none" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pt-28 pb-16">
          <div className="grid lg:grid-cols-12 gap-8 items-center min-h-[70vh]">
            {/* Left 7 Columns: Headline, Subtitle, Search bar, Quick Filters */}
            <div className="lg:col-span-7 space-y-6">
              {/* Giant Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-5xl sm:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight text-white drop-shadow-md"
              >
                Your City.<br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Smarter.
                </span><br />
                Not Harder.
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed drop-shadow"
              >
                Discover the best places, explore rich history, stay safe, and make smarter choices with real-time city insights.
              </motion.p>

              {/* Search Pill Input Bar */}
              <motion.form
                onSubmit={handleSearch}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-1.5 rounded-full bg-[#0d182e]/90 border border-white/15 shadow-2xl shadow-black/80 flex items-center gap-2 max-w-xl backdrop-blur-xl"
              >
                {/* City selector dropdown */}
                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 border border-white/5 text-xs font-semibold text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{selectedCity}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>

                {/* Text Input */}
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search places, food, landmarks, etc..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-slate-400 px-2"
                />

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 transition-transform active:scale-90"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.form>

              {/* 6 Quick Category Filter Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-2 pt-1"
              >
                {quickCategories.map(({ label, icon: Icon, bg, href }) => (
                  <Link
                    key={label}
                    to={href}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md transition-all duration-200 hover:scale-105 shadow-sm ${bg}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </Link>
                ))}
              </motion.div>
            </div>

            {/* Right 5 Columns: Floating Handwritten Note in open sky */}
            <div className="lg:col-span-5 relative hidden lg:flex items-start justify-end h-full pt-6 pr-6">
              <div className="text-right space-y-1">
                <div className="text-cyan-300 font-hand text-3xl font-bold tracking-wide leading-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                  Same City<br />New Perspective
                </div>
                <div className="text-cyan-300 text-3xl font-hand inline-block transform translate-x-2 rotate-45 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  ⤷
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 2. 3D ELEMENTS & ANIMATIONS & TECH STACK SECTION                       */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left 8 columns: 3D Elements & Animations Grid */}
          <div className="lg:col-span-8 p-6 rounded-3xl bg-[#0c1629]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                3D Elements & Animations
              </h2>
              <span className="text-xs text-slate-400">Interactive 3D Spatial Modules</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {threeElements.map((item, idx) => (
                <motion.div
                  key={item.title}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className={`p-4 rounded-2xl border border-white/5 bg-gradient-to-b ${item.gradient} hover:border-white/20 transition-all cursor-pointer flex flex-col justify-between min-h-[110px] group`}
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">{item.title}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right 4 columns: Tech Stack & Architecture Panel */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-[#0c1629]/90 border border-white/10 shadow-2xl backdrop-blur-xl space-y-5">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Architecture</div>
              <h3 className="text-lg font-black text-white">Full-Stack Intelligence</h3>
            </div>

            {/* MERN Stack Badges */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">MERN Stack</span>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">MongoDB</div>
                <div className="p-2 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-300 text-xs font-bold">Express</div>
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold">React 19</div>
                <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold">Node.js</div>
              </div>
            </div>

            {/* APIs & Tools Badges */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">APIs & Integrations</span>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">🗺️ OpenStreetMap / MapLibre</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">⛅ Open-Meteo Weather</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">🚗 Traffic Heuristic Routing</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">🤖 Google Gemini 1.5 NLP</span>
              </div>
            </div>

            {/* Key Features Checklist */}
            <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-white/5">
              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-cyan-400" /> Real-time spatial query caching</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-cyan-400" /> Community verified hazard feeds</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-cyan-400" /> In-browser audio & voice notes</div>
            </div>

            {/* Neon Catchphrase Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/30 to-violet-900/40 border border-violet-500/30 text-center">
              <div className="text-sm font-black text-white tracking-wide">
                Turn Urban Chaos into Smart Choices
              </div>
              <div className="font-hand text-cyan-300 text-lg mt-1">
                Not just a city app... It's your city companion
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 3. DUAL DASHBOARD: EXPLORE YOUR CITY & SAFER ROUTE / INSIGHTS          */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <section className="py-8 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* ── Left 7 cols: "Explore Your City" Dashboard Panel ── */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0c1629]/90 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
            <div>
              {/* Header with Title and Category Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-black text-white">Explore Your City</h3>
                  <p className="text-xs text-slate-400">Food • Places • Hotels • Culture</p>
                </div>
                <div className="flex gap-1.5">
                  {['All', 'Food', 'Attractions', 'Hotels', 'Culture'].map(t => (
                    <button
                      key={t}
                      onClick={() => setExploreTab(t)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                        exploreTab === t
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid: Perspective Map on Left + Place Cards List on Right */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Visual Perspective Map */}
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#081020] min-h-[260px] flex items-center justify-center group">
                  <img
                    src="/pune-island.jpg"
                    alt="Map view"
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Floating Marker Pins */}
                  <div className="absolute top-6 left-6 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-amber-400/50 text-[11px] font-bold text-amber-300 shadow-lg flex items-center gap-1.5">
                    <span>🏛️ Shaniwar Wada</span>
                    <span className="text-[10px] text-white">★ 4.6</span>
                  </div>
                  <div className="absolute bottom-12 right-6 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-cyan-400/50 text-[11px] font-bold text-cyan-300 shadow-lg flex items-center gap-1.5">
                    <span>🏨 Hotel Westin</span>
                    <span className="text-[10px] text-white">₹4,500</span>
                  </div>
                  <div className="absolute top-20 right-8 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-orange-400/50 text-[10px] font-bold text-orange-300 shadow-lg">
                    🍔 Local Food • 7 min
                  </div>

                  {/* Bottom Map Controls */}
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    <Link to="/explore" className="px-2 py-1 rounded-md bg-blue-600/90 text-[10px] font-bold text-white hover:bg-blue-500">
                      Open Full Map ↗
                    </Link>
                  </div>
                </div>

                {/* Places Column List */}
                <div className="space-y-2.5">
                  {explorePlaces.map((place, idx) => (
                    <motion.div
                      key={place.name}
                      whileHover={{ x: 2 }}
                      onClick={() => setActivePlaceIndex(idx)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        activePlaceIndex === idx
                          ? 'border-blue-500/40 bg-blue-500/10 shadow-lg'
                          : 'border-white/5 bg-white/2 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl p-1 rounded-xl bg-white/5">{place.img}</div>
                        <div>
                          <div className="font-bold text-xs text-white">{place.name}</div>
                          <div className="text-[10px] text-slate-400">{place.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-amber-400">★ {place.rating}</div>
                        <div className="text-[10px] text-slate-400">{place.cost}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom explorer bar */}
            <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Explore 100+ verified places in Pune</span>
              <Link to="/explore" className="text-cyan-400 font-bold hover:underline flex items-center gap-1">
                View all places <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* ── Right 5 cols: "Take a Safer Route" & "Live City Insights" ── */}
          <div className="lg:col-span-5 space-y-6">
            {/* Take a Safer Route Card */}
            <div className="p-5 rounded-3xl bg-[#0c1629]/90 border border-white/10 shadow-2xl backdrop-blur-xl space-y-3.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Shield className="w-4 h-4" />
                <span>Take a Safer Route</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Avoid unsafe areas, accident-prone zones and get real-time safety alerts.
              </p>

              {/* Route Map Preview Graphic */}
              <div className="p-3.5 rounded-2xl bg-[#081224] border border-white/5 space-y-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs font-semibold text-emerald-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Recommended Route</span>
                  </div>
                  <span className="text-[10px] text-emerald-300/80">Safer • Less Traffic • Well Lit</span>
                </div>

                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                  <span>Area with recent safety reports (Last 7 days)</span>
                </div>

                {/* Map Legend */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1 border-t border-white/5">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Unsafe Area</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Accident Prone</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Police Station</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Safe Route</div>
                </div>
              </div>

              <Link
                to="/safety"
                className="btn-primary w-full text-center py-2 text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                Calculate Safe Route
              </Link>
            </div>

            {/* Live City Insights Card */}
            <div className="p-5 rounded-3xl bg-[#0c1629]/90 border border-white/10 shadow-2xl backdrop-blur-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Activity className="w-4 h-4" />
                  <span>Live City Insights</span>
                </div>
                <div className="flex gap-1">
                  {(['traffic', 'weather', 'reports'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setInsightTab(tab)}
                      className={`px-2 py-0.5 rounded-md text-[11px] capitalize font-medium ${
                        insightTab === tab ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Tab Body */}
              {insightTab === 'traffic' && (
                <div className="p-3.5 rounded-2xl bg-[#081224] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Heavy Traffic</div>
                      <div className="text-[11px] text-slate-400">FC Road, Pune • <span className="text-rose-400 font-semibold">+23 min delay</span></div>
                    </div>
                  </div>
                  <Link to="/insights" className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-slate-300">
                    View
                  </Link>
                </div>
              )}

              {insightTab === 'weather' && (
                <div className="p-3.5 rounded-2xl bg-[#081224] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-black text-white">32°C</div>
                      <div className="text-[11px] text-slate-400">Partly Cloudy • Feels like 36°C</div>
                    </div>
                    <CloudSun className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px] pt-1">
                    <div className="p-1 rounded bg-white/5 text-slate-300">Now · 32°</div>
                    <div className="p-1 rounded bg-white/5 text-slate-300">12PM · 32°</div>
                    <div className="p-1 rounded bg-white/5 text-slate-300">3PM · 32°</div>
                    <div className="p-1 rounded bg-white/5 text-slate-300">6PM · 29°</div>
                  </div>
                </div>
              )}

              {insightTab === 'reports' && (
                <div className="p-3.5 rounded-2xl bg-[#081224] border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-amber-300">Recent Citizen Report</div>
                    <div className="text-[11px] text-slate-400">Waterlogging near Deccan (2 hours ago)</div>
                  </div>
                  <Link to="/community" className="text-xs text-cyan-400 font-semibold">Feed ↗</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 4. BEST VS WORST & HERITAGE VIDEO SHOWCASE                             */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-6 items-stretch">
          {/* Best vs Worst Analysis Column (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0c1629]/90 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-xl font-black text-white">Best vs Worst</h3>
                  <p className="text-xs text-slate-400">
                    Compare places based on safety, cleanliness, affordability, ratings & accessibility.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBestWorstTab('best')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      bestWorstTab === 'best'
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    Best Places
                  </button>
                  <button
                    onClick={() => setBestWorstTab('worst')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      bestWorstTab === 'worst'
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    Worst Places
                  </button>
                </div>
              </div>

              {/* Grid: Comparison Cards + 3D Split Visual Image */}
              <div className="grid sm:grid-cols-2 gap-4 items-center">
                {/* Neighborhood Ranking List */}
                <div className="space-y-2.5">
                  <div className="p-3 rounded-2xl bg-white/5 border border-emerald-500/25">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">Koregaon Park</span>
                      <span className="text-xs font-bold text-amber-400">★ 4.6</span>
                    </div>
                    <div className="flex gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Safe</span>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">Clean</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Expensive</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-blue-500/25">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">FC Road</span>
                      <span className="text-xs font-bold text-amber-400">★ 4.3</span>
                    </div>
                    <div className="flex gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">Affordable</span>
                      <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300">Lively</span>
                      <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300">Crowded</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-rose-500/25">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">Camp Area (Night)</span>
                      <span className="text-xs font-bold text-rose-400">★ 2.1</span>
                    </div>
                    <div className="flex gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">Unsafe</span>
                      <span className="px-2 py-0.5 rounded bg-slate-500/20 text-slate-300">Dirty</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Low Ratings</span>
                    </div>
                  </div>
                </div>

                {/* 3D Split Comparison Island Visual */}
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-lg group">
                  <img
                    src="/best-vs-worst.jpg"
                    alt="Best vs Worst Visual"
                    className="w-full h-48 sm:h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[11px] font-bold text-white px-2">
                    <span className="text-emerald-400">BEST ZONE</span>
                    <span className="text-rose-400">WORST ZONE</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Compare any two neighborhoods on 5 key safety metrics</span>
              <Link to="/compare" className="text-cyan-400 font-bold hover:underline flex items-center gap-1">
                Open Radar Comparison <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Heritage Video Tour Showcase (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0c1629]/90 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-black text-white">Heritage Experience</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">4K Guided Tour</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Walk through 300 years of Maratha Peshwa history with immersive audio guidance.
              </p>

              {/* Video Thumbnail Card with Play Button */}
              <div
                onClick={() => setVideoModal(true)}
                className="relative rounded-2xl overflow-hidden border border-white/15 cursor-pointer group shadow-2xl"
              >
                <img
                  src="/shaniwar-wada.jpg"
                  alt="Shaniwar Wada Heritage Fort"
                  className="w-full h-48 sm:h-56 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Subtitle pill overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white backdrop-blur-md bg-black/60 px-3 py-1.5 rounded-xl border border-white/10">
                  <span className="font-semibold">Explore • Experience • Stay Safe</span>
                  <span className="font-mono text-cyan-300">0:45</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Explore Sinhagad, Aga Khan Palace & more</span>
              <Link to="/heritage" className="text-amber-400 font-bold hover:underline flex items-center gap-1">
                Heritage Trail <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 5. VIDEO POPUP MODAL                                                   */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {videoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-3xl w-full p-4 rounded-3xl bg-[#0c1629] border border-white/10 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="font-black text-white text-lg">Shaniwar Wada 3D Heritage Experience</h3>
                <button
                  onClick={() => setVideoModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center relative">
                <img src="/shaniwar-wada.jpg" alt="Video cover" className="w-full h-full object-cover opacity-60" />
                <div className="absolute text-center space-y-2 p-6">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400 mx-auto flex items-center justify-center text-cyan-300 animate-pulse">
                    <Volume2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white">Audio Guided Narration Ready</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Built in 1732 as the seat of the Peshwa rulers of the Maratha Empire. Delhi Darwaza gate stands tall with anti-elephant spikes.
                  </p>
                  <Link to="/heritage" className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-xs rounded-xl mt-2">
                    Open Full Heritage Guide ↗
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
