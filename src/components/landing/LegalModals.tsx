'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Shield, FileText } from 'lucide-react'

interface LegalModalProps {
  type: 'terms' | 'privacy'
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LegalModal({ type, open, onOpenChange }: LegalModalProps) {
  const isTerms = type === 'terms'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-700 max-h-[85vh]">
        <DialogHeader className="pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              {isTerms ? (
                <FileText className="w-5 h-5 text-emerald-400" />
              ) : (
                <Shield className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                {isTerms ? 'Terms & Conditions' : 'Privacy Policy'}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-sm">
                Last updated: December 2025
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="prose prose-invert prose-sm max-w-none">
            {isTerms ? <TermsContent /> : <PrivacyContent />}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

function TermsContent() {
  return (
    <div className="space-y-6 text-slate-300">
      <section>
        <h3 className="text-lg font-semibold text-white mb-3">1. Agreement to Terms</h3>
        <p className="text-sm leading-relaxed">
          By accessing and using the Nasara Connect platform ("Service"), you agree to be bound by these
          Terms and Conditions. If you disagree with any part of these terms, you may not access the Service.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">2. Use License</h3>
        <p className="text-sm leading-relaxed mb-3">
          Subject to these Terms, Nasara Connect grants you a limited, non-exclusive, non-transferable
          license to access and use the Service for your internal business purposes.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>You may not modify, copy, or create derivative works of the Service</li>
          <li>You may not reverse engineer or attempt to extract the source code</li>
          <li>You may not remove any proprietary notices from the Service</li>
          <li>You may not use the Service for any unlawful purpose</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">3. User Accounts</h3>
        <p className="text-sm leading-relaxed">
          When you create an account, you must provide accurate and complete information. You are
          responsible for maintaining the confidentiality of your account credentials and for all
          activities that occur under your account. You agree to notify us immediately of any
          unauthorized use of your account.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">4. Compliance & Regulatory Information</h3>
        <p className="text-sm leading-relaxed">
          The Service provides tools and information to assist with regulatory compliance. However,
          Nasara Connect does not provide legal, financial, or regulatory advice. Users are responsible
          for ensuring their own compliance with applicable laws and regulations. The Service should be
          used as a tool to support, not replace, professional compliance advice.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">5. Data Processing</h3>
        <p className="text-sm leading-relaxed">
          We process data in accordance with our Privacy Policy and applicable data protection laws,
          including GDPR where applicable. By using the Service, you acknowledge and consent to our
          data processing practices as described in our Privacy Policy.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">6. Service Availability</h3>
        <p className="text-sm leading-relaxed">
          We strive to maintain high availability of the Service but do not guarantee uninterrupted
          access. We may perform maintenance, updates, or modifications that temporarily affect
          availability. We will endeavor to provide advance notice of planned maintenance.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">7. Limitation of Liability</h3>
        <p className="text-sm leading-relaxed">
          To the maximum extent permitted by law, Nasara Connect shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages, or any loss of profits or revenues,
          whether incurred directly or indirectly, or any loss of data, use, goodwill, or other
          intangible losses resulting from your use of the Service.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">8. Changes to Terms</h3>
        <p className="text-sm leading-relaxed">
          We reserve the right to modify these terms at any time. We will notify users of any material
          changes via email or through the Service. Your continued use of the Service after such
          modifications constitutes acceptance of the updated terms.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">9. Contact Information</h3>
        <p className="text-sm leading-relaxed">
          For any questions regarding these Terms, please contact us at{' '}
          <a href="mailto:legal@nasaraconnect.com" className="text-emerald-400 hover:text-emerald-300">
            legal@nasaraconnect.com
          </a>
        </p>
      </section>
    </div>
  )
}

function PrivacyContent() {
  return (
    <div className="space-y-6 text-slate-300">
      <section>
        <h3 className="text-lg font-semibold text-white mb-3">1. Introduction</h3>
        <p className="text-sm leading-relaxed">
          Nasara Connect ("we," "our," or "us") is committed to protecting your privacy. This Privacy
          Policy explains how we collect, use, disclose, and safeguard your information when you use
          our compliance platform and related services.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">2. Information We Collect</h3>
        <p className="text-sm leading-relaxed mb-3">We collect information in the following ways:</p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong className="text-white">Account Information:</strong> Name, email address, company name, job title</li>
          <li><strong className="text-white">Usage Data:</strong> How you interact with our platform, features used, time spent</li>
          <li><strong className="text-white">Compliance Data:</strong> Information you input for compliance assessments</li>
          <li><strong className="text-white">Technical Data:</strong> IP address, browser type, device information</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">3. How We Use Your Information</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>To provide and maintain our Service</li>
          <li>To notify you about changes to our Service</li>
          <li>To provide customer support</li>
          <li>To gather analysis to improve our Service</li>
          <li>To detect, prevent and address technical issues</li>
          <li>To comply with legal obligations</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">4. Data Security</h3>
        <p className="text-sm leading-relaxed">
          We implement industry-standard security measures to protect your data, including encryption
          in transit and at rest, regular security audits, access controls, and secure data centers.
          However, no method of transmission over the Internet is 100% secure, and we cannot guarantee
          absolute security.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">5. Data Retention</h3>
        <p className="text-sm leading-relaxed">
          We retain your personal data only for as long as necessary to fulfill the purposes for which
          it was collected, including to satisfy any legal, accounting, or reporting requirements.
          Upon request, we will delete or anonymize your data unless we are legally required to retain it.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">6. Your Rights (GDPR)</h3>
        <p className="text-sm leading-relaxed mb-3">If you are in the EEA, you have the right to:</p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Object to processing of your data</li>
          <li>Request data portability</li>
          <li>Withdraw consent at any time</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">7. Third-Party Services</h3>
        <p className="text-sm leading-relaxed">
          We may use third-party services for authentication (Google OAuth), analytics, and hosting.
          These services have their own privacy policies governing the use of your information. We
          only share the minimum data necessary for these services to function.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">8. Cookies</h3>
        <p className="text-sm leading-relaxed">
          We use essential cookies to maintain your session and preferences. We do not use tracking
          cookies for advertising purposes. You can configure your browser to refuse cookies, but
          this may affect your ability to use certain features of our Service.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">9. Changes to This Policy</h3>
        <p className="text-sm leading-relaxed">
          We may update this Privacy Policy from time to time. We will notify you of any changes by
          posting the new Privacy Policy on this page and updating the "Last updated" date.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">10. Contact Us</h3>
        <p className="text-sm leading-relaxed">
          If you have questions about this Privacy Policy, please contact our Data Protection Officer at{' '}
          <a href="mailto:privacy@nasaraconnect.com" className="text-emerald-400 hover:text-emerald-300">
            privacy@nasaraconnect.com
          </a>
        </p>
      </section>
    </div>
  )
}

// Hook to manage legal modals state
export function useLegalModals() {
  const [termsOpen, setTermsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)

  return {
    termsOpen,
    setTermsOpen,
    privacyOpen,
    setPrivacyOpen,
  }
}
