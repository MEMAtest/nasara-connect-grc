"use client";

import { useMemo, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, ClipboardList, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const proseClass =
  "policy-blocks prose prose-slate max-w-none prose-sm text-slate-700 prose-headings:text-slate-900 " +
  "prose-li:marker:text-slate-400 prose-table:w-full prose-table:border-collapse prose-th:bg-slate-50 " +
  "prose-th:text-slate-700 prose-td:border prose-th:border prose-td:border-slate-200 prose-th:border-slate-200";

export type PolicyReaderClause = {
  id: string;
  title: string;
  summary: string;
  isMandatory?: boolean;
  contentHtml: string;
};

export type PolicyReaderSection = {
  id: string;
  title: string;
  summary: string;
  sectionType: "policy" | "procedure" | "appendix";
  requiresFirmNotes?: boolean;
  customTextHtml?: string;
  customTextExcerpt?: string;
  clauseCount: number;
  clauseHighlights: Array<{ id: string; title: string }>;
  missingVariableCount?: number;
  clauses: PolicyReaderClause[];
};

export type PolicyReaderOverview = {
  timeline: Array<{ label: string; description: string }>;
  metrics: Array<{ label: string; value?: number; suffix?: string }>;
};

const SECTION_LABELS: Record<PolicyReaderSection["sectionType"], string> = {
  policy: "Policy",
  procedure: "Procedure",
  appendix: "Appendices",
};

const SECTION_ICONS: Record<PolicyReaderSection["sectionType"], typeof BookOpen> = {
  policy: BookOpen,
  procedure: ClipboardList,
  appendix: FileText,
};

function formatMetricValue(value?: number, suffix?: string) {
  if (typeof value !== "number") return "No data yet";
  if (!suffix) return String(value);
  return `${value} ${suffix}`;
}

export function PolicyReaderClient({
  sections,
  defaultSectionId,
  overview,
}: {
  sections: PolicyReaderSection[];
  defaultSectionId?: string;
  overview?: PolicyReaderOverview | null;
}) {
  const initialSectionId =
    sections.find((section) => section.id === defaultSectionId)?.id ?? sections[0]?.id ?? "";
  const [activeSectionId, setActiveSectionId] = useState(initialSectionId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const groupedSections = useMemo(() => {
    return sections.reduce(
      (acc, section) => {
        acc[section.sectionType].push(section);
        return acc;
      },
      { policy: [], procedure: [], appendix: [] } as Record<PolicyReaderSection["sectionType"], PolicyReaderSection[]>,
    );
  }, [sections]);

  const activeIndex = sections.findIndex((section) => section.id === activeSectionId);
  const activeSection = sections[activeIndex] ?? sections[0];

  const goToSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
  };

  const goNext = () => {
    if (!sections.length) return;
    const nextIndex = Math.min(activeIndex + 1, sections.length - 1);
    setActiveSectionId(sections[nextIndex].id);
  };

  const goPrev = () => {
    if (!sections.length) return;
    const prevIndex = Math.max(activeIndex - 1, 0);
    setActiveSectionId(sections[prevIndex].id);
  };

  if (!activeSection) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">No policy sections available.</p>
      </div>
    );
  }

  const activeMissingNotes = Boolean(activeSection.requiresFirmNotes && !activeSection.customTextHtml);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => goToSection(section.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold transition",
              section.id === activeSectionId
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-slate-200 text-slate-500",
            )}
          >
            {section.title}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden space-y-4 lg:block">
          {(Object.keys(groupedSections) as Array<PolicyReaderSection["sectionType"]>).map((key) => {
            const group = groupedSections[key];
            if (!group.length) return null;
            const Icon = SECTION_ICONS[key];
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                  <Icon className="h-4 w-4 text-slate-300" />
                  {SECTION_LABELS[key]}
                </div>
                <div className="space-y-2">
                  {group.map((section) => {
                    const isActive = section.id === activeSectionId;
                    const missingNotes = section.requiresFirmNotes && !section.customTextHtml;
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => goToSection(section.id)}
                        className={cn(
                          "w-full rounded-2xl border px-3 py-3 text-left transition",
                          isActive
                            ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                            : "border-slate-100 bg-white text-slate-600 hover:border-slate-200",
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold">{section.title}</span>
                          <span className="text-[11px] text-slate-400">{section.clauseCount}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                          {missingNotes ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">Notes required</span>
                          ) : null}
                          {section.missingVariableCount ? (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-700">
                              {section.missingVariableCount} missing vars
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </aside>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <Badge variant="outline" className="uppercase tracking-[0.2em] text-[11px]">
                  {SECTION_LABELS[activeSection.sectionType]}
                </Badge>
                <h2 className="text-2xl font-semibold text-slate-900">{activeSection.title}</h2>
                <p className="text-sm text-slate-500">{activeSection.summary}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>
                  {activeIndex + 1} of {sections.length}
                </span>
              </div>
            </div>

            {overview && activeSection.id === "overview" ? (
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Timeline strip
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {overview.timeline.map((item) => (
                      <div key={item.label} className="rounded-xl border border-slate-100 bg-white p-3">
                        <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    MI snapshot
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {overview.metrics.map((item) => (
                      <div key={item.label} className="rounded-xl border border-slate-100 bg-white p-3">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {formatMetricValue(item.value, item.suffix)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Firm notes</p>
                {activeSection.customTextHtml ? (
                  <p className="text-sm text-slate-600">{activeSection.customTextExcerpt}</p>
                ) : activeMissingNotes ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-800">
                      Add firm-specific SLAs, contact points, and escalation detail for this section.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm italic text-slate-400">No bespoke content captured yet.</p>
                )}
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Clause highlights
                </p>
                {activeSection.clauseHighlights.length ? (
                  <ul className="space-y-2 text-sm text-slate-700">
                    {activeSection.clauseHighlights.map((clause) => (
                      <li key={clause.id} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-300" />
                        <span>{clause.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400">No clauses assigned.</p>
                )}
                <Button
                  type="button"
                  size="sm"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Open full section
                </Button>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={goPrev} disabled={activeIndex <= 0}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button variant="outline" onClick={goNext} disabled={activeIndex >= sections.length - 1}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{activeSection.title}</DialogTitle>
            <p className="text-sm text-slate-500">{activeSection.summary}</p>
          </DialogHeader>
          <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Firm notes</p>
              {activeSection.customTextHtml ? (
                <div
                  className={proseClass}
                  dangerouslySetInnerHTML={{ __html: activeSection.customTextHtml }}
                />
              ) : activeMissingNotes ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-800">
                    Add firm-specific SLAs, contact points, and escalation detail for this section.
                  </p>
                </div>
              ) : (
                <p className="text-sm italic text-slate-400">No bespoke content captured yet.</p>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Clauses</p>
              {activeSection.clauses.length ? (
                <div className="space-y-3">
                  {activeSection.clauses.map((clause) => (
                    <details key={clause.id} className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <summary className="flex cursor-pointer items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{clause.title}</p>
                          <p className="text-xs text-slate-500">{clause.summary}</p>
                        </div>
                        {clause.isMandatory ? (
                          <Badge variant="secondary" className="text-[11px]">Mandatory</Badge>
                        ) : null}
                      </summary>
                      <div
                        className={`${proseClass} mt-3`}
                        dangerouslySetInnerHTML={{ __html: clause.contentHtml }}
                      />
                    </details>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No clauses assigned to this section.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
