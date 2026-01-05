import { TrainingModule } from '../types';

export const consumerDutyModule: TrainingModule = {
  id: 'consumer-duty',
  title: 'Consumer Duty – Core Responsibilities for UK Regulated Firms',
  description: 'Master the FCA Consumer Duty framework including Principle 12, cross-cutting rules, and the four outcomes. Learn to deliver and evidence good customer outcomes across products, pricing, communications, and support.',
  category: 'customer-protection',
  duration: 60,
  difficulty: 'intermediate',
  targetPersonas: ['senior-manager', 'compliance-officer', 'relationship-manager', 'customer-service', 'certified-person'],
  prerequisiteModules: [],
  tags: ['consumer-duty', 'principle-12', 'PRIN-2A', 'fair-value', 'customer-outcomes', 'vulnerable-customers', 'FCA'],
  learningOutcomes: [
    'Describe the Consumer Duty structure: Principle 12, PRIN 2A, the cross-cutting rules and the four outcomes',
    'Explain how the Duty applies across the entire product life-cycle and distribution chain',
    'Apply the cross-cutting rules when designing, selling and servicing products',
    'Identify potential harm points and assess price & value using fair-value thinking',
    'Recognise how the Duty interacts with FCA guidance on vulnerable customers',
    'Outline governance and MI expectations including board oversight and outcome-focused reporting'
  ],

  // Hook Section
  hook: {
    type: 'real_case_study',
    title: 'The Hidden Cost Crisis',
    content: `A firm markets a "no-fee" investment product and a "fee-free" payment solution. In practice, complex charging structures and poor support mean customers consistently pay more than they reasonably expected – and struggle to exit.

The firm has policies, but little evidence on customer outcomes. When the FCA comes knocking, they ask one simple question:

"Can you evidence that your customers are achieving good outcomes?"

The firm cannot answer. The policies exist on paper, but the outcomes data tells a different story. Customers are being harmed through opaque pricing, poor communications, and friction-heavy support processes.

This is exactly what the Consumer Duty is designed to prevent. It shifts the focus from process compliance to outcome delivery – and firms must be able to prove it.`,
    keyQuestion: 'If the FCA asked your firm tomorrow to evidence good outcomes, what 3 pieces of management information would you present first?'
  },

  // Main Content Sections
  lessons: [
    {
      id: 'structure-of-duty',
      title: 'Structure of the Consumer Duty',
      type: 'content',
      duration: 12,
      content: {
        learningPoint: 'Understand the building blocks of the Consumer Duty framework',
        mainContent: `The Consumer Duty represents a fundamental shift in FCA expectations. Rather than focusing on process compliance, firms must now demonstrate they are delivering good outcomes for retail customers.

**Principle 12 – The Consumer Principle**
"A firm must act to deliver good outcomes for retail customers."

This is the overarching obligation. It applies to all activities relating to retail customers and sits alongside (not replacing) other Principles.

**PRIN 2A – The Detailed Rules**
PRIN 2A translates Principle 12 into specific, actionable requirements:

**Cross-Cutting Rules (PRIN 2A.2) – Behavioural Standards:**
These three rules apply throughout the customer relationship:
1. Act in good faith towards retail customers
2. Avoid causing foreseeable harm to retail customers
3. Enable and support retail customers to pursue their financial objectives

**Four Outcomes (PRIN 2A.3-2A.7):**
1. Products & Services – designed to meet target market needs
2. Price & Value – fair value for customers
3. Consumer Understanding – clear, timely communications
4. Consumer Support – easy access to support and exit

**FG22/5 – Finalised Guidance**
This guidance explains what "good looks like" with sector-specific examples of good and poor practice.

**Scope of Application**
The Duty applies to:
• All firms in retail markets where the Principles apply
• The entire product life-cycle: design, approval, distribution, sales, servicing, exit
• All parts of the distribution chain: manufacturers, co-manufacturers, distributors, intermediaries

Every firm must understand its role in the chain and how it contributes to good outcomes.`,

        keyConcepts: [
          {
            term: 'Principle 12',
            definition: 'The Consumer Principle requiring firms to act to deliver good outcomes for retail customers'
          },
          {
            term: 'Cross-Cutting Rules',
            definition: 'Three behavioural standards that apply across all customer interactions: good faith, avoid foreseeable harm, enable customers'
          },
          {
            term: 'Four Outcomes',
            definition: 'Products & Services, Price & Value, Consumer Understanding, and Consumer Support – the areas where good outcomes must be delivered'
          },
          {
            term: 'Distribution Chain',
            definition: 'The network of firms involved in designing, distributing, and servicing products to end customers'
          }
        ],

        realExamples: [
          'A product manufacturer defines the target market but relies on a platform to distribute. Both have Duty obligations – the manufacturer for design and value, the platform for appropriate distribution and support.',
          'A bank introduces a savings product. The Duty requires them to assess fair value, ensure marketing is clear, and provide easy access to funds – not just at launch but throughout the product lifecycle.',
          'An insurer discovers claims are taking too long to settle for certain customer groups. Under the Duty, this is a consumer support issue requiring remediation.'
        ],

        regulatoryRequirements: [
          'FCA Handbook PRIN 2A (Consumer Duty rules)',
          'Principle 12 – Consumer Principle',
          'FG22/5 – Final non-Handbook Guidance for firms on the Consumer Duty'
        ]
      }
    },

    {
      id: 'cross-cutting-rules',
      title: 'Cross-Cutting Rules & Four Outcomes',
      type: 'content',
      duration: 15,
      content: {
        learningPoint: 'Apply the cross-cutting rules and understand what each outcome requires',
        mainContent: `**The Cross-Cutting Rules (PRIN 2A.2)**

These three rules set the standard for how firms must behave towards customers:

**1. Act in Good Faith**
• Be honest, fair, and open in all dealings
• Avoid manipulative practices and "dark patterns" designed to push customers into choices not in their interests
• Don't exploit customer trust, lack of knowledge, or behavioural biases
• Ensure sales practices, communications, and processes are genuinely in customers' interests

**2. Avoid Causing Foreseeable Harm**
• Proactively identify realistic ways customers could be harmed by products, pricing, communications, or processes
• Take steps to prevent or reduce that harm before it occurs
• This includes eligibility checks, clearer warnings, caps on charges, better signposting
• Harm can be financial, non-financial (stress, confusion), or relate to customer circumstances

**3. Enable and Support Customers**
• Provide tools, information, and support to help customers make informed decisions
• Ensure products can be used in practice to meet customers' likely objectives
• Don't create barriers to customers acting in their own interests (switching, exiting, claiming)

---

**The Four Outcomes**

**Outcome 1: Products & Services (PRIN 2A.3)**
Products must be designed to meet the needs, characteristics, and objectives of a defined target market.

Key requirements:
• Clear product governance process (design, approval, review)
• Defined target market – who is this for, and who is it NOT for?
• Distribution strategies aligned to target market
• Regular review in light of outcomes data

**Outcome 2: Price & Value (PRIN 2A.4)**
Firms must assess and document fair value, considering:
• Total price – fees, charges, interest, spreads, penalties, commissions
• Benefits – product features, quality, service levels, flexibility
• Whether particular groups pay disproportionately high charges relative to benefits

Key questions:
• Is the overall price/benefit package reasonable for the target market?
• Are any groups cross-subsidising others unfairly?
• Do we revisit value as markets, costs, or behaviour change?

**Outcome 3: Consumer Understanding (PRIN 2A.5)**
Give customers the right information, at the right time, in a way they can understand:
• Clear, plain language – avoid jargon and complexity
• Layered communications – key messages with links to detail
• Test whether customers actually understand key features and risks

**Outcome 4: Consumer Support (PRIN 2A.6)**
Provide easy-to-use, responsive support so customers can act in their interests:
• Accessible support channels appropriate for the target market
• No unreasonable barriers to switching, cancelling, claiming, or complaining
• Monitor support performance and act on issues`,

        keyConcepts: [
          {
            term: 'Good Faith',
            definition: 'Honest, fair, and open dealing that does not exploit customers through manipulative practices or dark patterns'
          },
          {
            term: 'Foreseeable Harm',
            definition: 'Harm that a firm could reasonably anticipate and should take steps to prevent or mitigate'
          },
          {
            term: 'Fair Value Assessment',
            definition: 'Documented analysis of whether the total price paid by customers is reasonable relative to the benefits they receive'
          },
          {
            term: 'Dark Patterns',
            definition: 'Design choices that manipulate users into making decisions not in their interests, such as hidden opt-outs or confusing choices'
          }
        ],

        realExamples: [
          'A "fee-free" product earns revenue from an opaque FX spread. This breaches the price & value outcome and the cross-cutting rule on foreseeable harm.',
          'Digital onboarding takes 5 minutes, but cancelling requires a posted letter and phone call. This breaches consumer support – exit must be as easy as entry.',
          'A firm sends 40-page terms and conditions but no summary of key costs and risks. This fails consumer understanding requirements.'
        ],

        regulatoryRequirements: [
          'PRIN 2A.2 – Cross-cutting rules',
          'PRIN 2A.3 – Products and services outcome',
          'PRIN 2A.4 – Price and value outcome',
          'PRIN 2A.5 – Consumer understanding outcome',
          'PRIN 2A.6 – Consumer support outcome'
        ]
      }
    },

    {
      id: 'product-lifecycle-distribution',
      title: 'Product Lifecycle, Distribution Chain and PROD Alignment',
      type: 'content',
      duration: 12,
      content: {
        learningPoint: 'The Duty applies end-to-end across design, distribution, servicing and exit.',
        mainContent: `The Duty is not a marketing standard or a point-of-sale requirement. It applies across the entire product lifecycle and distribution chain, from design to exit. Firms must understand their role as a manufacturer, distributor, or both.

**Lifecycle Responsibilities**
1. **Design and Approval** – define target market and product purpose, assess foreseeable harm, and document fair value assumptions.
2. **Distribution** – ensure channels, scripts, and intermediaries align to target market and outcomes.
3. **Servicing** – monitor outcomes, support customers, and adapt journeys based on evidence.
4. **Exit and Switching** – remove unreasonable friction and ensure customers can act in their interests.

**Distribution Chain Expectations**
- Manufacturers must provide clear product information and target market data to distributors.
- Distributors must use the information to sell and service the product appropriately.
- Both must share outcomes data, complaints, and emerging risks.

**PROD and Consumer Duty**
PROD product governance already requires target market definition, product testing, and reviews. The Duty strengthens this by making good outcomes a regulatory standard, not a best practice.

**Third Parties and Appointed Representatives**
Where products are sold or serviced via partners, the firm still owns the outcome. Contracts, SLAs and oversight need to embed Duty expectations.`,
        keyConcepts: [
          {
            term: 'Distribution Chain',
            definition: 'All parties involved in manufacturing, distributing, or servicing a product for retail customers.'
          },
          {
            term: 'PROD',
            definition: 'Product governance rules covering target market, product review, and distribution strategy.'
          },
          {
            term: 'Target Market',
            definition: 'The group of customers whose needs, characteristics and objectives a product is designed to meet.'
          },
          {
            term: 'Lifecycle Ownership',
            definition: 'Accountability for outcomes at every stage of the product journey.'
          }
        ],
        realExamples: [
          'A manufacturer supplied target market data to an online distributor but did not monitor outcomes, leading to mis-selling and poor value complaints.',
          'A firm updated its exit process to make cancellations as easy as onboarding, reducing complaints and improving Duty outcomes.'
        ],
        regulatoryRequirements: [
          'PRIN 2A.3 - Products and services outcome',
          'PROD 3 - Product governance for manufacturers and distributors',
          'FG22/5 - Distribution chain expectations'
        ]
      }
    },
    {
      id: 'governance-mi-outcomes',
      title: 'Governance, MI and Outcomes Evidence',
      type: 'content',
      duration: 12,
      content: {
        learningPoint: 'Boards must evidence outcomes with meaningful MI, not just policies.',
        mainContent: `The Duty requires governance that is outcomes-led. Senior management must be able to demonstrate how they assess and improve outcomes, not just confirm that policies exist.

**Governance Expectations**
- Board approval of the Duty implementation plan and ongoing oversight
- Named accountable owners for each outcome
- Clear escalation routes when outcomes fall below expectations

**Outcome-Focused MI**
Good MI is specific, forward-looking and segmented by customer groups:
- Price and value: cost vs benefit metrics by segment
- Understanding: comprehension testing results and error rates
- Support: time to resolve, drop-off points, channel access
- Vulnerable outcomes: comparison of outcomes for customers with vulnerability indicators

**Evidence and Remediation**
- Document why outcomes are good or poor
- Track remediation actions and re-test
- Maintain audit-ready packs for FCA review

**Consumer Duty Champion**
- Senior leader who challenges and promotes Duty outcomes
- Ensures visibility in board discussions and decision-making`,
        keyConcepts: [
          {
            term: 'Outcome-Led MI',
            definition: 'Management information that measures customer impact rather than operational volume.'
          },
          {
            term: 'Remediation Cycle',
            definition: 'Identify harm, implement fixes, and re-test outcomes.'
          },
          {
            term: 'Duty Champion',
            definition: 'Senior leader responsible for promoting Duty outcomes at board level.'
          },
          {
            term: 'Evidence Pack',
            definition: 'Documented proof of outcomes, decision-making and actions.'
          }
        ],
        realExamples: [
          'A board receives quarterly outcome dashboards that highlight fair value gaps and required remediation actions.',
          'Customer comprehension testing found confusion on fees, triggering a rewrite of product communications and follow-up testing.'
        ],
        regulatoryRequirements: [
          'PRIN 2A.8 - Governance and monitoring expectations',
          'FG22/5 - Board reporting and evidence of outcomes'
        ]
      }
    },

    {
      id: 'vulnerable-customers',
      title: 'Vulnerable Customers, Governance & MI',
      type: 'content',
      duration: 15,
      content: {
        learningPoint: 'Apply the Duty to vulnerable customers and understand governance expectations',
        mainContent: `**Vulnerable Customers and the Duty**

A vulnerable customer is someone who, due to their personal circumstances, is especially susceptible to harm, particularly where firms do not act with appropriate levels of care.

**The FCA's Four Drivers of Vulnerability:**
1. Health – physical or mental health conditions affecting ability to carry out day-to-day tasks
2. Life Events – major changes such as bereavement, job loss, divorce, caring responsibilities
3. Resilience – low ability to withstand financial or emotional shocks
4. Capability – low knowledge or confidence in managing financial matters, or low digital skills

**What Firms Must Do:**
• Understand what vulnerability looks like in their target market
• Train staff to recognise signs of vulnerability and respond appropriately
• Adapt communications, processes, and support (slower pace, alternative channels, more checks)
• Monitor outcomes for vulnerable customers – these should be at least as good as for others

Poor outcomes for vulnerable customers will be a key red flag for the FCA.

---

**Governance and SMCR**

The FCA expects robust governance:
• **Board and senior management oversight** of Consumer Duty implementation and performance
• Clear **accountability** for outcomes – often a named "Consumer Duty Champion" at board level
• Integration into:
  - Product approval and review processes
  - Risk and compliance frameworks
  - Remuneration and incentives
  - Outsourcing and third-party arrangements

Senior Managers must demonstrate how their decisions contribute to good outcomes and how they respond when outcomes fall short.

---

**Management Information (MI)**

Outcome-focused MI is essential. Firms should monitor:
• Complaints data and root causes
• Persistency, lapses, arrears, and claims experience
• Outcomes for different segments, including vulnerable customers
• Results of fair value assessments
• Evidence on customer understanding (testing, feedback)
• Support performance (response times, resolution, ease of exit)

**Distribution Chain Information Sharing:**
• Manufacturers share product information to help distributors play their role
• Distributors feed back data and insight to support product reviews
• The objective is a closed loop between design, distribution, and outcomes`,

        keyConcepts: [
          {
            term: 'Vulnerable Customer',
            definition: 'Someone especially susceptible to harm due to health, life events, resilience, or capability factors'
          },
          {
            term: 'Consumer Duty Champion',
            definition: 'A senior individual, often at board level, accountable for Consumer Duty implementation and oversight'
          },
          {
            term: 'Outcome-Focused MI',
            definition: 'Management information that measures actual customer outcomes rather than just process compliance'
          },
          {
            term: 'Closed Loop',
            definition: 'A continuous feedback cycle between product design, distribution, and outcomes monitoring'
          }
        ],

        realExamples: [
          'A customer discloses anxiety and difficulty with complex information. Staff should slow down, use simpler explanations, check understanding, and document the interaction.',
          'A board reviews only complaint volumes. Under the Duty, they should also see root cause analysis, vulnerable customer outcomes, and fair value review results.',
          'A platform notices customers from a distributor have worse outcomes. They share this data to help the distributor improve their sales practices.'
        ],

        regulatoryRequirements: [
          'FG21/1 – Guidance for firms on the fair treatment of vulnerable customers',
          'PRIN 2A.7 – Governance of products and services',
          'SYSC 4.1.1 – General organisational requirements',
          'SM&CR – Senior manager accountability for outcomes'
        ]
      }
    }
  ],

  // Practice Scenarios
  practiceScenarios: [
    {
      id: 'scenario-fee-free-fx',
      title: 'Fee-Free FX Product',
      description: 'A "no-fee" product earns revenue solely from an opaque FX spread that is not clearly explained to customers.',
      question: 'Which Consumer Duty areas are most at risk?',
      options: [
        { id: 'a', text: 'Products & services outcome only' },
        { id: 'b', text: 'Price & value outcome and foreseeable harm cross-cutting rule' },
        { id: 'c', text: 'Consumer support outcome only' },
        { id: 'd', text: 'No issue if the spread is mentioned in small print' }
      ],
      correctAnswer: 'b',
      explanation: 'Fair value assessments must consider total value, including spreads and non-transparent charges. Poor explanation of the FX spread exposes customers to foreseeable harm, creating risk under both the price & value outcome and the cross-cutting rules.',
      learningPoints: [
        'Hidden costs must be factored into fair value assessments',
        'Small print disclosure is not sufficient if customers cannot realistically understand the true cost',
        'The cross-cutting rule on foreseeable harm applies to pricing practices'
      ]
    },
    {
      id: 'scenario-stressed-customer',
      title: 'Time-Pressured Customer',
      description: 'A customer says: "I\'m under a lot of stress and don\'t really understand this. Just tell me which one is best – I don\'t have time to read everything."',
      question: 'What should a member of staff do under the Duty?',
      options: [
        { id: 'a', text: 'Proceed with the standard script to avoid delays' },
        { id: 'b', text: 'Slow down, adapt communication style, check understanding, and consider if this is the right time to proceed' },
        { id: 'c', text: 'Refuse to serve them until they calm down' },
        { id: 'd', text: 'Make the choice for them to save time' }
      ],
      correctAnswer: 'b',
      explanation: 'The customer is showing signs of vulnerability (stress, difficulty understanding). Staff should adapt their approach, slow down, use simpler explanations, and check understanding. They should also consider whether proceeding is in the customer\'s best interests at this time.',
      learningPoints: [
        'Vulnerability can be situational – stress and time pressure affect decision-making',
        'Staff should be empowered to adapt their approach based on customer needs',
        'The cross-cutting rule to enable customers means helping them make genuinely informed decisions'
      ]
    },
    {
      id: 'scenario-complaints-friction',
      title: 'Friction in Complaints',
      description: 'Digital onboarding is quick and easy, but to complain customers must print and post a form. Contact details are hard to find.',
      question: 'How does this sit against the Consumer Duty?',
      options: [
        { id: 'a', text: 'Acceptable as complaints are a different process' },
        { id: 'b', text: 'Breaches consumer support outcome – exit and complaints should be as easy as entry' },
        { id: 'c', text: 'Only a problem if complaint volumes are high' },
        { id: 'd', text: 'Acceptable if the form is available on the website' }
      ],
      correctAnswer: 'b',
      explanation: 'The consumer support outcome requires firms to avoid unreasonable barriers to customers acting in their interests – including complaining. If entry is digital, support and exit channels should be equally accessible.',
      learningPoints: [
        'Sludge practices (friction to deter legitimate actions) are a red flag',
        'Complaints handling is part of consumer support',
        'Channel availability should be consistent across the customer journey'
      ]
    }
  ],

  // Assessment Questions
  assessmentQuestions: [
    {
      id: 'q1',
      question: 'Which statement best describes how the Consumer Duty sits within the FCA\'s framework?',
      options: [
        { id: 'a', text: 'It replaces all existing Principles for Businesses' },
        { id: 'b', text: 'It introduces Principle 12, supported by detailed rules in PRIN 2A (cross-cutting rules and four outcomes)' },
        { id: 'c', text: 'It is only informal guidance in FG22/5' },
        { id: 'd', text: 'It applies only to products sold before 31 July 2023' }
      ],
      correctAnswer: 'b',
      explanation: 'The Consumer Duty is implemented through Principle 12 and detailed rules in PRIN 2A. FG22/5 is finalised guidance that explains how firms should comply; it does not replace the rules.',
      topic: 'Duty Structure'
    },
    {
      id: 'q2',
      question: 'A firm wants to launch a new product quickly and "fix any issues later". Which approach best reflects the Consumer Duty\'s cross-cutting rules?',
      options: [
        { id: 'a', text: 'Launch now; the Duty only applies after problems appear' },
        { id: 'b', text: 'Delay launch until foreseeable harms and support needs are identified and mitigated in the design' },
        { id: 'c', text: 'Launch now with a broad disclaimer stating customers are responsible for their own decisions' },
        { id: 'd', text: 'Launch now as long as full terms and conditions are on the website' }
      ],
      correctAnswer: 'b',
      explanation: 'The cross-cutting rules require firms to act in good faith, avoid foreseeable harm and support customers\' objectives proactively, not only once problems emerge. Harm analysis and mitigations should be built into the design before launch.',
      topic: 'Cross-Cutting Rules'
    },
    {
      id: 'q3',
      question: 'A "no-fee" product earns revenue solely from an opaque FX spread that is not clearly explained to customers. Which Consumer Duty areas are most at risk?',
      options: [
        { id: 'a', text: 'Products & services outcome only' },
        { id: 'b', text: 'Price & value outcome and foreseeable harm' },
        { id: 'c', text: 'Consumer support outcome only' },
        { id: 'd', text: 'No issue if the spread is mentioned somewhere in the small print' }
      ],
      correctAnswer: 'b',
      explanation: 'Fair value assessments must consider total value, including spreads and non-transparent charges. Poor explanation of the FX spread can expose customers to foreseeable harm, creating risk under both the price & value outcome and the cross-cutting rules.',
      topic: 'Price & Value'
    },
    {
      id: 'q4',
      question: 'Which approach best aligns with the Consumer Duty\'s consumer understanding outcome?',
      options: [
        { id: 'a', text: 'Sending a long PDF with all terms after the customer has already committed' },
        { id: 'b', text: 'Providing short, focused explanations of key costs and risks at decision points, with links to more detailed information' },
        { id: 'c', text: 'Relying on customers to find product details on the firm\'s website themselves' },
        { id: 'd', text: 'Replacing risk warnings with marketing slogans to keep messaging positive' }
      ],
      correctAnswer: 'b',
      explanation: 'The Duty focuses on clear, timely and relevant communications that genuinely support informed decisions. Layered explanations at decision points, with links to further detail, are typically more effective than long documents alone.',
      topic: 'Consumer Understanding'
    },
    {
      id: 'q5',
      question: 'A customer discloses that they are struggling with anxiety and complex information. Under FCA expectations and the Consumer Duty, what should staff do?',
      options: [
        { id: 'a', text: 'Proceed with the standard, complex script' },
        { id: 'b', text: 'Slow down, use simpler explanations, check understanding and adapt support' },
        { id: 'c', text: 'Refuse to deal with them due to higher risk' },
        { id: 'd', text: 'Ask them to nominate a "more capable" person and only speak to that person' }
      ],
      correctAnswer: 'b',
      explanation: 'Firms must identify and respond to vulnerability, adapting communication and support so vulnerable customers can achieve outcomes as good as other customers. This usually means adjusting pace, language and support options—not excluding customers.',
      topic: 'Vulnerable Customers'
    },
    {
      id: 'q6',
      question: 'Which statement best reflects the FCA\'s expectations on governance and MI under the Consumer Duty?',
      options: [
        { id: 'a', text: 'Boards can rely solely on financial performance to judge success' },
        { id: 'b', text: 'Boards and senior management must regularly review outcome-focused MI and be satisfied outcomes align with the Duty' },
        { id: 'c', text: 'MI is optional if complaint numbers are low' },
        { id: 'd', text: 'Only the Duty champion needs access to outcome data' }
      ],
      correctAnswer: 'b',
      explanation: 'The FCA expects boards and senior management to use outcome-focused MI to assess whether they are delivering good outcomes, and to act where they are not. Financial metrics alone are not enough.',
      topic: 'Governance'
    },
    {
      id: 'q7',
      question: 'From an enforcement perspective, which is most accurate?',
      options: [
        { id: 'a', text: 'Only breaches of detailed outcome rules matter' },
        { id: 'b', text: 'Principle 12 and the cross-cutting rules will be central, with the outcomes helping interpret what good looks like' },
        { id: 'c', text: 'Only legacy products are in scope' },
        { id: 'd', text: 'The Duty is not expected to be enforced' }
      ],
      correctAnswer: 'b',
      explanation: 'Principle 12 and the cross-cutting rules are the core obligations. The four outcomes illustrate how firms should achieve and evidence good outcomes but do not limit the regulator\'s ability to challenge harmful practices.',
      topic: 'Enforcement'
    },
    {
      id: 'q8',
      question: 'Which statement best reflects how the Consumer Duty applies in a distribution chain?',
      options: [
        { id: 'a', text: 'Only product manufacturers have Consumer Duty obligations' },
        { id: 'b', text: 'Manufacturers and distributors each have their own responsibilities and must share information to support good outcomes' },
        { id: 'c', text: 'Intermediaries are exempt if they do not give advice' },
        { id: 'd', text: 'Duty obligations stop at the first firm in the chain' }
      ],
      correctAnswer: 'b',
      explanation: 'The Duty applies across the distribution chain. Manufacturers and distributors must each meet their responsibilities and share information to design, distribute and monitor products in a way that delivers good outcomes.',
      topic: 'Distribution Chain'
    }
  ],

  // Summary Section
  summary: {
    keyTakeaways: [
      'The Consumer Duty requires firms to deliver good outcomes, not just follow processes – Principle 12 is the overarching obligation',
      'Three cross-cutting rules apply throughout: act in good faith, avoid foreseeable harm, enable customers',
      'Four outcomes cover products, price & value, consumer understanding, and consumer support',
      'Fair value assessments must consider total cost vs benefits for the target market',
      'Vulnerable customers need adapted support and their outcomes must be monitored',
      'Boards need outcome-focused MI, not just financial metrics, and clear accountability'
    ],
    nextSteps: [
      'Review your firm\'s fair value assessments against the price & value outcome requirements',
      'Assess customer communications for clarity and timing against the consumer understanding outcome',
      'Map customer support channels and identify any friction or sludge practices',
      'Check vulnerable customer identification and outcome monitoring processes',
      'Ensure board MI includes outcome-focused measures, not just complaints volumes'
    ],
    quickReference: [
      'Principle 12: Act to deliver good outcomes for retail customers',
      'Cross-cutting rules: Good faith, avoid foreseeable harm, enable customers',
      'Four outcomes: Products, Price & Value, Understanding, Support',
      'Fair value: Total price vs benefits for target market',
      'Vulnerable customers: Outcomes at least as good as other customers'
    ]
  },

  // Visual Assets
  visualAssets: {
    images: [
      {
        section: 'hook',
        description: 'Dashboard showing customer outcomes data with red flags for poor value and friction'
      },
      {
        section: 'main-content',
        description: 'Diagram showing Consumer Duty structure: Principle 12 → Cross-cutting rules → Four outcomes'
      },
      {
        section: 'outcomes',
        description: 'Four-panel illustration showing each outcome with examples of good and poor practice'
      },
      {
        section: 'vulnerable',
        description: 'Journey map showing vulnerability identification and adapted support paths'
      },
      {
        section: 'governance',
        description: 'Board MI dashboard with outcome-focused metrics tiles'
      }
    ],
    style: 'Professional regulatory design with customer-centric visuals and clear outcome frameworks'
  }
};
