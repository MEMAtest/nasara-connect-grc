type LessonContent = string | {
  learningPoint?: string;
  mainContent?: string;
  keyConcepts?: Array<string | { term: string; definition: string }>;
  realExamples?: Array<string | { title: string; description?: string; outcome?: string }>;
  regulatoryRequirements?: string[];
  visual?: Record<string, unknown>;
};

interface TrainingModuleLike {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  difficulty?: string;
  hook?: {
    title?: string;
    content?: string;
    statistic?: string;
    caseStudy?: string;
    keyQuestion?: string;
  };
  lessons?: Array<{
    id?: string;
    title: string;
    type?: string;
    duration?: number;
    content: LessonContent;
    keyConcepts?: Array<string | { term: string; definition: string }>;
    realExamples?: Array<string | { title: string; description?: string; outcome?: string }>;
  }>;
  learningOutcomes?: string[];
  practiceScenarios?: Array<{
    id: string;
    title: string;
    scenario?: string;
    situation?: string;
    context?: string;
    challenge?: string;
    description?: string;
    questions?: string[];
    hints?: string[];
    modelAnswer?: string;
    question?: string;
    options?: Array<{ id?: string; text?: string; isCorrect?: boolean; feedback?: string } | string>;
    correctAnswer?: number;
    explanation?: string;
    learningPoint?: string;
    learningPoints?: string[];
  }>;
  assessmentQuestions?: Array<{
    id: string;
    question: string;
    options: Array<{ id?: string; text?: string; isCorrect?: boolean } | string>;
    correctAnswer?: number;
    explanation?: string;
  }>;
  summary?: {
    keyTakeaways?: string[];
    nextSteps?: string[];
    quickReference?: string[] | { title?: string; items?: Array<{ term: string; definition: string }> };
  };
}

const DEFAULT_SESSION_TITLES = [
  "Foundations and Scope",
  "Regulatory Expectations",
  "Operational Workflow",
  "Scenario Walkthroughs",
  "Governance and Evidence",
];

const getLessonContentText = (content: LessonContent) => {
  if (typeof content === "string") return content;
  return content.mainContent || content.learningPoint || "";
};

const flattenKeyConcepts = (lessons: TrainingModuleLike["lessons"]) => {
  const concepts: Array<string | { term: string; definition: string }> = [];
  (lessons || []).forEach((lesson) => {
    if (typeof lesson.content === "object" && lesson.content.keyConcepts) {
      concepts.push(...lesson.content.keyConcepts);
    }
    if (lesson.keyConcepts) {
      concepts.push(...lesson.keyConcepts);
    }
  });
  return concepts;
};

const flattenRealExamples = (lessons: TrainingModuleLike["lessons"]) => {
  const examples: Array<string | { title: string; description?: string; outcome?: string }> = [];
  (lessons || []).forEach((lesson) => {
    if (typeof lesson.content === "object" && lesson.content.realExamples) {
      examples.push(...lesson.content.realExamples);
    }
    if (lesson.realExamples) {
      examples.push(...lesson.realExamples);
    }
  });
  return examples;
};

