// Training Content Library
// Comprehensive curriculum based on FCA requirements and training specification

import {
  LearningPathway,
  TrainingModule,
  MicroLesson,
  BranchingScenario,
  Assessment,
  Question,
  LearnerPersona,
  MicroChallenge,
  Simulation
} from '../types';

// Learner Personas as defined in the specification
export const learnerPersonas: Record<string, LearnerPersona> = {
  founder_smf: {
    id: 'founder_smf',
    name: 'Founder/SMF',
    profile: 'Strategic leader, time-poor, needs big picture + personal liability',
    learningStyle: 'Executive briefings, case studies, peer discussions',
    depth: 'Strategic with deep-dives on accountability',
    timeBudget: '2 hours/month',
    competencyRequirements: {
      'sm_cr_accountabilities': 'expert',
      'business_model_strategy': 'expert',
      'risk_appetite': 'expert',
      'consumer_duty': 'strategic',
      'financial_crime': 'strategic',
      'operational_resilience': 'strategic'
    }
  },
  compliance_officer: {
    id: 'compliance_officer',
    name: 'Compliance Officer',
    profile: 'Technical expert, detail-oriented, needs comprehensive coverage',
    learningStyle: 'Detailed guides, regulatory texts, worked examples',
    depth: 'Expert level across all domains',
    timeBudget: '8 hours/month',
    competencyRequirements: {
      'full_regulatory_framework': 'expert',
      'monitoring_testing': 'expert',
      'breach_management': 'expert',
      'training_design': 'practitioner',
      'horizon_scanning': 'expert'
    }
  },
  risk_analyst: {
    id: 'risk_analyst',
    name: 'Risk Analyst',
    profile: 'Data-driven, analytical, needs frameworks and models',
    learningStyle: 'Interactive models, simulations, data exercises',
    depth: 'Advanced on risk, intermediate on compliance',
    timeBudget: '4 hours/month',
    competencyRequirements: {
      'risk_assessment': 'expert',
      'risk_monitoring': 'expert',
      'compliance_framework': 'practitioner'
    }
  },
  product_marketing: {
    id: 'product_marketing',
    name: 'Product & Marketing',
    profile: 'Creative, customer-focused, needs practical boundaries',
    learningStyle: 'Visual guides, dos/don\'ts, approval workflows',
    depth: 'Practitioner on promotions, awareness elsewhere',
    timeBudget: '2 hours/month',
    competencyRequirements: {
      'financial_promotions': 'expert',
      'consumer_duty': 'practitioner',
      'product_governance': 'practitioner'
    }
  },
  operations_staff: {
    id: 'operations_staff',
    name: 'Operations Staff',
    profile: 'Process-driven, volume handlers, needs efficiency',
    learningStyle: 'Job aids, quick reference, workflow integration',
    depth: 'Task-specific depth, broad awareness',
    timeBudget: '1 hour/month',
    competencyRequirements: {
      'process_compliance': 'practitioner',
      'data_protection': 'awareness',
      'operational_procedures': 'expert'
    }
  },
  frontline_kyc: {
    id: 'frontline_kyc',
    name: 'Frontline KYC',
    profile: 'Customer-facing, varied cases, needs confidence',
    learningStyle: 'Scenario practice, decision trees, escalation paths',
    depth: 'Deep on customer processes, AML, vulnerability',
    timeBudget: '3 hours/month',
    competencyRequirements: {
      'customer_due_diligence': 'expert',
      'aml_procedures': 'expert',
      'vulnerable_customers': 'expert',
      'complaints_handling': 'practitioner'
    }
  },
  tech_security: {
    id: 'tech_security',
    name: 'Tech & Security',
    profile: 'Technical, system-focused, needs compliance context',
    learningStyle: 'Technical specs, API docs, security frameworks',
    depth: 'Expert on security/resilience, aware of business impact',
    timeBudget: '2 hours/month',
    competencyRequirements: {
      'operational_resilience': 'expert',
      'data_security': 'expert',
      'system_controls': 'expert',
      'compliance_context': 'awareness'
    }
  }
};

