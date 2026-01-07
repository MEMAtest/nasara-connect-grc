// Module 7: Financial Promotions & Communications – COBS 4 & Consumer Duty
// Comprehensive training on FCA financial promotions requirements

import { TrainingModule } from '../types';

export const financialPromotionsModule: TrainingModule = {
  id: 'financial-promotions',
  title: 'Financial Promotions & Communications – COBS 4 & Consumer Duty',
  description: 'Master the FCA\'s financial promotions framework including the "fair, clear and not misleading" standard, COBS 4 requirements, the financial promotions gateway, high-risk investments, cryptoassets, and social media/finfluencer rules.',
  category: 'regulatory-compliance',
  duration: 70,
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
    'COBS 4',
    'financial promotions',
    'fair clear not misleading',
    'risk warnings',
    'high-risk investments',
    'cryptoassets',
    'finfluencers',
    'social media',
    'gateway',
    'Consumer Duty',
    'FCA'
  ],
  learningOutcomes: [
    'Define a financial promotion and explain the core COBS 4 standard that all communications must be "fair, clear and not misleading"',
    'Explain the key financial promotions requirements including prominence of risk warnings, balance of benefits/risks, and record-keeping',
    'Describe the financial promotions gateway for firms approving promotions for unauthorised persons and heightened approver standards',
    'Recognise specific rules for high-risk investments, cryptoasset promotions, and social media/finfluencer activity',
    'Apply a robust sign-off, monitoring and record-keeping process for promotions across all channels',
    'Use complaints, MI and outcome testing to refine financial promotions under the Consumer Duty'
  ],
  hook: {
    type: 'case-study',
    content: 'Your firm launches a new online campaign for an investment product. The headline says: "Secure your future – up to 8% returns!" Risk warnings are below the fold on mobile and the ad is reposted by a popular "finfluencer" on Instagram without approval. Within weeks, the FCA contacts you about potentially misleading promotions. COBS 4 requires all communications to be fair, clear and not misleading, across all media. The FCA has stepped up interventions, removing thousands of misleading promotions each year.',
    question: 'If the FCA reviewed your promotions today – across website, emails, social channels and introducers – what evidence could you show that they are compliant, genuinely understood and delivering good outcomes?'
  },
  lessons: [
    {
      id: 'definitions-scope-standards',
      title: 'Definitions, Scope & Core Standards (COBS 4)',
      type: 'content',
      duration: 25,
      content: {
        learningPoint: 'A financial promotion is any invitation or inducement to engage in investment activity. COBS 4.2.1R requires all communications to be fair, clear and not misleading.',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'critical',
              title: 'COBS 4.2.1R - The Core Standard',
              message: '"A firm must ensure that a communication or a financial promotion is fair, clear and not misleading." This applies to ALL communications, not just formal advertisements.'
            },
            {
              type: 'infogrid',
              title: 'What is a Financial Promotion?',
              items: [
                { icon: '📺', label: 'Advertisements', description: 'Print, digital, TV, radio' },
                { icon: '📧', label: 'Marketing', description: 'Emails, SMS, website' },
                { icon: '📱', label: 'Social Media', description: 'Posts, sponsored content' },
                { icon: '🤝', label: 'Third-Party', description: 'Where firm has involvement' }
              ]
            },
            {
              type: 'keypoint',
              icon: '⚖️',
              title: 'FAIR',
              points: [
                'Balanced presentation of benefits AND risks',
                'Not exploiting customer vulnerabilities',
                'Consistent with what product actually delivers'
              ]
            },
            {
              type: 'keypoint',
              icon: '👁️',
              title: 'CLEAR',
              points: [
                'Easy to understand by target audience',
                'Key information is prominent (not small print)',
                'Jargon-free or explained',
                'Legible and accessible format'
              ]
            },
            {
              type: 'keypoint',
              icon: '✅',
              title: 'NOT MISLEADING',
              points: [
                'Accurate and not deceptive',
                'No material omissions',
                'No false impressions by emphasis or omission',
                'Past performance with required warnings'
              ]
            },
            {
              type: 'alert',
              alertType: 'info',
              title: 'Consumer Duty Link',
              message: 'Fair, clear and not misleading aligns with Consumer Duty understanding outcome. If testing shows customers misunderstand, the promotion is not clear - even if legal text is present.'
            }
          ]
        },
        keyConcepts: [
          { term: 'Financial Promotion', definition: 'Invitation or inducement to engage in regulated activity' },
          { term: 'COBS 4.2.1R', definition: 'Core standard - fair, clear and not misleading' },
          { term: 'Channel Consistency', definition: 'Compliant across all platforms' }
        ],
        realExamples: [
          'Misleading Headline: "Guaranteed 10% Returns!" for capital-at-risk product - FCA intervention, promotion withdrawn, customer remediation',
          'Balanced Promotion: Returns with equal prominence to capital-at-risk warnings, clear fees, same font size disclaimers - compliant'
        ],
        regulatoryRequirements: [
          'COBS 4.2.1R - Fair, clear, not misleading',
          'COBS 4.5-4.7 - Specific product requirements',
          'Consumer Duty - Understanding outcome'
        ]
      }
    },
    {
      id: 'cobs4-requirements-gateway',
      title: 'COBS 4 Requirements & The Financial Promotions Gateway',
      type: 'content',
      duration: 25,
      content: {
        learningPoint: 'COBS 4 requires prominent risk warnings, balanced benefits/risks presentation, and the s21 gateway regulates who can approve promotions for unauthorised persons.',
        mainContent: {
          cards: [
            {
              type: 'checklist',
              title: 'Risk Warning Requirements (COBS 4.5-4.7)',
              items: [
                'PROMINENT - not hidden in small print or below the fold',
                'PROXIMATE - adjacent to the claim they relate to',
                'Specific warnings for products (e.g. "Capital at risk")',
                'Enhanced warnings for high-risk investments'
              ]
            },
            {
              type: 'keypoint',
              icon: '⚖️',
              title: 'Balance of Benefits and Risks',
              points: [
                'Benefits and risks must have comparable prominence',
                'Cannot emphasise returns while minimising risks',
                'If benefit highlighted, corresponding risk must be visible'
              ]
            },
            {
              type: 'infogrid',
              title: 'Prominence in Practice',
              items: [
                { icon: '🔤', label: 'Same Font', description: 'Warnings = key claims size' },
                { icon: '📱', label: 'Mobile', description: 'Visible without scrolling' },
                { icon: '👁️', label: 'Contrast', description: 'Not visually minimized' }
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'S21 Financial Promotions Gateway (Feb 2024)',
              message: 'Only firms with specific FCA permission can approve promotions for unauthorised persons. No more "rubber-stamping" - substantive review required.'
            },
            {
              type: 'checklist',
              title: 'Gateway Approver Obligations',
              items: [
                'Have relevant competence and expertise',
                'Conduct due diligence on unauthorised person',
                'Ensure promotion meets COBS 4 standards',
                'Monitor ongoing compliance',
                'Report to FCA on approvals made'
              ]
            },
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Cannot Rely on Self-Certification',
              message: 'Approving firms must conduct their own substantive review. Cannot rely on the unauthorised person saying "it\'s compliant". Liable for non-compliant promotions approved.'
            }
          ]
        },
        keyConcepts: [
          { term: 'Prominence', definition: 'Risk warnings clearly visible, comparably emphasised' },
          { term: 'S21 Gateway', definition: 'FCA permission to approve promotions for unauthorised persons' },
          { term: 'Due Diligence', definition: 'Substantive review, not rubber-stamping' }
        ],
        realExamples: [
          'Gateway Failure: Firm approved crypto promotions without reviewing claims - FCA investigated, enhanced supervision',
          'Prominent Warning: Email with "Capital at risk" same font size as return headline - met COBS 4 requirements'
        ],
        regulatoryRequirements: [
          'COBS 4.5-4.7 - Risk warnings',
          'PS23/13 - Financial promotions gateway',
          'FCA withdrawal and intervention powers'
        ]
      }
    },
    {
      id: 'approval-workflow',
      title: 'Approval Workflow, Sign-Off and Record Keeping',
      type: 'content',
      duration: 20,
      content: {
        learningPoint: 'A compliant promotion results from a disciplined approval workflow. The FCA expects firms to evidence review, challenge, and accountability for every promotion.',
        mainContent: {
          cards: [
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Marketing Brief', description: 'Claim substantiation pack' },
                { number: 2, title: 'Product Review', description: 'Accuracy and target market fit' },
                { number: 3, title: 'Compliance Review', description: 'COBS 4 and Consumer Duty check' },
                { number: 4, title: 'Final Sign-Off', description: 'Approver sign-off and publish log' }
              ]
            },
            {
              type: 'checklist',
              title: 'What to Check Before Approval',
              items: [
                'Balance of benefits and risks',
                'Prominence and proximity of warnings',
                'Clarity for the target audience',
                'Alignment to product scope and target market'
              ]
            },
            {
              type: 'keypoint',
              icon: '📋',
              title: 'Claim Substantiation',
              points: [
                'Every material claim needs evidence attached',
                'Data source, date, and owner documented',
                'If claim cannot be substantiated, remove or rewrite'
              ]
            },
            {
              type: 'keypoint',
              icon: '📁',
              title: 'Record Keeping Requirements',
              points: [
                'Keep final approved version and review evidence',
                'Retain supporting analysis and audience testing',
                'Audit trail showing who approved and when',
                'Version control throughout review process'
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Third-Party Promotions',
              message: 'Approvals for unauthorised persons require enhanced due diligence. Ensure introducers and affiliates do not alter approved content without permission.'
            }
          ]
        },
        keyConcepts: [
          { term: 'Approval Workflow', definition: 'Documented, role-based sign-off process' },
          { term: 'Claim Substantiation', definition: 'Evidence pack for material claims' },
          { term: 'Audit Trail', definition: 'Record of who approved what, when' }
        ],
        realExamples: [
          'Missing Approval: Promotion live on social media with no compliance review - FCA required withdrawal and process remediation',
          'Controlled Workflow: Firm used standard checklist and stored approvals with assets - met regulatory expectations'
        ],
        regulatoryRequirements: [
          'COBS 4.11 - Record keeping',
          'SYSC - Governance and controls',
          'Consumer Duty - Outcomes accountability'
        ]
      }
    },
    {
      id: 'monitoring-testing',
      title: 'Monitoring, Testing and Remediation',
      type: 'content',
      duration: 20,
      content: {
        learningPoint: 'Approval is not the end of compliance. Promotions must be monitored for ongoing accuracy, customer understanding, and distribution integrity.',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'info',
              title: 'Approval is Not the End',
              message: 'Promotions must be monitored for drift, outdated claims, and customer understanding. Third-party and affiliate usage needs ongoing oversight.'
            },
            {
              type: 'infogrid',
              title: 'Monitoring Cadence',
              items: [
                { icon: '⚠️', label: 'High-Risk', description: 'Review weekly' },
                { icon: '📋', label: 'Low-Risk', description: 'Review monthly' },
                { icon: '🚨', label: 'Trigger Events', description: 'Immediate review' }
              ]
            },
            {
              type: 'keypoint',
              icon: '🔍',
              title: 'Customer Understanding Testing',
              points: [
                'Run comprehension testing on key messages and risks',
                'Track complaint themes and drop-offs',
                'Monitor mis-selling indicators',
                'Review call transcripts and chat logs for misunderstanding'
              ]
            },
            {
              type: 'checklist',
              title: 'Evidence Signals to Track',
              items: [
                'Call transcripts showing customer misunderstanding',
                'Click-through and abandonment rates at key decision points',
                'Complaint themes related to promotions',
                'Third-party content drift from approved version'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Identify Issue', description: 'Misleading or unclear promotion' },
                { number: 2, title: 'Withdraw/Amend', description: 'Remove or fix immediately' },
                { number: 3, title: 'Document', description: 'Record fixes and rationale' },
                { number: 4, title: 'Re-Test', description: 'Verify improved outcomes' }
              ]
            }
          ]
        },
        keyConcepts: [
          { term: 'Ongoing Monitoring', definition: 'Regular review of live promotions' },
          { term: 'Comprehension Testing', definition: 'Evidence customers understand key messages' },
          { term: 'Remediation', definition: 'Documented fixes with systemic improvements' }
        ],
        realExamples: [
          'Influencer Drift: Influencer altered approved wording and removed risk warnings - promotion withdrawn, affiliate controls tightened',
          'Outcome Testing: Comprehension testing showed customers misread fees - content redesign improved understanding'
        ],
        regulatoryRequirements: [
          'COBS 4 - Ongoing compliance',
          'Consumer Duty - Understanding outcome',
          'SYSC - Monitoring and control'
        ]
      }
    },
    {
      id: 'high-risk-crypto-social',
      title: 'High-Risk Investments, Cryptoassets & Social Media',
      type: 'content',
      duration: 20,
      content: {
        learningPoint: 'High-risk investments, cryptoassets, and social media promotions have specific enhanced requirements including prescribed warnings, appropriateness tests, and cooling-off periods.',
        mainContent: {
          cards: [
            {
              type: 'infogrid',
              title: 'High-Risk Investment Categories',
              items: [
                { icon: '📊', label: 'NRRS', description: 'Non-readily realisable securities' },
                { icon: '🤝', label: 'P2P', description: 'Peer-to-peer agreements' },
                { icon: '💎', label: 'Speculative', description: 'Illiquid securities' },
                { icon: '📦', label: 'Non-Mainstream', description: 'Pooled investments' }
              ]
            },
            {
              type: 'checklist',
              title: 'High-Risk Investment Requirements',
              items: [
                'Enhanced risk warnings (prescribed wording)',
                'Appropriateness assessments before investment',
                'Personalised risk warnings where applicable',
                'No incentives to invest',
                '24-hour cooling-off period for direct offers'
              ]
            },
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Cryptoasset Promotions (Oct 2023)',
              message: 'All crypto promotions to UK consumers must be: made by FCA-authorised firm, approved by authorised firm with gateway permission, or made by MLR-registered crypto business.'
            },
            {
              type: 'keypoint',
              icon: '₿',
              title: 'Crypto-Specific Requirements',
              points: [
                '"Don\'t invest unless prepared to lose all the money"',
                'NO incentives (no refer-a-friend, no "free crypto")',
                'Personalised risk warnings',
                '24-hour cooling-off period',
                'Appropriateness assessment'
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Social Media & Finfluencers',
              message: 'Character limits don\'t excuse omitting risk warnings. Risk warnings must appear in the post itself (not just linked). Firms are responsible for content they sponsor - cannot outsource compliance to influencers.'
            },
            {
              type: 'checklist',
              title: 'Best Practice for Social Media',
              items: [
                'Pre-approve all sponsored content',
                'Include required warnings IN the post',
                'Monitor what influencers actually post',
                'Have contracts requiring compliance and right to approve',
                'Enforce takedown SLAs for non-compliant content'
              ]
            }
          ]
        },
        keyConcepts: [
          { term: 'High-Risk', definition: 'Enhanced warnings, appropriateness, cooling-off' },
          { term: 'Crypto Promotions', definition: 'In scope of COBS 4 from Oct 2023' },
          { term: 'Finfluencer', definition: 'Firm responsible for sponsored content compliance' }
        ],
        realExamples: [
          'Crypto Incentive Breach: Platform offered "£50 free Bitcoin" for referrals - FCA required removal, all promotional materials amended',
          'Finfluencer Warning: Influencer promoted high-risk product with "guaranteed returns", no warnings - FCA public warning, investigation'
        ],
        regulatoryRequirements: [
          'COBS 4.12A - High-risk investments',
          'PS22/10 - Cryptoasset promotions',
          'FCA guidance on finfluencers'
        ]
      }
    }
  ],
  practiceScenarios: [
    {
      id: 'mobile-ad-risk-warnings',
      title: 'Mobile Ad Risk Warnings',
      description: 'Your firm runs a mobile display ad for an investment product. The headline "Grow your wealth – up to 6% annual returns" is visible, but the "Capital at risk" warning only appears if the user scrolls down.',
      difficulty: 'beginner',
      questions: [
        'Does this meet COBS 4 requirements for risk warning prominence?',
        'How would you redesign this ad to be compliant?',
        'What might happen if a customer complained to FOS about investing based on this ad?'
      ],
      hints: [
        'Risk warnings must be prominent and proximate',
        'Mobile format doesn\'t reduce requirements',
        'Balance of benefits and risks'
      ],
      modelAnswer: 'This likely fails COBS 4 prominence requirements – "below the fold" risk warnings are not prominent, especially on mobile where users may not scroll. Compliant redesign: (1) Include "Capital at risk" in the same visual area as the return claim, (2) Use comparable font size and colour, (3) Ensure the warning is visible without scrolling. FOS complaint: Customer could argue they invested based on prominent return claims without understanding risk. FOS might find the promotion was misleading and award compensation, especially if customer suffered losses they didn\'t understand were possible.'
    },
    {
      id: 'influencer-campaign',
      title: 'Influencer Marketing Campaign',
      description: 'Your marketing team wants to engage a popular finance YouTuber to promote your new investment app. They suggest the YouTuber creates their own content with a discount code.',
      difficulty: 'intermediate',
      questions: [
        'What regulatory considerations apply?',
        'What controls should you put in place?',
        'Who is responsible if the content is non-compliant?'
      ],
      hints: [
        'Firm procuring the promotion is responsible',
        'Content needs pre-approval',
        'Required warnings must appear in the content'
      ],
      modelAnswer: 'Regulatory considerations: (1) The content is a financial promotion – COBS 4 applies in full, (2) Your firm is responsible for content you procure/sponsor, (3) Influencer needs to be acting under your approval or be authorised themselves. Controls: (1) Pre-approve all content before posting (script and final edit), (2) Ensure required risk warnings appear in the video itself (not just description), (3) No misleading claims about returns or guarantees, (4) Contract requiring compliance and right to approve/remove, (5) Ongoing monitoring of what\'s actually posted. Responsibility: Your firm is responsible even if the influencer deviates from approved content – you need monitoring and enforcement mechanisms.'
    },
    {
      id: 'gateway-approval-request',
      title: 'Gateway Approval Request',
      description: 'Your firm has s21 gateway permission. An unauthorised fintech asks you to approve their promotional website for a new investment product. They provide self-certification that the content is compliant.',
      difficulty: 'advanced',
      questions: [
        'Can you rely on their self-certification?',
        'What due diligence should you conduct?',
        'What ongoing obligations do you have?'
      ],
      hints: [
        'Gateway rules require substantive review',
        'Cannot "rubber-stamp" approvals',
        'Ongoing monitoring requirements'
      ],
      modelAnswer: 'Self-certification is not sufficient – the gateway rules explicitly require approving firms to conduct their own substantive review. Due diligence: (1) Review all promotional content line-by-line against COBS 4, (2) Understand the product being promoted – is it accurately described? (3) Verify claims made (returns, features, charges), (4) Ensure risk warnings are compliant and prominent, (5) Assess the unauthorised firm (are they legitimate? any concerns?), (6) Document your review and approval rationale. Ongoing obligations: (1) Regular review of approved content (especially if website changes), (2) Monitor for complaints or customer harm, (3) Report to FCA on approvals made, (4) Be prepared to withdraw approval if content becomes non-compliant.'
    }
  ],
  assessmentQuestions: [
    {
      id: 'fp-q1',
      question: 'What is the core COBS 4 standard for financial promotions?',
      options: [
        'Promotions must be approved by a lawyer',
        'Communications must be fair, clear and not misleading',
        'Promotions must guarantee returns',
        'Promotions only apply to print media'
      ],
      correctAnswer: 1,
      explanation: 'COBS 4.2.1R establishes that all communications and financial promotions must be "fair, clear and not misleading" – this is the fundamental standard against which all promotions are assessed.',
      difficulty: 'beginner'
    },
    {
      id: 'fp-q2',
      question: 'What does "prominence" mean for risk warnings in financial promotions?',
      options: [
        'Risk warnings can be in the terms and conditions only',
        'Risk warnings must be clearly visible and given comparable emphasis to benefit claims',
        'Risk warnings are optional for sophisticated investors',
        'Risk warnings only need to appear once on a website'
      ],
      correctAnswer: 1,
      explanation: 'Prominence requires that risk warnings are clearly visible, proximate to the claims they relate to, and given comparable emphasis to benefit claims – not hidden in small print or below the fold.',
      difficulty: 'intermediate'
    },
    {
      id: 'fp-q3',
      question: 'Under the financial promotions gateway (s21), what can approving firms NOT do?',
      options: [
        'Conduct due diligence on the unauthorised person',
        'Review the content of the promotion',
        'Simply rely on self-certification from the unauthorised person that the promotion is compliant',
        'Withdraw approval if content becomes non-compliant'
      ],
      correctAnswer: 2,
      explanation: 'Gateway rules require approving firms to conduct substantive review themselves – they cannot simply "rubber-stamp" promotions based on self-certification from the unauthorised person.',
      difficulty: 'intermediate'
    },
    {
      id: 'fp-q4',
      question: 'Which statement about cryptoasset promotions is correct?',
      options: [
        'Cryptoasset promotions are exempt from FCA rules',
        'Crypto promotions can offer referral bonuses and free crypto incentives',
        'Crypto promotions must include prescribed risk warnings, cannot offer incentives, and require appropriateness assessments',
        'Only authorised firms can promote crypto – no gateway approval is available'
      ],
      correctAnswer: 2,
      explanation: 'Since October 2023, cryptoasset promotions require prescribed risk warnings, cannot include incentives to invest, and need appropriateness assessments. Gateway approval is available for registered crypto businesses.',
      difficulty: 'intermediate'
    },
    {
      id: 'fp-q5',
      question: 'What is the firm\'s responsibility for influencer/finfluencer marketing content?',
      options: [
        'No responsibility – influencers are independent',
        'Responsibility only if the firm explicitly approves the content',
        'The firm is responsible for financial promotions it procures or sponsors, regardless of who creates the content',
        'Only the influencer is liable for non-compliant content'
      ],
      correctAnswer: 2,
      explanation: 'Firms are responsible for financial promotions they procure, sponsor or cause to be made, even if created by third-party influencers. The firm cannot outsource its compliance obligations.',
      difficulty: 'intermediate'
    },
    {
      id: 'fp-q6',
      question: 'Does the character limit on social media posts reduce COBS 4 requirements?',
      options: [
        'Yes – shorter posts have reduced requirements',
        'No – the format does not change the rules; risk warnings must still appear in the post itself',
        'Yes – social media is exempt from COBS 4',
        'No requirements apply to organic (unpaid) social media posts'
      ],
      correctAnswer: 1,
      explanation: 'Social media format does not reduce COBS 4 requirements. Risk warnings must appear in the post itself (not just linked), and character limits do not excuse non-compliance.',
      difficulty: 'intermediate'
    },
    {
      id: 'fp-q7',
      question: 'What records must firms keep for financial promotions?',
      options: [
        'No records are required',
        'Only records of promotions that receive complaints',
        'Records of promotions including the approval process, sign-off, and any amendments',
        'Only final published versions'
      ],
      correctAnswer: 2,
      explanation: 'Firms must keep records of financial promotions including the approval process, who signed off, and any amendments made. This supports regulatory examination and demonstrates compliance.',
      difficulty: 'intermediate'
    },
    {
      id: 'fp-q8',
      question: 'How do financial promotions requirements interact with Consumer Duty?',
      options: [
        'Consumer Duty replaces COBS 4 entirely',
        'They are completely separate regimes with no interaction',
        'Consumer Duty adds requirements for communications to support good customer understanding and fair outcomes',
        'Consumer Duty only applies to complaints about promotions'
      ],
      correctAnswer: 2,
      explanation: 'Consumer Duty adds to COBS 4 requirements – firms must ensure communications support good customer understanding (an outcome under the Duty) and contribute to fair outcomes overall.',
      difficulty: 'advanced'
    }
  ],
  summary: {
    keyTakeaways: [
      'Financial promotion = invitation or inducement to engage in regulated activity – applies to all media',
      'Core standard: communications must be fair, clear and not misleading (COBS 4.2.1R)',
      'Risk warnings must be prominent and proximate – not hidden in small print or below the fold',
      'Benefits and risks need comparable prominence – cannot emphasise returns while hiding risks',
      'S21 gateway: only authorised firms can approve promotions for unauthorised persons – substantive review required',
      'Cryptoasset promotions: prescribed warnings, no incentives, cooling-off period, appropriateness assessment',
      'Social media format doesn\'t reduce requirements – risk warnings must appear in the post',
      'Firms responsible for influencer content they procure – cannot outsource compliance',
      'Keep records of all promotions with approval evidence',
      'Consumer Duty adds requirement for communications to support understanding and fair outcomes'
    ],
    nextSteps: [
      'Audit current promotions across all channels (web, email, social, third parties)',
      'Review risk warning prominence – are they visible without scrolling?',
      'Check influencer/introducer arrangements – are you approving content?',
      'Ensure gateway approvals (if applicable) involve substantive review',
      'Implement record-keeping for all promotional content',
      'Train marketing and sales teams on COBS 4 requirements',
      'Use complaints and MI to identify promotions causing customer confusion',
      'Complete the Consumer Duty module to understand the broader framework'
    ],
    quickReference: {
      title: 'COBS 4 Financial Promotions Quick Reference',
      items: [
        { term: 'Financial Promotion', definition: 'Invitation or inducement to engage in investment/regulated activity' },
        { term: 'Fair, Clear, Not Misleading', definition: 'Core standard for all communications (COBS 4.2.1R)' },
        { term: 'Prominence', definition: 'Risk warnings must be clearly visible and comparably emphasised to benefits' },
        { term: 'S21 Gateway', definition: 'FCA permission required to approve promotions for unauthorised persons' },
        { term: 'High-Risk Investments', definition: 'Enhanced warnings, appropriateness tests, cooling-off periods' },
        { term: 'Crypto Promotions', definition: 'Prescribed warnings, no incentives, 24-hour cooling-off' },
        { term: 'Finfluencer', definition: 'Financial influencer – firm responsible for sponsored content' }
      ]
    }
  },
  visualAssets: {
    diagrams: [
      {
        id: 'promotion-approval-process',
        title: 'Financial Promotion Approval Process',
        description: 'Flowchart: Draft → Compliance review → COBS 4 check → Sign-off → Publish → Monitor',
        type: 'process'
      },
      {
        id: 'gateway-decision-tree',
        title: 'S21 Gateway Decision Tree',
        description: 'Decision tree for whether gateway approval is needed and how to conduct it',
        type: 'flowchart'
      },
      {
        id: 'prominence-examples',
        title: 'Risk Warning Prominence Examples',
        description: 'Visual comparison of compliant vs non-compliant risk warning placement',
        type: 'comparison'
      }
    ],
    infographics: [
      {
        id: 'social-media-checklist',
        title: 'Social Media Promotion Checklist',
        description: 'Checklist for ensuring social media posts meet COBS 4 requirements'
      },
      {
        id: 'crypto-requirements',
        title: 'Cryptoasset Promotion Requirements',
        description: 'Summary of specific requirements for crypto promotions'
      }
    ]
  }
};
