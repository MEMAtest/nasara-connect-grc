'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { ArrowRight, Building2, Smartphone, TrendingUp, Shield, CreditCard, CheckCircle2, AlertCircle, FileCheck, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

// 3D Components
import dynamic from 'next/dynamic'

const BankingSector3D = dynamic(() => import('@/components/landing/3d/BankingSector3D'), { ssr: false })
const FinTechSector3D = dynamic(() => import('@/components/landing/3d/FinTechSector3D'), { ssr: false })
const AssetManagementSector3D = dynamic(() => import('@/components/landing/3d/AssetManagementSector3D'), { ssr: false })
const InsuranceSector3D = dynamic(() => import('@/components/landing/3d/InsuranceSector3D'), { ssr: false })
const PaymentServicesSector3D = dynamic(() => import('@/components/landing/3d/PaymentServicesSector3D'), { ssr: false })

export default function SolutionsPage() {
  const [activeTab, setActiveTab] = useState('banking')

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Overview Section */}
      <HeroSection />

      {/* Industry Sectors Tabs */}
      <SectorsSection activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Final CTA */}
      <FinalCTA />
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-[70vh] flex items-center pt-32 pb-20 px-4 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950" />

      {/* Ambient Glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/30">
            Industry Solutions
          </Badge>

          <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Built for Your </span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Industry&apos;s Unique Challenges
            </span>
          </h1>

          <p className="text-xl lg:text-2xl text-slate-400 leading-relaxed max-w-4xl mx-auto">
            From traditional banking to cutting-edge FinTech, MEMA Connect delivers sector-specific
            compliance solutions that understand your regulatory landscape, operational complexity, and strategic goals.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
            {[
              { icon: Building2, text: 'Banking' },
              { icon: Smartphone, text: 'FinTech' },
              { icon: TrendingUp, text: 'Asset Management' },
              { icon: Shield, text: 'Insurance' },
              { icon: CreditCard, text: 'Payments' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/30 border border-slate-700/50"
              >
                <item.icon className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300 text-sm">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function SectorsSection({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const sectors = [
    {
      id: 'banking',
      name: 'Banking & Financial Services',
      icon: Building2,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-600',
      visual: <BankingSector3D />,
      headline: 'Fortify Traditional Banking with Modern Compliance Intelligence',
      description: 'Navigate complex regulatory frameworks with confidence. From prudential regulation to customer protection, MEMA Connect provides end-to-end compliance orchestration for retail, commercial, and private banking operations.',
      challenges: [
        'Ever-evolving prudential requirements (CRR, CRD, Basel III/IV)',
        'Complex customer onboarding and KYC obligations',
        'Operational resilience and outsourcing frameworks',
        'Financial crime prevention and transaction monitoring'
      ],
      useCases: [
        {
          title: 'Regulatory Change Management',
          desc: 'Track 200+ regulatory sources, predict impact on capital requirements, and automate compliance response workflows.'
        },
        {
          title: 'Customer Due Diligence',
          desc: 'Orchestrate KYC, AML screening, and ongoing monitoring with automated risk scoring and audit trails.'
        },
        {
          title: 'Prudential Reporting',
          desc: 'Automate regulatory returns preparation with real-time data reconciliation and submission tracking.'
        }
      ],
      regulations: ['PRA Rulebook', 'FCA Handbook', 'SMCR', 'Consumer Duty', 'Operational Resilience', 'GDPR']
    },
    {
      id: 'fintech',
      name: 'FinTech & Digital Banking',
      icon: Smartphone,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600',
      visual: <FinTechSector3D />,
      headline: 'Scale Your FinTech with Confidence, Not Compliance Overhead',
      description: 'Built for the pace of innovation. MEMA Connect enables rapid scaling while maintaining robust compliance infrastructure that keeps regulators happy and investors confident.',
      challenges: [
        'Rapid regulatory change with limited compliance resources',
        'Authorization pack preparation and variation management',
        'Managing regulatory obligations during hypergrowth',
        'Building trust with regulators and partners'
      ],
      useCases: [
        {
          title: 'FCA Authorization Pack',
          desc: 'Accelerate authorization with automated document generation, evidence collection, and submission-ready packs.'
        },
        {
          title: 'Agile Compliance Framework',
          desc: 'Deploy scalable policy management, control frameworks, and audit trails that grow with your business.'
        },
        {
          title: 'Third-Party Risk Management',
          desc: 'Monitor and manage outsourcing arrangements, cloud providers, and technology partners with automated due diligence.'
        }
      ],
      regulations: ['EMR', 'PSR', 'Consumer Duty', 'SMCR', 'Data Protection', 'PSD2/3']
    },
    {
      id: 'asset-management',
      name: 'Asset Management & Wealth',
      icon: TrendingUp,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-600',
      visual: <AssetManagementSector3D />,
      headline: 'Precision Governance for Portfolio Excellence',
      description: 'From fund governance to investor protection, MEMA Connect delivers sophisticated compliance infrastructure for asset managers, wealth advisers, and investment platforms navigating FCA COLL, FUND, and MiFID II.',
      challenges: [
        'Complex fund governance and depositary oversight',
        'MiFID II/III transaction reporting and best execution',
        'ESG disclosure and sustainability requirements',
        'Cross-border regulatory coordination'
      ],
      useCases: [
        {
          title: 'Fund Governance Automation',
          desc: 'Centralize board packs, NAV oversight, liquidity monitoring, and depositary reporting with intelligent workflows.'
        },
        {
          title: 'Investment Compliance',
          desc: 'Real-time monitoring of mandate breaches, restricted lists, concentration limits, and regulatory thresholds.'
        },
        {
          title: 'Investor Reporting & Disclosure',
          desc: 'Automate PRIIPs KIDs, MiFID disclosures, and ESG reporting with audit-ready documentation.'
        }
      ],
      regulations: ['COLL', 'FUND', 'MiFID II', 'AIFMD', 'UCITS', 'SFDR']
    },
    {
      id: 'insurance',
      name: 'Insurance',
      icon: Shield,
      color: 'orange',
      gradient: 'from-orange-500 to-rose-600',
      visual: <InsuranceSector3D />,
      headline: 'Solvency II Mastery Meets Operational Excellence',
      description: 'Navigate the intersection of prudential regulation, conduct oversight, and operational resilience. MEMA Connect provides integrated compliance infrastructure for insurers, MGAs, and insurance intermediaries.',
      challenges: [
        'Solvency II/UK Solvency pillars I, II, III compliance',
        'Insurance Distribution Directive (IDD) obligations',
        'Claims handling and fair value assessment',
        'Third-party administration and outsourcing'
      ],
      useCases: [
        {
          title: 'Solvency & Capital Management',
          desc: 'Automate ORSA processes, capital model validation, and regulatory reporting with integrated risk frameworks.'
        },
        {
          title: 'Distribution Oversight',
          desc: 'Monitor adviser networks, appointed representatives, and distribution channels with automated compliance checks.'
        },
        {
          title: 'Customer Outcomes Monitoring',
          desc: 'Track product value, claims ratios, and customer outcomes to demonstrate Consumer Duty compliance.'
        }
      ],
      regulations: ['Solvency II', 'IDD', 'Consumer Duty', 'SMCR', 'GDPR', 'Operational Resilience']
    },
    {
      id: 'payments',
      name: 'Payment Services & PSPs',
      icon: CreditCard,
      color: 'cyan',
      gradient: 'from-cyan-500 to-blue-600',
      visual: <PaymentServicesSector3D />,
      headline: 'Process Billions. Comply Effortlessly.',
      description: 'Built for the velocity of payment processing. MEMA Connect enables PSPs, e-money issuers, and payment institutions to maintain compliance at transaction scale while meeting evolving regulatory demands.',
      challenges: [
        'Real-time transaction monitoring and fraud detection',
        'Safeguarding and reconciliation requirements',
        'PSD2/3 strong customer authentication and open banking',
        'Cross-border payment regulation and sanctions screening'
      ],
      useCases: [
        {
          title: 'Safeguarding Automation',
          desc: 'Daily reconciliation of client funds, automated bank submissions, and real-time safeguarding status monitoring.'
        },
        {
          title: 'Transaction Monitoring',
          desc: 'AI-powered anomaly detection, fraud pattern recognition, and automated suspicious activity reporting.'
        },
        {
          title: 'PSD2/3 Compliance',
          desc: 'SCA compliance monitoring, API security oversight, and incident reporting automation.'
        }
      ],
      regulations: ['PSR', 'EMR', 'PSD2/3', 'AML Regulations', 'Payment Services Act', 'E-Money Regulations']
    }
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
            Industry-Specific Solutions
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Select your sector to explore tailored compliance capabilities
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs Navigation */}
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2 bg-slate-900/50 p-2 mb-16">
            {sectors.map((sector) => (
              <TabsTrigger
                key={sector.id}
                value={sector.id}
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-800 data-[state=active]:to-slate-700 data-[state=active]:text-white"
              >
                <sector.icon className="w-4 h-4" />
                <span className="hidden lg:inline">{sector.name}</span>
                <span className="lg:hidden">{sector.name.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          {sectors.map((sector) => (
            <TabsContent key={sector.id} value={sector.id} className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Sector Hero */}
                <Card className="p-8 lg:p-12 mb-12 bg-slate-900/50 border-2 border-slate-800 overflow-hidden relative">
                  <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${sector.gradient} opacity-5 rounded-full blur-3xl`} />

                  <div className="relative grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Text */}
                    <div className="space-y-6">
                      <div>
                        <Badge className={`mb-4 bg-${sector.color}-500/10 text-${sector.color}-400 border-${sector.color}-500/30`}>
                          {sector.name}
                        </Badge>
                        <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">{sector.headline}</h3>
                        <p className="text-lg text-slate-400 leading-relaxed">{sector.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {sector.regulations.map((reg, i) => (
                          <span key={i} className="px-3 py-1 text-xs font-medium rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300">
                            {reg}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: 3D Visual */}
                    <div className="relative h-[400px]">
                      {sector.visual}
                    </div>
                  </div>
                </Card>

                {/* Key Challenges */}
                <div className="mb-12">
                  <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-orange-400" />
                    Key Challenges We Solve
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {sector.challenges.map((challenge, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 flex items-start gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-orange-400 text-xs font-bold">{i + 1}</span>
                        </div>
                        <span className="text-slate-300">{challenge}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <FileCheck className="w-6 h-6 text-emerald-400" />
                    Proven Use Cases
                  </h4>
                  <div className="grid md:grid-cols-3 gap-6">
                    {sector.useCases.map((useCase, i) => (
                      <Card
                        key={i}
                        className="p-6 bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all"
                      >
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${sector.gradient} opacity-20 flex items-center justify-center mb-4`}>
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h5 className="text-white font-semibold text-lg mb-3">{useCase.title}</h5>
                        <p className="text-slate-400 text-sm leading-relaxed">{useCase.desc}</p>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Sector CTA */}
                <div className="mt-12 text-center">
                  <Button size="lg" className={`bg-gradient-to-r ${sector.gradient} hover:opacity-90 shadow-lg text-lg px-10`}>
                    Explore {sector.name} Solutions
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
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
          <Users className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Compliance Operations?
          </h2>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Book a consultation with our industry specialists to see how MEMA Connect solves your sector&apos;s unique challenges.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/50 text-lg px-10">
              Book Industry Consultation
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Link href="/products">
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 text-lg px-10">
                View All Products
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
