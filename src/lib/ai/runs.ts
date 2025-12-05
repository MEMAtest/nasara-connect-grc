import type { Run } from "@/lib/policies/types";
import { mockCmpControls } from "@/data/cmp/mock-data";

// Lightweight in-memory placeholder: extend to DB when run-store is available.
const mockRuns: Run[] = [
  {
    id: "run-demo-aml",
    firm_id: "demo-firm",
    policy_id: "AML_CTF",
    title: "AML/CTF Policy Draft",
    status: "draft",
    answers: {
      firm_role: "principal",
      pep_domestic: true,
      client_types: ["retail", "professional"],
      onboarding_channels: ["online", "branch"],
      risk_score: 18,
    },
    selected_clause_codes: ["clause-aml-bra"],
    variables: {
      approver_role: "SMF17",
      review_frequency: "annual",
    },
    outputs: {},
    version: 1,
    created_by: "demo-user",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "run-demo-consumer-duty",
    firm_id: "demo-firm",
    policy_id: "VULNERABLE_CUST",
    title: "Consumer Duty Playbook",
    status: "draft",
    answers: {
      duty_outcomes: ["Products & Services", "Consumer Understanding"],
      vulnerability_flags: true,
      suitability_review: "quarterly",
    },
    selected_clause_codes: ["clause-vc-flags", "clause-vc-adjustments"],
    variables: {
      outcome_owner: "Head of Advice QA",
      training_due: "2025-06-30",
    },
    outputs: {},
    version: 1,
    created_by: "demo-user",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function getRunById(runId: string): Run | null {
  const run = mockRuns.find((r) => r.id === runId);
  return run ? structuredClone(run) : null;
}

export function getRunsForFirm(firmId: string): Run[] {
  return mockRuns.filter((r) => r.firm_id === firmId).map((r) => structuredClone(r));
}

export function summarizeRun(run: Run): string {
  const clauses = run.selected_clause_codes?.join(", ") || "None";
  const answers = Object.entries(run.answers)
    .slice(0, 6)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(",") : String(v)}`)
    .join("; ");
  const variables = Object.entries(run.variables || {})
    .slice(0, 6)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(",") : String(v)}`)
    .join("; ");
  return [
    `Run: ${run.title} (${run.policy_id})`,
    `Status: ${run.status} | Version: ${run.version}`,
    `Selected clauses: ${clauses}`,
    `Key answers: ${answers || "N/A"}`,
    `Variables: ${variables || "N/A"}`,
  ].join("\n");
}
