'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

function Book({ position, color, rotation = [0, 0, 0] }: { position: [number, number, number], color: string, rotation?: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.03
    }
  })

  return (
    <group position={position} rotation={rotation}>
      {/* Book cover */}
      <mesh ref={meshRef}>
        <boxGeometry args={[0.15, 0.8, 0.6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Pages */}
      <mesh position={[0.02, 0, 0]}>
        <boxGeometry args={[0.1, 0.75, 0.55]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      {/* Spine detail */}
      <mesh position={[-0.08, 0, 0]}>
        <boxGeometry args={[0.02, 0.78, 0.58]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
      </mesh>
    </group>
  )
}

function BookShelf() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  const bookColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']

  return (
    <group ref={groupRef} position={[-0.5, 0, 0]}>
      {/* Shelf */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[2.5, 0.1, 0.8]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>

      {/* Books on shelf */}
      {bookColors.map((color, i) => (
        <Book
          key={i}
          position={[-0.9 + i * 0.35, -0.05, 0]}
          color={color}
          rotation={[0, 0, i === 2 ? 0.1 : i === 4 ? -0.1 : 0]}
        />
      ))}
    </group>
  )
}

function Certificate() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15
      groupRef.current.position.y = 1 + Math.sin(state.clock.elapsedTime) * 0.1
    }
  })

  return (
    <Float speed={2} floatIntensity={0.3}>
      <group ref={groupRef} position={[1.5, 1, 0]}>
        {/* Certificate frame */}
        <mesh>
          <boxGeometry args={[1, 0.7, 0.05]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Inner certificate */}
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[0.85, 0.55, 0.02]} />
          <meshStandardMaterial color="#fffbeb" />
        </mesh>
        {/* Text lines */}
        <mesh position={[0, 0.15, 0.05]}>
          <boxGeometry args={[0.5, 0.05, 0.01]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[0.6, 0.04, 0.01]} />
          <meshStandardMaterial color="#92400e" />
        </mesh>
        {/* Seal */}
        <mesh position={[0.25, -0.15, 0.05]}>
          <cylinderGeometry args={[0.1, 0.1, 0.02, 32]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
      </group>
    </Float>
  )
}

function GraduationCap() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3
      groupRef.current.position.y = 1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.05
    }
  })

  return (
    <Float speed={3} floatIntensity={0.4}>
      <group ref={groupRef} position={[-1.5, 1.2, 0]}>
        {/* Cap top */}
        <mesh rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.8, 0.05, 0.8]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Cap base */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.2, 32]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Tassel */}
        <mesh position={[0.3, -0.1, 0.3]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
        <mesh position={[0.3, -0.25, 0.3]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      </group>
    </Float>
  )
}

function ProgressRing() {
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.5
    }
  })

  return (
    <group position={[1.5, -0.5, 0]}>
      {/* Background ring */}
      <mesh>
        <torusGeometry args={[0.4, 0.08, 16, 32]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      {/* Progress ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.4, 0.08, 16, 32, Math.PI * 1.5]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.3} />
      </mesh>
      {/* Percentage text placeholder */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[0.3, 0.15, 0.02]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
    </group>
  )
}

function Scene() {
  return (
    <group>
      <BookShelf />
      <Certificate />
      <GraduationCap />
      <ProgressRing />

      {/* Floating knowledge particles */}
      {Array.from({ length: 10 }).map((_, i) => (
        <Float key={i} speed={2 + Math.random()} floatIntensity={0.5}>
          <mesh position={[
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 2
          ]}>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={0.8}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

export default function TrainingLibrary3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-3, 3, 3]} intensity={0.5} color="#f59e0b" />
        <pointLight position={[3, -3, 3]} intensity={0.5} color="#10b981" />
        <Scene />
      </Canvas>
    </div>
  )
}
