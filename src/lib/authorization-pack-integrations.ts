export type IntegrationItem = {
  key: string;
  label: string;
  href?: string;
  description?: string;
};

const policyLink = (templateCode: string) => `/policies/wizard?template=${encodeURIComponent(templateCode)}`;

const policyMap: Record<string, IntegrationItem> = {
  "aml-policy": {
    key: "aml-policy",
    label: "AML/CTF & Sanctions",
    href: policyLink("AML_CTF"),
  },
  "aml-ctf-and-sanctions-policy": {
    key: "aml-ctf-and-sanctions-policy",
    label: "AML/CTF & Sanctions",
    href: policyLink("AML_CTF"),
  },
  "aml-ctf-sanctions-policy": {
    key: "aml-ctf-sanctions-policy",
    label: "AML/CTF & Sanctions",
    href: policyLink("AML_CTF"),
  },
  "safeguarding-policy": {
    key: "safeguarding-policy",
    label: "Safeguarding Policy",
    href: policyLink("SAFEGUARDING"),
  },
  "safeguarding-policy-document": {
    key: "safeguarding-policy-document",
    label: "Safeguarding Policy",
    href: policyLink("SAFEGUARDING"),
  },
  "complaints-policy": {
    key: "complaints-policy",
    label: "Complaints Handling",
    href: policyLink("COMPLAINTS"),
  },
  "complaints-handling-policy": {
    key: "complaints-handling-policy",
    label: "Complaints Handling",
    href: policyLink("COMPLAINTS"),
  },
  "financial-promotions": {
    key: "financial-promotions",
    label: "Financial Promotions",
    href: policyLink("FIN_PROMOTIONS"),
  },
  "fin-promotions": {
    key: "fin-promotions",
    label: "Financial Promotions",
    href: policyLink("FIN_PROMOTIONS"),
  },
  "financial-promotions-policy": {
    key: "financial-promotions-policy",
    label: "Financial Promotions",
    href: policyLink("FIN_PROMOTIONS"),
  },
  "operational-resilience": {
    key: "operational-resilience",
    label: "Business Continuity & Operational Resilience",
    href: policyLink("BCP_RESILIENCE"),
  },
  "bcp-resilience": {
    key: "bcp-resilience",
    label: "Business Continuity & Operational Resilience",
    href: policyLink("BCP_RESILIENCE"),
  },
  "operational-resilience-policy": {
    key: "operational-resilience-policy",
    label: "Business Continuity & Operational Resilience",
    href: policyLink("BCP_RESILIENCE"),
  },
  "business-continuity-resilience": {
    key: "business-continuity-resilience",
    label: "Business Continuity & Operational Resilience",
    href: policyLink("BCP_RESILIENCE"),
  },
  "consumer-duty": {
    key: "consumer-duty",
    label: "Consumer Duty Framework",
    href: policyLink("CONSUMER_DUTY"),
  },
  "consumer-duty-framework": {
    key: "consumer-duty-framework",
    label: "Consumer Duty Framework",
    href: policyLink("CONSUMER_DUTY"),
  },
  "best-execution": {
    key: "best-execution",
    label: "Best Execution",
    href: policyLink("BEST_EXECUTION"),
  },
  "best-execution-policy": {
    key: "best-execution-policy",
    label: "Best Execution",
    href: policyLink("BEST_EXECUTION"),
  },
  "conflicts-of-interest": {
    key: "conflicts-of-interest",
    label: "Conflicts of Interest",
    href: policyLink("CONFLICTS"),
  },
  conflicts: {
    key: "conflicts",
    label: "Conflicts of Interest",
    href: policyLink("CONFLICTS"),
  },
  "conflicts-of-interest-policy": {
    key: "conflicts-of-interest-policy",
    label: "Conflicts of Interest",
    href: policyLink("CONFLICTS"),
  },
  suitability: {
    key: "suitability",
    label: "Suitability of Advice",
    href: policyLink("SUITABILITY_ADVICE"),
  },
  "suitability-advice": {
    key: "suitability-advice",
    label: "Suitability of Advice",
    href: policyLink("SUITABILITY_ADVICE"),
  },
  "suitability-of-advice-policy": {
    key: "suitability-of-advice-policy",
    label: "Suitability of Advice",
    href: policyLink("SUITABILITY_ADVICE"),
  },
  "responsible-lending": {
    key: "responsible-lending",
    label: "Responsible Lending & Affordability",
    href: policyLink("RESPONSIBLE_LENDING"),
  },
  "responsible-lending-policy": {
    key: "responsible-lending-policy",
    label: "Responsible Lending & Affordability",
    href: policyLink("RESPONSIBLE_LENDING"),
  },
  "affordability-policy": {
    key: "affordability-policy",
    label: "Responsible Lending & Affordability",
    href: policyLink("RESPONSIBLE_LENDING"),
  },
  "arrears-management": {
    key: "arrears-management",
    label: "Arrears Management & Forbearance",
    href: policyLink("ARREARS_MANAGEMENT"),
  },
  "arrears-management-and-forbearance": {
    key: "arrears-management-and-forbearance",
    label: "Arrears Management & Forbearance",
    href: policyLink("ARREARS_MANAGEMENT"),
  },
  "arrears-management-and-forbearance-policy": {
    key: "arrears-management-and-forbearance-policy",
    label: "Arrears Management & Forbearance",
    href: policyLink("ARREARS_MANAGEMENT"),
  },
  "prod-policy": {
    key: "prod-policy",
    label: "PROD & Distribution Oversight",
    href: policyLink("PROD"),
  },
  prod: {
    key: "prod",
    label: "PROD & Distribution Oversight",
    href: policyLink("PROD"),
  },
  "risk-assessment": {
    key: "risk-assessment",
    label: "Risk Management Framework",
    href: policyLink("RISK_MGMT"),
  },
  "risk-mgmt": {
    key: "risk-mgmt",
    label: "Risk Management Framework",
    href: policyLink("RISK_MGMT"),
  },
  "risk-assessment-policy": {
    key: "risk-assessment-policy",
    label: "Risk Management Framework",
    href: policyLink("RISK_MGMT"),
  },
  "risk-management-framework": {
    key: "risk-management-framework",
    label: "Risk Management Framework",
    href: policyLink("RISK_MGMT"),
  },
  "vulnerable-customers": {
    key: "vulnerable-customers",
    label: "Vulnerable Customers",
    href: policyLink("VULNERABLE_CUST"),
  },
  "vulnerable-cust": {
    key: "vulnerable-cust",
    label: "Vulnerable Customers",
    href: policyLink("VULNERABLE_CUST"),
  },
  complaints: {
    key: "complaints",
    label: "Complaints Handling",
    href: policyLink("COMPLAINTS"),
  },
  "aml-ctf": {
    key: "aml-ctf",
    label: "AML/CTF & Sanctions",
    href: policyLink("AML_CTF"),
  },
  "sanctions-policy": {
    key: "sanctions-policy",
    label: "AML/CTF & Sanctions",
    href: policyLink("AML_CTF"),
  },
  safeguarding: {
    key: "safeguarding",
    label: "Safeguarding Policy",
    href: policyLink("SAFEGUARDING"),
  },
};

