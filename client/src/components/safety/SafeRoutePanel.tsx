import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Navigation, MapPin, Info, Loader2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Props {
  onSelectRoute?: (route: any) => void
}

export default function SafeRoutePanel({ onSelectRoute }: Props) {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [loading, setLoading] = useState(false)
  const [routes, setRoutes] = useState<any[]>([])
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0)

  const handleGetRoutes = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!origin.trim() || !destination.trim()) return
    setLoading(true)
    try {
      const res = await axios.post('/api/safety/routes', { origin, destination })
      const fetchedRoutes = res.data.routes || []
      setRoutes(fetchedRoutes)
      if (fetchedRoutes.length > 0) {
        setSelectedRouteIndex(0)
        onSelectRoute?.(fetchedRoutes[0])
      }
    } catch {
      toast.error('Could not fetch routes. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const riskLabel = (score: number) => {
    if (score <= 2) return { text: 'Lower reported risk', color: '#10b981' }
    if (score <= 5) return { text: 'Moderate reported risk', color: '#f59e0b' }
    return { text: 'Higher reported risk', color: '#f43f5e' }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 text-xs text-blue-400 flex gap-2">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        Routes are ranked using community incident reports, estimated lighting, and road conditions. Not a guarantee of safety.
      </div>

      <form onSubmit={handleGetRoutes} className="space-y-3">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Starting Point</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
            <input
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              placeholder="e.g. Shivajinagar"
              className="input-city pl-9 text-sm py-2"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Destination</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
            <input
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="e.g. Kothrud"
              className="input-city pl-9 text-sm py-2"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
          {loading ? 'Finding Routes...' : 'Find Safer Routes'}
        </button>
      </form>

      {routes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Route Options</h3>
          {routes.map((route, i) => {
            const risk = riskLabel(route.riskScore || 0)
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => {
                  setSelectedRouteIndex(i)
                  onSelectRoute?.(route)
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedRouteIndex === i
                    ? 'border-emerald-500/40 bg-emerald-500/10 shadow-lg shadow-emerald-500/5'
                    : 'border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {i === 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                        RECOMMENDED
                      </span>
                    )}
                    <span className="text-xs font-semibold text-white">Route {i + 1}</span>
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: risk.color }}>
                    {risk.text}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-center">
                  <div>
                    <div className="font-semibold text-white">{route.distance || 'N/A'}</div>
                    <div className="text-slate-600">Distance</div>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{route.duration || 'N/A'}</div>
                    <div className="text-slate-600">Duration</div>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{route.incidents ?? 0}</div>
                    <div className="text-slate-600">Reports</div>
                  </div>
                </div>
                {route.reason && (
                  <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">{route.reason}</p>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
