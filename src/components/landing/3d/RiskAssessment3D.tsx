'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Text } from '@react-three/drei'
import * as THREE from 'three'

function RiskMeter() {
  const needleRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (needleRef.current) {
      // Needle oscillates between low and medium risk
      needleRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.5 - 0.3
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1)
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Meter background arc */}
      <mesh rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[1.5, 0.15, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Risk zones - Green */}
      <mesh rotation={[0, 0, Math.PI]} position={[0, 0, 0.05]}>
        <torusGeometry args={[1.5, 0.12, 16, 16, Math.PI * 0.33]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.3} />
      </mesh>

      {/* Risk zones - Yellow */}
      <mesh rotation={[0, 0, Math.PI * 0.67]} position={[0, 0, 0.05]}>
        <torusGeometry args={[1.5, 0.12, 16, 16, Math.PI * 0.33]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.3} />
      </mesh>

      {/* Risk zones - Red */}
      <mesh rotation={[0, 0, Math.PI * 0.33]} position={[0, 0, 0.05]}>
        <torusGeometry args={[1.5, 0.12, 16, 16, Math.PI * 0.33]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
      </mesh>

      {/* Needle */}
      <mesh ref={needleRef} position={[0, 0, 0.1]}>
        <boxGeometry args={[0.08, 1.3, 0.05]} />
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Center cap */}
      <mesh position={[0, 0, 0.15]} ref={glowRef}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
}

function RiskIndicator({ position, risk, label }: { position: [number, number, number], risk: 'low' | 'medium' | 'high', label: string }) {
  const colors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444'
  }

  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1)
    }
  })

  return (
    <Float speed={2} floatIntensity={0.3}>
      <group position={position}>
        <mesh ref={meshRef}>
          <boxGeometry args={[0.4, 0.4, 0.1]} />
          <meshStandardMaterial color={colors[risk]} emissive={colors[risk]} emissiveIntensity={0.5} />
        </mesh>
      </group>
    </Float>
  )
}

function HeatMapGrid() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  const cells = [
    { pos: [-0.5, 0.5, 0], color: '#10b981' },
    { pos: [0, 0.5, 0], color: '#10b981' },
    { pos: [0.5, 0.5, 0], color: '#f59e0b' },
    { pos: [-0.5, 0, 0], color: '#10b981' },
    { pos: [0, 0, 0], color: '#f59e0b' },
    { pos: [0.5, 0, 0], color: '#ef4444' },
    { pos: [-0.5, -0.5, 0], color: '#f59e0b' },
    { pos: [0, -0.5, 0], color: '#ef4444' },
    { pos: [0.5, -0.5, 0], color: '#ef4444' },
  ]

  return (
    <group ref={groupRef} position={[-1.8, 0.5, 0]} rotation={[0.2, 0.3, 0]}>
      {cells.map((cell, i) => (
        <mesh key={i} position={cell.pos as [number, number, number]}>
          <boxGeometry args={[0.45, 0.45, 0.1]} />
          <meshStandardMaterial
            color={cell.color}
            emissive={cell.color}
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
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
      <RiskMeter />
      <HeatMapGrid />

      {/* Floating risk indicators */}
      <RiskIndicator position={[1.8, 0.8, 0]} risk="low" label="Ops" />
      <RiskIndicator position={[2, 0, 0]} risk="medium" label="Fin" />
      <RiskIndicator position={[1.8, -0.8, 0]} risk="high" label="Reg" />

      {/* Warning triangle */}
      <Float speed={3} floatIntensity={0.4}>
        <mesh position={[0, -1.5, 0]}>
          <coneGeometry args={[0.3, 0.5, 3]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} />
        </mesh>
      </Float>
    </group>
  )
}

export default function RiskAssessment3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-3, 3, 3]} intensity={0.5} color="#ef4444" />
        <pointLight position={[3, -3, 3]} intensity={0.5} color="#10b981" />
        <Scene />
      </Canvas>
    </div>
  )
}
