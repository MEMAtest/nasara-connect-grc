/**
 * Section Options - Pre-defined content choices for policy sections
 *
 * Allows firms to select from pre-written options instead of writing text,
 * making policy creation faster and more consistent.
 */

export interface SectionOption {
  id: string;
  label: string;
  description?: string;
  /** The content to insert when this option is selected */
  content: string;
}

export interface SectionOptionGroup {
  id: string;
  label: string;
  description?: string;
  /** Available options to choose from */
  options: SectionOption[];
  /** Default option ID if none selected */
  defaultOptionId?: string;
  /** Whether this is required */
  required?: boolean;
}

/**
 * Common option groups that can be reused across templates
 */
export const COMMON_OPTION_GROUPS = {
  // Complaint acknowledgment timeframes
  complaintAcknowledgment: {
    id: 'complaint-acknowledgment',
    label: 'Complaint Acknowledgment',
    description: 'How quickly will you acknowledge complaints?',
    required: true,
    options: [
      {
        id: 'same-day',
        label: 'Same business day',
        description: 'Best practice for customer satisfaction',
        content: 'All complaints will be acknowledged on the same business day they are received, and no later than 24 hours from receipt.',
      },
      {
        id: 'next-day',
        label: 'Next business day',
        description: 'Standard practice',
        content: 'All complaints will be acknowledged within one business day of receipt.',
      },
      {
        id: 'three-days',
        label: 'Within 3 business days',
        description: 'Minimum FCA requirement',
        content: 'All complaints will be acknowledged within three business days of receipt, in line with FCA DISP requirements.',
      },
    ],
    defaultOptionId: 'next-day',
  } as SectionOptionGroup,

  // Complaint resolution targets
  complaintResolution: {
    id: 'complaint-resolution',
    label: 'Resolution Target',
    description: 'Target timeframe for resolving complaints',
    required: true,
    options: [
      {
        id: 'two-weeks',
        label: 'Within 2 weeks',
        description: 'Ambitious target for simple complaints',
        content: 'The firm aims to resolve all complaints within 2 weeks of receipt where possible. Complex complaints may require additional time.',
      },
      {
        id: 'four-weeks',
        label: 'Within 4 weeks',
        description: 'Standard practice',
        content: 'The firm aims to resolve complaints within 4 weeks of receipt. Where this is not possible, a holding response will be sent explaining the delay.',
      },
      {
        id: 'eight-weeks',
        label: 'Within 8 weeks',
        description: 'Maximum FCA timeframe',
        content: 'Complaints will be resolved within 8 weeks of receipt in accordance with FCA DISP rules. The complainant will be kept informed of progress throughout.',
      },
    ],
    defaultOptionId: 'four-weeks',
  } as SectionOptionGroup,

  // Escalation approach
  escalationApproach: {
    id: 'escalation-approach',
    label: 'Escalation Process',
    description: 'How complaints are escalated internally',
    options: [
      {
        id: 'immediate',
        label: 'Immediate escalation',
        description: 'All complaints escalated to senior management',
        content: 'All complaints are immediately escalated to the Complaints Manager for review and allocation. The Compliance Officer is notified of all new complaints within 24 hours.',
      },
      {
        id: 'tiered',
        label: 'Tiered escalation',
        description: 'Escalate based on severity',
        content: 'Complaints are triaged on receipt. Standard complaints are handled by the customer service team. Complex or high-value complaints are escalated to the Complaints Manager. Complaints involving potential regulatory breaches are escalated to the Compliance Officer.',
      },
      {
        id: 'threshold',
        label: 'Threshold-based',
        description: 'Escalate based on value/impact',
        content: 'Complaints involving potential redress above £500, regulatory matters, or vulnerable customers are escalated to senior management. All other complaints are handled by trained complaints handlers.',
      },
    ],
    defaultOptionId: 'tiered',
  } as SectionOptionGroup,

  // FOS information timing
  fosInformation: {
    id: 'fos-information',
    label: 'FOS Referral Rights',
    description: 'When to inform customers about the Financial Ombudsman Service',
    options: [
      {
        id: 'acknowledgment',
        label: 'At acknowledgment',
        description: 'Inform early in the process',
        content: 'Customers are informed of their right to refer the complaint to the Financial Ombudsman Service (FOS) in the acknowledgment letter, and again in the final response.',
      },
      {
        id: 'final-response',
        label: 'At final response only',
        description: 'Standard approach',
        content: 'The final response letter will inform the customer of their right to refer the complaint to the Financial Ombudsman Service (FOS) if they remain dissatisfied, and will include the FOS contact details and time limits.',
      },
    ],
    defaultOptionId: 'final-response',
  } as SectionOptionGroup,

  // Vulnerable customer identification
  vulnerableIdentification: {
    id: 'vulnerable-identification',
    label: 'Vulnerability Identification',
    description: 'How vulnerability is identified',
    options: [
      {
        id: 'proactive',
        label: 'Proactive identification',
        description: 'Actively screen for vulnerability',
        content: 'Staff are trained to proactively identify potential signs of vulnerability during all customer interactions. Specific questions are included in customer onboarding and review processes to identify vulnerability characteristics.',
      },
      {
        id: 'disclosure',
        label: 'Disclosure-based',
        description: 'Respond to customer disclosure',
        content: 'The firm responds supportively when customers disclose vulnerability. Staff are trained to recognise and respond appropriately to disclosures, and to offer appropriate support and adjustments.',
      },
      {
        id: 'combined',
        label: 'Combined approach',
        description: 'Both proactive and disclosure-based',
        content: 'The firm uses a combined approach to vulnerability identification. Staff proactively look for signs of vulnerability while also being trained to respond supportively to customer disclosures. Regular touchpoints are used to check on customer circumstances.',
      },
    ],
    defaultOptionId: 'combined',
  } as SectionOptionGroup,

  // Review frequency
  policyReview: {
    id: 'policy-review',
    label: 'Policy Review Frequency',
    description: 'How often the policy is reviewed',
    required: true,
    options: [
      {
        id: 'quarterly',
        label: 'Quarterly',
        description: 'Every 3 months',
        content: 'This policy will be reviewed quarterly by the Compliance function, with updates approved by senior management. Ad-hoc reviews will be triggered by regulatory changes or significant incidents.',
      },
      {
        id: 'biannual',
        label: 'Bi-annually',
        description: 'Every 6 months',
        content: 'This policy will be reviewed every six months by the Compliance function, with updates approved by the Board or designated committee. Interim reviews may be triggered by regulatory changes.',
      },
      {
        id: 'annual',
        label: 'Annually',
        description: 'Once per year',
        content: 'This policy will be reviewed annually as part of the firm\'s policy review cycle. The review will be conducted by the Compliance function and approved by the Board. Material changes to regulation will trigger an interim review.',
      },
    ],
    defaultOptionId: 'annual',
  } as SectionOptionGroup,

  // Training requirements
  trainingRequirements: {
    id: 'training-requirements',
    label: 'Training Requirements',
    description: 'Staff training frequency and approach',
    options: [
      {
        id: 'annual-all',
        label: 'Annual refresher for all staff',
        description: 'Standard approach',
        content: 'All relevant staff will complete training on this policy area at induction and annually thereafter. Training completion is tracked and reported to management quarterly.',
      },
      {
        id: 'role-based',
        label: 'Role-based training',
        description: 'Tailored by role',
        content: 'Training requirements are tailored to role. Front-line staff receive detailed operational training annually. Support staff receive awareness training. Specialist roles receive enhanced training with assessment.',
      },
      {
        id: 'continuous',
        label: 'Continuous learning',
        description: 'Regular updates and refreshers',
        content: 'Staff receive initial comprehensive training at induction, with regular refresher modules throughout the year. Real-case scenarios and lessons learned are shared quarterly to reinforce learning.',
      },
    ],
    defaultOptionId: 'annual-all',
  } as SectionOptionGroup,

  // Record retention
  recordRetention: {
    id: 'record-retention',
    label: 'Record Retention',
    description: 'How long records are kept',
    options: [
      {
        id: 'three-years',
        label: '3 years',
        description: 'Standard FCA requirement',
        content: 'Records relating to this policy area will be retained for a minimum of 3 years from the date of the relevant transaction or activity, in line with FCA requirements.',
      },
      {
        id: 'five-years',
        label: '5 years',
        description: 'Extended retention',
        content: 'Records will be retained for a minimum of 5 years from the date of the relevant transaction or activity. This extended period allows for delayed complaints and regulatory enquiries.',
      },
      {
        id: 'six-years',
        label: '6 years',
        description: 'FOS time limit aligned',
        content: 'Records will be retained for 6 years from the date of the relevant transaction or activity, aligned with the FOS time limits for complaint referral.',
      },
    ],
    defaultOptionId: 'five-years',
  } as SectionOptionGroup,

  // AML risk assessment frequency
  amlRiskAssessment: {
    id: 'aml-risk-assessment',
    label: 'AML Risk Assessment',
    description: 'How often the business-wide risk assessment is updated',
    required: true,
    options: [
      {
        id: 'annual',
        label: 'Annual review',
        description: 'Standard approach',
        content: 'The business-wide AML/CTF risk assessment is reviewed annually, or more frequently if there are material changes to the business, customer base, or regulatory requirements. The review is led by the MLRO and approved by the Board.',
      },
      {
        id: 'biannual',
        label: 'Bi-annual review',
        description: 'More frequent updates',
        content: 'The business-wide risk assessment is reviewed every six months. This allows the firm to respond quickly to emerging risks and regulatory changes. Reviews are led by the MLRO with Board oversight.',
      },
      {
        id: 'continuous',
        label: 'Continuous monitoring',
        description: 'Ongoing assessment',
        content: 'The firm operates a continuous risk assessment approach with formal quarterly updates to the documented assessment. Material changes are escalated immediately. The MLRO provides monthly updates to senior management.',
      },
    ],
    defaultOptionId: 'annual',
  } as SectionOptionGroup,

  // EDD triggers
  eddTriggers: {
    id: 'edd-triggers',
    label: 'Enhanced Due Diligence Triggers',
    description: 'When enhanced due diligence is required',
    options: [
      {
        id: 'regulatory',
        label: 'Regulatory requirements only',
        description: 'PEPs and high-risk countries',
        content: 'Enhanced due diligence is applied to politically exposed persons (PEPs), customers from high-risk third countries, and other situations required by regulation. Source of wealth and source of funds are verified for all EDD cases.',
      },
      {
        id: 'risk-based',
        label: 'Risk-based approach',
        description: 'Based on customer risk score',
        content: 'Enhanced due diligence is applied to all high-risk customers as determined by the firm\'s risk scoring methodology. This includes PEPs, high-risk jurisdictions, complex structures, and customers with unusual activity patterns.',
      },
      {
        id: 'comprehensive',
        label: 'Comprehensive triggers',
        description: 'Wide range of triggers',
        content: 'EDD is triggered by: high customer risk score, PEP status, high-risk jurisdiction, complex ownership structures, unusual transaction patterns, adverse media, large or unusual transactions, and referrals from transaction monitoring.',
      },
    ],
    defaultOptionId: 'risk-based',
  } as SectionOptionGroup,
};

