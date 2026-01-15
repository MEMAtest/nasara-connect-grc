import { LetterTemplateType } from "@/lib/database";

export interface LetterTemplate {
  id: LetterTemplateType;
  name: string;
  description: string;
  category: "acknowledgement" | "holding" | "resolution" | "other";
  includesFOSInfo: boolean;
  includesOmbudsmanLeaflet: boolean;
  subject: string;
  content: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  source: "complaint" | "organization" | "user_input";
  required: boolean;
  placeholder?: string;
}

// Template variables that can be substituted
export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  // Complaint variables
  { key: "complainant_name", label: "Complainant Name", source: "complaint", required: true },
  { key: "complainant_salutation", label: "Salutation", source: "user_input", required: false, placeholder: "Mr/Mrs/Ms" },
  { key: "complaint_reference", label: "Complaint Reference", source: "complaint", required: true },
  { key: "received_date", label: "Received Date", source: "complaint", required: true },
  { key: "contact_method", label: "Contact Method", source: "complaint", required: false },
  { key: "product_type", label: "Product Type", source: "complaint", required: false },
  { key: "complaint_details", label: "Complaint Details", source: "user_input", required: false },
  { key: "investigation_findings", label: "Investigation Findings", source: "user_input", required: false },
  { key: "remedial_action", label: "Remedial Action", source: "user_input", required: false },

  // Organization variables
  { key: "firm_name", label: "Firm Name", source: "organization", required: true },
  { key: "firm_address", label: "Firm Address", source: "organization", required: true },
  { key: "firm_phone", label: "Firm Phone", source: "organization", required: true },

  // User input variables
  { key: "contact_name", label: "Contact Name", source: "user_input", required: true },
  { key: "contact_title", label: "Contact Title", source: "user_input", required: true },
  { key: "current_date", label: "Current Date", source: "complaint", required: true },

  // Third party redirect variables
  { key: "third_party_name", label: "Third Party Firm Name", source: "user_input", required: false },
  { key: "third_party_address", label: "Third Party Address", source: "user_input", required: false },
  { key: "third_party_contact", label: "Third Party Contact", source: "user_input", required: false },
];

// FOS Information block (included in most letters)
const FOS_INFO_BLOCK = `
The Financial Ombudsman Service

The role of the FOS is to help settle individual disputes between consumers and businesses providing financial services in the UK. If you contact the FOS before you have received your final response letter from us, or before the eight weeks have passed since you initially raised your concerns with us, the FOS will refer you back to {{firm_name}} to resolve your complaint.

The full contact details for the Financial Ombudsman Service are detailed below:

Write to: Financial Ombudsman Service, Exchange Tower, London, E14 9SR
Phone: 0800 0 234 567 (free from landlines) or 0300 123 9 123 (charged at a national rate)
Email: complaint.info@financial-ombudsman.org.uk
Website: www.financial-ombudsman.org.uk
`;

// Our Commitment section for acknowledgement letters
const COMMITMENT_SECTION = `
Our Commitment to Handling Complaints

We know that sometimes things go wrong and we really value your feedback. Letting us know when you are not happy with our people, products or services provides us with the opportunity to put the situation right as quickly as possible and helps us to improve our service for all our customers.

Our promise is to:
- Treat your complaint fairly.
- Try to resolve complaints when you first contact us.
- If we cannot resolve your complaint straight away, we will send you a response in writing.
- Keep you informed of our progress.
- Learn from our mistakes to make things better.

What happens next?

We will handle your complaint as quickly and thoroughly as possible. If we cannot resolve your complaint immediately, we promise to keep you informed of our progress until your complaint has been resolved. We will aim to resolve your complaint within a maximum timescale of eight weeks - however if we have not been able to resolve your complaint within four weeks, we'll write to you and let you know why.

Should you have any further concerns or information relating to your complaint, please use the contact details provided on the letter to contact us directly, either by phone or letter, so that we can fully address your complaint.

Not satisfied with our response?

We are committed to ensuring all complaints are fully and fairly addressed and we work hard to ensure our customer outcomes are appropriate and fair. Should you remain dissatisfied after you have been provided with our final response, or if eight weeks have passed since you first raised the matter with us, you may have the option to refer the matter to the Financial Ombudsman Service.

${FOS_INFO_BLOCK}
`;

