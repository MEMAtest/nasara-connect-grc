'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import {
  ArrowRight,
  FileCheck2,
  ShieldAlert,
  Shield,
  FileText,
  Globe,
  BookOpenCheck,
  MessageCircle,
  Sparkles,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Navigation } from '@/components/landing/Navigation'
import { Footer } from '@/components/landing/Footer'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import dynamic from 'next/dynamic'

// Dynamic 3D component imports - Feature-specific visualizations
const AuthorizationPack3D = dynamic(() => import('@/components/landing/3d/AuthorizationPack3D'), { ssr: false })
const RiskAssessment3D = dynamic(() => import('@/components/landing/3d/RiskAssessment3D'), { ssr: false })
const SmcrManagement3D = dynamic(() => import('@/components/landing/3d/SmcrManagement3D'), { ssr: false })
const PolicyManagement3D = dynamic(() => import('@/components/landing/3d/PolicyManagement3D'), { ssr: false })
const ComplianceMonitoring3D = dynamic(() => import('@/components/landing/3d/ComplianceMonitoring3D'), { ssr: false })
const TrainingLibrary3D = dynamic(() => import('@/components/landing/3d/TrainingLibrary3D'), { ssr: false })
const AiAssistant3D = dynamic(() => import('@/components/landing/3d/AiAssistant3D'), { ssr: false })

const features = [
  {
    id: 'authorization',
    icon: FileCheck2,
    title: 'Authorization Pack',
    tagline: 'FCA-ready in weeks, not months',
    description: 'Build your complete FCA authorization application with intelligent document generation, gap analysis, and regulatory guidance.',
    gradient: 'from-blue-500 to-cyan-600',
    Component3D: AuthorizationPack3D,
    detailHref: '/features/authorization-pack',
    ctaLabel: 'Explore Authorization Pack',
    benefits: [
      'Auto-generate required FCA documents',
      'Real-time completeness tracking',
      'Regulatory gap analysis',
      'Expert review workflows'
    ],
    stats: { value: '75%', label: 'faster authorization' }
  },
  {
    id: 'risk',
    icon: ShieldAlert,
    title: 'Risk Assessment',
    tagline: 'Proactive risk management',
    description: 'Comprehensive risk identification, assessment, and monitoring with automated control testing and real-time dashboards.',
    gradient: 'from-red-500 to-orange-600',
    Component3D: RiskAssessment3D,
    detailHref: '/features/risk-assessment',
    ctaLabel: 'Explore Risk Assessment',
    benefits: [
      'Risk register management',
      'Control effectiveness testing',
      'Heat maps & visualizations',
      'Automated risk scoring'
    ],
    stats: { value: '3x', label: 'faster risk reviews' }
  },
  {
    id: 'smcr',
    icon: Shield,
    title: 'SM&CR Management',
    tagline: 'Senior manager accountability made simple',
    description: 'End-to-end Senior Managers & Certification Regime compliance including responsibilities mapping, fitness assessments, and breach reporting.',
    gradient: 'from-emerald-500 to-teal-600',
    Component3D: SmcrManagement3D,
    detailHref: '/features/smcr-management',
    ctaLabel: 'Explore SM&CR Management',
    benefits: [
      'Statement of Responsibilities builder',
      'Certification regime tracking',
      'Conduct rules training',
      'Breach reporting workflows'
    ],
    stats: { value: '100%', label: 'regulatory compliance' }
  },
  {
    id: 'policies',
    icon: FileText,
    title: 'Policy Management',
    tagline: 'Living documents that evolve with regulation',
    description: 'Automated policy creation with updates when regulations change. Version control, attestations, and gap analysis included.',
    gradient: 'from-violet-500 to-purple-600',
    Component3D: PolicyManagement3D,
    detailHref: '/features/policy-management',
    ctaLabel: 'Explore Policy Management',
    benefits: [
      'Template library with 50+ policies',
      'Auto-update on regulatory changes',
      'Staff attestation tracking',
      'Version control & audit trail'
    ],
    stats: { value: '50+', label: 'policy templates' }
  },
  {
    id: 'cmp',
    icon: Globe,
    title: 'Compliance Monitoring',
    tagline: 'Continuous compliance assurance',
    description: 'Build and execute your Compliance Monitoring Plan with scheduled testing, evidence collection, and regulatory reporting.',
    gradient: 'from-amber-500 to-yellow-600',
    Component3D: ComplianceMonitoring3D,
    detailHref: '/features/compliance-monitoring',
    ctaLabel: 'Explore Compliance Monitoring',
    benefits: [
      'CMP builder & scheduler',
      'Test execution tracking',
      'Evidence management',
      'Board reporting packs'
    ],
    stats: { value: '90%', label: 'automation rate' }
  },
  {
    id: 'training',
    icon: BookOpenCheck,
    title: 'Training Library',
    tagline: 'Compliance knowledge at scale',
    description: 'Comprehensive training modules covering FCA requirements, conduct rules, financial crime, and more. Track completions and certifications.',
    gradient: 'from-pink-500 to-rose-600',
    Component3D: TrainingLibrary3D,
    detailHref: '/features/training-library',
    ctaLabel: 'Explore Training Library',
    benefits: [
      'CPD-accredited courses',
      'Progress tracking & reporting',
      'Custom training paths',
      'Assessment & certification'
    ],
    stats: { value: '40+', label: 'training modules' }
  },
  {
    id: 'ai',
    icon: MessageCircle,
    title: 'AI Assistant',
    tagline: 'Your 24/7 compliance expert',
    description: 'Ask questions, get instant answers on FCA rules, draft documents, and receive proactive compliance guidance powered by AI.',
    gradient: 'from-cyan-500 to-blue-600',
    Component3D: AiAssistant3D,
    detailHref: '/features/ai-assistant',
    ctaLabel: 'Explore AI Assistant',
    benefits: [
      'Natural language queries',
      'Document drafting assistance',
      'Regulatory interpretation',
      'Proactive alerts & insights'
    ],
    stats: { value: '24/7', label: 'availability' }
  }
]

