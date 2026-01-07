import { TrainingModule } from '../types';

export const sarsTrainingModule: TrainingModule = {
  id: 'sars-training',
  title: 'Suspicious Activity Reporting (SARs)',
  description: 'Master the identification, investigation, and reporting of suspicious activity to protect against money laundering and terrorist financing.',
  category: 'financial-crime-prevention',
  duration: 15,
  difficulty: 'advanced',
  targetPersonas: ['compliance-officer', 'mlro', 'senior-manager'],
  prerequisiteModules: ['aml-fundamentals', 'kyc-fundamentals'],
  tags: ['sars', 'suspicious-activity', 'nca', 'mlro', 'reporting'],
  learningOutcomes: [
    'Recognize indicators of suspicious activity across different scenarios',
    'Understand the legal framework and obligations for suspicious activity reporting',
    'Implement effective investigation procedures before filing SARs',
    'Master the SAR submission process and required information',
    'Apply appropriate confidentiality and tipping-off protections'
  ],

  // Hook Section
  hook: {
    type: 'real_case_study',
    title: 'The £365 Million That Should Have Been Stopped',
    content: `In 2021, NatWest was fined £264 million for failing to properly monitor a single customer account. Between 2012 and 2016, approximately £365 million was deposited into this account, with £264 million of it in cash. Despite the astronomical amounts and obvious red flags, the bank failed to file a single Suspicious Activity Report (SAR).

    The customer was a gold trading business that should have triggered immediate suspicion:
    - Daily cash deposits of £40,000-50,000
    - Total cash deposits 50 times larger than originally anticipated
    - Deposits made at multiple branches across different regions
    - Business model that didn't justify the volume of cash handling
    - Minimal legitimate business documentation

    But here's the shocking reality: this wasn't sophisticated money laundering. It was brazen, obvious criminal activity that basic monitoring should have caught. The failure wasn't technical - it was human. Staff saw the activity, systems generated alerts, but no one connected the dots to file SARs that could have stopped a massive money laundering operation.

    The consequences went far beyond the fine. This money potentially funded serious organized crime, human trafficking, and drug dealing. Communities were harmed. Lives were damaged. All because suspicious activity reports weren't filed when they should have been.

    Every SAR you file could prevent the next NatWest case. Every investigation you conduct properly could save lives.`,
    keyQuestion: 'If you saw £50,000 in cash deposits daily from a small business, would you know exactly what steps to take to investigate and report this suspicious activity?'
  },

  // Main Content Sections
  lessons: [
    {
      id: 'legal-framework',
      title: 'Legal Framework and Obligations',
      type: 'content',
      duration: 4,
      content: {
        learningPoint: 'Understand the comprehensive legal obligations and framework governing suspicious activity reporting',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'critical',
              title: 'This is Criminal Law',
              message: 'SAR reporting is not just regulatory - it\'s backed by criminal law. Failure to report can result in imprisonment.'
            },
            {
              type: 'keypoint',
              icon: '⚖️',
              title: 'POCA Section 330 - Failure to Disclose',
              points: [
                'Criminal offense for failing to report ML suspicions',
                'Applies to ALL regulated sector staff',
                'Max penalty: 5 years imprisonment + unlimited fine',
                'Defense: report made OR reasonable excuse'
              ]
            },
            {
              type: 'keypoint',
              icon: '🚨',
              title: 'POCA Section 333A - Tipping Off',
              points: [
                'Criminal offense to disclose SAR existence',
                'Includes hints, suggestions, or behavior changes',
                'Max penalty: 2 years + unlimited fine',
                'Strict liability - intent NOT required'
              ]
            },
            {
              type: 'stat',
              icon: '⏱️',
              value: '5 Years',
              label: 'Max imprisonment for failure to disclose',
              color: 'red'
            },
            {
              type: 'stat',
              icon: '🔒',
              value: 'Indefinite',
              label: 'SAR confidentiality period - no time limit',
              color: 'amber'
            },
            {
              type: 'infogrid',
              items: [
                { icon: '📖', label: 'Knowledge', description: 'Actual awareness of facts' },
                { icon: '🤔', label: 'Suspicion', description: 'Reasonable belief something may be true' },
                { icon: '⚡', label: 'ASAP', description: 'Within hours, not days' },
                { icon: '🛡️', label: 'Defense', description: 'Report made or genuine excuse' }
              ]
            },
            {
              type: 'checklist',
              title: 'Who Must Report (All Regulated Sector)',
              items: [
                'Front-line customer service staff',
                'Operations & transaction processing',
                'Relationship managers & sales',
                'Management & supervisory staff'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Suspicion Arises', description: 'You notice something unusual or concerning' },
                { number: 2, title: 'Report Internally', description: 'Notify MLRO "as soon as practicable" (within hours)' },
                { number: 3, title: 'MLRO Reviews', description: 'Decision made within 24-48 hours max' },
                { number: 4, title: 'Submit to NCA', description: 'File SAR via secure online system' }
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'NOT a Reasonable Excuse',
              message: 'Commercial considerations, customer relationships, or inconvenience are NEVER acceptable excuses for not reporting.'
            },
            {
              type: 'keypoint',
              icon: '🛡️',
              title: 'Legal Protections for Reporters',
              points: [
                'Civil liability protection for good faith reports',
                'Employment protection against retaliation',
                'Anonymity in legal proceedings',
                'Immunity from breach of confidentiality claims'
              ]
            },
            {
              type: 'stat',
              icon: '📁',
              value: '5 Years',
              label: 'Minimum record retention for SARs',
              color: 'blue'
            }
          ]
        },

        keyConcepts: [
          {
            term: 'Knowledge or Suspicion',
            definition: 'The legal threshold for reporting: actual awareness or reasonable belief that money laundering may be occurring'
          },
          {
            term: 'Tipping Off',
            definition: 'The criminal offense of disclosing SAR existence or ongoing investigation to unauthorized persons'
          },
          {
            term: 'As Soon As Practicable',
            definition: 'Legal timing requirement meaning without unnecessary delay, typically within hours of suspicion arising'
          },
          {
            term: 'Reasonable Excuse',
            definition: 'Limited legal defense for non-reporting, excluding commercial or relationship considerations'
          }
        ],

        realExamples: [
          'A cashier notices daily cash deposits just under reporting thresholds. They have suspicion based on the pattern and must report internally immediately.',
          'An MLRO receives an internal report on Friday evening. They must submit to NCA within 24-48 hours, not wait until Monday.',
          'A customer asks why their payment is delayed. Staff must give generic response without mentioning SAR investigation to avoid tipping off.'
        ],

        regulatoryRequirements: [
          'Proceeds of Crime Act 2002 - Sections 330, 331, 333A',
          'Terrorism Act 2000 - Section 21A',
          'Money Laundering Regulations 2017 - Regulation 21',
          'FCA SYSC 6.3 - Suspicious transaction reporting'
        ]
      }
    },

    {
      id: 'identification-investigation',
      title: 'Identifying Suspicious Activity',
      type: 'content',
      duration: 5,
      content: {
        learningPoint: 'Master systematic approaches to identifying suspicious activity and conducting appropriate investigations',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'info',
              title: 'Dual Skill Required',
              message: 'Identifying suspicious activity requires systematic monitoring AND professional intuition. Investigation must be thorough but swift.'
            },
            {
              type: 'keypoint',
              icon: '💰',
              title: 'Transaction-Based Suspicions',
              points: [
                'Structuring: Multiple transactions just below reporting thresholds',
                'Layering: Rapid movement of funds between accounts',
                'Cash anomalies: Large cash inconsistent with business type',
                'Round numbers without clear business rationale'
              ]
            },
            {
              type: 'keypoint',
              icon: '👤',
              title: 'Customer Behavior Suspicions',
              points: [
                'Reluctance to provide standard ID documentation',
                'Unusual nervousness during routine interactions',
                'Sophisticated knowledge of reporting thresholds',
                'Requests specifically designed to avoid monitoring'
              ]
            },
            {
              type: 'keypoint',
              icon: '🏢',
              title: 'Business & Commercial Suspicions',
              points: [
                'Transaction volumes inconsistent with business size',
                'Activity inconsistent with stated business purpose',
                'Connections to high-risk jurisdictions or sectors',
                'Lack of legitimate documentation or contracts'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Initial Assessment', description: 'Review customer file, analyze transaction patterns, check related accounts' },
                { number: 2, title: 'Risk Analysis', description: 'Assess customer, geographic, product, and channel risks' },
                { number: 3, title: 'Enhanced Investigation', description: 'Verify docs, map fund flows, check external sources' },
                { number: 4, title: 'Senior Review', description: 'Escalate complex cases, apply decision framework' }
              ]
            },
            {
              type: 'infogrid',
              title: 'Red Flags by Sector',
              items: [
                { icon: '🏦', label: 'Retail Banking', description: 'Multiple accounts, threshold avoidance' },
                { icon: '🚢', label: 'Trade Finance', description: 'Over/under-invoicing, multiple invoices' },
                { icon: '💎', label: 'Private Banking', description: 'Opaque wealth, secrecy structures' },
                { icon: '📈', label: 'Investments', description: 'Unusual trading, cash purchases' }
              ]
            },
            {
              type: 'stat',
              icon: '⏱️',
              value: '24-48 Hours',
              label: 'Max investigation timeframe',
              description: 'Initial assessment within 24h, enhanced review within 48h',
              color: 'amber'
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Common Pitfalls to Avoid',
              message: 'Over-investigation (delaying SARs for more evidence) and under-investigation (filing without context) both undermine effectiveness.'
            },
            {
              type: 'checklist',
              title: 'Investigation Documentation',
              items: [
                'Clear timeline of suspicious activity',
                'Supporting evidence and analysis',
                'Customer explanations (if obtained)',
                'Decision rationale and management input'
              ]
            }
          ]
        },

        keyConcepts: [
          {
            term: 'Structuring',
            definition: 'Breaking large transactions into smaller amounts to avoid detection or reporting thresholds'
          },
          {
            term: 'Layering',
            definition: 'Creating complex layers of transactions to obscure the original source of funds'
          },
          {
            term: 'Typology',
            definition: 'A method or technique commonly used for money laundering or terrorist financing'
          },
          {
            term: 'Red Flag',
            definition: 'An indicator or warning sign that suggests potential suspicious activity requiring investigation'
          }
        ],

        realExamples: [
          'A small restaurant makes daily cash deposits of £9,500 for three weeks. Investigation reveals the business typically handles £500 daily, indicating potential structuring.',
          'A customer\'s wire transfer instructions change at the last minute to a different beneficiary in a high-risk jurisdiction, triggering investigation.',
          'Multiple customers with similar names make deposits on the same day to accounts opened with identical documentation, suggesting coordinated activity.'
        ],

        regulatoryRequirements: [
          'JMLSG Guidance Part I Section 7 - Recognition and reporting of suspicious activity',
          'FCA Financial Crime Guide - Chapter 5 (Transaction monitoring)',
          'NCA SAR Guidance Notes - Investigation standards',
          'Money Laundering Regulations 2017 - Regulation 21 (Internal reporting)'
        ]
      }
    },

    {
      id: 'sar-process',
      title: 'SAR Submission & Requirements',
      type: 'content',
      duration: 3,
      content: {
        learningPoint: 'Master the technical and procedural requirements for submitting high-quality SARs to the NCA',
        mainContent: {
          cards: [
            {
              type: 'keypoint',
              icon: '🖥️',
              title: 'NCA Online SAR System',
              points: [
                'Secure web-based portal, 24/7 availability',
                'Two-factor authentication required',
                'Automated validation and error checking',
                'Save/resume capability for complex SARs'
              ]
            },
            {
              type: 'checklist',
              title: 'Mandatory Subject Information',
              items: [
                'Full name including aliases',
                'Date and place of birth',
                'Current and previous addresses',
                'Nationality and ID documents',
                'Occupation and employer details'
              ]
            },
            {
              type: 'checklist',
              title: 'Transaction Details Required',
              items: [
                'Account numbers and types',
                'Transaction dates, amounts, currencies',
                'Counterparty information (sender/receiver)',
                'Geographic locations involved'
              ]
            },
            {
              type: 'keypoint',
              icon: '📝',
              title: 'Narrative Quality Standards',
              points: [
                'Clear, concise, factual reporting',
                'Chronological order with specific details',
                'Professional language, no speculation',
                'Sufficient detail for law enforcement action'
              ]
            },
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Urgent SAR Criteria',
              message: 'Ongoing criminal activity, imminent public safety risk, live terrorist financing, or law enforcement request = phone NCA FIRST then file immediately.'
            },
            {
              type: 'infogrid',
              title: 'Special SAR Categories',
              items: [
                { icon: '💣', label: 'Terrorist Financing', description: 'Lower threshold, enhanced urgency' },
                { icon: '🚫', label: 'Sanctions-Related', description: 'Dual report to HMT and NCA' },
                { icon: '💵', label: 'Large Cash', description: 'Enhanced ID verification' }
              ]
            },
            {
              type: 'stat',
              icon: '📨',
              value: 'Minutes',
              label: 'NCA acknowledgment time',
              description: 'Automatic receipt with unique reference number',
              color: 'emerald'
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Submit SAR', description: 'Complete online form with all required information' },
                { number: 2, title: 'Receive Reference', description: 'NCA provides unique SAR reference number' },
                { number: 3, title: 'Maintain Confidentiality', description: 'Never disclose SAR existence to anyone' },
                { number: 4, title: 'Monitor & Respond', description: 'Watch for NCA requests, report developments' }
              ]
            },
            {
              type: 'infogrid',
              title: 'Record Retention',
              items: [
                { icon: '📁', label: 'SAR Records', description: '5 years from submission' },
                { icon: '🔍', label: 'Investigation Files', description: '5 years from closure' },
                { icon: '👤', label: 'Customer Files', description: '5 years post-relationship' }
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Quality Issues to Avoid',
              message: 'Vague descriptions, missing dates/amounts, speculation about motives, incomplete subject ID, late submission without justification.'
            }
          ]
        },

        keyConcepts: [
          {
            term: 'SAR Reference Number',
            definition: 'Unique identifier assigned by NCA to each submitted SAR for tracking and investigation purposes'
          },
          {
            term: 'Priority SAR',
            definition: 'Urgent suspicious activity report requiring immediate law enforcement attention due to ongoing risk'
          },
          {
            term: 'SAR Quality',
            definition: 'The completeness, accuracy, and usefulness of information provided to support law enforcement investigation'
          },
          {
            term: 'Post-Submission Obligations',
            definition: 'Ongoing duties after SAR filing including confidentiality, cooperation, and continued monitoring'
          }
        ],

        realExamples: [
          'A SAR submitted for structuring activity includes specific transaction dates, amounts, branch locations, and customer explanations to provide complete picture.',
          'An urgent SAR for suspected terrorist financing includes immediate phone notification to NCA followed by comprehensive written submission within hours.',
          'A quarterly SAR quality review identifies common gaps in subject identification information, leading to enhanced training program.'
        ],

        regulatoryRequirements: [
          'Proceeds of Crime Act 2002 - SAR submission requirements',
          'NCA SAR Guidance Notes - Submission procedures and standards',
          'Money Laundering Regulations 2017 - Regulation 21 (Internal reporting procedures)',
          'FCA SYSC 6.3 - Record keeping and management information'
        ]
      }
    },

    {
      id: 'sar-quality-consent',
      title: 'MLRO Decisioning & Consent',
      type: 'content',
      duration: 4,
      content: {
        learningPoint: 'High-quality SARs and clear MLRO decisioning are essential for lawful action and defensible outcomes.',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'info',
              title: 'Quality = Actionability',
              message: 'A SAR is only useful if it gives law enforcement enough to act. Clear MLRO decisions protect both the firm and enable effective investigation.'
            },
            {
              type: 'checklist',
              title: 'High-Quality SAR Components',
              items: [
                'Clear subject details: name, DOB, addresses, accounts',
                'Factual narrative: what, when, amounts, counterparties',
                'Why suspicious: inconsistencies, red flags, behavior changes',
                'Supporting evidence: docs, alerts, conversations, logs',
                'No speculation: facts and risk rationale only'
              ]
            },
            {
              type: 'keypoint',
              icon: '📋',
              title: 'MLRO Decision Log Must Record',
              points: [
                'Suspicion threshold and basis',
                'Information reviewed and any gaps',
                'Whether additional info was requested',
                'Final decision and rationale',
                'Post-decision controls (monitoring, restrictions, exit)'
              ]
            },
            {
              type: 'keypoint',
              icon: '🔐',
              title: 'Defence Against Money Laundering (DAML)',
              points: [
                'Used when firm needs to proceed with transaction involving suspected criminal property',
                'MLRO files SAR and requests NCA consent',
                'NCA has statutory response period',
                'If refused: moratorium period applies - cannot proceed'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Identify Suspicion', description: 'Transaction may involve criminal property' },
                { number: 2, title: 'File SAR + DAML Request', description: 'Request consent from NCA to proceed' },
                { number: 3, title: 'Await Response', description: 'NCA has statutory period to respond' },
                { number: 4, title: 'Act on Decision', description: 'Proceed if consented, halt if refused' }
              ]
            },
            {
              type: 'stat',
              icon: '⚖️',
              value: '7 Days',
              label: 'NCA notice period',
              description: 'Then 31 days moratorium if consent refused',
              color: 'amber'
            },
            {
              type: 'checklist',
              title: 'Quality Assurance Practices',
              items: [
                'Regular sampling of SARs for clarity',
                'Feedback loops to improve submissions',
                'Training on fact-based narratives',
                'Peer review before submission'
              ]
            }
          ]
        },
        keyConcepts: [
          {
            term: 'Defence Against Money Laundering (DAML)',
            definition: 'A legal defence obtained by seeking NCA consent to proceed with a transaction involving suspected criminal property.'
          },
          {
            term: 'Moratorium Period',
            definition: 'A legal period after a consent refusal during which transactions must not proceed.'
          },
          {
            term: 'SAR Narrative',
            definition: 'The factual summary that explains what happened and why it is suspicious.'
          },
          {
            term: 'MLRO Decision Log',
            definition: 'Documented record of decisions, evidence, and actions taken.'
          }
        ],
        realExamples: [
          'A SAR that included timestamps, account numbers, and inconsistent explanations was graded high quality and resulted in law enforcement follow-up.',
          'An MLRO requested DAML for a pending outbound transfer and documented the consent timeline and final decision.',
          'Quality review found SARs lacked subject identifiers, prompting updated guidance and re-training.'
        ],
        regulatoryRequirements: [
          'POCA 2002 - Consent and moratorium provisions',
          'NCA SARs Guidance - Quality expectations and DAML process',
          'FCA SYSC 6.3 - Record keeping and governance expectations'
        ]
      }
    },

    {
      id: 'confidentiality-management',
      title: 'Confidentiality & Tipping-Off',
      type: 'content',
      duration: 3,
      content: {
        learningPoint: 'Implement robust confidentiality procedures and prevent tipping-off violations while maintaining business relationships',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Tipping-Off = Criminal Offense',
              message: 'Any disclosure that alerts someone to SAR existence or investigation can result in criminal prosecution and compromise investigations.'
            },
            {
              type: 'keypoint',
              icon: '🔒',
              title: 'Absolute Confidentiality Rules',
              points: [
                'SAR existence must NEVER be disclosed',
                'Confidentiality applies indefinitely - no time limit',
                'Covers investigation, submission, and police contact',
                'Includes even hints or speculation',
                'Applies to ALL staff regardless of seniority'
              ]
            },
            {
              type: 'checklist',
              title: 'Who May Know About SARs',
              items: [
                'MLRO and designated deputies',
                'Staff directly involved in investigation',
                'Senior management on need-to-know basis',
                'Legal counsel providing SAR advice',
                'External auditors (general procedures only)'
              ]
            },
            {
              type: 'infogrid',
              title: 'What Constitutes Tipping-Off',
              items: [
                { icon: '🗣️', label: 'Direct', description: 'Telling customer SAR filed' },
                { icon: '🔄', label: 'Behavioral', description: 'Service quality changes' },
                { icon: '❓', label: 'Questioning', description: 'Unusual transaction queries' },
                { icon: '😰', label: 'Subtle', description: 'Creating suspicion atmosphere' }
              ]
            },
            {
              type: 'keypoint',
              icon: '💬',
              title: 'Safe Holding Responses',
              points: [
                '"We are completing routine compliance checks"',
                '"This requires standard verification procedures"',
                '"We need to complete internal authorization"',
                '"Temporary delay due to system requirements"'
              ]
            },
            {
              type: 'checklist',
              title: 'Communication Principles',
              items: [
                'Always provide business justification for delays',
                'Reference routine compliance procedures',
                'Never mention specific investigations',
                'Maintain normal tone and professional demeanor',
                'Document all customer communications'
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Maintain Normal Service',
              message: 'Process legitimate transactions normally. Avoid creating barriers, unusual delays, or behavioral changes that might suggest investigation.'
            },
            {
              type: 'keypoint',
              icon: '🔐',
              title: 'Security Measures Required',
              points: [
                'Secure systems for SAR documentation',
                'Access controls and audit trails',
                'Encrypted communications',
                'Secure storage and disposal',
                'Limited access to investigation areas'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'If Incident Occurs', description: 'Immediate assessment of disclosure risk' },
                { number: 2, title: 'Escalate', description: 'Notify senior management and legal counsel' },
                { number: 3, title: 'Document', description: 'Record incident and response measures' },
                { number: 4, title: 'Prevent Recurrence', description: 'Review procedures, retrain staff' }
              ]
            },
            {
              type: 'stat',
              icon: '⚖️',
              value: '2 Years',
              label: 'Max imprisonment for tipping-off',
              description: 'Plus unlimited fine - strict liability offense',
              color: 'red'
            }
          ]
        },

        keyConcepts: [
          {
            term: 'Tipping-Off',
            definition: 'Any disclosure that alerts someone to the existence of a SAR or investigation, whether direct or indirect'
          },
          {
            term: 'Need-to-Know Basis',
            definition: 'Principle limiting SAR information access to only those who require it for their specific duties'
          },
          {
            term: 'Safe Communication',
            definition: 'Customer communication techniques that explain delays or procedures without suggesting investigation'
          },
          {
            term: 'Confidentiality Breach',
            definition: 'Any unauthorized disclosure of SAR information, regardless of intent or level of detail shared'
          }
        ],

        realExamples: [
          'When a customer asks about payment delay, staff respond: "We\'re completing routine verification procedures" rather than mentioning compliance concerns.',
          'A relationship manager continues normal monthly check-ins with a customer subject to SAR investigation to avoid behavioral changes.',
          'SAR team uses secure meeting room and encrypted communications when discussing active investigations to maintain confidentiality.'
        ],

        regulatoryRequirements: [
          'Proceeds of Crime Act 2002 - Section 333A (Tipping off)',
          'Terrorism Act 2000 - Section 21D (Disclosure offenses)',
          'Money Laundering Regulations 2017 - Regulation 21 (Confidentiality)',
          'FCA SYSC 6.3 - Staff training and awareness requirements'
        ]
      }
    }
  ],

  // Practice Scenarios
  practiceScenarios: [
    {
      id: 'cash-structuring-scenario',
      title: 'Cash Structuring Network',
      image: '/images/training/sar-structuring-scenario.png',
      imagePrompt: 'Professional compliance illustration, bird\'s eye view of a city map with 15 glowing account dots connected by red dotted lines to a central hub labeled "Metro Trading". Cash bundles flowing between dots. Clean corporate infographic style, navy blue and red, modern flat design, no text.',
      situation: `**The Alert:** 15 linked accounts flagged for suspicious patterns.

**Key Red Flags:**
• Daily cash deposits £8,000-£9,500 (just under threshold)
• £1.2M total in 3 months across all accounts
• All transfers route to "Metro Trading Ltd" → Dubai entities
• Account holders all claim to work for unregistered "FlexWork Solutions"
• Same director controls both Metro Trading and FlexWork`,
      challenge: 'What action should you take?',
      options: [
        'Request more documentation before deciding',
        'File individual SARs for each account',
        'File ONE comprehensive SAR covering the entire network + escalate immediately',
        'Continue monitoring for more evidence'
      ],
      correctAnswer: 2,
      explanation: 'This is organized money laundering. File ONE comprehensive SAR covering the entire operation - it gives law enforcement the complete picture. Individual SARs would fragment the intelligence.',
      learningPoints: [
        'Coordinated accounts = organized crime - report the whole network together',
        'Don\'t wait for "perfect evidence" - suspicion is enough',
        'Comprehensive SARs are more valuable than fragmented reports'
      ]
    },

    {
      id: 'customer-questioning-scenario',
      title: 'The Angry Customer Call',
      image: '/images/training/sar-tipping-off-scenario.png',
      imagePrompt: 'Professional compliance illustration, split scene: Left side shows frustrated business person on phone call in modern office. Right side shows calm compliance officer at desk with computer alerts. Subtle wall/divide between them representing confidentiality. Clean corporate style, warm professional colors, modern flat design, no text.',
      situation: `**The Situation:** You're investigating Prestige Consulting Ltd. A SAR is being filed today.

**The Call:** David Morrison (MD) is frustrated:
*"Three payments delayed this week. My clients are asking questions. I've banked here 8 years! Is there an investigation going on?"*

**What you know:**
• Payments are to high-risk jurisdiction companies
• MLRO filing SAR today
• Tipping-off = criminal offense`,
      challenge: 'How do you respond?',
      options: [
        'Say compliance requirements have increased, ask for documentation',
        'Give generic response about "routine verification procedures"',
        'Be transparent to maintain the relationship',
        'Transfer to compliance department'
      ],
      correctAnswer: 1,
      explanation: 'Use ONLY generic language: "routine verification procedures." Never mention compliance concerns, investigations, or SAR. Transparency here = criminal tipping-off offense.',
      learningPoints: [
        '"Routine verification" is a safe phrase - use it',
        'Never confirm OR deny an investigation exists',
        'Maintain normal service to avoid behavioral red flags'
      ]
    }
  ],

  // Assessment Questions
  assessmentQuestions: [
    {
      id: 'sars-q1',
      type: 'multiple_choice',
      question: 'What is the maximum penalty for failing to report suspected money laundering under POCA Section 330?',
      options: [
        '2 years imprisonment and/or unlimited fine',
        '5 years imprisonment and/or unlimited fine',
        '7 years imprisonment and/or £50,000 fine',
        '10 years imprisonment and/or unlimited fine'
      ],
      correctAnswer: 1,
      explanation: 'Under POCA Section 330 (Failure to Disclose), the maximum penalty is 5 years imprisonment and/or unlimited fine. This applies to all staff in the regulated sector who fail to report knowledge or suspicion of money laundering.'
    },
    {
      id: 'sars-q2',
      type: 'scenario_based',
      question: 'A customer asks why their payment is delayed. You know a SAR has been filed. What should you say?',
      options: [
        'We are investigating potential money laundering concerns',
        'We are completing routine compliance verification procedures',
        'I cannot discuss the reasons for the delay',
        'You need to speak to our compliance department'
      ],
      correctAnswer: 1,
      explanation: 'Use generic language about routine procedures without mentioning compliance concerns, investigations, or money laundering. This maintains customer relationship while avoiding tipping-off violations.'
    },
    {
      id: 'sars-q3',
      type: 'true_false',
      question: 'You must have proof of money laundering before filing a SAR.',
      options: ['True', 'False'],
      correctAnswer: 1,
      explanation: 'False. The legal threshold is "knowledge or suspicion" - you do not need proof. SARs should be filed based on reasonable suspicion, and investigation for proof is law enforcement\'s role.'
    },
    {
      id: 'sars-q4',
      type: 'multiple_choice',
      question: 'How long after becoming suspicious should an internal SAR report be made?',
      options: [
        'Within 24 hours',
        'Within 48 hours',
        'As soon as practicable',
        'Within one week'
      ],
      correctAnswer: 2,
      explanation: 'The legal requirement is "as soon as practicable" which generally means within hours of suspicion arising, not days. Commercial considerations cannot justify delays in reporting.'
    },
    {
      id: 'sars-q5',
      type: 'scenario_based',
      question: 'Multiple daily cash deposits of £9,500 from a small business customer would most likely indicate:',
      options: [
        'Legitimate business growth',
        'Structuring to avoid reporting thresholds',
        'Tax evasion rather than money laundering',
        'Poor cash management practices'
      ],
      correctAnswer: 1,
      explanation: 'Regular deposits just below reporting thresholds (£10,000 for cash) indicate "structuring" or "smurfing" - a classic money laundering technique to avoid detection and reporting requirements.'
    }
  ],

  // Summary and Takeaways
  summary: {
    keyTakeaways: [
      'Legal obligation to report suspicion (not proof) carries serious criminal penalties for non-compliance',
      'Investigation must be swift but thorough - cannot delay SAR filing for perfect evidence',
      'Tipping-off is a criminal offense requiring absolute confidentiality about SAR existence',
      'Quality SARs with comprehensive information provide actionable intelligence for law enforcement',
      'Customer communication during investigations requires careful scripting to avoid disclosure'
    ],
    nextSteps: [
      'Complete the Senior Managers & Certification Regime (SM&CR) training module',
      'Review your firm\'s SAR procedures and escalation protocols',
      'Practice investigation techniques using real case studies and typologies',
      'Understand confidentiality requirements and safe customer communication strategies'
    ],
    quickReference: [
      'Report immediately: "As soon as practicable" means within hours, not days',
      'Suspicion threshold: Knowledge or reasonable suspicion, not proof required',
      'Absolute confidentiality: Never disclose SAR existence to unauthorized persons',
      'Quality matters: Comprehensive, factual SARs provide better law enforcement intelligence'
    ]
  },

  // Visual Assets
  visualAssets: {
    images: [
      {
        section: 'hook',
        description: 'Infographic showing NatWest case timeline and missed opportunities for SAR filing'
      },
      {
        section: 'main-content',
        description: 'Flowchart showing complete SAR process from identification to submission and follow-up'
      },
      {
        section: 'investigation',
        description: 'Red flag indicators matrix showing transaction, customer, and business warning signs'
      },
      {
        section: 'scenarios',
        description: 'Decision tree for customer communication during SAR investigations'
      }
    ],
    style: 'Professional compliance design with clear process flows and investigation guidance visuals'
  }
};
