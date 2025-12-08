// Module 5: Suitability & Appropriateness – FCA COBS 9A & 10A
// Comprehensive training on advised and non-advised investment services

import { TrainingModule } from '../types';

export const suitabilityAppropriatenessModule: TrainingModule = {
  id: 'suitability-appropriateness',
  title: 'Suitability & Appropriateness – FCA COBS 9A & 10A',
  description: 'Understand the difference between suitability (advised) and appropriateness (non-advised) regimes, what information firms must collect, and how to design defendable documentation that withstands regulatory and court scrutiny.',
  category: 'regulatory-compliance',
  duration: 70,
  difficulty: 'intermediate',
  targetPersonas: [
    'senior-manager',
    'compliance-officer',
    'relationship-manager',
    'certified-person',
    'customer-service'
  ],
  prerequisiteModules: ['client-categorisation', 'consumer-duty'],
  tags: [
    'COBS 9A',
    'COBS 10A',
    'suitability',
    'appropriateness',
    'personal recommendation',
    'execution-only',
    'fact-find',
    'risk tolerance',
    'capacity for loss',
    'ongoing advice',
    'FCA'
  ],
  learningOutcomes: [
    'Explain the difference between suitability (COBS 9A) and appropriateness (COBS 10A), and when each regime applies',
    'Identify the information a firm must collect to perform a suitability assessment (knowledge, experience, financial situation, objectives, risk tolerance, capacity for loss)',
    'Distinguish between standard advice, execution-only and appropriateness-assessed business, including litigation risks of misusing execution-only',
    'Apply a robust approach to ongoing suitability and periodic reviews under COBS 9A',
    'Recognise how Consumer Duty and PROD product governance interact with suitability and appropriateness',
    'Design file-able, defendable documentation for suitability and appropriateness decisions'
  ],
  hook: {
    type: 'case-study',
    content: 'A retail client with limited investment experience is advised to switch from a simple multi-asset fund to a portfolio of high-charging, illiquid products. The advice file contains a basic fact-find but little analysis of capacity for loss or alternatives. The client pays ongoing advice fees but has not had a meaningful review for three years. Recent FCA work on ongoing advice suitability and charges has highlighted firms that charge for reviews they do not deliver and fail to revisit suitability when circumstances change.',
    question: 'If you had to stand in front of the FCA or a court tomorrow, could you show that your recommendation, your ongoing service and your charges remain suitable and fair value for the client?'
  },
  lessons: [
    {
      id: 'framework-suitability-appropriateness',
      title: 'Framework – Suitability vs Appropriateness',
      duration: 20,
      content: `**Suitability (COBS 9A) – When It Applies**

COBS 9A applies (broadly) where a firm:
- Provides a personal recommendation to a client in relation to MiFID financial instruments and/or insurance-based investment products (IBIPs)
- Or undertakes portfolio management for a client

Suitability is about answering:
> "Is this recommended transaction or portfolio suitable for this particular client, given their circumstances and objectives?"

**Appropriateness (COBS 10A) – When It Applies**

COBS 10A applies where a firm:
- Provides non-advised investment services (e.g. execution-only or reception & transmission) in relation to complex products
- Or provides certain services in relation to complex IBIPs

Appropriateness is about answering:
> "Does this client have the necessary knowledge and experience to understand the risks of this product or service?"

The test is narrower than suitability – it focuses on knowledge/experience, not wider circumstances or objectives – but the Consumer Duty now expects firms to think more broadly about foreseeable harm and customer outcomes even where only appropriateness is formally required.

**Execution-Only and Exemptions**

COBS 10/10A allow limited exemptions from the appropriateness test in certain execution-only situations (e.g. non-complex instruments, client initiative only, clear risk warnings, certain conditions met). These have been litigated and interpreted narrowly.

Mis-labelling advised or guided sales as "execution-only" is a recurrent theme in FCA enforcement and FOS decisions.

**Key Distinction:**
- Suitability = Full assessment for ADVISED business
- Appropriateness = Knowledge/experience check for NON-ADVISED complex products
- Execution-only = Limited exemption for non-complex instruments at client initiative`,
      keyConcepts: [
        'Suitability applies to personal recommendations and portfolio management',
        'Appropriateness applies to non-advised services involving complex products',
        'Suitability is broader (circumstances, objectives); appropriateness is narrower (knowledge/experience)',
        'Execution-only exemptions are limited and narrowly interpreted',
        'Mis-labelling advised sales as execution-only is a major compliance risk',
        'Consumer Duty adds foreseeable harm considerations to both regimes'
      ],
      realExamples: [
        {
          title: 'Advised vs Non-Advised',
          description: 'A wealth manager recommending a specific fund to a client triggers suitability requirements (COBS 9A). The same client placing their own trade on an online platform for a non-complex ETF may qualify for execution-only treatment.',
          outcome: 'Different regimes apply based on whether advice is given and product complexity'
        },
        {
          title: 'Mis-labelled Execution-Only',
          description: 'A firm\'s staff routinely suggested specific investments to clients but documented transactions as "execution-only" to avoid suitability requirements. FOS and the FCA found this was effectively advice.',
          outcome: 'Firm was liable for unsuitable recommendations despite "execution-only" labels'
        }
      ]
    },
    {
      id: 'suitability-information-assessment',
      title: 'Suitability – Information, Assessment & Reports',
      duration: 25,
      content: `**Information That Must Be Collected**

Under COBS 9A.2, a firm must obtain the necessary information to understand essential facts about the client. This includes, at a minimum:

**1. Knowledge and Experience**
- Types of service/product the client is familiar with
- Volume and frequency of previous transactions
- Education and profession relevant to investing

**2. Financial Situation**
- Source and level of income
- Assets, liabilities, commitments
- Ability to bear losses (capacity for loss)

**3. Investment Objectives**
- Time horizon and purpose of investment
- Risk tolerance and preferences
- Sustainability preferences where applicable

Failure to gather adequate information means the firm must not give a recommendation or must treat the product as unsuitable.

**Assessing Suitability**

A firm must show that the recommendation:
- Meets the client's objectives, including specific or long-term goals
- Is financially sustainable given their financial situation and capacity for loss
- Is consistent with the client's risk tolerance
- Aligns with their knowledge and experience
- Is appropriate for the product's target market (link to PROD 3/4 and Consumer Duty)

Under the Consumer Duty, firms should also consider foreseeability of harm and fair value over time, not just "point-in-time" suitability.

**Suitability Reports**

COBS 9/9A specify when and what a suitability report must include. As a minimum:
- Summarise the client's demands, needs and objectives
- Explain why the recommendation is suitable (objectives, time horizon, risk tolerance, capacity for loss, knowledge/experience)
- Highlight material disadvantages and risks, not just benefits

Common FCA/FOS findings include: boilerplate wording, failure to explain alternatives considered, lack of explanation of ongoing costs and charges.

**Ongoing Suitability and Periodic Reviews**

Where a firm provides ongoing advice services, it must:
- Deliver the reviews and services the client is paying for
- Re-assess suitability where there are material changes (life events, risk appetite, objectives, market events)
- Ensure ongoing charges remain fair value under Consumer Duty

The FCA has highlighted poor practice where clients pay for ongoing advice but do not receive meaningful reviews.`,
      keyConcepts: [
        'Collect: knowledge/experience, financial situation, investment objectives',
        'Capacity for loss is distinct from risk tolerance',
        'Cannot recommend if information is inadequate',
        'Suitability reports must explain WHY the recommendation is suitable',
        'Must highlight disadvantages and risks, not just benefits',
        'Ongoing advice requires actual reviews and re-assessment',
        'Consumer Duty adds fair value requirement for ongoing charges'
      ],
      realExamples: [
        {
          title: 'Inadequate Capacity for Loss Assessment',
          description: 'An adviser recommended high-risk investments to a client nearing retirement with limited savings. The fact-find showed the client could not afford to lose the capital, but this was not reflected in the recommendation.',
          outcome: 'FOS upheld complaint; recommendation was unsuitable given capacity for loss'
        },
        {
          title: 'Ongoing Advice Without Reviews',
          description: 'A firm charged 0.5% p.a. ongoing advice fee but had no evidence of annual reviews for 40% of clients. Some clients had experienced significant life changes (retirement, divorce) with no reassessment.',
          outcome: 'FCA required remediation and refunds for services not delivered'
        }
      ]
    },
    {
      id: 'appropriateness-non-advised',
      title: 'Appropriateness – Non-Advised Business & Complex Products',
      duration: 25,
      content: `**What Appropriateness Tests Ask**

COBS 10A.2 requires firms to assess whether the client has the necessary knowledge and experience to understand the risks involved in the product or service.

Information to gather:
- Types of services, transactions and financial instruments the client is familiar with
- Nature, volume and frequency of transactions in relevant products
- Level of education and profession relevant to investing

For bundled services (e.g. product plus ancillary services), firms must assess whether the overall package is appropriate.

**Products and Situations Where Appropriateness is Required**

Appropriateness tests generally apply when:
- The product is complex (e.g. derivatives such as CFDs, options, certain structured products, some non-readily realisable securities)
- The service is provided on a non-advised basis (execution-only or RTO) to a retail (and in some cases professional) client

Firms must not rely on generic website disclaimers or checkboxes alone; they need a genuine assessment.

**If the Product is Not Appropriate or Information is Insufficient**

Where the assessment shows the product is not appropriate, or the client fails/refuses to provide sufficient information, the firm must:
- Warn the client clearly that the product/service may be inappropriate OR that the firm cannot determine appropriateness
- The warning must be prominent and specific, not buried in small print

The client may still proceed, but under the Consumer Duty firms should challenge whether this is consistent with avoiding foreseeable harm, especially for mass-market retail distribution of high-risk investments.

**Execution-Only Exemptions – Used Carefully**

COBS 10/10A allow an execution-only exemption in limited circumstances:
- Non-complex instruments at the client's initiative
- Certain conditions met
- Proper risk warnings and disclosures given

Courts have interpreted these strictly:
- The initiative must genuinely come from the client
- The product must be non-complex under the rules
- Proper risk warnings must be given

**Bad Practice:**
- Labelling transactions as "execution-only" when staff have effectively given advice or strong steers
- Treating complex products as non-complex to avoid appropriateness
- Relying on generic disclaimers without genuine assessment`,
      keyConcepts: [
        'Appropriateness focuses on knowledge and experience only',
        'Complex products require appropriateness assessment for non-advised sales',
        'Warn clearly if product is inappropriate or cannot assess',
        'Warnings must be prominent and specific',
        'Execution-only exemption is narrow – client initiative, non-complex, proper warnings',
        'Courts interpret execution-only conditions strictly',
        'Consumer Duty adds foreseeable harm considerations even for non-advised'
      ],
      realExamples: [
        {
          title: 'CFD Platform Warning',
          description: 'A retail client with no derivatives experience wants to trade CFDs. The platform\'s appropriateness test shows they lack relevant knowledge. The platform provides a clear, prominent warning that CFDs may be inappropriate.',
          outcome: 'Client may proceed but firm has documented the warning and discharged its COBS 10A obligation'
        },
        {
          title: 'Disguised Advice',
          description: 'Platform staff regularly answered "what would you do?" questions with specific product recommendations but documented all trades as execution-only. The FCA found this was effectively advice.',
          outcome: 'Suitability requirements applied; firm faced enforcement for systematic failures'
        }
      ]
    }
  ],
  practiceScenarios: [
    {
      id: 'higher-risk-recommendation',
      title: 'Higher-Risk Product Recommendation',
      description: 'A retail client with modest savings and limited investment experience is advised to move their ISA into a concentrated portfolio of high-charging structured products with capital-at-risk features.',
      difficulty: 'intermediate',
      questions: [
        'What key information should be in the fact-find and suitability assessment?',
        'How would you assess capacity for loss and risk tolerance?',
        'What should be covered in the suitability report, including alternatives and disadvantages?'
      ],
      hints: [
        'Consider all three information categories: knowledge, financial situation, objectives',
        'Capacity for loss is about what they can afford to lose, not what they\'re willing to risk',
        'Suitability report must explain why this specific recommendation suits their circumstances'
      ],
      modelAnswer: 'The fact-find should cover: (1) Investment knowledge/experience – have they held structured products before? (2) Financial situation – income, assets, liabilities, emergency funds, what proportion of savings is this? (3) Objectives – time horizon, purpose, what outcome do they need? Capacity for loss assessment: Can they afford to lose some/all of this money without impacting their lifestyle or financial security? Is this money they might need? Risk tolerance: What level of volatility can they emotionally tolerate? The suitability report must explain: why structured products meet their objectives, why the charges are justified, disadvantages (complexity, illiquidity, capital at risk), alternatives considered and rejected with reasons.'
    },
    {
      id: 'cfd-trading-platform',
      title: 'CFD Trading on a Platform',
      description: 'A client signs up to an online platform and wants to trade highly leveraged CFDs on individual equities on an execution-only basis. They have limited investment history.',
      difficulty: 'intermediate',
      questions: [
        'What appropriateness checks must be carried out?',
        'What information would you gather about their knowledge and experience?',
        'What should the firm do if the test suggests CFDs are not appropriate?'
      ],
      hints: [
        'CFDs are complex products requiring appropriateness assessment',
        'Focus on derivatives-specific knowledge and experience',
        'Clear, prominent warnings are required if inappropriate'
      ],
      modelAnswer: 'Appropriateness checks must assess whether the client understands the risks of leveraged CFDs – potential for losses exceeding initial investment, margin calls, volatility. Gather: (1) Previous experience with derivatives/CFDs, (2) Understanding of leverage and margin, (3) Relevant education or professional background, (4) Trading frequency and volumes. If the test shows CFDs are not appropriate: (1) Provide a clear, prominent warning that CFDs may be inappropriate for them, (2) Explain specifically why – e.g., lack of derivatives experience, (3) Document the warning and their decision to proceed or not. Under Consumer Duty, also consider whether allowing them to proceed is consistent with avoiding foreseeable harm.'
    },
    {
      id: 'ongoing-advice-no-review',
      title: 'Ongoing Advice, No Review',
      description: 'A client has been paying an ongoing adviser charge for four years. The original recommendation was a balanced portfolio. There is no evidence of a full review for the past three years, and the client\'s circumstances have changed (retirement, new mortgage, health concerns).',
      difficulty: 'advanced',
      questions: [
        'What should have happened under COBS 9A and the firm\'s service proposition?',
        'How does the Consumer Duty apply to this situation?',
        'What remediation might be required?'
      ],
      hints: [
        'Ongoing advice charges should reflect ongoing service delivery',
        'Material changes trigger re-assessment obligation',
        'Consumer Duty requires fair value for charges'
      ],
      modelAnswer: 'Under COBS 9A and the service proposition: The firm should have conducted annual reviews as promised, re-assessed suitability given material life changes (retirement affects time horizon and income needs; health concerns may affect risk capacity), and documented these reviews. Consumer Duty applies: (1) Fair value – charges must reflect value delivered; charging for reviews not conducted fails this, (2) Consumer understanding – client should know what service they\'re receiving, (3) Consumer support – should have proactively engaged given circumstances. Remediation likely required: (1) Refund of ongoing charges for period without service delivery, (2) Urgent suitability review given changed circumstances, (3) Potential redress if portfolio has become unsuitable due to lack of review.'
    }
  ],
  assessmentQuestions: [
    {
      id: 'sa-q1',
      question: 'When does COBS 9A suitability apply?',
      options: [
        'Only when trading complex derivatives',
        'When a firm provides a personal recommendation or portfolio management',
        'Only for retail clients purchasing ETFs',
        'Whenever a client opens an account'
      ],
      correctAnswer: 1,
      explanation: 'COBS 9A applies when a firm provides a personal recommendation in relation to MiFID financial instruments or IBIPs, or undertakes portfolio management for a client.',
      difficulty: 'beginner'
    },
    {
      id: 'sa-q2',
      question: 'What is the key difference between suitability and appropriateness assessments?',
      options: [
        'Suitability only applies to professional clients',
        'Suitability considers knowledge, financial situation and objectives; appropriateness focuses only on knowledge and experience',
        'Appropriateness is more comprehensive than suitability',
        'There is no difference – they are interchangeable terms'
      ],
      correctAnswer: 1,
      explanation: 'Suitability (COBS 9A) requires assessment of knowledge/experience, financial situation, AND investment objectives. Appropriateness (COBS 10A) focuses only on whether the client has sufficient knowledge and experience to understand the risks.',
      difficulty: 'intermediate'
    },
    {
      id: 'sa-q3',
      question: 'What information must a firm collect for a suitability assessment under COBS 9A?',
      options: [
        'Only the client\'s name and address',
        'Knowledge and experience, financial situation (including capacity for loss), and investment objectives (including risk tolerance)',
        'Only the client\'s risk tolerance',
        'Only the client\'s net worth'
      ],
      correctAnswer: 1,
      explanation: 'COBS 9A.2 requires firms to gather information about: (1) knowledge and experience, (2) financial situation including ability to bear losses, and (3) investment objectives including risk tolerance and time horizon.',
      difficulty: 'intermediate'
    },
    {
      id: 'sa-q4',
      question: 'What must a firm do if a COBS 10A appropriateness test shows a complex product is not appropriate for a client?',
      options: [
        'Refuse to process the transaction under any circumstances',
        'Proceed without any warning',
        'Warn the client clearly that the product may be inappropriate and document this warning',
        'Automatically categorise the client as professional'
      ],
      correctAnswer: 2,
      explanation: 'If the assessment shows the product is not appropriate, the firm must provide a clear, prominent warning. The client may still proceed, but the warning must be documented.',
      difficulty: 'intermediate'
    },
    {
      id: 'sa-q5',
      question: 'When can the execution-only exemption from appropriateness apply?',
      options: [
        'Whenever the client signs a disclaimer',
        'For any product if the client requests it',
        'In limited circumstances: non-complex instruments, at the client\'s initiative, with proper risk warnings and certain conditions met',
        'Only for professional clients'
      ],
      correctAnswer: 2,
      explanation: 'COBS 10/10A allow execution-only exemptions only in limited circumstances: non-complex instruments, at the client\'s genuine initiative, with proper risk warnings. Courts interpret these conditions strictly.',
      difficulty: 'intermediate'
    },
    {
      id: 'sa-q6',
      question: 'What should a suitability report include?',
      options: [
        'Only the product name and price',
        'A summary of client needs/objectives, explanation of why the recommendation is suitable, and material disadvantages and risks',
        'Only the benefits of the recommended product',
        'Generic marketing materials'
      ],
      correctAnswer: 1,
      explanation: 'A suitability report must summarise the client\'s demands, needs and objectives, explain why the recommendation is suitable, and highlight material disadvantages and risks – not just benefits.',
      difficulty: 'intermediate'
    },
    {
      id: 'sa-q7',
      question: 'What are a firm\'s obligations for ongoing advice services under COBS 9A?',
      options: [
        'No ongoing obligations once the initial recommendation is made',
        'Deliver the reviews promised, re-assess suitability when circumstances change, and ensure ongoing charges remain fair value',
        'Only send annual statements',
        'Only contact the client if markets crash'
      ],
      correctAnswer: 1,
      explanation: 'Firms providing ongoing advice must deliver the reviews they charge for, re-assess suitability when there are material changes, and under Consumer Duty ensure ongoing charges represent fair value.',
      difficulty: 'advanced'
    },
    {
      id: 'sa-q8',
      question: 'Why is mis-labelling transactions as "execution-only" a significant compliance risk?',
      options: [
        'Because execution-only transactions have higher fees',
        'Because it only affects professional clients',
        'Because if the firm has effectively given advice, full suitability requirements apply regardless of the label, and the firm may be liable for unsuitable recommendations',
        'Because the FCA does not regulate execution-only business'
      ],
      correctAnswer: 2,
      explanation: 'If staff have effectively given advice (e.g., suggested specific investments), suitability requirements apply regardless of how the transaction is labelled. Mis-labelling exposes firms to liability for unsuitable recommendations.',
      difficulty: 'advanced'
    }
  ],
  summary: {
    keyTakeaways: [
      'Suitability (COBS 9A) applies to personal recommendations and portfolio management – assesses knowledge, financial situation, and objectives',
      'Appropriateness (COBS 10A) applies to non-advised complex products – focuses only on knowledge and experience',
      'Capacity for loss is distinct from risk tolerance – what can they afford to lose vs what volatility they can tolerate',
      'If information is inadequate, firms cannot recommend or must treat as unsuitable',
      'Suitability reports must explain WHY the recommendation is suitable and highlight disadvantages/risks',
      'Ongoing advice requires actual delivery of reviews and re-assessment when circumstances change',
      'Consumer Duty adds fair value requirement for ongoing charges',
      'Execution-only exemptions are narrow and strictly interpreted – mis-labelling is a major compliance risk',
      'If appropriateness test fails, must warn clearly – but consider Consumer Duty foreseeable harm'
    ],
    nextSteps: [
      'Review your firm\'s fact-find templates for completeness against COBS 9A requirements',
      'Audit suitability reports for quality – do they explain WHY recommendations are suitable?',
      'Check ongoing advice delivery – are reviews being conducted as promised?',
      'Review appropriateness processes for complex products',
      'Ensure execution-only processes have proper controls to prevent disguised advice',
      'Train advisers on capacity for loss vs risk tolerance distinction',
      'Complete the Client Categorisation module to understand how categorisation affects which regime applies'
    ],
    quickReference: {
      title: 'COBS 9A/10A Quick Reference',
      items: [
        { term: 'COBS 9A Suitability', definition: 'Full assessment for advised business – knowledge, financial situation, objectives' },
        { term: 'COBS 10A Appropriateness', definition: 'Knowledge/experience check for non-advised complex products' },
        { term: 'Capacity for Loss', definition: 'What the client can afford to lose without impacting financial security' },
        { term: 'Risk Tolerance', definition: 'The level of volatility/uncertainty the client is willing to accept' },
        { term: 'Suitability Report', definition: 'Document explaining why recommendation suits client\'s specific circumstances' },
        { term: 'Execution-Only', definition: 'Limited exemption for non-complex products at client initiative with proper warnings' },
        { term: 'Complex Product', definition: 'Products requiring appropriateness assessment (CFDs, derivatives, structured products, etc.)' }
      ]
    }
  },
  visualAssets: {
    diagrams: [
      {
        id: 'suitability-vs-appropriateness',
        title: 'Suitability vs Appropriateness Decision Tree',
        description: 'Flowchart showing when each regime applies based on advice type and product complexity',
        type: 'flowchart'
      },
      {
        id: 'suitability-information',
        title: 'Suitability Information Requirements',
        description: 'Three-pillar diagram showing knowledge/experience, financial situation, and objectives',
        type: 'hierarchy'
      },
      {
        id: 'ongoing-advice-cycle',
        title: 'Ongoing Advice Review Cycle',
        description: 'Circular diagram showing: Initial advice → Periodic review → Re-assessment → Ongoing suitability',
        type: 'process'
      }
    ],
    infographics: [
      {
        id: 'execution-only-conditions',
        title: 'Execution-Only Exemption Conditions',
        description: 'Checklist of conditions that must be met for execution-only treatment'
      },
      {
        id: 'capacity-vs-tolerance',
        title: 'Capacity for Loss vs Risk Tolerance',
        description: 'Visual comparison of these distinct but related concepts'
      }
    ]
  }
};
