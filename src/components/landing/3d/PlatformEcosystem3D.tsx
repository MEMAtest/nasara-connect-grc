'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

function ExpandedPlatform() {
  const groupRef = useRef<THREE.Group>(null)
  const orbitRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.15
    }
    if (orbitRef.current) {
      orbitRef.current.rotation.z = state.clock.elapsedTime * 0.1
    }
  })

  const modules = [
    { position: [-3, 2, 0], color: '#3b82f6', label: 'Intelligence', size: [2, 1.8, 0.4], icon: '🧠' },
    { position: [3, 2, 0], color: '#f59e0b', label: 'Reconciliation', size: [2, 1.8, 0.4], icon: '⚡' },
    { position: [-3, -2, 0], color: '#8b5cf6', label: 'Framework', size: [2, 1.8, 0.4], icon: '🛡️' },
    { position: [3, -2, 0], color: '#10b981', label: 'Risk', size: [2, 1.8, 0.4], icon: '📊' },
  ]

  return (
    <group ref={groupRef}>
      {/* Central Hub Core */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
        <group>
          {/* Glowing Core Sphere */}
          <mesh>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#059669"
              emissiveIntensity={1}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>

          {/* Core Rings */}
          {[1.3, 1.6, 1.9].map((radius, i) => (
            <mesh key={i} rotation={[Math.PI / 2, 0, i * 0.3]}>
              <torusGeometry args={[radius, 0.08, 16, 100]} />
              <meshStandardMaterial
                color="#10b981"
                emissive="#10b981"
                emissiveIntensity={0.8 - i * 0.2}
                transparent
                opacity={0.6 - i * 0.15}
              />
            </mesh>
          ))}
        </group>
      </Float>

      {/* Module Blocks */}
      {modules.map((module, i) => (
        <Float
          key={i}
          speed={1.5 + i * 0.1}
          rotationIntensity={0.15}
          floatIntensity={0.3}
        >
          <group position={module.position as [number, number, number]}>
            {/* Glass Module Container */}
            <mesh castShadow>
              <boxGeometry args={module.size as [number, number, number]} />
              <meshPhysicalMaterial
                color={module.color}
                transparent
                opacity={0.15}
                transmission={0.95}
                roughness={0.05}
                metalness={0.1}
                thickness={0.5}
                clearcoat={1}
                clearcoatRoughness={0.05}
              />
            </mesh>

            {/* Frame */}
            <mesh>
              <boxGeometry args={[
                module.size[0] + 0.05,
                module.size[1] + 0.05,
                module.size[2] + 0.05
              ] as [number, number, number]} />
              <meshStandardMaterial
                color={module.color}
                wireframe
                opacity={0.8}
                transparent
              />
            </mesh>

            {/* Module Label Panel */}
            <mesh position={[0, 0, module.size[2] / 2 + 0.02]}>
              <planeGeometry args={[module.size[0] - 0.4, 0.4]} />
              <meshStandardMaterial
                color={module.color}
                emissive={module.color}
                emissiveIntensity={0.6}
                transparent
                opacity={0.9}
              />
            </mesh>

            {/* Active Status Indicator */}
            <mesh position={[module.size[0] / 2 - 0.3, module.size[1] / 2 - 0.3, module.size[2] / 2 + 0.05]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial
                color="#10b981"
                emissive="#10b981"
                emissiveIntensity={2}
              />
            </mesh>

            {/* Connection Line to Center */}
            <mesh
              position={[
                -module.position[0] / 2,
                -module.position[1] / 2,
                0
              ]}
              rotation={[
                0,
                0,
                Math.atan2(module.position[1], module.position[0])
              ]}
            >
              <cylinderGeometry
                args={[
                  0.04,
                  0.04,
                  Math.sqrt(module.position[0]**2 + module.position[1]**2) - 1.5,
                  8
                ]}
              />
              <meshStandardMaterial
                color={module.color}
                emissive={module.color}
                emissiveIntensity={0.8}
                transparent
                opacity={0.5}
              />
            </mesh>

            {/* Data Flow Particles */}
            {[...Array(3)].map((_, j) => {
              const progress = (state.clock?.getElapsedTime() || 0 + i + j * 0.3) % 1
              const x = -module.position[0] / 2 + (module.position[0] / 2) * progress
              const y = -module.position[1] / 2 + (module.position[1] / 2) * progress

              return (
                <mesh key={j} position={[x, y, 0]}>
                  <sphereGeometry args={[0.08, 12, 12]} />
                  <meshStandardMaterial
                    color={module.color}
                    emissive={module.color}
                    emissiveIntensity={2}
                  />
                </mesh>
              )
            })}
          </group>
        </Float>
      ))}

      {/* Orbiting Data Nodes */}
      <group ref={orbitRef}>
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2
          const radius = 5
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
            >
              <octahedronGeometry args={[0.15]} />
              <meshStandardMaterial
                color="#10b981"
                emissive="#10b981"
                emissiveIntensity={1.5}
                transparent
                opacity={0.8}
              />
            </mesh>
          )
        })}
      </group>

      {/* Ambient Energy Particles */}
      {[...Array(30)].map((_, i) => {
        const angle = (i / 30) * Math.PI * 2
        const radius = 4 + Math.random() * 2
        const height = (Math.random() - 0.5) * 6
        return (
          <mesh
            key={`ambient-${i}`}
            position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius]}
          >
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial
              color="#14b8a6"
              emissive="#14b8a6"
              emissiveIntensity={1}
              transparent
              opacity={0.6}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export default function PlatformEcosystem3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 12], fov: 50 }} shadows>
        <ambientLight intensity={0.3} />
        <spotLight
          position={[15, 15, 15]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          castShadow
          color="#10b981"
        />
        <pointLight position={[-15, -15, -10]} intensity={0.8} color="#14b8a6" />
        <ExpandedPlatform />
      </Canvas>
    </div>
  )
}
