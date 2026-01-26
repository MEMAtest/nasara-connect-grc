/**
 * Test data fixtures for SMCR Forms E2E tests
 */

export const validFormData = {
  // Section 1: Firm Details
  firmName: "Test Financial Services Ltd",
  firmFRN: "123456",
  firmAddress: "123 Test Street\nLondon\nEC1A 1AA",
  submitterName: "John Smith",
  submitterEmail: "john.smith@testfs.com",
  submitterPhone: "020 7123 4567",
  submitterPosition: "Compliance Officer",

  // Section 2: Personal Details
  title: "Mr",
  surname: "Johnson",
  forenames: "David Michael",
  previousNames: "Davies (birth name)",
  dateOfBirth: "1980-05-15", // 44 years old - valid
  townOfBirth: "Manchester",
  countryOfBirth: "United Kingdom",
  nationality: "British",
  nationalInsurance: "AB123456C",

  // Section 3: Contact Details
  homeAddress: "45 Residential Lane\nLondon",
  homePostcode: "SW1A 1AA",
  homeCountry: "United Kingdom",
  correspondenceAddress: "",
  personalEmail: "david.johnson@email.com",
  personalPhone: "07700 900123",
  workEmail: "d.johnson@testfs.com",
  workPhone: "020 7123 4568",

  // Section 4: Function Details
  functionApplied: "SMF16 - Compliance Oversight",
  effectiveDate: "", // Will be set dynamically to future date
  jobTitle: "Head of Compliance",
  arrangementType: "employed",
  timeCommitment: "full-time",
  hoursPerWeek: "40",
  reportingTo: "Chief Executive Officer",
  directReports: "5",

  // Employment History
  employment: {
    employer: "Previous Finance Co",
    jobTitle: "Senior Compliance Manager",
    startDate: "2015-01-01",
    endDate: "2023-12-31",
    reasonForLeaving: "Career progression",
    isRegulated: true,
    regulatorName: "FCA",
  },

  // Section 12: Responsibilities
  sorResponsibilities: `• Overall responsibility for the firm's compliance function
• Management of the compliance team (5 direct reports)
• Reporting to the Board on regulatory matters
• Oversight of regulatory change implementation
• Primary contact with the FCA`,

  // Section 13: Competency
  relevantExperience: `15 years in financial services compliance:
• 8 years at Previous Finance Co as Senior Compliance Manager
• 4 years at Major Bank plc as Compliance Analyst
• 3 years at Regulatory Consultants Ltd`,
  qualifications: `• BSc Economics, University of Manchester (2002)
• CFA Level III (2010)
• CISI Diploma in Investment Compliance (2012)`,
  trainingPlanned: `• Firm induction programme (2 weeks)
• SM&CR refresher training
• Annual compliance CPD programme`,

  // Section 14: Declarations
  candidateSignature: "David Michael Johnson",
  firmSignature: "John Smith",
};

export const invalidDates = {
  underAge: "2010-01-01", // Under 18
  overAge: "1920-01-01", // Over 100
  pastDate: "2020-01-01", // Past date for effective date
};

export const validationTestData = {
  invalidEmail: "not-an-email",
  invalidPostcode: "12345",
  invalidNI: "INVALID",
  invalidFRN: "12345678", // 8 digits - invalid
  invalidPhone: "abc",
};

export const xssPayloads = {
  scriptTag: '<script>alert("XSS")</script>',
  eventHandler: '<img src="x" onerror="alert(\'XSS\')">',
  encodedScript: "&lt;script&gt;alert('XSS')&lt;/script&gt;",
};

export const specialCharacterSurnames = {
  apostrophe: "O'Brien",
  hyphen: "Smith-Jones",
  accent: "D'Angelo",
  veryLong: "A".repeat(60), // Over 50 char limit
  specialChars: 'Test<>:"/\\|?*Name',
};

/**
 * Get a future date string for effective date testing
 */
export function getFutureDate(daysFromNow: number = 30): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split("T")[0];
}

/**
 * Get today's date string
 */
export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get a past date string
 */
export function getPastDate(daysAgo: number = 30): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
}

/**
 * Get a birth date for a specific age
 */
export function getBirthDateForAge(age: number): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - age);
  return date.toISOString().split("T")[0];
}
