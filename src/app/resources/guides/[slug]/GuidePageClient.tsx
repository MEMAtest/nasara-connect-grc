'use client'

import { useState, Suspense, lazy } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { GuideBookView, type ChapterData } from '@/components/guides/GuideBookView'
import { UseCaseModal, type UseCaseData } from '@/components/guides/UseCaseModal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
  type LucideIcon,
} from 'lucide-react'

// Lazy load the 3D component for performance
const Guide3DDecor = lazy(() => import('@/components/guides/Guide3DDecor'))

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

type GuidePageClientProps = {
  chapters: ChapterData[]
  useCases: UseCaseData[]
  overview: string
  guideTitle: string
  relatedLinks?: {
    feature: { label: string; href: string }
    solution: { label: string; href: string }
    audience: { label: string; href: string }
  }
}

export function GuidePageClient({
  chapters,
  useCases,
  overview,
  guideTitle,
  relatedLinks,
}: GuidePageClientProps) {
  const [selectedUseCase, setSelectedUseCase] = useState<UseCaseData | null>(null)
  const [useCaseModalOpen, setUseCaseModalOpen] = useState(false)

  const handleUseCaseClick = (useCase: UseCaseData) => {
    setSelectedUseCase(useCase)
    setUseCaseModalOpen(true)
  }

  return (
    <>
      {/* 3D Decoration - positioned in background */}
      <div className="fixed inset-0 pointer-events-none opacity-30 hidden lg:block">
        <Suspense fallback={null}>
          <Guide3DDecor className="w-full h-full" />
        </Suspense>
      </div>

      {/* Overview Section */}
      <section className="relative z-10 px-4 pb-12">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm p-8">
          <h2 className="text-2xl font-semibold text-white">Overview</h2>
          <p className="mt-4 text-slate-300 leading-relaxed">{overview}</p>
        </div>
      </section>

      {/* Book View Section */}
      <section className="relative z-10 px-4 pb-12">
        <GuideBookView
          chapters={chapters}
          guideTitle={guideTitle}
          overview={overview}
        />
      </section>

      {/* Who This Is For - Interactive Cards */}
      <section className="relative z-10 px-4 pb-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Who This Guide Is For
          </h2>
          <p className="text-slate-400 text-center mb-8 max-w-2xl mx-auto">
            Click on any persona to see how they can use this guide with Nasara Connect features.
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
                    className="w-full text-left"
                  >
                    <Card className="group h-full border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                          <Icon className="h-6 w-6" />
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
                          View details →
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
          <h2 className="text-2xl font-semibold text-white">Ready to put this guide into practice?</h2>
          <p className="mt-3 text-slate-300">See how Nasara Connect can help you implement these practices with structured workflows and evidence capture.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <Link href="/request-demo">Request a demo</Link>
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
                <Link key={item.href} href={item.href}>
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
