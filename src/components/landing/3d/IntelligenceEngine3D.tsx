'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function IntelligenceCore() {
  const coreRef = useRef<THREE.Group>(null)
  const ringsRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.z = state.clock.elapsedTime * 0.1
    }
  })

  // Neural network nodes
  const nodes = []
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const radius = 2.5
    nodes.push({
      position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0],
      delay: i * 0.1
    })
  }

  return (
    <group>
      {/* Pulsing Core */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <group ref={coreRef}>
          <Sphere args={[0.8, 64, 64]}>
            <MeshDistortMaterial
              color="#3b82f6"
              speed={2}
              distort={0.3}
              radius={1}
              emissive="#2563eb"
              emissiveIntensity={1}
              metalness={0.8}
              roughness={0.2}
            />
          </Sphere>
        </group>
      </Float>

      {/* Data Layers */}
      <group ref={ringsRef}>
        {[1.5, 2, 2.5].map((radius, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, i * 0.3]}>
            <torusGeometry args={[radius, 0.05, 16, 100]} />
            <meshStandardMaterial
              color="#60a5fa"
              emissive="#3b82f6"
              emissiveIntensity={0.5 - i * 0.1}
              transparent
              opacity={0.4 - i * 0.1}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        ))}
      </group>

      {/* Neural Network Nodes */}
      {nodes.map((node, i) => (
        <Float
          key={i}
          speed={1.5}
          rotationIntensity={0.1}
          floatIntensity={0.2}
        >
          <group position={node.position as [number, number, number]}>
            {/* Node Container */}
            <mesh>
              <boxGeometry args={[0.6, 0.6, 0.3]} />
              <meshPhysicalMaterial
                color="#1e40af"
                transparent
                opacity={0.2}
                transmission={0.9}
                roughness={0.1}
                metalness={0.1}
                thickness={0.3}
                clearcoat={1}
              />
            </mesh>

            {/* Node Core */}
            <mesh position={[0, 0, 0.2]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial
                color="#60a5fa"
                emissive="#3b82f6"
                emissiveIntensity={1.5}
              />
            </mesh>

            {/* Connection Line to center */}
            <mesh
              position={[
                -node.position[0] / 2,
                -node.position[1] / 2,
                0
              ]}
              rotation={[0, 0, Math.atan2(node.position[1], node.position[0])]}
            >
              <cylinderGeometry
                args={[0.02, 0.02, Math.sqrt(node.position[0]**2 + node.position[1]**2), 8]}

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

      {/* Data Particles Flowing */}
      {nodes.map((node, i) => (
        <mesh
          key={`particle-${i}`}
          position={[
            Math.cos((i / 8) * Math.PI * 2 + Date.now() * 0.001) * 2,
            Math.sin((i / 8) * Math.PI * 2 + Date.now() * 0.001) * 2,
            0
          ]}
        >
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial
            color="#93c5fd"
            emissive="#60a5fa"
            emissiveIntensity={1.5}
          />
        </mesh>
      ))}

      {/* Floating Analysis Panels */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <group position={[3, 1, 1]}>
          <mesh>
            <planeGeometry args={[1.5, 1]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive="#3b82f6"
              emissiveIntensity={0.2}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          {/* Simulated data lines */}
          {[...Array(4)].map((_, i) => (
            <mesh key={i} position={[-0.5 + Math.random() * 1, 0.3 - i * 0.15, 0.01]}>
              <planeGeometry args={[0.8 + Math.random() * 0.4, 0.05]} />
              <meshBasicMaterial color="#3b82f6" opacity={0.6} transparent />
            </mesh>
          ))}
        </group>
      </Float>
    </group>
  )
}

export default function IntelligenceEngine3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          color="#3b82f6"
        />
        <pointLight position={[-10, -10, -5]} intensity={0.8} color="#60a5fa" />
        <IntelligenceCore />
      </Canvas>
    </div>
  )
}
