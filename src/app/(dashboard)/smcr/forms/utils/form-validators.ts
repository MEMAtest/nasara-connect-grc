// Input validation helpers
export const validators = {
  email: (value: string): boolean => {
    if (!value) return true; // Allow empty
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },
  phone: (value: string): boolean => {
    if (!value) return true;
    return /^[\d\s+()-]{7,20}$/.test(value);
  },
  postcode: (value: string): boolean => {
    if (!value) return true;
    // UK postcode pattern (flexible)
    return /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(value.trim());
  },
  nationalInsurance: (value: string): boolean => {
    if (!value) return true;
    // UK NI number pattern
    return /^[A-Z]{2}\d{6}[A-Z]$/i.test(value.replace(/\s/g, ''));
  },
  frn: (value: string): boolean => {
    if (!value) return true;
    // FRN is typically 6-7 digits
    return /^\d{6,7}$/.test(value.trim());
  },
  date: (value: string): boolean => {
    if (!value) return true;
    const date = new Date(value);
    return !isNaN(date.getTime());
  },
  dateOfBirth: (value: string): boolean => {
    if (!value) return true;
    const date = new Date(value);
    if (isNaN(date.getTime())) return false;
    const today = new Date();
    const minAge = 18;
    const maxAge = 100;
    const age = (today.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return age >= minAge && age <= maxAge;
  },
  futureDate: (value: string): boolean => {
    if (!value) return true;
    const date = new Date(value);
    if (isNaN(date.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  },
};

// Validation error messages
export const validationMessages: Record<string, string> = {
  email: "Please enter a valid email address (e.g., name@company.com)",
  phone: "Please enter a valid phone number",
  postcode: "Please enter a valid UK postcode (e.g., SW1A 1AA)",
  nationalInsurance: "Please enter a valid NI number (e.g., AB123456C)",
  frn: "Please enter a valid 6-7 digit FRN",
  date: "Please enter a valid date",
  dateOfBirth: "Candidate must be between 18-100 years old",
  futureDate: "Date must be today or in the future",
};

export type ValidatorKey = keyof typeof validators;
