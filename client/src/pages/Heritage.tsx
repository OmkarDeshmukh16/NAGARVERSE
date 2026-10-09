import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Landmark, Clock, MapPin, ArrowRight, BookOpen, Volume2, Camera } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

const landmarks = [
  {
    id: 'shaniwar-wada',
    name: 'Shaniwar Wada',
    type: 'Fort Palace',
    era: 'c. 1732',
    dynasty: 'Peshwa / Maratha Empire',
    description: 'Shaniwar Wada is a historical fortification in Pune that was the seat of the Peshwa rulers of the Maratha Empire until 1818. Built by Peshwa Baji Rao I, it was a magnificent seven-storied structure before being gutted by fire in 1828.',
    historicalSignificance: 'Served as the political and administrative headquarters of the Maratha Confederacy for nearly a century, hosting some of the most significant events in Indian history.',
    visitInfo: 'Open daily 8 AM–6:30 PM · ₹5 (Indian) · ₹125 (Foreign nationals)',
    coordinates: [73.8553, 18.5193] as [number, number],
    nearbyPlaces: ['Dagdusheth Halwai Temple', 'Lal Mahal', 'Kasba Ganpati'],
    color: '#f97316',
    gradient: 'from-orange-900/60 via-orange-900/20 to-transparent',
    timeline: [
      { year: '1730', event: 'Foundation stone laid by Peshwa Baji Rao I' },
      { year: '1732', event: 'Construction completed; palace officially inaugurated' },
      { year: '1818', event: 'Fell to the British East India Company' },
      { year: '1828', event: 'Destroyed by a massive fire of unknown origin' },
      { year: '2019', event: 'UNESCO Asia-Pacific Heritage Award consideration' },
    ],
  },
  {
    id: 'aga-khan-palace',
    name: 'Aga Khan Palace',
    type: 'Heritage Monument',
    era: 'c. 1892',
    dynasty: 'Aga Khan I / British India',
    description: 'The Aga Khan Palace is a grand monument built in 1892 by Sultan Muhammad Shah, Aga Khan III. It has deep historical significance as the site where Mahatma Gandhi, Kasturba Gandhi, and Mahadev Desai were interned during the Quit India Movement.',
    historicalSignificance: 'A symbol of the Indian independence movement; Kasturba Gandhi passed away here in 1944. The palace houses a museum dedicated to Gandhi\'s life and the freedom struggle.',
    visitInfo: 'Open daily 9 AM–5:30 PM · ₹25 (Indian) · ₹300 (Foreign nationals)',
    coordinates: [73.9012, 18.5529] as [number, number],
    nearbyPlaces: ['Pune Cantonment', 'Koregaon Park', 'German Bakery'],
    color: '#8b5cf6',
    gradient: 'from-violet-900/60 via-violet-900/20 to-transparent',
    timeline: [
      { year: '1892', event: 'Built by Aga Khan III to provide employment during famine' },
      { year: '1942', event: 'Gandhi and associates interned after Quit India Movement' },
      { year: '1944', event: 'Kasturba Gandhi passed away here on February 22' },
      { year: '1969', event: 'Aga Khan donated the palace to India' },
      { year: '2003', event: 'Declared a monument of national importance' },
    ],
  },
  {
    id: 'sinhagad-fort',
    name: 'Sinhagad Fort',
    type: 'Hill Fort',
    era: 'c. 2000 BCE',
    dynasty: 'Maratha Empire',
    description: 'Sinhagad, meaning "Lion\'s Fort," is a mountain fortress situated about 35 km southwest of Pune at an elevation of 1,312 m. Known as Kondana in antiquity, it gained its current name after the Battle of Sinhagad in 1670.',
    historicalSignificance: 'The site of the legendary Battle of Sinhagad (1670), where Maratha commander Tanaji Malusare fought bravely to capture the fort from the Mughals, sacrificing his life in the process.',
    visitInfo: 'Open daily 5 AM–8 PM · ₹50 entry · Best visited October–March',
    coordinates: [73.7557, 18.3661] as [number, number],
    nearbyPlaces: ['Khadakwasla Dam', 'Panshet Dam', 'Vetal Hill'],
    color: '#10b981',
    gradient: 'from-emerald-900/60 via-emerald-900/20 to-transparent',
    timeline: [
      { year: '1328', event: 'First recorded reference to Kondana Fort' },
      { year: '1649', event: 'Captured by Chhatrapati Shivaji Maharaj' },
      { year: '1665', event: 'Ceded to Mughals under Treaty of Purandar' },
      { year: '1670', event: 'Battle of Sinhagad — Tanaji Malusare recaptured the fort' },
      { year: '1818', event: 'Captured by the British East India Company' },
    ],
  },
  {
    id: 'raja-dinkar-kelkar-museum',
    name: 'Raja Dinkar Kelkar Museum',
    type: 'Museum',
    era: 'c. 1920s collection',
    dynasty: 'Modern Heritage',
    description: 'One of the most fascinating museums in India, housing over 20,000 artifacts collected by Dr. D.G. Kelkar over 60 years. The collection spans sculptures, lamps, musical instruments, textiles, weapons, and everyday objects representing India\'s rich cultural heritage.',
    historicalSignificance: 'A private collection of extraordinary scope and depth, dedicated to the memory of Dr. Kelkar\'s son Raja. It is considered one of the best private museums in India.',
    visitInfo: 'Open daily 9:30 AM–5:30 PM · ₹100 (Indian) · ₹200 (Foreign) · Closed national holidays',
    coordinates: [73.8553, 18.5163] as [number, number],
    nearbyPlaces: ['Shaniwar Wada', 'Pataleshwar Cave Temple', 'Kasba Peth'],
    color: '#f59e0b',
    gradient: 'from-amber-900/60 via-amber-900/20 to-transparent',
    timeline: [
      { year: '1920s', event: 'Dr. D.G. Kelkar begins his lifelong collection journey' },
      { year: '1962', event: 'Formally established and opened to the public' },
      { year: '2001', event: 'Renovated and expanded to current scale' },
      { year: '2015', event: 'Recognized by National Tourism Awards' },
    ],
  },
]

