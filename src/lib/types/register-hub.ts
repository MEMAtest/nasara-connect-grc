// Register Hub Types

export type FirmType =
  | "payment_services"
  | "consumer_credit"
  | "investment"
  | "insurance"
  | "mortgage"
  | "wealth_management"
  | "crypto";

export type RegisterCategory =
  | "aml"
  | "conduct"
  | "governance"
  | "market_abuse"
  | "operational";

export type RecommendationLevel = "mandatory" | "recommended" | "optional";

export interface RegisterDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  shortDescription: string;
  category: RegisterCategory;
  iconKey: string;
  href: string;
  regulatoryReferences: string[];
  useCases: string[];
  relatedTraining: string[];
  relatedPolicies: string[];
  isActive: boolean;
  isImplemented: boolean;
  sortOrder: number;
  createdAt?: Date;
}

export interface RegisterRecommendation {
  id: string;
  registerCode: string;
  firmType: FirmType | "all";
  level: RecommendationLevel;
  rationale: string;
  regulatoryBasis?: string;
}

export interface RegisterSubscription {
  id: string;
  organizationId: string;
  registerCode: string;
  enabled: boolean;
  enabledAt: Date;
  enabledBy?: string;
  configuration?: Record<string, unknown>;
}

export interface OrganizationSettings {
  id: string;
  organizationId: string;
  firmType?: FirmType;
  additionalPermissions?: string[];
  registerHubPreferences?: Record<string, unknown>;
  updatedAt: Date;
}

// API Response Types
export interface RegisterHubData {
  definitions: RegisterDefinition[];
  recommendations: RegisterRecommendation[];
  subscriptions: RegisterSubscription[];
  firmType?: FirmType;
}

export interface RegisterWithRecommendation extends RegisterDefinition {
  recommendation?: RegisterRecommendation;
  subscription?: RegisterSubscription;
}

// Category metadata
export const REGISTER_CATEGORIES: Record<RegisterCategory, { label: string; description: string; color: string }> = {
  aml: {
    label: "AML & Financial Crime",
    description: "Anti-money laundering and financial crime prevention",
    color: "red",
  },
  conduct: {
    label: "Conduct & Customer",
    description: "Customer treatment and conduct of business",
    color: "blue",
  },
  governance: {
    label: "Governance & Training",
    description: "Corporate governance and staff competency",
    color: "purple",
  },
  market_abuse: {
    label: "Market Abuse",
    description: "Market integrity and insider dealing prevention",
    color: "amber",
  },
  operational: {
    label: "Operational Risk",
    description: "Operational resilience and risk management",
    color: "emerald",
  },
};

// Firm type metadata
export const FIRM_TYPES: Record<FirmType, { label: string; description: string }> = {
  payment_services: {
    label: "Payment Services",
    description: "Payment institutions, EMIs, and PISPs/AISPs",
  },
  consumer_credit: {
    label: "Consumer Credit",
    description: "Credit brokers, lenders, and debt collectors",
  },
  investment: {
    label: "Investment Services",
    description: "Investment firms, fund managers, and advisers",
  },
  insurance: {
    label: "Insurance Distribution",
    description: "Insurance brokers and intermediaries",
  },
  mortgage: {
    label: "Mortgage Services",
    description: "Mortgage brokers and lenders",
  },
  wealth_management: {
    label: "Wealth Management",
    description: "Private wealth advisers and family offices",
  },
  crypto: {
    label: "Crypto Assets",
    description: "Cryptoasset businesses registered with FCA",
  },
};
