"use client";

import { CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getApplicableClauses } from "@/lib/policies/templates";
import { renderClause } from "@/lib/policies/liquid-renderer";
import type { WizardStepProps } from "./types";

export function StepReview({ state, onBack, onNext, isSubmitting }: WizardStepProps) {
  const template = state.selectedTemplate;

  const handleExport = () => {
    if (!template) return;
    const firmContext = {
      firm: state.firmProfile,
      firm_name: state.firmProfile.name,
      permissions: state.permissions,
    };

    const clauseById = new Map(getApplicableClauses(template.code, state.permissions).map((clause) => [clause.id, clause]));

    const lines: string[] = [];
    lines.push(`# ${template.name}`);
    lines.push("");
    lines.push(`Firm: ${state.firmProfile.name}`);
    if (state.firmProfile.fcaReference) lines.push(`FCA reference: ${state.firmProfile.fcaReference}`);
    lines.push("");

    template.sections.forEach((section) => {
      lines.push(`## ${section.title}`);
      lines.push("");
      const clauseIds = state.sectionClauses[section.id] ?? section.suggestedClauses;
      clauseIds.forEach((clauseId) => {
        const clause = clauseById.get(clauseId);
        if (!clause) return;
        lines.push(`### ${clause.title}`);
        lines.push("");
        const answers = state.clauseVariables[clause.id] ?? {};
        lines.push(renderClause(clause.content, firmContext, answers).trim());
        lines.push("");
      });

      const note = state.sectionNotes[section.id];
      if (note && note.trim().length > 0) {
        lines.push(`### Firm note`);
        lines.push("");
        lines.push(note.trim());
        lines.push("");
      }
    });

    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${template.code.toLowerCase()}-draft.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Review & finalise</h2>
        <p className="text-sm text-slate-500">
          Confirm the key selections before generating the policy draft. You can still edit content after publishing to the
          policy register.
        </p>
      </div>

      <div className="space-y-4">
        <SummaryCard title="Template" description="Selected policy template">
          {template ? (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{template.category}</Badge>
              <span className="text-sm font-medium text-slate-800">{template.name}</span>
            </div>
          ) : (
            <span className="text-sm text-slate-500">No template selected</span>
          )}
        </SummaryCard>

        <SummaryCard title="Clauses" description="Clauses added to this draft">
          {state.selectedClauses.length ? (
            <ul className="space-y-1 text-sm text-slate-600">
              {state.selectedClauses.map((clause) => (
                <li key={clause.id}>• {clause.title}</li>
              ))}
            </ul>
          ) : (
            <span className="text-sm text-slate-500">No additional clauses inserted</span>
          )}
        </SummaryCard>

        <SummaryCard title="Approvals" description="Who needs to sign off">
          <ul className="space-y-1 text-sm text-slate-600">
            <li>SMF attestation: {state.approvals.requiresSMF ? state.approvals.smfRole || "SMF role to be assigned" : "Not required"}</li>
            <li>
              Board review: {state.approvals.requiresBoard ? `Yes · ${state.approvals.boardFrequency.replace('-', ' ')}` : "Not required"}
            </li>
            <li>
              Additional approvers:{" "}
              {state.approvals.additionalApprovers.length
                ? state.approvals.additionalApprovers.join(", ")
                : "None"}
            </li>
          </ul>
        </SummaryCard>
      </div>

      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-700">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Next: the policy will be generated and assigned to the approval workflow you defined.</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport} disabled={!template}>
            <Download className="h-4 w-4" />
            Export draft
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={onNext} disabled={isSubmitting}>
            {isSubmitting ? "Finishing..." : "Finish wizard"}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function SummaryCard({ title, description, children }: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      {children}
    </div>
  );
}
