import { TrainingModule, MicroLesson, BranchingScenario, Assessment } from "../types";

export const moneyLaunderingRedFlagsContent = {
  // Main Training Module
  module: {
    id: "ml_red_flags_module",
    title: "Money Laundering Red Flags: Recognition & Response",
    description: "Master the identification of suspicious activities and appropriate response procedures in financial services",
    category: "mandatory",
    regulatoryArea: "Financial Crime Prevention",
    estimatedDuration: 45,
    difficulty: "intermediate",
    targetPersonas: ["compliance_officer", "risk_analyst", "frontline_kyc", "customer_advisor"],
    learningOutcomes: [
      "Identify 15+ common money laundering red flags across different transaction types",
      "Apply risk-based assessment techniques to suspicious activity",
      "Execute proper escalation procedures within regulatory timeframes",
      "Document findings in compliance with regulatory requirements",
      "Differentiate between legitimate and suspicious transaction patterns"
    ],
    prerequisites: ["aml_fundamentals", "kyc_basics"],
    lessons: ["ml_red_flags_intro", "transaction_patterns", "customer_behavior", "escalation_procedures"]
  } as TrainingModule,

  // Micro-Learning Lessons
  lessons: [
    {
      id: "ml_red_flags_intro",
      title: "Introduction to Money Laundering Red Flags",
      description: "Understanding the fundamentals of suspicious activity identification",
      duration: 8,
      difficulty: "beginner",
      regulatoryArea: "AML/CTF",
      targetPersonas: ["compliance_officer", "frontline_kyc", "customer_advisor"],
      components: {
        hook: {
          duration: 1,
          content: {
            type: "scenario_opener",
            title: "The £50,000 Mystery",
            content: `A customer walks into your branch and wants to deposit £50,000 in cash. They're nervous, avoid eye contact, and can't explain the source clearly. Your gut says something's wrong, but the customer seems legitimate. What's your next move?`,
            visual: {
              type: "illustration",
              src: "suspicious-customer-illustration.svg",
              alt: "Illustration of suspicious customer at bank counter"
            },
            engagement: {
              type: "poll",
              question: "How often do you encounter potentially suspicious transactions?",
              options: ["Daily", "Weekly", "Monthly", "Rarely", "Never"]
            }
          }
        },
        content: {
          duration: 5,
          content: {
            type: "structured_learning",
            sections: [
              {
                title: "What Are Money Laundering Red Flags?",
                content: `Red flags are indicators that suggest a transaction or customer behavior may be linked to money laundering or other financial crimes. Think of them as warning signals that require closer examination.`,
                visual: {
                  type: "infographic",
                  elements: [
                    { icon: "alert-triangle", text: "Warning Signals", color: "red" },
                    { icon: "search", text: "Require Investigation", color: "amber" },
                    { icon: "shield", text: "Protect Institution", color: "green" }
                  ]
                }
              },
              {
                title: "The Three Stages of Money Laundering",
                content: `Understanding how money laundering works helps identify red flags at each stage:`,
                visual: {
                  type: "process_flow",
                  steps: [
                    {
                      number: 1,
                      title: "Placement",
                      description: "Introducing illicit funds into the financial system",
                      examples: ["Large cash deposits", "Structured transactions", "Use of money service businesses"],
                      redFlags: ["Frequent cash deposits just under reporting thresholds", "Reluctance to provide identification"]
                    },
                    {
                      number: 2,
                      title: "Layering",
                      description: "Creating complex layers of transactions to obscure the trail",
                      examples: ["Multiple transfers", "Complex corporate structures", "Cross-border movements"],
                      redFlags: ["Unusual transaction patterns", "Transactions with no clear business purpose"]
                    },
                    {
                      number: 3,
                      title: "Integration",
                      description: "Making laundered money appear legitimate",
                      examples: ["Property purchases", "Business investments", "Luxury goods"],
                      redFlags: ["Transactions inconsistent with customer profile", "Source of wealth unclear"]
                    }
                  ]
                }
              },
              {
                title: "Categories of Red Flags",
                content: `Red flags fall into several key categories:`,
                visual: {
                  type: "category_grid",
                  categories: [
                    {
                      icon: "user",
                      title: "Customer Behavior",
                      description: "How customers act and respond",
                      examples: ["Nervousness", "Avoidance of questions", "Unusual knowledge of AML procedures"]
                    },
                    {
                      icon: "credit-card",
                      title: "Transaction Patterns",
                      description: "Unusual transaction characteristics",
                      examples: ["Structuring", "Round numbers", "Frequent just-below-threshold amounts"]
                    },
                    {
                      icon: "map-pin",
                      title: "Geographic",
                      description: "Location-based concerns",
                      examples: ["High-risk jurisdictions", "Unusual travel patterns", "PEP connections"]
                    },
                    {
                      icon: "briefcase",
                      title: "Business Activity",
                      description: "Commercial red flags",
                      examples: ["Cash-intensive businesses", "Inconsistent business purpose", "Complex ownership"]
                    }
                  ]
                }
              }
            ],
            keyStats: [
              { label: "Cost of ML globally", value: "$2-5 trillion annually", source: "UN Office on Drugs and Crime" },
              { label: "Detection rate", value: "Less than 1%", source: "UNODC" },
              { label: "Average investigation time", value: "6-18 months", source: "ACAMS" }
            ]
          }
        },
        practice: {
          duration: 2,
          content: {
            type: "interactive_scenarios",
            title: "Spot the Red Flags",
            scenarios: [
              {
                id: "scenario_1",
                title: "The Cash Deposit",
                description: "John Smith, a taxi driver, deposits £9,800 in cash every Friday for 6 weeks.",
                options: [
                  { id: "a", text: "Normal for cash business", isCorrect: false },
                  { id: "b", text: "Potential structuring - investigate", isCorrect: true },
                  { id: "c", text: "Below threshold - no action needed", isCorrect: false }
                ],
                feedback: {
                  correct: "Excellent! This pattern suggests structuring to avoid the £10,000 reporting threshold. The consistent amount just below the threshold is a classic red flag.",
                  incorrect: "This is actually a structuring pattern - depositing amounts just below reporting thresholds to avoid detection. The consistency and timing are key indicators."
                }
              },
              {
                id: "scenario_2",
                title: "The Nervous Customer",
                description: "A well-dressed woman wants to wire £25,000 to Dubai. She's agitated when asked about the purpose and source of funds.",
                options: [
                  { id: "a", text: "Complete transaction - amount is legal", isCorrect: false },
                  { id: "b", text: "Refuse transaction due to behavior", isCorrect: false },
                  { id: "c", text: "Gather more information and escalate if needed", isCorrect: true }
                ],
                feedback: {
                  correct: "Correct! Nervousness combined with reluctance to explain the transaction purpose requires further investigation without refusing service prematurely.",
                  incorrect: "Customer behavior combined with inability to explain the transaction purpose should trigger enhanced due diligence before proceeding."
                }
              }
            ]
          }
        },
        summary: {
          duration: 1,
          content: {
            type: "key_takeaways",
            title: "Key Takeaways: Money Laundering Red Flags",
            takeaways: [
              {
                icon: "alert-triangle",
                title: "Trust Your Instincts",
                description: "If something feels wrong, investigate further. Your experience and intuition are valuable tools."
              },
              {
                icon: "search",
                title: "Look for Patterns",
                description: "Single transactions may seem normal, but patterns over time often reveal suspicious activity."
              },
              {
                icon: "clock",
                title: "Act Quickly",
                description: "Report suspicious activities within required timeframes - usually within 24-48 hours."
              },
              {
                icon: "shield",
                title: "Document Everything",
                description: "Detailed documentation protects you and your institution while supporting investigations."
              }
            ],
            nextSteps: [
              "Continue to 'Transaction Pattern Analysis'",
              "Take the Red Flags Knowledge Check",
              "Review your institution's SAR filing procedures"
            ],
            resources: [
              { title: "FCA Financial Crime Guide", type: "pdf", url: "#" },
              { title: "JMLSG Guidance", type: "external", url: "#" },
              { title: "Red Flags Quick Reference Card", type: "download", url: "#" }
            ]
          }
        }
      }
    } as MicroLesson,

    {
      id: "transaction_patterns",
      title: "Suspicious Transaction Pattern Analysis",
      description: "Deep dive into identifying unusual transaction patterns and behaviors",
      duration: 12,
      difficulty: "intermediate",
      regulatoryArea: "AML/CTF",
      targetPersonas: ["compliance_officer", "risk_analyst", "frontline_kyc"],
      components: {
        hook: {
          duration: 1,
          content: {
            type: "case_study_opener",
            title: "The Pattern That Caught Everyone",
            content: `In 2023, a UK bank identified a £2.3 million money laundering scheme by spotting one simple pattern: customers making deposits of exactly £9,950 every Tuesday and Thursday. The pattern seemed innocent until someone looked at the bigger picture.`,
            visual: {
              type: "data_visualization",
              chartType: "timeline",
              data: "transaction_pattern_example.json"
            }
          }
        },
        content: {
          duration: 8,
          content: {
            type: "structured_learning",
            sections: [
              {
                title: "Common Suspicious Transaction Patterns",
                content: `Learn to identify the most common patterns that indicate potential money laundering:`,
                visual: {
                  type: "pattern_gallery",
                  patterns: [
                    {
                      name: "Structuring (Smurfing)",
                      description: "Breaking large amounts into smaller transactions to avoid reporting thresholds",
                      examples: [
                        "Multiple deposits of £9,900 when threshold is £10,000",
                        "Several customers depositing similar amounts at same time",
                        "Transactions just below CTR thresholds"
                      ],
                      visualization: {
                        type: "bar_chart",
                        data: [9900, 9800, 9950, 9850, 9900],
                        threshold: 10000,
                        highlight: "below_threshold"
                      }
                    },
                    {
                      name: "Rapid Movement",
                      description: "Funds moved quickly between accounts or jurisdictions",
                      examples: [
                        "Deposit followed by immediate withdrawal",
                        "Funds moved to multiple accounts within hours",
                        "Cross-border transfers with quick return"
                      ],
                      visualization: {
                        type: "network_diagram",
                        nodes: ["Account A", "Account B", "Account C", "International"],
                        connections: ["rapid_transfers"]
                      }
                    },
                    {
                      name: "Round Number Syndrome",
                      description: "Unusual preference for round numbers in transactions",
                      examples: [
                        "Always £5,000, £10,000, £25,000",
                        "Avoidance of odd amounts",
                        "Consistent use of specific denominations"
                      ],
                      visualization: {
                        type: "number_pattern",
                        amounts: [5000, 10000, 15000, 20000, 25000],
                        highlight: "round_numbers"
                      }
                    },
                    {
                      name: "Geographic Anomalies",
                      description: "Transactions inconsistent with customer's location or business",
                      examples: [
                        "UK customer with frequent transfers to high-risk countries",
                        "Rural customer with international wire activity",
                        "Domestic business with unexplained offshore transactions"
                      ],
                      visualization: {
                        type: "world_map",
                        highlighting: ["high_risk_jurisdictions", "unusual_patterns"]
                      }
                    }
                  ]
                }
              },
              {
                title: "Customer Behavior Red Flags",
                content: `Beyond transactions, customer behavior provides crucial indicators:`,
                visual: {
                  type: "behavior_indicators",
                  categories: [
                    {
                      title: "Communication Red Flags",
                      indicators: [
                        { behavior: "Reluctance to provide information", risk: "high", explanation: "Legitimate customers usually cooperate with standard questions" },
                        { behavior: "Unusual knowledge of AML procedures", risk: "medium", explanation: "May indicate previous encounters with compliance procedures" },
                        { behavior: "Nervousness or anxiety", risk: "medium", explanation: "Could indicate concern about scrutiny" },
                        { behavior: "Avoiding face-to-face meetings", risk: "medium", explanation: "May be trying to avoid identification" }
                      ]
                    },
                    {
                      title: "Documentation Issues",
                      indicators: [
                        { behavior: "Poor quality or suspicious documents", risk: "high", explanation: "May indicate identity theft or fraud" },
                        { behavior: "Reluctance to provide standard documentation", risk: "high", explanation: "Required documents should be readily available" },
                        { behavior: "Documents that don't match stated business", risk: "high", explanation: "Inconsistencies may indicate deception" }
                      ]
                    }
                  ]
                }
              },
              {
                title: "Industry-Specific Red Flags",
                content: `Different business types have unique red flag patterns:`,
                visual: {
                  type: "industry_matrix",
                  industries: [
                    {
                      name: "Cash-Intensive Businesses",
                      examples: ["Restaurants", "Retail", "Car washes", "Laundromats"],
                      commonRedFlags: [
                        "Revenue inconsistent with size/location",
                        "Excessive cash deposits",
                        "Deposits that don't match reported sales patterns",
                        "Unusual employee payment methods"
                      ],
                      riskLevel: "high"
                    },
                    {
                      name: "Import/Export",
                      examples: ["Trading companies", "Logistics", "Shipping"],
                      commonRedFlags: [
                        "Trade with high-risk countries",
                        "Values inconsistent with goods described",
                        "Unusual payment terms or methods",
                        "Complex ownership structures"
                      ],
                      riskLevel: "high"
                    },
                    {
                      name: "Professional Services",
                      examples: ["Legal", "Accounting", "Consultancy"],
                      commonRedFlags: [
                        "Client identity not verified",
                        "Transactions not related to stated services",
                        "Unusual fee structures",
                        "Complex trust or corporate arrangements"
                      ],
                      riskLevel: "medium"
                    }
                  ]
                }
              }
            ]
          }
        },
        practice: {
          duration: 3,
          content: {
            type: "pattern_analysis_exercise",
            title: "Transaction Pattern Detective",
            description: "Analyze real transaction patterns and identify suspicious activity",
            exercises: [
              {
                id: "exercise_1",
                title: "The Convenience Store Chain",
                customerProfile: {
                  name: "QuickMart Ltd",
                  business: "Convenience store chain (5 locations)",
                  accountType: "Business current account",
                  monthlyTurnover: "£50,000 - £75,000",
                  riskRating: "Medium"
                },
                transactionData: [
                  { date: "2024-01-02", type: "Cash Deposit", amount: 12000, location: "Branch A" },
                  { date: "2024-01-03", type: "Cash Deposit", amount: 11800, location: "Branch B" },
                  { date: "2024-01-04", type: "Cash Deposit", amount: 12200, location: "Branch A" },
                  { date: "2024-01-05", type: "Wire Transfer", amount: 35000, destination: "Dubai, UAE", purpose: "Equipment purchase" },
                  { date: "2024-01-08", type: "Cash Deposit", amount: 11900, location: "Branch C" },
                  { date: "2024-01-09", type: "Cash Deposit", amount: 12100, location: "Branch A" }
                ],
                questions: [
                  {
                    question: "What patterns do you notice in the deposits?",
                    type: "multiple_choice",
                    options: [
                      "Normal daily deposits for a convenience store",
                      "Consistent amounts suggest possible structuring",
                      "Deposits are too small to be suspicious",
                      "Pattern suggests strong cash management"
                    ],
                    correct: 1
                  },
                  {
                    question: "What's concerning about the wire transfer?",
                    type: "multiple_choice",
                    options: [
                      "Amount is too large for the business",
                      "Destination is a high-risk jurisdiction",
                      "Purpose doesn't clearly match business needs",
                      "All of the above"
                    ],
                    correct: 3
                  }
                ],
                analysis: {
                  title: "Pattern Analysis",
                  findings: [
                    "Deposits show unusual consistency in amounts (£11,800-£12,200)",
                    "All deposits are just above £10,000 - possible reverse structuring",
                    "Wire transfer to UAE for 'equipment' lacks supporting documentation",
                    "Transfer amount represents nearly 50% of monthly turnover"
                  ],
                  recommendation: "File SAR - combination of structured deposits and suspicious international transfer",
                  learningPoints: [
                    "Structuring can work both ways - staying just above thresholds can also be suspicious",
                    "International transfers require enhanced scrutiny for cash-intensive businesses",
                    "Business equipment purchases should have supporting documentation"
                  ]
                }
              }
            ]
          }
        },
        summary: {
          duration: 1,
          content: {
            type: "pattern_recognition_summary",
            title: "Master Pattern Recognition",
            keyPatterns: [
              { name: "Structuring", frequency: "Most common", detectability: "Medium", impact: "High" },
              { name: "Rapid movement", frequency: "Common", detectability: "Easy", impact: "High" },
              { name: "Round numbers", frequency: "Common", detectability: "Easy", impact: "Medium" },
              { name: "Geographic anomalies", frequency: "Less common", detectability: "Hard", impact: "Very high" }
            ],
            practicalTips: [
              "Use transaction monitoring systems effectively",
              "Look for patterns across time periods",
              "Consider customer context and business type",
              "Document your analysis thoroughly"
            ]
          }
        }
      }
    } as MicroLesson
  ],

  // Branching Scenario
  scenario: {
    id: "ml_investigation_scenario",
    title: "The Suspicious Cash Business Investigation",
    description: "Navigate a complex money laundering investigation involving a cash-intensive business",
    difficulty: "advanced",
    estimatedDuration: 20,
    regulatoryArea: "AML/CTF",
    context: {
      situation: `You're a compliance officer at a regional bank. A customer, "Fresh Fish Ltd," has been banking with you for 18 months. They operate 3 fish and chip shops and typically deposit £15,000-£20,000 in cash weekly.

      Recently, you've noticed some changes:
      - Deposits have increased to £35,000-£40,000 weekly
      - The owner seems nervous during visits
      - There are rumors of new competition reducing their customer base
      - They've started asking about international wire transfer procedures`,
      role: "Senior Compliance Officer",
      objective: "Determine whether this situation requires a Suspicious Activity Report (SAR) and take appropriate action",
      constraints: [
        "Must maintain customer confidentiality",
        "Cannot tip off the customer to any investigation",
        "Must follow FCA reporting requirements",
        "Have 48 hours to decide on SAR filing"
      ]
    },
    decisionPoints: [
      {
        id: "initial_assessment",
        prompt: "Based on the initial information, what's your first step?",
        timeLimit: 120,
        options: [
          {
            id: "immediate_sar",
            text: "File a SAR immediately - the pattern is clearly suspicious",
            nextDecision: "sar_consequences",
            consequence: {
              immediate: "You file a SAR without further investigation",
              downstream: "The investigation reveals the business legitimately expanded but you've wasted resources and potentially damaged the customer relationship with premature reporting",
              complianceImpact: "risky",
              learningPoint: "Premature SAR filing without proper investigation can be counterproductive. Always gather sufficient evidence first."
            }
          },
          {
            id: "gather_information",
            text: "Gather more information before making a decision",
            nextDecision: "information_gathering",
            consequence: {
              immediate: "You decide to conduct enhanced due diligence",
              downstream: "This measured approach allows you to build a complete picture before making decisions",
              complianceImpact: "compliant",
              learningPoint: "Enhanced due diligence helps distinguish between legitimate business changes and suspicious activity."
            }
          },
          {
            id: "ignore_changes",
            text: "The changes aren't significant enough to warrant concern",
            nextDecision: "ignore_consequences",
            consequence: {
              immediate: "You decide no action is necessary",
              downstream: "You miss critical red flags and potentially allow money laundering to continue undetected",
              complianceImpact: "breach",
              learningPoint: "Ignoring significant changes in customer behavior can lead to regulatory breaches and facilitating financial crime."
            }
          }
        ]
      },
      {
        id: "information_gathering",
        prompt: "What information should you gather first?",
        timeLimit: 90,
        options: [
          {
            id: "transaction_analysis",
            text: "Analyze detailed transaction patterns over the past 6 months",
            nextDecision: "pattern_discovery",
            consequence: {
              immediate: "You discover the deposits started increasing exactly when a new staff member joined",
              downstream: "Transaction analysis reveals structured deposit patterns that suggest potential money laundering",
              complianceImpact: "compliant",
              learningPoint: "Detailed transaction analysis often reveals patterns not visible in summary reviews."
            }
          },
          {
            id: "customer_interview",
            text: "Arrange a meeting with the customer to discuss their business",
            nextDecision: "interview_outcomes",
            consequence: {
              immediate: "The customer becomes defensive and nervous during questioning",
              downstream: "Direct questioning may tip off the customer and could constitute tipping off if done improperly",
              complianceImpact: "risky",
              learningPoint: "Customer interviews must be conducted carefully to avoid tipping off during investigations."
            }
          }
        ]
      }
    ],
    scoring: {
      optimalPath: ["gather_information", "transaction_analysis", "file_detailed_sar"],
      acceptablePaths: [
        ["gather_information", "transaction_analysis", "enhanced_monitoring"],
        ["gather_information", "customer_interview", "file_sar_with_caution"]
      ],
      learningObjectivesMet: {
        "proper_investigation_procedure": true,
        "sar_filing_decision_making": true,
        "avoiding_tipping_off": true,
        "documentation_requirements": true
      }
    }
  } as BranchingScenario,

  // Assessment
  assessment: {
    id: "ml_red_flags_assessment",
    title: "Money Laundering Red Flags Competency Assessment",
    description: "Comprehensive assessment of your ability to identify and respond to money laundering red flags",
    difficulty: "intermediate",
    timeLimit: 25,
    passingScore: 80,
    regulatoryArea: "AML/CTF",
    targetPersonas: ["compliance_officer", "risk_analyst", "frontline_kyc"],
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "A customer regularly deposits £9,800 in cash every Friday for 8 weeks. What type of red flag is this most likely indicating?",
        options: [
          "Normal business activity for a cash-intensive business",
          "Structuring to avoid currency transaction reporting requirements",
          "Poor cash flow management",
          "Evidence of tax evasion"
        ],
        correctAnswer: 1,
        explanation: "This pattern of consistent deposits just below the £10,000 reporting threshold is a classic example of structuring (also known as smurfing), designed to avoid currency transaction reporting requirements.",
        points: 5,
        category: "pattern_recognition"
      },
      {
        id: "q2",
        type: "scenario_based",
        scenario: "A well-dressed businessman wants to wire £75,000 to three different accounts in Dubai within the same day. When asked about the business purpose, he becomes agitated and says it's for 'investment opportunities' but can't provide specifics.",
        question: "What should be your immediate response?",
        options: [
          "Complete the transactions as the amount is legal",
          "Refuse all transactions due to the customer's behavior",
          "Process one transaction and require more documentation for the others",
          "Gather enhanced due diligence information and escalate for review"
        ],
        correctAnswer: 3,
        explanation: "The combination of large amounts, multiple international transfers, vague business purpose, and defensive behavior requires enhanced due diligence and escalation. Refusing service without proper investigation could be discriminatory, while processing without review could facilitate money laundering.",
        points: 8,
        category: "response_procedures"
      }
    ]
  } as Assessment
};

