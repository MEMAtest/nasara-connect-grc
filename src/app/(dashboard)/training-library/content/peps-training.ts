import { TrainingModule } from '../types';

export const pepsTrainingModule: TrainingModule = {
  id: 'peps-training',
  title: 'Politically Exposed Persons (PEPs) Identification',
  description: 'Master the identification, classification, and enhanced due diligence requirements for Politically Exposed Persons.',
  category: 'financial-crime-prevention',
  duration: 10,
  difficulty: 'intermediate',
  targetPersonas: ['compliance-officer', 'relationship-manager', 'kyc-specialist'],
  prerequisiteModules: ['aml-fundamentals', 'kyc-fundamentals'],
  tags: ['peps', 'enhanced-due-diligence', 'edd', 'political-risk', 'compliance'],
  learningOutcomes: [
    'Define and categorize different types of Politically Exposed Persons',
    'Implement Enhanced Due Diligence procedures for PEPs',
    'Understand ongoing monitoring requirements for PEP relationships',
    'Recognize PEP family members and close associates',
    'Apply appropriate risk assessment frameworks for PEP customers'
  ],

  // Hook Section
  hook: {
    type: 'shocking_statistic',
    title: 'The Hidden Web of Political Power and Money',
    content: `Consider this: In 2021, the Pandora Papers revealed how more than 35 current and former world leaders used offshore financial structures to hide wealth. Among them were 14 current heads of state, including presidents, prime ministers, and monarchs. The leaked documents showed $32 trillion in assets moved through offshore entities.

    But here's what's truly staggering: many of these individuals should have been identified as Politically Exposed Persons (PEPs) by financial institutions worldwide. Yet complex ownership structures, nominee arrangements, and inadequate screening allowed massive wealth transfers to occur undetected for years.

    One case involved a sitting prime minister who controlled assets worth hundreds of millions through a network of shell companies, trusts, and family members. Multiple banks processed transactions for years without implementing proper Enhanced Due Diligence.

    This isn't just about compliance failures - it's about corruption that steals resources from entire populations. Every PEP you correctly identify and monitor helps prevent the looting of nations. Every enhanced due diligence check you perform could expose corruption that affects millions of lives.

    The question isn't whether PEPs will try to use your institution - it's whether you'll recognize them when they do.`,
    keyQuestion: 'How confident are you that your current PEP identification procedures would catch a sophisticated politically exposed person using family members and complex structures to hide their identity?'
  },

  // Main Content Sections
  lessons: [
    {
      id: 'pep-categories',
      title: 'Understanding PEP Categories and Definitions',
      type: 'content',
      duration: 3,
      content: {
        learningPoint: 'Master the comprehensive definition and categorization of Politically Exposed Persons',
        mainContent: {
          cards: [
            {
              type: 'keypoint',
              icon: '🏛️',
              title: 'What is a PEP?',
              points: [
                'Individuals entrusted with prominent public functions',
                'Definition is broader than most realize',
                'Includes family members and close associates',
                'Requires Enhanced Due Diligence (EDD)'
              ]
            },
            {
              type: 'infogrid',
              title: 'Three Categories of PEPs',
              items: [
                { icon: '🇬🇧', label: 'Domestic PEPs', description: 'MPs, ministers, senior civil servants, judges, military officers, state-owned enterprise executives' },
                { icon: '🌍', label: 'Foreign PEPs', description: 'Heads of state, ministers, ambassadors, central bank board members, senior military (Colonel+)' },
                { icon: '🌐', label: 'International Org PEPs', description: 'UN/World Bank/IMF leadership, EU Commission officials, NATO/WHO/WTO executives' }
              ]
            },
            {
              type: 'checklist',
              title: 'PEP Family Members (Require EDD)',
              items: [
                'Spouses and civil partners',
                'Children and their spouses/partners',
                'Parents and siblings',
                'Grandparents and grandchildren',
                'In-laws and step-relations'
              ]
            },
            {
              type: 'checklist',
              title: 'Close Associates (Require EDD)',
              items: [
                'Business partners in joint ventures',
                'Professional advisors with ongoing relationships',
                'Nominees acting on behalf of the PEP',
                'Beneficial owners linked to the PEP',
                'Close friends with financial relationships'
              ]
            },
            {
              type: 'stat',
              value: '12 months',
              label: 'The Former PEP Rule',
              description: 'After leaving office, former PEPs may have reduced measures - but risk assessment must consider ongoing influence, country risk, and adverse media'
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Common Misconceptions',
              message: 'PEPs are NOT automatically high-risk (individual assessment required). Former PEPs may retain influence. Family/associates can be equally risky. Databases miss local PEPs - human review essential.'
            }
          ]
        },

        keyConcepts: [
          {
            term: 'Prominent Public Function',
            definition: 'A role that confers significant influence, authority, or access to public resources, making the individual susceptible to corruption'
          },
          {
            term: 'Close Associate',
            definition: 'A person closely connected to a PEP through business, personal, or professional relationships that could be used for illicit purposes'
          },
          {
            term: 'State-Owned Enterprise',
            definition: 'Commercial entities owned or controlled by government where senior executives may qualify as PEPs'
          },
          {
            term: 'Risk-Based Approach',
            definition: 'Tailoring Enhanced Due Diligence measures based on individual PEP risk factors rather than applying uniform procedures'
          }
        ],

        realExamples: [
          'A UK MP\'s spouse applies for private banking services. Both the MP (domestic PEP) and spouse (family member) require Enhanced Due Diligence.',
          'A former foreign minister left office 18 months ago and applies for an account. Risk assessment considers their continued influence in politics.',
          'A successful businessman is identified as a close friend and business partner of a current president, qualifying as a PEP associate.'
        ],

        regulatoryRequirements: [
          'Money Laundering Regulations 2017 - Regulation 35 (Enhanced due diligence)',
          'JMLSG Guidance Part I Section 5.3 - Politically Exposed Persons',
          'FCA Financial Crime Guide - Chapter 4 (Enhanced due diligence for PEPs)',
          'EU 4th Anti-Money Laundering Directive - Article 18-24'
        ]
      }
    },

    {
      id: 'edd-procedures',
      title: 'Enhanced Due Diligence for PEPs',
      type: 'content',
      duration: 4,
      content: {
        learningPoint: 'Implement comprehensive Enhanced Due Diligence procedures tailored for PEP relationships',
        mainContent: {
          cards: [
            {
              type: 'keypoint',
              icon: '🔬',
              title: 'EDD Goes Beyond Standard CDD',
              points: [
                'Senior management approval required',
                'Enhanced source of wealth/funds verification',
                'Ongoing enhanced monitoring',
                'More frequent review cycles'
              ]
            },
            {
              type: 'infogrid',
              title: 'Three Core EDD Requirements',
              items: [
                { icon: '👔', label: 'Senior Approval', description: 'All new PEP relationships need documented approval with rationale' },
                { icon: '💰', label: 'Source Verification', description: 'Detailed career history, asset timeline, independent verification' },
                { icon: '👁️', label: 'Enhanced Monitoring', description: 'Lower thresholds, adverse media screening, family monitoring' }
              ]
            },
            {
              type: 'infogrid',
              title: 'Risk Assessment Factors',
              items: [
                { icon: '🌍', label: 'Country Risk', description: 'Corruption index, FATF results, political stability, rule of law' },
                { icon: '🏛️', label: 'Position Risk', description: 'Authority level, access to funds, regulatory power, diplomatic immunity' },
                { icon: '👤', label: 'Individual Risk', description: 'Adverse media, criminal associates, lifestyle vs income, offshore holdings' }
              ]
            },
            {
              type: 'stat',
              value: '6-12 months',
              label: 'High-Risk PEP Review Cycle',
              description: 'Medium-risk: annually. Former PEPs: risk-based (typically annually for 2 years)'
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Red Flags to Watch',
              message: 'Assets disproportionate to income. Rapid wealth during tenure. Reluctance to provide documentation. Evasive about political connections. Requests for unusual privacy.'
            }
          ]
        },

        keyConcepts: [
          {
            term: 'Source of Wealth',
            definition: 'The historical origins of a PEP\'s total wealth and assets, requiring enhanced verification and documentation'
          },
          {
            term: 'Source of Funds',
            definition: 'The specific origin of funds for individual transactions, requiring detailed documentation and verification'
          },
          {
            term: 'Enhanced Monitoring',
            definition: 'Increased scrutiny of PEP transactions and activities beyond standard customer monitoring procedures'
          },
          {
            term: 'Adverse Media',
            definition: 'Negative news coverage or information that could indicate increased risk factors for PEP relationships'
          }
        ],

        realExamples: [
          'A foreign trade minister\'s son wants to open an account for property investment. Enhanced verification reveals the funds come from a government contract awarded to his company.',
          'Transaction monitoring alerts on a PEP account show regular transfers to a previously unknown offshore company, triggering enhanced investigation.',
          'A domestic PEP\'s relationship review identifies significant adverse media about corruption allegations, leading to relationship reassessment.'
        ],

        regulatoryRequirements: [
          'Money Laundering Regulations 2017 - Regulation 35(2) Enhanced due diligence measures',
          'JMLSG Guidance Part I Section 5.3.14 - Source of wealth and funds',
          'FCA SYSC 6.3.9 - Enhanced ongoing monitoring for PEPs',
          'EU 5th Anti-Money Laundering Directive - Enhanced PEP requirements'
        ]
      }
    },

    {
      id: 'identification-techniques',
      title: 'PEP Identification Techniques and Tools',
      type: 'content',
      duration: 3,
      content: {
        learningPoint: 'Master practical techniques and tools for identifying PEPs and their associates effectively',
        mainContent: {
          cards: [
            {
              type: 'keypoint',
              icon: '🔍',
              title: 'Multi-Layered Approach Required',
              points: [
                'Technology alone will miss sophisticated PEPs',
                'Combine automated + manual + questioning',
                'Databases miss local PEPs & associates',
                'Human review essential for verification'
              ]
            },
            {
              type: 'infogrid',
              title: 'Three Identification Layers',
              items: [
                { icon: '🤖', label: 'Automated Screening', description: 'World-Check, Dow Jones, LexisNexis - but misses local PEPs & associates' },
                { icon: '🔎', label: 'Manual Research', description: 'Government directories, corporate registries, court records, media archives' },
                { icon: '💬', label: 'Customer Questioning', description: 'Direct: political positions. Indirect: family in politics, business partnerships' }
              ]
            },
            {
              type: 'checklist',
              title: 'Hidden PEP Red Flags',
              items: [
                'Reluctance to provide personal information',
                'Evasive about employment history',
                'Introduction through high-profile intermediaries',
                'Wealth inconsistent with declared employment',
                'Multiple passports or offshore structures'
              ]
            },
            {
              type: 'alert',
              alertType: 'warning',
              title: 'Common Identification Failures',
              message: 'Missing local/regional PEPs. Incomplete family relationships. Associate gaps. Cultural name variations. Limited local language research.'
            }
          ]
        },

        keyConcepts: [
          {
            term: 'Multi-Source Verification',
            definition: 'Using multiple independent sources to confirm PEP status and relationships'
          },
          {
            term: 'Relationship Mapping',
            definition: 'Systematic analysis of connections between individuals to identify PEP associations'
          },
          {
            term: 'False Positive',
            definition: 'Incorrect identification of a non-PEP as a PEP due to name similarity or database errors'
          },
          {
            term: 'Hidden PEP',
            definition: 'A politically exposed person attempting to conceal their status through various means'
          }
        ],

        realExamples: [
          'Automated screening misses a local council leader\'s spouse due to maiden name usage, identified through manual review of shared address.',
          'A customer claiming to be a private businessman is identified as a former cabinet minister through LinkedIn profile verification.',
          'Family relationship mapping reveals that three apparently unrelated customers are siblings of a sitting prime minister.'
        ],

        regulatoryRequirements: [
          'Money Laundering Regulations 2017 - Regulation 35(1) PEP identification',
          'JMLSG Guidance Part I Section 5.3.2 - Identification procedures',
          'FCA Financial Crime Guide - Customer identification requirements',
          'Data Protection Act 2018 - Lawful basis for PEP data processing'
        ]
      }
    },
    {
      id: 'ongoing-monitoring-exit',
      title: 'Ongoing Monitoring & Reviews',
      type: 'content',
      duration: 4,
      content: {
        learningPoint: 'PEP risk changes over time and requires structured monitoring, refresh cycles and documented exit decisions.',
        mainContent: {
          cards: [
            {
              type: 'keypoint',
              icon: '👁️',
              title: 'Risk Doesn\'t End at Onboarding',
              points: [
                'Risk can increase if customer gains influence',
                'Allegations or sanctions change everything',
                'Ongoing monitoring = core control, not optional',
                '12-month rule is NOT automatic de-risking'
              ]
            },
            {
              type: 'infogrid',
              title: 'Monitoring Requirements',
              items: [
                { icon: '📅', label: 'Periodic Reviews', description: 'Risk-based frequency. High-risk: quarterly. Lower-risk: annually.' },
                { icon: '💳', label: 'Transaction Monitoring', description: 'Lower thresholds, watch fund movements, counterparty changes' },
                { icon: '⚡', label: 'Trigger Events', description: 'New role, adverse media, ownership changes, unexplained wealth' }
              ]
            },
            {
              type: 'checklist',
              title: 'Exit Decision Requirements',
              items: [
                'Consistent with firm policy',
                'Approved at the right level',
                'Documented with evidence and rationale',
                'Managed carefully to avoid tipping off'
              ]
            }
          ]
        },
        keyConcepts: [
          {
            term: 'Trigger Event',
            definition: 'A change that requires immediate review, such as new public office, sanctions exposure, or adverse media.'
          },
          {
            term: 'Risk-Based Review Cadence',
            definition: 'The frequency of PEP reviews tailored to the assessed risk profile.'
          },
          {
            term: 'De-PEP Decision',
            definition: 'A documented decision to downgrade PEP status based on evidence and elapsed time.'
          },
          {
            term: 'Exit Decision',
            definition: 'A formal decision to end the relationship, documented and approved at senior level.'
          }
        ],
        realExamples: [
          'A former minister left office 18 months ago but remained politically influential. The firm maintained enhanced monitoring with documented rationale.',
          'A PEP customer was linked to adverse media about procurement fraud, triggering immediate review and senior management escalation.',
          'A PEP relationship was exited after repeated unexplained wealth increases and refusal to provide evidence of source of funds.'
        ],
        regulatoryRequirements: [
          'Money Laundering Regulations 2017 - Regulation 35 (ongoing monitoring)',
          'JMLSG Guidance Part I Section 5.3.7 - Ongoing monitoring of PEPs',
          'FCA Financial Crime Guide - Ongoing due diligence expectations'
        ]
      }
    },
    {
      id: 'pep-governance-approvals',
      title: 'Governance & Documentation',
      type: 'content',
      duration: 4,
      content: {
        learningPoint: 'PEP controls must be backed by senior approval, clear ownership, and audit-ready evidence.',
        mainContent: {
          cards: [
            {
              type: 'keypoint',
              icon: '📋',
              title: 'Audit Trail is Essential',
              points: [
                'Regulators expect clear documentation',
                'Why was PEP accepted? What risks?',
                'Who approved? At what level?',
                'Controls only defensible if documented'
              ]
            },
            {
              type: 'infogrid',
              title: 'Governance Framework',
              items: [
                { icon: '👔', label: 'Senior Approval', description: 'Documented risk assessment + EDD summary for each relationship' },
                { icon: '🎯', label: 'Accountability', description: 'MLRO oversight, business owner accuracy, compliance challenge' },
                { icon: '✅', label: 'Quality Assurance', description: 'File reviews, sample testing, MI to senior management' }
              ]
            },
            {
              type: 'checklist',
              title: 'Minimum Documentation Per PEP',
              items: [
                'PEP classification rationale',
                'Source of wealth/funds evidence',
                'Approval record with risk summary',
                'Ongoing monitoring records',
                'All escalations and exceptions'
              ]
            }
          ]
        },
        keyConcepts: [
          {
            term: 'Senior Management Approval',
            definition: 'Formal sign-off by designated senior leaders for new PEP relationships.'
          },
          {
            term: 'EDD File',
            definition: 'Documented evidence pack supporting PEP onboarding and monitoring decisions.'
          },
          {
            term: 'Quality Assurance',
            definition: 'Independent checks that PEP decisions meet policy and regulatory standards.'
          },
          {
            term: 'Management Information (MI)',
            definition: 'Regular reporting on PEP exposure, review status and incidents.'
          }
        ],
        realExamples: [
          'A firm required dual approval for foreign PEPs from the MLRO and business head, reducing approval bottlenecks and improving documentation quality.',
          'Quality assurance sampling found that 20% of PEP files lacked evidence of source of wealth, leading to remediation and retraining.',
          'Monthly MI reports highlighted a backlog of overdue PEP reviews, prompting resource reallocation.'
        ],
        regulatoryRequirements: [
          'Money Laundering Regulations 2017 - Regulation 35 (senior management approval)',
          'FCA SYSC 6.3 - Financial crime systems and controls',
          'JMLSG Guidance Part I Section 5.3 - Governance and documentation'
        ]
      }
    }
  ],

  // Practice Scenarios
  practiceScenarios: [
    {
      id: 'complex-pep-scenario',
      title: 'The Connected Family',
      image: '/images/training/pep-family-scenario.png',
      imagePrompt: 'Photorealistic corporate photograph, affluent multi-generational family of 5-6 people in elegant business attire, standing in luxurious private bank lobby with marble floors. Mix of ages from 30s to 70s, confident poses, international appearance. Warm professional lighting, high-end wealth management aesthetic, 16:9 aspect ratio, no text.',
      situation: `**The Client:** Elizabeth Harrison-Williams seeking private banking services (£15M net worth)

**Family Discoveries:**
• Husband James: Former "Senior Advisor, US Treasury Secretary"
• Mother Lady Margaret: Widow of Sir Henry Harrison (UK Ambassador to France 1985-89)
• Daughter Sarah: Board member of foundation receiving government grants

**Red Flags:**
• Multiple homes: London, New York, Monaco
• Complex offshore structures
• Requested "enhanced privacy measures"`,
      challenge: 'Who requires PEP classification?',
      options: [
        'Only James Williams (Treasury role)',
        'James and Lady Margaret only',
        'Elizabeth, James, Lady Margaret, AND Sarah all require PEP classification',
        'No one - positions are historical'
      ],
      correctAnswer: 2,
      explanation: 'Multiple PEPs: James (foreign PEP - Treasury), Lady Margaret (PEP family member - ambassador\'s widow), Sarah (public function through foundation). Elizabeth needs EDD as spouse of a PEP.',
      learningPoints: [
        'Widows/widowers of former PEPs maintain family member status',
        'Foundation roles with government connections may qualify as PEP',
        'Entire family structures need scrutiny when PEP connections exist'
      ]
    },

    {
      id: 'hidden-pep-scenario',
      title: 'The Hidden Diplomat',
      image: '/images/training/pep-concealment-scenario.png',
      imagePrompt: 'Photorealistic corporate photograph, professional woman in her 40s in designer business suit, sitting across desk from compliance officer in modern Mayfair office. She appears slightly guarded, partially turned away. Documents and laptop on desk. Tension in body language. Cinematic corporate photography, 16:9 aspect ratio, no text.',
      situation: `**The Applicant:** Maria Santos, Portuguese national, "international business consultant"

**What She Declared:**
• 15 years of consulting experience
• £500K expected turnover
• Company incorporated 6 months ago

**What Investigation Found:**
• LinkedIn: "Senior Policy Advisor, Portuguese Foreign Ministry" (2018-2022)
• EU Register: Lobbying for African government interests
• Funding from Swiss entity "Santos Family Holdings SA"
• Evasive about client names, requested extra privacy`,
      challenge: 'What is your assessment?',
      options: [
        'No PEP - proceed with standard due diligence',
        'Possible former PEP - enhanced verification needed',
        'CLEAR CONCEALMENT of former PEP status - escalate immediately',
        'Need more documentation first'
      ],
      correctAnswer: 2,
      explanation: 'Clear attempt to hide former foreign PEP status. The combination of evasive responses, offshore funding, and evidence of diplomatic role = immediate escalation required.',
      learningPoints: [
        'Concealment attempts dramatically increase risk',
        'Former diplomatic roles qualify as foreign PEP',
        'Offshore structures may indicate wealth concealment'
      ]
    }
  ],

  // Assessment Questions
  assessmentQuestions: [
    {
      id: 'peps-q1',
      type: 'multiple_choice',
      question: 'Which of the following family relationships requires Enhanced Due Diligence as a PEP family member?',
      options: [
        'Only spouse and children',
        'Spouse, children, and parents',
        'All immediate family including siblings',
        'All immediate and extended family including in-laws'
      ],
      correctAnswer: 3,
      explanation: 'PEP family members include all immediate and extended family: spouse/partner, children, parents, siblings, grandparents, grandchildren, and in-laws. The definition is intentionally broad to prevent circumvention through family structures.'
    },
    {
      id: 'peps-q2',
      type: 'true_false',
      question: 'A person automatically stops being considered a PEP exactly 12 months after leaving office.',
      options: ['True', 'False'],
      correctAnswer: 1,
      explanation: 'False. After 12 months, former PEPs may be subject to reduced due diligence based on risk assessment, but they don\'t automatically lose PEP status. The decision should consider ongoing influence, corruption levels, and other risk factors.'
    },
    {
      id: 'peps-q3',
      type: 'scenario_based',
      question: 'A customer claims to be a "business consultant" but investigation reveals they are a serving MP\'s chief of staff. What is their PEP status?',
      options: [
        'Not a PEP as they are not elected officials',
        'Domestic PEP as they hold a prominent public function',
        'PEP associate due to close relationship with MP',
        'No special status as they are civil servants'
      ],
      correctAnswer: 1,
      explanation: 'Senior political advisors and chiefs of staff typically qualify as domestic PEPs as they hold prominent public functions with significant influence. The attempt to conceal this role also raises additional risk concerns.'
    },
    {
      id: 'peps-q4',
      type: 'multiple_choice',
      question: 'Enhanced Due Diligence for PEPs must include which of the following?',
      options: [
        'Senior management approval only',
        'Enhanced source of wealth verification only',
        'Senior management approval, enhanced source verification, and ongoing enhanced monitoring',
        'More frequent reviews only'
      ],
      correctAnswer: 2,
      explanation: 'Enhanced Due Diligence for PEPs requires all three core elements: senior management approval for the relationship, enhanced verification of source of wealth and funds, and ongoing enhanced monitoring throughout the relationship.'
    },
    {
      id: 'peps-q5',
      type: 'scenario_based',
      question: 'You identify that a customer\'s business partner is a foreign government minister. What is the customer\'s PEP status?',
      options: [
        'No PEP status - business relationships don\'t qualify',
        'PEP associate requiring Enhanced Due Diligence',
        'Foreign PEP requiring full Enhanced Due Diligence',
        'Requires additional information to determine status'
      ],
      correctAnswer: 1,
      explanation: 'Close business associates of PEPs, including business partners, qualify as PEP associates and require Enhanced Due Diligence. The relationship creates potential channels for corruption or influence peddling.'
    }
  ],

  // Summary and Takeaways
  summary: {
    keyTakeaways: [
      'PEP identification requires comprehensive understanding of family relationships and close associates',
      'Enhanced Due Diligence for PEPs involves senior approval, enhanced verification, and ongoing monitoring',
      'Former PEPs may retain risk factors requiring continued enhanced measures beyond 12 months',
      'Effective PEP identification combines automated screening with manual research and verification',
      'Attempts to conceal PEP status significantly increase risk and require immediate escalation'
    ],
    nextSteps: [
      'Complete the Suspicious Activity Reporting (SARs) training module',
      'Review your firm\'s PEP identification procedures and database coverage',
      'Practice relationship mapping techniques for complex family structures',
      'Understand escalation procedures for PEP identification and Enhanced Due Diligence'
    ],
    quickReference: [
      'EDD required: All PEPs, family members, and close associates need Enhanced Due Diligence',
      'Senior approval: All new PEP relationships require senior management approval',
      '12-month rule: Former PEPs may have reduced measures after 12 months based on risk',
      'Enhanced monitoring: PEPs require more frequent reviews and enhanced transaction monitoring'
    ]
  },

  // Visual Assets
  visualAssets: {
    images: [
      {
        section: 'hook',
        description: 'Infographic showing Pandora Papers statistics and offshore wealth networks'
      },
      {
        section: 'main-content',
        description: 'Comprehensive diagram showing PEP categories, family relationships, and associate connections'
      },
      {
        section: 'edd-procedures',
        description: 'Flowchart showing Enhanced Due Diligence process from identification to ongoing monitoring'
      },
      {
        section: 'scenarios',
        description: 'Visual guide to red flags and concealment techniques used by hidden PEPs'
      }
    ],
    style: 'Professional compliance design with clear relationship mapping and process flow visuals'
  }
};
