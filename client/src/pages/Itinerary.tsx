import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Route, MapPin, Clock, DollarSign, Users, Plus, Minus, Wand2, Save, Share2, Loader2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

const modes = ['Walking', 'Cycling', 'Auto', 'Bus', 'Car']
const interests = ['Heritage', 'Food', 'Nature', 'Shopping', 'Culture', 'Adventure', 'Relaxation']
const groupTypes = ['Solo', 'Couple', 'Family', 'Friends', 'Senior']

export default function Itinerary() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    startLocation: 'Shivajinagar, Pune',
    duration: '6',
    budget: 'moderate',
    interests: ['Heritage', 'Food'],
    travelMode: 'Walking',
    groupType: 'Solo',
    accessibilityNeeds: false,
    safetyPreference: 'moderate',
  })
  const [itinerary, setItinerary] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const toggleInterest = (interest: string) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleGenerate = async () => {
    if (!form.startLocation || !form.duration) { toast.error('Please fill in all required fields'); return }
    setLoading(true)
    try {
      const res = await axios.post('/api/ai/itinerary', form)
      setItinerary(res.data.itinerary)
    } catch {
      toast.error('Could not generate itinerary. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) { toast.error('Login to save itineraries'); return }
    if (!itinerary) return
    try {
      await axios.post('/api/itineraries', { ...itinerary, form })
      toast.success('Itinerary saved!')
    } catch { toast.error('Could not save') }
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <span className="text-violet-400 text-sm font-semibold uppercase tracking-widest">AI-Powered</span>
          <h1 className="text-3xl font-black text-white mt-1">Smart Itinerary Builder</h1>
          <p className="text-slate-500 text-sm mt-1">Tell Navi what you want — get a personalized city plan in seconds</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass rounded-2xl border border-violet-500/15 p-5 space-y-4">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-violet-400" /> Trip Details
              </h3>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Starting Location</label>
                <input
                  value={form.startLocation}
                  onChange={e => setForm(f => ({ ...f, startLocation: e.target.value }))}
                  placeholder="e.g. Shivajinagar, Pune"
                  className="input-city text-sm py-2"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Available Time (hours)</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setForm(f => ({ ...f, duration: String(Math.max(1, +f.duration - 1)) }))}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
                    <Minus className="w-4 h-4 text-slate-400" />
                  </button>
                  <span className="text-xl font-bold text-white w-8 text-center">{form.duration}</span>
                  <button onClick={() => setForm(f => ({ ...f, duration: String(Math.min(12, +f.duration + 1)) }))}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-slate-400" />
                  </button>
                  <span className="text-sm text-slate-600">hours</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Budget</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['budget', 'moderate', 'premium'].map(b => (
                    <button key={b} onClick={() => setForm(f => ({ ...f, budget: b }))}
                      className={`py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                        form.budget === b ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-white/5 text-slate-500 border border-transparent hover:border-white/10'
                      }`}>
                      {b === 'budget' ? '₹ Budget' : b === 'moderate' ? '₹₹ Moderate' : '₹₹₹ Premium'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-2 block">Interests</label>
                <div className="flex flex-wrap gap-1.5">
                  {interests.map(i => (
                    <button key={i} onClick={() => toggleInterest(i)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        form.interests.includes(i) ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-white/5 text-slate-500 border border-white/5 hover:border-white/15'
                      }`}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Travel Mode</label>
                <div className="flex flex-wrap gap-1.5">
                  {modes.map(m => (
                    <button key={m} onClick={() => setForm(f => ({ ...f, travelMode: m }))}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                        form.travelMode === m ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-slate-500 border border-white/5'
                      }`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Group Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {groupTypes.map(g => (
                    <button key={g} onClick={() => setForm(f => ({ ...f, groupType: g }))}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                        form.groupType === g ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-white/5 text-slate-500 border border-white/5'
                      }`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.accessibilityNeeds}
                  onChange={e => setForm(f => ({ ...f, accessibilityNeeds: e.target.checked }))}
                  className="accent-violet-500 w-4 h-4" />
                <span className="text-xs text-slate-400">Accessibility needs</span>
              </label>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleGenerate}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                {loading ? 'Generating...' : 'Generate Itinerary'}
              </motion.button>
            </div>
          </div>

          {/* Itinerary output */}
          <div className="lg:col-span-3">
            {!itinerary ? (
              <div className="glass rounded-2xl border border-white/5 p-12 text-center h-full flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                  <Route className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="font-bold text-white">Your City Plan Awaits</h3>
                <p className="text-slate-500 text-sm max-w-xs">
                  Fill in your preferences and click Generate Itinerary. Navi will create a personalized Pune day plan for you.
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Summary */}
                <div className="glass rounded-2xl border border-violet-500/20 p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-bold text-white text-lg">{itinerary.title || 'Your Pune Adventure'}</h3>
                      <p className="text-slate-500 text-sm">{itinerary.summary}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSave} className="btn-ghost px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5">
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                      <button className="btn-ghost px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: 'Duration', value: `${form.duration}h`, icon: Clock },
                      { label: 'Stops', value: itinerary.stops?.length || 0, icon: MapPin },
                      { label: 'Budget', value: form.budget, icon: DollarSign },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="p-2 rounded-xl bg-white/3">
                        <Icon className="w-4 h-4 text-violet-400 mx-auto mb-1" />
                        <div className="text-sm font-bold text-white">{value}</div>
                        <div className="text-[10px] text-slate-600">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stops timeline */}
                {itinerary.stops?.map((stop: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-300">
                        {i + 1}
                      </div>
                      {i < itinerary.stops.length - 1 && (
                        <div className="w-0.5 flex-1 bg-violet-500/10 mt-1" />
                      )}
                    </div>
                    <div className="glass rounded-xl border border-white/5 p-4 flex-1 mb-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-white">{stop.name}</h4>
                        <span className="text-xs text-violet-400">{stop.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{stop.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="text-slate-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {stop.duration}
                        </span>
                        {stop.estimatedCost && (
                          <span className="text-emerald-400">~{stop.estimatedCost}</span>
                        )}
                        {stop.travelTime && (
                          <span className="text-cyan-400">→ {stop.travelTime} to next</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {itinerary.notes && (
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-amber-400">
                    <strong>Note:</strong> {itinerary.notes}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
