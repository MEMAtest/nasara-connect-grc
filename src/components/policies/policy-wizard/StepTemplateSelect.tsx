"use client";

import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { WizardStepProps } from "./types";
import { getRequiredPolicies } from "@/lib/policies";
import { POLICY_TEMPLATES, getApplicableClauses, getTemplateByCode } from "@/lib/policies/templates";
import { assembleComplaintsPolicy, DEFAULT_COMPLAINTS_ANSWERS } from "@/lib/policies/assemblers/complaints";

export function StepTemplateSelect({ state, updateState, onNext, onBack }: WizardStepProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const requiredPolicies = useMemo(
    () => new Set(getRequiredPolicies(state.permissions).map((policy) => policy.code)),
    [state.permissions],
  );

  const filteredTemplates = useMemo(() => {
    if (!searchTerm.trim()) {
      return POLICY_TEMPLATES;
    }
    const term = searchTerm.toLowerCase();
    return POLICY_TEMPLATES.filter((template) =>
      [template.name, template.description, template.code].some((value) => value.toLowerCase().includes(term)),
    );
  }, [searchTerm]);

  const handleSelect = (code: string) => {
    const template = getTemplateByCode(code);
    if (template) {
      const applicableClauses = getApplicableClauses(template.code, state.permissions);
      const complaintsAnswers = state.complaintsAnswers ?? DEFAULT_COMPLAINTS_ANSWERS;
      const initialSectionClauses =
        template.code === "COMPLAINTS"
          ? assembleComplaintsPolicy(template, complaintsAnswers).sectionClauses
          : template.sections.reduce<Record<string, string[]>>((acc, section) => {
              acc[section.id] = [...section.suggestedClauses];
              return acc;
            }, {});

      const clauseIds = Array.from(new Set(Object.values(initialSectionClauses).flatMap((ids) => ids)));
      const selectedClauses = clauseIds
        .map((id) => applicableClauses.find((clause) => clause.id === id))
        .filter((clause): clause is NonNullable<typeof clause> => Boolean(clause));

      updateState((current) => ({
        ...current,
        selectedTemplate: template,
        complaintsAnswers,
        sectionClauses: initialSectionClauses,
        sectionNotes: {},
        clauseVariables: {},
        selectedClauses,
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Choose a policy template</h2>
        <p className="text-sm text-slate-500">
          Start from one of our FCA-aligned templates. You can customise the content, clauses, and approvals in the
          subsequent steps.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search policy templates"
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>
            Required: <strong>{requiredPolicies.size}</strong>
          </span>
          <span>
            Available templates: <strong>{POLICY_TEMPLATES.length}</strong>
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredTemplates.map((template) => {
          const isSelected = state.selectedTemplate?.code === template.code;
          const isRequired = requiredPolicies.has(template.code);
          return (
            <button
              key={template.code}
              type="button"
              onClick={() => handleSelect(template.code)}
              className={`group flex flex-col items-start gap-3 rounded-2xl border p-5 text-left transition shadow-sm ${
                isSelected
                  ? "border-indigo-400 bg-indigo-50"
                  : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/40"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{template.name}</p>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{template.category}</p>
                </div>
                {isRequired ? (
                  <Badge variant="destructive" className="text-[11px]">Mandatory</Badge>
                ) : (
                  <Badge variant="secondary" className="text-[11px]">Optional</Badge>
                )}
              </div>
              <p className="text-sm text-slate-500">{template.description}</p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                {template.sections.map((section) => (
                  <span key={section.id} className="rounded-full bg-slate-100 px-2 py-1">
                    {section.title}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          onClick={onNext}
          disabled={!state.selectedTemplate}
        >
          <Sparkles className="h-4 w-4" />
          Continue
        </Button>
      </div>
    </div>
  );
}
