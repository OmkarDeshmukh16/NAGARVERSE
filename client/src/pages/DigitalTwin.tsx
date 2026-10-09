import React, { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Sphere, Box, Cylinder, Torus, Stars, Text, Billboard, OrbitControls } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import {
  Utensils, Landmark, Hotel, Shield, CloudSun, Bus, Globe2,
  RotateCcw, ZoomIn, ZoomOut, Layers, Info, Map
} from 'lucide-react'

// Layer types
const layers = [
  { id: 'food', label: 'Food', icon: Utensils, color: '#f97316' },
  { id: 'heritage', label: 'Heritage', icon: Landmark, color: '#8b5cf6' },
  { id: 'hotels', label: 'Hotels', icon: Hotel, color: '#10b981' },
  { id: 'safety', label: 'Safety', icon: Shield, color: '#f43f5e' },
  { id: 'transit', label: 'Transit', icon: Bus, color: '#00d4ff' },
]

// Sample POI positions (conceptual, not geographically accurate)
const pois = {
  food: [[0.5, 0.1, 0.3], [-0.3, 0.1, 0.6], [0.8, 0.1, -0.2], [-0.7, 0.1, -0.4]] as [number, number, number][],
  heritage: [[0, 0.1, 0], [-0.5, 0.1, 0.5], [0.6, 0.1, 0.6]] as [number, number, number][],
  hotels: [[0.4, 0.1, -0.5], [-0.6, 0.1, 0.1], [0.9, 0.1, 0.3]] as [number, number, number][],
  safety: [[-0.2, 0.1, -0.6], [0.3, 0.1, 0.8]] as [number, number, number][],
  transit: [[0, 0.1, -0.8], [-0.8, 0.1, -0.3], [0.7, 0.1, -0.7]] as [number, number, number][],
}

const layerColors: Record<string, string> = {
  food: '#f97316', heritage: '#8b5cf6', hotels: '#10b981', safety: '#f43f5e', transit: '#00d4ff',
}

function POI({ position, color, label, onSelect }: { position: [number, number, number]; color: string; label: string; onSelect: () => void }) {
  const ref = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)

  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 2 + position[0] * 5) * 0.04
  })

  return (
    <group
      ref={ref}
      position={position}
      onClick={onSelect}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Sphere args={[hovered ? 0.07 : 0.05, 16, 16]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 3 : 2} />
      </Sphere>
      <Cylinder args={[0.008, 0.008, 0.15, 6]} position={[0, -0.1, 0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </Cylinder>
      {hovered && (
        <Billboard position={[0, 0.15, 0]}>
          <mesh>
            <planeGeometry args={[0.3, 0.08]} />
            <meshBasicMaterial color="#040814" transparent opacity={0.85} />
          </mesh>
        </Billboard>
      )}
    </group>
  )
}

function TwinCity({ activeLayers, onSelectPoi }: { activeLayers: string[]; onSelectPoi: (info: any) => void }) {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001
    }
  })

  return (
    <group ref={groupRef}>
      {/* Ground */}
      <Cylinder args={[2, 1.7, 0.3, 48]} position={[0, -0.15, 0]}>
        <meshStandardMaterial color="#0a1628" metalness={0.2} roughness={0.8} />
      </Cylinder>
      <Cylinder args={[1.9, 1.9, 0.04, 48]} position={[0, 0.02, 0]}>
        <meshStandardMaterial color="#0a3d2e" />
      </Cylinder>

      {/* Grid roads */}
      {[-0.6, 0, 0.6].map((offset, i) => (
        <Box key={`h${i}`} args={[3.8, 0.01, 0.06]} position={[0, 0.03, offset]}>
          <meshStandardMaterial color="#1e293b" />
        </Box>
      ))}
      {[-0.6, 0, 0.6].map((offset, i) => (
        <Box key={`v${i}`} args={[0.06, 0.01, 3.8]} position={[offset, 0.03, 0]}>
          <meshStandardMaterial color="#1e293b" />
        </Box>
      ))}

      {/* Buildings - varied heights */}
      {[
        [0, 0.6, 0, 1.2, '#1e3a8a'], [0.6, 0.4, 0, 0.8, '#1d4ed8'],
        [-0.6, 0.45, 0, 0.9, '#2563eb'], [0, 0.25, 0.6, 0.5, '#1e40af'],
        [0.6, 0.3, 0.6, 0.6, '#3b82f6'], [-0.6, 0.35, 0.6, 0.7, '#60a5fa'],
        [0, 0.2, -0.6, 0.4, '#1e3a8a'], [0.6, 0.25, -0.6, 0.5, '#2563eb'],
        [-0.6, 0.2, -0.6, 0.4, '#1d4ed8'], [0.9, 0.15, 0.3, 0.3, '#1e3a8a'],
        [-0.9, 0.15, -0.3, 0.3, '#1e3a8a'], [0.3, 0.12, 0.9, 0.24, '#1e3a8a'],
        [-0.3, 0.1, -0.9, 0.2, '#1e3a8a'],
      ].map(([x, yOff, z, h, color], i) => (
        <Box key={i} args={[0.25, h as number, 0.25]} position={[x as number, (yOff as number), z as number]}>
          <meshStandardMaterial color={color as string} emissive={color as string} emissiveIntensity={0.15} metalness={0.7} roughness={0.3} />
        </Box>
      ))}

      {/* Landmark dome */}
      <Sphere args={[0.12, 16, 16]} position={[0.02, 1.05, 0.02]}>
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} metalness={0.9} />
      </Sphere>

      {/* Outer ring */}
      <Torus args={[2, 0.015, 16, 80]} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={1.5} transparent opacity={0.6} />
      </Torus>

      {/* POIs by active layer */}
      {activeLayers.flatMap(layer =>
        (pois[layer as keyof typeof pois] || []).map((pos, i) => (
          <POI
            key={`${layer}-${i}`}
            position={pos}
            color={layerColors[layer]}
            label={layer}
            onSelect={() => onSelectPoi({ layer, index: i })}
          />
        ))
      )}
    </group>
  )
}

