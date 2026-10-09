import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface User {
  _id: string
  name: string
  email: string
  avatar?: string
  preferences?: {
    interests: string[]
    travelMode: string
    budgetRange: string
  }
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nv_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchMe()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchMe = async () => {
    try {
      const res = await axios.get('/api/auth/me')
      setUser(res.data.user)
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const res = await axios.post('/api/auth/login', { email, password })
    const { token: t, user: u } = res.data
    localStorage.setItem('nv_token', t)
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`
    setToken(t)
    setUser(u)
  }

  const register = async (name: string, email: string, password: string) => {
    const res = await axios.post('/api/auth/register', { name, email, password })
    const { token: t, user: u } = res.data
    localStorage.setItem('nv_token', t)
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`
    setToken(t)
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('nv_token')
    delete axios.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
