"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Eye, Plus, Trash2 } from "lucide-react";
import { marked } from "marked";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { renderClause } from "@/lib/policies/liquid-renderer";
import { getApplicableClauses } from "@/lib/policies/templates";
import type { PolicyClause } from "@/lib/policies/templates";
import type { WizardStepProps } from "./types";

marked.setOptions({
  breaks: true,
  gfm: true,
});

function renderMarkdown(value: string) {
  if (!value) return "";
  return marked.parse(value, { async: false }) as string;
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

export function StepContentBuilder({ state, updateState, onNext, onBack }: WizardStepProps) {
  const template = state.selectedTemplate;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSectionIndex, setPreviewSectionIndex] = useState(0);

  const applicableClauses = useMemo(() => {
    if (!template) return [] as PolicyClause[];
    return getApplicableClauses(template.code, state.permissions);
  }, [template, state.permissions]);

  const clauseById = useMemo(() => {
    const map = new Map<string, PolicyClause>();
    applicableClauses.forEach((clause) => map.set(clause.id, clause));
    return map;
  }, [applicableClauses]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">Build your policy from clause blocks</h2>
          <p className="text-sm text-slate-500">
            Start with the scaffolded content, then add, reorder, or remove clauses per section. Free-text notes are optional.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            setPreviewSectionIndex(0);
            setPreviewOpen(true);
          }}
        >
          <Eye className="h-4 w-4" />
          Preview
        </Button>
      </div>

      <div className="space-y-6">
        {sections.map((section) => {
          const selectedIds = state.sectionClauses[section.id] ?? [];
          const selected = selectedIds.map((id) => clauseById.get(id)).filter((c): c is PolicyClause => Boolean(c));
          const availableToAdd = applicableClauses.filter((clause) => !selectedIds.includes(clause.id));

          return (
            <div key={section.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">Section</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">{section.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{section.summary}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[11px]">
                    {selected.length} clauses
                  </Badge>
                  <Select onValueChange={(value) => handleAddClauseToSection(section.id, value)}>
                    <SelectTrigger className="h-9 w-[220px]">
                      <SelectValue placeholder="Add clause…" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableToAdd.length === 0 ? (
                        <SelectItem value="__none__" disabled>
                          No more clauses available
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

              <div className="mt-4 space-y-3">
                {selected.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    No clauses selected for this section yet.
                  </div>
                ) : (
                  selected.map((clause, index) => {
                    const variables = clause.variables ?? [];
                    return (
                      <div key={clause.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-900">{clause.title}</p>
                            {clause.summary ? <p className="text-xs text-slate-500">{clause.summary}</p> : null}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              disabled={index === 0}
                              onClick={() => handleMoveClause(section.id, clause.id, "up")}
                              aria-label="Move clause up"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              disabled={index === selected.length - 1}
                              onClick={() => handleMoveClause(section.id, clause.id, "down")}
                              aria-label="Move clause down"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveClauseFromSection(section.id, clause.id)}
                              aria-label="Remove clause"
                            >
                              <Trash2 className="h-4 w-4 text-rose-600" />
                            </Button>
                          </div>
                        </div>

                        {variables.length > 0 ? (
                          <div className="mt-4 grid gap-3 md:grid-cols-2">
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
                        ) : null}

                        <div
                          className={cn("prose prose-slate mt-4 max-w-none prose-sm")}
                          dangerouslySetInnerHTML={{ __html: renderClauseHtml(clause) }}
                        />
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-4">
                <Label className="text-xs text-slate-500">Optional firm note</Label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={state.sectionNotes[section.id] ?? ""}
                  onChange={(event) => handleNoteChange(section.id, event.target.value)}
                  placeholder="Add any firm-specific context (optional)…"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={onNext}>
          <Plus className="h-4 w-4" />
          Continue
        </Button>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Policy preview</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Section {previewSectionIndex + 1} of {sections.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={previewSectionIndex === 0}
                onClick={() => setPreviewSectionIndex((i) => Math.max(0, i - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={previewSectionIndex === sections.length - 1}
                onClick={() => setPreviewSectionIndex((i) => Math.min(sections.length - 1, i + 1))}
              >
                Next
              </Button>
            </div>
          </div>

          {sections[previewSectionIndex] ? (
            <div className="mt-3 max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-indigo-500">Policy document</p>
                <h2 className="text-2xl font-semibold text-slate-900">{template.name}</h2>
                <p className="text-sm text-slate-500">{state.firmProfile.name}</p>
              </div>

              <hr className="my-5 border-slate-200" />

              <h3 className="text-xl font-semibold text-slate-900">{sections[previewSectionIndex].title}</h3>
              <p className="mt-1 text-sm text-slate-500">{sections[previewSectionIndex].summary}</p>

              <div className="mt-4 space-y-4">
                {(state.sectionClauses[sections[previewSectionIndex].id] ?? [])
                  .map((id) => clauseById.get(id))
                  .filter((c): c is PolicyClause => Boolean(c))
                  .map((clause) => (
                    <div key={clause.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                      <p className="text-sm font-semibold text-slate-900">{clause.title}</p>
                      <div
                        className="prose prose-slate mt-3 max-w-none prose-sm"
                        dangerouslySetInnerHTML={{ __html: renderClauseHtml(clause) }}
                      />
                    </div>
                  ))}

                {state.sectionNotes[sections[previewSectionIndex].id] ? (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-600">Firm note</p>
                    <div
                      className="prose prose-slate mt-2 max-w-none prose-sm"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(state.sectionNotes[sections[previewSectionIndex].id]) }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

