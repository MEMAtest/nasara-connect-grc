"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { renderPolicyMarkdown } from "@/lib/policies/markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { renderClause } from "@/lib/policies/liquid-renderer";
import { getApplicableClauses } from "@/lib/policies/templates";
import type { PolicyClause, PolicyTemplateSection } from "@/lib/policies/templates";
import type { WizardStepProps } from "./types";
import { PolicyReaderClient } from "@/components/policies/PolicyReaderClient";
import type { PolicyReaderOverview, PolicyReaderSection } from "@/components/policies/PolicyReaderClient";

function renderMarkdown(value: string) {
  if (!value) return "";
  return renderPolicyMarkdown(value);
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function toExcerpt(value: string, maxLength = 180) {
  const cleaned = value
    .replace(/\r?\n/g, " ")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[\\#>*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).trimEnd()}...`;
}

function getClauseKind(clause: PolicyClause) {
  return clause.source === "mfs" ? "Static module" : "Dynamic fragment";
}

function getSectionLabel(section: PolicyTemplateSection) {
  if (section.sectionType === "procedure") return "Procedure";
  if (section.sectionType === "appendix") return "Appendix";
  return "Policy";
}

export function StepContentBuilder({ state, updateState, onNext, onBack }: WizardStepProps) {
  const template = state.selectedTemplate;
  const [activeSectionId, setActiveSectionId] = useState("");

  const applicableClauses = useMemo(() => {
    if (!template) return [] as PolicyClause[];
    return getApplicableClauses(template.code, state.permissions);
  }, [template, state.permissions]);

  const clauseById = useMemo(() => {
    const map = new Map<string, PolicyClause>();
    applicableClauses.forEach((clause) => map.set(clause.id, clause));
    return map;
  }, [applicableClauses]);

  useEffect(() => {
    if (!template?.sections?.length) return;
    setActiveSectionId(template.sections[0].id);
  }, [template?.code]);

  const recomputeSelectedClauses = (nextSectionClauses: Record<string, string[]>) => {
    const ids = unique(Object.values(nextSectionClauses).flatMap((list) => list));
    return ids.map((id) => clauseById.get(id)).filter((clause): clause is PolicyClause => Boolean(clause));
  };

  const handleAddClauseToSection = (sectionId: string, clauseId: string) => {
    updateState((current) => {
      const existing = current.sectionClauses[sectionId] ?? [];
      if (existing.includes(clauseId)) return current;
      const nextSectionClauses = {
        ...current.sectionClauses,
        [sectionId]: [...existing, clauseId],
      };
      return {
        ...current,
        sectionClauses: nextSectionClauses,
        selectedClauses: recomputeSelectedClauses(nextSectionClauses),
      };
    });
  };

  const handleRemoveClauseFromSection = (sectionId: string, clauseId: string) => {
    updateState((current) => {
      const existing = current.sectionClauses[sectionId] ?? [];
      const nextSectionClauses = {
        ...current.sectionClauses,
        [sectionId]: existing.filter((id) => id !== clauseId),
      };
      return {
        ...current,
        sectionClauses: nextSectionClauses,
        selectedClauses: recomputeSelectedClauses(nextSectionClauses),
      };
    });
  };

  const handleMoveClause = (sectionId: string, clauseId: string, direction: "up" | "down") => {
    updateState((current) => {
      const list = [...(current.sectionClauses[sectionId] ?? [])];
      const index = list.indexOf(clauseId);
      if (index === -1) return current;
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= list.length) return current;
      const [removed] = list.splice(index, 1);
      list.splice(nextIndex, 0, removed);
      const nextSectionClauses = { ...current.sectionClauses, [sectionId]: list };
      return {
        ...current,
        sectionClauses: nextSectionClauses,
        selectedClauses: recomputeSelectedClauses(nextSectionClauses),
      };
    });
  };

  const handleNoteChange = (sectionId: string, value: string) => {
    updateState((current) => ({
      ...current,
      sectionNotes: {
        ...current.sectionNotes,
        [sectionId]: value,
      },
    }));
  };

  const handleVariableChange = (clauseId: string, variableName: string, value: string) => {
    updateState((current) => ({
      ...current,
      clauseVariables: {
        ...current.clauseVariables,
        [clauseId]: {
          ...(current.clauseVariables[clauseId] ?? {}),
          [variableName]: value,
        },
      },
    }));
  };

  const firmContext = useMemo(() => {
    return {
      firm: {
        name: state.firmProfile.name,
        tradingName: state.firmProfile.tradingName || undefined,
        registeredAddress: state.firmProfile.registeredAddress || undefined,
        fcaReference: state.firmProfile.fcaReference || undefined,
        website: state.firmProfile.website || undefined,
      },
      firm_name: state.firmProfile.name,
      permissions: state.permissions,
    };
  }, [state.firmProfile, state.permissions]);

  const renderClauseHtml = (clause: PolicyClause) => {
    const answers = state.clauseVariables[clause.id] ?? {};
    const renderedMd = renderClause(clause.content, firmContext, answers);
    return renderMarkdown(renderedMd);
  };

  if (!template) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-500">
        Select a template in the previous step to start composing content.
      </div>
    );
  }

  const sections = template.sections;
  const activeSection = sections.find((section) => section.id === activeSectionId) ?? sections[0];

  const overview: PolicyReaderOverview | null =
    template.code === "COMPLAINTS"
      ? {
          timeline: [
            { label: "3-day SRC", description: "DISP 1.5" },
            { label: "15 days (PSD)", description: "PSR" },
            { label: "35 days (PSD exception)", description: "PSR" },
            { label: "8 weeks (Non-PSD)", description: "DISP" },
          ],
          metrics: [
            { label: "% on-time final responses" },
            { label: "Avg days to resolve (PSD)", suffix: "days" },
            { label: "FOS overturn rate" },
            { label: "Vulnerable complaints on time" },
          ],
        }
      : null;

  const readerSections: PolicyReaderSection[] = sections.map((section) => {
    const clauseIds = state.sectionClauses[section.id] ?? [];
    const clauses = clauseIds.map((id) => clauseById.get(id)).filter((clause): clause is PolicyClause => Boolean(clause));
    let missingVariableCount = 0;
    clauses.forEach((clause) => {
      (clause.variables ?? []).forEach((variable) => {
        if (!variable.required) return;
        const value = (state.clauseVariables[clause.id] ?? {})[variable.name] ?? variable.defaultValue ?? "";
        if (!String(value).trim()) missingVariableCount += 1;
      });
    });

    const customText = state.sectionNotes[section.id] ?? "";

    return {
      id: section.id,
      title: section.title,
      summary: section.summary,
      sectionType: section.sectionType ?? "policy",
      requiresFirmNotes: section.requiresFirmNotes ?? false,
      customTextHtml: customText ? renderMarkdown(customText) : undefined,
      customTextExcerpt: customText ? toExcerpt(customText) : undefined,
      clauseCount: clauses.length,
      clauseHighlights: clauses.slice(0, 3).map((clause) => ({ id: clause.id, title: clause.title })),
      missingVariableCount: missingVariableCount || undefined,
      clauses: clauses.map((clause) => ({
        id: clause.id,
        title: clause.title,
        summary: clause.summary,
        isMandatory: clause.isMandatory,
        contentHtml: renderClauseHtml(clause),
      })),
    };
  });

  if (!activeSection) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-500">
        No sections configured for this template.
      </div>
    );
  }

  const selectedIds = state.sectionClauses[activeSection.id] ?? [];
  const selected = selectedIds.map((id) => clauseById.get(id)).filter((c): c is PolicyClause => Boolean(c));
  const availableToAdd = applicableClauses.filter((clause) => !selectedIds.includes(clause.id));

  return (
    <Tabs defaultValue="assembler" className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">Policy assembler</h2>
          <p className="text-sm text-slate-500">
            Combine static modules with dynamic fragments. Each section is assembled from clause blocks and firm-specific notes.
          </p>
        </div>
        <TabsList className="bg-slate-100 text-slate-500">
          <TabsTrigger value="assembler">Assembler</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="assembler" className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="space-y-3">
            {sections.map((section) => {
              const isActive = section.id === activeSection.id;
              const clauseCount = (state.sectionClauses[section.id] ?? []).length;
              const notes = state.sectionNotes[section.id] ?? "";
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSectionId(section.id)}
                  className={cn(
                    "w-full rounded-2xl border px-3 py-3 text-left transition",
                    isActive
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                      : "border-slate-100 bg-white text-slate-600 hover:border-slate-200",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                        {getSectionLabel(section)}
                      </p>
                      <p className="mt-1 text-sm font-semibold">{section.title}</p>
                    </div>
                    <span className="text-[11px] text-slate-400">{clauseCount}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 line-clamp-2">{section.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                    {section.requiresFirmNotes ? (
                      <span className={cn("rounded-full px-2 py-0.5", notes ? "bg-emerald-50 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                        {notes ? "Notes added" : "Notes required"}
                      </span>
                    ) : null}
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">{clauseCount} blocks</span>
                  </div>
                </button>
              );
            })}
          </aside>

          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">Active section</p>
                  <h3 className="text-lg font-semibold text-slate-900">{activeSection.title}</h3>
                  <p className="text-sm text-slate-500">{activeSection.summary}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[11px]">
                    {selected.length} blocks
                  </Badge>
                  <Select onValueChange={(value) => handleAddClauseToSection(activeSection.id, value)}>
                    <SelectTrigger className="h-9 w-[220px]">
                      <SelectValue placeholder="Add block" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableToAdd.length === 0 ? (
                        <SelectItem value="__none__" disabled>
                          No more blocks available
                        </SelectItem>
                      ) : (
                        availableToAdd.map((clause) => (
                          <SelectItem key={clause.id} value={clause.id}>
                            {clause.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <ScrollArea className="h-[58vh] rounded-2xl border border-slate-200 bg-white">
              <div className="space-y-4 p-4">
                {selected.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    No blocks selected for this section yet.
                  </div>
                ) : (
                  selected.map((clause, index) => {
                    const variables = clause.variables ?? [];
                    return (
                      <div key={clause.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-900">{clause.title}</p>
                            {clause.summary ? <p className="text-xs text-slate-500">{clause.summary}</p> : null}
                            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                              <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-500">{getClauseKind(clause)}</span>
                              {clause.isMandatory ? (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">Mandatory</span>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              disabled={index === 0}
                              onClick={() => handleMoveClause(activeSection.id, clause.id, "up")}
                              aria-label="Move clause up"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              disabled={index === selected.length - 1}
                              onClick={() => handleMoveClause(activeSection.id, clause.id, "down")}
                              aria-label="Move clause down"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveClauseFromSection(activeSection.id, clause.id)}
                              aria-label="Remove clause"
                            >
                              <Trash2 className="h-4 w-4 text-rose-600" />
                            </Button>
                          </div>
                        </div>

                        {variables.length > 0 ? (
                          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                              Inputs
                            </p>
                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                              {variables.map((variable) => (
                                <div key={variable.name} className="space-y-2">
                                  <Label htmlFor={`${clause.id}-${variable.name}`}>
                                    {variable.name}
                                    {variable.required ? " *" : ""}
                                  </Label>
                                  <Input
                                    id={`${clause.id}-${variable.name}`}
                                    value={(state.clauseVariables[clause.id] ?? {})[variable.name] ?? variable.defaultValue ?? ""}
                                    onChange={(event) => handleVariableChange(clause.id, variable.name, event.target.value)}
                                    placeholder={variable.description ?? ""}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        <details className="mt-4 group">
                          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                            Preview block
                          </summary>
                          <div
                            className={cn("policy-blocks prose prose-slate mt-3 max-w-none prose-sm text-slate-700")}
                            dangerouslySetInnerHTML={{ __html: renderClauseHtml(clause) }}
                          />
                        </details>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <Label className="text-xs text-slate-500">Firm notes for this section</Label>
              <Textarea
                className="mt-2"
                rows={4}
                value={state.sectionNotes[activeSection.id] ?? ""}
                onChange={(event) => handleNoteChange(activeSection.id, event.target.value)}
                placeholder="Capture firm-specific context, SLAs, or governance detail..."
              />
            </section>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="preview" className="space-y-4">
        <PolicyReaderClient sections={readerSections} defaultSectionId={activeSection.id} overview={overview} />
      </TabsContent>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={onNext}>
          <Plus className="h-4 w-4" />
          Continue
        </Button>
      </div>
    </Tabs>
  );
}
