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
  const required: PolicyRequirement[] = [
    { code: "RISK_MGMT", name: "Risk Management Framework", mandatory: true },
    { code: "COMPLIANCE_MON", name: "Compliance Monitoring Plan", mandatory: true },
    { code: "CONFLICTS", name: "Conflicts of Interest", mandatory: true },
    { code: "OUTSOURCING", name: "Outsourcing & Third Party", mandatory: true },
    { code: "BCP_RESILIENCE", name: "Business Continuity & Op Resilience", mandatory: true },
    { code: "INFO_SECURITY", name: "Information & Cyber Security", mandatory: true },
    { code: "AML_CTF", name: "Anti-Money Laundering", mandatory: true },
  ];

  if (permissions.paymentServices || permissions.eMoney) {
    required.push(
      { code: "SAFEGUARDING", name: "Safeguarding Policy", mandatory: true },
      { code: "OP_SEC_RISK", name: "Operational & Security Risk", mandatory: true },
    );
  }

  if (permissions.investmentServices) {
    required.push(
      { code: "MARKET_ABUSE", name: "Market Abuse Policy", mandatory: true },
      { code: "INDUCEMENTS", name: "Inducements Policy", mandatory: true },
      { code: "BEST_EXECUTION", name: "Best Execution Policy", mandatory: true },
    );
  }

  if (permissions.clientMoney || permissions.clientAssets) {
    required.push(
      { code: "CASS", name: "Client Assets Policy", mandatory: true },
      { code: "CASS_RESOLUTION", name: "CASS Resolution Pack", mandatory: true },
    );
  }

  if (permissions.retailClients) {
    required.push(
      { code: "CONSUMER_DUTY", name: "Consumer Duty Framework", mandatory: true },
      { code: "VULNERABLE_CUST", name: "Vulnerable Customers", mandatory: true },
      { code: "COMPLAINTS", name: "Complaints Handling", mandatory: true },
      { code: "FIN_PROMOTIONS", name: "Financial Promotions", mandatory: true },
    );
  }

  if (permissions.complexProducts) {
    required.push(
      { code: "PRODUCT_GOV", name: "Product Governance", mandatory: true },
      { code: "TARGET_MARKET", name: "Target Market Assessment", mandatory: true },
    );
  }

  return required;
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
