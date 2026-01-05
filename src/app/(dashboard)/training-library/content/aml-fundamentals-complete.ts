import { TrainingModule, MicroLesson, Assessment } from "../types";

export const amlFundamentalsContent = {
  module: {
    id: "aml_fundamentals_complete",
    title: "Anti-Money Laundering (AML) Fundamentals",
    description: "Master the foundations of AML compliance, understand the three stages of money laundering, and learn your critical role in protecting the financial system",
    category: "mandatory",
    regulatoryArea: "Anti-Money Laundering",
    estimatedDuration: 15,
    difficulty: "beginner",
    targetPersonas: ["all_staff", "compliance_officer", "frontline_kyc", "customer_advisor", "operations_staff"],
    learningOutcomes: [
      "Define money laundering and identify its three distinct stages",
      "Understand the key UK regulations that govern our AML efforts",
      "Explain the firm's Risk-Based Approach (RBA) to AML",
      "Identify the role and responsibilities of the Money Laundering Reporting Officer (MLRO)",
      "Recognise your personal duty to report suspicious activity internally"
    ],
    prerequisites: [],
    lessons: ["aml_fundamentals_main"]
  } as TrainingModule,

  lesson: {
    id: "aml_fundamentals_main",
    title: "AML Fundamentals: Your Role in Fighting Financial Crime",
    description: "Understand money laundering, regulatory requirements, and your critical responsibilities",
    duration: 15,
    difficulty: "beginner",
    regulatoryArea: "Anti-Money Laundering",
    targetPersonas: ["all_staff", "compliance_officer", "frontline_kyc", "customer_advisor"],
    components: {
      hook: {
        duration: 2,
        content: {
          type: "shocking_reality",
          title: "The £100 Billion Crime Hidden in Plain Sight",
          content: `Every year, up to £100 billion from drug trafficking, human slavery, and terrorist attacks is laundered through the UK. This isn't just a number; it's the lifeblood of organised crime.

          Criminals need to make this 'dirty' money look clean, and they will try to use firms just like ours to do it. We are the gatekeepers and the first line of defence.

          What you do every day, the details you notice, and the questions you ask—it all matters. This training isn't just about rules; it's about understanding your role in a much bigger fight.`,
          visual: {
            type: "impact_statistics",
            stats: [
              { value: "£100bn", label: "Laundered through UK annually", color: "red" },
              { value: "£264m", label: "NatWest fine in 2021", color: "amber" },
              { value: "£365m", label: "Suspicious deposits missed", color: "red" },
              { value: "You", label: "Are the first line of defence", color: "emerald" }
            ]
          },
          realWorldExample: {
            title: "The NatWest Fine: A Cautionary Tale",
            content: `In December 2021, the FCA fined NatWest Bank over £264 million for failing to comply with money laundering regulations. The bank's systems failed to properly monitor and scrutinise suspicious activity in a customer's account, which saw around £365 million deposited, including £264 million in cash.

            This case shows the severe consequences—not just financial, but reputational—of failing to implement and follow effective AML controls. It's a stark reminder that these rules have real-world impact.`,
            impact: "Largest AML fine in UK history",
            lesson: "Effective monitoring and reporting systems are critical"
          }
        }
      },
      content: {
        duration: 10,
        content: {
          type: "structured_learning",
          sections: [
            {
              title: "Understanding Money Laundering: The Criminal Process",
              content: `Money Laundering is the process of taking criminal proceeds ("dirty money") and making them appear legitimate ("clean money"). It's a vital step for criminals, allowing them to use the profits of their crimes without drawing attention to the illegal source.

              Closely related is Terrorist Financing, which involves providing funds for terrorist activities, even if the source of the money is legitimate.`,
              visual: {
                type: "three_stages_process",
                title: "The Three Stages of Money Laundering",
                stages: [
                  {
                    number: 1,
                    title: "Placement",
                    description: "Introducing illegal funds into the financial system",
                    details: "This is the first and riskiest step for criminals. They introduce their illegal funds into the financial system through cash deposits, buying foreign currency, or mixing cash with legitimate business proceeds.",
                    examples: [
                      "Large cash deposits just under reporting thresholds",
                      "Buying foreign currency with cash",
                      "Mixing illegal cash with legitimate business revenue"
                    ],
                    riskLevel: "high",
                    icon: "banknotes",
                    color: "red"
                  },
                  {
                    number: 2,
                    title: "Layering",
                    description: "Creating complex webs to obscure money's origin",
                    details: "The goal is to make the audit trail as confusing as possible. Criminals create complex webs of transactions, often across multiple jurisdictions, through various banks and shell companies.",
                    examples: [
                      "Moving funds between multiple banks",
                      "Creating shell companies for transactions",
                      "Buying and selling high-value assets",
                      "Complex cross-border transfers"
                    ],
                    riskLevel: "medium",
                    icon: "network",
                    color: "amber"
                  },
                  {
                    number: 3,
                    title: "Integration",
                    description: "Returning 'clean' money from seemingly legitimate sources",
                    details: "The laundered money is returned to the criminal from what appear to be legitimate sources. The money is now 'clean' and can be used freely without suspicion.",
                    examples: [
                      "Fake invoices for services never provided",
                      "Property sales at inflated prices",
                      "Dividend payments from shell companies",
                      "Salary payments from fake employment"
                    ],
                    riskLevel: "low",
                    icon: "building",
                    color: "green"
                  }
                ]
              },
              keyStatistics: [
                { stat: "Less than 1%", description: "of laundered money is successfully recovered globally" },
                { stat: "2-5%", description: "of global GDP is estimated to be laundered annually" },
                { stat: "£100bn", description: "estimated amount laundered through UK each year" }
              ]
            },
            {
              title: "UK Regulatory Framework: The Legal Foundation",
              content: `Our firm's AML framework is built upon a complex web of UK law and guidance. It is critical to understand that this is not just FCA rules, but criminal law with serious personal and corporate consequences.`,
              visual: {
                type: "regulatory_framework",
                title: "Key UK AML Regulations",
                regulations: [
                  {
                    name: "Proceeds of Crime Act 2002 (POCA)",
                    description: "UK's primary anti-money laundering legislation",
                    keyPoints: [
                      "Establishes main money laundering offences",
                      "Covers concealing, arranging, and acquiring criminal property",
                      "Creates criminal liability for individuals and firms"
                    ],
                    penalties: "Up to 14 years imprisonment",
                    color: "red"
                  },
                  {
                    name: "Terrorism Act 2000",
                    description: "Primary legislation for terrorist financing offences",
                    keyPoints: [
                      "Defines terrorist financing offences",
                      "Creates reporting obligations",
                      "Establishes penalties for non-compliance"
                    ],
                    penalties: "Up to 14 years imprisonment",
                    color: "red"
                  },
                  {
                    name: "Money Laundering Regulations 2017 (MLRs)",
                    description: "Detailed practical rules for regulated firms",
                    keyPoints: [
                      "Risk-based approach requirements",
                      "Customer due diligence procedures",
                      "Record keeping obligations",
                      "Training and awareness requirements"
                    ],
                    penalties: "Unlimited fines + criminal prosecution",
                    color: "amber"
                  },
                  {
                    name: "FCA Handbook (SYSC 6 & FCG)",
                    description: "FCA's expectations for systems and controls",
                    keyPoints: [
                      "Senior management accountability",
                      "Governance and oversight requirements",
                      "Systems and controls standards",
                      "Cultural expectations"
                    ],
                    penalties: "Regulatory action + unlimited fines",
                    color: "blue"
                  }
                ]
              }
            },
            {
              title: "Our Defence: The Risk-Based Approach (RBA)",
              content: `We cannot treat every customer and every transaction as if it carries the same level of risk. The law requires us to adopt a Risk-Based Approach (RBA). This means we must identify the biggest financial crime risks our firm faces and focus our resources on managing and mitigating them.`,
              visual: {
                type: "four_pillar_framework",
                title: "Our Risk-Based Approach Framework",
                pillars: [
                  {
                    number: 1,
                    title: "Business-Wide Risk Assessment",
                    description: "Formal assessment of our AML risks",
                    details: "Our firm conducts and maintains a comprehensive assessment considering risks from customers, countries, products, services, and delivery methods. This assessment is the foundation of our entire AML programme.",
                    keyActivities: [
                      "Annual risk assessment updates",
                      "Customer risk profiling",
                      "Geographic risk evaluation",
                      "Product and service risk analysis"
                    ],
                    icon: "assessment",
                    color: "purple"
                  },
                  {
                    number: 2,
                    title: "Customer Due Diligence (CDD)",
                    description: "Know Your Customer (KYC) procedures",
                    details: "We must identify customers and beneficial owners, verify their identity, and apply appropriate levels of diligence based on risk assessment.",
                    keyActivities: [
                      "Standard Due Diligence for normal risk",
                      "Simplified Due Diligence for low risk",
                      "Enhanced Due Diligence for high risk",
                      "Ongoing customer verification"
                    ],
                    icon: "identity",
                    color: "blue"
                  },
                  {
                    number: 3,
                    title: "Ongoing Monitoring",
                    description: "Continuous transaction and activity monitoring",
                    details: "We monitor customer transactions and activity throughout the relationship to ensure consistency with our knowledge and spot unusual patterns.",
                    keyActivities: [
                      "Transaction monitoring systems",
                      "Periodic customer reviews",
                      "Suspicious pattern detection",
                      "Activity trend analysis"
                    ],
                    icon: "monitoring",
                    color: "emerald"
                  },
                  {
                    number: 4,
                    title: "Reporting",
                    description: "Internal and external reporting obligations",
                    details: "Comprehensive reporting framework covering internal suspicious activity reporting to MLRO and external reporting to authorities when required.",
                    keyActivities: [
                      "Internal suspicious activity reports",
                      "SARs to National Crime Agency",
                      "Regulatory reporting",
                      "Board and committee reporting"
                    ],
                    icon: "reporting",
                    color: "amber"
                  }
                ]
              }
            },
            {
              title: "Your Role and the MLRO: Critical Responsibilities",
              content: `AML compliance is a collective responsibility, but there are specific roles and critical duties you need to understand, particularly around the Money Laundering Reporting Officer (MLRO).`,
              visual: {
                type: "responsibility_framework",
                title: "AML Roles and Responsibilities",
                roles: [
                  {
                    role: "Every Employee",
                    description: "Fundamental duty to report suspicions",
                    responsibilities: [
                      "Be alert to suspicious activity in daily work",
                      "Report any suspicions immediately to MLRO",
                      "Maintain confidentiality (no tipping off)",
                      "Complete required AML training",
                      "Follow firm's AML policies and procedures"
                    ],
                    keyRule: "If you suspect it, report it internally to the MLRO",
                    penalties: "Personal criminal liability for non-compliance",
                    color: "blue"
                  },
                  {
                    role: "Money Laundering Reporting Officer (MLRO)",
                    description: "Senior function holder (SMF17) responsible for AML oversight",
                    responsibilities: [
                      "Act as central point for all internal AML concerns",
                      "Investigate internal reports of suspicious activity",
                      "Decide whether to submit SARs to National Crime Agency",
                      "Oversee firm's AML systems and controls",
                      "Provide guidance and training to staff",
                      "Report to senior management and regulators"
                    ],
                    keyRule: "Independent, senior, and authorised individual",
                    penalties: "Personal and corporate liability",
                    color: "red"
                  }
                ]
              },
              criticalWarning: {
                title: "CRITICAL RULE: Tipping Off",
                content: "It is a criminal offence to 'tip off' a person that you have made a SAR or that there is an ongoing investigation. You must never tell a customer that they are the subject of a report. Any communication must be handled carefully and with guidance from the MLRO.",
                penalties: "Up to 2 years imprisonment and/or unlimited fine",
                examples: [
                  "✗ 'We're investigating your account'",
                  "✗ 'There's a compliance issue'",
                  "✗ 'We need to check for money laundering'",
                  "✓ 'We are completing our standard internal checks'"
                ]
              }
            }
          ]
        }
      },
      practice: {
        duration: 3,
        content: {
          type: "interactive_scenarios",
          title: "AML Red Flag Detection Practice",
          description: "Test your ability to identify suspicious activity and take appropriate action",
          scenarios: [
            {
              id: "corporate_client_scenario",
              title: "The Complex Corporate Client",
              context: "A new corporate client wants to set up a payment account. They are based in a high-risk jurisdiction and the corporate structure is deliberately complex, involving shell companies. They want to immediately begin moving large, round-sum amounts to various other countries.",
              customerDetails: {
                name: "Global Trading Solutions Ltd",
                jurisdiction: "Known high-risk jurisdiction",
                structure: "Multiple shell companies, unclear beneficial ownership",
                requestedActivity: "Immediate large transfers to various countries",
                directorBehavior: "Evasive when asked about source of wealth"
              },
              question: "What are the red flags here, and what should you do?",
              options: [
                {
                  id: "a",
                  text: "Process the application normally - they haven't done anything illegal yet",
                  isCorrect: false
                },
                {
                  id: "b",
                  text: "Apply Enhanced Due Diligence (EDD) and escalate concerns to MLRO before proceeding",
                  isCorrect: true
                },
                {
                  id: "c",
                  text: "Reject the application immediately due to high risk",
                  isCorrect: false
                },
                {
                  id: "d",
                  text: "Accept but monitor closely after onboarding",
                  isCorrect: false
                }
              ],
              feedback: {
                correct: "Excellent! You've correctly identified multiple red flags: high-risk jurisdiction, complex/opaque structure, immediate large transactions, round amounts, and evasiveness about source of wealth. This requires Enhanced Due Diligence (EDD) and immediate escalation to the MLRO before proceeding with the relationship.",
                incorrect: "This scenario contains serious red flags that require immediate action. The combination of high-risk jurisdiction, complex structure, large immediate transfers, and evasive behavior about wealth source requires Enhanced Due Diligence and MLRO escalation before proceeding."
              },
              learningPoints: [
                "High-risk jurisdictions require enhanced scrutiny",
                "Complex corporate structures can hide beneficial ownership",
                "Evasiveness about source of wealth is a major red flag",
                "Never proceed with high-risk relationships without MLRO approval"
              ],
              redFlags: [
                "High-risk jurisdiction",
                "Complex/opaque corporate structure",
                "Immediate large value transactions",
                "Round sum amounts",
                "Evasive behavior about source of wealth"
              ]
            },
            {
              id: "account_behavior_change",
              title: "Sudden Account Activity Change",
              context: "An existing customer, who has for years maintained a low account balance with minimal activity, suddenly receives a series of large, unrelated payments from abroad. Almost as soon as the funds arrive, they are transferred out to a different individual.",
              customerDetails: {
                name: "Mrs. Sarah Johnson",
                accountHistory: "3 years, low balance (£200-500), minimal activity",
                recentActivity: "Series of large international payments (£15k, £22k, £18k)",
                pattern: "Funds transferred out within hours to different individual",
                sources: "Multiple foreign countries, no apparent relationship"
              },
              question: "Why is this activity suspicious, and what is your legal obligation?",
              options: [
                {
                  id: "a",
                  text: "Wait to see if the pattern continues before taking action",
                  isCorrect: false
                },
                {
                  id: "b",
                  text: "Contact the customer to ask about the change in activity",
                  isCorrect: false
                },
                {
                  id: "c",
                  text: "Report the suspicion immediately to the MLRO",
                  isCorrect: true
                },
                {
                  id: "d",
                  text: "Block the account until more information is obtained",
                  isCorrect: false
                }
              ],
              feedback: {
                correct: "Correct! This represents a significant and unexplained change from the customer's expected activity pattern. The account appears to be used as a simple pass-through for funds, which is a classic 'layering' technique in money laundering. Your legal obligation is to report this suspicion immediately to the MLRO.",
                incorrect: "This activity shows classic signs of money laundering 'layering' - using the account as a pass-through for funds. The dramatic change from expected activity pattern creates a legal obligation to report your suspicion to the MLRO immediately."
              },
              learningPoints: [
                "Dramatic changes from expected activity patterns are suspicious",
                "Pass-through accounts are commonly used in layering",
                "Quick in-and-out transfers often indicate laundering",
                "You must report suspicions immediately, not wait for more evidence"
              ],
              moneyLaunderingStage: "Layering",
              redFlags: [
                "Significant change from expected activity",
                "Large, unrelated international payments",
                "Pass-through behavior (in and immediately out)",
                "No apparent business relationship to sources"
              ]
            }
          ]
        }
      },
      summary: {
        duration: 1,
        content: {
          type: "comprehensive_summary",
          title: "AML Fundamentals: Your Essential Knowledge",
          keyTakeaways: [
            {
              icon: "shield",
              title: "You Are the First Line of Defence",
              description: "With £100bn laundered through the UK annually, your vigilance and reporting is critical to protecting the financial system from criminal abuse."
            },
            {
              icon: "search",
              title: "Three Stages: Placement, Layering, Integration",
              description: "Understanding how criminals launder money helps you spot suspicious patterns and behaviors throughout the process."
            },
            {
              icon: "balance-scale",
              title: "Risk-Based Approach Focuses Resources",
              description: "Our four-pillar framework (Risk Assessment, CDD, Monitoring, Reporting) efficiently targets the highest risks."
            },
            {
              icon: "alert-triangle",
              title: "Report Suspicions to MLRO Immediately",
              description: "Your legal obligation is to report any suspicion - not to investigate or prove it. The threshold is suspicion, not certainty."
            },
            {
              icon: "x-circle",
              title: "Never 'Tip Off' - It's a Criminal Offence",
              description: "Telling customers about investigations or reports can result in 2 years imprisonment. Use generic holding responses only."
            }
          ],
          regulatoryReminder: {
            title: "Remember: This is Criminal Law",
            content: "AML obligations aren't just regulatory requirements - they're criminal law. Personal liability includes imprisonment and unlimited fines for serious breaches.",
            keyLaws: [
              "Proceeds of Crime Act 2002 - Up to 14 years imprisonment",
              "Terrorism Act 2000 - Up to 14 years imprisonment",
              "Tipping Off Offence - Up to 2 years imprisonment"
            ]
          },
          nextSteps: [
            "Complete: 'Know Your Customer (KYC) & Customer Due Diligence' training",
            "Review: Your firm's AML Policy and procedures",
            "Practice: Using internal reporting systems and escalation procedures",
            "Bookmark: Key contacts including MLRO details and emergency procedures"
          ],
          quickReference: {
            title: "Quick Reference Card",
            items: [
              "MLRO Contact: [Internal contact details]",
              "Emergency Escalation: [24/7 contact]",
              "SAR Threshold: Suspicion (not proof)",
              "Reporting Timeline: Immediate (don't delay)",
              "Tipping Off: Criminal offence - never mention investigations"
            ]
          }
        }
      }
    }
  } as MicroLesson,

  assessment: {
    id: "aml_fundamentals_assessment",
    title: "AML Fundamentals Knowledge Check",
    description: "Test your understanding of money laundering, regulatory requirements, and reporting obligations",
    difficulty: "beginner",
    timeLimit: 15,
    passingScore: 75,
    regulatoryArea: "Anti-Money Laundering",
    targetPersonas: ["all_staff"],
    questions: [
      {
        id: "q1_structuring",
        type: "scenario_based",
        scenario: "A customer asks you to split a large £50,000 cash deposit into five smaller deposits of £10,000 made on consecutive days.",
        question: "What is this money laundering technique commonly called and what is your immediate responsibility?",
        options: [
          "This is 'layering' - I should process it normally as each deposit is legitimate",
          "This is 'structuring' or 'smurfing' - I must report my suspicion to the MLRO",
          "This is 'integration' - I should ask for more documentation",
          "This is normal banking - no action needed as amounts are legal"
        ],
        correctAnswer: 1,
        explanation: "This is 'structuring' or 'smurfing' - deliberately breaking large amounts into smaller deposits to avoid reporting thresholds. Your immediate responsibility is to report this suspicion to the MLRO, as this is a classic placement technique.",
        points: 10,
        category: "money_laundering_techniques"
      },
      {
        id: "q2_reporting_threshold",
        type: "multiple_choice",
        question: "An employee suspects a client might be involved in money laundering but feels they don't have enough solid 'proof'. Should they still make an internal report to the MLRO?",
        options: [
          "No - they need concrete evidence before reporting",
          "Yes - the legal threshold for reporting is 'suspicion', not 'proof'",
          "Only if the amounts involved are over £10,000",
          "They should investigate further themselves first"
        ],
        correctAnswer: 1,
        explanation: "Yes, they must report it. The legal threshold for reporting is 'suspicion,' not 'proof.' It is the MLRO's responsibility to investigate that suspicion and determine if it requires a formal report to the NCA. Staff should never try to investigate suspicions themselves.",
        points: 10,
        category: "reporting_obligations"
      },
      {
        id: "q3_risk_based_approach",
        type: "multiple_choice",
        question: "How does the firm's Business-Wide Risk Assessment (BWRA) directly influence the level of Customer Due Diligence (CDD) applied to a new client?",
        options: [
          "It doesn't - all customers receive the same level of due diligence",
          "It determines pricing for the customer relationship",
          "If a client falls into high-risk categories, Enhanced Due Diligence (EDD) is required",
          "It only affects existing customers, not new ones"
        ],
        correctAnswer: 2,
        explanation: "The BWRA identifies high-risk products, jurisdictions, and customer types. If a new client falls into one of these high-risk categories, the firm's policy will automatically require Enhanced Due Diligence (EDD) to be performed.",
        points: 8,
        category: "risk_based_approach"
      },
      {
        id: "q4_natwest_case",
        type: "multiple_choice",
        question: "Referring to the NatWest case mentioned, what was the primary control failure that led to their significant £264 million fine?",
        options: [
          "Failure to conduct proper customer due diligence at onboarding",
          "Inadequate staff training on AML procedures",
          "Poor transaction monitoring systems that failed to identify suspicious cash deposits",
          "Lack of senior management oversight"
        ],
        correctAnswer: 2,
        explanation: "The primary failure was in their ongoing transaction monitoring systems and processes, which failed to identify and act upon hugely suspicious cash deposits (£264 million in cash) being made into a customer's account.",
        points: 8,
        category: "case_studies"
      },
      {
        id: "q5_tipping_off",
        type: "multiple_choice",
        question: "What are two potential legal consequences for an individual employee found guilty of the criminal offence of 'tipping off'?",
        options: [
          "Written warning and additional training",
          "Suspension and final written warning",
          "Prison sentence (up to 2 years) and/or unlimited fine",
          "Dismissal and industry ban"
        ],
        correctAnswer: 2,
        explanation: "Tipping off is a serious criminal offence under the Proceeds of Crime Act. Individual consequences include a prison sentence of up to two years and/or an unlimited fine.",
        points: 10,
        category: "legal_consequences"
      },
      {
        id: "q6_terrorist_financing",
        type: "multiple_choice",
        question: "What is the key difference between Money Laundering and Terrorist Financing in terms of the source of funds?",
        options: [
          "There is no difference - they are the same offence",
          "Money Laundering involves larger amounts than Terrorist Financing",
          "In Money Laundering, funds are always from crime; in Terrorist Financing, funds can be from legitimate sources",
          "Terrorist Financing only involves international transactions"
        ],
        correctAnswer: 2,
        explanation: "In Money Laundering, the source of the funds is always criminal activity ('dirty money'). In Terrorist Financing, the funds can come from legitimate sources (e.g., salary, donations) but are intended for an illegal purpose.",
        points: 8,
        category: "fundamental_concepts"
      },
      {
        id: "q7_poca",
        type: "multiple_choice",
        question: "Which piece of UK legislation makes it a primary criminal offence to conceal, disguise, convert, transfer or remove criminal property?",
        options: [
          "The Money Laundering Regulations 2017",
          "The Terrorism Act 2000",
          "The Proceeds of Crime Act 2002 (POCA)",
          "The Criminal Finances Act 2017"
        ],
        correctAnswer: 2,
        explanation: "The Proceeds of Crime Act 2002 (POCA) is the UK's primary anti-money laundering legislation that establishes the main money laundering offences, including concealing, arranging, and acquiring criminal property.",
        points: 6,
        category: "regulatory_framework"
      },
      {
        id: "q8_mlro_discretion",
        type: "multiple_choice",
        question: "Is the MLRO required to report every single internal suspicion they receive to the National Crime Agency?",
        options: [
          "Yes - every internal report must become a SAR",
          "No - the MLRO investigates first and only files SARs if genuine grounds for suspicion remain",
          "Only if the amounts involved exceed £50,000",
          "Only if the customer is from a high-risk jurisdiction"
        ],
        correctAnswer: 1,
        explanation: "No. The MLRO must first conduct their own investigation into the internal report. They are only required to submit a SAR to the NCA if they conclude that there are genuine grounds for suspicion after their investigation.",
        points: 8,
        category: "reporting_process"
      },
      {
        id: "q9_rba_effectiveness",
        type: "multiple_choice",
        question: "Why is a Risk-Based Approach (RBA) considered more effective than treating all customers identically?",
        options: [
          "It reduces compliance costs for the firm",
          "It makes customer onboarding faster",
          "It allows focusing resources on highest-risk areas where money laundering is most likely",
          "It reduces regulatory scrutiny"
        ],
        correctAnswer: 2,
        explanation: "An RBA allows a firm to focus its time, resources, and most robust controls on the areas where the risk of money laundering is highest. This is more efficient and effective than applying the same level of scrutiny to low-risk clients as to high-risk ones.",
        points: 8,
        category: "risk_based_approach"
      },
      {
        id: "q10_tipping_off_response",
        type: "scenario_based",
        scenario: "A customer is complaining about a delay in their payment. You know the delay is because the MLRO is investigating a SAR you filed.",
        question: "What is a safe and compliant way to respond to the customer?",
        options: [
          "Explain that there is a compliance investigation causing the delay",
          "Tell them honestly that AML checks are being conducted",
          "Use a generic response: 'We are completing standard internal checks and will process as soon as possible'",
          "Refer them directly to the MLRO for an explanation"
        ],
        correctAnswer: 2,
        explanation: "You must use a generic holding response that does not mention the investigation, compliance, money laundering, or any hint of suspicious activity. For example: 'We are completing our standard internal checks and will process your request as soon as possible. Thank you for your patience.'",
        points: 10,
        category: "tipping_off_prevention"
      }
    ]
  } as Assessment
};

