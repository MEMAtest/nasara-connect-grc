"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronLeft, ChevronRight, ClipboardList, Download, Eye, FileText, Loader2, Pencil, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { SectionNotesPicker } from "@/components/policies/SectionNotesPicker";
import type { NoteSectionConfig } from "@/lib/policies/section-notes";
import { formatNoteValue, parseNoteCustomText, parseNoteSelections } from "@/lib/policies/section-notes";
import type { PolicyClause } from "@/lib/policies/templates";

const proseClass =
  "policy-blocks prose prose-slate max-w-none prose-sm text-slate-700 prose-headings:text-slate-900 " +
  "prose-li:marker:text-slate-400 prose-table:w-full prose-table:border-collapse prose-th:bg-slate-50 " +
  "prose-th:text-slate-700 prose-td:border prose-th:border prose-td:border-slate-200 prose-th:border-slate-200";

const notesProseClass =
  "prose prose-slate max-w-none prose-sm text-slate-700 prose-headings:text-slate-900 " +
  "prose-ul:list-disc prose-ul:pl-5 prose-li:marker:text-slate-400 prose-table:w-full " +
  "prose-table:border-collapse prose-th:bg-slate-50 prose-th:text-slate-700 " +
  "prose-td:border prose-th:border prose-td:border-slate-200 prose-th:border-slate-200";

