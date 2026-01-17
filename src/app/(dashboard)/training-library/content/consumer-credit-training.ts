// Module: Consumer Credit & Affordability
// Core training on affordability, creditworthiness, and customer outcomes

import { TrainingModule } from '../types';

export const consumerCreditTrainingModule: TrainingModule = {
  id: 'consumer-credit-training',
  title: 'Consumer Credit & Affordability',
  description: 'Cover affordability assessments, creditworthiness, forbearance expectations, and evidence requirements for consumer credit firms.',
  category: 'customer-protection',
  duration: 45,
  difficulty: 'intermediate',
  targetPersonas: [
    'compliance-officer',
    'senior-manager',
    'customer-service',
    'operations-staff'
  ],
  prerequisiteModules: ['consumer-duty-implementation'],
  tags: [
    'CONC',
    'affordability',
    'creditworthiness',
    'forbearance',
    'consumer credit'
  ],
  learningOutcomes: [
    'Apply affordability assessments before lending or broking decisions',
    'Identify creditworthiness evidence and decisioning requirements',
    'Embed vulnerability and forbearance into arrears handling',
    'Document evidence to demonstrate fair customer outcomes'
  ],
  hook: {
    type: 'case-study',
    content: 'A credit broker approves a loan without capturing accurate expenditure data. Months later, the customer falls into arrears and complains about affordability. CONC expects robust affordability checks and fair treatment through forbearance.',
    keyQuestion: 'Can you evidence affordability decisions and the support offered when customers struggle to pay?'
  },
  lessons: [
    {
      id: 'affordability-checks',
      title: 'Affordability and Creditworthiness',
      type: 'content',
      duration: 20,
      content: {
        learningPoint: 'Affordability checks must be evidence-based and proportionate to the risk.',
        mainContent: 'Capture income, expenditure, and vulnerability indicators. Apply creditworthiness checks before lending and record decisioning rationale. Regularly review criteria based on outcomes and arrears data.',
        keyConcepts: [
          { term: 'Affordability', definition: 'Ability to repay without undue hardship.' },
          { term: 'Creditworthiness', definition: 'Assessment of repayment likelihood using evidence.' }
        ],
        regulatoryRequirements: [
          'CONC 5 - Responsible lending',
          'FCA affordability guidance'
        ]
      }
    },
    {
      id: 'arrears-forbearance',
      title: 'Arrears, Forbearance, and Vulnerability',
      type: 'content',
      duration: 20,
      content: {
        learningPoint: 'Arrears management must be fair, consistent, and sensitive to vulnerability.',
        mainContent: 'Use early warning indicators to identify arrears risk. Offer forbearance options, review repayment plans, and document communications. Escalate vulnerable cases and monitor outcomes.',
        keyConcepts: [
          { term: 'Forbearance', definition: 'Support offered to help customers in arrears.' },
          { term: 'Vulnerability', definition: 'Factors that heighten risk of harm and require tailored support.' }
        ],
        regulatoryRequirements: [
          'CONC 7 - Arrears and default',
          'FCA guidance on vulnerable customers'
        ]
      }
    }
  ],
  assessmentQuestions: [
    {
      id: 'cc-q1',
      question: 'Which evidence supports a robust affordability assessment?',
      options: [
        { id: 'a', text: 'Income and expenditure data with rationale', isCorrect: true },
        { id: 'b', text: 'Only a customer self-declaration', isCorrect: false },
        { id: 'c', text: 'Marketing conversion rates', isCorrect: false },
        { id: 'd', text: 'No evidence is required for small loans', isCorrect: false }
      ],
      correctAnswer: 0,
      explanation: 'Affordability must be evidence-based and documented.'
    },
    {
      id: 'cc-q2',
      question: 'Forbearance should be offered when:',
      options: [
        { id: 'a', text: 'A customer shows signs of payment difficulty', isCorrect: true },
        { id: 'b', text: 'Only after litigation begins', isCorrect: false },
        { id: 'c', text: 'Never, as it encourages missed payments', isCorrect: false },
        { id: 'd', text: 'Only for customers with perfect credit history', isCorrect: false }
      ],
      correctAnswer: 0,
      explanation: 'Forbearance should be offered early when customers show signs of difficulty.'
    },
    {
      id: 'cc-q3',
      question: 'Which is a key creditworthiness indicator?',
      options: [
        { id: 'a', text: 'Verified income stability and existing commitments', isCorrect: true },
        { id: 'b', text: 'Only marketing channel used', isCorrect: false },
        { id: 'c', text: 'Customer preference for monthly payments', isCorrect: false },
        { id: 'd', text: 'Internal sales targets', isCorrect: false }
      ],
      correctAnswer: 0,
      explanation: 'Creditworthiness relies on evidence of income stability and existing obligations.'
    },
    {
      id: 'cc-q4',
      question: 'What should be documented for an affordability decision?',
      options: [
        { id: 'a', text: 'Income and expenditure sources with decision rationale', isCorrect: true },
        { id: 'b', text: 'Only the approved credit limit', isCorrect: false },
        { id: 'c', text: 'Customer social media profile', isCorrect: false },
        { id: 'd', text: 'A generic affordability statement', isCorrect: false }
      ],
      correctAnswer: 0,
      explanation: 'Firms must document data sources and the rationale supporting the decision.'
    },
    {
      id: 'cc-q5',
      question: 'Which action best supports fair arrears handling?',
      options: [
        { id: 'a', text: 'Escalate immediately to collections without review', isCorrect: false },
        { id: 'b', text: 'Offer tailored forbearance and monitor outcomes', isCorrect: true },
        { id: 'c', text: 'Apply the same script regardless of circumstances', isCorrect: false },
        { id: 'd', text: 'Suspend communication until payment resumes', isCorrect: false }
      ],
      correctAnswer: 1,
      explanation: 'Tailored forbearance and monitoring outcomes are core FCA expectations.'
    }
  ],
  summary: {
    keyTakeaways: [
      'Affordability assessments must be evidence-based and documented.',
      'Arrears handling should be fair, proactive, and sensitive to vulnerability.',
      'Forbearance options and outcomes should be monitored and reported.'
    ],
    nextSteps: [
      'Review affordability assessment templates and data sources.',
      'Define forbearance options and escalation triggers.',
      'Track arrears outcomes and customer feedback.'
    ],
    quickReference: [
      'CONC 5 affordability checks',
      'CONC 7 arrears expectations',
      'Vulnerable customer support'
    ]
  }
};
