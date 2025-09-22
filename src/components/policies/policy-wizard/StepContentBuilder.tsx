"use client";

import { useMemo } from "react";
import { Sparkles, TextQuote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { PolicyClause } from "@/lib/policies/templates";
import { getApplicableClauses } from "@/lib/policies/templates";
import type { WizardStepProps } from "./types";

export function StepContentBuilder({ state, updateState, onNext, onBack }: WizardStepProps) {
  const template = state.selectedTemplate;
  const clauses = useMemo(() => {
    if (!template) return [] as PolicyClause[];
    return getApplicableClauses(template.code, state.permissions);
  }, [template, state.permissions]);

  const handleContentChange = (sectionId: string, value: string) => {
    updateState((current) => ({
      ...current,
      customContent: {
        ...current.customContent,
        [sectionId]: value,
      },
    }));
  };

  const handleClauseInsert = (clause: PolicyClause) => {
    updateState((current) => ({
      ...current,
      selectedClauses: current.selectedClauses.find((item) => item.id === clause.id)
        ? current.selectedClauses
        : [...current.selectedClauses, clause],
    }));
  };
  const handleClauseRemove = (clauseId: string) => {
    updateState((current) => ({
      ...current,
      selectedClauses: current.selectedClauses.filter((clause) => clause.id !== clauseId),
    }));
  };

  if (!template) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-500">
        Select a template in the previous step to start composing content.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">Draft policy content</h2>
          <p className="text-sm text-slate-500">
            Each section comes with guidance from the template. Add bespoke language or click “Insert clause” on the right to pull from the clause library.
          </p>
        </div>

        <div className="space-y-6">
          {template.sections.map((section) => {
            const insertedClauses = state.selectedClauses.filter((clause) =>
              section.suggestedClauses.includes(clause.id)
            );
            return (
              <div key={section.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{section.title}</h3>
                    <p className="text-xs text-slate-500">{section.summary}</p>
                  </div>
                  <Badge variant="outline" className="border-indigo-200 text-indigo-600">
                    Section
                  </Badge>
                </div>
                <Textarea
                  className="mt-3 h-32"
                  placeholder="Capture how this applies to your firm…"
                  value={state.customContent[section.id] ?? ""}
                  onChange={(event) => handleContentChange(section.id, event.target.value)}
                />
                {insertedClauses.length ? (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {insertedClauses.map((clause) => (
                      <button
                        key={clause.id}
                        type="button"
                        onClick={() => handleClauseRemove(clause.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600 transition hover:border-rose-200 hover:text-rose-600"
                      >
                        {clause.title}
                        <span aria-hidden>×</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={onNext}>
            <Sparkles className="h-4 w-4" />
            Continue
          </Button>
        </div>
      </div>

      <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Clause library</h3>
          <p className="text-xs text-slate-500">
            Mandatory clauses are tagged. Optional clauses can be inserted wherever they add clarity.
          </p>
        </div>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {clauses.map((clause) => {
            const alreadyAdded = state.selectedClauses.some((selected) => selected.id === clause.id);
            return (
              <div key={clause.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">{clause.title}</p>
                  {clause.isMandatory ? (
                    <Badge variant="destructive" className="text-[11px]">Mandatory</Badge>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-slate-500">{clause.summary}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 gap-2"
                  disabled={alreadyAdded}
                  onClick={() => handleClauseInsert(clause)}
                >
                  <TextQuote className="h-4 w-4" />
                  {alreadyAdded ? "Added" : "Insert clause"}
                </Button>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
