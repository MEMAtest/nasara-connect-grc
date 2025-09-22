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
        mainContent: `Customer Due Diligence (CDD) is not just about ticking boxes - it's about truly knowing your customer to assess and manage risk. The regulatory framework requires us to implement three interconnected pillars:

**Pillar 1: Customer Identification**
This goes beyond simply collecting a name and address. We must establish:
- Legal identity using reliable, independent source documents
- Residential address through current utility bills or bank statements
- Date and place of birth for natural persons
- Legal status and proof of incorporation for legal entities

The key principle: We must be satisfied that we know who our customer really is.

**Pillar 2: Customer Verification**
Identification tells us who they claim to be; verification proves it's true. This involves:
- Document authentication using appropriate verification methods
- Biometric verification where technology permits
- Electronic verification through trusted databases
- Face-to-face verification for high-risk customers

Critical requirement: We must verify identity using documents, data, or information obtained from a reliable and independent source.

**Pillar 3: Understanding the Purpose and Nature of the Business Relationship**
This is where many firms fall short. We must understand:
- Why the customer needs our services
- What they intend to use the account/services for
- Expected transaction patterns and volumes
- Source of funds and wealth
- Business model and revenue streams for corporate customers

This understanding forms the baseline for ongoing monitoring and suspicious activity detection.`,

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
        mainContent: `The risk-based approach is not about avoiding risk - it's about understanding, assessing, and managing it proportionately. Every customer presents a unique risk profile that must be evaluated across multiple dimensions.

**Geographic Risk Assessment**
Not all jurisdictions are equal. We must consider:
- FATF high-risk and non-cooperative jurisdictions
- Countries under international sanctions
- Jurisdictions with weak AML/CFT controls
- Tax havens and secrecy jurisdictions
- Countries experiencing political instability or high levels of corruption

**Customer Type Risk Assessment**
Different customer types present different inherent risks:

*High Risk:* Cash-intensive businesses, money service businesses, PEPs, shell companies, trusts, customers from high-risk jurisdictions

*Medium Risk:* Standard corporate customers, regulated professionals, established businesses with transparent ownership

*Low Risk:* Regulated financial institutions, government entities, listed companies, long-standing personal customers with straightforward profiles

**Product and Service Risk Assessment**
The nature of products and services affects risk:
- Private banking and wealth management (higher risk)
- International wire transfers (higher risk)
- Basic current accounts (lower risk)
- Pension and investment products (variable risk)

**Delivery Channel Risk Assessment**
How we deliver services impacts risk:
- Non-face-to-face onboarding (higher risk)
- Digital-only customer journeys (higher risk)
- Branch-based relationships (lower risk)
- Introducer arrangements (variable risk)

**Dynamic Risk Scoring**
Risk is not static. Our assessment must consider:
- Changes in customer behavior or circumstances
- Regulatory updates and new typologies
- Intelligence from law enforcement
- Internal suspicious activity reports
- External adverse media`,

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
        mainContent: `Customer Due Diligence is not a one-time event - it's an ongoing process that continues throughout the entire customer relationship. Effective ongoing monitoring is where most money laundering attempts are detected and prevented.

**Transaction Monitoring Systems**
Automated systems must be calibrated to detect:
- Unusual transaction patterns compared to expected activity
- Rapid movement of funds (potential layering)
- Transactions involving high-risk jurisdictions
- Structuring patterns (breaking large amounts into smaller transactions)
- Round-number transactions or unusual timing
- Activity inconsistent with the customer's profile

**Periodic Review Requirements**
The frequency of reviews depends on risk rating:
- High Risk: At least annually, often more frequently
- Medium Risk: Every 2-3 years or when triggered by events
- Low Risk: Every 3-5 years or when circumstances change

Reviews must assess:
- Whether customer information remains current and accurate
- If the risk rating remains appropriate
- Whether the pattern of activity matches expectations
- Any adverse media or regulatory actions
- Changes in beneficial ownership or control

**Trigger Events for Enhanced Monitoring**
Certain events should automatically trigger additional scrutiny:
- Significant changes in transaction patterns
- Customer requests for higher transaction limits
- Changes in beneficial ownership above threshold
- Adverse media coverage or regulatory action
- Customer becomes a PEP or is linked to a PEP
- Introduction of new products or services
- Requests to change account details or documentation

**Red Flags in Ongoing Monitoring**
Common suspicious patterns include:
- Large cash deposits followed by immediate wire transfers
- Multiple accounts with similar names or addresses
- Transactions that occur in round numbers or just below reporting thresholds
- Frequent deposits and withdrawals with no clear business purpose
- Activity that suddenly increases without explanation
- Customers who are reluctant to provide information for reviews

**Documentation and Record Keeping**
All monitoring activities must be documented:
- Risk assessments and ratings
- Review decisions and rationale
- Suspicious activity identified
- Management decisions on account continuation
- Enhanced measures applied
- Training records for staff involved`,

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