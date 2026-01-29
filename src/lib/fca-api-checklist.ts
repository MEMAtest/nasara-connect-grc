/**
 * FCA API Documentation Checklist
 *
 * Comprehensive checklist for FCA Authorised Payment Institution (API) applications.
 * Based on FCA Connect submission requirements.
 */

export type ChecklistItemStatus =
  | 'not_started'
  | 'in_progress'
  | 'draft_ready'
  | 'reviewed'
  | 'final_ready'
  | 'submitted';

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  fcaReference?: string;
  applicability?: string;
}

export interface ChecklistCategory {
  id: string;
  title: string;
  icon: string;
  phase: string;
  accentColor: 'teal' | 'blue' | 'purple' | 'amber' | 'green';
  items: ChecklistItem[];
}

// Timeline phases with their week ranges and colors
export const TIMELINE_PHASES = [
  { id: 'assessment', name: 'Assessment & Scoping', startWeek: 1, endWeek: 2, color: 'teal' },
  { id: 'narrative', name: 'Narrative & Business Plan', startWeek: 3, endWeek: 16, color: 'blue' },
  { id: 'policies', name: 'Policies & Controls', startWeek: 17, endWeek: 37, color: 'purple' },
  { id: 'governance', name: 'Governance & SMCR', startWeek: 21, endWeek: 53, color: 'amber' },
  { id: 'submission', name: 'Review & Submission', startWeek: 54, endWeek: 56, color: 'green' },
] as const;

// Map phases to their associated checklist category IDs
export const PHASE_TO_CATEGORY_MAP: Record<string, string[]> = {
  'Assessment & Scoping': ['connect-forms', 'corporate-legal'],
  'Narrative & Business Plan': ['programme-operations', 'business-plan-financials', 'capital-own-funds'],
  'Policies & Controls': ['safeguarding', 'it-security', 'aml-ctf', 'policies-procedures'],
  'Governance & SMCR': ['governance-controls', 'outsourcing-structure'],
  'Review & Submission': [],
};

export const CHECKLIST_STATUS_OPTIONS: Array<{
  value: ChecklistItemStatus;
  label: string;
  color: string;
  bgColor: string;
  icon: 'empty' | 'half' | 'three-quarter' | 'filled' | 'check' | 'double-check';
}> = [
  {
    value: 'not_started',
    label: 'Not started',
    color: 'text-slate-500',
    bgColor: 'bg-slate-100',
    icon: 'empty'
  },
  {
    value: 'in_progress',
    label: 'In progress',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    icon: 'half'
  },
  {
    value: 'draft_ready',
    label: 'Draft ready',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: 'three-quarter'
  },
  {
    value: 'reviewed',
    label: 'Reviewed',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: 'filled'
  },
  {
    value: 'final_ready',
    label: 'Final ready',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: 'check'
  },
  {
    value: 'submitted',
    label: 'Submitted',
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    icon: 'double-check'
  },
];

