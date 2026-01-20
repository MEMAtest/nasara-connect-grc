import type { LucideIcon } from 'lucide-react'

export type TemplateCategory = 'document' | 'checklist' | 'governance' | 'reporting'

export type TemplateItem = {
  id: string
  title: string
  category: TemplateCategory
  description: string
  purpose: string
  sequence: number
  customizationNotes: string[]
  relatedFeatures: Array<{ slug: string; label: string }>
}

export type CategoryConfig = {
  icon: LucideIcon
  label: string
  color: string
  bgClass: string
  textClass: string
  borderClass: string
  activeBg: string
}

// Animation constants
export const ANIMATION = {
  /** Delay multiplier for staggered item animations */
  STAGGER_DELAY: 0.02,
  /** Duration for checklist item animations */
  ITEM_DURATION: 0.2,
  /** Duration for card animations */
  CARD_DURATION: 0.3,
  /** Delay multiplier for card stagger animations */
  CARD_STAGGER_DELAY: 0.05,
} as const
