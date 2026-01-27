import type { PolicyClause } from "./templates";

export const CORE_POLICY_TEMPLATE_CLAUSES_CASS_RESOLUTION: PolicyClause[] = [
  {
    id: "clause-cassrp-purpose",
    title: "Purpose",
    summary: "Define CASS resolution pack objectives",
    content: "Enable timely return of client assets in an insolvency scenario.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["CASS_RESOLUTION"],
  },
  {
    id: "clause-cassrp-pack",
    title: "Resolution pack content",
    summary: "Define required pack documents",
    content: "Maintain key documents, account lists, and contact details in the CASS pack.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["CASS_RESOLUTION"],
  },
  {
    id: "clause-cassrp-data",
    title: "Data integrity",
    summary: "Define data quality and inventory",
    content: "Ensure data is accurate, complete, and retrievable for resolution needs.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["CASS_RESOLUTION"],
  },
  {
    id: "clause-cassrp-testing",
    title: "Testing & updates",
    summary: "Define testing and update cadence",
    content: "Test the pack regularly and update after material changes or incidents.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["CASS_RESOLUTION"],
  },
  {
    id: "clause-cassrp-governance",
    title: "Governance & review",
    summary: "Define ownership and review cadence",
    content: "Assign ownership and governance sign-off for pack maintenance.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["CASS_RESOLUTION"],
  },
];
