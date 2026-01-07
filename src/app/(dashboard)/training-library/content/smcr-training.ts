import { TrainingModule } from '../types';

export const smcrTrainingModule: TrainingModule = {
  id: 'smcr-training',
  title: 'Senior Managers & Certification Regime (SM&CR)',
  description: 'Understand the SM&CR framework, individual accountability, fitness and propriety requirements, and conduct rules for financial services.',
  category: 'regulatory-compliance',
  duration: 20,
  difficulty: 'advanced',
  targetPersonas: ['senior-manager', 'certified-person', 'hr-professional'],
  prerequisiteModules: [],
  tags: ['smcr', 'accountability', 'conduct-rules', 'fitness-propriety', 'individual-accountability'],
  learningOutcomes: [
    'Understand the structure and objectives of the SM&CR framework',
    'Identify Senior Management Functions (SMFs) and Certification Functions',
    'Apply fitness and propriety assessments effectively',
    'Implement conduct rules and accountability requirements',
    'Manage regulatory notifications and ongoing obligations'
  ],

  // Hook Section
  hook: {
    type: 'regulatory_breach',
    title: 'The End of "Nobody\'s Fault" - Personal Accountability Revolution',
    content: `For decades, when things went wrong in financial services, it was difficult to pin down who was responsible. Complex corporate structures, diffused decision-making, and collective accountability meant that individuals could escape consequences even when firms faced massive fines.

    Then came 2012. Barclays was fined £290 million for LIBOR manipulation. RBS was fined £390 million for similar conduct. HSBC paid $1.9 billion for money laundering failures. But here's what was truly shocking: despite these enormous institutional failures, very few individuals faced personal consequences.

    The public and politicians were outraged. How could banks pay billions in fines while the people who made the decisions walked away unscathed?

    The answer was the Senior Managers & Certification Regime (SM&CR) - the most significant change to individual accountability in financial services history. Introduced in 2016, it fundamentally shifted the burden of proof. Instead of regulators having to prove individual wrongdoing, senior managers now have to prove they took reasonable steps to prevent problems.

    Under SM&CR:
    - £64 million in individual fines have been imposed
    - Hundreds of senior managers have been prohibited from working in financial services
    - Every significant decision now has a named individual accountable
    - The "I didn't know" defense is no longer acceptable

    This isn't just about compliance - it's about a cultural revolution that makes every senior person personally accountable for their firm's conduct. The question isn't whether you'll face scrutiny under SM&CR - it's whether you'll be ready when you do.`,
    keyQuestion: 'Are you prepared to prove that you took reasonable steps to prevent regulatory failures in your area of responsibility?'
  },

  // Main Content Sections
  lessons: [
    {
      id: 'smcr-framework',
      title: 'SM&CR Framework and Objectives',
      type: 'content',
      duration: 5,
      content: {
        learningPoint: 'Master the fundamental structure, objectives, and scope of the Senior Managers & Certification Regime',
        mainContent: `The Senior Managers & Certification Regime represents the most significant regulatory change in individual accountability since the creation of the FCA. Understanding its framework is essential for anyone in a position of authority within financial services.

**Core Objectives of SM&CR:**

**1. Individual Accountability**
The primary goal is to ensure that individuals, not just firms, are held accountable for decisions and conduct:
- Clear allocation of responsibilities to named individuals
- Personal liability for failures in areas of responsibility
- Reversal of burden of proof - individuals must demonstrate they acted reasonably
- Direct regulatory action against individuals for misconduct

**2. Cultural Change**
SM&CR aims to transform the culture of financial services:
- Encouraging proactive risk management and ethical behavior
- Eliminating "group think" and collective decision-making without accountability
- Promoting challenge and oversight within organizations
- Establishing clear consequences for poor decision-making

**3. Consumer Protection**
Ultimately, SM&CR serves to protect consumers and market integrity:
- Ensuring competent and ethical leadership
- Reducing conduct risk and consumer harm
- Improving decision-making quality and governance
- Enhancing market confidence in financial services

**Three-Tier Structure of SM&CR:**

**Tier 1: Senior Managers**
Individuals in the most senior roles with significant influence over firm operations:
- Must be approved by the FCA/PRA before taking up position
- Subject to fitness and propriety assessments
- Have prescribed responsibilities that cannot be delegated
- Face personal liability for failures in their areas
- Subject to conduct rules and potential prohibition

**Tier 2: Certified Persons**
Individuals performing customer-facing or risk-significant functions:
- Do not require regulatory approval but must be certified by their firm
- Annual fitness and propriety assessments by employer
- Subject to conduct rules and potential action
- Certification can be withdrawn by firm or regulator
- Lower threshold for accountability than Senior Managers

**Tier 3: All Other Staff**
Employees not in Senior Manager or Certification functions:
- Subject to basic conduct rules
- Covered by firm's overall accountability framework
- May be subject to regulatory action for serious misconduct
- Protected by whistleblowing provisions

**Scope and Application:**

**Firms Covered by SM&CR:**
- All FCA solo-regulated firms (from December 2019)
- All PRA-regulated firms (banks, building societies, insurers)
- Credit unions and friendly societies
- Some investment firms and asset managers
- Appointed representatives performing certification functions

**Geographic Scope:**
- Applies to UK operations and activities
- Covers decisions affecting UK consumers or markets
- May apply to overseas staff making UK-relevant decisions
- Branch operations of overseas firms may be included

**Functions Covered:**
- Executive and non-executive directors
- Senior operational roles (COO, CRO, CFO)
- Customer-facing roles (advisors, dealers, managers)
- Risk-significant roles (compliance, audit, actuarial)
- Material outsourcing arrangements

**Key Differences from Previous Regimes:**

**Approved Persons Regime (APR) vs. SM&CR:**

*APR Limitations:*
- Limited scope covering only specific controlled functions
- Reactive approach focusing on post-incident action
- Burden on regulator to prove individual wrongdoing
- Unclear allocation of responsibilities
- Limited ongoing oversight and assessment

*SM&CR Improvements:*
- Comprehensive coverage of all significant roles
- Proactive approach requiring continuous demonstration of fitness
- Burden on individuals to prove they acted reasonably
- Clear allocation of responsibilities through prescribed responsibilities
- Regular fitness and propriety assessments

**Regulatory Powers Under SM&CR:**

**Enhanced Investigation Powers:**
- Detailed questioning about decision-making processes
- Review of individual conduct and competence
- Assessment of whether reasonable steps were taken
- Evaluation of ongoing fitness and propriety
- Cross-referencing with prescribed responsibilities

**Enforcement Tools:**
- Prohibition orders preventing work in financial services
- Individual financial penalties and disgorgement
- Public censure and reputational sanctions
- Conditional approval with restrictions
- Variation or withdrawal of approvals

**International Context:**

**Global Trend Toward Individual Accountability:**
- Similar regimes developing in Australia, Singapore, Hong Kong
- US enforcement focus on individual accountability
- EU considering enhanced individual liability frameworks
- International coordination on standards and best practices

**Cross-Border Implications:**
- Mutual recognition arrangements with some jurisdictions
- Information sharing between regulators
- Considerations for global firms and international mobility
- Extraterritorial application for UK market activities

**Implementation Timeline and Evolution:**

**Phased Implementation:**
- 2016: Introduction for large banks and building societies
- 2018: Extension to all PRA-regulated firms
- 2019: Extension to all FCA solo-regulated firms
- Ongoing: Refinements and enhancements based on experience

**Future Developments:**
- Potential extension to other sectors (e.g., payment services)
- Enhanced technology and data requirements
- Strengthened whistleblowing protections
- Integration with other accountability regimes

**Practical Implications for Organizations:**

**Governance Changes Required:**
- Clear allocation of responsibilities to individuals
- Enhanced documentation of decision-making
- Robust challenge and oversight mechanisms
- Improved risk management and control frameworks
- Cultural change programs and training

**Resource Implications:**
- Additional compliance and HR resources
- Enhanced recruitment and vetting procedures
- Ongoing training and development programs
- Technology investments for monitoring and reporting
- Legal and professional advisory costs

**Reasonable Steps Framework**
- Set clear governance, delegation, and oversight
- Ensure MI and escalation routes exist and are used
- Document decisions, challenge, and follow-up actions`,

        keyConcepts: [
          {
            term: 'Prescribed Responsibilities',
            definition: 'Specific regulatory responsibilities that must be allocated to approved Senior Managers and cannot be delegated'
          },
          {
            term: 'Reverse Burden of Proof',
            definition: 'Under SM&CR, individuals must prove they took reasonable steps rather than regulators proving wrongdoing'
          },
          {
            term: 'Fitness and Propriety',
            definition: 'The regulatory standard assessing whether an individual is suitable to perform their role in terms of competence and character'
          },
          {
            term: 'Individual Accountability',
            definition: 'The principle that specific individuals, not just firms, are personally responsible for decisions and outcomes'
          }
        ],

        realExamples: [
          'A bank CEO under SM&CR must demonstrate they took reasonable steps to prevent a data breach, even if they weren\'t directly involved in IT security.',
          'A wealth management firm must certify annually that their investment advisors remain fit and proper, with documented evidence.',
          'Following a mis-selling incident, the FCA investigates both the firm and the responsible Senior Manager\'s decision-making process.'
        ],

        regulatoryRequirements: [
          'FCA Handbook SYSC 4.2 - Senior management arrangements',
          'PRA Rulebook - Senior Managers Regime',
          'FCA Handbook SUP 10C - FCA senior managers regime',
          'FCA Handbook COCON - Conduct Rules'
        ]
      }
    },

    {
      id: 'senior-management-functions',
      title: 'Senior Management Functions and Responsibilities',
      type: 'content',
      duration: 5,
      content: {
        learningPoint: 'Understand the specific Senior Management Functions, their prescribed responsibilities, and accountability requirements',
        mainContent: `Senior Management Functions (SMFs) are the most senior roles within firms, carrying the highest level of personal accountability and regulatory scrutiny. Each SMF comes with specific prescribed responsibilities that cannot be delegated.

**Core Senior Management Functions:**

**SMF1 - Chief Executive Officer**
The most senior executive responsible for overall firm management:

*Key Responsibilities:*
- Overall responsibility for firm's strategy and operations
- Ensuring adequate systems and controls are in place
- Responsibility for firm's culture and conduct
- Ultimate accountability for regulatory compliance
- Decision-making on significant business matters

*Prescribed Responsibilities:*
- Responsibility for the firm's strategy for meeting its obligations under the regulatory system
- Responsibility for management of the allocation and maintenance of the firm's financial resources
- Responsibility for the firm's policies and procedures for countering the risk of financial crime

**SMF2 - Chief Finance Officer (CFO)**
Senior executive responsible for financial management and reporting:

*Key Responsibilities:*
- Financial planning, reporting, and risk management
- Regulatory capital and liquidity management
- Financial crime systems and controls
- Budgeting and management information
- External financial reporting and regulatory submissions

*Prescribed Responsibilities:*
- Responsibility for management of the allocation and maintenance of the firm's financial resources
- Responsibility for the firm's treasury management functions
- Responsibility for the production and integrity of the firm's financial information and regulatory reporting

**SMF3 - Executive Director**
Executive directors who are not allocated other SMFs:

*Application:*
- Executive directors without specific functional responsibilities
- May have prescribed responsibilities allocated based on role
- Subject to collective board responsibilities
- Individual accountability for board decisions and oversight

**SMF4 - Chief Risk Officer (CRO)**
Senior executive responsible for risk management framework:

*Key Responsibilities:*
- Development and maintenance of risk management framework
- Risk appetite setting and monitoring
- Independent challenge to business lines
- Regulatory relationship management on risk matters
- Crisis management and business continuity

*Prescribed Responsibilities:*
- Responsibility for the firm's risk management function
- Responsibility for the firm's compliance with requirements related to recovery and resolution planning

**SMF5 - Head of Internal Audit**
Senior executive responsible for internal audit function:

*Key Responsibilities:*
- Independent assessment of firm's risk management and controls
- Audit planning and execution
- Reporting to board and senior management
- Relationship with external auditors
- Regulatory relationship on audit matters

*Prescribed Responsibilities:*
- Responsibility for the firm's internal audit function
- Responsibility for ensuring the firm's internal audit function has unrestricted access to firm records

**SMF6 - Head of Key Business Area**
Senior executives responsible for significant business lines:

*Application:*
- Heads of major business divisions or product lines
- Responsibility for substantial revenue or risk generation
- Customer-facing business leadership
- Regional or functional leadership roles

*Key Responsibilities:*
- Business strategy and performance
- Risk management within business area
- Regulatory compliance for business activities
- Customer outcomes and conduct

**SMF9 - Chairman**
The chairman of the firm's governing body:

*Key Responsibilities:*
- Board leadership and effectiveness
- Board composition and succession planning
- Stakeholder engagement and communication
- Governance and culture oversight
- Regulatory relationship management

*Prescribed Responsibilities:*
- Responsibility for the leadership and management of the governing body
- Responsibility for the induction, development and performance assessment of members of the governing body

**SMF10 - Chair of Risk Committee**
Chair of the board risk committee (for larger firms):

*Key Responsibilities:*
- Risk committee leadership and effectiveness
- Risk governance and oversight
- Challenge to executive management on risk matters
- Risk communication to the board
- Regulatory engagement on risk issues

**SMF11 - Chair of Audit Committee**
Chair of the board audit committee:

*Key Responsibilities:*
- Audit committee leadership and effectiveness
- External auditor appointment and oversight
- Financial reporting oversight
- Internal controls assessment
- Whistleblowing oversight

**SMF12 - Chair of Remuneration Committee**
Chair of the board remuneration committee:

*Key Responsibilities:*
- Remuneration committee leadership
- Executive compensation design and oversight
- Risk alignment of incentive structures
- Regulatory compliance on remuneration
- Stakeholder communication on pay matters

**Non-Executive Director Functions:**

**SMF14 - Senior Independent Director**
Independent non-executive director with enhanced responsibilities:

*Key Responsibilities:*
- Challenge to chairman and executive management
- Stakeholder engagement and communication
- Board evaluation and effectiveness
- Conflict of interest management
- Succession planning oversight

**SMF15-18 - Independent Non-Executive Directors**
Independent directors providing challenge and oversight:

*Key Responsibilities:*
- Independent judgment and challenge
- Strategy development and oversight
- Risk management and control assessment
- Regulatory compliance monitoring
- Cultural and conduct oversight

**Prescribed Responsibilities Framework:**

**Cannot Be Delegated:**
- Prescribed responsibilities must be held by approved Senior Managers
- Cannot be shared between multiple individuals
- Must be clearly documented and communicated
- Regular review and updating required
- Personal accountability cannot be avoided

**Common Prescribed Responsibilities:**
- Responsibility for the firm's compliance with requirements related to the management of conflicts of interest
- Responsibility for the firm's policies and procedures for countering financial crime
- Responsibility for the firm's compliance with requirements relating to outsourcing
- Responsibility for the management of the firm's business model
- Responsibility for the firm's culture

**Allocation and Documentation:**

**Responsibilities Map:**
- Document showing allocation of all prescribed responsibilities
- Must be maintained and updated regularly
- Available to regulators on request
- Board approval required for changes
- Clear accountability chains established

**Management Responsibilities Map:**
- Broader allocation of management responsibilities
- Covers areas not captured in prescribed responsibilities
- Supports overall accountability framework
- Regular review and updating
- Integration with performance management

**Cross-Functional Considerations:**

**Shared Responsibilities:**
- Some areas require coordination between SMFs
- Clear primary and secondary accountability
- Escalation and communication protocols
- Collective responsibility for board decisions
- Individual accountability within collective framework

**Succession Planning:**
- Temporary allocation of responsibilities during absences
- Succession planning for key roles
- Regulatory notification requirements
- Interim appointment procedures
- Continuity of accountability

**International Firms:**

**Global vs. Local Responsibilities:**
- UK-specific responsibilities for local operations
- Coordination with global management
- Regulatory reporting and communication
- Local accountability within global framework
- Potential conflicts between jurisdictions

**Branch and Subsidiary Considerations:**
- Separate SMF appointments may be required
- Coordination between legal entities
- Group-wide vs. local responsibilities
- Regulatory relationship management
- Capital and resource allocation

**SoR Updates**
- Update Statements of Responsibilities when duties change
- Document handover and acceptance of new responsibilities
- Ensure the responsibilities map is consistent with updated SoRs`,

        keyConcepts: [
          {
            term: 'Senior Management Function (SMF)',
            definition: 'Specific senior roles requiring FCA/PRA approval with defined responsibilities and personal accountability'
          },
          {
            term: 'Prescribed Responsibility',
            definition: 'Specific regulatory responsibility that must be allocated to an approved Senior Manager and cannot be delegated'
          },
          {
            term: 'Responsibilities Map',
            definition: 'Document showing how prescribed responsibilities are allocated among Senior Managers within a firm'
          },
          {
            term: 'Management Responsibilities Map',
            definition: 'Broader document showing allocation of all significant management responsibilities beyond prescribed responsibilities'
          }
        ],

        realExamples: [
          'A bank\'s CEO (SMF1) is personally accountable for the firm\'s financial crime policies, even if day-to-day implementation is managed by compliance staff.',
          'When a CRO (SMF4) changes roles, the prescribed responsibility for risk management must be formally allocated to a replacement before they leave.',
          'An investment firm\'s responsibilities map shows clear allocation of MiFID II compliance responsibility to the Head of Wealth Management (SMF6).'
        ],

        regulatoryRequirements: [
          'FCA Handbook SUP 10C.5 - Prescribed responsibilities',
          'PRA Rulebook - Senior Managers Regime 2.1',
          'FCA Handbook SYSC 25 - Responsibilities maps',
          'FCA Handbook SUP 10C.4 - Senior management functions'
        ]
      }
    },

    {
      id: 'handover-notifications',
      title: 'Handover, Regulatory References and Notifications',
      type: 'content',
      duration: 5,
      content: {
        learningPoint: 'Clear handovers and timely notifications protect firms and individuals.',
        mainContent: `SM&CR requires firms to manage transitions and regulatory communications with discipline. Poor handovers and missed notifications are common findings in FCA reviews.

**Handover Procedures**
- Document responsibilities, risks, and open issues when roles change
- Provide clear ownership of ongoing regulatory commitments
- Maintain handover records for audit and accountability

**Regulatory References**
- Firms must obtain and provide regulatory references for senior managers and certified persons
- References should cover disciplinary findings, conduct rule breaches, and relevant investigations

**Notifications**
- Notify regulators of certain breaches, role changes, or withdrawals
- Ensure timelines for updates to SoRs and approvals are met
- Maintain evidence of submissions and responses

**Handover Pack Essentials**
- Key risks and open issues
- Committees, reporting lines, and MI cadence
- Outstanding regulatory commitments and deadlines`,
        keyConcepts: [
          {
            term: 'Handover Certificate',
            definition: 'Documented record of responsibilities, risks, and open actions during role changes.'
          },
          {
            term: 'Regulatory Reference',
            definition: 'Reference provided to new employers detailing conduct and disciplinary history.'
          },
          {
            term: 'Form C/D Notifications',
            definition: 'Regulatory notifications for changes, withdrawals, or breaches.'
          }
        ],
        realExamples: [
          'A senior manager left without a formal handover, creating gaps in accountability that were later criticised by the FCA.',
          'A firm failed to update the FCA after a role change, leading to delays in approval and compliance issues.'
        ]
      }
    },
    {
      id: 'certification-regime',
      title: 'Certification Regime and Fitness Assessment',
      type: 'content',
      duration: 5,
      content: {
        learningPoint: 'Implement effective certification procedures and ongoing fitness and propriety assessments for key personnel',
        mainContent: `The Certification Regime covers individuals who are not Senior Managers but perform functions that could pose significant risk to the firm or consumers. Unlike Senior Managers, these individuals do not require regulatory approval but must be certified annually by their firm.

**Fit and Proper Assessment**
- Honesty, integrity, and reputation
- Competence and capability for the role
- Financial soundness where relevant

**Annual Certification Evidence**
- Training completion and competence checks
- Performance reviews and supervision records
- Conduct breaches, remediation, and outcomes

**Certification Withdrawal**
- If certification cannot be granted, the individual must stop performing the role
- Document the decision, rationale, and any required notifications

**Certification Functions Overview:**

**Customer-Facing Functions:**
These roles involve direct interaction with customers and require certification:

*CF1 - Giving Advice on Investments:*
- Investment advisors and wealth managers
- Pension and retirement planning specialists
- Insurance and protection advisors
- Platform and wrap account advisors

*CF2 - Giving Advice on P2P Agreements:*
- Peer-to-peer lending advisors
- Crowdfunding platform advisors
- Alternative investment specialists

*CF10 - Functions Requiring Qualifications:*
- Roles requiring specific professional qualifications
- Chartered and certified financial planners
- Specialist investment areas (derivatives, structured products)

**Dealing and Proprietary Trading:**
- Execution traders and market makers
- Proprietary trading desk personnel
- High-frequency trading system operators
- Prime brokerage and institutional dealing

**Benchmark Roles:**
- Benchmark administrators and submitters
- Reference rate contributors
- Index calculation and dissemination roles
- Benchmark governance and oversight

**Material Risk Functions:**
- Credit decision makers above certain thresholds
- Large exposure and concentration risk managers
- Operational risk specialists
- Model validation and development specialists

**Annual Certification Requirements:**

**Fitness and Propriety Assessment:**
Firms must assess each certified person annually across multiple dimensions:

*Competence and Capability:*
- Technical knowledge and skills for the role
- Understanding of regulatory requirements
- Ability to apply knowledge in practice
- Continuing professional development
- Performance track record and outcomes

*Financial Soundness:*
- Personal financial management and history
- Absence of significant financial difficulties
- No disqualifying bankruptcy or insolvency
- Appropriate management of personal finances
- Transparency about financial circumstances

*Honesty, Integrity, and Reputation:*
- Criminal conviction history and disclosures
- Regulatory enforcement history
- Employment disciplinary actions
- Professional misconduct or ethical breaches
- Truthfulness in applications and ongoing disclosures

**Assessment Process and Documentation:**

**Annual Review Cycle:**
- Systematic review of all certified persons
- Evidence gathering and verification
- Performance assessment and feedback
- Training needs identification
- Certification decision and documentation

**Evidence Requirements:**
- Performance reviews and objective assessments
- Customer feedback and complaint analysis
- Regulatory training completion records
- Professional development and qualification updates
- Conduct and behavior assessments

**Certification Decision Making:**
- Clear criteria for granting/withdrawing certification
- Senior management review and approval
- Documentation of decision rationale
- Communication to individual and relevant teams
- Regulatory notification if required

**Ongoing Monitoring and Assessment:**

**Continuous Fitness Monitoring:**
Between annual certifications, firms must monitor:
- Conduct and behavior indicators
- Customer complaints and feedback
- Performance deterioration or concerns
- Regulatory breaches or issues
- Personal circumstances affecting fitness

**Trigger Events for Review:**
- Customer complaints or regulatory breaches
- Poor performance or conduct issues
- Criminal charges or convictions
- Financial difficulties or bankruptcy
- Professional misconduct in other roles

**Training and Development:**

**Regulatory Training Requirements:**
- Understanding of conduct rules
- Product and market knowledge
- Consumer protection requirements
- Financial crime awareness
- Relevant technical skills

**Continuing Professional Development:**
- Industry qualifications and updates
- Technical skills enhancement
- Leadership and management development
- Regulatory change training
- Ethics and conduct training

**Quality Assurance Framework:**

**Internal Oversight:**
- Senior management oversight of certification process
- Internal audit review of procedures and decisions
- Board reporting on certification statistics and issues
- Regular process review and improvement
- Integration with overall HR and performance management

**External Validation:**
- Regulatory review and assessment
- Professional body requirements
- External training provider validation
- Industry benchmarking and best practice
- Independent assurance of process effectiveness

**Record Keeping and Documentation:**

**Individual Files:**
- Complete fitness and propriety assessment records
- Performance reviews and development plans
- Training completion certificates
- Conduct and behavior documentation
- Historical certification decisions and rationale

**Aggregate Reporting:**
- Annual statistics on certifications granted/withdrawn
- Training completion rates and gaps
- Conduct rule breaches and remediation
- Industry benchmarking and trends
- Board and senior management reporting

**Withdrawal of Certification:**

**Grounds for Withdrawal:**
- Failure to meet fitness and propriety standards
- Serious conduct rule breaches
- Poor performance affecting consumer outcomes
- Criminal convictions or regulatory enforcement
- Dishonesty or integrity failures

**Process Requirements:**
- Fair and transparent investigation process
- Right to representation and appeal
- Clear communication of decision
- Regulatory notification requirements
- Transition and handover procedures

**Regulatory Interface:**

**FCA Oversight:**
- Review of firm certification procedures
- Assessment of decision-making quality
- Enforcement action for systematic failures
- Guidance and policy development
- Industry data collection and analysis

**Individual Regulatory Action:**
- Prohibition orders for serious misconduct
- Individual financial penalties
- Public censure and warnings
- Conditions and restrictions
- Criminal prosecution for serious offenses

**International Considerations:**

**Cross-Border Certification:**
- Recognition of overseas qualifications
- Coordination with international standards
- Expatriate and international mobility
- Regulatory cooperation and information sharing
- Global firm policy coordination

**Professional Body Integration:**
- Coordination with chartered and professional bodies
- Recognition of industry qualifications
- Joint training and development programs
- Shared disciplinary and conduct standards
- Professional development pathways

**Technology and Innovation:**

**Digital Assessment Tools:**
- Online training and assessment platforms
- Automated monitoring and alert systems
- Digital record keeping and management
- Data analytics for pattern recognition
- Integration with HR and performance systems

**Future Developments:**
- Enhanced data requirements and reporting
- Machine learning for risk assessment
- Real-time monitoring capabilities
- International data sharing platforms
- Regulatory technology integration`,

        keyConcepts: [
          {
            term: 'Certification Function',
            definition: 'A role that requires annual fitness and propriety certification by the firm but not regulatory approval'
          },
          {
            term: 'Annual Certification',
            definition: 'The yearly process by which firms assess and certify that individuals remain fit and proper for their roles'
          },
          {
            term: 'Fitness and Propriety',
            definition: 'The standard assessing competence, financial soundness, and honesty/integrity required for financial services roles'
          },
          {
            term: 'Withdrawal of Certification',
            definition: 'The process by which a firm removes certification from an individual who no longer meets required standards'
          }
        ],

        realExamples: [
          'An investment advisor receives annual certification after demonstrating continued competence, clean conduct record, and completion of required training.',
          'A trader\'s certification is withdrawn following a serious conduct breach, requiring immediate removal from customer-facing activities.',
          'A wealth manager\'s annual review identifies training gaps, leading to a development plan before certification renewal.'
        ],

        regulatoryRequirements: [
          'FCA Handbook SUP 10C.9 - Certification regime',
          'FCA Handbook COND - Threshold conditions and fitness and propriety',
          'FCA Handbook TC - Training and competence',
          'FCA Handbook SYSC 5 - Certification regime responsibilities'
        ]
      }
    },

    {
      id: 'conduct-rules',
      title: 'Conduct Rules and Accountability Standards',
      type: 'content',
      duration: 5,
      content: {
        learningPoint: 'Apply conduct rules effectively and understand accountability standards for different tiers of staff',
        mainContent: `The Conduct Rules establish minimum standards of behavior for all staff in scope of SM&CR. They create a clear framework for expected conduct and provide the basis for regulatory enforcement against individuals.

**Tiered Application of Conduct Rules:**

**Tier 1: Individual Conduct Rules (Apply to All Staff)**
These fundamental rules apply to everyone in scope:

**Individual Conduct Rule 1: Integrity**
"You must act with integrity"

*Practical Application:*
- Honesty in all professional dealings
- Transparency about conflicts of interest
- Accurate representation of products and services
- Truthfulness in regulatory and internal reporting
- Ethical decision-making in all circumstances

*Examples of Breaches:*
- Falsifying documents or records
- Deliberately misleading customers or colleagues
- Concealing material information
- Engaging in fraudulent activity
- Conflicts of interest without disclosure

**Individual Conduct Rule 2: Skill, Care and Diligence**
"You must act with due skill, care and diligence"

*Practical Application:*
- Maintaining competence for your role
- Continuous professional development
- Attention to detail in work performance
- Understanding regulatory requirements
- Seeking guidance when uncertain

*Examples of Breaches:*
- Persistent poor performance without improvement
- Failure to maintain required qualifications
- Negligent advice or recommendations
- Inadequate preparation or research
- Ignoring obvious risks or red flags

**Individual Conduct Rule 3: Management, Systems and Controls**
"You must be open and cooperative with the FCA, the PRA and other regulators"

*Practical Application:*
- Prompt and complete responses to regulatory requests
- Honest disclosure of relevant information
- Cooperation with investigations and reviews
- Transparency about firm activities and issues
- Proactive communication of material matters

*Examples of Breaches:*
- Withholding information from regulators
- Providing false or misleading information
- Obstruction of regulatory investigations
- Failure to respond to regulatory requests
- Intimidation of witnesses or whistleblowers

**Individual Conduct Rule 4: Customer Treatment**
"You must pay due regard to the interests of customers and treat them fairly"

*Practical Application:*
- Considering customer needs and circumstances
- Providing suitable advice and recommendations
- Clear and fair communication
- Prompt complaint handling and resolution
- Avoiding conflicts that disadvantage customers

*Examples of Breaches:*
- Mis-selling products or services
- Churning or excessive trading
- Unfair contract terms or practices
- Poor complaint handling
- Prioritizing firm profits over customer interests

**Individual Conduct Rule 5: Market Conduct**
"You must observe proper standards of market conduct"

*Practical Application:*
- Fair dealing in financial markets
- Compliance with market rules and regulations
- Avoiding market abuse and manipulation
- Proper use of inside information
- Maintaining market integrity

*Examples of Breaches:*
- Insider trading or market manipulation
- Front running or position abuse
- Breach of market timing rules
- Unfair pricing or execution
- Violation of disclosure requirements

**Tier 2: Senior Manager Conduct Rules (Additional for Senior Managers)**

**Senior Manager Conduct Rule 1: Governance**
"You must take reasonable steps to ensure that the business of the firm for which you are responsible is controlled effectively"

*Practical Application:*
- Implementing appropriate governance frameworks
- Ensuring adequate systems and controls
- Regular monitoring and oversight
- Clear accountability and reporting lines
- Effective risk management processes

**Senior Manager Conduct Rule 2: Skill and Care**
"You must take reasonable steps to ensure that the business of the firm for which you are responsible complies with the relevant requirements and standards of the regulatory system"

*Practical Application:*
- Understanding regulatory requirements for your area
- Implementing compliance monitoring and controls
- Regular training and awareness programs
- Proactive identification and remediation of issues
- Effective liaison with regulators

**Senior Manager Conduct Rule 3: Delegation**
"You must take reasonable steps to ensure that any delegation of your responsibilities is to an appropriate person and that you oversee the discharge of the delegated responsibility effectively"

*Practical Application:*
- Careful selection of delegates based on competence
- Clear delegation with defined authorities and limits
- Regular monitoring and oversight of delegated activities
- Accountability for delegated responsibilities
- Appropriate training and support for delegates

**Senior Manager Conduct Rule 4: Disclosure**
"You must disclose appropriately any information of which the FCA or PRA would reasonably expect notice"

*Practical Application:*
- Proactive disclosure of material developments
- Transparency about risks and issues
- Honest communication in regulatory meetings
- Prompt notification of regulatory matters
- Clear escalation procedures for significant issues

**"Reasonable Steps" Standard:**

**What Constitutes Reasonable Steps:**
- Taking action that a reasonable person in the same position would take
- Considering the circumstances and resources available
- Acting proportionately to the risks and issues involved
- Drawing on relevant expertise and advice
- Implementing appropriate monitoring and controls

**Factors Considered by Regulators:**
- Seriousness and consequences of the issue
- Resources and authority available to the individual
- Steps actually taken and their appropriateness
- Timeliness of action and decision-making
- Consultation with relevant experts and advisors

**Documentation and Evidence:**
- Clear records of decisions and rationale
- Evidence of monitoring and oversight activities
- Documentation of training and development
- Records of escalation and communication
- Audit trails for key processes and controls

**Enforcement and Consequences:**

**Individual Enforcement Powers:**
- Prohibition orders preventing work in financial services
- Financial penalties based on income and severity
- Public censure and reputational sanctions
- Conditional approval with restrictions
- Criminal prosecution for serious offenses

**Factors Affecting Penalties:**
- Seriousness and impact of the breach
- Individual's level of responsibility and authority
- Previous regulatory history and conduct
- Cooperation with investigation and remediation
- Steps taken to prevent recurrence

**Firm Responsibilities:**

**Training and Awareness:**
- Comprehensive conduct rules training for all staff
- Regular updates and refresher training
- Practical examples and case studies
- Integration with performance management
- Clear escalation and reporting procedures

**Monitoring and Enforcement:**
- Regular assessment of conduct and behavior
- Investigation of potential breaches
- Disciplinary action for violations
- Reporting serious breaches to regulators
- Cultural indicators and measurement

**Performance Management Integration:**
- Conduct considerations in recruitment and selection
- Performance objectives including conduct standards
- Regular feedback and development conversations
- Promotion and advancement criteria
- Compensation and incentive alignment

**Cultural Considerations:**

**Tone from the Top:**
- Senior management modeling appropriate conduct
- Clear communication of expectations and standards
- Consistent enforcement and accountability
- Recognition and reward for good conduct
- Consequences for poor conduct regardless of seniority

**Psychological Safety:**
- Encouraging challenge and dissent
- Protecting whistleblowers and those raising concerns
- Creating safe spaces for difficult conversations
- Learning from mistakes without blame culture
- Promoting open and honest communication

**International and Cross-Border Issues:**

**Global Firm Considerations:**
- Coordination with global conduct standards
- Local adaptation of conduct requirements
- Cross-border investigation and enforcement
- Information sharing between jurisdictions
- Consistency in global talent management

**Professional Standards Integration:**
- Alignment with professional body codes of conduct
- Recognition of international qualifications
- Coordination with industry standards
- Professional development pathways
- Joint disciplinary procedures where appropriate

**Conduct Rule Breach Reporting**
- Establish internal reporting routes and investigation steps
- Record facts, decision rationale, and remediation
- Report serious breaches to regulators in line with policy`,

        keyConcepts: [
          {
            term: 'Conduct Rules',
            definition: 'Minimum standards of behavior that apply to individuals in scope of SM&CR, with enhanced rules for Senior Managers'
          },
          {
            term: 'Reasonable Steps',
            definition: 'The standard applied to Senior Managers requiring them to take action that a reasonable person would take in similar circumstances'
          },
          {
            term: 'Individual Accountability',
            definition: 'The principle that individuals are personally responsible for their conduct and decisions, not just firms'
          },
          {
            term: 'Prohibition Order',
            definition: 'Regulatory sanction preventing an individual from working in financial services due to lack of fitness and propriety'
          }
        ],

        realExamples: [
          'A senior manager implements enhanced monitoring systems after identifying control weaknesses, demonstrating "reasonable steps" under Conduct Rule 1.',
          'An advisor who recommends unsuitable investments prioritizing commission over customer needs breaches Individual Conduct Rule 4.',
          'A compliance officer who promptly reports a potential breach to the FCA demonstrates proper application of Individual Conduct Rule 3.'
        ],

        regulatoryRequirements: [
          'FCA Handbook COCON - Conduct Rules',
          'FCA Handbook DEPP - Decision making procedures for enforcement',
          'FCA Handbook EG - Enforcement Guide',
          'PRA Rulebook - Conduct Rules Part'
        ]
      }
    }
  ],

  // Practice Scenarios
  practiceScenarios: [
    {
      id: 'reasonable-steps-scenario',
      title: 'The System Outage Investigation',
      image: '/images/training/smcr-investigation-scenario.png',
      imagePrompt: 'Photorealistic corporate photograph, serious male executive in his 50s (CRO) sitting in FCA interview room across from two regulators, documents and laptops on table. Tense professional atmosphere, modern regulatory office setting. High stakes corporate meeting aesthetic, 16:9 aspect ratio, no text.',
      situation: `**You are:** CRO (SMF4) being investigated by FCA after major system outage

**The Incident:**
• 500,000 customers affected for 3 days
• £15M in costs and compensation
• Media coverage, reputational damage

**Your Evidence:**
• Board papers showing you identified IT as "Red" risk from Day 1
• Requested £25M budget (board only approved £10M)
• Implemented interim controls within constraints
• Regular escalation documented in minutes`,
      challenge: 'How do you demonstrate you took "reasonable steps"?',
      options: [
        'Blame the vendor error that triggered the failure',
        'Show comprehensive risk identification, escalation, and mitigation documentation',
        'Blame the board for insufficient budget',
        'Argue industry-wide failures prove it was unforeseeable'
      ],
      correctAnswer: 1,
      explanation: 'Reasonable steps = what you DID, not the outcome. Document: risk identification, escalation to board, interim controls, ongoing monitoring. FCA judges actions, not results.',
      learningPoints: [
        'Reasonable steps judged on ACTIONS, not outcomes',
        'Documentation of escalation is crucial evidence',
        'Interim controls show proactive management'
      ]
    },

    {
      id: 'certification-withdrawal-scenario',
      title: 'The Failing Advisor',
      image: '/images/training/smcr-certification-scenario.png',
      imagePrompt: 'Photorealistic corporate photograph, HR meeting scene with female HR director in her 40s reviewing documents with concerned expression, opposite her sits a stressed female investment advisor in her 30s looking anxious. Modern office meeting room, serious tone. Professional corporate photography, 16:9 aspect ratio, no text.',
      situation: `**The Situation:** Sarah Mitchell, certified investment advisor, certification renewal in 6 weeks

**Performance Issues:**
• Customer satisfaction dropped: 85% → 60%
• 3 formal complaints about unsuitable advice
• Failed to complete required training
• Arguments with colleagues in front of clients

**Actions Already Taken:**
• Performance improvement plan (4 months ago)
• Additional training and supervision
• Occupational health support offered
• Clear targets set - NOT being met`,
      challenge: 'What do you do about her certification?',
      options: [
        'Renew with enhanced monitoring',
        'WITHDRAW certification - fitness & propriety standards not met',
        'Move to non-certified role voluntarily',
        'Extend improvement plan, defer decision'
      ],
      correctAnswer: 1,
      explanation: 'She no longer meets fitness & propriety standards. Customer protection comes first. But: follow fair process, document everything, offer alternative role, make regulatory notifications.',
      learningPoints: [
        'Customer protection = primary concern',
        'Fitness includes competence + integrity + financial soundness',
        'Fair process and documentation essential'
      ]
    }
  ],

  // Assessment Questions
  assessmentQuestions: [
    {
      id: 'smcr-q1',
      type: 'multiple_choice',
      question: 'Which of the following best describes the "reverse burden of proof" under SM&CR?',
      options: [
        'Regulators must prove individuals are guilty of misconduct',
        'Individuals must prove they took reasonable steps to prevent problems',
        'Firms must prove their systems and controls are adequate',
        'Customers must prove they suffered harm from poor conduct'
      ],
      correctAnswer: 1,
      explanation: 'Under SM&CR, the burden of proof is reversed - individuals (particularly Senior Managers) must demonstrate they took reasonable steps to prevent problems, rather than regulators having to prove wrongdoing.'
    },
    {
      id: 'smcr-q2',
      type: 'true_false',
      question: 'Prescribed responsibilities can be shared between multiple Senior Managers to spread accountability.',
      options: ['True', 'False'],
      correctAnswer: 1,
      explanation: 'False. Prescribed responsibilities cannot be shared or delegated - each must be allocated to a single approved Senior Manager who has personal accountability for that area.'
    },
    {
      id: 'smcr-q3',
      type: 'scenario_based',
      question: 'An investment advisor fails their annual fitness and propriety assessment due to poor customer outcomes. What should the firm do?',
      options: [
        'Provide additional training and reassess in 6 months',
        'Withdraw certification and remove from customer-facing role',
        'Issue a warning and continue with enhanced supervision',
        'Transfer to a different department with similar responsibilities'
      ],
      correctAnswer: 1,
      explanation: 'If an individual fails their fitness and propriety assessment, their certification must be withdrawn and they cannot continue in a certification function until they meet the required standards again.'
    },
    {
      id: 'smcr-q4',
      type: 'multiple_choice',
      question: 'Which conduct rule applies to all staff in scope of SM&CR?',
      options: [
        'You must take reasonable steps to ensure effective controls',
        'You must act with integrity',
        'You must oversee delegated responsibilities effectively',
        'You must disclose information to regulators appropriately'
      ],
      correctAnswer: 1,
      explanation: 'Individual Conduct Rule 1 "You must act with integrity" applies to all staff in scope of SM&CR. The other options are Senior Manager Conduct Rules that only apply to approved Senior Managers.'
    },
    {
      id: 'smcr-q5',
      type: 'scenario_based',
      question: 'A Senior Manager identifies a significant risk but the board rejects their recommendation for additional resources. What should they do?',
      options: [
        'Accept the board decision and take no further action',
        'Implement interim risk mitigation measures within available resources',
        'Escalate the matter directly to the FCA',
        'Resign from their position to avoid personal liability'
      ],
      correctAnswer: 1,
      explanation: 'The Senior Manager should implement reasonable interim risk mitigation measures within available resources while continuing to monitor and escalate the risk. This demonstrates taking "reasonable steps" under the circumstances.'
    }
  ],

  // Summary and Takeaways
  summary: {
    keyTakeaways: [
      'SM&CR creates individual accountability with reverse burden of proof - you must demonstrate reasonable steps',
      'Prescribed responsibilities cannot be delegated and create personal liability for Senior Managers',
      'Annual certification requires comprehensive fitness and propriety assessment across competence, integrity, and financial soundness',
      'Conduct rules establish minimum behavioral standards with enhanced obligations for Senior Managers',
      'Documentation and evidence of decision-making are crucial for demonstrating compliance with SM&CR requirements'
    ],
    nextSteps: [
      'Review your firm\'s responsibilities maps and understand individual accountability',
      'Ensure annual certification processes are robust and well-documented',
      'Implement comprehensive conduct rules training and monitoring',
      'Establish clear governance and escalation procedures for Senior Manager responsibilities'
    ],
    quickReference: [
      'Reasonable steps: Take action a competent person would take in similar circumstances',
      'Cannot delegate: Prescribed responsibilities must be held by named Senior Managers',
      'Annual certification: Fitness and propriety must be assessed and documented yearly',
      'All staff covered: Conduct rules apply to everyone in scope with enhanced rules for Senior Managers'
    ]
  },

  // Visual Assets
  visualAssets: {
    images: [
      {
        section: 'hook',
        description: 'Timeline showing major financial scandals and the introduction of individual accountability measures'
      },
      {
        section: 'main-content',
        description: 'Comprehensive diagram showing SM&CR three-tier structure and responsibilities flow'
      },
      {
        section: 'functions',
        description: 'Organizational chart showing Senior Management Functions and their prescribed responsibilities'
      },
      {
        section: 'scenarios',
        description: 'Decision tree for certification and fitness assessment processes'
      }
    ],
    style: 'Professional regulatory design with clear accountability frameworks and process flow visuals'
  }
};
