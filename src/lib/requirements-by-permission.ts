/**
 * FCA Requirements by Permission Type
 *
 * This module defines the regulatory requirements for each permission type,
 * including what documents are needed, evidence required, and mandatory/optional markers.
 */

import { PackType } from "./authorization-pack-templates";

export type RequirementStatus = "not_started" | "in_progress" | "complete";

export type RequirementCategory =
  | "governance"
  | "financial"
  | "operational"
  | "compliance"
  | "customer-protection"
  | "technology"
  | "aml-ctf";

export interface RequirementDocument {
  id: string;
  name: string;
  description: string;
  isMandatory: boolean;
  evidenceTypes: string[]; // e.g., ["pdf", "docx", "xlsx"]
  guidanceKey?: string; // Links to guidance-content.ts
}

export interface Requirement {
  id: string;
  title: string;
  description: string;
  category: RequirementCategory;
  isMandatory: boolean;
  fcaReference?: string; // e.g., "SUP 6.3.25"
  documents: RequirementDocument[];
  guidanceKey: string; // Links to guidance-content.ts
  order: number;
}

export interface PermissionRequirements {
  permissionType: PackType;
  permissionName: string;
  description: string;
  requirements: Requirement[];
}

// Category metadata for display
export const requirementCategories: Record<RequirementCategory, { label: string; description: string; icon: string }> = {
  governance: {
    label: "Governance & Structure",
    description: "Corporate structure, board composition, and decision-making frameworks",
    icon: "building",
  },
  financial: {
    label: "Financial Resources",
    description: "Capital adequacy, financial projections, and stress testing",
    icon: "currency",
  },
  operational: {
    label: "Operational Resilience",
    description: "Business continuity, incident management, and service delivery",
    icon: "cog",
  },
  compliance: {
    label: "Compliance Framework",
    description: "Regulatory compliance, monitoring, and reporting",
    icon: "shield",
  },
  "customer-protection": {
    label: "Customer Protection",
    description: "Customer assets, complaints handling, and consumer duty",
    icon: "users",
  },
  technology: {
    label: "Technology & Security",
    description: "IT infrastructure, cyber security, and data protection",
    icon: "server",
  },
  "aml-ctf": {
    label: "AML/CTF Controls",
    description: "Anti-money laundering and counter-terrorist financing",
    icon: "eye",
  },
};

