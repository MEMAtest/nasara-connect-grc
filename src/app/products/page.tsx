'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, Brain, Activity, Database, Shield, Zap, CheckCircle2, Network } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

// 3D Components
import dynamic from 'next/dynamic'

const PlatformEcosystem3D = dynamic(() => import('@/components/landing/3d/PlatformEcosystem3D'), { ssr: false })
const IntelligenceModule3D = dynamic(() => import('@/components/landing/3d/IntelligenceModule3D'), { ssr: false })
const ReconciliationModule3D = dynamic(() => import('@/components/landing/3d/ReconciliationModule3D'), { ssr: false })
const FrameworkModule3D = dynamic(() => import('@/components/landing/3d/FrameworkModule3D'), { ssr: false })
const IntegrationEcosystem3D = dynamic(() => import('@/components/landing/3d/IntegrationEcosystem3D'), { ssr: false })

export default function ProductsPage() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Overview Section */}
      <HeroSection />

      {/* Core Product Modules */}
      <ProductModulesSection />

      {/* Integration Ecosystem */}
      <IntegrationSection />

      {/* Final CTA */}
      <FinalCTA />
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 px-4 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950" />

      {/* Ambient Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Text */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div>
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              Integrated Platform
            </Badge>

            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-white">The Integrated Platform for </span>
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Future-Proof Compliance
              </span>
            </h1>

            <p className="text-xl text-slate-400 leading-relaxed">
              MEMA Connect combines cutting-edge AI, robust automation, and intuitive governance tools
              into a single, powerful ecosystem engineered for financial institutions.
            </p>
          </div>

          {/* Key Differentiators */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Brain, text: 'AI-Powered Insights' },
              { icon: Zap, text: 'Automated Workflows' },
              { icon: Shield, text: 'Unified Governance' },
              { icon: Network, text: 'Scalable Architecture' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-slate-200 font-medium text-sm">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right: 3D Platform Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative h-[600px]"
        >
          <PlatformEcosystem3D />
        </motion.div>
      </div>
    </section>
  )
}

function ProductModulesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const modules = [
    {
      title: 'Regulatory Intelligence Engine',
      description: 'Transform regulatory chaos into strategic clarity with AI-powered intelligence that scans global horizons, predicts impact, and delivers actionable insights before regulations hit.',
      visual: <IntelligenceModule3D />,
      features: [
        'Predictive regulatory alerting',
        'AI-powered impact analysis',
        'Global horizon scanning',
        'Automated compliance mapping'
      ],
      gradient: 'from-blue-500 to-cyan-600',
      link: '/products/regulatory-intelligence'
    },
    {
      title: 'Automated Reconciliation & Risk',
      description: 'Surgical precision meets operational scale. Automate complex financial reconciliations, detect anomalies with AI, and orchestrate remediation workflows that save hours and eliminate errors.',
      visual: <ReconciliationModule3D />,
      features: [
        'Dynamic reconciliation rules',
        'AI anomaly detection',
        'Automated remediation workflows',
        'Immutable audit trails'
      ],
      gradient: 'from-orange-500 to-rose-600',
      link: '/products/reconciliation-risk'
    },
    {
      title: 'Unified Compliance Framework',
      description: 'Build unshakeable governance foundations. Manage policies end-to-end, maintain pristine records, and generate audit-ready documentation that regulators trust and auditors admire.',
      visual: <FrameworkModule3D />,
      features: [
        'Policy lifecycle management',
        'Acknowledgement letter toolkit',
        'Automated audit trails',
        'Resolution pack readiness'
      ],
      gradient: 'from-purple-500 to-pink-600',
      link: '/products/compliance-framework'
    }
  ]

  return (
    <section ref={ref} className="py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-20"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Core Product Modules
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Each module engineered for excellence. Combined for unprecedented power.
          </p>
        </motion.div>

        <div className="space-y-32">
          {modules.map((module, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.2 }}
            >
              <Card className="p-8 lg:p-12 bg-slate-900/50 border-2 border-slate-800 hover:border-slate-700 transition-all overflow-hidden relative">
                {/* Gradient Accent */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${module.gradient} opacity-5 rounded-full blur-3xl`} />

                <div className="relative grid lg:grid-cols-2 gap-12 items-center">
                  {/* Left: Info */}
                  <div className={`space-y-6 ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <div>
                      <div className={`inline-block px-4 py-2 rounded-lg bg-gradient-to-r ${module.gradient} bg-opacity-10 mb-4`}>
                        <span className={`text-sm font-semibold bg-gradient-to-r ${module.gradient} bg-clip-text text-transparent`}>
                          Module {i + 1}
                        </span>
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-4">{module.title}</h3>
                      <p className="text-lg text-slate-400 leading-relaxed">{module.description}</p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-white font-semibold">Key Features:</h4>
                      {module.features.map((feature, j) => (
                        <div key={j} className="flex items-center gap-3">
                          <CheckCircle2 className={`w-5 h-5 bg-gradient-to-r ${module.gradient} bg-clip-text`} style={{ color: 'transparent' }} />
                          <span className="text-slate-300">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Link href={module.link}>
                      <Button className={`bg-gradient-to-r ${module.gradient} hover:opacity-90 shadow-lg`}>
                        Learn More
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>

                  {/* Right: 3D Visual */}
                  <div className={`relative h-[400px] ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                    {module.visual}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function IntegrationSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-32 px-4 bg-slate-900/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Seamless Integration. <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Unrivaled Synergy</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            MEMA Connect integrates effortlessly with your existing systems while our modules work in perfect harmony to amplify your compliance capabilities.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* 3D Integration Diagram */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="h-[500px]"
          >
            <IntegrationEcosystem3D />
          </motion.div>

          {/* Integration Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {[
              {
                title: 'Rapid Deployment',
                desc: 'Pre-built connectors and APIs ensure quick integration with minimal disruption.'
              },
              {
                title: 'Data Synergy',
                desc: 'Modules share intelligence seamlessly, creating exponential value from your data.'
              },
              {
                title: 'Unified Dashboard',
                desc: 'One interface to monitor regulatory intelligence, risk, and governance in real-time.'
              },
              {
                title: 'Future-Ready',
                desc: 'Modular architecture scales with your needs and adapts to regulatory evolution.'
              }
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50"
              >
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="py-32 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            See All Products in Action
          </h2>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Experience the power of the integrated MEMA Connect platform with a personalized product tour.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/50 text-lg px-10">
              Request Product Tour
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 text-lg px-10">
                Contact Sales
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
