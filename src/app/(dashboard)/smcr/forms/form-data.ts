// FCA Forms data and recommendation logic

export type ActionType = "appoint" | "remove" | "update" | "transfer" | "payment-services" | "not-sure";
export type RoleType = "smf" | "cf" | "conduct" | "not-sure";

// Inline tips for forms within the platform
export const formATips = {
  title: "Form A Required",
  description: "New SMF appointments require FCA approval via Form A before the person can start.",
  tips: [
    "Submit via FCA Connect portal",
    "Include 10+ year CV and F&P assessment",
    "Allow 3 months for FCA processing",
  ],
  link: "https://connect.fca.org.uk/firms/aupo_sitelogin",
};

export const formCTips = {
  title: "Form C Required",
  description: "You must notify the FCA within 7 business days when someone ceases a controlled function.",
  tips: [
    "Submit via FCA Connect portal",
    "Include reason for leaving",
    "Document handover arrangements",
  ],
  link: "https://connect.fca.org.uk/firms/aupo_sitelogin",
};

export const formETips = {
  title: "Form E Required",
  description: "Internal transfers between controlled functions require Form E submission.",
  tips: [
    "Submit before transfer takes effect",
    "Update Statement of Responsibilities",
    "Verify competency for new role",
  ],
  link: "https://connect.fca.org.uk/firms/aupo_sitelogin",
};

export const sorTips = {
  title: "Statement of Responsibilities",
  description: "Every SMF must have a clear Statement of Responsibilities.",
  tips: [
    "Be specific about accountability areas",
    "Include all Prescribed Responsibilities",
    "Get the SMF to sign and date",
  ],
  link: "https://www.fca.org.uk/firms/senior-managers-certification-regime/solo-regulated-firms/statement-responsibilities",
};

export const certificationTips = {
  title: "Certification Requirements",
  description: "Certification functions require annual fitness & propriety assessment by your firm.",
  tips: [
    "Assess fitness & propriety before appointment",
    "Re-certify at least annually",
    "Maintain records of assessments",
  ],
  link: "https://www.fca.org.uk/firms/senior-managers-certification-regime/solo-regulated-firms/certification-regime",
};

export interface FCAForm {
  id: string;
  name: string;
  fullName: string;
  purpose: string;
  whenNeeded: string;
  fcaLink: string;
  tips: string[];
  category: "individual" | "responsibility";
}

export interface Question {
  id: string;
  title: string;
  options: {
    value: string;
    label: string;
    description?: string;
  }[];
}

export const questions: Question[] = [
  {
    id: "action",
    title: "What are you trying to do?",
    options: [
      {
        value: "appoint",
        label: "Appoint someone to a new role",
        description: "Adding a person to a controlled function",
      },
      {
        value: "remove",
        label: "Remove someone from a role",
        description: "Person is leaving or changing their controlled function",
      },
      {
        value: "update",
        label: "Update someone's details",
        description: "Changing information for an approved person",
      },
      {
        value: "transfer",
        label: "Transfer someone internally",
        description: "Moving an approved person between functions",
      },
      {
        value: "payment-services",
        label: "Register a payment services individual",
        description: "Submit a PSD Individual Form for a Payment Institution",
      },
      {
        value: "not-sure",
        label: "Not sure - help me figure it out",
        description: "I need guidance on what action to take",
      },
    ],
  },
  {
    id: "roleType",
    title: "What type of role is involved?",
    options: [
      {
        value: "smf",
        label: "Senior Manager Function (SMF)",
        description: "Key decision-makers requiring FCA approval",
      },
      {
        value: "cf",
        label: "Certification Function (CF)",
        description: "Staff requiring annual certification by the firm",
      },
      {
        value: "conduct",
        label: "Conduct Rules staff only",
        description: "Staff subject to Conduct Rules but not SMF/CF",
      },
      {
        value: "not-sure",
        label: "Not sure",
        description: "I need help identifying the role type",
      },
    ],
  },
];

