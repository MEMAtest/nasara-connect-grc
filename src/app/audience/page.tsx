'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, CreditCard, Building2, TrendingUp, Shield, Coins, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'

const audiences = [
  {
    id: 'fintech',
    icon: CreditCard,
    title: 'Fintech & Payments',
    subtitle: 'EMIs, PIs, and Payment Processors',
    description: 'Purpose-built compliance for electronic money institutions, payment institutions, and payment service providers navigating PSD2, EMRs, and safeguarding requirements.',
    gradient: 'from-blue-500 to-cyan-600',
    challenges: [
      'Safeguarding requirements',
      'PSD2 compliance',
      'Transaction monitoring',
      'Agent oversight'
    ],
    solutions: [
      'Automated safeguarding calculations',
      'PSD2-compliant policies',
      'Real-time transaction monitoring',
      'Agent due diligence workflows'
    ]
  },
  {
    id: 'banks',
    icon: Building2,
    title: 'Banks & Credit',
    subtitle: 'Banks, Building Societies, Credit Unions',
    description: 'Comprehensive compliance for deposit-takers and credit institutions managing complex regulatory obligations across prudential and conduct requirements.',
    gradient: 'from-emerald-500 to-teal-600',
    challenges: [
      'Capital requirements',
      'Consumer Duty',
      'Conduct risk',
      'Operational resilience'
    ],
    solutions: [
      'ICAAP/ILAAP documentation',
      'Consumer Duty framework',
      'Conduct risk monitoring',
      'Operational resilience mapping'
    ]
  },
  {
    id: 'investment',
    icon: TrendingUp,
    title: 'Investment Firms',
    subtitle: 'Asset Managers, Wealth Managers, IFAs',
    description: 'Tailored compliance for MiFID firms, discretionary managers, and advisory businesses handling client assets and providing investment services.',
    gradient: 'from-violet-500 to-purple-600',
    challenges: [
      'MiFID II requirements',
      'CASS compliance',
      'Best execution',
      'Conflicts management'
    ],
    solutions: [
      'MiFID policy suite',
      'CASS monitoring tools',
      'Best execution analysis',
      'Conflicts register'
    ]
  },
  {
    id: 'insurance',
    icon: Shield,
    title: 'Insurance',
    subtitle: 'Insurers, MGAs, Brokers',
    description: 'End-to-end compliance for insurance distributors and intermediaries navigating IDD, product governance, and fair value assessments.',
    gradient: 'from-amber-500 to-orange-600',
    challenges: [
      'IDD compliance',
      'Product governance',
      'Fair value assessment',
      'Claims handling'
    ],
    solutions: [
      'IDD policy framework',
      'Product approval process',
      'Fair value calculator',
      'Claims MI dashboards'
    ]
  },
  {
    id: 'crypto',
    icon: Coins,
    title: 'Crypto & Digital Assets',
    subtitle: 'Exchanges, Custodians, DeFi',
    description: 'Cutting-edge compliance for cryptoasset businesses meeting FCA registration requirements, financial promotions rules, and evolving regulatory expectations.',
    gradient: 'from-pink-500 to-rose-600',
    challenges: [
      'FCA registration',
      'Financial promotions',
      'AML/CTF obligations',
      'Custody requirements'
    ],
    solutions: [
      'Registration application support',
      'Crypto promotions compliance',
      'Enhanced AML framework',
      'Custody policy suite'
    ]
  },
  {
    id: 'consumer',
    icon: Wallet,
    title: 'Consumer Finance',
    subtitle: 'Lenders, BNPL, Credit Brokers',
    description: 'Specialist compliance for consumer credit firms including lenders, brokers, and debt services navigating CONC and affordability requirements.',
    gradient: 'from-cyan-500 to-blue-600',
    challenges: [
      'CONC compliance',
      'Affordability assessment',
      'Vulnerable customers',
      'Collections practices'
    ],
    solutions: [
      'CONC policy framework',
      'Affordability models',
      'Vulnerability framework',
      'Collections compliance'
    ]
  }
]

export default function AudiencePage() {
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
              Built for Your Sector
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              <span className="text-white">Compliance Tailored to </span>
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
                Your Industry
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Whether you&apos;re a fintech startup or an established institution, we understand your specific regulatory challenges.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Audiences Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {audiences.map((audience, i) => (
            <motion.div
              key={audience.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full bg-slate-900/50 border-2 border-slate-800 hover:border-slate-700 transition-all p-8 group">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${audience.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <audience.icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-2">{audience.title}</h3>
                <p className="text-emerald-400 text-sm mb-4">{audience.subtitle}</p>

                {/* Description */}
                <p className="text-slate-400 mb-6 leading-relaxed">{audience.description}</p>

                {/* Challenges */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3">Key Challenges</h4>
                  <div className="flex flex-wrap gap-2">
                    {audience.challenges.map((challenge, j) => (
                      <Badge key={j} variant="outline" className="border-slate-700 text-slate-400">
                        {challenge}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Link href={`/audience/${audience.id}`}>
                  <Button className={`w-full bg-gradient-to-r ${audience.gradient}`}>
                    Learn More
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </Card>
            </motion.div>
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
              Don&apos;t see your sector?
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              We work with all FCA-regulated firms. Let&apos;s discuss your specific needs.
            </p>
            <Link href="/contact">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-lg px-8">
                Get in Touch
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
