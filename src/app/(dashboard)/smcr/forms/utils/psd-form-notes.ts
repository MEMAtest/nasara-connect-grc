// Structured PSD Form Notes content matching official FCA guidance

export interface PSDFormNote {
  section: string;
  title: string;
  notes: string[];
}

export const psdFormNotes: PSDFormNote[] = [
  {
    section: "1",
    title: "Personal Identification Details",
    notes: [
      "If the individual has an existing FCA Individual Reference Number (IRN), provide it at question 1.1a. You can look up IRNs on the FCA Register.",
      "Enter the individual's name exactly as it appears on their passport or official identification documents.",
      "If the individual has more than one previous name, passport number, or nationality, provide additional details in Section 6 (Supplementary Information).",
      "A full 3-year address history is required. If the individual has lived at their current address for less than 3 years, previous addresses must be provided.",
      "The National Insurance number format is: two letters, six digits, one letter (e.g., AB 12 34 56 C).",
      "A copy of the passport is not required to be attached, but should be available for production on request.",
    ],
  },
  {
    section: "2",
    title: "Firm Identification Details",
    notes: [
      "Enter the firm's Firm Reference Number (FRN) as it appears on the FCA Register. You can look up FRNs at register.fca.org.uk.",
      "The contact person should be someone the FCA can reach regarding this specific application.",
      "The contact must be authorised to discuss this application with the FCA and be available to respond to queries.",
      "If the firm is a sole trader, enter the sole trader's trading name.",
    ],
  },
  {
    section: "3",
    title: "Arrangements",
    notes: [
      "Position types: 'Director' includes executive and non-executive directors. 'Partner' applies to those in a partnership. 'Management' covers those responsible for managing the payment services business.",
      "You must attach the individual's employment contract in most cases. Where a contract is not available, a letter of appointment or offer letter is acceptable.",
      "The planned start date should be realistic. The individual must not begin performing duties until the FCA has processed the application.",
      "Key duties should describe the specific payment services activities the individual will be responsible for managing.",
    ],
  },
  {
    section: "4",
    title: "Employment History & Qualifications",
    notes: [
      "A FULL ten-year employment history is mandatory. ALL gaps must be accounted for, including periods of unemployment, education, travel, or personal reasons.",
      "For gaps, select the appropriate nature of employment (Unemployed or Full-time education) and provide details explaining the gap.",
      "Include all employment, whether in financial services or not. Part-time work, voluntary work, and self-employment all count.",
      "For regulated employers, provide the name of the regulatory body (e.g., FCA, PRA, Bank of England).",
      "The employer address should be the actual place of employment, not the head office address if different.",
      "Qualifications should include professional qualifications, degrees, and any other relevant certifications.",
      "A CV may be requested by the FCA and should be available to produce on request. It should cover education, professional experience, and qualifications.",
    ],
  },
  {
    section: "5",
    title: "Fitness and Propriety",
    notes: [
      "Give the WIDEST possible interpretation to all questions. The FCA treats non-disclosure very seriously.",
      "If in doubt, DISCLOSE. It is better to disclose something that turns out to be irrelevant than to fail to disclose something material.",
      "Include matters both in the UK and overseas.",
      "Part A (Criminal): Include spent convictions and cautions, except protected convictions/cautions under the Rehabilitation of Offenders Act 1974 (Exceptions) Order 1975. Include driving offences that resulted in a ban or conviction for uninsured driving.",
      "Part B (Civil): Include all County Court Judgments (CCJs) whether satisfied or not. Include IVAs, trust deeds, and any formal arrangements with creditors.",
      "Part C (Business): Includes any dismissal, suspension, or request to resign from ANY position - not limited to financial services roles.",
      "Part D (Regulatory): Include any refusal, revocation, or termination of authorisation by any regulatory body worldwide.",
      "A standard DBS (Disclosure and Barring Service) check should be carried out for individuals not currently approved as an SMF manager. Evidence should be available on request.",
      "If any question is answered 'Yes', full details MUST be provided in Section 6 with supporting documents.",
    ],
  },
  {
    section: "6",
    title: "Supplementary Information",
    notes: [
      "For each disclosure, provide: the question reference number, full details of the matter, relevant dates and duration, current status or outcome, and any mitigating factors.",
      "Attach supporting documents where available (court records, letters from regulatory bodies, etc.).",
      "If additional space is needed, clearly identify the question reference on each additional sheet.",
      "Use a consistent format for each disclosure to aid the FCA's review process.",
    ],
  },
  {
    section: "7",
    title: "Declarations and Signatures",
    notes: [
      "Knowingly or recklessly giving the FCA information which is false or misleading in a material particular is a CRIMINAL OFFENCE under the Payment Services Regulations 2017.",
      "The individual's signature date must not be more than 3 months before the date the form is submitted to the FCA.",
      "The firm's signatory must have authority to make the application on behalf of the applicant firm.",
      "The firm is declaring that, on the basis of due and diligent enquiry, the individual is believed to be fit and proper AND competent to fulfil the required duties.",
      "A copy of this Form should be sent to the individual at the same time as submission to the FCA.",
    ],
  },
];
