'use client'

import { useState, Suspense, lazy, Component, type ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { TemplatePackView } from '@/components/templates'
import { UseCaseModal, type UseCaseData } from '@/components/guides/UseCaseModal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { TemplateItem } from '@/components/templates'
import {
  Rocket,
  Scale,
  Shield,
  Briefcase,
  Target,
  Users,
  FileCheck,
  ClipboardList,
  BarChart3,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'

// Lazy load the 3D component for performance
const Guide3DDecor = lazy(() => import('@/components/guides/Guide3DDecor'))

// Error boundary for 3D component to prevent crashes from WebGL issues
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class Decor3DErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }
    return this.props.children
  }
}

// Icon mapping for use case cards
const ICON_MAP: Record<string, LucideIcon> = {
  Rocket,
  Scale,
  Shield,
  Briefcase,
  Target,
  Users,
  FileCheck,
  ClipboardList,
  BarChart3,
}

export type ImplementationPhase = {
  phase: string
  items: string[]
}

type TemplatePageClientProps = {
  items: TemplateItem[]
  useCases: UseCaseData[]
  overview: string
  packTitle: string
  keyBenefits: string[]
  implementationSequence: ImplementationPhase[]
  relatedLinks?: {
    feature: { label: string; href: string }
    solution: { label: string; href: string }
    audience: { label: string; href: string }
  }
}

export function TemplatePageClient({
  items,
  useCases,
  overview,
  packTitle,
  keyBenefits,
  implementationSequence,
  relatedLinks,
}: TemplatePageClientProps) {
  const [selectedUseCase, setSelectedUseCase] = useState<UseCaseData | null>(null)
  const [useCaseModalOpen, setUseCaseModalOpen] = useState(false)

  const handleUseCaseClick = (useCase: UseCaseData) => {
    setSelectedUseCase(useCase)
    setUseCaseModalOpen(true)
  }

  return (
    <>
      {/* 3D Decoration - positioned in background */}
      <div className="fixed inset-0 pointer-events-none opacity-30 hidden lg:block" aria-hidden="true">
        <Decor3DErrorBoundary>
          <Suspense fallback={<div className="w-full h-full animate-pulse bg-slate-900/20" />}>
            <Guide3DDecor className="w-full h-full" />
          </Suspense>
        </Decor3DErrorBoundary>
      </div>

      {/* Overview Section */}
      <section className="relative z-10 px-4 pb-12">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm p-8">
          <h2 className="text-2xl font-semibold text-white">Overview</h2>
          <p className="mt-4 text-slate-300 leading-relaxed">{overview}</p>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="relative z-10 px-4 pb-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold text-white mb-6">Key Benefits</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {keyBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                    <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-slate-300">{benefit}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Template Pack View Section */}
      <section className="relative z-10 px-4 pb-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold text-white mb-6">What&apos;s Included</h2>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6">
            <TemplatePackView items={items} packTitle={packTitle} />
          </div>
        </div>
      </section>

      {/* Implementation Roadmap */}
      {implementationSequence.length > 0 && (
        <section className="relative z-10 px-4 pb-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-semibold text-white mb-6">Implementation Roadmap</h2>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 md:p-8">
              <div className="space-y-6">
                {implementationSequence.map((phase, phaseIndex) => (
                  <motion.div
                    key={phaseIndex}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: phaseIndex * 0.15 }}
                    className="relative"
                  >
                    {/* Connector line */}
                    {phaseIndex < implementationSequence.length - 1 && (
                      <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500/50 to-slate-800" />
                    )}

                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white font-semibold text-sm">
                        {phaseIndex + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-emerald-300">{phase.phase}</h3>
                        <ul className="mt-3 space-y-2">
                          {phase.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-2 text-sm text-slate-300">
                              <ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-teal-400" aria-hidden="true" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Who This Is For - Interactive Cards */}
      <section className="relative z-10 px-4 pb-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Who This Template Pack Is For
          </h2>
          <p className="text-slate-400 text-center mb-8 max-w-2xl mx-auto">
            Click on any persona to see how they can use this template pack with Nasara Connect features.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((useCase, index) => {
              const Icon = ICON_MAP[useCase.icon] || Shield
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <button
                    type="button"
                    onClick={() => handleUseCaseClick(useCase)}
                    aria-label={`View workflow details for ${useCase.persona}`}
                    className="w-full text-left"
                  >
                    <Card className="group h-full border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                          <Icon className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-white font-medium group-hover:text-emerald-300 transition-colors">
                            {useCase.persona}
                          </h3>
                          <p className="mt-1 text-sm text-slate-400 line-clamp-2">
                            {useCase.scenario}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          {useCase.workflow.length} workflow steps
                        </span>
                        <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          View details
                        </span>
                      </div>
                    </Card>
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Use Case Modal */}
      <UseCaseModal
        useCase={selectedUseCase}
        open={useCaseModalOpen}
        onOpenChange={setUseCaseModalOpen}
      />

      {/* CTA Section */}
      <section className="relative z-10 px-4 pb-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm p-8 text-center">
          <h2 className="text-2xl font-semibold text-white">Ready to streamline your compliance?</h2>
          <p className="mt-3 text-slate-300">Get access to this template pack and explore how Nasara Connect can help your team.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <Link href="/request-demo">Request access</Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-600 text-white bg-slate-800/50 hover:bg-slate-700">
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Related Workflows */}
      {relatedLinks && (
        <section className="relative z-10 px-4 pb-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-semibold text-white">Related Workflows</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                { kind: "Feature", ...relatedLinks.feature },
                { kind: "Solution", ...relatedLinks.solution },
                { kind: "Audience", ...relatedLinks.audience },
              ].map((item) => (
                <Link key={item.kind} href={item.href}>
                  <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm p-5 hover:border-emerald-500/60 transition-colors h-full">
                    <span className="text-xs uppercase tracking-wide text-slate-400">{item.kind}</span>
                    <h3 className="mt-2 text-base font-semibold text-white">{item.label}</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      Explore the {item.kind.toLowerCase()} workflow.
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