// Core Learning Pathways
export const learningPathways: Record<string, LearningPathway> = {
  fca_authorisation_readiness: {
    id: 'fca_authorisation_readiness',
    title: 'FCA Authorization Readiness',
    description: 'Comprehensive preparation for FCA authorization application and ongoing compliance',
    category: 'mandatory',
    modules: [
      'regulatory_landscape',
      'application_process',
      'readiness_assessment'
    ],
    estimatedDuration: 10,
    targetRoles: ['founder_smf', 'compliance_officer'],
    outcomes: [
      'Complete FCA application with confidence',
      'Understand threshold conditions and ongoing requirements',
      'Implement effective pre-application preparation'
    ]
  },
  sm_cr_responsibilities: {
    id: 'sm_cr_responsibilities',
    title: 'SM&CR Responsibilities',
    description: 'Senior Manager & Certification Regime compliance and accountability',
    category: 'mandatory',
    modules: [
      'framework_overview',
      'fitness_and_propriety',
      'conduct_rules'
    ],
    estimatedDuration: 6,
    targetRoles: ['founder_smf', 'compliance_officer'],
    outcomes: [
      'Understand personal accountability under SM&CR',
      'Implement effective governance structures',
      'Manage ongoing F&P requirements'
    ]
  },
  financial_crime_prevention: {
    id: 'financial_crime_prevention',
    title: 'Financial Crime Prevention',
    description: 'Comprehensive AML, CTF and financial crime prevention training',
    category: 'mandatory',
    modules: [
      'aml_fundamentals',
      'customer_due_diligence',
      'suspicious_activity'
    ],
    estimatedDuration: 8,
    targetRoles: ['frontline_kyc', 'compliance_officer', 'operations_staff'],
    outcomes: [
      'Identify and report suspicious activity',
      'Conduct appropriate customer due diligence',
      'Implement effective AML controls'
    ]
  },
  consumer_duty_excellence: {
    id: 'consumer_duty_excellence',
    title: 'Consumer Duty Excellence',
    description: 'Delivering excellent customer outcomes under Consumer Duty',
    category: 'mandatory',
    modules: [
      'duty_foundations',
      'practical_application',
      'monitoring_evidence'
    ],
    estimatedDuration: 6,
    targetRoles: ['product_marketing', 'frontline_kyc', 'compliance_officer'],
    outcomes: [
      'Design products that deliver good outcomes',
      'Implement fair value assessments',
      'Evidence Consumer Duty compliance'
    ]
  },
  financial_promotions_mastery: {
    id: 'financial_promotions_mastery',
    title: 'Financial Promotions Mastery',
    description: 'Create compliant and effective financial promotions',
    category: 'mandatory',
    modules: [
      'rules_framework',
      'content_standards',
      'approval_workflow'
    ],
    estimatedDuration: 5,
    targetRoles: ['product_marketing', 'compliance_officer'],
    outcomes: [
      'Create compliant financial promotions',
      'Implement effective approval processes',
      'Manage social media and digital channels'
    ]
  },
  operational_resilience: {
    id: 'operational_resilience',
    title: 'Operational Resilience',
    description: 'Build and maintain operational resilience capabilities',
    category: 'mandatory',
    modules: [
      'resilience_framework',
      'implementation',
      'testing_monitoring'
    ],
    estimatedDuration: 5,
    targetRoles: ['tech_security', 'operations_staff', 'compliance_officer'],
    outcomes: [
      'Identify important business services',
      'Set appropriate impact tolerances',
      'Implement effective testing regimes'
    ]
  }
};

