'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, BookOpen, Menu, Check, Circle, Lightbulb, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export type ChapterData = {
  title: string
  description: string
  content: string[]
  keyPoints: string[]
  nasaraFeature?: string
}

export type GuideBookViewProps = {
  chapters: ChapterData[]
  guideTitle: string
  overview: string
}

export function GuideBookView({ chapters, guideTitle, overview }: GuideBookViewProps) {
  const [activeChapter, setActiveChapter] = useState(0)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const goToChapter = (index: number) => {
    setActiveChapter(index)
    setMobileNavOpen(false)
    // Smooth scroll content to top
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goNext = () => {
    if (activeChapter < chapters.length - 1) {
      goToChapter(activeChapter + 1)
    }
  }

  const goPrev = () => {
    if (activeChapter > 0) {
      goToChapter(activeChapter - 1)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        goNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goPrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeChapter])

  const chapter = chapters[activeChapter]
  const progress = ((activeChapter + 1) / chapters.length) * 100

  // Sidebar navigation component
  const ChapterNav = () => (
    <nav className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 mb-4">
        <BookOpen className="h-4 w-4" />
        Chapters
      </div>
      {chapters.map((ch, index) => {
        const isActive = index === activeChapter
        const isCompleted = index < activeChapter
        return (
          <button
            key={index}
            type="button"
            onClick={() => goToChapter(index)}
            className={cn(
              'w-full rounded-xl border px-4 py-3 text-left transition-all duration-200',
              isActive
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                : 'border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600 hover:bg-slate-800/50 hover:text-slate-300'
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  isActive
                    ? 'bg-emerald-500 text-white'
                    : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-700 text-slate-400'
                )}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn(
                  'text-sm font-medium truncate',
                  isActive ? 'text-emerald-300' : 'text-slate-300'
                )}>
                  {ch.title}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {ch.description.slice(0, 50)}...
                </p>
              </div>
            </div>
          </button>
        )
      })}
    </nav>
  )

  return (
    <div className="mx-auto max-w-6xl">
      {/* Progress Bar */}
      <div className="mb-6 rounded-full bg-slate-800 h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <ChapterNav />
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="lg:hidden mb-4">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between border-slate-700 bg-slate-800/50 text-white"
              >
                <span className="flex items-center gap-2">
                  <Menu className="h-4 w-4" />
                  Chapter {activeChapter + 1}: {chapter?.title}
                </span>
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
                  {activeChapter + 1}/{chapters.length}
                </Badge>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-slate-900 border-slate-800">
              <SheetHeader>
                <SheetTitle className="text-white">{guideTitle}</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <ChapterNav />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Content Area */}
        <div className="space-y-6 lg:col-span-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeChapter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Chapter Header */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      Chapter {activeChapter + 1}
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      {chapter?.title}
                    </h2>
                    <p className="text-slate-400 text-base leading-relaxed">
                      {chapter?.description}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <Badge variant="outline" className="border-slate-600 text-slate-400">
                      {activeChapter + 1} of {chapters.length}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Chapter Content */}
              <div
                ref={contentRef}
                className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 space-y-6"
              >
                {/* Main Content Paragraphs */}
                <div className="space-y-4">
                  {chapter?.content.map((paragraph, index) => (
                    <motion.p
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="text-slate-300 leading-relaxed"
                    >
                      {paragraph}
                    </motion.p>
                  ))}
                </div>

                {/* Key Points Callout */}
                {chapter?.keyPoints && chapter.keyPoints.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="rounded-2xl border border-teal-500/30 bg-teal-500/5 p-6"
                  >
                    <div className="flex items-center gap-2 text-teal-400 mb-4">
                      <Lightbulb className="h-5 w-5" />
                      <h3 className="text-sm font-semibold uppercase tracking-wider">
                        Key Takeaways
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {chapter.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-3 text-slate-300">
                          <ArrowRight className="h-4 w-4 shrink-0 mt-1 text-teal-400" />
                          <span className="text-sm">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Nasara Feature Link */}
                {chapter?.nasaraFeature && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4"
                  >
                    <p className="text-sm text-slate-400">
                      <span className="text-emerald-400 font-medium">Related Nasara Connect Feature:</span>{' '}
                      This chapter aligns with our{' '}
                      <a
                        href={`/features/${chapter.nasaraFeature}`}
                        className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                      >
                        {chapter.nasaraFeature.replace(/-/g, ' ')}
                      </a>{' '}
                      module.
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="mt-6 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={goPrev}
                  disabled={activeChapter <= 0}
                  className="border-slate-700 text-white bg-slate-800/50 hover:bg-slate-700 disabled:opacity-50"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                {/* Chapter dots indicator (mobile) */}
                <div className="flex gap-1.5 sm:hidden">
                  {chapters.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToChapter(index)}
                      className={cn(
                        'h-2 w-2 rounded-full transition-colors',
                        index === activeChapter
                          ? 'bg-emerald-500'
                          : index < activeChapter
                            ? 'bg-emerald-500/40'
                            : 'bg-slate-600'
                      )}
                    />
                  ))}
                </div>

                {/* Desktop chapter indicator */}
                <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
                  {chapters.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToChapter(index)}
                      className="focus:outline-none"
                    >
                      {index === activeChapter ? (
                        <Circle className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                      ) : index < activeChapter ? (
                        <Circle className="h-3 w-3 fill-emerald-500/40 text-emerald-500/40" />
                      ) : (
                        <Circle className="h-3 w-3 text-slate-600" />
                      )}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={goNext}
                  disabled={activeChapter >= chapters.length - 1}
                  className="border-slate-700 text-white bg-slate-800/50 hover:bg-slate-700 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
