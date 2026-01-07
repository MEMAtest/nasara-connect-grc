import { TrainingModule } from '../types';

export const financialCrimeAmlModule: TrainingModule = {
  id: 'financial-crime-aml',
  title: 'Financial Crime & Anti-Money Laundering – Core Responsibilities for UK Regulated Firms',
  description: 'Master the UK financial crime framework including POCA, MLR 2017, FCA requirements, risk-based approach to AML/CTF, CDD/EDD requirements, red flags identification, and governance expectations.',
  category: 'financial-crime-prevention',
  duration: 65,
  difficulty: 'intermediate',
  targetPersonas: ['mlro', 'compliance-officer', 'senior-manager', 'operations-staff', 'relationship-manager', 'customer-service'],
  prerequisiteModules: [],
  tags: ['aml', 'financial-crime', 'poca', 'mlr-2017', 'cdd', 'edd', 'sars', 'money-laundering', 'fca', 'jmlsg'],
  learningOutcomes: [
    'Describe the UK\'s core financial crime framework: FCA rules (SYSC, FCG), Money Laundering Regulations 2017, POCA 2002 and JMLSG guidance',
    'Explain the main money laundering offences under POCA ss. 327-329 and consequences of non-compliance',
    'Apply a risk-based approach to financial crime including business-wide and customer risk assessments',
    'Distinguish between standard CDD, simplified due diligence (SDD) and enhanced due diligence (EDD)',
    'Recognise key red flags of money laundering and sanctions risk and know when to escalate to the MLRO',
    'Outline governance expectations: roles of Board, MLRO and senior management for financial crime controls'
  ],

  // Hook Section
  hook: {
    type: 'real_case_study',
    title: 'The Pressure to Onboard',
    content: `A new corporate customer wants to move large sums through your firm quickly. They are structured through multiple offshore companies, insist on "quick onboarding", and resist questions about source of funds. Internal pressure builds to "get the business on" to meet revenue targets.

At the same time:
• The FCA expects firms to establish and maintain effective systems and controls to counter the risk that they might be used to further financial crime, under SYSC 3.2.6R and SYSC 6.1.1R.
• The Money Laundering Regulations 2017 (MLR 2017) require risk-based CDD, ongoing monitoring, internal controls and record-keeping.
• POCA 2002 makes it a criminal offence to deal with criminal property, knowing or suspecting it is such, with maximum sentences of up to 14 years' imprisonment.

The consequences of getting this wrong are severe – for the firm, and for the individuals involved. Criminal prosecution, regulatory enforcement, reputational damage, and personal liability for senior managers are all on the table.`,
    keyQuestion: 'If that customer was presented to you today, what 3 questions would you ask first – and at what point would you say "no"?'
  },

  // Main Content Sections
  lessons: [
    {
      id: 'uk-financial-crime-framework',
      title: 'UK Financial Crime Framework – What Firms Must Comply With',
      type: 'content',
      duration: 18,
      content: {
        learningPoint: 'Understand the core legal and regulatory pillars of UK financial crime prevention',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Criminal Liability Under POCA',
              message: '"Knows or suspects" is a LOW threshold. Maximum penalty: 14 years imprisonment. This applies to YOU personally.'
            },
            {
              type: 'keypoint',
              icon: '⚖️',
              title: 'POCA Money Laundering Offences',
              points: [
                'S.327: Concealing, disguising, converting, transferring criminal property',
                'S.328: Arrangements facilitating acquisition/use of criminal property',
                'S.329: Acquiring, using, possessing criminal property',
                'Plus: Failure to report and tipping-off offences'
              ]
            },
            {
              type: 'keypoint',
              icon: '📋',
              title: 'MLR 2017 Requirements',
              points: [
                'Business-wide risk assessment - documented',
                'Customer Due Diligence (CDD) - identify, verify, understand',
                'Ongoing monitoring - transactions and info updates',
                'Record-keeping - CDD and transaction records'
              ]
            },
            {
              type: 'infogrid',
              title: 'UK Regulatory Framework',
              items: [
                { icon: '⚖️', label: 'POCA 2002', description: 'Criminal offences' },
                { icon: '📋', label: 'MLR 2017', description: 'Systems & controls' },
                { icon: '📘', label: 'FCA SYSC/FCG', description: 'Rules & guidance' },
                { icon: '📖', label: 'JMLSG', description: 'Industry guidance' }
              ]
            },
            {
              type: 'keypoint',
              icon: '📘',
              title: 'FCA Handbook Requirements',
              points: [
                'SYSC 3.2.6R: Effective systems to counter financial crime',
                'SYSC 6.1.1R: Adequate policies and procedures',
                'FCG: What "good" looks like for controls',
                'Covers: governance, risk assessment, CDD, monitoring, training'
              ]
            },
            {
              type: 'checklist',
              title: 'MLR 2017 Due Diligence Tiers',
              items: [
                'Simplified DD (Reg 37): Low-risk relationships',
                'Standard CDD: All business relationships',
                'Enhanced DD (Reg 33): High-risk situations'
              ]
            },
            {
              type: 'stat',
              icon: '⚠️',
              value: '14 Years',
              label: 'Max imprisonment for POCA offences',
              description: '"Knows or suspects" = low threshold',
              color: 'red'
            }
          ]
        },

        keyConcepts: [
          {
            term: 'Criminal Property',
            definition: 'Property constituting or representing a person\'s benefit from criminal conduct, where the alleged offender knows or suspects it constitutes such a benefit'
          },
          {
            term: 'Money Laundering Regulations 2017',
            definition: 'UK regulations implementing EU AML directives, setting detailed requirements for CDD, risk assessment, controls and record-keeping'
          },
          {
            term: 'SYSC 6.1.1R',
            definition: 'FCA rule requiring firms to establish adequate policies and procedures to counter the risk of being used for financial crime'
          },
          {
            term: 'JMLSG',
            definition: 'Joint Money Laundering Steering Group – industry body providing authoritative guidance on applying AML/CTF requirements'
          }
        ],

        realExamples: [
          'A bank employee helps a customer move funds through multiple accounts to obscure their origin. This could constitute a s.327 offence (concealing) and s.328 offence (arrangements).',
          'A firm fails to conduct adequate CDD on a new corporate customer who turns out to be a shell company used for fraud. The firm faces regulatory action under MLR 2017 and potential POCA liability.',
          'An MLRO fails to report suspicious activity to the NCA despite clear red flags. This is a failure to report offence under POCA with potential criminal sanctions.'
        ],

        regulatoryRequirements: [
          'Proceeds of Crime Act 2002, Part 7 (ss. 327-340)',
          'Money Laundering, Terrorist Financing and Transfer of Funds Regulations 2017',
          'FCA Handbook SYSC 3.2.6R and SYSC 6.1.1R',
          'FCA Financial Crime Guide (FCG)',
          'JMLSG Guidance Parts I, II and III'
        ]
      }
    },

    {
      id: 'risk-based-approach-cdd',
      title: 'Risk-Based Approach, CDD, SDD & EDD',
      type: 'content',
      duration: 20,
      content: {
        learningPoint: 'Apply risk-based controls and understand when different levels of due diligence are required',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'info',
              title: 'Risk-Based Approach Principle',
              message: 'Apply resources and controls PROPORTIONATELY to the level of risk. More risk = more scrutiny.'
            },
            {
              type: 'infogrid',
              title: 'Business-Wide Risk Factors',
              items: [
                { icon: '👤', label: 'Customer Risk', description: 'PEPs, complexity, jurisdiction' },
                { icon: '📦', label: 'Product Risk', description: 'Cross-border, private banking' },
                { icon: '🔗', label: 'Channel Risk', description: 'Non-face-to-face, digital' },
                { icon: '🌍', label: 'Geographic Risk', description: 'FATF high-risk, sanctions' }
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Identify Customer', description: 'Name, DOB, address, ID info' },
                { number: 2, title: 'Verify Identity', description: 'Documents from reliable source' },
                { number: 3, title: 'Identify Beneficial Owners', description: '>25% ownership or control' },
                { number: 4, title: 'Understand Relationship', description: 'Purpose and intended nature' }
              ]
            },
            {
              type: 'keypoint',
              icon: '📊',
              title: 'Customer Risk Rating Factors',
              points: [
                'Jurisdiction of customer and beneficial owners',
                'Type of customer and business activity',
                'Products and services used',
                'Source of funds and wealth',
                'Any adverse information or red flags'
              ]
            },
            {
              type: 'keypoint',
              icon: '✅',
              title: 'Simplified DD (Reg 37)',
              points: [
                'Only where LOW ML/TF risk determined',
                'NOT "no CDD" - basic checks still required',
                'UK-regulated institutions, listed companies',
                'Low-value products with built-in limits'
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Mandatory EDD Triggers',
              message: 'PEPs + family/associates, high-risk third countries, complex/large unexplained transactions, correspondent banking.'
            },
            {
              type: 'checklist',
              title: 'EDD Measures Required',
              items: [
                'Source of Funds: Where does transaction money come from?',
                'Source of Wealth: How did customer build overall wealth?',
                'Senior management approval',
                'Enhanced ongoing monitoring',
                'First payment from verified account'
              ]
            },
            {
              type: 'stat',
              icon: '⚖️',
              value: '25%',
              label: 'Beneficial ownership threshold',
              description: 'Identify anyone owning/controlling >25%',
              color: 'blue'
            }
          ]
        },

        keyConcepts: [
          {
            term: 'Risk-Based Approach',
            definition: 'Applying AML/CTF controls proportionately to the level of money laundering and terrorist financing risk presented'
          },
          {
            term: 'Customer Due Diligence (CDD)',
            definition: 'The process of identifying customers, verifying identity, identifying beneficial owners, and understanding the business relationship'
          },
          {
            term: 'Simplified Due Diligence (SDD)',
            definition: 'Reduced CDD measures permitted for genuinely low-risk relationships under Regulation 37 MLR 2017'
          },
          {
            term: 'Enhanced Due Diligence (EDD)',
            definition: 'Additional CDD measures required for higher-risk situations including PEPs, high-risk countries, and complex transactions'
          },
          {
            term: 'Source of Funds',
            definition: 'The immediate origin of the funds used in a transaction or business relationship'
          },
          {
            term: 'Source of Wealth',
            definition: 'How the customer accumulated their overall wealth and assets'
          }
        ],

        realExamples: [
          'A PEP from a developing country wants to open a private banking account. EDD is mandatory – the firm must obtain source of wealth documentation and senior management approval.',
          'A long-established UK pension fund opens an account. SDD may be appropriate given low inherent risk, but basic CDD is still required.',
          'A customer\'s transaction patterns suddenly change with large international transfers. This triggers a review and potentially enhanced monitoring.'
        ],

        regulatoryRequirements: [
          'MLR 2017 Regulation 18 – Risk assessment by relevant persons',
          'MLR 2017 Regulations 27-32 – Customer due diligence measures',
          'MLR 2017 Regulation 33 – Enhanced due diligence',
          'MLR 2017 Regulation 37 – Simplified due diligence',
          'JMLSG Guidance Part I Chapters 4-5'
        ]
      }
    },

    {
      id: 'transaction-monitoring-alerts',
      title: 'Transaction Monitoring, Alerts and Case Management',
      type: 'content',
      duration: 14,
      content: {
        learningPoint: 'Monitoring is about identifying patterns, documenting decisions, and escalating consistently.',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'info',
              title: 'Purpose of Transaction Monitoring',
              message: 'Detect patterns across time, channels and parties that cannot be seen in isolated transactions.'
            },
            {
              type: 'keypoint',
              icon: '📊',
              title: 'Monitoring Principles',
              points: [
                'Use customer profiles to define "expected" activity',
                'Calibrate thresholds by risk level, not one-size-fits-all',
                'Focus on patterns across time and channels',
                'Consider related parties and counterparties'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Initial Screen', description: 'Check for false positives, data quality' },
                { number: 2, title: 'Pattern Review', description: 'Compare to expected behavior, peer groups' },
                { number: 3, title: 'Document', description: 'Record rationale for close/escalate' },
                { number: 4, title: 'Escalate', description: 'Route to compliance/MLRO if suspicion persists' }
              ]
            },
            {
              type: 'keypoint',
              icon: '📁',
              title: 'Case Management',
              points: [
                'Group related alerts into single case',
                'Attach KYC, adverse media, transaction trails',
                'Track decisions with ownership and timestamps',
                'See end-to-end context'
              ]
            },
            {
              type: 'checklist',
              title: 'What Good Looks Like',
              items: [
                'Clear audit trail for alert decisions',
                'Escalations tied to documented red flags',
                'Consistent decisions across teams',
                'Regular model tuning based on intelligence'
              ]
            }
          ]
        },
        keyConcepts: [
          { term: 'Transaction Monitoring', definition: 'Systematic detection of unusual activity using scenarios, rules and analytics.' },
          { term: 'Alert Triage', definition: 'Initial review to determine if an alert requires investigation or escalation.' },
          { term: 'Case Management', definition: 'Grouping alerts and evidence into a single investigation with documented decisions.' },
          { term: 'False Positive', definition: 'An alert that appears suspicious but is ultimately legitimate.' }
        ],
        realExamples: [
          'A customer shows a sudden spike in outbound transfers to new counterparties, triggering a case review with KYC refresh.',
          'Alert tuning reduced false positives by 20% after thresholds were adjusted by customer risk tier.'
        ],
        regulatoryRequirements: [
          'MLR 2017 Regulation 19 - Policies, controls and procedures',
          'FCA SYSC 6.3 - Financial crime systems and controls',
          'JMLSG Guidance Part I - Ongoing monitoring expectations'
        ]
      }
    },
    {
      id: 'high-risk-customers-sanctions',
      title: 'High-Risk Customers, Sanctions and Escalation',
      type: 'content',
      duration: 14,
      content: {
        learningPoint: 'High-risk relationships require enhanced scrutiny, documented approvals, and clear escalation paths.',
        mainContent: {
          cards: [
            {
              type: 'infogrid',
              title: 'High-Risk Customer Categories',
              items: [
                { icon: '👔', label: 'PEPs', description: 'Politicians, family, associates' },
                { icon: '🌍', label: 'High-Risk Countries', description: 'Weak AML regimes' },
                { icon: '🏢', label: 'Complex Structures', description: 'Trusts, nominees, shells' },
                { icon: '💵', label: 'Cash-Intensive', description: 'High-risk business models' }
              ]
            },
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Sanctions = Absolute Prohibition',
              message: 'Sanctions compliance is not a risk assessment - it is a prohibition. A hit = escalate and freeze immediately.'
            },
            {
              type: 'checklist',
              title: 'EDD Controls for High-Risk',
              items: [
                'Source of wealth and funds verification',
                'Senior management approval before onboarding',
                'More frequent reviews',
                'Lower alert thresholds',
                'Clear risk acceptance documentation'
              ]
            },
            {
              type: 'keypoint',
              icon: '🔍',
              title: 'Sanctions Screening Coverage',
              points: [
                'Customers and beneficial owners',
                'Counterparties to transactions',
                'Payment details and beneficiaries',
                'Ongoing monitoring, not just onboarding'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Identify Risk', description: 'PEP, jurisdiction, structure, sanctions' },
                { number: 2, title: 'Apply EDD', description: 'Source of wealth, senior approval' },
                { number: 3, title: 'Document', description: 'Record rationale and approvals' },
                { number: 4, title: 'Monitor/Exit', description: 'Escalate or exit if risk unacceptable' }
              ]
            }
          ]
        },
        keyConcepts: [
          { term: 'High-Risk Third Country', definition: 'Jurisdictions identified by FATF or regulators as having weak AML controls.' },
          { term: 'PEP', definition: 'Individuals with prominent public functions and their close associates or family members.' },
          { term: 'Sanctions Exposure', definition: 'Direct or indirect connection to sanctioned persons, entities or jurisdictions.' },
          { term: 'Enhanced Due Diligence', definition: 'Additional checks required for higher-risk relationships.' }
        ],
        realExamples: [
          'A new corporate customer with a layered offshore structure required senior management approval and independent source of wealth verification.',
          'A payment to a counterparty in a sanctioned jurisdiction triggered immediate escalation and transaction blocking.',
          'A PEP relationship was downgraded only after documented evidence of reduced influence and a formal approval process.'
        ],
        regulatoryRequirements: [
          'MLR 2017 Regulation 33 - Enhanced due diligence',
          'Sanctions and Anti-Money Laundering Act 2018',
          'FCA Financial Crime Guide - PEPs and sanctions expectations'
        ]
      }
    },

    {
      id: 'red-flags-sars-governance',
      title: 'Red Flags, SARs, Governance & MI',
      type: 'content',
      duration: 18,
      content: {
        learningPoint: 'Recognise suspicious activity indicators, understand reporting obligations, and implement effective governance',
        mainContent: {
          cards: [
            {
              type: 'keypoint',
              icon: '🚨',
              title: 'Customer Behaviour Red Flags',
              points: [
                'Reluctance to provide information or docs',
                'Inconsistent, incomplete or false information',
                'Unusual concern about thresholds/confidentiality',
                'Using intermediaries to obscure identity'
              ]
            },
            {
              type: 'keypoint',
              icon: '💰',
              title: 'Transaction Red Flags',
              points: [
                'Inconsistent with customer profile',
                'Rapid in-out, same-day fund movements',
                'Structured just below thresholds',
                'Payments to/from high-risk jurisdictions'
              ]
            },
            {
              type: 'keypoint',
              icon: '🏢',
              title: 'Corporate Structure Red Flags',
              points: [
                'Multiple layers of holding companies',
                'Shell companies with no clear purpose',
                'Nominee shareholders/directors',
                'Registered in secrecy jurisdictions'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Recognise', description: 'Identify the red flag indicator' },
                { number: 2, title: 'Don\'t Tip Off', description: 'Never alert the customer' },
                { number: 3, title: 'Escalate', description: 'Report to line manager or MLRO' },
                { number: 4, title: 'Document', description: 'Record concerns immediately' }
              ]
            },
            {
              type: 'keypoint',
              icon: '📋',
              title: 'MLRO Role',
              points: [
                'Receives internal suspicious activity reports',
                'Evaluates if threshold met for external SAR',
                'Submits SARs to NCA via SAR Online',
                'Seeks consent where firm needs to proceed',
                'Liaises with law enforcement'
              ]
            },
            {
              type: 'stat',
              icon: '⏱️',
              value: '7 Days',
              label: 'NCA consent response period',
              description: 'Extendable by 31 days with court order',
              color: 'amber'
            },
            {
              type: 'infogrid',
              title: 'FCA Governance Expectations',
              items: [
                { icon: '👔', label: 'SMF16', description: 'Compliance Oversight' },
                { icon: '📋', label: 'SMF17', description: 'MLRO accountability' },
                { icon: '📊', label: 'Board MI', description: 'Regular reporting' }
              ]
            },
            {
              type: 'checklist',
              title: 'Board MI Should Include',
              items: [
                'Internal SAR volumes and quality',
                'Investigation outcomes',
                'CDD/EDD completion metrics',
                'Sanctions/PEP alert resolution rates',
                'Training completion rates'
              ]
            }
          ]
        },

        keyConcepts: [
          {
            term: 'Red Flag',
            definition: 'An indicator or warning sign that may suggest money laundering, terrorist financing or other financial crime requiring further investigation'
          },
          {
            term: 'Suspicious Activity Report (SAR)',
            definition: 'A report made to the NCA (via the MLRO) when there is knowledge or suspicion of money laundering or terrorist financing'
          },
          {
            term: 'Tipping Off',
            definition: 'The criminal offence of disclosing to a person that a SAR has been or may be made, or that an investigation is being contemplated or carried out'
          },
          {
            term: 'Consent SAR',
            definition: 'A request to the NCA for consent to proceed with a transaction that would otherwise constitute a money laundering offence'
          },
          {
            term: 'SMF17',
            definition: 'Senior Management Function for the Money Laundering Reporting Officer under SM&CR'
          }
        ],

        realExamples: [
          'A customer makes multiple cash deposits of £9,500 over several days. This structuring pattern is a classic red flag that should trigger an internal SAR.',
          'An investigation reveals a customer has been using the account to receive proceeds of fraud. The MLRO files an external SAR and obtains consent before freezing the account.',
          'A board receives MI showing SAR volumes have dropped 50% despite increased transaction volumes. This prompts a review of detection capabilities.'
        ],

        regulatoryRequirements: [
          'POCA 2002 ss. 330-332 – Failure to disclose offences',
          'POCA 2002 ss. 333A-333E – Tipping off offences',
          'MLR 2017 Regulation 21 – Policies, controls and procedures',
          'MLR 2017 Regulation 24 – Training',
          'FCA FCG Chapter 3 – Governance and senior management'
        ]
      }
    }
  ],

  // Practice Scenarios
  practiceScenarios: [
    {
      id: 'scenario-complex-corporate',
      title: 'Complex Corporate with Urgent Timelines',
      context: 'A new customer is an overseas company with a complex ownership structure and layers of intermediate holding companies in higher-risk jurisdictions. They push for urgent onboarding so they can "close a deal this week" and resist questions about their beneficial owners.',
      challenge: 'What is the appropriate response to this situation?',
      options: [
        'Expedite onboarding to meet the commercial deadline and complete EDD later',
        'Apply EDD before establishing the relationship, obtain source of funds/wealth, and escalate to senior management for approval',
        'Decline the business immediately without further investigation',
        'Apply SDD given the customer appears to be a legitimate business'
      ],
      correctAnswer: 1,
      explanation: 'This situation presents multiple high-risk factors: complex offshore structure, higher-risk jurisdictions, urgency, resistance to questioning. EDD is mandatory. The firm should obtain additional information on beneficial owners, source of funds and source of wealth, and obtain senior management approval before proceeding. If satisfactory information cannot be obtained, the relationship should be declined.',
      learningPoints: [
        'Commercial pressure must never override AML controls',
        'Complex structures and higher-risk jurisdictions trigger mandatory EDD',
        'Resistance to providing information is itself a red flag',
        'Senior management approval is required for high-risk relationships'
      ]
    },
    {
      id: 'scenario-structured-deposits',
      title: 'Structured Cash Deposits',
      context: 'A long-standing customer begins making regular cash deposits just under the firm\'s standard internal threshold for additional checks. This pattern continues for several weeks.',
      challenge: 'What action should be taken?',
      options: [
        'No action needed – each individual deposit is below threshold',
        'Recognise this as potential structuring, escalate to MLRO, and file an internal SAR',
        'Ask the customer directly if they are structuring to avoid checks',
        'Increase the threshold to reduce false positives'
      ],
      correctAnswer: 1,
      explanation: 'This is a classic structuring or "smurfing" pattern – breaking transactions into smaller amounts to avoid reporting thresholds. Staff should recognise this red flag and escalate to the MLRO. They must NOT tip off the customer by asking about structuring. The MLRO will assess whether an external SAR is required.',
      learningPoints: [
        'Structuring patterns should trigger suspicion regardless of individual transaction size',
        'Staff must never tip off customers about suspicions',
        'Transaction monitoring should identify patterns across time, not just individual transactions',
        'The MLRO decides on external reporting after reviewing all evidence'
      ]
    },
    {
      id: 'scenario-sanctions-hit',
      title: 'Sanctions Screening Match',
      context: 'Your sanctions screening tool flags that a new customer\'s beneficial owner has the same name and date of birth as a person on the UK sanctions list. Time pressure exists to proceed with the relationship.',
      challenge: 'What steps should the firm take?',
      options: [
        'Proceed with onboarding – the match is probably a false positive given it\'s a common name',
        'Conduct enhanced investigation to confirm or rule out the match, involving compliance and potentially OFSI, before any business proceeds',
        'Ask the customer if they are the sanctioned person',
        'File a SAR and proceed with the relationship'
      ],
      correctAnswer: 1,
      explanation: 'Sanctions matches require immediate escalation and thorough investigation before any business proceeds. The firm must gather additional identifying information to confirm or rule out the match. If there is any reasonable possibility it is a true match, the firm must not proceed without OFSI guidance or a licence. Dealing with sanctioned persons is a strict liability criminal offence.',
      learningPoints: [
        'Sanctions breaches are strict liability – there is no defence of "not knowing"',
        'All potential matches must be investigated before proceeding',
        'OFSI should be consulted where there is doubt',
        'Time pressure is never a justification for proceeding with a potential sanctions breach'
      ]
    }
  ],

  // Assessment Questions
  assessmentQuestions: [
    {
      id: 'fc-q1',
      question: 'Which statement best describes the main money laundering offences in Part 7 of the Proceeds of Crime Act 2002?',
      options: [
        { id: 'a', text: 'They only apply to banks and building societies' },
        { id: 'b', text: 'They criminalise dealing with criminal property in certain ways, knowing or suspecting it is criminal property' },
        { id: 'c', text: 'They only apply where there is clear proof of tax evasion' },
        { id: 'd', text: 'They apply only to cash transactions over a set threshold' }
      ],
      correctAnswer: 'b',
      explanation: 'POCA 2002 ss. 327-329 create broad money laundering offences covering concealing, arranging, acquiring, using or possessing criminal property, where the person knows or suspects it is criminal property.',
      topic: 'POCA Offences'
    },
    {
      id: 'fc-q2',
      question: 'What is the primary purpose of the Money Laundering Regulations 2017 (MLR 2017) for regulated firms?',
      options: [
        { id: 'a', text: 'To set tax reporting rules for all businesses' },
        { id: 'b', text: 'To specify detailed AML/CTF systems and control requirements, including CDD, risk assessments, internal controls and record-keeping' },
        { id: 'c', text: 'To provide optional guidance on good practice only' },
        { id: 'd', text: 'To set interest rate thresholds on savings products' }
      ],
      correctAnswer: 'b',
      explanation: 'MLR 2017 sets legally binding requirements for AML and CTF controls, including business-wide risk assessments, CDD/EDD, ongoing monitoring, internal controls and record-keeping.',
      topic: 'MLR 2017'
    },
    {
      id: 'fc-q3',
      question: 'Which statement best reflects a risk-based approach (RBA) to AML/CTF?',
      options: [
        { id: 'a', text: 'Applying exactly the same level of due diligence to every customer' },
        { id: 'b', text: 'Using lower standards of due diligence if the customer is profitable' },
        { id: 'c', text: 'Adjusting the nature and extent of due diligence and monitoring in proportion to assessed ML/TF risk' },
        { id: 'd', text: 'Relying solely on external ratings agencies to decide risk levels' }
      ],
      correctAnswer: 'c',
      explanation: 'Both MLR 2017 and JMLSG expect firms to adopt a risk-based approach, where controls (including CDD/EDD and monitoring) are proportionate to the level of money laundering and terrorist financing risk.',
      topic: 'Risk-Based Approach'
    },
    {
      id: 'fc-q4',
      question: 'In which situation is enhanced due diligence (EDD) most clearly required under MLR 2017?',
      options: [
        { id: 'a', text: 'A low-value domestic transaction with a long-standing local customer and no risk indicators' },
        { id: 'b', text: 'A one-off payment below £50 made by card' },
        { id: 'c', text: 'A new relationship involving a politically exposed person (PEP) and a high-risk third country' },
        { id: 'd', text: 'A long-term client who wants to update their address details' }
      ],
      correctAnswer: 'c',
      explanation: 'Regulation 33 requires EDD in higher-risk situations, including relationships involving PEPs and high-risk third countries, along with other high-risk scenarios identified by the firm.',
      topic: 'Enhanced Due Diligence'
    },
    {
      id: 'fc-q5',
      question: 'Which statement about simplified due diligence (SDD) is correct?',
      options: [
        { id: 'a', text: 'SDD means no customer checks are required' },
        { id: 'b', text: 'SDD may be applied where a relationship presents a low risk of ML/TF, but some CDD is still required' },
        { id: 'c', text: 'SDD can be applied solely to speed up onboarding for VIP clients' },
        { id: 'd', text: 'SDD may be used as a default approach for all new customers' }
      ],
      correctAnswer: 'b',
      explanation: 'Regulation 37 allows SDD where the relationship or transaction presents a low risk of money laundering or terrorist financing, but SDD still requires an appropriate level of CDD. It is not "no KYC".',
      topic: 'Simplified Due Diligence'
    },
    {
      id: 'fc-q6',
      question: 'Which is the best immediate action when a member of staff identifies multiple, unexplained red flags around a customer\'s transactions?',
      options: [
        { id: 'a', text: 'Continue processing the transactions as normal and wait to see if anything else happens' },
        { id: 'b', text: 'Inform the customer that they are suspected of money laundering' },
        { id: 'c', text: 'Escalate the concern to the MLRO or nominated officer in line with internal SAR procedures' },
        { id: 'd', text: 'Immediately close the account without telling anyone internally' }
      ],
      correctAnswer: 'c',
      explanation: 'Where staff know or suspect money laundering, they should escalate concerns promptly to the MLRO or nominated officer according to internal suspicious activity reporting procedures. They must not "tip off" the customer.',
      topic: 'Red Flags and SARs'
    },
    {
      id: 'fc-q7',
      question: 'Under FCA rules and guidance, which statement best reflects expectations on financial crime systems and controls?',
      options: [
        { id: 'a', text: 'Having a generic AML policy is sufficient regardless of the firm\'s business model' },
        { id: 'b', text: 'Firms must establish and maintain effective systems and controls proportionate to their financial crime risk profile' },
        { id: 'c', text: 'Only firms above a certain balance sheet threshold need detailed financial crime systems' },
        { id: 'd', text: 'The FCA only expects manual checks, not automated tools' }
      ],
      correctAnswer: 'b',
      explanation: 'SYSC 3.2.6R and SYSC 6.1.1R, supported by the FCA\'s Financial Crime Guide, require firms to implement effective systems and controls that are proportionate to their risks, including appropriate automation where relevant.',
      topic: 'Systems and Controls'
    },
    {
      id: 'fc-q8',
      question: 'Which is the most accurate statement about governance and MI for financial crime risk?',
      options: [
        { id: 'a', text: 'Financial crime MI is optional if there is an MLRO in place' },
        { id: 'b', text: 'Boards and senior management should receive regular, meaningful MI on financial crime risk and controls and act on it' },
        { id: 'c', text: 'Financial crime MI should be limited to the number of training sessions delivered' },
        { id: 'd', text: 'MI is only required when the FCA asks for it' }
      ],
      correctAnswer: 'b',
      explanation: 'The FCA expects firms to use management information to understand and manage financial crime risk, with boards and senior management actively overseeing systems, controls and remediation where weaknesses are identified.',
      topic: 'Governance and MI'
    }
  ],

  // Summary Section
  summary: {
    keyTakeaways: [
      'POCA 2002 creates criminal offences for dealing with criminal property – "knows or suspects" is a low threshold with up to 14 years imprisonment',
      'MLR 2017 mandates risk-based CDD, EDD for high-risk situations, ongoing monitoring, and comprehensive record-keeping',
      'The risk-based approach means more controls for higher risk, proportionate controls for lower risk – not one-size-fits-all',
      'EDD is mandatory for PEPs, high-risk countries, complex structures, and unusual transactions without clear economic purpose',
      'Red flags must be recognised and escalated to the MLRO – never tip off the customer',
      'Boards and senior management must receive outcome-focused MI and actively oversee financial crime controls'
    ],
    nextSteps: [
      'Review your firm\'s business-wide risk assessment and ensure it reflects current risks',
      'Understand escalation routes for suspicious activity and how to complete internal SARs',
      'Ensure you can recognise the red flags most relevant to your role and business area',
      'Check that MI reaches the board and senior management and drives action where needed'
    ],
    quickReference: [
      'POCA ss.327-329: Concealing, arranging, acquiring criminal property',
      'MLR 2017: CDD, EDD, SDD, risk assessment, monitoring, records',
      'EDD triggers: PEPs, high-risk countries, complex transactions',
      'Red flag response: Recognise → Don\'t tip off → Escalate to MLRO',
      'SMF17: Money Laundering Reporting Officer accountability'
    ]
  },

  // Visual Assets
  visualAssets: {
    images: [
      {
        section: 'hook',
        description: 'Corporate structure diagram showing offshore layers with question marks over beneficial owners'
      },
      {
        section: 'framework',
        description: 'Regulatory pillar graphic: POCA, MLR 2017, FCA SYSC/FCG, JMLSG'
      },
      {
        section: 'rba',
        description: 'Risk slider from low to high with corresponding control intensity'
      },
      {
        section: 'cdd-edd',
        description: 'Three-tier diagram: SDD (low risk) → Standard CDD → EDD (high risk)'
      },
      {
        section: 'sar-flow',
        description: 'Workflow: Frontline staff → Internal SAR → MLRO → Decision → NCA'
      },
      {
        section: 'governance',
        description: 'Board MI dashboard with SAR volumes, alerts, CDD metrics, training'
      }
    ],
    style: 'Professional regulatory design with clear process flows and risk-based frameworks'
  }
};
