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
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Reverse Burden of Proof',
              message: 'Under SM&CR, YOU must prove you took reasonable steps - regulators no longer have to prove wrongdoing.'
            },
            {
              type: 'keypoint',
              icon: '🎯',
              title: 'Core Objectives of SM&CR',
              points: [
                'Individual Accountability: Named individuals, not just firms, are accountable',
                'Cultural Change: Proactive risk management, eliminate "group think"',
                'Consumer Protection: Competent leadership, reduced conduct risk'
              ]
            },
            {
              type: 'infogrid',
              title: 'Three-Tier Structure',
              items: [
                { icon: '👔', label: 'Tier 1: Senior Managers', description: 'FCA/PRA approval required' },
                { icon: '📋', label: 'Tier 2: Certified Persons', description: 'Annual firm certification' },
                { icon: '👥', label: 'Tier 3: All Other Staff', description: 'Basic conduct rules apply' }
              ]
            },
            {
              type: 'keypoint',
              icon: '👔',
              title: 'Senior Managers (Tier 1)',
              points: [
                'Must be approved before taking position',
                'Prescribed responsibilities cannot be delegated',
                'Personal liability for failures in their areas',
                'Subject to prohibition orders'
              ]
            },
            {
              type: 'keypoint',
              icon: '📋',
              title: 'Certified Persons (Tier 2)',
              points: [
                'No regulatory approval - certified by firm',
                'Annual fitness & propriety assessments',
                'Certification can be withdrawn',
                'Lower threshold than Senior Managers'
              ]
            },
            {
              type: 'checklist',
              title: 'Firms Covered by SM&CR',
              items: [
                'All FCA solo-regulated firms (Dec 2019)',
                'All PRA-regulated firms (banks, insurers)',
                'Credit unions and friendly societies',
                'Investment firms and asset managers'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: '2016', description: 'Large banks and building societies' },
                { number: 2, title: '2018', description: 'All PRA-regulated firms' },
                { number: 3, title: '2019', description: 'All FCA solo-regulated firms' },
                { number: 4, title: 'Ongoing', description: 'Refinements and extensions' }
              ]
            },
            {
              type: 'infogrid',
              title: 'Enforcement Powers',
              items: [
                { icon: '🚫', label: 'Prohibition', description: 'Ban from financial services' },
                { icon: '💰', label: 'Penalties', description: 'Individual fines' },
                { icon: '📢', label: 'Censure', description: 'Public reputational sanctions' }
              ]
            },
            {
              type: 'alert',
              alertType: 'info',
              title: 'Global Trend',
              message: 'Similar regimes in Australia, Singapore, Hong Kong. US also focusing on individual accountability.'
            },
            {
              type: 'checklist',
              title: 'Reasonable Steps Framework',
              items: [
                'Set clear governance, delegation, oversight',
                'Ensure MI and escalation routes exist',
                'Document decisions, challenge, follow-up',
                'Regular review and improvement'
              ]
            }
          ]
        },

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
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'info',
              title: 'Key Principle',
              message: 'Each SMF comes with prescribed responsibilities that CANNOT be delegated. You are personally accountable.'
            },
            {
              type: 'infogrid',
              title: 'Core Executive SMFs',
              items: [
                { icon: '👔', label: 'SMF1 - CEO', description: 'Overall strategy & operations' },
                { icon: '💰', label: 'SMF2 - CFO', description: 'Financial management' },
                { icon: '⚠️', label: 'SMF4 - CRO', description: 'Risk management framework' },
                { icon: '🔍', label: 'SMF5 - Internal Audit', description: 'Independent assurance' },
                { icon: '🏢', label: 'SMF6 - Head Business', description: 'Major business lines' }
              ]
            },
            {
              type: 'keypoint',
              icon: '👔',
              title: 'SMF1 - CEO Prescribed Responsibilities',
              points: [
                'Firm strategy for regulatory compliance',
                'Allocation of financial resources',
                'Financial crime policies and procedures',
                'Ultimate accountability for firm conduct'
              ]
            },
            {
              type: 'keypoint',
              icon: '⚠️',
              title: 'SMF4 - CRO Prescribed Responsibilities',
              points: [
                'Risk management function oversight',
                'Recovery and resolution planning',
                'Risk appetite setting and monitoring',
                'Independent challenge to business lines'
              ]
            },
            {
              type: 'infogrid',
              title: 'Board/NED SMFs',
              items: [
                { icon: '🪑', label: 'SMF9 - Chairman', description: 'Board leadership' },
                { icon: '⚠️', label: 'SMF10 - Risk Chair', description: 'Risk committee' },
                { icon: '🔍', label: 'SMF11 - Audit Chair', description: 'Audit committee' },
                { icon: '💷', label: 'SMF12 - Rem Chair', description: 'Remuneration' },
                { icon: '⭐', label: 'SMF14 - SID', description: 'Senior Independent' }
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Cannot Be Delegated',
              message: 'Prescribed responsibilities must be held by approved Senior Managers. Cannot be shared between individuals. Personal accountability cannot be avoided.'
            },
            {
              type: 'checklist',
              title: 'Common Prescribed Responsibilities',
              items: [
                'Conflicts of interest management',
                'Financial crime policies',
                'Outsourcing compliance',
                'Business model management',
                'Firm culture'
              ]
            },
            {
              type: 'keypoint',
              icon: '📋',
              title: 'Responsibilities Map Requirements',
              points: [
                'Document showing ALL prescribed responsibility allocations',
                'Maintained and updated regularly',
                'Available to regulators on request',
                'Board approval required for changes'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Allocate', description: 'Assign prescribed responsibilities to SMFs' },
                { number: 2, title: 'Document', description: 'Map responsibilities clearly' },
                { number: 3, title: 'Update', description: 'Revise when duties change' },
                { number: 4, title: 'Notify', description: 'Inform regulator of changes' }
              ]
            },
            {
              type: 'checklist',
              title: 'SoR Update Triggers',
              items: [
                'Role or duty changes',
                'Handover to new SMF holder',
                'New prescribed responsibilities added',
                'Organizational restructuring'
              ]
            }
          ]
        },

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
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Common FCA Finding',
              message: 'Poor handovers and missed notifications are among the most common SM&CR failures found in regulatory reviews.'
            },
            {
              type: 'keypoint',
              icon: '📋',
              title: 'Handover Procedures',
              points: [
                'Document responsibilities, risks, and open issues',
                'Provide clear ownership of regulatory commitments',
                'Maintain handover records for audit',
                'Ensure successor accepts and understands duties'
              ]
            },
            {
              type: 'checklist',
              title: 'Handover Pack Essentials',
              items: [
                'Key risks and open issues',
                'Committees, reporting lines, MI cadence',
                'Outstanding regulatory commitments',
                'Upcoming deadlines and milestones'
              ]
            },
            {
              type: 'keypoint',
              icon: '📄',
              title: 'Regulatory References',
              points: [
                'Must obtain references for senior managers & certified persons',
                'Cover disciplinary findings and conduct breaches',
                'Include relevant investigations',
                'Mandatory for hiring and departure'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Role Change', description: 'Document handover pack and successor acceptance' },
                { number: 2, title: 'Update SoR', description: 'File updated Statement of Responsibilities' },
                { number: 3, title: 'Notify Regulator', description: 'Form C/D notifications as required' },
                { number: 4, title: 'Evidence', description: 'Maintain submission records' }
              ]
            },
            {
              type: 'infogrid',
              title: 'Notification Types',
              items: [
                { icon: '📤', label: 'Form C', description: 'Role cessation' },
                { icon: '📥', label: 'Form D', description: 'Change notifications' },
                { icon: '⚠️', label: 'Breach Report', description: 'Conduct rule breaches' }
              ]
            }
          ]
        },
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
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'info',
              title: 'Certification vs. Approval',
              message: 'Certified persons don\'t need FCA approval but MUST be certified annually by their firm as fit and proper.'
            },
            {
              type: 'infogrid',
              title: 'Fit and Proper Assessment',
              items: [
                { icon: '✅', label: 'Honesty', description: 'Integrity and reputation' },
                { icon: '📚', label: 'Competence', description: 'Capability for the role' },
                { icon: '💰', label: 'Financial', description: 'Soundness where relevant' }
              ]
            },
            {
              type: 'keypoint',
              icon: '👥',
              title: 'Who Needs Certification',
              points: [
                'Investment advisors and wealth managers',
                'Traders and market makers',
                'Credit decision makers (above thresholds)',
                'Benchmark submitters and administrators',
                'Material risk function holders'
              ]
            },
            {
              type: 'checklist',
              title: 'Annual Certification Evidence',
              items: [
                'Training completion and competence checks',
                'Performance reviews and supervision records',
                'Conduct breaches, remediation, outcomes',
                'Customer feedback and complaints analysis',
                'Professional development updates'
              ]
            },
            {
              type: 'process',
              steps: [
                { number: 1, title: 'Gather Evidence', description: 'Performance, training, conduct records' },
                { number: 2, title: 'Assess F&P', description: 'Competence, honesty, financial soundness' },
                { number: 3, title: 'Decision', description: 'Senior management review and approval' },
                { number: 4, title: 'Document', description: 'Record rationale, communicate to individual' }
              ]
            },
            {
              type: 'keypoint',
              icon: '🔍',
              title: 'Continuous Monitoring',
              points: [
                'Conduct and behavior indicators',
                'Customer complaints and feedback',
                'Performance deterioration',
                'Regulatory breaches or issues',
                'Personal circumstances affecting fitness'
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Trigger Events for Review',
              message: 'Customer complaints, conduct issues, criminal charges, financial difficulties, or professional misconduct require immediate fitness review.'
            },
            {
              type: 'keypoint',
              icon: '🚫',
              title: 'Grounds for Withdrawal',
              points: [
                'Failure to meet F&P standards',
                'Serious conduct rule breaches',
                'Poor performance affecting consumers',
                'Criminal convictions or enforcement',
                'Dishonesty or integrity failures'
              ]
            },
            {
              type: 'checklist',
              title: 'Withdrawal Process Requirements',
              items: [
                'Fair and transparent investigation',
                'Right to representation and appeal',
                'Clear communication of decision',
                'Regulatory notification if required',
                'Transition and handover procedures'
              ]
            },
            {
              type: 'stat',
              icon: '📅',
              value: 'Annual',
              label: 'Certification frequency',
              description: 'Plus continuous monitoring between certifications',
              color: 'blue'
            }
          ]
        },

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
        mainContent: {
          cards: [
            {
              type: 'alert',
              alertType: 'critical',
              title: 'Universal Application',
              message: 'Conduct rules apply to EVERYONE in scope of SM&CR. Senior Managers have additional enhanced rules.'
            },
            {
              type: 'keypoint',
              icon: '1️⃣',
              title: 'Individual Rule 1: Integrity',
              points: [
                '"You must act with integrity"',
                'Honesty in all professional dealings',
                'Transparency about conflicts',
                'Truthfulness in reporting'
              ]
            },
            {
              type: 'keypoint',
              icon: '2️⃣',
              title: 'Individual Rule 2: Skill & Care',
              points: [
                '"You must act with due skill, care and diligence"',
                'Maintain competence for your role',
                'Continuous professional development',
                'Attention to detail'
              ]
            },
            {
              type: 'keypoint',
              icon: '3️⃣',
              title: 'Individual Rule 3: Open with Regulators',
              points: [
                '"Be open and cooperative with FCA/PRA"',
                'Prompt responses to requests',
                'Honest disclosure',
                'Cooperation with investigations'
              ]
            },
            {
              type: 'keypoint',
              icon: '4️⃣',
              title: 'Individual Rule 4: Fair Treatment',
              points: [
                '"Pay due regard to customer interests"',
                'Suitable advice and recommendations',
                'Clear communication',
                'Avoid disadvantaging customers'
              ]
            },
            {
              type: 'keypoint',
              icon: '5️⃣',
              title: 'Individual Rule 5: Market Conduct',
              points: [
                '"Observe proper market conduct standards"',
                'Fair dealing in markets',
                'No market abuse or manipulation',
                'Proper use of inside information'
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Senior Manager Additional Rules',
              message: 'SM Conduct Rules: (1) Effective control of your area, (2) Regulatory compliance, (3) Proper delegation oversight, (4) Disclosure to regulators.'
            },
            {
              type: 'keypoint',
              icon: '✅',
              title: 'What Are "Reasonable Steps"',
              points: [
                'Action a reasonable person would take',
                'Consider circumstances and resources',
                'Proportionate to risks involved',
                'Draw on relevant expertise',
                'Implement appropriate monitoring'
              ]
            },
            {
              type: 'infogrid',
              title: 'Enforcement Powers',
              items: [
                { icon: '🚫', label: 'Prohibition', description: 'Ban from financial services' },
                { icon: '💰', label: 'Fines', description: 'Based on income + severity' },
                { icon: '📢', label: 'Censure', description: 'Public reputational sanctions' },
                { icon: '⚖️', label: 'Criminal', description: 'For serious offenses' }
              ]
            },
            {
              type: 'checklist',
              title: 'Breach Reporting Process',
              items: [
                'Establish internal reporting routes',
                'Record facts and decision rationale',
                'Document remediation actions',
                'Report serious breaches to regulators'
              ]
            }
          ]
        },

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
