'use client'

import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import {
  ArrowRight,
  Shield,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Users,
  Zap,
  Globe,
  TrendingUp,
  Sparkles,
  PlayCircle,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

// Interactive Demo Components
import PaymentsDemo from '@/components/landing/PaymentsDemo'
import RiskAssessmentDemo from '@/components/landing/RiskAssessmentDemo'
import ControlFrameworkDemo from '@/components/landing/ControlFrameworkDemo'
import AuthPackDemo from '@/components/landing/AuthPackDemo'
import ContactForm from '@/components/landing/ContactForm'

// 3D Illustration Components
import dynamic from 'next/dynamic'

const PaymentCard3D = dynamic(() => import('@/components/landing/3d/PaymentCard3D'), { ssr: false })
const RiskGauge3D = dynamic(() => import('@/components/landing/3d/RiskGauge3D'), { ssr: false })
const ClarityGlass3D = dynamic(() => import('@/components/landing/3d/ClarityGlass3D'), { ssr: false })
const ComplianceShield3D = dynamic(() => import('@/components/landing/3d/ComplianceShield3D'), { ssr: false })

// Premium Icons
import {
  PaymentIcon,
  RiskIcon,
  ControlIcon,
  AuthorizationIcon,
  ComplianceIcon,
  DashboardIcon,
  IntegrationIcon
} from '@/components/landing/PremiumIcons'

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  return (
    <div ref={containerRef} className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 scroll-smooth">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center px-4 pt-20 pb-32"
      >
        <HeroSection />
        <AnimatedBackground />
      </motion.section>

      {/* Stats Bar */}
      <StatsSection />

      {/* Unified GRC Theme Section */}
      <UnifiedGRCSection />

      {/* 3D Illustrations Showcase */}
      <ThreeDShowcaseSection />

      {/* Interactive Feature Showcases */}
      <section id="features" className="py-32 px-4">
        <div className="max-w-7xl mx-auto space-y-48">
          <FeatureShowcase
            title="Real-Time Payment Compliance"
            description="Monitor transactions, detect anomalies, and ensure regulatory compliance across all B2B payments in real-time."
            icon={<PaymentIcon />}
            demo={<PaymentsDemo />}
            gradient="from-emerald-500 to-teal-600"
          />

          <FeatureShowcase
            title="Intelligent Risk Assessment"
            description="Identify, evaluate, and mitigate risks with AI-powered insights and interactive risk heatmaps."
            icon={<RiskIcon />}
            demo={<RiskAssessmentDemo />}
            gradient="from-orange-500 to-rose-600"
            reverse
          />

          <FeatureShowcase
            title="Dynamic Control Framework"
            description="Map regulatory requirements to controls, track implementation, and maintain continuous compliance."
            icon={<ControlIcon />}
            demo={<ControlFrameworkDemo />}
            gradient="from-blue-500 to-indigo-600"
          />

          <FeatureShowcase
            title="FCA Authorization Pack"
            description="Streamline your FCA authorization journey with guided questionnaires and real-time progress tracking."
            icon={<AuthorizationIcon />}
            demo={<AuthPackDemo />}
            gradient="from-purple-500 to-pink-600"
            reverse
          />
        </div>
      </section>

      {/* Integration Section */}
      <IntegrationSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Social Proof */}
      <SocialProofSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  )
}

function Navigation() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">
              Nasara Connect
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors scroll-smooth">Features</a>
            <a href="#how-it-works" className="text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors scroll-smooth">How It Works</a>
            <a href="#pricing" className="text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors scroll-smooth">Pricing</a>
            <Link href="/authorization-pack">
              <Button variant="ghost" className="text-slate-600 dark:text-slate-300">
                Sign In
              </Button>
            </Link>
            <a href="#contact">
              <Button className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

