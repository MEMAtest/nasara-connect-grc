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
        mainContent: `Sanctions are restrictive measures imposed by governments and international bodies to achieve foreign policy and national security objectives. Understanding the different types and their applications is crucial for effective compliance.

**Types of Sanctions:**

**1. Comprehensive Sanctions**
These apply to entire countries or territories, prohibiting virtually all economic activity:
- Currently: North Korea, Iran (with limited exceptions), Syria, Crimea region of Ukraine
- These are the most restrictive, covering trade, financial services, and most commercial activities
- Very limited exceptions exist (typically humanitarian goods with specific licenses)

**2. Targeted/Smart Sanctions**
These focus on specific individuals, entities, or sectors rather than entire countries:
- Asset freezes: Preventing access to funds and economic resources
- Travel restrictions: Prohibiting entry or transit through jurisdictions
- Arms embargoes: Restricting weapons and military equipment sales
- Sectoral sanctions: Limiting activities in specific industries (e.g., energy, defense)

**3. Secondary Sanctions**
These can affect non-US entities that engage with sanctioned parties:
- US can impose sanctions on foreign entities for dealings with sanctioned countries
- Creates extraterritorial reach of US sanctions globally
- Particularly relevant for Iran, North Korea, and Russia sanctions

**Key Sanctions Authorities:**

**United Nations (UN)**
- Binding on all UN member states
- Typically consensus-based, making them politically significant
- Examples: North Korea weapons programs, terrorism financing

**United States (OFAC)**
- Office of Foreign Assets Control administers US sanctions
- Broad extraterritorial reach, especially for USD transactions
- Most comprehensive and frequently updated sanctions regime
- Primary lists: SDN (Specially Designated Nationals), SSI (Sectoral Sanctions Identifications)

**European Union (EU)**
- Harmonized across all EU member states
- Often aligned with UN sanctions but can be more restrictive
- Regular updates through EU regulations and decisions

**United Kingdom (HM Treasury)**
- Post-Brexit independent sanctions regime
- UK Sanctions List replaces EU lists for UK entities
- Often mirrors EU and US sanctions but with UK-specific elements

**Legal Basis and Obligations:**
The legal requirement to comply with sanctions is absolute:
- Criminal liability for individuals and corporations
- Strict liability in many jurisdictions (intent not required)
- Penalties can include unlimited fines and imprisonment
- Reputational damage and regulatory action
- Loss of banking licenses and market access`,

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
        mainContent: `Effective sanctions screening is both an art and a science. It requires sophisticated technology combined with human expertise to identify sanctions risks while minimizing business disruption.

**Screening Requirements:**

**1. Customer Screening (KYC Phase)**
Must screen at multiple points:
- Initial onboarding before relationship establishment
- Beneficial owners and related parties (25% threshold)
- Directors, officers, and authorized signatories
- Before approving any account opening or service provision
- Periodic rescreening of existing customers (at least monthly)

**2. Transaction Screening (Real-time)**
Every payment must be screened for:
- Originator and beneficiary names and addresses
- Correspondent banks and intermediary financial institutions
- Payment reference fields and narrative information
- Country codes and routing information
- Related parties mentioned in payment messages

**3. Trade Finance Screening**
Additional screening for:
- Importers, exporters, and consignees
- Vessels, aircraft, and transportation providers
- Commodity types and dual-use goods
- Letters of credit parties and guarantors
- Documentation and certificates

**Screening Technology and Methods:**

**Automated Screening Systems**
- Real-time screening against consolidated sanctions lists
- Fuzzy logic matching to account for spelling variations
- Phonetic matching for different name transliterations
- Address and date of birth matching where available
- Risk scoring based on match strength and context

**List Management**
- Daily updates from official sources (OFAC, UN, EU, UK)
- Version control and audit trails for list changes
- Integration with core banking and payment systems
- Backup procedures for system failures

**Quality Control Measures:**

**False Positive Management**
Most screening alerts are false positives. Effective management includes:
- Clear escalation procedures and timeframes
- Documented investigation standards
- Training for alert review staff
- Regular calibration of screening parameters
- Whitelisting of confirmed false positives

**True Match Procedures**
When a genuine sanctions match is identified:
1. Immediate payment blocking or account freeze
2. Senior management notification within defined timeframes
3. Regulatory reporting within 24-48 hours
4. Legal review and determination of next steps
5. Customer communication (carefully managed to avoid tipping off)

**Sanctions Evasion Techniques to Watch For:**

**Name Variations and Obfuscation**
- Slight spelling changes or transliteration differences
- Use of aliases, also-known-as names, or former names
- Addition of titles, honorifics, or business designations
- Omission of middle names or family name components

**Entity Structure Manipulation**
- Use of shell companies or complex ownership structures
- Frequent changes in company names or registration details
- Nominee directors or beneficial owners
- Use of companies in jurisdictions with opaque ownership rules

**Transaction Structuring**
- Breaking large transactions into smaller amounts
- Using multiple correspondent banks or payment routes
- Employing third-party payment processors
- Utilizing alternative payment methods (hawala, cryptocurrency)
- Timing transactions around sanctions list updates

**Geographic Evasion**
- Use of addresses in non-sanctioned areas
- Employing entities in multiple jurisdictions
- Ship-to-ship transfers for commodity trades
- Transshipment through non-sanctioned countries`,

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
        mainContent: `Sanctions compliance requires swift, decisive action and clear escalation procedures. The window for regulatory reporting is narrow, and mistakes can have severe consequences.

**Immediate Response Procedures:**

**When a Sanctions Match is Confirmed:**

*Within 1 Hour:*
- Immediately block/freeze the transaction or account
- Notify the Money Laundering Reporting Officer (MLRO)
- Escalate to senior management and legal counsel
- Begin documentation of the incident
- Ensure no further processing of related transactions

*Within 4 Hours:*
- Conduct enhanced investigation to confirm the match
- Review all related accounts and recent transaction history
- Identify any connected parties or relationships
- Prepare preliminary incident report
- Consider broader implications for the customer relationship

*Within 24 Hours:*
- File required regulatory notifications:
  - HM Treasury (UK sanctions violations)
  - FCA notification (if required under PRIN 11)
  - Law enforcement if criminal activity suspected
- Complete comprehensive incident documentation
- Implement enhanced monitoring for related accounts

**Regulatory Reporting Requirements:**

**HM Treasury Reporting**
- Immediate notification for confirmed sanctions violations
- Detailed written report within specified timeframes
- Annual compliance reports on sanctions controls
- Ad-hoc reporting for significant control failures

**FCA Notifications**
- Principle 11 requires notification of significant sanctions failures
- Include in annual financial crime returns
- Report as part of regulatory relationship management
- Consider implications for SMCR accountability

**Internal Escalation Framework:**

**Level 1: Front-line Staff**
- Identify potential sanctions risk or alert
- Immediate escalation to sanctions specialist or MLRO
- Do not make independent decisions on sanctions matters
- Document all observations and actions taken

**Level 2: Sanctions Specialist/Compliance**
- Investigate alerts and determine true/false positive status
- Make initial blocking decisions for clear violations
- Escalate uncertain cases to senior management
- Coordinate with legal counsel on complex matters

**Level 3: Senior Management/MLRO**
- Final decision authority on sanctions compliance matters
- Responsibility for regulatory reporting and notifications
- Strategic decisions on customer relationship continuation
- Board and committee reporting on sanctions issues

**Customer Communication Protocols:**

**Permitted Communications:**
- Generic holding messages about routine compliance checks
- Standard processing delay notifications
- General information about regulatory requirements
- References to enhanced verification procedures

**Prohibited Communications:**
- Specific mention of sanctions investigations
- Details about regulatory reporting or law enforcement contact
- Information that could constitute "tipping off"
- Speculation about investigation outcomes

**Example Appropriate Response:**
"We are currently completing our standard regulatory checks for this transaction. This is a routine process that all financial institutions must follow. We will process your transaction as soon as these checks are complete. Thank you for your patience."

**Record Keeping and Documentation:**

**Essential Documentation:**
- Complete audit trail of screening and investigation actions
- Evidence supporting true/false positive determinations
- Copies of all regulatory notifications and responses
- Management decisions and rationale
- Customer communications (if any)
- System logs and technical evidence

**Retention Requirements:**
- Sanctions records: Minimum 5 years after relationship ends
- Regulatory correspondence: Indefinitely
- Investigation files: Until all regulatory matters closed
- Training records: 3 years minimum
- System audit logs: As per regulatory requirements

**Quality Assurance and Testing:**

**Regular Testing Program:**
- Monthly testing of screening systems functionality
- Quarterly review of alert investigation procedures
- Annual assessment of sanctions compliance framework
- Independent review by internal audit
- Management information and metrics reporting

**Key Performance Indicators:**
- Percentage of alerts resolved within timeframes
- False positive rates and trending
- Time to complete investigations
- Regulatory reporting timeliness
- Staff training completion rates
- System availability and performance metrics`,

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
        mainContent: `Sanctions evasion relies on hiding identity, origin, or destination. The most common methods include:

- Use of shell companies and layered ownership
- Proxy directors or nominee shareholders
- Trade based laundering and falsified invoices
- Routing through low scrutiny jurisdictions
- Use of intermediaries and correspondent banks

Effective detection is pattern based. Combine name screening with ownership, transaction context, and trade documentation checks.`,
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
        mainContent: `Sanctions compliance is a governance issue, not just a screening issue. Regulators expect:

- Named accountability (SMF ownership and MLRO oversight)
- Clear escalation paths for high risk cases
- Management information on alerts, true matches, and reporting
- Regular testing and independent assurance

Strong MI highlights control weaknesses early and supports board oversight.`,
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
      title: 'Complex Sanctions Screening Alert',
      context: 'You receive a high-priority alert from the sanctions screening system during payment processing',
      situation: `A payment instruction has been flagged by your sanctions screening system with the following details:

Payment Details:
- Amount: $75,000 USD
- Originator: TechSolutions Europe Ltd, London, UK
- Beneficiary: Al-Noor Trading Company, Dubai, UAE
- Purpose: Payment for consulting services
- Correspondent Bank: Emirates NBD, Dubai

Screening Alert:
- 89% name match to "Al-Noor Trading Establishment" on the OFAC SDN list
- Address shows partial match to sanctioned entity
- Beneficial owner listed as "Ahmed Hassan Al-Rashid"
- The sanctioned entity is designated for Iran sanctions evasion

Additional Information:
- Customer has been with bank for 2 years with regular transaction history
- Previous payments to Middle East but never flagged before
- Customer contact attempted but phone goes to voicemail
- It's currently 4:30 PM on Friday afternoon`,
      challenge: 'What immediate actions should you take to handle this sanctions alert?',
      options: [
        'Release the payment as the 89% match is not 100% certain',
        'Block the payment immediately and begin investigation while notifying senior management',
        'Contact the customer first to get clarification before taking any action',
        'Hold the payment until Monday to conduct a thorough investigation during business hours'
      ],
      correctAnswer: 1,
      explanation: 'An 89% match with additional contextual flags (address match, sanctions evasion designation) requires immediate blocking action. The payment must be stopped immediately, senior management/MLRO notified, and investigation begun without delay. Customer contact should only occur after proper procedures are established to avoid tipping off. Weekend timing does not excuse delays in sanctions compliance.',
      learningPoints: [
        'High-confidence screening matches require immediate blocking regardless of timing',
        'Sanctions evasion-related designations heighten the risk profile significantly',
        'Customer contact must be carefully managed to avoid tipping off violations',
        'Senior management notification is required immediately for potential sanctions violations'
      ]
    },

    {
      id: 'evasion-detection-scenario',
      title: 'Sanctions Evasion Pattern Recognition',
      context: 'You are reviewing customer activity and notice some unusual patterns that may indicate sanctions evasion',
      situation: `Global Industries Ltd has been a corporate customer for 18 months. Recent review of their activity reveals:

Business Profile Changes:
- Originally described business as "UK-based manufacturing"
- Recently updated to "international trade facilitation"
- Beneficial ownership changed 3 times in 6 months
- Now shows 75% ownership by "International Holdings PLC" (Jersey registered)

Transaction Patterns:
- Historical transactions: £10K-50K monthly to EU suppliers
- Last 3 months: Regular $200K+ payments to Dubai-based companies
- Recipients include: "Middle East Trading LLC", "Dubai Commerce House", "Gulf Enterprises Ltd"
- All payments marked as "business consultancy fees"
- Payments consistently just below enhanced due diligence thresholds

Additional Red Flags:
- Customer reluctant to provide updated business documentation
- Dubai recipients have very similar addresses
- Some recipient companies incorporated within weeks of payments
- Customer has requested higher transaction limits multiple times`,
      challenge: 'What sanctions compliance concerns should you have about this customer activity?',
      options: [
        'No concerns - the customer is legitimate and based in the UK',
        'Minor concerns but continue monitoring - the activity could be legitimate business expansion',
        'Significant sanctions evasion concerns requiring immediate enhanced due diligence and investigation',
        'Close the account immediately without investigation to avoid risk'
      ],
      correctAnswer: 2,
      explanation: 'This pattern shows multiple red flags for sanctions evasion: sudden business model change, complex beneficial ownership changes, payments to multiple recently-formed entities in the same jurisdiction, structuring below thresholds, and customer reluctance to provide documentation. This requires immediate enhanced due diligence, investigation of recipients against sanctions lists, and potential suspicious activity reporting.',
      learningPoints: [
        'Rapid changes in business model and ownership can indicate evasion setup',
        'Multiple payments to recently-formed entities in the same jurisdiction is a classic evasion pattern',
        'Structuring payments below reporting thresholds suggests awareness of compliance controls',
        'Customer reluctance to provide documentation when business changes significantly is a major red flag'
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
