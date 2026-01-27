import type { PolicyClause } from "./templates";

export const CORE_POLICY_TEMPLATE_CLAUSES_RESPONSIBLE_LENDING: PolicyClause[] = [
  {
    id: "clause-reslend-purpose",
    title: "Purpose",
    summary: "Define responsible lending objectives",
    content: "Ensure lending decisions are fair, affordable, and aligned to customer interests.",
    category: "customer",
    isMandatory: true,
    appliesTo: ["RESPONSIBLE_LENDING"],
  },
  {
    id: "clause-reslend-affordability",
    title: "Affordability assessment",
    summary: "Define affordability criteria and evidence",
    content: "Assess income, expenditure, and sustainability before lending or broking decisions.",
    category: "customer",
    isMandatory: true,
    appliesTo: ["RESPONSIBLE_LENDING"],
  },
  {
    id: "clause-reslend-creditworthiness",
    title: "Creditworthiness & decisioning",
    summary: "Define creditworthiness checks and approvals",
    content: "Define data sources, scoring, and approval thresholds for credit decisions.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["RESPONSIBLE_LENDING"],
  },
  {
    id: "clause-reslend-vulnerability",
    title: "Vulnerability considerations",
    summary: "Embed vulnerability and forbearance triggers",
    content: "Identify vulnerable customers and adjust lending decisions accordingly.",
    category: "customer",
    isMandatory: true,
    appliesTo: ["RESPONSIBLE_LENDING"],
  },
  {
    id: "clause-reslend-monitoring",
    title: "Monitoring & governance",
    summary: "Define monitoring and MI reporting",
    content: "Monitor outcomes, default trends, and fairness indicators with board oversight.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["RESPONSIBLE_LENDING"],
  },
];
