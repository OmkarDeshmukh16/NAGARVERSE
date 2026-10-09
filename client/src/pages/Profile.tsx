import React from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { User, Heart, Route, AlertTriangle, Settings, LogOut, MapPin, Bookmark, Clock } from 'lucide-react'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const { data: savedPlaces = [] } = useQuery({
    queryKey: ['saved-places'],
    queryFn: () => axios.get('/api/places/saved').then(r => r.data.places || []),
    enabled: !!user,
  })

  const { data: itineraries = [] } = useQuery({
    queryKey: ['my-itineraries'],
    queryFn: () => axios.get('/api/itineraries').then(r => r.data.itineraries || []),
    enabled: !!user,
  })

  const { data: reports = [] } = useQuery({
    queryKey: ['my-reports'],
    queryFn: () => axios.get('/api/reports?mine=true').then(r => r.data.reports || []),
    enabled: !!user,
  })

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-slate-600" />
          <h2 className="text-xl font-bold text-white mb-2">Not signed in</h2>
          <p className="text-slate-500 mb-4">Please login to view your profile</p>
          <Link to="/login" className="btn-primary px-6 py-2.5 rounded-xl text-sm">Sign In</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl border border-white/10 p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-3xl font-black text-white">
            {user.name[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white">{user.name}</h1>
            <p className="text-slate-500 text-sm">{user.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { label: `${savedPlaces.length} Saved`, icon: Heart, color: '#f43f5e' },
                { label: `${itineraries.length} Itineraries`, icon: Route, color: '#8b5cf6' },
                { label: `${reports.length} Reports`, icon: AlertTriangle, color: '#f97316' },
              ].map(({ label, icon: Icon, color }) => (
                <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-xs text-slate-400">
                  <Icon className="w-3 h-3" style={{ color }} /> {label}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/') }}
            className="btn-ghost flex items-center gap-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl px-4 py-2"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </motion.div>

        {/* Tabs content */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Saved places */}
          <div className="glass rounded-2xl border border-white/5 p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" /> Saved Places
            </h3>
            {savedPlaces.length === 0 ? (
              <div className="py-6 text-center text-slate-600 text-sm">
                <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No saved places yet
              </div>
            ) : (
              <div className="space-y-2">
                {savedPlaces.slice(0, 5).map((p: any) => (
                  <div key={p._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/3">
                    <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{p.name || p.place?.name}</div>
                      <div className="text-xs text-slate-600 capitalize">{p.category || p.place?.category}</div>
                    </div>
                  </div>
                ))}
                {savedPlaces.length > 5 && (
                  <p className="text-xs text-slate-600 text-center pt-1">+{savedPlaces.length - 5} more</p>
                )}
              </div>
            )}
          </div>

          {/* My itineraries */}
          <div className="glass rounded-2xl border border-white/5 p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Route className="w-4 h-4 text-violet-400" /> My Itineraries
            </h3>
            {itineraries.length === 0 ? (
              <div className="py-6 text-center text-slate-600 text-sm">
                <Route className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No itineraries saved yet
                <br />
                <Link to="/itinerary" className="text-violet-400 hover:underline mt-2 inline-block text-xs">
                  Create one →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {itineraries.slice(0, 4).map((it: any) => (
                  <div key={it._id} className="p-3 rounded-xl bg-white/3 border border-white/5">
                    <div className="font-medium text-white text-sm">{it.title || 'Pune Day Trip'}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(it.createdAt).toLocaleDateString()}
                      <span>· {it.stops?.length || 0} stops</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My reports */}
          <div className="glass rounded-2xl border border-white/5 p-5 lg:col-span-2">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" /> My Reports
            </h3>
            {reports.length === 0 ? (
              <div className="py-6 text-center text-slate-600 text-sm">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No reports submitted yet
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {reports.map((r: any) => (
                  <div key={r._id} className="p-3 rounded-xl bg-white/3 border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white capitalize">{r.category?.replace('_', ' ')}</span>
                      <span className={`text-xs px-2 py-0.5 rounded capitalize ${
                        r.status === 'verified' ? 'text-emerald-400 bg-emerald-400/10'
                        : r.status === 'resolved' ? 'text-violet-400 bg-violet-400/10'
                        : 'text-amber-400 bg-amber-400/10'
                      }`}>{r.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{r.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
