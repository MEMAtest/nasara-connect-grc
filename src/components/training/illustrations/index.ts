export { AMLIllustration } from "./AMLIllustration";
export { KYCIllustration } from "./KYCIllustration";
export { SanctionsIllustration } from "./SanctionsIllustration";
export { PEPsIllustration } from "./PEPsIllustration";
export { SARsIllustration } from "./SARsIllustration";
export { SMCRIllustration } from "./SMCRIllustration";
export { ConsumerDutyIllustration } from "./ConsumerDutyIllustration";
export { VulnerableCustomersIllustration } from "./VulnerableCustomersIllustration";
export { ComplaintsIllustration } from "./ComplaintsIllustration";
export { FinancialPromotionsIllustration } from "./FinancialPromotionsIllustration";
export { OperationalResilienceIllustration } from "./OperationalResilienceIllustration";

// Illustration map by module ID for dynamic lookup
import { AMLIllustration } from "./AMLIllustration";
import { KYCIllustration } from "./KYCIllustration";
import { SanctionsIllustration } from "./SanctionsIllustration";
import { PEPsIllustration } from "./PEPsIllustration";
import { SARsIllustration } from "./SARsIllustration";
import { SMCRIllustration } from "./SMCRIllustration";
import { ConsumerDutyIllustration } from "./ConsumerDutyIllustration";
import { VulnerableCustomersIllustration } from "./VulnerableCustomersIllustration";
import { ComplaintsIllustration } from "./ComplaintsIllustration";
import { FinancialPromotionsIllustration } from "./FinancialPromotionsIllustration";
import { OperationalResilienceIllustration } from "./OperationalResilienceIllustration";
import { ComponentType } from "react";

interface IllustrationProps {
  className?: string;
}

export const illustrationMap: Record<string, ComponentType<IllustrationProps>> = {
  // Financial Crime Prevention
  "aml-fundamentals": AMLIllustration,
  "kyc-fundamentals": KYCIllustration,
  "sanctions-screening": SanctionsIllustration,
  "peps-identification": PEPsIllustration,
  "suspicious-activity-reporting": SARsIllustration,

  // Regulatory Compliance
  "smcr-fundamentals": SMCRIllustration,

  // Customer Protection
  "consumer-duty": ConsumerDutyIllustration,
  "vulnerable-customers": VulnerableCustomersIllustration,
  "complaints-handling": ComplaintsIllustration,
  "financial-promotions": FinancialPromotionsIllustration,

  // Operational Risk
  "operational-resilience": OperationalResilienceIllustration,
};

// Gradient presets by category
export const gradientMap: Record<string, string> = {
  "financial-crime": "from-red-500 via-orange-500 to-amber-500",
  "regulatory-compliance": "from-indigo-500 via-purple-500 to-pink-500",
  "customer-protection": "from-teal-500 via-emerald-500 to-green-500",
  "operational-risk": "from-amber-500 via-orange-500 to-yellow-500",
};

// Category gradient lookup by module ID
export const moduleGradientMap: Record<string, string> = {
  "aml-fundamentals": "financial-crime",
  "kyc-fundamentals": "financial-crime",
  "sanctions-screening": "financial-crime",
  "peps-identification": "financial-crime",
  "suspicious-activity-reporting": "financial-crime",
  "smcr-fundamentals": "regulatory-compliance",
  "consumer-duty": "customer-protection",
  "vulnerable-customers": "customer-protection",
  "complaints-handling": "customer-protection",
  "financial-promotions": "customer-protection",
  "operational-resilience": "operational-risk",
};

// Accent emojis for gamification
export const accentEmojiMap: Record<string, string> = {
  "aml-fundamentals": "🔍",
  "kyc-fundamentals": "🤖",
  "sanctions-screening": "🌍",
  "peps-identification": "👑",
  "suspicious-activity-reporting": "🔔",
  "smcr-fundamentals": "🏛️",
  "consumer-duty": "☂️",
  "vulnerable-customers": "💗",
  "complaints-handling": "🤝",
  "financial-promotions": "📢",
  "operational-resilience": "⚙️",
};

// XP rewards based on module difficulty
export const xpRewardMap: Record<string, number> = {
  "aml-fundamentals": 50,
  "kyc-fundamentals": 45,
  "sanctions-screening": 55,
  "peps-identification": 40,
  "suspicious-activity-reporting": 60,
  "smcr-fundamentals": 65,
  "consumer-duty": 55,
  "vulnerable-customers": 45,
  "complaints-handling": 40,
  "financial-promotions": 50,
  "operational-resilience": 55,
};