// Letter Templates
export const LETTER_TEMPLATES: Record<LetterTemplateType, LetterTemplate> = {
  acknowledgement: {
    id: "acknowledgement",
    name: "Acknowledgement Letter",
    description: "Confirms receipt of complaint and explains FCA timelines",
    category: "acknowledgement",
    includesFOSInfo: true,
    includesOmbudsmanLeaflet: false,
    subject: "We've received your complaint",
    content: `{{firm_name}}
{{firm_address}}
Phone number: {{firm_phone}}

{{complainant_salutation}} {{complainant_name}}
{{complainant_address}}

Date: {{current_date}}
Ref: {{complaint_reference}}

We've received your complaint

Dear {{complainant_name}},

Thank you for your complaint {{contact_method}} which was received on {{received_date}}. I am sorry to learn of your dissatisfaction with our service at {{firm_name}}.

We're here to help

Your concerns have been logged and will be investigated by a case handler and the outcome will be sent to you in writing. Please be aware that it may be necessary for the assigned case handler to contact you if further information is needed regarding your complaint.

Next Steps

Under the rules of the Financial Conduct Authority we are required to handle your complaint within set procedures and timescales. I have included details of these overleaf. Please accept my apologies for the inconvenience you have been caused. We value the loyalty of all our customers and appreciate the opportunity to put this right for you and future customers.

Yours sincerely,

{{contact_name}}
{{contact_title}}

Enc. 'Our Commitment to Handling Complaints'

---

${COMMITMENT_SECTION}
`,
  },

  forward_third_party: {
    id: "forward_third_party",
    name: "Forward to Third Party Letter",
    description: "Redirects complaint to the correct firm",
    category: "other",
    includesFOSInfo: true,
    includesOmbudsmanLeaflet: true,
    subject: "We're redirecting your complaint...",
    content: `{{firm_name}}
{{firm_address}}
Phone number: {{firm_phone}}

{{complainant_salutation}} {{complainant_name}}
{{complainant_address}}

Date: {{current_date}}
Ref: {{complaint_reference}}

We're redirecting your complaint...

Dear {{complainant_name}},

Thank you for your complaint {{contact_method}} which was received on {{received_date}}. I am writing to you with an important update on your complaint.

We're here to help

I've conducted an initial review of your complaint and I can see that the correct company that needs to investigate this is {{third_party_name}}, as it is responsible for looking into the concerns you've raised.

Your complaint is being sent to...

I have today arranged for your complaint to be sent to {{third_party_name}}, because it relates to a product you purchased in a branch of {{third_party_name}}.

{{third_party_name}} will be in touch with you shortly in relation to your complaint, as it has the right specialist team who will thoroughly investigate your concerns. However, if you wish to contact the firm in the meantime about your complaint or to give it further information, then here are the details you require:

{{third_party_name}}
{{third_party_address}}
{{third_party_contact}}

Next Steps

If you do not feel my response has fully explained what's happening, there is a further escalation process available to you.

You have the right to refer your complaint to the Financial Ombudsman Service, free of charge - but you must do so within six months of the date of this letter. If you do not refer your complaint in time, the Ombudsman will not have our permission to consider your complaint and so will only be able to do so in very limited circumstances - for example, if the Ombudsman believes that the delay was as a result of exceptional circumstances.

${FOS_INFO_BLOCK}

Please note that {{third_party_name}} will need to provide you with a final response letter concerning your complaint, before the Financial Ombudsman Service will be able to look at this for you in detail.

Yours sincerely,

{{contact_name}}
{{contact_title}}

Enc. 'your complaint and the ombudsman' leaflet
`,
  },

  four_week_holding: {
    id: "four_week_holding",
    name: "Four Week Holding Letter",
    description: "Progress update sent after 4 weeks of investigation",
    category: "holding",
    includesFOSInfo: false,
    includesOmbudsmanLeaflet: false,
    subject: "We're still investigating your complaint",
    content: `{{firm_name}}
{{firm_address}}
Phone number: {{firm_phone}}

{{complainant_salutation}} {{complainant_name}}
{{complainant_address}}

Date: {{current_date}}
Ref: {{complaint_reference}}

We're still investigating your complaint

Dear {{complainant_name}},

Thank you for your complaint {{contact_method}} which was received on {{received_date}}. I am writing to you with an update on your complaint.

We're gathering the information

Your concerns are being thoroughly investigated by one of our complaint handlers. We need to make sure we have all the relevant information before we can make a fair decision and write to you with our final response. I hope you can appreciate that sometimes it takes time to gather all of this information and I would like to take this opportunity to thank you for your patience in the meantime.

Next Steps

We will aim to resolve your complaint within the next four weeks and if we require any further information from you, we'll be sure to get in touch. If we are unable to resolve your complaint by then, we'll write to you and tell you why. We'll also tell you about your right to take your complaint to the Financial Ombudsman Service if eight weeks have elapsed before we resolve your complaint, but we hope to have this matter resolved for you before then.

Yours sincerely,

{{contact_name}}
{{contact_title}}
`,
  },

  eight_week_holding: {
    id: "eight_week_holding",
    name: "Eight Week Holding Letter",
    description: "Extended timeline notice with FOS rights information",
    category: "holding",
    includesFOSInfo: true,
    includesOmbudsmanLeaflet: true,
    subject: "We're still investigating your complaint - your rights",
    content: `{{firm_name}}
{{firm_address}}
Phone number: {{firm_phone}}

{{complainant_salutation}} {{complainant_name}}
{{complainant_address}}

Date: {{current_date}}
Ref: {{complaint_reference}}

We're still investigating your complaint - your rights

Dear {{complainant_name}},

Thank you for your complaint {{contact_method}} which was received on {{received_date}}. I am writing to you with a further important update on your complaint.

We're finalising the information

Your concerns are in the final stages of being thoroughly investigated by one of our complaint handlers. We deal with all complaints in a strict date received order and due to a higher than expected number of customer enquiries it's taking us a bit longer to address your concerns fully. I'm very sorry this is taking longer than we would have hoped, which is due to our commitment to ensure we reach a fair outcome for you.

Next Steps

We would normally have provided you with a final response to your complaint by now, but as we still need more time to investigate your complaint I must tell you about the rights you now have concerning this matter. Rest assured we are still investigating your complaint.

You have the right to refer your complaint to the Financial Ombudsman Service, free of charge - but you must do so within six months of the date of this letter. If you do not refer your complaint in time, the Ombudsman will not have our permission to consider your complaint and so will only be able to do so in very limited circumstances. For example, if the Ombudsman believes that the delay was as a result of exceptional circumstances.

${FOS_INFO_BLOCK}

Yours sincerely,

{{contact_name}}
{{contact_title}}

Enc. 'your complaint and the ombudsman' leaflet
`,
  },

  complaint_upheld: {
    id: "complaint_upheld",
    name: "Complaint Upheld Letter",
    description: "Final response when complaint is upheld in customer's favour",
    category: "resolution",
    includesFOSInfo: true,
    includesOmbudsmanLeaflet: true,
    subject: "We've investigated your complaint",
    content: `{{firm_name}}
{{firm_address}}
Phone number: {{firm_phone}}

{{complainant_salutation}} {{complainant_name}}
{{complainant_address}}

Date: {{current_date}}
Ref: {{complaint_reference}}

We've investigated your complaint

Dear {{complainant_name}},

Thank you for taking the time to contact us about your {{product_type}}. Firstly I want to apologise for the trouble we've caused you. We want to do the best for our customers and I'm sorry on this occasion we've let you down. I'm sure in the future you'll receive a level of service more in keeping with your high expectations of us.

I have now reviewed your {{contact_method}} of {{received_date}} and I am writing to fully explain the outcome of our investigation.

Your complaint details

{{complaint_details}}

My decision and findings

Your complaint has been thoroughly investigated and I am pleased to say the decision has been made to uphold the complaint in your favour.

{{investigation_findings}}

It's clear on this occasion we've failed to take sufficient care when completing our administrative procedures and this has led to the situation you've described. I certainly understand your frustration in this matter and would like to offer my apologies for the inconvenience we have caused you.

{{remedial_action}}

As part of our ongoing commitment to put things right for our customers and deliver great customer service, we review all complaints to learn from our mistakes. We work hard to provide additional training to any of our people who have made a mistake. As a result, we've made a number of changes to our services and processes as a direct result of customer feedback such as yours. I'd therefore like to thank you for bringing this matter to our attention.

Your options now

I believe I have now addressed your areas of concern and you can regard this letter as our final response. If you do not feel my response has resolved your complaint, there is a further escalation process available to you.

You have the right to refer your complaint to the Financial Ombudsman Service, free of charge - but you must do so within six months of the date of this letter. If you do not refer your complaint in time, the Ombudsman will not have our permission to consider your complaint and so will only be able to do so in very limited circumstances. For example, if the Ombudsman believes that the delay was as a result of exceptional circumstances.

${FOS_INFO_BLOCK}

Yours sincerely,

{{contact_name}}
{{contact_title}}

Enc. 'your complaint and the ombudsman' leaflet
`,
  },

  complaint_rejected: {
    id: "complaint_rejected",
    name: "Complaint Rejected Letter",
    description: "Final response when complaint is not upheld",
    category: "resolution",
    includesFOSInfo: true,
    includesOmbudsmanLeaflet: true,
    subject: "We've investigated your complaint",
    content: `{{firm_name}}
{{firm_address}}
Phone number: {{firm_phone}}

{{complainant_salutation}} {{complainant_name}}
{{complainant_address}}

Date: {{current_date}}
Ref: {{complaint_reference}}

We've investigated your complaint

Dear {{complainant_name}},

Thank you for taking the time to contact us about your {{product_type}}. Firstly I am sorry to hear you've had cause to complain as we always want to do the best for our customers.

I have now reviewed your {{contact_method}} of {{received_date}} and I am writing to fully explain the outcome of our investigation.

Your complaint details

{{complaint_details}}

My decision and findings

Your complaint has been thoroughly investigated and I'm afraid I'm unable to uphold the complaint in your favour on this occasion.

{{investigation_findings}}

I appreciate this isn't the outcome you were hoping for; however, I trust my review of your complaint and thorough explanation of what's happened shows why I've come to this decision.

Your options now

I believe I have now addressed your areas of concern and you can regard this letter as our final response. If you do not feel my letter has resolved your complaint, there is a further escalation process available to you.

You have the right to refer your complaint to the Financial Ombudsman Service, free of charge - but you must do so within six months of the date of this letter. If you do not refer your complaint in time, the Ombudsman will not have our permission to consider your complaint and so will only be able to do so in very limited circumstances - for example, if the Ombudsman believes that the delay was as a result of exceptional circumstances.

${FOS_INFO_BLOCK}

Yours sincerely,

{{contact_name}}
{{contact_title}}

Enc. 'your complaint and the ombudsman' leaflet
`,
  },

  general_contact: {
    id: "general_contact",
    name: "General Contact Letter",
    description: "Flexible template for general correspondence",
    category: "other",
    includesFOSInfo: true,
    includesOmbudsmanLeaflet: true,
    subject: "Regarding your complaint",
    content: `{{firm_name}}
{{firm_address}}
Phone number: {{firm_phone}}

{{complainant_salutation}} {{complainant_name}}
{{complainant_address}}

Date: {{current_date}}
Ref: {{complaint_reference}}

Regarding your complaint

Dear {{complainant_name}},

Thank you for taking the time to contact us about your {{product_type}}. I am writing to provide you with an update on your complaint.

I have now reviewed your {{contact_method}} of {{received_date}} and I am writing to fully explain our findings.

Your complaint details

{{complaint_details}}

Our findings

{{investigation_findings}}

{{remedial_action}}

Your options

If you have any questions about this letter or would like to discuss your complaint further, please do not hesitate to contact us using the details at the top of this letter.

If you remain dissatisfied, you have the right to refer your complaint to the Financial Ombudsman Service, free of charge - but you must do so within six months of the date of this letter. If you do not refer your complaint in time, the Ombudsman will not have our permission to consider your complaint and so will only be able to do so in very limited circumstances.

${FOS_INFO_BLOCK}

Yours sincerely,

{{contact_name}}
{{contact_title}}

Enc. 'your complaint and the ombudsman' leaflet
`,
  },
};

