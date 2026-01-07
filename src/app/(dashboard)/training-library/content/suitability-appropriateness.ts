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
      type: 'content',
      duration: 20,
      content: {
        learningPoint: 'Understand when COBS 9A suitability vs COBS 10A appropriateness applies, and the key differences between these regimes.',
        mainContent: {
          cards: [
            {
              type: 'infogrid',
              title: 'The Key Question Each Regime Answers',
              items: [
                { icon: '📋', label: 'COBS 9A Suitability', description: 'Is this suitable for THIS client?' },
                { icon: '❓', label: 'COBS 10A Appropriateness', description: 'Does client understand the risks?' },
                { icon: '🔓', label: 'Execution-Only', description: 'Limited exemption - narrow conditions' }
              ]
            },
            {
              type: 'keypoint',
              icon: '📋',
              title: 'COBS 9A Suitability – When It Applies',
              points: [
                'Personal recommendation for MiFID instruments or IBIPs',
                'Portfolio management services',
                'Full assessment: knowledge, financial situation, objectives',
                'Broadest protection level'
              ]
            },
            {
              type: 'keypoint',
              icon: '❓',
              title: 'COBS 10A Appropriateness – When It Applies',
              points: [
                'Non-advised services (execution-only, R&T) for complex products',
                'Focus ONLY on knowledge and experience',
                'Does client understand the risks?',
                'Narrower than suitability but Consumer Duty adds foreseeable harm'
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Execution-Only – Narrow Exemption',
              message: 'COBS 10/10A allow exemptions only for: non-complex instruments, genuine client initiative, proper risk warnings. Mis-labelling advised sales as execution-only is a major compliance risk frequently challenged by FCA and FOS.'
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Suitability (9A)', description: 'Full assessment for ADVISED business' },
                { number: 2, title: 'Appropriateness (10A)', description: 'Knowledge/experience for NON-ADVISED complex' },
                { number: 3, title: 'Execution-Only', description: 'Limited exemption - non-complex, client initiative' }
              ]
            }
          ]
        },
        keyConcepts: [
          { term: 'Suitability', definition: 'Full assessment for personal recommendations and portfolio management' },
          { term: 'Appropriateness', definition: 'Knowledge/experience check for non-advised complex products' },
          { term: 'Execution-Only', definition: 'Narrow exemption - non-complex, client initiative, proper warnings' }
        ],
        realExamples: [
          'Advised vs Non-Advised: Wealth manager recommending fund = suitability (9A); Client placing own trade on platform for non-complex ETF = execution-only',
          'Mis-labelled Execution-Only: Staff suggested specific investments but documented as execution-only - FCA/FOS found it was advice, firm liable'
        ],
        regulatoryRequirements: [
          'COBS 9A - Suitability (personal recommendations)',
          'COBS 10A - Appropriateness (non-advised complex products)',
          'Consumer Duty - Foreseeable harm considerations'
        ]
      }
    },
    {
      id: 'suitability-information-assessment',
      title: 'Suitability – Information, Assessment & Reports',
      type: 'content',
      duration: 25,
      content: {
        learningPoint: 'COBS 9A.2 requires firms to collect specific information and demonstrate that recommendations meet the client\'s circumstances, objectives and risk profile.',
        mainContent: {
          cards: [
            {
              type: 'infogrid',
              title: 'Three Pillars of Suitability Information',
              items: [
                { icon: '🧠', label: 'Knowledge & Experience', description: 'Products, transactions, education' },
                { icon: '💰', label: 'Financial Situation', description: 'Income, assets, capacity for loss' },
                { icon: '🎯', label: 'Investment Objectives', description: 'Time horizon, risk tolerance, goals' }
              ]
            },
            {
              type: 'keypoint',
              icon: '🧠',
              title: '1. Knowledge and Experience',
              points: [
                'Types of service/product client is familiar with',
                'Volume and frequency of previous transactions',
                'Education and profession relevant to investing'
              ]
            },
            {
              type: 'keypoint',
              icon: '💰',
              title: '2. Financial Situation',
              points: [
                'Source and level of income',
                'Assets, liabilities, commitments',
                'Ability to bear losses (capacity for loss)'
              ]
            },
            {
              type: 'keypoint',
              icon: '🎯',
              title: '3. Investment Objectives',
              points: [
                'Time horizon and purpose of investment',
                'Risk tolerance and preferences',
                'Sustainability preferences where applicable'
              ]
            },
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Cannot Recommend Without Adequate Information',
              message: 'If a firm cannot gather adequate information, it must not give a recommendation OR must treat the product as unsuitable. There is no workaround.'
            },
            {
              type: 'checklist',
              title: 'Suitability Report Must Include',
              items: [
                'Summary of client demands, needs and objectives',
                'Explanation of WHY recommendation is suitable',
                'Material disadvantages and risks (not just benefits)',
                'Alternatives considered and why rejected',
                'Ongoing costs and charges explanation'
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Ongoing Advice Obligations',
              message: 'Firms must deliver reviews as promised, re-assess when circumstances change, and ensure ongoing charges are fair value under Consumer Duty. FCA has found firms charging for reviews they don\'t deliver.'
            }
          ]
        },
        keyConcepts: [
          { term: 'Capacity for Loss', definition: 'What client can afford to lose (distinct from risk tolerance)' },
          { term: 'Risk Tolerance', definition: 'What volatility client is willing to accept' },
          { term: 'Suitability Report', definition: 'Document explaining WHY recommendation suits client' }
        ],
        realExamples: [
          'Inadequate Capacity Assessment: Adviser recommended high-risk investments to client nearing retirement who couldn\'t afford losses - FOS upheld complaint',
          'No Reviews: Firm charged 0.5% p.a. ongoing fee but no evidence of reviews for 40% of clients - FCA required remediation and refunds'
        ],
        regulatoryRequirements: [
          'COBS 9A.2 - Information requirements',
          'COBS 9A.3 - Suitability assessment',
          'Consumer Duty - Fair value for ongoing charges'
        ]
      }
    },
    {
      id: 'appropriateness-non-advised',
      title: 'Appropriateness – Non-Advised Business & Complex Products',
      type: 'content',
      duration: 25,
      content: {
        learningPoint: 'COBS 10A.2 requires firms to assess whether the client has sufficient knowledge and experience to understand the risks of complex products in non-advised sales.',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'info',
              title: 'The Appropriateness Question',
              message: 'Does this client have the necessary knowledge and experience to understand the risks involved in this product or service? Focus is ONLY on K&E - not financial situation or objectives.'
            },
            {
              type: 'keypoint',
              icon: '📋',
              title: 'Information to Gather',
              points: [
                'Types of services, transactions and instruments client knows',
                'Nature, volume and frequency of transactions in relevant products',
                'Level of education and profession relevant to investing',
                'For bundled services, assess the overall package'
              ]
            },
            {
              type: 'infogrid',
              title: 'Complex Products Requiring Appropriateness',
              items: [
                { icon: '📈', label: 'CFDs', description: 'Leveraged derivatives' },
                { icon: '⚡', label: 'Options', description: 'Derivative contracts' },
                { icon: '🔗', label: 'Structured Products', description: 'Complex payoffs' },
                { icon: '🔒', label: 'Non-Realisable Securities', description: 'Illiquid investments' }
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'If Not Appropriate',
              message: 'Warn clearly that the product may be inappropriate OR that appropriateness cannot be determined. Warning must be prominent and specific - not buried in small print. Client may proceed but Consumer Duty requires avoiding foreseeable harm.'
            },
            {
              type: 'checklist',
              title: 'Execution-Only Exemption Conditions',
              items: [
                'Non-complex instruments only',
                'Genuine client initiative (not prompted)',
                'Proper risk warnings and disclosures given',
                'Certain regulatory conditions met'
              ]
            },
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Bad Practice Examples',
              message: 'Labelling transactions as execution-only when staff gave advice/steers; Treating complex products as non-complex; Relying on generic disclaimers without genuine assessment.'
            }
          ]
        },
        keyConcepts: [
          { term: 'Appropriateness', definition: 'Knowledge/experience check - narrower than suitability' },
          { term: 'Complex Product', definition: 'Derivatives, structured products, certain illiquid securities' },
          { term: 'Prominent Warning', definition: 'Clear, specific, not buried in small print' }
        ],
        realExamples: [
          'CFD Platform: Client with no derivatives experience - platform warned CFDs may be inappropriate, documented warning, client may proceed',
          'Disguised Advice: Staff answered "what would you do?" with recommendations but documented as execution-only - FCA found it was advice, enforcement action'
        ],
        regulatoryRequirements: [
          'COBS 10A.2 - Appropriateness assessment',
          'COBS 10A.3 - Warning requirements',
          'Consumer Duty - Foreseeable harm considerations'
        ]
      }
    },
    {
      id: 'execution-only-boundaries',
      title: 'Execution-Only Boundaries and Client Initiative',
      type: 'content',
      duration: 18,
      content: {
        learningPoint: 'Execution-only is a narrow exemption, not a default. Firms must ensure the customer initiates the transaction and that the product is non-complex.',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Narrow Exemption - Not a Default',
              message: 'Execution-only is NOT a way to avoid suitability obligations. Misusing it creates suitability liability even if the paperwork says "execution-only".'
            },
            {
              type: 'checklist',
              title: 'Execution-Only Conditions',
              items: [
                'Client initiates the transaction without recommendation',
                'Instrument is non-complex under FCA rules',
                'Appropriate risk warnings provided',
                'Firm does not encourage or steer the decision'
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Red Flags for Misuse',
              message: 'Scripted sales language implying suitability; "Recommended lists" for execution-only journeys; Complex products without appropriateness testing; Customer confusion about what they are buying.'
            },
            {
              type: 'keypoint',
              icon: '📁',
              title: 'Documentation Expectations',
              points: [
                'Record how client initiative was demonstrated',
                'Evidence that product is non-complex',
                'Archive specific warning shown to customer',
                'Clear audit trail of the journey'
              ]
            },
            {
              type: 'infogrid',
              title: 'Client Initiative Evidence',
              items: [
                { icon: '✅', label: 'Genuine Initiative', description: 'Client searched/selected product' },
                { icon: '❌', label: 'Prompted', description: 'Staff suggested product' },
                { icon: '📝', label: 'Documented', description: 'Journey recorded' }
              ]
            }
          ]
        },
        keyConcepts: [
          { term: 'Client Initiative', definition: 'Must be genuine and documented, not prompted' },
          { term: 'Non-Complex', definition: 'Product classification must be defensible' },
          { term: 'Audit Trail', definition: 'Document journey, warnings, and product type' }
        ],
        realExamples: [
          'Prompted Execution-Only: Firm suggested a product then processed as execution-only - FOS treated as advice, applied suitability standards',
          'Defensible Execution-Only: Platform recorded client journey, warnings, and product classification for non-complex ETF - upheld'
        ],
        regulatoryRequirements: [
          'COBS 10A.4 - Execution-only exemption',
          'COBS 10 - Non-complex instrument definitions',
          'FOS/FCA guidance on client initiative'
        ]
      }
    },
    {
      id: 'governance-ongoing-suitability',
      title: 'Governance, Ongoing Suitability and File Reviews',
      type: 'content',
      duration: 18,
      content: {
        learningPoint: 'Suitability is not a one-off event. Firms must evidence that recommendations remain suitable and represent fair value through ongoing reviews and governance.',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'info',
              title: 'Ongoing Suitability is Required',
              message: 'Firms providing ongoing advice or discretionary services must evidence that recommendations remain suitable and charges represent fair value - not just at point of sale.'
            },
            {
              type: 'checklist',
              title: 'Ongoing Suitability Expectations',
              items: [
                'Periodic reviews aligned to client circumstances',
                'Reassessment when material changes occur',
                'Evidence that ongoing charges match delivered services',
                'Documentation of review outcomes'
              ]
            },
            {
              type: 'keypoint',
              icon: '📋',
              title: 'File Review and QA',
              points: [
                'Sample advice files to test completeness and rationale',
                'Check suitability reports explain WHY recommendation was made',
                'Verify capacity for loss and risk tolerance assessments',
                'Identify and fix systematic weaknesses'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Track Completion', description: 'Monitor review completion rates' },
                { number: 2, title: 'Identify Exceptions', description: 'Flag suitability issues' },
                { number: 3, title: 'Escalate', description: 'Report recurring issues to senior management' },
                { number: 4, title: 'Remediate', description: 'Fix systematic failures' }
              ]
            },
            {
              type: 'infogrid',
              title: 'MI and Governance Metrics',
              items: [
                { icon: '📊', label: 'Review Rates', description: 'Completion tracking' },
                { icon: '⚠️', label: 'Exceptions', description: 'Suitability issues flagged' },
                { icon: '📈', label: 'Outcomes', description: 'Client results monitoring' },
                { icon: '💰', label: 'Fair Value', description: 'Charges vs services' }
              ]
            }
          ]
        },
        keyConcepts: [
          { term: 'Ongoing Suitability', definition: 'Continuous obligation, not one-off' },
          { term: 'File Review', definition: 'QA process to test completeness and rationale' },
          { term: 'Fair Value', definition: 'Charges must match services delivered' }
        ],
        realExamples: [
          'Missed Review Gap: Firm charged ongoing fees but no evidence of reviews for 30% of clients - regulatory remediation and fee refunds',
          'Structured QA: Quarterly file reviews identified weak capacity for loss analysis - updated templates and training, reduced complaints'
        ],
        regulatoryRequirements: [
          'COBS 9A - Ongoing suitability requirements',
          'Consumer Duty - Fair value outcome',
          'SYSC - Senior management responsibility'
        ]
      }
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
