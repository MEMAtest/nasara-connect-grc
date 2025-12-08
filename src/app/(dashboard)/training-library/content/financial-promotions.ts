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
      duration: 25,
      content: `**What is a Financial Promotion?**

A financial promotion is broadly an *invitation or inducement to engage in investment activity* (or, in other contexts, credit activity, insurance, banking services, etc.).

The definition captures:
- Advertisements (print, digital, TV, radio)
- Marketing emails and SMS
- Website content that promotes products/services
- Social media posts
- Verbal communications in some contexts
- Third-party content where the firm has involvement

**Core Standard: Fair, Clear and Not Misleading**

COBS 4.2.1R sets the fundamental rule:

> "A firm must ensure that a communication or a financial promotion is fair, clear and not misleading."

This applies to **all** communications, not just formal advertisements.

**What "Fair, Clear and Not Misleading" Means:**

**Fair:**
- Balanced presentation of benefits and risks
- Not exploiting customer vulnerabilities or lack of knowledge
- Consistent with what the product actually delivers

**Clear:**
- Easy to understand by the target audience
- Key information is prominent (not buried in small print)
- Jargon-free where possible, or explained
- Legible and accessible format

**Not Misleading:**
- Accurate and not deceptive
- Does not omit material information
- Does not create false impressions (including by emphasis or omission)
- Past performance presented fairly with required warnings

**Who Does COBS 4 Apply To?**

COBS 4 applies to:
- FCA-authorised firms making financial promotions
- Communications about MiFID business, insurance, consumer credit
- Approvals of promotions for unauthorised persons (s21 gateway)

The rules also interact with the Consumer Duty, requiring firms to ensure communications support good customer understanding.`,
      keyConcepts: [
        'Financial promotion = invitation or inducement to engage in investment/regulated activity',
        'COBS 4.2.1R: communications must be fair, clear and not misleading',
        'Applies to all communications, not just formal ads',
        'Fair = balanced benefits/risks, not exploitative',
        'Clear = understandable, prominent key info, accessible',
        'Not misleading = accurate, no material omissions, no false impressions',
        'Interacts with Consumer Duty understanding outcome'
      ],
      realExamples: [
        {
          title: 'Misleading Headline',
          description: 'A firm advertised "Guaranteed 10% Returns!" for a product where capital was at risk. The "guarantee" referred only to a promotional bonus period, buried in terms.',
          outcome: 'FCA intervention; promotion withdrawn and firm required to remediate customers who invested based on misleading claim'
        },
        {
          title: 'Balanced Promotion',
          description: 'A firm\'s investment promotion led with potential returns but gave equal prominence to capital-at-risk warnings, clearly explained fees, and included past performance disclaimers in the same font size.',
          outcome: 'Compliant with COBS 4; supported good customer understanding'
        }
      ]
    },
    {
      id: 'cobs4-requirements-gateway',
      title: 'COBS 4 Requirements & The Financial Promotions Gateway',
      duration: 25,
      content: `**Key COBS 4 Requirements**

**Risk Warnings (COBS 4.5, 4.6, 4.7):**
- Must be **prominent** – not hidden in small print or below the fold
- Must be **proximate** to the claim they relate to
- Specific warnings required for certain products (e.g. "Capital at risk", "Past performance does not guarantee future results")
- For high-risk investments, enhanced warnings are required

**Balance of Benefits and Risks:**
- Benefits and risks should be given **comparable prominence**
- Cannot emphasise returns while minimising/hiding risks
- If a benefit is highlighted, the corresponding risk must also be visible

**Past Performance:**
- Must state that past performance is not a reliable indicator of future results
- Show a representative period (typically 5 years or since inception)
- Include all material costs and charges

**Record-Keeping:**
- Firms must keep records of financial promotions
- Records should show approval process, sign-off, and any amendments
- Retention typically for regulatory purposes (check specific rules)

**The Financial Promotions Gateway (PS23/13)**

From February 2024, the FCA introduced the **s21 financial promotions gateway**:

- Only firms with specific FCA permission can approve financial promotions for **unauthorised persons**
- This addresses past concerns about "rubber-stamping" promotions without proper review
- Approving firms must:
  - Have relevant competence and expertise
  - Conduct due diligence on the unauthorised person
  - Ensure the promotion meets COBS 4 standards
  - Monitor ongoing compliance
  - Report to FCA on approvals made

**Heightened Standards for Approvers:**

- Must ensure promotion is compliant **before** approval
- Cannot rely on self-certification from the unauthorised person
- Must understand the product/service being promoted
- Regular review of approved promotions
- Liability for non-compliant promotions approved

**Withdrawal and Intervention Powers:**

The FCA can:
- Require firms to withdraw non-compliant promotions
- Issue public warnings
- Take enforcement action for serious/repeated breaches`,
      keyConcepts: [
        'Risk warnings must be prominent and proximate to claims',
        'Benefits and risks need comparable prominence',
        'Past performance requires specific disclaimers and representative periods',
        'Keep records of all promotions with approval evidence',
        'S21 gateway: only authorised firms can approve promotions for unauthorised persons',
        'Approvers must conduct due diligence and monitor compliance',
        'FCA can require withdrawal and take enforcement action'
      ],
      realExamples: [
        {
          title: 'Gateway Approval Failure',
          description: 'An authorised firm approved promotions for an unauthorised crypto firm without properly reviewing the claims. The promotions overstated returns and omitted key risks.',
          outcome: 'FCA investigated the approving firm; requirement to withdraw approvals and enhanced supervision'
        },
        {
          title: 'Prominent Risk Warning',
          description: 'A firm\'s email promotion for an ISA product included "Capital at risk" in the same font size and colour as the return headline, immediately adjacent to the return claim.',
          outcome: 'Met COBS 4 prominence requirements; clear to customers that returns were not guaranteed'
        }
      ]
    },
    {
      id: 'high-risk-crypto-social',
      title: 'High-Risk Investments, Cryptoassets & Social Media',
      duration: 20,
      content: `**High-Risk Investments**

The FCA has specific rules for promotions of **high-risk investments** (COBS 4.12A onwards):

Categories include:
- Non-readily realisable securities (e.g. unlisted shares)
- Peer-to-peer agreements
- Speculative illiquid securities
- Non-mainstream pooled investments

**Requirements for high-risk investment promotions:**
- Enhanced risk warnings (prescribed wording)
- Appropriateness assessments before investment
- Personalised risk warnings where applicable
- Marketing restrictions (e.g. no incentives to invest)
- 24-hour cooling-off period for direct offer promotions

**Cryptoasset Promotions**

From October 2023, the FCA brought cryptoasset promotions into the financial promotions regime:

- All crypto promotions to UK consumers must be:
  - Made by an FCA-authorised firm, OR
  - Approved by an authorised firm with gateway permission, OR
  - Made by a cryptoasset business registered under MLR

**Crypto-specific requirements:**
- Clear risk warnings ("Don't invest unless you're prepared to lose all the money you invest")
- No incentives to invest (no refer-a-friend bonuses, no "free crypto")
- Personalised risk warnings
- 24-hour cooling-off period
- Appropriateness assessment

**Social Media & Finfluencers**

Social media promotions are in scope of COBS 4 – the format doesn't change the rules:

**Key issues:**
- Character limits don't excuse omitting risk warnings
- Risk warnings must still be prominent (not just a link to T&Cs)
- Firms are responsible for content they sponsor or procure
- "Finfluencers" (financial influencers) promoting products need authorisation or approval

**FCA Interventions:**

The FCA has:
- Issued warnings to finfluencers about illegal promotions
- Taken down thousands of non-compliant social media promotions
- Made clear that firms cannot outsource compliance to influencers

**Best Practice for Social Media:**
- Pre-approve all sponsored content
- Include required warnings in the post itself (not just linked)
- Monitor what influencers actually post
- Have contracts requiring compliance and right to approve`,
      keyConcepts: [
        'High-risk investments have enhanced warning and appropriateness requirements',
        'Cryptoasset promotions now in scope of COBS 4 with specific requirements',
        'Crypto: no incentives, cooling-off period, prescribed risk warnings',
        'Social media format doesn\'t exempt from COBS 4 requirements',
        'Risk warnings must be in the post, not just linked',
        'Firms responsible for influencer/finfluencer content they procure',
        'FCA actively intervening on non-compliant social media promotions'
      ],
      realExamples: [
        {
          title: 'Crypto Incentive Breach',
          description: 'A crypto platform offered "£50 free Bitcoin" for referrals. This breached the prohibition on incentives for crypto promotions.',
          outcome: 'FCA required removal of incentive scheme; platform had to amend all promotional materials'
        },
        {
          title: 'Finfluencer Warning',
          description: 'A social media influencer promoted a high-risk investment product without proper authorisation. The post had no risk warnings and emphasised "guaranteed returns".',
          outcome: 'FCA issued public warning; influencer faced potential prosecution; firm that engaged the influencer investigated'
        }
      ]
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
