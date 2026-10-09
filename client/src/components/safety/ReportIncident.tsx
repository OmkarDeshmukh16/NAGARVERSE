import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, MapPin, Mic, MicOff, Upload, Camera, Send, Loader2, CheckCircle } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'

const categories = [
  { id: 'road_hazard', label: '🚧 Road Hazard' },
  { id: 'poor_lighting', label: '💡 Poor Lighting' },
  { id: 'flooding', label: '🌊 Flooding' },
  { id: 'traffic', label: '🚦 Traffic' },
  { id: 'harassment', label: '⚠️ Harassment' },
  { id: 'crime', label: '🚨 Crime' },
  { id: 'other', label: '📋 Other' },
]

export default function ReportIncident() {
  const { user } = useAuth()
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = e => chunksRef.current.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach(t => t.stop())
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
    } catch {
      toast.error('Microphone access denied')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category || !description) { toast.error('Please fill required fields'); return }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('category', category)
      formData.append('description', description)
      formData.append('location', location)
      formData.append('anonymous', String(anonymous))
      if (audioBlob) formData.append('audio', audioBlob, 'voice-note.webm')

      await axios.post('/api/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSubmitted(true)
      toast.success('Report submitted! Thank you for keeping Pune safe.')
    } catch {
      toast.error('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="p-8 flex flex-col items-center text-center gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
          className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"
        >
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </motion.div>
        <h3 className="font-bold text-white">Report Submitted!</h3>
        <p className="text-sm text-slate-500">Your report is under review and will be verified by our community moderators.</p>
        <div className="text-xs text-slate-600 space-y-1">
          <div>Status: <span className="text-amber-400">Submitted</span></div>
          <div>You'll be notified on updates.</div>
        </div>
        <button onClick={() => setSubmitted(false)} className="btn-ghost text-sm mt-2">
          Submit Another Report
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      {!user && (
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-amber-400">
          You can submit anonymously. Login to track your reports.
        </div>
      )}

      {/* Category */}
      <div>
        <label className="text-xs text-slate-500 mb-2 block">Incident Category *</label>
        <div className="grid grid-cols-2 gap-1.5">
          {categories.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`py-2 px-2 rounded-lg text-xs text-left transition-all ${
                category === c.id
                  ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                  : 'bg-white/3 border border-white/5 text-slate-500 hover:border-white/10'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Description *</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe the incident..."
          rows={3}
          className="input-city text-sm resize-none"
        />
      </div>

      {/* Location */}
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Location</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Area or landmark"
            className="input-city pl-9 text-sm py-2"
          />
        </div>
      </div>

      {/* Voice note */}
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Voice Note (optional)</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              isRecording
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-slate-300'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isRecording ? 'Stop Recording' : 'Record Voice'}
          </button>
          {audioBlob && (
            <span className="text-xs text-emerald-400 self-center">✓ Voice note ready</span>
          )}
        </div>
      </div>

      {/* Photo upload */}
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Photo (optional)</label>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-slate-400 hover:text-slate-300"
        >
          <Camera className="w-4 h-4" /> Attach Photo
        </button>
      </div>

      {/* Anonymous */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={e => setAnonymous(e.target.checked)}
          className="w-4 h-4 rounded border-slate-600 accent-violet-500"
        />
        <span className="text-xs text-slate-500">Submit anonymously</span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {submitting ? 'Submitting...' : 'Submit Report'}
      </button>
    </form>
  )
}
