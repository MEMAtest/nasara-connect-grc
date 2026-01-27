import type { PolicyClause } from "./templates";

export const CORE_POLICY_TEMPLATE_CLAUSES_MARKET_ABUSE: PolicyClause[] = [
  {
    id: "clause-mabuse-purpose",
    title: "Purpose",
    summary: "Define market abuse prevention objectives",
    content: "Prevent insider dealing, unlawful disclosure, and market manipulation.",
    category: "market",
    isMandatory: true,
    appliesTo: ["MARKET_ABUSE"],
  },
  {
    id: "clause-mabuse-inside",
    title: "Inside information",
    summary: "Define inside information handling",
    content: "Identify inside information, maintain insider lists, and control access.",
    category: "market",
    isMandatory: true,
    appliesTo: ["MARKET_ABUSE"],
  },
  {
    id: "clause-mabuse-pad",
    title: "Personal account dealing",
    summary: "Define PAD controls and approvals",
    content: "Set pre-clearance, restricted lists, and conflicts management for staff trading.",
    category: "market",
    isMandatory: true,
    appliesTo: ["MARKET_ABUSE"],
  },
  {
    id: "clause-mabuse-surveillance",
    title: "Surveillance & monitoring",
    summary: "Define surveillance and alert reviews",
    content: "Implement trade surveillance, alerts, and escalation for suspicious activity.",
    category: "market",
    isMandatory: true,
    appliesTo: ["MARKET_ABUSE"],
  },
  {
    id: "clause-mabuse-reporting",
    title: "Reporting",
    summary: "Define STOR reporting",
    content: "Escalate and submit suspicious transaction and order reports as required.",
    category: "market",
    isMandatory: true,
    appliesTo: ["MARKET_ABUSE"],
  },
];
