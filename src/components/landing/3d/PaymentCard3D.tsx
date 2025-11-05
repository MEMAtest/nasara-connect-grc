'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei'
import * as THREE from 'three'

function CreditCard() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
      meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={meshRef}>
        {/* Card Body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.5, 2.2, 0.15]} />
          <meshStandardMaterial
            color="#10b981"
            metalness={0.8}
            roughness={0.2}
            envMapIntensity={1}
          />
        </mesh>

        {/* Card Chip */}
        <mesh position={[-0.8, 0.3, 0.08]}>
          <boxGeometry args={[0.5, 0.4, 0.05]} />
          <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.1} />
        </mesh>

        {/* Card Stripe */}
        <mesh position={[0, 0.8, 0.08]}>
          <boxGeometry args={[3.5, 0.3, 0.01]} />
          <meshStandardMaterial color="#0d9488" />
        </mesh>

        {/* Floating Transaction Orbs */}
        <Sphere args={[0.15, 16, 16]} position={[2, 1, 1]}>
          <MeshDistortMaterial
            color="#34d399"
            speed={2}
            distort={0.3}
            radius={1}
            emissive="#10b981"
            emissiveIntensity={0.5}
          />
        </Sphere>

        <Sphere args={[0.12, 16, 16]} position={[-1.5, -1.2, 1.5]}>
          <MeshDistortMaterial
            color="#6ee7b7"
            speed={3}
            distort={0.4}
            radius={1}
            emissive="#10b981"
            emissiveIntensity={0.3}
          />
        </Sphere>

        <Sphere args={[0.1, 16, 16]} position={[1, -0.5, 2]}>
          <MeshDistortMaterial
            color="#a7f3d0"
            speed={2.5}
            distort={0.3}
            radius={1}
            emissive="#059669"
            emissiveIntensity={0.4}
          />
        </Sphere>
      </group>
    </Float>
  )
}

export default function PaymentCard3D() {
  return (
    <div className="w-full h-[400px]">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <CreditCard />
      </Canvas>
    </div>
  )
}
