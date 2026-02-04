"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Briefcase, AlertTriangle, Edit3, ArrowRightLeft, CreditCard, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useSmcrData } from "../context/SmcrDataContext";

// Types
import type { FormAState, FormCState, FormDState, FormEState, PSDIndividualFormState, EmploymentEntry, DirectorshipEntry, PSDEmploymentEntry, PSDQualificationEntry, PSDAddressEntry } from './types/form-types';

// Utils
import { validators, validationMessages, type ValidatorKey } from './utils/form-validators';
import {
  FORM_A_STORAGE_KEY,
  FORM_C_STORAGE_KEY,
  FORM_D_STORAGE_KEY,
  FORM_E_STORAGE_KEY,
  PSD_FORM_STORAGE_KEY,
  initialFormA,
  initialFormC,
  initialFormD,
  initialFormE,
  initialPSDIndividualForm,
  createEmptyEmployment,
  createEmptyDirectorship,
  createEmptyPSDEmployment,
  createEmptyPSDQualification,
  createEmptyPSDAddress
} from './utils/form-constants';
import { generateFormHTML, generateFormCHTML, generateFormDHTML, generateFormEHTML, generatePSDIndividualHTML, sanitizeFilename } from './utils/form-export';

// Components
import { SectionInfo } from './components/SectionInfo';
import { FormHeader } from './components/FormHeader';
import { FormProgress } from './components/FormProgress';
import { SectionNavigation } from './components/SectionNavigation';
import { Section1FirmDetails } from './components/Section1FirmDetails';
import { Section2PersonalDetails } from './components/Section2PersonalDetails';
import { Section3ContactDetails } from './components/Section3ContactDetails';
import { Section4FunctionDetails } from './components/Section4FunctionDetails';
import { Section5EmploymentHistory } from './components/Section5EmploymentHistory';
import { Section6Directorships } from './components/Section6Directorships';
import { FitnessProprietySections } from './components/FitnessProprietySections';
import { Section12Responsibilities } from './components/Section12Responsibilities';
import { Section13Competency } from './components/Section13Competency';
import { Section14Declarations } from './components/Section14Declarations';

// Form C Components
import { FormCSection1FirmDetails } from './components/FormCSection1FirmDetails';
import { FormCSection2IndividualDetails } from './components/FormCSection2IndividualDetails';
import { FormCSection3CessationDetails } from './components/FormCSection3CessationDetails';
import { FormCSection4Circumstances } from './components/FormCSection4Circumstances';
import { FormCSection5Handover } from './components/FormCSection5Handover';
import { FormCSection6Declaration } from './components/FormCSection6Declaration';

// Form D Components
import { FormDSection1FirmDetails } from './components/FormDSection1FirmDetails';
import { FormDSection2IndividualDetails } from './components/FormDSection2IndividualDetails';
import { FormDSection3ChangeDetails } from './components/FormDSection3ChangeDetails';
import { FormDSection4Declaration } from './components/FormDSection4Declaration';

// Form E Components
import { FormESection1FirmDetails } from './components/FormESection1FirmDetails';
import { FormESection2IndividualDetails } from './components/FormESection2IndividualDetails';
import { FormESection3CurrentFunctions } from './components/FormESection3CurrentFunctions';
import { FormESection4NewFunctions } from './components/FormESection4NewFunctions';
import { FormESection5TransferReason } from './components/FormESection5TransferReason';
import { FormESection6Responsibilities } from './components/FormESection6Responsibilities';
import { FormESection7Competency } from './components/FormESection7Competency';
import { FormESection8Fitness } from './components/FormESection8Fitness';
import { FormESection9Declarations } from './components/FormESection9Declarations';

// PSD Individual Form Components
import { PSDSection1PersonalDetails } from './components/PSDSection1PersonalDetails';
import { PSDSection2FirmDetails } from './components/PSDSection2FirmDetails';
import { PSDSection3Arrangements } from './components/PSDSection3Arrangements';
import { PSDSection4Employment } from './components/PSDSection4Employment';
import { PSDSection5FitnessPropriety } from './components/PSDSection5FitnessPropriety';
import { PSDSection6SupplementaryInfo } from './components/PSDSection6SupplementaryInfo';
import { PSDSection7Declarations } from './components/PSDSection7Declarations';
import { FormSelector } from './components/FormSelector';
import { FormNotesPanel } from './components/FormNotesPanel';

type SaveStatus = 'saved' | 'saving' | 'error' | 'quota-exceeded' | null;

