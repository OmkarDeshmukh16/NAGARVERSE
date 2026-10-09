import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import {
  Shield, AlertTriangle, Clock, Filter, MapPin, CheckCircle,
  XCircle, AlertCircle, Phone, Navigation, ChevronDown, Plus, Info
} from 'lucide-react'
import SafeRoutePanel from '../components/safety/SafeRoutePanel'
import ReportIncident from '../components/safety/ReportIncident'
import { getDefaultMapStyle } from '../utils/mapStyles'

const severities = ['all', 'low', 'medium', 'high', 'critical']
const incidentCategories = [
  { id: 'all', label: 'All' },
  { id: 'road_hazard', label: 'Road Hazard' },
  { id: 'poor_lighting', label: 'Poor Lighting' },
  { id: 'flooding', label: 'Flooding' },
  { id: 'traffic', label: 'Traffic' },
  { id: 'harassment', label: 'Harassment' },
  { id: 'crime', label: 'Crime' },
]

const severityColors: Record<string, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#f43f5e',
}

const emergencyContacts = [
  { label: 'Police', number: '100', color: '#3b82f6' },
  { label: 'Ambulance', number: '108', color: '#f43f5e' },
  { label: 'Fire Brigade', number: '101', color: '#f97316' },
  { label: 'Women Helpline', number: '1091', color: '#8b5cf6' },
  { label: 'Pune Traffic', number: '020-26052300', color: '#00d4ff' },
]

export default function Safety() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [severity, setSeverity] = useState('all')
  const [category, setCategory] = useState('all')
  const [activeTab, setActiveTab] = useState<'map' | 'routes' | 'report'>('map')
  const [selectedIncident, setSelectedIncident] = useState<any>(null)

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getDefaultMapStyle(),
      center: [73.8567, 18.5204],
      zoom: 12,
    })
    map.addControl(new maplibregl.NavigationControl())
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // Fetch incidents
  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents', severity, category],
    queryFn: async () => {
      const res = await axios.get('/api/safety/incidents', {
        params: {
          severity: severity === 'all' ? undefined : severity,
          category: category === 'all' ? undefined : category,
        },
      })
      return res.data.incidents || []
    },
  })

  // Add markers to map
  useEffect(() => {
    if (!mapRef.current) return
    incidents.forEach((inc: any) => {
      if (!inc.location?.coordinates) return
      const [lng, lat] = inc.location.coordinates
      const color = severityColors[inc.severity] || '#94a3b8'
      const el = document.createElement('div')
      el.style.cssText = `
        width:28px;height:28px;border-radius:50%;
        background:${color}33;border:2px solid ${color};
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;box-shadow:0 0 10px ${color}44;
      `
      el.innerHTML = `<div style="width:8px;height:8px;border-radius:50%;background:${color}"></div>`
      el.addEventListener('click', () => setSelectedIncident(inc))
      new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(mapRef.current!)
    })
  }, [incidents])

  return (
    <div className="flex flex-col h-screen pt-16">
      {/* Header */}
      <div className="flex-shrink-0 glass-dark border-b border-white/5 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-rose-400" />
              <h1 className="font-bold text-white">Safety Intelligence Center</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Community Sourced
              </span>
            </div>
            <div className="flex gap-2">
              {(['map', 'routes', 'report'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    activeTab === tab
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                      : 'text-slate-500 hover:text-slate-300 border border-transparent'
                  }`}
                >
                  {tab === 'routes' ? 'Safe Routes' : tab}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'map' && (
            <div className="flex flex-wrap gap-2">
              <div className="flex gap-1">
                {severities.map(s => (
                  <button
                    key={s}
                    onClick={() => setSeverity(s)}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium capitalize transition-all ${
                      severity === s ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-slate-400'
                    }`}
                    style={severity === s && s !== 'all' ? { color: severityColors[s] } : {}}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 overflow-x-auto">
                {incidentCategories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`flex-shrink-0 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                      category === c.id ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left panel */}
        <div className="w-full lg:w-[360px] flex-shrink-0 overflow-y-auto border-r border-white/5 bg-[#060d1f]/80">
          {activeTab === 'map' && (
            <div className="p-3 space-y-2">
              {/* Notice */}
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-amber-400 flex gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  Data sourced from community reports. "Lower reported risk" does not guarantee safety. Always exercise judgment.
                </div>
              </div>

              {/* Incidents */}
              {incidents.length === 0 ? (
                <div className="py-8 text-center text-slate-600">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No incidents match your filters</p>
                </div>
              ) : incidents.map((inc: any) => (
                <motion.div
                  key={inc._id}
                  whileHover={{ x: 2 }}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all ${
                    selectedIncident?._id === inc._id
                      ? 'border-rose-500/30 bg-rose-500/5'
                      : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: severityColors[inc.severity] || '#94a3b8' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white capitalize">{inc.category?.replace('_', ' ')}</span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-medium capitalize"
                          style={{
                            background: `${severityColors[inc.severity] || '#94a3b8'}20`,
                            color: severityColors[inc.severity] || '#94a3b8',
                          }}
                        >
                          {inc.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{inc.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-700 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" /> {new Date(inc.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`text-[10px] ${
                          inc.verificationStatus === 'verified' ? 'text-emerald-500'
                          : inc.verificationStatus === 'under_review' ? 'text-amber-500'
                          : 'text-slate-600'
                        }`}>
                          {inc.verificationStatus?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Emergency contacts */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Emergency Contacts (Pune)</h3>
                <div className="space-y-1.5">
                  {emergencyContacts.map(c => (
                    <div key={c.label} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/3">
                      <span className="text-xs text-slate-400">{c.label}</span>
                      <a href={`tel:${c.number}`} className="text-xs font-mono font-bold" style={{ color: c.color }}>
                        {c.number}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'routes' && <SafeRoutePanel map={mapRef.current} />}
          {activeTab === 'report' && <ReportIncident />}
        </div>

        {/* Map */}
        {activeTab === 'map' && (
          <div className="flex-1 relative">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Legend */}
            <div className="absolute bottom-4 left-4 glass rounded-xl p-3 text-xs">
              <div className="font-semibold text-slate-400 mb-2">Incident Severity</div>
              {Object.entries(severityColors).map(([sev, color]) => (
                <div key={sev} className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  <span className="text-slate-500 capitalize">{sev}</span>
                </div>
              ))}
            </div>

            {/* Incident detail */}
            {selectedIncident && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 right-4 w-72 glass-dark rounded-2xl border border-rose-500/20 p-4"
              >
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="absolute top-3 right-3 w-6 h-6 rounded-md bg-white/5 flex items-center justify-center"
                >
                  <span className="text-slate-400 text-sm">×</span>
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span className="font-semibold text-white text-sm capitalize">
                    {selectedIncident.category?.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">{selectedIncident.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{new Date(selectedIncident.createdAt).toLocaleString()}</span>
                  <span className={`px-2 py-0.5 rounded font-medium capitalize ${
                    selectedIncident.verificationStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {selectedIncident.verificationStatus?.replace('_', ' ')}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
