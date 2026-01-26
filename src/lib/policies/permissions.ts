export interface FirmPermissions {
  // Core permission categories
  investmentServices: boolean;
  paymentServices: boolean;
  eMoney: boolean;
  creditBroking: boolean;
  clientMoney: boolean;
  clientAssets: boolean;
  insuranceMediation: boolean;
  mortgageMediation: boolean;

  // Specific activities
  dealingAsAgent: boolean;
  dealingAsPrincipal: boolean;
  arrangingDeals: boolean;
  advising: boolean;
  managing: boolean;
  safeguarding: boolean;

  // Client segments
  retailClients: boolean;
  professionalClients: boolean;
  eligibleCounterparties: boolean;
  complexProducts: boolean;
}

export interface PolicyRequirement {
  code: string;
  name: string;
  mandatory: boolean;
  recommended?: boolean;
}

export function getRequiredPolicies(permissions: FirmPermissions): PolicyRequirement[] {
  const policyMap = new Map<string, PolicyRequirement>();

  const addPolicy = (policy: PolicyRequirement) => {
    const existing = policyMap.get(policy.code);
    if (!existing) {
      policyMap.set(policy.code, policy);
      return;
    }
    policyMap.set(policy.code, {
      code: existing.code,
      name: existing.name || policy.name,
      mandatory: existing.mandatory || policy.mandatory,
      recommended: existing.recommended || policy.recommended,
    });
  };

  [
    { code: "RISK_MGMT", name: "Risk Management Framework", mandatory: true },
    { code: "COMPLIANCE_MON", name: "Compliance Monitoring Plan", mandatory: true },
    { code: "CONFLICTS", name: "Conflicts of Interest", mandatory: true },
    { code: "OUTSOURCING", name: "Outsourcing & Third Party", mandatory: true },
    { code: "BCP_RESILIENCE", name: "Business Continuity & Op Resilience", mandatory: true },
    { code: "INFO_SECURITY", name: "Information & Cyber Security", mandatory: true },
    { code: "AML_CTF", name: "Anti-Money Laundering", mandatory: true },
  ].forEach(addPolicy);

  if (permissions.paymentServices || permissions.eMoney) {
    [
      { code: "SAFEGUARDING", name: "Safeguarding Policy", mandatory: true },
      { code: "OP_SEC_RISK", name: "Operational & Security Risk", mandatory: true },
      { code: "COMPLAINTS", name: "Complaints Handling Policy", mandatory: true },
      { code: "FIN_PROMOTIONS", name: "Financial Promotions", mandatory: true },
      { code: "CONSUMER_DUTY", name: "Consumer Duty Framework", mandatory: true },
      { code: "VULNERABLE_CUST", name: "Vulnerable Customers", mandatory: true },
    ].forEach(addPolicy);
  }

  if (permissions.investmentServices) {
    [
      { code: "MARKET_ABUSE", name: "Market Abuse Policy", mandatory: true },
      { code: "INDUCEMENTS", name: "Inducements Policy", mandatory: true },
      { code: "BEST_EXECUTION", name: "Best Execution Policy", mandatory: true },
      { code: "SUITABILITY_ADVICE", name: "Suitability of Advice", mandatory: true },
    ].forEach(addPolicy);
  }

  if (permissions.clientMoney || permissions.clientAssets) {
    [
      { code: "CASS", name: "Client Assets Policy", mandatory: true },
      { code: "CASS_RESOLUTION", name: "CASS Resolution Pack", mandatory: true },
    ].forEach(addPolicy);
  }

  if (permissions.retailClients) {
    [
      { code: "CONSUMER_DUTY", name: "Consumer Duty Framework", mandatory: true },
      { code: "VULNERABLE_CUST", name: "Vulnerable Customers", mandatory: true },
      { code: "COMPLAINTS", name: "Complaints Handling Policy", mandatory: true },
      { code: "FIN_PROMOTIONS", name: "Financial Promotions", mandatory: true },
    ].forEach(addPolicy);
  }

  if (permissions.complexProducts) {
    [
      { code: "PRODUCT_GOV", name: "Product Governance", mandatory: true },
      { code: "TARGET_MARKET", name: "Target Market Assessment", mandatory: true },
    ].forEach(addPolicy);
  }

  if (permissions.creditBroking) {
    [
      { code: "RESPONSIBLE_LENDING", name: "Responsible Lending & Affordability", mandatory: true },
      { code: "ARREARS_MANAGEMENT", name: "Arrears Management & Forbearance", mandatory: true },
    ].forEach(addPolicy);
  }

  if (permissions.insuranceMediation) {
    addPolicy({ code: "PROD", name: "PROD & Distribution Oversight", mandatory: true });
  }

  return Array.from(policyMap.values());
}

export const DEFAULT_PERMISSIONS: FirmPermissions = {
  investmentServices: false,
  paymentServices: false,
  eMoney: false,
  creditBroking: false,
  clientMoney: false,
  clientAssets: false,
  insuranceMediation: false,
  mortgageMediation: false,
  dealingAsAgent: false,
  dealingAsPrincipal: false,
  arrangingDeals: false,
  advising: false,
  managing: false,
  safeguarding: false,
  retailClients: false,
  professionalClients: false,
  eligibleCounterparties: false,
  complexProducts: false,
};
