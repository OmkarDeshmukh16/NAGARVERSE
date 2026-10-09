import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Map, Shield, BarChart3, Users, Menu, X, User, LogOut,
  Compass, Landmark, GitCompare, Route, Cpu, Sparkles
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavi } from '../../contexts/NaviContext'

const navLinks = [
  { label: 'Home', href: '/', icon: Compass },
  { label: 'Explore', href: '/explore', icon: Map },
  { label: 'Safety', href: '/safety', icon: Shield },
  { label: 'Insights', href: '/insights', icon: BarChart3 },
  { label: 'Community', href: '/community', icon: Users },
  { label: 'Heritage', href: '/heritage', icon: Landmark },
  { label: 'Digital Twin', href: '/digital-twin', icon: Cpu },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const { openNavi } = useNavi()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-dark shadow-lg shadow-black/40' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center glow-cyan">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-cyan-400/30 to-violet-600/30 blur-sm -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight gradient-text-cyan">NAGARVERSE</span>
                <span className="text-[10px] text-slate-500 block leading-none -mt-0.5">Explore Beyond the Ordinary</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(({ label, href, icon: Icon }) => {
                const active = location.pathname === href
                return (
                  <Link
                    key={href}
                    to={href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </Link>
                )
              })}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Navi button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openNavi}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium hover:bg-violet-500/20 transition-all"
              >
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                Ask Navi
              </motion.button>

              {/* Explore CTA */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/explore"
                  className="hidden sm:flex btn-primary text-sm px-4 py-2 rounded-lg"
                >
                  Explore My City
                </Link>
              </motion.div>

              {/* Profile */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold"
                  >
                    {user.name[0].toUpperCase()}
                  </button>
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute right-0 top-10 w-48 glass-dark rounded-xl p-2 shadow-2xl"
                      >
                        <div className="px-3 py-2 text-sm font-medium text-slate-300 border-b border-white/5 mb-1">
                          {user.name}
                        </div>
                        <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors">
                          <User className="w-4 h-4" /> Profile
                        </Link>
                        <button onClick={logout} className="flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors w-full">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="btn-ghost text-sm px-3 py-1.5 rounded-lg">
                  Login
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400"
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-72 z-40 glass-dark border-l border-white/5 pt-20 pb-8 px-6 flex flex-col gap-2 overflow-y-auto"
          >
            {navLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  location.pathname === href
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
              <button onClick={openNavi} className="btn-ghost text-sm text-left flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                Ask Navi AI
              </button>
              <Link to="/explore" className="btn-primary text-sm text-center">
                Explore My City
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setMobileOpen(false)} />
      )}
    </>
  )
}
