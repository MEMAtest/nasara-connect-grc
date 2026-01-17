import { TrainingModule, MicroLesson } from "../types";

export const consumerDutyImplementationContent = {
  module: {
    id: "consumer_duty_implementation",
    title: "Consumer Duty Implementation: Practical Guide",
    description: "Master the FCA's Consumer Duty requirements and implement effective customer protection measures",
    category: "mandatory",
    regulatoryArea: "Consumer Protection",
    estimatedDuration: 35,
    difficulty: "intermediate",
    targetPersonas: ["compliance_officer", "product_marketing", "customer_advisor", "operations_staff"],
    learningOutcomes: [
      "Understand the four key outcomes of Consumer Duty",
      "Implement fair value assessments for products and services",
      "Design customer-centric communications and disclosures",
      "Establish effective governance and oversight processes",
      "Handle vulnerable customers according to Consumer Duty requirements"
    ]
  } as TrainingModule,

  lesson: {
    id: "consumer_duty_fundamentals",
    title: "Consumer Duty Fundamentals: The Four Outcomes",
    description: "Understanding and implementing the FCA's Consumer Duty framework",
    duration: 10,
    difficulty: "intermediate",
    regulatoryArea: "Consumer Protection",
    targetPersonas: ["compliance_officer", "product_marketing", "customer_advisor"],
    components: {
      hook: {
        duration: 1,
        content: {
          type: "real_world_impact",
          title: "The £2.8 Billion Question",
          content: `Since Consumer Duty came into effect, firms have returned over £2.8 billion to customers who were charged unfairly or received poor value. Your company's next customer interaction could be worth thousands - or cost you millions in regulatory action.

          Meet Sarah, a working mother who discovered her savings account was earning 0.01% while the bank offered 2.5% to new customers. Under Consumer Duty, this isn't just poor service - it's a regulatory breach that could trigger compensation, fines, and reputational damage.`,
          visual: {
            type: "impact_story",
            customer: "Sarah",
            situation: "Long-standing customer receiving poor value",
            impact: "£800 lost interest over 3 years",
            outcome: "Bank required to pay compensation and review all similar accounts"
          }
        }
      },
      content: {
        duration: 6,
        content: {
          type: "structured_learning",
          sections: [
            {
              title: "What is Consumer Duty?",
              content: `Consumer Duty is the FCA's most significant regulatory change in decades, fundamentally shifting how firms must treat customers. It's not just about avoiding harm - it's about actively ensuring good outcomes.`,
              visual: {
                type: "transformation_comparison",
                before: {
                  title: "Old Approach",
                  characteristics: ["Treat customers fairly", "Avoid obvious harm", "Comply with rules", "Product-focused"],
                  color: "slate"
                },
                after: {
                  title: "Consumer Duty",
                  characteristics: ["Act to deliver good outcomes", "Proactively prevent harm", "Evidence good outcomes", "Customer-focused"],
                  color: "emerald"
                }
              }
            },
            {
              title: "The Four Consumer Outcomes",
              content: `Consumer Duty centers on four key outcomes that firms must deliver:`,
              visual: {
                type: "outcome_framework",
                outcomes: [
                  {
                    number: 1,
                    title: "Products & Services",
                    description: "Products and services are designed to meet customers' needs and provide fair value",
                    keyRequirements: [
                      "Target market identification",
                      "Fair value assessment",
                      "Product testing and review",
                      "Distribution strategy alignment"
                    ],
                    examples: [
                      "Savings account with competitive rates",
                      "Insurance with clear, useful coverage",
                      "Investment product suitable for target market"
                    ],
                    redFlags: [
                      "Products with unnecessary complexity",
                      "High charges relative to benefits",
                      "Features that don't benefit customers"
                    ],
                    color: "blue"
                  },
                  {
                    number: 2,
                    title: "Price & Value",
                    description: "Customers receive fair value and are not charged unreasonable prices",
                    keyRequirements: [
                      "Regular fair value assessments",
                      "Price discrimination review",
                      "Value demonstration",
                      "Competitor benchmarking"
                    ],
                    examples: [
                      "Competitive pricing for all customers",
                      "Clear explanation of charges",
                      "Regular price reviews and adjustments"
                    ],
                    redFlags: [
                      "Loyalty penalties",
                      "Excessive charges vs. value",
                      "Hidden or complex fee structures"
                    ],
                    color: "emerald"
                  },
                  {
                    number: 3,
                    title: "Consumer Understanding",
                    description: "Communications help customers understand products and make informed decisions",
                    keyRequirements: [
                      "Plain English communications",
                      "Customer testing of materials",
                      "Timely and relevant information",
                      "Accessible formats for vulnerable customers"
                    ],
                    examples: [
                      "Clear, jargon-free product descriptions",
                      "Timely alerts about important changes",
                      "Easy-to-understand fee explanations"
                    ],
                    redFlags: [
                      "Complex or confusing terms",
                      "Buried important information",
                      "Generic communications not tailored to customer needs"
                    ],
                    color: "amber"
                  },
                  {
                    number: 4,
                    title: "Customer Support",
                    description: "Customers receive the support they need, when they need it",
                    keyRequirements: [
                      "Accessible support channels",
                      "Staff training and competence",
                      "Vulnerable customer identification",
                      "Reasonable support throughout relationship"
                    ],
                    examples: [
                      "Multiple contact channels available",
                      "Staff trained to identify and help vulnerable customers",
                      "Proactive support during difficult times"
                    ],
                    redFlags: [
                      "Difficult to contact support",
                      "Untrained or unhelpful staff",
                      "No consideration for vulnerable customers"
                    ],
                    color: "purple"
                  }
                ]
              }
            },
            {
              title: "Implementation Priorities",
              content: `Successful Consumer Duty implementation requires a systematic approach across your organization:`,
              visual: {
                type: "implementation_roadmap",
                phases: [
                  {
                    phase: "Assessment",
                    duration: "Month 1-2",
                    activities: [
                      "Gap analysis against current practices",
                      "Product and service review",
                      "Customer outcome measurement baseline",
                      "Governance structure assessment"
                    ]
                  },
                  {
                    phase: "Design",
                    duration: "Month 3-4",
                    activities: [
                      "Fair value assessment methodology",
                      "Customer communication standards",
                      "Staff training programs",
                      "Data collection and monitoring systems"
                    ]
                  },
                  {
                    phase: "Implementation",
                    duration: "Month 5-6",
                    activities: [
                      "Roll out new processes and procedures",
                      "Staff training delivery",
                      "System and data implementation",
                      "Customer communication updates"
                    ]
                  },
                  {
                    phase: "Monitoring",
                    duration: "Ongoing",
                    activities: [
                      "Regular outcome measurement",
                      "Customer feedback analysis",
                      "Board reporting and oversight",
                      "Continuous improvement"
                    ]
                  }
                ]
              }
            }
          ]
        }
      },
      practice: {
        duration: 2,
        content: {
          type: "outcome_assessment_exercise",
          title: "Consumer Duty Outcome Assessment",
          description: "Evaluate real business scenarios against Consumer Duty requirements",
          scenarios: [
            {
              id: "savings_account_scenario",
              title: "The Savings Account Dilemma",
              context: "MidBank offers a 'Premium Saver' account with 0.1% interest to existing customers while advertising a 'New Customer Saver' at 3.2% interest for the first 12 months, then reverting to 0.5%.",
              customerProfile: "Emma, a loyal customer for 8 years with £50,000 in savings",
              questions: [
                {
                  question: "Which Consumer Duty outcome is most at risk here?",
                  options: [
                    "Products & Services - poor product design",
                    "Price & Value - unfair value for loyal customers",
                    "Consumer Understanding - confusing product names",
                    "Customer Support - inadequate account management"
                  ],
                  correct: 1,
                  explanation: "This is primarily a Price & Value issue where loyal customers receive significantly worse rates, creating unfair value."
                },
                {
                  question: "What action should MidBank take under Consumer Duty?",
                  options: [
                    "Continue current practice - it's legal",
                    "Send Emma information about the new account",
                    "Review and address the rate differential for all customers",
                    "Only change rates if customers complain"
                  ],
                  correct: 2,
                  explanation: "Consumer Duty requires proactive action to ensure fair value for all customers, not just reactive responses to complaints."
                }
              ],
              learningPoints: [
                "Price & Value outcome requires fair treatment of all customers, not just new ones",
                "Loyalty penalties are specifically problematic under Consumer Duty",
                "Firms must proactively identify and address poor value, not wait for complaints"
              ]
            }
          ]
        }
      },
      summary: {
        duration: 1,
        content: {
          type: "implementation_checklist",
          title: "Your Consumer Duty Action Plan",
          checklist: [
            {
              category: "Products & Services",
              items: [
                "Review all products for fair value",
                "Assess target market definitions",
                "Evaluate distribution strategies",
                "Test products with real customers"
              ]
            },
            {
              category: "Price & Value",
              items: [
                "Conduct fair value assessments",
                "Review pricing for all customer segments",
                "Eliminate loyalty penalties",
                "Benchmark against competitors"
              ]
            },
            {
              category: "Consumer Understanding",
              items: [
                "Simplify all customer communications",
                "Test materials with real customers",
                "Ensure accessibility for vulnerable customers",
                "Provide timely, relevant information"
              ]
            },
            {
              category: "Customer Support",
              items: [
                "Train staff on Consumer Duty",
                "Identify vulnerable customers",
                "Improve support accessibility",
                "Monitor support quality"
              ]
            }
          ],
          nextSteps: [
            "Complete Consumer Duty Implementation Assessment",
            "Practice with Fair Value Assessment Tool",
            "Review your firm's Consumer Duty policies"
          ]
        }
      }
    }
  } as MicroLesson
};

