'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sphere } from '@react-three/drei'
import * as THREE from 'three'

function GlassCube() {
  const cubeRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (cubeRef.current) {
      cubeRef.current.rotation.y = state.clock.elapsedTime * 0.3
      cubeRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
    if (particlesRef.current) {
      particlesRef.current.children.forEach((child, i) => {
        const offset = i * 0.5
        child.position.y = Math.sin(state.clock.elapsedTime + offset) * 1.5
      })
    }
  })

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
      <group>
        {/* Glass Cube Container */}
        <mesh ref={cubeRef}>
          <boxGeometry args={[3, 3, 3]} />
          <meshPhysicalMaterial
            color="#60a5fa"
            transparent
            opacity={0.15}
            transmission={0.9}
            roughness={0.1}
            metalness={0.1}
            thickness={0.5}
            envMapIntensity={1}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Cube Edges/Frame */}
        <mesh>
          <boxGeometry args={[3.05, 3.05, 3.05]} />
          <meshBasicMaterial wireframe color="#3b82f6" opacity={0.3} transparent />
        </mesh>

        {/* Data Particles Flowing Inside */}
        <group ref={particlesRef}>
          {/* Vertical Data Streams */}
          {[-0.8, 0, 0.8].map((x, i) =>
            [-0.8, 0.8].map((z, j) => (
              <Sphere key={`${i}-${j}`} args={[0.08, 16, 16]} position={[x, 0, z]}>
                <meshStandardMaterial
                  color="#60a5fa"
                  emissive="#3b82f6"
                  emissiveIntensity={1}
                  transparent
                  opacity={0.8}
                />
              </Sphere>
            ))
          )}
        </group>

        {/* Central Data Node */}
        <Sphere args={[0.3, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#2563eb"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </Sphere>

        {/* Orbiting Data Points */}
        {[0, 90, 180, 270].map((angle, i) => {
          const radian = (angle * Math.PI) / 180
          const radius = 1.2
          const x = Math.cos(radian) * radius
          const z = Math.sin(radian) * radius
          return (
            <Sphere key={i} args={[0.12, 16, 16]} position={[x, 0, z]}>
              <meshStandardMaterial
                color="#93c5fd"
                emissive="#60a5fa"
                emissiveIntensity={0.7}
              />
            </Sphere>
          )
        })}

        {/* Corner Accent Lights */}
        {[
          [-1.5, 1.5, 1.5],
          [1.5, 1.5, 1.5],
          [-1.5, -1.5, 1.5],
          [1.5, -1.5, 1.5],
        ].map((pos, i) => (
          <Sphere key={`corner-${i}`} args={[0.06, 8, 8]} position={pos as [number, number, number]}>
            <meshStandardMaterial
              color="#dbeafe"
              emissive="#93c5fd"
              emissiveIntensity={1}
            />
          </Sphere>
        ))}
      </group>
    </Float>
  )
}

export default function ClarityGlass3D() {
  return (
    <div className="w-full h-[400px]">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#60a5fa" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#93c5fd" />
        <GlassCube />
      </Canvas>
    </div>
  )
}
