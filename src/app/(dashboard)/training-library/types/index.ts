// Training Library Core Types
// Based on the comprehensive training module specification

export interface LearnerPersona {
  id: string;
  name: string;
  profile: string;
  learningStyle: string;
  depth: string;
  timeBudget: string; // e.g., "2 hours/month"
  competencyRequirements: Record<string, CompetencyLevel>;
}

export type CompetencyLevel = 'awareness' | 'practitioner' | 'strategic' | 'expert';

export interface LearningObjective {
  id: string;
  description: string;
  competencyLevel: CompetencyLevel;
  assessmentCriteria: string;
  verb: 'identify' | 'apply' | 'evaluate' | 'create' | 'analyze';
}

export interface MicroLesson {
  id: string;
  title: string;
  duration: number; // in minutes
  components: {
    hook: {
      type: 'scenario' | 'question' | 'statistic';
      content: string;
      duration: number;
    };
    content: {
      type: 'text' | 'video' | 'interactive' | 'infographic';
      data: Record<string, unknown>;
      duration: number;
    };
    practice: {
      type: 'quiz' | 'scenario' | 'simulation' | 'case_study';
      exercise: Record<string, unknown>;
      duration: number;
    };
    summary: {
      keyTakeaways: string[];
      duration: number;
    };
  };
  prerequisites?: string[];
  learningObjectives: string[];
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  pathway: string;
  estimatedDuration: number; // total hours
  lessons: MicroLesson[];
  assessments: Assessment[];
  prerequisites?: string[];
  targetPersonas: string[];
  regulatoryMapping: string[];
  competencies: Record<string, CompetencyLevel>;
  version: string;
  lastUpdated: Date;
  status: 'draft' | 'review' | 'published' | 'archived';
}

export interface LearningPathway {
  id: string;
  title: string;
  description: string;
  category: 'mandatory' | 'elective' | 'specialization';
  modules: string[];
  estimatedDuration: number;
  targetRoles: string[];
  prerequisites?: string[];
  outcomes: string[];
}

export interface BranchingScenario {
  id: string;
  title: string;
  context: {
    situation: string;
    role: string;
    objective: string;
    constraints: string[];
  };
  decisionPoints: DecisionPoint[];
  scoring: {
    optimalPath: string[];
    acceptablePaths: string[][];
    learningObjectivesMet: Record<string, boolean>;
  };
}

export interface DecisionPoint {
  id: string;
  prompt: string;
  options: {
    id: string;
    text: string;
    consequence: {
      immediate: string;
      downstream: string;
      learningPoint: string;
      complianceImpact: 'compliant' | 'risky' | 'breach';
    };
    nextDecision?: string;
  }[];
}

export interface Assessment {
  id: string;
  type: 'diagnostic' | 'formative' | 'summative' | 'practical';
  title: string;
  questions: Question[];
  passingThreshold: {
    knowledge: number;
    application: number;
    overall: number;
  };
  maxAttempts: number;
  cooldownPeriod: number; // hours
  timeLimit?: number; // minutes
  randomize: boolean;
  validity: number; // months
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'scenario_based' | 'case_study' | 'practical_task' | 'branching_scenario';
  question: string;
  context?: string;
  options?: {
    id: string;
    text: string;
    correct: boolean;
    feedback: string;
  }[];
  scenario?: BranchingScenario;
  learningObjectives: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  regulatoryArea: string;
  points: number;
}

export interface LearningRecord {
  id: string;
  learnerId: string;
  learner: {
    id: string;
    name: string;
    role: string;
    department: string;
    manager: string;
    startDate: Date;
  };
  courseData: {
    id: string;
    title: string;
    version: string;
    regulatoryMapping: string[];
    learningObjectives: string[];
    durationPlanned: number;
    durationActual: number;
  };
  progress: {
    enrollmentDate: Date;
    startDate: Date;
    completionDate?: Date;
    status: 'enrolled' | 'in_progress' | 'completed' | 'expired';
    progressPercentage: number;
    moduleProgress: {
      moduleId: string;
      status: string;
      timeSpent: number;
      attempts: number;
      score?: number;
    }[];
  };
  assessmentResults: {
    preAssessment?: AssessmentResult;
    formativeChecks: AssessmentResult[];
    finalAssessment?: AssessmentResult;
    practicalValidation?: ValidationResult;
  };
  evidence: {
    certificates: Certificate[];
    attestations: Attestation[];
    supervisorSignoffs: Signoff[];
    workSamples?: Document[];
  };
  complianceMetadata: {
    mandatory: boolean;
    deadline?: Date;
    regulatoryDriver?: string;
    riskRating: 'critical' | 'high' | 'medium' | 'low';
    auditFlag?: boolean;
  };
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  learnerId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  attemptNumber: number;
  startTime: Date;
  endTime: Date;
  timeSpent: number; // minutes
  responses: {
    questionId: string;
    answer: string | string[] | number;
    correct: boolean;
    points: number;
    feedback?: string;
  }[];
  breakdown: {
    knowledge: number;
    application: number;
    analysis: number;
    synthesis: number;
  };
}

