// Module 6: Complaints Handling & DISP – FCA, FOS & Consumer Duty
// Comprehensive training on FCA complaints framework and root cause analysis

import { TrainingModule } from '../types';

export const complaintsHandlingModule: TrainingModule = {
  id: 'complaints-handling',
  title: 'Complaints Handling & DISP – FCA, FOS & Consumer Duty',
  description: 'Master the FCA\'s complaints framework in DISP including the definition of a complaint, eligible complainants, time limits, FOS jurisdiction, and root cause analysis. Learn how complaints feed into Consumer Duty monitoring and Board reporting.',
  category: 'regulatory-compliance',
  duration: 65,
  difficulty: 'intermediate',
  targetPersonas: [
    'senior-manager',
    'compliance-officer',
    'customer-service',
    'operations-staff',
    'certified-person'
  ],
  prerequisiteModules: ['consumer-duty'],
  tags: [
    'DISP',
    'complaints handling',
    'FOS',
    'Financial Ombudsman Service',
    'root cause analysis',
    'RCA',
    'Consumer Duty',
    'vulnerable customers',
    'final response',
    'summary resolution',
    'FCA'
  ],
  learningOutcomes: [
    'Explain the FCA\'s complaints framework in DISP, including the definition of a complaint, eligible complainants and activities in scope',
    'Describe the core internal complaints-handling rules: time limits, acknowledgement, final responses, summary resolution communications and record-keeping',
    'Outline the role and jurisdiction of the Financial Ombudsman Service (FOS), including escalation and the impact of FOS decisions',
    'Apply the FCA\'s expectations for root cause analysis, learning from complaints and the Consumer Duty-driven good/poor practice findings',
    'Recognise how complaints MI feeds into Consumer Duty monitoring, including outcomes for vulnerable customers',
    'Design a complaint handling and RCA framework that is defendable before the FCA and FOS'
  ],
  hook: {
    type: 'case-study',
    content: 'A customer has been misdirected around your firm for weeks. They\'ve called three times, received conflicting information, and finally emailed a long, angry summary. Internally, teams argue about whether this is just "feedback" or a formal complaint – and nothing is logged on the complaints system. DISP requires firms to have effective, clear and accessible complaints-handling procedures, dealing with complaints fairly, consistently and promptly. Under the Consumer Duty, complaints and RCA are core evidence of whether customers receive good outcomes.',
    question: 'In your firm, how confident are you that every expression of dissatisfaction that meets the DISP definition is being captured, handled properly and fed into root cause analysis – and not just the easy ones?'
  },
  lessons: [
    {
      id: 'disp-framework',
      title: 'DISP Framework – Definitions, Scope & FOS',
      type: 'content',
      duration: 20,
      content: {
        learningPoint: 'DISP in the FCA Handbook defines what constitutes a complaint, who can complain, and the role of the Financial Ombudsman Service (FOS).',
        mainContent: {
          cards: [
            {
              type: 'infogrid',
              title: 'DISP Structure',
              items: [
                { icon: '⚖️', label: 'DISP 1', description: 'Treating complainants fairly' },
                { icon: '🏛️', label: 'DISP 2', description: 'FOS jurisdiction' },
                { icon: '📋', label: 'DISP 3', description: 'FOS complaints procedures' }
              ]
            },
            {
              type: 'alert',
              alertType: 'critical',
              title: 'DISP Complaint Definition',
              message: 'Any expression of dissatisfaction, whether oral or written, and whether justified or not, about a regulated financial service. Firms CANNOT relabel complaints as "feedback" to avoid DISP.'
            },
            {
              type: 'checklist',
              title: 'Eligible Complainants',
              items: [
                'Consumers (individuals acting outside trade/business)',
                'Micro-enterprises and small businesses',
                'Charities and trusts below specified thresholds',
                'Default: most retail end-customers qualify'
              ]
            },
            {
              type: 'keypoint',
              icon: '🏛️',
              title: 'Role of the FOS',
              points: [
                'FCA-regulated firms must belong to FOS compulsory jurisdiction',
                'Must signpost customers to FOS in final response',
                'FOS decisions binding on firm if accepted by complainant',
                'Influences redress and future RCA'
              ]
            },
            {
              type: 'infogrid',
              title: 'Complaint vs Not a Complaint',
              items: [
                { icon: '✅', label: 'IS Complaint', description: 'Dissatisfaction expressed' },
                { icon: '❌', label: 'NOT Complaint', description: 'Routine service request' },
                { icon: '👥', label: 'Third-Party', description: 'Log, verify authority' }
              ]
            }
          ]
        },
        keyConcepts: [
          { term: 'DISP', definition: 'FCA rules for complaints handling and FOS jurisdiction' },
          { term: 'Eligible Complainant', definition: 'Consumers, micro-enterprises, small businesses, charities' },
          { term: 'FOS', definition: 'Financial Ombudsman Service - decisions binding on firms' }
        ],
        realExamples: [
          'Mislabelled Feedback: Customer said "I\'m really unhappy" - firm logged as feedback - FCA found it was a complaint under DISP',
          'FOS Escalation: Firm failed to resolve in 8 weeks, customer escalated to FOS - FOS awarded higher compensation, firm bound by decision'
        ],
        regulatoryRequirements: [
          'DISP 1 - Internal complaints handling',
          'DISP 2 - FOS jurisdiction',
          'FOS compulsory membership for FCA firms'
        ]
      }
    },
    {
      id: 'internal-complaints-handling',
      title: 'Internal Complaints Handling – Process, Timelines & Duty Overlay',
      type: 'content',
      duration: 25,
      content: {
        learningPoint: 'DISP 1.3 requires effective and transparent complaints procedures with specific timelines for acknowledgement, resolution, and final responses.',
        mainContent: {
          cards: [
            {
              type: 'checklist',
              title: 'DISP 1.3 Core Requirements',
              items: [
                'Procedures easy to find and use (website, T&Cs)',
                'Staff trained to identify and escalate complaints',
                'Handle fairly, consistently and promptly',
                'Complaints can be made free of charge'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Day 1-3', description: 'SRC available if resolved within 3 business days' },
                { number: 2, title: 'By 8 Weeks', description: 'Final response OR holding letter with FOS signpost' },
                { number: 3, title: 'FOS Referral', description: 'Customer has 6 months to escalate to FOS' }
              ]
            },
            {
              type: 'keypoint',
              icon: '📄',
              title: 'Final Response Must Include',
              points: [
                'Summary of the complaint',
                'Investigation outcome and any redress offer',
                'FOS referral rights (6 months)',
                'FOS leaflet or signposting text'
              ]
            },
            {
              type: 'keypoint',
              icon: '⚡',
              title: 'Summary Resolution Communication (SRC)',
              points: [
                'Available if resolved within 3 business days',
                'Confirm outcome and any redress',
                'Explain right to reopen or refer to FOS',
                'Provide contact details and reference'
              ]
            },
            {
              type: 'alert',
              alertType: 'info',
              title: 'Record-Keeping & Reporting',
              message: 'Keep complaints records (numbers, causes, outcomes, redress). From 2025, FCA requires six-monthly returns with vulnerable customer breakdown.'
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Consumer Duty Link',
              message: 'Complaints are core evidence for Consumer Duty outcomes. Integrate into annual Consumer Duty Board reports - not a separate silo.'
            }
          ]
        },
        keyConcepts: [
          { term: 'SRC', definition: 'Summary Resolution Communication - available if resolved in 3 days' },
          { term: '8-Week Rule', definition: 'Final response or holding letter with FOS signpost' },
          { term: 'Consumer Duty Link', definition: 'Complaints evidence customer outcomes' }
        ],
        realExamples: [
          'Effective SRC: Firm resolved billing complaint in 2 days with proper SRC - compliant and efficient',
          'Missed Deadline: Complex complaint drifted past 8 weeks with no holding letter - DISP breach, FOS complaint about handling'
        ],
        regulatoryRequirements: [
          'DISP 1.3 - Complaints handling procedures',
          'DISP 1.6 - Time limits for responses',
          'Consumer Duty - Outcomes monitoring'
        ]
      }
    },
    {
      id: 'intake-triage-ownership',
      title: 'Complaint Intake, Triage and Ownership',
      type: 'content',
      duration: 18,
      content: {
        learningPoint: 'The first failure point in most complaints frameworks is intake - issues not logged or misclassified. Proper intake is a control, not an admin task.',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Intake is the Critical Control',
              message: 'Most complaints framework failures occur at intake. Issues are not logged or misclassified as "feedback". Frontline must recognise complaints regardless of channel or wording.'
            },
            {
              type: 'checklist',
              title: 'Intake Expectations',
              items: [
                'Recognise complaints across all channels (phone, email, social, in-person)',
                'Log even if customer doesn\'t use the word "complaint"',
                'Clear ownership and escalation routes from day one',
                'Acknowledge promptly with reference number'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Receive', description: 'Identify dissatisfaction across any channel' },
                { number: 2, title: 'Log', description: 'Record immediately with customer narrative' },
                { number: 3, title: 'Triage', description: 'PSD vs non-PSD, vulnerability flags' },
                { number: 4, title: 'Assign', description: 'Named owner for investigation' }
              ]
            },
            {
              type: 'keypoint',
              icon: '📋',
              title: 'Triage and Classification',
              points: [
                'PSD vs non-PSD determines time limits',
                'Flag vulnerable customers early for support adjustments',
                'Only separate "service requests" if DISP clearly not met',
                'Record category, product, channel, severity for MI'
              ]
            },
            {
              type: 'keypoint',
              icon: '📁',
              title: 'Documentation Requirements',
              points: [
                'Capture customer narrative in their own words',
                'Record timestamps and immediate actions',
                'Audit trails for handoffs between teams',
                'Use handoff controls to prevent bouncing'
              ]
            }
          ]
        },
        keyConcepts: [
          { term: 'Intake Control', definition: 'Critical point where complaints are captured or missed' },
          { term: 'Triage', definition: 'Determines time limits and escalation path' },
          { term: 'Named Owner', definition: 'Single point of accountability for case' }
        ],
        realExamples: [
          'Misclassified Feedback: Handler tagged complaint as "feedback" because customer was polite - DISP breach after FOS escalation',
          'Early Triage Success: PSD complaint identified day one, routed to correct SLA track - resolved within timelines'
        ],
        regulatoryRequirements: [
          'DISP 1.3 - Recognition and logging',
          'DISP 1.6 - Applicable time limits',
          'Consumer Duty - Vulnerable customer support'
        ]
      }
    },
    {
      id: 'time-limits-fos-redress',
      title: 'Time Limits, FOS Escalation and Redress',
      type: 'content',
      duration: 18,
      content: {
        learningPoint: 'Complaints handling timelines vary by product type. Failure to apply the correct timeline is one of the most common DISP breaches.',
        mainContent: {
          cards: [
            {
              type: 'infogrid',
              title: 'Key Time Limits',
              items: [
                { icon: '⚡', label: 'SRC', description: '3 business days' },
                { icon: '💳', label: 'PSD Complaints', description: '15 days (35 exceptional)' },
                { icon: '📋', label: 'Non-PSD', description: '8 weeks maximum' }
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'PSD Exceptional Circumstances',
              message: 'Extension to 35 days only valid where firm can demonstrate factors outside its control. Customer must be informed of reason and expected date. Evidence retained for audit.'
            },
            {
              type: 'keypoint',
              icon: '🏛️',
              title: 'FOS Escalation Rules',
              points: [
                'Signpost FOS in final response or when time limits exceeded',
                'Customer has 6 months to refer to FOS',
                'FOS decisions binding if accepted by complainant',
                'Include FOS leaflet or signposting text'
              ]
            },
            {
              type: 'checklist',
              title: 'Redress Principles',
              items: [
                'Put customer back in position they would have been in',
                'Consider compensation for distress/inconvenience',
                'Document rationale for redress decisions',
                'Link to systemic fixes where appropriate'
              ]
            },
            {
              type: 'stat',
              value: '15 Days',
              label: 'PSD Complaints',
              description: 'Payment Services Directive timeline',
              color: 'amber'
            }
          ]
        },
        keyConcepts: [
          { term: 'SRC', definition: '3 business day resolution with summary communication' },
          { term: 'PSD Timeline', definition: '15 days, extendable to 35 in exceptional circumstances' },
          { term: 'Redress', definition: 'Fair compensation to restore customer position' }
        ],
        realExamples: [
          'PSD Timeline Miss: Payment complaint treated as 8-week case, breached 15-day rule - FCA criticism and remediation',
          'Clear FOS Signpost: Final response with clear FOS referral rights - reduced disputes and clear audit trail'
        ],
        regulatoryRequirements: [
          'DISP 1.6 - Time limits',
          'PSR 2017 - PSD complaint timelines',
          'DISP 1.6.8 - FOS signposting'
        ]
      }
    },
    {
      id: 'rca-vulnerability-governance',
      title: 'Root Cause Analysis, Vulnerability & Continuous Improvement',
      type: 'content',
      duration: 20,
      content: {
        learningPoint: 'Firms must go beyond fixing individual complaints to identify and address systemic root causes, with specific focus on vulnerable customer outcomes.',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'info',
              title: 'RCA: Beyond Individual Fixes',
              message: 'The FCA expects firms to treat complaints as "gold-dust MI". Identify systemic issues in products, processes, communications or third-party arrangements - not just fix symptoms.'
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Identify', description: 'Root causes from complaint patterns' },
                { number: 2, title: 'Analyse', description: 'Trends by channel, product, journey stage' },
                { number: 3, title: 'Fix', description: 'Processes, comms, training, product design' },
                { number: 4, title: 'Remediate', description: 'Proactively reach other affected customers' }
              ]
            },
            {
              type: 'infogrid',
              title: 'RCA Taxonomy',
              items: [
                { icon: '⚙️', label: 'Process', description: 'Handoffs, delays, missing checks' },
                { icon: '📝', label: 'Communication', description: 'Unclear letters, scripts' },
                { icon: '📦', label: 'Product Design', description: 'Value, eligibility, complexity' },
                { icon: '🤝', label: 'Third-Party', description: 'Outsourced service errors' },
                { icon: '⚠️', label: 'Conduct', description: 'Mis-selling, unsuitable outcomes' }
              ]
            },
            {
              type: 'keypoint',
              icon: '👤',
              title: 'Vulnerable Customer Focus',
              points: [
                'Track vulnerable customer complaints explicitly',
                'Ensure accessible complaints processes',
                'Avoid repeated "re-telling of trauma"',
                'Compare outcomes: vulnerable vs non-vulnerable'
              ]
            },
            {
              type: 'checklist',
              title: 'MI Pack Essentials',
              items: [
                'Volumes and timeliness (by product and channel)',
                'FOS escalation rate and uphold rate',
                'Vulnerable customer outcomes vs non-vulnerable',
                'Top root causes and remediation status',
                'Repeat complaint hotspots and trend commentary'
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Governance Requirements',
              message: 'Complaints MI must feed operational management, risk/compliance, and Board/Consumer Duty reports. Clear ownership of RCA actions with regular challenge at Risk/Conduct/Board committees.'
            }
          ]
        },
        keyConcepts: [
          { term: 'RCA', definition: 'Root Cause Analysis - systemic issues, not individual fixes' },
          { term: 'Proactive Remediation', definition: 'Reach customers affected but not complained' },
          { term: 'Vulnerable Tracking', definition: 'FCA requires granular data on vulnerable complainants' }
        ],
        realExamples: [
          'Effective RCA: Cluster of complaints about confusing letters - updated wording, retrained staff, proactive outreach - complaints dropped 70%',
          'Vulnerable Tracking: Analysis showed 30% longer resolution for vulnerable customers - process changes improved to match average'
        ],
        regulatoryRequirements: [
          'DISP 1.3 - Learning from complaints',
          'Consumer Duty - Vulnerable customer outcomes',
          'FCA thematic work on complaints RCA'
        ]
      }
    }
  ],
  practiceScenarios: [
    {
      id: 'feedback-or-complaint',
      title: 'Feedback or Complaint?',
      description: 'A customer emails: "I\'m really unhappy about how long your process takes and the fact no one called me back. I\'m not sure I want to stay with you." The email is sent to a general inbox and forwarded several times internally. No one logs it as a complaint.',
      difficulty: 'beginner',
      questions: [
        'Does this meet the DISP definition of a complaint?',
        'What should happen under your process?',
        'How would this show up (or not) in your complaints MI and Duty Board report?'
      ],
      hints: [
        'DISP definition: any expression of dissatisfaction, oral or written',
        'The customer doesn\'t need to use the word "complaint"',
        'Consider what happens if this isn\'t logged'
      ],
      modelAnswer: 'Yes, this meets the DISP definition – it is an expression of dissatisfaction (unhappy about process time and lack of callback) from what appears to be an eligible complainant. Under proper process: (1) First person to receive should recognise as complaint and log it, (2) Acknowledge within required timeframe, (3) Investigate and respond within 8 weeks. If not logged: It won\'t appear in complaints MI, giving a false picture of customer experience; it won\'t feed RCA; and the firm loses the opportunity to fix the issue and retain the customer. This gap would be a concern in Consumer Duty monitoring.'
    },
    {
      id: 'nine-weeks-no-resolution',
      title: '9 Weeks and No Resolution',
      description: 'A complex complaint involving several products drifts past 8 weeks. The customer has had two holding emails, but no substantive update. FOS becomes involved.',
      difficulty: 'intermediate',
      questions: [
        'What should have been done under DISP time limits?',
        'How does this reflect on Consumer Duty outcomes?',
        'What RCA actions might be triggered?'
      ],
      hints: [
        'At 8 weeks, a formal holding letter with FOS signposting is required',
        'Consumer Duty: consumer support outcome',
        'Consider process, resource, and escalation issues'
      ],
      modelAnswer: 'Under DISP: By 8 weeks, if not resolved, a holding letter must be sent explaining why resolution isn\'t yet possible and informing the customer of their right to refer to FOS – informal emails don\'t meet this requirement. Consumer Duty impact: Poor consumer support outcome; customer left in limbo without clear information; shows process failure. RCA actions: (1) Why did this case drift – resource issues, complexity, lack of escalation? (2) Are there other cases in similar positions? (3) Review escalation triggers and management oversight, (4) Consider whether holding letter templates and monitoring are adequate.'
    },
    {
      id: 'repeated-similar-complaints',
      title: 'Repeated Similar Complaints',
      description: 'Over six months, your firm receives a cluster of complaints about the same digital journey step (e.g. misleading wording in a key screen). Each complaint is resolved individually with small redress, but the wording has not been changed.',
      difficulty: 'advanced',
      questions: [
        'What does good RCA look like here?',
        'What might the FCA expect to see in MI and Board reports?',
        'How could this scenario intersect with Consumer Duty and financial promotions rules?'
      ],
      hints: [
        'Fixing individual complaints vs fixing the root cause',
        'Proactive remediation for unaffected customers',
        'Consumer understanding outcome; COBS 4 fair, clear, not misleading'
      ],
      modelAnswer: 'Good RCA: (1) Identify the pattern early through trend analysis, (2) Escalate as systemic issue requiring journey/wording fix, (3) Fix the root cause (update the screen), (4) Consider proactive remediation for customers who saw the misleading wording but haven\'t complained. MI/Board reports should show: Trend identified, root cause action taken, time to fix, remediation scope, confirmation wording now compliant. Consumer Duty intersection: This is a consumer understanding outcome failure – communications weren\'t clear. Could also breach COBS 4 (fair, clear, not misleading) if the screen is a financial promotion. Board should see this as a conduct risk requiring action, not just individual complaint cost.'
    }
  ],
  assessmentQuestions: [
    {
      id: 'ch-q1',
      question: 'Which statement best reflects the FCA\'s DISP definition of a complaint?',
      options: [
        'Only written complaints that use the word "complaint"',
        'Any expression of dissatisfaction, whether oral or written, and whether justified or not, from an eligible complainant about a regulated activity',
        'Only complaints that relate to financial loss',
        'Only complaints escalated to the CEO'
      ],
      correctAnswer: 1,
      explanation: 'DISP defines a complaint broadly as any expression of dissatisfaction, whether oral or written, and whether justified or not, from an eligible complainant about a regulated activity or ancillary matter.',
      difficulty: 'beginner'
    },
    {
      id: 'ch-q2',
      question: 'Which of the following is most likely to be an eligible complainant under DISP?',
      options: [
        'A consumer using a regulated product in their personal capacity',
        'A large listed multinational group acting in its treasury function',
        'A supplier to the firm',
        'An unconnected third party who saw an advert but has no relationship with the firm'
      ],
      correctAnswer: 0,
      explanation: 'Eligible complainants typically include consumers and certain small businesses, charities and trusts. A retail consumer using a regulated product in a personal capacity is almost always an eligible complainant.',
      difficulty: 'beginner'
    },
    {
      id: 'ch-q3',
      question: 'Under DISP, what is the standard maximum time a firm has to issue a final response before the customer can automatically refer to FOS?',
      options: [
        '5 business days',
        '15 business days',
        '8 weeks',
        '6 months'
      ],
      correctAnswer: 2,
      explanation: 'The general rule is that firms must send a final response within 8 weeks or a holding letter informing the customer of their right to refer to FOS. Shorter limits may apply in some sectors.',
      difficulty: 'intermediate'
    },
    {
      id: 'ch-q4',
      question: 'When can a firm issue a Summary Resolution Communication (SRC) instead of a full final response?',
      options: [
        'Only after 8 weeks',
        'When a complaint cannot be resolved',
        'When a complaint is resolved to the complainant\'s satisfaction by the close of the third business day after receipt',
        'Only for complaints about financial promotions'
      ],
      correctAnswer: 2,
      explanation: 'DISP allows firms to issue an SRC where a complaint is resolved to the customer\'s satisfaction by the end of the third business day following receipt, instead of a full final response.',
      difficulty: 'intermediate'
    },
    {
      id: 'ch-q5',
      question: 'Which best describes the FCA\'s expectations for root cause analysis (RCA) of complaints?',
      options: [
        'RCA is optional and only needed after enforcement action',
        'Firms should use complaints to identify and address underlying issues, and where appropriate, remediate other customers who may have been affected',
        'RCA should focus solely on whether the customer is right or wrong',
        'RCA is only required for complaints upheld by FOS'
      ],
      correctAnswer: 1,
      explanation: 'The FCA\'s thematic work on complaints and Consumer Duty guidance emphasise that firms should conduct root cause analysis of complaints, fix systemic issues and consider remediating other potentially affected customers.',
      difficulty: 'intermediate'
    },
    {
      id: 'ch-q6',
      question: 'How do complaints most directly link to the Consumer Duty?',
      options: [
        'The Duty removes the need for DISP',
        'Complaints are irrelevant to assessing customer outcomes',
        'Complaints provide key evidence on customer outcomes and support the consumer support and consumer understanding outcomes',
        'Complaints only matter for pricing decisions'
      ],
      correctAnswer: 2,
      explanation: 'The FCA\'s Consumer Duty materials stress that complaints and RCA are central evidence of whether customers achieve good outcomes, particularly for consumer support and consumer understanding outcomes and in Board Duty reports.',
      difficulty: 'intermediate'
    },
    {
      id: 'ch-q7',
      question: 'What must a final response letter include under DISP?',
      options: [
        'Only an apology',
        'A summary of the complaint, the investigation outcome, any offer of redress, and information about referring to FOS within six months',
        'Only the amount of compensation offered',
        'Only the customer\'s original complaint text'
      ],
      correctAnswer: 1,
      explanation: 'Final responses must summarise the complaint, set out the investigation outcome and any redress offer, and explain the customer\'s right to refer to FOS within six months, including FOS signposting.',
      difficulty: 'intermediate'
    },
    {
      id: 'ch-q8',
      question: 'Why is tracking complaints from vulnerable customers important under the Consumer Duty?',
      options: [
        'It is not required',
        'Only to meet FCA reporting requirements',
        'To identify whether vulnerable customers receive worse outcomes and to ensure complaints processes are accessible',
        'Only to reduce the number of complaints'
      ],
      correctAnswer: 2,
      explanation: 'Under Consumer Duty and the FCA\'s new reporting requirements, firms should track vulnerable customer complaints to identify outcome disparities, ensure accessible processes, and demonstrate fair treatment in RCA and Board reporting.',
      difficulty: 'advanced'
    }
  ],
  summary: {
    keyTakeaways: [
      'A complaint is any expression of dissatisfaction, oral or written, justified or not – don\'t relabel as "feedback"',
      'Eligible complainants include consumers, micro-enterprises, small businesses, and certain charities/trusts',
      'Summary Resolution Communication (SRC) available if resolved within 3 business days',
      '8 weeks maximum for final response, or holding letter with FOS signposting',
      'Final response must summarise complaint, outcome, redress, and FOS referral rights (6 months)',
      'FOS decisions are binding on firms if accepted by the complainant',
      'Root cause analysis should identify systemic issues and trigger proactive remediation',
      'Track vulnerable customer complaints explicitly to identify outcome disparities',
      'Complaints MI feeds Consumer Duty monitoring and Board reports',
      'Link complaints to wider conduct metrics for holistic oversight'
    ],
    nextSteps: [
      'Review your firm\'s complaint identification training – are all staff recognising complaints?',
      'Audit complaints processes against DISP timeframes',
      'Check final response templates include all required elements',
      'Evaluate RCA processes – are systemic issues being identified and fixed?',
      'Implement vulnerable customer tracking in complaints MI',
      'Ensure complaints data feeds into Consumer Duty Board reports',
      'Complete the Consumer Duty module to understand the broader framework'
    ],
    quickReference: {
      title: 'DISP Complaints Handling Quick Reference',
      items: [
        { term: 'Complaint Definition', definition: 'Any expression of dissatisfaction, oral or written, justified or not, from eligible complainant' },
        { term: 'Eligible Complainant', definition: 'Consumers, micro-enterprises, small businesses, certain charities/trusts' },
        { term: 'SRC (Summary Resolution)', definition: 'Simplified response available if resolved within 3 business days to customer satisfaction' },
        { term: '8-Week Rule', definition: 'Maximum time for final response or holding letter with FOS signposting' },
        { term: 'Final Response', definition: 'Must include: summary, outcome, redress offer, FOS referral rights (6 months)' },
        { term: 'FOS', definition: 'Financial Ombudsman Service – decisions binding on firms if accepted' },
        { term: 'Root Cause Analysis', definition: 'Identify systemic issues, fix root causes, remediate other affected customers' }
      ]
    }
  },
  visualAssets: {
    diagrams: [
      {
        id: 'complaints-timeline',
        title: 'DISP Complaints Timeline',
        description: 'Visual showing Day 1 → 3 days (SRC option) → 8 weeks (Final response/holding letter) → FOS referral',
        type: 'process'
      },
      {
        id: 'rca-cycle',
        title: 'Root Cause Analysis Cycle',
        description: 'Circular diagram: Identify complaint → Analyse trends → Identify root cause → Fix issue → Remediate → Monitor',
        type: 'process'
      },
      {
        id: 'complaints-governance',
        title: 'Complaints Governance Framework',
        description: 'Hierarchy showing complaints data flowing to: Operations, Risk/Compliance, Board/Consumer Duty reports',
        type: 'hierarchy'
      }
    ],
    infographics: [
      {
        id: 'final-response-checklist',
        title: 'Final Response Letter Checklist',
        description: 'Checklist of required elements in a DISP-compliant final response'
      },
      {
        id: 'complaint-vs-feedback',
        title: 'Complaint vs Feedback Decision Tree',
        description: 'Visual aid for staff to identify what constitutes a complaint under DISP'
      }
    ]
  }
};
