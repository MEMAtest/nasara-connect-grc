'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

function AssetManagementStructure() {
  const portfolioRef = useRef<THREE.Group>(null)
  const orbitsRef = useRef<THREE.Group>(null)
  const esgRingRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (portfolioRef.current) {
      portfolioRef.current.rotation.y = state.clock.elapsedTime * 0.15
    }
    if (orbitsRef.current) {
      orbitsRef.current.rotation.y = -state.clock.elapsedTime * 0.08
    }
    if (esgRingRef.current) {
      esgRingRef.current.rotation.z = state.clock.elapsedTime * 0.2
    }
  })

  // Asset allocation segments
  const assetClasses = [
    { angle: 0, size: 1.2, color: '#8b5cf6', label: 'Equities' },
    { angle: Math.PI * 0.4, size: 0.9, color: '#a855f7', label: 'Fixed Income' },
    { angle: Math.PI * 0.8, size: 0.7, color: '#c084fc', label: 'Alternatives' },
    { angle: Math.PI * 1.2, size: 0.6, color: '#d8b4fe', label: 'Cash' },
    { angle: Math.PI * 1.6, size: 0.8, color: '#e9d5ff', label: 'Real Assets' },
  ]

  return (
    <group>
      {/* Central Portfolio Core */}
      <group ref={portfolioRef}>
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
          {/* Core NAV sphere */}
          <mesh>
            <sphereGeometry args={[0.8, 32, 32]} />
            <meshStandardMaterial
              color="#8b5cf6"
              emissive="#7c3aed"
              emissiveIntensity={1}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>

          {/* NAV calculation rings */}
          {[1, 1.2, 1.4].map((radius, i) => (
            <mesh key={i} rotation={[Math.PI / 2, 0, i * 0.5]}>
              <torusGeometry args={[radius, 0.04, 16, 100]} />
              <meshStandardMaterial
                color="#a855f7"
                emissive="#8b5cf6"
                emissiveIntensity={0.7 - i * 0.15}
                transparent
                opacity={0.5 - i * 0.1}
              />
            </mesh>
          ))}

          {/* Asset allocation segments */}
          {assetClasses.map((asset, i) => (
            <Float
              key={i}
              speed={1.5 + i * 0.1}
              rotationIntensity={0.15}
              floatIntensity={0.2}
            >
              <group
                position={[
                  Math.cos(asset.angle) * 2.5,
                  Math.sin(asset.angle) * 2.5,
                  0
                ]}
              >
                {/* Asset class container */}
                <mesh>
                  <boxGeometry args={[asset.size, asset.size * 0.8, 0.3]} />
                  <meshPhysicalMaterial
                    color={asset.color}
                    transparent
                    opacity={0.15}
                    transmission={0.92}
                    roughness={0.05}
                    metalness={0.1}
                    thickness={0.4}
                    clearcoat={1}
                  />
                </mesh>

                {/* Asset frame */}
                <mesh>
                  <boxGeometry args={[asset.size + 0.05, asset.size * 0.8 + 0.05, 0.35]} />
                  <meshStandardMaterial
                    color={asset.color}
                    wireframe
                    opacity={0.6}
                    transparent
                  />
                </mesh>

                {/* Performance indicator */}
                <mesh position={[0, asset.size * 0.3, 0.16]}>
                  <sphereGeometry args={[0.08, 12, 12]} />
                  <meshStandardMaterial
                    color={i % 2 === 0 ? '#10b981' : '#fbbf24'}
                    emissive={i % 2 === 0 ? '#10b981' : '#f59e0b'}
                    emissiveIntensity={1.8}
                  />
                </mesh>

                {/* Connection to center */}
                <mesh
                  position={[
                    -Math.cos(asset.angle) * 1.25,
                    -Math.sin(asset.angle) * 1.25,
                    0
                  ]}
                  rotation={[0, 0, asset.angle]}
                >
                  <cylinderGeometry args={[0.02, 0.02, 1.5, 8]} />
                  <meshStandardMaterial
                    color={asset.color}
                    emissive={asset.color}
                    emissiveIntensity={0.6}
                    transparent
                    opacity={0.5}
                  />
                </mesh>
              </group>
            </Float>
          ))}
        </Float>
      </group>

      {/* MiFID II Compliance Orbits */}
      <group ref={orbitsRef}>
        {[3.5, 4, 4.5].map((radius, i) => (
          <mesh key={i} rotation={[Math.PI / 2 + i * 0.15, 0, i * 0.3]}>
            <torusGeometry args={[radius, 0.03, 16, 100]} />
            <meshStandardMaterial
              color="#3b82f6"
              emissive="#2563eb"
              emissiveIntensity={0.4 - i * 0.1}
              transparent
              opacity={0.3 - i * 0.06}
            />
          </mesh>
        ))}

        {/* Transaction reporting nodes */}
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2
          const radius = 4
          return (
            <Float
              key={`txn-${i}`}
              speed={1.5 + i * 0.1}
              rotationIntensity={0.1}
              floatIntensity={0.2}
            >
              <mesh position={[Math.cos(angle) * radius, Math.sin(angle) * radius * 0.7, Math.sin(angle * 2) * 0.5]}>
                <octahedronGeometry args={[0.15]} />
                <meshStandardMaterial
                  color="#3b82f6"
                  emissive="#2563eb"
                  emissiveIntensity={1}
                  transparent
                  opacity={0.8}
                />
              </mesh>
            </Float>
          )
        })}
      </group>

      {/* ESG Disclosure Ring */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
        <group>
          <mesh ref={esgRingRef} rotation={[0, Math.PI / 4, 0]}>
            <torusGeometry args={[5, 0.15, 16, 100, Math.PI * 1.5]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#059669"
              emissiveIntensity={0.8}
              transparent
              opacity={0.6}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>

          {/* ESG pillars (Environmental, Social, Governance) */}
          {['E', 'S', 'G'].map((letter, i) => {
            const angle = (i / 3) * Math.PI * 1.5
            const radius = 5
            return (
              <Float key={i} speed={2 + i * 0.2} floatIntensity={0.3}>
                <mesh
                  position={[
                    Math.cos(angle + Math.PI / 4) * radius,
                    Math.sin(angle + Math.PI / 4) * radius,
                    0
                  ]}
                >
                  <boxGeometry args={[0.6, 0.6, 0.2]} />
                  <meshStandardMaterial
                    color="#10b981"
                    emissive="#059669"
                    emissiveIntensity={0.8}
                    metalness={0.7}
                    roughness={0.3}
                  />
                </mesh>
              </Float>
            )
          })}
        </group>
      </Float>

      {/* Fund Governance Board */}
      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.5}>
        <group position={[-4.5, 2, 0.8]}>
          <mesh>
            <planeGeometry args={[2, 1.5]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive="#8b5cf6"
              emissiveIntensity={0.15}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>

          {/* Board members / oversight indicators */}
          {[...Array(6)].map((_, i) => (
            <group key={i} position={[-0.7 + (i % 3) * 0.7, 0.5 - Math.floor(i / 3) * 0.6, 0.01]}>
              <mesh>
                <circleGeometry args={[0.15, 32]} />
                <meshStandardMaterial
                  color="#a855f7"
                  emissive="#8b5cf6"
                  emissiveIntensity={0.5}
                />
              </mesh>
              <mesh position={[0, -0.25, 0]}>
                <planeGeometry args={[0.25, 0.15]} />
                <meshBasicMaterial
                  color="#c084fc"
                  opacity={0.6}
                  transparent
                />
              </mesh>
            </group>
          ))}
        </group>
      </Float>

      {/* Liquidity Monitoring Panel */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
        <group position={[4.5, -2, 0.8]}>
          <mesh>
            <planeGeometry args={[2, 1.2]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive="#3b82f6"
              emissiveIntensity={0.15}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>

          {/* Liquidity buckets */}
          {[...Array(5)].map((_, i) => (
            <mesh
              key={i}
              position={[-0.7 + i * 0.35, -0.3, 0.01]}
            >
              <planeGeometry args={[0.25, 0.4 + i * 0.08]} />
              <meshBasicMaterial
                color="#60a5fa"
                opacity={0.6}
                transparent
              />
            </mesh>
          ))}

          {/* Risk threshold indicators */}
          {[...Array(3)].map((_, i) => (
            <mesh
              key={`risk-${i}`}
              position={[-0.6 + i * 0.6, 0.4, 0.01]}
            >
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshStandardMaterial
                color="#10b981"
                emissive="#10b981"
                emissiveIntensity={2}
              />
            </mesh>
          ))}
        </group>
      </Float>

      {/* Investment Mandate Boundaries */}
      {[...Array(4)].map((_, i) => {
        const angle = (i / 4) * Math.PI * 2
        const radius = 6
        return (
          <Float
            key={`mandate-${i}`}
            speed={1.5 + i * 0.15}
            rotationIntensity={0.2}
            floatIntensity={0.3}
          >
            <group position={[Math.cos(angle) * radius, Math.sin(angle) * radius * 0.5, 0]}>
              {/* Mandate checkpoint */}
              <mesh>
                <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
                <meshStandardMaterial
                  color="#f59e0b"
                  emissive="#f59e0b"
                  emissiveIntensity={0.8}
                  metalness={0.7}
                  roughness={0.3}
                />
              </mesh>

              {/* Compliance status */}
              <mesh position={[0, 0.5, 0]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial
                  color="#10b981"
                  emissive="#10b981"
                  emissiveIntensity={1.8}
                />
              </mesh>
            </group>
          </Float>
        )
      })}

      {/* Depositary Oversight Nodes */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2
        const radius = 3
        const height = 2 + Math.sin(angle * 2) * 0.5
        return (
          <Float
            key={`dep-${i}`}
            speed={2 + i * 0.1}
            rotationIntensity={0.15}
            floatIntensity={0.25}
          >
            <group position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius * 0.5]}>
              <mesh>
                <dodecahedronGeometry args={[0.2]} />
                <meshPhysicalMaterial
                  color="#f59e0b"
                  transparent
                  opacity={0.2}
                  transmission={0.9}
                  roughness={0.1}
                  metalness={0.3}
                  thickness={0.3}
                  clearcoat={1}
                />
              </mesh>

              <mesh>
                <sphereGeometry args={[0.06, 12, 12]} />
                <meshStandardMaterial
                  color="#fb923c"
                  emissive="#f59e0b"
                  emissiveIntensity={1.5}
                />
              </mesh>
            </group>
          </Float>
        )
      })}

      {/* Investor Reporting Documents */}
      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.5}>
        <group position={[0, -3.5, 1]}>
          {[...Array(4)].map((_, i) => (
            <mesh
              key={i}
              position={[-1 + i * 0.7, 0, i * 0.05]}
              rotation={[0, i * 0.1, 0]}
            >
              <planeGeometry args={[0.5, 0.7]} />
              <meshStandardMaterial
                color="#1e293b"
                emissive="#8b5cf6"
                emissiveIntensity={0.2}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
          ))}

          {/* Document status indicators */}
          {[...Array(4)].map((_, i) => (
            <mesh
              key={`status-${i}`}
              position={[-0.85 + i * 0.7, 0.25, 0.06]}
            >
              <sphereGeometry args={[0.04, 12, 12]} />
              <meshStandardMaterial
                color="#10b981"
                emissive="#10b981"
                emissiveIntensity={2}
              />
            </mesh>
          ))}
        </group>
      </Float>

      {/* Portfolio Monitoring Streams */}
      {[...Array(20)].map((_, i) => {
        const angle = (i / 20) * Math.PI * 2 + Date.now() * 0.0002
        const radius = 2 + Math.random() * 1.5
        const height = (Math.random() - 0.5) * 4
        return (
          <mesh
            key={`stream-${i}`}
            position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius * 0.5]}
          >
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#8b5cf6"
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

export default function AssetManagementSector3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 2, 12], fov: 50 }} shadows>
        <ambientLight intensity={0.3} />
        <spotLight
          position={[12, 12, 12]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          castShadow
          color="#8b5cf6"
        />
        <pointLight position={[-12, -12, -10]} intensity={0.8} color="#a855f7" />
        <AssetManagementStructure />
      </Canvas>
    </div>
  )
}
