'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import {
  ArrowRight,
  Shield,
  Sparkles,
  PlayCircle,
  ChevronRight,
  CheckCircle2,
  Brain,
  Activity,
  Database,
  Network,
  Zap,
  Lock,
  FileCheck,
  AlertCircle,
  BarChart3,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'

// 3D Illustration Components
import dynamic from 'next/dynamic'
import { AnimatedComplianceScore } from '@/components/landing/AnimatedComplianceScore'
import { CaseStudiesSection } from '@/components/landing/CaseStudiesSection'
import { LegalModal, useLegalModals } from '@/components/landing/LegalModals'
import { AnimatedCounter, PercentCounter, PlusCounter } from '@/components/landing/AnimatedCounter'
import { ParallaxElements } from '@/components/landing/ParallaxElements'

const ComplianceEcosystem3D = dynamic(() => import('@/components/landing/3d/ComplianceEcosystem3D'), { ssr: false })
const IntelligenceEngine3D = dynamic(() => import('@/components/landing/3d/IntelligenceEngine3D'), { ssr: false })
const WorkflowEngine3D = dynamic(() => import('@/components/landing/3d/WorkflowEngine3D'), { ssr: false })
const GovernanceFramework3D = dynamic(() => import('@/components/landing/3d/GovernanceFramework3D'), { ssr: false })

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Parallax Background Elements */}
      <ParallaxElements />

      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <HeroSection />

      {/* Case Studies */}
      <CaseStudiesSection />

      {/* Regulatory Intelligence */}
      <IntelligenceSection />

      {/* Risk & Reconciliation */}
      <ReconciliationSection />

      {/* Governance */}
      <GovernanceSection />

      {/* Final CTA */}
      <FinalCTASection />

      {/* Footer */}
      <Footer />
    </div>
  )
}

