"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Info,
  AlertTriangle,
  User,
  Building,
  Briefcase,
  Shield,
  Calendar,
  HelpCircle,
  ChevronRight,
  Globe,
  Scale,
  BadgeAlert,
  Banknote,
  GraduationCap,
  Clock,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useSmcrData } from "../context/SmcrDataContext";
import { allSMFs, certificationFunctions } from "../data/core-functions";

// Helper component for field guidance
function FieldHelp({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
      <HelpCircle className="h-3 w-3 mt-0.5 flex-shrink-0 text-slate-400" />
      <span>{children}</span>
    </p>
  );
}

// Helper component for section info box
function SectionInfo({
  title,
  children,
  variant = "info"
}: {
  title: string;
  children: React.ReactNode;
  variant?: "info" | "warning" | "success";
}) {
  const styles = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };
  const icons = {
    info: <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />,
  };

  return (
    <div className={cn("rounded-lg border p-3 text-sm", styles[variant])}>
      <div className="flex items-start gap-2">
        {icons[variant]}
        <div>
          <p className="font-medium">{title}</p>
          <div className="mt-1 text-xs space-y-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

// Employment entry type
interface EmploymentEntry {
  id: string;
  employer: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  reasonForLeaving: string;
  isRegulated: boolean;
  regulatorName: string;
}

// Directorship entry type
interface DirectorshipEntry {
  id: string;
  companyName: string;
  position: string;
  appointedDate: string;
  resignedDate: string;
  isActive: boolean;
  natureOfBusiness: string;
}

// Form A comprehensive state
interface FormAState {
  // Section 1: Firm Reference
  firmName: string;
  firmFRN: string;
  firmAddress: string;
  submitterName: string;
  submitterEmail: string;
  submitterPhone: string;
  submitterPosition: string;

  // Section 2: Candidate Personal Details
  title: string;
  surname: string;
  forenames: string;
  previousNames: string;
  dateOfBirth: string;
  townOfBirth: string;
  countryOfBirth: string;
  nationality: string;
  nationalInsurance: string;
  hasRightToWork: boolean;
  rightToWorkDetails: string;

  // Section 3: Contact Details
  homeAddress: string;
  homePostcode: string;
  homeCountry: string;
  correspondenceAddress: string;
  personalEmail: string;
  personalPhone: string;
  workEmail: string;
  workPhone: string;

  // Section 4: Function Details
  functionApplied: string;
  effectiveDate: string;
  arrangementType: string;
  jobTitle: string;
  timeCommitment: string;
  hoursPerWeek: string;
  reportingTo: string;
  directReports: string;

  // Section 5: Employment History (10 years)
  employmentHistory: EmploymentEntry[];

  // Section 6: Directorships
  directorships: DirectorshipEntry[];

  // Section 7: Fitness & Propriety - Criminal
  hasCriminalConviction: boolean;
  criminalDetails: string;
  hasPendingProsecution: boolean;
  pendingProsecutionDetails: string;

  // Section 8: Fitness & Propriety - Civil
  hasCivilProceedings: boolean;
  civilDetails: string;
  hasJudgmentAgainst: boolean;
  judgmentDetails: string;

  // Section 9: Fitness & Propriety - Regulatory
  hasRegulatoryAction: boolean;
  regulatoryActionDetails: string;
  hasRefusedAuthorisation: boolean;
  refusedAuthorisationDetails: string;
  hasSuspendedLicense: boolean;
  suspendedLicenseDetails: string;

  // Section 10: Fitness & Propriety - Business
  hasDisciplinaryAction: boolean;
  disciplinaryDetails: string;
  hasDismissed: boolean;
  dismissedDetails: string;
  hasResignedInvestigation: boolean;
  resignedInvestigationDetails: string;

  // Section 11: Fitness & Propriety - Financial
  hasBankruptcy: boolean;
  bankruptcyDetails: string;
  hasIVA: boolean;
  ivaDetails: string;
  hasCCJ: boolean;
  ccjDetails: string;
  hasCompanyInsolvency: boolean;
  companyInsolvencyDetails: string;

  // Section 12: Statement of Responsibilities (SMF only)
  sorResponsibilities: string;
  prescribedResponsibilities: string[];
  additionalResponsibilities: string;

  // Section 13: Competency
  relevantExperience: string;
  qualifications: string;
  trainingPlanned: string;

  // Section 14: Declarations
  candidateDeclaration: boolean;
  firmDeclaration: boolean;
  candidateSignature: string;
  candidateSignatureDate: string;
  firmSignature: string;
  firmSignatureDate: string;
}

// Generate unique ID with fallback for older browsers
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// HTML escape function to prevent XSS
const escapeHtml = (unsafe: string): string => {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// LocalStorage key for form persistence
const FORM_A_STORAGE_KEY = 'nasara-form-a-draft';

// Input validation helpers
const validators = {
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
};

// Validation error messages
const validationMessages = {
  email: "Please enter a valid email address (e.g., name@company.com)",
  phone: "Please enter a valid phone number",
  postcode: "Please enter a valid UK postcode (e.g., SW1A 1AA)",
  nationalInsurance: "Please enter a valid NI number (e.g., AB123456C)",
  frn: "Please enter a valid 6-7 digit FRN",
  date: "Please enter a valid date",
};

const createEmptyEmployment = (): EmploymentEntry => ({
  id: generateId(),
  employer: "",
  jobTitle: "",
  startDate: "",
  endDate: "",
  reasonForLeaving: "",
  isRegulated: false,
  regulatorName: "",
});

const createEmptyDirectorship = (): DirectorshipEntry => ({
  id: generateId(),
  companyName: "",
  position: "",
  appointedDate: "",
  resignedDate: "",
  isActive: false,
  natureOfBusiness: "",
});

const initialFormA: FormAState = {
  firmName: "",
  firmFRN: "",
  firmAddress: "",
  submitterName: "",
  submitterEmail: "",
  submitterPhone: "",
  submitterPosition: "",
  title: "",
  surname: "",
  forenames: "",
  previousNames: "",
  dateOfBirth: "",
  townOfBirth: "",
  countryOfBirth: "",
  nationality: "",
  nationalInsurance: "",
  hasRightToWork: true,
  rightToWorkDetails: "",
  homeAddress: "",
  homePostcode: "",
  homeCountry: "United Kingdom",
  correspondenceAddress: "",
  personalEmail: "",
  personalPhone: "",
  workEmail: "",
  workPhone: "",
  functionApplied: "",
  effectiveDate: "",
  arrangementType: "employed",
  jobTitle: "",
  timeCommitment: "full-time",
  hoursPerWeek: "",
  reportingTo: "",
  directReports: "",
  employmentHistory: [createEmptyEmployment()],
  directorships: [],
  hasCriminalConviction: false,
  criminalDetails: "",
  hasPendingProsecution: false,
  pendingProsecutionDetails: "",
  hasCivilProceedings: false,
  civilDetails: "",
  hasJudgmentAgainst: false,
  judgmentDetails: "",
  hasRegulatoryAction: false,
  regulatoryActionDetails: "",
  hasRefusedAuthorisation: false,
  refusedAuthorisationDetails: "",
  hasSuspendedLicense: false,
  suspendedLicenseDetails: "",
  hasDisciplinaryAction: false,
  disciplinaryDetails: "",
  hasDismissed: false,
  dismissedDetails: "",
  hasResignedInvestigation: false,
  resignedInvestigationDetails: "",
  hasBankruptcy: false,
  bankruptcyDetails: "",
  hasIVA: false,
  ivaDetails: "",
  hasCCJ: false,
  ccjDetails: "",
  hasCompanyInsolvency: false,
  companyInsolvencyDetails: "",
  sorResponsibilities: "",
  prescribedResponsibilities: [],
  additionalResponsibilities: "",
  relevantExperience: "",
  qualifications: "",
  trainingPlanned: "",
  candidateDeclaration: false,
  firmDeclaration: false,
  candidateSignature: "",
  candidateSignatureDate: "",
  firmSignature: "",
  firmSignatureDate: "",
};

const prescribedResponsibilitiesList = [
  { id: "pr-overall", label: "Overall responsibility for the firm's compliance with the FCA's and/or PRA's requirements" },
  { id: "pr-policies", label: "Responsibility for the firm's policies and procedures for countering financial crime" },
  { id: "pr-mlro", label: "Responsibility for the firm's compliance with CASS (client money and assets)" },
  { id: "pr-complaints", label: "Responsibility for the firm's complaints handling procedures" },
  { id: "pr-culture", label: "Responsibility for developing and maintaining the firm's culture" },
  { id: "pr-governance", label: "Responsibility for the firm's governance arrangements" },
  { id: "pr-risk", label: "Responsibility for the firm's risk management framework" },
  { id: "pr-conduct", label: "Responsibility for ensuring the conduct rules are embedded" },
];

export function FormGuideClient() {
  const { firms, activeFirmId, state } = useSmcrData();
  const activeFirm = firms.find((f) => f.id === activeFirmId);

  const [activeTab, setActiveTab] = useState("form-a");
  const [activeSection, setActiveSection] = useState("1");
  const [formA, setFormA] = useState<FormAState>({
    ...initialFormA,
    firmName: activeFirm?.name || "",
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);

  // Load saved form data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(FORM_A_STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData) as Partial<FormAState>;
        setFormA(prev => ({
          ...prev,
          ...parsed,
          // Always use current firm name if available
          firmName: activeFirm?.name || parsed.firmName || prev.firmName,
        }));
      }
    } catch (error) {
      console.error('Failed to load saved form data:', error);
    }
  }, [activeFirm?.name]);

  // Auto-save form data to localStorage (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        setSaveStatus('saving');
        localStorage.setItem(FORM_A_STORAGE_KEY, JSON.stringify(formA));
        setSaveStatus('saved');
        // Clear saved status after 2 seconds
        setTimeout(() => setSaveStatus(null), 2000);
      } catch (error) {
        console.error('Failed to save form data:', error);
        setSaveStatus('error');
      }
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(timeoutId);
  }, [formA]);

  // Clear saved form data
  const clearSavedForm = useCallback(() => {
    try {
      localStorage.removeItem(FORM_A_STORAGE_KEY);
      setFormA({
        ...initialFormA,
        firmName: activeFirm?.name || "",
      });
      setValidationErrors({});
    } catch (error) {
      console.error('Failed to clear saved form:', error);
    }
  }, [activeFirm?.name]);

  // Validate a specific field
  const validateField = useCallback((field: string, value: string, validatorKey?: keyof typeof validators) => {
    if (validatorKey && validators[validatorKey]) {
      const isValid = validators[validatorKey](value);
      setValidationErrors(prev => {
        if (isValid) {
          const { [field]: _, ...rest } = prev;
          return rest;
        } else {
          return { ...prev, [field]: validationMessages[validatorKey] };
        }
      });
      return isValid;
    }
    return true;
  }, []);

  // Calculate progress
  const progress = useMemo(() => {
    let filled = 0;
    let total = 0;

    // Count required fields
    const requiredFields = [
      formA.firmName, formA.firmFRN, formA.submitterName,
      formA.surname, formA.forenames, formA.dateOfBirth, formA.nationality,
      formA.homeAddress, formA.homePostcode,
      formA.functionApplied, formA.effectiveDate, formA.jobTitle,
      formA.relevantExperience,
      formA.candidateSignature, formA.candidateSignatureDate,
    ];

    requiredFields.forEach((field) => {
      total++;
      if (field && field.trim()) filled++;
    });

    // Check employment history
    total++;
    if (formA.employmentHistory.length > 0 && formA.employmentHistory[0].employer) filled++;

    // Check declarations
    total += 2;
    if (formA.candidateDeclaration) filled++;
    if (formA.firmDeclaration) filled++;

    return Math.round((filled / total) * 100);
  }, [formA]);

  const updateFormA = <K extends keyof FormAState>(field: K, value: FormAState[K]) => {
    setFormA((prev) => ({ ...prev, [field]: value }));
  };

  const addEmployment = () => {
    setFormA((prev) => ({
      ...prev,
      employmentHistory: [...prev.employmentHistory, createEmptyEmployment()],
    }));
  };

  const updateEmployment = <K extends keyof EmploymentEntry>(
    id: string,
    field: K,
    value: EmploymentEntry[K]
  ) => {
    setFormA((prev) => ({
      ...prev,
      employmentHistory: prev.employmentHistory.map((emp) =>
        emp.id === id ? { ...emp, [field]: value } : emp
      ),
    }));
  };

  const removeEmployment = (id: string) => {
    setFormA((prev) => ({
      ...prev,
      employmentHistory: prev.employmentHistory.filter((emp) => emp.id !== id),
    }));
  };

  const addDirectorship = () => {
    setFormA((prev) => ({
      ...prev,
      directorships: [...prev.directorships, createEmptyDirectorship()],
    }));
  };

  const updateDirectorship = <K extends keyof DirectorshipEntry>(
    id: string,
    field: K,
    value: DirectorshipEntry[K]
  ) => {
    setFormA((prev) => ({
      ...prev,
      directorships: prev.directorships.map((dir) =>
        dir.id === id ? { ...dir, [field]: value } : dir
      ),
    }));
  };

  const removeDirectorship = (id: string) => {
    setFormA((prev) => ({
      ...prev,
      directorships: prev.directorships.filter((dir) => dir.id !== id),
    }));
  };

  const togglePrescribedResponsibility = (id: string) => {
    setFormA((prev) => ({
      ...prev,
      prescribedResponsibilities: prev.prescribedResponsibilities.includes(id)
        ? prev.prescribedResponsibilities.filter((r) => r !== id)
        : [...prev.prescribedResponsibilities, id],
    }));
  };

  const handlePrint = () => window.print();

  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = () => {
    try {
      setExportError(null);
      const html = generateFormHTML(formA);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Form-A-${formA.surname || "Application"}-${format(new Date(), "yyyy-MM-dd")}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Delay URL revocation to ensure download completes
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Export failed:', error);
      setExportError('Failed to export form. Please try again.');
    }
  };

  const generateFormHTML = (data: FormAState) => {
    // Escape all user-provided data to prevent XSS
    const e = escapeHtml;
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>FCA Form A - ${e(data.forenames)} ${e(data.surname)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px 20px; font-size: 11px; line-height: 1.4; color: #333; }
    h1 { font-size: 18px; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 5px; }
    h2 { font-size: 13px; background: #f0f0f0; padding: 8px 12px; margin: 25px 0 15px; border-left: 4px solid #0055b8; }
    h3 { font-size: 11px; margin: 15px 0 10px; color: #0055b8; }
    .subtitle { font-size: 12px; color: #666; margin-bottom: 20px; }
    .field { margin: 8px 0; display: flex; align-items: flex-start; }
    .field label { width: 200px; font-weight: bold; flex-shrink: 0; padding-top: 2px; }
    .field .value { flex: 1; border-bottom: 1px solid #ccc; min-height: 18px; padding: 2px 4px; background: #fafafa; }
    .field .value.multi { min-height: 60px; white-space: pre-wrap; }
    .checkbox-field { margin: 6px 0; display: flex; align-items: center; gap: 8px; }
    .checkbox { width: 14px; height: 14px; border: 1px solid #333; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; }
    .checkbox.checked { background: #0055b8; color: white; }
    .section-box { border: 1px solid #ddd; padding: 15px; margin: 15px 0; background: #fafafa; }
    .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 12px; margin: 15px 0; }
    .info { background: #e7f3ff; border: 1px solid #0055b8; padding: 12px; margin: 15px 0; }
    .employment-entry, .directorship-entry { border: 1px solid #ddd; padding: 12px; margin: 10px 0; background: white; }
    .signature-box { border: 2px solid #333; padding: 20px; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 10px; color: #666; text-align: center; }
    .page-break { page-break-before: always; }
    @media print {
      body { margin: 0; padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>FCA FORM A</h1>
  <p class="subtitle">Application to perform Senior Management Functions / Controlled Functions</p>
  <p class="subtitle">Financial Conduct Authority | Prudential Regulation Authority</p>

  <div class="info">
    <strong>Application Reference:</strong> ${e(data.firmFRN)}-${format(new Date(), "yyyyMMdd")}<br>
    <strong>Generated:</strong> ${format(new Date(), "PPP 'at' p")}
  </div>

  <h2>Section 1: Firm Details</h2>
  <div class="field"><label>Firm Name:</label><span class="value">${e(data.firmName)}</span></div>
  <div class="field"><label>FRN:</label><span class="value">${e(data.firmFRN)}</span></div>
  <div class="field"><label>Firm Address:</label><span class="value">${e(data.firmAddress)}</span></div>
  <h3>Submitter Details</h3>
  <div class="field"><label>Submitter Name:</label><span class="value">${e(data.submitterName)}</span></div>
  <div class="field"><label>Position:</label><span class="value">${e(data.submitterPosition)}</span></div>
  <div class="field"><label>Email:</label><span class="value">${e(data.submitterEmail)}</span></div>
  <div class="field"><label>Phone:</label><span class="value">${e(data.submitterPhone)}</span></div>

  <h2>Section 2: Candidate Personal Details</h2>
  <div class="field"><label>Title:</label><span class="value">${e(data.title)}</span></div>
  <div class="field"><label>Surname:</label><span class="value">${e(data.surname)}</span></div>
  <div class="field"><label>Forename(s):</label><span class="value">${e(data.forenames)}</span></div>
  <div class="field"><label>Previous Names:</label><span class="value">${e(data.previousNames) || "None"}</span></div>
  <div class="field"><label>Date of Birth:</label><span class="value">${e(data.dateOfBirth)}</span></div>
  <div class="field"><label>Town of Birth:</label><span class="value">${e(data.townOfBirth)}</span></div>
  <div class="field"><label>Country of Birth:</label><span class="value">${e(data.countryOfBirth)}</span></div>
  <div class="field"><label>Nationality:</label><span class="value">${e(data.nationality)}</span></div>
  <div class="field"><label>National Insurance No:</label><span class="value">${e(data.nationalInsurance)}</span></div>
  <div class="checkbox-field"><span class="checkbox ${data.hasRightToWork ? "checked" : ""}">${data.hasRightToWork ? "✓" : ""}</span> Confirmed right to work in UK</div>
  ${data.rightToWorkDetails ? `<div class="field"><label>Right to Work Details:</label><span class="value">${e(data.rightToWorkDetails)}</span></div>` : ""}

  <h2>Section 3: Contact Details</h2>
  <div class="field"><label>Home Address:</label><span class="value">${e(data.homeAddress)}</span></div>
  <div class="field"><label>Postcode:</label><span class="value">${e(data.homePostcode)}</span></div>
  <div class="field"><label>Country:</label><span class="value">${e(data.homeCountry)}</span></div>
  ${data.correspondenceAddress ? `<div class="field"><label>Correspondence Address:</label><span class="value">${e(data.correspondenceAddress)}</span></div>` : ""}
  <div class="field"><label>Personal Email:</label><span class="value">${e(data.personalEmail)}</span></div>
  <div class="field"><label>Personal Phone:</label><span class="value">${e(data.personalPhone)}</span></div>
  <div class="field"><label>Work Email:</label><span class="value">${e(data.workEmail)}</span></div>
  <div class="field"><label>Work Phone:</label><span class="value">${e(data.workPhone)}</span></div>

  <h2>Section 4: Function Applied For</h2>
  <div class="field"><label>Controlled Function:</label><span class="value">${e(data.functionApplied)}</span></div>
  <div class="field"><label>Proposed Start Date:</label><span class="value">${e(data.effectiveDate)}</span></div>
  <div class="field"><label>Job Title:</label><span class="value">${e(data.jobTitle)}</span></div>
  <div class="field"><label>Arrangement Type:</label><span class="value">${e(data.arrangementType)}</span></div>
  <div class="field"><label>Time Commitment:</label><span class="value">${e(data.timeCommitment)}</span></div>
  <div class="field"><label>Hours per Week:</label><span class="value">${e(data.hoursPerWeek)}</span></div>
  <div class="field"><label>Reports To:</label><span class="value">${e(data.reportingTo)}</span></div>
  <div class="field"><label>Direct Reports:</label><span class="value">${e(data.directReports)}</span></div>

  <div class="page-break"></div>
  <h2>Section 5: Employment History (10 Years)</h2>
  ${data.employmentHistory.map((emp, i) => `
    <div class="employment-entry">
      <h3>Employment ${i + 1}</h3>
      <div class="field"><label>Employer:</label><span class="value">${e(emp.employer)}</span></div>
      <div class="field"><label>Job Title:</label><span class="value">${e(emp.jobTitle)}</span></div>
      <div class="field"><label>Start Date:</label><span class="value">${e(emp.startDate)}</span></div>
      <div class="field"><label>End Date:</label><span class="value">${e(emp.endDate) || "Present"}</span></div>
      <div class="field"><label>Reason for Leaving:</label><span class="value">${e(emp.reasonForLeaving)}</span></div>
      <div class="checkbox-field"><span class="checkbox ${emp.isRegulated ? "checked" : ""}">${emp.isRegulated ? "✓" : ""}</span> FCA/PRA regulated firm</div>
      ${emp.isRegulated && emp.regulatorName ? `<div class="field"><label>Regulator:</label><span class="value">${e(emp.regulatorName)}</span></div>` : ""}
    </div>
  `).join("")}

  ${data.directorships.length > 0 ? `
    <h2>Section 6: Directorships</h2>
    ${data.directorships.map((dir, i) => `
      <div class="directorship-entry">
        <h3>Directorship ${i + 1}</h3>
        <div class="field"><label>Company Name:</label><span class="value">${e(dir.companyName)}</span></div>
        <div class="field"><label>Position:</label><span class="value">${e(dir.position)}</span></div>
        <div class="field"><label>Nature of Business:</label><span class="value">${e(dir.natureOfBusiness)}</span></div>
        <div class="field"><label>Appointed:</label><span class="value">${e(dir.appointedDate)}</span></div>
        <div class="field"><label>Resigned:</label><span class="value">${e(dir.resignedDate) || "Current"}</span></div>
        <div class="checkbox-field"><span class="checkbox ${dir.isActive ? "checked" : ""}">${dir.isActive ? "✓" : ""}</span> Currently active</div>
      </div>
    `).join("")}
  ` : ""}

  <div class="page-break"></div>
  <h2>Section 7-11: Fitness & Propriety</h2>

  <h3>Criminal Matters</h3>
  <div class="checkbox-field"><span class="checkbox ${data.hasCriminalConviction ? "checked" : ""}">${data.hasCriminalConviction ? "✓" : ""}</span> Criminal conviction (including spent)</div>
  ${data.hasCriminalConviction ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.criminalDetails)}</span></div>` : ""}
  <div class="checkbox-field"><span class="checkbox ${data.hasPendingProsecution ? "checked" : ""}">${data.hasPendingProsecution ? "✓" : ""}</span> Pending prosecution or investigation</div>
  ${data.hasPendingProsecution ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.pendingProsecutionDetails)}</span></div>` : ""}

  <h3>Civil Proceedings</h3>
  <div class="checkbox-field"><span class="checkbox ${data.hasCivilProceedings ? "checked" : ""}">${data.hasCivilProceedings ? "✓" : ""}</span> Adverse findings in civil proceedings</div>
  ${data.hasCivilProceedings ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.civilDetails)}</span></div>` : ""}
  <div class="checkbox-field"><span class="checkbox ${data.hasJudgmentAgainst ? "checked" : ""}">${data.hasJudgmentAgainst ? "✓" : ""}</span> Court judgment against you</div>
  ${data.hasJudgmentAgainst ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.judgmentDetails)}</span></div>` : ""}

  <h3>Regulatory Matters</h3>
  <div class="checkbox-field"><span class="checkbox ${data.hasRegulatoryAction ? "checked" : ""}">${data.hasRegulatoryAction ? "✓" : ""}</span> Regulatory action or investigation</div>
  ${data.hasRegulatoryAction ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.regulatoryActionDetails)}</span></div>` : ""}
  <div class="checkbox-field"><span class="checkbox ${data.hasRefusedAuthorisation ? "checked" : ""}">${data.hasRefusedAuthorisation ? "✓" : ""}</span> Refused authorisation or registration</div>
  ${data.hasRefusedAuthorisation ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.refusedAuthorisationDetails)}</span></div>` : ""}
  <div class="checkbox-field"><span class="checkbox ${data.hasSuspendedLicense ? "checked" : ""}">${data.hasSuspendedLicense ? "✓" : ""}</span> Suspended license or membership</div>
  ${data.hasSuspendedLicense ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.suspendedLicenseDetails)}</span></div>` : ""}

  <h3>Employment & Disciplinary</h3>
  <div class="checkbox-field"><span class="checkbox ${data.hasDisciplinaryAction ? "checked" : ""}">${data.hasDisciplinaryAction ? "✓" : ""}</span> Subject to disciplinary action</div>
  ${data.hasDisciplinaryAction ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.disciplinaryDetails)}</span></div>` : ""}
  <div class="checkbox-field"><span class="checkbox ${data.hasDismissed ? "checked" : ""}">${data.hasDismissed ? "✓" : ""}</span> Dismissed from employment</div>
  ${data.hasDismissed ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.dismissedDetails)}</span></div>` : ""}
  <div class="checkbox-field"><span class="checkbox ${data.hasResignedInvestigation ? "checked" : ""}">${data.hasResignedInvestigation ? "✓" : ""}</span> Resigned during investigation</div>
  ${data.hasResignedInvestigation ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.resignedInvestigationDetails)}</span></div>` : ""}

  <h3>Financial Soundness</h3>
  <div class="checkbox-field"><span class="checkbox ${data.hasBankruptcy ? "checked" : ""}">${data.hasBankruptcy ? "✓" : ""}</span> Bankruptcy or sequestration</div>
  ${data.hasBankruptcy ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.bankruptcyDetails)}</span></div>` : ""}
  <div class="checkbox-field"><span class="checkbox ${data.hasIVA ? "checked" : ""}">${data.hasIVA ? "✓" : ""}</span> Individual Voluntary Arrangement (IVA)</div>
  ${data.hasIVA ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.ivaDetails)}</span></div>` : ""}
  <div class="checkbox-field"><span class="checkbox ${data.hasCCJ ? "checked" : ""}">${data.hasCCJ ? "✓" : ""}</span> County Court Judgment (CCJ)</div>
  ${data.hasCCJ ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.ccjDetails)}</span></div>` : ""}
  <div class="checkbox-field"><span class="checkbox ${data.hasCompanyInsolvency ? "checked" : ""}">${data.hasCompanyInsolvency ? "✓" : ""}</span> Director of insolvent company</div>
  ${data.hasCompanyInsolvency ? `<div class="field"><label>Details:</label><span class="value multi">${e(data.companyInsolvencyDetails)}</span></div>` : ""}

  <div class="page-break"></div>
  <h2>Section 12: Statement of Responsibilities</h2>
  <div class="field"><label>Key Responsibilities:</label><span class="value multi">${e(data.sorResponsibilities)}</span></div>
  <h3>Prescribed Responsibilities</h3>
  ${prescribedResponsibilitiesList.map((pr) => `
    <div class="checkbox-field"><span class="checkbox ${data.prescribedResponsibilities.includes(pr.id) ? "checked" : ""}">${data.prescribedResponsibilities.includes(pr.id) ? "✓" : ""}</span> ${e(pr.label)}</div>
  `).join("")}
  ${data.additionalResponsibilities ? `<div class="field"><label>Additional Responsibilities:</label><span class="value multi">${e(data.additionalResponsibilities)}</span></div>` : ""}

  <h2>Section 13: Competency</h2>
  <div class="field"><label>Relevant Experience:</label><span class="value multi">${e(data.relevantExperience)}</span></div>
  <div class="field"><label>Qualifications:</label><span class="value multi">${e(data.qualifications)}</span></div>
  <div class="field"><label>Training Planned:</label><span class="value multi">${e(data.trainingPlanned)}</span></div>

  <h2>Section 14: Declarations</h2>
  <div class="warning">
    <strong>Important Declaration</strong><br>
    By signing below, the candidate and firm confirm that all information provided is accurate and complete.
    Providing false or misleading information is a criminal offence.
  </div>

  <div class="signature-box">
    <h3>Candidate Declaration</h3>
    <div class="checkbox-field"><span class="checkbox ${data.candidateDeclaration ? "checked" : ""}">${data.candidateDeclaration ? "✓" : ""}</span> I confirm the information provided is accurate and complete</div>
    <div class="field"><label>Signature:</label><span class="value">${e(data.candidateSignature)}</span></div>
    <div class="field"><label>Date:</label><span class="value">${e(data.candidateSignatureDate)}</span></div>
  </div>

  <div class="signature-box">
    <h3>Firm Declaration</h3>
    <div class="checkbox-field"><span class="checkbox ${data.firmDeclaration ? "checked" : ""}">${data.firmDeclaration ? "✓" : ""}</span> The firm confirms it has assessed the candidate's fitness and propriety</div>
    <div class="field"><label>Signature:</label><span class="value">${e(data.firmSignature)}</span></div>
    <div class="field"><label>Date:</label><span class="value">${e(data.firmSignatureDate)}</span></div>
  </div>

  <div class="footer">
    <p>This form was generated by Nasara Connect on ${format(new Date(), "PPP")}.</p>
    <p><strong>Official submission must be made via FCA Connect:</strong> https://connect.fca.org.uk</p>
    <p>Reference: FCA Handbook SUP 10C | SM&CR Regime</p>
  </div>
</body>
</html>`;
  };

  const sections = [
    { id: "1", label: "Firm Details", icon: Building },
    { id: "2", label: "Personal Details", icon: User },
    { id: "3", label: "Contact", icon: Globe },
    { id: "4", label: "Function", icon: Briefcase },
    { id: "5", label: "Employment", icon: Clock },
    { id: "6", label: "Directorships", icon: Building },
    { id: "7", label: "Criminal", icon: BadgeAlert },
    { id: "8", label: "Civil", icon: Scale },
    { id: "9", label: "Regulatory", icon: Shield },
    { id: "10", label: "Employment Issues", icon: AlertTriangle },
    { id: "11", label: "Financial", icon: Banknote },
    { id: "12", label: "Responsibilities", icon: FileCheck },
    { id: "13", label: "Competency", icon: GraduationCap },
    { id: "14", label: "Declarations", icon: CheckCircle2 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
            <FileText className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">FCA Controller Forms</h1>
            <p className="text-slate-600 mt-1">
              Complete SM&CR forms with step-by-step guidance
            </p>
            {/* Save status indicator */}
            {saveStatus && (
              <p className={cn(
                "text-xs mt-1 flex items-center gap-1",
                saveStatus === 'saved' && "text-emerald-600",
                saveStatus === 'saving' && "text-slate-500",
                saveStatus === 'error' && "text-red-600"
              )} role="status" aria-live="polite">
                {saveStatus === 'saved' && <><CheckCircle2 className="h-3 w-3" /> Draft saved</>}
                {saveStatus === 'saving' && "Saving..."}
                {saveStatus === 'error' && "Failed to save"}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSavedForm}
            aria-label="Clear form and start over"
          >
            Clear Form
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} aria-label="Print form">
            <Printer className="h-4 w-4 mr-2" aria-hidden="true" />
            Print
          </Button>
          <Button size="sm" onClick={handleExport} aria-label="Export form as HTML">
            <Download className="h-4 w-4 mr-2" aria-hidden="true" />
            Export
          </Button>
        </div>
      </div>

      {/* Export error display */}
      {exportError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            <span>{exportError}</span>
          </div>
        </div>
      )}

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Form Completion</span>
            <span className="text-sm text-slate-500">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-slate-500 mt-2">
            Complete all required fields before submitting via FCA Connect
          </p>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <SectionInfo title="How to use this form" variant="info">
        <p>This form mirrors the official FCA Long Form A. Complete each section, then export to use as a reference when submitting via FCA Connect.</p>
        <p className="mt-1"><strong>Processing time:</strong> SMF applications take up to 3 months. Do not allow the candidate to start until approved.</p>
      </SectionInfo>

      {/* Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form-a" className="gap-2">
            <User className="h-4 w-4" />
            Form A (Long)
          </TabsTrigger>
          <TabsTrigger value="form-c" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Form C
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form-a" className="space-y-4 mt-4">
          {/* Section Navigation */}
          <nav aria-label="Form sections" className="flex flex-wrap gap-1" role="navigation">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection(section.id)}
                className="text-xs gap-1"
                aria-current={activeSection === section.id ? "true" : undefined}
                aria-label={`Section ${section.id}: ${section.label}`}
              >
                <section.icon className="h-3 w-3" aria-hidden="true" />
                <span className="hidden sm:inline">{section.label}</span>
                <span className="sm:hidden">{section.id}</span>
              </Button>
            ))}
          </nav>

          {/* Section 1: Firm Details */}
          {activeSection === "1" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-teal-600" />
                  Section 1: Firm Details
                </CardTitle>
                <CardDescription>
                  Details of the firm making the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SectionInfo title="What to enter" variant="info">
                  <p>Enter your firm's official details exactly as registered with the FCA. The FRN can be found on the FCA Register or your authorisation letter.</p>
                </SectionInfo>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firmName">Firm Name *</Label>
                    <Input
                      id="firmName"
                      value={formA.firmName}
                      onChange={(e) => updateFormA("firmName", e.target.value)}
                    />
                    <FieldHelp>Official name as shown on the FCA Register</FieldHelp>
                  </div>
                  <div>
                    <Label htmlFor="firmFRN">Firm Reference Number (FRN) *</Label>
                    <Input
                      id="firmFRN"
                      value={formA.firmFRN}
                      onChange={(e) => updateFormA("firmFRN", e.target.value)}
                      onBlur={(e) => validateField("firmFRN", e.target.value, "frn")}
                      placeholder="e.g., 123456"
                      aria-required="true"
                      aria-invalid={!!validationErrors.firmFRN}
                      aria-describedby={validationErrors.firmFRN ? "firmFRN-error" : "firmFRN-help"}
                    />
                    {validationErrors.firmFRN ? (
                      <p id="firmFRN-error" className="text-xs text-red-600 mt-1">{validationErrors.firmFRN}</p>
                    ) : (
                      <FieldHelp><span id="firmFRN-help">6-digit number from your FCA authorisation</span></FieldHelp>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="firmAddress">Registered Address *</Label>
                  <Textarea
                    id="firmAddress"
                    value={formA.firmAddress}
                    onChange={(e) => updateFormA("firmAddress", e.target.value)}
                    rows={2}
                  />
                  <FieldHelp>Full registered address including postcode</FieldHelp>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Person Submitting This Application</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="submitterName">Full Name *</Label>
                      <Input
                        id="submitterName"
                        value={formA.submitterName}
                        onChange={(e) => updateFormA("submitterName", e.target.value)}
                      />
                      <FieldHelp>Person authorised to submit FCA applications</FieldHelp>
                    </div>
                    <div>
                      <Label htmlFor="submitterPosition">Position/Title</Label>
                      <Input
                        id="submitterPosition"
                        value={formA.submitterPosition}
                        onChange={(e) => updateFormA("submitterPosition", e.target.value)}
                        placeholder="e.g., Compliance Officer"
                      />
                    </div>
                    <div>
                      <Label htmlFor="submitterEmail">Email</Label>
                      <Input
                        id="submitterEmail"
                        type="email"
                        value={formA.submitterEmail}
                        onChange={(e) => updateFormA("submitterEmail", e.target.value)}
                        onBlur={(e) => validateField("submitterEmail", e.target.value, "email")}
                        aria-invalid={!!validationErrors.submitterEmail}
                        aria-describedby={validationErrors.submitterEmail ? "submitterEmail-error" : "submitterEmail-help"}
                      />
                      {validationErrors.submitterEmail ? (
                        <p id="submitterEmail-error" className="text-xs text-red-600 mt-1">{validationErrors.submitterEmail}</p>
                      ) : (
                        <FieldHelp><span id="submitterEmail-help">FCA may use this for queries about the application</span></FieldHelp>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="submitterPhone">Phone</Label>
                      <Input
                        id="submitterPhone"
                        value={formA.submitterPhone}
                        onChange={(e) => updateFormA("submitterPhone", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setActiveSection("2")}>
                    Next: Personal Details <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 2: Personal Details */}
          {activeSection === "2" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-teal-600" />
                  Section 2: Candidate Personal Details
                </CardTitle>
                <CardDescription>
                  Personal information about the candidate being approved
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SectionInfo title="Important" variant="warning">
                  <p>Enter all names <strong>exactly as they appear on official ID</strong> (passport, driving licence). The FCA will check against government databases.</p>
                  <p className="mt-1">Include ALL previous names (maiden name, name changes, aliases) - these will be searched.</p>
                </SectionInfo>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Select value={formA.title} onValueChange={(v) => updateFormA("title", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mr">Mr</SelectItem>
                        <SelectItem value="Mrs">Mrs</SelectItem>
                        <SelectItem value="Ms">Ms</SelectItem>
                        <SelectItem value="Miss">Miss</SelectItem>
                        <SelectItem value="Dr">Dr</SelectItem>
                        <SelectItem value="Prof">Prof</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-3">
                    <Label htmlFor="surname">Surname *</Label>
                    <Input
                      id="surname"
                      value={formA.surname}
                      onChange={(e) => updateFormA("surname", e.target.value)}
                    />
                    <FieldHelp>Current legal surname as on passport</FieldHelp>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="forenames">Forename(s) *</Label>
                    <Input
                      id="forenames"
                      value={formA.forenames}
                      onChange={(e) => updateFormA("forenames", e.target.value)}
                    />
                    <FieldHelp>ALL first and middle names as on passport</FieldHelp>
                  </div>
                  <div>
                    <Label htmlFor="previousNames">Previous Names</Label>
                    <Input
                      id="previousNames"
                      value={formA.previousNames}
                      onChange={(e) => updateFormA("previousNames", e.target.value)}
                      placeholder="e.g., Smith (maiden name)"
                    />
                    <FieldHelp>Include ALL: maiden name, deed poll changes, aliases</FieldHelp>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formA.dateOfBirth}
                      onChange={(e) => updateFormA("dateOfBirth", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="townOfBirth">Town/City of Birth *</Label>
                    <Input
                      id="townOfBirth"
                      value={formA.townOfBirth}
                      onChange={(e) => updateFormA("townOfBirth", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="countryOfBirth">Country of Birth *</Label>
                    <Input
                      id="countryOfBirth"
                      value={formA.countryOfBirth}
                      onChange={(e) => updateFormA("countryOfBirth", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nationality">Nationality *</Label>
                    <Input
                      id="nationality"
                      value={formA.nationality}
                      onChange={(e) => updateFormA("nationality", e.target.value)}
                      placeholder="e.g., British"
                    />
                    <FieldHelp>If dual nationality, list both</FieldHelp>
                  </div>
                  <div>
                    <Label htmlFor="nationalInsurance">National Insurance Number</Label>
                    <Input
                      id="nationalInsurance"
                      value={formA.nationalInsurance}
                      onChange={(e) => updateFormA("nationalInsurance", e.target.value)}
                      onBlur={(e) => validateField("nationalInsurance", e.target.value, "nationalInsurance")}
                      placeholder="AB 12 34 56 C"
                      aria-invalid={!!validationErrors.nationalInsurance}
                      aria-describedby={validationErrors.nationalInsurance ? "nationalInsurance-error" : "nationalInsurance-help"}
                    />
                    {validationErrors.nationalInsurance ? (
                      <p id="nationalInsurance-error" className="text-xs text-red-600 mt-1">{validationErrors.nationalInsurance}</p>
                    ) : (
                      <FieldHelp><span id="nationalInsurance-help">UK-based candidates only. Format: AB 12 34 56 C</span></FieldHelp>
                    )}
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="hasRightToWork"
                      checked={formA.hasRightToWork}
                      onCheckedChange={(checked) => updateFormA("hasRightToWork", Boolean(checked))}
                    />
                    <div>
                      <Label htmlFor="hasRightToWork" className="font-normal cursor-pointer">
                        I confirm the candidate has the right to work in the UK
                      </Label>
                      <FieldHelp>Firm must verify and retain proof (passport, visa, share code)</FieldHelp>
                    </div>
                  </div>
                  {!formA.hasRightToWork && (
                    <div>
                      <Label htmlFor="rightToWorkDetails">Please explain:</Label>
                      <Textarea
                        id="rightToWorkDetails"
                        value={formA.rightToWorkDetails}
                        onChange={(e) => updateFormA("rightToWorkDetails", e.target.value)}
                        placeholder="Explain the candidate's work authorisation status"
                        rows={2}
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveSection("1")}>
                    Back
                  </Button>
                  <Button onClick={() => setActiveSection("3")}>
                    Next: Contact Details <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 3: Contact Details */}
          {activeSection === "3" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-teal-600" />
                  Section 3: Contact Details
                </CardTitle>
                <CardDescription>
                  Home and work contact information for the candidate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SectionInfo title="Why we need this" variant="info">
                  <p>The FCA may contact the candidate directly during the application process or afterwards. Ensure all details are accurate and up-to-date.</p>
                </SectionInfo>

                <h3 className="text-sm font-semibold text-slate-700">Home Address</h3>
                <div>
                  <Label htmlFor="homeAddress">Address *</Label>
                  <Textarea
                    id="homeAddress"
                    value={formA.homeAddress}
                    onChange={(e) => updateFormA("homeAddress", e.target.value)}
                    rows={2}
                    placeholder="House number, street, town/city"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="homePostcode">Postcode *</Label>
                    <Input
                      id="homePostcode"
                      value={formA.homePostcode}
                      onChange={(e) => updateFormA("homePostcode", e.target.value)}
                      onBlur={(e) => validateField("homePostcode", e.target.value, "postcode")}
                      placeholder="e.g., SW1A 1AA"
                      aria-required="true"
                      aria-invalid={!!validationErrors.homePostcode}
                      aria-describedby={validationErrors.homePostcode ? "homePostcode-error" : undefined}
                    />
                    {validationErrors.homePostcode && (
                      <p id="homePostcode-error" className="text-xs text-red-600 mt-1">{validationErrors.homePostcode}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="homeCountry">Country</Label>
                    <Input
                      id="homeCountry"
                      value={formA.homeCountry}
                      onChange={(e) => updateFormA("homeCountry", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="correspondenceAddress">Correspondence Address (if different)</Label>
                  <Textarea
                    id="correspondenceAddress"
                    value={formA.correspondenceAddress}
                    onChange={(e) => updateFormA("correspondenceAddress", e.target.value)}
                    rows={2}
                    placeholder="Leave blank if same as home address"
                  />
                  <FieldHelp>Only complete if the candidate prefers post sent elsewhere</FieldHelp>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Contact Numbers & Email</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="personalEmail">Personal Email</Label>
                      <Input
                        id="personalEmail"
                        type="email"
                        value={formA.personalEmail}
                        onChange={(e) => updateFormA("personalEmail", e.target.value)}
                        onBlur={(e) => validateField("personalEmail", e.target.value, "email")}
                        aria-invalid={!!validationErrors.personalEmail}
                        aria-describedby={validationErrors.personalEmail ? "personalEmail-error" : undefined}
                      />
                      {validationErrors.personalEmail && (
                        <p id="personalEmail-error" className="text-xs text-red-600 mt-1">{validationErrors.personalEmail}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="personalPhone">Personal Phone</Label>
                      <Input
                        id="personalPhone"
                        type="tel"
                        value={formA.personalPhone}
                        onChange={(e) => updateFormA("personalPhone", e.target.value)}
                        onBlur={(e) => validateField("personalPhone", e.target.value, "phone")}
                        aria-invalid={!!validationErrors.personalPhone}
                        aria-describedby={validationErrors.personalPhone ? "personalPhone-error" : undefined}
                      />
                      {validationErrors.personalPhone && (
                        <p id="personalPhone-error" className="text-xs text-red-600 mt-1">{validationErrors.personalPhone}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="workEmail">Work Email *</Label>
                      <Input
                        id="workEmail"
                        type="email"
                        value={formA.workEmail}
                        onChange={(e) => updateFormA("workEmail", e.target.value)}
                        onBlur={(e) => validateField("workEmail", e.target.value, "email")}
                        aria-invalid={!!validationErrors.workEmail}
                        aria-required="true"
                        aria-describedby={validationErrors.workEmail ? "workEmail-error" : "workEmail-help"}
                      />
                      {validationErrors.workEmail ? (
                        <p id="workEmail-error" className="text-xs text-red-600 mt-1">{validationErrors.workEmail}</p>
                      ) : (
                        <FieldHelp><span id="workEmail-help">Primary contact for FCA correspondence</span></FieldHelp>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="workPhone">Work Phone</Label>
                      <Input
                        id="workPhone"
                        type="tel"
                        value={formA.workPhone}
                        onChange={(e) => updateFormA("workPhone", e.target.value)}
                        onBlur={(e) => validateField("workPhone", e.target.value, "phone")}
                        aria-invalid={!!validationErrors.workPhone}
                        aria-describedby={validationErrors.workPhone ? "workPhone-error" : undefined}
                      />
                      {validationErrors.workPhone && (
                        <p id="workPhone-error" className="text-xs text-red-600 mt-1">{validationErrors.workPhone}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveSection("2")}>
                    Back
                  </Button>
                  <Button onClick={() => setActiveSection("4")}>
                    Next: Function Details <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 4: Function Details */}
          {activeSection === "4" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-teal-600" />
                  Section 4: Controlled Function Applied For
                </CardTitle>
                <CardDescription>
                  Details of the role and function being applied for
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SectionInfo title="Processing time" variant="warning">
                  <p><strong>SMF applications:</strong> Allow up to 3 months for FCA approval. The candidate MUST NOT perform the function until approved.</p>
                  <p className="mt-1"><strong>Multiple functions:</strong> If applying for more than one function, you need a separate application for each.</p>
                </SectionInfo>

                <div>
                  <Label htmlFor="functionApplied">Controlled Function *</Label>
                  <Select value={formA.functionApplied} onValueChange={(v) => updateFormA("functionApplied", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the function" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 bg-slate-50">Senior Manager Functions</div>
                      {allSMFs.map((smf) => (
                        <SelectItem key={smf.id} value={`${smf.smf_number} - ${smf.title}`}>
                          {smf.smf_number} - {smf.title}
                        </SelectItem>
                      ))}
                      <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 bg-slate-50 border-t">Certification Functions</div>
                      {certificationFunctions.map((cf) => (
                        <SelectItem key={cf.id} value={`${cf.cf_number} - ${cf.title}`}>
                          {cf.cf_number} - {cf.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldHelp>Select the specific SMF or CF role the candidate will perform</FieldHelp>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="effectiveDate">Proposed Effective Date *</Label>
                    <Input
                      id="effectiveDate"
                      type="date"
                      value={formA.effectiveDate}
                      onChange={(e) => updateFormA("effectiveDate", e.target.value)}
                    />
                    <FieldHelp>Date you want the candidate to START (after approval)</FieldHelp>
                  </div>
                  <div>
                    <Label htmlFor="jobTitle">Job Title *</Label>
                    <Input
                      id="jobTitle"
                      value={formA.jobTitle}
                      onChange={(e) => updateFormA("jobTitle", e.target.value)}
                      placeholder="e.g., Chief Executive Officer"
                    />
                    <FieldHelp>The candidate's official job title at your firm</FieldHelp>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="arrangementType">Employment Arrangement</Label>
                    <Select value={formA.arrangementType} onValueChange={(v) => updateFormA("arrangementType", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employed">Employed</SelectItem>
                        <SelectItem value="contracted">Contracted</SelectItem>
                        <SelectItem value="seconded">Seconded</SelectItem>
                        <SelectItem value="appointed">Appointed (NED)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timeCommitment">Time Commitment</Label>
                    <Select value={formA.timeCommitment} onValueChange={(v) => updateFormA("timeCommitment", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="non-executive">Non-executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="hoursPerWeek">Hours per Week</Label>
                    <Input
                      id="hoursPerWeek"
                      value={formA.hoursPerWeek}
                      onChange={(e) => updateFormA("hoursPerWeek", e.target.value)}
                      placeholder="e.g., 40"
                    />
                    <FieldHelp>Expected hours dedicated to this role</FieldHelp>
                  </div>
                  <div>
                    <Label htmlFor="reportingTo">Reports To</Label>
                    <Input
                      id="reportingTo"
                      value={formA.reportingTo}
                      onChange={(e) => updateFormA("reportingTo", e.target.value)}
                      placeholder="e.g., Board of Directors"
                    />
                  </div>
                  <div>
                    <Label htmlFor="directReports">Number of Direct Reports</Label>
                    <Input
                      id="directReports"
                      value={formA.directReports}
                      onChange={(e) => updateFormA("directReports", e.target.value)}
                      placeholder="e.g., 5"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveSection("3")}>
                    Back
                  </Button>
                  <Button onClick={() => setActiveSection("5")}>
                    Next: Employment History <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 5: Employment History */}
          {activeSection === "5" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-teal-600" />
                  Section 5: Employment History (10 Years)
                </CardTitle>
                <CardDescription>
                  Complete employment record for the past 10 years
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SectionInfo title="Critical requirements" variant="warning">
                  <p><strong>ALL employment</strong> for the past 10 years must be listed in reverse chronological order (most recent first).</p>
                  <p><strong>ALL gaps</strong> must be explained (career break, study, travel, gardening leave, unemployment).</p>
                  <p><strong>Regulated firms:</strong> The FCA will request regulatory references from previous regulated employers.</p>
                </SectionInfo>

                {formA.employmentHistory.map((emp, index) => (
                  <div key={emp.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-700">
                        Employment {index + 1} {index === 0 && "(Most Recent)"}
                      </h3>
                      {formA.employmentHistory.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEmployment(emp.id)}
                          className="text-rose-600 hover:text-rose-700"
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`employer-${emp.id}`}>Employer Name *</Label>
                        <Input
                          id={`employer-${emp.id}`}
                          value={emp.employer}
                          onChange={(e) => updateEmployment(emp.id, "employer", e.target.value)}
                          placeholder="Company name"
                          aria-required="true"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`jobTitle-${emp.id}`}>Job Title *</Label>
                        <Input
                          id={`jobTitle-${emp.id}`}
                          value={emp.jobTitle}
                          onChange={(e) => updateEmployment(emp.id, "jobTitle", e.target.value)}
                          aria-required="true"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`startDate-${emp.id}`}>Start Date *</Label>
                        <Input
                          id={`startDate-${emp.id}`}
                          type="date"
                          value={emp.startDate}
                          onChange={(e) => updateEmployment(emp.id, "startDate", e.target.value)}
                          aria-required="true"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`endDate-${emp.id}`}>End Date</Label>
                        <Input
                          id={`endDate-${emp.id}`}
                          type="date"
                          value={emp.endDate}
                          onChange={(e) => updateEmployment(emp.id, "endDate", e.target.value)}
                          placeholder="Leave blank if current"
                          aria-describedby={`endDate-help-${emp.id}`}
                        />
                        <FieldHelp><span id={`endDate-help-${emp.id}`}>Leave blank if current employment</span></FieldHelp>
                      </div>
                      <div>
                        <Label htmlFor={`reasonForLeaving-${emp.id}`}>Reason for Leaving *</Label>
                        <Input
                          id={`reasonForLeaving-${emp.id}`}
                          value={emp.reasonForLeaving}
                          onChange={(e) => updateEmployment(emp.id, "reasonForLeaving", e.target.value)}
                          placeholder="e.g., Career progression"
                          aria-required="true"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pt-2 border-t">
                      <Checkbox
                        id={`regulated-${emp.id}`}
                        checked={emp.isRegulated}
                        onCheckedChange={(checked) => updateEmployment(emp.id, "isRegulated", Boolean(checked))}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`regulated-${emp.id}`} className="font-normal cursor-pointer">
                          This employer is/was regulated by the FCA, PRA, or another financial regulator
                        </Label>
                        {emp.isRegulated && (
                          <div className="mt-2">
                            <Label htmlFor={`regulatorName-${emp.id}`}>Regulator Name</Label>
                            <Input
                              id={`regulatorName-${emp.id}`}
                              value={emp.regulatorName}
                              onChange={(e) => updateEmployment(emp.id, "regulatorName", e.target.value)}
                              placeholder="e.g., FCA, PRA, CBI"
                              aria-describedby={`regulatorName-help-${emp.id}`}
                            />
                            <FieldHelp><span id={`regulatorName-help-${emp.id}`}>FCA will request a regulatory reference from this employer</span></FieldHelp>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <Button variant="outline" onClick={addEmployment} className="w-full">
                  + Add Another Employment
                </Button>

                <SectionInfo title="Tip: Accounting for gaps" variant="info">
                  <p>If there are gaps between employments, add an entry explaining what you were doing:</p>
                  <p>• Employer: "Career Break" or "Self-employed" or "Full-time study"</p>
                  <p>• Job Title: Brief description (e.g., "Travelling", "Caring responsibilities", "MBA Studies")</p>
                </SectionInfo>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveSection("4")}>
                    Back
                  </Button>
                  <Button onClick={() => setActiveSection("6")}>
                    Next: Directorships <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 6: Directorships */}
          {activeSection === "6" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-teal-600" />
                  Section 6: Directorships (Past 10 Years)
                </CardTitle>
                <CardDescription>
                  All directorships held in the past 10 years, including current
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SectionInfo title="What to include" variant="info">
                  <p>List ALL directorships including:</p>
                  <p>• Executive and non-executive positions</p>
                  <p>• Dormant companies and holding companies</p>
                  <p>• Charitable organisations where you are a trustee/director</p>
                </SectionInfo>

                {formA.directorships.length === 0 ? (
                  <div className="text-center py-6 text-slate-500">
                    <Building className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    <p>No directorships added yet</p>
                    <p className="text-xs">If the candidate has no directorships, proceed to the next section</p>
                  </div>
                ) : (
                  formA.directorships.map((dir, index) => (
                    <div key={dir.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-700">Directorship {index + 1}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDirectorship(dir.id)}
                          className="text-rose-600 hover:text-rose-700"
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`companyName-${dir.id}`}>Company Name *</Label>
                          <Input
                            id={`companyName-${dir.id}`}
                            value={dir.companyName}
                            onChange={(e) => updateDirectorship(dir.id, "companyName", e.target.value)}
                            aria-required="true"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`position-${dir.id}`}>Position *</Label>
                          <Input
                            id={`position-${dir.id}`}
                            value={dir.position}
                            onChange={(e) => updateDirectorship(dir.id, "position", e.target.value)}
                            placeholder="e.g., Director, NED, Chairman"
                            aria-required="true"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`natureOfBusiness-${dir.id}`}>Nature of Business</Label>
                        <Input
                          id={`natureOfBusiness-${dir.id}`}
                          value={dir.natureOfBusiness}
                          onChange={(e) => updateDirectorship(dir.id, "natureOfBusiness", e.target.value)}
                          placeholder="e.g., Financial services, Property holding"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`appointedDate-${dir.id}`}>Date Appointed</Label>
                          <Input
                            id={`appointedDate-${dir.id}`}
                            type="date"
                            value={dir.appointedDate}
                            onChange={(e) => updateDirectorship(dir.id, "appointedDate", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`resignedDate-${dir.id}`}>Date Resigned</Label>
                          <Input
                            id={`resignedDate-${dir.id}`}
                            type="date"
                            value={dir.resignedDate}
                            onChange={(e) => updateDirectorship(dir.id, "resignedDate", e.target.value)}
                            aria-describedby={`resignedDate-help-${dir.id}`}
                          />
                          <FieldHelp><span id={`resignedDate-help-${dir.id}`}>Leave blank if still active</span></FieldHelp>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`active-${dir.id}`}
                          checked={dir.isActive}
                          onCheckedChange={(checked) => updateDirectorship(dir.id, "isActive", Boolean(checked))}
                        />
                        <Label htmlFor={`active-${dir.id}`} className="font-normal cursor-pointer">
                          Currently active directorship
                        </Label>
                      </div>
                    </div>
                  ))
                )}

                <Button variant="outline" onClick={addDirectorship} className="w-full">
                  + Add Directorship
                </Button>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveSection("5")}>
                    Back
                  </Button>
                  <Button onClick={() => setActiveSection("7")}>
                    Next: Fitness & Propriety <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sections 7-11: Fitness & Propriety (Combined Accordion) */}
          {["7", "8", "9", "10", "11"].includes(activeSection) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-teal-600" />
                  Sections 7-11: Fitness & Propriety
                </CardTitle>
                <CardDescription>
                  Disclosure questions about the candidate's background
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SectionInfo title="Important disclosure rules" variant="warning">
                  <p><strong>Answer YES</strong> to any question that applies, even if you think it's minor or historical.</p>
                  <p><strong>Answering YES does NOT automatically disqualify</strong> - the FCA considers each case individually.</p>
                  <p><strong>Failure to disclose</strong> is itself a fitness & propriety concern and may result in rejection or later enforcement.</p>
                  <p className="mt-1 font-medium">When in doubt, DISCLOSE.</p>
                </SectionInfo>

                <Accordion type="single" collapsible defaultValue="criminal" className="space-y-2">
                  {/* Criminal Matters */}
                  <AccordionItem value="criminal" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <BadgeAlert className="h-4 w-4 text-slate-600" />
                        <span>Section 7: Criminal Matters</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-4">
                      <p className="text-xs text-slate-600">Include spent convictions, cautions, bind-overs, and motoring offences (except parking).</p>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="hasCriminalConviction"
                            checked={formA.hasCriminalConviction}
                            onCheckedChange={(checked) => updateFormA("hasCriminalConviction", Boolean(checked))}
                          />
                          <Label htmlFor="hasCriminalConviction" className="font-normal cursor-pointer text-sm">
                            Has the candidate ever been convicted of any criminal offence (including spent convictions)?
                          </Label>
                        </div>
                        {formA.hasCriminalConviction && (
                          <Textarea
                            value={formA.criminalDetails}
                            onChange={(e) => updateFormA("criminalDetails", e.target.value)}
                            placeholder="Provide details: Date, offence, court, sentence, and any rehabilitation"
                            rows={3}
                          />
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="hasPendingProsecution"
                            checked={formA.hasPendingProsecution}
                            onCheckedChange={(checked) => updateFormA("hasPendingProsecution", Boolean(checked))}
                          />
                          <Label htmlFor="hasPendingProsecution" className="font-normal cursor-pointer text-sm">
                            Is the candidate currently subject to any criminal investigation or pending prosecution?
                          </Label>
                        </div>
                        {formA.hasPendingProsecution && (
                          <Textarea
                            value={formA.pendingProsecutionDetails}
                            onChange={(e) => updateFormA("pendingProsecutionDetails", e.target.value)}
                            placeholder="Provide details of the investigation/prosecution"
                            rows={3}
                          />
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Civil Proceedings */}
                  <AccordionItem value="civil" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-slate-600" />
                        <span>Section 8: Civil Proceedings</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-4">
                      <p className="text-xs text-slate-600">Include any civil proceedings related to financial matters, fraud, or misrepresentation.</p>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="hasCivilProceedings"
                            checked={formA.hasCivilProceedings}
                            onCheckedChange={(checked) => updateFormA("hasCivilProceedings", Boolean(checked))}
                          />
                          <Label htmlFor="hasCivilProceedings" className="font-normal cursor-pointer text-sm">
                            Has the candidate been the subject of any adverse finding or settlement in civil proceedings (particularly related to financial services, fraud, or misrepresentation)?
                          </Label>
                        </div>
                        {formA.hasCivilProceedings && (
                          <Textarea
                            value={formA.civilDetails}
                            onChange={(e) => updateFormA("civilDetails", e.target.value)}
                            placeholder="Provide details including dates, parties involved, and outcome"
                            rows={3}
                          />
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="hasJudgmentAgainst"
                            checked={formA.hasJudgmentAgainst}
                            onCheckedChange={(checked) => updateFormA("hasJudgmentAgainst", Boolean(checked))}
                          />
                          <Label htmlFor="hasJudgmentAgainst" className="font-normal cursor-pointer text-sm">
                            Has any court judgment been entered against the candidate?
                          </Label>
                        </div>
                        {formA.hasJudgmentAgainst && (
                          <Textarea
                            value={formA.judgmentDetails}
                            onChange={(e) => updateFormA("judgmentDetails", e.target.value)}
                            placeholder="Provide details of the judgment"
                            rows={3}
                          />
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Regulatory Matters */}
                  <AccordionItem value="regulatory" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-slate-600" />
                        <span>Section 9: Regulatory Matters</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-4">
                      <p className="text-xs text-slate-600">Include any interaction with financial regulators worldwide (FCA, PRA, SEC, etc.).</p>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="hasRegulatoryAction"
                            checked={formA.hasRegulatoryAction}
                            onCheckedChange={(checked) => updateFormA("hasRegulatoryAction", Boolean(checked))}
                          />
                          <Label htmlFor="hasRegulatoryAction" className="font-normal cursor-pointer text-sm">
                            Has the candidate been the subject of any investigation or disciplinary action by any regulator or professional body?
                          </Label>
                        </div>
                        {formA.hasRegulatoryAction && (
                          <Textarea
                            value={formA.regulatoryActionDetails}
                            onChange={(e) => updateFormA("regulatoryActionDetails", e.target.value)}
                            placeholder="Provide details including regulator name, dates, and outcome"
                            rows={3}
                          />
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="hasRefusedAuthorisation"
                            checked={formA.hasRefusedAuthorisation}
                            onCheckedChange={(checked) => updateFormA("hasRefusedAuthorisation", Boolean(checked))}
                          />
                          <Label htmlFor="hasRefusedAuthorisation" className="font-normal cursor-pointer text-sm">
                            Has the candidate ever been refused authorisation, registration, or approval by any regulator?
                          </Label>
                        </div>
                        {formA.hasRefusedAuthorisation && (
                          <Textarea
                            value={formA.refusedAuthorisationDetails}
                            onChange={(e) => updateFormA("refusedAuthorisationDetails", e.target.value)}
                            placeholder="Provide details"
                            rows={3}
                          />
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="hasSuspendedLicense"
                            checked={formA.hasSuspendedLicense}
                            onCheckedChange={(checked) => updateFormA("hasSuspendedLicense", Boolean(checked))}
                          />
                          <Label htmlFor="hasSuspendedLicense" className="font-normal cursor-pointer text-sm">
                            Has the candidate ever had a licence, membership, or registration suspended or revoked?
                          </Label>
                        </div>
                        {formA.hasSuspendedLicense && (
                          <Textarea
                            value={formA.suspendedLicenseDetails}
                            onChange={(e) => updateFormA("suspendedLicenseDetails", e.target.value)}
                            placeholder="Provide details"
                            rows={3}
                          />
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Employment & Disciplinary */}
                  <AccordionItem value="employment" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-slate-600" />
                        <span>Section 10: Employment & Disciplinary</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="hasDisciplinaryAction"
                            checked={formA.hasDisciplinaryAction}
                            onCheckedChange={(checked) => updateFormA("hasDisciplinaryAction", Boolean(checked))}
                          />
                          <Label htmlFor="hasDisciplinaryAction" className="font-normal cursor-pointer text-sm">
                            Has the candidate ever been subject to disciplinary action by an employer?
                          </Label>
                        </div>
                        {formA.hasDisciplinaryAction && (
                          <Textarea
                            value={formA.disciplinaryDetails}
                            onChange={(e) => updateFormA("disciplinaryDetails", e.target.value)}
                            placeholder="Provide details"
                            rows={3}
                          />
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="hasDismissed"
                            checked={formA.hasDismissed}
                            onCheckedChange={(checked) => updateFormA("hasDismissed", Boolean(checked))}
                          />
                          <Label htmlFor="hasDismissed" className="font-normal cursor-pointer text-sm">
                            Has the candidate ever been dismissed or asked to resign from employment?
                          </Label>
                        </div>
                        {formA.hasDismissed && (
                          <Textarea
                            value={formA.dismissedDetails}
                            onChange={(e) => updateFormA("dismissedDetails", e.target.value)}
                            placeholder="Provide details"
                            rows={3}
                          />
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="hasResignedInvestigation"
                            checked={formA.hasResignedInvestigation}
                            onCheckedChange={(checked) => updateFormA("hasResignedInvestigation", Boolean(checked))}
                          />
                          <Label htmlFor="hasResignedInvestigation" className="font-normal cursor-pointer text-sm">
                            Has the candidate ever resigned while under investigation or facing disciplinary action?
                          </Label>
                        </div>
                        {formA.hasResignedInvestigation && (
                          <Textarea
                            value={formA.resignedInvestigationDetails}
                            onChange={(e) => updateFormA("resignedInvestigationDetails", e.target.value)}
                            placeholder="Provide details"
                            rows={3}
                          />
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Financial Soundness */}
                  <AccordionItem value="financial" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-slate-600" />
                        <span>Section 11: Financial Soundness</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="hasBankruptcy"
                            checked={formA.hasBankruptcy}
                            onCheckedChange={(checked) => updateFormA("hasBankruptcy", Boolean(checked))}
                          />
                          <Label htmlFor="hasBankruptcy" className="font-normal cursor-pointer text-sm">
                            Has the candidate ever been declared bankrupt or had assets sequestrated?
                          </Label>
                        </div>
                        {formA.hasBankruptcy && (
                          <Textarea
                            value={formA.bankruptcyDetails}
                            onChange={(e) => updateFormA("bankruptcyDetails", e.target.value)}
                            placeholder="Provide details including date and discharge date"
                            rows={3}
                          />
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="hasIVA"
                            checked={formA.hasIVA}
                            onCheckedChange={(checked) => updateFormA("hasIVA", Boolean(checked))}
                          />
                          <Label htmlFor="hasIVA" className="font-normal cursor-pointer text-sm">
                            Has the candidate ever entered into an Individual Voluntary Arrangement (IVA) or similar?
                          </Label>
                        </div>
                        {formA.hasIVA && (
                          <Textarea
                            value={formA.ivaDetails}
                            onChange={(e) => updateFormA("ivaDetails", e.target.value)}
                            placeholder="Provide details"
                            rows={3}
                          />
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="hasCCJ"
                            checked={formA.hasCCJ}
                            onCheckedChange={(checked) => updateFormA("hasCCJ", Boolean(checked))}
                          />
                          <Label htmlFor="hasCCJ" className="font-normal cursor-pointer text-sm">
                            Does the candidate have any outstanding County Court Judgments (CCJs)?
                          </Label>
                        </div>
                        {formA.hasCCJ && (
                          <Textarea
                            value={formA.ccjDetails}
                            onChange={(e) => updateFormA("ccjDetails", e.target.value)}
                            placeholder="Provide details"
                            rows={3}
                          />
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="hasCompanyInsolvency"
                            checked={formA.hasCompanyInsolvency}
                            onCheckedChange={(checked) => updateFormA("hasCompanyInsolvency", Boolean(checked))}
                          />
                          <Label htmlFor="hasCompanyInsolvency" className="font-normal cursor-pointer text-sm">
                            Has the candidate been a director of a company that went into insolvency, liquidation, or administration while they were a director or within 12 months of them leaving?
                          </Label>
                        </div>
                        {formA.hasCompanyInsolvency && (
                          <Textarea
                            value={formA.companyInsolvencyDetails}
                            onChange={(e) => updateFormA("companyInsolvencyDetails", e.target.value)}
                            placeholder="Provide company name, your role, and circumstances"
                            rows={3}
                          />
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveSection("6")}>
                    Back
                  </Button>
                  <Button onClick={() => setActiveSection("12")}>
                    Next: Statement of Responsibilities <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 12: Statement of Responsibilities */}
          {activeSection === "12" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-teal-600" />
                  Section 12: Statement of Responsibilities
                </CardTitle>
                <CardDescription>
                  Define what the candidate will be responsible for (SMF roles only)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SectionInfo title="About the Statement of Responsibilities" variant="info">
                  <p>Every SMF holder must have a clear Statement of Responsibilities (SoR) that sets out what they are personally responsible and accountable for.</p>
                  <p className="mt-1">The SoR should be:</p>
                  <p>• <strong>Clear and specific</strong> - avoid vague language</p>
                  <p>• <strong>Comprehensive</strong> - cover all areas of accountability</p>
                  <p>• <strong>Consistent</strong> - with other SMFs' SoRs (no gaps or overlaps)</p>
                </SectionInfo>

                <div>
                  <Label htmlFor="sorResponsibilities">Key Responsibilities *</Label>
                  <Textarea
                    id="sorResponsibilities"
                    value={formA.sorResponsibilities}
                    onChange={(e) => updateFormA("sorResponsibilities", e.target.value)}
                    placeholder="Describe the candidate's key areas of responsibility. Be specific about what they are accountable for.

Example:
• Overall responsibility for the firm's compliance function
• Management of the compliance team (3 direct reports)
• Reporting to the Board on regulatory matters
• Oversight of regulatory change implementation
• Primary contact with the FCA"
                    rows={8}
                  />
                  <FieldHelp>Be specific - this document may be used in regulatory enforcement</FieldHelp>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Prescribed Responsibilities</h3>
                  <p className="text-xs text-slate-600 mb-4">
                    Select any Prescribed Responsibilities that will be allocated to this SMF.
                    Each PR must be allocated to exactly one SMF.
                  </p>
                  <div className="space-y-3">
                    {prescribedResponsibilitiesList.map((pr) => (
                      <div key={pr.id} className="flex items-start gap-3">
                        <Checkbox
                          id={pr.id}
                          checked={formA.prescribedResponsibilities.includes(pr.id)}
                          onCheckedChange={() => togglePrescribedResponsibility(pr.id)}
                        />
                        <Label htmlFor={pr.id} className="font-normal cursor-pointer text-sm">
                          {pr.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="additionalResponsibilities">Additional Responsibilities</Label>
                  <Textarea
                    id="additionalResponsibilities"
                    value={formA.additionalResponsibilities}
                    onChange={(e) => updateFormA("additionalResponsibilities", e.target.value)}
                    placeholder="Any additional responsibilities not covered above"
                    rows={3}
                  />
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveSection("7")}>
                    Back
                  </Button>
                  <Button onClick={() => setActiveSection("13")}>
                    Next: Competency <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 13: Competency */}
          {activeSection === "13" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-teal-600" />
                  Section 13: Competency Assessment
                </CardTitle>
                <CardDescription>
                  Evidence that the candidate is competent for the role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SectionInfo title="What the FCA looks for" variant="info">
                  <p>The FCA needs to be satisfied that the candidate has the knowledge, skills, and experience to perform the function effectively.</p>
                  <p className="mt-1">Link their experience directly to the responsibilities of the role they're applying for.</p>
                </SectionInfo>

                <div>
                  <Label htmlFor="relevantExperience">Relevant Experience *</Label>
                  <Textarea
                    id="relevantExperience"
                    value={formA.relevantExperience}
                    onChange={(e) => updateFormA("relevantExperience", e.target.value)}
                    placeholder="Describe the candidate's relevant experience that makes them suitable for this role. Include:

• Specific experience in this type of role
• Experience in financial services
• Leadership and management experience
• Experience with relevant regulatory frameworks
• Achievements and track record"
                    rows={8}
                  />
                  <FieldHelp>Link directly to the Statement of Responsibilities - explain how their experience qualifies them</FieldHelp>
                </div>

                <div>
                  <Label htmlFor="qualifications">Professional Qualifications</Label>
                  <Textarea
                    id="qualifications"
                    value={formA.qualifications}
                    onChange={(e) => updateFormA("qualifications", e.target.value)}
                    placeholder="List relevant qualifications:
• Degree(s) and institution(s)
• Professional qualifications (e.g., CFA, ACCA, CISI)
• Regulatory qualifications
• Other relevant certifications"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="trainingPlanned">Training Planned</Label>
                  <Textarea
                    id="trainingPlanned"
                    value={formA.trainingPlanned}
                    onChange={(e) => updateFormA("trainingPlanned", e.target.value)}
                    placeholder="Describe any induction or training planned for the candidate:
• Regulatory training
• Firm-specific training
• Ongoing development plans"
                    rows={4}
                  />
                  <FieldHelp>Even experienced candidates should have an induction plan</FieldHelp>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveSection("12")}>
                    Back
                  </Button>
                  <Button onClick={() => setActiveSection("14")}>
                    Next: Declarations <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 14: Declarations */}
          {activeSection === "14" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-teal-600" />
                  Section 14: Declarations
                </CardTitle>
                <CardDescription>
                  Final declarations from the candidate and the firm
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SectionInfo title="Legal notice" variant="warning">
                  <p><strong>Providing false or misleading information to the FCA is a criminal offence</strong> under Section 398 of the Financial Services and Markets Act 2000.</p>
                  <p className="mt-1">Both the candidate and the firm must confirm the accuracy of this application.</p>
                </SectionInfo>

                {/* Candidate Declaration */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700">Candidate Declaration</h3>
                  <div className="text-xs text-slate-600 space-y-2">
                    <p>By signing below, I (the candidate) declare that:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>The information provided in this application is accurate and complete to the best of my knowledge</li>
                      <li>I understand the regulatory responsibilities associated with this controlled function</li>
                      <li>I consent to the FCA making enquiries and conducting checks as part of this application</li>
                      <li>I will notify the firm immediately if any information in this application changes</li>
                      <li>I understand that providing false or misleading information is a criminal offence</li>
                    </ul>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="candidateDeclaration"
                      checked={formA.candidateDeclaration}
                      onCheckedChange={(checked) => updateFormA("candidateDeclaration", Boolean(checked))}
                    />
                    <Label htmlFor="candidateDeclaration" className="font-normal cursor-pointer text-sm">
                      I have read and agree to the above declaration *
                    </Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="candidateSignature">Candidate Signature (type full name) *</Label>
                      <Input
                        id="candidateSignature"
                        value={formA.candidateSignature}
                        onChange={(e) => updateFormA("candidateSignature", e.target.value)}
                        placeholder="Type your full legal name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="candidateSignatureDate">Date *</Label>
                      <Input
                        id="candidateSignatureDate"
                        type="date"
                        value={formA.candidateSignatureDate}
                        onChange={(e) => updateFormA("candidateSignatureDate", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Firm Declaration */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700">Firm Declaration</h3>
                  <div className="text-xs text-slate-600 space-y-2">
                    <p>By signing below, the firm declares that:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>We have assessed the candidate's fitness and propriety in accordance with FCA requirements</li>
                      <li>We have verified the candidate's identity and right to work</li>
                      <li>We have obtained regulatory references from previous regulated employers</li>
                      <li>We have assessed the candidate's competency for the role</li>
                      <li>We believe the candidate is fit and proper to perform the function applied for</li>
                    </ul>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="firmDeclaration"
                      checked={formA.firmDeclaration}
                      onCheckedChange={(checked) => updateFormA("firmDeclaration", Boolean(checked))}
                    />
                    <Label htmlFor="firmDeclaration" className="font-normal cursor-pointer text-sm">
                      The firm has read and agrees to the above declaration *
                    </Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firmSignature">Firm Signatory (type full name) *</Label>
                      <Input
                        id="firmSignature"
                        value={formA.firmSignature}
                        onChange={(e) => updateFormA("firmSignature", e.target.value)}
                        placeholder="Name of authorised signatory"
                      />
                    </div>
                    <div>
                      <Label htmlFor="firmSignatureDate">Date *</Label>
                      <Input
                        id="firmSignatureDate"
                        type="date"
                        value={formA.firmSignatureDate}
                        onChange={(e) => updateFormA("firmSignatureDate", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <SectionInfo title="Next steps" variant="success">
                  <p>Once complete, export this form and use it as a reference when submitting via FCA Connect.</p>
                  <p className="mt-1"><strong>Remember:</strong> Official submission must be made through <a href="https://connect.fca.org.uk" target="_blank" rel="noopener noreferrer" className="underline">FCA Connect</a>.</p>
                </SectionInfo>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveSection("13")}>
                    Back
                  </Button>
                  <Button onClick={handleExport} disabled={!formA.candidateDeclaration || !formA.firmDeclaration}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Completed Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Form C Tab - Simplified */}
        <TabsContent value="form-c" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-700">Form C - Ceasing Function</h3>
              <p className="text-sm text-slate-500 mt-2">
                Form C is used when someone leaves a controlled function.
                <br />
                Select "Form A" tab above to use the comprehensive application form.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setActiveTab("form-a")}>
                Go to Form A
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
