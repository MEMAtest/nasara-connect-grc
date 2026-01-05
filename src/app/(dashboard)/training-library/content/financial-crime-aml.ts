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
        mainContent: `The UK has one of the most comprehensive financial crime frameworks in the world. Understanding its components is essential for anyone working in a regulated firm.

**1. Proceeds of Crime Act 2002 (POCA)**

POCA contains the primary UK money laundering offences in sections 327-329:

**Section 327 – Concealing Criminal Property**
It is an offence to conceal, disguise, convert, transfer, or remove criminal property from the jurisdiction. This covers activities like moving money through accounts to hide its origin, or converting cash into assets.

**Section 328 – Arrangements**
It is an offence to enter into or become concerned in an arrangement which you know or suspect facilitates the acquisition, retention, use or control of criminal property by or on behalf of another person.

**Section 329 – Acquisition, Use and Possession**
It is an offence to acquire, use or have possession of criminal property. This can catch firms that receive funds they know or suspect are criminal proceeds.

**Key Points on POCA Offences:**
• "Criminal property" is widely defined – it includes any benefit from any criminal conduct
• The mental element is "knows or suspects" – a low threshold
• Maximum penalty is 14 years' imprisonment
• POCA also creates reporting offences (failure to report) and tipping-off offences

**2. Money Laundering Regulations 2017 (MLR 2017)**

MLR 2017 sets out detailed AML/CTF system and control requirements:

• **Business-wide risk assessment** – firms must assess and document their ML/TF risks
• **Internal controls and policies** – written policies, controls and procedures
• **Customer Due Diligence (CDD)** – identification, verification, understanding purpose
• **Ongoing monitoring** – scrutiny of transactions and keeping information up to date
• **Simplified Due Diligence (Reg 37)** – reduced measures for genuinely low-risk relationships
• **Enhanced Due Diligence (Reg 33)** – additional measures for high-risk situations
• **Record-keeping** – retention of CDD and transaction records

**3. FCA Handbook – SYSC and FCG**

SYSC 3.2.6R requires firms to have effective systems and controls for compliance with applicable requirements and standards under the regulatory system and for countering the risk that the firm might be used to further financial crime.

SYSC 6.1.1R requires firms to establish, implement and maintain adequate policies and procedures to ensure compliance with obligations under the regulatory system and to counter the risk that the firm might be used for financial crime.

The FCA's **Financial Crime Guide (FCG)** provides consolidated guidance on what "good" looks like, covering:
• Governance and senior management oversight
• Risk assessment methodology
• Customer due diligence and ongoing monitoring
• Transaction monitoring and suspicious activity reporting
• Training and awareness

**4. JMLSG Guidance**

The Joint Money Laundering Steering Group (JMLSG) publishes authoritative industry guidance explaining how to apply the AML/CTF regime using a risk-based approach. Courts and regulators give significant weight to JMLSG guidance.

**5. Sanctions and PEP Framework**

• UK sanctions framework under the Sanctions and Anti-Money Laundering Act 2018
• OFSI (Office of Financial Sanctions Implementation) guidance and licensing
• FCA's PEP guidance (FG25/3) emphasising proportionate, risk-based treatment`,

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
        mainContent: `**The Risk-Based Approach (RBA)**

Under MLR 2017 and JMLSG guidance, firms must adopt a risk-based approach to AML/CTF. This means applying resources and controls proportionately to the level of risk.

**Business-Wide Risk Assessment**

Every firm must conduct and document a business-wide risk assessment covering:

**Customer Risk Factors:**
• Customer types (individuals, corporates, trusts, charities)
• Beneficial ownership complexity
• PEP status and connections
• Cash-intensive businesses
• Customers from high-risk jurisdictions

**Product and Service Risk:**
• Cross-border transactions
• Correspondent banking
• Private banking and wealth management
• Trade finance
• Virtual assets and payments

**Delivery Channel Risk:**
• Non-face-to-face onboarding
• Introducers and intermediaries
• Digital-only channels
• Third-party reliance

**Geographic Risk:**
• FATF high-risk jurisdictions
• Countries with weak AML/CTF controls
• Sanctions-affected regions
• Tax havens and secrecy jurisdictions

**Customer-Level Risk Assessment**

For each customer, firms should assess and assign a risk rating based on:
• Jurisdiction of customer and beneficial owners
• Type of customer and business activity
• Products and services used
• Expected transaction patterns
• Source of funds and wealth
• Any adverse information or red flags

---

**Customer Due Diligence (CDD) – Standard Requirements**

Under MLR 2017, firms must carry out CDD before establishing a business relationship or carrying out occasional transactions above thresholds.

**The Four Elements of CDD:**

1. **Identify the customer** – obtain name, date of birth, address, and other identifying information

2. **Verify identity** – using documents, data or information from a reliable and independent source

3. **Identify beneficial owners** – for legal entities, identify any individual who owns or controls more than 25% (or exercises control through other means)

4. **Understand the relationship** – establish the purpose and intended nature of the business relationship

**Ongoing Monitoring:**
• Scrutinise transactions to ensure consistency with customer profile
• Keep CDD information up to date
• Apply enhanced scrutiny to higher-risk relationships

---

**Simplified Due Diligence (SDD) – Regulation 37**

SDD may be applied where:
• The business relationship or transaction presents a LOW risk of ML/TF
• This is determined by the firm's own risk assessment
• Relevant risk factors and guidance have been considered

**SDD is NOT "no CDD"** – basic identification and verification are still required, but the extent and frequency of measures may be reduced.

Examples where SDD might apply:
• UK-regulated financial institutions
• Listed companies on regulated markets
• UK public authorities
• Low-value products with built-in limits

---

**Enhanced Due Diligence (EDD) – Regulation 33**

EDD must be applied in certain higher-risk situations:

**Mandatory EDD Triggers:**
• Relationships with persons in high-risk third countries
• Politically Exposed Persons (PEPs), family members and close associates
• Complex or unusually large transactions with no apparent economic purpose
• Correspondent banking relationships

**EDD Measures Include:**
• Obtaining additional information on the customer and beneficial owners
• Obtaining information on **source of funds** (immediate origin of funds for transactions)
• Obtaining information on **source of wealth** (how the customer accumulated their overall wealth)
• Senior management approval to establish or continue the relationship
• Enhanced ongoing monitoring – more frequent reviews, tighter alert thresholds
• First payment from a verified account in customer's name

**The Key Principle:**
More risk = More scrutiny. Less risk = Proportionate (not absent) controls.`,

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
        mainContent: `Transaction monitoring is the operational heart of AML. It turns the risk-based approach into daily controls by detecting patterns that cannot be seen in isolated transactions.

**Monitoring Principles**
- Use customer profiles to define "expected" activity
- Calibrate thresholds by risk level, not a single firm-wide setting
- Focus on patterns across time, channels and related parties

**Alert Triage and Review**
Effective alert handling includes:
- Initial screening: check for obvious false positives or data quality errors
- Pattern review: compare activity to expected behavior and peer groups
- Documentation: record rationale for closing or escalating alerts
- Escalation: route to compliance or MLRO when suspicion persists

**Case Management**
- Group related alerts into a single case to see end-to-end context
- Attach supporting evidence (account notes, KYC, adverse media, transaction trails)
- Track decisions and actions with clear ownership and timestamps

**Model Tuning and Quality**
- Monitor false positive rates and missed suspicious activity
- Adjust scenarios and thresholds based on typologies and intelligence
- Regularly review coverage for high-risk products, jurisdictions and customer types

**What Good Looks Like**
- A clear audit trail for why alerts were closed or escalated
- Escalations tied to documented red flags
- Consistent decisions across teams and channels`,
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
        mainContent: `High-risk customers require deeper due diligence and more frequent monitoring. These risks are often concentrated around PEPs, high-risk third countries, complex ownership structures, and sanctions exposure.

**High-Risk Customer Categories**
- Politically exposed persons (PEPs) and close associates
- Customers linked to high-risk third countries or weak AML regimes
- Complex ownership chains with trusts, nominees or shell companies
- Cash-intensive or high-risk business models

**Sanctions Overlap**
- Sanctions compliance is absolute: a sanctions hit is not a risk assessment issue, it is a prohibition issue
- Screening must cover customers, beneficial owners, counterparties and payments
- Escalate and freeze where required by policy and law

**Enhanced Due Diligence Controls**
- Source of wealth and funds verification
- Senior management approval before onboarding
- More frequent reviews and lower alert thresholds
- Clear documentation of risk acceptance rationale

**Escalation and Exit**
- Define triggers for escalation and potential exit decisions
- Avoid tipping off, but protect the firm from ongoing exposure
- Record decisions with evidence and approvals`,
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
        mainContent: `**Common Red Flags**

Red flags are indicators that may suggest money laundering, terrorist financing or other financial crime. Staff must be trained to recognise them and escalate appropriately.

**Customer Behaviour Red Flags:**
• Reluctance to provide information or documentation
• Providing information that is inconsistent, incomplete or false
• Unusual concern about confidentiality or reporting thresholds
• Changing details frequently without clear reason
• Using intermediaries unnecessarily to obscure identity

**Transaction Red Flags:**
• Transactions inconsistent with customer profile or stated business
• Unusually large or complex transactions with no clear purpose
• Rapid movement of funds (in-out, same-day, back-to-back)
• Structured transactions just below reporting thresholds
• Payments to/from high-risk jurisdictions
• Round-sum transactions with no commercial logic

**Corporate Structure Red Flags:**
• Complex ownership with multiple layers of holding companies
• Use of shell companies with no clear business purpose
• Nominee shareholders and directors
• Frequent changes to corporate structure
• Registered in secrecy jurisdictions

**What Staff Should Do:**
1. Recognise the red flag
2. Do NOT tip off the customer
3. Escalate internally to line manager or MLRO
4. Document concerns contemporaneously

---

**Suspicious Activity Reports (SARs) and the MLRO**

**The Reporting Obligation:**

Under POCA, where a person in the regulated sector:
• Knows or suspects that another person is engaged in money laundering, AND
• The information came to them in the course of business

They must report to the nominated officer (MLRO) or directly to the NCA.

**The MLRO's Role:**
• Receives internal suspicious activity reports from staff
• Evaluates whether they meet the threshold for external reporting
• Submits SARs to the NCA via the SAR Online system
• Maintains records of all internal and external SARs
• Liaises with law enforcement where required
• Seeks consent (defence against money laundering) where the firm needs to proceed with a transaction

**Consent SARs:**
Where proceeding with a transaction would constitute a money laundering offence, the firm may seek consent from the NCA. The NCA has 7 working days to respond (extendable by 31 days with a court order).

**Staff Training on SARs:**
• How to complete internal SAR forms
• Escalation routes and timelines
• Importance of contemporaneous documentation
• Never tip off the customer
• When consent SARs are needed

---

**Governance, Systems, Controls and MI**

**Clear Governance and Accountability:**

The FCA expects:
• Board-level oversight of financial crime risk
• Clear allocation of responsibilities under SM&CR
• SMF16 (Compliance Oversight) and SMF17 (MLRO) with defined accountabilities
• Regular reporting to the board on financial crime matters

**Robust Systems and Controls:**

• Written policies and procedures reflecting the firm's risk profile
• Sanctions screening tools appropriate to business scale
• PEP screening at onboarding and on an ongoing basis
• Transaction monitoring systems with appropriate rules and thresholds
• Case management for investigations
• Quality assurance of CDD and investigations
• Record-keeping to evidence compliance

**Outcome-Focused MI:**

Boards and senior management should receive regular MI including:
• Number and quality of internal SARs
• Outcomes of investigations (confirmed, closed, escalated)
• CDD/EDD completion metrics and overdue reviews
• Sanctions and PEP alerts – volumes, false positive rates, time to resolve
• Training completion rates
• Thematic analysis of control failures or incidents
• Regulatory correspondence and enforcement trends

**Training:**

MLR 2017 requires firms to take measures to ensure employees are:
• Made aware of the law relating to money laundering and terrorist financing
• Trained in how to recognise and deal with suspicious activity
• Regularly given refresher training

Training should be role-specific and reflect the firm's risk profile.`,

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
