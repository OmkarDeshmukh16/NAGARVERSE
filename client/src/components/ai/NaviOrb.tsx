import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Mic, MicOff, Sparkles, MapPin, ArrowUpRight } from 'lucide-react'
import { useNavi } from '../../contexts/NaviContext'

// Simple markdown renderer without the package
function SimpleMarkdown({ text }: { text: string }) {
  // Bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  )
}

export default function NaviOrb() {
  const { isOpen, isListening, isProcessing, messages, openNavi, closeNavi, sendMessage, setListening } = useNavi()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Expose openNavi globally for FeatureSection workaround
  useEffect(() => {
    ;(window as any).__navi_open = openNavi
  }, [openNavi])

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return
    const text = input.trim()
    setInput('')
    await sendMessage(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    if (isListening) {
      recognitionRef.current?.stop()
      setListening(false)
    } else {
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-IN'
      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript
        setInput(transcript)
        setListening(false)
      }
      recognition.onerror = () => setListening(false)
      recognition.onend = () => setListening(false)
      recognitionRef.current = recognition
      recognition.start()
      setListening(true)
    }
  }

  const suggestions = [
    'Plan a day trip in Pune',
    'Best street food near Shaniwar Wada',
    'Safe routes in Kothrud',
    'Heritage places to visit',
  ]

  return (
    <>
      {/* Floating orb button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2, type: 'spring' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={openNavi}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #00d4ff)',
            boxShadow: '0 0 30px rgba(139,92,246,0.5), 0 0 60px rgba(0,212,255,0.2)',
          }}
          aria-label="Open Navi AI Assistant"
        >
          <motion.div
            animate={{ rotate: isProcessing ? 360 : 0 }}
            transition={{ duration: 2, repeat: isProcessing ? Infinity : 0, ease: 'linear' }}
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          {/* Pulse rings */}
          {[1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-violet-400/30"
              animate={{ scale: 1 + i * 0.4, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
            />
          ))}
        </motion.button>
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] flex flex-col glass-dark rounded-2xl border border-violet-500/20 shadow-2xl overflow-hidden"
            style={{ maxHeight: 'min(600px, calc(100vh - 5rem))' }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#060d1f]" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Navi</div>
                  <div className="text-xs text-slate-500">
                    {isProcessing ? (
                      <span className="text-violet-400 animate-pulse">Thinking...</span>
                    ) : isListening ? (
                      <span className="text-cyan-400 animate-pulse">Listening...</span>
                    ) : (
                      'AI City Guide · Pune'
                    )}
                  </div>
                </div>
              </div>
              <button onClick={closeNavi} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] px-3 py-2.5 rounded-xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-violet-600 to-cyan-600 text-white rounded-br-sm'
                        : 'bg-white/5 text-slate-300 rounded-bl-sm border border-white/5'
                    }`}
                  >
                    <SimpleMarkdown text={msg.content} />

                    {/* Place cards */}
                    {msg.places && msg.places.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {msg.places.slice(0, 3).map((p: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                            <MapPin className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                            <span className="text-xs text-slate-300 flex-1 truncate">{p.name}</span>
                            <ArrowUpRight className="w-3 h-3 text-slate-600" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isProcessing && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-xl rounded-bl-sm px-3 py-2.5">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-violet-400"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-white/5 flex items-end gap-2 flex-shrink-0">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about Pune..."
                  rows={1}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none resize-none focus:border-violet-500/30 transition-colors"
                  style={{ maxHeight: 80 }}
                />
              </div>
              <button
                onClick={toggleMic}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
                  isListening ? 'bg-cyan-500/20 border border-cyan-500/40' : 'bg-white/5 hover:bg-white/10'
                }`}
                aria-label="Voice input"
              >
                {isListening ? <MicOff className="w-4 h-4 text-cyan-400" /> : <Mic className="w-4 h-4 text-slate-500" />}
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-600 to-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4 text-white" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
