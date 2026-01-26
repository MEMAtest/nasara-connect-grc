const UK_COUNTRY_ALIASES = new Set([
  "united kingdom",
  "uk",
  "england",
  "wales",
  "scotland",
  "northern ireland",
  "great britain",
  "britain",
  "england and wales",
]);

const UK_TERRITORY_ALIASES = new Set([
  "guernsey",
  "jersey",
  "isle of man",
  "channel islands",
]);

const normalizeInput = (value?: string | null) => (value || "").trim();

export const normalizeCompaniesHouseCountry = (country?: string | null) => {
  const raw = normalizeInput(country);
  if (!raw) return "";
  const lower = raw.toLowerCase();
  if (UK_COUNTRY_ALIASES.has(lower)) return "United Kingdom";
  if (UK_TERRITORY_ALIASES.has(lower)) return "United Kingdom";
  return raw;
};

export const deriveJurisdictionFromCompaniesHouse = (region?: string | null, country?: string | null) => {
  const regionValue = normalizeInput(region).toLowerCase();
  const countryValue = normalizeInput(country).toLowerCase();

  if (regionValue.includes("scotland")) return "scotland";
  if (regionValue.includes("northern ireland")) return "northern-ireland";
  if (regionValue.includes("wales")) return "england-wales";
  if (regionValue.includes("england")) return "england-wales";

  if (UK_TERRITORY_ALIASES.has(countryValue)) return "other-uk";
  if (UK_COUNTRY_ALIASES.has(countryValue)) return "england-wales";
  if (countryValue) return "non-uk";
  if (regionValue) return "england-wales";
  return "";
};

export const deriveFirmStageFromIncorporation = (incorporationDate?: string | null) => {
  const raw = normalizeInput(incorporationDate);
  if (!raw) return "";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - parsed.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays < 183) return "newly-incorporated";
  return "established-no-auth";
};

export const deriveEntityTypeFromCompaniesHouse = (companyType?: string | null) => {
  const raw = normalizeInput(companyType).toLowerCase();
  if (!raw) return "";
  if (raw.includes("llp")) return "llp";
  if (raw.includes("plc")) return "plc";
  if (raw.includes("partnership")) return "partnership";
  if (raw.includes("sole")) return "sole-trader";
  if (raw.includes("limited") || raw.includes("ltd") || raw.includes("private")) return "limited-company";
  return "";
};

const COMPANY_TYPE_LABELS: Record<string, string> = {
  ltd: "Limited",
  plc: "Public Limited Company",
  llp: "Limited Liability Partnership",
  "private-limited": "Private Limited Company",
  "private-limited-guarant-nsc": "Private Limited by Guarantee (no share capital)",
  "private-limited-guarant-nsc-limited-exemption": "Private Limited by Guarantee (no share capital, exemption)",
  "private-limited-shares-section-30-exemption": "Private Limited by Shares (section 30 exemption)",
  "limited-partnership": "Limited Partnership",
  "oversea-company": "Overseas Company",
  "uk-establishment": "UK Establishment",
  "sole-trader": "Sole Trader",
  "royal-charter": "Royal Charter Company",
  "charitable-incorporated-organisation": "Charitable Incorporated Organisation",
  "industrial-and-provident-society": "Industrial and Provident Society",
};

export const formatCompaniesHouseCompanyType = (companyType?: string | null) => {
  const raw = normalizeInput(companyType);
  if (!raw) return "";
  const lower = raw.toLowerCase();
  const mapped = COMPANY_TYPE_LABELS[lower];
  if (mapped) return mapped;
  return raw
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const SIC_SECTOR_RANGES = [
  { min: 1, max: 3, label: "Agriculture, forestry and fishing" },
  { min: 5, max: 9, label: "Mining and quarrying" },
  { min: 10, max: 33, label: "Manufacturing" },
  { min: 35, max: 35, label: "Electricity, gas, steam and air conditioning supply" },
  { min: 36, max: 39, label: "Water supply; sewerage, waste management and remediation activities" },
  { min: 41, max: 43, label: "Construction" },
  { min: 45, max: 47, label: "Wholesale and retail trade; repair of motor vehicles and motorcycles" },
  { min: 49, max: 53, label: "Transportation and storage" },
  { min: 55, max: 56, label: "Accommodation and food service activities" },
  { min: 58, max: 63, label: "Information and communication" },
  { min: 64, max: 66, label: "Financial and insurance activities" },
  { min: 68, max: 68, label: "Real estate activities" },
  { min: 69, max: 75, label: "Professional, scientific and technical activities" },
  { min: 77, max: 82, label: "Administrative and support service activities" },
  { min: 84, max: 84, label: "Public administration and defence; compulsory social security" },
  { min: 85, max: 85, label: "Education" },
  { min: 86, max: 88, label: "Human health and social work activities" },
  { min: 90, max: 93, label: "Arts, entertainment and recreation" },
  { min: 94, max: 96, label: "Other service activities" },
  {
    min: 97,
    max: 98,
    label:
      "Activities of households as employers; undifferentiated goods- and services-producing activities of households for own use",
  },
  { min: 99, max: 99, label: "Activities of extraterritorial organisations and bodies" },
];

export const describeSicCode = (code?: string | number | null) => {
  if (code === null || code === undefined) return "";
  const digits = String(code).match(/\d{2,4}/)?.[0];
  if (!digits) return "";
  const prefix = Number.parseInt(digits.slice(0, 2), 10);
  if (!Number.isFinite(prefix)) return "";
  const range = SIC_SECTOR_RANGES.find((item) => prefix >= item.min && prefix <= item.max);
  return range?.label || "";
};
