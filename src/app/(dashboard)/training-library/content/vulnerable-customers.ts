import { TrainingModule } from '../types';

export const vulnerableCustomersModule: TrainingModule = {
  id: 'vulnerable-customers',
  title: 'Vulnerable Customers – FCA Expectations & Practical Application',
  description: 'Understand the FCA definition of vulnerability, the four key drivers, how to identify and support vulnerable customers, and embed vulnerability considerations across governance, product design, and customer journeys.',
  category: 'customer-protection',
  duration: 65,
  difficulty: 'intermediate',
  targetPersonas: ['senior-manager', 'compliance-officer', 'customer-service', 'relationship-manager', 'operations-staff'],
  prerequisiteModules: [],
  tags: ['vulnerable-customers', 'FG21-1', 'consumer-duty', 'customer-protection', 'fair-treatment', 'fca', 'outcomes'],
  learningOutcomes: [
    'Define "vulnerable customer" using the FCA definition and explain the four key drivers of vulnerability',
    'Explain how FG21/1 and the Consumer Duty work together for vulnerable customer outcomes',
    'Identify indicators of vulnerability and apply appropriate adjustments to communications and support',
    'Describe FCA expectations for embedding vulnerability across governance, product design, and MI',
    'Apply a structured approach to handling vulnerable customer scenarios including escalation and recording',
    'Recognise common weaknesses highlighted in FCA reviews and how to avoid them'
  ],

  // Hook Section
  hook: {
    type: 'real_case_study',
    title: 'The Bereaved Customer',
    content: `A recently bereaved customer calls your firm. They are exhausted, overwhelmed by paperwork, and struggling to access joint funds to pay essential bills. Your standard process requires multiple documents and online forms. The agent is under pressure to keep call times low.

At the same time:
• FG21/1 says a vulnerable customer is "someone who, due to their personal circumstances, is especially susceptible to harm, particularly when a firm is not acting with appropriate levels of care."
• The FCA wants vulnerable customers to achieve outcomes as good as those for other customers and receive consistently fair treatment.
• In 2025, the FCA's vulnerability review found good practice but also serious failings – rigid processes after bereavement, poor recognition of distress, and additional harm from complex admin.

The gap between policy and practice is where harm happens. Your firm may have a vulnerability policy, but if frontline staff can't deviate from scripts and processes, if systems don't flag vulnerability, if managers are measured only on efficiency – the policy is just words.`,
    keyQuestion: 'If this bereaved customer called you today, what would you change about your standard process to avoid adding to their harm – and how would you justify that to the FCA?'
  },

  // Main Content Sections
  lessons: [
    {
      id: 'fca-framework-vulnerability',
      title: 'FCA Framework & Definition of Vulnerability',
      type: 'content',
      duration: 18,
      content: {
        learningPoint: 'Understand how the FCA defines vulnerability and its objectives for vulnerable customer outcomes',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'critical',
              title: 'FCA Definition',
              message: '"Someone who, due to their personal circumstances, is especially susceptible to harm, particularly when a firm is not acting with appropriate levels of care."'
            },
            {
              type: 'keypoint',
              icon: '📋',
              title: 'Key Definition Points',
              points: [
                'Vulnerability is a spectrum, not a label',
                'ANY customer can become vulnerable at any time',
                'Often temporary (life events) but can be long-term',
                'Firm\'s responsibility to act with appropriate care'
              ]
            },
            {
              type: 'infogrid',
              title: 'Four Drivers of Vulnerability',
              items: [
                { icon: '❤️', label: 'Health', description: 'Physical, mental, cognitive' },
                { icon: '⚡', label: 'Life Events', description: 'Bereavement, divorce, job loss' },
                { icon: '💪', label: 'Resilience', description: 'Low income, high debt, shocks' },
                { icon: '🧠', label: 'Capability', description: 'Literacy, digital skills, knowledge' }
              ]
            },
            {
              type: 'checklist',
              title: 'FCA Objectives for Vulnerable Customers',
              items: [
                'Outcomes as good as other customers',
                'Consistently fair treatment across all firms',
                'Proactive identification and support',
                'Embedded throughout business, not siloed'
              ]
            },
            {
              type: 'keypoint',
              icon: '📋',
              title: 'Consumer Duty Applied to Vulnerability',
              points: [
                'Act in good faith - don\'t exploit lack of understanding',
                'Avoid foreseeable harm - more foreseeable for vulnerable',
                'Enable and support - account for limitations'
              ]
            },
            {
              type: 'stat',
              icon: '📘',
              value: 'FG21/1',
              label: 'Key guidance document',
              description: 'Works with Consumer Duty for higher expectations',
              color: 'blue'
            }
          ]
        },

        keyConcepts: [
          {
            term: 'Vulnerable Customer',
            definition: 'Someone who, due to their personal circumstances, is especially susceptible to harm, particularly when a firm is not acting with appropriate levels of care'
          },
          {
            term: 'Four Drivers of Vulnerability',
            definition: 'Health, life events, resilience, and capability – the FCA\'s framework for understanding what makes customers vulnerable'
          },
          {
            term: 'FG21/1',
            definition: 'FCA Finalised Guidance on the fair treatment of vulnerable customers, published February 2021'
          },
          {
            term: 'Outcomes as Good As',
            definition: 'The FCA standard that vulnerable customers should achieve outcomes at least equal to those for other customers'
          }
        ],

        realExamples: [
          'A customer with early-stage dementia struggles to remember conversations and needs information repeated. This is a health driver affecting capability.',
          'A recently divorced customer is distressed, has reduced income, and needs to split joint products. This combines life event (divorce) with reduced resilience (income shock).',
          'An elderly customer without internet access cannot complete online-only processes. This is a capability driver (digital exclusion) that firms must accommodate.'
        ],

        regulatoryRequirements: [
          'FCA FG21/1 – Guidance for firms on the fair treatment of vulnerable customers',
          'FCA Principle 6 – Treating customers fairly',
          'Consumer Duty – Principle 12 and PRIN 2A cross-cutting rules',
          'FCA 2025 Vulnerable Customer Review findings'
        ]
      }
    },

    {
      id: 'identification-disclosure',
      title: 'Identification, Disclosure and Recording',
      type: 'content',
      duration: 14,
      content: {
        learningPoint: 'Recognise vulnerability indicators and record them lawfully with customer consent and care.',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'info',
              title: 'Practical Skill',
              message: 'Identification is about recognising signals and adapting support - not labeling customers.'
            },
            {
              type: 'keypoint',
              icon: '👀',
              title: 'Where Indicators Appear',
              points: [
                'Calls/chats expressing distress, confusion, urgency',
                'Missed payments, sudden arrears',
                'Repeated contact attempts',
                'Requests for unusual help'
              ]
            },
            {
              type: 'checklist',
              title: 'How to Ask',
              items: [
                'Use respectful, neutral language',
                'Explain why info helps provide better support',
                'Give customers control over disclosure',
                'Never pressure for medical details'
              ]
            },
            {
              type: 'keypoint',
              icon: '📋',
              title: 'Recording & Data Privacy',
              points: [
                'Record only what is necessary',
                'Use category flags, not intrusive details',
                'Ensure consent and explain data use',
                'Provide opt-out options'
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Escalation Triggers',
              message: 'Financial abuse/coercion, significant mental health distress, repeated misunderstandings causing foreseeable harm.'
            }
          ]
        },
        keyConcepts: [
          { term: 'Self-Disclosure', definition: 'When a customer voluntarily tells the firm about a vulnerability.' },
          { term: 'Observed Indicator', definition: 'Behavior or circumstances suggesting vulnerability without explicit disclosure.' },
          { term: 'Vulnerability Flag', definition: 'A structured marker in systems to prompt tailored support.' },
          { term: 'Lawful Processing', definition: 'Collecting only necessary data with consent and clear purpose.' }
        ],
        realExamples: [
          'A customer mentions caring responsibilities and asks for longer response times; the agent records a vulnerability flag and offers alternative channels.',
          'A customer repeatedly misunderstands repayment options, triggering a referral to a specialist support team.'
        ],
        regulatoryRequirements: [
          'FCA FG21/1 – Understanding and responding to vulnerability',
          'UK GDPR and Data Protection Act 2018 – Lawful processing and minimisation'
        ]
      }
    },
    {
      id: 'support-adjustments-escalation',
      title: 'Support Adjustments and Escalation',
      type: 'content',
      duration: 16,
      content: {
        learningPoint: 'Adapt processes to reduce harm and provide equitable outcomes.',
        mainContent: {
          cards: [
            {
              type: 'checklist',
              title: 'Common Adjustments',
              items: [
                'Alternative channels (phone/paper vs digital)',
                'Slower pacing, confirm understanding',
                'Extended timeframes for decisions',
                'Third-party involvement with consent',
                'Tailored comms (large print, simplified)'
              ]
            },
            {
              type: 'keypoint',
              icon: '💰',
              title: 'Forbearance & Financial Support',
              points: [
                'Payment plans or temporary concessions',
                'Referrals to debt advice organisations',
                'Clear explanation of consequences',
                'Options clearly communicated'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Identify', description: 'Recognise vulnerability signals' },
                { number: 2, title: 'Adjust', description: 'Adapt process proportionately' },
                { number: 3, title: 'Document', description: 'Record decisions and reasons' },
                { number: 4, title: 'Review', description: 'Track outcomes' }
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Avoiding Harm',
              message: 'Don\'t apply rigid scripts blocking adjustments. Don\'t penalise disclosure. Ensure consistent support across channels.'
            }
          ]
        },
        keyConcepts: [
          { term: 'Reasonable Adjustment', definition: 'A change to process or communication to support vulnerable customers.' },
          { term: 'Support Pathway', definition: 'Defined escalation route to specialist help.' },
          { term: 'Outcome Equity', definition: 'Ensuring vulnerable customers achieve outcomes as good as others.' }
        ],
        realExamples: [
          'A bereaved customer received a single point of contact and extended deadlines to provide documentation.',
          'A customer with low digital capability was moved to phone support with simplified statements.'
        ],
        regulatoryRequirements: [
          'FCA FG21/1 – Practical actions to support vulnerable customers',
          'Consumer Duty – Avoid foreseeable harm and support customers'
        ]
      }
    },

    {
      id: 'embedding-vulnerability',
      title: 'Embedding Vulnerability Across the Customer Journey',
      type: 'content',
      duration: 20,
      content: {
        learningPoint: 'Apply vulnerability considerations to customer understanding, product design, communications and support',
        mainContent: `FG21/1 and the 2025 FCA review emphasise four main areas where firms must embed vulnerability: culture & governance, understanding customer needs, product & journey design, and communications & support.

**Understanding Your Vulnerable Customer Base**

Firms cannot support vulnerable customers if they don't know who they are. Data and insight should inform:

**What to Understand:**
• How many customers show vulnerability indicators
• Which drivers are most common in your customer base
• Where vulnerability is likely to surface in customer journeys
• Whether outcomes differ for vulnerable vs non-vulnerable customers

**Key Touchpoints Where Vulnerability Surfaces:**
• Onboarding and affordability checks
• Collections and arrears management
• Claims processing (especially complex or disputed claims)
• Bereavement and third-party notifications
• Fraud and scam victims
• Complaints and disputes
• Product changes, renewals and exits

**Data Sources:**
• Complaints and root cause analysis
• Arrears and forbearance patterns
• Support line interactions and call recordings
• Vulnerability flags in CRM systems
• Customer research and feedback
• Industry benchmarking

---

**Designing Products and Journeys with Vulnerability in Mind**

The FCA expects vulnerability to be considered at the design stage, not retrofitted.

**Good Practice Includes:**
• Build **flexibility** into processes – allow staff to deviate from standard procedures where justified
• Avoid products or features likely to cause **disproportionate harm** to customers with common vulnerabilities
• Test journeys with customers who have different vulnerability characteristics
• Ensure digital journeys have **assisted alternatives** for those who can't self-serve
• Design **exit processes** that don't trap vulnerable customers in unsuitable products
• Consider how product features interact with vulnerability (e.g. complex fee structures, short decision windows)

**Questions for Product Design:**
• Who might struggle with this product or process?
• What would happen if a customer with [specific vulnerability] tried to use this?
• Are we relying on capabilities that vulnerable customers may lack?
• How would a bereaved family member navigate this process?

---

**Communications & Channel Design**

The FCA's vulnerable customer guidance and Consumer Duty consumer understanding outcome overlap strongly here.

**Communication Principles:**
• Use **plain language** – avoid jargon, complex sentences, and unnecessary technical terms
• Provide **layered communications** – key points upfront, more detail available for those who want it
• Offer **multiple channels** – phone, digital, post, assisted digital, face-to-face where appropriate
• Allow customers to **switch channels** where their preferred channel isn't working
• Test communications with customers who have different capability levels

**Avoiding Digital Exclusion:**
• Don't force digital-only journeys for high-stakes decisions
• Provide telephone support with reasonable wait times
• Offer paper alternatives where needed
• Consider assisted digital options (staff helping customers navigate online)
• Monitor which customer groups struggle with digital channels

**AI and Automation Warning:**
The FCA has warned that rapid adoption of AI and automated tools can compound harm for vulnerable customers if not carefully designed. Chatbots, automated decision-making, and digital-only processes may exclude or disadvantage vulnerable customers.

---

**Support, Collections and Complaints**

The 2025 FCA review highlights particular weaknesses in bereavement handling, power of attorney processes, and support during crises.

**Expectations:**
• Staff should be trained to **recognise distress** and adjust tone, pace and process
• Firms should **not rigidly apply** standard procedures where they would cause avoidable harm
• Complaint and collections processes must avoid **unreasonable barriers**
• Vulnerable customers should not have to **repeat their story** multiple times
• Forbearance options should be genuinely available and clearly communicated
• Exit and switching should not be harder than entry

**Collections Specifically:**
• Recognise signs of financial distress and adjust approach
• Offer meaningful forbearance options (payment holidays, reduced payments, interest freezes)
• Don't use aggressive tactics that exploit vulnerability
• Refer to debt advice where appropriate
• Monitor outcomes to ensure collections activity isn't causing disproportionate harm`,

        keyConcepts: [
          {
            term: 'Digital Exclusion',
            definition: 'When customers cannot access services because they lack digital skills, internet access, or suitable devices'
          },
          {
            term: 'Assisted Digital',
            definition: 'Support provided by staff to help customers navigate digital services they couldn\'t use independently'
          },
          {
            term: 'Forbearance',
            definition: 'Arrangements made with customers in financial difficulty, such as payment holidays or reduced payments'
          },
          {
            term: 'Sludge',
            definition: 'Friction deliberately designed into processes that makes it harder for customers to act in their own interests'
          }
        ],

        realExamples: [
          'A firm\'s bereavement process requires the surviving spouse to complete online forms and provide multiple documents. An alternative process with a dedicated phone team and document flexibility would reduce harm.',
          'A customer fails online identity verification due to address changes after fleeing domestic abuse. The firm offers alternative verification through branch appointment with appropriate safeguarding.',
          'A collections team recognises a customer is in crisis after job loss. They pause collections activity, provide breathing space, and signpost to debt advice services.'
        ],

        regulatoryRequirements: [
          'FG21/1 Chapter 5 – Product and service design',
          'FG21/1 Chapter 6 – Customer service',
          'Consumer Duty – Consumer understanding outcome (PRIN 2A.5)',
          'Consumer Duty – Consumer support outcome (PRIN 2A.6)',
          'Breathing Space regulations for debt collection'
        ]
      }
    },

    {
      id: 'governance-mi-training',
      title: 'Governance, MI, Training & Continuous Improvement',
      type: 'content',
      duration: 18,
      content: {
        learningPoint: 'Implement effective governance, outcome-focused MI, and capability building for vulnerable customers',
        mainContent: `**Governance and Accountability**

FG21/1 expects senior leaders to create a culture that prioritises reducing harm to vulnerable customers and empowers staff to act.

**Board and Senior Management Responsibilities:**
• Approve and oversee the firm's vulnerability strategy
• Regularly review MI on vulnerable customer outcomes
• Challenge where outcomes are poor or where vulnerable customers are under-represented in MI
• Ensure adequate resources for vulnerability support
• Set the tone from the top – vulnerability is a priority, not a box-ticking exercise

**SM&CR Considerations:**
• Consumer Duty Champion (where appointed) should have visibility of vulnerability outcomes
• SMF16 (Compliance Oversight) should ensure vulnerability is embedded in compliance monitoring
• Relevant SMFs should be able to evidence how their areas support vulnerable customers

**Culture and Empowerment:**
• Staff must feel empowered to deviate from standard processes where needed
• There should be no punishment for taking time to support vulnerable customers
• Escalation routes should be clear and accessible
• Good practice should be recognised and shared

---

**Data and Outcome-Focused MI**

The FCA's 2025 review emphasises that firms must move beyond policy statements to measurable outcomes.

**What to Measure:**

**Process Metrics:**
• Volumes of vulnerability flags and referrals
• Types of vulnerabilities identified
• Support options offered and taken up
• Forbearance arrangements in place
• Training completion rates

**Outcome Metrics (Critical):**
• Outcomes for vulnerable customers vs non-vulnerable customers:
  - Complaint volumes and resolution times
  - Arrears and default rates
  - Claims acceptance and processing times
  - Customer satisfaction scores
  - Time to resolve issues
  - Financial detriment suffered

**Complaints Analysis:**
• Complaints involving vulnerable customers (explicitly tracked)
• Root cause analysis – are processes causing harm?
• Remediation effectiveness

**Board MI Should Include:**
• Summary of vulnerable customer outcomes vs targets
• Comparison with non-vulnerable customer outcomes
• Key issues and remediation plans
• Resource adequacy assessment
• Emerging risks and themes

---

**Training and Capability**

The FCA expects role-specific training that goes beyond awareness to practical application.

**Frontline Staff Training:**
• Recognising cues and disclosures of vulnerability
• Handling sensitive conversations with empathy
• Adapting communication style (pace, language, checking understanding)
• Using available tools and support options
• Escalation routes and when to use them
• Recording vulnerability appropriately
• Avoiding tipping into harmful territory (over-promising, dependency)

**Product and Journey Owners:**
• Designing with vulnerability in mind
• Building appropriate flexibility into processes
• Using MI to identify harm points
• Testing with diverse customer groups

**Senior Management:**
• Reading and interpreting vulnerability MI
• Challenging culture and resource levels
• Understanding regulatory expectations
• Responding when outcomes are poor

**Training Approach:**
• Use real case studies and scenarios
• Include customer voice and lived experience
• Regular refreshers, not one-off modules
• Feedback loops from QA, complaints, and customer research
• Assessment to confirm understanding, not just completion

---

**Continuous Improvement**

Vulnerability support should not be static. Firms should:

• Regularly review outcomes data and identify improvement opportunities
• Learn from complaints and near-misses
• Stay current with FCA communications and enforcement trends
• Benchmark against good practice in the industry
• Seek customer feedback on support effectiveness
• Update training and processes as understanding evolves`,

        keyConcepts: [
          {
            term: 'Outcome-Focused MI',
            definition: 'Management information that measures actual customer outcomes rather than just process completion or policy existence'
          },
          {
            term: 'Vulnerability Flag',
            definition: 'A marker in customer records indicating identified vulnerability, enabling appropriate support and monitoring'
          },
          {
            term: 'Consumer Duty Champion',
            definition: 'A senior individual, often at board level, with responsibility for overseeing Consumer Duty implementation including vulnerability'
          },
          {
            term: 'Lived Experience',
            definition: 'First-hand knowledge of vulnerability from customers who have experienced it, used to inform training and design'
          }
        ],

        realExamples: [
          'A board reviews MI showing complaints from bereaved customers take 50% longer to resolve than average. They commission a review and approve additional resources for the bereavement team.',
          'A firm tracks outcomes for customers with vulnerability flags and finds they have higher arrears rates. This triggers a review of collections processes and forbearance options.',
          'Training is updated after QA identifies that staff are missing vulnerability cues in calls. Real call recordings (anonymised) are used to demonstrate good and poor practice.'
        ],

        regulatoryRequirements: [
          'FG21/1 Chapter 3 – Understanding the needs of vulnerable customers',
          'FG21/1 Chapter 4 – Skills and capability of staff',
          'FG21/1 Chapter 7 – Monitoring and evaluation',
          'Consumer Duty – Governance requirements (PRIN 2A.7)',
          'SM&CR – Senior manager accountability'
        ]
      }
    }
  ],

  // Practice Scenarios
  practiceScenarios: [
    {
      id: 'scenario-bereavement',
      title: 'Bereavement and Essential Bills',
      context: 'A recently bereaved spouse calls your firm to notify you of the account holder\'s death. They need urgent access to funds to pay funeral and housing costs, but your standard process requires multiple documents, an online form and several weeks\' processing time.',
      challenge: 'How should this situation be handled?',
      options: [
        'Apply the standard process – consistency is important for all customers',
        'Recognise the vulnerability, adapt the process (expedited review, alternative documentation, phone support), and record the situation appropriately',
        'Immediately release all funds without any verification',
        'Ask them to come back when they have all the required documents'
      ],
      correctAnswer: 1,
      explanation: 'This customer has multiple vulnerability drivers: bereavement (life event), likely emotional distress (health/resilience), and urgent financial pressure (resilience). The standard process would cause foreseeable harm. The firm should adapt – expediting where possible, accepting alternative documentation, providing phone support rather than requiring online forms, and recording the vulnerability and support provided.',
      learningPoints: [
        'Bereavement is a key life event driver of vulnerability',
        'Rigid processes can cause foreseeable harm to vulnerable customers',
        'Staff should be empowered to adapt processes within appropriate guardrails',
        'Good record-keeping supports both the customer and the firm'
      ]
    },
    {
      id: 'scenario-digital-exclusion',
      title: 'Digital Exclusion',
      context: 'A customer repeatedly fails to complete an important online journey (e.g. claims submission, change of details). When they call, they sound frustrated and say they "aren\'t good with computers" and don\'t have anyone who can help.',
      challenge: 'What is the appropriate response?',
      options: [
        'Direct them back to the website with step-by-step instructions',
        'Offer alternative channels (phone, post, assisted digital), complete the process with them on the call, and consider how the journey could be improved',
        'Suggest they ask a family member or friend to help',
        'Tell them the online process is the only option available'
      ],
      correctAnswer: 1,
      explanation: 'This customer has a capability driver (low digital skills) and may have other factors (age, isolation, lack of support network). The firm should offer alternative channels immediately and help the customer complete their task on the call. Longer-term, journey design should be reviewed to ensure digital-only isn\'t the only option for important processes.',
      learningPoints: [
        'Digital exclusion is a common capability driver, especially for older customers',
        'Forcing digital-only journeys can exclude vulnerable customers',
        'Alternative channels must be genuinely available, not theoretical',
        'Feedback from these situations should inform journey design'
      ]
    },
    {
      id: 'scenario-debt-stress',
      title: 'Debt Stress and Collections',
      context: 'A customer in arrears explains they have recently lost their job and are now behind on multiple bills. They sound distressed and mention difficulty sleeping and concentrating.',
      challenge: 'How should this collections call be handled?',
      options: [
        'Focus on getting a payment commitment as per standard collections script',
        'Recognise the vulnerability, adjust approach, discuss genuine forbearance options, signpost to debt advice, and record appropriately',
        'Immediately write off the debt to avoid causing harm',
        'End the call quickly because they clearly can\'t pay'
      ],
      correctAnswer: 1,
      explanation: 'This customer shows multiple vulnerability drivers: life event (job loss), reduced resilience (financial pressure, multiple debts), and potential health impact (sleep/concentration issues suggesting stress or anxiety). The collections approach must be adapted: recognise distress, offer meaningful forbearance options, signpost to free debt advice (StepChange, Citizens Advice), and avoid aggressive tactics. The call should be recorded with vulnerability notes.',
      learningPoints: [
        'Financial difficulty often triggers or compounds other vulnerability drivers',
        'Collections teams must be trained to recognise and respond to vulnerability',
        'Forbearance options should be genuine and clearly communicated',
        'Signposting to debt advice is part of supporting vulnerable customers'
      ]
    }
  ],

  // Assessment Questions
  assessmentQuestions: [
    {
      id: 'vc-q1',
      question: 'Which statement best reflects the FCA\'s definition of a vulnerable customer in FG21/1?',
      options: [
        { id: 'a', text: 'Any customer over the age of 65' },
        { id: 'b', text: 'Any customer who has ever missed a payment' },
        { id: 'c', text: 'Someone who, due to their personal circumstances, is especially susceptible to harm, particularly if the firm does not act with appropriate care' },
        { id: 'd', text: 'Only customers with formally diagnosed mental health conditions' }
      ],
      correctAnswer: 'c',
      explanation: 'FG21/1 defines a vulnerable customer as someone whose personal circumstances make them especially susceptible to harm, particularly if the firm fails to act with appropriate levels of care. This is not limited to age, arrears, or specific diagnoses.',
      topic: 'FCA Definition'
    },
    {
      id: 'vc-q2',
      question: 'Which of the following lists the four key drivers of vulnerability used by the FCA?',
      options: [
        { id: 'a', text: 'Income, age, geography, education' },
        { id: 'b', text: 'Health, life events, resilience, capability' },
        { id: 'c', text: 'Gender, nationality, employment, savings' },
        { id: 'd', text: 'Channel, product type, tenure, sector' }
      ],
      correctAnswer: 'b',
      explanation: 'The FCA groups vulnerability drivers into health, life events, resilience and capability. Any combination can increase the risk of harm, and many customers experience multiple drivers at once.',
      topic: 'Drivers of Vulnerability'
    },
    {
      id: 'vc-q3',
      question: 'What is the FCA\'s stated objective regarding outcomes for vulnerable customers?',
      options: [
        { id: 'a', text: 'Vulnerable customers should receive more frequent marketing communications' },
        { id: 'b', text: 'Vulnerable customers should have lower expectations of service' },
        { id: 'c', text: 'Vulnerable customers should experience outcomes as good as those for other customers' },
        { id: 'd', text: 'Vulnerable customers should only be offered basic products' }
      ],
      correctAnswer: 'c',
      explanation: 'FG21/1 and related FCA communications emphasise that vulnerable customers should experience outcomes as good as those for other customers, not lower standards or separate "second-tier" treatment.',
      topic: 'Outcomes'
    },
    {
      id: 'vc-q4',
      question: 'How does the Consumer Duty interact with the FCA\'s vulnerable customer guidance?',
      options: [
        { id: 'a', text: 'The Duty replaces FG21/1, so firms can ignore the older guidance' },
        { id: 'b', text: 'The Duty lowers expectations for vulnerable customers because it focuses on average outcomes' },
        { id: 'c', text: 'The Duty and FG21/1 work together; firms must deliver good outcomes for all customers and consider characteristics of vulnerability when applying the Duty' },
        { id: 'd', text: 'The Duty applies only to non-vulnerable customers' }
      ],
      correctAnswer: 'c',
      explanation: 'The Consumer Duty raises standards for all customers, including those in vulnerable circumstances, and does not replace FG21/1. Firms must apply the Duty\'s cross-cutting rules and outcomes in a way that recognises vulnerability and avoids foreseeable harm.',
      topic: 'Consumer Duty Integration'
    },
    {
      id: 'vc-q5',
      question: 'Which example best demonstrates proactive identification of vulnerability?',
      options: [
        { id: 'a', text: 'Waiting for customers to use the word "vulnerable" before offering any additional support' },
        { id: 'b', text: 'Assuming all customers are equally resilient unless they complain' },
        { id: 'c', text: 'Training staff to listen for cues and using data to identify patterns that may indicate vulnerability' },
        { id: 'd', text: 'Recording vulnerability only where the customer provides medical evidence' }
      ],
      correctAnswer: 'c',
      explanation: 'The FCA expects firms to proactively identify vulnerability using both staff judgement (listening for cues) and data/MI, not only formal labels or medical evidence.',
      topic: 'Identification'
    },
    {
      id: 'vc-q6',
      question: 'A firm\'s bereavement process requires multiple forms and long timescales. Staff see customers in distress but are told "the process is the process". According to the FCA\'s expectations, which is the best response?',
      options: [
        { id: 'a', text: 'Continue with the standard process; consistency is more important than customer impact' },
        { id: 'b', text: 'Allow staff and managers some flexibility to deviate from process, within guardrails, where the standard process would cause harm to vulnerable customers' },
        { id: 'c', text: 'Only change the process if the FCA criticises it in a review' },
        { id: 'd', text: 'Avoid documenting vulnerability to minimise regulatory scrutiny' }
      ],
      correctAnswer: 'b',
      explanation: 'FG21/1 and the 2025 review highlight the need for flexibility and judgement in processes, especially in bereavement and crisis situations. Rigid adherence to harmful processes is inconsistent with good outcomes for vulnerable customers.',
      topic: 'Process Flexibility'
    },
    {
      id: 'vc-q7',
      question: 'Which example shows effective MI for vulnerable customers?',
      options: [
        { id: 'a', text: 'Total number of calls handled per month' },
        { id: 'b', text: 'Number of marketing emails sent to all customers' },
        { id: 'c', text: 'Outcomes for customers with a recorded vulnerability flag compared with other customers' },
        { id: 'd', text: 'Total revenue by product line only' }
      ],
      correctAnswer: 'c',
      explanation: 'The FCA expects outcome-focused MI, including comparisons between vulnerable and non-vulnerable customers, to assess whether support is effective and whether outcomes are at least as good.',
      topic: 'MI and Monitoring'
    },
    {
      id: 'vc-q8',
      question: 'Which statement best reflects FCA expectations about training and culture for vulnerable customers?',
      options: [
        { id: 'a', text: 'Only frontline staff need training on vulnerability' },
        { id: 'b', text: 'A short one-off e-learning module is sufficient regardless of the firm\'s risk profile' },
        { id: 'c', text: 'Senior leaders should embed a culture that prioritises fair treatment of vulnerable customers, supported by ongoing, role-specific training across the firm' },
        { id: 'd', text: 'Training is optional as long as there is a written policy' }
      ],
      correctAnswer: 'c',
      explanation: 'FG21/1 stresses that senior leaders and culture are critical, and that firms should embed fair treatment of vulnerable customers throughout policies, processes and staff training, not just on the frontline or in one-off modules.',
      topic: 'Training and Culture'
    }
  ],

  // Summary Section
  summary: {
    keyTakeaways: [
      'A vulnerable customer is someone especially susceptible to harm due to personal circumstances – any customer can become vulnerable',
      'Four drivers: health, life events, resilience, capability – most vulnerable customers experience multiple drivers',
      'The objective is outcomes as good as other customers, not lower standards or separate treatment',
      'Consumer Duty and FG21/1 work together – vulnerability amplifies the risk of foreseeable harm',
      'Processes must have flexibility built in – rigid application of standard procedures causes harm',
      'Outcome-focused MI comparing vulnerable and non-vulnerable customers is essential for boards'
    ],
    nextSteps: [
      'Review how your team identifies vulnerability – are you relying on customers to self-identify?',
      'Map key touchpoints where vulnerability is likely to surface in your business',
      'Check that you have alternative channels for customers who struggle with digital processes',
      'Ensure MI tracks outcomes for vulnerable customers, not just process metrics',
      'Understand escalation routes and support options available for vulnerable customers'
    ],
    quickReference: [
      'Definition: Especially susceptible to harm when firms don\'t act with appropriate care',
      'Four drivers: Health, Life events, Resilience, Capability',
      'Objective: Outcomes as good as other customers',
      'Process principle: Flexibility within guardrails, not rigid scripts',
      'MI: Outcome comparison – vulnerable vs non-vulnerable customers'
    ]
  },

  // Visual Assets
  visualAssets: {
    images: [
      {
        section: 'hook',
        description: 'Customer on phone looking distressed with paperwork, call centre agent with stopwatch showing time pressure'
      },
      {
        section: 'drivers',
        description: 'Four-quadrant diagram: Health, Life Events, Resilience, Capability with icons and examples'
      },
      {
        section: 'journey',
        description: 'Customer journey map with vulnerability touchpoints highlighted (onboarding, collections, claims, bereavement)'
      },
      {
        section: 'flexibility',
        description: 'Process flowchart with "standard path" and "flexible path for vulnerable customers" branches'
      },
      {
        section: 'mi',
        description: 'Dashboard comparing outcomes: vulnerable vs non-vulnerable customers across key metrics'
      }
    ],
    style: 'Empathetic, customer-centric design with clear frameworks and practical guidance'
  }
};
