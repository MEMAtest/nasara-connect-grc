'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

function ValueVisualization() {
  const pyramidRef = useRef<THREE.Group>(null)
  const coinsRef = useRef<THREE.Group>(null)
  const savingsRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (pyramidRef.current) {
      pyramidRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
    if (coinsRef.current) {
      coinsRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
    if (savingsRef.current) {
      savingsRef.current.children.forEach((child, i) => {
        const progress = (state.clock.elapsedTime * 0.5 + i * 0.2) % 1
        child.position.y = -2 + progress * 5
        const scale = 1 - Math.abs(progress - 0.5) * 0.5
        child.scale.set(scale, scale, scale)
      })
    }
  })

  // Value tiers (pyramid structure)
  const tiers = [
    { position: [0, -1.5, 0], size: [3, 0.5, 2], color: '#3b82f6', label: 'Starter', value: '£3.5k' },
    { position: [0, -0.5, 0], size: [2.5, 0.5, 1.6], color: '#10b981', label: 'Professional', value: '£7k' },
    { position: [0, 0.5, 0], size: [2, 0.5, 1.2], color: '#8b5cf6', label: 'Enterprise', value: 'Custom' },
  ]

  return (
    <group>
      {/* Value Pyramid Stack */}
      <group ref={pyramidRef}>
        {tiers.map((tier, i) => (
          <Float
            key={i}
            speed={1.5 + i * 0.2}
            rotationIntensity={0.1}
            floatIntensity={0.2}
          >
            <group position={tier.position as [number, number, number]}>
              {/* Tier block */}
              <mesh castShadow>
                <boxGeometry args={tier.size as [number, number, number]} />
                <meshPhysicalMaterial
                  color={tier.color}
                  transparent
                  opacity={0.15}
                  transmission={0.92}
                  roughness={0.05}
                  metalness={0.1}
                  thickness={0.5}
                  clearcoat={1}
                />
              </mesh>

              {/* Tier frame */}
              <mesh>
                <boxGeometry args={[
                  tier.size[0] + 0.05,
                  tier.size[1] + 0.05,
                  tier.size[2] + 0.05
                ] as [number, number, number]} />
                <meshStandardMaterial
                  color={tier.color}
                  wireframe
                  opacity={0.6}
                  transparent
                />
              </mesh>

              {/* Price label plate */}
              <Float speed={2} floatIntensity={0.15}>
                <group position={[tier.size[0] / 2 + 0.5, 0, 0]}>
                  <mesh>
                    <planeGeometry args={[0.8, 0.4]} />
                    <meshStandardMaterial
                      color="#1e293b"
                      emissive={tier.color}
                      emissiveIntensity={0.15}
                      metalness={0.8}
                      roughness={0.2}
                    />
                  </mesh>
                  {/* Price indicator */}
                  <mesh position={[0, 0, 0.01]}>
                    <planeGeometry args={[0.6, 0.15]} />
                    <meshBasicMaterial
                      color={tier.color}
                      opacity={0.5}
                      transparent
                    />
                  </mesh>
                </group>
              </Float>

              {/* Value multiplier indicators */}
              {[...Array(3)].map((_, j) => (
                <mesh
                  key={j}
                  position={[
                    -tier.size[0] / 2 + (j + 1) * (tier.size[0] / 4),
                    tier.size[1] / 2 + 0.05,
                    0
                  ]}
                >
                  <sphereGeometry args={[0.08, 16, 16]} />
                  <meshStandardMaterial
                    color={tier.color}
                    emissive={tier.color}
                    emissiveIntensity={1.5}
                  />
                </mesh>
              ))}

              {/* Feature indicators on sides */}
              {[...Array(i + 2)].map((_, j) => (
                <mesh
                  key={`feature-${j}`}
                  position={[
                    0,
                    0,
                    tier.size[2] / 2 + 0.02
                  ]}
                  rotation={[0, (j / (i + 2)) * Math.PI * 2, 0]}
                >
                  <boxGeometry args={[0.15, 0.15, 0.05]} />
                  <meshStandardMaterial
                    color={tier.color}
                    emissive={tier.color}
                    emissiveIntensity={0.6}
                  />
                </mesh>
              ))}
            </group>
          </Float>
        ))}
      </group>

      {/* ROI Growth Arrow */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <group position={[0, 2, 0]}>
          <mesh rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.4, 0.8, 16]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#059669"
              emissiveIntensity={1.2}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>

          {/* Growth percentage indicator */}
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 1.5, 16]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#059669"
              emissiveIntensity={0.8}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>

          {/* 300% ROI rings */}
          {[0.5, 0.6, 0.7].map((radius, i) => (
            <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
              <torusGeometry args={[radius, 0.04, 16, 100]} />
              <meshStandardMaterial
                color="#10b981"
                emissive="#10b981"
                emissiveIntensity={0.8 - i * 0.15}
                transparent
                opacity={0.7}
              />
            </mesh>
          ))}
        </group>
      </Float>

      {/* Orbiting Cost Savings Coins */}
      <group ref={coinsRef}>
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2
          const radius = 4
          const height = Math.sin(angle * 2) * 1.5
          return (
            <Float
              key={`coin-${i}`}
              speed={1.5 + i * 0.1}
              rotationIntensity={0.3}
              floatIntensity={0.2}
            >
              <mesh
                position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius]}
                rotation={[Math.PI / 2, 0, angle]}
              >
                <cylinderGeometry args={[0.25, 0.25, 0.1, 32]} />
                <meshStandardMaterial
                  color="#fbbf24"
                  emissive="#f59e0b"
                  emissiveIntensity={0.8}
                  metalness={0.9}
                  roughness={0.1}
                />
              </mesh>
            </Float>
          )
        })}
      </group>

      {/* Savings Flow Particles */}
      <group ref={savingsRef}>
        {[...Array(15)].map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={1.5}
            />
          </mesh>
        ))}
      </group>

      {/* Cost Reduction Gauge */}
      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.5}>
        <group position={[-4, 0, 0]}>
          {/* Gauge background */}
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <ringGeometry args={[0.8, 1, 32, 1, 0, Math.PI]} />
            <meshStandardMaterial
              color="#334155"
              emissive="#475569"
              emissiveIntensity={0.2}
            />
          </mesh>

          {/* Gauge fill (60% reduction) */}
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <ringGeometry args={[0.8, 1, 32, 1, 0, Math.PI * 0.6]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#059669"
              emissiveIntensity={1}
            />
          </mesh>

          {/* Gauge needle */}
          <mesh rotation={[0, 0, -Math.PI * 0.3]} position={[0.1, 0, 0]}>
            <boxGeometry args={[0.05, 1, 0.05]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#dc2626"
              emissiveIntensity={1}
            />
          </mesh>

          {/* 60% label */}
          <mesh position={[0.2, -0.5, 0]}>
            <planeGeometry args={[0.6, 0.3]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      </Float>

      {/* Time Saved Clock */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
        <group position={[4, 0, 0]}>
          {/* Clock face */}
          <mesh>
            <cylinderGeometry args={[1, 1, 0.2, 32]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive="#3b82f6"
              emissiveIntensity={0.2}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>

          {/* Clock ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.11]}>
            <torusGeometry args={[1, 0.05, 16, 100]} />
            <meshStandardMaterial
              color="#3b82f6"
              emissive="#2563eb"
              emissiveIntensity={0.8}
            />
          </mesh>

          {/* Hour markers */}
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.85, 0, Math.sin(angle) * 0.85]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <cylinderGeometry args={[0.05, 0.05, 0.15, 8]} />
                <meshStandardMaterial
                  color="#60a5fa"
                  emissive="#3b82f6"
                  emissiveIntensity={0.6}
                />
              </mesh>
            )
          })}

          {/* Clock hands */}
          <mesh rotation={[0, 0, -Math.PI / 4]} position={[0.25, 0, 0.11]}>
            <boxGeometry args={[0.5, 0.06, 0.02]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={1.2}
            />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 6]} position={[0.35, 0, 0.12]}>
            <boxGeometry args={[0.7, 0.04, 0.02]} />
            <meshStandardMaterial
              color="#14b8a6"
              emissive="#10b981"
              emissiveIntensity={1}
            />
          </mesh>

          {/* Time saved label */}
          <mesh position={[0, -1.5, 0]}>
            <planeGeometry args={[1.5, 0.4]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive="#10b981"
              emissiveIntensity={0.15}
            />
          </mesh>
          <mesh position={[0, -1.5, 0.01]}>
            <planeGeometry args={[1.2, 0.2]} />
            <meshBasicMaterial
              color="#10b981"
              opacity={0.5}
              transparent
            />
          </mesh>
        </group>
      </Float>

      {/* Payback Period Timeline */}
      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.5}>
        <group position={[0, -3, 0]}>
          {/* Timeline bar */}
          <mesh>
            <boxGeometry args={[4, 0.2, 0.3]} />
            <meshStandardMaterial
              color="#334155"
              emissive="#475569"
              emissiveIntensity={0.3}
            />
          </mesh>

          {/* Progress (6 months) */}
          <mesh position={[-1, 0, 0.16]}>
            <boxGeometry args={[2, 0.25, 0.05]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#059669"
              emissiveIntensity={0.8}
            />
          </mesh>

          {/* Milestone markers */}
          {[0, 3, 6, 9, 12].map((month, i) => (
            <mesh
              key={i}
              position={[-2 + i, -0.3, 0]}
            >
              <cylinderGeometry args={[0.08, 0.08, 0.3, 16]} />
              <meshStandardMaterial
                color={month <= 6 ? '#10b981' : '#475569'}
                emissive={month <= 6 ? '#10b981' : '#475569'}
                emissiveIntensity={month <= 6 ? 1 : 0.2}
              />
            </mesh>
          ))}

          {/* 6 month indicator */}
          <mesh position={[0, 0.6, 0]}>
            <coneGeometry args={[0.2, 0.4, 16]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={1.5}
            />
          </mesh>
        </group>
      </Float>

      {/* Value Multiplier Indicators */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 5
        const height = (Math.random() - 0.5) * 4
        return (
          <mesh
            key={`value-${i}`}
            position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius]}
          >
            <octahedronGeometry args={[0.15]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#8b5cf6"
              emissiveIntensity={1.2}
              transparent
              opacity={0.8}
            />
          </mesh>
        )
      })}

      {/* Investment vs Return Comparison */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
        <group position={[0, 2.5, -2]}>
          {/* Investment bar (smaller) */}
          <mesh position={[-0.8, 0, 0]}>
            <boxGeometry args={[0.5, 1, 0.3]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#dc2626"
              emissiveIntensity={0.6}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>

          {/* Return bar (3x larger) */}
          <mesh position={[0.8, 0.5, 0]}>
            <boxGeometry args={[0.5, 3, 0.3]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#059669"
              emissiveIntensity={0.8}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>

          {/* 3x multiplier indicator */}
          <mesh position={[0.8, 2.2, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      </Float>
    </group>
  )
}

export default function PricingValue3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [6, 2, 8], fov: 50 }} shadows>
        <ambientLight intensity={0.3} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          castShadow
          color="#10b981"
        />
        <pointLight position={[-10, -10, -8]} intensity={0.8} color="#14b8a6" />
        <ValueVisualization />
      </Canvas>
    </div>
  )
}
