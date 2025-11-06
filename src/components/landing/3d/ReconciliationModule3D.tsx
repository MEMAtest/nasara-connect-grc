'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

function ReconciliationFlow() {
  const leftSourceRef = useRef<THREE.Group>(null)
  const rightSourceRef = useRef<THREE.Group>(null)
  const matchEngineRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (leftSourceRef.current) {
      leftSourceRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.1
    }
    if (rightSourceRef.current) {
      rightSourceRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5 + Math.PI) * 0.1
    }
    if (matchEngineRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.05 + 1
      matchEngineRef.current.scale.set(pulse, pulse, pulse)
    }
    if (particlesRef.current) {
      particlesRef.current.children.forEach((child, i) => {
        const progress = (state.clock.elapsedTime * 0.5 + i * 0.2) % 1
        const side = i % 2 === 0 ? -1 : 1
        child.position.x = side * (2 - progress * 2)
        child.position.y = (Math.random() - 0.5) * 0.3
        const scale = 1 - Math.abs(progress - 0.5) * 0.5
        child.scale.set(scale, scale, scale)
      })
    }
  })

  return (
    <group>
      {/* Left Data Source */}
      <group ref={leftSourceRef} position={[-2, 0, 0]}>
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
          <mesh>
            <boxGeometry args={[1, 1.4, 0.3]} />
            <meshPhysicalMaterial
              color="#f59e0b"
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
            <boxGeometry args={[1.05, 1.45, 0.35]} />
            <meshStandardMaterial
              color="#f59e0b"
              wireframe
              opacity={0.7}
              transparent
            />
          </mesh>
          {/* Data rows */}
          {[...Array(5)].map((_, i) => (
            <mesh key={i} position={[0, 0.4 - i * 0.2, 0.16]}>
              <planeGeometry args={[0.8, 0.08]} />
              <meshStandardMaterial
                color="#fb923c"
                emissive="#f59e0b"
                emissiveIntensity={0.5}
                transparent
                opacity={0.8}
              />
            </mesh>
          ))}
          {/* Source label */}
          <mesh position={[0, 0.8, 0.16]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={1.5}
            />
          </mesh>
        </Float>
      </group>

      {/* Right Data Source */}
      <group ref={rightSourceRef} position={[2, 0, 0]}>
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
          <mesh>
            <boxGeometry args={[1, 1.4, 0.3]} />
            <meshPhysicalMaterial
              color="#f97316"
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
            <boxGeometry args={[1.05, 1.45, 0.35]} />
            <meshStandardMaterial
              color="#f97316"
              wireframe
              opacity={0.7}
              transparent
            />
          </mesh>
          {/* Data rows */}
          {[...Array(5)].map((_, i) => (
            <mesh key={i} position={[0, 0.4 - i * 0.2, 0.16]}>
              <planeGeometry args={[0.8, 0.08]} />
              <meshStandardMaterial
                color="#fb923c"
                emissive="#f97316"
                emissiveIntensity={0.5}
                transparent
                opacity={0.8}
              />
            </mesh>
          ))}
          {/* Source label */}
          <mesh position={[0, 0.8, 0.16]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f97316"
              emissiveIntensity={1.5}
            />
          </mesh>
        </Float>
      </group>

      {/* Central Match Engine */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
        <group>
          <mesh ref={matchEngineRef}>
            <cylinderGeometry args={[0.5, 0.5, 0.4, 32]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#059669"
              emissiveIntensity={0.9}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          {/* Match indicator ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.6, 0.06, 16, 100]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={1.2}
              transparent
              opacity={0.8}
            />
          </mesh>
          {/* Success checkmarks */}
          {[...Array(3)].map((_, i) => {
            const angle = (i / 3) * Math.PI * 2
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.4, Math.sin(angle) * 0.4, 0.25]}
              >
                <sphereGeometry args={[0.06, 12, 12]} />
                <meshStandardMaterial
                  color="#10b981"
                  emissive="#10b981"
                  emissiveIntensity={2}
                />
              </mesh>
            )
          })}
        </group>
      </Float>

      {/* Data Flow Particles */}
      <group ref={particlesRef}>
        {[...Array(8)].map((_, i) => (
          <mesh key={i} position={[0, 0, 0]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={1.5}
            />
          </mesh>
        ))}
      </group>

      {/* Connection Lines */}
      {/* Left to center */}
      <mesh position={[-1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={0.6}
          transparent
          opacity={0.5}
        />
      </mesh>
      {/* Right to center */}
      <mesh position={[1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
        <meshStandardMaterial
          color="#f97316"
          emissive="#f97316"
          emissiveIntensity={0.6}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Match Status Display */}
      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.5}>
        <group position={[0, -2, 0.5]}>
          <mesh>
            <boxGeometry args={[2, 0.8, 0.1]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive="#10b981"
              emissiveIntensity={0.15}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          {/* 99.8% match indicator */}
          <mesh position={[0, 0.15, 0.06]}>
            <planeGeometry args={[1.5, 0.25]} />
            <meshBasicMaterial
              color="#10b981"
              opacity={0.4}
              transparent
            />
          </mesh>
          {/* Progress bars */}
          {[...Array(3)].map((_, i) => (
            <mesh key={i} position={[-0.6 + i * 0.6, -0.15, 0.06]}>
              <planeGeometry args={[0.4, 0.1]} />
              <meshBasicMaterial
                color="#fbbf24"
                opacity={0.5}
                transparent
              />
            </mesh>
          ))}
        </group>
      </Float>

      {/* Anomaly Detection Nodes */}
      {[...Array(4)].map((_, i) => {
        const angle = (i / 4) * Math.PI * 2
        const radius = 2.8
        return (
          <mesh
            key={`anomaly-${i}`}
            position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
          >
            <octahedronGeometry args={[0.12]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#dc2626"
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

export default function ReconciliationModule3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} shadows>
        <ambientLight intensity={0.3} />
        <spotLight
          position={[8, 8, 8]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          castShadow
          color="#f59e0b"
        />
        <pointLight position={[-8, -8, -5]} intensity={0.8} color="#fb923c" />
        <ReconciliationFlow />
      </Canvas>
    </div>
  )
}
