// Module: Insurance Distribution Conduct (IDD/PROD)
// Overview of insurance distribution obligations and governance

import { TrainingModule } from '../types';

export const insuranceConductModule: TrainingModule = {
  id: 'insurance-conduct',
  title: 'Insurance Distribution Conduct (IDD/PROD)',
  description: 'Understand IDD and PROD expectations for insurance intermediaries, including target market, distribution oversight, and governance.',
  category: 'regulatory-compliance',
  duration: 40,
  difficulty: 'intermediate',
  targetPersonas: [
    'compliance-officer',
    'senior-manager',
    'operations-staff',
    'certified-person'
  ],
  prerequisiteModules: ['consumer-duty-implementation'],
  tags: [
    'IDD',
    'PROD',
    'insurance distribution',
    'target market',
    'product governance'
  ],
  learningOutcomes: [
    'Explain IDD conduct obligations and product governance requirements',
    'Define target market assessments and distributor oversight',
    'Identify evidence needed for ongoing product monitoring and reviews'
  ],
  hook: {
    type: 'case-study',
    content: 'An insurance intermediary distributes a new product without documenting its target market or monitoring outcomes. The FCA asks for evidence of PROD oversight and governance.',
    keyQuestion: 'Can you show how you define target markets, oversee distributors, and evidence product performance?'
  },
  lessons: [
    {
      id: 'idd-scope',
      title: 'IDD Scope and Conduct Expectations',
      type: 'content',
      duration: 18,
      content: {
        learningPoint: 'IDD sets conduct expectations for insurance distributors and requires fair customer outcomes.',
        mainContent: 'Document how you provide clear information, manage conflicts, and ensure customers receive appropriate products. Evidence training and governance across distribution channels.',
        keyConcepts: [
          { term: 'IDD', definition: 'Insurance Distribution Directive conduct requirements.' },
          { term: 'Conduct Rules', definition: 'Standards for customer communications and outcomes.' }
        ],
        regulatoryRequirements: [
          'ICOBS conduct of business',
          'IDD requirements'
        ]
      }
    },
    {
      id: 'prod-oversight',
      title: 'PROD and Distribution Oversight',
      type: 'content',
      duration: 18,
      content: {
        learningPoint: 'PROD requires documented target market assessment and ongoing monitoring.',
        mainContent: 'Define target markets, distribution strategies, and outcome monitoring. Establish governance to approve products, review MI, and escalate issues.',
        keyConcepts: [
          { term: 'Target Market', definition: 'Defined customer segment for whom the product is suitable.' },
          { term: 'Outcome Monitoring', definition: 'Tracking performance, complaints, and claims to ensure suitability.' }
        ],
        regulatoryRequirements: [
          'PROD 4 product governance',
          'FCA PROD guidance'
        ]
      }
    }
  ],
  assessmentQuestions: [
    {
      id: 'idd-q1',
      question: 'PROD oversight requires firms to:',
      options: [
        { id: 'a', text: 'Define target markets and monitor outcomes', isCorrect: true },
        { id: 'b', text: 'Only monitor sales volumes', isCorrect: false },
        { id: 'c', text: 'Ignore distributor performance', isCorrect: false },
        { id: 'd', text: 'Focus solely on claims processing', isCorrect: false }
      ],
      correctAnswer: 0,
      explanation: 'PROD expects target market definition and ongoing monitoring.'
    }
  ],
  summary: {
    keyTakeaways: [
      'IDD sets conduct standards for insurance distributors.',
      'PROD requires target market definition and outcome monitoring.',
      'Evidence of governance and oversight is essential.'
    ],
    nextSteps: [
      'Document target market statements and distributor oversight.',
      'Set MI and review cadence for product outcomes.'
    ],
    quickReference: [
      'IDD conduct expectations',
      'PROD target market and monitoring'
    ]
  }
};
