// Training Content Registry - Comprehensive collection of all training modules

import { TrainingModule } from '../types';
import { amlFundamentalsModule } from './aml-fundamentals-complete';
import { kycFundamentalsModule } from './kyc-fundamentals';
import { sanctionsTrainingModule } from './sanctions-training';
import { pepsTrainingModule } from './peps-training';
import { sarsTrainingModule } from './sars-training';
import { smcrTrainingModule } from './smcr-training';
import { consumerDutyModule } from './consumer-duty';
import { consumerDutyImplementationModule } from './consumer-duty-implementation';
import { financialCrimeAmlModule } from './financial-crime-aml';
import { vulnerableCustomersModule } from './vulnerable-customers';
import { clientCategorisationModule } from './client-categorisation';
import { suitabilityAppropriatenessModule } from './suitability-appropriateness';
import { complaintsHandlingModule } from './complaints-handling';
import { financialPromotionsModule } from './financial-promotions';
import { outsourcingThirdPartyModule } from './outsourcing-third-party';
import { operationalResilienceModule } from './operational-resilience';
import { operationalResilienceFrameworkModule } from './operational-resilience-framework';
import { moneyLaunderingRedFlagsModule } from './money-laundering-red-flags';
import { paymentsRegulationModule } from './payments-regulation';
import { mifidTrainingModule } from './mifid-training';
import { consumerCreditTrainingModule } from './consumer-credit-training';
import { insuranceConductModule } from './insurance-conduct';
import { cryptoassetRiskModule } from './cryptoasset-risk';

// Core Training Modules Registry
export const trainingModules: Record<string, TrainingModule> = {
  'aml-fundamentals': amlFundamentalsModule,
  'kyc-fundamentals': kycFundamentalsModule,
  'sanctions-training': sanctionsTrainingModule,
  'peps-training': pepsTrainingModule,
  'sars-training': sarsTrainingModule,
  'smcr-training': smcrTrainingModule,
  'consumer-duty': consumerDutyModule,
  'consumer-duty-implementation': consumerDutyImplementationModule,
  'financial-crime-aml': financialCrimeAmlModule,
  'vulnerable-customers': vulnerableCustomersModule,
  'client-categorisation': clientCategorisationModule,
  'suitability-appropriateness': suitabilityAppropriatenessModule,
  'complaints-handling': complaintsHandlingModule,
  'financial-promotions': financialPromotionsModule,
  'outsourcing-third-party': outsourcingThirdPartyModule,
  'operational-resilience': operationalResilienceModule,
  'operational-resilience-framework': operationalResilienceFrameworkModule,
  'money-laundering-red-flags': moneyLaunderingRedFlagsModule,
  'payments-regulation': paymentsRegulationModule,
  'mifid-training': mifidTrainingModule,
  'consumer-credit-training': consumerCreditTrainingModule,
  'insurance-conduct': insuranceConductModule,
  'cryptoasset-risk': cryptoassetRiskModule,
};

// Helper function to get module by ID
export function getTrainingModule(id: string): TrainingModule | undefined {
  return trainingModules[id];
}

// Helper function to get all modules
export function getAllTrainingModules(): TrainingModule[] {
  return Object.values(trainingModules);
}

// Helper function to get modules by category
export function getModulesByCategory(category: string): TrainingModule[] {
  return Object.values(trainingModules).filter(module => module.category === category);
}

// Helper function to get modules by difficulty
export function getModulesByDifficulty(difficulty: string): TrainingModule[] {
  return Object.values(trainingModules).filter(module => module.difficulty === difficulty);
}

// Helper function to get modules by persona
export function getModulesByPersona(persona: string): TrainingModule[] {
  return Object.values(trainingModules).filter(module =>
    module.targetPersonas.includes(persona)
  );
}

// Helper function to get prerequisites
export function getModulePrerequisites(moduleId: string): TrainingModule[] {
  const trainingModule = trainingModules[moduleId];
  if (!trainingModule || !trainingModule.prerequisiteModules) return [];

  return trainingModule.prerequisiteModules
    .map(prereqId => trainingModules[prereqId])
    .filter(Boolean);
}

