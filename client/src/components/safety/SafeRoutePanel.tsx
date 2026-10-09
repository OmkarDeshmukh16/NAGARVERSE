import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Navigation, MapPin, Info, Loader2, Shield, AlertTriangle,
  Lightbulb, Eye, ChevronDown, ChevronUp, CheckCircle, Scale
} from 'lucide-react'
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
  const [showMethodology, setShowMethodology] = useState(false)
  const [expandedEvidence, setExpandedEvidence] = useState<number | null>(0)

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
        setExpandedEvidence(0)
        onSelectRoute?.(fetchedRoutes[0])
      }
    } catch {
      toast.error('Could not calculate routes. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const riskLabel = (score: number) => {
    if (score <= 2.2) return { text: 'Lower reported risk', color: '#10b981' }
    if (score <= 4.0) return { text: 'Moderate reported risk', color: '#f59e0b' }
    return { text: 'Higher reported risk', color: '#f43f5e' }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Prominent Disclaimer */}
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 font-semibold text-amber-200">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Advisory Safety Notice</span>
        </div>
        <p className="text-[11px] leading-relaxed text-amber-300/90">
          Routes are advisory recommendations derived from citizen hazard reports and road hierarchy. <strong>Absence of reports does not indicate absence of risk.</strong> Always exercise judgment.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleGetRoutes} className="space-y-3">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Starting Point</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
            <input
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              placeholder="e.g. Shivajinagar or FC Road"
              className="input-city pl-9 text-sm py-2"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Destination</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
            <input
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="e.g. Kothrud or Swargate"
              className="input-city pl-9 text-sm py-2"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !origin.trim() || !destination.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
          {loading ? 'Evaluating Corridors...' : 'Compare Safe Routes'}
        </button>
      </form>

      {/* Toggle Methodology Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowMethodology(!showMethodology)}
          className="w-full flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-all"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            Scoring Formula & Methodology
          </span>
          {showMethodology ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {showMethodology && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-2 p-3 rounded-xl bg-[#030712] border border-cyan-500/20 text-[11px] text-slate-300 space-y-2"
            >
              <div className="font-semibold text-cyan-300">Deterministic Multi-Factor Scoring Model (v1.2)</div>
              <div className="font-mono text-[10px] bg-white/5 p-2 rounded text-emerald-300 leading-relaxed">
                RiskScore = clamp(BaseRoadRisk + IncidentPenalty + LightingPenalty - PassiveSurveillanceBonus, 1.0, 9.9)
              </div>
              <div className="space-y-1 text-slate-400">
                <p>• <strong>Base Road Risk:</strong> Arterial Main Road (1.2) vs Transit Corridor (1.5) vs Inner Back-Alley (3.8).</p>
                <p>• <strong>Incident Penalty:</strong> Verified reports (weight 1.0) vs unverified (weight 0.5), decaying linearly over 60 days to a 0.2 floor.</p>
                <p>• <strong>Street Lighting:</strong> Active reported dark spots (+0.9) with 1.8x multiplier during nighttime (19:00–06:00).</p>
                <p>• <strong>Passive Surveillance:</strong> Dedicated transit & commercial high-street corridors apply up to -0.8 risk offset.</p>
                <p>• <strong>Missing Data Handling:</strong> Zero reports does not lower risk below road baseline. Unmonitored sectors receive a low confidence rating.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Routes Comparison List */}
      {routes.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Evaluated Routes ({routes.length})
            </h3>
            <span className="text-[11px] text-slate-500">Tap to view evidence</span>
          </div>

          {/* Quick Comparison Bar */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/5 text-[10px] text-center font-medium">
            {routes.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSelectedRouteIndex(i)
                  setExpandedEvidence(i)
                  onSelectRoute?.(r)
                }}
                className={`py-1.5 px-1 rounded-lg transition-all ${
                  selectedRouteIndex === i
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div>Route {i + 1}</div>
                <div className="font-bold text-white text-[11px]">{r.riskScore} Risk</div>
              </button>
            ))}
          </div>

          {/* Detailed Route Cards */}
          {routes.map((route, i) => {
            const risk = riskLabel(route.riskScore || 0)
            const isSelected = selectedRouteIndex === i
            const isEvidenceOpen = expandedEvidence === i

            return (
              <motion.div
                key={route.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-xl border transition-all ${
                  isSelected
                    ? 'border-emerald-500/40 bg-emerald-500/5 shadow-lg shadow-emerald-500/5'
                    : 'border-white/5 hover:border-white/10 bg-white/2'
                }`}
              >
                <div
                  onClick={() => {
                    setSelectedRouteIndex(i)
                    onSelectRoute?.(route)
                  }}
                  className="p-3 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {i === 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                          RECOMMENDED
                        </span>
                      )}
                      <span className="text-xs font-bold text-white">{route.name}</span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: risk.color, background: `${risk.color}15` }}>
                      {risk.text} ({route.riskScore})
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-xs text-center py-2 px-1 rounded-lg bg-white/3 mb-2">
                    <div>
                      <div className="font-semibold text-white">{route.distance || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500">Distance</div>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{route.duration || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500">Time</div>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{route.incidents ?? 0}</div>
                      <div className="text-[10px] text-slate-500">Reports</div>
                    </div>
                    <div>
                      <div className="font-semibold text-cyan-400">{route.confidencePercentage ?? 75}%</div>
                      <div className="text-[10px] text-slate-500">Confidence</div>
                    </div>
                  </div>

                  {route.reason && (
                    <p className="text-xs text-slate-300 leading-relaxed mb-2">{route.reason}</p>
                  )}

                  <div className="flex flex-wrap gap-1 mb-2">
                    {route.features?.map((f: string, fi: number) => (
                      <span key={fi} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5">
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* Toggle Evidence Dropdown */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpandedEvidence(isEvidenceOpen ? null : i)
                    }}
                    className="w-full flex items-center justify-between text-[11px] text-cyan-400 hover:text-cyan-300 pt-1.5 border-t border-white/5"
                  >
                    <span className="flex items-center gap-1 font-medium">
                      <Shield className="w-3 h-3" />
                      {isEvidenceOpen ? 'Hide Evidence & Factors' : 'View Evidence & Factor Breakdown'}
                    </span>
                    {isEvidenceOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Evidence & Limitations Details */}
                <AnimatePresence>
                  {isEvidenceOpen && route.evidence && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-3 pb-3 pt-1 border-t border-white/5 text-[11px] space-y-2 bg-black/20"
                    >
                      <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
                        <div className="p-2 rounded bg-white/3">
                          <span className="text-slate-500 block text-[10px]">ROAD CLASSIFICATION</span>
                          <span className="font-semibold text-white capitalize">{route.evidence.roadType?.replace('_', ' ')}</span>
                          <span className="text-slate-400 block text-[10px]">Base Risk: {route.evidence.baseRoadRisk}</span>
                        </div>
                        <div className="p-2 rounded bg-white/3">
                          <span className="text-slate-500 block text-[10px]">CORRIDOR REPORTS</span>
                          <span className="font-semibold text-white">{route.evidence.totalIncidents} Total</span>
                          <span className="text-slate-400 block text-[10px]">{route.evidence.verifiedIncidents} verified · {route.evidence.unverifiedIncidents} unverified</span>
                        </div>
                        <div className="p-2 rounded bg-white/3">
                          <span className="text-slate-500 block text-[10px]">LIGHTING FACTOR</span>
                          <span className="font-semibold text-white">{route.evidence.lightingIncidentsCount} dark spot reports</span>
                          <span className="text-slate-400 block text-[10px]">Penalty: +{route.evidence.lightingPenalty} {route.evidence.isNightTime ? '(Night Multiplier)' : ''}</span>
                        </div>
                        <div className="p-2 rounded bg-white/3">
                          <span className="text-slate-500 block text-[10px]">DATA CONFIDENCE</span>
                          <span className="font-semibold text-cyan-300">{route.confidenceLevel}</span>
                          <span className="text-slate-400 block text-[10px]">{route.confidencePercentage}% Coverage Index</span>
                        </div>
                      </div>

                      {route.evidence.missingDataNotes && (
                        <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300/90 leading-relaxed">
                          <strong>Missing Data & Limitations:</strong> {route.evidence.missingDataNotes}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