export const fcaForms: FCAForm[] = [
  {
    id: "form-a",
    name: "Form A",
    fullName: "Application to perform controlled functions",
    purpose: "New SMF/CF application",
    whenNeeded: "When appointing someone to a controlled function for the first time",
    fcaLink: "https://connect.fca.org.uk/firms/aupo_sitelogin",
    tips: [
      "Complete all sections - incomplete forms will be returned",
      "Ensure the applicant has passed relevant competency assessments",
      "Include a comprehensive CV covering at least 10 years",
      "Submit fitness and propriety assessment results",
      "Allow 3 months processing time for SMF applications",
    ],
    category: "individual",
  },
  {
    id: "form-b",
    name: "Form B",
    fullName: "Withdraw an application",
    purpose: "Withdraw a pending Form A or Form E application",
    whenNeeded: "When you need to withdraw an application before FCA approval",
    fcaLink: "https://www.fca.org.uk/publication/forms/sup-10c-annex-4r-form-b-notice.pdf",
    tips: [
      "For Form A withdrawals, submit via Connect",
      "For Form E/I withdrawals, download Form B and email to your case officer",
      "Include the original application reference number",
    ],
    category: "individual",
  },
  {
    id: "form-c",
    name: "Form C",
    fullName: "Notice of ceasing to perform controlled functions",
    purpose: "Ceasing to perform controlled function",
    whenNeeded: "When someone leaves a controlled function (resignation, termination, or role change)",
    fcaLink: "https://connect.fca.org.uk/firms/aupo_sitelogin",
    tips: [
      "Submit via Connect within 7 business days of the person ceasing the function",
      "Include the reason for leaving (resignation, termination, etc.)",
      "Ensure handover arrangements are documented",
      "Update your Statement of Responsibilities accordingly",
    ],
    category: "individual",
  },
  {
    id: "form-d",
    name: "Form D",
    fullName: "Notification of changes in personal information",
    purpose: "Change in details",
    whenNeeded: "When updating information for an approved person (name, fitness & propriety, etc.)",
    fcaLink: "https://connect.fca.org.uk/firms/aupo_sitelogin",
    tips: [
      "Submit via Connect within 7 business days of becoming aware of the change",
      "Include supporting documentation where applicable",
      "Fitness & propriety changes may require additional assessment",
    ],
    category: "individual",
  },
  {
    id: "form-e",
    name: "Form E",
    fullName: "Internal transfer of an approved person",
    purpose: "Internal transfer between controlled functions",
    whenNeeded: "When moving an approved person between functions within the same firm",
    fcaLink: "https://connect.fca.org.uk/firms/aupo_sitelogin",
    tips: [
      "Submit via Connect before the transfer takes effect",
      "Ensure the person meets competency requirements for the new function",
      "Update Statement of Responsibilities for both old and new roles",
      "Consider whether additional training is needed",
    ],
    category: "individual",
  },
  {
    id: "form-j",
    name: "Form J",
    fullName: "Notification of significant changes in SMF responsibilities",
    purpose: "Significant changes to an SMF's responsibilities",
    whenNeeded: "When there are material changes to an SMF's Statement of Responsibilities",
    fcaLink: "https://connect.fca.org.uk/firms/aupo_sitelogin",
    tips: [
      "Submit via Connect when responsibilities significantly change",
      "Attach the updated Statement of Responsibilities",
      "Not required for minor administrative changes",
    ],
    category: "individual",
  },
  {
    id: "psd-individual",
    name: "PSD Individual Form",
    fullName: "Application for PSD Individual responsible for management of a Payment Institution",
    purpose: "Payment Services individual application",
    whenNeeded: "When appointing a person responsible for the management of a Payment Institution under PSR 2017",
    fcaLink: "https://connect.fca.org.uk/firms/aupo_sitelogin",
    tips: [
      "A full 10-year employment history is required with no gaps",
      "Include fitness and propriety disclosures - non-disclosure is treated very seriously",
      "Attach the individual's employment contract or letter of appointment",
      "Both the individual and the firm must sign the declarations",
      "Submit via FCA Connect as part of the Payment Institution application",
    ],
    category: "individual",
  },
  {
    id: "sor",
    name: "Statement of Responsibilities",
    fullName: "Statement of Responsibilities (SoR)",
    purpose: "Defines SMF's responsibilities",
    whenNeeded: "Every SMF appointment, change of responsibilities, or internal transfer",
    fcaLink: "https://www.fca.org.uk/firms/senior-managers-certification-regime/solo-regulated-firms/statement-responsibilities",
    tips: [
      "Must be clear and specific - avoid vague language",
      "Include all Prescribed Responsibilities allocated to the SMF",
      "Update whenever responsibilities change",
      "Ensure no gaps or overlaps with other SMFs",
      "Get the SMF to sign and date the document",
    ],
    category: "responsibility",
  },
  {
    id: "resp-map",
    name: "Responsibilities Map",
    fullName: "Management Responsibilities Map",
    purpose: "Shows allocation of responsibilities across SMFs",
    whenNeeded: "Required for Enhanced firms; recommended for Core firms",
    fcaLink: "https://www.fca.org.uk/firms/senior-managers-certification-regime/solo-regulated-firms/responsibilities-map",
    tips: [
      "Shows how responsibilities are shared and allocated",
      "Include reporting lines and governance structure",
      "Update when there are changes to senior management",
      "Ensure consistency with individual Statements of Responsibilities",
    ],
    category: "responsibility",
  },
];

