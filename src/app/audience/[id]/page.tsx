'use client'

import { use } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, Check, Sparkles, CreditCard, Building2, TrendingUp, Shield, Coins, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Navigation } from '@/components/landing/Navigation'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamic 3D component imports
const FinTechSector3D = dynamic(() => import('@/components/landing/3d/FinTechSector3D'), { ssr: false })
const BankingSector3D = dynamic(() => import('@/components/landing/3d/BankingSector3D'), { ssr: false })
const AssetManagementSector3D = dynamic(() => import('@/components/landing/3d/AssetManagementSector3D'), { ssr: false })
const InsuranceSector3D = dynamic(() => import('@/components/landing/3d/InsuranceSector3D'), { ssr: false })
const PaymentCard3D = dynamic(() => import('@/components/landing/3d/PaymentCard3D'), { ssr: false })
const ComplianceShield3D = dynamic(() => import('@/components/landing/3d/ComplianceShield3D'), { ssr: false })

const sectorData = {
  fintech: {
    id: 'fintech',
    icon: CreditCard,
    title: 'Fintech & Payments',
    subtitle: 'EMIs, PIs, and Payment Processors',
    heroTitle: 'Compliance for the Future of Finance',
    description: 'Purpose-built compliance for electronic money institutions, payment institutions, and payment service providers navigating PSD2, EMRs, and safeguarding requirements.',
    gradient: 'from-blue-500 to-cyan-600',
    Component3D: FinTechSector3D,
    challenges: [
      { title: 'Safeguarding Requirements', desc: 'Complex client money calculations and reporting' },
      { title: 'PSD2 Compliance', desc: 'Strong customer authentication and open banking' },
      { title: 'Transaction Monitoring', desc: 'Real-time fraud detection and AML screening' },
      { title: 'Agent Oversight', desc: 'Due diligence and ongoing monitoring of agents' }
    ],
    solutions: [
      'Automated safeguarding calculations with daily reconciliation',
      'PSD2-compliant policies and procedures',
      'Real-time transaction monitoring dashboards',
      'Agent due diligence workflows and risk scoring',
      'Regulatory reporting automation',
      'E-money issuance tracking'
    ],
    features: [
      { title: 'Authorization Pack', desc: 'FCA-ready EMI/PI application builder' },
      { title: 'Safeguarding Module', desc: 'Automated calculations and audit trails' },
      { title: 'Transaction Monitoring', desc: 'Real-time alerts and reporting' },
      { title: 'Agent Management', desc: 'Full agent lifecycle compliance' }
    ],
    stats: [
      { value: '£50B+', label: 'Transactions Monitored' },
      { value: '200+', label: 'Fintech Clients' },
      { value: '99.9%', label: 'Uptime SLA' }
    ]
  },
  banks: {
    id: 'banks',
    icon: Building2,
    title: 'Banks & Credit',
    subtitle: 'Banks, Building Societies, Credit Unions',
    heroTitle: 'Enterprise Compliance for Deposit-Takers',
    description: 'Comprehensive compliance for deposit-takers and credit institutions managing complex regulatory obligations across prudential and conduct requirements.',
    gradient: 'from-emerald-500 to-teal-600',
    Component3D: BankingSector3D,
    challenges: [
      { title: 'Capital Requirements', desc: 'ICAAP, ILAAP, and capital adequacy' },
      { title: 'Consumer Duty', desc: 'Fair value and customer outcomes monitoring' },
      { title: 'Conduct Risk', desc: 'Cultural risk and conduct monitoring' },
      { title: 'Operational Resilience', desc: 'Important business services mapping' }
    ],
    solutions: [
      'ICAAP/ILAAP documentation and stress testing support',
      'Consumer Duty framework with outcome monitoring',
      'Conduct risk dashboards and early warning indicators',
      'Operational resilience mapping and impact tolerance',
      'SM&CR full regime implementation',
      'Board and committee reporting packs'
    ],
    features: [
      { title: 'Prudential Module', desc: 'Capital and liquidity requirements' },
      { title: 'Consumer Duty Hub', desc: 'Outcomes monitoring and fair value' },
      { title: 'SM&CR Management', desc: 'Full senior managers regime' },
      { title: 'Board Reporting', desc: 'Automated MI and dashboards' }
    ],
    stats: [
      { value: '50+', label: 'Banking Clients' },
      { value: '£100B+', label: 'Assets Under Compliance' },
      { value: '100%', label: 'Regulatory Pass Rate' }
    ]
  },
  investment: {
    id: 'investment',
    icon: TrendingUp,
    title: 'Investment Firms',
    subtitle: 'Asset Managers, Wealth Managers, IFAs',
    heroTitle: 'MiFID-Ready Compliance',
    description: 'Tailored compliance for MiFID firms, discretionary managers, and advisory businesses handling client assets and providing investment services.',
    gradient: 'from-violet-500 to-purple-600',
    Component3D: AssetManagementSector3D,
    challenges: [
      { title: 'MiFID II Requirements', desc: 'Complex disclosure and reporting obligations' },
      { title: 'CASS Compliance', desc: 'Client money and asset segregation' },
      { title: 'Best Execution', desc: 'Monitoring and demonstrating best execution' },
      { title: 'Conflicts Management', desc: 'Identification and management of conflicts' }
    ],
    solutions: [
      'Complete MiFID II policy suite with auto-updates',
      'CASS monitoring tools and reconciliation',
      'Best execution analysis and reporting',
      'Conflicts register and management workflows',
      'Suitability assessment frameworks',
      'RTS 25/28 reporting automation'
    ],
    features: [
      { title: 'MiFID Hub', desc: 'Full regulatory coverage' },
      { title: 'CASS Module', desc: 'Client assets compliance' },
      { title: 'Best Execution', desc: 'Monitoring and reporting' },
      { title: 'Suitability Engine', desc: 'Assessment and documentation' }
    ],
    stats: [
      { value: '£500B+', label: 'AUM Covered' },
      { value: '150+', label: 'Investment Firms' },
      { value: '95%', label: 'Time Saved on Reporting' }
    ]
  },
  insurance: {
    id: 'insurance',
    icon: Shield,
    title: 'Insurance',
    subtitle: 'Insurers, MGAs, Brokers',
    heroTitle: 'Complete Insurance Distribution Compliance',
    description: 'End-to-end compliance for insurance distributors and intermediaries navigating IDD, product governance, and fair value assessments.',
    gradient: 'from-amber-500 to-orange-600',
    Component3D: InsuranceSector3D,
    challenges: [
      { title: 'IDD Compliance', desc: 'Insurance Distribution Directive requirements' },
      { title: 'Product Governance', desc: 'Target market and distribution oversight' },
      { title: 'Fair Value Assessment', desc: 'Consumer Duty product value' },
      { title: 'Claims Handling', desc: 'Fair claims management' }
    ],
    solutions: [
      'IDD policy framework with IPID templates',
      'Product approval and review process automation',
      'Fair value calculator and evidence capture',
      'Claims MI dashboards and reporting',
      'Appointed representative oversight',
      'Conduct risk monitoring'
    ],
    features: [
      { title: 'IDD Framework', desc: 'Full distribution compliance' },
      { title: 'Product Governance', desc: 'Lifecycle management' },
      { title: 'Fair Value Engine', desc: 'Assessment and evidence' },
      { title: 'AR Oversight', desc: 'Representative management' }
    ],
    stats: [
      { value: '300+', label: 'Insurance Firms' },
      { value: '10M+', label: 'Policies Reviewed' },
      { value: '80%', label: 'Faster Product Approval' }
    ]
  },
  crypto: {
    id: 'crypto',
    icon: Coins,
    title: 'Crypto & Digital Assets',
    subtitle: 'Exchanges, Custodians, DeFi',
    heroTitle: 'Navigate the Evolving Crypto Landscape',
    description: 'Cutting-edge compliance for cryptoasset businesses meeting FCA registration requirements, financial promotions rules, and evolving regulatory expectations.',
    gradient: 'from-pink-500 to-rose-600',
    Component3D: ComplianceShield3D,
    challenges: [
      { title: 'FCA Registration', desc: 'MLR registration and ongoing requirements' },
      { title: 'Financial Promotions', desc: 'Crypto promotions regime compliance' },
      { title: 'AML/CTF Obligations', desc: 'Enhanced due diligence requirements' },
      { title: 'Custody Requirements', desc: 'Client asset protection' }
    ],
    solutions: [
      'FCA registration application support',
      'Crypto promotions compliance framework',
      'Enhanced AML/CTF policies and procedures',
      'Custody policy suite and safeguarding',
      'Travel rule implementation',
      'Risk assessment for crypto activities'
    ],
    features: [
      { title: 'Registration Hub', desc: 'MLR application builder' },
      { title: 'Promotions Module', desc: 'Compliance review workflow' },
      { title: 'AML Framework', desc: 'Crypto-specific controls' },
      { title: 'Custody Compliance', desc: 'Asset protection policies' }
    ],
    stats: [
      { value: '100+', label: 'Crypto Firms' },
      { value: '95%', label: 'Registration Success' },
      { value: '24/7', label: 'Regulatory Monitoring' }
    ]
  },
  consumer: {
    id: 'consumer',
    icon: Wallet,
    title: 'Consumer Finance',
    subtitle: 'Lenders, BNPL, Credit Brokers',
    heroTitle: 'Consumer Credit Compliance Excellence',
    description: 'Specialist compliance for consumer credit firms including lenders, brokers, and debt services navigating CONC and affordability requirements.',
    gradient: 'from-cyan-500 to-blue-600',
    Component3D: PaymentCard3D,
    challenges: [
      { title: 'CONC Compliance', desc: 'Consumer credit sourcebook requirements' },
      { title: 'Affordability Assessment', desc: 'Creditworthiness and affordability' },
      { title: 'Vulnerable Customers', desc: 'Identification and fair treatment' },
      { title: 'Collections Practices', desc: 'Fair debt collection' }
    ],
    solutions: [
      'Complete CONC policy framework',
      'Affordability assessment models and documentation',
      'Vulnerability identification framework',
      'Collections compliance and monitoring',
      'Pre-contract disclosure automation',
      'Arrears and forbearance workflows'
    ],
    features: [
      { title: 'CONC Framework', desc: 'Full sourcebook coverage' },
      { title: 'Affordability Engine', desc: 'Assessment and documentation' },
      { title: 'Vulnerability Hub', desc: 'Identification and support' },
      { title: 'Collections Module', desc: 'Fair practices compliance' }
    ],
    stats: [
      { value: '500+', label: 'Consumer Lenders' },
      { value: '£10B+', label: 'Loans Monitored' },
      { value: '70%', label: 'Complaint Reduction' }
    ]
  }
}

