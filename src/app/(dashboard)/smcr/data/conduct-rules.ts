// FCA Conduct Rules for SM&CR

export interface ConductRule {
  id: string;
  ruleNumber: string;
  title: string;
  description: string;
  type: "individual" | "senior_manager";
  examples?: string[];
  indicators?: string[];
}

export const individualConductRules: ConductRule[] = [
  {
    id: "rule-1",
    ruleNumber: "Rule 1",
    title: "Integrity",
    description: "You must act with integrity",
    type: "individual",
    examples: [
      "Deliberately misleading clients or the firm",
      "Falsifying records or documentation",
      "Misappropriating client money or assets",
      "Failing to disclose conflicts of interest",
    ],
    indicators: [
      "Dishonest behaviour",
      "Manipulating systems or processes",
      "Breach of trust",
      "Deliberate concealment of facts",
    ],
  },
  {
    id: "rule-2",
    ruleNumber: "Rule 2",
    title: "Due Care, Skill and Diligence",
    description: "You must act with due care, skill and diligence",
    type: "individual",
    examples: [
      "Failing to properly assess client suitability",
      "Not following established procedures",
      "Inadequate supervision of staff",
      "Failure to maintain competence",
    ],
    indicators: [
      "Consistent errors or oversights",
      "Failure to follow training",
      "Ignoring risk warnings",
      "Inadequate record keeping",
    ],
  },
  {
    id: "rule-3",
    ruleNumber: "Rule 3",
    title: "Open and Cooperative with Regulators",
    description: "You must be open and cooperative with the FCA, the PRA and other regulators",
    type: "individual",
    examples: [
      "Withholding information from regulators",
      "Providing false or misleading information",
      "Obstructing regulatory investigations",
      "Failing to report notifiable matters",
    ],
    indicators: [
      "Delayed responses to regulatory requests",
      "Incomplete disclosures",
      "Inconsistent statements to regulators",
    ],
  },
  {
    id: "rule-4",
    ruleNumber: "Rule 4",
    title: "Proper Standards of Market Conduct",
    description: "You must pay due regard to the interests of customers and treat them fairly",
    type: "individual",
    examples: [
      "Mis-selling financial products",
      "Providing unsuitable advice",
      "Failing to disclose material information to customers",
      "Unfair treatment of vulnerable customers",
    ],
    indicators: [
      "Customer complaints patterns",
      "Unsuitable recommendations",
      "Poor customer outcomes",
    ],
  },
  {
    id: "rule-5",
    ruleNumber: "Rule 5",
    title: "Proper Standards of Market Conduct",
    description: "You must observe proper standards of market conduct",
    type: "individual",
    examples: [
      "Insider dealing",
      "Market manipulation",
      "Sharing confidential information inappropriately",
      "Front-running",
    ],
    indicators: [
      "Unusual trading patterns",
      "Inappropriate use of client information",
      "Suspicious timing of transactions",
    ],
  },
];

export const seniorManagerConductRules: ConductRule[] = [
  {
    id: "sc-1",
    ruleNumber: "SC1",
    title: "Effective Business Control",
    description: "You must take reasonable steps to ensure that the business of the firm for which you are responsible is controlled effectively",
    type: "senior_manager",
    examples: [
      "Failing to implement adequate controls",
      "Not addressing known control weaknesses",
      "Inadequate governance arrangements",
      "Poor management information",
    ],
    indicators: [
      "Recurring control failures",
      "Unaddressed audit findings",
      "Lack of oversight arrangements",
    ],
  },
  {
    id: "sc-2",
    ruleNumber: "SC2",
    title: "Regulatory Compliance",
    description: "You must take reasonable steps to ensure that the business of the firm for which you are responsible complies with the relevant requirements and standards of the regulatory system",
    type: "senior_manager",
    examples: [
      "Failure to implement regulatory requirements",
      "Ignoring compliance advice",
      "Not allocating adequate compliance resources",
      "Overriding compliance controls",
    ],
    indicators: [
      "Repeated regulatory breaches",
      "Inadequate compliance function",
      "Failure to implement change programmes",
    ],
  },
  {
    id: "sc-3",
    ruleNumber: "SC3",
    title: "Appropriate Delegation",
    description: "You must take reasonable steps to ensure that any delegation of your responsibilities is to an appropriate person and that you oversee the discharge of the delegated responsibility effectively",
    type: "senior_manager",
    examples: [
      "Delegating to unsuitable individuals",
      "Failing to monitor delegated responsibilities",
      "Inadequate handover arrangements",
      "No clear accountability",
    ],
    indicators: [
      "Unclear delegation arrangements",
      "Lack of oversight of delegates",
      "Failure to escalate issues from delegates",
    ],
  },
  {
    id: "sc-4",
    ruleNumber: "SC4",
    title: "Risk Management",
    description: "You must disclose appropriately any information of which the FCA or PRA would reasonably expect notice",
    type: "senior_manager",
    examples: [
      "Failing to report material incidents",
      "Withholding information about misconduct",
      "Not disclosing significant control failures",
      "Concealing regulatory breaches",
    ],
    indicators: [
      "Delayed regulatory notifications",
      "Incomplete disclosures",
      "Under-reporting of incidents",
    ],
  },
];

export const allConductRules = [...individualConductRules, ...seniorManagerConductRules];

export function getConductRuleById(id: string): ConductRule | undefined {
  return allConductRules.find((rule) => rule.id === id);
}

export function getConductRuleByNumber(ruleNumber: string): ConductRule | undefined {
  return allConductRules.find((rule) => rule.ruleNumber === ruleNumber);
}
