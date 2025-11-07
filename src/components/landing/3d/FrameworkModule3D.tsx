'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

function FrameworkLayers() {
  const groupRef = useRef<THREE.Group>(null)
  const shieldRef = useRef<THREE.Group>(null)
  const badgeRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
    if (shieldRef.current) {
      shieldRef.current.rotation.z = state.clock.elapsedTime * 0.08
    }
    if (badgeRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.08 + 1
      badgeRef.current.scale.set(pulse, pulse, pulse)
    }
  })

  const layers = [
    { position: [0, 1.2, 0], color: '#8b5cf6', label: 'Policies', size: [1.8, 0.6, 0.3] },
    { position: [0, 0.4, 0], color: '#a855f7', label: 'Controls', size: [1.8, 0.6, 0.3] },
    { position: [0, -0.4, 0], color: '#c084fc', label: 'Records', size: [1.8, 0.6, 0.3] },
    { position: [0, -1.2, 0], color: '#d8b4fe', label: 'Audit', size: [1.8, 0.6, 0.3] },
  ]

  return (
    <group ref={groupRef}>
      {/* Central Compliance Badge */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
        <group position={[0, 0, 0.5]}>
          <mesh ref={badgeRef}>
            <cylinderGeometry args={[0.6, 0.6, 0.25, 32]} />
            <meshStandardMaterial
              color="#8b5cf6"
              emissive="#7c3aed"
              emissiveIntensity={0.8}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          {/* Audit badge ring */}
          <mesh position={[0, 0, 0.13]} rotation={[0, 0, 0]}>
            <ringGeometry args={[0.4, 0.55, 32]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#059669"
              emissiveIntensity={1.3}
            />
          </mesh>
          {/* Checkmark indicator */}
          <mesh position={[0, 0, 0.18]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      </Float>

      {/* Framework Layers */}
      {layers.map((layer, i) => (
        <Float
          key={i}
          speed={1.5 + i * 0.1}
          rotationIntensity={0.15}
          floatIntensity={0.25}
        >
          <group position={layer.position as [number, number, number]}>
            {/* Layer Container */}
            <mesh castShadow>
              <boxGeometry args={layer.size as [number, number, number]} />
              <meshPhysicalMaterial
                color={layer.color}
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
              <boxGeometry args={[
                layer.size[0] + 0.05,
                layer.size[1] + 0.05,
                layer.size[2] + 0.05
              ] as [number, number, number]} />
              <meshStandardMaterial
                color={layer.color}
                wireframe
                opacity={0.7}
                transparent
              />
            </mesh>

            {/* Status indicators */}
            {[...Array(3)].map((_, j) => (
              <mesh
                key={j}
                position={[-0.5 + j * 0.5, layer.size[1] / 2 - 0.15, layer.size[2] / 2 + 0.05]}
              >
                <sphereGeometry args={[0.05, 12, 12]} />
                <meshStandardMaterial
                  color="#10b981"
                  emissive="#10b981"
                  emissiveIntensity={1.5}
                />
              </mesh>
            ))}

            {/* Document icons */}
            {[...Array(2)].map((_, j) => (
              <mesh
                key={`doc-${j}`}
                position={[-0.4 + j * 0.8, 0, layer.size[2] / 2 + 0.02]}
              >
                <planeGeometry args={[0.3, 0.4]} />
                <meshStandardMaterial
                  color={layer.color}
                  emissive={layer.color}
                  emissiveIntensity={0.5}
                  transparent
                  opacity={0.8}
                />
              </mesh>
            ))}

            {/* Connection lines between layers */}
            {i < layers.length - 1 && (
              <mesh position={[0, -0.4, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
                <meshStandardMaterial
                  color={layer.color}
                  emissive={layer.color}
                  emissiveIntensity={0.6}
                  transparent
                  opacity={0.5}
                />
              </mesh>
            )}
          </group>
        </Float>
      ))}

      {/* Protective Shield Rings */}
      <group ref={shieldRef}>
        {[2, 2.4, 2.8].map((radius, i) => (
          <mesh key={`shield-${i}`} rotation={[Math.PI / 2, 0, i * 0.3]}>
            <torusGeometry args={[radius, 0.03, 16, 100]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#8b5cf6"
              emissiveIntensity={0.4 - i * 0.1}
              transparent
              opacity={0.3 - i * 0.08}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        ))}
      </group>

      {/* Orbiting Compliance Markers */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2 + Date.now() * 0.0003
        const radius = 2.2
        return (
          <mesh
            key={`marker-${i}`}
            position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
          >
            <boxGeometry args={[0.3, 0.25, 0.04]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={0.8}
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
        )
      })}

      {/* Resolution Pack Indicator */}
      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.5}>
        <group position={[2.5, -1.5, 0.8]}>
          <mesh>
            <boxGeometry args={[1.2, 0.8, 0.15]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive="#8b5cf6"
              emissiveIntensity={0.2}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          {/* Status checkmarks */}
          {[...Array(3)].map((_, i) => (
            <mesh key={i} position={[-0.3 + i * 0.3, 0.15 - i * 0.12, 0.08]}>
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

      {/* Compliance Score Display */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
        <group position={[-2.5, 1.5, 0.8]}>
          <mesh>
            <planeGeometry args={[1, 0.6]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive="#8b5cf6"
              emissiveIntensity={0.15}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
          {/* Score bars */}
          {[...Array(4)].map((_, i) => (
            <mesh key={i} position={[-0.3, 0.15 - i * 0.12, 0.01]}>
              <planeGeometry args={[0.5 + Math.random() * 0.2, 0.04]} />
              <meshBasicMaterial
                color="#a855f7"
                opacity={0.6}
                transparent
              />
            </mesh>
          ))}
        </group>
      </Float>
    </group>
  )
}

export default function FrameworkModule3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }} shadows>
        <ambientLight intensity={0.3} />
        <spotLight
          position={[8, 8, 8]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          castShadow
          color="#8b5cf6"
        />
        <pointLight position={[-8, -8, -5]} intensity={0.8} color="#a855f7" />
        <FrameworkLayers />
      </Canvas>
    </div>
  )
}