// Sample Branching Scenario: PEP Customer Onboarding
export const pepOnboardingScenario: BranchingScenario = {
  id: 'kyc_001',
  title: 'PEP Customer Onboarding',
  context: {
    situation: 'A foreign government minister wants to open a business account. Initial screening shows a PEP match.',
    role: 'KYC Analyst',
    objective: 'Complete appropriate due diligence while managing business pressure',
    constraints: [
      'Customer is impatient and threatening to go elsewhere',
      'Senior management is keen to win this high-value business',
      'You have limited time to make a decision'
    ]
  },
  decisionPoints: [
    {
      id: 'initial_screen',
      prompt: 'Initial PEP screening shows a match. The customer is asking for quick approval. What\'s your next step?',
      options: [
        {
          id: 'approve_quickly',
          text: 'Approve quickly to meet business targets and keep the customer happy',
          consequence: {
            immediate: 'Account opened within 24 hours, customer is delighted',
            downstream: 'Regulatory breach identified during audit, significant fine imposed',
            learningPoint: 'Never compromise AML standards for business pressure - regulatory breaches have serious consequences',
            complianceImpact: 'breach'
          }
        },
        {
          id: 'standard_edd',
          text: 'Proceed with Enhanced Due Diligence as required for all PEPs',
          consequence: {
            immediate: 'Customer is informed of EDD requirements and timeline',
            downstream: 'Appropriate risk management and regulatory compliance maintained',
            learningPoint: 'PEPs always require EDD - this is not negotiable regardless of business pressure',
            complianceImpact: 'compliant'
          },
          nextDecision: 'edd_level'
        },
        {
          id: 'escalate_manager',
          text: 'Escalate to manager for guidance due to business pressure',
          consequence: {
            immediate: 'Manager reinforces need for proper EDD procedures',
            downstream: 'Proper process followed with management support',
            learningPoint: 'When facing pressure, escalation to management can provide support for correct decisions',
            complianceImpact: 'compliant'
          },
          nextDecision: 'edd_level'
        }
      ]
    },
    {
      id: 'edd_level',
      prompt: 'You\'re proceeding with EDD. The customer has provided basic documents but some are unclear. What level of enhanced due diligence do you apply?',
      options: [
        {
          id: 'basic_edd',
          text: 'Accept the documents provided and complete basic EDD',
          consequence: {
            immediate: 'EDD completed quickly with available documents',
            downstream: 'Insufficient due diligence may miss important risk factors',
            learningPoint: 'EDD for PEPs requires comprehensive documentation - basic checks are insufficient',
            complianceImpact: 'risky'
          }
        },
        {
          id: 'comprehensive_edd',
          text: 'Request additional documentation and conduct comprehensive EDD including source of wealth verification',
          consequence: {
            immediate: 'Customer provides additional documents, process takes longer',
            downstream: 'Comprehensive risk profile established, appropriate ongoing monitoring implemented',
            learningPoint: 'Proper EDD includes source of wealth verification and comprehensive documentation',
            complianceImpact: 'compliant'
          },
          nextDecision: 'ongoing_monitoring'
        }
      ]
    },
    {
      id: 'ongoing_monitoring',
      prompt: 'EDD is complete and the account is opened. What ongoing monitoring do you implement?',
      options: [
        {
          id: 'standard_monitoring',
          text: 'Apply standard account monitoring procedures',
          consequence: {
            immediate: 'Standard monitoring systems are activated',
            downstream: 'May miss suspicious activity due to insufficient monitoring intensity',
            learningPoint: 'PEP accounts require enhanced ongoing monitoring, not just standard procedures',
            complianceImpact: 'risky'
          }
        },
        {
          id: 'enhanced_monitoring',
          text: 'Implement enhanced ongoing monitoring with regular reviews and lower transaction thresholds',
          consequence: {
            immediate: 'Enhanced monitoring systems configured for the account',
            downstream: 'Effective ongoing risk management and regulatory compliance',
            learningPoint: 'PEP accounts require enhanced ongoing monitoring throughout the relationship',
            complianceImpact: 'compliant'
          }
        }
      ]
    }
  ],
  scoring: {
    optimalPath: ['standard_edd', 'comprehensive_edd', 'enhanced_monitoring'],
    acceptablePaths: [
      ['escalate_manager', 'comprehensive_edd', 'enhanced_monitoring']
    ],
    learningObjectivesMet: {
      'identify_pep_requirements': true,
      'apply_edd_procedures': true,
      'implement_ongoing_monitoring': true,
      'resist_business_pressure': true
    }
  }
};