export type PolicyReaderClause = {
  id: string;
  title: string;
  summary: string;
  isMandatory?: boolean;
  contentHtml: string;
  contentMd?: string;
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

export type PolicyReportMeta = {
  title: string;
  subtitle?: string;
  firmName?: string;
  status?: string;
  owner?: string;
  version?: string;
  effectiveDate?: string;
  nextReview?: string;
  updatedAt?: string;
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
  reportMeta,
  policyId,
  showActions = true,
  noteSections,
  sectionNotes,
  customContent,
  policyClauses,
}: {
  sections: PolicyReaderSection[];
  defaultSectionId?: string;
  overview?: PolicyReaderOverview | null;
  reportMeta?: PolicyReportMeta;
  policyId?: string;
  showActions?: boolean;
  noteSections?: NoteSectionConfig[];
  sectionNotes?: Record<string, string>;
  customContent?: Record<string, unknown>;
  policyClauses?: PolicyClause[];
}) {
  const router = useRouter();
  const initialSectionId =
    sections.find((section) => section.id === defaultSectionId)?.id ?? sections[0]?.id ?? "";
  const [activeSectionId, setActiveSectionId] = useState(initialSectionId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>(sectionNotes ?? {});
  const [editingClauseId, setEditingClauseId] = useState<string | null>(null);
  const [savingClauseId, setSavingClauseId] = useState<string | null>(null);
  const [clauseError, setClauseError] = useState<string | null>(null);
  const [clauseDrafts, setClauseDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (sectionNotes) {
      setNoteDrafts(sectionNotes);
    }
  }, [sectionNotes]);

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

  useEffect(() => {
    if (!activeSection) return;
    setClauseDrafts((prev) => {
      const next = { ...prev };
      activeSection.clauses.forEach((clause) => {
        if (typeof clause.contentMd === "string") {
          next[clause.id] = clause.contentMd;
        }
      });
      return next;
    });
  }, [activeSection]);
  const noteSectionMap = useMemo(
    () => new Map((noteSections ?? []).map((section) => [section.id, section])),
    [noteSections],
  );
  const activeNoteSection = noteSections?.find((section) => section.id === activeSection?.id);
  const canEditNotes = Boolean(policyId && customContent && activeNoteSection && sectionNotes);
  const canEditClauses = Boolean(policyId && customContent && policyClauses?.length);
  const firmName = reportMeta?.firmName;

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

  const handleNoteToggle = (sectionId: string, option: string, checked: boolean) => {
    setNoteDrafts((prev) => {
      const options = noteSectionMap.get(sectionId)?.options ?? [];
      const current = parseNoteSelections(prev[sectionId], options, firmName);
      const customText = parseNoteCustomText(prev[sectionId], options, firmName);
      const next = checked
        ? Array.from(new Set([...current, option]))
        : current.filter((value) => value !== option);
      return { ...prev, [sectionId]: formatNoteValue(next, customText) };
    });
  };

  const handleNoteCustomChange = (sectionId: string, value: string) => {
    setNoteDrafts((prev) => {
      const options = noteSectionMap.get(sectionId)?.options ?? [];
      const current = parseNoteSelections(prev[sectionId], options, firmName);
      return { ...prev, [sectionId]: formatNoteValue(current, value) };
    });
  };

  const handleCancelNotes = () => {
    if (!activeSection) return;
    setNoteDrafts((prev) => ({
      ...prev,
      [activeSection.id]: sectionNotes?.[activeSection.id] ?? "",
    }));
    setIsEditingNotes(false);
    setNoteError(null);
  };

  const handleSaveNotes = async () => {
    if (!policyId || !customContent || !activeSection) return;
    setIsSavingNotes(true);
    setNoteError(null);
    try {
      const nextSectionNotes = {
        ...(sectionNotes ?? {}),
        [activeSection.id]: noteDrafts[activeSection.id] ?? "",
      };

      const response = await fetch(`/api/policies/${policyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customContent: {
            ...customContent,
            sectionNotes: nextSectionNotes,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save firm notes");
      }

      const updated = (await response.json()) as { customContent?: Record<string, unknown> };
      const updatedNotes =
        (updated.customContent as { sectionNotes?: Record<string, string> } | undefined)?.sectionNotes ??
        nextSectionNotes;
      setNoteDrafts(updatedNotes);
      setIsEditingNotes(false);
      router.refresh();
    } catch (err) {
      setNoteError(err instanceof Error ? err.message : "Unable to save firm notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleClauseEdit = (clauseId: string) => {
    setEditingClauseId(clauseId);
    setClauseError(null);
  };

  const handleClauseCancel = (clauseId: string) => {
    setEditingClauseId(null);
    setClauseError(null);
    const original = activeSection?.clauses.find((clause) => clause.id === clauseId)?.contentMd;
    if (typeof original === "string") {
      setClauseDrafts((prev) => ({ ...prev, [clauseId]: original }));
    }
  };

  const handleClauseSave = async (clauseId: string) => {
    if (!policyId || !customContent || !policyClauses) return;
    const draft = clauseDrafts[clauseId]?.trim() ?? "";
    if (!draft) {
      setClauseError("Clause content cannot be empty.");
      return;
    }

    setSavingClauseId(clauseId);
    setClauseError(null);

    try {
      const nextClauses = policyClauses.map((clause) =>
        clause.id === clauseId ? { ...clause, content: draft } : clause,
      );

      const response = await fetch(`/api/policies/${policyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clauses: nextClauses,
          customContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save clause");
      }

      setEditingClauseId(null);
      router.refresh();
    } catch (err) {
      setClauseError(err instanceof Error ? err.message : "Unable to save clause");
    } finally {
      setSavingClauseId(null);
    }
  };

  if (!activeSection) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">No policy sections available.</p>
      </div>
    );
  }

  const activeMissingNotes = Boolean(activeSection.requiresFirmNotes && !activeSection.customTextHtml);

  const reportTitle = reportMeta?.title ?? "Policy Document";
  const reportSubtitle = reportMeta?.subtitle ?? "";
  const reportFirm = reportMeta?.firmName ?? "";
  const reportStatus = reportMeta?.status ?? "Draft";
  const reportOwner = reportMeta?.owner ?? "";
  const reportVersion = reportMeta?.version ?? "";
  const reportEffective = reportMeta?.effectiveDate ?? "";
  const reportNextReview = reportMeta?.nextReview ?? "";
  const reportUpdated = reportMeta?.updatedAt ?? "";

  return (
    <div className="space-y-6">
      <div className="policy-report">
        <section className="policy-report-cover policy-report-page">
          <div className="policy-report-cover-inner">
            <p className="policy-report-eyebrow">Policy report</p>
            <h1 className="policy-report-title">{reportTitle}</h1>
            {reportSubtitle ? <p className="policy-report-subtitle">{reportSubtitle}</p> : null}
            {reportFirm ? <p className="policy-report-firm">{reportFirm}</p> : null}
            <div className="policy-report-meta">
              <div>
                <p className="policy-report-meta-label">Status</p>
                <p className="policy-report-meta-value">{reportStatus}</p>
              </div>
              <div>
                <p className="policy-report-meta-label">Owner</p>
                <p className="policy-report-meta-value">{reportOwner || "TBC"}</p>
              </div>
              <div>
                <p className="policy-report-meta-label">Version</p>
                <p className="policy-report-meta-value">{reportVersion || "TBC"}</p>
              </div>
              <div>
                <p className="policy-report-meta-label">Effective</p>
                <p className="policy-report-meta-value">{reportEffective || "TBC"}</p>
              </div>
              <div>
                <p className="policy-report-meta-label">Next review</p>
                <p className="policy-report-meta-value">{reportNextReview || "TBC"}</p>
              </div>
              <div>
                <p className="policy-report-meta-label">Last updated</p>
                <p className="policy-report-meta-value">{reportUpdated || "TBC"}</p>
              </div>
            </div>
          </div>
          <div className="policy-report-footer" />
        </section>

        <section className="policy-report-toc policy-report-page">
          <h2 className="policy-report-section-title">Table of contents</h2>
          <div className="policy-report-toc-grid">
            {sections.map((section) => (
              <div key={section.id} className="policy-report-toc-row">
                <span>{section.title}</span>
                <span className="policy-report-toc-page">___</span>
              </div>
            ))}
          </div>
          <div className="policy-report-footer" />
        </section>

        {sections.map((section) => (
          <section key={`print-${section.id}`} className="policy-report-page policy-report-section">
            <div className="policy-report-divider">
              <span>{section.title}</span>
            </div>
            <p className="policy-report-summary">{section.summary}</p>
            {section.customTextHtml ? (
              <div
                className={notesProseClass}
                dangerouslySetInnerHTML={{ __html: section.customTextHtml }}
              />
            ) : null}
            {section.id === "overview" && overview ? (
              <div className="policy-report-overview">
                <div>
                  <h3>Timeline strip</h3>
                  <div className="policy-report-grid">
                    {overview.timeline.map((item) => (
                      <div key={item.label} className="policy-report-card">
                        <p className="policy-report-card-title">{item.label}</p>
                        <p className="policy-report-card-subtitle">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3>MI snapshot</h3>
                  <div className="policy-report-grid">
                    {overview.metrics.map((item) => (
                      <div key={item.label} className="policy-report-card">
                        <p className="policy-report-card-title">{item.label}</p>
                        <p className="policy-report-card-subtitle">{formatMetricValue(item.value, item.suffix)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
            {section.clauses.length ? (
              <div className="policy-report-clause-list">
                {section.clauses.map((clause) => (
                  <div key={clause.id} className="policy-report-clause">
                    <div className="policy-report-clause-header">
                      <h4>{clause.title}</h4>
                      {clause.isMandatory ? <span>Mandatory</span> : null}
                    </div>
                    <div
                      className={proseClass}
                      dangerouslySetInnerHTML={{ __html: clause.contentHtml }}
                    />
                  </div>
                ))}
              </div>
            ) : null}
            <div className="policy-report-footer" />
          </section>
        ))}
      </div>

      <div className="policy-screen">
        {showActions ? (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{reportTitle}</h2>
              <p className="text-sm text-slate-500">{reportFirm || "Policy Document"}</p>
            </div>
            <div className="flex gap-2">
              {policyId && (
                <Button variant="outline" size="sm" asChild className="gap-2">
                  <a href={`/api/policies/${policyId}/documents/pdf?inline=1`} target="_blank" rel="noreferrer">
                    <Eye className="h-4 w-4" />
                    Preview PDF
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              {policyId && (
                <Button
                  size="sm"
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => {
                    window.location.href = `/api/policies/${policyId}/documents/docx`;
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download DOCX
                </Button>
              )}
            </div>
          </div>
        ) : null}

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

        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
          <aside className="hidden space-y-4 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm lg:sticky lg:top-6 lg:block lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
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
                    {group.map((section, idx) => {
                      const isActive = section.id === activeSectionId;
                      const missingNotes = section.requiresFirmNotes && !section.customTextHtml;
                      // Calculate section number (for non-appendix sections)
                      const sectionNumber = key === 'appendix'
                        ? String.fromCharCode(65 + idx) // A, B, C...
                        : String(sections.filter(s => s.sectionType !== 'appendix').findIndex(s => s.id === section.id) + 1);
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
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "flex h-6 w-6 items-center justify-center rounded text-xs font-bold",
                                isActive ? "bg-indigo-200 text-indigo-700" : "bg-slate-100 text-slate-500"
                              )}>
                                {sectionNumber}
                              </span>
                              <span className="text-sm font-semibold">{section.title}</span>
                            </div>
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
                  <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                    {activeSection.clauseHighlights.map((clause) => (
                      <span key={clause.id} className="rounded-full border border-slate-200 bg-white px-2 py-1">
                        {clause.title}
                      </span>
                    ))}
                  </div>
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
          <DialogHeader className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <DialogTitle>{activeSection.title}</DialogTitle>
                <p className="text-sm text-slate-500">{activeSection.summary}</p>
              </div>
              {policyId ? (
                <Button variant="outline" size="sm" asChild className="gap-2">
                  <Link href={`/policies/${policyId}/edit`}>
                    <Pencil className="h-4 w-4" />
                    Edit policy
                  </Link>
                </Button>
              ) : null}
            </div>
          </DialogHeader>
          <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-2">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Firm notes</p>
                {canEditNotes ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-500"
                    onClick={() => setIsEditingNotes((value) => !value)}
                  >
                    {isEditingNotes ? "Hide editor" : "Edit notes"}
                  </Button>
                ) : null}
              </div>
              {activeSection.customTextHtml ? (
                <div
                  className={notesProseClass}
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

            {canEditNotes && activeNoteSection && isEditingNotes ? (
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <SectionNotesPicker
                  sections={[activeNoteSection]}
                  sectionNotes={noteDrafts}
                  onToggle={handleNoteToggle}
                  onCustomChange={handleNoteCustomChange}
                  firmName={firmName}
                />
                {noteError ? <p className="text-xs text-rose-600">{noteError}</p> : null}
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancelNotes} disabled={isSavingNotes}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                  >
                    {isSavingNotes ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving
                      </>
                    ) : (
                      "Save notes"
                    )}
                  </Button>
                </div>
              </div>
            ) : null}

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
                        <div className="flex items-center gap-2">
                          {clause.isMandatory ? (
                            <Badge variant="secondary" className="text-[11px]">Mandatory</Badge>
                          ) : null}
                          {canEditClauses && clause.contentMd ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-[11px]"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                handleClauseEdit(clause.id);
                              }}
                            >
                              Edit
                            </Button>
                          ) : null}
                        </div>
                      </summary>
                      {editingClauseId === clause.id ? (
                        <div className="mt-3 space-y-3">
                          <Textarea
                            value={clauseDrafts[clause.id] ?? clause.contentMd ?? ""}
                            onChange={(event) =>
                              setClauseDrafts((prev) => ({ ...prev, [clause.id]: event.target.value }))
                            }
                            className="min-h-[180px]"
                            spellCheck
                          />
                          <p className="text-xs text-slate-400">
                            Use Markdown. Liquid variables like {"{{firm.name}}"} are allowed.
                          </p>
                          {clauseError ? <p className="text-xs text-rose-600">{clauseError}</p> : null}
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleClauseCancel(clause.id)}
                              disabled={savingClauseId === clause.id}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                              onClick={() => handleClauseSave(clause.id)}
                              disabled={savingClauseId === clause.id}
                            >
                              {savingClauseId === clause.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Saving
                                </>
                              ) : (
                                "Save clause"
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`${proseClass} mt-3`}
                          dangerouslySetInnerHTML={{ __html: clause.contentHtml }}
                        />
                      )}
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
    </div>
  );
}
