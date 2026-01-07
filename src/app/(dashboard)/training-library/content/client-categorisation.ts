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
      type: 'content',
      duration: 20,
      content: {
        learningPoint: 'COBS 3 determines who is your client and what category they fall into.',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'info',
              title: 'Why This Matters',
              message: 'Many COBS rules (4, 6, 9A, 10A, Consumer Duty scope) depend on client classification. Get it wrong and cascade errors follow.'
            },
            {
              type: 'infogrid',
              title: 'Three Client Categories',
              items: [
                { icon: '👤', label: 'Retail Client', description: 'Default, highest protection' },
                { icon: '💼', label: 'Professional Client', description: 'Per se or elective, lower protection' },
                { icon: '🏦', label: 'Eligible Counterparty', description: 'Highest sophistication, lowest protection' }
              ]
            },
            {
              type: 'keypoint',
              icon: '👤',
              title: 'Retail Client (Default)',
              points: [
                'Default category for all clients',
                'Highest level of regulatory protection',
                'Full COBS and Consumer Duty scope',
                'Most individuals and SMEs'
              ]
            },
            {
              type: 'keypoint',
              icon: '💼',
              title: 'Professional Client',
              points: [
                'Per se (automatic) or elective (opts up)',
                'Lower protection than retail',
                'Some disclosure/suitability modified',
                'Must meet defined criteria'
              ]
            },
            {
              type: 'keypoint',
              icon: '🏦',
              title: 'Eligible Counterparty (ECP)',
              points: [
                'Highest sophistication assumed',
                'Limited to specific ECP business',
                'Per se or elective ECP',
                'Lowest protection level'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Retail', description: 'Most protection (default)' },
                { number: 2, title: 'Professional', description: 'Reduced protection' },
                { number: 3, title: 'ECP', description: 'Least protection' }
              ]
            }
          ]
        },
        keyConcepts: [
          { term: 'COBS 3', definition: 'Determines client category and applicable conduct rules' },
          { term: 'Retail', definition: 'Default category with highest protection' },
          { term: 'Professional', definition: 'Per se or elective, reduced protection' },
          { term: 'ECP', definition: 'Eligible counterparty, lowest protection' }
        ],
        realExamples: [
          'Large investment firm = per se professional automatically',
          'High-net-worth individual = retail by default unless elective process completed'
        ],
        regulatoryRequirements: [
          'COBS 3.2 - Client definition',
          'COBS 3.4 - Default to retail',
          'COBS 3.5 - Professional client criteria'
        ]
      }
    },
    {
      id: 'retail-professional-ecp',
      title: 'Retail vs Professional vs ECP',
      type: 'content',
      duration: 25,
      content: {
        learningPoint: 'Understand when to apply each category and the consequences of incorrect categorisation.',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Retail is the Default',
              message: 'Burden is on the FIRM to prove otherwise. Incorrectly categorised clients are retail in law regardless of paperwork.'
            },
            {
              type: 'checklist',
              title: 'Per Se Professional Clients (COBS 3.5.2R)',
              items: [
                'Regulated entities (investment firms, credit institutions)',
                'Large undertakings meeting size criteria',
                'National/regional governments',
                'Certain public bodies'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Assessment', description: 'Adequate assessment of expertise/knowledge' },
                { number: 2, title: 'Request', description: 'Client formally requests professional status' },
                { number: 3, title: 'Warning', description: 'Clear written warning of lost protections' },
                { number: 4, title: 'Confirmation', description: 'Client confirms awareness of consequences' }
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Beyond Tick-Box',
              message: 'FCA and case law emphasise firms must actually TEST that client meets criteria - not just get forms signed.'
            },
            {
              type: 'keypoint',
              icon: '🏦',
              title: 'Eligible Counterparties',
              points: [
                'Per se: investment firms, credit institutions, insurers',
                'Elective: per se professionals opted up',
                'Only for ECP business types',
                'Other services = professional or retail'
              ]
            },
            {
              type: 'checklist',
              title: 'Re-categorisation Rights (COBS 3.7)',
              items: [
                'Allow request for higher protection',
                'Notify clients of this right',
                'Firm can opt up protection voluntarily'
              ]
            }
          ]
        },
        keyConcepts: [
          { term: 'Per Se', definition: 'Automatic professional status by criteria' },
          { term: 'Elective', definition: 'Opt-up requiring assessment and process' },
          { term: 'Re-categorisation', definition: 'Right to request higher protection' }
        ],
        realExamples: [
          'SME self-certified as professional but FCA found inadequate assessment = retail in law',
          'Professional client lost treasury team and requested retail = full protections apply'
        ],
        regulatoryRequirements: [
          'COBS 3.5.2R - Per se professional criteria',
          'COBS 3.6 - Eligible counterparty rules',
          'COBS 3.7 - Re-categorisation rights'
        ]
      }
    },
    {
      id: 'elective-professional-evidence',
      title: 'Elective Professional Tests and Evidence Packs',
      type: 'content',
      duration: 20,
      content: {
        learningPoint: 'Elective professional categorisation is one of the highest-risk areas for FCA scrutiny. Firms must evidence that a client genuinely meets the COBS 3.5 test.',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'critical',
              title: 'High Risk Area',
              message: 'Elective professional categorisation attracts intense FCA scrutiny. Firms must evidence the client genuinely meets COBS 3.5 tests - a signed form alone is never sufficient.'
            },
            {
              type: 'checklist',
              title: 'Two of Three Criteria Required (COBS 3.5)',
              items: [
                'Transaction Frequency: 10+ significant transactions per quarter over 4 quarters',
                'Portfolio Size: Financial instrument portfolio exceeds €500,000',
                'Professional Experience: 1+ year in financial sector role requiring relevant knowledge'
              ]
            },
            {
              type: 'keypoint',
              icon: '📋',
              title: 'Evidence Standards',
              points: [
                'Documented proof of transaction history or portfolio size',
                'Confirmation of professional experience (role, employer, duties)',
                'Clear file note of how criteria were assessed and met',
                'Written warnings of protections lost and client acknowledgement'
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Common Failures',
              message: 'Reliance on client self-certification alone, missing evidence for transaction frequency/portfolio value, generic disclosures without explicit loss-of-protection warnings, no review of continued eligibility.'
            },
            {
              type: 'infogrid',
              title: 'Evidence Pack Contents',
              items: [
                { icon: '📊', label: 'Transaction Data', description: 'Documented trade history' },
                { icon: '💰', label: 'Portfolio Proof', description: 'Statements showing €500k+' },
                { icon: '👔', label: 'Role Verification', description: 'Employment confirmation' },
                { icon: '⚠️', label: 'Warning Letter', description: 'Explicit lost protections' },
                { icon: '✍️', label: 'Acknowledgement', description: 'Client confirmation' },
                { icon: '📁', label: 'File Note', description: 'Assessment rationale' }
              ]
            }
          ]
        },
        keyConcepts: [
          { term: 'Elective Professional', definition: 'Status requiring evidence, not just consent' },
          { term: 'Two of Three', definition: 'Criteria threshold that must be documented' },
          { term: 'Eligibility Review', definition: 'Ongoing review as circumstances change' }
        ],
        realExamples: [
          'Weak Evidence File: Firm categorised client based on questionnaire alone - FCA required recategorisation to retail',
          'Robust Evidence Pack: Firm documented portfolio statements, transaction history and role verification - withstood FCA review'
        ],
        regulatoryRequirements: [
          'COBS 3.5 - Elective professional client criteria',
          'COBS 3.5.3R - Quantitative criteria for opt-up',
          'COBS 3.5.4R - Assessment and warning requirements'
        ]
      }
    },
    {
      id: 'categorisation-impacts',
      title: 'Impact on Suitability, Disclosure and Duty',
      type: 'content',
      duration: 20,
      content: {
        learningPoint: 'Client categorisation changes the entire compliance perimeter. Mis-categorisation cascades into breaches across multiple COBS requirements.',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Cascade Effect',
              message: 'Categorisation determines which COBS rules apply. Get it wrong and you trigger systematic breaches across suitability, appropriateness, disclosure, and Consumer Duty requirements.'
            },
            {
              type: 'infogrid',
              title: 'Key Regulatory Impacts by Category',
              items: [
                { icon: '📋', label: 'Suitability (COBS 9A)', description: 'Mandatory for retail advice' },
                { icon: '⚖️', label: 'Appropriateness (10A)', description: 'Retail complex products' },
                { icon: '📄', label: 'Disclosure Rules', description: 'Highest for retail' },
                { icon: '🛡️', label: 'Consumer Duty', description: 'Full scope for retail' }
              ]
            },
            {
              type: 'keypoint',
              icon: '⚠️',
              title: 'Why This Matters',
              points: [
                'Wrongly treated as professional = still retail in law',
                'FOS and FCA findings for unsuitable recommendations',
                'Firms may remediate entire cohorts if categorisation flawed',
                'Legal exposure regardless of signed documentation'
              ]
            },
            {
              type: 'checklist',
              title: 'Good Practice Controls',
              items: [
                'Link categorisation data to advice and sales workflows',
                'Use automated checks so retail protections cannot be bypassed',
                'Ensure compliance review for any changes in category',
                'Build categorisation checks into CRM systems'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Category Determines Rules', description: 'Retail = COBS 9A suitability required' },
                { number: 2, title: 'Workflow Integration', description: 'System enforces correct protections' },
                { number: 3, title: 'Audit Trail', description: 'Document compliance at each step' }
              ]
            }
          ]
        },
        keyConcepts: [
          { term: 'Cascade Breach', definition: 'Single categorisation error triggers multiple rule breaches' },
          { term: 'In Law = Retail', definition: 'Mis-categorised clients treated as retail regardless of paperwork' },
          { term: 'Workflow Integration', definition: 'Automated enforcement of category-based protections' }
        ],
        realExamples: [
          'Cascade Failure: Firm classified SMEs as professional, skipped suitability - faced multiple FOS findings and full remediation',
          'Workflow Safeguards: Firm integrated categorisation into CRM - reduced errors and clear audit trail'
        ],
        regulatoryRequirements: [
          'COBS 9A - Suitability (retail clients)',
          'COBS 10A - Appropriateness (non-advised complex products)',
          'Consumer Duty - Full scope for retail clients'
        ]
      }
    },
    {
      id: 'governance-records-fca-review',
      title: 'Governance, Records and FCA Expectations (2025 Review)',
      type: 'content',
      duration: 20,
      content: {
        learningPoint: 'COBS 3.8 requires firms to have policies, procedures and records for client categorisation. The FCA\'s 2025 multi-firm review identified common weaknesses.',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'info',
              title: 'COBS 3.8 Requirements',
              message: 'Firms must maintain policies, procedures and records for client categorisation. This is not optional - it\'s a regulatory requirement subject to FCA review.'
            },
            {
              type: 'checklist',
              title: 'Clear Categorisation Policy Must Include',
              items: [
                'Default categories and how they are assigned',
                'When and how clients may be treated as professional or ECP',
                'Approval levels for elective categorisations',
                'Re-categorisation process and notification requirements'
              ]
            },
            {
              type: 'keypoint',
              icon: '📝',
              title: 'Documented Assessments Required',
              points: [
                'File note showing how client meets COBS 3 tests',
                'Evidence considered (deal history, financial sophistication)',
                'Standard forms acceptable but substance matters',
                'Compliance sign-off on elective categorisations'
              ]
            },
            {
              type: 'alert',
              alertType: 'critical',
              title: 'FCA 2025 Multi-Firm Review Findings',
              message: 'Inadequate evidence for elective professional status, over-reliance on self-certification, misunderstanding that clients can "sign away" rights, weak governance and limited QA/file checking.'
            },
            {
              type: 'stat',
              value: 'Oct 2025',
              label: 'FCA Multi-Firm Review',
              description: 'Corporate finance firms found with weak categorisation controls',
              color: 'red'
            },
            {
              type: 'keypoint',
              icon: '🔄',
              title: 'Periodic Review Requirements',
              points: [
                'Review categorisations as client circumstances change',
                'Monitor for changes in business model or sophistication',
                'Document reasons for maintaining or changing category',
                'FCA planning COBS 3 modernisation but robust evidence still required'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Policy', description: 'Clear categorisation policy with approval levels' },
                { number: 2, title: 'Assessment', description: 'Documented evidence against COBS 3 criteria' },
                { number: 3, title: 'QA Check', description: 'Compliance review and sign-off' },
                { number: 4, title: 'Periodic Review', description: 'Ongoing monitoring of eligibility' }
              ]
            }
          ]
        },
        keyConcepts: [
          { term: 'COBS 3.8', definition: 'Requirement for policies, procedures and records' },
          { term: 'Sign Away Myth', definition: 'Clients cannot waive retail rights if criteria not met' },
          { term: 'Systemic Breach', definition: 'Mis-categorisation cascades to suitability/disclosure failures' }
        ],
        realExamples: [
          'Good Practice: Firm uses defined categorisation memo template with COBS 3.5 analysis, evidence list, and compliance sign-off - withstands regulatory scrutiny',
          'Cascading Breach: Firm mis-categorised multiple clients as professional, skipped suitability - FCA enforcement action for multiple COBS breaches'
        ],
        regulatoryRequirements: [
          'COBS 3.8 - Policies, procedures and records',
          'FCA 2025 Multi-Firm Review expectations',
          'Consumer Duty interaction with categorisation'
        ]
      }
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