// Helper function to get template by ID
export function getLetterTemplate(templateId: LetterTemplateType): LetterTemplate | null {
  return LETTER_TEMPLATES[templateId] || null;
}

// Helper function to get all templates
export function getAllLetterTemplates(): LetterTemplate[] {
  return Object.values(LETTER_TEMPLATES);
}

// Helper function to get templates by category
export function getLetterTemplatesByCategory(
  category: LetterTemplate["category"]
): LetterTemplate[] {
  return Object.values(LETTER_TEMPLATES).filter((t) => t.category === category);
}

// Interface for organization settings
export interface OrganizationSettings {
  companyName: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
}

// Helper function to substitute variables in template content
export function renderLetterContent(
  template: LetterTemplate,
  variables: Record<string, string | undefined>
): string {
  let content = template.content;

  // Replace all template variables using string split/join (safer than regex)
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    // Use split/join for safe global replacement without regex
    content = content.split(placeholder).join(value || "");
  }

  // Clean up any remaining unset placeholders
  content = content.replace(/\{\{[^}]+\}\}/g, "");

  return content;
}

// Format date for letters (e.g., "15 January 2024")
export function formatLetterDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Format contact method for display
export function formatContactMethod(method?: string): string {
  if (!method) return "";

  const methodMap: Record<string, string> = {
    phone: "call",
    email: "email",
    letter: "letter",
    online: "you posted online",
    in_person: "in-person visit",
  };

  return methodMap[method] || method;
}
