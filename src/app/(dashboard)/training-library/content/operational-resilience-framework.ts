import { TrainingModule, MicroLesson } from "../types";

export const operationalResilienceFrameworkContent = {
  module: {
    id: "operational_resilience_framework",
    title: "Operational Resilience Framework: Building Unbreakable Systems",
    description: "Master the FCA, PRA and Bank of England's operational resilience requirements and build robust business continuity",
    category: "mandatory",
    regulatoryArea: "Operational Resilience",
    estimatedDuration: 40,
    difficulty: "advanced",
    targetPersonas: ["risk_analyst", "operations_manager", "tech_security", "compliance_officer"],
    learningOutcomes: [
      "Identify and map important business services",
      "Set appropriate impact tolerances for disruption",
      "Design effective business continuity plans",
      "Implement comprehensive testing programs",
      "Establish third-party risk management frameworks"
    ]
  } as TrainingModule,

  lesson: {
    id: "operational_resilience_fundamentals",
    title: "Operational Resilience Fundamentals: Beyond Business Continuity",
    description: "Understanding modern operational resilience and its critical importance",
    duration: 12,
    difficulty: "advanced",
    regulatoryArea: "Operational Resilience",
    targetPersonas: ["risk_analyst", "operations_manager", "tech_security"],
    components: {
      hook: {
        duration: 1,
        content: {
          type: "crisis_scenario",
          title: "The Day Everything Stopped",
          content: `March 2021: A major cloud provider suffers a catastrophic failure. Within minutes:

          🏦 3 major banks lose online services
          💳 Payment systems across the UK freeze
          📱 Mobile banking apps go dark for millions
          💰 £2.3 billion in transactions are stuck in limbo

          The failure cascades through interconnected systems. ATMs stop working. Mortgages can't complete. Small businesses can't take payments. The impact? £47 million in lost revenue per hour.

          This isn't a hypothetical scenario - it's based on real events. And it's exactly why operational resilience has become the regulators' top priority.`,
          visual: {
            type: "crisis_timeline",
            events: [
              { time: "09:23", event: "Cloud provider failure begins", impact: "Initial services affected" },
              { time: "09:31", event: "Banking systems start failing", impact: "Customer transactions stop" },
              { time: "09:45", event: "Payment networks disrupted", impact: "Card payments nationwide fail" },
              { time: "10:15", event: "ATM networks go offline", impact: "Cash withdrawals impossible" },
              { time: "11:30", event: "Cascading failures spread", impact: "Insurance, loans, savings affected" },
              { time: "14:45", event: "Partial recovery begins", impact: "Some services restored" }
            ]
          }
        }
      },
      content: {
        duration: 8,
        content: {
          type: "structured_learning",
          sections: [
            {
              title: "What is Operational Resilience?",
              content: `Operational resilience is your firm's ability to prevent, adapt to, respond to, recover from and learn from operational disruptions. It goes far beyond traditional business continuity planning.`,
              visual: {
                type: "concept_evolution",
                evolution: [
                  {
                    era: "Traditional BCP",
                    focus: "Recovery after disruption",
                    characteristics: ["Reactive approach", "Focus on IT systems", "Single point failures", "Annual testing"],
                    limitations: ["Too narrow", "Too slow", "Too rigid"]
                  },
                  {
                    era: "Operational Resilience",
                    focus: "Prevention and adaptation",
                    characteristics: ["Proactive approach", "End-to-end services", "Interconnected systems", "Continuous testing"],
                    advantages: ["Holistic view", "Faster response", "More flexible"]
                  }
                ]
              }
            },
            {
              title: "The Three Pillars of Operational Resilience",
              content: `The regulatory framework is built on three core pillars that firms must master:`,
              visual: {
                type: "pillar_framework",
                pillars: [
                  {
                    number: 1,
                    title: "Important Business Services",
                    description: "Identify and map the services that matter most to customers and market integrity",
                    keyComponents: [
                      "Service identification and prioritization",
                      "End-to-end mapping of people, processes, technology",
                      "Dependency analysis and critical path mapping",
                      "Regular review and updates"
                    ],
                    examples: [
                      "Payment processing services",
                      "Customer account access",
                      "Lending and credit decisions",
                      "Investment management and trading"
                    ],
                    regulatoryRequirement: "Firms must identify services whose disruption could cause intolerable harm",
                    color: "blue"
                  },
                  {
                    number: 2,
                    title: "Impact Tolerances",
                    description: "Set maximum acceptable disruption levels for each important business service",
                    keyComponents: [
                      "Define maximum tolerable disruption periods",
                      "Consider cumulative impact over time",
                      "Account for different disruption scenarios",
                      "Regular testing and validation"
                    ],
                    examples: [
                      "Online banking: max 4 hours downtime",
                      "Payment processing: max 2 hours disruption",
                      "Customer support: max 1 hour to alternative channel",
                      "Trading systems: max 30 minutes outage"
                    ],
                    regulatoryRequirement: "Impact tolerances must be based on potential harm to customers and markets",
                    color: "emerald"
                  },
                  {
                    number: 3,
                    title: "Severe but Plausible Scenarios",
                    description: "Test resilience against realistic but extreme disruption scenarios",
                    keyComponents: [
                      "Develop comprehensive scenario library",
                      "Test individual and combined scenarios",
                      "Include cyber attacks, natural disasters, pandemics",
                      "Assess cascading and interconnection risks"
                    ],
                    examples: [
                      "Major cyber attack on core systems",
                      "Loss of key data center for 72 hours",
                      "Pandemic preventing staff access to offices",
                      "Third-party provider failure affecting multiple services"
                    ],
                    regulatoryRequirement: "Scenarios must stress-test the firm's ability to remain within impact tolerances",
                    color: "amber"
                  }
                ]
              }
            },
            {
              title: "Key Regulatory Requirements",
              content: `Understanding what regulators expect from your operational resilience program:`,
              visual: {
                type: "regulatory_requirements_matrix",
                regulators: [
                  {
                    name: "FCA",
                    focus: "Consumer protection and market integrity",
                    keyRequirements: [
                      "Identify important business services",
                      "Set impact tolerances for disruption",
                      "Test against severe but plausible scenarios",
                      "Report disruptions exceeding tolerances",
                      "Maintain effective governance and oversight"
                    ],
                    reportingRequirements: [
                      "Annual self-assessment",
                      "Incident reporting within 24 hours",
                      "Board attestation of resilience"
                    ]
                  },
                  {
                    name: "PRA",
                    focus: "Financial stability and systemic risk",
                    keyRequirements: [
                      "Comprehensive business service mapping",
                      "Robust third-party risk management",
                      "Effective crisis management capabilities",
                      "Strong cyber resilience measures",
                      "Regular testing and continuous improvement"
                    ],
                    reportingRequirements: [
                      "Detailed resilience reports",
                      "Third-party risk assessments",
                      "Cyber resilience metrics"
                    ]
                  },
                  {
                    name: "Bank of England",
                    focus: "Financial system resilience",
                    keyRequirements: [
                      "Systemic risk assessment",
                      "Cross-industry coordination",
                      "Financial market infrastructure resilience",
                      "International cooperation",
                      "Macroprudential oversight"
                    ],
                    reportingRequirements: [
                      "System-wide resilience data",
                      "Critical service mapping",
                      "Interconnection analysis"
                    ]
                  }
                ]
              }
            },
            {
              title: "Common Implementation Challenges",
              content: `Learn from others' experiences and avoid common pitfalls:`,
              visual: {
                type: "challenge_solutions_grid",
                challenges: [
                  {
                    challenge: "Service Identification Overload",
                    description: "Firms identify too many services as 'important'",
                    impact: "Dilutes focus and resources",
                    solution: "Apply strict customer harm criteria - if disruption wouldn't cause significant customer detriment, it's likely not important",
                    tips: ["Focus on customer-facing services", "Consider market impact", "Regularly review and prune list"]
                  },
                  {
                    challenge: "Unrealistic Impact Tolerances",
                    description: "Setting tolerances that are too aggressive or too lenient",
                    impact: "Either unachievable standards or insufficient protection",
                    solution: "Base tolerances on real customer harm analysis and current capability assessment",
                    tips: ["Use customer journey mapping", "Consider cumulative impacts", "Test tolerances regularly"]
                  },
                  {
                    challenge: "Scenario Testing Theatre",
                    description: "Testing scenarios that are too easy or unrealistic",
                    impact: "False confidence in resilience capabilities",
                    solution: "Design scenarios that genuinely stress-test capabilities and reveal weaknesses",
                    tips: ["Include multiple simultaneous failures", "Test during peak times", "Involve real business users"]
                  },
                  {
                    challenge: "Third-Party Blind Spots",
                    description: "Insufficient visibility into third-party resilience",
                    impact: "Unexpected failures from supplier disruptions",
                    solution: "Implement comprehensive third-party risk management with regular resilience assessments",
                    tips: ["Map all critical dependencies", "Require supplier resilience reports", "Test failover procedures"]
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
          type: "resilience_assessment_exercise",
          title: "Operational Resilience Assessment Challenge",
          description: "Evaluate service resilience and identify improvement opportunities",
          scenario: {
            title: "RegionalBank's Payment Processing Dilemma",
            context: `RegionalBank processes £50 million in customer payments daily through their online banking platform. The service depends on:
            - Core banking system (in-house, 15 years old)
            - Payment network provider (major third party)
            - Cloud hosting service (established provider)
            - Customer authentication system (recent upgrade)

            Current situation: The payment service has experienced 3 outages in the last 6 months:
            - 6-hour outage due to core system maintenance overrun
            - 2-hour outage from payment provider cyber incident
            - 4-hour outage from authentication system bug`,
            customerImpact: "During outages, customers cannot make payments, pay bills, or transfer money. This affects business customers' payroll and supplier payments."
          },
          exercises: [
            {
              id: "service_classification",
              title: "Important Business Service Classification",
              question: "Should payment processing be classified as an 'important business service' under operational resilience rules?",
              options: [
                "Yes - disruption would cause significant customer harm",
                "No - customers have alternative payment methods",
                "Partially - only for business customer payments",
                "Depends on the size of RegionalBank"
              ],
              correct: 0,
              explanation: "Payment processing should definitely be classified as important. The £50m daily volume, customer dependency, and business impact clearly meet the threshold for significant customer harm if disrupted.",
              followUp: {
                question: "What would be an appropriate impact tolerance for this service?",
                options: [
                  "No more than 30 minutes disruption per incident",
                  "No more than 2 hours disruption per incident",
                  "No more than 4 hours disruption per incident",
                  "No more than 8 hours disruption per incident"
                ],
                correct: 1,
                explanation: "2 hours is appropriate considering customer expectations for payment services and the current capability. This allows time for failover while being achievable."
              }
            },
            {
              id: "scenario_design",
              title: "Severe but Plausible Scenario Design",
              question: "Which scenario would best test RegionalBank's payment service resilience?",
              options: [
                "Core banking system fails during routine maintenance",
                "Cyber attack affects payment provider and authentication system simultaneously",
                "Cloud hosting provider suffers regional outage during peak payment time",
                "All of the above occurring during month-end payment peak"
              ],
              correct: 3,
              explanation: "The most effective test combines multiple realistic failures during peak demand. This tests the firm's ability to handle cascading failures when most needed.",
              insights: [
                "Multiple simultaneous failures reveal interdependencies",
                "Peak time testing shows real-world impact",
                "Cascading scenarios test decision-making under pressure"
              ]
            }
          ]
        }
      },
      summary: {
        duration: 1,
        content: {
          type: "resilience_framework_summary",
          title: "Your Operational Resilience Toolkit",
          framework: {
            assess: [
              "Map all important business services end-to-end",
              "Identify critical dependencies and single points of failure",
              "Assess current resilience capabilities and gaps",
              "Benchmark against industry standards and regulatory expectations"
            ],
            design: [
              "Set realistic but challenging impact tolerances",
              "Develop comprehensive business continuity plans",
              "Create diverse scenario testing programs",
              "Establish robust third-party risk management"
            ],
            implement: [
              "Build monitoring and alerting systems",
              "Train staff on crisis response procedures",
              "Establish clear governance and accountability",
              "Create regular testing and exercise schedules"
            ],
            improve: [
              "Analyze incidents and near-misses for lessons",
              "Update plans based on testing results",
              "Continuously monitor changing threat landscape",
              "Share learnings across the organization"
            ]
          },
          keyMetrics: [
            "Service availability %",
            "Mean time to recovery",
            "Number of tolerance breaches",
            "Third-party risk score",
            "Testing coverage %"
          ],
          nextSteps: [
            "Complete Service Mapping Assessment",
            "Practice Impact Tolerance Setting",
            "Design Scenario Testing Program",
            "Review Third-Party Risk Framework"
          ]
        }
      }
    }
  } as MicroLesson
};