export default function Heritage() {
  const [searchParams] = useSearchParams()
  const selectedId = searchParams.get('place')
    ? landmarks.find(l => l.name === searchParams.get('place'))?.id
    : null
  const [active, setActive] = useState<typeof landmarks[0] | null>(
    selectedId ? landmarks.find(l => l.id === selectedId) || null : null
  )

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Hero */}
      <div className="relative py-16 px-4 overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 to-transparent" />
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-amber-400 text-sm font-semibold uppercase tracking-widest"
          >
            History & Culture
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black mt-2 mb-4"
          >
            Pune's{' '}
            <span className="gradient-text">Living Heritage</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg"
          >
            Explore centuries of Maratha history, architecture, and culture through immersive storytelling.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {active ? (
          /* Detail view */
          <div>
            <button
              onClick={() => setActive(null)}
              className="btn-ghost text-sm flex items-center gap-2 mb-6 rounded-xl"
            >
              ← Back to all landmarks
            </button>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main info */}
              <div className="lg:col-span-2 space-y-5">
                <div className={`rounded-2xl bg-gradient-to-br ${active.gradient} p-8 border border-white/10`}>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${active.color}20` }}>
                      <Landmark className="w-7 h-7" style={{ color: active.color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${active.color}20`, color: active.color }}>
                          {active.type}
                        </span>
                        <span className="text-xs text-slate-500">{active.dynasty}</span>
                      </div>
                      <h2 className="text-3xl font-black text-white">{active.name}</h2>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                        <Clock className="w-3.5 h-3.5" /> Built/Established: {active.era}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-2xl border border-white/5 p-5">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" /> About
                  </h3>
                  <p className="text-slate-400 leading-relaxed">{active.description}</p>
                </div>

                <div className="glass rounded-2xl border border-white/5 p-5">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Landmark className="w-4 h-4" style={{ color: active.color }} /> Historical Significance
                  </h3>
                  <p className="text-slate-400 leading-relaxed">{active.historicalSignificance}</p>
                  <div className="mt-3 p-2 rounded-lg bg-white/3 text-xs text-slate-600 border border-white/5">
                    Historical facts are based on publicly available sources. AI-generated narrative descriptions are supplementary.
                  </div>
                </div>

                {/* Timeline */}
                <div className="glass rounded-2xl border border-white/5 p-5">
                  <h3 className="font-semibold text-white mb-4">Historical Timeline</h3>
                  <div className="space-y-3">
                    {active.timeline.map((t, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex gap-4"
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: `${active.color}20`, color: active.color }}>
                            {i + 1}
                          </div>
                          {i < active.timeline.length - 1 && (
                            <div className="w-0.5 flex-1 mt-1 mb-0" style={{ background: `${active.color}20` }} />
                          )}
                        </div>
                        <div className="pb-3">
                          <div className="text-sm font-bold" style={{ color: active.color }}>{t.year}</div>
                          <div className="text-sm text-slate-400">{t.event}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="glass rounded-2xl border border-white/5 p-4">
                  <h4 className="font-semibold text-white mb-3">Visit Information</h4>
                  <p className="text-sm text-slate-400">{active.visitInfo}</p>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${active.coordinates[1]}&mlon=${active.coordinates[0]}&zoom=16`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center justify-center gap-2 w-full mt-4 py-2.5 rounded-xl text-sm"
                  >
                    <MapPin className="w-4 h-4" /> View on Map
                  </a>
                </div>

                <div className="glass rounded-2xl border border-white/5 p-4">
                  <h4 className="font-semibold text-white mb-3">Nearby Places</h4>
                  <div className="space-y-2">
                    {active.nearbyPlaces.map(p => (
                      <div key={p} className="flex items-center gap-2 text-sm text-slate-400">
                        <MapPin className="w-3 h-3" style={{ color: active.color }} /> {p}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Grid view */
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {landmarks.map((lm, i) => (
              <motion.div
                key={lm.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setActive(lm)}
                className="card-hover cursor-pointer glass rounded-2xl overflow-hidden border border-white/5 group"
              >
                <div className={`h-32 bg-gradient-to-br ${lm.gradient} relative flex items-end p-5`}>
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${lm.color}20` }}>
                    <Landmark className="w-5 h-5" style={{ color: lm.color }} />
                  </div>
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${lm.color}30`, color: lm.color }}>
                      {lm.type}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-white mb-1">{lm.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
                    <Clock className="w-3 h-3" /> {lm.era} · {lm.dynasty}
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{lm.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-xs text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Pune, MH
                    </div>
                    <span className="text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: lm.color }}>
                      Explore <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
