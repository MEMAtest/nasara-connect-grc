"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, User, Briefcase, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useSmcrData } from "../context/SmcrDataContext";

// Types
import type { FormAState, FormCState, EmploymentEntry, DirectorshipEntry } from './types/form-types';

// Utils
import { validators, validationMessages, type ValidatorKey } from './utils/form-validators';
import {
  FORM_A_STORAGE_KEY,
  FORM_C_STORAGE_KEY,
  initialFormA,
  initialFormC,
  createEmptyEmployment,
  createEmptyDirectorship
} from './utils/form-constants';
import { generateFormHTML, generateFormCHTML, sanitizeFilename } from './utils/form-export';

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

type SaveStatus = 'saved' | 'saving' | 'error' | 'quota-exceeded' | null;

export function FormGuideClient() {
  const { firms, activeFirmId } = useSmcrData();
  const activeFirm = firms.find((f) => f.id === activeFirmId);

  const [activeTab, setActiveTab] = useState("form-a");
  const [activeSection, setActiveSection] = useState("1");
  const [formCSectionActive, setFormCSectionActive] = useState("1");
  const [formA, setFormA] = useState<FormAState>({
    ...initialFormA,
    firmName: activeFirm?.name || "",
  });
  const [formC, setFormC] = useState<FormCState>({
    ...initialFormC,
    firmName: activeFirm?.name || "",
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formCValidationErrors, setFormCValidationErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(null);
  const [exportError, setExportError] = useState<string | null>(null);

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
      } else {
        localStorage.removeItem(FORM_C_STORAGE_KEY);
        setFormC({
          ...initialFormC,
          firmName: activeFirm?.name || "",
        });
        setFormCValidationErrors({});
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

  const handlePrint = () => window.print();

  const handleExport = () => {
    try {
      setExportError(null);
      const html = generateFormHTML(formA);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Form-A-${sanitizeFilename(formA.surname)}-${format(new Date(), "yyyy-MM-dd")}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Export failed:', error);
      setExportError('Failed to export form. Please try again.');
    }
  };

  const handleExportFormC = () => {
    try {
      setExportError(null);
      const html = generateFormCHTML(formC);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Form-C-${sanitizeFilename(formC.surname)}-${format(new Date(), "yyyy-MM-dd")}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
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

  // Form C navigation helpers
  const nextFormCSection = (current: string) => {
    const next = String(Number(current) + 1);
    setFormCSectionActive(next);
  };
  const prevFormCSection = (current: string) => {
    const prev = String(Number(current) - 1);
    setFormCSectionActive(prev);
  };

  return (
    <div className="p-6 space-y-6">
      <FormHeader
        saveStatus={saveStatus}
        onPrint={handlePrint}
        onExport={activeTab === "form-a" ? handleExport : handleExportFormC}
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
      </Tabs>
    </div>
  );
}
