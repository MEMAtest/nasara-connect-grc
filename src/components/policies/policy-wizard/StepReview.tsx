"use client";

import { CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WizardStepProps } from "./types";

export function StepReview({ state, onBack, onNext, isSubmitting }: WizardStepProps) {
  const template = state.selectedTemplate;

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
          <Button variant="outline" className="gap-2">
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
