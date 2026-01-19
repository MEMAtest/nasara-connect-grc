'use client'

import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function FloatingBook({ position, rotation, delay = 0, color }: {
  position: [number, number, number]
  rotation?: [number, number, number]
  delay?: number
  color: string
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.15
      meshRef.current.rotation.z = rotation?.[2] ? rotation[2] + Math.sin(state.clock.elapsedTime * 0.3 + delay) * 0.05 : Math.sin(state.clock.elapsedTime * 0.3 + delay) * 0.05
    }
  })

  return (
    <mesh ref={meshRef} position={position} rotation={rotation || [0, 0, 0]}>
      <boxGeometry args={[0.8, 1, 0.1]} />
      <meshPhysicalMaterial
        color={color}
        metalness={0.1}
        roughness={0.3}
        clearcoat={0.5}
        clearcoatRoughness={0.3}
      />
      {/* Spine detail */}
      <mesh position={[-0.35, 0, 0.01]}>
        <boxGeometry args={[0.08, 0.9, 0.08]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Page lines */}
      {[0.3, 0.1, -0.1, -0.3].map((y, i) => (
        <mesh key={i} position={[0.1, y, 0.06]}>
          <boxGeometry args={[0.4, 0.04, 0.01]} />
          <meshStandardMaterial color="#94a3b8" opacity={0.6} transparent />
        </mesh>
      ))}
    </mesh>
  )
}

function GlowingOrb({ position, color, size = 0.2 }: {
  position: [number, number, number]
  color: string
  size?: number
}) {
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh position={position}>
        <sphereGeometry args={[size, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          distort={0.3}
          speed={2}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  )
}

function FloatingRing({ position, color, size = 0.5 }: {
  position: [number, number, number]
  color: string
  size?: number
}) {
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = state.clock.elapsedTime * 0.3
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.2
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={ringRef} position={position}>
        <torusGeometry args={[size, 0.03, 16, 100]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </Float>
  )
}

function CheckmarkBadge({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.08)
    }
  })

  return (
    <Float speed={2.5} floatIntensity={0.4}>
      <group ref={groupRef} position={position}>
        <mesh>
          <circleGeometry args={[0.25, 32]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.4} />
        </mesh>
        {/* Checkmark */}
        <mesh position={[-0.05, -0.02, 0.01]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.1, 0.04, 0.02]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.05, 0.05, 0.01]} rotation={[0, 0, 0.8]}>
          <boxGeometry args={[0.15, 0.04, 0.02]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    </Float>
  )
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      {/* Floating books in background */}
      <FloatingBook
        position={[-2.2, 0.5, -1]}
        rotation={[0.1, 0.4, -0.1]}
        delay={0}
        color="#334155"
      />
      <FloatingBook
        position={[2.3, -0.3, -1.5]}
        rotation={[-0.05, -0.3, 0.08]}
        delay={1.5}
        color="#475569"
      />
      <FloatingBook
        position={[-1.8, -0.8, -0.5]}
        rotation={[0.08, 0.2, -0.05]}
        delay={3}
        color="#1e293b"
      />

      {/* Glowing orbs */}
      <GlowingOrb position={[2, 1.2, 0]} color="#10b981" size={0.15} />
      <GlowingOrb position={[-2.5, 0.8, 0.5]} color="#14b8a6" size={0.12} />
      <GlowingOrb position={[1.5, -1, 0.3]} color="#0d9488" size={0.1} />

      {/* Floating rings */}
      <FloatingRing position={[-1.5, 1.5, -0.5]} color="#10b981" size={0.4} />
      <FloatingRing position={[2.2, 0.5, -1]} color="#14b8a6" size={0.3} />

      {/* Checkmark badges */}
      <CheckmarkBadge position={[1.8, 1, 0.5]} />
      <CheckmarkBadge position={[-2, -0.5, 0.3]} />
    </group>
  )
}

export default function Guide3DDecor({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ pointerEvents: 'none' }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <pointLight position={[-5, -5, -5]} intensity={0.3} color="#3b82f6" />
          <pointLight position={[5, 2, 2]} intensity={0.4} color="#10b981" />
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  )
}
