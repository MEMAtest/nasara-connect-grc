import { PackType } from "@/lib/authorization-pack-templates";

export type PermissionCode = "payments" | "investment" | "consumer-credit" | "insurance" | "crypto";

export interface PermissionEcosystemTemplate {
  code: PermissionCode;
  name: string;
  description: string;
  packTemplateType: PackType;
  policyTemplates: string[];
  trainingRequirements: string[];
  smcrRoles: string[];
  typicalTimelineWeeks: number;
}

export const PERMISSION_ECOSYSTEMS: PermissionEcosystemTemplate[] = [
  {
    code: "payments",
    name: "Payment Services",
    description: "Payments/EMI authorization with safeguarding and operational resilience focus.",
    packTemplateType: "payments-emi",
    policyTemplates: ["AML Policy", "Safeguarding Policy", "Complaints Policy", "Financial Promotions Policy"],
    trainingRequirements: ["AML Training", "Consumer Duty Training", "Operational Resilience Training"],
    smcrRoles: ["SMF16 (Compliance Oversight)", "SMF17 (MLRO)", "SMF1 (CEO)"],
    typicalTimelineWeeks: 14,
  },
  {
    code: "investment",
    name: "Investment Services",
    description: "Investment firm authorization covering suitability and best execution.",
    packTemplateType: "investment",
    policyTemplates: ["AML Policy", "Conflicts of Interest Policy", "Best Execution Policy"],
    trainingRequirements: ["AML Training", "Conduct Risk Training"],
    smcrRoles: ["SMF16 (Compliance Oversight)", "SMF17 (MLRO)", "SMF3 (Executive Director)"],
    typicalTimelineWeeks: 16,
  },
  {
    code: "consumer-credit",
    name: "Consumer Credit",
    description: "Consumer credit permissions with affordability and vulnerability focus.",
    packTemplateType: "consumer-credit",
    policyTemplates: ["AML Policy", "Affordability Policy", "Complaints Policy"],
    trainingRequirements: ["AML Training", "Consumer Duty Training"],
    smcrRoles: ["SMF16 (Compliance Oversight)", "SMF17 (MLRO)"],
    typicalTimelineWeeks: 12,
  },
  {
    code: "insurance",
    name: "Insurance Distribution",
    description: "Insurance distribution permissions with PROD and oversight.",
    packTemplateType: "insurance-distribution",
    policyTemplates: ["AML Policy", "PROD Policy", "Complaints Policy"],
    trainingRequirements: ["AML Training", "Insurance Conduct Training"],
    smcrRoles: ["SMF16 (Compliance Oversight)", "SMF17 (MLRO)"],
    typicalTimelineWeeks: 14,
  },
  {
    code: "crypto",
    name: "Cryptoasset Registration",
    description: "Crypto registration with AML/CTF emphasis.",
    packTemplateType: "crypto-registration",
    policyTemplates: ["AML Policy", "Sanctions Policy", "Risk Assessment Policy"],
    trainingRequirements: ["AML Training", "Cryptoasset Risk Training"],
    smcrRoles: ["SMF16 (Compliance Oversight)", "SMF17 (MLRO)"],
    typicalTimelineWeeks: 16,
  },
];
