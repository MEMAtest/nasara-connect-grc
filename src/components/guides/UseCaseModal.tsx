'use client'

import { useRef, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Rocket,
  Scale,
  Shield,
  Briefcase,
  Target,
  Users,
  FileCheck,
  ClipboardList,
  BarChart3,
  type LucideIcon,
} from 'lucide-react'

export type UseCaseData = {
  persona: string
  icon: string
  scenario: string
  workflow: string[]
  features: Array<{ slug: string; label: string }>
  testimonialQuote?: string
}

interface UseCaseModalProps {
  useCase: UseCaseData | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
  Rocket,
  Scale,
  Shield,
  Briefcase,
  Target,
  Users,
  FileCheck,
  ClipboardList,
  BarChart3,
}

// 3D Icon Component
function Floating3DIcon({ iconType }: { iconType: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1
    }
  })

  // Different shapes based on icon type
  const getShape = () => {
    switch (iconType) {
      case 'Rocket':
        return (
          <group ref={groupRef}>
            {/* Rocket body */}
            <mesh ref={meshRef}>
              <coneGeometry args={[0.4, 1, 32]} />
              <meshPhysicalMaterial
                color="#10b981"
                metalness={0.3}
                roughness={0.2}
                clearcoat={0.8}
              />
            </mesh>
            {/* Rocket fins */}
            {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.3, -0.4, Math.sin(angle) * 0.3]}
                rotation={[0, angle, 0]}
              >
                <boxGeometry args={[0.05, 0.3, 0.2]} />
                <meshStandardMaterial color="#0d9488" />
              </mesh>
            ))}
            {/* Exhaust glow */}
            <Float speed={3} floatIntensity={0.2}>
              <mesh position={[0, -0.7, 0]}>
                <sphereGeometry args={[0.2, 32, 32]} />
                <MeshDistortMaterial
                  color="#f97316"
                  emissive="#f97316"
                  emissiveIntensity={0.8}
                  distort={0.4}
                  speed={3}
                />
              </mesh>
            </Float>
          </group>
        )
      case 'Scale':
        return (
          <group ref={groupRef}>
            <mesh ref={meshRef}>
              {/* Scale base */}
              <cylinderGeometry args={[0.5, 0.6, 0.1, 32]} />
              <meshPhysicalMaterial color="#3b82f6" metalness={0.5} roughness={0.2} />
            </mesh>
            {/* Scale pillar */}
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.7, 16]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            {/* Scale arms */}
            <mesh position={[0, 0.7, 0]}>
              <boxGeometry args={[1, 0.05, 0.05]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            {/* Plates */}
            {[-0.4, 0.4].map((x, i) => (
              <mesh key={i} position={[x, 0.5, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
                <meshPhysicalMaterial color="#10b981" metalness={0.3} roughness={0.3} />
              </mesh>
            ))}
          </group>
        )
      case 'Shield':
        return (
          <group ref={groupRef}>
            <mesh ref={meshRef}>
              <cylinderGeometry args={[0.5, 0.35, 0.15, 6]} />
              <meshPhysicalMaterial
                color="#10b981"
                metalness={0.4}
                roughness={0.2}
                clearcoat={0.6}
              />
            </mesh>
            {/* Shield emblem */}
            <mesh position={[0, 0, 0.1]}>
              <circleGeometry args={[0.2, 32]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        )
      default:
        return (
          <group ref={groupRef}>
            <mesh ref={meshRef}>
              <icosahedronGeometry args={[0.5, 1]} />
              <meshPhysicalMaterial
                color="#10b981"
                metalness={0.3}
                roughness={0.2}
                clearcoat={0.8}
              />
            </mesh>
          </group>
        )
    }
  }

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
      {getShape()}
    </Float>
  )
}

function Scene3D({ iconType }: { iconType: string }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, -5]} intensity={0.3} color="#3b82f6" />
      <pointLight position={[5, 2, 2]} intensity={0.4} color="#10b981" />
      <Floating3DIcon iconType={iconType} />
    </>
  )
}

export function UseCaseModal({ useCase, open, onOpenChange }: UseCaseModalProps) {
  if (!useCase) return null

  const Icon = ICON_MAP[useCase.icon] || Briefcase

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-700 p-0 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-8">
          {/* Header with 3D Icon */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-8"
          >
            {/* 3D Icon Container */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-32 h-32 mx-auto mb-6"
            >
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-500/30">
                    <Icon className="w-12 h-12 text-emerald-400" />
                  </div>
                }
              >
                <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
                  <Scene3D iconType={useCase.icon} />
                </Canvas>
              </Suspense>
            </motion.div>

            <DialogHeader className="text-center space-y-2">
              <DialogTitle className="text-2xl font-bold text-white">
                {useCase.persona}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-base max-w-lg mx-auto">
                {useCase.scenario}
              </DialogDescription>
            </DialogHeader>
          </motion.div>

          {/* Workflow Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-8"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 mb-4">
              How You&apos;ll Use This Guide
            </h3>
            <div className="space-y-3">
              {useCase.workflow.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-4 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed pt-1">
                    {step}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Related Features */}
          {useCase.features.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mb-8"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-400 mb-4">
                Nasara Connect Features You&apos;ll Love
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {useCase.features.map((feature, index) => (
                  <motion.div
                    key={feature.slug}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                  >
                    <Link
                      href={`/features/${feature.slug}`}
                      className="block bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-center hover:border-teal-500/50 hover:bg-slate-800/50 transition-all group"
                    >
                      <p className="text-sm font-medium text-white group-hover:text-teal-300 transition-colors">
                        {feature.label}
                      </p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Testimonial Quote */}
          {useCase.testimonialQuote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="mb-8 text-center"
            >
              <blockquote className="text-lg italic text-slate-400 border-l-2 border-emerald-500/50 pl-4">
                &ldquo;{useCase.testimonialQuote}&rdquo;
              </blockquote>
            </motion.div>
          )}

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
              <Link href="/features">Explore Features</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-slate-600 text-white bg-slate-800/50 hover:bg-slate-700"
            >
              <Link href="/request-demo">Request Demo</Link>
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
