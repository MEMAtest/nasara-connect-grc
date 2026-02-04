'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Brain() {
  const brainRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (brainRef.current) {
      brainRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  return (
    <mesh ref={brainRef} position={[0, 0, 0]}>
      <sphereGeometry args={[1, 32, 32]} />
      <MeshDistortMaterial
        color="#3b82f6"
        emissive="#3b82f6"
        emissiveIntensity={0.2}
        distort={0.3}
        speed={2}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  )
}

function NeuralNetwork() {
  const groupRef = useRef<THREE.Group>(null)

  const nodes = useMemo(() => {
    const positions: [number, number, number][] = []
    for (let i = 0; i < 20; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 1.2 + Math.random() * 0.5
      positions.push([
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      ])
    }
    return positions
  }, [])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {nodes.map((pos, i) => (
        <Float key={i} speed={2} floatIntensity={0.2}>
          <mesh position={pos}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={0.8}
            />
          </mesh>
        </Float>
      ))}
      {/* Connecting lines */}
      {nodes.slice(0, 10).map((pos, i) => {
        const nextPos = nodes[(i + 3) % nodes.length]
        const points = [
          new THREE.Vector3(...pos),
          new THREE.Vector3(...nextPos)
        ]
        return (
          // @ts-expect-error R3F line element extends THREE.Line, not SVGLineElement
          <line key={`line-${i}`} geometry={new THREE.BufferGeometry().setFromPoints(points)}>
            <lineBasicMaterial color="#10b981" transparent opacity={0.3} />
          </line>
        )
      })}
    </group>
  )
}

function ChatBubble({ position, delay = 0 }: { position: [number, number, number], delay?: number }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + delay) * 0.1
      groupRef.current.scale.setScalar(0.8 + Math.sin(state.clock.elapsedTime * 2 + delay) * 0.1)
    }
  })

  return (
    <Float speed={2} floatIntensity={0.3}>
      <group ref={groupRef} position={position}>
        {/* Bubble */}
        <mesh>
          <boxGeometry args={[0.8, 0.4, 0.1]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Bubble tail */}
        <mesh position={[-0.35, -0.25, 0]} rotation={[0, 0, -0.5]}>
          <coneGeometry args={[0.1, 0.15, 3]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Text lines */}
        <mesh position={[0, 0.05, 0.06]}>
          <boxGeometry args={[0.5, 0.06, 0.01]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
        <mesh position={[-0.1, -0.08, 0.06]}>
          <boxGeometry args={[0.3, 0.06, 0.01]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </group>
    </Float>
  )
}

function Sparkles() {
  const sparklesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (sparklesRef.current) {
      sparklesRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })

  return (
    <group ref={sparklesRef}>
      {Array.from({ length: 15 }).map((_, i) => (
        <Float key={i} speed={3 + Math.random() * 2} floatIntensity={0.5}>
          <mesh position={[
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 2
          ]}>
            <octahedronGeometry args={[0.05]} />
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#f59e0b"
              emissiveIntensity={1}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

function ThinkingIndicator() {
  const dotsRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (dotsRef.current) {
      dotsRef.current.children.forEach((dot, i) => {
        dot.position.y = -1.5 + Math.sin(state.clock.elapsedTime * 3 + i * 0.5) * 0.1
      })
    }
  })

  return (
    <group ref={dotsRef} position={[0, -1.5, 0]}>
      {[-0.2, 0, 0.2].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function Scene() {
  return (
    <group>
      <Brain />
      <NeuralNetwork />
      <Sparkles />

      {/* Chat bubbles */}
      <ChatBubble position={[1.8, 0.5, 0]} delay={0} />
      <ChatBubble position={[-1.8, 0.8, 0]} delay={1} />
      <ChatBubble position={[1.5, -0.8, 0]} delay={2} />

      <ThinkingIndicator />

      {/* 24/7 indicator */}
      <Float speed={2} floatIntensity={0.3}>
        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[0.6, 0.3, 0.1]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.3} />
        </mesh>
      </Float>
    </group>
  )
}

export default function AiAssistant3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-3, 3, 3]} intensity={0.5} color="#3b82f6" />
        <pointLight position={[3, -3, 3]} intensity={0.5} color="#10b981" />
        <Scene />
      </Canvas>
    </div>
  )
}
