import type { PolicyClause } from "./templates";

export const CORE_POLICY_TEMPLATE_CLAUSES_BEST_EXECUTION: PolicyClause[] = [
  {
    id: "clause-bestex-purpose",
    title: "Purpose",
    summary: "Define best execution objectives and scope",
    content: "Ensure client orders achieve the best possible result considering price, cost, and speed.",
    category: "market",
    isMandatory: true,
    appliesTo: ["BEST_EXECUTION"],
  },
  {
    id: "clause-bestex-factors",
    title: "Execution factors",
    summary: "Define execution factors and prioritization",
    content: "Document the relative importance of price, costs, speed, likelihood, and size for each client type.",
    category: "market",
    isMandatory: true,
    appliesTo: ["BEST_EXECUTION"],
  },
  {
    id: "clause-bestex-venues",
    title: "Execution venues & counterparties",
    summary: "Define venue selection and monitoring",
    content: "Select, monitor, and periodically review execution venues and counterparties.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["BEST_EXECUTION"],
  },
  {
    id: "clause-bestex-monitoring",
    title: "Monitoring & evidence",
    summary: "Define monitoring and evidence requirements",
    content: "Monitor execution quality and retain evidence to demonstrate compliance.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["BEST_EXECUTION"],
  },
  {
    id: "clause-bestex-governance",
    title: "Governance & review",
    summary: "Define oversight and policy review cadence",
    content: "Annual review by Compliance with board oversight and documented changes.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["BEST_EXECUTION"],
  },
];