// Training Categories
export const trainingCategories = {
  'financial-crime-prevention': {
    name: 'Financial Crime Prevention',
    description: 'Anti-money laundering, sanctions, and financial crime compliance',
    icon: 'shield',
    color: 'red'
  },
  'regulatory-compliance': {
    name: 'Regulatory Compliance',
    description: 'FCA, PRA and regulatory framework compliance',
    icon: 'book',
    color: 'blue'
  },
  'customer-protection': {
    name: 'Customer Protection',
    description: 'Consumer duty and customer treatment requirements',
    icon: 'users',
    color: 'green'
  },
  'operational-risk': {
    name: 'Operational Risk',
    description: 'Operational resilience and risk management',
    icon: 'alert-triangle',
    color: 'amber'
  }
};

// Persona to module mapping for recommendations
export const personaRecommendations = {
  'compliance-officer': [
    'aml-fundamentals',
    'money-laundering-red-flags',
    'kyc-fundamentals',
    'sanctions-training',
    'peps-training',
    'sars-training',
    'consumer-duty',
    'consumer-duty-implementation',
    'financial-crime-aml',
    'vulnerable-customers',
    'client-categorisation',
    'suitability-appropriateness',
    'complaints-handling',
    'financial-promotions',
    'outsourcing-third-party',
    'operational-resilience',
    'operational-resilience-framework'
  ],
  'senior-manager': [
    'smcr-training',
    'consumer-duty',
    'consumer-duty-implementation',
    'aml-fundamentals',
    'sars-training',
    'financial-crime-aml',
    'vulnerable-customers',
    'client-categorisation',
    'suitability-appropriateness',
    'complaints-handling',
    'financial-promotions',
    'outsourcing-third-party',
    'operational-resilience',
    'operational-resilience-framework'
  ],
  'mlro': [
    'sars-training',
    'aml-fundamentals',
    'money-laundering-red-flags',
    'kyc-fundamentals',
    'sanctions-training',
    'peps-training',
    'financial-crime-aml'
  ],
  'relationship-manager': [
    'consumer-duty',
    'consumer-duty-implementation',
    'kyc-fundamentals',
    'peps-training',
    'sanctions-training',
    'vulnerable-customers',
    'client-categorisation',
    'suitability-appropriateness'
  ],
  'operations-staff': [
    'sanctions-training',
    'aml-fundamentals',
    'money-laundering-red-flags',
    'financial-crime-aml',
    'client-categorisation',
    'outsourcing-third-party',
    'operational-resilience',
    'operational-resilience-framework'
  ],
  'customer-service': [
    'consumer-duty',
    'consumer-duty-implementation',
    'kyc-fundamentals',
    'aml-fundamentals',
    'vulnerable-customers',
    'suitability-appropriateness',
    'complaints-handling'
  ],
  'kyc-specialist': [
    'kyc-fundamentals',
    'money-laundering-red-flags',
    'peps-training',
    'financial-crime-aml'
  ],
  'certified-person': [
    'smcr-training',
    'consumer-duty',
    'consumer-duty-implementation',
    'vulnerable-customers',
    'client-categorisation',
    'suitability-appropriateness'
  ],
  'hr-professional': [
    'smcr-training',
    'vulnerable-customers'
  ],
  'investment-adviser': [
    'suitability-appropriateness',
    'client-categorisation',
    'consumer-duty',
    'vulnerable-customers'
  ]
};

