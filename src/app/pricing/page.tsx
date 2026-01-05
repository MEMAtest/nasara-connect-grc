'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { ArrowRight, Check, X, Zap, Building2, Rocket, Sparkles, HelpCircle, Shield, Users, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Navigation } from '@/components/landing/Navigation'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

// 3D Component
import dynamic from 'next/dynamic'

const PricingValue3D = dynamic(() => import('@/components/landing/3d/PricingValue3D'), { ssr: false })

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual')

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Pricing', path: '/pricing' }
        ]}
      />
      <Navigation variant="solid" />

      {/* Hero Section */}
      <HeroSection billingCycle={billingCycle} setBillingCycle={setBillingCycle} />

      {/* Pricing Tiers */}
      <PricingTiersSection billingCycle={billingCycle} />

      {/* 3D Value Visualization */}
      <ValueSection />

      {/* Feature Comparison */}
      <ComparisonSection />

      {/* ROI Calculator */}
      <ROISection />

      {/* FAQ */}
      <FAQSection />

      {/* Final CTA */}
      <FinalCTA />
    </div>
  )
}

function HeroSection({ billingCycle, setBillingCycle }: { billingCycle: 'monthly' | 'annual', setBillingCycle: (cycle: 'monthly' | 'annual') => void }) {
  return (
    <section className="relative min-h-[70vh] flex items-center pt-32 pb-20 px-4 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950" />

      {/* Ambient Glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            Simple, Transparent Pricing
          </Badge>

          <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Compliance That </span>
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
              Pays for Itself
            </span>
          </h1>

          <p className="text-xl lg:text-2xl text-slate-400 leading-relaxed max-w-4xl mx-auto">
            Choose the plan that fits your firm&apos;s needs. All plans include our core compliance platform
            with scalable pricing as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 pt-8">
            <span className={`text-lg font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-16 h-8 rounded-full bg-slate-800 border-2 border-slate-700 transition-colors hover:border-slate-600"
            >
              <motion.div
                className="absolute top-0.5 w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
                animate={{ left: billingCycle === 'monthly' ? '4px' : '34px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-lg font-medium ${billingCycle === 'annual' ? 'text-white' : 'text-slate-500'}`}>
              Annual
              <Badge className="ml-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                Save 20%
              </Badge>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function PricingTiersSection({ billingCycle }: { billingCycle: 'monthly' | 'annual' }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const tiers = [
    {
      name: 'Starter',
      description: 'For small firms with 1-5 employees',
      firmSize: '1-5 employees',
      icon: Zap,
      gradient: 'from-blue-500 to-cyan-600',
      price: {
        monthly: 299,
        annual: 249
      },
      features: [
        { included: true, text: 'Full compliance dashboard' },
        { included: true, text: 'Up to 5 users' },
        { included: true, text: 'Authorization Pack builder' },
        { included: true, text: 'Risk assessment tools' },
        { included: true, text: 'Policy management (20 policies)' },
        { included: true, text: 'Training library access' },
        { included: true, text: 'Email support' },
        { included: false, text: 'SM&CR management' },
        { included: false, text: 'CMP monitoring' },
        { included: false, text: 'AI Assistant' },
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Growth',
      description: 'For growing firms with 5-15 employees',
      firmSize: '5-15 employees',
      icon: Building2,
      gradient: 'from-emerald-500 to-teal-600',
      price: {
        monthly: 599,
        annual: 499
      },
      features: [
        { included: true, text: 'Everything in Starter, plus:' },
        { included: true, text: 'Up to 15 users' },
        { included: true, text: 'SM&CR management' },
        { included: true, text: 'Compliance framework builder' },
        { included: true, text: 'Unlimited policies' },
        { included: true, text: 'CMP monitoring' },
        { included: true, text: 'Priority support' },
        { included: true, text: 'Monthly compliance reports' },
        { included: false, text: 'AI Assistant' },
        { included: false, text: 'API access' },
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Scale',
      description: 'For established firms with 15-25 employees',
      firmSize: '15-25 employees',
      icon: Rocket,
      gradient: 'from-violet-500 to-purple-600',
      price: {
        monthly: 999,
        annual: 849
      },
      features: [
        { included: true, text: 'Everything in Growth, plus:' },
        { included: true, text: 'Up to 25 users' },
        { included: true, text: 'AI Compliance Assistant' },
        { included: true, text: 'Advanced analytics & insights' },
        { included: true, text: 'Custom workflows' },
        { included: true, text: 'API access' },
        { included: true, text: '24/7 priority support' },
        { included: true, text: 'Quarterly strategy reviews' },
        { included: false, text: 'Dedicated account manager' },
        { included: false, text: 'Custom integrations' },
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Enterprise',
      description: 'For large organizations with 25+ employees',
      firmSize: '25+ employees',
      icon: Shield,
      gradient: 'from-amber-500 to-orange-600',
      price: {
        monthly: null,
        annual: null
      },
      features: [
        { included: true, text: 'Everything in Scale, plus:' },
        { included: true, text: 'Unlimited users' },
        { included: true, text: 'Dedicated account manager' },
        { included: true, text: 'Custom integrations' },
        { included: true, text: 'White-label options' },
        { included: true, text: 'On-premise deployment' },
        { included: true, text: 'SLA guarantees (99.9%)' },
        { included: true, text: 'Bespoke training' },
        { included: true, text: 'Board-level reporting' },
        { included: true, text: 'Multi-entity support' },
      ],
      cta: 'Contact Sales',
      popular: false
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
            Choose Your Plan
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            All plans include core compliance features. Scale up as your needs grow.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15 }}
              className="relative"
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 px-4 py-1">
                    <Sparkles className="w-3 h-3 mr-1 inline" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <Card className={`
                p-8 h-full flex flex-col
                ${tier.popular
                  ? 'bg-slate-900/80 border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900/50 border-2 border-slate-800'
                }
                hover:border-slate-700 transition-all relative overflow-hidden
              `}>
                {/* Gradient accent */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${tier.gradient} opacity-5 rounded-full blur-3xl`} />

                <div className="relative z-10">
                  {/* Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.gradient} opacity-20 flex items-center justify-center`}>
                      <tier.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
                  </div>

                  <Badge className={`mb-3 bg-gradient-to-r ${tier.gradient} text-white border-0 text-xs`}>
                    <Users className="w-3 h-3 mr-1 inline" />
                    {tier.firmSize}
                  </Badge>
                  <p className="text-slate-400 mb-6 text-sm">{tier.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    {tier.price.monthly === null ? (
                      <div>
                        <div className="text-4xl font-bold text-white mb-2">Custom</div>
                        <div className="text-slate-400">Tailored to your needs</div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-white">
                            £{billingCycle === 'monthly' ? tier.price.monthly.toLocaleString() : tier.price.annual.toLocaleString()}
                          </span>
                          <span className="text-slate-400">/month</span>
                        </div>
                        {billingCycle === 'annual' && (
                          <div className="text-sm text-emerald-400 mt-1">
                            Save £{((tier.price.monthly - tier.price.annual) * 12).toLocaleString()}/year
                          </div>
                        )}
                        <div className="text-sm text-slate-500 mt-1">
                          Billed {billingCycle === 'monthly' ? 'monthly' : 'annually'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <Button className={`
                    w-full mb-8 text-lg py-6
                    ${tier.popular
                      ? `bg-gradient-to-r ${tier.gradient} hover:opacity-90 shadow-lg`
                      : 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                    }
                  `}>
                    {tier.cta}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>

                  {/* Features */}
                  <div className="space-y-3">
                    {tier.features.map((feature, j) => (
                      <div key={j} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? 'text-slate-300' : 'text-slate-600'}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
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

function ValueSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-32 px-4 bg-slate-900/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: 3D Visual */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="h-[500px]"
          >
            <PricingValue3D />
          </motion.div>

          {/* Right: Value Props */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            <div>
              <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                Exceptional Value
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                More Than Just Software
              </h2>
              <p className="text-xl text-slate-400">
                Nasara Connect delivers measurable ROI through automation, risk reduction, and expert-built compliance intelligence.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: Shield,
                  title: 'Reduce Compliance Costs by 60%',
                  desc: 'Automate manual processes and reduce headcount needs with intelligent workflows'
                },
                {
                  icon: BarChart3,
                  title: 'Avoid Regulatory Fines',
                  desc: 'Proactive monitoring and alerts prevent breaches that cost millions in penalties'
                },
                {
                  icon: Users,
                  title: 'Free Up Your Team',
                  desc: 'Reclaim hundreds of hours per month for strategic work instead of admin tasks'
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function ComparisonSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const features = [
    { category: 'Core Features', items: [
      { name: 'Regulatory Intelligence Engine', starter: true, pro: true, enterprise: true },
      { name: 'Policy Management', starter: 'Up to 20', pro: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'User Accounts', starter: '3', pro: '10', enterprise: 'Unlimited' },
      { name: 'Transaction Reconciliation', starter: '1,000/mo', pro: '10,000/mo', enterprise: 'Unlimited' },
    ]},
    { category: 'Advanced Features', items: [
      { name: 'AI Anomaly Detection', starter: false, pro: true, enterprise: true },
      { name: 'Custom Workflows', starter: false, pro: true, enterprise: true },
      { name: 'API Access', starter: false, pro: true, enterprise: true },
      { name: 'White-label Options', starter: false, pro: false, enterprise: true },
    ]},
    { category: 'Support & Services', items: [
      { name: 'Email Support', starter: true, pro: true, enterprise: true },
      { name: 'Priority Support (24/7)', starter: false, pro: true, enterprise: true },
      { name: 'Dedicated Account Manager', starter: false, pro: false, enterprise: true },
      { name: 'Custom Integrations', starter: false, pro: false, enterprise: true },
    ]},
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
            Feature Comparison
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            See exactly what&apos;s included in each plan
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 bg-slate-900/50 border-2 border-slate-800 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-4 px-4 text-white font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 text-white font-semibold">Starter</th>
                  <th className="text-center py-4 px-4 text-white font-semibold">Professional</th>
                  <th className="text-center py-4 px-4 text-white font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {features.map((section, i) => (
                  <React.Fragment key={i}>
                    <tr>
                      <td colSpan={4} className="pt-6 pb-2 px-4">
                        <h3 className="text-lg font-bold text-emerald-400">{section.category}</h3>
                      </td>
                    </tr>
                    {section.items.map((item, j) => (
                      <tr key={j} className="border-b border-slate-800/50">
                        <td className="py-3 px-4 text-slate-300">{item.name}</td>
                        <td className="py-3 px-4 text-center">
                          {typeof item.starter === 'boolean' ? (
                            item.starter ? <Check className="w-5 h-5 text-emerald-400 mx-auto" /> : <X className="w-5 h-5 text-slate-600 mx-auto" />
                          ) : (
                            <span className="text-slate-400">{item.starter}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {typeof item.pro === 'boolean' ? (
                            item.pro ? <Check className="w-5 h-5 text-emerald-400 mx-auto" /> : <X className="w-5 h-5 text-slate-600 mx-auto" />
                          ) : (
                            <span className="text-slate-400">{item.pro}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {typeof item.enterprise === 'boolean' ? (
                            item.enterprise ? <Check className="w-5 h-5 text-emerald-400 mx-auto" /> : <X className="w-5 h-5 text-slate-600 mx-auto" />
                          ) : (
                            <span className="text-slate-400">{item.enterprise}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

function ROISection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-32 px-4 bg-slate-900/30">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
        >
          <Card className="p-12 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-2 border-emerald-500/30">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Typical ROI: 300% in Year One
              </h2>
              <p className="text-xl text-slate-400">
                Based on average customer savings across automation, risk reduction, and efficiency gains
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { value: '£150k', label: 'Average Annual Savings', desc: 'Reduced headcount & automation' },
                { value: '200hrs', label: 'Time Saved Per Month', desc: 'Freed from manual processes' },
                { value: '6 months', label: 'Payback Period', desc: 'Average time to ROI break-even' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl font-bold text-emerald-400 mb-2">{stat.value}</div>
                  <div className="text-lg font-semibold text-white mb-2">{stat.label}</div>
                  <div className="text-sm text-slate-400">{stat.desc}</div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

function FAQSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: 'Do you offer a free trial?',
      answer: 'Yes! We offer a 14-day free trial for Starter and Professional plans. No credit card required. You\'ll have full access to all features in your chosen plan during the trial period.'
    },
    {
      question: 'Can I change plans later?',
      answer: 'Absolutely. You can upgrade or downgrade at any time. When upgrading, you\'ll get immediate access to new features. When downgrading, changes take effect at the start of your next billing cycle, and you\'ll retain access to higher-tier features until then.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, Amex), direct debit, and bank transfer. Enterprise customers can also pay via invoice with NET 30 terms.'
    },
    {
      question: 'Is implementation included?',
      answer: 'Professional and Enterprise plans include onboarding and implementation support. Starter plans have self-service onboarding with email support. Enterprise plans get dedicated implementation managers and custom training sessions.'
    },
    {
      question: 'What about data security and compliance?',
      answer: 'Nasara Connect is working towards Cyber Essentials certification (in progress). All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We maintain detailed audit logs for all user actions and follow security best practices.'
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel anytime with no penalties. For monthly plans, cancellation is effective immediately. For annual plans, you\'ll retain access until the end of your paid period. We offer pro-rated refunds for annual plans within the first 30 days.'
    },
    {
      question: 'Do you offer discounts for non-profits or startups?',
      answer: 'Yes! We offer 30% discounts for registered non-profits and 20% off for early-stage startups (pre-seed to Series A). Contact our sales team to verify eligibility and apply the discount.'
    },
    {
      question: 'What kind of support is included?',
      answer: 'Starter plans get email support (24hr response time). Professional plans get priority email & chat support with 4hr response time. Enterprise plans get 24/7 phone, email, and chat support with a dedicated account manager and 1hr response SLA.'
    },
  ]

  return (
    <section ref={ref} className="py-32 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/30">
            <HelpCircle className="w-4 h-4 mr-2 inline" />
            Frequently Asked Questions
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Got Questions? We&apos;ve Got Answers
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="bg-slate-900/50 border-2 border-slate-800 hover:border-slate-700 transition-all cursor-pointer overflow-hidden"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white pr-4">{faq.question}</h3>
                    <motion.div
                      animate={{ rotate: openIndex === i ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <HelpCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    </motion.div>
                  </div>

                  <motion.div
                    initial={false}
                    animate={{
                      height: openIndex === i ? 'auto' : 0,
                      opacity: openIndex === i ? 1 : 0
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-slate-400 mt-4 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                </div>
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
            Ready to Get Started?
          </h2>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Start your 14-day free trial today. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/50 text-lg px-10">
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Link href="/request-demo">
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 text-lg px-10">
                Talk to Sales
              </Button>
            </Link>
          </div>

          <p className="text-sm text-slate-500 mt-6">
            Questions? Call us at +44 20 1234 5678 or email sales@memaconnect.com
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// Add this at the top after imports
import React from 'react'
