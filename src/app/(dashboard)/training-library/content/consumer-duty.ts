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
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Principle 12 - The Consumer Principle',
              message: '"A firm must act to deliver good outcomes for retail customers." - The overarching obligation.'
            },
            {
              type: 'keypoint',
              icon: '📋',
              title: 'Three Cross-Cutting Rules',
              points: [
                'Act in good faith towards retail customers',
                'Avoid causing foreseeable harm',
                'Enable and support customers to pursue their objectives'
              ]
            },
            {
              type: 'infogrid',
              title: 'Four Outcomes',
              items: [
                { icon: '📦', label: 'Products & Services', description: 'Meet target market needs' },
                { icon: '💰', label: 'Price & Value', description: 'Fair value for customers' },
                { icon: '📝', label: 'Understanding', description: 'Clear communications' },
                { icon: '🤝', label: 'Support', description: 'Easy access to help' }
              ]
            },
            {
              type: 'keypoint',
              icon: '🎯',
              title: 'Scope of Application',
              points: [
                'All firms in retail markets',
                'Entire product lifecycle: design to exit',
                'All distribution chain participants',
                'Manufacturers, distributors, intermediaries'
              ]
            },
            {
              type: 'stat',
              icon: '📘',
              value: 'FG22/5',
              label: 'Finalised Guidance',
              description: 'Explains what "good" looks like with examples',
              color: 'blue'
            }
          ]
        },

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
        mainContent: {
          cards: [
            {
              type: 'keypoint',
              icon: '1️⃣',
              title: 'Rule 1: Act in Good Faith',
              points: [
                'Be honest, fair, and open',
                'Avoid "dark patterns" and manipulative practices',
                'Don\'t exploit trust or behavioural biases',
                'Sales practices genuinely in customers\' interests'
              ]
            },
            {
              type: 'keypoint',
              icon: '2️⃣',
              title: 'Rule 2: Avoid Foreseeable Harm',
              points: [
                'Proactively identify ways customers could be harmed',
                'Take steps BEFORE harm occurs',
                'Includes eligibility checks, warnings, charge caps',
                'Harm can be financial or non-financial (stress)'
              ]
            },
            {
              type: 'keypoint',
              icon: '3️⃣',
              title: 'Rule 3: Enable & Support Customers',
              points: [
                'Provide tools for informed decisions',
                'Ensure products work in practice',
                'No barriers to switching, exiting, claiming'
              ]
            },
            {
              type: 'checklist',
              title: 'Outcome 1: Products & Services',
              items: [
                'Clear product governance process',
                'Defined target market (who it IS and ISN\'T for)',
                'Distribution aligned to target market',
                'Regular review based on outcomes data'
              ]
            },
            {
              type: 'keypoint',
              icon: '💰',
              title: 'Outcome 2: Price & Value',
              points: [
                'Total price: fees, charges, spreads, penalties',
                'Benefits: features, quality, service, flexibility',
                'Check if groups pay disproportionate charges',
                'Revisit value as markets change'
              ]
            },
            {
              type: 'checklist',
              title: 'Outcome 3: Consumer Understanding',
              items: [
                'Clear, plain language - no jargon',
                'Layered communications with key messages',
                'Test if customers actually understand',
                'Right information at the right time'
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Outcome 4: Consumer Support',
              message: 'No unreasonable barriers to switching, cancelling, claiming, or complaining. Exit should be as easy as entry.'
            }
          ]
        },

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
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'info',
              title: 'Not Just Point-of-Sale',
              message: 'The Duty applies across the ENTIRE product lifecycle and distribution chain, from design to exit.'
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Design & Approval', description: 'Define target market, assess harm, document value' },
                { number: 2, title: 'Distribution', description: 'Align channels to target market and outcomes' },
                { number: 3, title: 'Servicing', description: 'Monitor outcomes, adapt based on evidence' },
                { number: 4, title: 'Exit & Switching', description: 'Remove friction, enable customer action' }
              ]
            },
            {
              type: 'keypoint',
              icon: '🔗',
              title: 'Distribution Chain Expectations',
              points: [
                'Manufacturers provide product info and target market data',
                'Distributors use info to sell and service appropriately',
                'Both share outcomes data, complaints, emerging risks',
                'Closed loop between design, distribution, outcomes'
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Third Parties & Appointed Reps',
              message: 'Where products sold via partners, YOU still own the outcome. Contracts and oversight must embed Duty expectations.'
            },
            {
              type: 'stat',
              icon: '📋',
              value: 'PROD',
              label: 'Product Governance Rules',
              description: 'Duty makes good outcomes regulatory standard, not best practice',
              color: 'blue'
            }
          ]
        },
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
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Outcomes-Led Governance',
              message: 'Senior management must demonstrate how they assess and IMPROVE outcomes - not just confirm policies exist.'
            },
            {
              type: 'checklist',
              title: 'Governance Expectations',
              items: [
                'Board approval of Duty implementation plan',
                'Named accountable owners for each outcome',
                'Clear escalation when outcomes fall short',
                'Ongoing oversight not just initial approval'
              ]
            },
            {
              type: 'infogrid',
              title: 'Outcome-Focused MI',
              items: [
                { icon: '💰', label: 'Price & Value', description: 'Cost vs benefit by segment' },
                { icon: '📝', label: 'Understanding', description: 'Comprehension test results' },
                { icon: '🤝', label: 'Support', description: 'Resolution time, drop-offs' },
                { icon: '❤️', label: 'Vulnerable', description: 'Outcomes comparison' }
              ]
            },
            {
              type: 'keypoint',
              icon: '🏆',
              title: 'Consumer Duty Champion',
              points: [
                'Senior leader who challenges and promotes outcomes',
                'Ensures visibility in board discussions',
                'Accountable for Duty implementation',
                'Champions customer interests at senior level'
              ]
            },
            {
              type: 'checklist',
              title: 'Evidence & Remediation',
              items: [
                'Document why outcomes are good or poor',
                'Track remediation actions',
                'Re-test after changes',
                'Maintain audit-ready packs for FCA'
              ]
            }
          ]
        },
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
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Key FCA Focus Area',
              message: 'Poor outcomes for vulnerable customers will be a key red flag for the FCA. Their outcomes must be at least as good as others.'
            },
            {
              type: 'infogrid',
              title: 'Four Drivers of Vulnerability',
              items: [
                { icon: '❤️', label: 'Health', description: 'Physical/mental conditions' },
                { icon: '⚡', label: 'Life Events', description: 'Bereavement, job loss, divorce' },
                { icon: '💪', label: 'Resilience', description: 'Low shock absorption' },
                { icon: '🧠', label: 'Capability', description: 'Low knowledge or digital skills' }
              ]
            },
            {
              type: 'checklist',
              title: 'What Firms Must Do',
              items: [
                'Understand vulnerability in your target market',
                'Train staff to recognise and respond',
                'Adapt communications and support',
                'Monitor outcomes for vulnerable customers'
              ]
            },
            {
              type: 'keypoint',
              icon: '👔',
              title: 'Governance & SMCR Integration',
              points: [
                'Board oversight of Duty implementation',
                'Named Consumer Duty Champion',
                'Integration into product approval process',
                'Remuneration and incentive alignment'
              ]
            },
            {
              type: 'checklist',
              title: 'MI to Monitor',
              items: [
                'Complaints data and root causes',
                'Outcomes by segment (including vulnerable)',
                'Fair value assessment results',
                'Customer understanding evidence',
                'Support performance metrics'
              ]
            },
            {
              type: 'keypoint',
              icon: '🔄',
              title: 'Distribution Chain Sharing',
              points: [
                'Manufacturers share product info to distributors',
                'Distributors feed back data and insights',
                'Closed loop between design and outcomes'
              ]
            }
          ]
        },

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
