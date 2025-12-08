import { mockCmpControls } from "@/data/cmp/mock-data";
import { POLICY_TEMPLATE_CLAUSES, POLICY_TEMPLATES } from "@/lib/policies/templates";
import { getRunById, summarizeRun } from "@/lib/ai/runs";
import type { StoredPolicy } from "@/lib/server/policy-store";

export type AssistantCitation = { type: "cmp" | "policy" | "clause" | "run"; label: string };

export type AssistantContextResult = {
  text: string;
  citations: AssistantCitation[];
};

function scoreTextMatch(text: string, query: string): number {
  const haystack = text.toLowerCase();
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);
  if (terms.length === 0) return 0;
  return terms.reduce((score, term) => (haystack.includes(term) ? score + 1 : score), 0);
}

function summarizeControl(control: (typeof mockCmpControls)[number]): string {
  const refs = control.regulatoryReferences?.join(", ") || "N/A";
  const findings = control.findings?.length ?? 0;
  const issues = control.issuesOpen ?? control.findings?.filter((f) => f.status !== "closed").length ?? 0;
  return [
    `ID: ${control.id} — ${control.title}`,
    `Objective: ${control.objective}`,
    `Duty Outcome: ${control.dutyOutcome}; Status: ${control.status} (${control.ragStatus}); Pass rate: ${Math.round(
      (control.passRate ?? 0) * 100
    )}%`,
    `Reg refs: ${refs}`,
    `Open issues/findings: ${issues}; Tests executed: ${control.testsExecuted ?? control.executions?.length ?? 0}`,
  ].join("\n");
}

function summarizeClause(clause: (typeof POLICY_TEMPLATE_CLAUSES)[number]): string {
  return [
    `Clause: ${clause.title} (${clause.id})`,
    `Category: ${clause.category}${clause.isMandatory ? " (mandatory)" : ""}`,
    `Summary: ${clause.summary}`,
    `Content: ${clause.content}`,
  ].join("\n");
}

function summarizeTemplate(template: (typeof POLICY_TEMPLATES)[number] | StoredPolicy): string {
  const sections = template.sections
    .map((s) => `- ${s.title}: ${s.summary}`)
    .join("\n");
  return [
    `Template: ${template.name} (${template.code})`,
    `Description: ${template.description}`,
    `Sections:\n${sections}`,
  ].join("\n");
}

function summarizeStoredClauses(policy?: StoredPolicy): string[] {
  if (!policy?.clauses?.length) return [];
  return policy.clauses.slice(0, 5).map((clause) => {
    return [
      `Clause: ${clause.title} (${clause.id})`,
      `Summary: ${clause.summary ?? clause.body_md?.slice(0, 160) ?? ""}`,
      `Mandatory: ${clause.isMandatory ? "yes" : "no"}`,
    ].join("\n");
  });
}

/**
 * Build lightweight contextual grounding from CMP controls based on the user query/selection.
 */
export function buildAssistantContext(
  query: string,
  selection?: string,
  policyCode?: string,
  runId?: string,
  storedPolicy?: StoredPolicy
): AssistantContextResult {
  const searchText = [query, selection, policyCode, runId].filter(Boolean).join(" ");
  if (!searchText.trim()) return { text: "", citations: [] };

  const ranked = mockCmpControls
    .map((control) => {
      const text = `${control.title} ${control.objective} ${control.regulatoryReferences?.join(" ") ?? ""} ${control.dutyOutcome ?? ""}`;
      return { control, score: scoreTextMatch(text, searchText) };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const clauseHits = POLICY_TEMPLATE_CLAUSES.map((clause) => {
    const text = `${clause.title} ${clause.summary} ${clause.content}`;
    return { clause, score: scoreTextMatch(text, searchText) };
  })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const templateHits = POLICY_TEMPLATES.map((tpl) => {
    const text = `${tpl.name} ${tpl.description} ${tpl.code} ${tpl.sections.map((s) => s.summary).join(" ")}`;
    const baseScore = scoreTextMatch(text, searchText);
    const policyMatchBoost =
      (policyCode && tpl.code.toLowerCase() === policyCode.toLowerCase() ? 2 : 0) ||
      (storedPolicy && tpl.code.toLowerCase() === storedPolicy.code.toLowerCase() ? 2 : 0);
    return { tpl, score: baseScore + policyMatchBoost };
  })
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  const sections: string[] = [];
  const citations: AssistantCitation[] = [];
  if (ranked.length > 0) {
    sections.push(`Relevant CMP controls:\n\n${ranked.map((item) => summarizeControl(item.control)).join("\n\n")}`);
    citations.push(
      ...ranked.map((item) => ({
        type: "cmp" as const,
        label: item.control.id,
      }))
    );
  }
  if (templateHits.length > 0) {
    sections.push(`Policy templates:\n\n${templateHits.map((item) => summarizeTemplate(item.tpl)).join("\n\n")}`);
    citations.push(
      ...templateHits.map((item) => ({
        type: "policy" as const,
        label: item.tpl.code,
      }))
    );
  }
  if (storedPolicy) {
    const clauseSummaries = summarizeStoredClauses(storedPolicy);
    if (clauseSummaries.length) {
      sections.push(`Policy clauses (stored):\n\n${clauseSummaries.join("\n\n")}`);
      citations.push(
        ...storedPolicy.clauses.slice(0, 5).map((clause) => ({
          type: "clause" as const,
          label: clause.id,
        }))
      );
    }
  }
  if (clauseHits.length > 0) {
    sections.push(`Policy clauses:\n\n${clauseHits.map((item) => summarizeClause(item.clause)).join("\n\n")}`);
    citations.push(
      ...clauseHits.map((item) => ({
        type: "clause" as const,
        label: item.clause.id,
      }))
    );
  }
  if (runId) {
    const run = getRunById(runId);
    if (run) {
      sections.push(`Run context:\n\n${summarizeRun(run)}`);
      citations.push({ type: "run", label: run.id });
    }
  }

  return { text: sections.join("\n\n"), citations };
}
