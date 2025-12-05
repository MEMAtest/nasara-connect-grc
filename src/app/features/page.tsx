'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  ArrowRight,
  FileCheck2,
  ShieldAlert,
  Shield,
  FileText,
  ClipboardList,
  Globe,
  BookOpenCheck,
  MessageCircle,
  Sparkles,
  Check,
  Zap,
  Brain,
  BarChart3,
  Lock,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'

const features = [
  {
    id: 'authorization',
    icon: FileCheck2,
    title: 'Authorization Pack',
    tagline: 'FCA-ready in weeks, not months',
    description: 'Build your complete FCA authorization application with intelligent document generation, gap analysis, and regulatory guidance.',
    gradient: 'from-blue-500 to-cyan-600',
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
    description: 'AI-powered policy creation with automatic updates when regulations change. Version control, attestations, and gap analysis included.',
    gradient: 'from-violet-500 to-purple-600',
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
    benefits: [
      'Natural language queries',
      'Document drafting assistance',
      'Regulatory interpretation',
      'Proactive alerts & insights'
    ],
    stats: { value: '24/7', label: 'availability' }
  }
]

export default function FeaturesPage() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/nasara-logo.png"
                alt="Nasara Connect Logo"
                width={320}
                height={80}
                className="h-16 w-auto"
                priority
              />
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/pricing">
                <Button variant="outline" className="border-emerald-500/50 text-emerald-400">
                  View Pricing
                </Button>
              </Link>
              <Link href="/contact">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
                  Request Demo
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-20 px-4">
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
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {features.map((feature, i) => (
            <FeatureSection key={feature.id} feature={feature} index={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-4">
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
              Join 100+ FCA-regulated firms using Nasara Connect
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-lg px-8">
                  Request Demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-slate-600 text-lg px-8">
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
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
      className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center py-20 border-b border-slate-800 last:border-0`}
    >
      {/* 3D Icon Card */}
      <div className="flex-1 flex justify-center">
        <div className="relative">
          {/* Glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-20 blur-3xl rounded-full`} />

          {/* 3D Card */}
          <Card className="relative w-72 h-72 bg-slate-900/80 border-2 border-slate-700 flex items-center justify-center overflow-hidden group hover:border-slate-600 transition-all">
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5`} />

            {/* Icon */}
            <div className="relative z-10 text-center">
              <div className={`w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-12 h-12 text-white" />
              </div>
              <div className={`text-4xl font-bold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                {feature.stats.value}
              </div>
              <div className="text-slate-400 text-sm">{feature.stats.label}</div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-300" />
          </Card>
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
            <li key={i} className="flex items-center gap-3 text-slate-300">
              <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center flex-shrink-0`}>
                <Check className="w-4 h-4 text-white" />
              </div>
              {benefit}
            </li>
          ))}
        </ul>

        <Link href="/contact">
          <Button className={`bg-gradient-to-r ${feature.gradient} mt-4`}>
            Learn More
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}