// Sample Micro-Lessons
export const sampleMicroLessons: MicroLesson[] = [
  {
    id: 'aml_001',
    title: 'Identifying Money Laundering Red Flags',
    duration: 6,
    components: {
      hook: {
        type: 'scenario',
        content: 'A customer makes multiple cash deposits just under £10,000 each week. Normal business activity or red flag?',
        duration: 0.5
      },
      content: {
        type: 'interactive',
        data: {
          redFlags: [
            'Transactions just below reporting thresholds',
            'Inconsistent transaction patterns',
            'Complex ownership structures',
            'High-risk jurisdictions',
            'Unusual payment methods'
          ],
          examples: [
            {
              scenario: 'Cash deposits just under £10k',
              flag: 'Structuring to avoid reporting',
              action: 'File suspicious activity report'
            }
          ]
        },
        duration: 3.5
      },
      practice: {
        type: 'scenario',
        exercise: {
          scenarios: [
            {
              description: 'Customer requests to open 5 accounts for "different business activities"',
              options: ['Normal', 'Suspicious', 'Needs more info'],
              correct: 'Suspicious',
              explanation: 'Multiple accounts without clear business justification is a red flag'
            }
          ]
        },
        duration: 1.5
      },
      summary: {
        keyTakeaways: [
          'Structuring transactions to avoid thresholds is a key red flag',
          'Complex structures without clear purpose should be questioned',
          'When in doubt, escalate and report'
        ],
        duration: 0.5
      }
    },
    learningObjectives: ['identify_ml_red_flags', 'apply_reporting_procedures']
  },
  {
    id: 'consumer_duty_001',
    title: 'Fair Value Assessment Fundamentals',
    duration: 7,
    components: {
      hook: {
        type: 'question',
        content: 'How do you prove your product offers fair value when a competitor sells similar for 20% less?',
        duration: 0.5
      },
      content: {
        type: 'interactive',
        data: {
          fairValueFactors: [
            'Total price vs benefits and features',
            'Nature and quality of service',
            'Comparable market rates',
            'Target market characteristics',
            'Distribution costs and complexity'
          ],
          assessment_process: [
            'Define target market clearly',
            'Assess total price vs total benefits',
            'Consider market comparisons',
            'Document value assessment',
            'Monitor and review regularly'
          ]
        },
        duration: 4
      },
      practice: {
        type: 'case_study',
        exercise: {
          case: 'Premium credit card with £200 annual fee',
          market_comparison: '£150 standard market rate',
          benefits: ['24/7 concierge', 'Airport lounge access', 'Purchase protection'],
          task: 'Conduct fair value assessment and justify pricing'
        },
        duration: 2
      },
      summary: {
        keyTakeaways: [
          'Fair value is about total benefits vs total price, not just comparing headline rates',
          'Target market characteristics matter - what they value and can afford',
          'Regular monitoring and review is essential as markets evolve'
        ],
        duration: 0.5
      }
    },
    learningObjectives: ['conduct_fair_value_assessment', 'apply_consumer_duty_outcomes']
  }
];