function HeroSection() {
  return (
    <div className="relative z-10 max-w-7xl mx-auto text-center space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Badge className="mb-4 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
          <Sparkles className="w-3 h-3 mr-1" />
          Trusted by 500+ Financial Institutions
        </Badge>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          <span className="bg-gradient-to-r from-slate-900 via-teal-800 to-slate-900 dark:from-white dark:via-teal-400 dark:to-white bg-clip-text text-transparent">
            Complete GRC Platform
          </span>
          <br />
          <span className="text-slate-700 dark:text-slate-300">
            for Modern Finance
          </span>
        </h1>

        <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Streamline governance, risk, and compliance with AI-powered tools built for SME firms,
          fintechs, and financial services providers.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <Button
          size="lg"
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <PlayCircle className="mr-2 w-5 h-5" />
          Watch Demo
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="text-lg px-8 py-6 rounded-xl border-2 hover:border-teal-600 hover:text-teal-600 transition-all"
        >
          Request Demo
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </motion.div>

      {/* Floating 3D Cards */}
      <motion.div
        className="relative mt-20 h-96"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
      >
        <Floating3DCards />
      </motion.div>
    </div>
  )
}

function Floating3DCards() {
  const cards = [
    { icon: Shield, label: 'Auth Pack', color: 'from-purple-500 to-pink-500', delay: 0 },
    { icon: CreditCard, label: 'Payments', color: 'from-emerald-500 to-teal-500', delay: 0.2 },
    { icon: AlertTriangle, label: 'Risk', color: 'from-orange-500 to-rose-500', delay: 0.4 },
    { icon: BarChart3, label: 'Controls', color: 'from-blue-500 to-indigo-500', delay: 0.6 },
  ]

  return (
    <div className="relative w-full h-full perspective-1000">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 50, rotateX: 45 }}
          animate={{
            opacity: 1,
            y: 0,
            rotateX: 0,
            z: [0, 20, 0]
          }}
          transition={{
            duration: 1,
            delay: card.delay,
            z: {
              repeat: Infinity,
              duration: 3,
              delay: card.delay,
              ease: "easeInOut"
            }
          }}
          className="absolute"
          style={{
            left: `${20 + i * 20}%`,
            top: `${20 + (i % 2) * 30}%`,
          }}
        >
          <div className={`w-40 h-40 rounded-2xl bg-gradient-to-br ${card.color} p-6 shadow-2xl hover:shadow-3xl transition-shadow cursor-pointer transform-gpu`}>
            <card.icon className="w-12 h-12 text-white mb-3" />
            <p className="text-white font-semibold text-lg">{card.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Orbs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
      />
    </div>
  )
}