export interface ValidationResult {
  id: string;
  type: 'supervisor' | 'portfolio' | 'on_the_job';
  supervisorId?: string;
  tasks: {
    taskId: string;
    description: string;
    completed: boolean;
    evidence: string;
    score?: number;
  }[];
  signedOff: boolean;
  signOffDate?: Date;
  notes?: string;
}

export interface Certificate {
  id: string;
  type: 'completion' | 'competency' | 'cpd';
  title: string;
  issueDate: Date;
  expiryDate?: Date;
  verificationCode: string;
  digitalSignature: string;
}

export interface Attestation {
  id: string;
  statement: string;
  attestedBy: string;
  attestedDate: Date;
  evidence?: string;
}

export interface Signoff {
  id: string;
  type: 'manager' | 'compliance' | 'learning_team';
  signedBy: string;
  signedDate: Date;
  comments?: string;
}

export interface MicroChallenge {
  id: string;
  type: 'spot_the_breach' | 'quick_decision' | 'regulation_match';
  title: string;
  content: Record<string, unknown>;
  timeLimit: number; // seconds
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
  regulatoryArea: string;
  learningObjective: string;
}

export interface GameificationElement {
  type: 'points' | 'streak' | 'badge' | 'leaderboard';
  criteria: Record<string, unknown>;
  reward: Record<string, unknown>;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: {
    type: 'streak' | 'accuracy' | 'completion' | 'speed' | 'custom';
    value: number;
    timeframe?: string;
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface LearnerAnalytics {
  learnerId: string;
  engagement: {
    loginFrequency: number;
    sessionDuration: number;
    completionRate: number;
    dropoffPoints: string[];
  };
  performance: {
    averageScore: number;
    improvementTrend: number;
    strengthAreas: string[];
    developmentAreas: string[];
  };
  predictions: {
    riskOfDropping: number;
    timeToCompletion: number;
    recommendedInterventions: string[];
  };
}

export interface ContentUpdate {
  id: string;
  type: 'regulatory_change' | 'content_improvement' | 'bug_fix';
  trigger: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  affectedContent: string[];
  plannedReleaseDate: Date;
  implementationTimeline: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  changeLog: string;
}

export interface TrainingSettings {
  organizationId: string;
  defaultLanguage: string;
  mandatoryCompletionDays: number;
  reminderFrequency: number;
  assessmentRetries: number;
  certificateValidity: number; // months
  gamificationEnabled: boolean;
  mobileOfflineEnabled: boolean;
  dataRetentionPeriod: number; // years
}

// Simulation-specific types
export interface Simulation {
  id: string;
  title: string;
  type: 'kyc_review' | 'financial_promotions' | 'incident_response' | 'aml_investigation';
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  features: Record<string, unknown>;
  scoring: {
    criteria: string[];
    maxScore: number;
    passingScore: number;
  };
  assets: {
    documents?: Record<string, unknown>[];
    scenarios?: Record<string, unknown>[];
    tools?: Record<string, unknown>[];
  };
}

// Content Management types
export interface ContentItem {
  id: string;
  type: 'lesson' | 'assessment' | 'simulation' | 'resource';
  title: string;
  description: string;
  tags: string[];
  version: string;
  author: string;
  lastModified: Date;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  metadata: {
    regulatoryMapping: string[];
    targetPersonas: string[];
    difficulty: string;
    estimatedDuration: number;
  };
  content: Record<string, unknown>;
}

export interface ContentWorkflow {
  id: string;
  contentId: string;
  stage: 'request' | 'design' | 'development' | 'review' | 'deployment' | 'maintenance';
  assignedTo: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  comments: {
    author: string;
    date: Date;
    message: string;
  }[];
}