// Learning pathways - structured sequences of modules
export const learningPathways = {
  'essential-aml-pathway': {
    id: 'essential-aml-pathway',
    title: 'Essential AML & Financial Crime Prevention',
    description: 'Comprehensive pathway covering all aspects of anti-money laundering and financial crime prevention',
    category: 'mandatory',
    estimatedDuration: 120, // minutes
    modules: [
      'aml-fundamentals',
      'money-laundering-red-flags',
      'kyc-fundamentals',
      'sanctions-training',
      'peps-training',
      'sars-training'
    ],
    targetRoles: ['compliance-officer', 'mlro', 'relationship-manager', 'kyc-specialist'],
    outcomes: [
      'Understand money laundering stages and regulatory framework',
      'Implement effective customer due diligence procedures',
      'Manage sanctions compliance and screening effectively',
      'Identify and manage politically exposed persons',
      'File high-quality suspicious activity reports'
    ],
    prerequisites: [],
    certification: true
  },
  'senior-manager-pathway': {
    id: 'senior-manager-pathway',
    title: 'Senior Manager Accountability & Governance',
    description: 'Leadership pathway for senior managers covering accountability, conduct, and governance requirements',
    category: 'mandatory',
    estimatedDuration: 50,
    modules: [
      'smcr-training',
      'aml-fundamentals',
      'sars-training'
    ],
    targetRoles: ['senior-manager', 'certified-person'],
    outcomes: [
      'Understand individual accountability under SM&CR',
      'Apply conduct rules and fitness requirements',
      'Demonstrate reasonable steps for regulatory compliance',
      'Manage financial crime risks at senior level'
    ],
    prerequisites: [],
    certification: true
  },
  'customer-facing-pathway': {
    id: 'customer-facing-pathway',
    title: 'Customer-Facing Compliance Essentials',
    description: 'Essential compliance training for all customer-facing roles',
    category: 'mandatory',
    estimatedDuration: 45,
    modules: [
      'kyc-fundamentals',
      'peps-training',
      'aml-fundamentals'
    ],
    targetRoles: ['relationship-manager', 'customer-service'],
    outcomes: [
      'Conduct effective customer due diligence',
      'Identify politically exposed persons and associates',
      'Recognize suspicious activity indicators',
      'Apply conduct rules in customer interactions'
    ],
    prerequisites: [],
    certification: true
  },
  'consumer-duty-pathway': {
    id: 'consumer-duty-pathway',
    title: 'Consumer Duty & Customer Outcomes',
    description: 'Comprehensive pathway covering the FCA Consumer Duty, fair value, vulnerable customers, and delivering good outcomes',
    category: 'mandatory',
    estimatedDuration: 110,
    modules: [
      'consumer-duty',
      'consumer-duty-implementation',
      'kyc-fundamentals'
    ],
    targetRoles: ['senior-manager', 'compliance-officer', 'relationship-manager', 'customer-service', 'certified-person'],
    outcomes: [
      'Understand Principle 12 and the four Consumer Duty outcomes',
      'Apply cross-cutting rules to product design, sales and servicing',
      'Conduct and document fair value assessments',
      'Identify and support vulnerable customers appropriately',
      'Implement outcome-focused governance and MI'
    ],
    prerequisites: [],
    certification: true
  },
  'financial-crime-specialist-pathway': {
    id: 'financial-crime-specialist-pathway',
    title: 'Financial Crime Specialist Programme',
    description: 'Advanced pathway covering UK financial crime framework, POCA 2002, MLR 2017, and practical application of risk-based approaches',
    category: 'mandatory',
    estimatedDuration: 160,
    modules: [
      'financial-crime-aml',
      'aml-fundamentals',
      'money-laundering-red-flags',
      'sars-training',
      'sanctions-training'
    ],
    targetRoles: ['compliance-officer', 'mlro', 'kyc-specialist'],
    outcomes: [
      'Master the UK financial crime legislative and regulatory framework',
      'Apply risk-based approaches to customer due diligence',
      'Implement effective suspicious activity identification and reporting',
      'Understand sanctions obligations and screening requirements',
      'Design and operate effective financial crime governance structures'
    ],
    prerequisites: [],
    certification: true
  },
  'vulnerable-customers-pathway': {
    id: 'vulnerable-customers-pathway',
    title: 'Vulnerable Customer Excellence',
    description: 'Comprehensive pathway on identifying, supporting and protecting vulnerable customers in line with FCA FG21/1 guidance',
    category: 'mandatory',
    estimatedDuration: 80,
    modules: [
      'vulnerable-customers',
      'consumer-duty',
      'kyc-fundamentals'
    ],
    targetRoles: ['customer-service', 'relationship-manager', 'compliance-officer', 'senior-manager'],
    outcomes: [
      'Understand the FCA definition and four drivers of vulnerability',
      'Recognise indicators of vulnerability across customer interactions',
      'Apply practical support strategies for vulnerable customers',
      'Link vulnerability considerations to Consumer Duty requirements',
      'Implement governance and MI frameworks for vulnerability'
    ],
    prerequisites: [],
    certification: true
  },
  'investment-advice-pathway': {
    id: 'investment-advice-pathway',
    title: 'Investment Advice & Client Classification',
    description: 'Comprehensive pathway covering COBS 3 client categorisation, COBS 9A suitability, and COBS 10A appropriateness requirements for investment services',
    category: 'mandatory',
    estimatedDuration: 135,
    modules: [
      'client-categorisation',
      'suitability-appropriateness',
      'consumer-duty',
      'vulnerable-customers'
    ],
    targetRoles: ['relationship-manager', 'compliance-officer', 'certified-person', 'investment-adviser'],
    outcomes: [
      'Apply COBS 3 client categorisation framework correctly',
      'Distinguish between retail, professional and eligible counterparty status',
      'Conduct robust suitability assessments for advised business',
      'Apply appropriateness tests for non-advised complex products',
      'Design defendable documentation for categorisation and suitability decisions',
      'Integrate Consumer Duty fair value requirements with advice processes'
    ],
    prerequisites: [],
    certification: true
  },
  'corporate-finance-pathway': {
    id: 'corporate-finance-pathway',
    title: 'Corporate Finance Compliance Essentials',
    description: 'Essential compliance training for corporate finance teams covering client categorisation, professional client requirements, and FCA 2025 expectations',
    category: 'mandatory',
    estimatedDuration: 95,
    modules: [
      'client-categorisation',
      'consumer-duty',
      'financial-crime-aml'
    ],
    targetRoles: ['senior-manager', 'compliance-officer', 'certified-person'],
    outcomes: [
      'Master elective professional client categorisation requirements',
      'Avoid common categorisation weaknesses identified in FCA 2025 review',
      'Document categorisation decisions to withstand regulatory scrutiny',
      'Apply Consumer Duty to wholesale client relationships',
      'Understand financial crime risks in corporate transactions'
    ],
    prerequisites: [],
    certification: true
  },
  'customer-experience-pathway': {
    id: 'customer-experience-pathway',
    title: 'Customer Experience & Communications Excellence',
    description: 'Comprehensive pathway covering complaints handling, financial promotions, and customer communications in line with DISP and COBS 4',
    category: 'mandatory',
    estimatedDuration: 135,
    modules: [
      'complaints-handling',
      'financial-promotions',
      'consumer-duty',
      'vulnerable-customers'
    ],
    targetRoles: ['customer-service', 'compliance-officer', 'senior-manager', 'relationship-manager'],
    outcomes: [
      'Master DISP complaints handling requirements and FOS jurisdiction',
      'Conduct effective root cause analysis and drive continuous improvement',
      'Ensure financial promotions are fair, clear and not misleading',
      'Apply s21 gateway requirements for approving promotions',
      'Integrate complaints and communications MI into Consumer Duty monitoring',
      'Support vulnerable customers through complaints and communications processes'
    ],
    prerequisites: [],
    certification: true
  },
  'operational-resilience-pathway': {
    id: 'operational-resilience-pathway',
    title: 'Operational Resilience & Third-Party Risk Management',
    description: 'Comprehensive pathway covering FCA operational resilience requirements, outsourcing, third-party risk, and incident management in line with PS21/3 and SYSC 15A',
    category: 'mandatory',
    estimatedDuration: 240,
    modules: [
      'outsourcing-third-party',
      'operational-resilience',
      'operational-resilience-framework',
      'consumer-duty'
    ],
    targetRoles: ['senior-manager', 'compliance-officer', 'operations-staff', 'certified-person'],
    outcomes: [
      'Master the SYSC outsourcing framework and regulatory accountability',
      'Identify important business services and set meaningful impact tolerances',
      'Map dependencies including third parties and concentration risks',
      'Design and execute severe but plausible scenario testing',
      'Operate effective incident management aligned to operational resilience',
      'Integrate operational resilience with Consumer Duty and Board reporting'
    ],
    prerequisites: [],
    certification: true
  }
};

