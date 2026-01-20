import {
  FileText,
  CheckSquare,
  Shield,
  BarChart3,
} from 'lucide-react'
import type { TemplateCategory, CategoryConfig } from './types'

// Re-export types for convenience
export type { TemplateCategory, CategoryConfig } from './types'

export const CATEGORY_CONFIG: Record<TemplateCategory, CategoryConfig> = {
  document: {
    icon: FileText,
    label: 'Documents',
    color: 'emerald',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
    activeBg: 'bg-emerald-500',
  },
  checklist: {
    icon: CheckSquare,
    label: 'Checklists',
    color: 'teal',
    bgClass: 'bg-teal-500/10',
    textClass: 'text-teal-400',
    borderClass: 'border-teal-500/30',
    activeBg: 'bg-teal-500',
  },
  governance: {
    icon: Shield,
    label: 'Governance',
    color: 'blue',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-400',
    borderClass: 'border-blue-500/30',
    activeBg: 'bg-blue-500',
  },
  reporting: {
    icon: BarChart3,
    label: 'Reporting',
    color: 'purple',
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500/30',
    activeBg: 'bg-purple-500',
  },
} as const
