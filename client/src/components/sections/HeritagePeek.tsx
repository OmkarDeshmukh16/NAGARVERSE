import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Landmark, ArrowRight, Clock, MapPin } from 'lucide-react'

const landmarks = [
  {
    name: 'Shaniwar Wada',
    era: 'c. 1732',
    type: 'Fort Palace',
    description: 'The iconic 18th-century fortification that served as the seat of the Peshwa rulers of the Maratha Empire.',
    color: '#f97316',
    gradient: 'from-orange-900/40 to-transparent',
    lat: 18.5193,
    lng: 73.8553,
  },
  {
    name: 'Aga Khan Palace',
    era: 'c. 1892',
    type: 'Heritage Monument',
    description: 'A stunning Italian-style palace that holds deep significance as the site of Mahatma Gandhi\'s internment.',
    color: '#8b5cf6',
    gradient: 'from-violet-900/40 to-transparent',
    lat: 18.5529,
    lng: 73.9012,
  },
  {
    name: 'Sinhagad Fort',
    era: 'c. 2000 BCE',
    type: 'Hill Fort',
    description: 'An ancient hill fortress standing at 1,312 m, famous for the Battle of Sinhagad fought by Tanaji Malusare.',
    color: '#10b981',
    gradient: 'from-emerald-900/40 to-transparent',
    lat: 18.3661,
    lng: 73.7557,
  },
]

export default function HeritagePeek() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12"
        >
          <div>
            <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">History & Culture</span>
            <h2 className="text-4xl font-black mt-1">
              Pune's{' '}
              <span className="gradient-text">Living Heritage</span>
            </h2>
          </div>
          <Link to="/heritage" className="btn-ghost flex items-center gap-2 text-sm w-fit">
            Explore All <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {landmarks.map(({ name, era, type, description, color, gradient }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="card-hover glass rounded-2xl overflow-hidden border border-white/5 h-full">
                {/* Top gradient banner */}
                <div className={`h-24 bg-gradient-to-br ${gradient} relative flex items-center justify-center`}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `${color}25` }}>
                    <Landmark className="w-8 h-8" style={{ color }} />
                  </div>
                </div>

                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-lg leading-tight">{name}</h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>
                        {type}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Clock className="w-3 h-3" /> {era}
                    </div>
                    <Link to={`/heritage?place=${encodeURIComponent(name)}`} className="text-xs font-medium flex items-center gap-1" style={{ color }}>
                      Learn more <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
