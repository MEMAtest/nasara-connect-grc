// Core SM&CR Functions and Configuration Data
// Based on the SM&CR Module Specification

import { SeniorManagementFunction, CertificationFunction, PrescribedResponsibility, ConductRule } from '../types';

// Universal Senior Management Functions
export const universalSMFs: SeniorManagementFunction[] = [
  {
    id: 'smf1',
    smf_number: 'SMF1',
    title: 'Chief Executive',
    description: 'The most senior executive responsible for the conduct of the whole of the firm\'s business',
    required_for: ['All firms'],
    prescribed_responsibilities: [1, 2, 3, 4, 5, 6],
    is_universal: true,
    category: 'universal'
  },
  {
    id: 'smf3',
    smf_number: 'SMF3',
    title: 'Executive Director',
    description: 'A director of the firm who is an employee of the firm or of a member of the firm\'s group',
    required_for: ['All firms with executive directors'],
    prescribed_responsibilities: [1, 2, 3, 4],
    is_universal: true,
    category: 'universal'
  },
  {
    id: 'smf16',
    smf_number: 'SMF16',
    title: 'Compliance Oversight',
    description: 'The senior manager who has responsibility for the firm\'s compliance function',
    required_for: ['Core firms'],
    prescribed_responsibilities: [15, 16, 17],
    is_universal: true,
    category: 'universal'
  },
  {
    id: 'smf17',
    smf_number: 'SMF17',
    title: 'Money Laundering Reporting Officer',
    description: 'The person appointed as the firm\'s money laundering reporting officer (MLRO)',
    required_for: ['All firms'],
    prescribed_responsibilities: [18],
    is_universal: true,
    category: 'universal'
  },
  {
    id: 'smf27',
    smf_number: 'SMF27',
    title: 'Partner (Limited Scope)',
    description: 'A partner in a limited scope CASS firm who has executive responsibility',
    required_for: ['Limited scope firms'],
    prescribed_responsibilities: [1, 2],
    is_universal: true,
    category: 'universal'
  }
];

// Payment Services Specific SMFs
export const paymentSpecificSMFs: SeniorManagementFunction[] = [
  {
    id: 'smf4',
    smf_number: 'SMF4',
    title: 'Chief Risk Officer',
    description: 'The senior manager who has responsibility for risk management',
    required_for: ['Enhanced firms', 'Payment institutions > £250m'],
    prescribed_responsibilities: [9, 10, 11],
    unique_requirements: [
      'Safeguarding oversight',
      'Operational resilience reporting'
    ],
    is_universal: false,
    category: 'payment_specific'
  }
];

// Investment Specific SMFs
export const investmentSpecificSMFs: SeniorManagementFunction[] = [
  {
    id: 'smf24',
    smf_number: 'SMF24',
    title: 'Chief Operations',
    description: 'The senior manager responsible for the firm\'s operations',
    required_for: ['IFPR firms'],
    prescribed_responsibilities: [12, 13, 14],
    additional_duties: [
      'CASS oversight',
      'Client money reconciliation'
    ],
    is_universal: false,
    category: 'investment_specific'
  },
  {
    id: 'smf9',
    smf_number: 'SMF9',
    title: 'Chair',
    description: 'Chair of the governing body',
    required_for: ['Investment firms subject to MiFID alignment'],
    prescribed_responsibilities: [7, 8],
    is_universal: false,
    category: 'investment_specific'
  },
  {
    id: 'smf10',
    smf_number: 'SMF10',
    title: 'Chair of Risk Committee',
    description: 'Chair of the risk committee',
    required_for: ['Large investment firms'],
    prescribed_responsibilities: [9, 10],
    is_universal: false,
    category: 'investment_specific'
  }
];

// PSD (Payment Services Directive) Specific Functions
// These are the key roles required under PSR/EMR regulations
export interface PSDFunction {
  id: string;
  psd_number: string;
  title: string;
  description: string;
  required_for: string[];
  regime: 'psd';
  regulatory_reference?: string;
  key_responsibilities?: string[];
}