export function FormGuideClient() {
  const searchParams = useSearchParams();
  const { firms, activeFirmId } = useSmcrData();
  const activeFirm = firms.find((f) => f.id === activeFirmId);

  const [activeTab, setActiveTab] = useState("select");
  const [activeSection, setActiveSection] = useState("1");
  const [formCSectionActive, setFormCSectionActive] = useState("1");
  const [formDSectionActive, setFormDSectionActive] = useState("1");
  const [formESectionActive, setFormESectionActive] = useState("1");
  const [psdSectionActive, setPSDSectionActive] = useState("1");
  const [formA, setFormA] = useState<FormAState>({
    ...initialFormA,
    firmName: activeFirm?.name || "",
  });
  const [formC, setFormC] = useState<FormCState>({
    ...initialFormC,
    firmName: activeFirm?.name || "",
  });
  const [formD, setFormD] = useState<FormDState>({
    ...initialFormD,
    firmName: activeFirm?.name || "",
  });
  const [formE, setFormE] = useState<FormEState>({
    ...initialFormE,
    firmName: activeFirm?.name || "",
  });
  const [formPSD, setFormPSD] = useState<PSDIndividualFormState>({
    ...initialPSDIndividualForm,
    firmName: activeFirm?.name || "",
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formCValidationErrors, setFormCValidationErrors] = useState<Record<string, string>>({});
  const [formDValidationErrors, setFormDValidationErrors] = useState<Record<string, string>>({});
  const [formEValidationErrors, setFormEValidationErrors] = useState<Record<string, string>>({});
  const [formPSDValidationErrors, setFormPSDValidationErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [notesPanelOpen, setNotesPanelOpen] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const allowedTabs = ["select", "form-a", "form-c", "form-d", "form-e", "psd-individual"];
    if (tabParam && allowedTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
    const psdSectionParam = searchParams.get("psdSection");
    if (tabParam === "psd-individual" && psdSectionParam) {
      setPSDSectionActive(psdSectionParam);
    }
  }, [searchParams]);

  // Load saved form data from localStorage on mount
  useEffect(() => {
    try {
      const savedDataA = localStorage.getItem(FORM_A_STORAGE_KEY);
      if (savedDataA) {
        const parsed = JSON.parse(savedDataA) as Partial<FormAState>;
        setFormA(prev => ({
          ...prev,
          ...parsed,
          firmName: activeFirm?.name || parsed.firmName || prev.firmName,
        }));
      }
      const savedDataC = localStorage.getItem(FORM_C_STORAGE_KEY);
      if (savedDataC) {
        const parsed = JSON.parse(savedDataC) as Partial<FormCState>;
        setFormC(prev => ({
          ...prev,
          ...parsed,
          firmName: activeFirm?.name || parsed.firmName || prev.firmName,
        }));
      }
      const savedDataD = localStorage.getItem(FORM_D_STORAGE_KEY);
      if (savedDataD) {
        const parsed = JSON.parse(savedDataD) as Partial<FormDState>;
        setFormD(prev => ({
          ...prev,
          ...parsed,
          firmName: activeFirm?.name || parsed.firmName || prev.firmName,
        }));
      }
      const savedDataE = localStorage.getItem(FORM_E_STORAGE_KEY);
      if (savedDataE) {
        const parsed = JSON.parse(savedDataE) as Partial<FormEState>;
        setFormE(prev => ({
          ...prev,
          ...parsed,
          firmName: activeFirm?.name || parsed.firmName || prev.firmName,
        }));
      }
      const savedDataPSD = localStorage.getItem(PSD_FORM_STORAGE_KEY);
      if (savedDataPSD) {
        const parsed = JSON.parse(savedDataPSD) as Partial<PSDIndividualFormState>;
        setFormPSD(prev => ({
          ...prev,
          ...parsed,
          firmName: activeFirm?.name || parsed.firmName || prev.firmName,
        }));
      }
    } catch (error) {
      console.error('Failed to load saved form data:', error);
    }
  }, [activeFirm?.name]);

  // Auto-save Form A data to localStorage (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        setSaveStatus('saving');
        localStorage.setItem(FORM_A_STORAGE_KEY, JSON.stringify(formA));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2000);
      } catch (error) {
        console.error('Failed to save form data:', error);
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          setSaveStatus('quota-exceeded');
        } else {
          setSaveStatus('error');
        }
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formA]);

  // Auto-save Form C data to localStorage (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        setSaveStatus('saving');
        localStorage.setItem(FORM_C_STORAGE_KEY, JSON.stringify(formC));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2000);
      } catch (error) {
        console.error('Failed to save Form C data:', error);
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          setSaveStatus('quota-exceeded');
        } else {
          setSaveStatus('error');
        }
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formC]);

  // Auto-save Form D data to localStorage (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        setSaveStatus('saving');
        localStorage.setItem(FORM_D_STORAGE_KEY, JSON.stringify(formD));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2000);
      } catch (error) {
        console.error('Failed to save Form D data:', error);
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          setSaveStatus('quota-exceeded');
        } else {
          setSaveStatus('error');
        }
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formD]);

  // Auto-save Form E data to localStorage (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        setSaveStatus('saving');
        localStorage.setItem(FORM_E_STORAGE_KEY, JSON.stringify(formE));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2000);
      } catch (error) {
        console.error('Failed to save Form E data:', error);
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          setSaveStatus('quota-exceeded');
        } else {
          setSaveStatus('error');
        }
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formE]);

  // Auto-save PSD Individual Form data to localStorage (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        setSaveStatus('saving');
        localStorage.setItem(PSD_FORM_STORAGE_KEY, JSON.stringify(formPSD));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2000);
      } catch (error) {
        console.error('Failed to save PSD form data:', error);
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          setSaveStatus('quota-exceeded');
        } else {
          setSaveStatus('error');
        }
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formPSD]);

  // Clear saved form data
  const clearSavedForm = useCallback(() => {
    try {
      if (activeTab === "form-a") {
        localStorage.removeItem(FORM_A_STORAGE_KEY);
        setFormA({
          ...initialFormA,
          firmName: activeFirm?.name || "",
        });
        setValidationErrors({});
      } else if (activeTab === "form-c") {
        localStorage.removeItem(FORM_C_STORAGE_KEY);
        setFormC({
          ...initialFormC,
          firmName: activeFirm?.name || "",
        });
        setFormCValidationErrors({});
      } else if (activeTab === "form-d") {
        localStorage.removeItem(FORM_D_STORAGE_KEY);
        setFormD({
          ...initialFormD,
          firmName: activeFirm?.name || "",
        });
        setFormDValidationErrors({});
      } else if (activeTab === "form-e") {
        localStorage.removeItem(FORM_E_STORAGE_KEY);
        setFormE({
          ...initialFormE,
          firmName: activeFirm?.name || "",
        });
        setFormEValidationErrors({});
      } else if (activeTab === "psd-individual") {
        localStorage.removeItem(PSD_FORM_STORAGE_KEY);
        setFormPSD({
          ...initialPSDIndividualForm,
          firmName: activeFirm?.name || "",
        });
        setFormPSDValidationErrors({});
      }
    } catch (error) {
      console.error('Failed to clear saved form:', error);
    }
  }, [activeFirm?.name, activeTab]);

  // Validate a specific field for Form A
  const validateField = useCallback((field: string, value: string, validatorKey?: string) => {
    if (validatorKey && validators[validatorKey as ValidatorKey]) {
      const isValid = validators[validatorKey as ValidatorKey](value);
      setValidationErrors(prev => {
        if (isValid) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Validate a specific field for Form C
  const validateFormCField = useCallback((field: string, value: string, validatorKey?: string) => {
    if (validatorKey && validators[validatorKey as ValidatorKey]) {
      const isValid = validators[validatorKey as ValidatorKey](value);
      setFormCValidationErrors(prev => {
        if (isValid) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Validate a specific field for Form D
  const validateFormDField = useCallback((field: string, value: string, validatorKey?: string) => {
    if (validatorKey && validators[validatorKey as ValidatorKey]) {
      const isValid = validators[validatorKey as ValidatorKey](value);
      setFormDValidationErrors(prev => {
        if (isValid) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Validate a specific field for Form E
  const validateFormEField = useCallback((field: string, value: string, validatorKey?: string) => {
    if (validatorKey && validators[validatorKey as ValidatorKey]) {
      const isValid = validators[validatorKey as ValidatorKey](value);
      setFormEValidationErrors(prev => {
        if (isValid) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Validate a specific field for PSD Individual Form
  const validateFormPSDField = useCallback((field: string, value: string, validatorKey?: string) => {
    if (validatorKey && validators[validatorKey as ValidatorKey]) {
      const isValid = validators[validatorKey as ValidatorKey](value);
      setFormPSDValidationErrors(prev => {
        if (isValid) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    total++;
    if (formA.employmentHistory.length > 0 && formA.employmentHistory[0].employer) filled++;

    total += 2;
    if (formA.candidateDeclaration) filled++;
    if (formA.firmDeclaration) filled++;

    return Math.round((filled / total) * 100);
  }, [formA]);

  // Form update functions
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

  // Form C update function
  const updateFormC = <K extends keyof FormCState>(field: K, value: FormCState[K]) => {
    setFormC((prev) => ({ ...prev, [field]: value }));
  };

  // Form D update function
  const updateFormD = <K extends keyof FormDState>(field: K, value: FormDState[K]) => {
    setFormD((prev) => ({ ...prev, [field]: value }));
  };

  // Form E update function
  const updateFormE = <K extends keyof FormEState>(field: K, value: FormEState[K]) => {
    setFormE((prev) => ({ ...prev, [field]: value }));
  };

  // PSD Individual Form update function
  const updateFormPSD = useCallback(<K extends keyof PSDIndividualFormState>(field: K, value: PSDIndividualFormState[K]) => {
    setFormPSD((prev) => ({ ...prev, [field]: value }));
  }, []);

  // PSD Employment management
  const addPSDEmployment = () => {
    setFormPSD((prev) => ({
      ...prev,
      employmentHistory: [...prev.employmentHistory, createEmptyPSDEmployment()],
    }));
  };

  const updatePSDEmployment = <K extends keyof PSDEmploymentEntry>(
    id: string,
    field: K,
    value: PSDEmploymentEntry[K]
  ) => {
    setFormPSD((prev) => ({
      ...prev,
      employmentHistory: prev.employmentHistory.map((emp) =>
        emp.id === id ? { ...emp, [field]: value } : emp
      ),
    }));
  };

  const removePSDEmployment = (id: string) => {
    setFormPSD((prev) => ({
      ...prev,
      employmentHistory: prev.employmentHistory.filter((emp) => emp.id !== id),
    }));
  };

  // PSD Qualification management
  const addPSDQualification = () => {
    setFormPSD((prev) => ({
      ...prev,
      qualifications: [...prev.qualifications, createEmptyPSDQualification()],
    }));
  };

  const updatePSDQualification = <K extends keyof PSDQualificationEntry>(
    id: string,
    field: K,
    value: PSDQualificationEntry[K]
  ) => {
    setFormPSD((prev) => ({
      ...prev,
      qualifications: prev.qualifications.map((qual) =>
        qual.id === id ? { ...qual, [field]: value } : qual
      ),
    }));
  };

  const removePSDQualification = (id: string) => {
    setFormPSD((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((qual) => qual.id !== id),
    }));
  };

  // PSD Address management
  const addPSDAddress = () => {
    setFormPSD((prev) => ({
      ...prev,
      previousAddresses: [...prev.previousAddresses, createEmptyPSDAddress()],
    }));
  };

  const updatePSDAddress = <K extends keyof PSDAddressEntry>(
    id: string,
    field: K,
    value: PSDAddressEntry[K]
  ) => {
    setFormPSD((prev) => ({
      ...prev,
      previousAddresses: prev.previousAddresses.map((addr) =>
        addr.id === id ? { ...addr, [field]: value } : addr
      ),
    }));
  };

  const removePSDAddress = (id: string) => {
    setFormPSD((prev) => ({
      ...prev,
      previousAddresses: prev.previousAddresses.filter((addr) => addr.id !== id),
    }));
  };

  // Form C progress calculation
  const formCProgress = useMemo(() => {
    let filled = 0;
    let total = 0;

    const requiredFields = [
      formC.firmName, formC.firmFRN, formC.submitterName,
      formC.surname, formC.forenames, formC.individualReferenceNumber,
      formC.functionCeasing, formC.effectiveDate, formC.reasonCategory,
      formC.interimArrangements,
      formC.declarantName, formC.declarantSignature, formC.declarantDate,
    ];

    requiredFields.forEach((field) => {
      total++;
      if (field && String(field).trim()) filled++;
    });

    total++;
    if (formC.firmDeclaration) filled++;

    return Math.round((filled / total) * 100);
  }, [formC]);

  // Form D progress calculation
  const formDProgress = useMemo(() => {
    let filled = 0;
    let total = 0;

    const requiredFields = [
      formD.firmName, formD.firmFRN, formD.submitterName,
      formD.surname, formD.forenames, formD.individualReferenceNumber,
      formD.currentFunction, formD.changeCategory,
      formD.declarantName, formD.declarantSignature, formD.declarantDate,
    ];

    requiredFields.forEach((field) => {
      total++;
      if (field && String(field).trim()) filled++;
    });

    total++;
    if (formD.firmDeclaration) filled++;

    return Math.round((filled / total) * 100);
  }, [formD]);

  // Form E progress calculation
  const formEProgress = useMemo(() => {
    let filled = 0;
    let total = 0;

    const requiredFields = [
      formE.firmName, formE.firmFRN, formE.submitterName,
      formE.surname, formE.forenames, formE.individualReferenceNumber,
      formE.ceasingDate, formE.newFunctionStartDate, formE.newJobTitle,
      formE.transferReason, formE.relevantExperience,
      formE.candidateSignature, formE.candidateSignatureDate,
      formE.firmSignature, formE.firmSignatureDate,
    ];

    requiredFields.forEach((field) => {
      total++;
      if (field && String(field).trim()) filled++;
    });

    // Array fields
    total += 2;
    if (formE.currentFunctions.length > 0) filled++;
    if (formE.newFunctions.length > 0) filled++;

    // Boolean fields
    total += 2;
    if (formE.candidateDeclaration) filled++;
    if (formE.firmDeclaration) filled++;

    return Math.round((filled / total) * 100);
  }, [formE]);

  // PSD Individual Form progress calculation
  const formPSDProgress = useMemo(() => {
    let filled = 0;
    let total = 0;

    const requiredFields = [
      formPSD.surname, formPSD.forenames, formPSD.dateOfBirth, formPSD.nationality,
      formPSD.currentAddress, formPSD.currentPostcode,
      formPSD.firmName, formPSD.firmFRN, formPSD.contactName, formPSD.contactEmail,
      formPSD.positionType, formPSD.keyDutiesResponsibilities,
      formPSD.individualFullName, formPSD.individualSignature, formPSD.individualSignatureDate,
      formPSD.firmNameDeclaration, formPSD.firmSignatoryName, formPSD.firmSignature, formPSD.firmSignatureDate,
    ];

    requiredFields.forEach((field) => {
      total++;
      if (field && String(field).trim()) filled++;
    });

    // Employment history
    total++;
    if (formPSD.employmentHistory.length > 0 && formPSD.employmentHistory[0].employerName) filled++;

    // Section 5 confirmation fields (only count if disclosures exist)
    const hasAnyPartADisclosure = formPSD.hasCriminalConviction || formPSD.hasPendingInvestigation ||
      formPSD.hasCurrentCriminalProceedings || formPSD.hasPastCriminalProceedings || formPSD.hasOrganisationInsolvency;
    const hasAnyPartBDisclosure = formPSD.hasCivilInvestigations || formPSD.hasCivilDecisionsAgainst ||
      formPSD.hasCivilEnforcement || formPSD.hasSupervisoryInvolvement || formPSD.hasBankruptcyFiled ||
      formPSD.hasBeenBankrupt || formPSD.hasBankruptcyRestrictions || formPSD.hasCreditorArrangements ||
      formPSD.hasAssetsSequestrated || formPSD.hasBankruptcyProceedings || formPSD.hasCurrentBankruptcyProceedings ||
      formPSD.hasOutstandingFinancialObligations;
    const hasAnyPartCDisclosure = formPSD.hasBeenDismissed || formPSD.hasBeenAskedToResign ||
      formPSD.hasBeenSuspended || formPSD.hasBeenDisqualifiedDirector || formPSD.hasDisciplinaryProceedings ||
      formPSD.hasDisciplinaryInvestigation || formPSD.hasNotifiedDisciplinary || formPSD.hasMalpracticeAllegations;
    const hasAnyPartDDisclosure = formPSD.hasRefusedAuthorisation || formPSD.hasBeenExcluded ||
      formPSD.hasPreviousReputationAssessment;

    total += 4;
    if (formPSD.partADetailsProvided || !hasAnyPartADisclosure) filled++;
    if (formPSD.partBDetailsProvided || !hasAnyPartBDisclosure) filled++;
    if (formPSD.partCDetailsProvided || !hasAnyPartCDisclosure) filled++;
    if (formPSD.partDDetailsProvided || !hasAnyPartDDisclosure) filled++;

    return Math.round((filled / total) * 100);
  }, [formPSD]);

  const handlePrint = () => window.print();

  const downloadHtmlBlob = useCallback((html: string, filename: string) => {
    const blob = new Blob([html], { type: "text/html" });
    if (blob.size > 50 * 1024 * 1024) {
      setExportError('Form data too large to export. Try reducing supplementary information.');
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, []);

  const handleExport = () => {
    try {
      setExportError(null);
      const html = generateFormHTML(formA);
      downloadHtmlBlob(html, `Form-A-${sanitizeFilename(formA.surname)}-${format(new Date(), "yyyy-MM-dd")}.html`);
    } catch (error) {
      console.error('Export failed:', error);
      setExportError('Failed to export form. Please try again.');
    }
  };

  const handleExportFormC = () => {
    try {
      setExportError(null);
      const html = generateFormCHTML(formC);
      downloadHtmlBlob(html, `Form-C-${sanitizeFilename(formC.surname)}-${format(new Date(), "yyyy-MM-dd")}.html`);
    } catch (error) {
      console.error('Export failed:', error);
      setExportError('Failed to export form. Please try again.');
    }
  };

  const handleExportFormD = () => {
    try {
      setExportError(null);
      const html = generateFormDHTML(formD);
      downloadHtmlBlob(html, `Form-D-${sanitizeFilename(formD.surname)}-${format(new Date(), "yyyy-MM-dd")}.html`);
    } catch (error) {
      console.error('Export failed:', error);
      setExportError('Failed to export form. Please try again.');
    }
  };

  const handleExportFormE = () => {
    try {
      setExportError(null);
      const html = generateFormEHTML(formE);
      downloadHtmlBlob(html, `Form-E-${sanitizeFilename(formE.surname)}-${format(new Date(), "yyyy-MM-dd")}.html`);
    } catch (error) {
      console.error('Export failed:', error);
      setExportError('Failed to export form. Please try again.');
    }
  };

  const handleExportFormPSD = () => {
    try {
      setExportError(null);
      const html = generatePSDIndividualHTML(formPSD);
      downloadHtmlBlob(html, `PSD-Individual-${sanitizeFilename(formPSD.surname)}-${format(new Date(), "yyyy-MM-dd")}.html`);
    } catch (error) {
      console.error('Export failed:', error);
      setExportError('Failed to export form. Please try again.');
    }
  };

  // Section navigation helpers
  const goToSection = (section: string) => setActiveSection(section);
  const nextSection = (current: string) => {
    const next = String(Number(current) + 1);
    setActiveSection(next);
  };
  const prevSection = (current: string) => {
    const prev = String(Number(current) - 1);
    setActiveSection(prev);
  };

  // Common props for Form A section components
  const sectionProps = {
    formData: formA,
    updateField: updateFormA,
    validationErrors,
    validateField,
  };

  // Common props for Form C section components
  const formCSectionProps = {
    formData: formC,
    updateField: updateFormC,
    validationErrors: formCValidationErrors,
    validateField: validateFormCField,
  };

  // Common props for Form D section components
  const formDSectionProps = {
    formData: formD,
    updateField: updateFormD,
    validationErrors: formDValidationErrors,
    validateField: validateFormDField,
  };

  // Common props for Form E section components
  const formESectionProps = {
    formData: formE,
    updateField: updateFormE,
    validationErrors: formEValidationErrors,
    validateField: validateFormEField,
  };

  // Common props for PSD Individual Form section components
  const formPSDSectionProps = useMemo(() => ({
    formData: formPSD,
    updateField: updateFormPSD,
    validationErrors: formPSDValidationErrors,
    validateField: validateFormPSDField,
  }), [formPSD, formPSDValidationErrors, updateFormPSD, validateFormPSDField]);

  // Form C navigation helpers
  const nextFormCSection = (current: string) => {
    const next = String(Number(current) + 1);
    setFormCSectionActive(next);
  };
  const prevFormCSection = (current: string) => {
    const prev = String(Number(current) - 1);
    setFormCSectionActive(prev);
  };

  // Form D navigation helpers
  const nextFormDSection = (current: string) => {
    const next = String(Number(current) + 1);
    setFormDSectionActive(next);
  };
  const prevFormDSection = (current: string) => {
    const prev = String(Number(current) - 1);
    setFormDSectionActive(prev);
  };

  // Form E navigation helpers
  const nextFormESection = (current: string) => {
    const next = String(Number(current) + 1);
    setFormESectionActive(next);
  };
  const prevFormESection = (current: string) => {
    const prev = String(Number(current) - 1);
    setFormESectionActive(prev);
  };

  // PSD navigation helpers
  const nextPSDSection = (current: string) => {
    const next = String(Number(current) + 1);
    setPSDSectionActive(next);
  };
  const prevPSDSection = (current: string) => {
    const prev = String(Number(current) - 1);
    setPSDSectionActive(prev);
  };

  const packId = searchParams.get("packId");
  const workspaceHref = packId ? `/authorization-pack/workspace?packId=${packId}` : "/authorization-pack/workspace";
  const breadcrumbLabel = activeTab === "psd-individual" ? "PSD Individual" : "SMCR Forms";

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumbs
          items={[
            { label: "Workspace", href: workspaceHref },
            { label: "SMCR", href: "/smcr" },
            { label: breadcrumbLabel },
          ]}
        />
        <Button variant="ghost" asChild className="text-slate-500 hover:text-slate-700">
          <Link href={workspaceHref}>Back to Workspace</Link>
        </Button>
      </div>
      <FormHeader
        saveStatus={saveStatus}
        onPrint={handlePrint}
        onToggleNotes={activeTab === "psd-individual" ? () => setNotesPanelOpen(true) : undefined}
        onExport={
          activeTab === "form-a" ? handleExport :
          activeTab === "form-c" ? handleExportFormC :
          activeTab === "form-d" ? handleExportFormD :
          activeTab === "form-e" ? handleExportFormE :
          activeTab === "psd-individual" ? handleExportFormPSD :
          handleExport
        }
        onClear={clearSavedForm}
      />

      {exportError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            <span>{exportError}</span>
          </div>
        </div>
      )}

      {activeTab === "form-a" && (
        <>
          <FormProgress progress={progress} />
          <SectionInfo title="How to use this form" variant="info">
            <p>This form mirrors the official FCA Long Form A. Complete each section, then export to use as a reference when submitting via FCA Connect.</p>
            <p className="mt-1"><strong>Processing time:</strong> SMF applications take up to 3 months. Do not allow the candidate to start until approved.</p>
          </SectionInfo>
        </>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="select" className="gap-1 text-xs">
            <ClipboardList className="h-3 w-3" />
            Select
          </TabsTrigger>
          <TabsTrigger value="form-a" className="gap-1 text-xs">
            <User className="h-3 w-3" />
            Form A
          </TabsTrigger>
          <TabsTrigger value="form-c" className="gap-1 text-xs">
            <Briefcase className="h-3 w-3" />
            Form C
          </TabsTrigger>
          <TabsTrigger value="form-d" className="gap-1 text-xs">
            <Edit3 className="h-3 w-3" />
            Form D
          </TabsTrigger>
          <TabsTrigger value="form-e" className="gap-1 text-xs">
            <ArrowRightLeft className="h-3 w-3" />
            Form E
          </TabsTrigger>
          <TabsTrigger value="psd-individual" className="gap-1 text-xs">
            <CreditCard className="h-3 w-3" />
            PSD
          </TabsTrigger>
        </TabsList>

        <TabsContent value="select" className="space-y-4 mt-4">
          <FormSelector onSelectForm={setActiveTab} />
        </TabsContent>

        <TabsContent value="form-a" className="space-y-4 mt-4">
          <SectionNavigation
            activeSection={activeSection}
            onSectionChange={goToSection}
          />

          {activeSection === "1" && (
            <Section1FirmDetails
              {...sectionProps}
              onNext={() => nextSection("1")}
            />
          )}

          {activeSection === "2" && (
            <Section2PersonalDetails
              {...sectionProps}
              onNext={() => nextSection("2")}
              onBack={() => prevSection("2")}
            />
          )}

          {activeSection === "3" && (
            <Section3ContactDetails
              {...sectionProps}
              onNext={() => nextSection("3")}
              onBack={() => prevSection("3")}
            />
          )}

          {activeSection === "4" && (
            <Section4FunctionDetails
              {...sectionProps}
              onNext={() => nextSection("4")}
              onBack={() => prevSection("4")}
            />
          )}

          {activeSection === "5" && (
            <Section5EmploymentHistory
              formData={formA}
              updateEmployment={updateEmployment}
              addEmployment={addEmployment}
              removeEmployment={removeEmployment}
              onNext={() => nextSection("5")}
              onBack={() => prevSection("5")}
            />
          )}

          {activeSection === "6" && (
            <Section6Directorships
              formData={formA}
              updateDirectorship={updateDirectorship}
              addDirectorship={addDirectorship}
              removeDirectorship={removeDirectorship}
              onNext={() => goToSection("7")}
              onBack={() => prevSection("6")}
            />
          )}

          {["7", "8", "9", "10", "11"].includes(activeSection) && (
            <FitnessProprietySections
              {...sectionProps}
              onNext={() => goToSection("12")}
              onBack={() => goToSection("6")}
            />
          )}

          {activeSection === "12" && (
            <Section12Responsibilities
              formData={formA}
              updateField={updateFormA}
              togglePrescribedResponsibility={togglePrescribedResponsibility}
              onNext={() => nextSection("12")}
              onBack={() => goToSection("7")}
            />
          )}

          {activeSection === "13" && (
            <Section13Competency
              {...sectionProps}
              onNext={() => nextSection("13")}
              onBack={() => prevSection("13")}
            />
          )}

          {activeSection === "14" && (
            <Section14Declarations
              {...sectionProps}
              onBack={() => prevSection("14")}
              onExport={handleExport}
            />
          )}
        </TabsContent>

        <TabsContent value="form-c" className="space-y-4 mt-4">
          <FormProgress progress={formCProgress} />

          <SectionInfo title="Form C - Ceasing Controlled Function" variant="warning">
            <p><strong>Deadline:</strong> Submit within 7 business days of the individual ceasing to perform the controlled function.</p>
            <p className="mt-1">Use this form when someone leaves an SMF or Certification Function role.</p>
          </SectionInfo>

          {/* Form C Section Navigation */}
          <div className="flex flex-wrap gap-1">
            {[
              { id: "1", label: "Firm" },
              { id: "2", label: "Individual" },
              { id: "3", label: "Cessation" },
              { id: "4", label: "Circumstances" },
              { id: "5", label: "Handover" },
              { id: "6", label: "Declaration" },
            ].map((section) => (
              <Button
                key={section.id}
                variant={formCSectionActive === section.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFormCSectionActive(section.id)}
                className="text-xs"
              >
                {section.id}. {section.label}
              </Button>
            ))}
          </div>

          {formCSectionActive === "1" && (
            <FormCSection1FirmDetails
              {...formCSectionProps}
              onNext={() => nextFormCSection("1")}
            />
          )}

          {formCSectionActive === "2" && (
            <FormCSection2IndividualDetails
              {...formCSectionProps}
              onNext={() => nextFormCSection("2")}
              onBack={() => prevFormCSection("2")}
            />
          )}

          {formCSectionActive === "3" && (
            <FormCSection3CessationDetails
              {...formCSectionProps}
              onNext={() => nextFormCSection("3")}
              onBack={() => prevFormCSection("3")}
            />
          )}

          {formCSectionActive === "4" && (
            <FormCSection4Circumstances
              {...formCSectionProps}
              onNext={() => nextFormCSection("4")}
              onBack={() => prevFormCSection("4")}
            />
          )}

          {formCSectionActive === "5" && (
            <FormCSection5Handover
              {...formCSectionProps}
              onNext={() => nextFormCSection("5")}
              onBack={() => prevFormCSection("5")}
            />
          )}

          {formCSectionActive === "6" && (
            <FormCSection6Declaration
              {...formCSectionProps}
              onBack={() => prevFormCSection("6")}
              onExport={handleExportFormC}
            />
          )}
        </TabsContent>

        <TabsContent value="form-d" className="space-y-4 mt-4">
          <FormProgress progress={formDProgress} />

          <SectionInfo title="Form D - Amendment to Details" variant="info">
            <p>Use this form to notify the FCA of changes to an approved person&apos;s details, including name changes, contact details, or fitness and propriety matters.</p>
          </SectionInfo>

          {/* Form D Section Navigation */}
          <div className="flex flex-wrap gap-1">
            {[
              { id: "1", label: "Firm" },
              { id: "2", label: "Individual" },
              { id: "3", label: "Changes" },
              { id: "4", label: "Declaration" },
            ].map((section) => (
              <Button
                key={section.id}
                variant={formDSectionActive === section.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFormDSectionActive(section.id)}
                className="text-xs"
              >
                {section.id}. {section.label}
              </Button>
            ))}
          </div>

          {formDSectionActive === "1" && (
            <FormDSection1FirmDetails
              {...formDSectionProps}
              onNext={() => nextFormDSection("1")}
            />
          )}

          {formDSectionActive === "2" && (
            <FormDSection2IndividualDetails
              {...formDSectionProps}
              onNext={() => nextFormDSection("2")}
              onBack={() => prevFormDSection("2")}
            />
          )}

          {formDSectionActive === "3" && (
            <FormDSection3ChangeDetails
              {...formDSectionProps}
              onNext={() => nextFormDSection("3")}
              onBack={() => prevFormDSection("3")}
            />
          )}

          {formDSectionActive === "4" && (
            <FormDSection4Declaration
              {...formDSectionProps}
              onBack={() => prevFormDSection("4")}
              onExport={handleExportFormD}
            />
          )}
        </TabsContent>

        <TabsContent value="form-e" className="space-y-4 mt-4">
          <FormProgress progress={formEProgress} />

          <SectionInfo title="Form E - Internal Transfer" variant="warning">
            <p><strong>Processing time:</strong> SMF transfers take up to 3 months. The individual must not perform the new function until FCA approval is granted.</p>
            <p className="mt-1">Use this form when transferring an approved person to a different controlled function within the same firm.</p>
          </SectionInfo>

          {/* Form E Section Navigation */}
          <div className="flex flex-wrap gap-1">
            {[
              { id: "1", label: "Firm" },
              { id: "2", label: "Individual" },
              { id: "3", label: "Ceasing" },
              { id: "4", label: "New Role" },
              { id: "5", label: "Reason" },
              { id: "6", label: "SoR" },
              { id: "7", label: "Competency" },
              { id: "8", label: "F&P" },
              { id: "9", label: "Declaration" },
            ].map((section) => (
              <Button
                key={section.id}
                variant={formESectionActive === section.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFormESectionActive(section.id)}
                className="text-xs"
              >
                {section.id}. {section.label}
              </Button>
            ))}
          </div>

          {formESectionActive === "1" && (
            <FormESection1FirmDetails
              {...formESectionProps}
              onNext={() => nextFormESection("1")}
            />
          )}

          {formESectionActive === "2" && (
            <FormESection2IndividualDetails
              {...formESectionProps}
              onNext={() => nextFormESection("2")}
              onBack={() => prevFormESection("2")}
            />
          )}

          {formESectionActive === "3" && (
            <FormESection3CurrentFunctions
              {...formESectionProps}
              onNext={() => nextFormESection("3")}
              onBack={() => prevFormESection("3")}
            />
          )}

          {formESectionActive === "4" && (
            <FormESection4NewFunctions
              {...formESectionProps}
              onNext={() => nextFormESection("4")}
              onBack={() => prevFormESection("4")}
            />
          )}

          {formESectionActive === "5" && (
            <FormESection5TransferReason
              {...formESectionProps}
              onNext={() => nextFormESection("5")}
              onBack={() => prevFormESection("5")}
            />
          )}

          {formESectionActive === "6" && (
            <FormESection6Responsibilities
              {...formESectionProps}
              onNext={() => nextFormESection("6")}
              onBack={() => prevFormESection("6")}
            />
          )}

          {formESectionActive === "7" && (
            <FormESection7Competency
              {...formESectionProps}
              onNext={() => nextFormESection("7")}
              onBack={() => prevFormESection("7")}
            />
          )}

          {formESectionActive === "8" && (
            <FormESection8Fitness
              {...formESectionProps}
              onNext={() => nextFormESection("8")}
              onBack={() => prevFormESection("8")}
            />
          )}

          {formESectionActive === "9" && (
            <FormESection9Declarations
              {...formESectionProps}
              onBack={() => prevFormESection("9")}
              onExport={handleExportFormE}
            />
          )}
        </TabsContent>

        <TabsContent value="psd-individual" className="space-y-4 mt-4">
          <FormProgress progress={formPSDProgress} />

          <SectionInfo title="PSD Individual Form - Payment Services" variant="info">
            <p>Application Form for an individual responsible for the management of a Payment Institution under Payment Services Regulations 2017.</p>
            <p className="mt-1"><strong>Important:</strong> A full 10-year employment history must be provided. All gaps must be accounted for.</p>
          </SectionInfo>

          {/* PSD Section Navigation */}
          <div className="flex flex-wrap gap-1">
            {[
              { id: "1", label: "Personal" },
              { id: "2", label: "Firm" },
              { id: "3", label: "Arrangements" },
              { id: "4", label: "Employment" },
              { id: "5", label: "F&P" },
              { id: "6", label: "Supplementary" },
              { id: "7", label: "Declaration" },
            ].map((section) => (
              <Button
                key={section.id}
                variant={psdSectionActive === section.id ? "default" : "outline"}
                size="sm"
                onClick={() => setPSDSectionActive(section.id)}
                className="text-xs"
              >
                {section.id}. {section.label}
              </Button>
            ))}
          </div>

          {psdSectionActive === "1" && (
            <PSDSection1PersonalDetails
              {...formPSDSectionProps}
              addPreviousAddress={addPSDAddress}
              updatePreviousAddress={updatePSDAddress}
              removePreviousAddress={removePSDAddress}
              onNext={() => nextPSDSection("1")}
            />
          )}

          {psdSectionActive === "2" && (
            <PSDSection2FirmDetails
              {...formPSDSectionProps}
              onNext={() => nextPSDSection("2")}
              onBack={() => prevPSDSection("2")}
            />
          )}

          {psdSectionActive === "3" && (
            <PSDSection3Arrangements
              {...formPSDSectionProps}
              onNext={() => nextPSDSection("3")}
              onBack={() => prevPSDSection("3")}
            />
          )}

          {psdSectionActive === "4" && (
            <PSDSection4Employment
              {...formPSDSectionProps}
              addEmployment={addPSDEmployment}
              updateEmployment={updatePSDEmployment}
              removeEmployment={removePSDEmployment}
              addQualification={addPSDQualification}
              updateQualification={updatePSDQualification}
              removeQualification={removePSDQualification}
              onNext={() => nextPSDSection("4")}
              onBack={() => prevPSDSection("4")}
            />
          )}

          {psdSectionActive === "5" && (
            <PSDSection5FitnessPropriety
              {...formPSDSectionProps}
              onNext={() => nextPSDSection("5")}
              onBack={() => prevPSDSection("5")}
            />
          )}

          {psdSectionActive === "6" && (
            <PSDSection6SupplementaryInfo
              {...formPSDSectionProps}
              onNext={() => nextPSDSection("6")}
              onBack={() => prevPSDSection("6")}
            />
          )}

          {psdSectionActive === "7" && (
            <PSDSection7Declarations
              {...formPSDSectionProps}
              onBack={() => prevPSDSection("7")}
              onExport={handleExportFormPSD}
            />
          )}
        </TabsContent>
      </Tabs>

      <FormNotesPanel
        open={notesPanelOpen}
        onOpenChange={setNotesPanelOpen}
        activeSection={activeTab === "psd-individual" ? psdSectionActive : undefined}
      />
    </div>
  );
}