type SectorId = keyof typeof sectorData

export default function AudienceSectorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const sector = sectorData[id as SectorId]

  if (!sector) {
    notFound()
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      <Navigation variant="solid" />

      {/* Hero Section */}
      <HeroSection sector={sector} />

      {/* Challenges Section */}
      <ChallengesSection sector={sector} />

      {/* Solutions Section */}
      <SolutionsSection sector={sector} />

      {/* Features Section */}
      <FeaturesSection sector={sector} />

      {/* Stats Section */}
      <StatsSection sector={sector} />

      {/* CTA Section */}
      <CTASection sector={sector} />
    </div>
  )
}

function HeroSection({ sector }: { sector: typeof sectorData[SectorId] }) {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <Badge className={`bg-gradient-to-r ${sector.gradient} text-white border-0`}>
              <sector.icon className="w-4 h-4 mr-2" />
              {sector.subtitle}
            </Badge>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-white">{sector.heroTitle.split(' ').slice(0, -1).join(' ')} </span>
              <span className={`bg-gradient-to-r ${sector.gradient} bg-clip-text text-transparent`}>
                {sector.heroTitle.split(' ').slice(-1)}
              </span>
            </h1>

            <p className="text-xl text-slate-400 leading-relaxed">
              {sector.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/contact">
                <Button size="lg" className={`bg-gradient-to-r ${sector.gradient} text-lg px-8`}>
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

          {/* 3D Component */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-[500px]"
          >
            <sector.Component3D />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function ChallengesSection({ sector }: { sector: typeof sectorData[SectorId] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-20 px-4 bg-slate-900/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-slate-800 text-slate-300 border-slate-700">
            Your Challenges
          </Badge>
          <h2 className="text-4xl font-bold text-white mb-4">
            We Understand Your Regulatory Challenges
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            {sector.title} face unique compliance requirements that demand specialized solutions.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sector.challenges.map((challenge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 bg-slate-900/50 border-2 border-slate-800 hover:border-slate-700 transition-all h-full">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sector.gradient} opacity-20 flex items-center justify-center mb-4`}>
                  <sector.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{challenge.title}</h3>
                <p className="text-slate-400">{challenge.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SolutionsSection({ sector }: { sector: typeof sectorData[SectorId] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
          >
            <Badge className={`mb-4 bg-gradient-to-r ${sector.gradient} text-white border-0`}>
              <Sparkles className="w-4 h-4 mr-2" />
              Our Solutions
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-6">
              Purpose-Built for {sector.title}
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              Nasara Connect delivers specialized compliance tools designed specifically for your sector.
            </p>

            <ul className="space-y-4">
              {sector.solutions.map((solution, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${sector.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-slate-300">{solution}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${sector.gradient} opacity-10 blur-3xl rounded-full`} />

            <Card className="relative bg-slate-900/80 border-2 border-slate-700 p-8 overflow-hidden">
              <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${sector.gradient} opacity-5 rounded-full blur-3xl`} />

              <div className="relative z-10 space-y-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${sector.gradient} flex items-center justify-center`}>
                  <sector.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white">
                  Complete {sector.title} Compliance
                </h3>

                <p className="text-slate-400">
                  Everything you need to stay compliant, from authorization to ongoing monitoring.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  {sector.features.map((feature, i) => (
                    <div key={i} className="p-4 bg-slate-800/50 rounded-xl">
                      <h4 className="font-semibold text-white text-sm mb-1">{feature.title}</h4>
                      <p className="text-slate-500 text-xs">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection({ sector }: { sector: typeof sectorData[SectorId] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-20 px-4 bg-slate-900/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Key Features for {sector.title}
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Specialized modules designed for your regulatory requirements.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sector.features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`p-6 bg-gradient-to-br ${sector.gradient} border-0 h-full group hover:scale-105 transition-transform`}>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/80">{feature.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsSection({ sector }: { sector: typeof sectorData[SectorId] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
        >
          <Card className={`p-12 bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-slate-700`}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Trusted by {sector.title}
              </h2>
              <p className="text-slate-400">
                Real results from firms like yours
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {sector.stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="text-center"
                >
                  <div className={`text-4xl font-bold bg-gradient-to-r ${sector.gradient} bg-clip-text text-transparent mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-slate-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

function CTASection({ sector }: { sector: typeof sectorData[SectorId] }) {
  return (
    <section className="py-32 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Compliance?
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Join 100+ {sector.title.toLowerCase()} using Nasara Connect
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className={`bg-gradient-to-r ${sector.gradient} text-lg px-8`}>
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
  )
}
