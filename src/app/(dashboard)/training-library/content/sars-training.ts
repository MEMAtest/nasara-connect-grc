import { TrainingModule } from '../types';

export const sarsTrainingModule: TrainingModule = {
  id: 'sars-training',
  title: 'Suspicious Activity Reporting (SARs)',
  description: 'Master the identification, investigation, and reporting of suspicious activity to protect against money laundering and terrorist financing.',
  category: 'financial-crime-prevention',
  duration: 15,
  difficulty: 'advanced',
  targetPersonas: ['compliance-officer', 'mlro', 'senior-manager'],
  prerequisiteModules: ['aml-fundamentals', 'kyc-fundamentals'],
  tags: ['sars', 'suspicious-activity', 'nca', 'mlro', 'reporting'],
  learningOutcomes: [
    'Recognize indicators of suspicious activity across different scenarios',
    'Understand the legal framework and obligations for suspicious activity reporting',
    'Implement effective investigation procedures before filing SARs',
    'Master the SAR submission process and required information',
    'Apply appropriate confidentiality and tipping-off protections'
  ],

  // Hook Section
  hook: {
    type: 'real_case_study',
    title: 'The £365 Million That Should Have Been Stopped',
    content: `In 2021, NatWest was fined £264 million for failing to properly monitor a single customer account. Between 2012 and 2016, approximately £365 million was deposited into this account, with £264 million of it in cash. Despite the astronomical amounts and obvious red flags, the bank failed to file a single Suspicious Activity Report (SAR).

    The customer was a gold trading business that should have triggered immediate suspicion:
    - Daily cash deposits of £40,000-50,000
    - Total cash deposits 50 times larger than originally anticipated
    - Deposits made at multiple branches across different regions
    - Business model that didn't justify the volume of cash handling
    - Minimal legitimate business documentation

    But here's the shocking reality: this wasn't sophisticated money laundering. It was brazen, obvious criminal activity that basic monitoring should have caught. The failure wasn't technical - it was human. Staff saw the activity, systems generated alerts, but no one connected the dots to file SARs that could have stopped a massive money laundering operation.

    The consequences went far beyond the fine. This money potentially funded serious organized crime, human trafficking, and drug dealing. Communities were harmed. Lives were damaged. All because suspicious activity reports weren't filed when they should have been.

    Every SAR you file could prevent the next NatWest case. Every investigation you conduct properly could save lives.`,
    keyQuestion: 'If you saw £50,000 in cash deposits daily from a small business, would you know exactly what steps to take to investigate and report this suspicious activity?'
  },

  // Main Content Sections
  lessons: [
    {
      id: 'legal-framework',
      title: 'Legal Framework and Obligations',
      type: 'content',
      duration: 4,
      content: {
        learningPoint: 'Understand the comprehensive legal obligations and framework governing suspicious activity reporting',
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'critical',
              title: 'This is Criminal Law',
              message: 'SAR reporting is not just regulatory - it\'s backed by criminal law. Failure to report can result in imprisonment.'
            },
            {
              type: 'keypoint',
              icon: '⚖️',
              title: 'POCA Section 330 - Failure to Disclose',
              points: [
                'Criminal offense for failing to report ML suspicions',
                'Applies to ALL regulated sector staff',
                'Max penalty: 5 years imprisonment + unlimited fine',
                'Defense: report made OR reasonable excuse'
              ]
            },
            {
              type: 'keypoint',
              icon: '🚨',
              title: 'POCA Section 333A - Tipping Off',
              points: [
                'Criminal offense to disclose SAR existence',
                'Includes hints, suggestions, or behavior changes',
                'Max penalty: 2 years + unlimited fine',
                'Strict liability - intent NOT required'
              ]
            },
            {
              type: 'stat',
              icon: '⏱️',
              value: '5 Years',
              label: 'Max imprisonment for failure to disclose',
              color: 'red'
            },
            {
              type: 'stat',
              icon: '🔒',
              value: 'Indefinite',
              label: 'SAR confidentiality period - no time limit',
              color: 'amber'
            },
            {
              type: 'infogrid',
              items: [
                { icon: '📖', term: 'Knowledge', definition: 'Actual awareness of facts' },
                { icon: '🤔', term: 'Suspicion', definition: 'Reasonable belief something may be true' },
                { icon: '⚡', term: 'ASAP', definition: 'Within hours, not days' },
                { icon: '🛡️', term: 'Defense', definition: 'Report made or genuine excuse' }
              ]
            },
            {
              type: 'checklist',
              title: 'Who Must Report (All Regulated Sector)',
              items: [
                'Front-line customer service staff',
                'Operations & transaction processing',
                'Relationship managers & sales',
                'Management & supervisory staff'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Suspicion Arises', description: 'You notice something unusual or concerning' },
                { number: 2, title: 'Report Internally', description: 'Notify MLRO "as soon as practicable" (within hours)' },
                { number: 3, title: 'MLRO Reviews', description: 'Decision made within 24-48 hours max' },
                { number: 4, title: 'Submit to NCA', description: 'File SAR via secure online system' }
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'NOT a Reasonable Excuse',
              message: 'Commercial considerations, customer relationships, or inconvenience are NEVER acceptable excuses for not reporting.'
            },
            {
              type: 'keypoint',
              icon: '🛡️',
              title: 'Legal Protections for Reporters',
              points: [
                'Civil liability protection for good faith reports',
                'Employment protection against retaliation',
                'Anonymity in legal proceedings',
                'Immunity from breach of confidentiality claims'
              ]
            },
            {
              type: 'stat',
              icon: '📁',
              value: '5 Years',
              label: 'Minimum record retention for SARs',
              color: 'blue'
            }
          ]
        },

        keyConcepts: [
          {
            term: 'Knowledge or Suspicion',
            definition: 'The legal threshold for reporting: actual awareness or reasonable belief that money laundering may be occurring'
          },
          {
            term: 'Tipping Off',
            definition: 'The criminal offense of disclosing SAR existence or ongoing investigation to unauthorized persons'
          },
          {
            term: 'As Soon As Practicable',
            definition: 'Legal timing requirement meaning without unnecessary delay, typically within hours of suspicion arising'
          },
          {
            term: 'Reasonable Excuse',
            definition: 'Limited legal defense for non-reporting, excluding commercial or relationship considerations'
          }
        ],

        realExamples: [
          'A cashier notices daily cash deposits just under reporting thresholds. They have suspicion based on the pattern and must report internally immediately.',
          'An MLRO receives an internal report on Friday evening. They must submit to NCA within 24-48 hours, not wait until Monday.',
          'A customer asks why their payment is delayed. Staff must give generic response without mentioning SAR investigation to avoid tipping off.'
        ],

        regulatoryRequirements: [
          'Proceeds of Crime Act 2002 - Sections 330, 331, 333A',
          'Terrorism Act 2000 - Section 21A',
          'Money Laundering Regulations 2017 - Regulation 21',
          'FCA SYSC 6.3 - Suspicious transaction reporting'
        ]
      }
    },

    {
      id: 'identification-investigation',
      title: 'Identifying Suspicious Activity',
      type: 'content',
      duration: 5,
      content: {
        learningPoint: 'Master systematic approaches to identifying suspicious activity and conducting appropriate investigations',
        mainContent: `Identifying suspicious activity requires a combination of systematic monitoring, pattern recognition, and professional intuition. The investigation process must be thorough but swift to meet legal reporting obligations.

**Categories of Suspicious Activity:**

**1. Transaction-Based Suspicions**

*Structuring and Smurfing:*
- Multiple transactions just below reporting thresholds
- Coordinated deposits across multiple accounts or branches
- Breaking large amounts into smaller, seemingly unrelated transactions
- Use of multiple individuals to conduct related transactions

*Unusual Payment Patterns:*
- Round-number transactions without clear business rationale
- Rapid movement of funds between accounts (layering)
- Transactions at unusual times or locations
- Inconsistent with known customer profile or business model

*Cash-Related Suspicions:*
- Large cash deposits inconsistent with business type
- Frequent cash transactions in predominantly non-cash businesses
- Cash deposits followed immediately by wire transfers
- Reluctance to provide source of cash documentation

**2. Customer Behavior Suspicions**

*Documentation and Information Issues:*
- Reluctance to provide standard identification documentation
- Provision of suspicious or potentially falsified documents
- Evasive responses to routine questions about business purpose
- Inconsistent information provided over time

*Relationship Behavior:*
- Unusual nervousness or anxiety during routine interactions
- Requests for unusual secrecy or confidentiality measures
- Instructions to expedite transactions without clear justification
- Avoidance of personal contact or face-to-face meetings

*Knowledge Indicators:*
- Unusual familiarity with money laundering detection methods
- Sophisticated understanding of reporting thresholds and requirements
- Requests specifically designed to avoid monitoring or reporting
- Knowledge of bank procedures beyond normal customer understanding

**3. Business and Commercial Suspicions**

*Business Model Inconsistencies:*
- Transaction volumes inconsistent with declared business size
- Activity inconsistent with stated business purpose
- Rapid changes in business model or customer base
- Lack of legitimate business documentation or contracts

*Geographic and Sectoral Risks:*
- Transactions involving high-risk jurisdictions
- Business connections to cash-intensive industries
- Export/import activity inconsistent with business registration
- Involvement in sectors prone to money laundering (MSBs, casinos, real estate)

**Investigation Methodology:**

**1. Initial Assessment Phase**

*Information Gathering:*
- Review complete customer file and relationship history
- Analyze transaction patterns over extended periods
- Check all related accounts and beneficial owners
- Review any previous internal reports or investigations

*Risk Factor Analysis:*
- Customer risk rating and any recent changes
- Geographic risks associated with transactions
- Product and service risks involved
- Delivery channel risks and controls

*Pattern Recognition:*
- Compare current activity to established baseline
- Identify deviations from expected behavior
- Look for correlation with known typologies
- Consider seasonal or business cycle factors

**2. Enhanced Investigation Procedures**

*Documentation Review:*
- Verify authenticity of provided documentation
- Cross-reference information across multiple sources
- Check for consistency in customer statements over time
- Review any adverse media or intelligence reports

*Transaction Analysis:*
- Map fund flows and transaction chains
- Identify ultimate sources and destinations
- Analyze timing patterns and frequencies
- Review counterparty information and relationships

*External Information Sources:*
- Corporate registry searches for business entities
- Property records for real estate transactions
- Court records for litigation or criminal history
- Media searches for adverse information

**3. Senior Review and Decision Making**

*Escalation Criteria:*
- Complex investigations requiring specialist expertise
- High-value or high-profile customers
- Potential sanctions or terrorist financing links
- Novel typologies or unknown risk factors

*Decision Framework:*
- Clear criteria for filing vs. not filing SARs
- Documentation requirements for all decisions
- Senior management approval for certain determinations
- Legal review for complex or uncertain cases

**Red Flag Indicators by Sector:**

**Retail Banking Red Flags:**
- Multiple accounts with similar names or addresses
- Frequent deposits just under £10,000 (or €15,000)
- Cash deposits followed by immediate international transfers
- Accounts receiving multiple third-party deposits
- Frequent account closures and new openings

**Trade Finance Red Flags:**
- Over or under-invoicing of goods and services
- Multiple invoices for the same shipment
- Transactions involving high-risk commodities (precious metals, gems)
- Shipments to/from countries not matching business profile
- Use of multiple correspondent banks for single transactions

**Private Banking Red Flags:**
- Source of wealth inconsistent with known background
- Complex ownership structures involving secrecy jurisdictions
- Frequent changes in beneficial ownership
- Reluctance to meet face-to-face or provide references
- Requests for anonymous or bearer instruments

**Investment and Securities Red Flags:**
- Investments inconsistent with customer's knowledge or experience
- Unusual trading patterns or market timing
- Purchases using cash or cash equivalents
- Requests for physical delivery of securities
- Frequent transfers between unrelated accounts

**Investigation Quality Standards:**

**Documentation Requirements:**
- Clear timeline of suspicious activity
- Supporting evidence and analysis
- Customer explanations and responses (if obtained)
- Decision rationale and senior management input
- Legal and regulatory considerations

**Timeliness Standards:**
- Initial assessment: Within 24 hours of identification
- Enhanced investigation: Additional 24-48 hours maximum
- Senior review: Same day if possible, next business day maximum
- SAR submission: Within required timeframes regardless of investigation status

**Quality Control Measures:**
- Peer review of investigation conclusions
- Supervisory oversight of decision making
- Regular training on investigation techniques
- Feedback incorporation from NCA and law enforcement

**Common Investigation Pitfalls:**

**Over-Investigation:**
- Delaying SAR filing to gather more evidence
- Seeking absolute proof rather than reasonable suspicion
- Conducting investigations that should be left to law enforcement
- Allowing commercial considerations to influence timing

**Under-Investigation:**
- Filing SARs without sufficient analysis or context
- Failing to identify related accounts or transactions
- Missing obvious explanations for apparently suspicious activity
- Inadequate documentation of investigation process

**Procedural Errors:**
- Inappropriate customer contact during investigation
- Sharing investigation details with unauthorized staff
- Failing to maintain confidentiality requirements
- Inadequate escalation to senior management

**Technology and Tools:**

**Transaction Monitoring Systems:**
- Automated alert generation based on rules and scenarios
- Pattern recognition and machine learning capabilities
- Integration with external databases and watchlists
- Audit trails and case management functionality

**Investigation Software:**
- Link analysis and relationship mapping tools
- Document management and evidence collection systems
- Workflow management for case progression
- Reporting templates and submission systems

**Information Sources:**
- Internal customer databases and transaction histories
- External commercial databases and registries
- Government and regulatory databases
- Open source intelligence and media monitoring`,

        keyConcepts: [
          {
            term: 'Structuring',
            definition: 'Breaking large transactions into smaller amounts to avoid detection or reporting thresholds'
          },
          {
            term: 'Layering',
            definition: 'Creating complex layers of transactions to obscure the original source of funds'
          },
          {
            term: 'Typology',
            definition: 'A method or technique commonly used for money laundering or terrorist financing'
          },
          {
            term: 'Red Flag',
            definition: 'An indicator or warning sign that suggests potential suspicious activity requiring investigation'
          }
        ],

        realExamples: [
          'A small restaurant makes daily cash deposits of £9,500 for three weeks. Investigation reveals the business typically handles £500 daily, indicating potential structuring.',
          'A customer\'s wire transfer instructions change at the last minute to a different beneficiary in a high-risk jurisdiction, triggering investigation.',
          'Multiple customers with similar names make deposits on the same day to accounts opened with identical documentation, suggesting coordinated activity.'
        ],

        regulatoryRequirements: [
          'JMLSG Guidance Part I Section 7 - Recognition and reporting of suspicious activity',
          'FCA Financial Crime Guide - Chapter 5 (Transaction monitoring)',
          'NCA SAR Guidance Notes - Investigation standards',
          'Money Laundering Regulations 2017 - Regulation 21 (Internal reporting)'
        ]
      }
    },

    {
      id: 'sar-process',
      title: 'SAR Submission & Requirements',
      type: 'content',
      duration: 3,
      content: {
        learningPoint: 'Master the technical and procedural requirements for submitting high-quality SARs to the NCA',
        mainContent: `The SAR submission process requires technical accuracy, comprehensive information, and adherence to strict procedural requirements. Quality SARs provide law enforcement with actionable intelligence for investigations.

**SAR Submission System and Process:**

**1. NCA Online SAR System**
- Secure web-based portal for all SAR submissions
- 24/7 availability with technical support
- Automated validation and error checking
- Electronic acknowledgment and reference numbers
- Integration with law enforcement databases

**2. Access and Authentication**
- MLROs must register and maintain system access
- Two-factor authentication required for security
- Regular password updates and security protocols
- Designated backup users for continuity
- Audit logs of all system access and activity

**3. System Navigation and Functionality**
- User-friendly interface with guided submission process
- Save and resume capability for complex SARs
- Template options for common scenarios
- Attachment functionality for supporting documents
- Search and tracking capabilities for submitted SARs

**Essential SAR Information Requirements:**

**Subject Information (Mandatory):**
- Full name including any aliases or variations
- Date and place of birth (if known)
- Current and previous addresses
- Nationality and identification documents
- Occupation and employer details
- Role in the suspicious activity

**Account and Transaction Details:**
- Account numbers and types
- Transaction dates, amounts, and currencies
- Payment methods and instruments used
- Counterparty information (sender/receiver)
- Geographic locations involved
- Supporting transaction references

**Suspicious Activity Description:**
- Clear, chronological narrative of events
- Specific reasons for suspicion
- Timeline of suspicious behavior
- Amounts and frequency of transactions
- Any customer explanations received
- Relevant background context

**Supporting Documentation:**
- Transaction records and bank statements
- Customer identification and verification documents
- Business registration and ownership information
- Contracts, invoices, or commercial documentation
- Correspondence with customer
- Internal investigation notes

**SAR Quality Standards:**

**Narrative Quality Requirements:**
- Clear, concise, and factual reporting
- Logical flow and chronological order
- Specific details rather than general statements
- Professional language and terminology
- Objective reporting without speculation
- Sufficient detail for law enforcement action

**Common Quality Issues to Avoid:**
- Vague or generic descriptions of suspicion
- Missing key dates, amounts, or transaction details
- Speculation about customer motives or intentions
- Incomplete subject identification information
- Poor supporting documentation
- Late submission without justification

**Urgent and Priority SARs:**

**Criteria for Urgent Submission:**
- Ongoing criminal activity requiring immediate intervention
- Imminent risk to public safety or national security
- Live terrorist financing investigations
- Time-sensitive intelligence requirements
- Request from law enforcement agencies

**Priority SAR Procedures:**
- Telephone notification to NCA before submission
- Expedited submission within hours of identification
- Enhanced detail and supporting documentation
- Coordination with relevant law enforcement
- Follow-up communication as required

**Special SAR Categories:**

**Terrorist Financing SARs:**
- Lower threshold for suspicion ("reasonable grounds")
- Enhanced urgency and priority handling
- Additional security and confidentiality measures
- Coordination with national security agencies
- Specific reporting formats and requirements

**Sanctions-Related SARs:**
- Dual reporting to HM Treasury and NCA
- Immediate notification requirements
- Enhanced documentation of sanctions analysis
- Coordination with relevant enforcement agencies
- Ongoing monitoring and update obligations

**Cash Transaction Reports:**
- Specific format for large cash transactions
- Enhanced verification of customer identity
- Business rationale and source documentation
- Risk assessment and monitoring implications
- Integration with SAR submission process

**Post-Submission Procedures:**

**NCA Acknowledgment and Reference:**
- Automatic acknowledgment within minutes
- Unique SAR reference number assignment
- Confirmation of receipt and initial validation
- Any immediate queries or requests for clarification
- Technical support contact information

**Ongoing Obligations:**
- Maintain confidentiality indefinitely
- Respond to NCA requests for additional information
- Monitor account for continued suspicious activity
- Report significant developments or changes
- Coordinate with law enforcement as required

**Internal Process Management:**

**SAR Register and Tracking:**
- Comprehensive register of all SARs submitted
- Status tracking and follow-up procedures
- Statistical reporting and analysis
- Quality review and improvement processes
- Management reporting and oversight

**Staff Training and Competency:**
- Regular training on SAR submission procedures
- System access and technical training
- Quality standards and best practice guidance
- Legal updates and regulatory changes
- Practical exercises and case studies

**Quality Assurance Program:**
- Peer review of SARs before submission
- Supervisory oversight and approval processes
- Regular quality audits and assessments
- Feedback incorporation and improvement
- Benchmarking against industry standards

**Record Keeping and Retention:**

**SAR Documentation:**
- Complete investigation files and supporting evidence
- Copy of submitted SAR and all attachments
- NCA correspondence and feedback
- Internal approvals and decision records
- Related customer files and transaction records

**Retention Requirements:**
- SAR records: Minimum 5 years from submission
- Investigation files: 5 years from closure
- Customer files: 5 years after relationship ends
- Training records: 3 years minimum
- System audit logs: As per regulatory requirements

**Management Information and Reporting:**

**Statistical Analysis:**
- SAR volume and trends analysis
- Subject matter and typology classification
- Quality metrics and improvement tracking
- Timeliness and procedural compliance
- Resource allocation and efficiency measures

**Senior Management Reporting:**
- Regular SAR activity summaries
- Quality and effectiveness assessments
- Regulatory compliance status
- Training and competency updates
- Strategic planning and resource needs`,

        keyConcepts: [
          {
            term: 'SAR Reference Number',
            definition: 'Unique identifier assigned by NCA to each submitted SAR for tracking and investigation purposes'
          },
          {
            term: 'Priority SAR',
            definition: 'Urgent suspicious activity report requiring immediate law enforcement attention due to ongoing risk'
          },
          {
            term: 'SAR Quality',
            definition: 'The completeness, accuracy, and usefulness of information provided to support law enforcement investigation'
          },
          {
            term: 'Post-Submission Obligations',
            definition: 'Ongoing duties after SAR filing including confidentiality, cooperation, and continued monitoring'
          }
        ],

        realExamples: [
          'A SAR submitted for structuring activity includes specific transaction dates, amounts, branch locations, and customer explanations to provide complete picture.',
          'An urgent SAR for suspected terrorist financing includes immediate phone notification to NCA followed by comprehensive written submission within hours.',
          'A quarterly SAR quality review identifies common gaps in subject identification information, leading to enhanced training program.'
        ],

        regulatoryRequirements: [
          'Proceeds of Crime Act 2002 - SAR submission requirements',
          'NCA SAR Guidance Notes - Submission procedures and standards',
          'Money Laundering Regulations 2017 - Regulation 21 (Internal reporting procedures)',
          'FCA SYSC 6.3 - Record keeping and management information'
        ]
      }
    },

    {
      id: 'sar-quality-consent',
      title: 'MLRO Decisioning & Consent',
      type: 'content',
      duration: 4,
      content: {
        learningPoint: 'High-quality SARs and clear MLRO decisioning are essential for lawful action and defensible outcomes.',
        mainContent: `A SAR is only useful if it gives law enforcement enough to act. The MLRO must also make clear, documented decisions on whether to report, whether to seek consent (DAML), and how to proceed with transactions.

**What Makes a High-Quality SAR**
- Clear subject details: full name, DOB, addresses, identifiers, account numbers
- Factual narrative: what happened, when, amounts, channels, counterparties
- Why it is suspicious: inconsistencies, red flags, changes in behavior
- Supporting evidence: references to documents, alerts, conversations, and logs
- Avoids speculation: focus on facts and risk rationale

**MLRO Decisioning**
MLROs should maintain a decision log that records:
- The suspicion threshold and basis
- Information reviewed and any gaps
- Whether additional information was requested
- The final decision and rationale
- Any post-decision controls (account monitoring, restrictions, exit)

**Consent and DAML Requests**
Where a firm needs to proceed with a transaction that may involve criminal property, the MLRO can seek a Defence Against Money Laundering (DAML) by filing a SAR and requesting consent from the NCA.

Key points:
- The NCA has a statutory response period before consent is deemed refused or granted
- If consent is refused, a moratorium period applies and the firm must not proceed
- All timelines and decisions must be documented

**Quality Assurance**
- Regular sampling of SARs for clarity and completeness
- Feedback loops to improve staff submissions
- Training on writing fact-based narratives`,
        keyConcepts: [
          {
            term: 'Defence Against Money Laundering (DAML)',
            definition: 'A legal defence obtained by seeking NCA consent to proceed with a transaction involving suspected criminal property.'
          },
          {
            term: 'Moratorium Period',
            definition: 'A legal period after a consent refusal during which transactions must not proceed.'
          },
          {
            term: 'SAR Narrative',
            definition: 'The factual summary that explains what happened and why it is suspicious.'
          },
          {
            term: 'MLRO Decision Log',
            definition: 'Documented record of decisions, evidence, and actions taken.'
          }
        ],
        realExamples: [
          'A SAR that included timestamps, account numbers, and inconsistent explanations was graded high quality and resulted in law enforcement follow-up.',
          'An MLRO requested DAML for a pending outbound transfer and documented the consent timeline and final decision.',
          'Quality review found SARs lacked subject identifiers, prompting updated guidance and re-training.'
        ],
        regulatoryRequirements: [
          'POCA 2002 - Consent and moratorium provisions',
          'NCA SARs Guidance - Quality expectations and DAML process',
          'FCA SYSC 6.3 - Record keeping and governance expectations'
        ]
      }
    },

    {
      id: 'confidentiality-management',
      title: 'Confidentiality & Tipping-Off',
      type: 'content',
      duration: 3,
      content: {
        learningPoint: 'Implement robust confidentiality procedures and prevent tipping-off violations while maintaining business relationships',
        mainContent: `Maintaining SAR confidentiality while continuing normal business operations requires sophisticated procedures and careful staff training. Tipping-off violations can result in criminal prosecution and compromise investigations.

**Legal Framework for Confidentiality:**

**Absolute Confidentiality Requirement:**
- SAR existence must never be disclosed to unauthorized persons
- Confidentiality applies indefinitely with no time limit
- Covers all aspects: investigation, submission, police contact
- Includes speculation or hints about possible investigations
- Applies to all staff regardless of seniority or role

**Who May Know About SARs:**
- Money Laundering Reporting Officer (MLRO)
- Designated deputies and backup MLROs
- Staff directly involved in investigation
- Senior management on need-to-know basis
- Legal counsel providing advice on SAR matters
- External auditors reviewing SAR procedures (general, not specific)

**What Constitutes Tipping-Off:**

**Direct Disclosure:**
- Telling customer that SAR has been filed
- Mentioning investigation or police involvement
- Referring to suspicious activity concerns
- Discussing money laundering allegations
- Sharing SAR reference numbers or details

**Indirect Disclosure:**
- Changes in service quality or responsiveness
- Unusual delays without acceptable explanation
- Evasive behavior or reluctance to process transactions
- Inappropriate questions about transaction purposes
- Body language or behavior suggesting investigation

**Subtle Tipping-Off:**
- Asking unusual questions about transaction sources
- Requesting documentation not normally required
- Processing transactions differently than usual
- Involving additional staff without clear justification
- Creating atmosphere of suspicion or concern

**Safe Communication Strategies:**

**Acceptable Holding Responses:**
- "We are completing our routine compliance checks"
- "This transaction requires standard verification procedures"
- "We need to complete our internal authorization process"
- "There is a temporary processing delay due to system requirements"
- "We are verifying some documentation as part of our normal procedures"

**Communication Principles:**
- Always provide business justification for delays
- Reference routine compliance or verification procedures
- Avoid mentioning specific investigations or concerns
- Maintain normal tone and professional demeanor
- Document all customer communications and responses

**Managing Customer Relationships During Investigations:**

**Continuing Normal Service:**
- Process legitimate transactions without unusual delay
- Maintain standard service levels and responsiveness
- Avoid creating artificial barriers or complications
- Ensure staff behavior remains consistent and professional
- Continue routine account management and contact

**Transaction Processing Guidelines:**
- Allow routine transactions to proceed normally
- Only block transactions with clear legal basis
- Provide standard explanations for any delays
- Avoid creating patterns that might suggest investigation
- Ensure consistent treatment across similar customers

**Staff Training and Awareness:**

**Confidentiality Training Components:**
- Legal obligations and criminal penalties
- What constitutes tipping-off in various scenarios
- Safe communication techniques and scripts
- Escalation procedures for difficult situations
- Role-playing exercises with customer scenarios

**Ongoing Reinforcement:**
- Regular refresher training and updates
- Case studies of tipping-off violations
- Best practice sharing and discussion
- Management oversight and quality monitoring
- Clear disciplinary procedures for violations

**Internal Communication Protocols:**

**SAR Team Communications:**
- Secure communication channels for SAR discussions
- Physical and electronic security measures
- Clear authorization for SAR-related discussions
- Documentation of who has been informed and when
- Regular review of access and need-to-know

**Management Reporting:**
- Sanitized reports that don't identify specific customers
- Statistical summaries without customer details
- General trends and typology discussions
- Training needs and procedural improvements
- Resource allocation and strategic planning

**Technology and Security Measures:**

**Electronic Security:**
- Secure systems for SAR documentation and tracking
- Access controls and audit trails
- Encryption of sensitive communications
- Secure email and messaging systems
- Regular security audits and updates

**Physical Security:**
- Secure storage for SAR documentation
- Limited access to investigation areas
- Confidential meeting spaces for SAR discussions
- Secure disposal of confidential documents
- Physical security for computer systems and files

**Customer Due Diligence During Investigations:**

**Enhanced Monitoring Procedures:**
- Increased transaction monitoring without customer awareness
- Additional verification of transaction purposes
- Enhanced review of documentation and explanations
- Coordination with other departments for intelligence
- Regular reassessment of customer risk profile

**Avoiding Investigative Behavior:**
- Don't conduct interrogations or intensive questioning
- Avoid requests for unusual documentation
- Don't change established relationship patterns
- Maintain normal frequency of customer contact
- Ensure any additional diligence appears routine

**Incident Management:**

**Potential Tipping-Off Incidents:**
- Immediate assessment of disclosure risk
- Senior management notification and review
- Legal counsel consultation for significant risks
- Documentation of incident and response measures
- Staff retraining and procedural improvements

**Damage Limitation:**
- Cannot undo tipping-off but can minimize further risk
- Assess impact on ongoing investigations
- Consider notification to law enforcement if required
- Review procedures to prevent recurrence
- Disciplinary action if appropriate

**International Considerations:**

**Cross-Border Confidentiality:**
- Different jurisdictions may have varying requirements
- Coordination with foreign Financial Intelligence Units
- Maintaining confidentiality across multiple jurisdictions
- Understanding local tipping-off laws and penalties
- Ensuring consistent global procedures

**Regulatory Coordination:**
- Multiple regulators may be involved in investigations
- Sharing information between authorized agencies
- Maintaining confidentiality during regulatory examinations
- Coordinating responses to multiple information requests
- Understanding regulatory vs. law enforcement roles

**Quality Assurance and Monitoring:**

**Confidentiality Audits:**
- Regular review of staff understanding and compliance
- Testing of customer communication procedures
- Assessment of technology and security measures
- Review of incident management and response
- Benchmarking against industry best practices

**Performance Metrics:**
- Customer complaint analysis for potential indicators
- Staff adherence to communication protocols
- Training effectiveness and knowledge retention
- Incident frequency and severity trending
- Management oversight and review effectiveness`,

        keyConcepts: [
          {
            term: 'Tipping-Off',
            definition: 'Any disclosure that alerts someone to the existence of a SAR or investigation, whether direct or indirect'
          },
          {
            term: 'Need-to-Know Basis',
            definition: 'Principle limiting SAR information access to only those who require it for their specific duties'
          },
          {
            term: 'Safe Communication',
            definition: 'Customer communication techniques that explain delays or procedures without suggesting investigation'
          },
          {
            term: 'Confidentiality Breach',
            definition: 'Any unauthorized disclosure of SAR information, regardless of intent or level of detail shared'
          }
        ],

        realExamples: [
          'When a customer asks about payment delay, staff respond: "We\'re completing routine verification procedures" rather than mentioning compliance concerns.',
          'A relationship manager continues normal monthly check-ins with a customer subject to SAR investigation to avoid behavioral changes.',
          'SAR team uses secure meeting room and encrypted communications when discussing active investigations to maintain confidentiality.'
        ],

        regulatoryRequirements: [
          'Proceeds of Crime Act 2002 - Section 333A (Tipping off)',
          'Terrorism Act 2000 - Section 21D (Disclosure offenses)',
          'Money Laundering Regulations 2017 - Regulation 21 (Confidentiality)',
          'FCA SYSC 6.3 - Staff training and awareness requirements'
        ]
      }
    }
  ],

  // Practice Scenarios
  practiceScenarios: [
    {
      id: 'cash-structuring-scenario',
      title: 'Cash Structuring Network',
      image: '/images/training/sar-structuring-scenario.png',
      imagePrompt: 'Professional compliance illustration, bird\'s eye view of a city map with 15 glowing account dots connected by red dotted lines to a central hub labeled "Metro Trading". Cash bundles flowing between dots. Clean corporate infographic style, navy blue and red, modern flat design, no text.',
      situation: `**The Alert:** 15 linked accounts flagged for suspicious patterns.

**Key Red Flags:**
• Daily cash deposits £8,000-£9,500 (just under threshold)
• £1.2M total in 3 months across all accounts
• All transfers route to "Metro Trading Ltd" → Dubai entities
• Account holders all claim to work for unregistered "FlexWork Solutions"
• Same director controls both Metro Trading and FlexWork`,
      challenge: 'What action should you take?',
      options: [
        'Request more documentation before deciding',
        'File individual SARs for each account',
        'File ONE comprehensive SAR covering the entire network + escalate immediately',
        'Continue monitoring for more evidence'
      ],
      correctAnswer: 2,
      explanation: 'This is organized money laundering. File ONE comprehensive SAR covering the entire operation - it gives law enforcement the complete picture. Individual SARs would fragment the intelligence.',
      learningPoints: [
        'Coordinated accounts = organized crime - report the whole network together',
        'Don\'t wait for "perfect evidence" - suspicion is enough',
        'Comprehensive SARs are more valuable than fragmented reports'
      ]
    },

    {
      id: 'customer-questioning-scenario',
      title: 'The Angry Customer Call',
      image: '/images/training/sar-tipping-off-scenario.png',
      imagePrompt: 'Professional compliance illustration, split scene: Left side shows frustrated business person on phone call in modern office. Right side shows calm compliance officer at desk with computer alerts. Subtle wall/divide between them representing confidentiality. Clean corporate style, warm professional colors, modern flat design, no text.',
      situation: `**The Situation:** You're investigating Prestige Consulting Ltd. A SAR is being filed today.

**The Call:** David Morrison (MD) is frustrated:
*"Three payments delayed this week. My clients are asking questions. I've banked here 8 years! Is there an investigation going on?"*

**What you know:**
• Payments are to high-risk jurisdiction companies
• MLRO filing SAR today
• Tipping-off = criminal offense`,
      challenge: 'How do you respond?',
      options: [
        'Say compliance requirements have increased, ask for documentation',
        'Give generic response about "routine verification procedures"',
        'Be transparent to maintain the relationship',
        'Transfer to compliance department'
      ],
      correctAnswer: 1,
      explanation: 'Use ONLY generic language: "routine verification procedures." Never mention compliance concerns, investigations, or SAR. Transparency here = criminal tipping-off offense.',
      learningPoints: [
        '"Routine verification" is a safe phrase - use it',
        'Never confirm OR deny an investigation exists',
        'Maintain normal service to avoid behavioral red flags'
      ]
    }
  ],

  // Assessment Questions
  assessmentQuestions: [
    {
      id: 'sars-q1',
      type: 'multiple_choice',
      question: 'What is the maximum penalty for failing to report suspected money laundering under POCA Section 330?',
      options: [
        '2 years imprisonment and/or unlimited fine',
        '5 years imprisonment and/or unlimited fine',
        '7 years imprisonment and/or £50,000 fine',
        '10 years imprisonment and/or unlimited fine'
      ],
      correctAnswer: 1,
      explanation: 'Under POCA Section 330 (Failure to Disclose), the maximum penalty is 5 years imprisonment and/or unlimited fine. This applies to all staff in the regulated sector who fail to report knowledge or suspicion of money laundering.'
    },
    {
      id: 'sars-q2',
      type: 'scenario_based',
      question: 'A customer asks why their payment is delayed. You know a SAR has been filed. What should you say?',
      options: [
        'We are investigating potential money laundering concerns',
        'We are completing routine compliance verification procedures',
        'I cannot discuss the reasons for the delay',
        'You need to speak to our compliance department'
      ],
      correctAnswer: 1,
      explanation: 'Use generic language about routine procedures without mentioning compliance concerns, investigations, or money laundering. This maintains customer relationship while avoiding tipping-off violations.'
    },
    {
      id: 'sars-q3',
      type: 'true_false',
      question: 'You must have proof of money laundering before filing a SAR.',
      options: ['True', 'False'],
      correctAnswer: 1,
      explanation: 'False. The legal threshold is "knowledge or suspicion" - you do not need proof. SARs should be filed based on reasonable suspicion, and investigation for proof is law enforcement\'s role.'
    },
    {
      id: 'sars-q4',
      type: 'multiple_choice',
      question: 'How long after becoming suspicious should an internal SAR report be made?',
      options: [
        'Within 24 hours',
        'Within 48 hours',
        'As soon as practicable',
        'Within one week'
      ],
      correctAnswer: 2,
      explanation: 'The legal requirement is "as soon as practicable" which generally means within hours of suspicion arising, not days. Commercial considerations cannot justify delays in reporting.'
    },
    {
      id: 'sars-q5',
      type: 'scenario_based',
      question: 'Multiple daily cash deposits of £9,500 from a small business customer would most likely indicate:',
      options: [
        'Legitimate business growth',
        'Structuring to avoid reporting thresholds',
        'Tax evasion rather than money laundering',
        'Poor cash management practices'
      ],
      correctAnswer: 1,
      explanation: 'Regular deposits just below reporting thresholds (£10,000 for cash) indicate "structuring" or "smurfing" - a classic money laundering technique to avoid detection and reporting requirements.'
    }
  ],

  // Summary and Takeaways
  summary: {
    keyTakeaways: [
      'Legal obligation to report suspicion (not proof) carries serious criminal penalties for non-compliance',
      'Investigation must be swift but thorough - cannot delay SAR filing for perfect evidence',
      'Tipping-off is a criminal offense requiring absolute confidentiality about SAR existence',
      'Quality SARs with comprehensive information provide actionable intelligence for law enforcement',
      'Customer communication during investigations requires careful scripting to avoid disclosure'
    ],
    nextSteps: [
      'Complete the Senior Managers & Certification Regime (SM&CR) training module',
      'Review your firm\'s SAR procedures and escalation protocols',
      'Practice investigation techniques using real case studies and typologies',
      'Understand confidentiality requirements and safe customer communication strategies'
    ],
    quickReference: [
      'Report immediately: "As soon as practicable" means within hours, not days',
      'Suspicion threshold: Knowledge or reasonable suspicion, not proof required',
      'Absolute confidentiality: Never disclose SAR existence to unauthorized persons',
      'Quality matters: Comprehensive, factual SARs provide better law enforcement intelligence'
    ]
  },

  // Visual Assets
  visualAssets: {
    images: [
      {
        section: 'hook',
        description: 'Infographic showing NatWest case timeline and missed opportunities for SAR filing'
      },
      {
        section: 'main-content',
        description: 'Flowchart showing complete SAR process from identification to submission and follow-up'
      },
      {
        section: 'investigation',
        description: 'Red flag indicators matrix showing transaction, customer, and business warning signs'
      },
      {
        section: 'scenarios',
        description: 'Decision tree for customer communication during SAR investigations'
      }
    ],
    style: 'Professional compliance design with clear process flows and investigation guidance visuals'
  }
};
