'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

function PolicyDocument({ position, color, version }: { position: [number, number, number], color: string, version: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + version) * 0.05
    }
  })

  return (
    <group position={position}>
      {/* Document */}
      <mesh ref={meshRef}>
        <boxGeometry args={[1.4, 1.8, 0.08]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.5} />
      </mesh>
      {/* Header bar */}
      <mesh position={[0, 0.7, 0.05]}>
        <boxGeometry args={[1.2, 0.2, 0.02]} />
        <meshStandardMaterial color="#8b5cf6" />
      </mesh>
      {/* Content lines */}
      {[-0.1, -0.3, -0.5].map((y, i) => (
        <mesh key={i} position={[0, y, 0.05]}>
          <boxGeometry args={[1, 0.06, 0.01]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      ))}
      {/* Version badge */}
      <mesh position={[0.5, -0.75, 0.05]}>
        <boxGeometry args={[0.3, 0.15, 0.02]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

function VersionTimeline() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
    }
  })

  return (
    <group ref={groupRef} position={[-2, 0, 0]}>
      {/* Timeline bar */}
      <mesh>
        <boxGeometry args={[0.1, 3, 0.05]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      {/* Version nodes */}
      {[1, 0.3, -0.4, -1.1].map((y, i) => (
        <group key={i} position={[0, y, 0]}>
          <mesh>
            <sphereGeometry args={[0.12, 32, 32]} />
            <meshStandardMaterial
              color={i === 0 ? '#10b981' : '#8b5cf6'}
              emissive={i === 0 ? '#10b981' : '#8b5cf6'}
              emissiveIntensity={i === 0 ? 0.5 : 0.2}
            />
          </mesh>
          {/* Connection line */}
          <mesh position={[0.3, 0, 0]}>
            <boxGeometry args={[0.4, 0.02, 0.02]} />
            <meshStandardMaterial color="#8b5cf6" transparent opacity={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function AttestationBadge() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })

  return (
    <Float speed={2} floatIntensity={0.3}>
      <group ref={groupRef} position={[1.8, 1, 0]}>
        {/* Badge circle */}
        <mesh>
          <torusGeometry args={[0.35, 0.08, 16, 32]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.6} roughness={0.2} />
        </mesh>
        {/* Check inside */}
        <mesh position={[0, 0, 0.05]}>
          <circleGeometry args={[0.25, 32]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
      </group>
    </Float>
  )
}

function AutoUpdateIndicator() {
  const groupRef = useRef<THREE.Group>(null)
  const arrowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (arrowRef.current) {
      arrowRef.current.rotation.z = state.clock.elapsedTime * 2
    }
  })

  return (
    <Float speed={3} floatIntensity={0.4}>
      <group position={[1.8, -0.8, 0]}>
        {/* Circular arrow */}
        <mesh ref={arrowRef}>
          <torusGeometry args={[0.3, 0.05, 8, 32, Math.PI * 1.5]} />
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
        </mesh>
        {/* Arrow head */}
        <mesh position={[0.3, 0, 0]} rotation={[0, 0, -0.5]}>
          <coneGeometry args={[0.08, 0.15, 3]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
      </group>
    </Float>
  )
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* Stacked policy documents */}
      <PolicyDocument position={[0.3, -0.3, -0.2]} color="#1e293b" version={1} />
      <PolicyDocument position={[0.15, -0.1, -0.1]} color="#334155" version={2} />
      <PolicyDocument position={[0, 0.1, 0]} color="#475569" version={3} />

      <VersionTimeline />
      <AttestationBadge />
      <AutoUpdateIndicator />

      {/* 50+ indicator */}
      <Float speed={2} floatIntensity={0.2}>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[0.8, 0.4, 0.1]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.3} />
        </mesh>
      </Float>
    </group>
  )
}

export default function PolicyManagement3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-3, 3, 3]} intensity={0.5} color="#8b5cf6" />
        <pointLight position={[3, -3, 3]} intensity={0.5} color="#10b981" />
        <Scene />
      </Canvas>
    </div>
  )
}
