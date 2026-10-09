import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Wifi, Cloud, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react'

const sources = [
  { label: 'Places API', status: 'live', detail: 'OpenStreetMap' },
  { label: 'Weather', status: 'live', detail: 'Open-Meteo' },
  { label: 'AI Concierge', status: 'live', detail: 'Gemini API' },
  { label: 'Safety Reports', status: 'community', detail: 'Community' },
]

export default function CityStatusPanel() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass border border-cyan-500/10 rounded-2xl p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* City header */}
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold text-slate-300">City Status — Pune, MH</span>
              <span className="text-xs text-slate-600 hidden sm:block">
                {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            {/* Source indicators */}
            <div className="flex flex-wrap items-center gap-3">
              {sources.map(s => (
                <div key={s.label} className="flex items-center gap-1.5 text-xs">
                  {s.status === 'live' ? (
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                  )}
                  <span className="text-slate-400">{s.label}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-600">{s.detail}</span>
                </div>
              ))}
            </div>

            {/* Data freshness */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              Last synced: Just now
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
