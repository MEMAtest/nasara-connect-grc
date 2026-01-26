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
      "COMPLIANCE_MON",
      "RISK_MGMT",
      "OUTSOURCING",
      "INFO_SECURITY",
      "OP_SEC_RISK",
      "COMPLAINTS",
      "FIN_PROMOTIONS",
      "CONSUMER_DUTY",
      "VULNERABLE_CUST",
      "BCP_RESILIENCE"
    ],
    trainingRequirements: [],
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
      "MARKET_ABUSE",
      "INDUCEMENTS",
      "SUITABILITY_ADVICE",
      "COMPLIANCE_MON",
      "RISK_MGMT",
      "OUTSOURCING",
      "INFO_SECURITY",
      "FIN_PROMOTIONS",
      "CONSUMER_DUTY",
      "VULNERABLE_CUST",
      "COMPLAINTS",
      "BCP_RESILIENCE"
    ],
    trainingRequirements: [],
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
      "COMPLIANCE_MON",
      "RISK_MGMT",
      "OUTSOURCING",
      "INFO_SECURITY",
      "COMPLAINTS",
      "CONSUMER_DUTY",
      "VULNERABLE_CUST",
      "FIN_PROMOTIONS",
      "BCP_RESILIENCE"
    ],
    trainingRequirements: [],
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
      "COMPLIANCE_MON",
      "RISK_MGMT",
      "OUTSOURCING",
      "INFO_SECURITY",
      "COMPLAINTS",
      "CONSUMER_DUTY",
      "VULNERABLE_CUST",
      "FIN_PROMOTIONS",
      "BCP_RESILIENCE"
    ],
    trainingRequirements: [],
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
      "COMPLIANCE_MON",
      "RISK_MGMT",
      "OUTSOURCING",
      "INFO_SECURITY",
      "BCP_RESILIENCE",
      "COMPLAINTS"
    ],
    trainingRequirements: [],
    smcrRoles: ["SMF16", "SMF17"],
    typicalTimelineWeeks: 16,
  },
];