// Quick access featured modules
export const featuredModules = [
  {
    id: 'aml-fundamentals',
    title: 'Anti-Money Laundering Fundamentals',
    description: 'Master the fundamentals of AML with real-world case studies',
    icon: 'alert-circle',
    color: 'red',
    duration: 20,
    difficulty: 'beginner',
    points: 200
  },
  {
    id: 'kyc-fundamentals',
    title: 'Know Your Customer & Due Diligence',
    description: 'Comprehensive KYC procedures and risk assessment',
    icon: 'users',
    color: 'blue',
    duration: 15,
    difficulty: 'intermediate',
    points: 150
  },
  {
    id: 'sanctions-training',
    title: 'Sanctions & Financial Crime Prevention',
    description: 'International sanctions compliance and screening',
    icon: 'shield',
    color: 'orange',
    duration: 12,
    difficulty: 'intermediate',
    points: 120
  },
  {
    id: 'peps-training',
    title: 'Politically Exposed Persons Identification',
    description: 'Enhanced due diligence for PEPs and associates',
    icon: 'crown',
    color: 'purple',
    duration: 10,
    difficulty: 'intermediate',
    points: 100
  },
  {
    id: 'sars-training',
    title: 'Suspicious Activity Reporting',
    description: 'Professional SAR filing and investigation procedures',
    icon: 'file-text',
    color: 'green',
    duration: 15,
    difficulty: 'advanced',
    points: 180
  },
  {
    id: 'smcr-training',
    title: 'Senior Managers & Certification Regime',
    description: 'Individual accountability and conduct standards',
    icon: 'award',
    color: 'indigo',
    duration: 20,
    difficulty: 'advanced',
    points: 250
  },
  {
    id: 'consumer-duty',
    title: 'Consumer Duty – Core Responsibilities',
    description: 'FCA Consumer Duty, fair value and customer outcomes',
    icon: 'users',
    color: 'green',
    duration: 60,
    difficulty: 'intermediate',
    points: 300
  },
  {
    id: 'financial-crime-aml',
    title: 'Financial Crime & AML Framework',
    description: 'UK financial crime legislation, POCA 2002, MLR 2017 and risk-based approaches',
    icon: 'shield',
    color: 'red',
    duration: 65,
    difficulty: 'intermediate',
    points: 325
  },
  {
    id: 'vulnerable-customers',
    title: 'Vulnerable Customers & FG21/1',
    description: 'FCA guidance on supporting vulnerable customers and the four drivers of vulnerability',
    icon: 'heart',
    color: 'purple',
    duration: 65,
    difficulty: 'intermediate',
    points: 325
  },
  {
    id: 'client-categorisation',
    title: 'Client Categorisation – COBS 3',
    description: 'FCA client classification: retail, professional and eligible counterparty status',
    icon: 'layers',
    color: 'blue',
    duration: 65,
    difficulty: 'intermediate',
    points: 325
  },
  {
    id: 'suitability-appropriateness',
    title: 'Suitability & Appropriateness – COBS 9A/10A',
    description: 'Advised vs non-advised business, fact-finds, and defendable documentation',
    icon: 'check-circle',
    color: 'teal',
    duration: 70,
    difficulty: 'intermediate',
    points: 350
  },
  {
    id: 'complaints-handling',
    title: 'Complaints Handling & DISP',
    description: 'FCA complaints framework, FOS jurisdiction, and root cause analysis',
    icon: 'message-circle',
    color: 'amber',
    duration: 65,
    difficulty: 'intermediate',
    points: 325
  },
  {
    id: 'financial-promotions',
    title: 'Financial Promotions – COBS 4',
    description: 'Fair, clear, not misleading communications, s21 gateway, and social media',
    icon: 'megaphone',
    color: 'pink',
    duration: 70,
    difficulty: 'intermediate',
    points: 350
  },
  {
    id: 'outsourcing-third-party',
    title: 'Outsourcing & Third-Party Risk',
    description: 'SYSC outsourcing framework, cloud guidance (FG16/5), and critical third parties',
    icon: 'link',
    color: 'cyan',
    duration: 70,
    difficulty: 'intermediate',
    points: 350
  },
  {
    id: 'operational-resilience',
    title: 'Operational Resilience – PS21/3',
    description: 'Important business services, impact tolerances, scenario testing and incident management',
    icon: 'shield-check',
    color: 'emerald',
    duration: 70,
    difficulty: 'intermediate',
    points: 350
  }
];

// Module completion tracking and statistics
export interface ModuleProgress {
  moduleId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  progress: number; // 0-100
  currentSection: number;
  timeSpent: number; // minutes
  score?: number;
  assessmentResults?: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
  }[];
  certificateIssued?: boolean;
}

// Default export for convenience
const trainingContentRegistry = {
  trainingModules,
  learningPathways,
  featuredModules,
  trainingCategories,
  personaRecommendations,
  getTrainingModule,
  getAllTrainingModules,
  getModulesByCategory,
  getModulesByDifficulty,
  getModulesByPersona,
  getModulePrerequisites
};

export default trainingContentRegistry;