const trainingMap: Record<string, IntegrationItem> = {
  "aml-training": {
    key: "aml-training",
    label: "AML Fundamentals",
    href: "/training-library/lesson/aml-fundamentals",
  },
  "kyc-fundamentals": {
    key: "kyc-fundamentals",
    label: "KYC Fundamentals",
    href: "/training-library/lesson/kyc-fundamentals",
  },
  "money-laundering-red-flags": {
    key: "money-laundering-red-flags",
    label: "Money Laundering Red Flags",
    href: "/training-library/lesson/money-laundering-red-flags",
  },
  "financial-crime-aml": {
    key: "financial-crime-aml",
    label: "Financial Crime & AML",
    href: "/training-library/lesson/financial-crime-aml",
  },
  "consumer-duty-training": {
    key: "consumer-duty-training",
    label: "Consumer Duty Implementation",
    href: "/training-library/lesson/consumer-duty-implementation",
  },
  "consumer-duty": {
    key: "consumer-duty",
    label: "Consumer Duty Fundamentals",
    href: "/training-library/lesson/consumer-duty",
  },
  "operational-resilience": {
    key: "operational-resilience",
    label: "Operational Resilience & Incident Management",
    href: "/training-library/lesson/operational-resilience",
  },
  "operational-resilience-training": {
    key: "operational-resilience-training",
    label: "Operational Resilience & Incident Management",
    href: "/training-library/lesson/operational-resilience",
  },
  "operational-resilience-framework": {
    key: "operational-resilience-framework",
    label: "Operational Resilience Framework",
    href: "/training-library/lesson/operational-resilience-framework",
  },
  "payments-regulation": {
    key: "payments-regulation",
    label: "Payment Services and E-Money Regulations",
    href: "/training-library/lesson/payments-regulation",
  },
  "payment-services-and-e-money-regulations": {
    key: "payment-services-and-e-money-regulations",
    label: "Payment Services and E-Money Regulations",
    href: "/training-library/lesson/payments-regulation",
  },
  "mifid-training": {
    key: "mifid-training",
    label: "MiFID Permissions and Conduct",
    href: "/training-library/lesson/mifid-training",
  },
  "mifid-permissions-and-conduct": {
    key: "mifid-permissions-and-conduct",
    label: "MiFID Permissions and Conduct",
    href: "/training-library/lesson/mifid-training",
  },
  "investment-advice": {
    key: "investment-advice",
    label: "Suitability and Appropriateness",
    href: "/training-library/lesson/suitability-appropriateness",
  },
  "financial-promotions": {
    key: "financial-promotions",
    label: "Financial Promotions & Communications",
    href: "/training-library/lesson/financial-promotions",
  },
  "complaints-handling": {
    key: "complaints-handling",
    label: "Complaints Handling",
    href: "/training-library/lesson/complaints-handling",
  },
  "outsourcing-third-party": {
    key: "outsourcing-third-party",
    label: "Outsourcing & Third-Party Risk",
    href: "/training-library/lesson/outsourcing-third-party",
  },
  "consumer-credit-training": {
    key: "consumer-credit-training",
    label: "Consumer Credit and Affordability",
    href: "/training-library/lesson/consumer-credit-training",
  },
  "consumer-credit-and-affordability": {
    key: "consumer-credit-and-affordability",
    label: "Consumer Credit and Affordability",
    href: "/training-library/lesson/consumer-credit-training",
  },
  "insurance-conduct": {
    key: "insurance-conduct",
    label: "Insurance Distribution Conduct (IDD)",
    href: "/training-library/lesson/insurance-conduct",
  },
  "insurance-distribution-conduct": {
    key: "insurance-distribution-conduct",
    label: "Insurance Distribution Conduct (IDD)",
    href: "/training-library/lesson/insurance-conduct",
  },
  "cryptoasset-risk": {
    key: "cryptoasset-risk",
    label: "Cryptoasset Financial Crime Risk",
    href: "/training-library/lesson/cryptoasset-risk",
  },
  "cryptoasset-financial-crime-risk": {
    key: "cryptoasset-financial-crime-risk",
    label: "Cryptoasset Financial Crime Risk",
    href: "/training-library/lesson/cryptoasset-risk",
  },
  "sanctions-training": {
    key: "sanctions-training",
    label: "Sanctions Screening & Escalation",
    href: "/training-library/lesson/sanctions-training",
  },
  "peps-training": {
    key: "peps-training",
    label: "PEPs Screening",
    href: "/training-library/lesson/peps-training",
  },
  "sars-training": {
    key: "sars-training",
    label: "SARs Reporting",
    href: "/training-library/lesson/sars-training",
  },
  "client-categorisation": {
    key: "client-categorisation",
    label: "Client Categorisation",
    href: "/training-library/lesson/client-categorisation",
  },
  "smcr-training": {
    key: "smcr-training",
    label: "Senior Managers & Certification Regime (SM&CR)",
    href: "/training-library/lesson/smcr-training",
  },
  "vulnerable-customers": {
    key: "vulnerable-customers",
    label: "Vulnerable Customers",
    href: "/training-library/lesson/vulnerable-customers",
  },
  "aml-fundamentals": {
    key: "aml-fundamentals",
    label: "AML Fundamentals",
    href: "/training-library/lesson/aml-fundamentals",
  },
};

