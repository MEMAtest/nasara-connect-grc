// Training Content Registry - Comprehensive collection of all training modules

import { TrainingModule } from '../types';
import { amlFundamentalsModule } from './aml-fundamentals-complete';
import { kycFundamentalsModule } from './kyc-fundamentals';
import { sanctionsTrainingModule } from './sanctions-training';
import { pepsTrainingModule } from './peps-training';
import { sarsTrainingModule } from './sars-training';
import { smcrTrainingModule } from './smcr-training';

// Core Training Modules Registry
export const trainingModules: Record<string, TrainingModule> = {
  'aml-fundamentals': amlFundamentalsModule,
  'kyc-fundamentals': kycFundamentalsModule,
  'sanctions-training': sanctionsTrainingModule,
  'peps-training': pepsTrainingModule,
  'sars-training': sarsTrainingModule,
  'smcr-training': smcrTrainingModule,
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
    'kyc-fundamentals',
    'sanctions-training',
    'peps-training',
    'sars-training'
  ],
  'senior-manager': [
    'smcr-training',
    'aml-fundamentals',
    'sars-training'
  ],
  'mlro': [
    'sars-training',
    'aml-fundamentals',
    'kyc-fundamentals',
    'sanctions-training',
    'peps-training'
  ],
  'relationship-manager': [
    'kyc-fundamentals',
    'peps-training',
    'sanctions-training'
  ],
  'operations-staff': [
    'sanctions-training',
    'aml-fundamentals'
  ],
  'customer-service': [
    'kyc-fundamentals',
    'aml-fundamentals'
  ],
  'kyc-specialist': [
    'kyc-fundamentals',
    'peps-training'
  ],
  'certified-person': [
    'smcr-training'
  ],
  'hr-professional': [
    'smcr-training'
  ]
};

// Learning pathways - structured sequences of modules
export const learningPathways = {
  'essential-aml-pathway': {
    id: 'essential-aml-pathway',
    title: 'Essential AML & Financial Crime Prevention',
    description: 'Comprehensive pathway covering all aspects of anti-money laundering and financial crime prevention',
    category: 'mandatory',
    estimatedDuration: 75, // minutes
    modules: [
      'aml-fundamentals',
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
export default {
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