export const FCA_API_CHECKLIST: ChecklistCategory[] = [
  {
    id: 'connect-forms',
    title: 'Connect Submission Forms',
    icon: 'FileText',
    phase: 'Assessment & Scoping',
    accentColor: 'teal',
    items: [
      {
        id: 'api-form',
        label: 'API Application Form',
        description: 'Authorisation as a Payment Institution - primary application form with answers to all sections.',
        fcaReference: 'FCA Connect API application form',
      },
      {
        id: 'psd-individuals',
        label: 'Individuals Form for PIs (PSD Individual)',
        description: 'Registers individuals responsible for managing the PI - one form per director and manager.',
        fcaReference: 'FCA PI applicants page',
      },
      {
        id: 'qualifying-holdings',
        label: 'Qualifying holding (controller) forms',
        description: 'Registers each person/firm with 10%+ holding - forms vary by controller type.',
        fcaReference: 'FCA Controllers forms',
      },
      {
        id: 'main-contact',
        label: 'Main contact details',
        description: 'Internal individual designated as main contact for the application.',
        fcaReference: 'FCA Connect contact section',
      },
      {
        id: 'na-explanations',
        label: "Explanation for any 'not applicable' answers",
        description: 'Written justification for any sections marked as not applicable.',
        fcaReference: 'Application supporting document',
      },
    ],
  },
  {
    id: 'corporate-legal',
    title: 'Corporate & Legal',
    icon: 'Building2',
    phase: 'Assessment & Scoping',
    accentColor: 'teal',
    items: [
      {
        id: 'cert-incorporation',
        label: 'Certificate of Incorporation',
        description: 'Companies House certificate proving legal entity registration.',
        fcaReference: 'SUP 6.3',
      },
      {
        id: 'articles-association',
        label: 'Articles of Association',
        description: 'Current articles governing the company\'s operations.',
        fcaReference: 'SUP 6.3',
      },
      {
        id: 'partnership-agreement',
        label: 'Partnership agreement deeds',
        description: 'Partnership documentation if applicant is a partnership.',
        applicability: 'If applicable - partnerships only',
      },
      {
        id: 'llp-agreement',
        label: 'LLP agreement deeds',
        description: 'LLP members\' agreement if applicant is an LLP.',
        applicability: 'If applicable - LLPs only',
      },
    ],
  },
  {
    id: 'programme-operations',
    title: 'Programme of Operations & Agreements',
    icon: 'BarChart3',
    phase: 'Narrative & Business Plan',
    accentColor: 'blue',
    items: [
      {
        id: 'poo-document',
        label: 'Programme of Operations (PoO) document',
        description: 'Detailed description of planned payment services, client types, and operational model.',
        fcaReference: 'PSR 5.4',
      },
      {
        id: 'flow-funds-diagram',
        label: 'Flow of funds diagram',
        description: 'Visual representation of how funds move through the business.',
        fcaReference: 'PSR 5.4',
      },
      {
        id: 'draft-contracts',
        label: 'Draft contracts between parties',
        description: 'Template contracts with partners, agents, distributors.',
        fcaReference: 'PSR 5.4',
      },
      {
        id: 'customer-framework',
        label: 'Draft customer framework contract (T&Cs)',
        description: 'Terms and conditions for end customers using payment services.',
        fcaReference: 'PSR 5.4, BCOBS',
      },
      {
        id: 'ancillary-services',
        label: 'Ancillary services description',
        description: 'Description of any non-payment services offered alongside regulated activities.',
        applicability: 'If applicable',
      },
      {
        id: 'credit-granting',
        label: 'Credit granting model documentation',
        description: 'If offering credit related to payment services, detailed model and risk assessment.',
        applicability: 'If applicable - credit granting PIs only',
      },
      {
        id: 'overseas-services',
        label: 'Overseas services plan',
        description: 'Plan for passporting or providing services outside the UK.',
        applicability: 'If applicable',
      },
      {
        id: 'other-business',
        label: 'Other business activities description + risk mitigation',
        description: 'Description of non-regulated business and how risks are managed.',
        fcaReference: 'PSR 5.4',
      },
      {
        id: 'pii-calculation',
        label: 'PII minimum calculation support',
        description: 'Professional indemnity insurance calculation if providing PIS/AIS services.',
        applicability: 'If PIS/AIS only',
        fcaReference: 'PSR 5.6',
      },
    ],
  },
  {
    id: 'outsourcing-structure',
    title: 'Outsourcing & Structure',
    icon: 'Network',
    phase: 'Governance & SMCR',
    accentColor: 'amber',
    items: [
      {
        id: 'org-chart',
        label: 'Structural organisation description (org chart)',
        description: 'Organisational chart showing governance, reporting lines, and key functions.',
        fcaReference: 'SYSC 4',
      },
      {
        id: 'outsourcing-register',
        label: 'Outsourcing register / overview',
        description: 'Register of all outsourced functions with criticality assessment.',
        fcaReference: 'SYSC 8',
      },
      {
        id: 'outsourcing-agreements',
        label: 'Draft outsourcing agreements',
        description: 'Template or draft agreements with critical outsource providers.',
        fcaReference: 'SYSC 8',
      },
    ],
  },
  {
    id: 'business-plan-financials',
    title: 'Business Plan & Financials',
    icon: 'Briefcase',
    phase: 'Narrative & Business Plan',
    accentColor: 'blue',
    items: [
      {
        id: 'business-plan',
        label: 'Business plan (tailored)',
        description: 'Comprehensive business plan covering strategy, market, operations, and growth.',
        fcaReference: 'PSR 5.4',
      },
      {
        id: 'marketing-plan',
        label: 'Marketing plan',
        description: 'Go-to-market strategy and customer acquisition approach.',
        fcaReference: 'PSR 5.4',
      },
      {
        id: 'historic-financials',
        label: 'Historic financial statements',
        description: 'Audited accounts if business has trading history.',
        applicability: 'If available',
      },
      {
        id: 'financial-forecasts',
        label: '3-year financial forecasts + assumptions',
        description: 'Detailed P&L, balance sheet, and cash flow projections with documented assumptions.',
        fcaReference: 'PSR 5.4',
      },
      {
        id: 'stress-scenarios',
        label: 'Stress / downside scenario forecasts',
        description: 'Financial projections under adverse conditions.',
        fcaReference: 'PSR 5.4',
      },
      {
        id: 'own-funds-forecast',
        label: 'Own funds forecast and capital calculations',
        description: 'Projected regulatory capital position over forecast period.',
        fcaReference: 'PSR 5.5',
      },
      {
        id: 'transaction-forecasts',
        label: 'Forecast volume/value of transactions',
        description: 'Projected payment volumes and values by service type.',
        fcaReference: 'PSR 5.4',
      },
    ],
  },
  {
    id: 'capital-own-funds',
    title: 'Capital & Own Funds',
    icon: 'Landmark',
    phase: 'Narrative & Business Plan',
    accentColor: 'blue',
    items: [
      {
        id: 'initial-capital',
        label: 'Initial capital requirement selection and rationale',
        description: 'Justification for Method A, B, or C capital calculation choice.',
        fcaReference: 'PSR 5.5',
      },
      {
        id: 'capital-evidence',
        label: 'Evidence of initial capital',
        description: 'Bank statements or auditor confirmation of available capital.',
        fcaReference: 'PSR 5.5',
      },
    ],
  },
  {
    id: 'safeguarding',
    title: 'Safeguarding',
    icon: 'Shield',
    phase: 'Policies & Controls',
    accentColor: 'purple',
    items: [
      {
        id: 'safeguarding-methodology',
        label: 'Safeguarding methodology description',
        description: 'Detailed explanation of chosen safeguarding approach and processes.',
        fcaReference: 'PSR 10',
      },
      {
        id: 'safeguarding-account',
        label: 'Draft safeguarding account agreement',
        description: 'Agreement with bank for segregated safeguarding account.',
        applicability: 'If Method 1 (segregation)',
        fcaReference: 'PSR 10.2',
      },
      {
        id: 'insurance-guarantee',
        label: 'Draft insurance/guarantee agreement',
        description: 'Insurance policy or guarantee documentation.',
        applicability: 'If Method 2 (insurance/guarantee)',
        fcaReference: 'PSR 10.3',
      },
    ],
  },
  {
    id: 'governance-controls',
    title: 'Governance & Controls',
    icon: 'Settings2',
    phase: 'Governance & SMCR',
    accentColor: 'amber',
    items: [
      {
        id: 'governance-arrangements',
        label: 'Governance arrangements document',
        description: 'Description of board structure, committees, and decision-making processes.',
        fcaReference: 'SYSC 4',
      },
      {
        id: 'cmp',
        label: 'Compliance Monitoring Programme (CMP)',
        description: 'Annual compliance monitoring plan with testing schedule.',
        fcaReference: 'SYSC 6',
      },
      {
        id: 'risk-register',
        label: 'Enterprise risk assessment / risk register',
        description: 'Comprehensive risk register with controls and mitigations.',
        fcaReference: 'SYSC 7',
      },
      {
        id: 'wind-down-plan',
        label: 'Wind-down plan',
        description: 'Plan for orderly cessation of business if required.',
        fcaReference: 'SUP 15A, PSR 5.4',
      },
      {
        id: 'regdata-capability',
        label: 'RegData capability statement',
        description: 'Confirmation of ability to submit regulatory returns via RegData.',
        fcaReference: 'SUP 16',
      },
    ],
  },
  {
    id: 'it-security',
    title: 'IT & Security',
    icon: 'Lock',
    phase: 'Policies & Controls',
    accentColor: 'purple',
    items: [
      {
        id: 'incident-management',
        label: 'Security incident management procedure',
        description: 'Process for detecting, responding to, and reporting security incidents.',
        fcaReference: 'PSR 19',
      },
      {
        id: 'security-contact',
        label: 'Security contact point details',
        description: 'Designated security contact for FCA communications.',
        fcaReference: 'PSR 19',
      },
      {
        id: 'sensitive-data-access',
        label: 'Sensitive payment data access policy',
        description: 'Controls for accessing customer payment data.',
        fcaReference: 'PSR 19',
      },
      {
        id: 'data-map',
        label: 'Data map / data flow diagrams',
        description: 'Visual representation of data flows through systems.',
        fcaReference: 'PSR 19, GDPR',
      },
      {
        id: 'bcp-dr',
        label: 'Business Continuity Plan (BCP) and DR',
        description: 'Business continuity and disaster recovery plans.',
        fcaReference: 'SYSC 4, PSR 19',
      },
      {
        id: 'statistical-reporting',
        label: 'Statistical reporting methodology',
        description: 'Approach for compiling fraud and complaint statistics.',
        fcaReference: 'PSR 19, SUP 16',
      },
      {
        id: 'security-policy',
        label: 'Security Policy Document (full)',
        description: 'Comprehensive information security policy.',
        fcaReference: 'PSR 19',
      },
    ],
  },
  {
    id: 'aml-ctf',
    title: 'AML/CTF',
    icon: 'Scale',
    phase: 'Policies & Controls',
    accentColor: 'purple',
    items: [
      {
        id: 'aml-policies',
        label: 'AML/CTF policies and procedures',
        description: 'Anti-money laundering and counter-terrorist financing policies.',
        fcaReference: 'MLR 2017',
      },
      {
        id: 'ml-tf-risk-assessment',
        label: 'Business-wide ML/TF risk assessment',
        description: 'Assessment of money laundering and terrorist financing risks.',
        fcaReference: 'MLR 2017 Reg 18',
      },
      {
        id: 'mlro-appointment',
        label: 'MLRO appointment and responsibilities',
        description: 'Documentation of MLRO role, responsibilities, and reporting lines.',
        fcaReference: 'MLR 2017 Reg 21',
      },
    ],
  },
  {
    id: 'policies-procedures',
    title: 'Policies & Procedures',
    icon: 'ScrollText',
    phase: 'Policies & Controls',
    accentColor: 'purple',
    items: [
      {
        id: 'policy-index',
        label: 'Index of all firm policies (with version control)',
        description: 'Master index of all policies with version numbers and review dates.',
        fcaReference: 'SYSC',
      },
      {
        id: 'complaints-policy',
        label: 'Complaints handling policy',
        description: 'Policy for handling customer complaints including FOS referral.',
        fcaReference: 'DISP',
      },
      {
        id: 'outsourcing-policy',
        label: 'Outsourcing policy & third-party risk management',
        description: 'Policy governing outsourcing decisions and third-party oversight.',
        fcaReference: 'SYSC 8',
      },
      {
        id: 'safeguarding-policy',
        label: 'Safeguarding policy & reconciliations procedure',
        description: 'Policy for safeguarding customer funds and daily reconciliation.',
        fcaReference: 'PSR 10',
      },
      {
        id: 'infosec-policy',
        label: 'Information security policy + standards',
        description: 'Information security policy and supporting standards.',
        fcaReference: 'PSR 19',
      },
      {
        id: 'access-control',
        label: 'Access control policy & logging standard',
        description: 'Access control policy including user provisioning and audit logging.',
        fcaReference: 'PSR 19',
      },
      {
        id: 'incident-response',
        label: 'Incident response plan (IRP)',
        description: 'Plan for responding to operational and security incidents.',
        fcaReference: 'PSR 19, SYSC 4',
      },
      {
        id: 'fraud-management',
        label: 'Fraud risk management policy',
        description: 'Policy for preventing, detecting, and responding to fraud.',
        fcaReference: 'PSR 19',
      },
      {
        id: 'operational-resilience',
        label: 'Operational resilience / BCP testing policy',
        description: 'Policy for testing business continuity and operational resilience.',
        fcaReference: 'SYSC 4, PS21/3',
      },
    ],
  },
];