const smcrMap: Record<string, IntegrationItem> = {
  SMF1: { key: "SMF1", label: "SMF1 (Chief Executive)", href: "/smcr" },
  SMF2: { key: "SMF2", label: "SMF2 (Chief Finance)", href: "/smcr" },
  SMF16: { key: "SMF16", label: "SMF16 (Compliance Oversight)", href: "/smcr" },
  SMF17: { key: "SMF17", label: "SMF17 (MLRO)", href: "/smcr" },
  SMF29: { key: "SMF29", label: "SMF29 (Limited Scope Function)", href: "/smcr" },
  SMF3: { key: "SMF3", label: "SMF3 (Executive Director)", href: "/smcr" },
  SMF24: { key: "SMF24", label: "SMF24 (Chief Operations)", href: "/smcr" },
};

const baseRegisters: IntegrationItem[] = [
  { key: "policy-register", label: "Policy register", href: "/policies/register" },
  { key: "risk-register", label: "Risk register", href: "/risk-assessment" },
  { key: "cmp-register", label: "Compliance monitoring plan", href: "/compliance-framework/cmp" },
  { key: "smcr-register", label: "SMCR responsibilities", href: "/smcr" },
  { key: "training-log", label: "Training records", href: "/training-library" },
  { key: "pep-register", label: "PEP register", href: "/registers/pep", description: "Politically exposed persons" },
  { key: "third-party-register", label: "Third-party register", href: "/registers/third-party", description: "Vendors & outsourcing" },
  { key: "complaints-register", label: "Complaints register", href: "/registers/complaints" },
  { key: "incidents-register", label: "Incident register", href: "/registers/incidents" },
  { key: "conflicts-register", label: "Conflicts register", href: "/registers/conflicts" },
  { key: "gifts-hospitality-register", label: "Gifts & hospitality register", href: "/registers/gifts-hospitality" },
];