const buildGeneratedVisual = (type: "infographic" | "process_flow" | "scenario_illustration", module: TrainingModuleLike, index: number) => {
  if (type === "infographic") {
    const outcomes = module.learningOutcomes?.slice(0, 3) || [];
    return {
      type: "infographic",
      elements: outcomes.length
        ? [
            { icon: "alert-triangle", text: outcomes[0] || "Identify key risks", description: "Spot the highest impact risks first.", color: "red" },
            { icon: "search", text: outcomes[1] || "Apply controls", description: "Use controls proportionate to the risk.", color: "amber" },
            { icon: "shield", text: outcomes[2] || "Evidence outcomes", description: "Document decisions and outcomes clearly.", color: "green" },
          ]
        : [
            { icon: "alert-triangle", text: "Identify risks", description: "Recognize where harm can occur.", color: "red" },
            { icon: "search", text: "Apply controls", description: "Use proportionate checks and safeguards.", color: "amber" },
            { icon: "shield", text: "Evidence outcomes", description: "Maintain audit-ready documentation.", color: "green" },
          ],
    };
  }

  if (type === "process_flow") {
    const nextSteps = module.summary?.nextSteps?.slice(0, 3) || [];
    const steps = [
      {
        number: 1,
        title: "Define scope",
        description: "Clarify who, what, and why before applying controls.",
        examples: nextSteps[0] ? [nextSteps[0]] : ["Identify scope and ownership"],
        redFlags: ["Undefined scope or owners"],
        color: "red",
      },
      {
        number: 2,
        title: "Apply controls",
        description: "Select proportionate checks based on risk.",
        examples: nextSteps[1] ? [nextSteps[1]] : ["Apply risk-based controls"],
        redFlags: ["Controls not documented"],
        color: "amber",
      },
      {
        number: 3,
        title: "Evidence outcomes",
        description: "Document decisions, monitoring, and review cadence.",
        examples: nextSteps[2] ? [nextSteps[2]] : ["Capture evidence and review regularly"],
        redFlags: ["Missing evidence or review dates"],
        color: "green",
      },
    ];

    return { type: "process_flow", steps };
  }

  if (type === "scenario_illustration") {
    const scenario = module.practiceScenarios?.[index]?.scenario
      || module.practiceScenarios?.[index]?.situation
      || module.practiceScenarios?.[index]?.context
      || module.practiceScenarios?.[index]?.challenge
      || "A real-world situation requires careful judgement and evidence-based escalation.";
    return {
      type: "scenario_illustration",
      description: scenario,
    };
  }

  return null;
};

const buildSupplementLessons = (module: TrainingModuleLike, count: number) => {
  const description = module.description || `${module.title} focuses on regulatory compliance and operational discipline.`;
  const outcomes = module.learningOutcomes || [];
  const takeaways = module.summary?.keyTakeaways || [];
  const quickReferenceItems = Array.isArray(module.summary?.quickReference)
    ? module.summary?.quickReference || []
    : (module.summary?.quickReference?.items || []).map((item) => `${item.term}: ${item.definition}`);

  const baseLessons = [
    {
      title: `${module.title}: Foundations and Scope`,
      content: {
        learningPoint: "Establish the core scope and purpose before applying controls.",
        mainContent: `${description}\n\nKey outcomes:\n${outcomes.length ? outcomes.map((item) => `- ${item}`).join("\n") : "- Define scope, risk appetite, and responsibilities"}`,
        keyConcepts: quickReferenceItems.slice(0, 4),
        visual: buildGeneratedVisual("infographic", module, 0),
      },
    },
    {
      title: "Regulatory Expectations and Standards",
      content: {
        learningPoint: "Understand the expectations and how they translate into day-to-day decisions.",
        mainContent: `Regulators expect evidence-based decisions, proportionate controls, and clear accountability.\n\nCritical expectations:\n${takeaways.length ? takeaways.map((item) => `- ${item}`).join("\n") : "- Demonstrate compliance through documented evidence\n- Maintain clear ownership and escalation paths"}`,
        keyConcepts: outcomes.slice(0, 4),
        visual: buildGeneratedVisual("infographic", module, 1),
      },
    },
    {
      title: "Operational Workflow and Controls",
      content: {
        learningPoint: "Translate regulatory expectations into a consistent operational workflow.",
        mainContent: `A consistent workflow ensures controls are applied predictably, escalations are timely, and evidence is captured.\n\nWorkflow focus:\n${(module.summary?.nextSteps || []).map((item) => `- ${item}`).join("\n") || "- Define workflow owners\n- Apply proportionate controls\n- Capture evidence and review outcomes"}`,
        visual: buildGeneratedVisual("process_flow", module, 2),
      },
    },
    {
      title: "Scenario Walkthroughs and Decisioning",
      content: {
        learningPoint: "Use realistic scenarios to practice judgement and escalation.",
        mainContent: `${module.practiceScenarios?.length ? "Review these scenarios and focus on what evidence and escalation steps are required:\n" : "Practice decisioning on real-world scenarios to build confidence."}${
          module.practiceScenarios?.slice(0, 3).map((scenario) => `- ${scenario.title}: ${scenario.scenario || scenario.situation || scenario.context || scenario.challenge || ""}`).join("\n") || ""
        }`,
        visual: buildGeneratedVisual("scenario_illustration", module, 0),
      },
    },
    {
      title: "Governance, Evidence, and MI",
      content: {
        learningPoint: "Governance turns compliance into a repeatable, auditable program.",
        mainContent: `Governance requires clear ownership, evidence trails, and regular management information.\n\nEvidence focus:\n${quickReferenceItems.length ? quickReferenceItems.map((item) => `- ${item}`).join("\n") : "- Document decisions and approvals\n- Monitor outcomes and trends\n- Review and improve controls regularly"}`,
        keyConcepts: takeaways.slice(0, 4),
        visual: buildGeneratedVisual("infographic", module, 3),
      },
    },
  ];

  return baseLessons.slice(0, count);
};

