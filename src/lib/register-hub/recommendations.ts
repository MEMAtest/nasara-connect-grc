import { FirmType, RecommendationLevel, RegisterRecommendation } from "@/lib/types/register-hub";

type RecommendationSeed = Omit<RegisterRecommendation, "id">;

// Universal mandatory registers for all firms
const UNIVERSAL_MANDATORY: string[] = [
  "complaints",
  "incidents",
  "conflicts",
  "regulatory-breach",
];

// Universal recommended registers for all firms
const UNIVERSAL_RECOMMENDED: string[] = [
  "gifts-hospitality",
  "third-party",
  "data-breach-dsar",
  "op-resilience",
  "tc-record",
  "smcr-certification",
  "regulatory-returns",
];

// Firm-specific register recommendations
const FIRM_SPECIFIC_RECOMMENDATIONS: Record<
  FirmType,
  { mandatory: string[]; recommended: string[] }
> = {
  payment_services: {
    mandatory: [
      "pep",
      "sanctions",
      "aml-cdd",
      "edd-cases",
      "sar-nca",
      "tx-monitoring",
      "fin-prom",
    ],
    recommended: ["vulnerable-customers", "product-governance"],
  },
  consumer_credit: {
    mandatory: [
      "pep",
      "sanctions",
      "aml-cdd",
      "sar-nca",
      "fin-prom",
      "vulnerable-customers",
    ],
    recommended: ["edd-cases", "tx-monitoring", "product-governance"],
  },
  investment: {
    mandatory: [
      "pep",
      "sanctions",
      "aml-cdd",
      "edd-cases",
      "sar-nca",
      "pa-dealing",
      "insider-list",
      "outside-business",
    ],
    recommended: ["fin-prom", "product-governance", "tx-monitoring"],
  },
  insurance: {
    mandatory: ["pep", "sanctions", "aml-cdd", "sar-nca", "fin-prom", "product-governance"],
    recommended: ["vulnerable-customers", "edd-cases"],
  },
  mortgage: {
    mandatory: ["pep", "sanctions", "aml-cdd", "sar-nca", "fin-prom", "vulnerable-customers"],
    recommended: ["edd-cases", "product-governance"],
  },
  wealth_management: {
    mandatory: [
      "pep",
      "sanctions",
      "aml-cdd",
      "edd-cases",
      "sar-nca",
      "pa-dealing",
      "outside-business",
    ],
    recommended: ["insider-list", "fin-prom", "product-governance"],
  },
  crypto: {
    mandatory: [
      "pep",
      "sanctions",
      "aml-cdd",
      "edd-cases",
      "sar-nca",
      "tx-monitoring",
      "fin-prom",
    ],
    recommended: ["vulnerable-customers"],
  },
};

// Rationale text for recommendations
const RECOMMENDATION_RATIONALE: Record<string, Record<string, string>> = {
  // AML Registers
  pep: {
    mandatory: "Required under MLR 2017 for firms with AML obligations to identify and apply EDD to PEPs",
    recommended: "Best practice for managing high-risk customer relationships",
  },
  sanctions: {
    mandatory: "Required to comply with UK sanctions regulations and avoid criminal liability",
    recommended: "Recommended for enhanced due diligence on customer base",
  },
  "aml-cdd": {
    mandatory: "Core requirement under MLR 2017 for customer identification and verification",
    recommended: "Supports demonstrating robust AML controls",
  },
  "edd-cases": {
    mandatory: "Required under MLR 2017 for high-risk customers, PEPs, and correspondent relationships",
    recommended: "Best practice for enhanced monitoring of complex relationships",
  },
  "sar-nca": {
    mandatory: "Legal requirement under POCA 2002 and MLR 2017 to report suspicious activity",
    recommended: "Supports compliance with AML obligations",
  },
  "tx-monitoring": {
    mandatory: "Required for payment firms to detect and prevent financial crime",
    recommended: "Supports AML compliance and suspicious activity detection",
  },

  // Conduct Registers
  complaints: {
    mandatory: "Required under FCA DISP rules for all regulated firms",
    recommended: "N/A - mandatory for all firms",
  },
  conflicts: {
    mandatory: "Required under FCA SYSC 10.1 to identify, prevent, and manage conflicts",
    recommended: "N/A - mandatory for all firms",
  },
  "gifts-hospitality": {
    mandatory: "Required to comply with UK Bribery Act 2010",
    recommended: "Best practice for managing bribery and corruption risks",
  },
  "fin-prom": {
    mandatory: "Required under FCA COBS 4 for all firms making financial promotions",
    recommended: "Best practice for marketing compliance",
  },
  "vulnerable-customers": {
    mandatory: "Required under FCA Consumer Duty for firms serving retail customers",
    recommended: "Best practice for customer outcomes and Consumer Duty compliance",
  },
  "product-governance": {
    mandatory: "Required under FCA PROD for product manufacturers and distributors",
    recommended: "Supports Consumer Duty compliance and fair value assessment",
  },

  // Governance Registers
  "tc-record": {
    mandatory: "Required under FCA TC sourcebook for staff performing regulated activities",
    recommended: "Best practice for demonstrating staff competency",
  },
  "smcr-certification": {
    mandatory: "Required under SM&CR for certification function holders",
    recommended: "Best practice for governance and accountability",
  },
  "regulatory-returns": {
    mandatory: "Required for timely submission of regulatory reports",
    recommended: "Best practice for regulatory compliance management",
  },

  // Market Abuse Registers
  "pa-dealing": {
    mandatory: "Required under FCA COBS 11.7 for investment firms",
    recommended: "Best practice for managing personal trading conflicts",
  },
  "insider-list": {
    mandatory: "Required under MAR Article 18 when handling inside information",
    recommended: "Best practice for market abuse prevention",
  },
  "outside-business": {
    mandatory: "Required under SM&CR conduct rules for disclosure of outside interests",
    recommended: "Best practice for conflict management",
  },

  // Operational Registers
  incidents: {
    mandatory: "Required under FCA SYSC 3 and Principle 3 for operational risk management",
    recommended: "N/A - mandatory for all firms",
  },
  "third-party": {
    mandatory: "Required under FCA SYSC 8 for material outsourcing arrangements",
    recommended: "Best practice for vendor risk management",
  },
  "data-breach-dsar": {
    mandatory: "Required under UK GDPR for data protection compliance",
    recommended: "Best practice for data protection risk management",
  },
  "op-resilience": {
    mandatory: "Required under FCA PS21/3 for operational resilience",
    recommended: "Best practice for business continuity",
  },
  "regulatory-breach": {
    mandatory: "Required under FCA Principle 11 to deal with regulators openly",
    recommended: "N/A - mandatory for all firms",
  },
};