// Export compatible with TrainingModule interface
export const amlFundamentalsModule = {
  id: 'aml-fundamentals',
  title: 'Anti-Money Laundering (AML) Fundamentals',
  description: 'Master the foundations of AML compliance, understand the three stages of money laundering, and learn your critical role in protecting the financial system',
  category: 'financial-crime-prevention',
  duration: 20,
  difficulty: 'beginner',
  targetPersonas: ['compliance-officer', 'relationship-manager', 'operations-staff', 'customer-service'],
  prerequisiteModules: [],
  tags: ['aml', 'money-laundering', 'compliance', 'financial-crime'],
  learningOutcomes: [
    'Define money laundering and identify its three distinct stages',
    'Understand the key UK regulations that govern AML efforts',
    'Explain the firm\'s Risk-Based Approach (RBA) to AML',
    'Identify the role and responsibilities of the MLRO',
    'Recognise your personal duty to report suspicious activity internally'
  ],
  hook: {
    type: 'real_case_study',
    title: 'The £365 Million That Should Have Been Stopped',
    content: `In 2021, NatWest was fined £264 million for failing to properly monitor a single customer account. Between 2012 and 2016, approximately £365 million was deposited into this account, with £264 million of it in cash. Despite the astronomical amounts and obvious red flags, the bank failed to file a single Suspicious Activity Report (SAR).

    The customer was a gold trading business that should have triggered immediate suspicion:
    - Daily cash deposits of £40,000-50,000
    - Total cash deposits 50 times larger than originally anticipated
    - Deposits made at multiple branches across different regions
    - Business model that didn't justify the volume of cash handling

    This wasn't sophisticated money laundering. It was brazen, obvious criminal activity that basic monitoring should have caught. The failure wasn't technical - it was human. Staff saw the activity, systems generated alerts, but no one connected the dots.

    Every SAR you file could prevent the next NatWest case. Every investigation you conduct properly could save lives.`,
    keyQuestion: 'If you saw £50,000 in cash deposits daily from a small business, would you know exactly what steps to take to investigate and report this suspicious activity?'
  },
  lessons: [
    {
      id: "aml-foundations",
      title: "The Money Laundering Lifecycle",
      type: "content",
      duration: 6,
      content: {
        learningPoint: "Understand placement, layering, and integration and why each stage matters.",
        mainContent: `Money laundering turns criminal proceeds into usable funds. The process is usually split into three stages that leave different signals in your systems.

**Placement** is the entry point. Criminals introduce illicit funds into the financial system, often through cash deposits, money services, or structured transfers.

**Layering** obscures the trail using complex transfers, multiple accounts, and cross-border activity. The goal is to confuse the audit trail.

**Integration** makes funds appear legitimate through assets, business revenue, or investment returns.

Each stage has distinct red flags. Your job is to spot the pattern across time, not just a single event.`,
        keyConcepts: [
          { term: "Placement", definition: "Introducing illicit funds into the financial system." },
          { term: "Layering", definition: "Complex movement of funds to obscure origin." },
          { term: "Integration", definition: "Reintroducing funds as seemingly legitimate." }
        ],
        realExamples: [
          "A cash-intensive business suddenly deposits daily round amounts across multiple branches.",
          "Funds move through multiple related accounts within 24 hours with no clear purpose."
        ],
        regulatoryRequirements: [
          "MLR 2017 - risk based controls for customer due diligence and monitoring"
        ]
      }
    },
    {
      id: "aml-regulatory-framework",
      title: "Regulatory Framework and Firm Obligations",
      type: "content",
      duration: 6,
      content: {
        learningPoint: "Know the core laws and what regulators expect in daily operations.",
        mainContent: `AML compliance in the UK is rooted in three pillars:

- **POCA 2002**: Defines money laundering offences and the duty to report suspicious activity.
- **MLR 2017**: Requires risk-based CDD, monitoring, record keeping, and governance.
- **FCA expectations**: Controls must be effective, evidenced, and embedded in the business.

Regulators focus on outcomes. You must show how decisions were made, why controls were applied, and what evidence supports the decision.`,
        keyConcepts: [
          { term: "POCA 2002", definition: "Criminalises money laundering and defines reporting duties." },
          { term: "MLR 2017", definition: "Sets requirements for CDD, EDD, monitoring, and governance." },
          { term: "FCA Financial Crime Guide", definition: "Expectation of effective, evidenced controls." }
        ],
        realExamples: [
          "A firm failed to document EDD for a high risk customer and was cited for weak governance.",
          "An MLRO could not evidence why a suspicious pattern was not escalated."
        ],
        regulatoryRequirements: [
          "POCA 2002 - suspicious activity reporting",
          "MLR 2017 - record keeping and governance"
        ]
      }
    },
    {
      id: "aml-risk-based-approach",
      title: "Risk Based Approach and Customer Profiling",
      type: "content",
      duration: 6,
      content: {
        learningPoint: "Apply risk factors consistently and adjust controls based on risk.",
        mainContent: `Risk based AML means focusing resources where harm is most likely. You evaluate risk across:

- Customer profile (occupation, ownership structure, PEP status)
- Geography (high risk jurisdictions, sanctions exposure)
- Products and channels (cash, cross border, online)
- Transaction behavior (volume, frequency, counterparties)

When risk is higher, apply enhanced due diligence and tighter monitoring. The goal is consistent decisions backed by evidence, not intuition.`,
        keyConcepts: [
          { term: "Risk Appetite", definition: "The level of AML risk the firm is willing to accept." },
          { term: "EDD", definition: "Enhanced controls for higher risk customers or activity." },
          { term: "Ongoing Monitoring", definition: "Continuous review of customer behavior and risk." }
        ],
        realExamples: [
          "A low risk retail customer is reviewed annually, while a high risk corporate customer is reviewed quarterly.",
          "Cross border payments to high risk jurisdictions trigger enhanced monitoring alerts."
        ],
        regulatoryRequirements: [
          "MLR 2017 - risk based CDD and monitoring"
        ]
      }
    },
    {
      id: "aml-detection-escalation",
      title: "Detection, Monitoring, and Escalation",
      type: "content",
      duration: 6,
      content: {
        learningPoint: "Detect patterns early and escalate with clear evidence.",
        mainContent: `Monitoring is where most suspicious activity is detected. Alerts are signals, not proof. Good escalation relies on evidence:

- Document the pattern and timeline
- Compare activity to expected profile
- Record customer explanations and gaps

Escalate when the evidence does not reconcile. Do not tip off the customer. Your escalation must be factual, timely, and complete.`,
        keyConcepts: [
          { term: "SAR", definition: "Suspicious Activity Report submitted through internal MLRO process." },
          { term: "Tipping Off", definition: "Warning a customer about suspicion or reporting, which is prohibited." }
        ],
        realExamples: [
          "Repeated deposits just under reporting thresholds with no credible explanation.",
          "Rapid in and out transfers across multiple jurisdictions."
        ],
        regulatoryRequirements: [
          "POCA 2002 - reporting suspicious activity",
          "FCA expectations - timely escalation and evidence"
        ]
      }
    },
    {
      id: "aml-governance-culture",
      title: "Governance, Roles, and AML Culture",
      type: "content",
      duration: 6,
      content: {
        learningPoint: "AML effectiveness depends on clear ownership and consistent training.",
        mainContent: `AML governance is not just policies. It is accountability and culture:

- The MLRO owns reporting decisions and regulatory engagement.
- First line teams identify and escalate risk.
- Second line monitors controls and provides oversight.

Training, quality assurance, and MI keep the program effective. Regulators expect you to show evidence of governance, not just policy documents.`,
        keyConcepts: [
          { term: "MLRO", definition: "Designated officer responsible for AML reporting and oversight." },
          { term: "Three Lines of Defense", definition: "Business, oversight, and audit roles in risk management." },
          { term: "MI", definition: "Management information used for governance and monitoring." }
        ],
        realExamples: [
          "Quarterly AML dashboard to senior management covering alerts, SARs, and trends.",
          "Training completion tracked and reported with follow up actions."
        ],
        regulatoryRequirements: [
          "MLR 2017 - governance and training requirements"
        ]
      }
    }
  ],
  practiceScenarios: [],
  assessmentQuestions: [],
  summary: {
    keyTakeaways: [
      'Money laundering is a serious crime that enables other serious crimes',
      'The firm\'s defence is built on a dynamic Risk-Based Approach (RBA)',
      'The MLRO is the designated expert and focal point for all AML concerns',
      'Your single most important duty is to report any suspicion internally to the MLRO',
      'Tipping off is a criminal offence'
    ],
    nextSteps: [
      'Complete the Know Your Customer (KYC) & Customer Due Diligence training',
      'Review your firm\'s AML policy and procedures',
      'Understand your role in the three lines of defence',
      'Practice identifying suspicious activity with scenario exercises'
    ],
    quickReference: [
      'Report immediately: Any suspicion must be reported to MLRO without delay',
      'Three stages: Placement, Layering, Integration - know the warning signs',
      'POCA 2002: Primary UK legislation criminalizing money laundering',
      'Risk-based: Apply enhanced measures to higher-risk customers and transactions'
    ]
  },
  visualAssets: {
    images: [],
    style: 'Professional financial crime design with clear process flows and case study elements'
  }
};
