// Module 10: Operational Resilience & Incident Management – FCA PS21/3 & SYSC 15A
// Comprehensive training on operational resilience framework and incident management

import { TrainingModule } from '../types';

export const operationalResilienceModule: TrainingModule = {
  id: 'operational-resilience',
  title: 'Operational Resilience & Incident Management – FCA PS21/3 & SYSC 15A',
  description: 'Master the FCA\'s operational resilience framework including important business services, impact tolerances, mapping, scenario testing, and incident management. Learn how to demonstrate compliance with the March 2025 deadline.',
  category: 'operational-risk',
  duration: 70,
  difficulty: 'intermediate',
  targetPersonas: [
    'senior-manager',
    'compliance-officer',
    'operations-staff',
    'certified-person'
  ],
  prerequisiteModules: ['outsourcing-third-party', 'consumer-duty'],
  tags: [
    'PS21/3',
    'SYSC 15A',
    'SS1/21',
    'operational resilience',
    'important business services',
    'IBS',
    'impact tolerances',
    'scenario testing',
    'incident management',
    'business continuity',
    'cyber resilience',
    'Consumer Duty',
    'FCA',
    'PRA'
  ],
  learningOutcomes: [
    'Define operational resilience and explain the regulatory framework: FCA PS21/3, SYSC 15A and PRA SS1/21',
    'Describe important business services (IBS) and how to set, review and evidence impact tolerances',
    'Apply a structured approach to mapping, scenario testing, vulnerability remediation and self-assessment',
    'Design and operate an incident management framework aligned to operational resilience expectations',
    'Explain how third-party failures, cyber incidents and other disruptions fit into operational resilience',
    'Integrate operational resilience with Consumer Duty, governance and Board reporting'
  ],
  hook: {
    type: 'case-study',
    content: 'At 09:15 on a busy Monday, a deployment failure at a cloud provider corrupts a core API. Customers can\'t log in, payments time out, contact centre queues spike and social media fills with complaints. Internally, teams debate: "Is this business continuity, cyber, or just IT?" The FCA calls by lunchtime asking: "Is this an important business service, what\'s your impact tolerance, and how do you know you stayed within it?" PS21/3 requires in-scope firms to identify important business services, set impact tolerances, map dependencies and test severe but plausible scenarios, with the transition period ending 31 March 2025.',
    question: 'If you had to hand the FCA or your Board a concise pack tomorrow on your last major outage, could you prove: what failed, which important business services were affected, how long customers were impacted, whether you breached impact tolerances – and what you\'ve changed since?'
  },
  lessons: [
    {
      id: 'framework-core-concepts',
      title: 'Framework & Core Concepts – PS21/3, SYSC 15A & SS1/21',
      type: 'content',
      duration: 25,
      content: {
        learningPoint: 'Operational resilience is the ability to prevent, adapt, respond to, recover and learn from operational disruption. Focus is on outcomes - continuity of important services.',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'info',
              title: 'What is Operational Resilience?',
              message: 'The ability to prevent, adapt, respond to, recover and learn from operational disruption so that disruptions do not cause intolerable harm to customers or market integrity.'
            },
            {
              type: 'infogrid',
              title: 'Key Distinctions',
              items: [
                { icon: '🎯', label: 'Focus', description: 'Outcomes, not processes' },
                { icon: '📋', label: 'vs BCP', description: 'Broader, firm-wide concept' },
                { icon: '👥', label: 'Scope', description: 'External customer services' }
              ]
            },
            {
              type: 'keypoint',
              icon: '⭐',
              title: 'Important Business Services (IBS)',
              points: [
                'Services whose disruption could cause intolerable harm',
                'Focus on external customer-facing services',
                'Examples: account access, payments, onboarding, authentication'
              ]
            },
            {
              type: 'keypoint',
              icon: '📊',
              title: 'Impact Tolerances',
              points: [
                'Maximum tolerable level of disruption for each IBS',
                'Maximum duration (e.g. 2 hours, 1 day)',
                'Volume of customers affected',
                'Critical times (market cut-offs, payroll)'
              ]
            },
            {
              type: 'stat',
              value: '31 Mar 2025',
              label: 'Compliance Deadline',
              description: 'Must operate within tolerances under severe scenarios',
              color: 'red'
            },
            {
              type: 'checklist',
              title: 'Board Responsibilities',
              items: [
                'Approve IBSs, impact tolerances and self-assessment',
                'Oversee scenario testing, remediation, investment',
                'Integrate into risk appetite and strategy',
                'Annual review required'
              ]
            }
          ]
        },
        keyConcepts: [
          { term: 'Operational Resilience', definition: 'Prevent, adapt, respond, recover, learn' },
          { term: 'IBS', definition: 'Important Business Service - intolerable harm if disrupted' },
          { term: 'Impact Tolerance', definition: 'Maximum acceptable disruption level' }
        ],
        realExamples: [
          'IBS Identification: Firm refined 50+ services to 8 true IBS after focusing on customer harm potential',
          'Impact Tolerance: Payments firm set "no more than 4 hours in any 24-hour period" based on harm analysis'
        ],
        regulatoryRequirements: [
          'PS21/3 - Building Operational Resilience',
          'SYSC 15A - Operational resilience requirements',
          'PRA SS1/21 - Operational resilience'
        ]
      }
    },
    {
      id: 'impact-tolerances-evidence',
      title: 'Setting Impact Tolerances and Evidence',
      type: 'content',
      duration: 20,
      content: {
        learningPoint: 'Impact tolerances are not aspirational targets - they must be evidence-based and linked to customer harm.',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Not Aspirational Targets',
              message: 'Impact tolerances must be evidence-based and linked to actual customer harm potential. They are the maximum disruption you can tolerate, not goals to aim for.'
            },
            {
              type: 'checklist',
              title: 'Setting Impact Tolerances',
              items: [
                'Define what "intolerable harm" means for YOUR customers',
                'Use quantitative and qualitative measures (time, volume, type)',
                'Consider critical periods (payroll, market cut-offs, holidays)',
                'Factor in vulnerable customer impact'
              ]
            },
            {
              type: 'keypoint',
              icon: '📋',
              title: 'Evidence Expectations',
              points: [
                'Document rationale and assumptions behind each tolerance',
                'Link tolerances to mapping outputs and scenario testing',
                'Show Board approval and review process',
                'Evidence how tolerances reflect customer harm analysis'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Track', description: 'Real-time downtime and customer impact' },
                { number: 2, title: 'Record', description: 'When tolerances exceeded and why' },
                { number: 3, title: 'Remediate', description: 'Drive investment decisions from breaches' }
              ]
            }
          ]
        },
        keyConcepts: [
          { term: 'Impact Tolerance', definition: 'Maximum disruption allowed - linked to harm' },
          { term: 'Evidence-Based', definition: 'Documented rationale and Board approval' },
          { term: 'Breach Response', definition: 'Documented root cause and remediation' }
        ],
        realExamples: [
          'Evidence-Based Tolerance: Payments firm set 2-hour tolerance based on harm analysis and settlement cut-offs - accepted by FCA',
          'Tolerance Breach: Firm exceeded tolerance during cyber incident - documented root cause, Board approved investment'
        ],
        regulatoryRequirements: [
          'SYSC 15A - Impact tolerance setting',
          'PS21/3 - Evidence expectations',
          'Board approval requirements'
        ]
      }
    },
    {
      id: 'mapping-testing-self-assessment',
      title: 'Mapping, Scenario Testing & Self-Assessment',
      type: 'content',
      duration: 25,
      content: {
        learningPoint: 'Map all dependencies, test severe but plausible scenarios, and maintain a self-assessment document showing compliance approach.',
        mainContent: {
          cards: [
            {
              type: 'checklist',
              title: 'Mapping - What to Include',
              items: [
                'People, processes, technology, facilities, third parties',
                'End-to-end service chains (front-end to back-end)',
                'Single points of failure and concentration risks',
                'Cloud and critical provider dependencies'
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'FCA 2024 Finding',
              message: 'Many firms\' mapping is still too shallow, missing key third-party and data dependencies. Mapping must be comprehensive.'
            },
            {
              type: 'infogrid',
              title: 'Example Severe but Plausible Scenarios',
              items: [
                { icon: '🏢', label: 'Data Centre', description: 'Loss of key DC or cloud region' },
                { icon: '📡', label: 'Telecoms', description: 'Prolonged outage' },
                { icon: '💻', label: 'Cyber', description: 'Attack on core application' },
                { icon: '💳', label: 'Payment', description: 'System or scheme failure' }
              ]
            },
            {
              type: 'keypoint',
              icon: '🧪',
              title: 'Scenario Testing Expectations',
              points: [
                'Increasing sophistication and realism over time',
                'Not just paper-based tests - simulations and war-games',
                'Clear records of assumptions, outcomes, breaches',
                'Integrate with incident management exercises'
              ]
            },
            {
              type: 'keypoint',
              icon: '🔧',
              title: 'Vulnerability Remediation',
              points: [
                'Improve resilience engineering (redundancy, failover)',
                'Reduce manual work-arounds that don\'t scale',
                'Strengthen third-party contracts and monitoring',
                'Enhance alerting and incident response runbooks'
              ]
            },
            {
              type: 'checklist',
              title: 'Self-Assessment Document',
              items: [
                'Summarise IBSs, tolerances, mapping, scenarios, vulnerabilities',
                'Explain governance and investment decisions',
                'Update at least annually and after major incidents',
                'Ready to present to regulators on request'
              ]
            }
          ]
        },
        keyConcepts: [
          { term: 'Mapping', definition: 'End-to-end dependencies including third parties' },
          { term: 'Scenario Testing', definition: 'Severe but plausible disruption simulation' },
          { term: 'Self-Assessment', definition: 'Annual compliance documentation' }
        ],
        realExamples: [
          'Mapping Gap: Firm found multiple IBSs depended on single team - implemented cross-training and backup procedures',
          'Scenario Test Failure: Data centre loss test exceeded tolerance by 6 hours - investment in improved backup'
        ],
        regulatoryRequirements: [
          'SYSC 15A - Mapping requirements',
          'PS21/3 - Scenario testing expectations',
          'Annual self-assessment requirement'
        ]
      }
    },
    {
      id: 'third-party-cyber-integration',
      title: 'Third-Party and Cyber Integration',
      type: 'content',
      duration: 20,
      content: {
        learningPoint: 'Operational resilience depends on third parties and cyber controls. Integrate vendor dependencies and cyber risk into mapping and testing.',
        mainContent: {
          cards: [
            {
              type: 'checklist',
              title: 'Third-Party Integration',
              items: [
                'Map critical suppliers, cloud providers, data processors',
                'Include material subcontractor dependencies',
                'Align SLAs to impact tolerances',
                'Test provider failure scenarios'
              ]
            },
            {
              type: 'keypoint',
              icon: '🔒',
              title: 'Cyber Resilience',
              points: [
                'Treat cyber incidents as operational resilience scenarios',
                'Test ransomware, data integrity loss, DDoS scenarios',
                'Ensure playbooks align with impact tolerances',
                'Include cyber in severe but plausible testing'
              ]
            },
            {
              type: 'infogrid',
              title: 'Cyber Scenarios to Test',
              items: [
                { icon: '🔐', label: 'Ransomware', description: 'Core systems encrypted' },
                { icon: '📊', label: 'Data Integrity', description: 'Corruption or loss' },
                { icon: '🌐', label: 'DDoS', description: 'Service overwhelmed' }
              ]
            },
            {
              type: 'keypoint',
              icon: '🤝',
              title: 'Coordination with Vendors',
              points: [
                'Run joint exercises with key vendors',
                'Share resilience metrics and incident learnings',
                'Document responsibilities and escalation routes',
                'Include vendors in scenario testing'
              ]
            }
          ]
        },
        keyConcepts: [
          { term: 'Third-Party Integration', definition: 'Include all vendor dependencies in mapping' },
          { term: 'Cyber Scenarios', definition: 'Mandatory for severe but plausible testing' },
          { term: 'Joint Exercises', definition: 'Coordinated testing with key vendors' }
        ],
        realExamples: [
          'Cloud Outage Exercise: Joint test with cloud provider to simulate region outage - identified recovery gaps',
          'Ransomware Scenario: Simulated event exceeded tolerance due to manual delays - automation investment'
        ],
        regulatoryRequirements: [
          'SYSC 15A - Third-party in mapping',
          'PS21/3 - Cyber scenario testing',
          'FG16/5 - Cloud provider requirements'
        ]
      }
    },
    {
      id: 'incident-management-learning',
      title: 'Incident Management, Third-Party Failures & Learning',
      type: 'content',
      duration: 20,
      content: {
        learningPoint: 'Robust incident management is critical to operational resilience. Third-party failures don\'t remove firm responsibility. Treat major incidents as conduct events.',
        mainContent: {
          cards: [
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Detect & Triage', description: 'Monitoring, alerts, escalation criteria' },
                { number: 2, title: 'Assess & Mobilise', description: 'Which IBSs affected? Activate playbooks' },
                { number: 3, title: 'Contain & Recover', description: 'Technical recovery, work-arounds' },
                { number: 4, title: 'Communicate', description: 'Customers, partners, regulators' },
                { number: 5, title: 'Learn & Improve', description: 'Post-incident review, update mapping' }
              ]
            },
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Third-Party Failures',
              message: 'Outsourcing does NOT remove responsibility. If a third-party failure disrupts an IBS, the firm remains accountable for staying within impact tolerances.'
            },
            {
              type: 'checklist',
              title: 'Third-Party Incident Provisions',
              items: [
                'Playbooks must cover third-party failure scenarios',
                'Contracts include incident notification requirements',
                'Cooperation and access to logs clauses',
                'Participation in post-incident reviews'
              ]
            },
            {
              type: 'keypoint',
              icon: '👥',
              title: 'Consumer Duty & Incidents',
              points: [
                'Treat major incidents as CONDUCT events, not just technical',
                'Consider vulnerable customer impact and tailored support',
                'Use incident MI in Consumer Duty Board reports',
                'Feed learnings into product and journey design'
              ]
            },
            {
              type: 'infogrid',
              title: 'Incident MI for Governance',
              items: [
                { icon: '⏱️', label: 'Duration', description: 'How long was service down?' },
                { icon: '👥', label: 'Customers', description: 'How many affected?' },
                { icon: '📝', label: 'Complaints', description: 'What issues raised?' },
                { icon: '💰', label: 'Compensation', description: 'What was paid out?' }
              ]
            }
          ]
        },
        keyConcepts: [
          { term: 'Incident Lifecycle', definition: 'Detect, assess, contain, communicate, learn' },
          { term: 'Third-Party Accountability', definition: 'Firm responsible regardless of provider failure' },
          { term: 'Conduct Event', definition: 'Major incidents have conduct implications' }
        ],
        realExamples: [
          'Effective Response: Payment system failed 2 hours - playbook activated in 15 mins, comms in 30 mins, tolerance met',
          'Third-Party Learning: Cloud outage revealed no independent monitoring - implemented direct monitoring and notification requirements'
        ],
        regulatoryRequirements: [
          'PS21/3 - Incident management requirements',
          'Principle 11 - Regulatory notifications',
          'Consumer Duty - Conduct event treatment'
        ]
      }
    }
  ],
  practiceScenarios: [
    {
      id: 'ibs-outage-tolerance',
      title: 'IBS Outage & Impact Tolerance',
      description: 'An online payments service that you have classified as an important business service becomes unavailable for 2 hours due to a configuration error at a cloud provider. Your impact tolerance for this service is "no more than 90 minutes total unavailability in any 24-hour period".',
      difficulty: 'intermediate',
      questions: [
        'Has your firm breached its impact tolerance?',
        'What evidence would you need to show the FCA or PRA?',
        'What remediation and governance actions should follow?'
      ],
      hints: [
        '2 hours = 120 minutes; tolerance = 90 minutes',
        'Document start time, duration, customers affected',
        'Board notification and remediation plan required'
      ],
      modelAnswer: 'Yes, you have breached impact tolerance (120 minutes vs 90 minute tolerance). Evidence needed: (1) Incident timeline with precise start and end times, (2) Root cause analysis showing cloud provider configuration error, (3) Number of customers affected and nature of impact, (4) Actions taken during incident and time to recovery, (5) Customer complaints and compensation provided. Remediation and governance: (1) Immediate Board notification of tolerance breach, (2) Formal post-incident review with root cause analysis, (3) Remediation plan addressing: cloud provider monitoring, configuration change controls, redundancy options, (4) Update self-assessment to reflect breach and remediation, (5) Consider whether impact tolerance is appropriate or if additional controls are needed, (6) Regulatory notification if material.'
    },
    {
      id: 'cyber-incident-communications',
      title: 'Cyber Incident & Customer Communications',
      description: 'A cyberattack encrypts a key back-office system supporting account updates. Front-end access still works, but some transactions fail in the background and will need to be replayed. Social media rumours suggest "data theft" and "money gone missing".',
      difficulty: 'advanced',
      questions: [
        'How do you classify and manage this incident within your resilience framework?',
        'What, when and how should you communicate to customers and regulators?',
        'How does Consumer Duty shape your decision on timing, clarity and remediation?'
      ],
      hints: [
        'Assess which IBSs are affected',
        'Balance speed vs accuracy in communications',
        'Consumer Duty: understanding and support outcomes'
      ],
      modelAnswer: 'Classification and management: (1) Declare major incident affecting [relevant IBS], (2) Assess impact tolerance – is transaction processing within tolerance given replay capability? (3) Activate cyber incident playbook and involve CISO/security team, (4) Isolate affected system and assess data breach risk. Customer communication: (1) Timing: rapid but accurate – address social media rumours within 1-2 hours, (2) Content: clear statement that front-end access works, some transactions delayed but no data loss or theft confirmed, (3) Channel: website banner, social media response, email to affected customers, (4) Avoid speculation but commit to updates. Regulator communication: Notify under Principle 11 if material, cyber reporting obligations may apply. Consumer Duty considerations: (1) Consumer understanding: clear, jargon-free explanation of what happened and what customers need to do (likely nothing), (2) Consumer support: proactive outreach to affected customers, extended support hours, (3) Vulnerable customers: consider if any are disproportionately affected, (4) Post-incident: compensation policy for any financial impact.'
    },
    {
      id: 'third-party-mapping-gap',
      title: 'Third-Party Failure & Mapping Gaps',
      description: 'A third-party call-centre provider experiences a major telephony outage. You discover that multiple IBSs (including complaints handling and card hot-listing) rely on the same provider, but this wasn\'t obvious from your existing mapping.',
      difficulty: 'advanced',
      questions: [
        'What does this reveal about your mapping and concentration risk?',
        'How should this incident feed into your scenario testing and self-assessment?',
        'What changes to contracts, oversight and contingency arrangements might be needed?'
      ],
      hints: [
        'Mapping should show all third-party dependencies',
        'Concentration risk = multiple IBSs on same provider',
        'Scenario testing should include provider failure'
      ],
      modelAnswer: 'Mapping and concentration risk: This reveals a mapping gap – third-party dependencies weren\'t fully traced to all IBSs they support. Concentration risk is now evident: single provider supporting multiple critical services. Scenario testing and self-assessment: (1) Add "telephony provider failure" scenario to testing programme, (2) Update mapping to show all services dependent on this and other key providers, (3) Update self-assessment to acknowledge gap and remediation plan, (4) Board report on mapping deficiency and improvement programme. Changes needed: (1) Contracts: incident notification requirements, SLAs aligned to your impact tolerances, cooperation on testing, (2) Oversight: regular review of provider resilience, inclusion in your monitoring dashboard, (3) Contingency: alternative provider assessment, manual fallback procedures for critical functions like card hot-listing, (4) Consider diversification: could complaints go to different provider than hot-listing? (5) Include provider in future scenario exercises.'
    }
  ],
  assessmentQuestions: [
    {
      id: 'or-q1',
      question: 'Which statement best reflects the FCA\'s definition of operational resilience?',
      options: [
        'The ability of a firm to maximise profit through efficiency',
        'The ability of a firm to prevent, adapt and respond to, recover and learn from operational disruption',
        'A firm\'s capacity to outsource all critical services to third parties',
        'The ability to pass IT penetration tests once a year'
      ],
      correctAnswer: 1,
      explanation: 'The FCA defines operational resilience as the ability to prevent, adapt and respond to, recover and learn from operational disruption so that important services continue without causing intolerable harm.',
      difficulty: 'beginner'
    },
    {
      id: 'or-q2',
      question: 'Which service is most likely to qualify as an "important business service" under SYSC 15A?',
      options: [
        'Internal HR performance review system',
        'Cafeteria catering service',
        'Customer access to online payment and transfer functionality',
        'Staff car-parking permit allocation'
      ],
      correctAnswer: 2,
      explanation: 'Important business services are those whose disruption could cause intolerable harm to clients or risk to market integrity; core customer payment and transfer access is a typical example.',
      difficulty: 'beginner'
    },
    {
      id: 'or-q3',
      question: 'What is an "impact tolerance" in the context of PS21/3 and SYSC 15A?',
      options: [
        'The maximum financial loss the firm is willing to take',
        'The maximum tolerable level of disruption to an important business service',
        'The minimum uptime required for all IT systems',
        'The threshold for reporting incidents to the media'
      ],
      correctAnswer: 1,
      explanation: 'Impact tolerances represent the maximum tolerable level of disruption to each important business service, such as time, volume of customers affected and nature of harm.',
      difficulty: 'intermediate'
    },
    {
      id: 'or-q4',
      question: 'What should effective mapping of important business services include?',
      options: [
        'Only internal IT systems',
        'People, processes, technology, facilities and third parties that support the service',
        'Only the number of staff involved',
        'Only customer-facing applications'
      ],
      correctAnswer: 1,
      explanation: 'SYSC 15A requires mapping of all dependencies: people, processes, technology, facilities and third parties that support each important business service.',
      difficulty: 'intermediate'
    },
    {
      id: 'or-q5',
      question: 'What does the FCA expect from scenario testing for operational resilience?',
      options: [
        'Paper-based exercises are sufficient',
        'Testing only needs to cover IT system failures',
        'Increasing sophistication and realism over time, testing severe but plausible scenarios',
        'Testing is optional if the firm has good business continuity plans'
      ],
      correctAnswer: 2,
      explanation: 'The FCA expects scenario testing to be increasingly sophisticated and realistic, covering severe but plausible disruptions and integrating with incident management exercises.',
      difficulty: 'intermediate'
    },
    {
      id: 'or-q6',
      question: 'By when must firms be able to operate within their impact tolerances under severe but plausible scenarios?',
      options: [
        '31 March 2022',
        '31 March 2024',
        '31 March 2025',
        '31 March 2026'
      ],
      correctAnswer: 2,
      explanation: 'The FCA\'s transition period ends 31 March 2025, by which time firms must be able to demonstrate they can operate important business services within impact tolerances.',
      difficulty: 'intermediate'
    },
    {
      id: 'or-q7',
      question: 'How should a firm treat a major operational incident under Consumer Duty?',
      options: [
        'As a technical matter only, with no conduct implications',
        'As both a technical failure and a conduct event, considering customer impact and communications',
        'As relevant only if customers complain',
        'As outside Consumer Duty scope'
      ],
      correctAnswer: 1,
      explanation: 'Major incidents should be treated as conduct events as well as technical failures, considering consumer support and understanding outcomes, vulnerable customer impact, and feeding MI into Duty Board reports.',
      difficulty: 'intermediate'
    },
    {
      id: 'or-q8',
      question: 'What should a self-assessment document for operational resilience include?',
      options: [
        'Only a list of IT systems',
        'Summary of IBSs, impact tolerances, mapping, scenarios, vulnerabilities, and governance',
        'Only financial projections',
        'Only a list of third-party providers'
      ],
      correctAnswer: 1,
      explanation: 'The self-assessment should summarise important business services, impact tolerances, mapping, scenarios tested, vulnerabilities identified, remediation progress, and governance arrangements.',
      difficulty: 'advanced'
    }
  ],
  summary: {
    keyTakeaways: [
      'Operational resilience: prevent, adapt, respond, recover and learn from disruption',
      'Important business services (IBS): services whose disruption could cause intolerable harm',
      'Impact tolerances: maximum acceptable level of disruption for each IBS',
      'March 2025 deadline: must operate within tolerances under severe scenarios',
      'Mapping: people, processes, technology, facilities and third parties',
      'Scenario testing: increasingly realistic, covering severe but plausible disruptions',
      'Vulnerability remediation: identify gaps and evidence progress',
      'Self-assessment: annual document showing compliance approach',
      'Incident management: detect, assess, contain, communicate, learn',
      'Third-party failures don\'t remove firm responsibility',
      'Treat major incidents as conduct events under Consumer Duty'
    ],
    nextSteps: [
      'Review your important business services – are they correctly identified?',
      'Assess impact tolerances – are they meaningful and measurable?',
      'Audit mapping – does it show all dependencies including third parties?',
      'Evaluate scenario testing programme – is it increasingly realistic?',
      'Check vulnerability remediation – can you evidence progress?',
      'Update self-assessment document',
      'Review incident management playbooks for IBS linkage',
      'Ensure Board receives appropriate operational resilience MI',
      'Complete the Outsourcing module for third-party risk context'
    ],
    quickReference: {
      title: 'Operational Resilience Quick Reference',
      items: [
        { term: 'PS21/3', definition: 'FCA Policy Statement: Building Operational Resilience' },
        { term: 'SYSC 15A', definition: 'FCA Handbook chapter on operational resilience requirements' },
        { term: 'Important Business Service', definition: 'Service whose disruption could cause intolerable harm to clients or systemic risk' },
        { term: 'Impact Tolerance', definition: 'Maximum acceptable level of disruption (time, volume, harm)' },
        { term: 'Mapping', definition: 'Identifying all people, process, technology, facility and third-party dependencies' },
        { term: 'Scenario Testing', definition: 'Testing ability to stay within tolerances under severe but plausible disruptions' },
        { term: 'Self-Assessment', definition: 'Annual document demonstrating compliance with operational resilience requirements' }
      ]
    }
  },
  visualAssets: {
    diagrams: [
      {
        id: 'operational-resilience-framework',
        title: 'Operational Resilience Framework',
        description: 'Overview showing IBS → Impact Tolerances → Mapping → Testing → Remediation cycle',
        type: 'process'
      },
      {
        id: 'incident-management-lifecycle',
        title: 'Incident Management Lifecycle',
        description: 'Circular flow: Detect → Assess → Contain → Communicate → Learn',
        type: 'process'
      },
      {
        id: 'ibs-mapping-example',
        title: 'IBS Dependency Mapping',
        description: 'Example showing end-to-end dependencies for a payment service',
        type: 'hierarchy'
      }
    ],
    infographics: [
      {
        id: 'impact-tolerance-examples',
        title: 'Impact Tolerance Examples',
        description: 'Sample tolerances for common important business services'
      },
      {
        id: 'march-2025-checklist',
        title: 'March 2025 Readiness Checklist',
        description: 'Key requirements for operational resilience compliance deadline'
      }
    ]
  }
};