const registerOverrides: Record<string, IntegrationItem[]> = {
  payments: [
    ...baseRegisters,
    { key: "safeguarding-log", label: "Safeguarding log (evidence hub)" },
  ],
};

const permissionAliases: Record<string, string> = {
  "payments-emi": "payments",
  payments: "payments",
  "investment-services": "investments",
  investment: "investments",
  investments: "investments",
  "consumer-credit": "consumer-credit",
  credit: "consumer-credit",
  "insurance-distribution": "insurance",
  insurance: "insurance",
  "crypto-registration": "crypto",
  crypto: "crypto",
};

const titleCase = (value: string) =>
  value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

const normalizeKey = (value?: string) =>
  (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");

function mapItems(values: string[] | undefined, lookup: Record<string, IntegrationItem>, fallbackHref?: string) {
  if (!values?.length) return [];
  return values.map((raw) => {
    const key = normalizeKey(raw);
    const mapped = lookup[key];
    if (mapped) return mapped;
    return {
      key: raw,
      label: titleCase(raw),
      href: fallbackHref,
    };
  });
}

export function getPolicyItems(values?: string[]) {
  return mapItems(values, policyMap, "/policies/wizard");
}

export function getTrainingItems(values?: string[]) {
  return mapItems(values, trainingMap, "/training-library");
}

export function getSmcrItems(values?: string[]) {
  if (!values?.length) return [];
  return values.map((value) => {
    const match = value.match(/SMF\d+/i);
    const code = match ? match[0].toUpperCase() : value;
    return smcrMap[code] ?? { key: code, label: titleCase(value), href: "/smcr" };
  });
}

export function getRegisterItems(permissionCode?: string) {
  const normalized = permissionAliases[permissionCode || ""] ?? permissionCode ?? "";
  return registerOverrides[normalized] ?? baseRegisters;
}
