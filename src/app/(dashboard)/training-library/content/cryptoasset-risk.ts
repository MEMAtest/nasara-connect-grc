// Module: Cryptoasset Financial Crime Risk
// Focused training on cryptoasset risk, AML controls, and FCA expectations

import { TrainingModule } from '../types';

export const cryptoassetRiskModule: TrainingModule = {
  id: 'cryptoasset-risk',
  title: 'Cryptoasset Financial Crime Risk',
  description: 'Understand FCA expectations for cryptoasset registration, risk assessment, and financial crime controls.',
  category: 'financial-crime-prevention',
  duration: 45,
  difficulty: 'intermediate',
  targetPersonas: [
    'compliance-officer',
    'mlro',
    'senior-manager',
    'operations-staff'
  ],
  prerequisiteModules: ['aml-fundamentals', 'sanctions-training'],
  tags: [
    'cryptoassets',
    'financial crime',
    'FCA registration',
    'risk assessment',
    'travel rule'
  ],
  learningOutcomes: [
    'Identify cryptoasset-specific financial crime risks and typologies',
    'Design controls for onboarding, monitoring, and transaction screening',
    'Explain FCA expectations for risk assessment and governance in crypto firms'
  ],
  hook: {
    type: 'case-study',
    content: 'A cryptoasset exchange faces rapid growth but lacks clear risk assessment, travel rule compliance, or transaction monitoring. The FCA requests evidence of controls before registration approval.',
    keyQuestion: 'Can you demonstrate a crypto risk assessment and the controls that map to it?'
  },
  lessons: [
    {
      id: 'crypto-risk-landscape',
      title: 'Cryptoasset Risk Landscape',
      type: 'content',
      duration: 20,
      content: {
        learningPoint: 'Cryptoasset services introduce higher-risk typologies requiring enhanced controls.',
        mainContent: 'Risks include anonymous transfers, rapid layering, cross-border exposure, and sanctions evasion. Document inherent risk and align controls to the risk profile.',
        keyConcepts: [
          { term: 'Travel Rule', definition: 'Information sharing obligations for crypto transfers.' },
          { term: 'Blockchain Analytics', definition: 'Monitoring tools for transaction tracing and risk flags.' }
        ],
        regulatoryRequirements: [
          'MLR 2017 cryptoasset amendments',
          'FCA cryptoasset guidance'
        ]
      }
    },
    {
      id: 'controls-governance',
      title: 'Controls and Governance',
      type: 'content',
      duration: 20,
      content: {
        learningPoint: 'Controls must align to the crypto risk assessment and be evidenced for FCA review.',
        mainContent: 'Define onboarding, transaction monitoring, sanctions screening, and escalation workflows. Establish governance and MI reporting to demonstrate effectiveness.',
        keyConcepts: [
          { term: 'Enhanced Due Diligence', definition: 'Additional checks for higher-risk customers or transactions.' },
          { term: 'Suspicious Activity Reporting', definition: 'Escalation and SAR filing for high-risk events.' }
        ],
        regulatoryRequirements: [
          'FCA expectations for cryptoasset registration',
          'Suspicious activity reporting guidance'
        ]
      }
    }
  ],
  assessmentQuestions: [
    {
      id: 'crypto-q1',
      question: 'Cryptoasset firms should align controls to:',
      options: [
        { id: 'a', text: 'A documented crypto-specific risk assessment', isCorrect: true },
        { id: 'b', text: 'Only generic AML policies', isCorrect: false },
        { id: 'c', text: 'Marketing objectives', isCorrect: false },
        { id: 'd', text: 'Customer feedback only', isCorrect: false }
      ],
      correctAnswer: 0,
      explanation: 'Controls must be evidence-based and aligned to the crypto risk assessment.'
    },
    {
      id: 'crypto-q2',
      question: 'The cryptoasset travel rule requires firms to:',
      options: [
        { id: 'a', text: 'Share originator and beneficiary information for qualifying transfers', isCorrect: true },
        { id: 'b', text: 'Only record transfers internally without sharing', isCorrect: false },
        { id: 'c', text: 'Exclude transfers between hosted wallets', isCorrect: false },
        { id: 'd', text: 'Replace sanctions screening requirements', isCorrect: false }
      ],
      correctAnswer: 0,
      explanation: 'Travel rule compliance requires sharing key originator and beneficiary information for qualifying transfers.'
    },
    {
      id: 'crypto-q3',
      question: 'Which activity most clearly triggers enhanced monitoring?',
      options: [
        { id: 'a', text: 'Small local transfers to a known counterparty', isCorrect: false },
        { id: 'b', text: 'Rapid in-and-out transfers with high-risk jurisdiction exposure', isCorrect: true },
        { id: 'c', text: 'Monthly salary deposits into a custodial wallet', isCorrect: false },
        { id: 'd', text: 'Customer updating their profile details', isCorrect: false }
      ],
      correctAnswer: 1,
      explanation: 'Rapid pass-through activity and high-risk jurisdiction exposure are strong crypto typology indicators.'
    },
    {
      id: 'crypto-q4',
      question: 'Blockchain analytics tools primarily help firms to:',
      options: [
        { id: 'a', text: 'Eliminate the need for KYC checks', isCorrect: false },
        { id: 'b', text: 'Trace transaction flows and flag risky counterparties', isCorrect: true },
        { id: 'c', text: 'Guarantee transaction reversals', isCorrect: false },
        { id: 'd', text: 'Bypass regulatory reporting', isCorrect: false }
      ],
      correctAnswer: 1,
      explanation: 'Analytics provide transaction tracing and risk indicators to support monitoring and escalation.'
    },
    {
      id: 'crypto-q5',
      question: 'FCA registration reviews typically focus on evidence of:',
      options: [
        { id: 'a', text: 'High marketing spend', isCorrect: false },
        { id: 'b', text: 'Documented governance, risk assessment, and MI', isCorrect: true },
        { id: 'c', text: 'Customer growth targets', isCorrect: false },
        { id: 'd', text: 'Informal controls without documentation', isCorrect: false }
      ],
      correctAnswer: 1,
      explanation: 'FCA reviews look for documented governance, risk assessment, and monitoring evidence.'
    }
  ],
  summary: {
    keyTakeaways: [
      'Cryptoasset services require enhanced financial crime controls.',
      'Risk assessment should drive onboarding and monitoring controls.',
      'Governance and MI evidence are critical for FCA registration.'
    ],
    nextSteps: [
      'Document cryptoasset risk assessment and typologies.',
      'Implement monitoring and travel rule workflows.',
      'Prepare governance MI for FCA review.'
    ],
    quickReference: [
      'Crypto risk typologies',
      'Travel rule obligations',
      'FCA registration expectations'
    ]
  }
};
