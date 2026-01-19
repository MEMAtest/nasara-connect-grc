'use client'

import Link from 'next/link'
import Image from 'next/image'
import { LegalModal, useLegalModals } from '@/components/landing/LegalModals'

export function Footer() {
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
                <li><Link href="/features" className="text-slate-400 hover:text-emerald-400 transition-colors">Platform features</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-slate-400 hover:text-emerald-400 transition-colors">About</Link></li>
                <li><Link href="/case-studies" className="text-slate-400 hover:text-emerald-400 transition-colors">Case Studies</Link></li>
                <li><Link href="/security" className="text-slate-400 hover:text-emerald-400 transition-colors">Security</Link></li>
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
            <p className="text-slate-400 text-sm">&copy; {new Date().getFullYear()} Nasara Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      <LegalModal type="privacy" open={privacyOpen} onOpenChange={setPrivacyOpen} />
      <LegalModal type="terms" open={termsOpen} onOpenChange={setTermsOpen} />
    </>
  )
}
