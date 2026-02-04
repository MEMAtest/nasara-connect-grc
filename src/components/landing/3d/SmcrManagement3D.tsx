'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

function Person({ position, color, scale = 1, isLeader = false }: { position: [number, number, number], color: string, scale?: number, isLeader?: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.05
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Head */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.15, 0.4, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Badge for senior managers */}
      {isLeader && (
        <mesh position={[0.2, 0.3, 0.15]}>
          <boxGeometry args={[0.15, 0.15, 0.03]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  )
}

function ResponsibilityLine({ start, end, color }: { start: [number, number, number], end: [number, number, number], color: string }) {
  const lineRef = useRef<THREE.Line>(null)

  const points = [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ]
  const geometry = new THREE.BufferGeometry().setFromPoints(points)

  return (
    // @ts-expect-error R3F line element extends THREE.Line, not SVGLineElement
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color={color} linewidth={2} transparent opacity={0.6} />
    </line>
  )
}

function OrgChart() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
    }
  })

  return (
    <group ref={groupRef}>
      {/* CEO / SMF1 at top */}
      <Person position={[0, 1.5, 0]} color="#3b82f6" scale={1.2} isLeader={true} />

      {/* Senior Managers - SMFs */}
      <Person position={[-1.2, 0.3, 0]} color="#10b981" scale={1} isLeader={true} />
      <Person position={[0, 0.3, 0]} color="#10b981" scale={1} isLeader={true} />
      <Person position={[1.2, 0.3, 0]} color="#10b981" scale={1} isLeader={true} />

      {/* Certified Persons */}
      <Person position={[-1.5, -1, 0]} color="#8b5cf6" scale={0.8} />
      <Person position={[-0.5, -1, 0]} color="#8b5cf6" scale={0.8} />
      <Person position={[0.5, -1, 0]} color="#8b5cf6" scale={0.8} />
      <Person position={[1.5, -1, 0]} color="#8b5cf6" scale={0.8} />

      {/* Connecting lines */}
      <ResponsibilityLine start={[0, 1.2, 0]} end={[-1.2, 0.6, 0]} color="#10b981" />
      <ResponsibilityLine start={[0, 1.2, 0]} end={[0, 0.6, 0]} color="#10b981" />
      <ResponsibilityLine start={[0, 1.2, 0]} end={[1.2, 0.6, 0]} color="#10b981" />

      <ResponsibilityLine start={[-1.2, 0, 0]} end={[-1.5, -0.7, 0]} color="#8b5cf6" />
      <ResponsibilityLine start={[-1.2, 0, 0]} end={[-0.5, -0.7, 0]} color="#8b5cf6" />
      <ResponsibilityLine start={[1.2, 0, 0]} end={[0.5, -0.7, 0]} color="#8b5cf6" />
      <ResponsibilityLine start={[1.2, 0, 0]} end={[1.5, -0.7, 0]} color="#8b5cf6" />
    </group>
  )
}

function StatementOfResponsibilities() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      meshRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime) * 0.1
    }
  })

  return (
    <Float speed={2} floatIntensity={0.3}>
      <group position={[2.2, 0.5, 0]}>
        {/* Document */}
        <mesh ref={meshRef}>
          <boxGeometry args={[0.8, 1, 0.05]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* SoR lines */}
        <mesh position={[0, 0.3, 0.03]}>
          <boxGeometry args={[0.5, 0.05, 0.01]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
        <mesh position={[0, 0.1, 0.03]}>
          <boxGeometry args={[0.5, 0.05, 0.01]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
        <mesh position={[0, -0.1, 0.03]}>
          <boxGeometry args={[0.5, 0.05, 0.01]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
        {/* Seal */}
        <mesh position={[0.2, -0.35, 0.03]}>
          <circleGeometry args={[0.12, 32]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.3} />
        </mesh>
      </group>
    </Float>
  )
}

function ConductRulesBadge() {
  return (
    <Float speed={3} floatIntensity={0.4}>
      <group position={[-2.2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* CR text indicator */}
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[0.3, 0.1, 0.02]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    </Float>
  )
}

function Scene() {
  return (
    <group>
      <OrgChart />
      <StatementOfResponsibilities />
      <ConductRulesBadge />

      {/* Glowing accountability connections */}
      <mesh position={[0, -2, 0]}>
        <torusGeometry args={[2, 0.02, 16, 100]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

export default function SmcrManagement3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-3, 3, 3]} intensity={0.5} color="#3b82f6" />
        <pointLight position={[3, -3, 3]} intensity={0.5} color="#10b981" />
        <Scene />
      </Canvas>
    </div>
  )
}