export const psdFunctions: PSDFunction[] = [
  {
    id: 'psd-director',
    psd_number: 'PSD-DIR',
    title: 'Director (Payment Services)',
    description: 'Director responsible for the overall management and strategic direction of payment services activities',
    required_for: ['Payment Institutions', 'Electronic Money Institutions'],
    regime: 'psd',
    regulatory_reference: 'PSR Reg 6',
    key_responsibilities: [
      'Oversight of safeguarding arrangements',
      'Ensuring adequate capital maintenance',
      'Strategic planning for payment services',
      'Regulatory relationship management'
    ]
  },
  {
    id: 'psd-qualified',
    psd_number: 'PSD-QP',
    title: 'Qualified Person',
    description: 'Individual with appropriate qualifications and experience to manage payment services operations',
    required_for: ['Payment Institutions', 'Electronic Money Institutions'],
    regime: 'psd',
    regulatory_reference: 'PSR Reg 6(6)',
    key_responsibilities: [
      'Day-to-day management of payment services',
      'Ensuring operational compliance',
      'Staff competency and training oversight'
    ]
  },
  {
    id: 'psd-compliance',
    psd_number: 'PSD-CO',
    title: 'Compliance Officer (PSD)',
    description: 'Individual responsible for compliance with payment services regulations and AML requirements',
    required_for: ['Payment Institutions', 'Electronic Money Institutions', 'SPI/RAISPs'],
    regime: 'psd',
    regulatory_reference: 'PSR/EMR',
    key_responsibilities: [
      'Regulatory compliance monitoring',
      'AML/CTF compliance',
      'Regulatory reporting',
      'Policy development and review'
    ]
  },
  {
    id: 'psd-safeguarding',
    psd_number: 'PSD-SG',
    title: 'Safeguarding Officer',
    description: 'Individual responsible for ensuring proper safeguarding of customer funds',
    required_for: ['Payment Institutions', 'Electronic Money Institutions'],
    regime: 'psd',
    regulatory_reference: 'PSR Reg 19-23 / EMR Reg 20-22',
    key_responsibilities: [
      'Daily safeguarding reconciliations',
      'Segregation of customer funds',
      'Safeguarding audits coordination',
      'Insurance/guarantee arrangements'
    ]
  },
  {
    id: 'psd-operational',
    psd_number: 'PSD-OP',
    title: 'Operational Manager',
    description: 'Individual responsible for the operational aspects of payment services',
    required_for: ['Payment Institutions', 'Electronic Money Institutions'],
    regime: 'psd',
    key_responsibilities: [
      'Transaction processing oversight',
      'Operational risk management',
      'Service level management',
      'Incident management'
    ]
  },
  {
    id: 'psd-it-security',
    psd_number: 'PSD-IT',
    title: 'IT Security Officer',
    description: 'Individual responsible for IT security and operational resilience under PSD2',
    required_for: ['Payment Institutions', 'Electronic Money Institutions'],
    regime: 'psd',
    regulatory_reference: 'PSD2 RTS on SCA/CSC',
    key_responsibilities: [
      'Strong Customer Authentication compliance',
      'Secure communication protocols',
      'Fraud prevention systems',
      'Incident reporting to FCA'
    ]
  }
];

// All SMFs combined
export const allSMFs: SeniorManagementFunction[] = [
  ...universalSMFs,
  ...paymentSpecificSMFs,
  ...investmentSpecificSMFs
];

// Combined SMF and PSD Functions for unified selection
export type RegimeType = 'smcr' | 'psd' | 'both';

export interface UnifiedRole {
  id: string;
  number: string;
  title: string;
  description: string;
  regime: RegimeType;
  type: 'SMF' | 'CF' | 'PSD';
}

export function getAllRolesForRegime(regime: RegimeType): UnifiedRole[] {
  const roles: UnifiedRole[] = [];

  // Add SM&CR roles
  if (regime === 'smcr' || regime === 'both') {
    allSMFs.forEach((smf) => {
      roles.push({
        id: smf.id,
        number: smf.smf_number,
        title: smf.title,
        description: smf.description,
        regime: 'smcr',
        type: 'SMF',
      });
    });

    certificationFunctions.forEach((cf) => {
      roles.push({
        id: cf.id,
        number: cf.cf_number,
        title: cf.title,
        description: cf.description,
        regime: 'smcr',
        type: 'CF',
      });
    });
  }

  // Add PSD roles
  if (regime === 'psd' || regime === 'both') {
    psdFunctions.forEach((psd) => {
      roles.push({
        id: psd.id,
        number: psd.psd_number,
        title: psd.title,
        description: psd.description,
        regime: 'psd',
        type: 'PSD',
      });
    });
  }

  return roles;
}

// Certification Functions
export const certificationFunctions: CertificationFunction[] = [
  {
    id: 'cf30',
    cf_number: 'CF30',
    title: 'Customer-Facing (non-investment)',
    description: 'A function involving the exercise of customer-facing activities',
    applies_to: ['Consumer credit', 'Payment services'],
    annual_assessment: true
  },
  {
    id: 'cf29',
    cf_number: 'CF29',
    title: 'Limited Scope Function',
    description: 'Functions within limited scope firms',
    applies_to: ['Benchmark activities', 'Limited permissions'],
    annual_assessment: true
  },
  {
    id: 'cf28',
    cf_number: 'CF28',
    title: 'Systems & Controls',
    description: 'Responsibility for systems and controls in key areas',
    applies_to: ['Material risk-takers'],
    annual_assessment: true,
    competence_requirements: {
      technical_knowledge_test: true,
      annual_cpd_hours: 35
    }
  }
];

