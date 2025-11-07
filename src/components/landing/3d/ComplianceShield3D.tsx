'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sphere } from '@react-three/drei'
import * as THREE from 'three'

function Shield() {
  const shieldRef = useRef<THREE.Group>(null)
  const checkmarkRef = useRef<THREE.Mesh>(null)
  const ringsRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (shieldRef.current) {
      shieldRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.2
    }
    if (checkmarkRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 1
      checkmarkRef.current.scale.set(pulse, pulse, pulse)
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.z = state.clock.elapsedTime * 0.3
    }
  })

  // Shield shape points (simplified)
  const shieldShape = new THREE.Shape()
  shieldShape.moveTo(0, 2)
  shieldShape.lineTo(1.5, 1.5)
  shieldShape.lineTo(1.5, -0.5)
  shieldShape.lineTo(0, -2)
  shieldShape.lineTo(-1.5, -0.5)
  shieldShape.lineTo(-1.5, 1.5)
  shieldShape.closePath()

  const extrudeSettings = {
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 3,
  }

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.5}>
      <group ref={shieldRef}>
        {/* Main Shield Body */}
        <mesh>
          <extrudeGeometry args={[shieldShape, extrudeSettings]} />
          <meshStandardMaterial
            color="#a855f7"
            metalness={0.9}
            roughness={0.1}
            emissive="#9333ea"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Shield Border Highlight */}
        <mesh position={[0, 0, 0.05]}>
          <extrudeGeometry args={[shieldShape, { ...extrudeSettings, depth: 0.05 }]} />
          <meshStandardMaterial
            color="#c084fc"
            metalness={0.8}
            roughness={0.2}
            emissive="#a855f7"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Checkmark Symbol */}
        <group ref={checkmarkRef} position={[0, 0.3, 0.4]}>
          {/* Checkmark stem */}
          <mesh position={[-0.15, -0.15, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.15, 0.6, 0.15]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#16a34a"
              emissiveIntensity={0.8}
              metalness={0.5}
            />
          </mesh>

          {/* Checkmark tick */}
          <mesh position={[0.35, 0.05, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.15, 1, 0.15]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#16a34a"
              emissiveIntensity={0.8}
              metalness={0.5}
            />
          </mesh>
        </group>

        {/* Protective Rings */}
        <group ref={ringsRef}>
          <mesh>
            <torusGeometry args={[2.5, 0.08, 16, 100]} />
            <meshStandardMaterial
              color="#e9d5ff"
              emissive="#c084fc"
              emissiveIntensity={0.4}
              transparent
              opacity={0.6}
            />
          </mesh>

          <mesh rotation={[0, 0, Math.PI / 3]}>
            <torusGeometry args={[2.8, 0.06, 16, 100]} />
            <meshStandardMaterial
              color="#f3e8ff"
              emissive="#d8b4fe"
              emissiveIntensity={0.3}
              transparent
              opacity={0.4}
            />
          </mesh>
        </group>

        {/* Orbiting Compliance Indicators */}
        {[0, 120, 240].map((angle, i) => {
          const radian = (angle * Math.PI) / 180
          const radius = 2
          const x = Math.cos(radian) * radius
          const y = Math.sin(radian) * radius
          return (
            <Sphere key={i} args={[0.15, 16, 16]} position={[x, y, 0]}>
              <meshStandardMaterial
                color="#86efac"
                emissive="#22c55e"
                emissiveIntensity={0.8}
              />
            </Sphere>
          )
        })}

        {/* Floating Certification Stars */}
        <Sphere args={[0.08, 8, 8]} position={[2.5, 1.5, 0.5]}>
          <meshStandardMaterial
            color="#fde047"
            emissive="#facc15"
            emissiveIntensity={1}
          />
        </Sphere>

        <Sphere args={[0.1, 8, 8]} position={[-2.2, -1.8, 0.8]}>
          <meshStandardMaterial
            color="#fef08a"
            emissive="#fbbf24"
            emissiveIntensity={0.9}
          />
        </Sphere>
      </group>
    </Float>
  )
}

export default function ComplianceShield3D() {
  return (
    <div className="w-full h-[400px]">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1.5} color="#a855f7" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#c084fc" />
        <Shield />
      </Canvas>
    </div>
  )
}
