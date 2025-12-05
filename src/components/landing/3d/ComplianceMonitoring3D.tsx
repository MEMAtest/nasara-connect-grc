'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

function CMPDashboard() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Main screen */}
      <mesh>
        <boxGeometry args={[3, 2, 0.1]} />
        <meshStandardMaterial color="#0f172a" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Screen border */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[2.9, 1.9, 0.02]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Progress bars */}
      <mesh position={[-0.8, 0.6, 0.06]}>
        <boxGeometry args={[1, 0.15, 0.02]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[-1, 0.6, 0.07]}>
        <boxGeometry args={[0.6, 0.12, 0.02]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.3} />
      </mesh>

      <mesh position={[-0.8, 0.3, 0.06]}>
        <boxGeometry args={[1, 0.15, 0.02]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[-0.9, 0.3, 0.07]}>
        <boxGeometry args={[0.8, 0.12, 0.02]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.3} />
      </mesh>

      <mesh position={[-0.8, 0, 0.06]}>
        <boxGeometry args={[1, 0.15, 0.02]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[-1.1, 0, 0.07]}>
        <boxGeometry args={[0.4, 0.12, 0.02]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
      </mesh>

      {/* Pie chart */}
      <group position={[0.8, 0.3, 0.06]}>
        <mesh>
          <cylinderGeometry args={[0.4, 0.4, 0.05, 32, 1, false, 0, Math.PI * 1.4]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.4, 0.4, 0.05, 32, 1, false, Math.PI * 1.4, Math.PI * 0.4]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.4, 0.4, 0.05, 32, 1, false, Math.PI * 1.8, Math.PI * 0.2]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* Calendar grid */}
      <group position={[0, -0.5, 0.06]}>
        {Array.from({ length: 7 }).map((_, i) =>
          Array.from({ length: 4 }).map((_, j) => (
            <mesh key={`${i}-${j}`} position={[-1 + i * 0.3, 0.2 - j * 0.15, 0]}>
              <boxGeometry args={[0.2, 0.1, 0.02]} />
              <meshStandardMaterial
                color={Math.random() > 0.7 ? '#10b981' : Math.random() > 0.5 ? '#f59e0b' : '#334155'}
              />
            </mesh>
          ))
        )}
      </group>
    </group>
  )
}

function TestIndicator({ position, status }: { position: [number, number, number], status: 'pass' | 'warning' | 'fail' }) {
  const colors = { pass: '#10b981', warning: '#f59e0b', fail: '#ef4444' }
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3 + position[0]) * 0.1)
    }
  })

  return (
    <Float speed={2} floatIntensity={0.2}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color={colors[status]} emissive={colors[status]} emissiveIntensity={0.5} />
      </mesh>
    </Float>
  )
}

function EvidenceFolder() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
    }
  })

  return (
    <Float speed={2} floatIntensity={0.3}>
      <group ref={groupRef} position={[2, 0.5, 0]}>
        {/* Folder back */}
        <mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[0.6, 0.8, 0.05]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
        {/* Folder front */}
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[0.6, 0.6, 0.05]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
        {/* Documents inside */}
        <mesh position={[0, 0.1, -0.02]}>
          <boxGeometry args={[0.5, 0.5, 0.02]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    </Float>
  )
}

function Scene() {
  return (
    <group>
      <CMPDashboard />

      {/* Floating test indicators */}
      <TestIndicator position={[-1.8, 1, 0.5]} status="pass" />
      <TestIndicator position={[-2, 0.3, 0.3]} status="pass" />
      <TestIndicator position={[-1.9, -0.4, 0.4]} status="warning" />
      <TestIndicator position={[1.8, -0.8, 0.3]} status="pass" />

      <EvidenceFolder />

      {/* Report badge */}
      <Float speed={3} floatIntensity={0.4}>
        <mesh position={[2, -0.5, 0]}>
          <boxGeometry args={[0.4, 0.5, 0.05]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
      </Float>
    </group>
  )
}

export default function ComplianceMonitoring3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-3, 3, 3]} intensity={0.5} color="#10b981" />
        <pointLight position={[3, -3, 3]} intensity={0.5} color="#f59e0b" />
        <Scene />
      </Canvas>
    </div>
  )
}
