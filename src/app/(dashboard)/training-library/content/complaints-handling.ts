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
      duration: 20,
      content: `**DISP – What It Covers**

DISP in the FCA Handbook sets the rules for:

1. **Treating complainants fairly** (DISP 1)
2. **Jurisdiction of the Financial Ombudsman Service** (DISP 2)
3. **Complaints handling procedures of the FOS** (DISP 3)

This module focuses on DISP 1 (internal complaints handling) and the key interfaces with FOS and the Consumer Duty.

**What is a Complaint?**

DISP defines a complaint broadly as *any expression of dissatisfaction, whether oral or written, and whether justified or not*, about the firm's provision of (or failure to provide) a regulated financial service, which:

- Is made by or on behalf of an **eligible complainant**, and
- Relates to activities in scope (regulated activities, certain ancillary activities or the sale of financial products)

Firms must not "relabel" qualifying complaints as mere "feedback" to avoid DISP obligations.

**Who is an Eligible Complainant?**

Eligible complainants include (depending on sector):

- Consumers (individuals acting outside trade/business)
- Certain micro-enterprises and small businesses
- Charities and trusts below specified thresholds

The default assumption for retail-facing business is that most end-customers are eligible complainants.

**Role and Jurisdiction of the FOS**

All FCA-regulated firms must:

- Belong to the **Financial Ombudsman Service** compulsory jurisdiction for relevant activities
- Signpost customers to FOS in their **final response** and in certain holding letters

FOS can:

- Consider complaints unresolved within the statutory timescale (usually 8 weeks) or earlier where the firm has issued its final response
- Make determinations that, if accepted by the complainant, are **binding on the firm** up to the applicable monetary limit

FOS outcomes influence both direct redress and future root cause analysis and policy changes.

**Complaint vs Service Request**
- A request for information or a routine service action is not a complaint unless dissatisfaction is expressed
- If the customer expresses dissatisfaction about delay, quality, or impact, log it as a complaint

**Third-Party Complaints**
- Complaints can be raised by representatives or family members
- Verify authority, but do not delay logging or triage

**Jurisdiction Boundaries**
- FOS jurisdiction depends on activity and complainant status
- If unsure, log the complaint and assess jurisdiction as part of triage`,
      keyConcepts: [
        'DISP defines complaint broadly: any expression of dissatisfaction, oral or written, justified or not',
        'Eligible complainants include consumers, micro-enterprises, small businesses, charities',
        'Cannot relabel complaints as "feedback" to avoid DISP obligations',
        'FOS membership is compulsory for FCA-regulated firms',
        'FOS decisions are binding on firms if accepted by complainant',
        'Must signpost FOS in final response letters'
      ],
      realExamples: [
        {
          title: 'Mislabelled Feedback',
          description: 'A customer sent an email saying "I\'m really unhappy about how you handled my claim". The firm logged it as "feedback" rather than a complaint because the customer didn\'t use the word "complaint".',
          outcome: 'FCA found this was a complaint under DISP definition – expression of dissatisfaction about service provision'
        },
        {
          title: 'FOS Escalation',
          description: 'A firm failed to resolve a complaint within 8 weeks. The customer escalated to FOS, which found in their favour and awarded compensation above what the firm had offered.',
          outcome: 'Firm was bound by the FOS decision and had to pay the higher award'
        }
      ]
    },
    {
      id: 'internal-complaints-handling',
      title: 'Internal Complaints Handling – Process, Timelines & Duty Overlay',
      duration: 25,
      content: `**Core DISP 1.3 Rules – Procedures and Fair Treatment**

DISP 1.3 requires firms to establish, implement and maintain effective and transparent procedures for the reasonable and prompt handling of complaints, ensuring that a complaint can be made free of charge.

Key expectations:

- Procedures are **easy to find and use** (website, T&Cs, contact channels)
- Staff know how to **identify** and **escalate** complaints
- Complaints are handled **fairly, consistently and promptly**, with appropriate redress where due

Firms must also publish a summary of their in-house complaints procedures and reference this in writing at or immediately after point of sale/first contact, and when acknowledging a complaint.

**Timescales, Acknowledgements and Final Responses**

Headline DISP timeframes (firms must always check specific rules for their sector/product):

**By end of 3 business days** (for many retail complaints):
- If the firm can resolve the complaint within 3 business days, it may send a **Summary Resolution Communication (SRC)** instead of a full final response

**By 8 weeks** (standard rule):
- Either issue a **final response**; or
- A holding letter explaining why it is not yet in a position to do so, and informing the customer of their right to refer to FOS

**Final responses must:**
- Summarise the complaint
- Set out the firm's investigation outcome and any offer of redress
- Explain that the customer can refer to FOS within **six months**, enclosing the FOS leaflet or relevant signposting text

**Summary Resolution Communication (SRC) essentials**
- Confirm the outcome and any redress provided
- Explain the customer's right to reopen or refer to FOS if dissatisfied
- Provide clear contact details and reference number

**Acknowledgement and Case Control**
- Acknowledge promptly with a complaint reference and expected timelines
- Keep a clear audit trail of all contacts, evidence, and decisions

**Record-Keeping and Reporting**

DISP requires firms to:

- Keep **complaints records**, including numbers, causes, outcomes and redress
- Report complaints data to the FCA at set intervals

From 2025 onwards, the FCA is consolidating complaints reporting into a single, six-monthly return with:

- Standardised reporting periods
- Complaints breakdown by legal entity
- New metrics, including complaints involving **vulnerable customers**

**Complaints and the Consumer Duty**

The FCA's Consumer Duty outputs emphasise that:

- Complaints are a **core source of evidence** on customer outcomes, especially for the consumer support and consumer understanding outcomes
- Firms should integrate complaints and RCA into their **annual Consumer Duty Board reports**, not treat them as a separate silo
- The FCA is now explicitly publishing good and poor practice examples around complaints and RCA`,
      keyConcepts: [
        'Complaints procedures must be effective, transparent and free of charge',
        'Summary Resolution Communication (SRC) available if resolved within 3 business days',
        '8 weeks maximum to final response or holding letter with FOS signposting',
        'Final response must summarise complaint, outcome, and FOS referral rights',
        'Record-keeping: numbers, causes, outcomes, redress',
        'New FCA reporting includes vulnerable customer breakdown',
        'Complaints are core evidence for Consumer Duty monitoring'
      ],
      realExamples: [
        {
          title: 'Effective SRC Process',
          description: 'A firm resolved a straightforward billing complaint within 2 days, sending a Summary Resolution Communication that acknowledged the issue, confirmed the refund, and noted the customer\'s right to reopen if not satisfied.',
          outcome: 'Compliant with DISP; efficient resolution documented properly'
        },
        {
          title: 'Missed 8-Week Deadline',
          description: 'A complex complaint drifted past 8 weeks with only informal email updates. No holding letter was sent, and FOS was not signposted.',
          outcome: 'DISP breach; customer complained to FOS about both the original issue and the poor complaint handling'
        }
      ]
    },
    {
      id: 'intake-triage-ownership',
      title: 'Complaint Intake, Triage and Ownership',
      duration: 18,
      content: `A complaint is any expression of dissatisfaction about a regulated activity. The first failure point in most complaints frameworks is intake: the issue is not logged or is misclassified.

**Intake Expectations**
- Frontline teams must recognise complaints across all channels (phone, email, social, in-person)
- Complaints must be logged even if the customer does not use the word "complaint"
- Ownership and escalation routes must be clear from day one

**Triage and Classification**
- Identify whether the complaint relates to PSD or non-PSD activities
- Flag vulnerable customers early and apply support adjustments
- Separate "service requests" from complaints only if DISP definition is clearly not met

**Ownership and Case Management**
- Assign a named owner responsible for investigation and deadlines
- Record complaint category, product, channel, and severity for MI
- Use handoff controls so complaints do not bounce between teams

**Documentation**
- Capture the customer narrative in their own words
- Record timestamps and any immediate actions
- Ensure audit trails for handoffs between teams`,
      keyConcepts: [
        'Complaint definition is broad and channel-agnostic',
        'Intake is a control, not an admin task',
        'Triage determines applicable time limits and escalation',
        'Early vulnerability flags improve outcomes'
      ],
      realExamples: [
        {
          title: 'Misclassified Feedback',
          description: 'A call handler tagged a complaint as "feedback" because the customer was polite.',
          outcome: 'DISP breach after the issue escalated to FOS'
        },
        {
          title: 'Early Triage Success',
          description: 'A PSD-related complaint was identified on day one and routed to the correct SLA track.',
          outcome: 'Resolved within regulatory timelines'
        }
      ]
    },
    {
      id: 'time-limits-fos-redress',
      title: 'Time Limits, FOS Escalation and Redress',
      duration: 18,
      content: `Complaints handling timelines vary depending on product type and rules. Failure to apply the right timeline is one of the most common DISP breaches.

**Key Time Limits**
- **Summary Resolution (SRC):** resolve within 3 business days with a summary resolution communication
- **PSD complaints:** 15 business days, extendable to 35 in exceptional circumstances
- **Non-PSD complaints:** 8-week maximum for final response or holding letter

**Exceptional Circumstances (PSD)**
- Only valid where the firm can demonstrate factors outside its control
- The customer must be informed of the reason and expected response date
- Evidence should be retained for audit and regulatory review

**FOS Escalation**
- Customers must be signposted to the FOS in the final response or when time limits are exceeded
- FOS decisions are binding if accepted by the complainant

**Redress and Remedies**
- Redress should put the customer back in the position they would have been in
- Consider compensation for distress/inconvenience where appropriate
- Document rationale for redress decisions and any systemic fixes`,
      keyConcepts: [
        'Correct time limits are critical (SRC, PSD 15/35 days, non-PSD 8 weeks)',
        'FOS signposting is mandatory in final responses',
        'Redress must be fair, consistent, and documented',
        'Exceptional circumstances for PSD extensions must be evidenced'
      ],
      realExamples: [
        {
          title: 'PSD Timeline Miss',
          description: 'A payment complaint was treated as an 8-week case and breached the 15-day rule.',
          outcome: 'FCA criticism and remediation for process failure'
        },
        {
          title: 'Clear FOS Signpost',
          description: 'A firm issued a final response with clear FOS referral rights and timeline.',
          outcome: 'Reduced escalation disputes and clearer audit trail'
        }
      ]
    },
    {
      id: 'rca-vulnerability-governance',
      title: 'Root Cause Analysis, Vulnerability & Continuous Improvement',
      duration: 20,
      content: `**Root Cause Analysis (RCA)**

DISP and the FCA's thematic work expect firms to go beyond "fixing the individual complaint" and to:

- **Identify root causes** of complaints, including systemic issues in products, processes, communications or third-party arrangements
- **Analyse trends** (e.g. spikes by channel, product, or stage of the journey)
- **Fix the root cause**, not just the symptom, including:
  - Amending processes or journeys
  - Updating scripts and comms
  - Re-training staff
- Where appropriate, **proactively remediate** other customers who may have suffered similar harm but have not complained

The FCA's complaints/RCA good practice examples highlight mature firms that treat complaints as "gold-dust MI", with cross-functional action plans and Board-level oversight.

**Vulnerable Customers and Complaints**

As part of the vulnerable customer agenda and Consumer Duty, firms should:

- Track complaints involving **vulnerable customers** explicitly
- Ensure complaints processes are accessible (multiple channels, adapted communications)
- Avoid repeated "re-telling of trauma" where possible
- Use vulnerability data in RCA to see whether vulnerable customers receive **worse outcomes** and address this

The FCA's new reporting reforms require more granular data on vulnerable complainants, signalling increased supervisory focus.

**Governance, MI and Board Reports**

Firms should build a complaints MI suite that feeds:

- **Operational management** (workloads, timeliness, backlogs)
- **Risk and compliance** (root causes, emerging risks)
- **Board and Consumer Duty reports** (outcome metrics, remediation progress)

Good practice:

- Clear **ownership** of RCA actions
- Regular challenge at **Risk / Conduct / Board** committees
- Linking complaints MI with other metrics (e.g. lapse rates, arrears, vulnerability flags, product changes)

**RCA Taxonomy Example**
- Process failure (handoffs, delays, missing checks)
- Communication failure (unclear letters, misleading scripts)
- Product design issue (value, eligibility, complexity)
- Third-party failure (outsourced service, vendor errors)
- Conduct issue (mis-selling, poor advice, unsuitable outcomes)

**MI Pack Essentials**
- Volumes and timeliness (by product and channel)
- FOS escalation rate and uphold rate
- Vulnerable customer outcomes vs non-vulnerable
- Top root causes and remediation status
- Repeat complaint hotspots and trend commentary`,
      keyConcepts: [
        'RCA identifies systemic issues, not just individual complaint fixes',
        'Analyse trends by channel, product, journey stage',
        'Fix root causes: processes, comms, training',
        'Proactively remediate other affected customers',
        'Track vulnerable customer complaints explicitly',
        'Ensure accessible complaints processes',
        'Complaints MI feeds operational, risk, and Board reporting',
        'Link complaints to wider conduct metrics'
      ],
      realExamples: [
        {
          title: 'Effective RCA',
          description: 'A firm noticed a cluster of complaints about confusing renewal letters. RCA identified unclear wording. The firm updated the letter, re-trained staff, and proactively contacted customers who received the old version.',
          outcome: 'Root cause fixed; complaints in that area dropped 70% over 6 months'
        },
        {
          title: 'Vulnerable Customer Tracking',
          description: 'A firm implemented vulnerability flags in their complaints system. Analysis showed vulnerable customers waited 30% longer for resolution. This triggered process changes and additional training.',
          outcome: 'Resolution times for vulnerable customers improved to match overall average'
        }
      ]
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
