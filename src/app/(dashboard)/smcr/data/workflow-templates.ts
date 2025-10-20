"use client";

export type WorkflowCategory = "onboarding" | "annual_review" | "breach_management";

export interface WorkflowTemplateStep {
  id: string;
  title: string;
  description: string;
  expectedEvidence?: string[];
  recommendedOwner?: string;
  checklist?: string[];
  form?: WorkflowFieldDefinition[];
}

export type WorkflowFieldType = "text" | "textarea" | "date" | "select" | "boolean";

export interface WorkflowFieldDefinition {
  id: string;
  label: string;
  type: WorkflowFieldType;
  required?: boolean;
  helperText?: string;
  options?: { value: string; label: string }[];
}

export interface WorkflowTemplate {
  id: string;
  title: string;
  summary: string;
  trigger: string;
  category: WorkflowCategory;
  durationDays: number;
  steps: WorkflowTemplateStep[];
  successCriteria: string[];
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "smf-onboarding",
    title: "SMF Onboarding",
    summary: "Complete onboarding process for Senior Management Function appointments.",
    trigger: "New SMF appointment confirmed",
    category: "onboarding",
    durationDays: 90,
    steps: [
      {
        id: "generate-fp-checklist",
        title: "Generate F&P checklist",
        description: "Create an individual-specific fitness & propriety checklist aligned to role requirements.",
        expectedEvidence: ["F&P checklist document"],
        recommendedOwner: "Compliance",
        checklist: [
          "Role profile mapped to SMF/CF responsibilities",
          "Prescribed responsibilities allocated and documented",
          "Dependencies on other control functions captured",
        ],
        form: [
          {
            id: "risk-rating",
            label: "Initial risk rating",
            type: "select",
            required: true,
            options: [
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "critical", label: "Critical" },
            ],
          },
          {
            id: "notes",
            label: "Key considerations",
            type: "textarea",
            helperText: "Capture any foreseeable concerns or additional evidence needed.",
          },
        ],
      },
      {
        id: "request-reg-references",
        title: "Request regulatory references",
        description: "Issue FCA-aligned regulatory reference request to previous employers covering the last 6 years.",
        expectedEvidence: ["Reference request", "Reference responses"],
        recommendedOwner: "HR",
      },
      {
        id: "schedule-criminal-check",
        title: "Schedule criminal record check",
        description: "Book a background check (DBS/Disclosure Scotland) covering unspent and relevant spent convictions.",
        expectedEvidence: ["Completed criminal record certificate"],
        recommendedOwner: "HR",
      },
      {
        id: "create-training-plan",
        title: "Create training plan",
        description: "Build an initial competence plan covering prescribed responsibilities and role-specific CPD.",
        expectedEvidence: ["Training plan document"],
        recommendedOwner: "Compliance Training",
      },
      {
        id: "draft-sor",
        title: "Draft Statement of Responsibilities",
        description: "Produce the Statement of Responsibilities and ensure prescribed responsibilities are allocated.",
        expectedEvidence: ["Statement of Responsibilities"],
        recommendedOwner: "SMF Sponsor",
        checklist: [
          "Responsibilities aligned to FCA prescribed list",
          "Duplications reviewed with Compliance",
          "Draft shared with SMF holder",
        ],
      },
    ],
    successCriteria: [
      "Statement of Responsibilities approved",
      "Background checks cleared",
      "Training plan accepted by SMF holder",
    ],
  },
  {
    id: "annual-review",
    title: "Annual F&P Review",
    summary: "Conduct annual certification or senior manager fitness & propriety review.",
    trigger: "Assessment anniversary approaching (-30 days)",
    category: "annual_review",
    durationDays: 30,
    steps: [
      {
        id: "send-attestations",
        title: "Send attestation forms",
        description: "Issue F&P and Conduct Rule attestation forms to the individual and their line manager.",
        expectedEvidence: ["Signed attestations"],
        recommendedOwner: "Compliance",
        checklist: [
          "Individual attestation issued",
          "Line manager attestation issued",
          "Reminder scheduled for outstanding responses",
        ],
      },
      {
        id: "refresh-background-checks",
        title: "Refresh background checks",
        description: "Refresh credit, criminal, and regulatory reference checks based on risk appetite.",
        expectedEvidence: ["Updated screening checks"],
        recommendedOwner: "HR",
        form: [
          {
            id: "checks-completed",
            label: "Checks completed",
            type: "textarea",
            helperText: "List checks refreshed and relevant dates.",
          },
          {
            id: "issues-identified",
            label: "Issues identified",
            type: "boolean",
            required: true,
          },
        ],
      },
      {
        id: "collate-performance-data",
        title: "Collate performance data",
        description: "Gather appraisal outputs, conduct records, and CPD logs relevant to the assessment.",
        expectedEvidence: ["Performance appraisal", "CPD log"],
        recommendedOwner: "Line Manager",
      },
      {
        id: "generate-determination",
        title: "Generate F&P determination",
        description: "Document assessment outcome including any conditions or follow-up actions required.",
        expectedEvidence: ["F&P determination record"],
        recommendedOwner: "Certification Officer",
        form: [
          {
            id: "determination",
            label: "Determination",
            type: "select",
            required: true,
            options: [
              { value: "fit", label: "Fit and Proper" },
              { value: "conditional", label: "Conditional" },
              { value: "not_fit", label: "Not Fit" },
            ],
          },
          {
            id: "conditions",
            label: "Conditions / follow-up",
            type: "textarea",
          },
        ],
      },
      {
        id: "update-reg-systems",
        title: "Update regulatory systems",
        description: "Update FCA directory and internal registers; prepare annual SMCR return entries.",
        expectedEvidence: ["Regulatory update confirmation"],
        recommendedOwner: "Compliance",
      },
    ],
    successCriteria: [
      "Attestations signed and stored",
      "Determination documented and approved",
      "Registers updated and evidence archived",
    ],
  },
  {
    id: "breach-management",
    title: "Conduct Breach Management",
    summary: "Coordinate response to a logged conduct rule breach.",
    trigger: "New conduct breach logged",
    category: "breach_management",
    durationDays: 14,
    steps: [
      {
        id: "assess-severity",
        title: "Assess severity",
        description: "Determine severity category and whether SMF notification is required.",
        expectedEvidence: ["Severity assessment form"],
        recommendedOwner: "Compliance Lead",
        form: [
          {
            id: "severity",
            label: "Severity",
            type: "select",
            required: true,
            options: [
              { value: "minor", label: "Minor" },
              { value: "serious", label: "Serious" },
              { value: "severe", label: "Severe" },
            ],
          },
          {
            id: "summary",
            label: "Summary of breach",
            type: "textarea",
            required: true,
          },
        ],
      },
      {
        id: "notify-smf1",
        title: "Notify SMF1 (if serious)",
        description: "Escalate to SMF1 and relevant board committees where serious or severe.",
        expectedEvidence: ["Notification record"],
        recommendedOwner: "Compliance",
      },
      {
        id: "consider-fca-notification",
        title: "Consider FCA notification",
        description: "Assess need for immediate FCA notification or inclusion in next regulatory return.",
        expectedEvidence: ["Decision log"],
        recommendedOwner: "Compliance & Legal",
      },
      {
        id: "document-remediation",
        title: "Document remedial actions",
        description: "Capture agreed remedial actions, owners, and deadlines.",
        expectedEvidence: ["Remediation plan"],
        recommendedOwner: "Line Manager",
        form: [
          {
            id: "actions",
            label: "Actions agreed",
            type: "textarea",
            required: true,
          },
          {
            id: "target-date",
            label: "Target completion date",
            type: "date",
          },
        ],
      },
      {
        id: "update-individual-record",
        title: "Update individual record",
        description: "Record breach outcome within the individual's SMCR record and notify certification team.",
        expectedEvidence: ["Updated individual record"],
        recommendedOwner: "Certification Team",
      },
    ],
    successCriteria: [
      "Severity and notification decisions documented",
      "Remediation actions assigned and tracked",
      "Individual record updated with final outcome",
    ],
  },
];

export function getWorkflowTemplate(templateId: string) {
  return workflowTemplates.find((template) => template.id === templateId);
}
