'use client'

import { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

function EcosystemStructure() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
  })

  const modules = [
    { position: [-2, 2, 0], color: '#10b981', label: 'Intelligence', size: [1.8, 1.5, 0.3] },
    { position: [2, 2, 0], color: '#3b82f6', label: 'Risk', size: [1.8, 1.5, 0.3] },
    { position: [-2, -0.5, 0], color: '#f59e0b', label: 'Reconciliation', size: [1.8, 1.5, 0.3] },
    { position: [2, -0.5, 0], color: '#8b5cf6', label: 'Framework', size: [1.8, 1.5, 0.3] },
  ]

  return (
    <group ref={groupRef}>
      {/* Central Hub */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh position={[0, 0.5, 0.5]}>
          <torusGeometry args={[1.2, 0.15, 16, 100]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#059669"
            emissiveIntensity={0.8}
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.95}
          />
        </mesh>
      </Float>

      {/* Module Blocks */}
      {modules.map((module, i) => (
        <Float
          key={i}
          speed={1.5 + i * 0.2}
          rotationIntensity={0.2}
          floatIntensity={0.3}
        >
          <group position={module.position as [number, number, number]}>
            {/* Main Block with glass effect */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={module.size as [number, number, number]} />
              <meshPhysicalMaterial
                color={module.color}
                transparent
                opacity={0.2}
                transmission={0.95}
                roughness={0.05}
                metalness={0.1}
                thickness={0.5}
                envMapIntensity={1.5}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>

            {/* Frame/Border */}
            <mesh>
              <boxGeometry args={[module.size[0] + 0.05, module.size[1] + 0.05, module.size[2] + 0.05] as [number, number, number]} />
              <meshBasicMaterial
                color={module.color}
                wireframe
                opacity={0.6}
                transparent
              />
            </mesh>

            {/* Glowing Core */}
            <mesh position={[0, 0, 0.2]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial
                color={module.color}
                emissive={module.color}
                emissiveIntensity={1.5}
              />
            </mesh>

            {/* Data Streams */}
            {[...Array(3)].map((_, j) => (
              <mesh key={j} position={[0, 0, 0.4 + j * 0.1]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial
                  color={module.color}
                  emissive={module.color}
                  emissiveIntensity={2}
                />
              </mesh>
            ))}
          </group>
        </Float>
      ))}

      {/* Connection Lines */}
      {modules.map((module, i) => {
        const height = Math.max(0.1, Math.sqrt(
          Math.pow(module.position[0], 2) +
          Math.pow(module.position[1] - 0.5, 2)
        ) || 1)

        return (
          <group key={`line-${i}`}>
            <mesh>
              <cylinderGeometry args={[0.02, 0.02, height, 8]} />
              <meshStandardMaterial
                color="#10b981"
                emissive="#059669"
                emissiveIntensity={0.5}
                transparent
                opacity={0.3}
              />
            </mesh>
          </group>
        )
      })}

      {/* Ambient Particles */}
      {[...Array(20)].map((_, i) => {
        const angle = (i / 20) * Math.PI * 2
        const radius = 3 + Math.random() * 1
        return (
          <mesh
            key={`particle-${i}`}
            position={[Math.cos(angle) * radius, Math.sin(angle) * radius, Math.random() * 2 - 1]}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={0.8}
              transparent
              opacity={0.6}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export default function ComplianceEcosystem3D() {
  useEffect(() => {
    // Suppress THREE.js geometry warnings in development
    const originalError = console.error
    console.error = (...args) => {
      if (args[0]?.includes?.('THREE.BufferGeometry.computeBoundingSphere')) {
        return
      }
      originalError.call(console, ...args)
    }

    return () => {
      console.error = originalError
    }
  }, [])

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} shadows>
        <ambientLight intensity={0.2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          castShadow
          color="#10b981"
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#3b82f6" />
        <EcosystemStructure />
      </Canvas>
    </div>
  )
}
