'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

function FinTechEcosystem() {
  const rocketRef = useRef<THREE.Group>(null)
  const orbitsRef = useRef<THREE.Group>(null)
  const apiNodesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (rocketRef.current) {
      rocketRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.3
      rocketRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.05
    }
    if (orbitsRef.current) {
      orbitsRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
    if (apiNodesRef.current) {
      apiNodesRef.current.rotation.z = -state.clock.elapsedTime * 0.08
    }
  })

  return (
    <group>
      {/* Central FinTech Rocket (Growth/Scaling) */}
      <group ref={rocketRef}>
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
          {/* Rocket body */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.4, 2, 32]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#059669"
              emissiveIntensity={0.8}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>

          {/* Rocket nose cone */}
          <mesh position={[1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.3, 0.6, 32]} />
            <meshStandardMaterial
              color="#14b8a6"
              emissive="#10b981"
              emissiveIntensity={1.2}
              metalness={0.95}
              roughness={0.05}
            />
          </mesh>

          {/* Rocket fins */}
          {[...Array(3)].map((_, i) => {
            const angle = (i / 3) * Math.PI * 2
            return (
              <mesh
                key={i}
                position={[-0.8, Math.cos(angle) * 0.5, Math.sin(angle) * 0.5]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <boxGeometry args={[0.4, 0.6, 0.05]} />
                <meshStandardMaterial
                  color="#10b981"
                  emissive="#059669"
                  emissiveIntensity={0.6}
                  metalness={0.8}
                  roughness={0.2}
                />
              </mesh>
            )
          })}

          {/* Propulsion trail */}
          {[...Array(8)].map((_, i) => {
            const offset = -1.2 - i * 0.2
            const scale = 1 - i * 0.1
            return (
              <mesh key={`trail-${i}`} position={[offset, 0, 0]}>
                <sphereGeometry args={[0.15 * scale, 12, 12]} />
                <meshStandardMaterial
                  color="#fbbf24"
                  emissive="#f59e0b"
                  emissiveIntensity={2 - i * 0.2}
                  transparent
                  opacity={0.8 - i * 0.09}
                />
              </mesh>
            )
          })}

          {/* Growth indicator */}
          <mesh position={[0, 0.8, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={2}
            />
          </mesh>
        </Float>
      </group>

      {/* Innovation Orbits */}
      <group ref={orbitsRef}>
        {[2, 2.8, 3.6].map((radius, i) => (
          <mesh key={i} rotation={[Math.PI / 2 + i * 0.2, 0, i * 0.4]}>
            <torusGeometry args={[radius, 0.03, 16, 100]} />
            <meshStandardMaterial
              color="#14b8a6"
              emissive="#10b981"
              emissiveIntensity={0.5 - i * 0.1}
              transparent
              opacity={0.4 - i * 0.08}
            />
          </mesh>
        ))}

        {/* Innovation nodes on orbits */}
        {[...Array(6)].map((_, i) => {
          const angle = (i / 6) * Math.PI * 2
          const radius = 2.8
          return (
            <Float
              key={`innov-${i}`}
              speed={1.5 + i * 0.15}
              rotationIntensity={0.2}
              floatIntensity={0.3}
            >
              <mesh position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}>
                <dodecahedronGeometry args={[0.25]} />
                <meshPhysicalMaterial
                  color="#10b981"
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

      {/* API Gateway Nodes */}
      <group ref={apiNodesRef}>
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2
          const radius = 4.5
          return (
            <Float
              key={`api-${i}`}
              speed={2 + i * 0.1}
              rotationIntensity={0.15}
              floatIntensity={0.25}
            >
              <group position={[Math.cos(angle) * radius, Math.sin(angle) * radius * 0.6, Math.cos(angle * 2) * 0.5]}>
                {/* API node container */}
                <mesh>
                  <boxGeometry args={[0.6, 0.5, 0.2]} />
                  <meshPhysicalMaterial
                    color="#3b82f6"
                    transparent
                    opacity={0.15}
                    transmission={0.92}
                    roughness={0.05}
                    metalness={0.1}
                    thickness={0.3}
                    clearcoat={1}
                  />
                </mesh>

                {/* API frame */}
                <mesh>
                  <boxGeometry args={[0.65, 0.55, 0.25]} />
                  <meshStandardMaterial
                    color="#3b82f6"
                    wireframe
                    opacity={0.6}
                    transparent
                  />
                </mesh>

                {/* Connection status */}
                <mesh position={[0.25, 0.2, 0.11]}>
                  <sphereGeometry args={[0.05, 12, 12]} />
                  <meshStandardMaterial
                    color="#10b981"
                    emissive="#10b981"
                    emissiveIntensity={1.8}
                  />
                </mesh>

                {/* Data flow to center */}
                <mesh
                  position={[-Math.cos(angle) * radius * 0.5, -Math.sin(angle) * radius * 0.3, 0]}
                  rotation={[0, 0, angle]}
                >
                  <cylinderGeometry args={[0.015, 0.015, radius * 0.8, 8]} />
                  <meshStandardMaterial
                    color="#14b8a6"
                    emissive="#10b981"
                    emissiveIntensity={0.6}
                    transparent
                    opacity={0.4}
                  />
                </mesh>
              </group>
            </Float>
          )
        })}
      </group>

      {/* Authorization Pack Workflow */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
        <group position={[-4, 2, 0.5]}>
          {/* Workflow stages */}
          {[...Array(4)].map((_, i) => (
            <group key={i} position={[0, -i * 0.5, 0]}>
              <mesh>
                <boxGeometry args={[1.2, 0.35, 0.15]} />
                <meshStandardMaterial
                  color="#8b5cf6"
                  emissive="#7c3aed"
                  emissiveIntensity={0.6 - i * 0.1}
                  metalness={0.7}
                  roughness={0.3}
                />
              </mesh>

              {/* Stage completion indicator */}
              <mesh position={[0.5, 0, 0.08]}>
                <sphereGeometry args={[0.06, 12, 12]} />
                <meshStandardMaterial
                  color={i < 3 ? '#10b981' : '#fbbf24'}
                  emissive={i < 3 ? '#10b981' : '#f59e0b'}
                  emissiveIntensity={2}
                />
              </mesh>

              {/* Connection between stages */}
              {i < 3 && (
                <mesh position={[0, -0.25, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
                  <meshStandardMaterial
                    color="#a855f7"
                    emissive="#8b5cf6"
                    emissiveIntensity={0.5}
                  />
                </mesh>
              )}
            </group>
          ))}
        </group>
      </Float>

      {/* Agile Compliance Framework */}
      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.5}>
        <group position={[4, -2, 0.5]}>
          {/* Framework modules */}
          {[...Array(3)].map((_, i) => (
            <mesh key={i} position={[-0.7 + i * 0.7, 0, 0]}>
              <boxGeometry args={[0.5, 1.2, 0.2]} />
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
          ))}

          {/* Module connections */}
          {[...Array(2)].map((_, i) => (
            <mesh key={i} position={[-0.35 + i * 0.7, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 0.7, 8]} />
              <meshStandardMaterial
                color="#10b981"
                emissive="#10b981"
                emissiveIntensity={0.6}
              />
            </mesh>
          ))}

          {/* Agile sprint indicators */}
          {[...Array(6)].map((_, i) => (
            <mesh
              key={`sprint-${i}`}
              position={[-0.6 + (i % 3) * 0.6, 0.4 - Math.floor(i / 3) * 0.8, 0.11]}
            >
              <sphereGeometry args={[0.04, 12, 12]} />
              <meshStandardMaterial
                color="#14b8a6"
                emissive="#10b981"
                emissiveIntensity={1.5}
              />
            </mesh>
          ))}
        </group>
      </Float>

      {/* Cloud Infrastructure */}
      {[...Array(5)].map((_, i) => {
        const xPos = -3 + i * 1.5
        const yPos = 2.5 + Math.sin(i) * 0.5
        return (
          <Float
            key={`cloud-${i}`}
            speed={1.5 + i * 0.2}
            rotationIntensity={0.1}
            floatIntensity={0.3}
          >
            <group position={[xPos, yPos, -2]}>
              {/* Cloud blob */}
              <mesh>
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshStandardMaterial
                  color="#60a5fa"
                  emissive="#3b82f6"
                  emissiveIntensity={0.3}
                  transparent
                  opacity={0.5}
                />
              </mesh>
              <mesh position={[0.25, 0, 0]}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial
                  color="#60a5fa"
                  emissive="#3b82f6"
                  emissiveIntensity={0.3}
                  transparent
                  opacity={0.5}
                />
              </mesh>
            </group>
          </Float>
        )
      })}

      {/* Regulatory Tech Integration Points */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2 + Date.now() * 0.0002
        const radius = 3.5
        const height = Math.sin(angle * 2) * 1.5
        return (
          <mesh
            key={`regtech-${i}`}
            position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius * 0.5]}
          >
            <octahedronGeometry args={[0.08]} />
            <meshStandardMaterial
              color="#14b8a6"
              emissive="#10b981"
              emissiveIntensity={1.2}
              transparent
              opacity={0.8}
            />
          </mesh>
        )
      })}

      {/* Growth Metrics Dashboard */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
        <group position={[0, -3, 1]}>
          <mesh>
            <planeGeometry args={[2.5, 1]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive="#10b981"
              emissiveIntensity={0.15}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>

          {/* Growth chart bars */}
          {[...Array(7)].map((_, i) => (
            <mesh
              key={i}
              position={[-1 + i * 0.35, -0.3 + (i * 0.08), 0.01]}
            >
              <planeGeometry args={[0.2, 0.3 + i * 0.08]} />
              <meshBasicMaterial
                color="#10b981"
                opacity={0.6}
                transparent
              />
            </mesh>
          ))}

          {/* Metric indicators */}
          {[...Array(3)].map((_, i) => (
            <mesh
              key={`metric-${i}`}
              position={[-0.7 + i * 0.7, 0.35, 0.01]}
            >
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshStandardMaterial
                color="#fbbf24"
                emissive="#f59e0b"
                emissiveIntensity={2}
              />
            </mesh>
          ))}
        </group>
      </Float>
    </group>
  )
}

export default function FinTechSector3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 12], fov: 50 }} shadows>
        <ambientLight intensity={0.3} />
        <spotLight
          position={[12, 12, 12]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          castShadow
          color="#10b981"
        />
        <pointLight position={[-12, -12, -10]} intensity={0.8} color="#14b8a6" />
        <FinTechEcosystem />
      </Canvas>
    </div>
  )
}