// Generate all recommendations
export function generateAllRecommendations(): RecommendationSeed[] {
  const recommendations: RecommendationSeed[] = [];

  // Add universal mandatory for "all" firm types
  UNIVERSAL_MANDATORY.forEach((registerCode) => {
    recommendations.push({
      registerCode,
      firmType: "all",
      level: "mandatory",
      rationale: RECOMMENDATION_RATIONALE[registerCode]?.mandatory || "Required for all regulated firms",
    });
  });

  // Add universal recommended for "all" firm types
  UNIVERSAL_RECOMMENDED.forEach((registerCode) => {
    recommendations.push({
      registerCode,
      firmType: "all",
      level: "recommended",
      rationale: RECOMMENDATION_RATIONALE[registerCode]?.recommended || "Recommended best practice",
    });
  });

  // Add firm-specific recommendations
  (Object.keys(FIRM_SPECIFIC_RECOMMENDATIONS) as FirmType[]).forEach((firmType) => {
    const { mandatory, recommended } = FIRM_SPECIFIC_RECOMMENDATIONS[firmType];

    mandatory.forEach((registerCode) => {
      // Skip if already in universal mandatory
      if (UNIVERSAL_MANDATORY.includes(registerCode)) return;

      recommendations.push({
        registerCode,
        firmType,
        level: "mandatory",
        rationale:
          RECOMMENDATION_RATIONALE[registerCode]?.mandatory || `Required for ${firmType} firms`,
      });
    });

    recommended.forEach((registerCode) => {
      // Skip if already in universal recommended or mandatory
      if (UNIVERSAL_RECOMMENDED.includes(registerCode) || mandatory.includes(registerCode)) return;

      recommendations.push({
        registerCode,
        firmType,
        level: "recommended",
        rationale:
          RECOMMENDATION_RATIONALE[registerCode]?.recommended ||
          `Recommended for ${firmType} firms`,
      });
    });
  });

  return recommendations;
}

// Get recommendations for a specific firm type
export function getRecommendationsForFirmType(
  firmType: FirmType | null
): { mandatory: string[]; recommended: string[]; optional: string[] } {
  const allRegisterCodes = [
    "pep", "sanctions", "aml-cdd", "edd-cases", "sar-nca", "tx-monitoring",
    "complaints", "conflicts", "gifts-hospitality", "fin-prom", "vulnerable-customers", "product-governance",
    "tc-record", "smcr-certification", "regulatory-returns",
    "pa-dealing", "insider-list", "outside-business",
    "incidents", "third-party", "data-breach-dsar", "op-resilience", "regulatory-breach",
  ];

  const mandatory = new Set<string>(UNIVERSAL_MANDATORY);
  const recommended = new Set<string>(UNIVERSAL_RECOMMENDED);

  if (firmType && FIRM_SPECIFIC_RECOMMENDATIONS[firmType]) {
    FIRM_SPECIFIC_RECOMMENDATIONS[firmType].mandatory.forEach((r) => mandatory.add(r));
    FIRM_SPECIFIC_RECOMMENDATIONS[firmType].recommended.forEach((r) => {
      if (!mandatory.has(r)) recommended.add(r);
    });
  }

  // Everything else is optional
  const optional = allRegisterCodes.filter((r) => !mandatory.has(r) && !recommended.has(r));

  return {
    mandatory: Array.from(mandatory),
    recommended: Array.from(recommended),
    optional,
  };
}

// Check recommendation level for a specific register and firm type
export function getRecommendationLevel(
  registerCode: string,
  firmType: FirmType | null
): RecommendationLevel {
  // Check universal mandatory first
  if (UNIVERSAL_MANDATORY.includes(registerCode)) {
    return "mandatory";
  }

  // Check firm-specific mandatory
  if (firmType && FIRM_SPECIFIC_RECOMMENDATIONS[firmType]?.mandatory.includes(registerCode)) {
    return "mandatory";
  }

  // Check universal recommended
  if (UNIVERSAL_RECOMMENDED.includes(registerCode)) {
    return "recommended";
  }

  // Check firm-specific recommended
  if (firmType && FIRM_SPECIFIC_RECOMMENDATIONS[firmType]?.recommended.includes(registerCode)) {
    return "recommended";
  }

  return "optional";
}

export const REGISTER_RECOMMENDATIONS = generateAllRecommendations();
