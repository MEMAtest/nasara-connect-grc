// Module: Payment Services & E-Money Regulations
// Overview of PSD2/EMD2 permissions, safeguarding, and conduct expectations

import { TrainingModule } from '../types';

export const paymentsRegulationModule: TrainingModule = {
  id: 'payments-regulation',
  title: 'Payment Services & E-Money Regulations (PSD2/EMD2)',
  description: 'Understand the authorization scope, safeguarding requirements, and conduct expectations for payment institutions and e-money firms under PSD2 and EMD2.',
  category: 'regulatory-compliance',
  duration: 50,
  difficulty: 'intermediate',
  targetPersonas: [
    'compliance-officer',
    'senior-manager',
    'operations-staff',
    'certified-person'
  ],
  prerequisiteModules: ['aml-fundamentals', 'consumer-duty-implementation'],
  tags: [
    'PSD2',
    'EMD2',
    'payment services',
    'e-money',
    'safeguarding',
    'FCA',
    'regulatory reporting'
  ],
  learningOutcomes: [
    'Explain the scope of payment services and e-money permissions under PSD2/EMD2',
    'Describe the safeguarding expectations for relevant funds and e-money',
    'Identify key conduct requirements including customer communications and transparency',
    'Outline reporting, notifications, and audit expectations for payment firms'
  ],
  hook: {
    type: 'case-study',
    content: 'A fast-growing payments firm launches new wallet features and onboarding journeys. The FCA asks how the firm safeguards funds, manages agent oversight, and ensures the new service remains within permissions. PSD2 and EMD2 require clear scope definitions, safeguarding controls, and evidence of ongoing compliance.',
    keyQuestion: 'If the FCA asked today, could you show how each payment flow maps to your permissions and safeguarding controls?'
  },
  lessons: [
    {
      id: 'permissions-scope',
      title: 'Permissions and Scope',
      type: 'content',
      duration: 20,
      content: {
        learningPoint: 'PSD2 and EMD2 permissions define what activities you can perform, how you serve customers, and what evidence you must maintain.',
        mainContent: 'Identify which regulated activities apply (e.g., money remittance, account information, payment initiation, issuing e-money) and document the boundaries of each service. Clear scope mapping prevents permissions drift as products evolve.',
        keyConcepts: [
          { term: 'PSD2 Permissions', definition: 'The regulated payment services that a firm is authorized to provide.' },
          { term: 'EMD2', definition: 'Regulatory framework for issuing and managing e-money.' },
          { term: 'Permissions Mapping', definition: 'Documented linkage between product features and regulatory permissions.' }
        ],
        regulatoryRequirements: [
          'Payment Services Regulations 2017',
          'Electronic Money Regulations 2011'
        ]
      }
    },
    {
      id: 'safeguarding-conduct',
      title: 'Safeguarding and Conduct Expectations',
      type: 'content',
      duration: 25,
      content: {
        learningPoint: 'Safeguarding and customer communication are core FCA expectations for payment and e-money firms.',
        mainContent: 'Safeguarding requires segregation, reconciliation, and clear oversight. Conduct requirements include transparent fees, clear customer communications, complaint handling, and evidence of fair outcomes. Build a reporting cadence to evidence compliance.',
        keyConcepts: [
          { term: 'Safeguarding', definition: 'Protection of relevant funds through segregation and reconciliation.' },
          { term: 'Operational Oversight', definition: 'Governance over agents, outsourcing, and operational controls.' },
          { term: 'Regulatory Reporting', definition: 'Timely submissions and notifications to the FCA.' }
        ],
        regulatoryRequirements: [
          'FCA Safeguarding Guidance',
          'FCA Handbook: SYSC and DISP'
        ]
      }
    }
  ],
  assessmentQuestions: [
    {
      id: 'payments-reg-q1',
      question: 'Which statement best describes safeguarding for payment firms?',
      options: [
        { id: 'a', text: 'Safeguarding is optional for small firms', isCorrect: false },
        { id: 'b', text: 'Relevant funds must be segregated and reconciled', isCorrect: true },
        { id: 'c', text: 'Safeguarding only applies to e-money firms', isCorrect: false },
        { id: 'd', text: 'Safeguarding is replaced by insurance only', isCorrect: false }
      ],
      correctAnswer: 1,
      explanation: 'Safeguarding requires segregation and reconciliation of relevant funds for payment and e-money firms.'
    },
    {
      id: 'payments-reg-q2',
      question: 'Why is permissions mapping important?',
      options: [
        { id: 'a', text: 'It avoids permissions drift as services evolve', isCorrect: true },
        { id: 'b', text: 'It replaces the need for FCA reporting', isCorrect: false },
        { id: 'c', text: 'It only applies to agent oversight', isCorrect: false },
        { id: 'd', text: 'It is optional once authorization is granted', isCorrect: false }
      ],
      correctAnswer: 0,
      explanation: 'Permissions mapping ensures new products remain within the authorized scope.'
    }
  ],
  summary: {
    keyTakeaways: [
      'PSD2/EMD2 permissions set the boundaries for payment and e-money services.',
      'Safeguarding controls and reconciliations are core FCA expectations.',
      'Customer communications and reporting evidence ongoing compliance.'
    ],
    nextSteps: [
      'Map each product feature to a specific permission.',
      'Document safeguarding controls and reconciliation cadence.',
      'Create a regulatory reporting calendar and ownership map.'
    ],
    quickReference: [
      'PSD2 permissions mapping',
      'Safeguarding segregation and reconciliation',
      'FCA reporting cadence'
    ]
  }
};
