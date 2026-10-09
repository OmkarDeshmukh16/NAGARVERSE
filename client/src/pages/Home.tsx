import React, { useRef, useEffect, useState, Suspense } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, MapPin, Shield, CloudSun, Utensils, Hotel, Landmark, ArrowRight,
  TrendingUp, Activity, Zap, ChevronDown, Star, Navigation, Globe2
} from 'lucide-react'
import { useNavi } from '../contexts/NaviContext'
import HeroScene from '../components/three/HeroScene'
import CityStatusPanel from '../components/ui/CityStatusPanel'
import FeatureSection from '../components/sections/FeatureSection'
import StatsSection from '../components/sections/StatsSection'
import HeritagePeek from '../components/sections/HeritagePeek'

const quickActions = [
  { label: 'Food', icon: Utensils, color: '#f97316', href: '/explore?cat=food' },
  { label: 'Heritage', icon: Landmark, color: '#8b5cf6', href: '/heritage' },
  { label: 'Hotels', icon: Hotel, color: '#10b981', href: '/explore?cat=hotels' },
  { label: 'Safety', icon: Shield, color: '#f43f5e', href: '/safety' },
  { label: 'Weather', icon: CloudSun, color: '#00d4ff', href: '/insights' },
  { label: 'Explore', icon: Globe2, color: '#fbbf24', href: '/explore' },
]

export default function Home() {
  const navigate = useNavigate()
  const { openNavi, sendMessage } = useNavi()
  const [query, setQuery] = useState('')
  const [show3D] = useState(true)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    if (query.length > 15) {
      openNavi()
      sendMessage(query)
    } else {
      navigate(`/explore?q=${encodeURIComponent(query)}`)
    }
    setQuery('')
  }

  return (
    <div className="relative overflow-hidden">
      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-violet-600/5 rounded-full blur-3xl" />
          <div className="dot-grid absolute inset-0 opacity-30" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — copy */}
            <motion.div
              style={{ opacity: heroOpacity, y: heroY }}
              className="relative z-10 flex flex-col gap-6"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 w-fit"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-cyan-400 text-xs font-semibold tracking-wide uppercase">Pune City Intelligence</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="text-5xl sm:text-6xl xl:text-7xl font-black leading-[0.95] tracking-tight"
              >
                YOUR CITY.
                <br />
                <span className="gradient-text">A THOUSAND</span>
                <br />
                STORIES.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-slate-400 text-lg leading-relaxed max-w-lg"
              >
                Discover hidden gems, understand your surroundings, and navigate urban chaos with{' '}
                <span className="text-cyan-400 font-semibold">AI-powered city intelligence</span>.
              </motion.p>

              {/* Search bar */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onSubmit={handleSearch}
                className="relative"
              >
                <div className="relative flex items-center glass rounded-2xl border border-cyan-500/20 p-1.5 gap-2">
                  <Search className="w-5 h-5 text-cyan-400 ml-3 flex-shrink-0" />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Find Maharashtrian food near Shaniwar Wada..."
                    className="flex-1 bg-transparent text-slate-200 placeholder-slate-500 text-sm outline-none py-2"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="btn-primary px-5 py-2.5 rounded-xl text-sm flex-shrink-0"
                  >
                    Search
                  </motion.button>
                </div>
              </motion.form>

              {/* Quick actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap gap-2"
              >
                {quickActions.map(({ label, icon: Icon, color, href }) => (
                  <Link key={label} to={href}>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/3 hover:border-white/20 transition-all text-sm font-medium text-slate-300 cursor-pointer backdrop-blur-sm"
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                      {label}
                    </motion.div>
                  </Link>
                ))}
              </motion.div>

              {/* CTA row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-4"
              >
                <Link to="/explore">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl text-base"
                  >
                    <Navigation className="w-4 h-4" /> Explore My City
                  </motion.button>
                </Link>
                <button
                  onClick={openNavi}
                  className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium"
                >
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-violet-400" />
                  </div>
                  Ask Navi AI
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </motion.div>

            {/* Right — 3D hero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
              className="relative h-[500px] lg:h-[600px]"
            >
              {show3D ? (
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full skeleton" />
                  </div>
                }>
                  <HeroScene />
                </Suspense>
              ) : null}

              {/* City label overlay */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="absolute top-8 right-8 glass px-4 py-2 rounded-xl border border-cyan-500/20"
              >
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-white">Pune, MH</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </motion.div>

              {/* Stats floating cards */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-8 left-4 glass px-4 py-3 rounded-xl border border-violet-500/20 flex items-center gap-3"
              >
                <TrendingUp className="w-5 h-5 text-violet-400" />
                <div>
                  <div className="text-xs text-slate-500">Active Places</div>
                  <div className="font-bold text-white text-sm">1,200+ Spots</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 }}
                className="absolute bottom-24 right-4 glass px-4 py-3 rounded-xl border border-orange-500/20 flex items-center gap-3"
              >
                <Activity className="w-5 h-5 text-orange-400" />
                <div>
                  <div className="text-xs text-slate-500">AI Powered</div>
                  <div className="font-bold text-white text-sm">Smart Routes</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600"
        >
          <span className="text-xs uppercase tracking-widest">Discover</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* City status */}
      <CityStatusPanel />

      {/* Feature sections */}
      <FeatureSection />
      <StatsSection />
      <HeritagePeek />

      {/* Footer CTA */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-violet-900/10 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Ready to{' '}
              <span className="gradient-text">Explore Smarter?</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Turn urban chaos into smart choices. NAGARVERSE puts a city's worth of intelligence at your fingertips.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/explore" className="btn-primary flex items-center gap-2 px-8 py-4 rounded-xl text-base">
                <Navigation className="w-5 h-5" /> Start Exploring
              </Link>
              <Link to="/digital-twin" className="btn-ghost flex items-center gap-2 px-8 py-4 rounded-xl text-base">
                <Globe2 className="w-5 h-5" /> City Digital Twin
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
