
import type { PolicyRequirement } from "./permissions";

export interface PolicyPackage {
  id: string;
  name: string;
  description: string;
  targetFirms: string;
  policies: PolicyRequirement[];
  estimatedSetupDays: number;
}

export const POLICY_PACKAGES: PolicyPackage[] = [
  {
    id: "payments-lite",
    name: "Payment Institution Starter",
    description: "Core safeguarding, operational risk, AML, and consumer policies for new payment firms.",
    targetFirms: "Small payment institutions and EMI start-ups",
    policies: [
      { code: "SAFEGUARDING", name: "Safeguarding Policy", mandatory: true },
      { code: "OP_SEC_RISK", name: "Operational & Security Risk", mandatory: true },
      { code: "AML_CTF", name: "AML/CTF & Sanctions", mandatory: true },
      { code: "BCP_RESILIENCE", name: "Business Continuity & Resilience", mandatory: true },
      { code: "CONSUMER_DUTY", name: "Consumer Duty Framework", mandatory: true },
    ],
    estimatedSetupDays: 10,
  },
  {
    id: "investment-firm",
    name: "Investment Firm Bundle",
    description: "MiFID-aligned policy framework covering market abuse, inducements, best execution, and governance.",
    targetFirms: "MiFID investment firms and wealth managers",
    policies: [
      { code: "MARKET_ABUSE", name: "Market Abuse", mandatory: true },
      { code: "INDUCEMENTS", name: "Inducements", mandatory: true },
      { code: "BEST_EXECUTION", name: "Best Execution", mandatory: true },
      { code: "CONFLICTS", name: "Conflicts of Interest", mandatory: true },
      { code: "COMPLIANCE_MON", name: "Compliance Monitoring Plan", mandatory: true },
    ],
    estimatedSetupDays: 14,
  },
  {
    id: "consumer-duty",
    name: "Consumer Duty Accelerator",
    description: "Focus on vulnerable customers, complaints handling, fair value, and MI handoffs.",
    targetFirms: "Retail-facing firms preparing Consumer Duty packs",
    policies: [
      { code: "VULNERABLE_CUST", name: "Vulnerable Customers", mandatory: true },
      { code: "COMPLAINTS", name: "Complaints Handling Policy", mandatory: true },
      { code: "PRODUCT_GOV", name: "Product Governance", mandatory: true },
      { code: "FIN_PROMOTIONS", name: "Financial Promotions", mandatory: true },
      { code: "TARGET_MARKET", name: "Target Market Assessment", mandatory: true },
    ],
    estimatedSetupDays: 8,
  },
];