function StatsSection() {
  const stats = [
    { value: '500+', label: 'SME Firms', icon: Users },
    { value: '99.9%', label: 'Uptime SLA', icon: Zap },
    { value: '£2.4B+', label: 'Payments Monitored', icon: TrendingUp },
    { value: '100%', label: 'FCA Compliant', icon: CheckCircle2 },
  ]

  return (
    <section className="py-20 bg-gradient-to-r from-teal-600 to-teal-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-3 text-teal-100" />
              <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-teal-100">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function UnifiedGRCSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-32 px-4 bg-slate-100 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <Badge className="mb-4 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
            The Complete Platform
          </Badge>

          <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-teal-800 dark:from-white dark:to-teal-400 bg-clip-text text-transparent">
            Everything You Need for GRC,
            <br />
            All in One Place
          </h2>

          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-16">
            From FCA authorization to payment monitoring, risk assessment to control frameworks—
            Nasara Connect unifies your entire governance, risk, and compliance workflow.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {[
            { icon: <AuthorizationIcon />, title: 'Authorization', desc: 'FCA-ready packs' },
            { icon: <PaymentIcon />, title: 'Payments', desc: 'Real-time monitoring' },
            { icon: <RiskIcon />, title: 'Risk', desc: 'AI-powered insights' },
            { icon: <ControlIcon />, title: 'Controls', desc: 'Regulatory mapping' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <Card className="p-6 hover:shadow-xl transition-all cursor-pointer group border-2 hover:border-teal-500">
                <div className="mb-4 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ThreeDShowcaseSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const features3D = [
    {
      title: 'Real-Time Payments',
      description: 'Monitor and secure every transaction',
      component: <PaymentCard3D />,
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Risk Intelligence',
      description: 'AI-powered threat detection',
      component: <RiskGauge3D />,
      gradient: 'from-orange-500 to-rose-600'
    },
    {
      title: 'Data Clarity',
      description: 'Transparent compliance insights',
      component: <ClarityGlass3D />,
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Compliance Shield',
      description: 'FCA-certified protection',
      component: <ComplianceShield3D />,
      gradient: 'from-purple-500 to-pink-600'
    },
  ]

  return (
    <section ref={ref} className="py-32 px-4 bg-slate-950 text-white overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <Badge className="mb-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            Powered by Advanced 3D Visualization
          </Badge>

          <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-teal-400 to-white bg-clip-text text-transparent">
            Experience GRC in 3D
          </h2>

          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Interactive 3D visualizations bring your compliance data to life with stunning clarity and precision
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {features3D.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.2, duration: 0.8 }}
            >
              <Card className="overflow-hidden border-2 border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:border-teal-500 transition-all duration-300 group">
                <div className="relative">
                  {/* 3D Canvas Container */}
                  <div className="bg-gradient-to-br from-slate-950 to-slate-900">
                    {feature.component}
                  </div>

                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none`} />
                </div>

                <div className="p-6">
                  <h3 className={`text-2xl font-bold mb-2 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                    {feature.title}
                  </h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-slate-500 mb-6">
            All visualizations update in real-time with your compliance data
          </p>
          <Button className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-lg px-8">
            Explore Interactive Demos
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

interface FeatureShowcaseProps {
  title: string
  description: string
  icon: React.ReactNode
  demo: React.ReactNode
  gradient: string
  reverse?: boolean
}

function FeatureShowcase({ title, description, icon, demo, gradient, reverse }: FeatureShowcaseProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-200px" })

  return (
    <div ref={ref} className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}>
      <motion.div
        initial={{ opacity: 0, x: reverse ? 50 : -50 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="flex-1 space-y-6"
      >
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}>
          {icon}
        </div>
        <h3 className="text-4xl font-bold">{title}</h3>
        <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
        <Button className="group">
          Learn More
          <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: reverse ? -50 : 50 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex-1 w-full"
      >
        {demo}
      </motion.div>
    </div>
  )
}

function IntegrationSection() {
  return (
    <section className="py-32 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <Badge className="mb-4 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
          <Globe className="w-3 h-3 mr-1" />
          Integrations
        </Badge>

        <h2 className="text-4xl font-bold mb-6">Connects with Your Existing Stack</h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12">
          Seamless integration with your core banking, payment processors, and compliance tools.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          {['Banking Core', 'Payment Gateway', 'ID Verification', 'Document Storage'].map((integration, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-lg mx-auto mb-3" />
              <p className="font-medium">{integration}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const steps = [
    {
      number: "01",
      title: "Connect Your Systems",
      description: "Integrate Nasara Connect with your existing banking core, payment processors, and compliance tools in minutes.",
      icon: <IntegrationIcon className="w-16 h-16" />
    },
    {
      number: "02",
      title: "Configure Your Framework",
      description: "Map your regulatory requirements, define controls, and set up automated monitoring across all compliance areas.",
      icon: <ControlIcon className="w-16 h-16" />
    },
    {
      number: "03",
      title: "Monitor in Real-Time",
      description: "Watch as transactions, risks, and compliance metrics update live with AI-powered insights and alerts.",
      icon: <DashboardIcon className="w-16 h-16" />
    },
    {
      number: "04",
      title: "Stay Compliant",
      description: "Maintain continuous compliance with automated reporting, evidence collection, and regulatory change tracking.",
      icon: <ComplianceIcon className="w-16 h-16" />
    }
  ]

  return (
    <section id="how-it-works" ref={ref} className="py-32 px-4 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <Badge className="mb-4 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
            Simple Process
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">How It Works</h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Get up and running in days, not months. Our streamlined onboarding process gets you compliant faster.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.2, duration: 0.6 }}
            >
              <Card className="p-8 hover:shadow-xl transition-all border-2 hover:border-teal-500 h-full">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <div className="text-6xl font-bold text-teal-100 dark:text-teal-900/30 mb-2">{step.number}</div>
                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-16"
        >
          <Button size="lg" className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800">
            Start Your Journey
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

function PricingSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const plans = [
    {
      name: "Starter",
      price: "£2,500",
      period: "/month",
      description: "Perfect for growing SME firms getting started with GRC",
      features: [
        "FCA Authorization Pack",
        "Up to 1,000 transactions/month",
        "Basic risk assessment",
        "Policy management",
        "Email support",
        "2 user seats"
      ],
      highlighted: false
    },
    {
      name: "Professional",
      price: "£5,000",
      period: "/month",
      description: "For established firms needing comprehensive compliance",
      features: [
        "Everything in Starter",
        "Up to 10,000 transactions/month",
        "Advanced risk & control framework",
        "Real-time payment monitoring",
        "AI-powered insights",
        "Priority support",
        "10 user seats",
        "Custom integrations"
      ],
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with complex requirements",
      features: [
        "Everything in Professional",
        "Unlimited transactions",
        "Dedicated account manager",
        "Custom workflows",
        "API access",
        "24/7 phone support",
        "Unlimited users",
        "SLA guarantees",
        "On-premise deployment option"
      ],
      highlighted: false
    }
  ]

  return (
    <section id="pricing" ref={ref} className="py-32 px-4 bg-slate-100 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
            Transparent Pricing
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Choose Your Plan</h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Simple, transparent pricing that scales with your business. No hidden fees.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <Card className={`p-8 h-full flex flex-col ${
                plan.highlighted
                  ? 'border-4 border-teal-500 shadow-2xl relative'
                  : 'border-2 hover:border-teal-500 transition-all'
              }`}>
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-1 text-sm">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    {plan.period && <span className="text-slate-600 dark:text-slate-400">{plan.period}</span>}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                  size="lg"
                >
                  {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-slate-600 dark:text-slate-400">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

function SocialProofSection() {
  return (
    <section className="py-32 px-4 bg-slate-100 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Trusted by Forward-Thinking Firms</h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Join hundreds of SME financial institutions accelerating their compliance journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              quote: "Nasara Connect cut our FCA authorization prep time by 60%. The Auth Pack guided us through every requirement.",
              author: "Sarah Chen",
              role: "Chief Compliance Officer, FinTrust",
              avatar: "SC"
            },
            {
              quote: "Real-time payment monitoring has been a game-changer. We catch compliance issues before they become problems.",
              author: "James Okafor",
              role: "Head of Risk, PayStream",
              avatar: "JO"
            },
            {
              quote: "The unified platform means we're not juggling multiple tools. Everything from risk to controls in one place.",
              author: "Emma Williams",
              role: "Operations Director, TechBank",
              avatar: "EW"
            }
          ].map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 h-full">
                <p className="text-slate-600 dark:text-slate-400 mb-6 italic">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{testimonial.role}</p>
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

function CTASection() {
  return (
    <section id="contact" className="py-32 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your GRC?
            </h2>
            <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
              Join 500+ SME firms already accelerating compliance, reducing risk, and gaining confidence with Nasara Connect.
            </p>

            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">Nasara Connect</span>
            </div>
            <p className="text-sm">Complete GRC platform for modern finance.</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-teal-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Integrations</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-teal-400 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-teal-400 transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Compliance</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-sm">
          <p>&copy; 2025 Nasara Connect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