const mergeLessonsIntoSessions = (lessons: NonNullable<TrainingModuleLike["lessons"]>, targetCount: number) => {
  const grouped: Array<NonNullable<TrainingModuleLike["lessons"]>> = [];
  const baseSize = Math.floor(lessons.length / targetCount);
  const remainder = lessons.length % targetCount;
  let cursor = 0;
  for (let i = 0; i < targetCount; i += 1) {
    const size = baseSize + (i < remainder ? 1 : 0);
    const group = lessons.slice(cursor, cursor + size);
    grouped.push(group);
    cursor += size;
  }

  return grouped.map((group, index) => {
    const combinedContent = group
      .map((lesson) => {
        const text = getLessonContentText(lesson.content);
        return `### ${lesson.title}\n\n${text}`;
      })
      .join("\n\n");
    const combinedKeyConcepts = flattenKeyConcepts(group).slice(0, 8);
    const combinedExamples = flattenRealExamples(group).slice(0, 6);
    const visualFromGroup = group.find((lesson) => typeof lesson.content === "object" && lesson.content.visual)?.content as { visual?: Record<string, unknown> };

    return {
      id: `session-${index + 1}`,
      title: `${DEFAULT_SESSION_TITLES[index] || `Session ${index + 1}`}`,
      type: "content",
      duration: Math.max(4, Math.round(group.reduce((sum, lesson) => sum + (lesson.duration || 0), 0))),
      content: {
        mainContent: combinedContent,
        keyConcepts: combinedKeyConcepts,
        realExamples: combinedExamples,
        visual: visualFromGroup?.visual,
      },
    };
  });
};

const normalizeLessons = (module: TrainingModuleLike) => {
  const lessons = Array.isArray(module.lessons) ? module.lessons.filter(Boolean) : [];

  if (lessons.length === 5) return lessons;

  if (lessons.length > 5) {
    return mergeLessonsIntoSessions(lessons, 5);
  }

  if (lessons.length === 0) {
    return buildSupplementLessons(module, 5).map((lesson, index) => ({
      id: `session-${index + 1}`,
      title: lesson.title,
      type: "content",
      duration: 5,
      content: lesson.content,
    }));
  }

  const missingCount = 5 - lessons.length;
  const supplements = buildSupplementLessons(module, missingCount).map((lesson, index) => ({
    id: `session-${lessons.length + index + 1}`,
    title: lesson.title,
    type: "content",
    duration: 5,
    content: lesson.content,
  }));

  return [...lessons, ...supplements];
};

const buildAssessmentQuestions = (module: TrainingModuleLike) => {
  const outcomes = module.learningOutcomes || [];
  const takeaways = module.summary?.keyTakeaways || [];
  const nextSteps = module.summary?.nextSteps || [];
  const primaryStatement = takeaways[0] || outcomes[0] || module.description || `${module.title} requires clear controls and evidence.`;

  const baseQuestions = [
    {
      question: `Which statement best reflects the objective of ${module.title}?`,
      correct: primaryStatement,
      explanation: "This aligns with the module's core objective and expected outcomes.",
    },
    {
      question: `When should you escalate concerns in ${module.title}?`,
      correct: "When risk indicators persist or evidence is insufficient to support a decision.",
      explanation: "Escalation is required when risk cannot be resolved or evidenced at the current level.",
    },
    {
      question: "Which action best supports audit readiness?",
      correct: "Documenting decisions, approvals, and evidence at each step.",
      explanation: "Audit readiness depends on clear evidence trails and documented decisions.",
    },
    {
      question: "Which practice best supports good customer or stakeholder outcomes?",
      correct: "Monitoring outcomes, identifying issues early, and remediating quickly.",
      explanation: "Outcome monitoring ensures issues are detected and addressed quickly.",
    },
    {
      question: "What should happen before implementing controls?",
      correct: nextSteps[0] || "Define scope, ownership, and the risk-based approach.",
      explanation: "Controls should be applied after scope and accountability are clear.",
    },
  ];

  const distractors = [
    "Skip documentation if the transaction appears low risk.",
    "Wait for external audits before acting on potential issues.",
    "Rely on informal approvals without evidence trails.",
    "Delay escalation until the next quarterly review.",
  ];

  return baseQuestions.map((item, index) => ({
    id: `${module.id}-assessment-${index + 1}`,
    question: item.question,
    options: [item.correct, ...distractors.slice(0, 3)],
    correctAnswer: 0,
    explanation: item.explanation,
  }));
};

