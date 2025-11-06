'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function IntelligenceNetwork() {
  const coreRef = useRef<THREE.Mesh>(null)
  const nodesRef = useRef<THREE.Group>(null)
  const scanRingRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (coreRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1
      coreRef.current.scale.set(pulse, pulse, pulse)
    }
    if (nodesRef.current) {
      nodesRef.current.rotation.z = state.clock.elapsedTime * 0.15
    }
    if (scanRingRef.current) {
      scanRingRef.current.rotation.z = state.clock.elapsedTime * 0.5
    }
  })

  // Data processing nodes
  const nodes = []
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2
    const radius = 2
    nodes.push({
      position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0],
      delay: i * 0.15
    })
  }

  return (
    <group>
      {/* Central AI Core */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh ref={coreRef}>
          <Sphere args={[0.6, 64, 64]}>
            <MeshDistortMaterial
              color="#3b82f6"
              speed={2}
              distort={0.2}
              radius={1}
              emissive="#2563eb"
              emissiveIntensity={1.2}
              metalness={0.8}
              roughness={0.2}
            />
          </Sphere>
        </mesh>

        {/* Core Energy Rings */}
        {[0.8, 1, 1.2].map((radius, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, i * 0.4]}>
            <torusGeometry args={[radius, 0.04, 16, 100]} />
            <meshStandardMaterial
              color="#60a5fa"
              emissive="#3b82f6"
              emissiveIntensity={0.6 - i * 0.15}
              transparent
              opacity={0.5 - i * 0.1}
            />
          </mesh>
        ))}
      </Float>

      {/* Processing Nodes */}
      <group ref={nodesRef}>
        {nodes.map((node, i) => (
          <Float
            key={i}
            speed={1.5 + i * 0.1}
            rotationIntensity={0.1}
            floatIntensity={0.2}
          >
            <group position={node.position as [number, number, number]}>
              {/* Node Container */}
              <mesh>
                <octahedronGeometry args={[0.25]} />
                <meshPhysicalMaterial
                  color="#1e40af"
                  transparent
                  opacity={0.15}
                  transmission={0.95}
                  roughness={0.05}
                  metalness={0.1}
                  thickness={0.3}
                  clearcoat={1}
                  clearcoatRoughness={0.05}
                />
              </mesh>

              {/* Node Core */}
              <mesh>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial
                  color="#60a5fa"
                  emissive="#3b82f6"
                  emissiveIntensity={1.8}
                />
              </mesh>

              {/* Connection to center */}
              <mesh
                position={[
                  -node.position[0] / 2,
                  -node.position[1] / 2,
                  0
                ]}
                rotation={[0, 0, Math.atan2(node.position[1], node.position[0])]}
              >
                <cylinderGeometry
                  args={[0.015, 0.015, Math.sqrt(node.position[0]**2 + node.position[1]**2) - 0.6, 8]}
                />
                <meshStandardMaterial
                  color="#3b82f6"
                  emissive="#2563eb"
                  emissiveIntensity={0.8}
                  transparent
                  opacity={0.4}
                />
              </mesh>
            </group>
          </Float>
        ))}
      </group>

      {/* Scanning Ring */}
      <mesh ref={scanRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.08, 16, 100, Math.PI / 2]} />
        <meshStandardMaterial
          color="#93c5fd"
          emissive="#60a5fa"
          emissiveIntensity={1.5}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Data Stream Particles */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const radius = 1.2 + Math.random() * 0.5
        return (
          <mesh
            key={`particle-${i}`}
            position={[Math.cos(angle) * radius, Math.sin(angle) * radius, (Math.random() - 0.5) * 0.5]}
          >
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial
              color="#93c5fd"
              emissive="#60a5fa"
              emissiveIntensity={1.2}
              transparent
              opacity={0.8}
            />
          </mesh>
        )
      })}

      {/* Analysis Layers */}
      {[...Array(3)].map((_, i) => {
        const offset = i * 0.8 - 1.2
        return (
          <Float key={`layer-${i}`} speed={2 + i * 0.3} floatIntensity={0.2}>
            <mesh position={[2.5 + i * 0.2, offset, -0.5]}>
              <planeGeometry args={[1, 0.6]} />
              <meshStandardMaterial
                color="#1e293b"
                emissive="#3b82f6"
                emissiveIntensity={0.15}
                transparent
                opacity={0.8}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
            {/* Data bars */}
            {[...Array(3)].map((_, j) => (
              <mesh key={j} position={[2.2 + i * 0.2, offset - 0.1 + j * 0.15, -0.4]}>
                <planeGeometry args={[0.6 + Math.random() * 0.3, 0.05]} />
                <meshBasicMaterial
                  color="#3b82f6"
                  opacity={0.6}
                  transparent
                />
              </mesh>
            ))}
          </Float>
        )
      })}
    </group>
  )
}

export default function IntelligenceModule3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <spotLight
          position={[8, 8, 8]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          color="#3b82f6"
        />
        <pointLight position={[-8, -8, -5]} intensity={0.8} color="#60a5fa" />
        <IntelligenceNetwork />
      </Canvas>
    </div>
  )
}
