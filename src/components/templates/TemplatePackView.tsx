'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { TemplateItemCard, type TemplateItem } from './TemplateItemCard'
import { ChecklistView } from './ChecklistView'
import { CATEGORY_CONFIG, type TemplateCategory } from './constants'
import {
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Menu,
  LayoutGrid,
  List,
} from 'lucide-react'

type ViewMode = 'detailed' | 'checklist'

interface TemplatePackViewProps {
  items: TemplateItem[]
  packTitle: string
}

export function TemplatePackView({ items, packTitle }: TemplatePackViewProps) {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | null>(null)
  const [activeItemIndex, setActiveItemIndex] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('detailed')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Get unique categories from items
  const categories = Array.from(new Set(items.map((item) => item.category)))

  // Filter items by active category
  const filteredItems = activeCategory
    ? items.filter((item) => item.category === activeCategory)
    : items

  // Current item for detailed view
  const currentItem = filteredItems[activeItemIndex]

  // Reset index when category changes
  useEffect(() => {
    setActiveItemIndex(0)
  }, [activeCategory])

  const goToItem = useCallback((index: number) => {
    setActiveItemIndex(index)
    setMobileNavOpen(false)
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  const goNext = useCallback(() => {
    setActiveItemIndex((prev) => {
      const nextIndex = prev + 1
      return nextIndex < filteredItems.length ? nextIndex : prev
    })
  }, [filteredItems.length])

  const goPrev = useCallback(() => {
    setActiveItemIndex((prev) => {
      return prev > 0 ? prev - 1 : prev
    })
  }, [])

  // Keyboard navigation
  useEffect(() => {
    if (viewMode !== 'detailed') return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        goNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goPrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewMode, goNext, goPrev])

  const handleCategoryClick = (cat: TemplateCategory | null) => {
    setActiveCategory(cat)
    setMobileNavOpen(false)
  }

  const progress = filteredItems.length > 0 ? ((activeItemIndex + 1) / filteredItems.length) * 100 : 0

  // Sidebar navigation component
  const CategoryNav = () => (
    <nav className="space-y-4" aria-label="Template categories">
      {/* All Items */}
      <button
        type="button"
        onClick={() => handleCategoryClick(null)}
        aria-pressed={activeCategory === null}
        aria-label="Show all template items"
        className={cn(
          'w-full rounded-xl border px-4 py-3 text-left transition-all duration-200',
          activeCategory === null
            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
            : 'border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600 hover:bg-slate-800/50 hover:text-slate-300'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
              activeCategory === null
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-700 text-slate-400'
            )}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className={cn(
              'text-sm font-medium',
              activeCategory === null ? 'text-emerald-300' : 'text-slate-300'
            )}>
              All Items
            </p>
            <p className="text-xs text-slate-500">{items.length} templates</p>
          </div>
        </div>
      </button>

      {/* Categories */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-2">
          Categories
        </p>
        {categories.map((cat) => {
          const config = CATEGORY_CONFIG[cat]
          const Icon = config.icon
          const isActive = activeCategory === cat
          const count = items.filter((item) => item.category === cat).length
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              aria-pressed={isActive}
              aria-label={`Filter by ${config.label}, ${count} templates`}
              className={cn(
                'w-full rounded-xl border px-4 py-3 text-left transition-all duration-200',
                isActive
                  ? `${config.borderClass} ${config.bgClass} ${config.textClass}`
                  : 'border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600 hover:bg-slate-800/50 hover:text-slate-300'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                    isActive ? config.activeBg : 'bg-slate-700'
                  )}
                >
                  <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-slate-400')} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    'text-sm font-medium',
                    isActive ? config.textClass : 'text-slate-300'
                  )}>
                    {config.label}
                  </p>
                  <p className="text-xs text-slate-500">{count} templates</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Items within selected category (detailed view only) */}
      {viewMode === 'detailed' && (
        <div className="space-y-2 pt-4 border-t border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-2">
            Templates
          </p>
          {filteredItems.map((item, index) => {
            const config = CATEGORY_CONFIG[item.category]
            const Icon = config.icon
            const isActive = index === activeItemIndex
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => goToItem(index)}
                aria-pressed={isActive}
                aria-label={`View ${item.title}`}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-left transition-all duration-200',
                  isActive
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : 'border-transparent hover:border-slate-700 hover:bg-slate-800/50'
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn('h-4 w-4 shrink-0', config.textClass)} aria-hidden="true" />
                  <p className={cn(
                    'text-sm truncate',
                    isActive ? 'text-emerald-300 font-medium' : 'text-slate-400'
                  )}>
                    {item.title}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </nav>
  )

  return (
    <div className="mx-auto max-w-6xl">
      {/* View Mode Toggle */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-800/50 border border-slate-700" role="tablist" aria-label="View mode">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'detailed'}
            aria-controls="detailed-view"
            onClick={() => setViewMode('detailed')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              viewMode === 'detailed'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400 hover:text-slate-300'
            )}
          >
            <List className="h-4 w-4" aria-hidden="true" />
            Detailed View
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'checklist'}
            aria-controls="checklist-view"
            onClick={() => setViewMode('checklist')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              viewMode === 'checklist'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400 hover:text-slate-300'
            )}
          >
            <CheckSquare className="h-4 w-4" aria-hidden="true" />
            Checklist View
          </button>
        </div>

        {/* Desktop counter */}
        {viewMode === 'detailed' && (
          <Badge variant="outline" className="border-slate-600 text-slate-400 hidden sm:flex">
            {activeItemIndex + 1} of {filteredItems.length}
          </Badge>
        )}
      </div>

      {/* Progress Bar (detailed view) */}
      {viewMode === 'detailed' && (
        <div className="mb-6 rounded-full bg-slate-800 h-2 overflow-hidden" role="progressbar" aria-valuenow={activeItemIndex + 1} aria-valuemin={1} aria-valuemax={filteredItems.length} aria-label={`Navigation progress: ${activeItemIndex + 1} of ${filteredItems.length}`}>
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <CategoryNav />
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="lg:hidden mb-4">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between border-slate-700 bg-slate-800/50 text-white"
                aria-label="Open template navigation menu"
              >
                <span className="flex items-center gap-2">
                  <Menu className="h-4 w-4" aria-hidden="true" />
                  {activeCategory ? CATEGORY_CONFIG[activeCategory].label : 'All Items'}
                </span>
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
                  {filteredItems.length} templates
                </Badge>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-slate-900 border-slate-800">
              <SheetHeader>
                <SheetTitle className="text-white">{packTitle}</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <CategoryNav />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-1" id={viewMode === 'detailed' ? 'detailed-view' : 'checklist-view'} role="tabpanel">
          {viewMode === 'checklist' ? (
            <ChecklistView items={filteredItems} />
          ) : (
            <AnimatePresence mode="wait">
              {currentItem && (
                <motion.div
                  key={currentItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  ref={contentRef}
                >
                  <TemplateItemCard item={currentItem} showFullDetail />

                  {/* Navigation Controls */}
                  <div className="mt-6 flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={goPrev}
                      disabled={activeItemIndex <= 0}
                      aria-label="Go to previous template"
                      className="border-slate-700 text-white bg-slate-800/50 hover:bg-slate-700 disabled:opacity-50"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                      Previous
                    </Button>

                    {/* Dots indicator (mobile) */}
                    <div className="flex gap-1.5 sm:hidden" role="group" aria-label="Page indicators">
                      {filteredItems.slice(
                        Math.max(0, activeItemIndex - 2),
                        Math.min(filteredItems.length, activeItemIndex + 3)
                      ).map((item, idx) => {
                        const actualIndex = Math.max(0, activeItemIndex - 2) + idx
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => goToItem(actualIndex)}
                            aria-label={`Go to template ${actualIndex + 1}`}
                            aria-current={actualIndex === activeItemIndex ? 'true' : undefined}
                            className={cn(
                              'h-2 w-2 rounded-full transition-colors',
                              actualIndex === activeItemIndex
                                ? 'bg-emerald-500'
                                : actualIndex < activeItemIndex
                                  ? 'bg-emerald-500/40'
                                  : 'bg-slate-600'
                            )}
                          />
                        )
                      })}
                    </div>

                    {/* Desktop indicator */}
                    <div className="hidden sm:block text-sm text-slate-400" aria-live="polite">
                      {activeItemIndex + 1} / {filteredItems.length}
                    </div>

                    <Button
                      variant="outline"
                      onClick={goNext}
                      disabled={activeItemIndex >= filteredItems.length - 1}
                      aria-label="Go to next template"
                      className="border-slate-700 text-white bg-slate-800/50 hover:bg-slate-700 disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}
