'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

function WorkflowDiagram() {
  const groupRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
    if (particlesRef.current) {
      particlesRef.current.children.forEach((child, i) => {
        const offset = (state.clock.elapsedTime + i * 0.5) % 4
        child.position.y = -2 + offset
        const scale = 1 - Math.abs(offset - 2) / 2
        child.scale.set(scale, scale, scale)
      })
    }
  })

  const stages = [
    { position: [0, 2, 0], color: '#f59e0b', label: 'Input', size: [1.5, 0.8, 0.3] },
    { position: [0, 0.5, 0], color: '#f97316', label: 'Process', size: [1.5, 0.8, 0.3] },
    { position: [0, -1, 0], color: '#ef4444', label: 'Validate', size: [1.5, 0.8, 0.3] },
    { position: [0, -2.5, 0], color: '#10b981', label: 'Output', size: [1.5, 0.8, 0.3] },
  ]

  return (
    <group ref={groupRef}>
      {/* Workflow Stages */}
      {stages.map((stage, i) => (
        <Float
          key={i}
          speed={1.5}
          rotationIntensity={0.1}
          floatIntensity={0.2}
        >
          <group position={stage.position as [number, number, number]}>
            {/* Stage Container */}
            <mesh castShadow>
              <boxGeometry args={stage.size as [number, number, number]} />
              <meshPhysicalMaterial
                color={stage.color}
                transparent
                opacity={0.15}
                transmission={0.95}
                roughness={0.05}
                metalness={0.1}
                thickness={0.5}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>

            {/* Frame */}
            <mesh>
              <boxGeometry args={[stage.size[0] + 0.05, stage.size[1] + 0.05, stage.size[2] + 0.05] as [number, number, number]} />
              <meshStandardMaterial
                color={stage.color}
                wireframe
                opacity={0.8}
                transparent
              />
            </mesh>

            {/* Status Indicator */}
            <mesh position={[0.6, 0, 0.2]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial
                color={i < 3 ? '#10b981' : '#f59e0b'}
                emissive={i < 3 ? '#10b981' : '#f59e0b'}
                emissiveIntensity={2}
              />
            </mesh>

            {/* Data Flow Lines */}
            {i < stages.length - 1 && (
              <mesh position={[0, -0.75, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
                <meshStandardMaterial
                  color={stage.color}
                  emissive={stage.color}
                  emissiveIntensity={0.8}
                  transparent
                  opacity={0.6}
                />
              </mesh>
            )}
          </group>
        </Float>
      ))}

      {/* Data Particles Flowing Through Pipeline */}
      <group ref={particlesRef}>
        {[...Array(6)].map((_, i) => (
          <mesh key={i} position={[0, 0, 0]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={1.5}
            />
          </mesh>
        ))}
      </group>

      {/* Side Data Branches */}
      {[-1.5, 1.5].map((x, idx) => (
        <Float key={idx} speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
          <group position={[x, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.8, 0.6, 0.2]} />
              <meshPhysicalMaterial
                color="#fb923c"
                transparent
                opacity={0.2}
                transmission={0.9}
                roughness={0.1}
                metalness={0.1}
                thickness={0.3}
              />
            </mesh>
            {/* Connection to main flow */}
            <mesh position={[-x / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, Math.abs(x) - 0.8, 8]} />
              <meshStandardMaterial
                color="#f97316"
                emissive="#f59e0b"
                emissiveIntensity={0.5}
                transparent
                opacity={0.4}
              />
            </mesh>
          </group>
        </Float>
      ))}

      {/* Anomaly Detection Indicators */}
      {[...Array(3)].map((_, i) => {
        const angle = (i / 3) * Math.PI * 2
        const radius = 2.5
        return (
          <mesh
            key={`anomaly-${i}`}
            position={[Math.cos(angle) * radius, Math.sin(angle) * radius - 1, 0]}
          >
            <octahedronGeometry args={[0.15]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#dc2626"
              emissiveIntensity={1.2}
              transparent
              opacity={0.8}
            />
          </mesh>
        )
      })}

      {/* Dashboard Panel */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <group position={[2.5, -2, 1]}>
          <mesh castShadow>
            <boxGeometry args={[1.8, 1.2, 0.1]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive="#f59e0b"
              emissiveIntensity={0.1}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          {/* Match percentage display */}
          <mesh position={[0, 0.3, 0.06]}>
            <planeGeometry args={[1.4, 0.3]} />
            <meshBasicMaterial color="#10b981" opacity={0.3} transparent />
          </mesh>
          <mesh position={[0, -0.2, 0.06]}>
            <planeGeometry args={[1.2, 0.15]} />
            <meshBasicMaterial color="#fbbf24" opacity={0.4} transparent />
          </mesh>
        </group>
      </Float>
    </group>
  )
}

export default function WorkflowEngine3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }} shadows>
        <ambientLight intensity={0.3} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          castShadow
          color="#f59e0b"
        />
        <pointLight position={[-10, -10, -5]} intensity={0.8} color="#fb923c" />
        <WorkflowDiagram />
      </Canvas>
    </div>
  )
}
