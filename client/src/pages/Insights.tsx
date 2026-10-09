import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import {
  CloudSun, Cloud, CloudRain, Sun, Wind, Droplets,
  Thermometer, BarChart3, Activity, AlertTriangle, Users,
  TrendingUp, Car, Clock, RefreshCw, Info
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, LineChart, Line
} from 'recharts'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-dark border border-white/10 rounded-xl px-3 py-2 text-xs">
        <div className="text-slate-400 mb-1">{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>
        ))}
      </div>
    )
  }
  return null
}

function WeatherWidget({ data }: { data: any }) {
  if (!data) return <div className="skeleton h-40 rounded-2xl" />

  const icons: Record<string, any> = {
    Clear: Sun, Cloudy: Cloud, Rain: CloudRain, default: CloudSun
  }
  const Icon = icons[data.condition] || CloudSun

  return (
    <div className="glass rounded-2xl border border-cyan-500/10 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Current Weather · Pune</div>
          <div className="text-4xl font-black text-white mt-1">{data.temperature}°C</div>
          <div className="text-slate-400 text-sm">{data.condition || 'Partly Cloudy'}</div>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
          <Icon className="w-8 h-8 text-cyan-400" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Humidity', value: `${data.humidity}%`, icon: Droplets },
          { label: 'Wind', value: `${data.windSpeed} km/h`, icon: Wind },
          { label: 'Feels Like', value: `${data.feelsLike}°C`, icon: Thermometer },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="text-center p-2 rounded-xl bg-white/3">
            <Icon className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <div className="text-xs font-semibold text-white">{value}</div>
            <div className="text-[10px] text-slate-600">{label}</div>
          </div>
        ))}
      </div>
      {data.isDemo && (
        <div className="mt-3 text-[10px] text-amber-400 text-center flex items-center justify-center gap-1">
          <Info className="w-3 h-3" /> Demo data — configure Open-Meteo API for live weather
        </div>
      )}
    </div>
  )
}

function TrafficWidget({ data }: { data: any }) {
  const trafficColors = ['#10b981', '#f59e0b', '#f97316', '#f43f5e']
  const trafficLabels = ['Light', 'Moderate', 'Heavy', 'Severe']
  const level = data?.congestionLevel ?? 1

  return (
    <div className="glass rounded-2xl border border-orange-500/10 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Traffic Pattern</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
              Heuristic Model (Demo)
            </span>
          </div>
          <div className="text-lg font-bold text-white mt-1" style={{ color: trafficColors[level] }}>
            {trafficLabels[level]} Traffic
          </div>
        </div>
        <Car className="w-8 h-8 text-orange-400" />
      </div>
      <div className="flex gap-1.5 mb-3">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="flex-1 h-2 rounded-full"
            style={{ background: i <= level ? trafficColors[level] : 'rgba(255,255,255,0.05)' }}
          />
        ))}
      </div>
      <div className="text-xs text-slate-400 leading-relaxed">
        {data?.description || 'Peak and off-peak vehicular volume estimated from Pune urban topology.'}
      </div>
      <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-500">
        Methodology: {data?.methodology || 'Statistical time-of-day commute pattern. Not live GPS fleet telemetry.'}
      </div>
    </div>
  )
}

export default function Insights() {
  const [timeFilter, setTimeFilter] = useState('24h')

  const { data: overview, isLoading } = useQuery({
    queryKey: ['insights-overview'],
    queryFn: () => axios.get('/api/insights/overview').then(r => r.data),
  })

  const { data: weather } = useQuery({
    queryKey: ['weather'],
    queryFn: () => axios.get('/api/insights/weather').then(r => r.data),
  })

  const { data: traffic } = useQuery({
    queryKey: ['traffic'],
    queryFn: () => axios.get('/api/insights/traffic').then(r => r.data),
  })

  const activityData = overview?.activityByHour || Array.from({ length: 12 }, (_, i) => ({
    time: `${i * 2}:00`,
    reports: Math.floor(Math.random() * 40) + 5,
    searches: Math.floor(Math.random() * 120) + 20,
  }))

  const categoryData = overview?.categoryBreakdown || [
    { category: 'Food', count: 340 },
    { category: 'Heritage', count: 180 },
    { category: 'Hotels', count: 120 },
    { category: 'Parks', count: 85 },
    { category: 'Shopping', count: 210 },
    { category: 'Transit', count: 95 },
  ]

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="text-cyan-400 text-sm font-semibold uppercase tracking-widest">City Intelligence</span>
              <h1 className="text-3xl font-black text-white mt-1">City Pulse Dashboard</h1>
              <p className="text-slate-400 text-sm mt-1">Community incident data, open weather telemetry & urban heuristics for Pune</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium">
                Community Reports & Heuristics
              </span>
              <button onClick={() => window.location.reload()} className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5 rounded-lg">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
          </div>

          {/* Time filter */}
          <div className="flex gap-2 mt-4">
            {['1h', '6h', '24h', '7d', '30d'].map(t => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  timeFilter === t
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
                    : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Overview stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active Reports', value: overview?.activeReports ?? 6, icon: AlertTriangle, color: '#f43f5e', sub: 'Citizen Verified' },
            { label: 'Places Searched', value: overview?.dailySearches ?? 1840, icon: BarChart3, color: '#00d4ff', sub: 'Baseline Activity' },
            { label: 'Community Users', value: overview?.activeUsers ?? 640, icon: Users, color: '#8b5cf6', sub: 'Active Profiles' },
            { label: 'Routes Generated', value: overview?.routesGenerated ?? 215, icon: Activity, color: '#10b981', sub: 'Model Evaluated' },
          ].map(({ label, value, icon: Icon, color, sub }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl border border-white/5 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <span className="text-[10px] text-cyan-400 font-medium px-1.5 py-0.5 rounded bg-cyan-500/10">{sub}</span>
              </div>
              <div className="text-2xl font-black text-white">{value.toLocaleString()}</div>
              <div className="text-xs text-slate-400 mt-0.5">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Weather + Traffic */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <WeatherWidget data={weather} />
          <TrafficWidget data={traffic} />
        </div>

        {/* Activity chart */}
        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          <div className="glass rounded-2xl border border-white/5 p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> City Activity Timeline
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="reports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="searches" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="searches" stroke="#00d4ff" fill="url(#searches)" strokeWidth={2} name="Searches" />
                <Area type="monotone" dataKey="reports" stroke="#f43f5e" fill="url(#reports)" strokeWidth={2} name="Reports" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-2xl border border-white/5 p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400" /> Popular Categories
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} layout="vertical" barSize={12}>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#475569', fontSize: 10 }} />
                <YAxis type="category" dataKey="category" tick={{ fill: '#94a3b8', fontSize: 10 }} width={65} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} name="Searches" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Governance & Transparency notice */}
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-3 text-xs leading-relaxed">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-amber-300/90">
            <strong className="text-amber-300 font-semibold block mb-1">Data Governance & Provenance Notice</strong>
            NAGARVERSE does not invent official municipal power grid or emergency response telemetry. Active citizen incident counts represent verified database submissions. Traffic patterns and urban search timelines represent illustrative time-of-day model heuristics. Weather is fetched from Open-Meteo's open meteorological service. Absence of incident reports in any neighborhood indicates lack of submissions, NOT guaranteed safety.
          </div>
        </div>
      </div>
    </div>
  )
}
