'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, Calendar, Users, Target, Shield, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

// Components
import dynamic from 'next/dynamic'

import { Footer } from '@/components/landing/Footer'

const BookingCalendar = dynamic(() => import('@/components/about/BookingCalendar'), { ssr: false })
const TimelineCalendar3D = dynamic(() => import('@/components/landing/3d/TimelineCalendar3D'), { ssr: false })

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' }
        ]}
      />
      {/* Hero Section */}
      <HeroSection />

      {/* Mission & Story */}
      <StorySection />

      {/* Interactive Booking Calendar */}
      <BookingSection />

      {/* Company Timeline */}
      <TimelineSection />

      {/* Team Section */}
      <TeamSection />

      {/* Values */}
      <ValuesSection />

      {/* Final CTA */}
      <FinalCTA />

      <Footer />
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-[70vh] flex items-center pt-32 pb-20 px-4 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950" />

      {/* Ambient Glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <Badge className="mb-4 bg-purple-500/10 text-purple-400 border-purple-500/30">
            About Nasara Connect
          </Badge>

          <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Building the </span>
            <span className="bg-gradient-to-r from-purple-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Future of Compliance
            </span>
          </h1>

          <p className="text-xl lg:text-2xl text-slate-400 leading-relaxed max-w-4xl mx-auto">
            We&apos;re on a mission to transform regulatory compliance from a burden into a competitive advantage.
            Founded by industry experts, built for the future.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">2022</div>
              <div className="text-slate-400">Founded</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function StorySection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          {/* Left: Story */}
          <div className="space-y-6">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              Our Story
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Born from Frustration, Built with Purpose
            </h2>
            <div className="space-y-4 text-lg text-slate-400 leading-relaxed">
              <p>
                Nasara Connect was founded in 2022 by a team of regulatory experts, compliance officers,
                and technologists who shared a common frustration: compliance tools were outdated,
                fragmented, and impossibly complex.
              </p>
              <p>
                After years working in financial services—navigating FCA authorizations, managing
                regulatory change, and witnessing firms struggle with manual processes—we knew there
                had to be a better way.
              </p>
              <p>
                We built Nasara Connect to be the platform we wish we&apos;d had: intelligent, integrated,
                and genuinely useful. We serve financial institutions across
                banking, FinTech, payments, and wealth management.
              </p>
            </div>
          </div>

          {/* Right: Mission Cards */}
          <div className="space-y-6">
            {[
              {
                icon: Target,
                title: 'Our Mission',
                desc: 'Transform regulatory compliance from a cost center into a strategic advantage through intelligent automation and expert-built tools.',
                gradient: 'from-emerald-500 to-teal-600'
              },
              {
                icon: Shield,
                title: 'Our Vision',
                desc: 'A world where every financial institution has enterprise-grade compliance capabilities, regardless of size or budget.',
                gradient: 'from-blue-500 to-cyan-600'
              },
              {
                icon: Sparkles,
                title: 'Our Values',
                desc: 'Expertise, transparency, innovation, and relentless focus on customer success. We succeed when our clients succeed.',
                gradient: 'from-purple-500 to-pink-600'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.2 }}
              >
                <Card className="p-6 bg-slate-900/50 border-2 border-slate-800 hover:border-slate-700 transition-all">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.gradient} opacity-20 flex items-center justify-center mb-4`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function BookingSection() {
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
          <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/30">
            <Calendar className="w-4 h-4 mr-2 inline" />
            Book a Consultation
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Let&apos;s Talk About Your Compliance Challenges
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Schedule a personalized consultation with our compliance experts. Choose a date and time that works for you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          <BookingCalendar />
        </motion.div>
      </div>
    </section>
  )
}

function TimelineSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const milestones = [
    { year: '2022', quarter: 'Q1', title: 'Company Founded', desc: 'Nasara Connect established by regulatory experts' },
    { year: '2022', quarter: 'Q3', title: 'Platform Development', desc: 'Core compliance modules in development' },
    { year: '2023', quarter: 'Q1', title: 'Product Suite Launch', desc: 'Authorization Pack, Risk Assessment, and Policy modules live' },
    { year: '2023', quarter: 'Q3', title: 'Platform Expansion', desc: 'SM&CR Management and Training Library launched' },
    { year: '2024', quarter: 'Q1', title: 'AI Integration', desc: 'AI-powered compliance assistant deployed' },
    { year: '2024', quarter: 'Q4', title: 'Full GRC Platform', desc: 'Complete governance, risk, and compliance suite available' },
    { year: '2025', quarter: 'Q2', title: 'Registers & Reporting', desc: 'Comprehensive regulatory registers and board reporting launched' },
    { year: '2025', quarter: 'Q4', title: 'Compliance Framework Builder', desc: 'Custom compliance monitoring plan builder released' },
    { year: '2026', quarter: 'Q1', title: 'Cyber Essentials Certified', desc: 'Achieved Cyber Essentials certification for enhanced security assurance' },
  ]

  return (
    <section ref={ref} className="py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Our Journey
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Building the future of regulatory compliance, one milestone at a time
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: 3D Timeline Visual */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="h-[500px]"
          >
            <TimelineCalendar3D />
          </motion.div>

          {/* Right: Timeline List */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {milestones.map((milestone, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-emerald-500/20 border border-purple-500/30 flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-400">{milestone.quarter}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-semibold text-slate-500">{milestone.year}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{milestone.title}</h3>
                  <p className="text-slate-400">{milestone.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function TeamSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const team = [
    { name: 'Ade Omosanya', role: 'CEO & Co-Founder', expertise: 'Regulatory technology strategist with deep expertise in FCA compliance and financial services transformation' },
    { name: 'Misah Maragh', role: 'COO & Co-Founder', expertise: 'Operations and compliance specialist with extensive experience in building scalable regulatory frameworks' },
  ]

  return (
    <section ref={ref} className="py-32 px-4 bg-slate-900/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            <Users className="w-4 h-4 mr-2 inline" />
            Our Team
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Meet the Experts Behind Nasara Connect
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            A world-class team combining deep regulatory expertise with cutting-edge technology
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {team.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 bg-slate-900/50 border-2 border-slate-800 hover:border-slate-700 transition-all">
                {/* Avatar placeholder */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-emerald-500/20 border-2 border-purple-500/30 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                <p className="text-emerald-400 text-sm font-semibold mb-3">{member.role}</p>
                <p className="text-slate-400 text-sm">{member.expertise}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ValuesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const values = [
    {
      icon: Shield,
      title: 'Regulatory Expertise First',
      desc: 'Built by compliance professionals who understand your challenges because we\'ve lived them.',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Sparkles,
      title: 'Innovation Without Compromise',
      desc: 'Cutting-edge technology that never sacrifices regulatory accuracy or auditability.',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: Users,
      title: 'Customer Success Obsessed',
      desc: 'Your success is our success. We measure ourselves by your outcomes, not our features.',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      icon: Target,
      title: 'Transparent & Trustworthy',
      desc: 'No hidden costs, no vendor lock-in, no surprises. We earn your trust every day.',
      gradient: 'from-orange-500 to-rose-600'
    },
  ]

  return (
    <section ref={ref} className="py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Our Core Values
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            The principles that guide everything we do
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {values.map((value, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15 }}
            >
              <Card className="p-8 bg-slate-900/50 border-2 border-slate-800 hover:border-slate-700 transition-all h-full">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${value.gradient} opacity-20 flex items-center justify-center mb-6`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-lg text-slate-400 leading-relaxed">{value.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="py-32 px-4 bg-slate-900/30">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Compliance Operations?
          </h2>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Partner with Nasara Connect to simplify compliance and accelerate growth.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/50 text-lg px-10">
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-slate-600 text-white bg-slate-800/50 hover:bg-slate-700 text-lg px-10">
              <Calendar className="mr-2 w-5 h-5" />
              Book a Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
