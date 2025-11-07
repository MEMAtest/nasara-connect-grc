'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

function BankingInfrastructure() {
  const buildingRef = useRef<THREE.Group>(null)
  const pillarsRef = useRef<THREE.Group>(null)
  const shieldRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (buildingRef.current) {
      buildingRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
    if (pillarsRef.current) {
      pillarsRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
    if (shieldRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 1
      shieldRef.current.scale.set(pulse, pulse, pulse)
    }
  })

  // Three Pillars of Regulation
  const pillars = [
    { position: [-2, 0, 0], color: '#3b82f6', label: 'Pillar I', height: 2.5 },
    { position: [0, 0, 0], color: '#2563eb', label: 'Pillar II', height: 3 },
    { position: [2, 0, 0], color: '#1d4ed8', label: 'Pillar III', height: 2.5 },
  ]

  return (
    <group>
      {/* Central Bank Building */}
      <group ref={buildingRef}>
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
          {/* Main vault structure */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[3, 2, 2]} />
            <meshPhysicalMaterial
              color="#1e40af"
              transparent
              opacity={0.15}
              transmission={0.92}
              roughness={0.05}
              metalness={0.1}
              thickness={0.5}
              clearcoat={1}
              clearcoatRoughness={0.05}
            />
          </mesh>

          {/* Building frame */}
          <mesh>
            <boxGeometry args={[3.1, 2.1, 2.1]} />
            <meshStandardMaterial
              color="#3b82f6"
              wireframe
              opacity={0.6}
              transparent
            />
          </mesh>

          {/* Vault door indicator */}
          <mesh position={[0, 0, 1.01]}>
            <circleGeometry args={[0.4, 32]} />
            <meshStandardMaterial
              color="#60a5fa"
              emissive="#3b82f6"
              emissiveIntensity={1.2}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>

          {/* Security layers */}
          {[...Array(4)].map((_, i) => (
            <mesh key={i} position={[0, 0, 1.02]} rotation={[0, 0, (i * Math.PI) / 4]}>
              <ringGeometry args={[0.3 + i * 0.05, 0.32 + i * 0.05, 32]} />
              <meshStandardMaterial
                color="#60a5fa"
                emissive="#3b82f6"
                emissiveIntensity={0.8 - i * 0.15}
                transparent
                opacity={0.7}
              />
            </mesh>
          ))}

          {/* Capital adequacy bars */}
          {[...Array(5)].map((_, i) => (
            <mesh key={`cap-${i}`} position={[-1.2 + i * 0.3, 0.7, 1.01]}>
              <boxGeometry args={[0.15, 0.3 + Math.random() * 0.4, 0.05]} />
              <meshStandardMaterial
                color="#10b981"
                emissive="#059669"
                emissiveIntensity={0.8}
                transparent
                opacity={0.9}
              />
            </mesh>
          ))}
        </Float>
      </group>

      {/* Regulatory Pillars */}
      <group ref={pillarsRef}>
        {pillars.map((pillar, i) => (
          <Float
            key={i}
            speed={1.5 + i * 0.2}
            rotationIntensity={0.1}
            floatIntensity={0.2}
          >
            <group position={pillar.position as [number, number, number]}>
              {/* Pillar structure */}
              <mesh position={[0, pillar.height / 2 - 1, 0]}>
                <cylinderGeometry args={[0.3, 0.35, pillar.height, 8]} />
                <meshPhysicalMaterial
                  color={pillar.color}
                  transparent
                  opacity={0.2}
                  transmission={0.9}
                  roughness={0.1}
                  metalness={0.3}
                  thickness={0.3}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                />
              </mesh>

              {/* Pillar edges */}
              <mesh position={[0, pillar.height / 2 - 1, 0]}>
                <cylinderGeometry args={[0.32, 0.37, pillar.height + 0.1, 8]} />
                <meshStandardMaterial
                  color={pillar.color}
                  wireframe
                  opacity={0.5}
                  transparent
                />
              </mesh>

              {/* Capital top */}
              <mesh position={[0, pillar.height - 0.8, 0]}>
                <cylinderGeometry args={[0.45, 0.35, 0.2, 8]} />
                <meshStandardMaterial
                  color={pillar.color}
                  emissive={pillar.color}
                  emissiveIntensity={0.5}
                  metalness={0.8}
                  roughness={0.2}
                />
              </mesh>

              {/* Pillar label indicator */}
              <mesh position={[0, 0.5, 0]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial
                  color="#60a5fa"
                  emissive="#3b82f6"
                  emissiveIntensity={1.5}
                />
              </mesh>

              {/* Requirement bands */}
              {[...Array(3)].map((_, j) => (
                <mesh
                  key={j}
                  position={[0, -0.5 + j * 0.8, 0]}
                  rotation={[0, (j * Math.PI) / 3, 0]}
                >
                  <torusGeometry args={[0.35, 0.02, 8, 32]} />
                  <meshStandardMaterial
                    color="#60a5fa"
                    emissive="#3b82f6"
                    emissiveIntensity={0.4}
                    transparent
                    opacity={0.6}
                  />
                </mesh>
              ))}
            </group>
          </Float>
        ))}
      </group>

      {/* Customer Protection Shield */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
        <mesh ref={shieldRef} position={[0, -2, 0]} rotation={[0, 0, 0]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#059669"
            emissiveIntensity={1}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Shield protection rings */}
        {[0.8, 1, 1.2].map((radius, i) => (
          <mesh key={i} position={[0, -2, 0]} rotation={[Math.PI / 2, 0, i * 0.3]}>
            <torusGeometry args={[radius, 0.04, 16, 100]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={0.7 - i * 0.15}
              transparent
              opacity={0.5 - i * 0.1}
            />
          </mesh>
        ))}
      </Float>

      {/* KYC/AML Monitoring Nodes */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 4
        return (
          <Float
            key={`kyc-${i}`}
            speed={1.5 + i * 0.1}
            rotationIntensity={0.1}
            floatIntensity={0.2}
          >
            <group position={[Math.cos(angle) * radius, Math.sin(angle) * radius * 0.5, Math.sin(angle) * radius * 0.3]}>
              {/* Monitoring node */}
              <mesh>
                <octahedronGeometry args={[0.2]} />
                <meshStandardMaterial
                  color="#f59e0b"
                  emissive="#f59e0b"
                  emissiveIntensity={1.2}
                  transparent
                  opacity={0.8}
                />
              </mesh>

              {/* Alert indicator */}
              {i % 3 === 0 && (
                <mesh position={[0, 0.3, 0]}>
                  <sphereGeometry args={[0.06, 12, 12]} />
                  <meshStandardMaterial
                    color="#ef4444"
                    emissive="#dc2626"
                    emissiveIntensity={2}
                  />
                </mesh>
              )}
            </group>
          </Float>
        )
      })}

      {/* Prudential Reporting Dashboard */}
      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.5}>
        <group position={[-4, 1.5, 0.8]}>
          <mesh>
            <planeGeometry args={[2, 1.5]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive="#3b82f6"
              emissiveIntensity={0.15}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>

          {/* Report indicators */}
          {[...Array(6)].map((_, i) => (
            <group key={i} position={[-0.7 + (i % 2) * 1.4, 0.5 - Math.floor(i / 2) * 0.4, 0.01]}>
              <mesh position={[-0.2, 0, 0]}>
                <planeGeometry args={[0.5, 0.15]} />
                <meshBasicMaterial
                  color="#3b82f6"
                  opacity={0.5}
                  transparent
                />
              </mesh>
              <mesh position={[0.2, 0, 0]}>
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

      {/* SMCR Framework Layers */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <group position={[4, -1, 0.8]}>
          {[...Array(3)].map((_, i) => (
            <mesh key={i} position={[0, i * 0.4, 0]}>
              <boxGeometry args={[1.5, 0.3, 0.15]} />
              <meshStandardMaterial
                color="#8b5cf6"
                emissive="#7c3aed"
                emissiveIntensity={0.5 - i * 0.1}
                transparent
                opacity={0.8}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
          ))}

          {/* Accountability markers */}
          {[...Array(4)].map((_, i) => (
            <mesh key={`marker-${i}`} position={[-0.5 + i * 0.35, 0.7, 0.08]}>
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshStandardMaterial
                color="#a855f7"
                emissive="#8b5cf6"
                emissiveIntensity={1.5}
              />
            </mesh>
          ))}
        </group>
      </Float>

      {/* Transaction Monitoring Streams */}
      {[...Array(15)].map((_, i) => {
        const angle = (i / 15) * Math.PI * 2 + Date.now() * 0.0001
        const radius = 3 + Math.random() * 0.5
        const height = (Math.random() - 0.5) * 3
        return (
          <mesh
            key={`stream-${i}`}
            position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius]}
          >
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial
              color="#60a5fa"
              emissive="#3b82f6"
              emissiveIntensity={1}
              transparent
              opacity={0.7}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export default function BankingSector3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }} shadows>
        <ambientLight intensity={0.3} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          castShadow
          color="#3b82f6"
        />
        <pointLight position={[-10, -10, -8]} intensity={0.8} color="#60a5fa" />
        <BankingInfrastructure />
      </Canvas>
    </div>
  )
}