/**
 * Get option groups applicable to a specific template section
 */
export function getOptionGroupsForSection(
  templateCode: string,
  sectionId: string
): SectionOptionGroup[] {
  const sectionOptionMap: Record<string, Record<string, SectionOptionGroup[]>> = {
    COMPLAINTS: {
      'acknowledgment': [COMMON_OPTION_GROUPS.complaintAcknowledgment],
      'resolution': [COMMON_OPTION_GROUPS.complaintResolution, COMMON_OPTION_GROUPS.escalationApproach],
      'fos-referral': [COMMON_OPTION_GROUPS.fosInformation],
      'governance': [COMMON_OPTION_GROUPS.policyReview, COMMON_OPTION_GROUPS.trainingRequirements],
      'records': [COMMON_OPTION_GROUPS.recordRetention],
      // Map actual section IDs from mfs_complaints template
      'complaint_handling_rules': [COMMON_OPTION_GROUPS.complaintAcknowledgment, COMMON_OPTION_GROUPS.complaintResolution],
      'complaint_resolution_and_remediation': [COMMON_OPTION_GROUPS.escalationApproach],
      'fos_referrals_and_engagement': [COMMON_OPTION_GROUPS.fosInformation],
      'policy_governance_and_review': [COMMON_OPTION_GROUPS.policyReview],
      'training_and_competence': [COMMON_OPTION_GROUPS.trainingRequirements],
    },
    VULNERABLE_CUST: {
      'identification': [COMMON_OPTION_GROUPS.vulnerableIdentification],
      'review': [COMMON_OPTION_GROUPS.policyReview],
      'training': [COMMON_OPTION_GROUPS.trainingRequirements],
    },
    AML_CTF: {
      'bwra': [COMMON_OPTION_GROUPS.amlRiskAssessment],
      'cdd': [COMMON_OPTION_GROUPS.eddTriggers],
      'records': [COMMON_OPTION_GROUPS.recordRetention],
      'training': [COMMON_OPTION_GROUPS.trainingRequirements],
      'governance': [COMMON_OPTION_GROUPS.policyReview],
    },
    CONSUMER_DUTY: {
      'governance': [COMMON_OPTION_GROUPS.policyReview],
      'training': [COMMON_OPTION_GROUPS.trainingRequirements],
    },
  };

  return sectionOptionMap[templateCode]?.[sectionId] ?? [];
}

/**
 * Apply selected options to generate additional clause content
 */
export function applyOptionSelections(
  selections: Record<string, string>, // groupId -> optionId
  templateCode: string,
  sectionId: string
): string {
  const groups = getOptionGroupsForSection(templateCode, sectionId);
  const contents: string[] = [];

  for (const group of groups) {
    const selectedOptionId = selections[group.id] || group.defaultOptionId;
    const selectedOption = group.options.find(o => o.id === selectedOptionId);
    if (selectedOption) {
      contents.push(selectedOption.content);
    }
  }

  return contents.join('\n\n');
}