export const consumerDutyImplementationModule: TrainingModule = {
  id: "consumer-duty-implementation",
  title: "Consumer Duty Implementation",
  description: "Translate the Duty into practical controls, fair value evidence, and board-ready outcomes monitoring.",
  category: "customer-protection",
  duration: 35,
  difficulty: "intermediate",
  targetPersonas: ["compliance-officer", "senior-manager", "operations-staff", "relationship-manager", "customer-service"],
  prerequisiteModules: ["consumer-duty"],
  tags: ["consumer-duty", "fair-value", "outcomes", "governance", "vulnerable-customers"],
  learningOutcomes: [
    "Translate Principle 12 into measurable outcomes and governance responsibilities",
    "Design fair value assessments that evidence benefit vs cost",
    "Implement communications testing and monitoring for understanding",
    "Embed vulnerable customer support into day-to-day operations",
    "Build MI that demonstrates outcomes to boards and regulators"
  ],
  hook: {
    title: "The GBP 2.8 Billion Wake-Up Call",
    content: "Since the Duty went live, firms have returned billions to customers after poor value and weak outcomes were identified. Consumer Duty is not a policy statement; it is an operational standard. The quality of your evidence and monitoring determines whether you are compliant.",
    statistic: "More than GBP 2.8bn returned to customers after Duty-driven reviews."
  },
  lessons: [
    {
      id: "duty-structure",
      title: "From Principle to Outcomes",
      type: "content",
      duration: 10,
      content: {
        learningPoint: "Principle 12 and the cross-cutting rules drive every outcome test.",
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Shift from Process to Outcomes',
              message: 'Consumer Duty shifts compliance from process adherence to OUTCOMES EVIDENCE. You must prove good outcomes, not just document policies.'
            },
            {
              type: 'keypoint',
              icon: '📋',
              title: 'Cross-Cutting Rules',
              points: [
                'Good faith in all customer dealings',
                'Avoid foreseeable harm proactively',
                'Enable customers to pursue financial objectives'
              ]
            },
            {
              type: 'infogrid',
              title: 'The Four Outcomes',
              items: [
                { icon: '📦', label: 'Products', description: 'Meet target market needs' },
                { icon: '💰', label: 'Price & Value', description: 'Fair value evidence' },
                { icon: '📝', label: 'Understanding', description: 'Clear communications' },
                { icon: '🤝', label: 'Support', description: 'Accessible help' }
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Map', description: 'Link products/journeys to outcomes' },
                { number: 2, title: 'Design', description: 'Create evidence and monitoring' },
                { number: 3, title: 'Test', description: 'Verify outcomes are achieved' },
                { number: 4, title: 'Report', description: 'Board-ready MI' }
              ]
            }
          ]
        },
        keyConcepts: [
          { term: "Principle 12", definition: "Act to deliver good outcomes for retail customers." },
          { term: "Cross-Cutting Rules", definition: "Good faith, avoid foreseeable harm, and enable customers to pursue their financial objectives." },
          { term: "Outcome Framework", definition: "Products and services, price and value, consumer understanding, and consumer support." }
        ],
        realExamples: [
          "Products with complex terms that customers consistently misunderstand.",
          "Legacy customers paying materially more than new customers without justification."
        ],
        visual: {
          type: "infographic",
          elements: [
            { icon: "shield", text: "Act in good faith", description: "Demonstrate fairness in design and servicing.", color: "green" },
            { icon: "alert-triangle", text: "Avoid foreseeable harm", description: "Design controls to prevent predictable detriment.", color: "amber" },
            { icon: "search", text: "Enable customers", description: "Support informed decisions with clear communications.", color: "red" }
          ]
        }
      }
    },
    {
      id: "fair-value",
      title: "Fair Value and Product Governance",
      type: "content",
      duration: 10,
      content: {
        learningPoint: "Fair value requires evidence of benefit vs cost for each target market segment.",
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'info',
              title: 'Not Just Pricing',
              message: 'Fair value is a holistic assessment of total price vs expected benefits - not a pricing exercise.'
            },
            {
              type: 'keypoint',
              icon: '💰',
              title: 'Fair Value Assessment',
              points: [
                'Total price paid vs expected benefits',
                'Include distribution channels in analysis',
                'Test outcomes for different segments',
                'Build repeatable assessment method'
              ]
            },
            {
              type: 'infogrid',
              title: 'Evidence Types',
              items: [
                { icon: '📊', label: 'Quantitative', description: 'Fees, returns, complaints, retention' },
                { icon: '💬', label: 'Qualitative', description: 'Feedback, vulnerabilities, service' }
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Define Target Market', description: 'Who is product for (and not for)' },
                { number: 2, title: 'Assess Price vs Benefit', description: 'Compare costs with outcomes' },
                { number: 3, title: 'Monitor & Adjust', description: 'Track and revise if needed' }
              ]
            }
          ]
        },
        keyConcepts: [
          { term: "Target Market", definition: "The customer segment the product is designed for and tested against." },
          { term: "Fair Value Assessment", definition: "Evidence that price aligns with benefits, quality, and outcomes." },
          { term: "Product Governance", definition: "Design, approval, monitoring, and review of products over their lifecycle." }
        ],
        realExamples: [
          { title: "Savings product with loyalty penalty", description: "Assess legacy customers vs new customers and justify pricing." },
          { title: "Insurance add-ons", description: "Evidence that add-ons deliver value for the target market." }
        ],
        visual: {
          type: "process_flow",
          steps: [
            {
              number: 1,
              title: "Define Target Market",
              description: "Clarify who the product is for and who it is not for.",
              examples: ["Target market profile", "Exclusion criteria"],
              redFlags: ["Products sold outside target market", "Weak distribution controls"],
              color: "red"
            },
            {
              number: 2,
              title: "Assess Price vs Benefit",
              description: "Compare total costs with expected benefits and outcomes.",
              examples: ["Fee analysis", "Outcome evidence"],
              redFlags: ["Loyalty penalties", "Hidden fees"],
              color: "amber"
            },
            {
              number: 3,
              title: "Monitor and Adjust",
              description: "Track outcomes and revise pricing or design if needed.",
              examples: ["Regular reviews", "Board reporting"],
              redFlags: ["Repeated complaints", "Declining outcomes"],
              color: "green"
            }
          ]
        }
      }
    },
    {
      id: "understanding-support",
      title: "Consumer Understanding and Support",
      type: "content",
      duration: 8,
      content: {
        learningPoint: "Outcomes depend on communications clarity and friction-free support.",
        mainContent: {
          cards: [
            {
              type: 'keypoint',
              icon: '📝',
              title: 'Consumer Understanding',
              points: [
                'Communications must be clear, timely, tested',
                'Track failure points: onboarding, changes, complaints',
                'Readability testing with real customers',
                'Customer feedback as evidence'
              ]
            },
            {
              type: 'keypoint',
              icon: '🤝',
              title: 'Consumer Support',
              points: [
                'Accessible channels for all customers',
                'Trained staff who can help',
                'Adaptations for vulnerable customers',
                'Friction-free cancellation and complaints'
              ]
            },
            {
              type: 'checklist',
              title: 'Evidence Requirements',
              items: [
                'Readability testing results',
                'Customer feedback analysis',
                'Interaction outcome metrics',
                'Drop-off and failure point tracking'
              ]
            }
          ]
        },
        keyConcepts: [
          { term: "Communications Testing", definition: "Structured testing of clarity and comprehension before release." },
          { term: "Support Accessibility", definition: "Availability of channels that meet customer needs, including vulnerabilities." }
        ],
        realExamples: [
          "Removing jargon from eligibility criteria to reduce decline disputes.",
          "Adding call-back support for vulnerable customers who cannot use digital channels."
        ]
      }
    },
    {
      id: "outcome-testing-remediation",
      title: "Outcome Testing and Remediation",
      type: "content",
      duration: 7,
      content: {
        learningPoint: "Evidence good outcomes with testing, then fix what fails.",
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Implementation Not Complete Until Tested',
              message: 'Proactively identify where customers don\'t understand, where value is weak, or where support barriers cause harm.'
            },
            {
              type: 'infogrid',
              title: 'Testing Methods',
              items: [
                { icon: '📋', label: 'Surveys', description: 'Customer feedback' },
                { icon: '📝', label: 'Comprehension', description: 'Understanding tests' },
                { icon: '🔍', label: 'Mystery Shopping', description: 'Secret testing' },
                { icon: '📊', label: 'Journey Analytics', description: 'Drop-off tracking' }
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Test', description: 'Identify outcome weaknesses' },
                { number: 2, title: 'Document', description: 'Record findings and owners' },
                { number: 3, title: 'Remediate', description: 'Fix the issues' },
                { number: 4, title: 'Re-Test', description: 'Verify improvement' }
              ]
            }
          ]
        },
        keyConcepts: [
          { term: "Outcome Testing", definition: "Structured testing of customer understanding, value, and support outcomes." },
          { term: "Remediation", definition: "Actions taken to improve outcomes once weaknesses are identified." },
          { term: "Journey Analytics", definition: "Tracking drop-off and friction points across customer journeys." }
        ],
        realExamples: [
          "Testing showed customers misunderstood cancellation terms, triggering a rewrite and simplified exit flow.",
          "Complaints analysis found value concerns for legacy customers, leading to a targeted pricing review."
        ]
      }
    },
    {
      id: "governance-mi",
      title: "Governance, MI, and Evidence",
      type: "content",
      duration: 7,
      content: {
        learningPoint: "Boards need outcome-led MI and clear accountability.",
        mainContent: {
          cards: [
            {
              type: 'keypoint',
              icon: '📊',
              title: 'Outcome-Led Governance',
              points: [
                'Assign accountable owners for each outcome',
                'Set review cadences',
                'Require evidence packs',
                'Track outcomes, not just volumes'
              ]
            },
            {
              type: 'infogrid',
              title: 'Example MI Metrics',
              items: [
                { icon: '💰', label: 'Fair Value Deltas', description: 'Benefit vs cost gaps' },
                { icon: '📋', label: 'Complaint Root Causes', description: 'Why customers complain' },
                { icon: '❤️', label: 'Vulnerable Outcomes', description: 'Segment comparison' }
              ]
            },
            {
              type: 'checklist',
              title: 'Evidence Pack Requirements',
              items: [
                'Easy to audit',
                'Links to product decisions',
                'Shows customer impact',
                'Board-ready presentation'
              ]
            }
          ]
        },
        keyConcepts: [
          { term: "Outcome MI", definition: "Measures of customer impact, not just operational throughput." },
          { term: "Accountable Owner", definition: "Senior role responsible for outcome delivery and evidence." }
        ],
        realExamples: [
          "Board receives quarterly outcomes dashboard with commentary and action plans.",
          "Product owners review fair value metrics before pricing changes."
        ]
      }
    }
  ],
  practiceScenarios: [
    {
      id: "consumer-duty-1",
      title: "Pricing Review for Legacy Customers",
      scenario: "A product review shows long-standing customers pay 30% more than new customers for the same service. Retention is high but complaints are rising.",
      question: "What is the best Consumer Duty response?",
      options: [
        { text: "Maintain pricing because retention is strong", isCorrect: false },
        { text: "Conduct a fair value assessment and remediate pricing if outcomes are poor", isCorrect: true },
        { text: "Offer ad-hoc discounts only to those who complain", isCorrect: false }
      ],
      explanation: "Consumer Duty requires fair value evidence for all customers. Targeted discounts after complaints do not address systemic poor value.",
      learningPoints: [
        "Fair value applies across customer cohorts.",
        "Evidence must be documented and reviewed.",
        "Remediation should be systemic, not reactive."
      ]
    },
    {
      id: "consumer-duty-2",
      title: "Communications Clarity",
      scenario: "Customers consistently misunderstand a critical eligibility condition in your onboarding documents.",
      question: "What should you do first?",
      options: [
        { text: "Add a longer legal disclaimer", isCorrect: false },
        { text: "Test and redesign communications to improve comprehension", isCorrect: true },
        { text: "Rely on support staff to explain after onboarding", isCorrect: false }
      ],
      explanation: "Consumer Duty requires communications that enable understanding at the right time. Testing and redesign are required.",
      learningPoints: [
        "Understanding must be designed, not assumed.",
        "Testing with customers is evidence of compliance.",
        "Support cannot compensate for unclear onboarding materials."
      ]
    }
  ],
  assessmentQuestions: [
    {
      id: "consumer-duty-q1",
      question: "Which is the best example of outcome-led MI?",
      options: [
        "Monthly volume of customer support calls",
        "Number of complaints received",
        "Fair value delta for each target market segment",
        "Total revenue per product line"
      ],
      correctAnswer: 2,
      explanation: "Outcome-led MI focuses on customer outcomes such as value delivered to each segment."
    },
    {
      id: "consumer-duty-q2",
      question: "When does a firm meet the Consumer Duty standard?",
      options: [
        "When policies are updated",
        "When evidence shows good outcomes for customers",
        "When complaints volumes decrease",
        "When products are profitable"
      ],
      correctAnswer: 1,
      explanation: "Consumer Duty is evidenced by outcomes, not just policy changes."
    },
    {
      id: "consumer-duty-q3",
      question: "Which action best evidences fair value?",
      options: [
        "Comparing price to benefits for each target market",
        "Increasing fees for loyal customers",
        "Limiting MI to sales volumes only",
        "Relying on historic pricing decisions"
      ],
      correctAnswer: 0,
      explanation: "Fair value evidence requires price-benefit comparisons for each target market."
    },
    {
      id: "consumer-duty-q4",
      question: "How should firms prove communications are clear?",
      options: [
        "Assume clarity if legal wording is present",
        "Test comprehension with the target audience",
        "Only collect staff opinions",
        "Wait for complaints before revising"
      ],
      correctAnswer: 1,
      explanation: "Testing understanding provides evidence that communications are clear."
    },
    {
      id: "consumer-duty-q5",
      question: "Which statement best reflects Consumer Duty governance?",
      options: [
        "Responsibility sits only with the compliance team",
        "The board must review outcomes and hold owners accountable",
        "Duty applies only to new products",
        "Outcome MI is optional if complaints are low"
      ],
      correctAnswer: 1,
      explanation: "Boards are accountable for reviewing outcomes and ensuring owners take action."
    }
  ],
  summary: {
    keyTakeaways: [
      "Consumer Duty is an operational standard requiring evidence of outcomes.",
      "Fair value assessments must compare price to benefits for each target market.",
      "Communications and support must be designed and tested for understanding.",
      "Boards need outcome-led MI and clear accountability.",
      "Vulnerable customer support must be integrated into everyday processes."
    ],
    nextSteps: [
      "Map your products to the four outcomes and assign accountable owners.",
      "Run a fair value assessment using real outcome data.",
      "Design an outcomes dashboard for board review."
    ],
    quickReference: {
      title: "Consumer Duty Implementation Checklist",
      items: [
        { term: "Outcomes Mapping", definition: "Link products and journeys to each Duty outcome." },
        { term: "Fair Value Evidence", definition: "Document price vs benefit for each target market." },
        { term: "Communications Testing", definition: "Prove customers understand key information." },
        { term: "Support Accessibility", definition: "Ensure channels meet vulnerable customer needs." },
        { term: "Outcome MI", definition: "Report outcomes and actions to the board." }
      ]
    }
  },
  visualAssets: {
    diagrams: [
      {
        id: "outcome-map",
        title: "Consumer Duty Outcome Map",
        description: "Linking Principle 12, cross-cutting rules, and the four outcomes.",
        type: "framework"
      },
      {
        id: "governance-loop",
        title: "Governance and MI Loop",
        description: "Outcome monitoring, board review, remediation, and re-testing cycle.",
        type: "process"
      }
    ],
    infographics: [
      {
        id: "fair-value",
        title: "Fair Value Evidence Checklist",
        description: "Key data inputs for fair value assessments and reviews."
      }
    ],
    images: [
      {
        section: "outcomes",
        description: "Outcome dashboard with good/poor outcome comparisons."
      },
      {
        section: "communications",
        description: "Before and after example of simplified customer communication."
      }
    ],
    style: "Customer-first visuals with clear outcome frameworks and evidence cues"
  }
};
