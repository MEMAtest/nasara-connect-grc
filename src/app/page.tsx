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
  Lock,
  Zap,
  Globe,
  TrendingUp,
  FileCheck,
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

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  return (
    <div ref={containerRef} className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
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

      {/* Interactive Feature Showcases */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto space-y-48">
          <FeatureShowcase
            title="Real-Time Payment Compliance"
            description="Monitor transactions, detect anomalies, and ensure regulatory compliance across all B2B payments in real-time."
            icon={<CreditCard className="w-12 h-12" />}
            demo={<PaymentsDemo />}
            gradient="from-emerald-500 to-teal-600"
          />

          <FeatureShowcase
            title="Intelligent Risk Assessment"
            description="Identify, evaluate, and mitigate risks with AI-powered insights and interactive risk heatmaps."
            icon={<AlertTriangle className="w-12 h-12" />}
            demo={<RiskAssessmentDemo />}
            gradient="from-orange-500 to-rose-600"
            reverse
          />

          <FeatureShowcase
            title="Dynamic Control Framework"
            description="Map regulatory requirements to controls, track implementation, and maintain continuous compliance."
            icon={<Shield className="w-12 h-12" />}
            demo={<ControlFrameworkDemo />}
            gradient="from-blue-500 to-indigo-600"
          />

          <FeatureShowcase
            title="FCA Authorization Pack"
            description="Streamline your FCA authorization journey with guided questionnaires and real-time progress tracking."
            icon={<FileCheck className="w-12 h-12" />}
            demo={<AuthPackDemo />}
            gradient="from-purple-500 to-pink-600"
            reverse
          />
        </div>
      </section>

      {/* Integration Section */}
      <IntegrationSection />

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
            <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors">How It Works</a>
            <a href="#pricing" className="text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors">Pricing</a>
            <Link href="/(dashboard)">
              <Button variant="ghost" className="text-slate-600 dark:text-slate-300">
                Sign In
              </Button>
            </Link>
            <Button className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800">
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
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
            { icon: FileCheck, title: 'Authorization', desc: 'FCA-ready packs', color: 'purple' },
            { icon: CreditCard, title: 'Payments', desc: 'Real-time monitoring', color: 'emerald' },
            { icon: AlertTriangle, title: 'Risk', desc: 'AI-powered insights', color: 'orange' },
            { icon: Shield, title: 'Controls', desc: 'Regulatory mapping', color: 'blue' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <Card className="p-6 hover:shadow-xl transition-all cursor-pointer group border-2 hover:border-teal-500">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-7 h-7 text-white" />
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
                <p className="text-slate-600 dark:text-slate-400 mb-6 italic">"{testimonial.quote}"</p>
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
    <section className="py-32 px-4">
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