// Prescribed Responsibilities
export const prescribedResponsibilities: PrescribedResponsibility[] = [
  {
    id: 'pr1',
    pr_number: 'PR1',
    description: 'Performance of obligations under SM&CR',
    typical_holder: 'SMF1 or SMF3',
    evidence_required: [
      'Board minutes showing oversight',
      'Annual effectiveness review'
    ]
  },
  {
    id: 'pr2',
    pr_number: 'PR2',
    description: 'Performance of the obligations of the firm under the regulatory system',
    typical_holder: 'SMF1',
    evidence_required: [
      'Regulatory correspondence',
      'Compliance monitoring reports'
    ]
  },
  {
    id: 'pr3',
    pr_number: 'PR3',
    description: 'Performance of the obligations of the firm under the financial crime rules',
    typical_holder: 'SMF1 or SMF17',
    evidence_required: [
      'Financial crime policy documentation',
      'MLRO reports',
      'Training records'
    ]
  },
  {
    id: 'pr15',
    pr_number: 'PR15',
    description: 'Compliance with rules and guidance',
    typical_holder: 'SMF16',
    evidence_required: [
      'Compliance monitoring program',
      'Breach registers',
      'Regulatory change assessments'
    ],
    monitoring: [
      'Quarterly compliance reports',
      'Breach log reviews'
    ]
  },
  {
    id: 'pr16',
    pr_number: 'PR16',
    description: 'Performance of the compliance function',
    typical_holder: 'SMF16',
    evidence_required: [
      'Compliance function terms of reference',
      'Resource adequacy assessments',
      'Independence arrangements'
    ]
  },
  {
    id: 'pr17',
    pr_number: 'PR17',
    description: 'Performance of the operational risk function',
    typical_holder: 'SMF4 or SMF16',
    evidence_required: [
      'Operational risk framework',
      'Risk and control assessments',
      'Incident reporting'
    ]
  },
  {
    id: 'pr18',
    pr_number: 'PR18',
    description: 'Financial crime prevention',
    typical_holder: 'SMF17',
    evidence_required: [
      'Financial crime risk assessment',
      'AML policies and procedures',
      'Suspicious activity reporting'
    ],
    specific_checks: [
      'SAR submission records',
      'Annual MLRO report'
    ]
  }
];

// Individual Conduct Rules
export const individualConductRules: ConductRule[] = [
  {
    id: 'rule1',
    rule_number: 'Rule1',
    text: 'You must act with integrity',
    type: 'individual',
    breach_examples: [
      'Misleading a customer',
      'Falsifying records',
      'Misuse of position'
    ],
    severity_matrix: {
      minor: 'Warning + training',
      serious: 'Disciplinary + FCA notification',
      severe: 'Dismissal + prohibition consideration'
    }
  },
  {
    id: 'rule2',
    rule_number: 'Rule2',
    text: 'You must act with due skill, care and diligence',
    type: 'individual',
    breach_indicators: [
      'Repeated errors',
      'Failure to follow process',
      'Inadequate oversight'
    ],
    severity_matrix: {
      minor: 'Additional training + monitoring',
      serious: 'Performance improvement plan',
      severe: 'Role reassignment or dismissal'
    }
  },
  {
    id: 'rule3',
    rule_number: 'Rule3',
    text: 'You must be open and cooperative with the FCA, the PRA and other regulators',
    type: 'individual',
    breach_examples: [
      'Withholding information from regulators',
      'Providing false information',
      'Obstructing investigations'
    ],
    severity_matrix: {
      minor: 'Training + process reminder',
      serious: 'Formal disciplinary action',
      severe: 'Dismissal + regulatory referral'
    }
  },
  {
    id: 'rule4',
    rule_number: 'Rule4',
    text: 'You must pay due regard to the interests of customers and treat them fairly',
    type: 'individual',
    breach_examples: [
      'Unfair treatment of customers',
      'Conflicts of interest not managed',
      'Poor complaint handling'
    ],
    severity_matrix: {
      minor: 'Customer service training',
      serious: 'Formal warning + monitoring',
      severe: 'Removal from customer-facing role'
    }
  },
  {
    id: 'rule5',
    rule_number: 'Rule5',
    text: 'You must observe proper standards of market conduct',
    type: 'individual',
    breach_examples: [
      'Market manipulation',
      'Insider dealing',
      'Benchmark manipulation'
    ],
    severity_matrix: {
      minor: 'Training + monitoring',
      serious: 'Suspension + investigation',
      severe: 'Dismissal + criminal referral'
    }
  }
];

