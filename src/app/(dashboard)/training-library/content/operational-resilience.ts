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
      duration: 25,
      content: `**What is Operational Resilience?**

The FCA's operational resilience rules aim to ensure firms and the sector can **prevent, adapt and respond to, recover and learn from operational disruption**, so that disruptions do not cause intolerable harm to customers or risk to market integrity.

Key components:
- Focus is on **outcomes** (continuity of important services), not just internal processes
- Operational resilience is complementary to, but distinct from, business continuity and IT disaster recovery
- It is a broader, firm-wide conduct and prudential concept

**Important Business Services (IBS)**

Under SYSC 15A and PS21/3, firms must identify their important business services:

> A service provided by the firm (or by another person on its behalf) to an external end user which, if disrupted, could cause **intolerable levels of harm** to one or more of the firm's clients, or risk to the soundness, stability or resilience of the UK financial system.

Practical implications:
- Focus on **external customer-facing** services, not every internal process
- Harm assessed across: number of customers, their characteristics (including vulnerability), duration and nature of disruption, and substitutability

**Examples of IBS:**
- Access to transaction/payment accounts
- Initiation and processing of payments or FX
- Onboarding and authentication for key digital services

**Impact Tolerances**

For each important business service, firms must set at least one **impact tolerance** – the maximum tolerable level of disruption.

Impact tolerances typically include:
- **Maximum tolerable duration** of disruption (e.g. 2 hours, 1 day)
- Qualitative/quantitative criteria around:
  - Volume of customers affected
  - Type of harm (financial loss, distress, safety)
  - Critical times (e.g. market cut-offs, payroll dates)

**Key deadline: By 31 March 2025**, firms must be able to operate services within their impact tolerances under severe but plausible scenarios.

**Governance & Review**

SYSC 15A requires firms to keep compliance under review and re-assess IBSs and impact tolerances at least annually and when there is a material change.

Boards must:
- Approve IBSs, impact tolerances and self-assessment
- Oversee scenario testing, remediation and investment decisions
- Integrate operational resilience into risk appetite, strategy and change programmes`,
      keyConcepts: [
        'Operational resilience: prevent, adapt, respond, recover and learn from disruption',
        'Focus on outcomes and continuity of important services',
        'IBS: services whose disruption could cause intolerable harm',
        'Impact tolerance: maximum acceptable level of disruption',
        'March 2025 deadline: operate within tolerances under severe scenarios',
        'Annual review of IBS and impact tolerances required',
        'Board approval and oversight mandatory'
      ],
      realExamples: [
        {
          title: 'IBS Identification',
          description: 'A firm initially identified 50+ business services. After focusing on external customer impact and harm potential, they refined to 8 true important business services.',
          outcome: 'More focused resilience investment and meaningful impact tolerances'
        },
        {
          title: 'Impact Tolerance Setting',
          description: 'A payments firm set impact tolerance for payment processing at "no more than 4 hours total disruption in any 24-hour period" based on analysis of customer harm, regulatory expectations and operational capabilities.',
          outcome: 'Clear, measurable tolerance that drove investment in redundancy and monitoring'
        }
      ]
    },
    {
      id: 'impact-tolerances-evidence',
      title: 'Setting Impact Tolerances and Evidence',
      duration: 20,
      content: `Impact tolerances define the maximum level of disruption you can tolerate for each important business service. They are not aspirational targets; they must be evidence-based and linked to customer harm.

**Setting Impact Tolerances**
- Define what "intolerable harm" means for your customer base
- Use quantitative and qualitative measures (time, volume, customer type)
- Consider critical periods (payroll, market cut-offs, holidays)

**Evidence Expectations**
- Document the rationale and assumptions behind each tolerance
- Link tolerances to mapping outputs and scenario testing
- Show how tolerances were approved and reviewed by the board

**Monitoring for Breaches**
- Track elapsed downtime and customer impact in real time
- Record when tolerances are exceeded and why
- Use breach events to drive remediation and investment decisions`,
      keyConcepts: [
        'Impact tolerance is the maximum disruption allowed for a service',
        'Tolerances must be linked to harm, not convenience',
        'Board approval and evidence are mandatory',
        'Breaches require documented remediation'
      ],
      realExamples: [
        {
          title: 'Evidence-Based Tolerance',
          description: 'A payments firm set a 2-hour tolerance based on customer harm analysis and settlement cut-offs.',
          outcome: 'Tolerance was accepted in FCA review due to clear evidence'
        },
        {
          title: 'Tolerance Breach Response',
          description: 'A firm exceeded tolerance during a cyber incident and documented the root cause and remediation plan.',
          outcome: 'Board approved resilience investment and re-tested controls'
        }
      ]
    },
    {
      id: 'mapping-testing-self-assessment',
      title: 'Mapping, Scenario Testing & Self-Assessment',
      duration: 25,
      content: `**Mapping – Understanding Dependencies**

Firms must identify and map the people, processes, technology, facilities and **third parties** that support each important business service.

Effective mapping should:
- Show **end-to-end service chains** (front-end channels, middleware, core systems, data stores, third-party services)
- Highlight **single points of failure** and concentration risks, including cloud and critical providers
- Support scenario design, impact analysis and remediation planning

The FCA emphasised in 2024 that many firms' mapping was still too shallow, missing key third-party and data dependencies.

**Scenario Testing – Severe but Plausible**

Firms must carry out scenario testing to assess their ability to remain within impact tolerances in the face of severe but plausible disruptions.

**Example scenarios:**
- Loss of a key data centre or cloud region
- Prolonged telecommunications outage
- Cyberattack crippling a core application
- Payment system or card scheme failure
- Multi-service disruption (e.g. cyber incident during peak trading)

**FCA expectations:**
- Increasing sophistication and realism over time (not just paper-based tests)
- Integration with incident management exercises (simulations, war-games)
- Clear records of test assumptions, outcomes, breaches of tolerances and remediation actions

**Identifying Vulnerabilities & Remediation**

Scenario testing and mapping should lead to a structured vulnerability remediation plan:
- Improving resilience engineering (redundancy, failover, data replication)
- Reducing manual work-arounds that are not scalable under stress
- Strengthening third-party contracts, exit strategies and monitoring
- Enhancing monitoring, alerting and incident response runbooks

The FCA's 2024 observations highlighted that many firms had identified vulnerabilities but not yet remediated them or could not evidence progress convincingly.

**Self-Assessment**

Firms in scope must produce and maintain a self-assessment document explaining how they meet the operational resilience requirements.

A good self-assessment:
- Summarises IBSs, impact tolerances, mapping, scenarios and vulnerabilities
- Explains governance, decision-making and investment trade-offs
- Is updated at least annually and after material changes or major incidents
- Can be presented to regulators on request and used for Board education`,
      keyConcepts: [
        'Map people, processes, technology, facilities and third parties',
        'Show end-to-end service chains and single points of failure',
        'Scenario testing: severe but plausible disruptions',
        'Tests should be increasingly realistic, not just paper exercises',
        'Document test assumptions, outcomes and remediation',
        'Vulnerability remediation: redundancy, failover, third-party strengthening',
        'Self-assessment: annual document showing compliance approach'
      ],
      realExamples: [
        {
          title: 'Mapping Gap Discovery',
          description: 'During mapping, a firm discovered that multiple IBSs depended on a single internal team that was also a single point of failure for key processes.',
          outcome: 'Cross-training programme and documented backup procedures implemented'
        },
        {
          title: 'Scenario Test Failure',
          description: 'A firm\'s scenario test for data centre loss revealed recovery time would exceed impact tolerance by 6 hours due to untested backup restoration.',
          outcome: 'Investment in improved backup infrastructure and regular restoration testing'
        }
      ]
    },
    {
      id: 'third-party-cyber-integration',
      title: 'Third-Party and Cyber Integration',
      duration: 20,
      content: `Operational resilience depends on third parties and cyber controls. Firms must integrate vendor dependencies and cyber risk into resilience mapping and testing.

**Third-Party Integration**
- Map critical suppliers, cloud providers and data processors
- Include subcontractor dependencies where material
- Align SLAs to impact tolerances and testing outcomes

**Cyber Resilience**
- Treat cyber incidents as operational resilience scenarios
- Test ransomware, data integrity loss and DDoS scenarios
- Ensure incident response playbooks align with impact tolerances

**Coordination**
- Run joint exercises with key vendors
- Share resilience metrics and incident learnings
- Document responsibilities and escalation routes`,
      keyConcepts: [
        'Third-party dependencies must be included in IBS mapping',
        'Cyber scenarios are mandatory for severe but plausible testing',
        'Joint exercises improve response realism',
        'Clear ownership reduces response delays'
      ],
      realExamples: [
        {
          title: 'Cloud Outage Exercise',
          description: 'A firm ran a joint test with its cloud provider to simulate a region outage.',
          outcome: 'Identified recovery gaps and revised failover plans'
        },
        {
          title: 'Ransomware Scenario',
          description: 'A simulated ransomware event exceeded tolerance due to manual reconciliation delays.',
          outcome: 'Automation investment and updated playbooks'
        }
      ]
    },
    {
      id: 'incident-management-learning',
      title: 'Incident Management, Third-Party Failures & Learning',
      duration: 20,
      content: `**Incident Management Lifecycle**

Operational resilience depends on a robust incident management framework. Sector guidance typically follows:

**1. Detect & Triage**
- Monitoring, alerts and frontline escalation
- Clear criteria for declaring an incident and major incident linked to IBSs and impact tolerances

**2. Assess & Mobilise**
- Rapid assessment of which IBSs are affected, expected duration and customer impact
- Activation of incident management team and playbooks

**3. Contain & Recover**
- Technical recovery actions (failover, work-arounds)
- Operational measures (manual processing, capacity reallocation)

**4. Communicate**
- Timely, honest communication to customers, partners and staff
- Regulatory notifications where thresholds are met (Principle 11, major incident reporting)

**5. Learn & Improve**
- Structured post-incident review feeding into mapping, scenario design, impact tolerances and investment decisions

**Third-Party and CTP Incidents**

Under PS21/3, outsourcing does not remove responsibility: if a third-party provider failure disrupts an important business service, the firm remains accountable for staying within impact tolerances.

Implications:
- Incident playbooks must explicitly cover third-party failures (e.g. cloud outage, PSP failure)
- Contracts should include incident notification, cooperation, access to logs and participation in post-incident reviews

**Operational Resilience, Consumer Duty & Customer Communications**

Operational disruption is a key lens for Consumer Duty – particularly consumer support and consumer understanding outcomes.

Good practice:
- Treat major incidents as **conduct events** as well as technical failures
- Consider whether vulnerable customers are more severely impacted and require tailored support
- Use MI from incidents (duration, customers affected, complaints, compensation) in:
  - Operational resilience governance
  - Consumer Duty Board reports
  - Product and journey design changes`,
      keyConcepts: [
        'Incident lifecycle: detect, assess, contain, communicate, learn',
        'Link incident severity to IBS and impact tolerances',
        'Third-party failures don\'t remove firm responsibility',
        'Playbooks must cover third-party failure scenarios',
        'Post-incident review feeds continuous improvement',
        'Treat major incidents as conduct events',
        'Consider vulnerable customer impact during incidents'
      ],
      realExamples: [
        {
          title: 'Effective Incident Response',
          description: 'A firm\'s payment system failed for 2 hours. Pre-defined playbook was activated within 15 minutes, customer communications went out within 30 minutes, and recovery was completed within tolerance.',
          outcome: 'Impact tolerance met; post-incident review identified further monitoring improvements'
        },
        {
          title: 'Third-Party Incident Learning',
          description: 'A cloud provider outage affected customer access. Post-incident review revealed the firm had no independent monitoring of the provider\'s status.',
          outcome: 'Implemented direct monitoring and contractual requirement for proactive notification'
        }
      ]
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
