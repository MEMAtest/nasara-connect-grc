import type { PolicyClause } from "./templates";

export const CORE_POLICY_TEMPLATE_CLAUSES_INDUCEMENTS: PolicyClause[] = [
  {
    id: "clause-inducements-purpose",
    title: "Purpose",
    summary: "Define inducements governance objectives",
    content: "Ensure inducements do not impair client outcomes or conflict with duty of care.",
    category: "market",
    isMandatory: true,
    appliesTo: ["INDUCEMENTS"],
  },
  {
    id: "clause-inducements-assessment",
    title: "Assessment",
    summary: "Define assessment of payments and benefits",
    content: "Assess inducements for suitability, independence, and conflict impact.",
    category: "market",
    isMandatory: true,
    appliesTo: ["INDUCEMENTS"],
  },
  {
    id: "clause-inducements-disclosure",
    title: "Disclosure",
    summary: "Define disclosure standards",
    content: "Disclose inducements clearly, fairly, and in a way clients can understand.",
    category: "customer",
    isMandatory: true,
    appliesTo: ["INDUCEMENTS"],
  },
  {
    id: "clause-inducements-conflicts",
    title: "Conflicts linkage",
    summary: "Define conflicts management linkage",
    content: "Record inducements in the conflicts register and apply mitigation measures.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["INDUCEMENTS"],
  },
  {
    id: "clause-inducements-monitoring",
    title: "Monitoring",
    summary: "Define ongoing monitoring and review",
    content: "Review inducements, MI, and exceptions with regular governance oversight.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["INDUCEMENTS"],
  },
];