// Senior Manager Conduct Rules
export const seniorManagerConductRules: ConductRule[] = [
  {
    id: 'sc1',
    rule_number: 'SC1',
    text: 'You must take reasonable steps to ensure that the business of the firm for which you are responsible is controlled effectively',
    type: 'senior_manager',
    evidence_requirements: [
      'Governance framework documentation',
      'Control effectiveness reviews',
      'Management information analysis'
    ]
  },
  {
    id: 'sc2',
    rule_number: 'SC2',
    text: 'You must take reasonable steps to ensure that the business of the firm for which you are responsible complies with the relevant requirements and standards of the regulatory system',
    type: 'senior_manager',
    evidence_requirements: [
      'Compliance monitoring reports',
      'Regulatory correspondence',
      'Breach remediation evidence'
    ]
  },
  {
    id: 'sc3',
    rule_number: 'SC3',
    text: 'You must take reasonable steps to ensure that any delegation of your responsibilities is to an appropriate person and that you oversee the discharge of the delegated responsibility effectively',
    type: 'senior_manager',
    evidence_requirements: [
      'Delegation arrangements documentation',
      'Oversight and monitoring evidence',
      'Regular review meetings'
    ]
  },
  {
    id: 'sc4',
    rule_number: 'SC4',
    text: 'You must disclose appropriately any information of which the FCA or PRA would reasonably expect notice',
    type: 'senior_manager',
    critical_timelines: [
      'Immediately: Material breaches',
      'Without delay: Significant events'
    ],
    evidence_requirements: [
      'Notification procedures',
      'Escalation protocols',
      'Communication records'
    ]
  }
];

// All Conduct Rules combined
export const allConductRules: ConductRule[] = [
  ...individualConductRules,
  ...seniorManagerConductRules
];

// Firm Type Configurations
export const firmTypeConfigurations = {
  consumer_credit_limited: {
    core_smcr: true,
    enhanced_smcr: false,
    required_smfs: ['SMF1', 'SMF16', 'SMF17'],
    certification_regime: false,
    conduct_rules: 'basic'
  },
  consumer_credit_full: {
    core_smcr: true,
    enhanced_smcr: true,
    required_smfs: ['SMF1', 'SMF3', 'SMF16', 'SMF17'],
    certification_regime: true,
    conduct_rules: 'full'
  },
  payment_services_spi: {
    core_smcr: true,
    enhanced_smcr: false,
    required_smfs: ['SMF1', 'SMF16', 'SMF17'],
    certification_regime: true,
    conduct_rules: 'full'
  },
  payment_services_api_pi: {
    core_smcr: true,
    enhanced_smcr: true,
    required_smfs: ['SMF1', 'SMF3', 'SMF4', 'SMF16', 'SMF17'],
    certification_regime: true,
    conduct_rules: 'full'
  },
  investment_sni: {
    core_smcr: true,
    enhanced_smcr: false,
    required_smfs: ['SMF1', 'SMF16', 'SMF17'],
    certification_regime: true,
    conduct_rules: 'full'
  },
  investment_non_sni: {
    core_smcr: true,
    enhanced_smcr: true,
    required_smfs: ['SMF1', 'SMF3', 'SMF4', 'SMF9', 'SMF10', 'SMF16', 'SMF17', 'SMF24'],
    certification_regime: true,
    conduct_rules: 'full'
  }
};

// Key Timeline Configurations
export const keyTimelines = {
  regulatory_reference_request: {
    trigger: 'Conditional offer made',
    timeline: '1 week',
    critical: true
  },
  criminal_record_check: {
    trigger: 'Before start date',
    timeline: 'Prior to appointment',
    critical: true
  },
  fitness_propriety_assessment: {
    trigger: 'Before appointment',
    timeline: 'Prior to start',
    critical: true
  },
  fca_notification_form_a: {
    trigger: 'SMF appointment',
    timeline: '3 months before start',
    critical: true
  },
  conduct_breach_notification: {
    trigger: 'Serious breach identified',
    timeline: 'Reasonable time (immediate for serious)',
    critical: true
  },
  annual_certification: {
    trigger: 'Annual cycle',
    timeline: 'Within 12 months',
    critical: false
  }
};

// Performance Metrics Configuration
export const performanceMetricsConfig = [
  {
    metric_name: 'Regulatory breaches',
    threshold: 0,
    rag_criteria: {
      green: 0,
      amber: 1,
      red: 2
    }
  },
  {
    metric_name: 'Training completion %',
    threshold: 100,
    rag_criteria: {
      green: 100,
      amber: 95,
      red: 90
    }
  },
  {
    metric_name: 'Attestation timeliness %',
    threshold: 100,
    rag_criteria: {
      green: 100,
      amber: 95,
      red: 90
    }
  },
  {
    metric_name: 'F&P assessments current %',
    threshold: 100,
    rag_criteria: {
      green: 100,
      amber: 95,
      red: 90
    }
  }
];