export interface RecommendationResult {
  forms: FCAForm[];
  additionalNotes: string[];
}

export function getRecommendedForms(
  action: ActionType,
  roleType: RoleType
): RecommendationResult {
  const forms: FCAForm[] = [];
  const additionalNotes: string[] = [];

  // Helper to add a form by ID
  const addForm = (id: string) => {
    const form = fcaForms.find((f) => f.id === id);
    if (form && !forms.includes(form)) {
      forms.push(form);
    }
  };

  // Recommendation logic based on action and role type
  switch (action) {
    case "appoint":
      if (roleType === "smf") {
        addForm("form-a");
        addForm("sor");
        addForm("resp-map");
        additionalNotes.push(
          "SMF appointments require FCA approval before the person can start in the role."
        );
        additionalNotes.push(
          "Allow at least 3 months for FCA processing of Form A applications."
        );
      } else if (roleType === "cf") {
        addForm("form-a");
        additionalNotes.push(
          "Certification functions require annual fitness and propriety assessment by the firm."
        );
      } else if (roleType === "conduct") {
        additionalNotes.push(
          "Conduct Rules staff do not require FCA forms, but must receive Conduct Rules training."
        );
        additionalNotes.push(
          "Maintain internal records of training and acknowledgment of the Conduct Rules."
        );
      } else {
        addForm("form-a");
        addForm("sor");
        additionalNotes.push(
          "If the role is an SMF, you'll also need a Statement of Responsibilities."
        );
      }
      break;

    case "remove":
      addForm("form-c");
      if (roleType === "smf") {
        addForm("sor");
        additionalNotes.push(
          "Update or retire the Statement of Responsibilities for the departing SMF."
        );
        additionalNotes.push(
          "Consider whether a Responsibilities Map update is needed."
        );
      }
      additionalNotes.push(
        "Complete regulatory reference requirements if the person is moving to another regulated firm."
      );
      break;

    case "update":
      addForm("form-d");
      if (roleType === "smf") {
        addForm("sor");
        additionalNotes.push(
          "If responsibilities are changing, update the Statement of Responsibilities."
        );
      }
      break;

    case "transfer":
      addForm("form-e");
      if (roleType === "smf") {
        addForm("sor");
        addForm("resp-map");
        additionalNotes.push(
          "Both the old and new roles may need Statement of Responsibilities updates."
        );
      }
      additionalNotes.push(
        "Ensure competency requirements are met for the new function."
      );
      break;

    case "payment-services":
      addForm("psd-individual");
      additionalNotes.push(
        "The PSD Individual Form is used for appointing persons responsible for management of a Payment Institution."
      );
      additionalNotes.push(
        "A full 10-year employment history with no gaps is mandatory."
      );
      break;

    case "not-sure":
    default:
      // Provide general guidance
      addForm("form-a");
      addForm("form-c");
      addForm("sor");
      additionalNotes.push(
        "Form A: Use when appointing someone new to a controlled function."
      );
      additionalNotes.push(
        "Form C: Use when someone is leaving a controlled function."
      );
      additionalNotes.push(
        "Contact your compliance team or the FCA for specific guidance."
      );
      break;
  }

  return { forms, additionalNotes };
}
