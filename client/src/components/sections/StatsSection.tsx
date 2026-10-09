import React from 'react'
import { motion } from 'framer-motion'
import { Users, MapPin, Star, Shield } from 'lucide-react'

const stats = [
  { value: '1,200+', label: 'Places Indexed', icon: MapPin, color: '#00d4ff' },
  { value: '98%', label: 'Data Accuracy', icon: Star, color: '#8b5cf6' },
  { value: '50+', label: 'Safety Zones', icon: Shield, color: '#f43f5e' },
  { value: '10K+', label: 'City Reports', icon: Users, color: '#10b981' },
]

export default function StatsSection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-3xl border border-white/5 p-8 sm:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ value, label, icon: Icon, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: 'spring' }}
                className="flex flex-col items-center text-center gap-2"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2" style={{ background: `${color}18` }}>
                  <Icon className="w-7 h-7" style={{ color }} />
                </div>
                <span className="text-3xl sm:text-4xl font-black text-white">{value}</span>
                <span className="text-sm text-slate-500">{label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