/**
 * Get all checklist item IDs for initialization
 */
export function getAllChecklistItemIds(): string[] {
  return FCA_API_CHECKLIST.flatMap(category =>
    category.items.map(item => item.id)
  );
}

/**
 * Get total item count across all categories
 */
export function getTotalItemCount(): number {
  return FCA_API_CHECKLIST.reduce((total, category) =>
    total + category.items.length, 0
  );
}

/**
 * Calculate completion percentage for a given status map
 */
export function calculateCompletionPercentage(
  statuses: Record<string, ChecklistItemStatus>,
  completedStatuses: ChecklistItemStatus[] = ['final_ready', 'submitted']
): number {
  const total = getTotalItemCount();
  if (total === 0) return 0;

  const completed = Object.values(statuses).filter(status =>
    completedStatuses.includes(status)
  ).length;

  return Math.round((completed / total) * 100);
}

/**
 * Calculate category completion for display
 */
export function calculateCategoryCompletion(
  categoryId: string,
  statuses: Record<string, ChecklistItemStatus>,
  completedStatuses: ChecklistItemStatus[] = ['final_ready', 'submitted']
): { completed: number; total: number } {
  const category = FCA_API_CHECKLIST.find(c => c.id === categoryId);
  if (!category) return { completed: 0, total: 0 };

  const total = category.items.length;
  const completed = category.items.filter(item =>
    completedStatuses.includes(statuses[item.id] || 'not_started')
  ).length;

  return { completed, total };
}

/**
 * Get categories that belong to a specific phase
 */
export function getCategoriesByPhase(phase: string): ChecklistCategory[] {
  return FCA_API_CHECKLIST.filter(c => c.phase === phase);
}

/**
 * Calculate phase completion percentage based on checklist statuses
 */
export function calculatePhaseCompletion(
  phase: string,
  statuses: Record<string, ChecklistItemStatus>,
  completedStatuses: ChecklistItemStatus[] = ['final_ready', 'submitted']
): { completed: number; total: number; percentage: number } {
  const categories = getCategoriesByPhase(phase);
  let completed = 0;
  let total = 0;

  categories.forEach(category => {
    category.items.forEach(item => {
      total++;
      if (completedStatuses.includes(statuses[item.id] || 'not_started')) {
        completed++;
      }
    });
  });

  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}