// Payments/EMI Requirements
const paymentsRequirements: Requirement[] = [
  // Governance
  {
    id: "gov-1",
    title: "Corporate Structure & Ownership",
    description: "Document your legal structure, ownership hierarchy, and group relationships",
    category: "governance",
    isMandatory: true,
    fcaReference: "SUP 6.3.7",
    guidanceKey: "corporate-structure",
    order: 1,
    documents: [
      {
        id: "gov-1-1",
        name: "Group structure chart",
        description: "Diagram showing ownership hierarchy and legal entities",
        isMandatory: true,
        evidenceTypes: ["pdf", "png", "pptx"],
      },
      {
        id: "gov-1-2",
        name: "Shareholder register",
        description: "List of shareholders with ownership percentages",
        isMandatory: true,
        evidenceTypes: ["pdf", "xlsx"],
      },
      {
        id: "gov-1-3",
        name: "Articles of association",
        description: "Company constitutional documents",
        isMandatory: true,
        evidenceTypes: ["pdf"],
      },
    ],
  },
  {
    id: "gov-2",
    title: "Board Composition & Responsibilities",
    description: "Define board structure, roles, and oversight responsibilities",
    category: "governance",
    isMandatory: true,
    fcaReference: "SYSC 4.3A",
    guidanceKey: "board-composition",
    order: 2,
    documents: [
      {
        id: "gov-2-1",
        name: "Board terms of reference",
        description: "Board responsibilities and decision-making authority",
        isMandatory: true,
        evidenceTypes: ["pdf", "docx"],
      },
      {
        id: "gov-2-2",
        name: "Board CVs and fitness assessments",
        description: "Director biographies and competency assessments",
        isMandatory: true,
        evidenceTypes: ["pdf"],
      },
      {
        id: "gov-2-3",
        name: "Committee terms of reference",
        description: "Risk, audit, and other committee charters",
        isMandatory: false,
        evidenceTypes: ["pdf", "docx"],
      },
    ],
  },
  {
    id: "gov-3",
    title: "Mind & Management in UK",
    description: "Demonstrate that key decisions and control are exercised from the UK",
    category: "governance",
    isMandatory: true,
    fcaReference: "COND 2.2",
    guidanceKey: "mind-management",
    order: 3,
    documents: [
      {
        id: "gov-3-1",
        name: "Decision authority matrix",
        description: "Map of where decisions are made and by whom",
        isMandatory: true,
        evidenceTypes: ["pdf", "xlsx"],
      },
      {
        id: "gov-3-2",
        name: "Key personnel locations",
        description: "Evidence of UK-based senior management",
        isMandatory: true,
        evidenceTypes: ["pdf"],
      },
    ],
  },
  {
    id: "gov-4",
    title: "SMCR Allocation",
    description: "Senior Managers and Certification Regime role allocations",
    category: "governance",
    isMandatory: true,
    fcaReference: "SYSC 24/25/26",
    guidanceKey: "smcr-allocation",
    order: 4,
    documents: [
      {
        id: "gov-4-1",
        name: "Responsibilities map",
        description: "SMF role allocations and prescribed responsibilities",
        isMandatory: true,
        evidenceTypes: ["pdf", "xlsx"],
      },
      {
        id: "gov-4-2",
        name: "Statements of responsibilities",
        description: "Individual SoRs for each Senior Manager",
        isMandatory: true,
        evidenceTypes: ["pdf"],
      },
    ],
  },

  // Financial
  {
    id: "fin-1",
    title: "Capital Requirements",
    description: "Demonstrate adequate capital resources meeting FCA requirements",
    category: "financial",
    isMandatory: true,
    fcaReference: "MIPRU 4.2",
    guidanceKey: "capital-requirements",
    order: 5,
    documents: [
      {
        id: "fin-1-1",
        name: "Capital adequacy calculation",
        description: "Own funds calculation and regulatory capital requirement",
        isMandatory: true,
        evidenceTypes: ["pdf", "xlsx"],
      },
      {
        id: "fin-1-2",
        name: "Bank statements",
        description: "Evidence of available capital",
        isMandatory: true,
        evidenceTypes: ["pdf"],
      },
    ],
  },
  {
    id: "fin-2",
    title: "Financial Projections",
    description: "Three-year financial forecasts with assumptions",
    category: "financial",
    isMandatory: true,
    fcaReference: "SUP 6 Annex 4",
    guidanceKey: "financial-projections",
    order: 6,
    documents: [
      {
        id: "fin-2-1",
        name: "Three-year financial model",
        description: "P&L, balance sheet, and cash flow projections",
        isMandatory: true,
        evidenceTypes: ["xlsx", "pdf"],
      },
      {
        id: "fin-2-2",
        name: "Key assumptions document",
        description: "Documented assumptions underlying projections",
        isMandatory: true,
        evidenceTypes: ["pdf", "docx"],
      },
    ],
  },
  {
    id: "fin-3",
    title: "Wind-Down Planning",
    description: "Orderly wind-down plan with funding and timeline",
    category: "financial",
    isMandatory: true,
    fcaReference: "COND 2.4",
    guidanceKey: "wind-down-planning",
    order: 7,
    documents: [
      {
        id: "fin-3-1",
        name: "Wind-down plan",
        description: "Step-by-step wind-down execution plan",
        isMandatory: true,
        evidenceTypes: ["pdf", "docx"],
      },
      {
        id: "fin-3-2",
        name: "Wind-down cost model",
        description: "Costed wind-down with funding sources",
        isMandatory: true,
        evidenceTypes: ["xlsx", "pdf"],
      },
    ],
  },

  // Operational
  {
    id: "ops-1",
    title: "Business Model",
    description: "Clear description of services, customers, and revenue model",
    category: "operational",
    isMandatory: true,
    fcaReference: "COND 2.3",
    guidanceKey: "business-model",
    order: 8,
    documents: [
      {
        id: "ops-1-1",
        name: "Business plan narrative",
        description: "Comprehensive business plan document",
        isMandatory: true,
        evidenceTypes: ["pdf", "docx"],
      },
      {
        id: "ops-1-2",
        name: "Product descriptions",
        description: "Detailed service and product specifications",
        isMandatory: true,
        evidenceTypes: ["pdf"],
      },
    ],
  },
  {
    id: "ops-2",
    title: "Operational Resilience",
    description: "Important business services, impact tolerances, and recovery plans",
    category: "operational",
    isMandatory: true,
    fcaReference: "SYSC 15A",
    guidanceKey: "operational-resilience",
    order: 9,
    documents: [
      {
        id: "ops-2-1",
        name: "Important business services register",
        description: "IBS identification and impact tolerances",
        isMandatory: true,
        evidenceTypes: ["pdf", "xlsx"],
      },
      {
        id: "ops-2-2",
        name: "Business continuity plan",
        description: "BCP with recovery procedures",
        isMandatory: true,
        evidenceTypes: ["pdf", "docx"],
      },
    ],
  },
  {
    id: "ops-3",
    title: "Outsourcing Arrangements",
    description: "Third-party risk management and critical outsourcing oversight",
    category: "operational",
    isMandatory: true,
    fcaReference: "SYSC 8.1",
    guidanceKey: "outsourcing-arrangements",
    order: 10,
    documents: [
      {
        id: "ops-3-1",
        name: "Outsourcing policy",
        description: "Framework for managing outsourced activities",
        isMandatory: true,
        evidenceTypes: ["pdf", "docx"],
      },
      {
        id: "ops-3-2",
        name: "Critical vendor register",
        description: "List of critical service providers with risk assessments",
        isMandatory: true,
        evidenceTypes: ["pdf", "xlsx"],
      },
    ],
  },

  // Compliance
  {
    id: "comp-1",
    title: "Compliance Monitoring Programme",
    description: "Risk-based compliance monitoring and testing schedule",
    category: "compliance",
    isMandatory: true,
    fcaReference: "SYSC 6.1",
    guidanceKey: "compliance-monitoring",
    order: 11,
    documents: [
      {
        id: "comp-1-1",
        name: "Compliance monitoring plan",
        description: "Annual monitoring programme and methodology",
        isMandatory: true,
        evidenceTypes: ["pdf", "docx"],
      },
      {
        id: "comp-1-2",
        name: "Compliance risk assessment",
        description: "Risk-based prioritisation of monitoring activities",
        isMandatory: true,
        evidenceTypes: ["pdf", "xlsx"],
      },
    ],
  },
  {
    id: "comp-2",
    title: "Risk Management Framework",
    description: "Enterprise risk management approach and controls",
    category: "compliance",
    isMandatory: true,
    fcaReference: "SYSC 7.1",
    guidanceKey: "risk-management",
    order: 12,
    documents: [
      {
        id: "comp-2-1",
        name: "Risk management policy",
        description: "Risk appetite, governance, and escalation procedures",
        isMandatory: true,
        evidenceTypes: ["pdf", "docx"],
      },
      {
        id: "comp-2-2",
        name: "Risk register",
        description: "Documented risks with controls and owners",
        isMandatory: true,
        evidenceTypes: ["pdf", "xlsx"],
      },
    ],
  },
  {
    id: "comp-3",
    title: "Regulatory Reporting",
    description: "FCA reporting obligations and submission processes",
    category: "compliance",
    isMandatory: true,
    fcaReference: "SUP 16",
    guidanceKey: "regulatory-reporting",
    order: 13,
    documents: [
      {
        id: "comp-3-1",
        name: "Regulatory reporting calendar",
        description: "Schedule of FCA reporting obligations",
        isMandatory: true,
        evidenceTypes: ["pdf", "xlsx"],
      },
      {
        id: "comp-3-2",
        name: "Data quality procedures",
        description: "Controls for accurate regulatory reporting",
        isMandatory: false,
        evidenceTypes: ["pdf", "docx"],
      },
    ],
  },

  // Customer Protection
  {
    id: "cust-1",
    title: "Safeguarding Arrangements",
    description: "Client money protection and segregation",
    category: "customer-protection",
    isMandatory: true,
    fcaReference: "PSR 2017 Reg 23",
    guidanceKey: "safeguarding",
    order: 14,
    documents: [
      {
        id: "cust-1-1",
        name: "Safeguarding policy",
        description: "Client money segregation and protection approach",
        isMandatory: true,
        evidenceTypes: ["pdf", "docx"],
      },
      {
        id: "cust-1-2",
        name: "Safeguarding account confirmation",
        description: "Bank confirmation of safeguarding account setup",
        isMandatory: true,
        evidenceTypes: ["pdf"],
      },
      {
        id: "cust-1-3",
        name: "Reconciliation procedures",
        description: "Daily reconciliation process and controls",
        isMandatory: true,
        evidenceTypes: ["pdf", "docx"],
      },
    ],
  },
  {
    id: "cust-2",
    title: "Consumer Duty",
    description: "Framework for delivering good customer outcomes",
    category: "customer-protection",
    isMandatory: true,
    fcaReference: "PRIN 12",
    guidanceKey: "consumer-duty",
    order: 15,
    documents: [
      {
        id: "cust-2-1",
        name: "Consumer Duty implementation plan",
        description: "Approach to four outcomes and monitoring",
        isMandatory: true,
        evidenceTypes: ["pdf", "docx"],
      },
      {
        id: "cust-2-2",
        name: "Value assessment",
        description: "Price and value outcome documentation",
        isMandatory: true,
        evidenceTypes: ["pdf"],
      },
    ],
  },
  {
    id: "cust-3",
    title: "Complaints Handling",
    description: "Customer complaints process and root cause analysis",
    category: "customer-protection",
    isMandatory: true,
    fcaReference: "DISP 1.3",
    guidanceKey: "complaints-handling",
    order: 16,
    documents: [
      {
        id: "cust-3-1",
        name: "Complaints handling policy",
        description: "End-to-end complaints process",
        isMandatory: true,
        evidenceTypes: ["pdf", "docx"],
      },
      {
        id: "cust-3-2",
        name: "Root cause analysis framework",
        description: "Approach to learning from complaints",
        isMandatory: false,
        evidenceTypes: ["pdf", "docx"],
      },
    ],
  },

  // Technology
  {
    id: "tech-1",
    title: "IT Systems & Architecture",
    description: "Technology infrastructure supporting payment services",
    category: "technology",
    isMandatory: true,
    fcaReference: "SYSC 3.2",
    guidanceKey: "it-systems",
    order: 17,
    documents: [
      {
        id: "tech-1-1",
        name: "System architecture diagram",
        description: "Technical architecture and data flows",
        isMandatory: true,
        evidenceTypes: ["pdf", "png", "pptx"],
      },
      {
        id: "tech-1-2",
        name: "IT controls documentation",
        description: "Access controls, change management, and monitoring",
        isMandatory: true,
        evidenceTypes: ["pdf", "docx"],
      },
    ],
  },
  {
    id: "tech-2",
    title: "Cyber Security",
    description: "Information security controls and incident response",
    category: "technology",
    isMandatory: true,
    fcaReference: "PSR 2017 Reg 98",
    guidanceKey: "cyber-security",
    order: 18,
    documents: [
      {
        id: "tech-2-1",
        name: "Information security policy",
        description: "Security framework and controls",
        isMandatory: true,
        evidenceTypes: ["pdf", "docx"],
      },
      {
        id: "tech-2-2",
        name: "Incident response plan",
        description: "Cyber incident detection and response procedures",
        isMandatory: true,
        evidenceTypes: ["pdf", "docx"],
      },
      {
        id: "tech-2-3",
        name: "Penetration test report",
        description: "Recent security testing results",
        isMandatory: false,
        evidenceTypes: ["pdf"],
      },
    ],
  },

  // AML/CTF
  {
    id: "aml-1",
    title: "AML/CTF Framework",
    description: "Risk-based approach to preventing money laundering",
    category: "aml-ctf",
    isMandatory: true,
    fcaReference: "MLR 2017",
    guidanceKey: "aml-framework",
    order: 19,
    documents: [
      {
        id: "aml-1-1",
        name: "AML/CTF policy",
        description: "Risk-based AML programme and procedures",
        isMandatory: true,
        evidenceTypes: ["pdf", "docx"],
      },
      {
        id: "aml-1-2",
        name: "Business-wide risk assessment",
        description: "ML/TF risk assessment for the business",
        isMandatory: true,
        evidenceTypes: ["pdf", "xlsx"],
      },
    ],
  },
  {
    id: "aml-2",
    title: "Customer Due Diligence",
    description: "KYC procedures and ongoing monitoring",
    category: "aml-ctf",
    isMandatory: true,
    fcaReference: "MLR 2017 Reg 28",
    guidanceKey: "customer-due-diligence",
    order: 20,
    documents: [
      {
        id: "aml-2-1",
        name: "CDD procedures",
        description: "Customer identification and verification processes",
        isMandatory: true,
        evidenceTypes: ["pdf", "docx"],
      },
      {
        id: "aml-2-2",
        name: "Customer risk scoring methodology",
        description: "Risk-based customer categorisation",
        isMandatory: true,
        evidenceTypes: ["pdf", "xlsx"],
      },
    ],
  },
  {
    id: "aml-3",
    title: "Transaction Monitoring",
    description: "Detection systems and suspicious activity reporting",
    category: "aml-ctf",
    isMandatory: true,
    fcaReference: "MLR 2017 Reg 35",
    guidanceKey: "transaction-monitoring",
    order: 21,
    documents: [
      {
        id: "aml-3-1",
        name: "Transaction monitoring rules",
        description: "Detection rules and thresholds",
        isMandatory: true,
        evidenceTypes: ["pdf", "xlsx"],
      },
      {
        id: "aml-3-2",
        name: "SAR procedures",
        description: "Suspicious activity reporting process",
        isMandatory: true,
        evidenceTypes: ["pdf", "docx"],
      },
    ],
  },
  {
    id: "aml-4",
    title: "MLRO Appointment",
    description: "Money Laundering Reporting Officer nomination",
    category: "aml-ctf",
    isMandatory: true,
    fcaReference: "SYSC 6.3.9",
    guidanceKey: "mlro-appointment",
    order: 22,
    documents: [
      {
        id: "aml-4-1",
        name: "MLRO appointment letter",
        description: "Formal MLRO appointment and responsibilities",
        isMandatory: true,
        evidenceTypes: ["pdf"],
      },
      {
        id: "aml-4-2",
        name: "MLRO competency assessment",
        description: "Evidence of MLRO fitness and competency",
        isMandatory: true,
        evidenceTypes: ["pdf"],
      },
    ],
  },
];

