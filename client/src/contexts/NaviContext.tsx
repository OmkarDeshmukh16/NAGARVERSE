import React, { createContext, useContext, useState, ReactNode } from 'react'

interface NaviContextType {
  isOpen: boolean
  isListening: boolean
  isProcessing: boolean
  messages: NaviMessage[]
  openNavi: () => void
  closeNavi: () => void
  sendMessage: (text: string) => Promise<void>
  setListening: (v: boolean) => void
}

export interface NaviMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  places?: any[]
  mapAction?: { lat: number; lng: number; label: string; placeId?: string }
  isDemo?: boolean
  degradedMode?: boolean
  grounding?: {
    placesRetrieved?: number
    weatherSource?: string
    activeReports?: number
  }
}

const NaviContext = createContext<NaviContextType | null>(null)

export function NaviProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [messages, setMessages] = useState<NaviMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hey! I'm **Navi**, your AI city guide for Pune. Ask me anything — places to visit, food recommendations, safety tips, or let me plan your day! 🌆",
      timestamp: new Date(),
    },
  ])

  const openNavi = () => setIsOpen(true)
  const closeNavi = () => setIsOpen(false)

  const sendMessage = async (text: string) => {
    const userMsg: NaviMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsProcessing(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply || "I couldn't get a response right now. Please try again!",
          timestamp: new Date(),
          places: data.places,
          mapAction: data.mapAction,
          isDemo: data.isDemo,
          degradedMode: data.degradedMode,
          grounding: data.grounding,
        },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please check your connection and try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <NaviContext.Provider value={{ isOpen, isListening, isProcessing, messages, openNavi, closeNavi, sendMessage, setListening: setIsListening }}>
      {children}
    </NaviContext.Provider>
  )
}

export function useNavi() {
  const ctx = useContext(NaviContext)
  if (!ctx) throw new Error('useNavi must be inside NaviProvider')
  return ctx
}
