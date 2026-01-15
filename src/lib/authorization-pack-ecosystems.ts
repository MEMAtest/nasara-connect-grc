import { PackType } from "@/lib/authorization-pack-templates";

export type PermissionCode = "payments" | "investments" | "consumer-credit" | "insurance" | "crypto";

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
    description: "Payment Institution / EMI permissions under PSR 2017 with safeguarding, consumer duty, and operational resilience.",
    packTemplateType: "payments-emi",
    policyTemplates: [
      "AML_CTF",
      "SAFEGUARDING",
      "COMPLAINTS",
      "FIN_PROMOTIONS",
      "CONSUMER_DUTY",
      "VULNERABLE_CUST",
      "BCP_RESILIENCE",
      "RISK_MGMT"
    ],
    trainingRequirements: [
      "aml-training",
      "kyc-fundamentals",
      "sanctions-training",
      "peps-training",
      "sars-training",
      "payments-regulation",
      "consumer-duty-training",
      "vulnerable-customers",
      "complaints-handling",
      "operational-resilience-framework",
      "financial-promotions",
      "outsourcing-third-party",
      "smcr-training"
    ],
    smcrRoles: ["SMF16", "SMF17", "SMF29"],
    typicalTimelineWeeks: 14,
  },
  {
    code: "investments",
    name: "Investment Services",
    description: "MiFID-style investment permissions covering suitability, conflicts, and best execution.",
    packTemplateType: "investment",
    policyTemplates: [
      "AML_CTF",
      "CONFLICTS",
      "BEST_EXECUTION",
      "SUITABILITY_ADVICE",
      "FIN_PROMOTIONS",
      "CONSUMER_DUTY",
      "VULNERABLE_CUST",
      "COMPLAINTS",
      "RISK_MGMT",
      "BCP_RESILIENCE"
    ],
    trainingRequirements: [
      "aml-training",
      "kyc-fundamentals",
      "sanctions-training",
      "mifid-training",
      "investment-advice",
      "client-categorisation",
      "financial-promotions",
      "consumer-duty-training",
      "vulnerable-customers",
      "complaints-handling",
      "operational-resilience-framework",
      "smcr-training"
    ],
    smcrRoles: ["SMF3", "SMF16", "SMF17", "SMF24"],
    typicalTimelineWeeks: 16,
  },
  {
    code: "consumer-credit",
    name: "Consumer Credit",
    description: "Consumer credit permissions with affordability, forbearance, and vulnerability controls.",
    packTemplateType: "consumer-credit",
    policyTemplates: [
      "AML_CTF",
      "RESPONSIBLE_LENDING",
      "ARREARS_MANAGEMENT",
      "COMPLAINTS",
      "CONSUMER_DUTY",
      "VULNERABLE_CUST",
      "FIN_PROMOTIONS",
      "RISK_MGMT",
      "BCP_RESILIENCE"
    ],
    trainingRequirements: [
      "aml-training",
      "kyc-fundamentals",
      "sanctions-training",
      "consumer-credit-training",
      "consumer-duty-training",
      "vulnerable-customers",
      "complaints-handling",
      "financial-promotions",
      "operational-resilience",
      "operational-resilience-framework",
      "smcr-training"
    ],
    smcrRoles: ["SMF16", "SMF17"],
    typicalTimelineWeeks: 12,
  },
  {
    code: "insurance",
    name: "Insurance Distribution",
    description: "Insurance distribution permissions with PROD governance and distribution oversight.",
    packTemplateType: "insurance-distribution",
    policyTemplates: [
      "AML_CTF",
      "PROD",
      "COMPLAINTS",
      "CONSUMER_DUTY",
      "VULNERABLE_CUST",
      "FIN_PROMOTIONS",
      "RISK_MGMT",
      "BCP_RESILIENCE"
    ],
    trainingRequirements: [
      "aml-training",
      "kyc-fundamentals",
      "sanctions-training",
      "insurance-conduct",
      "financial-promotions",
      "consumer-duty-training",
      "vulnerable-customers",
      "complaints-handling",
      "operational-resilience-framework",
      "smcr-training"
    ],
    smcrRoles: ["SMF16", "SMF17"],
    typicalTimelineWeeks: 14,
  },
  {
    code: "crypto",
    name: "Cryptoasset Registration",
    description: "Cryptoasset registration with AML/CTF, sanctions, and financial crime controls.",
    packTemplateType: "crypto-registration",
    policyTemplates: [
      "AML_CTF",
      "FIN_PROMOTIONS",
      "RISK_MGMT",
      "BCP_RESILIENCE",
      "COMPLAINTS"
    ],
    trainingRequirements: [
      "aml-training",
      "sanctions-training",
      "kyc-fundamentals",
      "peps-training",
      "sars-training",
      "cryptoasset-risk",
      "financial-promotions",
      "operational-resilience-framework",
      "smcr-training"
    ],
    smcrRoles: ["SMF16", "SMF17"],
    typicalTimelineWeeks: 16,
  },
];