export default function DigitalTwin() {
  const [activeLayers, setActiveLayers] = useState<string[]>(['heritage', 'food'])
  const [selectedInfo, setSelectedInfo] = useState<any>(null)
  const [is3D, setIs3D] = useState(true)

  const toggleLayer = (id: string) => {
    setActiveLayers(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen pt-16 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 glass-dark border-b border-white/5 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe2 className="w-5 h-5 text-cyan-400" />
            <div>
              <h1 className="font-bold text-white text-sm">City Digital Twin</h1>
              <p className="text-[11px] text-slate-600">Conceptual visualization — not geographically accurate</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIs3D(!is3D)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                is3D ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" /> 3D View
            </button>
            <button
              onClick={() => setIs3D(!is3D)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                !is3D ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Map className="w-3.5 h-3.5" /> Map View
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Layer controls */}
        <div className="w-60 flex-shrink-0 glass-dark border-r border-white/5 p-4 flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> Layers
            </h3>
            <div className="space-y-2">
              {layers.map(({ id, label, icon: Icon, color }) => (
                <label key={id} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={activeLayers.includes(id)}
                      onChange={() => toggleLayer(id)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded border-2 transition-all ${
                        activeLayers.includes(id) ? 'border-transparent' : 'border-slate-700'
                      }`}
                      style={{ background: activeLayers.includes(id) ? color : 'transparent' }}
                    />
                  </div>
                  <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: `${color}20` }}>
                    <Icon className="w-3 h-3" style={{ color }} />
                  </div>
                  <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="pt-4 border-t border-white/5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Legend</h3>
            <div className="space-y-1.5 text-xs">
              {activeLayers.map(l => {
                const layer = layers.find(x => x.id === l)
                if (!layer) return null
                return (
                  <div key={l} className="flex items-center gap-2 text-slate-500">
                    <div className="w-2 h-2 rounded-full" style={{ background: layer.color }} />
                    {layer.label} ({(pois[l as keyof typeof pois] || []).length} POIs)
                  </div>
                )
              })}
            </div>
          </div>

          {/* Notice */}
          <div className="mt-auto p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-amber-400 flex gap-2">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            This 3D model is conceptual. POI positions are illustrative, not precise coordinates.
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="flex-1 relative">
          {is3D ? (
            <Canvas camera={{ position: [0, 2.5, 4], fov: 45 }} gl={{ antialias: true, alpha: true }} style={{ background: '#040814' }}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 10, 5]} intensity={1.5} />
              <pointLight position={[0, 4, 0]} intensity={2} color="#00d4ff" />
              <pointLight position={[-3, 2, -3]} intensity={1} color="#8b5cf6" />
              <Stars radius={40} count={600} factor={2} fade />
              <OrbitControls enablePan={true} enableZoom={true} minDistance={2} maxDistance={8} autoRotate={false} />
              <Float speed={0.5} rotationIntensity={0.02} floatIntensity={0.1}>
                <TwinCity activeLayers={activeLayers} onSelectPoi={setSelectedInfo} />
              </Float>
              <fog attach="fog" args={['#040814', 8, 20]} />
            </Canvas>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              <div className="text-center">
                <Map className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>2D Map View — use the Explore page for the full interactive map</p>
              </div>
            </div>
          )}

          {/* Selected POI info */}
          <AnimatePresence>
            {selectedInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-4 right-4 glass-dark rounded-2xl border border-white/10 p-4 w-60"
              >
                <button onClick={() => setSelectedInfo(null)} className="absolute top-3 right-3 text-slate-500 hover:text-slate-300">×</button>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: layerColors[selectedInfo.layer] }} />
                  <span className="font-semibold text-white text-sm capitalize">{selectedInfo.layer} Point of Interest</span>
                </div>
                <p className="text-xs text-slate-500">
                  Illustrative POI #{selectedInfo.index + 1} in the {selectedInfo.layer} layer.
                  Visit the Explore page for real place data.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass rounded-xl px-4 py-2 text-xs text-slate-500 flex items-center gap-3">
            <span>Drag to rotate</span>
            <span>·</span>
            <span>Scroll to zoom</span>
            <span>·</span>
            <span>Click POIs to inspect</span>
          </div>
        </div>
      </div>
    </div>
  )
}