function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    {
      label: 'Features',
      href: '/features',
      dropdown: [
        { label: 'Authorization Pack', href: '/features#authorization', icon: '📋' },
        { label: 'Risk Assessment', href: '/features#risk', icon: '⚠️' },
        { label: 'SM&CR Management', href: '/features#smcr', icon: '👔' },
        { label: 'Policy Management', href: '/features#policies', icon: '📄' },
        { label: 'Compliance Monitoring', href: '/features#cmp', icon: '📊' },
        { label: 'Training Library', href: '/features#training', icon: '🎓' },
        { label: 'AI Assistant', href: '/features#ai', icon: '🤖' },
      ]
    },
    {
      label: 'Audience',
      href: '/audience',
      dropdown: [
        { label: 'Fintech & Payments', href: '/audience/fintech', icon: '💳' },
        { label: 'Banks & Credit', href: '/audience/banks', icon: '🏦' },
        { label: 'Investment Firms', href: '/audience/investment', icon: '📈' },
        { label: 'Insurance', href: '/audience/insurance', icon: '🛡️' },
        { label: 'Crypto & Digital Assets', href: '/audience/crypto', icon: '₿' },
        { label: 'Consumer Finance', href: '/audience/consumer', icon: '💰' },
      ]
    },
    {
      label: 'Resources',
      href: '/resources',
      dropdown: [
        { label: 'Documentation', href: '/resources#docs', icon: '📚' },
        { label: 'Guides & Tutorials', href: '/resources#guides', icon: '🎯' },
        { label: 'Blog', href: '/resources#blog', icon: '✍️' },
        { label: 'Webinars', href: '/resources#webinars', icon: '🎥' },
      ]
    },
    {
      label: 'Pricing',
      href: '/pricing',
    },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/90 backdrop-blur-xl border-b border-slate-800'
          : 'bg-transparent'
      }`}
    >
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

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.dropdown && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-4 py-2 text-slate-300 hover:text-emerald-400 transition-colors text-sm font-medium"
                >
                  {item.label}
                  {item.dropdown && (
                    <ChevronRight className={`w-3 h-3 transition-transform ${openDropdown === item.label ? 'rotate-90' : ''}`} />
                  )}
                </Link>

                {item.dropdown && openDropdown === item.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 mt-1 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
                  >
                    {item.dropdown.map((subItem) => (
                      <Link
                        key={subItem.label}
                        href={subItem.href}
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-emerald-500/10 transition-all border-b border-slate-800/50 last:border-0"
                      >
                        <span className="text-lg">{subItem.icon}</span>
                        <span className="text-sm font-medium">{subItem.label}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}

            <div className="flex items-center gap-3 ml-4">
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400 hover:text-emerald-300 transition-all"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/contact">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25">
                  Request Demo
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 px-4 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20" />

      {/* Ambient Glow */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Text Column */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div>
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 mr-1" />
              Next-Generation Compliance Platform
            </Badge>

            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Future-Proof Your Firm with </span>
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Intelligent Compliance
              </span>
            </h1>

            <p className="text-xl text-slate-400 leading-relaxed mb-8">
              Nasara Connect is the AI-powered platform that transforms regulatory chaos into strategic advantage,
              ensuring precision, resilience, and growth.
            </p>
          </div>

          {/* Key Value Props */}
          <div className="space-y-4">
            {[
              { icon: Brain, text: 'Automated Regulatory Intelligence' },
              { icon: Activity, text: 'Predictive Risk Mitigation' },
              { icon: Lock, text: 'Audit-Ready Governance' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-slate-200 font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/50 text-lg px-8">
              Request a Demo
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-lg px-8">
              <PlayCircle className="mr-2 w-5 h-5" />
              Explore Platform
            </Button>
          </div>
        </motion.div>

        {/* Right: 3D Ecosystem Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative h-[600px]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-3xl" />
          <ComplianceEcosystem3D />

          {/* Animated Compliance Score */}
          <AnimatedComplianceScore />
        </motion.div>
      </div>
    </section>
  )
}

function ClientLogosSection() {
  const logos = [
    'Tier 1 Bank', 'Leading FinTech', 'Global Issuer', 'Payment Provider',
    'Asset Manager', 'Digital Bank'
  ]

  return (
    <section className="py-20 px-4 border-y border-slate-800 bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            Trusted by Forward-Thinking Financial Institutions
          </h2>
          <a href="#" className="text-emerald-400 hover:text-emerald-300 text-sm inline-flex items-center gap-1">
            Read Our Case Studies
            <ChevronRight className="w-4 h-4" />
          </a>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {logos.map((logo, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-center p-6 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 transition-all group"
            >
              <span className="text-slate-400 group-hover:text-slate-300 font-medium text-sm text-center">
                {logo}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function IntelligenceSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="intelligence" ref={ref} className="py-32 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950/20 to-slate-950" />

      <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: 3D Intelligence Engine */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative h-[500px]"
        >
          <IntelligenceEngine3D />
        </motion.div>

        {/* Right: Text Column */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Regulatory Intelligence, <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Decoded</span>
            </h2>
            <p className="text-xl text-slate-400 leading-relaxed">
              From millions of data points, Nasara Connect distills actionable insights, empowering proactive
              decision-making and strategic resilience.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: AlertCircle,
                title: 'Predictive Alerting',
                desc: 'Receive early warnings on emerging risks and regulatory shifts before they impact your business.'
              },
              {
                icon: BarChart3,
                title: 'Impact Analysis',
                desc: 'Understand the precise implications of new regulations on your firm\'s specific operations.'
              },
              {
                icon: Network,
                title: 'Global Horizon Scanning',
                desc: 'Track global regulatory landscapes, not just local, to anticipate future challenges.'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                className="flex gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-blue-500/50 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg shadow-blue-500/50">
            See Intelligence in Action
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

function ReconciliationSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="automation" ref={ref} className="py-32 px-4 bg-slate-900/50">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Text Column */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">Precision</span> Automation for Complex Workflows
            </h2>
            <p className="text-xl text-slate-400 leading-relaxed">
              Nasara Connect automates complex financial reconciliations, identifies anomalies with surgical precision,
              and orchestrates remediation workflows, saving hours and minimizing errors.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: Database,
                title: 'Dynamic Reconciliation Rules',
                desc: 'Configure custom rules for various fund types and regulatory requirements.'
              },
              {
                icon: Zap,
                title: 'Automated Anomaly Detection',
                desc: 'Leverage AI to flag genuine shortfalls from timing differences, reducing false positives.'
              },
              {
                icon: Activity,
                title: 'Streamlined Remediation',
                desc: 'Automate top-up workflows and generate immutable audit trails for every action.'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                className="flex gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-orange-500/50 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-rose-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <Button className="bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 shadow-lg shadow-orange-500/50">
            Learn More About Automation
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>

        {/* Right: 3D Workflow Engine */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative h-[500px]"
        >
          <WorkflowEngine3D />

          {/* Floating Stats */}
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 left-10 bg-slate-900/90 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6 shadow-2xl shadow-orange-500/20"
          >
            <div className="text-sm text-slate-400 mb-1">Reconciliation Match</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
              <PercentCounter value={99.8} duration={2.5} />
            </div>
            <div className="flex items-center gap-1 mt-2 text-green-400 text-xs">
              <CheckCircle2 className="w-3 h-3" />
              <span>All checks passed</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function GovernanceSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="governance" ref={ref} className="py-32 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950" />

      <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: 3D Governance Framework */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative h-[500px]"
        >
          <GovernanceFramework3D />
        </motion.div>

        {/* Right: Text Column */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Unshakeable Governance. <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Seamless Audits</span>
            </h2>
            <p className="text-xl text-slate-400 leading-relaxed">
              Nasara Connect provides the robust framework you need for comprehensive policy management,
              clear record-keeping, and irrefutable audit trails.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: FileCheck,
                title: 'Policy Lifecycle Management',
                desc: 'Track policies from creation to review, ensuring continuous compliance.'
              },
              {
                icon: Shield,
                title: 'Acknowledgement Letter Toolkit',
                desc: 'End-to-end management and tracking for all safeguarding acknowledgements.'
              },
              {
                icon: Lock,
                title: 'Automated Audit Trails',
                desc: 'Generate comprehensive, immutable records to simplify regulatory scrutiny.'
              },
              {
                icon: Database,
                title: 'Resolution Pack Readiness',
                desc: 'Ensure orderly client payouts with clean, exportable data in a wind-down scenario.'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                className="flex gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-purple-500/50 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg shadow-purple-500/50">
            Explore Governance Tools
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

function FinalCTASection() {
  return (
    <section className="py-32 px-4 relative overflow-hidden">
      {/* Immersive Dark Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-emerald-950/30 to-slate-950" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Badge className="mb-6 bg-emerald-500/10 text-emerald-400 border-emerald-500/30 backdrop-blur-sm text-base px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Transform Your Compliance Operations
          </Badge>

          <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Experience the Future of Compliance
          </h2>

          <p className="text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover how our AI-powered platform can transform your firm&apos;s regulatory operations
            and strategic advantage.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/50 text-xl px-10 py-7">
              Request a Demo
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
            <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-xl px-10 py-7">
              Contact Sales
            </Button>
          </div>

          <p className="text-slate-500 mt-8 text-sm">
            Join <span className="text-emerald-400 font-semibold"><PlusCounter value={500} duration={2} /></span> financial institutions already transforming their compliance operations
          </p>
        </motion.div>
      </div>
    </section>
  )
}

function Footer() {
  const { termsOpen, setTermsOpen, privacyOpen, setPrivacyOpen } = useLegalModals()

  return (
    <>
      <footer className="bg-slate-950 border-t border-slate-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image
                  src="/nasara-logo.png"
                  alt="Nasara Connect Logo"
                  width={140}
                  height={32}
                  className="h-8 w-auto"
                />
              </div>
              <p className="text-slate-400 text-sm">
                Next-generation compliance platform for modern financial institutions.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#intelligence" className="text-slate-400 hover:text-emerald-400 transition-colors">Intelligence</a></li>
                <li><a href="#automation" className="text-slate-400 hover:text-emerald-400 transition-colors">Automation</a></li>
                <li><a href="#governance" className="text-slate-400 hover:text-emerald-400 transition-colors">Governance</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">About</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">Case Studies</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">Careers</a></li>
                <li><Link href="/contact" className="text-slate-400 hover:text-emerald-400 transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => setPrivacyOpen(true)}
                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    Privacy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setTermsOpen(true)}
                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    Terms
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-500 text-sm">&copy; 2025 Nasara Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      <LegalModal type="privacy" open={privacyOpen} onOpenChange={setPrivacyOpen} />
      <LegalModal type="terms" open={termsOpen} onOpenChange={setTermsOpen} />
    </>
  )
}
