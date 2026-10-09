import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Map, Shield, BarChart3, Users, Menu, X, User, LogOut,
  Compass, Landmark, Cpu, Search, Sparkles, Navigation
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavi } from '../../contexts/NaviContext'

const navLinks = [
  { label: 'Home', href: '/', icon: Compass },
  { label: 'Explore', href: '/explore', icon: Map },
  { label: 'Safety', href: '/safety', icon: Shield },
  { label: 'Insights', href: '/insights', icon: BarChart3 },
  { label: 'Heritage', href: '/heritage', icon: Landmark },
  { label: 'Digital Twin', href: '/digital-twin', icon: Cpu },
  { label: 'Community', href: '/community', icon: Users },
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
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-dark shadow-2xl shadow-black/60 border-b border-white/5 py-2.5' : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '24s' }} />
                </div>
                <div className="absolute -inset-1 rounded-xl bg-cyan-400/30 blur-sm -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl tracking-tight text-white">CityQuest</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">NAGARVERSE</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                  Explore • Experience • Stay Safe
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1.5 bg-[#0a1528]/80 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
              {navLinks.map(({ label, href, icon: Icon }) => {
                const active = location.pathname === href
                return (
                  <Link
                    key={href}
                    to={href}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/25'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </Link>
                )
              })}
            </div>

            {/* Right Action Icons & Buttons */}
            <div className="flex items-center gap-3">
              {/* Search trigger */}
              <button
                onClick={openNavi}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                title="Search city or ask AI"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* User Avatar / Profile */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-xs text-white font-medium hidden sm:inline">{user.name?.split(' ')[0]}</span>
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-11 w-48 glass-dark rounded-xl border border-white/10 p-2 shadow-2xl z-50"
                      >
                        <div className="px-3 py-2 border-b border-white/5 mb-1">
                          <div className="font-semibold text-xs text-white truncate">{user.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white"
                        >
                          <User className="w-3.5 h-3.5" /> My Profile & Saved
                        </Link>
                        <button
                          onClick={() => { logout(); setProfileOpen(false) }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
              )}

              {/* Get Started Pill Button */}
              <Link
                to="/explore"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95"
              >
                <span>Get Started</span>
              </Link>

              {/* Mobile menu hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden glass-dark border-b border-white/10 overflow-hidden px-4 py-4 space-y-2"
            >
              {navLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  to={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    location.pathname === href
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
              <div className="pt-2 border-t border-white/5 flex gap-2">
                <Link to="/explore" className="btn-primary w-full text-center py-2 text-xs rounded-xl">
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  )
}
