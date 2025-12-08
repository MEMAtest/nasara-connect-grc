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
      duration: 25,
      content: `**SYSC 3 & SYSC 8 – Outsourcing Foundations**

The FCA's Senior Management Arrangements, Systems and Controls (SYSC) sourcebook sets the core rules:

**SYSC 3** – Firms must have systems and controls appropriate to their business and risks, including where activities are outsourced.

**SYSC 8** – For many firms (common platform firms), outsourcing must be arranged so that the firm:
- Takes reasonable steps to **avoid undue operational risk**
- Does not outsource functions in a way that would **impair the quality of internal controls**
- Does not impair the FCA's ability to **supervise** the firm

**Critical principle: Regulatory responsibilities remain with the firm**, even where third parties perform key functions such as compliance support, IT and customer service.

**Outsourcing vs Other Third-Party Arrangements**

The FCA distinguishes:

- **Outsourcing** – where a service provider performs a process, service or activity that would otherwise be undertaken by the firm itself
- **Other third-party arrangements** – services that support the firm (e.g. utilities, telecoms) but are not strictly outsourcing

The operational resilience regime expects firms to consider **both**, particularly where either supports an important business service.

**Operational Resilience (SYSC 15A) – Important Business Services & Impact Tolerances**

PS21/3 and SYSC 15A require firms to:

- Identify **important business services** – services provided by the firm or on its behalf which, if disrupted, could cause intolerable harm to clients or risk to market integrity
- Set **impact tolerances** – the maximum tolerable level of disruption for each important service
- Map people, processes, technology, facilities and **third parties** that support each important business service

SYSC 15A explicitly notes that where a firm relies on a third party for an important business service, it should work with that third party to ensure scenario testing is realistic and credible.`,
      keyConcepts: [
        'SYSC 3: systems and controls must cover outsourced activities',
        'SYSC 8: avoid undue operational risk, don\'t impair controls or FCA supervision',
        'Regulatory responsibilities remain with the firm – cannot be outsourced',
        'Distinguish outsourcing from other third-party arrangements',
        'SYSC 15A: identify important business services, set impact tolerances',
        'Map all dependencies including third parties',
        'Work with third parties on realistic scenario testing'
      ],
      realExamples: [
        {
          title: 'Cloud Provider Outage',
          description: 'A firm\'s customer portal was hosted entirely on one cloud provider. A regional outage took it down for four hours. The firm argued the provider was responsible.',
          outcome: 'FCA found the firm remained accountable for operational resilience of its important business service regardless of where it was hosted'
        },
        {
          title: 'Compliance Function Outsourcing',
          description: 'A firm outsourced its compliance monitoring to a third party and reduced internal oversight. When issues emerged, the firm claimed the provider was at fault.',
          outcome: 'FCA held the firm responsible – regulatory responsibilities cannot be delegated even when compliance functions are outsourced'
        }
      ]
    },
    {
      id: 'cloud-ctps-lifecycle',
      title: 'Cloud, CTPs and the Outsourcing Lifecycle',
      duration: 25,
      content: `**Cloud and IT Outsourcing – FG16/5 & EBA Guidelines**

FCA Guidance FG16/5 clarifies how existing outsourcing rules apply when using cloud and other third-party IT services. Key themes:

- **Risk-based, proportionate approach** – controls should reflect the criticality and risk of the outsourced service

**Clear expectations for:**
- **Data security and confidentiality** (including location and access)
- **Business continuity and exit** – avoiding lock-in and ensuring recoverability
- **Audit and access rights** – including regulators' access where appropriate

The EBA Guidelines on outsourcing arrangements remain a useful benchmark for good practice around critical functions, governance, due diligence and exit planning.

**Critical Third Parties (CTPs) – Emerging UK Regime**

New powers via FSMA 2023 allow regulators to designate certain providers as **critical third parties** to the UK financial sector. Policy Statement PS24/16 and Supervisory Statement SS6/24 set out oversight of systemic third-party risk.

Key points:
- Regime manages systemic risks from large technology and cloud providers supporting many firms
- Regulators can set resilience requirements directly on designated CTPs
- **Individual firms still remain responsible** for their own outsourcing and resilience arrangements

**The Outsourcing Lifecycle – A Practical Blueprint**

**1. Classification & Risk Assessment**
- Decide whether the arrangement is outsourcing
- Assess if function is critical/important or supports an important business service
- Assess risks: operational, conduct, data, concentration, jurisdiction, CTP exposure

**2. Due Diligence**
- Assess provider's financial health, governance, security controls, resilience
- For cloud/IT, consider FG16/5 factors: data location, recovery, exit options

**3. Contracting**
- Service levels aligned to impact tolerances
- Data protection, audit/access rights (including regulators)
- Incident notification, escalation, remediation and termination

**4. Ongoing Oversight and Testing**
- Monitor performance and incidents
- Integrate into operational resilience scenario testing (including provider failure)

**5. Exit and Substitution**
- Maintain exit plans for critical services
- Include data migration and alternative providers or insourced solutions
- Test feasibility where risk profile justifies`,
      keyConcepts: [
        'FG16/5: risk-based approach to cloud outsourcing',
        'Cloud contracts: data security, audit rights, exit provisions',
        'CTP regime: regulators can oversee systemically important providers',
        'Firms remain responsible regardless of CTP designation',
        'Outsourcing lifecycle: classify, due diligence, contract, oversee, exit',
        'Exit plans must be practical and tested',
        'Concentration risk requires mapping and mitigation'
      ],
      realExamples: [
        {
          title: 'CTP Concentration Risk',
          description: 'Multiple firms discovered they all relied on the same cloud provider for core services. A single provider outage affected a significant portion of the sector.',
          outcome: 'Regulators accelerated CTP regime development; firms required to map concentration risk and consider diversification'
        },
        {
          title: 'Exit Plan Failure',
          description: 'A firm\'s IT provider announced market exit with 12 months notice. The firm\'s exit plan was theoretical and had never been tested.',
          outcome: 'Significant disruption during rushed migration; FCA questioned adequacy of exit planning and testing'
        }
      ]
    },
    {
      id: 'consumer-duty-distribution-governance',
      title: 'Consumer Duty, Distribution Chains & Governance',
      duration: 20,
      content: `**Distribution Chains, Outsourcing and Duty**

The Consumer Duty (PS22/9 and FG22/5) applies across the **distribution chain** – all firms involved in the manufacture, provision, sale and ongoing administration of a product or service to the end retail customer.

Implications:
- Outsourcing arrangements (customer service, claims handling, collections, marketing, compliance support) that influence outcomes are **in scope**
- Firms must ensure third parties understand the target market, product design and expected outcomes
- Information must flow both ways (sharing complaints and MI across the chain)

**You can outsource activity, but you cannot outsource accountability for outcomes.**

**Designing Contracts and Oversight for Duty Outcomes**

Good practice for Duty-aligned outsourcing:

- Embed Consumer Duty outcomes (products/services, price & value, consumer understanding, consumer support) into SLAs and KPIs
- Require providers to:
  - Provide MI on customer interactions, complaints, vulnerabilities and service levels
  - Cooperate in remediation exercises and policy changes
- Build rights to change processes and scripts to address foreseeable harm or poor outcomes identified via MI

**Governance, MI and Board Reporting**

Regulators expect third-party resilience and outsourcing to be **board-level issues**.

Boards should receive MI covering:
- Inventory of critical/important outsourcing arrangements and CTP exposure
- Third-party incidents, near-misses and performance vs impact tolerances
- Complaints and outcome metrics where third parties deliver customer-facing services
- Outcomes for vulnerable customers

Under Consumer Duty, this MI should feed into the **annual Duty Board report**, demonstrating how outsourced functions support or hinder good customer outcomes.`,
      keyConcepts: [
        'Consumer Duty applies across the distribution chain',
        'Outsourcers influencing outcomes are in scope even without direct customer relationship',
        'Cannot outsource accountability for customer outcomes',
        'Embed Duty outcomes into SLAs and KPIs',
        'Require MI on interactions, complaints, vulnerabilities from providers',
        'Third-party resilience is a board-level issue',
        'MI feeds Consumer Duty Board reports'
      ],
      realExamples: [
        {
          title: 'Outsourced Customer Service Failure',
          description: 'A firm outsourced customer service to a call centre with aggressive cost KPIs. Call handling times dropped but complaint rates and repeat contacts increased.',
          outcome: 'Consumer Duty review found consumer support outcome failures; firm had to revise SLAs to include quality metrics'
        },
        {
          title: 'Distribution Chain MI Gap',
          description: 'A manufacturer relied on distributors but received no MI on customer complaints or outcomes. Issues emerged only when FOS complaints spiked.',
          outcome: 'Firm required to establish MI sharing agreements across distribution chain to monitor Duty outcomes'
        }
      ]
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
