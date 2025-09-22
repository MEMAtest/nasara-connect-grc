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