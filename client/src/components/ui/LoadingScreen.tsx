import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center city-bg">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6"
      >
        {/* Logo mark */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-2xl border-2 border-cyan-400/30"
              animate={{ scale: 1 + i * 0.3, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
            />
          ))}
        </div>

        {/* Text */}
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-black gradient-text-cyan tracking-wider"
          >
            NAGARVERSE
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-500 text-sm mt-1"
          >
            Loading city intelligence...
          </motion.p>
        </div>

        {/* Progress bar */}
        <motion.div className="w-48 h-0.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 to-violet-600 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}
