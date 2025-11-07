'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

function InsuranceEcosystem() {
  const pillarsRef = useRef<THREE.Group>(null)
  const distributionRef = useRef<THREE.Group>(null)
  const shieldRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (pillarsRef.current) {
      pillarsRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
    if (distributionRef.current) {
      distributionRef.current.rotation.z = -state.clock.elapsedTime * 0.08
    }
    if (shieldRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.08 + 1
      shieldRef.current.scale.set(pulse, pulse, pulse)
    }
  })

  // Solvency II Pillars
  const solvencyPillars = [
    { position: [-2.5, 0, 0], color: '#f97316', label: 'Pillar I', height: 3, desc: 'Quantitative' },
    { position: [0, 0, 0], color: '#ea580c', label: 'Pillar II', height: 3.5, desc: 'Qualitative' },
    { position: [2.5, 0, 0], color: '#dc2626', label: 'Pillar III', height: 3, desc: 'Disclosure' },
  ]

  return (
    <group>
      {/* Solvency II Pillars */}
      <group ref={pillarsRef}>
        {solvencyPillars.map((pillar, i) => (
          <Float
            key={i}
            speed={1.5 + i * 0.2}
            rotationIntensity={0.1}
            floatIntensity={0.25}
          >
            <group position={pillar.position as [number, number, number]}>
              {/* Main pillar */}
              <mesh position={[0, pillar.height / 2 - 1.5, 0]}>
                <cylinderGeometry args={[0.4, 0.5, pillar.height, 6]} />
                <meshPhysicalMaterial
                  color={pillar.color}
                  transparent
                  opacity={0.18}
                  transmission={0.92}
                  roughness={0.05}
                  metalness={0.2}
                  thickness={0.4}
                  clearcoat={1}
                />
              </mesh>

              {/* Pillar wireframe */}
              <mesh position={[0, pillar.height / 2 - 1.5, 0]}>
                <cylinderGeometry args={[0.42, 0.52, pillar.height + 0.1, 6]} />
                <meshStandardMaterial
                  color={pillar.color}
                  wireframe
                  opacity={0.6}
                  transparent
                />
              </mesh>

              {/* Pillar capital */}
              <mesh position={[0, pillar.height - 1.3, 0]}>
                <cylinderGeometry args={[0.55, 0.45, 0.3, 6]} />
                <meshStandardMaterial
                  color={pillar.color}
                  emissive={pillar.color}
                  emissiveIntensity={0.6}
                  metalness={0.85}
                  roughness={0.15}
                />
              </mesh>

              {/* SCR/MCR indicators */}
              {[...Array(4)].map((_, j) => (
                <mesh
                  key={j}
                  position={[0, -1 + j * 0.9, 0]}
                  rotation={[0, (j * Math.PI) / 3, 0]}
                >
                  <torusGeometry args={[0.45, 0.025, 8, 32]} />
                  <meshStandardMaterial
                    color={pillar.color}
                    emissive={pillar.color}
                    emissiveIntensity={0.5 - j * 0.1}
                    transparent
                    opacity={0.6}
                  />
                </mesh>
              ))}

              {/* Status indicator */}
              <mesh position={[0, 0.2, 0]}>
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshStandardMaterial
                  color="#10b981"
                  emissive="#10b981"
                  emissiveIntensity={1.8}
                />
              </mesh>
            </group>
          </Float>
        ))}
      </group>

      {/* Customer Protection Shield */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
        <group position={[0, -2.5, 0]}>
          <mesh ref={shieldRef}>
            <sphereGeometry args={[0.7, 32, 32]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#059669"
              emissiveIntensity={1.1}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>

          {/* Protection layers */}
          {[0.9, 1.1, 1.3].map((radius, i) => (
            <mesh key={i} rotation={[Math.PI / 2, 0, i * 0.4]}>
              <torusGeometry args={[radius, 0.045, 16, 100]} />
              <meshStandardMaterial
                color="#10b981"
                emissive="#10b981"
                emissiveIntensity={0.7 - i * 0.15}
                transparent
                opacity={0.5 - i * 0.1}
              />
            </mesh>
          ))}

          {/* Consumer Duty indicators */}
          {[...Array(4)].map((_, i) => {
            const angle = (i / 4) * Math.PI * 2
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, 0]}
              >
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial
                  color="#14b8a6"
                  emissive="#10b981"
                  emissiveIntensity={1.5}
                />
              </mesh>
            )
          })}
        </group>
      </Float>

      {/* Distribution Network */}
      <group ref={distributionRef}>
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2
          const radius = 5
          return (
            <Float
              key={`dist-${i}`}
              speed={1.5 + i * 0.1}
              rotationIntensity={0.15}
              floatIntensity={0.25}
            >
              <group position={[Math.cos(angle) * radius, Math.sin(angle) * radius * 0.6, Math.sin(angle * 2) * 0.8]}>
                {/* Distributor/Agent node */}
                <mesh>
                  <boxGeometry args={[0.6, 0.5, 0.25]} />
                  <meshPhysicalMaterial
                    color="#3b82f6"
                    transparent
                    opacity={0.15}
                    transmission={0.92}
                    roughness={0.05}
                    metalness={0.1}
                    thickness={0.35}
                    clearcoat={1}
                  />
                </mesh>

                {/* Frame */}
                <mesh>
                  <boxGeometry args={[0.65, 0.55, 0.3]} />
                  <meshStandardMaterial
                    color="#3b82f6"
                    wireframe
                    opacity={0.6}
                    transparent
                  />
                </mesh>

                {/* AR/Appointed Rep indicator */}
                <mesh position={[0.25, 0.2, 0.13]}>
                  <sphereGeometry args={[0.06, 12, 12]} />
                  <meshStandardMaterial
                    color="#10b981"
                    emissive="#10b981"
                    emissiveIntensity={1.8}
                  />
                </mesh>

                {/* IDD compliance link */}
                <mesh
                  position={[-Math.cos(angle) * radius * 0.5, -Math.sin(angle) * radius * 0.3, 0]}
                  rotation={[0, 0, angle]}
                >
                  <cylinderGeometry args={[0.015, 0.015, radius * 0.7, 8]} />
                  <meshStandardMaterial
                    color="#60a5fa"
                    emissive="#3b82f6"
                    emissiveIntensity={0.6}
                    transparent
                    opacity={0.4}
                  />
                </mesh>

                {/* Distribution flow particles */}
                {i % 2 === 0 && (
                  <mesh position={[-Math.cos(angle) * 2, -Math.sin(angle) * 1.2, 0]}>
                    <sphereGeometry args={[0.08, 12, 12]} />
                    <meshStandardMaterial
                      color="#60a5fa"
                      emissive="#3b82f6"
                      emissiveIntensity={1.5}
                    />
                  </mesh>
                )}
              </group>
            </Float>
          )
        })}
      </group>

      {/* ORSA Process Framework */}
      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.5}>
        <group position={[-5, 2, 1]}>
          <mesh>
            <planeGeometry args={[2.2, 1.8]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive="#f97316"
              emissiveIntensity={0.15}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>

          {/* ORSA cycle stages */}
          {[...Array(4)].map((_, i) => {
            const angle = (i / 4) * Math.PI * 2 - Math.PI / 2
            const radius = 0.6
            return (
              <group
                key={i}
                position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0.01]}
              >
                <mesh>
                  <circleGeometry args={[0.15, 32]} />
                  <meshStandardMaterial
                    color="#fb923c"
                    emissive="#f97316"
                    emissiveIntensity={0.8}
                  />
                </mesh>
                {/* Connection to next stage */}
                {i < 3 && (
                  <mesh
                    position={[
                      (Math.cos(angle) + Math.cos(angle + Math.PI / 2)) * radius * 0.3,
                      (Math.sin(angle) + Math.sin(angle + Math.PI / 2)) * radius * 0.3,
                      0
                    ]}
                    rotation={[0, 0, angle + Math.PI / 4]}
                  >
                    <planeGeometry args={[0.4, 0.03]} />
                    <meshBasicMaterial color="#f97316" opacity={0.6} transparent />
                  </mesh>
                )}
              </group>
            )
          })}
        </group>
      </Float>

      {/* Claims Processing Pipeline */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
        <group position={[5, -2, 1]}>
          {[...Array(5)].map((_, i) => (
            <group key={i} position={[-1 + i * 0.5, 0, 0]}>
              {/* Stage container */}
              <mesh>
                <cylinderGeometry args={[0.15, 0.15, 0.6, 16]} />
                <meshStandardMaterial
                  color="#8b5cf6"
                  emissive="#7c3aed"
                  emissiveIntensity={0.5}
                  metalness={0.7}
                  roughness={0.3}
                />
              </mesh>

              {/* Processing status */}
              <mesh position={[0, 0.35, 0]}>
                <sphereGeometry args={[0.06, 12, 12]} />
                <meshStandardMaterial
                  color={i < 4 ? '#10b981' : '#fbbf24'}
                  emissive={i < 4 ? '#10b981' : '#f59e0b'}
                  emissiveIntensity={2}
                />
              </mesh>

              {/* Flow connector */}
              {i < 4 && (
                <mesh position={[0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
                  <meshStandardMaterial
                    color="#a855f7"
                    emissive="#8b5cf6"
                    emissiveIntensity={0.5}
                  />
                </mesh>
              )}
            </group>
          ))}

          {/* Claims ratio indicator */}
          <mesh position={[0, -0.6, 0.01]}>
            <planeGeometry args={[2.2, 0.25]} />
            <meshBasicMaterial color="#10b981" opacity={0.5} transparent />
          </mesh>
        </group>
      </Float>

      {/* Product Value Assessment */}
      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.5}>
        <group position={[0, 3.5, 1]}>
          <mesh>
            <planeGeometry args={[2.5, 1.2]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive="#10b981"
              emissiveIntensity={0.15}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>

          {/* Value metrics */}
          {[...Array(6)].map((_, i) => (
            <group key={i} position={[-1 + (i % 3) * 1, 0.35 - Math.floor(i / 3) * 0.7, 0.01]}>
              <mesh position={[-0.15, 0, 0]}>
                <planeGeometry args={[0.5, 0.12]} />
                <meshBasicMaterial
                  color="#10b981"
                  opacity={0.5}
                  transparent
                />
              </mesh>
              <mesh position={[0.2, 0, 0]}>
                <sphereGeometry args={[0.04, 12, 12]} />
                <meshStandardMaterial
                  color="#14b8a6"
                  emissive="#10b981"
                  emissiveIntensity={1.8}
                />
              </mesh>
            </group>
          ))}
        </group>
      </Float>

      {/* Capital Model Nodes */}
      {[...Array(10)].map((_, i) => {
        const angle = (i / 10) * Math.PI * 2
        const radius = 3.5 + Math.random() * 0.5
        const height = (Math.random() - 0.5) * 3
        return (
          <Float
            key={`capital-${i}`}
            speed={1.5 + i * 0.1}
            rotationIntensity={0.1}
            floatIntensity={0.2}
          >
            <mesh position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius * 0.5]}>
              <octahedronGeometry args={[0.12]} />
              <meshStandardMaterial
                color="#fb923c"
                emissive="#f97316"
                emissiveIntensity={1.2}
                transparent
                opacity={0.8}
              />
            </mesh>
          </Float>
        )
      })}

      {/* Risk Appetite Framework */}
      {[...Array(3)].map((_, i) => {
        const radius = 4 + i * 0.5
        return (
          <mesh key={`risk-${i}`} rotation={[Math.PI / 2, 0, i * 0.3]}>
            <torusGeometry args={[radius, 0.04, 16, 100, Math.PI * 1.5]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#dc2626"
              emissiveIntensity={0.4 - i * 0.1}
              transparent
              opacity={0.3 - i * 0.06}
            />
          </mesh>
        )
      })}

      {/* Regulatory Reporting Streams */}
      {[...Array(15)].map((_, i) => {
        const angle = (i / 15) * Math.PI * 2 + Date.now() * 0.0002
        const radius = 2.5 + Math.random() * 1
        const height = (Math.random() - 0.5) * 4
        return (
          <mesh
            key={`report-${i}`}
            position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius * 0.5]}
          >
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial
              color="#fb923c"
              emissive="#f97316"
              emissiveIntensity={1}
              transparent
              opacity={0.7}
            />
          </mesh>
        )
      })}

      {/* Third-Party Administration Nodes */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2
        const radius = 6.5
        return (
          <Float
            key={`tpa-${i}`}
            speed={2 + i * 0.15}
            rotationIntensity={0.2}
            floatIntensity={0.3}
          >
            <mesh position={[Math.cos(angle) * radius, Math.sin(angle) * radius * 0.4, 0]}>
              <dodecahedronGeometry args={[0.25]} />
              <meshPhysicalMaterial
                color="#14b8a6"
                transparent
                opacity={0.2}
                transmission={0.9}
                roughness={0.1}
                metalness={0.3}
                thickness={0.3}
                clearcoat={1}
              />
            </mesh>
          </Float>
        )
      })}
    </group>
  )
}

export default function InsuranceSector3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 1, 13], fov: 50 }} shadows>
        <ambientLight intensity={0.3} />
        <spotLight
          position={[12, 12, 12]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          castShadow
          color="#f97316"
        />
        <pointLight position={[-12, -12, -10]} intensity={0.8} color="#fb923c" />
        <InsuranceEcosystem />
      </Canvas>
    </div>
  )
}
