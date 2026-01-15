// Module: MiFID Permissions & Conduct
// Overview of MiFID investment permissions, conduct rules, and oversight

import { TrainingModule } from '../types';

export const mifidTrainingModule: TrainingModule = {
  id: 'mifid-training',
  title: 'MiFID Permissions & Conduct',
  description: 'Cover the core MiFID investment permissions, client categorisation, conduct rules, and evidence expectations for FCA authorization.',
  category: 'regulatory-compliance',
  duration: 55,
  difficulty: 'intermediate',
  targetPersonas: [
    'compliance-officer',
    'senior-manager',
    'investment-adviser',
    'certified-person'
  ],
  prerequisiteModules: ['aml-fundamentals', 'client-categorisation'],
  tags: [
    'MiFID',
    'investment services',
    'client categorisation',
    'best execution',
    'suitability',
    'conduct rules'
  ],
  learningOutcomes: [
    'Differentiate between MiFID permissions such as dealing, arranging, and advising',
    'Apply client categorisation and conduct rules to deliver fair outcomes',
    'Explain best execution, suitability, and conflicts requirements',
    'Identify the evidence regulators expect during authorization and supervision'
  ],
  hook: {
    type: 'case-study',
    content: 'An investment firm applies for permissions to advise and arrange deals. During the FCA interview, the firm struggles to articulate how it will deliver best execution and manage conflicts. MiFID firms must evidence client categorisation, suitability, and governance from day one.',
    keyQuestion: 'Can you show how your client journey, advice process, and execution monitoring align to MiFID requirements?'
  },
  lessons: [
    {
      id: 'permissions-conduct',
      title: 'Permissions and Conduct Scope',
      type: 'content',
      duration: 25,
      content: {
        learningPoint: 'MiFID permissions determine what you can do, while conduct rules govern how you do it.',
        mainContent: 'Map permissions such as advising, arranging, or dealing to specific products and client segments. Conduct rules cover disclosure, suitability, inducements, and governance expectations. Document how each permission is controlled in practice.',
        keyConcepts: [
          { term: 'MiFID Permissions', definition: 'Regulated activities such as advising, arranging, or dealing in investments.' },
          { term: 'Conduct Rules', definition: 'Standards for advice, disclosures, and client outcomes.' }
        ],
        regulatoryRequirements: [
          'COBS conduct of business rules',
          'MiFID II organizational requirements'
        ]
      }
    },
    {
      id: 'best-execution-suitability',
      title: 'Best Execution, Suitability, and Conflicts',
      type: 'content',
      duration: 25,
      content: {
        learningPoint: 'Best execution and suitability must be evidenced through governance, monitoring, and documentation.',
        mainContent: 'Define execution factors, monitor execution quality, and evidence best execution decisions. Suitability requires documented fact-finding, risk profiling, and clear disclosures. Conflicts should be recorded and mitigated.',
        keyConcepts: [
          { term: 'Best Execution', definition: 'Deliver the best possible result for clients considering price, cost, speed, and likelihood.' },
          { term: 'Suitability', definition: 'Advice must be suitable to the client based on objectives and risk profile.' },
          { term: 'Conflicts Register', definition: 'Documented conflicts and mitigation controls.' }
        ],
        regulatoryRequirements: [
          'COBS 2.1 and 2.3',
          'COBS 11.2 Best execution',
          'SYSC conflicts management'
        ]
      }
    }
  ],
  assessmentQuestions: [
    {
      id: 'mifid-q1',
      question: 'Which activity requires MiFID permissions?',
      options: [
        { id: 'a', text: 'Providing generic financial education only', isCorrect: false },
        { id: 'b', text: 'Advising a client on a specific investment', isCorrect: true },
        { id: 'c', text: 'Publishing market news articles', isCorrect: false },
        { id: 'd', text: 'Operational IT support', isCorrect: false }
      ],
      correctAnswer: 1,
      explanation: 'Providing personal recommendations on investments is a regulated activity.'
    },
    {
      id: 'mifid-q2',
      question: 'Best execution monitoring should focus on:',
      options: [
        { id: 'a', text: 'Whether client communications are polite', isCorrect: false },
        { id: 'b', text: 'Execution quality against defined factors', isCorrect: true },
        { id: 'c', text: 'Only price and nothing else', isCorrect: false },
        { id: 'd', text: 'Marketing conversion rates', isCorrect: false }
      ],
      correctAnswer: 1,
      explanation: 'Monitoring should evidence execution quality based on the chosen factors.'
    }
  ],
  summary: {
    keyTakeaways: [
      'Permissions define scope; conduct rules define behavior.',
      'Best execution and suitability require governance and evidence.',
      'Conflicts must be identified, recorded, and mitigated.'
    ],
    nextSteps: [
      'Document permission-to-product mapping.',
      'Implement best execution monitoring and MI.',
      'Maintain suitability files and conflicts register.'
    ],
    quickReference: [
      'Client categorisation rules',
      'Best execution factors',
      'Suitability evidence checklist'
    ]
  }
};
