import React from 'react'
import { motion } from 'framer-motion'
import { Map, Shield, Brain, BarChart3, Users, Globe2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: Map,
    color: '#00d4ff',
    gradient: 'from-cyan-500/10 to-cyan-500/0',
    border: 'border-cyan-500/20',
    title: 'Smart City Exploration',
    desc: 'Discover restaurants, landmarks, parks and hidden gems with AI-powered search and real location data from OpenStreetMap.',
    href: '/explore',
    label: 'Explore Now',
  },
  {
    icon: Shield,
    color: '#f43f5e',
    gradient: 'from-rose-500/10 to-rose-500/0',
    border: 'border-rose-500/20',
    title: 'Safety Intelligence',
    desc: 'View community safety reports, compare safer routes, and get real-time incident overlays for any neighborhood.',
    href: '/safety',
    label: 'View Safety Map',
  },
  {
    icon: Brain,
    color: '#8b5cf6',
    gradient: 'from-violet-500/10 to-violet-500/0',
    border: 'border-violet-500/20',
    title: 'AI City Concierge — Navi',
    desc: 'Ask anything in natural language. Navi plans itineraries, compares neighborhoods, and answers city questions.',
    href: '#',
    label: 'Ask Navi',
    isNavi: true,
  },
  {
    icon: BarChart3,
    color: '#10b981',
    gradient: 'from-emerald-500/10 to-emerald-500/0',
    border: 'border-emerald-500/20',
    title: 'City Pulse Dashboard',
    desc: 'Live weather, traffic conditions, civic activity, and city exploration trends with animated data visualizations.',
    href: '/insights',
    label: 'View Insights',
  },
  {
    icon: Users,
    color: '#f97316',
    gradient: 'from-orange-500/10 to-orange-500/0',
    border: 'border-orange-500/20',
    title: 'Citizen Reporting',
    desc: 'Report road hazards, flooding, and civic issues with photos and voice notes. Help the city improve.',
    href: '/community',
    label: 'Join Community',
  },
  {
    icon: Globe2,
    color: '#fbbf24',
    gradient: 'from-amber-500/10 to-amber-500/0',
    border: 'border-amber-500/20',
    title: 'City Digital Twin',
    desc: 'Interact with an immersive 3D city model — toggle layers, inspect landmarks, and visualize data spatially.',
    href: '/digital-twin',
    label: 'Enter Twin',
  },
]

export default function FeatureSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-cyan-400 text-sm font-semibold uppercase tracking-widest">Platform Features</span>
          <h2 className="text-4xl sm:text-5xl font-black mt-2 mb-4">
            One Platform.{' '}
            <span className="gradient-text">All Intelligence.</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            NAGARVERSE combines real-time data, AI, and 3D visualizations to help you understand, navigate, and improve your city.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, color, gradient, border, title, desc, href, label, isNavi }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className={`card-hover glass rounded-2xl p-6 border ${border} bg-gradient-to-br ${gradient} h-full flex flex-col gap-4`}>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
                {isNavi ? (
                  <button
                    onClick={() => (window as any).__navi_open?.()}
                    className="btn-ghost text-sm w-fit flex items-center gap-2"
                    style={{ color }}
                  >
                    {label} →
                  </button>
                ) : (
                  <Link to={href} className="btn-ghost text-sm w-fit flex items-center gap-2" style={{ color }}>
                    {label} →
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