// Sample Micro-Challenges
export const dailyMicroChallenges: MicroChallenge[] = [
  {
    id: 'daily_001',
    type: 'spot_the_breach',
    title: 'Social Media Promotion Check',
    content: {
      image: '/images/social-media-post.jpg',
      text: 'Invest now! Guaranteed 15% returns! No risk! Click here to start making money today! 🚀💰',
      context: 'Posted on Instagram by financial advisor with 10k followers'
    },
    timeLimit: 60,
    points: 10,
    difficulty: 'easy',
    explanation: 'Multiple breaches: "Guaranteed returns", "No risk", lacking risk warnings and regulatory information',
    regulatoryArea: 'Financial Promotions',
    learningObjective: 'Identify non-compliant financial promotions'
  },
  {
    id: 'daily_002',
    type: 'quick_decision',
    title: 'Customer Vulnerability Decision',
    content: {
      scenario: 'Customer calls saying they need to withdraw pension early due to unexpected medical bills. They sound distressed and mention being pressured by family.',
      options: [
        'Process withdrawal immediately to help customer',
        'Refer to vulnerability procedures and slow down process',
        'Decline withdrawal to protect customer'
      ],
      correct: 1
    },
    timeLimit: 90,
    points: 15,
    difficulty: 'medium',
    explanation: 'Signs of vulnerability require slowing down, checking understanding, and ensuring decision is in customer\'s best interests',
    regulatoryArea: 'Consumer Duty',
    learningObjective: 'Identify and respond to customer vulnerability'
  }
];

// Sample Simulations
export const trainingSimulations: Simulation[] = [
  {
    id: 'kyc_review_lab',
    title: 'KYC Document Review Laboratory',
    type: 'kyc_review',
    description: 'Practice reviewing KYC documents with realistic examples including genuine, forged, and suspicious documents',
    difficulty: 'intermediate',
    estimatedDuration: 15,
    features: {
      documentTypes: [
        'Passports (genuine, forged, expired)',
        'Utility bills (valid, edited, outdated)',
        'Bank statements (authentic, suspicious)',
        'Company documents (real, shell company indicators)'
      ],
      challengeLevels: {
        beginner: {
          issues: 'Obvious (expired docs, wrong name)',
          guidance: 'Clear guidance provided',
          timeLimit: 'Unlimited'
        },
        intermediate: {
          issues: 'Subtle forgeries, complex ownership',
          guidance: 'Hints available',
          timeLimit: '10 minutes'
        },
        advanced: {
          issues: 'Sophisticated fraud, layered ownership',
          guidance: 'Minimal',
          timeLimit: '5 minutes'
        }
      }
    },
    scoring: {
      criteria: [
        'Accuracy: Documents correctly classified',
        'Completeness: All issues identified',
        'Speed: Time to decision',
        'Justification: Quality of rationale'
      ],
      maxScore: 100,
      passingScore: 70
    },
    assets: {
      documents: [
        { type: 'passport', condition: 'genuine', file: 'passport_001.pdf' },
        { type: 'passport', condition: 'forged', file: 'passport_002.pdf', issues: ['photo substitution'] },
        { type: 'utility_bill', condition: 'edited', file: 'bill_001.pdf', issues: ['date modified'] }
      ]
    }
  },
  {
    id: 'financial_promotions_approver',
    title: 'Financial Promotions Approval System',
    type: 'financial_promotions',
    description: 'Review and approve/reject promotional materials across different channels',
    difficulty: 'advanced',
    estimatedDuration: 20,
    features: {
      contentTypes: [
        'Social media posts',
        'Email campaigns',
        'Website banners',
        'Video scripts',
        'Influencer content'
      ],
      automatedChecks: [
        'Risk warning presence and prominence',
        'Balanced message assessment',
        'Prohibited terms scanner',
        'Capital at risk disclosure'
      ],
      workflow: [
        'Initial review against checklist',
        'Identify required amendments',
        'Suggest compliant alternatives',
        'Document approval rationale',
        'Set review date if approved'
      ]
    },
    scoring: {
      criteria: [
        'Compliance accuracy',
        'Amendment quality',
        'Reasoning clarity',
        'Process efficiency'
      ],
      maxScore: 100,
      passingScore: 80
    },
    assets: {
      scenarios: [
        {
          type: 'social_media',
          content: 'High return investment opportunity!',
          issues: ['no risk warning', 'misleading'],
          channel: 'Instagram'
        }
      ]
    }
  }
];

export const getTrainingContent = () => ({
  personas: learnerPersonas,
  pathways: learningPathways,
  scenarios: { pepOnboarding: pepOnboardingScenario },
  microLessons: sampleMicroLessons,
  microChallenges: dailyMicroChallenges,
  simulations: trainingSimulations
});