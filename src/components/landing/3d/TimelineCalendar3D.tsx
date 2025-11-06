'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

function TimelinePath() {
  const pathRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (pathRef.current) {
      pathRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
    if (particlesRef.current) {
      particlesRef.current.children.forEach((child, i) => {
        const progress = (state.clock.elapsedTime * 0.2 + i * 0.15) % 1
        const yPos = -2.5 + progress * 5
        child.position.y = yPos
        const scale = 1 - Math.abs(progress - 0.5) * 0.5
        child.scale.set(scale, scale, scale)
      })
    }
  })

  // Milestone positions along timeline
  const milestones = [
    { position: [0, -2.5, 0], color: '#8b5cf6', year: '2022', quarter: 'Q1', size: 0.3 },
    { position: [0, -1.5, 0], color: '#a855f7', year: '2022', quarter: 'Q3', size: 0.35 },
    { position: [0, -0.5, 0], color: '#3b82f6', year: '2023', quarter: 'Q1', size: 0.4 },
    { position: [0, 0.5, 0], color: '#10b981', year: '2023', quarter: 'Q3', size: 0.45 },
    { position: [0, 1.5, 0], color: '#f59e0b', year: '2024', quarter: 'Q1', size: 0.5 },
    { position: [0, 2.5, 0], color: '#06b6d4', year: '2024', quarter: 'Q4', size: 0.55 },
  ]

  return (
    <group ref={pathRef}>
      {/* Central Timeline Path */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 5.5, 16]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#7c3aed"
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Timeline Milestones */}
      {milestones.map((milestone, i) => (
        <Float
          key={i}
          speed={1.5 + i * 0.1}
          rotationIntensity={0.2}
          floatIntensity={0.2}
        >
          <group position={milestone.position as [number, number, number]}>
            {/* Milestone sphere */}
            <mesh>
              <sphereGeometry args={[milestone.size, 32, 32]} />
              <meshStandardMaterial
                color={milestone.color}
                emissive={milestone.color}
                emissiveIntensity={1}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>

            {/* Milestone ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[milestone.size + 0.15, 0.03, 16, 100]} />
              <meshStandardMaterial
                color={milestone.color}
                emissive={milestone.color}
                emissiveIntensity={0.8}
                transparent
                opacity={0.7}
              />
            </mesh>

            {/* Year marker plate */}
            <Float speed={2} floatIntensity={0.1}>
              <group position={[1.2, 0, 0]}>
                <mesh>
                  <planeGeometry args={[0.8, 0.4]} />
                  <meshStandardMaterial
                    color="#1e293b"
                    emissive={milestone.color}
                    emissiveIntensity={0.15}
                    metalness={0.8}
                    roughness={0.2}
                  />
                </mesh>
                {/* Year indicator */}
                <mesh position={[0, 0.1, 0.01]}>
                  <planeGeometry args={[0.6, 0.12]} />
                  <meshBasicMaterial
                    color={milestone.color}
                    opacity={0.6}
                    transparent
                  />
                </mesh>
                {/* Quarter indicator */}
                <mesh position={[0, -0.1, 0.01]}>
                  <planeGeometry args={[0.3, 0.08]} />
                  <meshBasicMaterial
                    color={milestone.color}
                    opacity={0.4}
                    transparent
                  />
                </mesh>
              </group>
            </Float>

            {/* Achievement icon placeholder */}
            <Float speed={2.5} floatIntensity={0.15}>
              <group position={[-1.2, 0, 0]}>
                <mesh>
                  <boxGeometry args={[0.4, 0.4, 0.1]} />
                  <meshStandardMaterial
                    color={milestone.color}
                    emissive={milestone.color}
                    emissiveIntensity={0.6}
                    metalness={0.7}
                    roughness={0.3}
                  />
                </mesh>
                {/* Checkmark indicator */}
                <mesh position={[0, 0, 0.06]}>
                  <sphereGeometry args={[0.08, 16, 16]} />
                  <meshStandardMaterial
                    color="#10b981"
                    emissive="#10b981"
                    emissiveIntensity={1.5}
                  />
                </mesh>
              </group>
            </Float>

            {/* Connection nodes */}
            {[...Array(4)].map((_, j) => {
              const angle = (j / 4) * Math.PI * 2
              const radius = milestone.size + 0.3
              return (
                <mesh
                  key={j}
                  position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
                >
                  <sphereGeometry args={[0.05, 12, 12]} />
                  <meshStandardMaterial
                    color={milestone.color}
                    emissive={milestone.color}
                    emissiveIntensity={1.2}
                  />
                </mesh>
              )
            })}
          </group>
        </Float>
      ))}

      {/* Progress Particles */}
      <group ref={particlesRef}>
        {[...Array(12)].map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#8b5cf6"
              emissiveIntensity={1.5}
            />
          </mesh>
        ))}
      </group>

      {/* Calendar Grid Background */}
      {[...Array(24)].map((_, i) => {
        const angle = (i / 24) * Math.PI * 2
        const radius = 3.5
        const height = -2.5 + (i % 6) * 1
        return (
          <Float
            key={`grid-${i}`}
            speed={1 + i * 0.05}
            rotationIntensity={0.05}
            floatIntensity={0.1}
          >
            <mesh
              position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius]}
            >
              <boxGeometry args={[0.15, 0.15, 0.05]} />
              <meshStandardMaterial
                color="#334155"
                emissive="#475569"
                emissiveIntensity={0.2}
                transparent
                opacity={0.3}
              />
            </mesh>
          </Float>
        )
      })}

      {/* Growth Trajectory Lines */}
      {milestones.slice(0, -1).map((milestone, i) => {
        const next = milestones[i + 1]
        const yDist = next.position[1] - milestone.position[1]
        return (
          <mesh
            key={`line-${i}`}
            position={[0, milestone.position[1] + yDist / 2, 0]}
          >
            <cylinderGeometry args={[0.02, 0.02, yDist, 8]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#8b5cf6"
              emissiveIntensity={0.4}
              transparent
              opacity={0.5}
            />
          </mesh>
        )
      })}

      {/* Orbiting Success Indicators */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2 + Date.now() * 0.0005
        const radius = 4.5
        const height = Math.sin(angle * 2) * 2
        return (
          <mesh
            key={`orbit-${i}`}
            position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius]}
          >
            <octahedronGeometry args={[0.12]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={1.2}
              transparent
              opacity={0.8}
            />
          </mesh>
        )
      })}

      {/* Year Labels */}
      {['2022', '2023', '2024'].map((year, i) => {
        const yPos = -2 + i * 2
        return (
          <Float
            key={year}
            speed={2}
            rotationIntensity={0.1}
            floatIntensity={0.2}
          >
            <group position={[2.5, yPos, 0]}>
              <mesh>
                <planeGeometry args={[1, 0.5]} />
                <meshStandardMaterial
                  color="#1e293b"
                  emissive="#8b5cf6"
                  emissiveIntensity={0.1}
                  metalness={0.7}
                  roughness={0.3}
                />
              </mesh>
              {/* Year text placeholder */}
              <mesh position={[0, 0, 0.01]}>
                <planeGeometry args={[0.8, 0.25]} />
                <meshBasicMaterial
                  color="#a855f7"
                  opacity={0.5}
                  transparent
                />
              </mesh>
            </group>
          </Float>
        )
      })}

      {/* Growth Indicator Arrow */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <group position={[0, 3.2, 0]}>
          <mesh rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.3, 0.6, 16]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#059669"
              emissiveIntensity={1}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          {/* Arrow rings */}
          {[0.4, 0.5, 0.6].map((radius, i) => (
            <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
              <torusGeometry args={[radius, 0.03, 16, 100]} />
              <meshStandardMaterial
                color="#10b981"
                emissive="#10b981"
                emissiveIntensity={0.7 - i * 0.15}
                transparent
                opacity={0.6}
              />
            </mesh>
          ))}
        </group>
      </Float>

      {/* Ambient Light Spheres */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 5
        const height = (Math.random() - 0.5) * 5
        return (
          <mesh
            key={`ambient-${i}`}
            position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius]}
          >
            <sphereGeometry args={[0.06, 16, 16]} />
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

export default function TimelineCalendar3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [6, 0, 8], fov: 50 }} shadows>
        <ambientLight intensity={0.3} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          castShadow
          color="#8b5cf6"
        />
        <pointLight position={[-10, -10, -8]} intensity={0.8} color="#a855f7" />
        <TimelinePath />
      </Canvas>
    </div>
  )
}