export const moneyLaunderingRedFlagsModule: TrainingModule = {
  id: "money-laundering-red-flags",
  title: "Money Laundering Red Flags: Recognition and Response",
  description: "Identify suspicious patterns quickly and respond with the right escalation steps and documentation.",
  category: "financial-crime-prevention",
  duration: 45,
  difficulty: "intermediate",
  targetPersonas: ["compliance-officer", "kyc-specialist", "relationship-manager", "operations-staff"],
  prerequisiteModules: ["aml-fundamentals", "kyc-fundamentals"],
  tags: ["aml", "red-flags", "structuring", "suspicious-activity", "escalation"],
  learningOutcomes: [
    "Identify common transaction, behavior, and geographic red flags across customer journeys",
    "Apply a risk-based approach to determine when enhanced due diligence is required",
    "Document red flag indicators to support escalation and investigation",
    "Know when and how to involve the MLRO and file internal SARs",
    "Distinguish isolated anomalies from emerging suspicious patterns"
  ],
  hook: {
    title: "The GBP 50,000 Cash Deposit",
    content: "A customer arrives with GBP 50,000 in cash and wants it deposited immediately. They avoid questions about source of funds and want to split deposits across two accounts. It might be legitimate, but the pattern and behavior are classic red flags. Your response now protects the firm and the financial system.",
    statistic: "Firms that spot structuring early reduce suspicious transaction exposure by up to 60%."
  },
  lessons: [
    {
      id: "red-flag-categories",
      title: "Red Flag Categories and What They Signal",
      type: "content",
      duration: 12,
      content: {
        learningPoint: "Red flags cluster around customer behavior, transactions, geography, and business activity.",
        mainContent: "Red flags are not proof of laundering on their own. They are signals that warrant scrutiny, proportional investigation, and documentation. The most reliable indicators appear as patterns across time, channels, or related parties.\n\nA good red flag framework helps front-line staff recognize risk without over-escalating. Focus on the intersection between unusual behavior and inconsistency with the customer profile, declared purpose, and expected activity.",
        keyConcepts: [
          { term: "Behavioral Red Flag", definition: "Unusual customer conduct such as urgency, evasiveness, or reluctance to provide details." },
          { term: "Transaction Red Flag", definition: "Patterns like structuring, rapid movement, or round-number activity that avoids thresholds." },
          { term: "Geographic Red Flag", definition: "Connections to high-risk jurisdictions or unusual cross-border flows." },
          { term: "Business Red Flag", definition: "Commercial activity inconsistent with stated business model or financial position." }
        ],
        realExamples: [
          "Customer insists on cash deposits split across multiple accounts with no clear reason.",
          "Business account receives large international transfers that do not align with stated services."
        ],
        visual: {
          type: "category_grid",
          categories: [
            {
              icon: "user",
              title: "Customer Behavior",
              description: "Signals from how the customer acts and responds.",
              examples: ["Evasive answers", "Unusual urgency", "Reluctance to show source of funds"],
              riskLevel: "medium"
            },
            {
              icon: "credit-card",
              title: "Transaction Patterns",
              description: "Suspicious timing, size, or frequency of payments.",
              examples: ["Structuring near thresholds", "Rapid in-and-out transfers", "Round-number activity"],
              riskLevel: "high"
            },
            {
              icon: "map-pin",
              title: "Geographic Risk",
              description: "Links to high-risk or sanctioned jurisdictions.",
              examples: ["High-risk countries", "Unusual cross-border activity", "PEP connections"],
              riskLevel: "high"
            },
            {
              icon: "briefcase",
              title: "Business Activity",
              description: "Commercial activity inconsistent with purpose.",
              examples: ["Cash-intensive without rationale", "Complex ownership", "No clear economic purpose"],
              riskLevel: "medium"
            }
          ]
        }
      }
    },
    {
      id: "transaction-patterns",
      title: "Transaction Pattern Indicators",
      type: "content",
      duration: 12,
      content: {
        learningPoint: "Look for structuring, rapid movement, and inconsistent activity versus the customer profile.",
        mainContent: "Patterns matter more than single anomalies. Transactions just below thresholds, rapid movement between related accounts, or repeated round-number transfers suggest intent to avoid scrutiny. Use customer profiles and risk ratings to compare expected versus observed behavior.\n\nEnsure alerts are documented with time, channel, amount, and rationale for escalation. This makes internal reviews faster and supports any SAR decision.",
        keyConcepts: [
          { term: "Structuring", definition: "Breaking transactions into smaller amounts to avoid reporting thresholds." },
          { term: "Rapid Movement", definition: "Funds moved quickly across accounts with no clear purpose." },
          { term: "Round-Number Activity", definition: "Repeated transfers of uniform, rounded amounts." }
        ],
        realExamples: [
          { title: "Weekly GBP 9,900 cash deposits", description: "Regular deposits just below reporting thresholds." },
          { title: "Immediate outbound transfers", description: "Incoming funds moved out within hours to multiple destinations." }
        ],
        visual: {
          type: "process_flow",
          steps: [
            {
              number: 1,
              title: "Detect the Pattern",
              description: "Spot recurring amounts, timing, or counterparties.",
              examples: ["Repeated GBP 9,900 deposits", "Same-day withdrawals after transfers"],
              redFlags: ["Multiple deposits just below thresholds", "No clear business rationale"],
              color: "red"
            },
            {
              number: 2,
              title: "Compare to Profile",
              description: "Check stated purpose, expected activity, and source of funds.",
              examples: ["Declared income vs cash volume", "Business model vs payment flows"],
              redFlags: ["Activity exceeds stated profile", "Sudden spikes with no explanation"],
              color: "amber"
            },
            {
              number: 3,
              title: "Document and Escalate",
              description: "Record evidence and route to MLRO or compliance.",
              examples: ["Attach account history", "Note customer responses"],
              redFlags: ["Customer refuses source of funds details", "Attempts to split transactions"],
              color: "green"
            }
          ]
        }
      }
    },
    {
      id: "customer-behavior",
      title: "Customer Behavior and Documentation",
      type: "content",
      duration: 10,
      content: {
        learningPoint: "Behavioral cues matter when combined with transaction facts and documentation gaps.",
        mainContent: "Customers who are evasive, unusually urgent, or inconsistent in their explanations should trigger enhanced questioning. Be professional and neutral, focusing on factual clarifications.\n\nDocumentation is critical. Record what was asked, what was provided, and any inconsistencies. Clear documentation supports escalation decisions and protects staff.",
        keyConcepts: [
          { term: "Enhanced Due Diligence", definition: "Additional checks required for higher-risk customers or transactions." },
          { term: "Source of Funds", definition: "Where the money for a transaction comes from." },
          { term: "Source of Wealth", definition: "How a customer accumulated overall wealth." }
        ],
        realExamples: [
          "Customer refuses to provide any documentation for a large cash deposit.",
          "Customer provides contradictory explanations for transaction purpose."
        ],
        visual: {
          type: "infographic",
          elements: [
            { icon: "alert-triangle", text: "Evasive answers", description: "Avoids or deflects source of funds questions", color: "red" },
            { icon: "search", text: "Documentation gaps", description: "Missing or inconsistent evidence of funds", color: "amber" },
            { icon: "shield", text: "Neutral escalation", description: "Document facts and refer to MLRO", color: "green" }
          ]
        }
      }
    },
    {
      id: "geography-channel-risk",
      title: "Geographic and Channel Risk Signals",
      type: "content",
      duration: 10,
      content: {
        learningPoint: "Cross-border patterns and channel shifts can reveal hidden risk.",
        mainContent: "Geographic and channel red flags are often overlooked because they look like operational quirks. They are not. Sudden shifts in country exposure, counterparties in high-risk jurisdictions, or unusual channel usage can signal layering and concealment.\n\nPay close attention to destination countries, corridor changes, and the use of intermediaries or payment service providers. These patterns are rarely random and should be assessed against the customer's stated business model and expected activity.",
        keyConcepts: [
          { term: "High-Risk Jurisdiction", definition: "Countries with weak AML controls or higher corruption risk." },
          { term: "Channel Shift", definition: "Unexpected change in the way a customer moves funds or accesses services." },
          { term: "Corridor Risk", definition: "Concentration of transfers to high-risk destinations or new corridors." }
        ],
        realExamples: [
          "A local retailer begins sending weekly transfers to multiple high-risk jurisdictions with no trade documentation.",
          "Customer moves from card transfers to cash deposits and international wires in a short period.",
          "Payments routed through multiple intermediaries without a clear business purpose."
        ],
        visual: {
          type: "process_flow",
          steps: [
            {
              number: 1,
              title: "Identify the Shift",
              description: "Spot sudden changes in destination countries or channels.",
              examples: ["New high-risk corridors", "New intermediaries"],
              redFlags: ["No change in stated business purpose"],
              color: "red"
            },
            {
              number: 2,
              title: "Validate the Rationale",
              description: "Check for trade, invoice, or contractual evidence.",
              examples: ["Trade documents", "Counterparty contracts"],
              redFlags: ["Vague or missing evidence"],
              color: "amber"
            },
            {
              number: 3,
              title: "Document and Escalate",
              description: "Record facts and escalate if inconsistency remains.",
              examples: ["Alert notes", "Internal SAR draft"],
              redFlags: ["Repeated unexplained changes"],
              color: "green"
            }
          ]
        }
      }
    },
    {
      id: "escalation-and-reporting",
      title: "Escalation and Reporting",
      type: "content",
      duration: 11,
      content: {
        learningPoint: "Escalation is about evidence, not accusation.",
        mainContent: "Escalate when red flags persist or when documentation does not support the transaction. Use internal SAR processes, provide factual narratives, and avoid tipping off customers.\n\nGood escalation includes what you observed, why it is inconsistent, and what evidence was reviewed. This helps MLROs make timely, defensible decisions.",
        keyConcepts: [
          { term: "Internal SAR", definition: "Report to MLRO describing suspicious activity and rationale." },
          { term: "Tipping Off", definition: "Warning a customer about a suspicion or SAR, which is prohibited." }
        ],
        realExamples: [
          { title: "Cash deposits with no source evidence", description: "Escalate with transaction history and customer responses." },
          { title: "Cross-border transfers to unrelated parties", description: "Document counterparties and pattern evidence." }
        ]
      }
    }
  ],
  practiceScenarios: [
    {
      id: "ml-red-flags-1",
      title: "Structured Cash Deposits",
      scenario: "A customer deposits GBP 9,800 in cash every Friday for six weeks. They say it is from a small retail business, but cannot provide any invoices or sales records.",
      question: "What is the best next step?",
      options: [
        { text: "Accept the deposits and note the explanation", isCorrect: false },
        { text: "Escalate for review with documented pattern evidence", isCorrect: true },
        { text: "Refuse all deposits immediately", isCorrect: false }
      ],
      explanation: "The consistent deposits just below thresholds suggest structuring. Escalate with evidence rather than refusing service.",
      learningPoints: [
        "Patterns matter more than single transactions.",
        "Document evidence before escalation.",
        "Avoid tipping off the customer."
      ]
    },
    {
      id: "ml-red-flags-2",
      title: "Rapid International Transfers",
      scenario: "A customer receives a GBP 75,000 transfer and moves the funds out to three offshore accounts within 24 hours, citing 'investment opportunities.'",
      question: "What should you do?",
      options: [
        { text: "Allow the transfer because the funds are already in the account", isCorrect: false },
        { text: "Request documentation and escalate if the rationale is unclear", isCorrect: true },
        { text: "Block the account without review", isCorrect: false }
      ],
      explanation: "Rapid movement and vague purpose are high-risk indicators. Escalate with documentation and rationale.",
      learningPoints: [
        "Rapid movement with unclear purpose is high risk.",
        "Gather evidence and follow escalation procedures.",
        "Stay neutral and factual in customer communications."
      ]
    }
  ],
  assessmentQuestions: [
    {
      id: "ml-red-flags-q1",
      question: "Which pattern is most indicative of structuring?",
      options: [
        "One-off large payment with full documentation",
        "Regular deposits just below a reporting threshold",
        "Monthly payroll deposits from a known employer",
        "A single transfer to a long-standing supplier"
      ],
      correctAnswer: 1,
      explanation: "Repeated deposits just below thresholds are a classic structuring indicator."
    },
    {
      id: "ml-red-flags-q2",
      question: "What should an internal SAR include?",
      options: [
        "Only the transaction amount and date",
        "Your opinion of the customer",
        "Factual observations, evidence, and rationale for concern",
        "A request for customer termination"
      ],
      correctAnswer: 2,
      explanation: "Internal SARs must be factual, evidence-based, and focused on observations and rationale."
    }
  ],
  summary: {
    keyTakeaways: [
      "Red flags are signals that require evidence-based review, not immediate conclusions.",
      "Patterns across time and channels are stronger indicators than isolated events.",
      "Documenting evidence and rationale supports defensible escalation decisions.",
      "Neutral communication and anti-tipping safeguards protect staff and the firm."
    ],
    nextSteps: [
      "Review your firm's internal SAR workflow and escalation SLAs.",
      "Align transaction monitoring thresholds with risk appetite.",
      "Complete the SARs training module for escalation documentation standards."
    ],
    quickReference: {
      title: "Red Flag Quick Reference",
      items: [
        { term: "Structuring", definition: "Repeated transactions just below reporting thresholds." },
        { term: "Rapid Movement", definition: "Funds moved out quickly without clear business purpose." },
        { term: "Behavioral Cues", definition: "Evasiveness, urgency, or inconsistent explanations." },
        { term: "Escalation Trigger", definition: "Patterned red flags with missing or weak evidence." }
      ]
    }
  },
  visualAssets: {
    diagrams: [
      {
        id: "red-flag-decision-tree",
        title: "Red Flag Decision Tree",
        description: "Visual flow from detection to documentation to MLRO escalation.",
        type: "process"
      },
      {
        id: "escalation-steps",
        title: "Escalation Steps",
        description: "Checklist of evidence required before submitting an internal SAR.",
        type: "checklist"
      }
    ],
    infographics: [
      {
        id: "transaction-patterns",
        title: "Transaction Pattern Indicators",
        description: "Structuring, rapid movement, round-number activity, and counterparty risk."
      }
    ],
    images: [
      {
        section: "scenarios",
        description: "Scenario board highlighting common cash and international transfer red flags."
      },
      {
        section: "documentation",
        description: "Annotated example of a well-documented escalation note."
      }
    ],
    style: "Professional AML visuals with clear risk indicators and escalation flows"
  }
};
