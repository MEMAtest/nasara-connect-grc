'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

function FrameworkStructure() {
  const groupRef = useRef<THREE.Group>(null)
  const centralRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.15
    }
    if (centralRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 1
      centralRef.current.scale.set(pulse, pulse, pulse)
    }
  })

  // Framework folders/components
  const components = [
    { position: [0, 2, 0], color: '#8b5cf6', label: 'Policies', size: [1.5, 1, 0.4] },
    { position: [-2, 0, 0], color: '#a855f7', label: 'Records', size: [1.5, 1, 0.4] },
    { position: [2, 0, 0], color: '#c084fc', label: 'Controls', size: [1.5, 1, 0.4] },
    { position: [0, -2, 0], color: '#d8b4fe', label: 'Audit', size: [1.5, 1, 0.4] },
  ]

  return (
    <group ref={groupRef}>
      {/* Central Compliance Badge */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
        <group>
          <mesh ref={centralRef}>
            <cylinderGeometry args={[0.8, 0.8, 0.3, 32]} />
            <meshStandardMaterial
              color="#8b5cf6"
              emissive="#7c3aed"
              emissiveIntensity={0.8}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          {/* Audit Ready Badge */}
          <mesh position={[0, 0, 0.2]} rotation={[0, 0, 0]}>
            <ringGeometry args={[0.5, 0.7, 32]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#059669"
              emissiveIntensity={1.2}
            />
          </mesh>
          {/* Check mark */}
          <mesh position={[0, 0, 0.25]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      </Float>

      {/* Framework Components */}
      {components.map((component, i) => (
        <Float
          key={i}
          speed={1.5 + i * 0.2}
          rotationIntensity={0.2}
          floatIntensity={0.3}
        >
          <group position={component.position as [number, number, number]}>
            {/* Folder/Block Container */}
            <mesh castShadow>
              <boxGeometry args={component.size as [number, number, number]} />
              <meshPhysicalMaterial
                color={component.color}
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

            {/* Frame/Outline */}
            <mesh>
              <boxGeometry args={[
                component.size[0] + 0.05,
                component.size[1] + 0.05,
                component.size[2] + 0.05
              ] as [number, number, number]} />
              <meshStandardMaterial
                color={component.color}
                wireframe
                opacity={0.7}
                transparent
              />
            </mesh>

            {/* Status Dots */}
            {[...Array(3)].map((_, j) => (
              <mesh
                key={j}
                position={[-0.4 + j * 0.4, component.size[1] / 2 - 0.2, component.size[2] / 2 + 0.05]}
              >
                <sphereGeometry args={[0.06, 12, 12]} />
                <meshStandardMaterial
                  color="#10b981"
                  emissive="#10b981"
                  emissiveIntensity={1.5}
                />
              </mesh>
            ))}

            {/* Document Icons */}
            {[...Array(2)].map((_, j) => (
              <mesh
                key={`doc-${j}`}
                position={[-0.3 + j * 0.6, 0, component.size[2] / 2 + 0.02]}
              >
                <planeGeometry args={[0.4, 0.5]} />
                <meshStandardMaterial
                  color={component.color}
                  emissive={component.color}
                  emissiveIntensity={0.5}
                  transparent
                  opacity={0.8}
                />
              </mesh>
            ))}

            {/* Connection Lines to Center */}
            <mesh
              position={[
                -component.position[0] / 2,
                -component.position[1] / 2,
                0
              ]}
              rotation={[
                0,
                0,
                Math.atan2(component.position[1], component.position[0])
              ]}
            >
              <cylinderGeometry
                args={[
                  0.03,
                  0.03,
                  Math.sqrt(component.position[0]**2 + component.position[1]**2) - 0.8,
                  8
                ]}
              />
              <meshStandardMaterial
                color={component.color}
                emissive={component.color}
                emissiveIntensity={0.6}
                transparent
                opacity={0.4}
              />
            </mesh>
          </group>
        </Float>
      ))}

      {/* Orbiting Acknowledgement Letters */}
      {[...Array(4)].map((_, i) => {
        const angle = (i / 4) * Math.PI * 2 + Date.now() * 0.0005
        const radius = 2.8
        return (
          <mesh
            key={`letter-${i}`}
            position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry args={[0.4, 0.3, 0.05]} />
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

      {/* Protective Shield Rings */}
      {[2.5, 3, 3.5].map((radius, i) => (
        <mesh key={`ring-${i}`} rotation={[Math.PI / 2, 0, i * 0.2]}>
          <torusGeometry args={[radius, 0.04, 16, 100]} />
          <meshStandardMaterial
            color="#a855f7"
            emissive="#8b5cf6"
            emissiveIntensity={0.3 - i * 0.08}
            transparent
            opacity={0.3 - i * 0.08}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      ))}

      {/* Resolution Pack Indicators */}
      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.5}>
        <group position={[-2.5, -2.5, 0.5]}>
          <mesh>
            <boxGeometry args={[1.2, 0.8, 0.2]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive="#8b5cf6"
              emissiveIntensity={0.2}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          {/* Green checkmarks */}
          {[...Array(3)].map((_, i) => (
            <mesh key={i} position={[-0.3 + i * 0.3, 0.2 - i * 0.15, 0.11]}>
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
    </group>
  )
}

export default function GovernanceFramework3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} shadows>
        <ambientLight intensity={0.3} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          castShadow
          color="#8b5cf6"
        />
        <pointLight position={[-10, -10, -5]} intensity={0.8} color="#a855f7" />
        <FrameworkStructure />
      </Canvas>
    </div>
  )
}