// Animated floating nodes component
function FloatingNodes() {
  const [nodes, setNodes] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; duration: number }>>([])

  useEffect(() => {
    // Generate random nodes
    const newNodes = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 15
    }))
    setNodes(newNodes)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute rounded-full bg-emerald-500/20"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            width: node.size,
            height: node.size,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: node.duration,
            delay: node.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
      {/* Connecting lines */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {nodes.slice(0, 15).map((node, i) => {
          const nextNode = nodes[(i + 1) % nodes.length]
          return (
            <motion.line
              key={`line-${node.id}`}
              x1={`${node.x}%`}
              y1={`${node.y}%`}
              x2={`${nextNode.x}%`}
              y2={`${nextNode.y}%`}
              stroke="url(#lineGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.3, 0] }}
              transition={{
                duration: 8,
                delay: i * 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )
        })}
      </svg>
    </div>
  )
}

export default function FeaturesPage() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Features', path: '/features' }
        ]}
      />
      <Navigation variant="solid" />

      {/* Floating Nodes Background */}
      <FloatingNodes />

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-4 z-10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Platform Features
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              <span className="text-white">Everything You Need for </span>
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
                Complete Compliance
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              From authorization to ongoing monitoring, our integrated platform covers every aspect of FCA compliance.
            </p>
            <Link
              href="/grc-platform"
              className="mt-6 inline-flex items-center justify-center text-sm font-semibold text-emerald-300 hover:text-emerald-200"
            >
              Explore the governance, risk &amp; compliance platform
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-20 px-4 z-10">
        <div className="max-w-7xl mx-auto">
          {features.map((feature, i) => (
            <FeatureSection key={feature.id} feature={feature} index={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 px-4 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to transform your compliance?
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              Partner with Nasara Connect to streamline your compliance operations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/request-demo">
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-lg px-8">
                  Request Demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-slate-600 text-white bg-slate-800/50 hover:bg-slate-700 text-lg px-8">
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function FeatureSection({ feature, index }: { feature: typeof features[0], index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const isEven = index % 2 === 0

  return (
    <motion.div
      ref={ref}
      id={feature.id}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className={`relative flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center py-20 border-b border-slate-800/50 last:border-0`}
    >
      {/* Decorative node connector */}
      <div className="absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent hidden lg:block" />

      {/* 3D Component */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md">
          {/* Glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-10 blur-3xl rounded-full`} />

          {/* 3D Canvas */}
          <div className="relative h-[400px] w-full">
            <feature.Component3D />
          </div>

          {/* Floating stat badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3 }}
            className={`absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r ${feature.gradient} rounded-2xl px-6 py-3 shadow-lg`}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{feature.stats.value}</div>
              <div className="text-xs text-white/80">{feature.stats.label}</div>
            </div>
          </motion.div>

          {/* Small floating nodes around 3D */}
          <motion.div
            className="absolute top-4 right-4 w-3 h-3 rounded-full bg-emerald-500"
            animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/4 left-4 w-2 h-2 rounded-full bg-cyan-400"
            animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          />
          <motion.div
            className="absolute bottom-1/4 right-8 w-2 h-2 rounded-full bg-teal-400"
            animate={{ x: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6">
        <Badge className={`bg-gradient-to-r ${feature.gradient} text-white border-0`}>
          {feature.tagline}
        </Badge>

        <h2 className="text-4xl font-bold text-white">{feature.title}</h2>

        <p className="text-lg text-slate-400 leading-relaxed">
          {feature.description}
        </p>

        <ul className="space-y-3">
          {feature.benefits.map((benefit, i) => (
            <motion.li
              key={i}
              className="flex items-center gap-3 text-slate-300"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center flex-shrink-0`}>
                <Check className="w-4 h-4 text-white" />
              </div>
              {benefit}
            </motion.li>
          ))}
        </ul>

        <Link href={feature.detailHref}>
          <Button className={`bg-gradient-to-r ${feature.gradient} mt-4`}>
            {feature.ctaLabel}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}
