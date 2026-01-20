'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ArrowRight, Lightbulb } from 'lucide-react'
import { CATEGORY_CONFIG } from './constants'
import { ANIMATION } from './types'
import type { TemplateItem } from './types'

// Re-export for backwards compatibility
export type { TemplateItem } from './types'

interface TemplateItemCardProps {
  item: TemplateItem
  index?: number
  showFullDetail?: boolean
}

export function TemplateItemCard({ item, index = 0, showFullDetail = false }: TemplateItemCardProps) {
  const config = CATEGORY_CONFIG[item.category]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: ANIMATION.CARD_DURATION, delay: index * ANIMATION.CARD_STAGGER_DELAY }}
    >
      <Card className={`border-slate-800 bg-slate-900/60 p-6 h-full transition-all duration-300 ${showFullDetail ? '' : 'hover:border-slate-700 hover:bg-slate-900/80'}`}>
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bgClass}`}>
            <Icon className={`h-5 w-5 ${config.textClass}`} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-white font-medium">{item.title}</h3>
              <Badge className={`${config.bgClass} ${config.textClass} ${config.borderClass} text-xs`}>
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-slate-400 line-clamp-2">
              {item.description}
            </p>
          </div>
        </div>

        {showFullDetail && (
          <>
            {/* Purpose Section */}
            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Lightbulb className="h-4 w-4" aria-hidden="true" />
                <h4 className="text-xs font-semibold uppercase tracking-wider">Purpose</h4>
              </div>
              <p className="text-sm text-slate-300">{item.purpose}</p>
            </div>

            {/* Customization Notes */}
            {item.customizationNotes.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Customization Tips
                </h4>
                <ul className="space-y-2">
                  {item.customizationNotes.map((note, noteIndex) => (
                    <li key={noteIndex} className="flex items-start gap-2 text-sm text-slate-300">
                      <ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" aria-hidden="true" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related Features */}
            {item.relatedFeatures.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-3">
                  Related Nasara Features
                </h4>
                <div className="flex flex-wrap gap-2">
                  {item.relatedFeatures.map((feature) => (
                    <Link
                      key={feature.slug}
                      href={`/features/${feature.slug}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-800/50 border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-teal-500/50 hover:text-teal-300 transition-colors"
                    >
                      {feature.label}
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </motion.div>
  )
}
