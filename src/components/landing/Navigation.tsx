'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  Activity,
  BarChart3,
  CreditCard,
  FileCheck2,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AuthorizationIcon,
  RiskIcon,
  SmcrIcon,
  PolicyIcon,
  ComplianceIcon,
  TrainingIcon,
  AiIcon,
  FintechIcon,
  BanksIcon,
  InvestmentIcon,
  InsuranceIcon,
  CryptoIcon,
  ConsumerIcon,
  DocsIcon,
  GuidesIcon,
  BlogIcon,
} from '@/components/icons/FeatureIcons'

interface NavigationProps {
  variant?: 'transparent' | 'solid'
}

const navItems = [
  {
    label: 'Governance, Risk & Compliance',
    href: '/grc-platform',
  },
  {
    label: 'Features',
    href: '/features',
    dropdown: [
      { label: 'Authorization Pack', href: '/features/authorization-pack', Icon: AuthorizationIcon },
      { label: 'SM&CR Management', href: '/features/smcr-management', Icon: SmcrIcon },
      { label: 'Compliance Monitoring', href: '/features/compliance-monitoring', Icon: ComplianceIcon },
      { label: 'Policy Management', href: '/features/policy-management', Icon: PolicyIcon },
      { label: 'Risk Assessment', href: '/features/risk-assessment', Icon: RiskIcon },
      { label: 'Training Library', href: '/features/training-library', Icon: TrainingIcon },
      { label: 'AI Assistant', href: '/features/ai-assistant', Icon: AiIcon },
      { label: 'Safeguarding', href: '/features/safeguarding', Icon: ShieldCheck },
      { label: 'Financial Promotions', href: '/features/financial-promotions', Icon: ShieldAlert },
    ]
  },
  {
    label: 'Solutions',
    href: '/solutions',
    dropdown: [
      { label: 'FCA Authorisation', href: '/solutions/fca-authorisation', Icon: FileCheck2 },
      { label: 'SM&CR', href: '/solutions/smcr', Icon: Shield },
      { label: 'Compliance Monitoring Plan', href: '/solutions/compliance-monitoring-plan', Icon: BarChart3 },
      { label: 'Consumer Duty', href: '/solutions/consumer-duty', Icon: Scale },
      { label: 'Safeguarding', href: '/solutions/safeguarding', Icon: ShieldCheck },
      { label: 'CASS Compliance', href: '/solutions/cass-compliance', Icon: CreditCard },
      { label: 'Operational Resilience', href: '/solutions/operational-resilience', Icon: Activity },
      { label: 'Financial Promotions', href: '/solutions/financial-promotions-compliance', Icon: ShieldAlert },
    ]
  },
  {
    label: 'Audience',
    href: '/audience',
    dropdown: [
      { label: 'Fintech & Payments', href: '/audience/fintech', Icon: FintechIcon },
      { label: 'Banks & Credit', href: '/audience/banks', Icon: BanksIcon },
      { label: 'Investment Firms', href: '/audience/investment', Icon: InvestmentIcon },
      { label: 'Insurance', href: '/audience/insurance', Icon: InsuranceIcon },
      { label: 'Crypto & Digital Assets', href: '/audience/crypto', Icon: CryptoIcon },
      { label: 'Consumer Finance', href: '/audience/consumer', Icon: ConsumerIcon },
    ]
  },
  {
    label: 'Resources',
    href: '/resources',
    dropdown: [
      { label: 'Guides', href: '/resources/guides', Icon: GuidesIcon },
      { label: 'Templates', href: '/resources/templates', Icon: DocsIcon },
      { label: 'Blog & Insights', href: '/blog', Icon: BlogIcon },
      { label: 'Tools', href: '/tools/smcr-responsibilities-map', Icon: DocsIcon },
    ]
  },
  {
    label: 'Pricing',
    href: '/pricing',
  },
]

export function Navigation({ variant = 'transparent' }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleMouseEnter = (label: string, hasDropdown: boolean) => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout)
      setDropdownTimeout(null)
    }
    if (hasDropdown) {
      setOpenDropdown(label)
    }
  }

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setOpenDropdown(null)
    }, 150) // Small delay to allow moving to dropdown
    setDropdownTimeout(timeout)
  }

  const isTransparent = variant === 'transparent' && !scrolled

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isTransparent
            ? 'bg-transparent'
            : 'bg-slate-950/95 backdrop-blur-xl border-b border-slate-800'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/nasara-logo.png"
                alt="Nasara Connect Logo"
                width={320}
                height={80}
                className="h-14 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.label, !!item.dropdown)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-1.5 px-4 py-2 text-slate-300 hover:text-emerald-400 transition-colors text-sm font-medium"
                  >
                    {item.label}
                    {item.dropdown && (
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {item.dropdown && openDropdown === item.label && (
                    <>
                      {/* Invisible bridge to prevent gap */}
                      <div className="absolute top-full left-0 h-4 w-full" />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 pt-2 w-72"
                      >
                        <div className="bg-slate-900/98 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
                          <div className="p-2">
                            {item.dropdown.map((subItem) => (
                              <Link
                                key={subItem.label}
                                href={subItem.href}
                                className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-teal-500/10 rounded-xl transition-all group"
                              >
                                <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                                  <subItem.Icon size={22} />
                                </div>
                                <span className="text-sm font-medium">{subItem.label}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </div>
              ))}

              {/* CTA Buttons */}
              <div className="flex items-center gap-3 ml-6">
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    className="border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400 hover:text-emerald-300 transition-all"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/request-demo">
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25">
                    Request Demo
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-40 lg:hidden"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-slate-900 border-l border-slate-800 p-6 pt-24 overflow-y-auto"
          >
            {navItems.map((item) => (
              <div key={item.label} className="mb-6">
                <Link
                  href={item.href}
                  className="text-lg font-semibold text-white mb-3 block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
                {item.dropdown && (
                  <div className="space-y-2 pl-4">
                    {item.dropdown.map((subItem) => (
                      <Link
                        key={subItem.label}
                        href={subItem.href}
                        className="flex items-center gap-3 py-2 text-slate-400 hover:text-emerald-400"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <subItem.Icon size={18} />
                        <span className="text-sm">{subItem.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="pt-6 border-t border-slate-800 space-y-3">
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full border-emerald-500/50 text-emerald-400">
                  Sign In
                </Button>
              </Link>
              <Link href="/request-demo" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600">
                  Request Demo
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

export default Navigation
