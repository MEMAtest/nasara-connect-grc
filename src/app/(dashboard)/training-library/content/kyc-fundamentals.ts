import { TrainingModule } from '../types';

export const kycFundamentalsModule: TrainingModule = {
  id: 'kyc-fundamentals',
  title: 'Know Your Customer (KYC) & Customer Due Diligence',
  description: 'Master the fundamentals of customer identification, verification, and ongoing due diligence to prevent financial crime.',
  category: 'financial-crime-prevention',
  duration: 15,
  difficulty: 'intermediate',
  targetPersonas: ['compliance-officer', 'customer-service', 'relationship-manager'],
  prerequisiteModules: ['aml-fundamentals'],
  tags: ['kyc', 'cdd', 'edd', 'compliance', 'identity-verification'],
  learningOutcomes: [
    'Understand the three pillars of Customer Due Diligence (CDD)',
    'Apply risk-based approach to customer identification and verification',
    'Recognize when Enhanced Due Diligence (EDD) is required',
    'Implement effective ongoing monitoring procedures',
    'Identify and handle beneficial ownership requirements'
  ],

  // Hook Section
  hook: {
    type: 'real_case_study',
    title: 'The £2.3 Billion Identity Fraud Crisis',
    content: `In 2023, identity fraud cost UK financial institutions £2.3 billion, with synthetic identity fraud emerging as the fastest-growing financial crime. Criminals are becoming increasingly sophisticated, using AI-generated identities and deepfake technology to bypass traditional verification methods.

    Consider this: A customer walks into your branch with perfect documentation - passport, utility bills, bank statements. Everything checks out. Six months later, you discover the entire identity was fabricated using stolen personal data and AI-generated photos. The account was used to launder £500,000 in proceeds from cybercrime.

    This isn't science fiction - it's happening right now. The first line of defense? Your KYC and Customer Due Diligence procedures. Every question you ask, every document you verify, every red flag you spot could be the difference between stopping a criminal or enabling financial crime.`,
    keyQuestion: 'How confident are you that you could spot a sophisticated synthetic identity fraud attempt using current KYC procedures?'
  },

  // Main Content Sections
  lessons: [
    {
      id: 'kyc-pillars',
      title: 'The Three Pillars of Customer Due Diligence',
      type: 'content',
      duration: 4,
      content: {
        learningPoint: 'Master the fundamental components of effective Customer Due Diligence',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'info',
              title: 'CDD is About Knowing Your Customer',
              message: 'Customer Due Diligence is not about ticking boxes - it\'s about truly knowing your customer to assess and manage risk. Three interconnected pillars form the regulatory framework.'
            },
            {
              type: 'keypoint',
              icon: '🆔',
              title: 'Pillar 1: Customer Identification',
              points: [
                'Legal identity using reliable, independent source documents',
                'Residential address through utility bills or bank statements',
                'Date and place of birth for natural persons',
                'Legal status and proof of incorporation for legal entities'
              ]
            },
            {
              type: 'keypoint',
              icon: '✅',
              title: 'Pillar 2: Customer Verification',
              points: [
                'Document authentication using appropriate methods',
                'Biometric verification where technology permits',
                'Electronic verification through trusted databases',
                'Face-to-face verification for high-risk customers'
              ]
            },
            {
              type: 'keypoint',
              icon: '🎯',
              title: 'Pillar 3: Understanding Purpose & Nature',
              points: [
                'Why the customer needs your services',
                'Expected transaction patterns and volumes',
                'Source of funds and wealth',
                'Business model and revenue streams for corporates'
              ]
            },
            {
              type: 'alert',
              alertType: 'critical',
              title: 'CDD Must Complete Before Onboarding',
              message: 'CDD should be completed before a relationship is established. If CDD cannot be completed, the relationship must not proceed and activity should be reviewed for suspicion.'
            },
            {
              type: 'infogrid',
              title: 'Verification Methods',
              items: [
                { icon: '📄', label: 'Documentary', description: 'Passport, ID, driving license' },
                { icon: '💻', label: 'Electronic', description: 'Trusted data sources' },
                { icon: '👤', label: 'Biometric', description: 'Liveness and face match' }
              ]
            }
          ]
        },

        keyConcepts: [
          {
            term: 'Reliable and Independent Source',
            definition: 'Documents or data from sources that are not easily forged and are independent of the customer (e.g., government-issued ID, utility companies)'
          },
          {
            term: 'Simplified Due Diligence (SDD)',
            definition: 'Reduced CDD measures for low-risk customers, such as regulated financial institutions or listed companies'
          },
          {
            term: 'Enhanced Due Diligence (EDD)',
            definition: 'Additional CDD measures required for high-risk customers, including PEPs, high-risk jurisdictions, or complex ownership structures'
          },
          {
            term: 'Beneficial Ownership',
            definition: 'The natural person who ultimately owns or controls the customer or on whose behalf a transaction is conducted'
          }
        ],

        realExamples: [
          'A UK limited company applies for business banking. Standard CDD requires company registration documents, but EDD reveals the beneficial owner is a PEP from a high-risk jurisdiction, triggering additional controls.',
          'An individual provides a driving license for identification, but ongoing monitoring reveals transaction patterns inconsistent with their declared employment, prompting a review of the business relationship.',
          'A customer claims to be a freelance consultant but receives regular large payments from a jurisdiction under sanctions, highlighting the importance of understanding business purpose.'
        ],

        regulatoryRequirements: [
          'Money Laundering Regulations 2017 - Regulation 28 (Customer Due Diligence)',
          'JMLSG Guidance Part I - Customer Due Diligence and Ongoing Monitoring',
          'FCA Financial Crime Guide - Chapter 4 (Customer Due Diligence)'
        ]
      }
    },

    {
      id: 'risk-assessment',
      title: 'Risk-Based Approach to Customer Assessment',
      type: 'content',
      duration: 4,
      content: {
        learningPoint: 'Apply systematic risk assessment to determine appropriate CDD measures',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'info',
              title: 'Risk-Based Approach Defined',
              message: 'The risk-based approach is not about avoiding risk - it\'s about understanding, assessing, and managing it proportionately. Every customer presents a unique risk profile evaluated across multiple dimensions.'
            },
            {
              type: 'keypoint',
              icon: '🌍',
              title: 'Geographic Risk Assessment',
              points: [
                'FATF high-risk and non-cooperative jurisdictions',
                'Countries under international sanctions',
                'Jurisdictions with weak AML/CFT controls',
                'Tax havens and secrecy jurisdictions',
                'Countries with political instability or high corruption'
              ]
            },
            {
              type: 'infogrid',
              title: 'Customer Type Risk Levels',
              items: [
                { icon: '🔴', label: 'High Risk', description: 'Cash businesses, MSBs, PEPs, shell companies' },
                { icon: '🟡', label: 'Medium Risk', description: 'Standard corporates, regulated professionals' },
                { icon: '🟢', label: 'Low Risk', description: 'Regulated FIs, government, listed companies' }
              ]
            },
            {
              type: 'keypoint',
              icon: '📦',
              title: 'Product & Service Risk',
              points: [
                'Private banking and wealth management (higher risk)',
                'International wire transfers (higher risk)',
                'Basic current accounts (lower risk)',
                'Pension and investment products (variable risk)'
              ]
            },
            {
              type: 'keypoint',
              icon: '📱',
              title: 'Delivery Channel Risk',
              points: [
                'Non-face-to-face onboarding (higher risk)',
                'Digital-only customer journeys (higher risk)',
                'Branch-based relationships (lower risk)',
                'Introducer arrangements (variable risk)'
              ]
            },
            {
              type: 'checklist',
              title: 'Dynamic Risk Scoring Factors',
              items: [
                'Changes in customer behavior or circumstances',
                'Regulatory updates and new typologies',
                'Intelligence from law enforcement',
                'Internal suspicious activity reports',
                'External adverse media'
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Trigger Events for Re-Scoring',
              message: 'Re-score when: ownership changes or new UBOs identified, sudden changes in transaction behavior, or new adverse media/sanctions exposure detected.'
            }
          ]
        },

        keyConcepts: [
          {
            term: 'Risk Appetite',
            definition: 'The amount and type of risk a firm is willing to take in order to meet its strategic objectives'
          },
          {
            term: 'Risk Tolerance',
            definition: 'The boundaries of risk taking outside of which the firm is not prepared to venture'
          },
          {
            term: 'Customer Risk Rating',
            definition: 'A systematic scoring system that categorizes customers based on their assessed ML/TF risk'
          },
          {
            term: 'Risk Mitigation',
            definition: 'Measures taken to reduce identified risks to an acceptable level'
          }
        ],

        realExamples: [
          'A tech startup from Estonia applies for banking. While Estonia is EU-regulated, the digital nature of the business and cross-border payments require enhanced monitoring.',
          'A long-standing UK customer suddenly begins receiving large payments from cryptocurrency exchanges, triggering a risk rating review.',
          'A family office structure involves multiple jurisdictions including a trust in Jersey, requiring EDD despite the customer being UK-resident.'
        ],

        regulatoryRequirements: [
          'Money Laundering Regulations 2017 - Regulation 18 (Risk Assessment)',
          'FCA SYSC 6.3 - Financial Crime Systems and Controls',
          'JMLSG Guidance Part II - The Risk-Based Approach'
        ]
      }
    },

    {
      id: 'ongoing-monitoring',
      title: 'Ongoing Monitoring and Relationship Management',
      type: 'content',
      duration: 4,
      content: {
        learningPoint: 'Implement effective ongoing monitoring to detect suspicious activity and maintain current customer information',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'info',
              title: 'CDD is Continuous',
              message: 'Customer Due Diligence is not a one-time event - it\'s an ongoing process that continues throughout the entire customer relationship. Effective ongoing monitoring is where most money laundering attempts are detected.'
            },
            {
              type: 'keypoint',
              icon: '📊',
              title: 'Transaction Monitoring Systems',
              points: [
                'Unusual transaction patterns vs expected activity',
                'Rapid movement of funds (potential layering)',
                'Transactions involving high-risk jurisdictions',
                'Structuring patterns (breaking large into smaller amounts)',
                'Round-number transactions or unusual timing',
                'Activity inconsistent with customer profile'
              ]
            },
            {
              type: 'infogrid',
              title: 'Periodic Review Frequency',
              items: [
                { icon: '🔴', label: 'High Risk', description: 'At least annually, often more' },
                { icon: '🟡', label: 'Medium Risk', description: 'Every 2-3 years or triggered' },
                { icon: '🟢', label: 'Low Risk', description: 'Every 3-5 years or changed' }
              ]
            },
            {
              type: 'checklist',
              title: 'Periodic Review Must Assess',
              items: [
                'Customer information remains current and accurate',
                'Risk rating remains appropriate',
                'Pattern of activity matches expectations',
                'Any adverse media or regulatory actions',
                'Changes in beneficial ownership or control'
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Trigger Events for Enhanced Monitoring',
              message: 'Triggers include: significant transaction pattern changes, requests for higher limits, BO changes above threshold, adverse media, customer becomes/linked to PEP, new products requested, account detail changes.'
            },
            {
              type: 'keypoint',
              icon: '🚩',
              title: 'Red Flags in Ongoing Monitoring',
              points: [
                'Large cash deposits followed by immediate wire transfers',
                'Multiple accounts with similar names/addresses',
                'Transactions in round numbers or just below thresholds',
                'Frequent deposits/withdrawals with no clear purpose',
                'Sudden unexplained increase in activity',
                'Customer reluctance to provide information for reviews'
              ]
            },
            {
              type: 'checklist',
              title: 'Documentation Requirements',
              items: [
                'Risk assessments and ratings recorded',
                'Review decisions and rationale documented',
                'Suspicious activity identified and logged',
                'Management decisions on account continuation',
                'Enhanced measures applied noted',
                'Training records for staff maintained'
              ]
            }
          ]
        },

        keyConcepts: [
          {
            term: 'Transaction Monitoring',
            definition: 'Automated and manual processes to identify unusual or suspicious patterns in customer activity'
          },
          {
            term: 'Periodic Review',
            definition: 'Regular reassessment of customers to ensure information remains current and risk ratings remain appropriate'
          },
          {
            term: 'Event-Driven Review',
            definition: 'Additional scrutiny triggered by specific changes or activities that may affect risk'
          },
          {
            term: 'False Positive',
            definition: 'Alerts generated by monitoring systems that, upon investigation, prove to be legitimate activity'
          }
        ],

        realExamples: [
          'A small business customer who typically processes £10K monthly suddenly has £100K pass through their account. Investigation reveals a large one-off contract, but the activity is documented and monitored.',
          'A personal customer starts receiving regular international transfers from a country they\'ve never visited. Enhanced monitoring reveals a legitimate inheritance, properly documented.',
          'Transaction monitoring flags a customer for structuring deposits just under £10K. Investigation confirms suspicious activity and leads to a SAR filing.'
        ],

        regulatoryRequirements: [
          'Money Laundering Regulations 2017 - Regulation 28(11) (Ongoing Monitoring)',
          'JMLSG Guidance Part I Section 5 - Ongoing Monitoring',
          'FCA Financial Crime Guide - Chapter 6 (Transaction Monitoring)'
        ]
      }
    },
    {
      id: 'beneficial-ownership-kyb',
      title: 'Beneficial Ownership and KYB',
      type: 'content',
      duration: 4,
      content: {
        learningPoint: 'Apply robust KYB checks and verify beneficial ownership for corporate customers',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'info',
              title: 'KYB Core Purpose',
              message: 'KYB is about understanding who ultimately owns and controls a business customer. The default threshold is 25% ownership or control, but lower thresholds may apply based on risk.'
            },
            {
              type: 'keypoint',
              icon: '🔍',
              title: 'Ownership and Control Tests',
              points: [
                'Ownership: identify any individual with 25%+ shares or voting rights',
                'Control: identify those who appoint/remove directors or exercise dominant influence',
                'Consider layered ownership across multiple entities',
                'Look beyond immediate shareholder to ultimate owners'
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'When No UBO Is Identified',
              message: 'Identify the senior managing official and document the steps taken to establish ownership and why no UBO could be confirmed.'
            },
            {
              type: 'checklist',
              title: 'Evidence to Collect',
              items: [
                'Company registry extract and shareholder register',
                'Corporate structure chart with ownership percentages',
                'Director and controller identification documents'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Verify Company', description: 'Confirm company registration and directors via registry' },
                { number: 2, title: 'Identify UBOs', description: 'Map ownership to identify all 25%+ beneficial owners' },
                { number: 3, title: 'Verify UBOs', description: 'Verify identity of each beneficial owner' },
                { number: 4, title: 'Understand Business', description: 'Document business model, expected activity, source of funds' },
                { number: 5, title: 'Assess Risk', description: 'Review ownership layers and offshore entities for risk' }
              ]
            },
            {
              type: 'infogrid',
              title: 'High Risk Triggers',
              items: [
                { icon: '🏛️', label: 'Trust Structures', description: 'Nominee shareholders obscuring ownership' },
                { icon: '🌐', label: 'Multi-Jurisdiction', description: 'Complex cross-border ownership chains' },
                { icon: '🔄', label: 'Rapid Changes', description: 'Frequently changing directors/shareholders' }
              ]
            }
          ]
        },
        keyConcepts: [
          {
            term: 'UBO',
            definition: 'Ultimate beneficial owner, usually 25 percent ownership or control threshold'
          },
          {
            term: 'KYB',
            definition: 'Know Your Business checks covering ownership, control, and business purpose'
          },
          {
            term: 'Control Test',
            definition: 'Assessment of who can exercise significant influence over the entity'
          }
        ],
        realExamples: [
          'A corporate customer owned by a trust requires verification of trustees and beneficiaries.',
          'A holding company in a high risk jurisdiction triggers enhanced due diligence and deeper ownership mapping.'
        ],
        regulatoryRequirements: [
          'Money Laundering Regulations 2017 - Regulation 28 (Beneficial Ownership)',
          'JMLSG Guidance Part I Section 4 - Corporate customers'
        ]
      }
    },
    {
      id: 'record-keeping-qa',
      title: 'Record Keeping, QA, and Audit Readiness',
      type: 'content',
      duration: 4,
      content: {
        learningPoint: 'Evidence every decision with clear documentation and QA checks',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'info',
              title: 'Evidence Standards',
              message: 'KYC evidence must be clear, retrievable, and timely. Regulators expect you to demonstrate compliance at any point during an examination.'
            },
            {
              type: 'checklist',
              title: 'What Regulators Expect to See',
              items: [
                'What documents were obtained and verified',
                'How risk was assessed and why the rating was set',
                'When reviews were completed and by whom',
                'Why any exceptions or overrides were approved'
              ]
            },
            {
              type: 'keypoint',
              icon: '✅',
              title: 'Quality Assurance Essentials',
              points: [
                'Sample checks ensure files meet standards',
                'Expose gaps early before regulatory examination',
                'Document and track remediation for weak evidence',
                'Use QA findings to improve templates and training'
              ]
            },
            {
              type: 'infogrid',
              title: 'Record Management',
              items: [
                { icon: '📁', label: 'Retention', description: 'At least 5 years post-relationship' },
                { icon: '🔒', label: 'Access Control', description: 'Track who views/changes files' },
                { icon: '🔍', label: 'Audit Trail', description: 'Log all document activity' }
              ]
            },
            {
              type: 'keypoint',
              icon: '📋',
              title: 'QA Program Best Practice',
              points: [
                'Use risk-based sampling - higher-risk files get more scrutiny',
                'Track error rates and identify root causes',
                'Retrain staff or update templates based on findings',
                'Document QA results and remediation actions'
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Audit Readiness',
              message: 'Maintain files so any regulator inquiry can be answered quickly with structured, searchable documentation and clear risk rationale.'
            }
          ]
        },
        keyConcepts: [
          {
            term: 'Record Retention',
            definition: 'Maintain KYC records for required periods and ensure audit access'
          },
          {
            term: 'QA Review',
            definition: 'Independent review of KYC files to confirm quality and completeness'
          }
        ],
        realExamples: [
          'A QA review finds missing source of funds evidence and triggers remediation.',
          'An audit request is fulfilled quickly because documents and risk rationale are structured and searchable.'
        ],
        regulatoryRequirements: [
          'Money Laundering Regulations 2017 - Regulation 40 (Record Keeping)',
          'FCA expectations for audit ready evidence'
        ]
      }
    }
  ],

  // Practice Scenarios
  practiceScenarios: [
    {
      id: 'corporate-kyc-scenario',
      title: 'Complex Corporate Structure Assessment',
      context: 'A new corporate customer applies for business banking services',
      situation: `TechFlow Solutions Ltd, a UK incorporated software development company, applies for business banking. The company was incorporated 6 months ago with £100 share capital. The sole director is Maria Santos, a Portuguese national living in London.

The company's beneficial ownership structure shows:
- 45% owned by InnovateCapital Ltd (incorporated in Jersey)
- 35% owned by Santos Family Trust (administered in Gibraltar)
- 20% owned by Maria Santos personally

Maria explains the company will receive payments from clients in the US, EU, and Asia, with expected monthly turnover of £50,000-100,000. She's evasive about the source of the initial funding and cannot provide detailed business projections.`,
      challenge: 'What level of due diligence is required and what additional information should you obtain?',
      options: [
        'Apply Standard Due Diligence - the company is UK incorporated and appears legitimate',
        'Apply Enhanced Due Diligence due to complex ownership structure and offshore entities',
        'Decline the application as the structure is too complex',
        'Accept with Standard Due Diligence but implement enhanced transaction monitoring'
      ],
      correctAnswer: 1,
      explanation: 'Enhanced Due Diligence is required due to: (1) Complex beneficial ownership involving offshore jurisdictions, (2) Recently incorporated company with low capital, (3) High expected turnover relative to capital, (4) Customer evasiveness about funding sources. Additional information needed includes trust documentation, source of funds verification, and detailed business plans.',
      learningPoints: [
        'Complex ownership structures always trigger EDD requirements',
        'Offshore entities require additional scrutiny even within acceptable jurisdictions',
        'Customer behavior during onboarding is a key risk indicator'
      ]
    },

    {
      id: 'ongoing-monitoring-scenario',
      title: 'Suspicious Transaction Pattern Detection',
      context: 'You are reviewing alerts from the transaction monitoring system',
      situation: `James Mitchell has been a personal banking customer for 3 years. His account typically shows:
- Monthly salary credit of £3,200 from his employer (a local accounting firm)
- Regular monthly expenses: mortgage, utilities, groceries (total ~£2,800)
- Occasional small cash withdrawals

Over the past 6 weeks, the monitoring system has flagged:
- 8 cash deposits totaling £47,000, each just under £6,000
- Deposits made at different branch locations
- Within 48 hours of each deposit, wire transfers of similar amounts to "MKT Trading Solutions" in Dubai
- Account balance consistently returns to normal levels
- Customer has not responded to branch requests for updated employment information`,
      challenge: 'What action should you take based on this monitoring alert?',
      options: [
        'Close the alert as false positive - the amounts are relatively small',
        'Contact the customer directly to ask about the deposits and transfers',
        'File an internal suspicious activity report immediately',
        'Wait for more activity to establish a clearer pattern'
      ],
      correctAnswer: 2,
      explanation: 'This pattern shows classic signs of money laundering: (1) Structuring deposits below reporting thresholds, (2) Rapid movement of funds overseas, (3) Use of multiple locations, (4) Activity inconsistent with known customer profile, (5) Customer avoidance of contact. An internal SAR should be filed immediately, and any contact with the customer must be carefully managed to avoid tipping off.',
      learningPoints: [
        'Structuring patterns are a strong indicator of money laundering',
        'Immediate overseas transfers after cash deposits require investigation',
        'Never confront customers directly about suspected money laundering'
      ]
    },
    {
      id: 'pep-source-of-wealth-scenario',
      title: 'PEP Onboarding and Source of Wealth',
      context: 'A relationship manager is onboarding a politically exposed person',
      situation: `Dr. Amina Rahman has been appointed as deputy minister in Country Z within the past year. She wants to open a personal account and a holding company account for investment purposes.

She expects monthly inbound transfers of GBP 150,000 from consulting work and dividends. The holding company is registered in the British Virgin Islands and will invest in UK property. She requests expedited onboarding and provides limited detail on the source of her wealth.`,
      challenge: 'What is the correct KYC approach in this case?',
      options: [
        'Apply Standard Due Diligence because the customer is a public official',
        'Apply Enhanced Due Diligence, verify PEP status, confirm source of wealth and funds, and obtain senior management approval',
        'Decline the relationship because PEPs cannot be onboarded',
        'Apply Standard Due Diligence and rely on transaction monitoring for ongoing risk'
      ],
      correctAnswer: 1,
      explanation: 'PEPs require Enhanced Due Diligence. This includes PEP screening, senior management approval, detailed source of wealth and source of funds checks, and enhanced ongoing monitoring. The offshore holding company adds additional complexity and risk.',
      learningPoints: [
        'PEP onboarding requires EDD and senior management sign-off',
        'Source of wealth and source of funds must be verified, not just stated',
        'Offshore structures increase risk and require deeper verification'
      ]
    },
    {
      id: 'digital-onboarding-scenario',
      title: 'Remote Onboarding with Identity Anomalies',
      context: 'A digital onboarding case is flagged by identity controls',
      situation: `A new customer applies online for a current account. The selfie match passes, but the document chip read fails. The address on the application does not match the address on the document, and the IP address is from a high-risk jurisdiction.

The same device fingerprint has been used for two previous failed onboarding attempts. The customer refuses to provide additional verification documents.`,
      challenge: 'What should you do?',
      options: [
        'Proceed with Standard Due Diligence because the selfie matched the document',
        'Pause onboarding, request additional verification, and decline if the evidence is not provided',
        'Approve the account but set low transaction limits',
        'Reject the application without recording the reasons or risk indicators'
      ],
      correctAnswer: 1,
      explanation: 'Multiple identity anomalies require stronger verification. The correct response is to pause onboarding, request additional evidence, and decline if the customer cannot provide it. Decisions should be documented for audit purposes.',
      learningPoints: [
        'Non-face-to-face onboarding increases fraud risk',
        'Multiple weak signals should trigger enhanced verification',
        'Document all decisions and risk indicators for audit'
      ]
    },
    {
      id: 'trigger-review-scenario',
      title: 'Material Change Trigger Review',
      context: 'A periodic review is triggered by a corporate restructure',
      situation: `Brightline Logistics Ltd has been a low-risk customer for 4 years. The firm has been acquired by a new parent company based in a high-risk jurisdiction. The new ownership introduces a complex group structure and plans to triple international payment volumes within 6 months.

The account manager asks if the next scheduled review in 3 years can remain unchanged to avoid disruption.`,
      challenge: 'What is the correct action?',
      options: [
        'Keep the existing risk rating and wait until the next scheduled review',
        'Refresh KYC, update beneficial ownership details, reassess risk, and consider EDD',
        'Close the account immediately to avoid exposure',
        'Only update the director list and keep the same monitoring settings'
      ],
      correctAnswer: 1,
      explanation: 'Material changes in ownership and expected activity require an immediate refresh of KYC. The relationship risk rating should be updated and EDD considered due to the high-risk jurisdiction and higher expected transaction volumes.',
      learningPoints: [
        'Material change events trigger immediate KYC refresh',
        'Risk ratings must be updated when ownership or activity changes',
        'Higher transaction volumes require stronger monitoring controls'
      ]
    }
  ],

  // Assessment Questions
  assessmentQuestions: [
    {
      id: 'kyc-q1',
      type: 'multiple_choice',
      question: 'Which of the following is NOT one of the three pillars of Customer Due Diligence?',
      options: [
        'Customer Identification',
        'Customer Verification',
        'Customer Risk Rating',
        'Understanding Purpose and Nature of Business Relationship'
      ],
      correctAnswer: 2,
      explanation: 'Customer Risk Rating is part of the risk assessment process, but the three pillars of CDD are: (1) Customer Identification, (2) Customer Verification, and (3) Understanding the Purpose and Nature of the Business Relationship.'
    },
    {
      id: 'kyc-q2',
      type: 'scenario_based',
      question: 'A customer provides a photocopy of their passport for identity verification. According to best practice, what should you do?',
      options: [
        'Accept the photocopy as it shows the required information',
        'Request the original document or a certified copy',
        'Ask for additional supporting documentation',
        'Use electronic verification instead'
      ],
      correctAnswer: 1,
      explanation: 'Photocopies are not acceptable for identity verification as they can be easily manipulated. Original documents or certified copies are required to meet the "reliable and independent source" requirement.'
    },
    {
      id: 'kyc-q3',
      type: 'true_false',
      question: 'Enhanced Due Diligence is only required for Politically Exposed Persons (PEPs).',
      options: ['True', 'False'],
      correctAnswer: 1,
      explanation: 'False. EDD is required for various high-risk situations including PEPs, customers from high-risk jurisdictions, complex beneficial ownership structures, unusual business relationships, and other circumstances that present higher ML/TF risk.'
    },
    {
      id: 'kyc-q4',
      type: 'multiple_choice',
      question: 'How often should high-risk customers undergo periodic review?',
      options: [
        'Every 5 years',
        'Every 3 years',
        'At least annually',
        'Only when triggered by specific events'
      ],
      correctAnswer: 2,
      explanation: 'High-risk customers should undergo periodic review at least annually, and often more frequently depending on the specific risk factors present.'
    },
    {
      id: 'kyc-q5',
      type: 'scenario_based',
      question: 'A beneficial owner holds exactly 25% of a company. Are they subject to beneficial ownership disclosure requirements?',
      options: [
        'Yes, they meet the 25% threshold',
        'No, they must exceed 25%',
        'Only if they also have control rights',
        'It depends on the jurisdiction'
      ],
      correctAnswer: 0,
      explanation: 'Yes, the beneficial ownership threshold is 25% or more. A person holding exactly 25% meets this requirement and must be identified and verified.'
    },
    {
      id: 'kyc-q6',
      type: 'multiple_choice',
      question: 'Which of the following is generally acceptable as proof of address?',
      options: [
        'Utility bill issued within the last 3 months',
        'Email from an employer confirming address',
        'Photo of a mailbox with the customer name',
        'Bank statement that is more than 12 months old'
      ],
      correctAnswer: 0,
      explanation: 'A recent utility bill is commonly accepted as proof of address. Other sources must be reliable, independent, and current.'
    },
    {
      id: 'kyc-q7',
      type: 'multiple_choice',
      question: 'Which factor most clearly triggers Enhanced Due Diligence?',
      options: [
        'Customer receives a stable UK salary and has a low-risk product',
        'Complex ownership involving an offshore trust in a high-risk jurisdiction',
        'Small balance account with no cross-border activity',
        'Long-standing customer with consistent activity and no alerts'
      ],
      correctAnswer: 1,
      explanation: 'Complex ownership structures and high-risk jurisdictions are key EDD triggers. The other examples indicate lower risk.'
    },
    {
      id: 'kyc-q8',
      type: 'true_false',
      question: 'It is acceptable to complete KYC without identifying all beneficial owners if ownership is layered through trusts.',
      options: ['True', 'False'],
      correctAnswer: 1,
      explanation: 'False. Firms must identify and verify beneficial owners even when ownership is layered through trusts or other structures.'
    }
  ],

  // Summary and Takeaways
  summary: {
    keyTakeaways: [
      'Effective CDD requires mastery of three pillars: identification, verification, and understanding business purpose',
      'Risk-based approach ensures resources are focused on highest-risk customers and relationships',
      'Ongoing monitoring is where most suspicious activity is detected - it\'s not a one-time process',
      'Complex beneficial ownership structures and offshore entities always require Enhanced Due Diligence',
      'Transaction patterns inconsistent with customer profile are primary red flags for money laundering'
    ],
    nextSteps: [
      'Complete the Politically Exposed Persons (PEPs) Identification training module',
      'Review your firm\'s Customer Due Diligence policy and procedures',
      'Practice using the customer risk assessment framework with real scenarios',
      'Understand your firm\'s transaction monitoring systems and alert investigation procedures'
    ],
    quickReference: [
      'EDD required for: PEPs, high-risk jurisdictions, complex ownership, unusual relationships',
      'Beneficial ownership threshold: 25% or more ownership or control',
      'High-risk customer reviews: At least annually',
      'Key documentation: Identity documents from reliable, independent sources'
    ]
  },

  // Visual Assets
  visualAssets: {
    images: [
      {
        section: 'hook',
        description: 'Infographic showing UK identity fraud statistics and synthetic identity creation process'
      },
      {
        section: 'main-content',
        description: 'Three-pillar CDD framework diagram with interconnected components'
      },
      {
        section: 'risk-assessment',
        description: 'Risk matrix showing customer, geographic, product and delivery channel risk factors'
      },
      {
        section: 'scenarios',
        description: 'Flowchart showing escalation path for suspicious activity detection'
      }
    ],
    style: 'Professional financial services design with clean infographics and risk assessment visuals'
  }
};
