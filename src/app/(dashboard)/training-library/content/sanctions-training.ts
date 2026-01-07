import { TrainingModule } from '../types';

export const sanctionsTrainingModule: TrainingModule = {
  id: 'sanctions-training',
  title: 'Sanctions & Financial Crime Prevention',
  description: 'Understand international sanctions regimes, screening procedures, and compliance obligations to prevent sanctions violations.',
  category: 'financial-crime-prevention',
  duration: 12,
  difficulty: 'intermediate',
  targetPersonas: ['compliance-officer', 'operations-staff', 'relationship-manager'],
  prerequisiteModules: ['aml-fundamentals'],
  tags: ['sanctions', 'screening', 'ofac', 'compliance', 'financial-crime'],
  learningOutcomes: [
    'Understand different types of sanctions and their legal basis',
    'Implement effective sanctions screening procedures',
    'Recognize sanctions evasion techniques and red flags',
    'Know escalation procedures for potential sanctions violations',
    'Apply risk-based approach to sanctions compliance'
  ],

  // Hook Section
  hook: {
    type: 'regulatory_breach',
    title: 'The £20.5 Million Standard Chartered Fine',
    content: `In April 2019, the FCA fined Standard Chartered Bank £20.5 million for failing to properly screen new and existing customers against sanctions lists. The bank's systems failures allowed 9,500 customers and 100,000 transactions worth $438 million to proceed without adequate sanctions screening between 2007 and 2017.

    The failures included:
    - Inadequate screening of customer names against sanctions lists
    - Poor quality data leading to missed matches
    - Insufficient monitoring of existing customer relationships
    - Delays in implementing sanctions updates

    But here's the truly shocking part: some of these customers included individuals and entities subject to sanctions related to weapons of mass destruction programs and terrorism financing. The bank unknowingly facilitated transactions that could have supported some of the world's most dangerous activities.

    This wasn't just a compliance failure - it was a breakdown that potentially endangered global security and peace. Every screening check you perform, every alert you investigate, every system update you implement could be the difference between stopping international crime and enabling it.`,
    keyQuestion: 'How confident are you that your current sanctions screening procedures would prevent similar failures at your institution?'
  },

  // Main Content Sections
  lessons: [
    {
      id: 'sanctions-fundamentals',
      title: 'Understanding Sanctions Regimes',
      type: 'content',
      duration: 4,
      content: {
        learningPoint: 'Master the different types of sanctions and their legal frameworks',
        mainContent: {
          cards: [
            {
              type: 'keypoint',
              icon: '🚫',
              title: 'What Are Sanctions?',
              points: [
                'Restrictive measures imposed by governments',
                'Achieve foreign policy & national security objectives',
                'Legal requirement to comply is ABSOLUTE',
                'Criminal liability for violations'
              ]
            },
            {
              type: 'infogrid',
              title: 'Types of Sanctions',
              items: [
                { icon: '🌐', label: 'Comprehensive', description: 'Apply to entire countries (N. Korea, Iran, Syria, Crimea). Prohibit virtually all economic activity.' },
                { icon: '🎯', label: 'Targeted/Smart', description: 'Focus on specific individuals/entities. Includes asset freezes, travel bans, arms embargoes, sectoral restrictions.' },
                { icon: '🔗', label: 'Secondary', description: 'US can sanction non-US entities dealing with sanctioned parties. Creates global extraterritorial reach.' }
              ]
            },
            {
              type: 'infogrid',
              title: 'Key Sanctions Authorities',
              items: [
                { icon: '🇺🇳', label: 'United Nations', description: 'Binding on all member states. Consensus-based, politically significant.' },
                { icon: '🇺🇸', label: 'US OFAC', description: 'Broadest extraterritorial reach. SDN & SSI lists. Most frequently updated.' },
                { icon: '🇪🇺', label: 'European Union', description: 'Harmonized across EU. Often aligned with UN but can be more restrictive.' },
                { icon: '🇬🇧', label: 'UK HM Treasury', description: 'Post-Brexit independent regime. UK Sanctions List for UK entities.' }
              ]
            },
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Legal Consequences',
              message: 'Violations carry CRIMINAL liability. Strict liability (intent not required). Unlimited fines, imprisonment, loss of banking licenses, reputational damage.'
            }
          ]
        },

        keyConcepts: [
          {
            term: 'Asset Freeze',
            definition: 'Prohibition on making funds or economic resources available to or for the benefit of designated persons'
          },
          {
            term: 'Specially Designated Nationals (SDN)',
            definition: 'OFAC list of individuals and entities whose assets are blocked and with whom US persons are prohibited from dealing'
          },
          {
            term: 'False Positive',
            definition: 'A screening alert that appears to be a match but upon investigation proves not to be the sanctioned party'
          },
          {
            term: 'Sectoral Sanctions',
            definition: 'Restrictions targeting specific sectors of an economy rather than comprehensive prohibitions'
          }
        ],

        realExamples: [
          'A UK bank processes a payment to "Mohammad Ali" - the screening system flags this as a potential match to a sanctioned individual. Investigation reveals this is a different person with the same common name.',
          'A company applies to open an account with an address in Crimea. This triggers immediate rejection due to comprehensive territorial sanctions.',
          'A transaction involves a Russian energy company subject to sectoral sanctions. The bank must determine if the specific activity is prohibited under the relevant sectoral restrictions.'
        ],

        regulatoryRequirements: [
          'The Sanctions and Anti-Money Laundering Act 2018',
          'HM Treasury Sanctions Guidance',
          'FCA Financial Crime Guide - Chapter 8 (Sanctions)',
          'EU Regulation 2580/2001 (Counter-terrorism sanctions)'
        ]
      }
    },

    {
      id: 'screening-procedures',
      title: 'Sanctions Screening and Detection',
      type: 'content',
      duration: 4,
      content: {
        learningPoint: 'Implement robust screening procedures to detect sanctioned parties and transactions',
        mainContent: {
          cards: [
            {
              type: 'keypoint',
              icon: '🔍',
              title: 'Screening Fundamentals',
              points: [
                'Combines technology + human expertise',
                'Screen customers, transactions, and trade finance',
                'Real-time screening against consolidated lists',
                'Daily list updates from OFAC, UN, EU, UK'
              ]
            },
            {
              type: 'infogrid',
              title: 'Three Screening Types',
              items: [
                { icon: '👤', label: 'Customer (KYC)', description: 'Onboarding, beneficial owners, directors, monthly rescreening' },
                { icon: '💳', label: 'Transaction', description: 'Real-time: names, addresses, correspondent banks, payment references' },
                { icon: '🚢', label: 'Trade Finance', description: 'Importers/exporters, vessels, commodities, dual-use goods' }
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Block/Freeze', description: 'Immediately stop transaction or account' },
                { number: 2, title: 'Notify MLRO', description: 'Senior management within defined timeframes' },
                { number: 3, title: 'Report', description: 'Regulatory notification within 24-48 hours' },
                { number: 4, title: 'Legal Review', description: 'Determine next steps, manage customer comms' }
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Evasion Red Flags',
              message: 'Watch for: name spelling variations, shell companies, nominee directors, transaction structuring, multiple payment routes, ship-to-ship transfers, transshipment through non-sanctioned countries.'
            }
          ]
        },

        keyConcepts: [
          {
            term: 'Fuzzy Logic Matching',
            definition: 'Algorithm that identifies potential matches even when names are not spelled identically, accounting for variations and errors'
          },
          {
            term: 'Whitelisting',
            definition: 'Process of marking confirmed false positives to prevent repeated alerts for the same customer or transaction'
          },
          {
            term: 'Correspondent Banking',
            definition: 'Banking services provided by one bank to another, creating sanctions risk if the correspondent bank serves sanctioned parties'
          },
          {
            term: 'Ship-to-Ship Transfer',
            definition: 'Method of transferring cargo between vessels at sea, often used to obscure the origin or destination of sanctioned goods'
          }
        ],

        realExamples: [
          'A payment shows beneficiary as "Mohamed Al-Assad" with address in Lebanon. Screening identifies potential match to sanctioned Syrian official "Mohammed Al-Assad" requiring investigation.',
          'A company registers with name "Global Trading LLC" in Dubai with same beneficial owner as previously sanctioned "International Trading LLC" - indicating possible evasion attempt.',
          'Multiple small payments from different originator accounts to the same beneficiary in Iran, structured to avoid detection thresholds.'
        ],

        regulatoryRequirements: [
          'HM Treasury Sanctions List Management',
          'FCA SYSC 6.3 - Financial Crime Systems and Controls',
          'Payment Services Regulations 2017 - Sanctions screening requirements',
          'JMLSG Guidance - Sanctions screening procedures'
        ]
      }
    },

    {
      id: 'compliance-procedures',
      title: 'Sanctions Compliance and Escalation',
      type: 'content',
      duration: 4,
      content: {
        learningPoint: 'Execute proper compliance procedures and escalation protocols for sanctions matters',
        mainContent: {
          cards: [
            {
              type: 'keypoint',
              icon: '⚡',
              title: 'Swift Action Required',
              points: [
                'Narrow window for regulatory reporting',
                'Mistakes have severe consequences',
                'Clear escalation procedures essential',
                'Document everything immediately'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Within 1 Hour', description: 'Block transaction, notify MLRO, escalate to senior management' },
                { number: 2, title: 'Within 4 Hours', description: 'Enhanced investigation, review related accounts, preliminary report' },
                { number: 3, title: 'Within 24 Hours', description: 'File HM Treasury & FCA notifications, complete documentation' }
              ]
            },
            {
              type: 'infogrid',
              title: 'Escalation Levels',
              items: [
                { icon: '1️⃣', label: 'Front-line Staff', description: 'Identify risk, escalate immediately, document observations' },
                { icon: '2️⃣', label: 'Sanctions Specialist', description: 'Investigate alerts, make blocking decisions, coordinate legal' },
                { icon: '3️⃣', label: 'Senior/MLRO', description: 'Final authority, regulatory reporting, board reporting' }
              ]
            },
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Tipping Off is CRIMINAL',
              message: 'NEVER mention sanctions investigation to customer. Use only generic messages: "We are completing standard regulatory checks. This is routine."'
            },
            {
              type: 'checklist',
              title: 'Record Retention',
              items: [
                'Sanctions records: 5+ years after relationship ends',
                'Regulatory correspondence: Indefinitely',
                'Investigation files: Until matters closed',
                'Training records: 3+ years'
              ]
            }
          ]
        },

        keyConcepts: [
          {
            term: 'Tipping Off',
            definition: 'Unlawfully warning a person that they are subject to sanctions investigation or reporting'
          },
          {
            term: 'PRIN 11',
            definition: 'FCA Principle requiring firms to deal with regulators in an open and cooperative manner'
          },
          {
            term: 'Blocking Action',
            definition: 'Immediate freezing of funds or suspension of services upon identification of sanctions violation'
          },
          {
            term: 'Enhanced Due Diligence',
            definition: 'Additional investigation and monitoring procedures applied to high-risk sanctions cases'
          }
        ],

        realExamples: [
          'A payment alert for potential Iran sanctions match requires immediate blocking, MLRO notification, and HM Treasury reporting within 24 hours while maintaining careful customer communication.',
          'During investigation, a customer asks why their payment is delayed. Staff respond with generic processing message without mentioning sanctions investigation.',
          'A quarterly sanctions testing exercise identifies 3 false negatives in the screening system, triggering immediate system recalibration and enhanced monitoring.'
        ],

        regulatoryRequirements: [
          'The Sanctions and Anti-Money Laundering Act 2018 - Reporting obligations',
          'HM Treasury Sanctions Guidance - Notification procedures',
          'FCA PRIN 11 - Relations with regulators',
          'Data Protection Act 2018 - Record keeping and data sharing'
        ]
      }
    },
    {
      id: 'sanctions-evasion-typologies',
      title: 'Evasion Typologies and Red Flags',
      type: 'content',
      duration: 4,
      content: {
        learningPoint: 'Recognize common evasion techniques and apply targeted controls',
        mainContent: {
          cards: [
            {
              type: 'keypoint',
              icon: '🎭',
              title: 'Evasion Tactics',
              points: [
                'Hide identity, origin, or destination',
                'Pattern-based detection is key',
                'Combine screening with ownership analysis',
                'Check transaction context + trade docs'
              ]
            },
            {
              type: 'checklist',
              title: 'Common Evasion Methods',
              items: [
                'Shell companies & layered ownership',
                'Proxy directors or nominee shareholders',
                'Trade-based laundering & falsified invoices',
                'Routing through low-scrutiny jurisdictions',
                'Use of intermediaries & correspondent banks'
              ]
            }
          ]
        },
        keyConcepts: [
          {
            term: 'Evasion Typology',
            definition: 'A known pattern used to bypass sanctions controls'
          },
          {
            term: 'Trade Based Evasion',
            definition: 'Manipulating invoices, goods, or routing to hide sanctioned activity'
          }
        ],
        realExamples: [
          'Multiple related entities share directors but rotate names to avoid list matches.',
          'Shipping documents show inconsistent ports of origin versus payment routes.'
        ],
        regulatoryRequirements: [
          'FCA Financial Crime Guide - Chapter 8 (Evasion typologies)',
          'HM Treasury Sanctions Guidance - risk indicators'
        ]
      }
    },
    {
      id: 'sanctions-governance',
      title: 'Governance, MI, and Accountability',
      type: 'content',
      duration: 4,
      content: {
        learningPoint: 'Embed sanctions oversight through clear roles, MI, and accountability',
        mainContent: {
          cards: [
            {
              type: 'keypoint',
              icon: '🏛️',
              title: 'Governance = Not Just Screening',
              points: [
                'Named accountability (SMF ownership)',
                'MLRO oversight and clear escalation',
                'MI on alerts, matches, and reporting',
                'Regular testing + independent assurance'
              ]
            },
            {
              type: 'alert',
              alertType: 'info',
              title: 'Strong MI Matters',
              message: 'Management Information highlights control weaknesses early and supports board oversight. Monthly dashboards should show false positive rates, resolution times, and reporting volumes.'
            }
          ]
        },
        keyConcepts: [
          {
            term: 'Accountable Owner',
            definition: 'Senior role responsible for sanctions framework effectiveness'
          },
          {
            term: 'MI Pack',
            definition: 'Regular reporting on alerts, matches, and control effectiveness'
          }
        ],
        realExamples: [
          'Monthly sanctions dashboard includes false positive rates, time to resolve, and reporting volume.',
          'Board receives quarterly updates on sanctions incidents and remediation plans.'
        ],
        regulatoryRequirements: [
          'FCA SYSC 6.1.1 - Systems and controls',
          'SMCR - accountability for compliance frameworks'
        ]
      }
    }
  ],

  // Practice Scenarios
  practiceScenarios: [
    {
      id: 'screening-alert-scenario',
      title: 'The Friday Afternoon Alert',
      image: '/images/training/sanctions-alert-scenario.png',
      imagePrompt: 'Photorealistic corporate photograph, compliance officer in late 20s staring at computer screen showing red alert notification, clock on wall showing 4:30 PM, Friday visible on calendar. Urgent atmosphere, modern financial services office, dramatic lighting on screen. Corporate thriller aesthetic, 16:9 aspect ratio, no text.',
      situation: `**The Alert:** Payment flagged - 4:30 PM Friday

**Payment:** $75,000 to "Al-Noor Trading Company" (Dubai)

**Screening Hit:**
• 89% match to OFAC SDN list entity
• Designated for: Iran sanctions evasion
• Address partially matches sanctioned entity
• Beneficial owner name matches designated person

**Context:**
• Customer with you 2 years
• Phone going to voicemail`,
      challenge: 'What do you do?',
      options: [
        'Release - 89% isn\'t 100%',
        'BLOCK immediately + notify senior management + investigate',
        'Call customer for clarification first',
        'Hold until Monday for proper investigation'
      ],
      correctAnswer: 1,
      explanation: '89% match + address match + sanctions evasion designation = BLOCK NOW. Friday afternoon is no excuse. No customer contact before proper procedures (tipping off risk).',
      learningPoints: [
        'High-confidence matches = immediate block regardless of timing',
        'Sanctions evasion designation = highest risk',
        'No customer contact to avoid tipping off'
      ]
    },

    {
      id: 'evasion-detection-scenario',
      title: 'The Shifting Business',
      image: '/images/training/sanctions-evasion-scenario.png',
      imagePrompt: 'Photorealistic corporate photograph, financial investigator in early 40s reviewing multiple transaction documents spread across desk, pointing at suspicious pattern on papers. World map on wall with Dubai highlighted. Detective/investigation atmosphere in modern compliance office. Serious analytical mood, 16:9 aspect ratio, no text.',
      situation: `**Customer:** Global Industries Ltd (18-month relationship)

**Profile Changes:**
• Business changed from "UK manufacturing" → "international trade facilitation"
• Ownership changed 3 times in 6 months
• Now 75% owned by Jersey-registered holding company

**New Transaction Patterns:**
• Was: £10-50K monthly to EU
• Now: Regular $200K+ to Dubai companies
• Recipients: All recently incorporated, similar addresses
• All marked "consultancy fees" - just under EDD thresholds`,
      challenge: 'What are your concerns?',
      options: [
        'No concerns - UK customer is legitimate',
        'Minor concerns - could be business expansion',
        'SIGNIFICANT evasion concerns - immediate investigation required',
        'Close account immediately without investigation'
      ],
      correctAnswer: 2,
      explanation: 'Classic evasion pattern: business model pivot, ownership shell game, payments to newly-formed entities in same jurisdiction, structuring below thresholds. Requires immediate EDD + SAR consideration.',
      learningPoints: [
        'Business model + ownership changes = evasion setup flags',
        'Multiple new entities in same jurisdiction = shell company network',
        'Structuring below thresholds = awareness of controls'
      ]
    }
  ],

  // Assessment Questions
  assessmentQuestions: [
    {
      id: 'sanctions-q1',
      type: 'multiple_choice',
      question: 'Which of the following actions must be taken immediately upon confirming a sanctions match?',
      options: [
        'Contact the customer to verify if they are the sanctioned party',
        'Block the transaction and notify senior management',
        'Complete a full investigation before taking any action',
        'Seek legal advice before proceeding'
      ],
      correctAnswer: 1,
      explanation: 'Upon confirming a sanctions match, the transaction must be blocked immediately and senior management notified. Customer contact should be carefully managed to avoid tipping off, and legal advice can be sought concurrently with blocking action.'
    },
    {
      id: 'sanctions-q2',
      type: 'true_false',
      question: 'It is acceptable to inform a customer that their payment is delayed due to sanctions screening.',
      options: ['True', 'False'],
      correctAnswer: 1,
      explanation: 'False. Informing a customer about sanctions screening could constitute "tipping off" which is prohibited. Use generic processing delay messages instead.'
    },
    {
      id: 'sanctions-q3',
      type: 'scenario_based',
      question: 'A screening alert shows 85% name match to a sanctioned individual. What should you do?',
      options: [
        'Release the transaction as it\'s not 100% match',
        'Investigate further to determine if it\'s a true match',
        'Automatically block all transactions from this customer',
        'Lower the screening threshold to reduce false positives'
      ],
      correctAnswer: 1,
      explanation: 'High-confidence matches (typically 80%+ depending on system calibration) require immediate investigation to determine if it\'s a true match. Don\'t rely solely on percentage - consider context, additional data points, and quality of information.'
    },
    {
      id: 'sanctions-q4',
      type: 'multiple_choice',
      question: 'How often should existing customers be rescreened against sanctions lists?',
      options: [
        'Weekly',
        'Monthly',
        'Quarterly',
        'Annually'
      ],
      correctAnswer: 1,
      explanation: 'Existing customers should be rescreened at least monthly, as sanctions lists are updated frequently. Many firms rescreen more frequently (weekly or daily) for high-risk customers.'
    },
    {
      id: 'sanctions-q5',
      type: 'scenario_based',
      question: 'Which of the following is most likely to indicate sanctions evasion?',
      options: [
        'A customer making regular payments to the same supplier',
        'Multiple small payments to recently-formed companies in the same jurisdiction',
        'A customer requesting information about sanctions compliance',
        'Occasional delays in payment processing'
      ],
      correctAnswer: 1,
      explanation: 'Multiple small payments to recently-formed companies in the same jurisdiction is a classic sanctions evasion pattern, suggesting use of shell companies and transaction structuring to avoid detection.'
    }
  ],

  // Summary and Takeaways
  summary: {
    keyTakeaways: [
      'Sanctions compliance requires immediate action - blocking first, investigating second',
      'Effective screening must cover customers, transactions, and beneficial owners comprehensively',
      'Sanctions evasion techniques are constantly evolving and require vigilant monitoring',
      'Customer communication during sanctions investigations must avoid tipping off violations',
      'Regular testing and calibration of screening systems is essential for effectiveness'
    ],
    nextSteps: [
      'Complete the Politically Exposed Persons (PEPs) Identification training module',
      'Review your firm\'s sanctions screening procedures and escalation protocols',
      'Practice investigating screening alerts using real case studies',
      'Understand your role in the sanctions compliance framework and reporting requirements'
    ],
    quickReference: [
      'Block immediately: Any confirmed sanctions match requires immediate transaction blocking',
      'Report within 24 hours: HM Treasury notification required for sanctions violations',
      'Rescreen monthly: Minimum frequency for existing customer sanctions screening',
      'Avoid tipping off: Use generic messages about processing delays only'
    ]
  },

  // Visual Assets
  visualAssets: {
    images: [
      {
        section: 'hook',
        description: 'Timeline infographic showing Standard Chartered sanctions failures and their consequences'
      },
      {
        section: 'main-content',
        description: 'World map showing different sanctions regimes and their territorial scope'
      },
      {
        section: 'screening',
        description: 'Flowchart showing sanctions screening process from alert to resolution'
      },
      {
        section: 'scenarios',
        description: 'Red flag indicators diagram for sanctions evasion detection'
      }
    ],
    style: 'Professional compliance design with clear process flows and risk indicator visuals'
  }
};
