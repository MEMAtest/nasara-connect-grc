// Module 9: Outsourcing, Third-Party Risk & Operational Resilience
// Comprehensive training on FCA outsourcing framework and third-party risk management

import { TrainingModule } from '../types';

export const outsourcingThirdPartyModule: TrainingModule = {
  id: 'outsourcing-third-party',
  title: 'Outsourcing, Third-Party Risk & Operational Resilience',
  description: 'Master the FCA\'s outsourcing framework (SYSC 3 & SYSC 8), operational resilience requirements, cloud outsourcing guidance (FG16/5), the critical third parties regime, and Consumer Duty implications for distribution chains.',
  category: 'operational-risk',
  duration: 70,
  difficulty: 'intermediate',
  targetPersonas: [
    'senior-manager',
    'compliance-officer',
    'operations-staff',
    'certified-person'
  ],
  prerequisiteModules: ['consumer-duty'],
  tags: [
    'SYSC 3',
    'SYSC 8',
    'SYSC 15A',
    'outsourcing',
    'third-party risk',
    'operational resilience',
    'cloud',
    'FG16/5',
    'critical third parties',
    'CTP',
    'important business services',
    'impact tolerances',
    'Consumer Duty',
    'FCA'
  ],
  learningOutcomes: [
    'Explain the FCA\'s outsourcing framework (SYSC 3 & SYSC 8) and why regulatory responsibilities cannot be outsourced',
    'Describe how outsourcing sits within the operational resilience regime (SYSC 15A), including important business services and impact tolerances',
    'Summarise key expectations for cloud outsourcing using FG16/5 and EBA guidelines as benchmarks',
    'Recognise the UK regime for critical third parties (CTPs) and concentration risk in large providers',
    'Apply Consumer Duty expectations across outsourced and distribution chain arrangements',
    'Design a proportionate outsourcing lifecycle that can withstand FCA and Board scrutiny'
  ],
  hook: {
    type: 'case-study',
    content: 'Your core customer portal runs entirely on a single cloud provider. A software update at that provider fails, taking your platform down for six hours on a Monday morning. Customers cannot access their accounts, payments fail, and your phone lines melt down. The issue sits with the cloud provider – but the regulator calls you. SYSC 8 requires firms to ensure outsourcing does not undermine internal controls or impair the FCA\'s ability to supervise. Operational resilience rules expect firms to manage third-party risk for important business services.',
    question: 'If a key third-party supplier failed tomorrow, could you demonstrate to the FCA and your Board that you understood the risk, set sensible impact tolerances, chose the right controls and remained within them?'
  },
  lessons: [
    {
      id: 'regulatory-framework-sysc',
      title: 'Regulatory Framework – SYSC, Outsourcing & Operational Resilience',
      type: 'content',
      duration: 25,
      content: {
        learningPoint: 'The FCA\'s SYSC sourcebook sets outsourcing rules. Regulatory responsibilities cannot be outsourced - they remain with the firm.',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Critical Principle',
              message: 'Regulatory responsibilities remain with the firm, even where third parties perform key functions like compliance, IT, and customer service. You can outsource activity but NOT accountability.'
            },
            {
              type: 'infogrid',
              title: 'SYSC Foundations',
              items: [
                { icon: '📋', label: 'SYSC 3', description: 'Systems and controls for all activities' },
                { icon: '⚙️', label: 'SYSC 8', description: 'Outsourcing-specific rules' },
                { icon: '🛡️', label: 'SYSC 15A', description: 'Operational resilience' }
              ]
            },
            {
              type: 'checklist',
              title: 'SYSC 8 Requirements - Outsourcing Must',
              items: [
                'Avoid undue operational risk',
                'Not impair quality of internal controls',
                'Not impair FCA\'s ability to supervise the firm'
              ]
            },
            {
              type: 'keypoint',
              icon: '📁',
              title: 'Material Outsourcing Documentation',
              points: [
                'Why the function is material',
                'How it supports important business services',
                'Risk assessment and mitigation plan',
                'Regulators may expect notification'
              ]
            },
            {
              type: 'keypoint',
              icon: '🎯',
              title: 'SYSC 15A - Operational Resilience',
              points: [
                'Identify important business services (IBS)',
                'Set impact tolerances for each IBS',
                'Map people, processes, technology, third parties',
                'Work with third parties on realistic scenario testing'
              ]
            }
          ]
        },
        keyConcepts: [
          { term: 'SYSC 8', definition: 'Core outsourcing rules - avoid risk, maintain controls' },
          { term: 'IBS', definition: 'Important Business Service - disruption causes intolerable harm' },
          { term: 'Impact Tolerance', definition: 'Maximum acceptable disruption level' }
        ],
        realExamples: [
          'Cloud Outage: Firm argued provider was responsible for 4-hour outage - FCA found firm remained accountable for operational resilience',
          'Compliance Outsourcing: Firm reduced internal oversight - FCA held firm responsible, regulatory duties cannot be delegated'
        ],
        regulatoryRequirements: [
          'SYSC 3 - Systems and controls',
          'SYSC 8 - Outsourcing arrangements',
          'SYSC 15A - Operational resilience'
        ]
      }
    },
    {
      id: 'cloud-ctps-lifecycle',
      title: 'Cloud, CTPs and the Outsourcing Lifecycle',
      type: 'content',
      duration: 25,
      content: {
        learningPoint: 'FG16/5 sets cloud outsourcing expectations. The CTP regime allows regulators to oversee systemically important providers, but firms remain responsible.',
        mainContent: {
          cards: [
            {
              type: 'checklist',
              title: 'FG16/5 Cloud Outsourcing Expectations',
              items: [
                'Risk-based, proportionate controls',
                'Data security and confidentiality (location, access)',
                'Business continuity and exit - avoid lock-in',
                'Audit and access rights (including regulators)'
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Shared Responsibility Model',
              message: 'Provider secures the platform, but firm remains accountable for data access, configuration, and monitoring. Misconfiguration is YOUR risk, not a provider excuse.'
            },
            {
              type: 'keypoint',
              icon: '🏛️',
              title: 'Critical Third Parties (CTPs) - PS24/16',
              points: [
                'Regulators can designate systemically important providers',
                'Direct resilience requirements on designated CTPs',
                'Individual firms STILL remain responsible',
                'CTP designation doesn\'t remove firm accountability'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Classify', description: 'Is it outsourcing? Is it critical?' },
                { number: 2, title: 'Due Diligence', description: 'Assess provider health, security, resilience' },
                { number: 3, title: 'Contract', description: 'SLAs, audit rights, exit provisions' },
                { number: 4, title: 'Oversee', description: 'Monitor performance, test scenarios' },
                { number: 5, title: 'Exit', description: 'Maintain tested exit plans' }
              ]
            },
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Exit Plans Must Be Tested',
              message: 'A theoretical exit plan is not enough. Include data migration, alternative providers, and insource options. Test feasibility - don\'t wait for a crisis to find gaps.'
            }
          ]
        },
        keyConcepts: [
          { term: 'FG16/5', definition: 'FCA cloud outsourcing guidance' },
          { term: 'CTP', definition: 'Critical Third Party - systemically important provider' },
          { term: 'Exit Plan', definition: 'Documented, tested transition approach' }
        ],
        realExamples: [
          'CTP Concentration: Multiple firms relied on same cloud provider - single outage affected entire sector - accelerated CTP regime',
          'Exit Plan Failure: Provider announced market exit, firm\'s untested plan caused significant disruption'
        ],
        regulatoryRequirements: [
          'FG16/5 - Cloud outsourcing guidance',
          'PS24/16 - Critical third parties regime',
          'EBA Guidelines on outsourcing'
        ]
      }
    },
    {
      id: 'third-party-risk-assessment',
      title: 'Third-Party Risk Assessment and Materiality',
      type: 'content',
      duration: 20,
      content: {
        learningPoint: 'Not all third-party arrangements are equal. Determine materiality and apply proportionate controls based on impact on customers and market integrity.',
        mainContent: {
          cards: [
            {
              type: 'checklist',
              title: 'Materiality Assessment Questions',
              items: [
                'Is service critical to an important business service?',
                'Would failure cause intolerable harm to customers?',
                'Are there concentration risks with a single provider?',
                'Does provider have access to sensitive data or critical systems?'
              ]
            },
            {
              type: 'infogrid',
              title: 'Risk Dimensions',
              items: [
                { icon: '⚙️', label: 'Operational', description: 'Availability, resilience, recovery' },
                { icon: '👥', label: 'Conduct', description: 'Customer impact, complaints' },
                { icon: '🔒', label: 'Data', description: 'Location, confidentiality, access' },
                { icon: '⚠️', label: 'Concentration', description: 'Single points of failure' }
              ]
            },
            {
              type: 'keypoint',
              icon: '📊',
              title: 'Risk Scoring',
              points: [
                'Document inherent risk and residual risk after controls',
                'Use consistent scoring to compare vendors',
                'Prioritize remediation based on scores',
                'Re-score after material changes, incidents, or renewals'
              ]
            },
            {
              type: 'keypoint',
              icon: '🔍',
              title: 'Due Diligence Evidence',
              points: [
                'Financial stability and ownership checks',
                'Security certifications, penetration tests',
                'Resilience testing results and incident history',
                'Audit reports and compliance status'
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Subcontracting Visibility',
              message: 'Map critical subcontractors and fourth parties. Ensure contracts allow visibility and audit rights. Avoid uncontrolled dependency chains.'
            }
          ]
        },
        keyConcepts: [
          { term: 'Materiality', definition: 'Drives intensity of controls' },
          { term: 'Concentration Risk', definition: 'Single points of failure across providers' },
          { term: 'Fourth Parties', definition: 'Subcontractors of your direct providers' }
        ],
        realExamples: [
          'Concentration Risk: Multiple services depended on same cloud region - firm introduced multi-region architecture',
          'Hidden Subcontractor: Vendor used unauthorized subcontractor for data - contract updated with approval requirements'
        ],
        regulatoryRequirements: [
          'SYSC 8 - Risk assessment requirements',
          'FG16/5 - Due diligence expectations',
          'EBA Guidelines - Subcontracting provisions'
        ]
      }
    },
    {
      id: 'ongoing-oversight-exit',
      title: 'Ongoing Oversight, Incident Management and Exit',
      type: 'content',
      duration: 20,
      content: {
        learningPoint: 'Outsourcing governance does not end at contract signature. Monitor performance, manage incidents, and maintain exit readiness.',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'info',
              title: 'Oversight is Continuous',
              message: 'Governance does not end at contract signature. Regular performance reviews, incident monitoring, and resilience testing are ongoing requirements.'
            },
            {
              type: 'checklist',
              title: 'Ongoing Oversight Activities',
              items: [
                'Regular performance reviews against SLAs and KPIs',
                'Incident reporting thresholds aligned to impact tolerances',
                'Testing of business continuity and resilience measures',
                'Record SLA breaches and follow-up actions'
              ]
            },
            {
              type: 'keypoint',
              icon: '🚨',
              title: 'Incident Management',
              points: [
                'Clear escalation paths between firm and provider',
                'Joint playbooks for severe but plausible scenarios',
                'Evidence capture for regulatory reporting',
                'Escalate repeat issues to senior management and Board'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Monitor', description: 'Track performance vs SLAs' },
                { number: 2, title: 'Escalate', description: 'Clear paths for incidents' },
                { number: 3, title: 'Document', description: 'Evidence for regulators' },
                { number: 4, title: 'Exit Ready', description: 'Tested plan for transition' }
              ]
            },
            {
              type: 'checklist',
              title: 'Exit Planning Requirements',
              items: [
                'Maintain realistic, tested exit plan for critical services',
                'Include data migration, licensing, operational transition',
                'Review feasibility annually or after material change',
                'Define triggers: control failures, repeated breaches'
              ]
            }
          ]
        },
        keyConcepts: [
          { term: 'Continuous Oversight', definition: 'Ongoing, not one-time governance' },
          { term: 'Joint Playbooks', definition: 'Coordinated incident response plans' },
          { term: 'Exit Triggers', definition: 'Defined conditions for transition' }
        ],
        realExamples: [
          'Escalation Gap: Provider failed to notify within agreed timeframes - SLA and escalation procedures tightened',
          'Untested Exit Plan: Firm discovered plan assumed capabilities it didn\'t have - reworked and tested'
        ],
        regulatoryRequirements: [
          'SYSC 8 - Ongoing oversight',
          'SYSC 15A - Scenario testing',
          'FG16/5 - Exit planning expectations'
        ]
      }
    },
    {
      id: 'consumer-duty-distribution-governance',
      title: 'Consumer Duty, Distribution Chains & Governance',
      type: 'content',
      duration: 20,
      content: {
        learningPoint: 'Consumer Duty applies across the distribution chain. You can outsource activity, but you cannot outsource accountability for outcomes.',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Cannot Outsource Accountability',
              message: 'Consumer Duty applies across the distribution chain. All firms influencing outcomes are in scope - customer service, claims handling, collections, marketing, compliance support.'
            },
            {
              type: 'checklist',
              title: 'Distribution Chain Implications',
              items: [
                'Outsourcing arrangements influencing outcomes are IN SCOPE',
                'Third parties must understand target market and expected outcomes',
                'Information must flow BOTH ways (complaints, MI)',
                'Cannot outsource accountability for customer outcomes'
              ]
            },
            {
              type: 'keypoint',
              icon: '📋',
              title: 'Duty-Aligned Contracts',
              points: [
                'Embed Duty outcomes into SLAs and KPIs',
                'Require MI on interactions, complaints, vulnerabilities',
                'Rights to change processes and scripts for harm prevention',
                'Cooperation requirements for remediation exercises'
              ]
            },
            {
              type: 'keypoint',
              icon: '🔍',
              title: 'Outcome Controls',
              points: [
                'Sample call monitoring and script QA',
                'Test communications with vulnerable segments',
                'Track outcome deltas: in-house vs outsourced channels',
                'Monitor consumer support metrics'
              ]
            },
            {
              type: 'checklist',
              title: 'Board MI Requirements',
              items: [
                'Inventory of critical outsourcing and CTP exposure',
                'Third-party incidents and performance vs tolerances',
                'Complaints and outcome metrics for customer-facing services',
                'Outcomes for vulnerable customers'
              ]
            },
            {
              type: 'alert',
              alertType: 'info',
              title: 'Annual Duty Board Report',
              message: 'MI on outsourced functions must feed into the annual Consumer Duty Board report, demonstrating how outsourcers support or hinder good customer outcomes.'
            }
          ]
        },
        keyConcepts: [
          { term: 'Distribution Chain', definition: 'All firms involved in product lifecycle to end customer' },
          { term: 'Outcome Controls', definition: 'Monitoring to ensure Duty compliance' },
          { term: 'Board-Level Issue', definition: 'Third-party resilience requires Board oversight' }
        ],
        realExamples: [
          'Outsourced Service Failure: Call centre with cost KPIs - complaint rates increased - firm revised SLAs to include quality metrics',
          'Distribution Chain Gap: Manufacturer received no distributor MI - issues emerged only when FOS complaints spiked'
        ],
        regulatoryRequirements: [
          'PS22/9 - Consumer Duty',
          'FG22/5 - Distribution chain guidance',
          'SYSC - Board reporting requirements'
        ]
      }
    }
  ],
  practiceScenarios: [
    {
      id: 'cloud-outage-important-service',
      title: 'Cloud Outage on an Important Service',
      description: 'Your online portal (identified as an important business service) is hosted entirely on a single cloud provider. A regional outage takes the portal down for three hours during peak time.',
      difficulty: 'intermediate',
      questions: [
        'How should this outage feature in your impact tolerance analysis?',
        'What would the FCA expect to see in your mapping, scenario testing and Board MI?',
        'What contractual or architectural changes might you consider?'
      ],
      hints: [
        'Impact tolerances set maximum acceptable disruption',
        'Mapping should show single points of failure',
        'Consider redundancy, multi-region, exit options'
      ],
      modelAnswer: 'Impact tolerance analysis: Compare 3-hour outage against your stated tolerance (e.g., if tolerance is 2 hours, you\'ve breached). Document: start time, customer impact volume, services affected, recovery time. FCA expectations: (1) Mapping showing cloud dependency for this IBS, (2) Scenario testing that included cloud provider failure, (3) Board MI showing the breach, root cause, and remediation. Changes to consider: (1) Multi-region/multi-provider architecture for resilience, (2) Contractual SLAs with financial consequences aligned to your tolerances, (3) Incident notification requirements in contract, (4) Exit plan to alternative provider if concentration risk too high.'
    },
    {
      id: 'outsourced-support-duty',
      title: 'Outsourced Customer Support & Duty Outcomes',
      description: 'You outsource inbound customer support and complaints handling to a third-party call centre. Complaints data show longer resolution times and higher repeat contact rates for customers handled by the outsourcer compared with in-house teams.',
      difficulty: 'intermediate',
      questions: [
        'How does this interact with Consumer Duty "consumer support" outcome?',
        'What changes to SLAs, QA and training might be needed?',
        'When would you treat this as a root cause issue requiring wider remediation?'
      ],
      hints: [
        'Consumer support outcome: timely, effective support',
        'Duty applies regardless of who delivers the service',
        'Consider RCA if pattern persists'
      ],
      modelAnswer: 'Consumer Duty interaction: The consumer support outcome requires customers receive timely and effective support. Longer resolution times and higher repeat contacts suggest customers aren\'t getting issues resolved first time – this is a Duty concern regardless of outsourcing. Changes needed: (1) Revise SLAs to include quality metrics (first-contact resolution, customer satisfaction, not just call times), (2) Enhanced QA with complaint sampling and outcome tracking, (3) Joint training with outsourcer on products and Duty expectations, (4) MI sharing on vulnerable customer interactions. Root cause escalation: If pattern persists despite interventions, treat as systemic failure requiring: review of outsourcer capability, consideration of insourcing or alternative provider, formal remediation plan to Board, potential need to compensate affected customers.'
    },
    {
      id: 'critical-supplier-exit',
      title: 'Exit from a Critical Supplier',
      description: 'A key IT provider that supports your payments processing announces that it will exit the market within 12 months.',
      difficulty: 'advanced',
      questions: [
        'What should your exit plan have covered, and how do you now execute it?',
        'How do you minimise disruption to important business services and remain within impact tolerances?',
        'What should you tell your Board and (where relevant) the FCA?'
      ],
      hints: [
        'Exit plans should be practical and tested',
        'Consider alternative providers and insourcing',
        'Regulatory notification may be required'
      ],
      modelAnswer: 'Exit plan should have covered: (1) Alternative providers identified and pre-assessed, (2) Data migration approach and timelines, (3) Testing requirements before cutover, (4) Resource and budget allocation, (5) Communication plan for customers if service changes. Execution now: (1) Invoke exit plan immediately, (2) Engage alternative provider(s) for accelerated due diligence and contracting, (3) Plan migration in phases to manage risk, (4) Enhanced monitoring during transition, (5) Contingency for manual processing if delays occur. Minimising disruption: Run parallel systems during transition where possible, schedule migration outside peak periods, maintain rollback capability, communicate proactively with customers about any changes. Board/FCA communication: (1) Board: immediate briefing on risk, timeline, costs, and mitigation plan, (2) FCA: proactive notification if payments is a regulated activity and there\'s material risk to service continuity or customer harm, (3) Regular updates on progress vs plan.'
    }
  ],
  assessmentQuestions: [
    {
      id: 'otp-q1',
      question: 'Which statement best reflects the FCA\'s position on outsourcing regulatory responsibilities?',
      options: [
        'Regulatory responsibilities transfer to the outsourcer if the contract says so',
        'Regulatory responsibilities can be shared equally between firm and outsourcer',
        'Regulatory responsibilities remain with the authorised firm, even where key functions are outsourced',
        'Regulatory responsibilities do not apply where a cloud provider is used'
      ],
      correctAnswer: 2,
      explanation: 'SYSC rules and FCA guidance make clear that firms may outsource functions, but not their regulatory responsibilities; they must retain appropriate systems, controls and oversight.',
      difficulty: 'beginner'
    },
    {
      id: 'otp-q2',
      question: 'Which of the following is NOT a core concern of SYSC 8\'s outsourcing rules?',
      options: [
        'Avoiding undue operational risk',
        'Ensuring outsourcing does not impair internal controls',
        'Ensuring outsourcing does not impair the FCA\'s ability to supervise',
        'Guaranteeing a minimum level of profit for the firm'
      ],
      correctAnswer: 3,
      explanation: 'SYSC 8 focuses on operational risk, internal controls and the FCA\'s ability to supervise; it does not guarantee profitability.',
      difficulty: 'beginner'
    },
    {
      id: 'otp-q3',
      question: 'Under SYSC 15A, which statement best describes an "important business service"?',
      options: [
        'Any service that generates more than 5% of annual revenue',
        'A service that, if disrupted, could cause intolerable harm to clients or pose a risk to the UK financial system',
        'Any outsourced IT service',
        'Any internal back-office process'
      ],
      correctAnswer: 1,
      explanation: 'Operational resilience rules define an important business service as one that, if disrupted, could cause intolerable harm to clients or risk to the wider financial system.',
      difficulty: 'intermediate'
    },
    {
      id: 'otp-q4',
      question: 'Where a firm relies on a third party to deliver an important business service, what does SYSC 15A expect?',
      options: [
        'The third party is solely responsible for scenario testing',
        'The firm should work with the third party to ensure scenario testing remains valid and realistic',
        'Scenario testing is not required for outsourced services',
        'The firm only needs to test scenarios where no third parties are involved'
      ],
      correctAnswer: 1,
      explanation: 'SYSC 15A guidance states that where a firm relies on a third party, it should work with that provider so that its scenario testing for important business services is realistic and credible.',
      difficulty: 'intermediate'
    },
    {
      id: 'otp-q5',
      question: 'What is the main purpose of the UK regime for critical third parties (CTPs)?',
      options: [
        'To make CTPs jointly liable for all customer complaints',
        'To allow regulators to directly oversee and set resilience requirements for systemically important third-party providers',
        'To remove firms\' responsibility for managing third-party risk',
        'To ban the use of overseas cloud providers'
      ],
      correctAnswer: 1,
      explanation: 'PS24/16 introduces a regime where regulators can designate CTPs and set resilience requirements directly, while firms remain responsible for their own outsourcing risk management.',
      difficulty: 'intermediate'
    },
    {
      id: 'otp-q6',
      question: 'How does the Consumer Duty apply to outsourcing and distribution chains?',
      options: [
        'It only applies where the outsourcer is FCA-authorised',
        'It applies across the distribution chain to all firms that can influence product design, target market or performance',
        'It does not apply to outsourced customer service functions',
        'It is limited to pricing decisions made by the manufacturer'
      ],
      correctAnswer: 1,
      explanation: 'FG22/5 confirms the Duty applies across the distribution chain, covering firms (including outsourcers) that can influence key aspects of the product or service.',
      difficulty: 'intermediate'
    },
    {
      id: 'otp-q7',
      question: 'Which is good practice when outsourcing critical IT services to the cloud?',
      options: [
        'Relying solely on the provider\'s marketing materials',
        'Ensuring contracts include clear audit and access rights, data security and exit provisions',
        'Avoiding any contractual mention of regulatory access',
        'Assuming the cloud provider will handle all business continuity planning'
      ],
      correctAnswer: 1,
      explanation: 'FG16/5 emphasises robust contracts covering data security, audit and access rights, business continuity and exit, proportionate to risk and criticality.',
      difficulty: 'intermediate'
    },
    {
      id: 'otp-q8',
      question: 'Which MI set is most useful for Board oversight of outsourcing and third-party risk?',
      options: [
        'Number of employees in the procurement team',
        'List of all suppliers with invoice amounts only',
        'Inventory of critical outsourced services, mapping to important business services, incidents, performance vs impact tolerances, and outcome metrics',
        'Supplier logos and marketing brochures'
      ],
      correctAnswer: 2,
      explanation: 'Regulators expect Boards to have visibility of critical outsourcing, third-party incidents, resilience against impact tolerances and customer outcomes to support operational resilience and Consumer Duty oversight.',
      difficulty: 'advanced'
    }
  ],
  summary: {
    keyTakeaways: [
      'SYSC 3 & 8: regulatory responsibilities remain with the firm – cannot be outsourced',
      'Outsourcing must not create undue operational risk or impair internal controls/FCA supervision',
      'Important business services include those delivered by third parties on the firm\'s behalf',
      'Set impact tolerances and map all dependencies including third parties',
      'FG16/5: cloud outsourcing requires data security, audit rights, exit provisions',
      'CTP regime allows direct regulatory oversight but doesn\'t remove firm responsibility',
      'Consumer Duty applies across distribution chains – can\'t outsource accountability',
      'Embed Duty outcomes into SLAs and require MI from providers',
      'Outsourcing lifecycle: classify, due diligence, contract, oversee, exit',
      'Board MI should cover critical outsourcing, incidents, tolerances, and customer outcomes'
    ],
    nextSteps: [
      'Review your outsourcing register and classify arrangements by criticality',
      'Map third-party dependencies for each important business service',
      'Assess exit plans for critical providers – are they practical and tested?',
      'Review contracts for cloud/IT providers against FG16/5 expectations',
      'Check Consumer Duty SLAs and MI requirements in outsourcing contracts',
      'Ensure Board receives appropriate third-party risk MI',
      'Complete the Operational Resilience module for detailed scenario testing guidance'
    ],
    quickReference: {
      title: 'Outsourcing & Third-Party Risk Quick Reference',
      items: [
        { term: 'SYSC 8', definition: 'Core FCA outsourcing rules – avoid operational risk, maintain controls, enable supervision' },
        { term: 'Important Business Service', definition: 'Service whose disruption could cause intolerable harm to clients or systemic risk' },
        { term: 'Impact Tolerance', definition: 'Maximum acceptable level of disruption for an important business service' },
        { term: 'FG16/5', definition: 'FCA guidance on cloud and third-party IT outsourcing' },
        { term: 'CTP', definition: 'Critical Third Party – systemically important provider subject to direct regulatory oversight' },
        { term: 'Distribution Chain', definition: 'All firms involved in manufacture, provision, sale and administration of product to end customer' },
        { term: 'Exit Plan', definition: 'Documented approach to transition away from a provider including alternatives and data migration' }
      ]
    }
  },
  visualAssets: {
    diagrams: [
      {
        id: 'outsourcing-lifecycle',
        title: 'Outsourcing Lifecycle',
        description: 'Process flow: Classify → Due Diligence → Contract → Oversee → Exit',
        type: 'process'
      },
      {
        id: 'third-party-mapping',
        title: 'Third-Party Dependency Mapping',
        description: 'Diagram showing IBS mapped to supporting third parties and concentration risks',
        type: 'hierarchy'
      },
      {
        id: 'duty-distribution-chain',
        title: 'Consumer Duty in Distribution Chains',
        description: 'Flow showing manufacturer → distributor → outsourcers → customer with Duty accountability',
        type: 'flowchart'
      }
    ],
    infographics: [
      {
        id: 'fg165-checklist',
        title: 'FG16/5 Cloud Outsourcing Checklist',
        description: 'Key considerations for cloud outsourcing contracts'
      },
      {
        id: 'ctp-overview',
        title: 'Critical Third Party Regime Overview',
        description: 'Summary of CTP powers and firm responsibilities'
      }
    ]
  }
};
