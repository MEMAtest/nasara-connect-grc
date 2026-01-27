import type { PolicyClause } from "./templates";

export const CORE_POLICY_TEMPLATE_CLAUSES_FIN_PROMOTIONS: PolicyClause[] = [
  {
    id: "clause-finprom-purpose",
    title: "Purpose",
    summary: "Define the objectives for compliant financial promotions",
    content: "Set the firm's commitment to fair, clear, and not misleading communications across all channels.",
    category: "market",
    isMandatory: true,
    appliesTo: ["FIN_PROMOTIONS"],
  },
  {
    id: "clause-finprom-scope",
    title: "Scope & applicability",
    summary: "Define channels, products, and audiences covered",
    content: "This policy applies to all marketing materials, websites, emails, social media, and third-party promotions.",
    category: "market",
    isMandatory: true,
    appliesTo: ["FIN_PROMOTIONS"],
  },
  {
    id: "clause-finprom-approval",
    title: "Approval & sign-off",
    summary: "Set review, approval, and record keeping controls",
    content: "All promotions must be reviewed and approved by Compliance before release, with approvals logged.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["FIN_PROMOTIONS"],
  },
  {
    id: "clause-finprom-risk",
    title: "Risk warnings & disclosures",
    summary: "Define prominence and balance expectations",
    content: "Risk warnings must be prominent, balanced with benefits, and tailored to the target audience.",
    category: "customer",
    isMandatory: true,
    appliesTo: ["FIN_PROMOTIONS"],
  },
  {
    id: "clause-finprom-monitoring",
    title: "Monitoring & ongoing review",
    summary: "Define post-release monitoring and refresh cadence",
    content: "Promotions are monitored for performance and customer understanding, with periodic reviews and updates.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["FIN_PROMOTIONS"],
  },
];
