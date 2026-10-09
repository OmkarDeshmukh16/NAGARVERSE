import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, X, GitCompare, Loader2, Info, ChevronDown } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const PUNE_LOCATIONS = [
  'Koregaon Park', 'Kothrud', 'Aundh', 'Wakad', 'Baner', 'Viman Nagar',
  'Hadapsar', 'Shivajinagar', 'FC Road', 'Camp Area', 'Katraj', 'Sinhagad Road',
]

const metrics = [
  { key: 'safety', label: 'Lower Reported Risk' },
  { key: 'affordability', label: 'Affordability' },
  { key: 'accessibility', label: 'Accessibility' },
  { key: 'publicTransport', label: 'Public Transport' },
  { key: 'greenSpaces', label: 'Green Spaces' },
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'nightLife', label: 'Nightlife / Amenities' },
]

const COLORS = ['#00d4ff', '#8b5cf6', '#f97316', '#10b981']

export default function Compare() {
  const [locations, setLocations] = useState<string[]>(['Koregaon Park', 'Kothrud'])
  const [comparison, setComparison] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [weights, setWeights] = useState<Record<string, number>>(
    Object.fromEntries(metrics.map(m => [m.key, 1]))
  )

  const addLocation = () => {
    if (locations.length >= 4) { toast.error('Max 4 locations'); return }
    setLocations(prev => [...prev, PUNE_LOCATIONS[prev.length]])
  }

  const removeLocation = (i: number) => {
    if (locations.length <= 2) { toast.error('Min 2 locations'); return }
    setLocations(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleCompare = async () => {
    setLoading(true)
    try {
      const res = await axios.post('/api/ai/compare', { locations, weights })
      setComparison(res.data.comparison)
    } catch {
      toast.error('Could not generate comparison. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const radarData = comparison ? metrics.map(m => {
    const entry: any = { metric: m.label }
    comparison.results?.forEach((r: any, i: number) => {
      entry[r.location] = r.scores?.[m.key] ?? 0
    })
    return entry
  }) : []

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <span className="text-cyan-400 text-sm font-semibold uppercase tracking-widest">Neighborhood Intelligence</span>
          <h1 className="text-3xl font-black text-white mt-1">Best vs. Worst Comparison</h1>
          <p className="text-slate-500 text-sm mt-1">Compare neighborhoods on transparent, multi-factor metrics</p>
        </motion.div>

        {/* Setup */}
        <div className="glass rounded-2xl border border-white/10 p-6 mb-6 space-y-5">
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm">Locations to Compare</h3>
            <div className="flex flex-wrap gap-2 items-center">
              {locations.map((loc, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                  <select
                    value={loc}
                    onChange={e => setLocations(prev => prev.map((l, idx) => idx === i ? e.target.value : l))}
                    className="bg-transparent text-white text-sm outline-none"
                  >
                    {PUNE_LOCATIONS.map(l => <option key={l} value={l} className="bg-[#060d1f]">{l}</option>)}
                  </select>
                  {i >= 2 && (
                    <button onClick={() => removeLocation(i)} className="text-slate-600 hover:text-slate-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {locations.length < 4 && (
                <button onClick={addLocation} className="btn-ghost text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-xl">
                  <Plus className="w-3.5 h-3.5" /> Add Location
                </button>
              )}
            </div>
          </div>

          {/* Weight sliders */}
          <details className="group">
            <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-200 flex items-center gap-2 select-none">
              <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
              Customize Metric Weights
            </summary>
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              {metrics.map(m => (
                <div key={m.key}>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{m.label}</span>
                    <span className="text-cyan-400">{weights[m.key]}×</span>
                  </div>
                  <input
                    type="range" min={0} max={3} step={0.5} value={weights[m.key]}
                    onChange={e => setWeights(prev => ({ ...prev, [m.key]: +e.target.value }))}
                    className="w-full h-1.5 rounded-full appearance-none accent-cyan-500 bg-white/10"
                  />
                </div>
              ))}
            </div>
          </details>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleCompare}
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCompare className="w-4 h-4" />}
            {loading ? 'Comparing...' : 'Compare Now'}
          </motion.button>
        </div>

        {/* Results */}
        {comparison && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Radar chart */}
            <div className="glass rounded-2xl border border-white/5 p-5">
              <h3 className="font-semibold text-white mb-4 text-sm">Multi-Factor Radar Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#475569', fontSize: 8 }} />
                  {comparison.results?.map((r: any, i: number) => (
                    <Radar key={r.location} name={r.location} dataKey={r.location}
                      stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.1} strokeWidth={2} />
                  ))}
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                    <div className="glass-dark border border-white/10 rounded-xl px-3 py-2 text-xs">
                      <div className="text-slate-400 mb-1">{label}</div>
                      {payload.map((p: any) => <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}/10</div>)}
                    </div>
                  ) : null} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Score cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {comparison.results?.map((r: any, i: number) => (
                <motion.div
                  key={r.location}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-2xl border border-white/5 p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="font-semibold text-white text-sm">{r.location}</span>
                  </div>
                  <div className="space-y-2">
                    {metrics.map(m => (
                      <div key={m.key}>
                        <div className="flex justify-between text-xs text-slate-600 mb-0.5">
                          <span>{m.label}</span>
                          <span style={{ color: COLORS[i] }}>
                            {r.scores?.[m.key] != null ? `${r.scores[m.key]}/10` : 'N/A'}
                          </span>
                        </div>
                        <div className="h-1 rounded-full bg-white/5">
                          {r.scores?.[m.key] != null && (
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${(r.scores[m.key] / 10) * 100}%`, background: COLORS[i] }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {r.summary && (
                    <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">{r.summary}</p>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Transparency note */}
            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/15 flex items-start gap-3 text-xs text-blue-400">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                Scores are derived from community reports, OSM data, and AI analysis. Missing data is shown as "N/A" — not as a zero score.
                Labels like "lower reported risk" describe relative data, not absolute safety guarantees.
                {comparison.isDemo && <span className="text-amber-400 ml-1">[Demo data]</span>}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
