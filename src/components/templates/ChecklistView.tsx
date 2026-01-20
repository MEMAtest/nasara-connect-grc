'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { TemplateItem } from './TemplateItemCard'
import { CATEGORY_CONFIG } from './constants'
import { ANIMATION, type TemplateCategory } from './types'
import {
  Search,
  Check,
  Square,
  Printer,
} from 'lucide-react'

interface ChecklistViewProps {
  items: TemplateItem[]
}

export function ChecklistView({ items }: ChecklistViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<TemplateCategory[]>([])
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  // Get available categories from items
  const availableCategories = useMemo(() => {
    const cats = new Set<TemplateCategory>()
    items.forEach((item) => cats.add(item.category))
    return Array.from(cats)
  }, [items])

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(item.category)

      return matchesSearch && matchesCategory
    })
  }, [items, searchQuery, selectedCategories])

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Partial<Record<TemplateCategory, TemplateItem[]>> = {}
    filteredItems.forEach((item) => {
      const categoryGroup = groups[item.category] || []
      categoryGroup.push(item)
      groups[item.category] = categoryGroup
    })
    return groups
  }, [filteredItems])

  const toggleCategory = (cat: TemplateCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const toggleItem = (itemId: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  const checkedCount = checkedItems.size
  const totalCount = items.length
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Implementation Progress</span>
          <span className="text-sm font-medium text-emerald-400">
            {checkedCount}/{totalCount} items
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden" role="progressbar" aria-valuenow={checkedCount} aria-valuemin={0} aria-valuemax={totalCount} aria-label={`${checkedCount} of ${totalCount} items completed`}>
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            aria-label="Search templates"
            className="pl-10 bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {availableCategories.map((cat) => {
            const config = CATEGORY_CONFIG[cat]
            const isSelected = selectedCategories.includes(cat)
            const Icon = config.icon
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                aria-pressed={isSelected}
                aria-label={`Filter by ${config.label}`}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all',
                  isSelected
                    ? `${config.bgClass} ${config.textClass} ${config.borderClass}`
                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {config.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Print Button */}
      <div className="flex justify-end print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          aria-label="Print checklist for offline use"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-slate-400 hover:border-slate-600 hover:text-slate-300 transition-colors"
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          Print Checklist
        </button>
      </div>

      {/* Checklist Items */}
      <div className="space-y-6 print:bg-white print:text-black">
        <AnimatePresence mode="popLayout">
          {Object.entries(groupedItems).map(([category, categoryItems]) => {
            const config = CATEGORY_CONFIG[category as TemplateCategory]
            const Icon = config.icon
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bgClass} print:bg-gray-100`}>
                    <Icon className={`h-4 w-4 ${config.textClass} print:text-gray-700`} aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-white print:text-black">{config.label}</h3>
                  <Badge className={`${config.bgClass} ${config.textClass} ${config.borderClass} print:bg-gray-100 print:text-gray-700`}>
                    {categoryItems?.length || 0}
                  </Badge>
                </div>

                {/* Items Grid */}
                <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label={`${config.label} templates`}>
                  {categoryItems?.map((item, index) => {
                    const isChecked = checkedItems.has(item.id)
                    return (
                      <motion.button
                        key={item.id}
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        aria-pressed={isChecked}
                        aria-label={`${isChecked ? 'Unmark' : 'Mark'} ${item.title} as ${isChecked ? 'incomplete' : 'complete'}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: ANIMATION.ITEM_DURATION, delay: index * ANIMATION.STAGGER_DELAY }}
                        className={cn(
                          'flex items-start gap-3 rounded-xl border p-4 text-left transition-all print:border-gray-300',
                          isChecked
                            ? 'border-emerald-500/50 bg-emerald-500/10 print:bg-green-50'
                            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 print:bg-white'
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors print:border-gray-400',
                            isChecked
                              ? 'border-emerald-500 bg-emerald-500 print:bg-green-500'
                              : 'border-slate-600 bg-slate-800 print:bg-white'
                          )}
                        >
                          {isChecked ? (
                            <Check className="h-4 w-4 text-white" aria-hidden="true" />
                          ) : (
                            <Square className="h-3 w-3 text-transparent" aria-hidden="true" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              'font-medium transition-colors print:text-black',
                              isChecked ? 'text-emerald-300 print:text-green-700' : 'text-white'
                            )}
                          >
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 line-clamp-1 print:text-gray-500">
                            {item.description}
                          </p>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <Search className="h-12 w-12 mx-auto text-slate-600 mb-4" aria-hidden="true" />
          <h3 className="text-lg font-medium text-white mb-2">No templates found</h3>
          <p className="text-sm text-slate-400">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  )
}
