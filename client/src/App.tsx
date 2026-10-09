import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { NaviProvider } from './contexts/NaviContext'
import Navbar from './components/layout/Navbar'
import NaviOrb from './components/ai/NaviOrb'
import LoadingScreen from './components/ui/LoadingScreen'

const Home = lazy(() => import('./pages/Home'))
const Explore = lazy(() => import('./pages/Explore'))
const Safety = lazy(() => import('./pages/Safety'))
const Insights = lazy(() => import('./pages/Insights'))
const Community = lazy(() => import('./pages/Community'))
const Heritage = lazy(() => import('./pages/Heritage'))
const DigitalTwin = lazy(() => import('./pages/DigitalTwin'))
const Itinerary = lazy(() => import('./pages/Itinerary'))
const Compare = lazy(() => import('./pages/Compare'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Profile = lazy(() => import('./pages/Profile'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NaviProvider>
          <BrowserRouter>
            <div className="min-h-screen city-bg relative">
              <Navbar />
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/safety" element={<Safety />} />
                  <Route path="/insights" element={<Insights />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/heritage" element={<Heritage />} />
                  <Route path="/digital-twin" element={<DigitalTwin />} />
                  <Route path="/itinerary" element={<Itinerary />} />
                  <Route path="/compare" element={<Compare />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </Suspense>
              <NaviOrb />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: 'rgba(10,22,40,0.95)',
                    border: '1px solid rgba(0,212,255,0.2)',
                    color: '#e2e8f0',
                    backdropFilter: 'blur(20px)',
                  },
                }}
              />
            </div>
          </BrowserRouter>
        </NaviProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
