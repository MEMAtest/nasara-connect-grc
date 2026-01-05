// Module 4: Client Categorisation – FCA COBS 3 & Investor Protection
// Comprehensive training on FCA client classification framework

import { TrainingModule } from '../types';

export const clientCategorisationModule: TrainingModule = {
  id: 'client-categorisation',
  title: 'Client Categorisation – FCA COBS 3 & Investor Protection',
  description: 'Master the FCA\'s client categorisation framework including retail clients, professional clients (per se and elective), and eligible counterparties. Learn how categorisation drives regulatory protection levels and which COBS rules apply.',
  category: 'regulatory-compliance',
  duration: 65,
  difficulty: 'intermediate',
  targetPersonas: [
    'senior-manager',
    'compliance-officer',
    'relationship-manager',
    'certified-person',
    'operations-staff'
  ],
  prerequisiteModules: ['consumer-duty'],
  tags: [
    'COBS 3',
    'client categorisation',
    'retail client',
    'professional client',
    'eligible counterparty',
    'ECP',
    'investor protection',
    'elective professional',
    'MiFID',
    'FCA'
  ],
  learningOutcomes: [
    'Describe the FCA\'s client categorisation framework in COBS 3, including retail clients, professional clients (per se and elective) and eligible counterparties',
    'Explain how categorisation drives the level of regulatory protection and which COBS rules apply (e.g. suitability, appropriateness, disclosure, best execution, Consumer Duty scope)',
    'Apply the criteria for elective professional clients and elective eligible counterparties, and understand when recategorisation to a higher level of protection must be allowed',
    'Identify common weaknesses highlighted in the FCA\'s 2025 multi-firm review of corporate finance firms\' client categorisation',
    'Design and document a robust categorisation process and record-keeping approach that can stand up to regulatory and court scrutiny',
    'Recognise that the COBS 3 regime is evolving and why firms must monitor upcoming changes to client categorisation rules and Consumer Duty interaction'
  ],
  hook: {
    type: 'case-study',
    content: 'Your firm is advising a fast-growing privately-owned company on a funding round. The deal team wants to treat the company as an elective professional client to reduce disclosure and suitability requirements. The client is sophisticated commercially, but has never previously done capital markets transactions and provides very limited evidence of investment experience. A recent FCA multi-firm review found weak client categorisation controls and stressed that an incorrectly categorised client is treated as a retail client in law, whatever the paperwork says.',
    question: 'If the FCA or a court later challenged your categorisation, what evidence would you produce to show the client genuinely met the criteria – and what would happen if you couldn\'t?'
  },
  lessons: [
    {
      id: 'cobs3-framework',
      title: 'COBS 3 – Framework and Core Categories',
      duration: 20,
      content: `COBS 3 "Client categorisation" determines who is your client and what category they fall into. Many other rules (e.g. parts of COBS 4, 6, 9A, 10A, Consumer Duty scope) depend on this classification.

COBS 3.2 broadly provides that a "client" is anyone to whom a firm provides, intends to provide, or has provided a regulated service (including potential clients for MiFID business).

**The Three Main Categories**

Under the FCA rules, a client can be:

**1. Retail Client**
- Default category for all clients
- Receives the highest level of regulatory protection
- Full COBS and Consumer Duty scope applies
- Includes most individuals and SMEs

**2. Professional Client**
- Either a per se professional client (meets defined criteria automatically) or an elective professional client (opts up and meets tests)
- Receives a lower level of protection than retail clients
- Some rules (e.g. certain disclosure or suitability requirements) may be modified

**3. Eligible Counterparty (ECP)**
- Highest sophistication, lowest protection
- Limited to specific eligible counterparty business (e.g. dealing on own account, execution, reception & transmission)
- Also split into per se ECP and elective ECP

**Protection Hierarchy:**
Retail clients = MOST protection → Professional clients → Eligible counterparties = LEAST protection`,
      keyConcepts: [
        'COBS 3 determines client category and applicable conduct rules',
        'Three categories: Retail (default), Professional, Eligible Counterparty',
        'Retail receives highest protection, ECP receives lowest',
        'Many COBS rules depend on client categorisation',
        'MiFID business includes potential clients in scope'
      ],
      realExamples: [
        {
          title: 'Per Se Professional Client',
          description: 'A large investment firm automatically qualifies as a per se professional client under COBS 3.5.2R because it is a regulated entity. No opt-up process is required.',
          outcome: 'The firm receives professional client protections by default'
        },
        {
          title: 'Retail Client Default',
          description: 'A high-net-worth individual approaches a wealth manager for investment advice. Despite their wealth, they are classified as retail by default unless they meet and complete the elective professional process.',
          outcome: 'Full retail protections apply including suitability assessments and Consumer Duty'
        }
      ]
    },
    {
      id: 'retail-professional-ecp',
      title: 'Retail vs Professional vs Eligible Counterparty – Getting it Right',
      duration: 25,
      content: `**Retail Clients**

Retail is the default classification unless the firm can clearly demonstrate that criteria for professional or ECP status are met. For individuals and SMEs, firms should be cautious about "opt-up" to professional or ECP status given interaction with Consumer Duty protections.

**Professional Clients – Per Se vs Elective**

**Per se professional clients (COBS 3.5.2R)** include:
- Regulated entities (investment firms, credit institutions, insurers, etc.)
- Large undertakings meeting specified size / balance sheet criteria
- National / regional governments and certain public bodies

**Elective professional clients** - A client that is not per se professional may be treated as professional ONLY if:
1. The firm undertakes an adequate assessment of the client's expertise, experience and knowledge and concludes they can make their own investment decisions and understand the risks
2. The client formally requests to be treated as professional
3. The firm gives a clear written warning of the protections the client may lose
4. The client confirms in writing that they are aware of the consequences

The FCA and recent case law emphasise that firms must go beyond simple "tick-box" forms and actually test that the client meets the criteria.

**Eligible Counterparties (ECPs)**

COBS 3.6 covers eligible counterparties:
- Per se ECPs include investment firms, credit institutions, authorised insurers and certain institutional investors
- Elective ECPs: some per se professional clients can be opted up to ECP status for ECP business, subject to conditions and a documented process

Only certain transaction types qualify as eligible counterparty business; for other services, the client must be treated as professional or retail.

**Providing a Higher Level of Protection / Re-categorisation**

COBS 3.7 requires firms to:
- Allow a professional client or ECP to request a higher level of protection (e.g. be treated as retail)
- Notify such clients of their right to request re-categorisation
- Optionally treat a client as more protected than required on the firm's own initiative

The FCA's latest COBS 3 updates make it even clearer that firms can "opt up protection" where appropriate and that clients incorrectly categorised as professional are, in law, retail clients.`,
      keyConcepts: [
        'Retail is the default – burden is on firm to prove otherwise',
        'Per se professionals meet criteria automatically (regulated entities, large undertakings)',
        'Elective professional requires: assessment, request, warning, confirmation',
        'ECP status only applies to eligible counterparty business',
        'Clients have right to request higher protection (re-categorisation)',
        'Incorrectly categorised clients are retail in law regardless of paperwork'
      ],
      realExamples: [
        {
          title: 'Failed Elective Professional',
          description: 'A corporate finance firm treated an SME as elective professional based on a simple self-certification form. The FCA found the firm had not conducted an adequate assessment of the client\'s actual expertise and experience.',
          outcome: 'The client was deemed a retail client in law, exposing the firm to potential conduct breaches'
        },
        {
          title: 'Re-categorisation Request',
          description: 'A professional client whose treasury team was disbanded requested to be treated as retail. The firm properly assessed the request and updated their categorisation.',
          outcome: 'Full retail protections now apply including enhanced suitability requirements'
        }
      ]
    },
    {
      id: 'elective-professional-evidence',
      title: 'Elective Professional Tests and Evidence Packs',
      duration: 20,
      content: `Elective professional categorisation is one of the highest-risk areas for FCA scrutiny. Firms must evidence that a client genuinely meets the COBS 3.5 test, not just sign a form.

**The Three-Part Elective Test**
The client must meet at least two of the following:
1. **Transaction Frequency** – carried out significant transactions in relevant markets at an average frequency of 10 per quarter over the last four quarters.
2. **Portfolio Size** – financial instrument portfolio exceeds EUR 500,000.
3. **Professional Experience** – worked in the financial sector for at least one year in a professional position requiring knowledge of relevant transactions or services.

**Evidence Standards**
- Documented proof of transaction history or portfolio size
- Confirmation of professional experience (role, employer, duties)
- Clear file note of how criteria were assessed and met
- Written warnings of protections lost and client acknowledgement

**Common Failures**
- Reliance on client self-certification alone
- Missing evidence for transaction frequency or portfolio value
- Generic disclosures without explicit loss-of-protection warnings
- No review of continued eligibility as circumstances change`,
      keyConcepts: [
        'Elective professional status requires evidence, not just consent',
        'Two out of three criteria must be met and documented',
        'Warnings and acknowledgements must be explicit and recorded',
        'Eligibility should be reviewed over time'
      ],
      realExamples: [
        {
          title: 'Weak Evidence File',
          description: 'A firm categorised a client as elective professional based on a questionnaire with no supporting transaction data.',
          outcome: 'FCA required recategorisation to retail and remediation of affected transactions'
        },
        {
          title: 'Robust Evidence Pack',
          description: 'A firm documented portfolio statements, transaction history and role verification before approval.',
          outcome: 'Categorisation decision withstood FCA review'
        }
      ]
    },
    {
      id: 'categorisation-impacts',
      title: 'Impact on Suitability, Disclosure and Duty',
      duration: 20,
      content: `Client categorisation changes the entire compliance perimeter. Mis-categorisation cascades into breaches across multiple COBS requirements.

**Key Impacts**
- **Suitability (COBS 9A):** mandatory for retail clients receiving advice
- **Appropriateness (COBS 10A):** required for non-advised complex products for retail clients
- **Disclosure rules:** retail clients receive the highest standards of disclosure and clarity
- **Consumer Duty scope:** retail clients are fully within the Duty; professional and ECPs may have reduced protections depending on activity

**Why This Matters**
- If a client is wrongly treated as professional, they are still retail in law
- Firms can face FOS and FCA findings for unsuitable recommendations or poor disclosures
- Firms may need to remediate entire cohorts if categorisation is flawed

**Good Practice**
- Link categorisation data to advice and sales workflows
- Use automated checks so retail protections cannot be bypassed
- Ensure compliance review for any changes in category`,
      keyConcepts: [
        'Mis-categorised clients are treated as retail in law',
        'Suitability and appropriateness requirements flow from category',
        'Consumer Duty protections are strongest for retail clients',
        'Disclosure rules are stricter for retail clients'
      ],
      realExamples: [
        {
          title: 'Cascade Failure',
          description: 'A firm classified SMEs as professional, skipped suitability, and later faced multiple FOS findings.',
          outcome: 'Remediation and client re-categorisation across the portfolio'
        },
        {
          title: 'Workflow Safeguards',
          description: 'A firm integrated categorisation into CRM so retail protections were enforced at every step.',
          outcome: 'Reduced compliance errors and clearer audit trail'
        }
      ]
    },
    {
      id: 'governance-records-fca-review',
      title: 'Governance, Records and FCA Expectations (2025 Review)',
      duration: 20,
      content: `**Policies, Procedures and Records**

COBS 3.8 requires firms to have policies, procedures and records for client categorisation.

Best practice (aligned to the 2025 FCA review) includes:

**Clear Categorisation Policy setting out:**
- Default categories
- When and how clients may be treated as professional or ECP
- Approval levels for elective categorisations

**Documented Assessments:**
For each elective professional / ECP, a file note showing:
- How the client meets the relevant COBS 3 tests
- Evidence considered (e.g. deal history, financial sophistication)
- Use of standard forms is fine, but substance matters

**Periodic Review** of categorisations, especially where a client's circumstances or business model may have changed.

**FCA 2025 Multi-Firm Review – Key Findings**

The FCA's October 2025 multi-firm review of corporate finance firms found:

- **Inadequate evidence** for elective professional status (e.g. over-reliance on self-certification questionnaires)
- Misunderstanding that clients could "sign away" rights; the FCA reiterated that if COBS 3.5 criteria are not met, the client remains a retail client regardless of terms of business wording
- Weak governance around categorisation decisions and limited QA / file checking

The FCA has signalled plans to modernise COBS 3 and simplify aspects of client categorisation, but still emphasises robust, evidenced classification and protection for less-sophisticated clients.

**Interaction with Consumer Duty and Suitability**

Client categorisation affects:
- Whether and how Consumer Duty applies – many protections focus on retail customers
- Whether the firm owes suitability obligations (COBS 9A) or appropriateness tests (COBS 10A)

Mis-categorisation can cascade into systemic breaches of suitability, disclosure and Duty requirements – a key risk the FCA is now actively supervising.`,
      keyConcepts: [
        'COBS 3.8 requires policies, procedures and records for categorisation',
        'Document assessments showing how client meets COBS 3 tests',
        'FCA 2025 review found weak evidence and tick-box approaches',
        'Clients cannot "sign away" retail rights if criteria not met',
        'Categorisation drives suitability vs appropriateness obligations',
        'Mis-categorisation creates systemic conduct breach risk'
      ],
      realExamples: [
        {
          title: 'Good Practice Documentation',
          description: 'A firm maintains a defined categorisation memo template that requires relationship managers to explain: (1) how the client meets COBS 3.5 tests, (2) evidence reviewed, (3) sign-off from compliance.',
          outcome: 'Robust audit trail that can withstand regulatory scrutiny'
        },
        {
          title: 'Cascading Breach',
          description: 'A firm incorrectly categorised multiple clients as professional. This meant they didn\'t conduct full suitability assessments or provide required disclosures. The FCA found systematic breaches across multiple COBS requirements.',
          outcome: 'Enforcement action for multiple conduct rule breaches'
        }
      ]
    }
  ],
  practiceScenarios: [
    {
      id: 'sme-elective-professional',
      title: 'SME Elective Professional?',
      description: 'An SME with a strong commercial track record but no prior experience of capital markets or complex investments wants to be treated as an elective professional client to access certain products and "avoid lengthy paperwork".',
      difficulty: 'intermediate',
      questions: [
        'What information would you gather to assess whether they genuinely meet the COBS 3.5 tests?',
        'What warnings and confirmations are required?',
        'In what circumstances might you refuse elective professional status?'
      ],
      hints: [
        'Consider knowledge, experience, and understanding of risks',
        'Written warnings must specify protections that will be lost',
        'Commercial sophistication alone is not sufficient'
      ],
      modelAnswer: 'You would need to assess the client\'s actual investment knowledge and experience (not just commercial success), their understanding of capital markets risks, and their ability to make informed investment decisions. Gather evidence of previous transactions, relevant qualifications, and specific knowledge. Provide clear written warnings about lost protections (e.g., reduced disclosure, modified suitability requirements). You should refuse if the client lacks genuine investment expertise – wanting to "avoid paperwork" is not a valid reason for opt-up.'
    },
    {
      id: 'per-se-professional-ecp',
      title: 'Per se Professional but ECP?',
      description: 'A large investment firm (per se professional) wants to be treated as an eligible counterparty for certain execution-only trades but as a professional client for others.',
      difficulty: 'intermediate',
      questions: [
        'For which services or business can they be treated as ECP?',
        'How would you document and limit the scope of ECP status?',
        'When might you choose to give them higher protection than the minimum required?'
      ],
      hints: [
        'ECP status only applies to eligible counterparty business',
        'Document clearly which services fall under each category',
        'Consider whether enhanced protection serves the relationship'
      ],
      modelAnswer: 'ECP status only applies to eligible counterparty business – typically dealing on own account, execution of orders, and reception & transmission. For advisory services or other activities, they must be treated as professional. Document the scope clearly in the client agreement, specifying which services are ECP and which are professional client services. You might choose higher protection where the client requests it, where the service is complex, or where doing so better serves the relationship and reduces regulatory risk.'
    },
    {
      id: 'recategorisation-request',
      title: 'Re-categorisation Request',
      description: 'A long-standing professional client informs you that their in-house treasury team has been disbanded and they no longer feel able to assess complex transactions.',
      difficulty: 'intermediate',
      questions: [
        'What are your obligations under COBS 3.7 and 3.3?',
        'How would you handle their request to be treated as retail?',
        'What changes might you need to make to products, documentation and processes for this client?'
      ],
      hints: [
        'Clients have right to request higher protection',
        'Notify clients of their re-categorisation rights',
        'Retail status triggers additional obligations'
      ],
      modelAnswer: 'Under COBS 3.7, you must allow professional clients to request re-categorisation to retail and notify them of this right. Accept their request and update their categorisation in your records. Changes required: (1) Full suitability assessments for any recommendations, (2) Enhanced disclosure requirements, (3) Consumer Duty protections apply in full, (4) Review existing products for retail suitability, (5) Update documentation and client agreement. Consider whether existing holdings remain suitable.'
    }
  ],
  assessmentQuestions: [
    {
      id: 'cc-q1',
      question: 'What is the primary purpose of the COBS 3 client categorisation regime?',
      options: [
        'To simplify firms\' documentation and reduce regulatory burden',
        'To determine the level of regulatory protection and which conduct rules apply to different types of clients',
        'To decide which clients may be charged higher fees',
        'To categorise staff for SMCR purposes'
      ],
      correctAnswer: 1,
      explanation: 'COBS 3 determines whether a client is retail, professional or an eligible counterparty; many other COBS provisions and investor protections hinge on this classification.',
      difficulty: 'beginner'
    },
    {
      id: 'cc-q2',
      question: 'In the absence of evidence that a client meets professional or eligible counterparty criteria, how should a firm treat them?',
      options: [
        'As an eligible counterparty',
        'As an elective professional client',
        'As a retail client',
        'As whichever category is most commercially attractive'
      ],
      correctAnswer: 2,
      explanation: 'Retail is the default and most protective category. If the COBS 3 criteria for professional or ECP status are not clearly met, the client must be treated as retail.',
      difficulty: 'beginner'
    },
    {
      id: 'cc-q3',
      question: 'Which combination best describes the requirements for treating a client as an elective professional client?',
      options: [
        'Client signs any standard terms and conditions',
        'Firm assesses the client\'s expertise/knowledge, the client requests professional status, firm gives written warnings, and client confirms they understand the consequences',
        'Client self-certifies that they are wealthy',
        'Client has been with the firm for more than five years'
      ],
      correctAnswer: 1,
      explanation: 'COBS 3.5 requires an adequate assessment of expertise/experience, a client request, clear written warnings about lost protections and a client confirmation acknowledging the consequences.',
      difficulty: 'intermediate'
    },
    {
      id: 'cc-q4',
      question: 'Which statement about eligible counterparties (ECPs) is most accurate?',
      options: [
        'Any corporate client can be an ECP for all activities',
        'Only natural persons can be ECPs',
        'ECP status is limited to certain types of business (eligible counterparty business) and may only apply to specific services',
        'Once a client is classified as ECP, all other protections automatically cease'
      ],
      correctAnswer: 2,
      explanation: 'COBS 3.6 defines ECPs and makes clear that ECP status relates to eligible counterparty business only; for other services, the client must be treated as professional or retail.',
      difficulty: 'intermediate'
    },
    {
      id: 'cc-q5',
      question: 'What does COBS 3.7 require regarding providing a higher level of protection?',
      options: [
        'Firms must never change a client\'s category once set',
        'Firms must allow a professional client or ECP to request re-categorisation to a category with higher protection and notify them of this right',
        'Firms may only downgrade clients to lower-protection categories',
        'Firms must always treat all clients as retail clients'
      ],
      correctAnswer: 1,
      explanation: 'COBS 3.7 requires firms to allow professional clients and ECPs to request higher protection (e.g. being treated as retail) and to notify them of this right.',
      difficulty: 'intermediate'
    },
    {
      id: 'cc-q6',
      question: 'If a firm incorrectly categorises a client as a professional but the COBS 3.5 criteria are not met, how is that client treated in law?',
      options: [
        'As an elective eligible counterparty',
        'As a professional client because they signed professional terms',
        'As a retail client',
        'As outside the FCA\'s jurisdiction'
      ],
      correctAnswer: 2,
      explanation: 'The FCA\'s 2025 multi-firm review confirms that a client who does not meet COBS 3.5 professional criteria is, in law, a retail client, regardless of the terms of business they have signed.',
      difficulty: 'intermediate'
    },
    {
      id: 'cc-q7',
      question: 'Which example best reflects good practice for client categorisation governance and record-keeping?',
      options: [
        'Relying on unsigned checklists found in email inboxes',
        'Maintaining a clear policy and recording, in a defined document, the assessment against COBS 3 criteria and evidence for each elective professional/ECP decision',
        'Allowing individual bankers to categorise clients informally without documentation',
        'Using a standard form that simply asks "Are you sophisticated? Yes/No"'
      ],
      correctAnswer: 1,
      explanation: 'The FCA explicitly highlights good practice as recording the COBS 3 assessment in a defined document, explaining how the client meets the criteria and the evidence considered.',
      difficulty: 'intermediate'
    },
    {
      id: 'cc-q8',
      question: 'Why is accurate client categorisation critical for suitability and Consumer Duty compliance?',
      options: [
        'Because it determines who signs the engagement letter',
        'Because categorisation determines which suitability/appropriateness rules and Consumer Duty protections apply, so mis-categorisation can create widespread conduct breaches',
        'Because only professional clients can complain to the FOS',
        'Because ECPs are completely outside all FCA rules'
      ],
      correctAnswer: 1,
      explanation: 'Client categorisation determines whether suitability (COBS 9A), appropriateness (COBS 10A) and Consumer Duty protections apply in full or in modified form. If clients are mis-categorised, the firm may systematically fail to meet the correct standards.',
      difficulty: 'advanced'
    }
  ],
  summary: {
    keyTakeaways: [
      'COBS 3 establishes three client categories: Retail (default, most protection), Professional, and Eligible Counterparty (least protection)',
      'Retail is the default category – firms must prove criteria are met for professional or ECP status',
      'Elective professional status requires: adequate assessment, client request, written warnings, and client confirmation',
      'ECP status only applies to specific eligible counterparty business, not all services',
      'Clients have the right to request re-categorisation to a higher protection level',
      'Incorrect categorisation means the client is treated as retail in law, regardless of signed documents',
      'FCA 2025 review highlighted weak evidence, tick-box approaches, and poor governance as common failures',
      'Categorisation drives which COBS rules (suitability, appropriateness, disclosure) and Consumer Duty protections apply'
    ],
    nextSteps: [
      'Review your firm\'s client categorisation policy against COBS 3 requirements',
      'Audit existing elective professional categorisations for adequate evidence',
      'Ensure categorisation decisions are documented with clear reasoning',
      'Implement periodic reviews of client categorisations',
      'Complete the Suitability & Appropriateness module to understand how categorisation affects advice obligations',
      'Train front-office staff on proper categorisation procedures'
    ],
    quickReference: {
      title: 'COBS 3 Client Categorisation Quick Reference',
      items: [
        { term: 'Retail Client', definition: 'Default category; highest regulatory protection; full COBS and Consumer Duty scope' },
        { term: 'Per Se Professional', definition: 'Automatic professional status (regulated entities, large undertakings, governments)' },
        { term: 'Elective Professional', definition: 'Opt-up from retail requiring assessment, request, warning, and confirmation' },
        { term: 'Per Se ECP', definition: 'Automatic ECP status (investment firms, credit institutions, authorised insurers)' },
        { term: 'Elective ECP', definition: 'Per se professionals opted up to ECP for eligible counterparty business only' },
        { term: 'COBS 3.7', definition: 'Right to request higher protection and notification requirement' },
        { term: 'COBS 3.8', definition: 'Requirement for categorisation policies, procedures and records' }
      ]
    }
  },
  visualAssets: {
    diagrams: [
      {
        id: 'protection-hierarchy',
        title: 'Client Protection Hierarchy',
        description: 'Visual showing Retail (most protection) → Professional → ECP (least protection)',
        type: 'hierarchy'
      },
      {
        id: 'elective-professional-process',
        title: 'Elective Professional Categorisation Process',
        description: 'Checklist showing Assessment → Request → Warning → Confirmation',
        type: 'process'
      },
      {
        id: 'categorisation-rules-flow',
        title: 'Categorisation to Applicable Rules',
        description: 'Flowchart showing how category determines suitability, appropriateness, and Consumer Duty scope',
        type: 'flowchart'
      }
    ],
    infographics: [
      {
        id: 'fca-2025-findings',
        title: 'FCA 2025 Review Key Findings',
        description: 'Summary of common categorisation weaknesses found in multi-firm review'
      }
    ]
  }
};
