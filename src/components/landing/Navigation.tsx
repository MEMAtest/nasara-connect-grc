'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react'
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
    label: 'Features',
    href: '/features',
    dropdown: [
      { label: 'Authorization Pack', href: '/features#authorization', Icon: AuthorizationIcon },
      { label: 'Risk Assessment', href: '/features#risk', Icon: RiskIcon },
      { label: 'SM&CR Management', href: '/features#smcr', Icon: SmcrIcon },
      { label: 'Policy Management', href: '/features#policies', Icon: PolicyIcon },
      { label: 'Compliance Monitoring', href: '/features#cmp', Icon: ComplianceIcon },
      { label: 'Training Library', href: '/features#training', Icon: TrainingIcon },
      { label: 'AI Assistant', href: '/features#ai', Icon: AiIcon },
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
      { label: 'Documentation', href: '/resources#docs', Icon: DocsIcon },
      { label: 'Guides & Tutorials', href: '/resources#guides', Icon: GuidesIcon },
      { label: 'Blog & Insights', href: '/resources#blog', Icon: BlogIcon },
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
                  onMouseEnter={() => item.dropdown && setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
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
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-72 bg-slate-900/98 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
                    >
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
                    </motion.div>
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
                <Link href="/contact">
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
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
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
