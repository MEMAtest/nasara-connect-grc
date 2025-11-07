'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

function IntegrationNetwork() {
  const hubRef = useRef<THREE.Mesh>(null)
  const ringsRef = useRef<THREE.Group>(null)
  const systemsRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (hubRef.current) {
      hubRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.z = state.clock.elapsedTime * 0.05
    }
    if (systemsRef.current) {
      systemsRef.current.rotation.z = -state.clock.elapsedTime * 0.03
    }
  })

  // External systems to integrate with
  const systems = [
    { position: [0, 3, 0], color: '#3b82f6', label: 'Banking Core', icon: '🏦' },
    { position: [2.6, 1.5, 0], color: '#10b981', label: 'Payment Gateway', icon: '💳' },
    { position: [2.6, -1.5, 0], color: '#f59e0b', label: 'ID Verification', icon: '🔐' },
    { position: [0, -3, 0], color: '#8b5cf6', label: 'CRM', icon: '👥' },
    { position: [-2.6, -1.5, 0], color: '#ef4444', label: 'Risk Engine', icon: '⚠️' },
    { position: [-2.6, 1.5, 0], color: '#14b8a6', label: 'Document Store', icon: '📄' },
  ]

  return (
    <group>
      {/* Central MEMA Connect Hub */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
        <group>
          <mesh ref={hubRef}>
            <sphereGeometry args={[0.8, 32, 32]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#059669"
              emissiveIntensity={1}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>

          {/* Hub Energy Rings */}
          {[1, 1.2, 1.4].map((radius, i) => (
            <mesh key={i} rotation={[Math.PI / 2, 0, i * 0.4]}>
              <torusGeometry args={[radius, 0.05, 16, 100]} />
              <meshStandardMaterial
                color="#10b981"
                emissive="#10b981"
                emissiveIntensity={0.8 - i * 0.2}
                transparent
                opacity={0.6 - i * 0.15}
              />
            </mesh>
          ))}

          {/* Hub core pulse */}
          <mesh>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial
              color="#14b8a6"
              emissive="#14b8a6"
              emissiveIntensity={1.5}
            />
          </mesh>
        </group>
      </Float>

      {/* Integration Ring */}
      <group ref={ringsRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.5, 0.08, 16, 100]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#059669"
            emissiveIntensity={0.4}
            transparent
            opacity={0.3}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* External Systems */}
      <group ref={systemsRef}>
        {systems.map((system, i) => (
          <Float
            key={i}
            speed={1.5 + i * 0.1}
            rotationIntensity={0.15}
            floatIntensity={0.3}
          >
            <group position={system.position as [number, number, number]}>
              {/* System Container */}
              <mesh castShadow>
                <boxGeometry args={[1, 0.8, 0.3]} />
                <meshPhysicalMaterial
                  color={system.color}
                  transparent
                  opacity={0.15}
                  transmission={0.92}
                  roughness={0.05}
                  metalness={0.1}
                  thickness={0.4}
                  clearcoat={1}
                  clearcoatRoughness={0.05}
                />
              </mesh>

              {/* Frame */}
              <mesh>
                <boxGeometry args={[1.05, 0.85, 0.35]} />
                <meshStandardMaterial
                  color={system.color}
                  wireframe
                  opacity={0.7}
                  transparent
                />
              </mesh>

              {/* System status indicator */}
              <mesh position={[0.4, 0.3, 0.16]}>
                <sphereGeometry args={[0.06, 12, 12]} />
                <meshStandardMaterial
                  color="#10b981"
                  emissive="#10b981"
                  emissiveIntensity={1.8}
                />
              </mesh>

              {/* System icon representation */}
              <mesh position={[0, 0, 0.16]}>
                <planeGeometry args={[0.5, 0.4]} />
                <meshStandardMaterial
                  color={system.color}
                  emissive={system.color}
                  emissiveIntensity={0.5}
                  transparent
                  opacity={0.8}
                />
              </mesh>

              {/* Connection Line to Hub */}
              <mesh
                position={[
                  -system.position[0] / 2,
                  -system.position[1] / 2,
                  0
                ]}
                rotation={[
                  0,
                  0,
                  Math.atan2(system.position[1], system.position[0])
                ]}
              >
                <cylinderGeometry
                  args={[
                    0.03,
                    0.03,
                    Math.sqrt(system.position[0]**2 + system.position[1]**2) - 1.3,
                    8
                  ]}
                />
                <meshStandardMaterial
                  color={system.color}
                  emissive={system.color}
                  emissiveIntensity={0.7}
                  transparent
                  opacity={0.5}
                />
              </mesh>

              {/* Data Flow Particles */}
              {[...Array(2)].map((_, j) => {
                const progress = ((Date.now() * 0.001 + i + j * 0.5) % 1)
                const x = -system.position[0] / 2 + (system.position[0] / 2) * progress
                const y = -system.position[1] / 2 + (system.position[1] / 2) * progress

                return (
                  <mesh key={j} position={[x, y, 0]}>
                    <sphereGeometry args={[0.06, 12, 12]} />
                    <meshStandardMaterial
                      color={system.color}
                      emissive={system.color}
                      emissiveIntensity={2}
                    />
                  </mesh>
                )
              })}
            </group>
          </Float>
        ))}
      </group>

      {/* API Gateway Nodes */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const radius = 2.2
        return (
          <mesh
            key={`api-${i}`}
            position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
          >
            <octahedronGeometry args={[0.1]} />
            <meshStandardMaterial
              color="#14b8a6"
              emissive="#14b8a6"
              emissiveIntensity={1.2}
              transparent
              opacity={0.8}
            />
          </mesh>
        )
      })}

      {/* Security Shield */}
      {[...Array(3)].map((_, i) => {
        const radius = 4 + i * 0.3
        return (
          <mesh key={`shield-${i}`} rotation={[Math.PI / 2, 0, i * 0.2]}>
            <torusGeometry args={[radius, 0.04, 16, 100, Math.PI]} />
            <meshStandardMaterial
              color="#3b82f6"
              emissive="#2563eb"
              emissiveIntensity={0.3 - i * 0.08}
              transparent
              opacity={0.2 - i * 0.05}
            />
          </mesh>
        )
      })}

      {/* Integration Status Panel */}
      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.5}>
        <group position={[4, 0, 1]}>
          <mesh>
            <planeGeometry args={[1.8, 1.2]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive="#10b981"
              emissiveIntensity={0.15}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          {/* Connection status indicators */}
          {[...Array(6)].map((_, i) => (
            <group key={i} position={[-0.6 + (i % 2) * 1.2, 0.4 - Math.floor(i / 2) * 0.3, 0.01]}>
              <mesh position={[-0.3, 0, 0]}>
                <planeGeometry args={[0.4, 0.12]} />
                <meshBasicMaterial
                  color="#10b981"
                  opacity={0.5}
                  transparent
                />
              </mesh>
              <mesh position={[0.15, 0, 0]}>
                <sphereGeometry args={[0.04, 12, 12]} />
                <meshStandardMaterial
                  color="#10b981"
                  emissive="#10b981"
                  emissiveIntensity={2}
                />
              </mesh>
            </group>
          ))}
        </group>
      </Float>

      {/* Ambient Data Particles */}
      {[...Array(20)].map((_, i) => {
        const angle = (i / 20) * Math.PI * 2
        const radius = 2.5 + Math.random() * 1.5
        const height = (Math.random() - 0.5) * 4
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

export default function IntegrationEcosystem3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }} shadows>
        <ambientLight intensity={0.3} />
        <spotLight
          position={[12, 12, 12]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          castShadow
          color="#10b981"
        />
        <pointLight position={[-12, -12, -8]} intensity={0.8} color="#14b8a6" />
        <IntegrationNetwork />
      </Canvas>
    </div>
  )
}
