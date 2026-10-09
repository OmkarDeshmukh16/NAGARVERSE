import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sphere, Box, Cylinder, Torus, Stars } from '@react-three/drei'
import * as THREE from 'three'

// Building component
function Building({ position, height, color }: { position: [number, number, number]; height: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null!)
  return (
    <Box ref={ref} args={[0.3, height, 0.3]} position={position}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} metalness={0.8} roughness={0.2} />
    </Box>
  )
}

// Glowing location pin
function LocationPin({ position, color = '#00d4ff' }: { position: [number, number, number]; color?: string }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 2) * 0.05
    }
  })
  return (
    <group ref={ref} position={position}>
      <Sphere args={[0.08, 16, 16]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </Sphere>
      <Cylinder args={[0.01, 0.01, 0.2, 8]} position={[0, -0.15, 0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </Cylinder>
    </group>
  )
}

// City island
function CityIsland() {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame(({ clock, mouse }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.08 + mouse.x * 0.2
      groupRef.current.rotation.x = mouse.y * 0.05
    }
  })

  const buildings = useMemo(() => [
    // Central towers
    { pos: [0, 0.5, 0] as [number,number,number], h: 1.0, color: '#1e40af' },
    { pos: [0.4, 0.4, 0.2] as [number,number,number], h: 0.8, color: '#1d4ed8' },
    { pos: [-0.4, 0.35, -0.1] as [number,number,number], h: 0.7, color: '#2563eb' },
    { pos: [0.2, 0.25, -0.4] as [number,number,number], h: 0.5, color: '#3b82f6' },
    { pos: [-0.2, 0.2, 0.4] as [number,number,number], h: 0.4, color: '#60a5fa' },
    // Mid ring
    { pos: [0.7, 0.15, 0] as [number,number,number], h: 0.3, color: '#1e3a8a' },
    { pos: [-0.7, 0.15, 0.1] as [number,number,number], h: 0.3, color: '#1e3a8a' },
    { pos: [0, 0.15, 0.7] as [number,number,number], h: 0.3, color: '#1e3a8a' },
    { pos: [0.1, 0.1, -0.7] as [number,number,number], h: 0.25, color: '#1e3a8a' },
    // Outer
    { pos: [0.9, 0.1, 0.5] as [number,number,number], h: 0.2, color: '#1e3a8a' },
    { pos: [-0.9, 0.1, -0.4] as [number,number,number], h: 0.2, color: '#1e3a8a' },
    { pos: [0.5, 0.1, -0.9] as [number,number,number], h: 0.2, color: '#1e3a8a' },
    { pos: [-0.5, 0.1, 0.9] as [number,number,number], h: 0.2, color: '#1e3a8a' },
  ], [])

  return (
    <group ref={groupRef}>
      {/* Island base */}
      <Cylinder args={[1.4, 1.0, 0.4, 32]} position={[0, -0.2, 0]}>
        <meshStandardMaterial color="#0f172a" metalness={0.3} roughness={0.7} />
      </Cylinder>

      {/* Ground layer */}
      <Cylinder args={[1.3, 1.3, 0.05, 32]} position={[0, 0.01, 0]}>
        <meshStandardMaterial color="#0a3d2e" metalness={0.1} roughness={0.8} />
      </Cylinder>

      {/* Roads */}
      <Box args={[2.6, 0.01, 0.08]} position={[0, 0.03, 0]}>
        <meshStandardMaterial color="#374151" />
      </Box>
      <Box args={[0.08, 0.01, 2.6]} position={[0, 0.03, 0]}>
        <meshStandardMaterial color="#374151" />
      </Box>

      {/* Buildings */}
      {buildings.map((b, i) => (
        <Building key={i} position={b.pos} height={b.h} color={b.color} />
      ))}

      {/* Landmark - dome */}
      <Sphere args={[0.15, 16, 16]} position={[0.05, 0.8, 0.05]}>
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.4} metalness={0.9} roughness={0.1} />
      </Sphere>

      {/* Location pins */}
      <LocationPin position={[0.3, 0.35, 0.3]} color="#00d4ff" />
      <LocationPin position={[-0.4, 0.3, 0.2]} color="#8b5cf6" />
      <LocationPin position={[0.1, 0.2, -0.5]} color="#f97316" />

      {/* Glowing base ring */}
      <Torus args={[1.4, 0.02, 16, 64]} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
        <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={2} />
      </Torus>

      {/* Trees */}
      {[
        [0.8, 0.1, 0.8], [-0.8, 0.1, 0.8], [0.8, 0.1, -0.8], [-0.8, 0.1, -0.8],
      ].map((pos, i) => (
        <group key={i} position={pos as [number,number,number]}>
          <Cylinder args={[0.02, 0.02, 0.1, 6]} position={[0, 0.05, 0]}>
            <meshStandardMaterial color="#7c3f00" />
          </Cylinder>
          <Sphere args={[0.08, 8, 8]} position={[0, 0.14, 0]}>
            <meshStandardMaterial color="#166534" emissive="#166534" emissiveIntensity={0.1} />
          </Sphere>
        </group>
      ))}
    </group>
  )
}

// Precomputed ambient particle positions
const PARTICLE_COUNT = 60
const PRECOMPUTED_PARTICLES = new Float32Array(PARTICLE_COUNT * 3)
for (let i = 0; i < PARTICLE_COUNT; i++) {
  // Deterministic spread
  const angle = (i / PARTICLE_COUNT) * Math.PI * 2
  const r = 1.5 + (i % 5) * 0.4
  PRECOMPUTED_PARTICLES[i * 3] = Math.cos(angle) * r
  PRECOMPUTED_PARTICLES[i * 3 + 1] = ((i % 7) - 3) * 0.5
  PRECOMPUTED_PARTICLES[i * 3 + 2] = Math.sin(angle) * r
}

// Ambient particles
function Particles() {
  const ref = useRef<THREE.Points>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.03
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[PRECOMPUTED_PARTICLES, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#00d4ff" transparent opacity={0.5} />
    </points>
  )
}

// Glowing orb rings
function OrbRings() {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.2
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.1
    }
  })
  return (
    <group ref={ref}>
      {[1.8, 2.1, 2.4].map((r, i) => (
        <Torus key={i} args={[r, 0.005, 8, 80]} rotation={[Math.PI / 2 + i * 0.3, i * 0.5, 0]}>
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.8} transparent opacity={0.3 - i * 0.05} />
        </Torus>
      ))}
    </group>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 4], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[0, 3, 0]} intensity={2} color="#00d4ff" distance={8} />
      <pointLight position={[-2, 1, -2]} intensity={1} color="#8b5cf6" distance={6} />
      <pointLight position={[2, 0, 2]} intensity={0.8} color="#f97316" distance={5} />

      {/* Stars */}
      <Stars radius={50} depth={20} count={800} factor={2} fade speed={0.5} />

      {/* Main city */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <CityIsland />
      </Float>

      {/* Decorative rings */}
      <OrbRings />

      {/* Particles */}
      <Particles />

      {/* Fog */}
      <fog attach="fog" args={['#040814', 10, 25]} />
    </Canvas>
  )
}