const normalizeAssessmentQuestions = (module: TrainingModuleLike) => {
  const existing = Array.isArray(module.assessmentQuestions) ? module.assessmentQuestions.filter(Boolean) : [];
  if (existing.length >= 5) return existing;

  const generated = buildAssessmentQuestions(module);
  const needed = 5 - existing.length;
  return [...existing, ...generated.slice(0, needed)];
};

const normalizePracticeScenarios = (module: TrainingModuleLike) => {
  const existing = Array.isArray(module.practiceScenarios) ? module.practiceScenarios.filter(Boolean) : [];
  const normalizedExisting = existing.map((scenario, index) => {
    if (scenario.options && scenario.options.length > 0) {
      return scenario;
    }

    const prompt = scenario.question
      || scenario.questions?.[0]
      || scenario.challenge
      || scenario.scenario
      || scenario.situation
      || scenario.context
      || scenario.description
      || "What is the most appropriate response?";

    const explanation = scenario.explanation
      || scenario.modelAnswer
      || (scenario.hints ? scenario.hints.join(" ") : undefined)
      || "Use the escalation workflow and document evidence to support the decision.";

    return {
      ...scenario,
      title: scenario.title || `Scenario ${index + 1}`,
      question: prompt,
      options: [
        { text: "Document evidence and escalate for review", isCorrect: true },
        { text: "Proceed without recording the decision", isCorrect: false },
        { text: "Delay action until more issues arise", isCorrect: false },
      ],
      correctAnswer: 0,
      explanation,
    };
  });

  if (normalizedExisting.length >= 2) return normalizedExisting;

  const moduleTitle = module.title || "this module";
  const defaultScenarios = [
    {
      id: `${module.id}-scenario-1`,
      title: "Evidence and Documentation Gap",
      scenario: `During a ${moduleTitle} review, you notice a decision was made without supporting evidence or approvals logged in the system.`,
      question: "What is the most appropriate next step?",
      options: [
        { text: "Document the gap and escalate for review", isCorrect: true, feedback: "Escalate with evidence to protect audit readiness." },
        { text: "Assume the decision was correct and move on", isCorrect: false, feedback: "Assumptions without evidence create audit risk." },
        { text: "Wait until the next audit cycle to address it", isCorrect: false, feedback: "Delays increase risk and weaken governance." }
      ],
      explanation: "Evidence gaps should be documented and escalated to maintain audit readiness.",
      learningPoints: [
        "Documentation is critical for compliance evidence.",
        "Escalate gaps promptly to reduce regulatory risk."
      ]
    },
    {
      id: `${module.id}-scenario-2`,
      title: "Escalation Decision",
      scenario: `A potential issue arises that could impact customers or regulatory obligations within ${moduleTitle}.`,
      question: "How should you respond?",
      options: [
        { text: "Gather facts and escalate through the defined workflow", isCorrect: true, feedback: "Structured escalation protects customers and the firm." },
        { text: "Resolve informally without logging", isCorrect: false, feedback: "Unlogged actions create compliance gaps." },
        { text: "Ignore the issue until more complaints appear", isCorrect: false, feedback: "Delaying action can worsen outcomes." }
      ],
      explanation: "Structured escalation and evidence capture are required when potential issues arise.",
      learningPoints: [
        "Escalate when risks persist or outcomes could be harmed.",
        "Use defined workflows to preserve evidence."
      ]
    }
  ];

  const needed = 2 - normalizedExisting.length;
  return [...normalizedExisting, ...defaultScenarios.slice(0, needed)];
};

export const normalizeTrainingModule = (module?: TrainingModuleLike) => {
  if (!module) return undefined;
  return {
    ...module,
    lessons: normalizeLessons(module),
    practiceScenarios: normalizePracticeScenarios(module),
    assessmentQuestions: normalizeAssessmentQuestions(module),
  };
};
