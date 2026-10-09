import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { MessageSquare, Plus, Filter, Clock, MapPin, CheckCircle, AlertCircle, Eye, ThumbsUp, Camera } from 'lucide-react'
import ReportIncident from '../components/safety/ReportIncident'

const statusColors: Record<string, string> = {
  submitted: '#94a3b8',
  under_review: '#f59e0b',
  verified: '#10b981',
  rejected: '#f43f5e',
  resolved: '#8b5cf6',
}

export default function Community() {
  const [showReportForm, setShowReportForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['community-reports', statusFilter],
    queryFn: async () => {
      const res = await axios.get('/api/reports', {
        params: { status: statusFilter === 'all' ? undefined : statusFilter, limit: 30 }
      })
      return res.data.reports || []
    },
  })

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Citizen Reports</span>
            <h1 className="text-3xl font-black text-white mt-1">Community Hub</h1>
            <p className="text-slate-500 text-sm">Real reports from real people making Pune better</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowReportForm(!showReportForm)}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
          >
            <Plus className="w-4 h-4" /> Submit Report
          </motion.button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Report form */}
          {showReportForm && (
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl border border-orange-500/20">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-400" /> New Report
                  </h3>
                  <button onClick={() => setShowReportForm(false)} className="text-slate-500 hover:text-slate-300 text-sm">✕</button>
                </div>
                <ReportIncident />
              </div>
            </div>
          )}

          {/* Reports feed */}
          <div className={showReportForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
            {/* Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {['all', 'submitted', 'under_review', 'verified', 'resolved'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    statusFilter === s
                      ? 'bg-orange-500/15 text-orange-400 border border-orange-500/25'
                      : 'text-slate-600 hover:text-slate-400 border border-transparent'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Reports grid */}
            {isLoading ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
              </div>
            ) : reports.length === 0 ? (
              <div className="py-16 text-center text-slate-600">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No reports yet. Be the first to contribute!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {reports.map((report: any, i: number) => (
                  <motion.div
                    key={report._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass rounded-xl border border-white/5 p-4 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white capitalize">
                          {report.category?.replace('_', ' ')}
                        </span>
                        <div
                          className="h-4 px-1.5 rounded text-[10px] font-medium flex items-center capitalize"
                          style={{
                            background: `${statusColors[report.status]}20`,
                            color: statusColors[report.status],
                          }}
                        >
                          {report.status?.replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed mb-3 line-clamp-2">
                      {report.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-3">
                        {report.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {report.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {report.hasPhoto && <Camera className="w-3.5 h-3.5 text-slate-600" />}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