// Permission requirements registry
export const requirementsByPermission: Record<PackType, PermissionRequirements> = {
  "payments-emi": {
    permissionType: "payments-emi",
    permissionName: "Payments / E-Money Institution",
    description: "Requirements for firms seeking authorization as a Payment Institution or E-Money Institution under PSR 2017 / EMR 2011",
    requirements: paymentsRequirements,
  },
  investment: {
    permissionType: "investment",
    permissionName: "Investment Firm",
    description: "Requirements for firms seeking authorization to conduct investment business",
    requirements: [], // To be populated
  },
  "consumer-credit": {
    permissionType: "consumer-credit",
    permissionName: "Consumer Credit",
    description: "Requirements for firms seeking consumer credit authorization",
    requirements: [], // To be populated
  },
  "insurance-distribution": {
    permissionType: "insurance-distribution",
    permissionName: "Insurance Distribution",
    description: "Requirements for firms seeking insurance distribution authorization",
    requirements: [], // To be populated
  },
  "crypto-registration": {
    permissionType: "crypto-registration",
    permissionName: "Cryptoasset Registration",
    description: "Requirements for cryptoasset firms seeking FCA registration",
    requirements: [], // To be populated
  },
};

// Helper functions
export function getRequirementsForPermission(permissionType: PackType): Requirement[] {
  return requirementsByPermission[permissionType]?.requirements || [];
}

export function getRequirementById(permissionType: PackType, requirementId: string): Requirement | undefined {
  const requirements = getRequirementsForPermission(permissionType);
  return requirements.find((r) => r.id === requirementId);
}

export function getRequirementsByCategory(permissionType: PackType, category: RequirementCategory): Requirement[] {
  const requirements = getRequirementsForPermission(permissionType);
  return requirements.filter((r) => r.category === category);
}

export function getMandatoryRequirements(permissionType: PackType): Requirement[] {
  const requirements = getRequirementsForPermission(permissionType);
  return requirements.filter((r) => r.isMandatory);
}

export function getOptionalRequirements(permissionType: PackType): Requirement[] {
  const requirements = getRequirementsForPermission(permissionType);
  return requirements.filter((r) => !r.isMandatory);
}

export function countMandatoryDocuments(permissionType: PackType): number {
  const requirements = getRequirementsForPermission(permissionType);
  return requirements.reduce((count, req) => {
    return count + (req.documents?.filter((d) => d.isMandatory).length ?? 0);
  }, 0);
}
