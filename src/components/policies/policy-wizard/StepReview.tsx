"use client";

import { CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getApplicableClauses } from "@/lib/policies/templates";
import { assembleComplaintsPolicy, DEFAULT_COMPLAINTS_ANSWERS } from "@/lib/policies/assemblers/complaints";
import { renderClause } from "@/lib/policies/liquid-renderer";
import type { WizardStepProps } from "./types";

export function StepReview({ state, onBack, onNext, isSubmitting }: WizardStepProps) {
  const template = state.selectedTemplate;
  const complaintsAnswers = state.complaintsAnswers ?? DEFAULT_COMPLAINTS_ANSWERS;
  const complaintsAssembly = template?.code === "COMPLAINTS" ? assembleComplaintsPolicy(template, complaintsAnswers) : null;
  const complaintsModules = complaintsAssembly?.modules ?? [];

  const handleExport = () => {
    if (!template) return;
    const firmContext: Record<string, any> = { // eslint-disable-line @typescript-eslint/no-explicit-any
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

        <SummaryCard title="Modules" description="Assembled policy modules">
          {complaintsModules.length ? (
            <div className="space-y-3">
              {complaintsModules.slice(0, 6).map((module) => (
                <div key={module.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{module.title}</p>
                      <p className="text-xs text-slate-500">{module.summary}</p>
                    </div>
                    <Badge variant="outline" className="text-[11px]">
                      {module.kind === "static" ? "Static" : "Dynamic"}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                    {module.reasons.map((reason) => (
                      <span key={`${module.id}-${reason}`} className="rounded-full bg-white px-2 py-1">
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {complaintsModules.length > 6 ? (
                <p className="text-xs text-slate-400">+ {complaintsModules.length - 6} more modules</p>
              ) : null}
            </div>
          ) : (
            <span className="text-sm text-slate-500">Modules will appear once a template is selected.</span>
          )}
        </SummaryCard>

        {template?.code === "COMPLAINTS" ? (
          <SummaryCard title="Assembler inputs" description="Key answers driving the complaints policy">
            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-slate-100 px-2 py-1">Depth: {complaintsAnswers.detailLevel}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1">Jurisdiction: {complaintsAnswers.jurisdiction}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1">
                Rails: {complaintsAnswers.paymentRails.map((rail) => rail.toUpperCase()).join(", ")}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1">ID: {complaintsAnswers.idMethod}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1">Oversight: {complaintsAnswers.oversight}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1">
                Vulnerability: {complaintsAnswers.vulnerabilityFocus}
              </span>
            </div>
          </SummaryCard>
        ) : null}

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
