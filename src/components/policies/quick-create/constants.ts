import type { FirmPermissions } from "@/lib/policies/permissions";
import type { FirmProfile } from "@/components/policies/policy-wizard/types";
import { DEFAULT_PERMISSIONS } from "@/lib/policies/permissions";

export const STEP_LABELS = ["Firm setup", "Pick policy", "Policy gaps", "Done"] as const;

export const KNOWN_FIRM_KEYS = new Set([
  "name",
  "tradingName",
  "registeredAddress",
  "companyNumber",
  "sicCodes",
  "fcaReference",
  "website",
]);

export const PERMISSION_KEYS = Object.keys(DEFAULT_PERMISSIONS) as Array<keyof FirmPermissions>;
export const PERMISSION_KEY_SET = new Set(PERMISSION_KEYS);

export const PERMISSION_GROUPS = [
  {
    id: "core",
    title: "Core activities",
    permissions: [
      { key: "investmentServices", label: "Investment services", description: "Advising, arranging, managing investments" },
      { key: "paymentServices", label: "Payment services", description: "Payment initiation, account information" },
      { key: "eMoney", label: "E-money issuance", description: "Electronic money institution services" },
      { key: "creditBroking", label: "Credit broking", description: "Consumer credit intermediation" },
    ],
  },
  {
    id: "assets",
    title: "Client assets",
    permissions: [
      { key: "clientMoney", label: "Client money", description: "Hold or control client money (CASS 7)" },
      { key: "clientAssets", label: "Client assets", description: "Safeguard and administer (CASS 6)" },
      { key: "safeguarding", label: "Safeguarding", description: "Safeguard relevant funds (PSR/EMR)" },
    ],
  },
  {
    id: "mediation",
    title: "Mediation",
    permissions: [
      { key: "insuranceMediation", label: "Insurance mediation", description: "Insurance distribution activities" },
      { key: "mortgageMediation", label: "Mortgage mediation", description: "Home finance activities" },
    ],
  },
  {
    id: "clients",
    title: "Client types",
    permissions: [
      { key: "retailClients", label: "Retail clients", description: "Consumer Duty applies" },
      { key: "professionalClients", label: "Professional clients", description: "Per se or elective professionals" },
      { key: "eligibleCounterparties", label: "Eligible counterparties", description: "Large institutions" },
      { key: "complexProducts", label: "Complex products", description: "PRIIPs, derivatives, structured" },
    ],
  },
] as const;

export const FIRM_FIELD_DEFS: Record<keyof FirmProfile, { label: string; placeholder: string; type?: string }> = {
  name: { label: "Firm name", placeholder: "Acme Financial Services Ltd" },
  tradingName: { label: "Trading name", placeholder: "Acme Payments" },
  registeredAddress: { label: "Registered address", placeholder: "Street, City, Postcode" },
  companyNumber: { label: "Company number", placeholder: "12345678" },
  sicCodes: { label: "SIC codes", placeholder: "64999, 66190" },
  fcaReference: { label: "FCA reference", placeholder: "123456" },
  website: { label: "Website", placeholder: "https://example.com", type: "url" },
};

export const BUSINESS_PROFILE_OTHER_OPTION = "Other";

export const BUSINESS_PROFILE_FIELDS = [
  {
    key: "productsServices",
    label: "Products and services",
    helper: "Select every product line you actively offer or are authorised to provide.",
    options: [
      "Money remittance (cross-border payments)",
      "Domestic payments",
      "FX / currency exchange",
      "E-money issuance",
      "Business accounts / wallets",
      "Card issuing",
      "Lending / credit",
      "Insurance mediation",
      "Investment advice / portfolio services",
      "Cryptoasset services",
    ],
    otherLabel: "Other products or services",
    otherPlaceholder: "Add other products or services (comma separated)",
  },
  {
    key: "customerSegments",
    label: "Customer segments",
    helper: "Who are your target customers for the products you offer?",
    options: [
      "Retail consumers",
      "SMEs",
      "Micro-enterprises",
      "Corporate / enterprise",
      "High-net-worth individuals",
      "Charities / NGOs",
      "Financial institutions / PSPs",
      "Public sector",
    ],
    otherLabel: "Other customer segments",
    otherPlaceholder: "Add other customer segments (comma separated)",
  },
  {
    key: "deliveryChannels",
    label: "Delivery channels",
    helper: "How do customers access or receive your services?",
    options: [
      "Web portal",
      "Mobile app",
      "API / embedded partners",
      "Agent network / in-person",
      "Call centre",
      "Introducers / brokers / affiliates",
      "Retail branches",
    ],
    otherLabel: "Other delivery channels",
    otherPlaceholder: "Add other delivery channels (comma separated)",
  },
  {
    key: "primaryGeographies",
    label: "Primary geographies",
    helper: "Where are your customers or activity corridors primarily located?",
    options: [
      "UK",
      "EEA",
      "North America",
      "Middle East",
      "Africa",
      "Asia-Pacific",
      "Latin America",
      "Global / multi-region",
    ],
    otherLabel: "Other geographies",
    otherPlaceholder: "Add other geographies or corridors (comma separated)",
  },
] as const;

export const BUSINESS_PROFILE_OPTION_LOOKUP = BUSINESS_PROFILE_FIELDS.reduce<Record<string, string[]>>((acc, field) => {
  acc[field.key] = [...field.options];
  return acc;
}, {});

export const DEFAULT_EXTRA_FIRM_FIELDS = BUSINESS_PROFILE_FIELDS.reduce<Record<string, string>>((acc, field) => {
  acc[field.key] = "";
  acc[`${field.key}Other`] = "";
  return acc;
}, {});

export const BUSINESS_PROFILE_FIELD_KEYS = new Set(Object.keys(DEFAULT_EXTRA_FIRM_FIELDS));

export const REQUIRED_GOVERNANCE_FIELDS = [
  "owner",
  "version",
  "effectiveDate",
  "nextReviewAt",
  "scopeStatement",
] as const;

export const REVIEW_CADENCE_OPTIONS = [
  { value: "quarterly", label: "Quarterly" },
  { value: "semi-annual", label: "Semi-annual" },
  { value: "annual", label: "Annual" },
  { value: "one-off", label: "One-off (no scheduled review)" },
] as const;

export const REVIEW_CADENCE_VALUES = new Set(REVIEW_CADENCE_OPTIONS.map((option) => option.value));

export const DISTRIBUTION_PRESETS = [
  "Board",
  "Compliance",
  "Risk",
  "Operations",
  "Executive",
  "Customer Support",
  "Finance",
  "All Staff",
] as const;
