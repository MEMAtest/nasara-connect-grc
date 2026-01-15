"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import {
  getPolicyItems,
  getRegisterItems,
  getSmcrItems,
  getTrainingItems,
} from "@/lib/authorization-pack-integrations";
import { CheckCircle2, ChevronLeft, ChevronRight, Building2, FileText, Users, Shield } from "lucide-react";

interface PermissionEcosystem {
  id: string;
  permission_code: string;
  template_code?: string;
  name: string;
  description: string;
  pack_template_type: string;
  section_keys: string[];
  policy_templates: string[];
  training_requirements: string[];
  smcr_roles: string[];
  typical_timeline_weeks: number | null;
}

interface CompanySearchItem {
  company_number: string;
  title: string;
  address_snippet?: string;
}

// Entity types
const ENTITY_TYPES = [
  { value: "limited-company", label: "Private Limited Company (Ltd)" },
  { value: "plc", label: "Public Limited Company (PLC)" },
  { value: "llp", label: "Limited Liability Partnership (LLP)" },
  { value: "partnership", label: "Partnership" },
  { value: "sole-trader", label: "Sole Trader" },
  { value: "other", label: "Other" },
];

// Jurisdictions
const JURISDICTIONS = [
  { value: "england-wales", label: "England & Wales" },
  { value: "scotland", label: "Scotland" },
  { value: "northern-ireland", label: "Northern Ireland" },
  { value: "other-uk", label: "Other UK Territory" },
  { value: "non-uk", label: "Non-UK (Overseas)" },
];

// Firm stages
const FIRM_STAGES = [
  { value: "pre-incorporation", label: "Pre-incorporation" },
  { value: "newly-incorporated", label: "Newly incorporated (< 6 months)" },
  { value: "established-no-auth", label: "Established, not yet authorised" },
  { value: "authorised-expanding", label: "Already authorised, expanding permissions" },
  { value: "other", label: "Other" },
];

// Employee count ranges
const EMPLOYEE_RANGES = [
  { value: "1-5", label: "1-5 employees" },
  { value: "6-20", label: "6-20 employees" },
  { value: "21-50", label: "21-50 employees" },
  { value: "51-100", label: "51-100 employees" },
  { value: "100+", label: "More than 100 employees" },
];

// Primary regulated activities (multi-select)
const BASE_REGULATED_ACTIVITIES = [
  { value: "payment-services", label: "Payment Services" },
  { value: "e-money-issuance", label: "E-money Issuance" },
  { value: "account-info-services", label: "Account Information Services (AIS)" },
  { value: "payment-initiation", label: "Payment Initiation Services (PIS)" },
  { value: "fx-dealing", label: "Foreign Exchange Dealing" },
  { value: "money-transmission", label: "Money Transmission" },
  { value: "card-issuing", label: "Card Issuing" },
  { value: "acquiring", label: "Merchant Acquiring" },
  { value: "other", label: "Other (specify below)" },
];

const PAYMENT_PERG_ACTIVITIES = [
  {
    value: "ps-cash-payment-account",
    label: "Cash placed on a payment account (and operating that account)",
  },
  {
    value: "ps-cash-withdrawal",
    label: "Cash withdrawals from a payment account (and operating that account)",
  },
  {
    value: "ps-execution-payment-account",
    label: "Execution of payment transactions where funds are on a payment account (direct debits, card payments, credit transfers, standing orders)",
  },
  {
    value: "ps-execution-credit-line",
    label: "Execution of payment transactions where funds are covered by a credit line (direct debits, card payments, credit transfers, standing orders)",
  },
  {
    value: "ps-issuing-acquiring",
    label: "Issuing payment instruments and/or acquiring payment transactions",
  },
  {
    value: "ps-money-remittance",
    label: "Money remittance",
  },
  {
    value: "ps-pis",
    label: "Payment initiation services (PIS)",
  },
  {
    value: "ps-ais",
    label: "Account information services (AIS)",
  },
];

// Timeline preferences
const TIMELINE_OPTIONS = [
  { value: "urgent", label: "Urgent (< 3 months)" },
  { value: "standard", label: "Standard (3-6 months)" },
  { value: "flexible", label: "Flexible (6+ months)" },
  { value: "not-sure", label: "Not sure yet" },
];

const TIMELINE_MONTHS: Record<string, number> = {
  urgent: 3,
  standard: 6,
  flexible: 9,
};

const formatDateInput = (date: Date) => date.toISOString().split("T")[0];

const deriveTargetSubmissionDate = (preference: string) => {
  const months = TIMELINE_MONTHS[preference];
  if (!months) return "";
  const target = new Date();
  target.setMonth(target.getMonth() + months);
  return formatDateInput(target);
};

const deriveTimelinePreference = (dateValue: string) => {
  if (!dateValue) return "";
  const target = new Date(dateValue);
  if (Number.isNaN(target.getTime())) return "";
  const now = new Date();
  const monthsDiff = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  if (monthsDiff <= 3) return "urgent";
  if (monthsDiff <= 6) return "standard";
  return "flexible";
};

interface WizardData {
  // Step 1: Permission Type
  permissionType: string;

  // Step 2: Firm Details
  projectName: string;
  legalName: string;
  tradingName: string;
  entityType: string;
  entityTypeOther: string;
  companyNumber: string;
  incorporationDate: string;
  sicCode: string;
  jurisdiction: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postcode: string;
  country: string;

  // Step 3: Regulatory Scope
  regulatedActivities: string[];
  regulatedActivitiesOther: string;
  targetMarkets: string;
  estimatedTransactionVolume: string;

  // Step 4: Team & Timeline
  firmStage: string;
  firmStageOther: string;
  employeeRange: string;
  primaryContact: string;
  contactEmail: string;
  contactPhone: string;
  timelinePreference: string;
  targetSubmissionDate: string;
  additionalNotes: string;
}

const initialData: WizardData = {
  permissionType: "",
  projectName: "",
  legalName: "",
  tradingName: "",
  entityType: "",
  entityTypeOther: "",
  companyNumber: "",
  incorporationDate: "",
  sicCode: "",
  jurisdiction: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postcode: "",
  country: "United Kingdom",
  regulatedActivities: [],
  regulatedActivitiesOther: "",
  targetMarkets: "",
  estimatedTransactionVolume: "",
  firmStage: "",
  firmStageOther: "",
  employeeRange: "",
  primaryContact: "",
  contactEmail: "",
  contactPhone: "",
  timelinePreference: "",
  targetSubmissionDate: "",
  additionalNotes: "",
};

const STEPS = [
  { id: 1, title: "Permission Type", icon: Shield, description: "Select the regulatory permission you need" },
  { id: 2, title: "Firm Details", icon: Building2, description: "Tell us about your organisation" },
  { id: 3, title: "Regulatory Scope", icon: FileText, description: "Define your regulated activities" },
  { id: 4, title: "Team & Timeline", icon: Users, description: "Contact and timeline information" },
];

export function PermissionSelectorClient() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<WizardData>(initialData);
  const [ecosystems, setEcosystems] = useState<PermissionEcosystem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyResults, setCompanyResults] = useState<CompanySearchItem[]>([]);
  const [companySearchError, setCompanySearchError] = useState<string | null>(null);
  const [isCompanySearching, setIsCompanySearching] = useState(false);
  const [isCompanyLookup, setIsCompanyLookup] = useState(false);

  const selected = useMemo(
    () => ecosystems.find((item) => item.permission_code === data.permissionType) || null,
    [ecosystems, data.permissionType]
  );
  const policyItems = useMemo(
    () => (selected ? getPolicyItems(selected.policy_templates) : []),
    [selected]
  );
  const trainingItems = useMemo(
    () => (selected ? getTrainingItems(selected.training_requirements) : []),
    [selected]
  );
  const smcrItems = useMemo(
    () => (selected ? getSmcrItems(selected.smcr_roles) : []),
    [selected]
  );
  const registerItems = useMemo(
    () => getRegisterItems(selected?.permission_code || data.permissionType),
    [selected, data.permissionType]
  );

  const loadEcosystems = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetchWithTimeout("/api/authorization-pack/ecosystems").catch(() => null);
      if (!response || !response.ok) {
        setLoadError("Unable to load permission ecosystems. Please try again.");
        return;
      }
      const ecosystemData = await response.json();
      setEcosystems(ecosystemData.ecosystems || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEcosystems();
  }, []);

  // Auto-generate project name when permission type is selected
  useEffect(() => {
    if (data.permissionType && !data.projectName && selected) {
      setData((prev) => ({
        ...prev,
        projectName: `${selected.name} Authorisation Project`,
      }));
    }
  }, [data.permissionType, data.projectName, selected]);

  // Companies House name search (debounced)
  useEffect(() => {
    const query = data.legalName.trim();
    if (query.length < 3) {
      setCompanyResults([]);
      setCompanySearchError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCompanySearching(true);
      setCompanySearchError(null);
      try {
        const response = await fetch(`/api/companies-house/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setCompanySearchError(errorData.error || "Unable to search Companies House");
          setCompanyResults([]);
          return;
        }
        const results = await response.json();
        setCompanyResults(results.items || []);
      } catch (error) {
        setCompanySearchError(error instanceof Error ? error.message : "Companies House search failed");
      } finally {
        setIsCompanySearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [data.legalName]);

  const handleCompanySelect = async (item: CompanySearchItem) => {
    if (!item.company_number) return;
    setIsCompanyLookup(true);
    setCompanySearchError(null);
    try {
      const response = await fetch(`/api/companies-house/lookup?number=${encodeURIComponent(item.company_number)}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setCompanySearchError(errorData.error || "Company lookup failed");
        return;
      }
      const data = await response.json();
      const company = data.company;

      setData((prev) => ({
        ...prev,
        legalName: company?.name || item.title || prev.legalName,
        companyNumber: company?.number || item.company_number || prev.companyNumber,
        incorporationDate: company?.incorporationDate || prev.incorporationDate,
        sicCode: company?.sicCodes?.[0] || prev.sicCode,
        addressLine1: company?.address?.line1 || prev.addressLine1,
        addressLine2: company?.address?.line2 || prev.addressLine2,
        city: company?.address?.city || prev.city,
        postcode: company?.address?.postcode || prev.postcode,
        country: company?.address?.country || prev.country,
      }));
      setCompanyResults([]);
    } catch (error) {
      setCompanySearchError(error instanceof Error ? error.message : "Company lookup failed");
    } finally {
      setIsCompanyLookup(false);
    }
  };

  const updateField = <K extends keyof WizardData>(field: K, value: WizardData[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const regulatedActivityOptions = useMemo(
    () => (data.permissionType === "payments" ? PAYMENT_PERG_ACTIVITIES : BASE_REGULATED_ACTIVITIES),
    [data.permissionType]
  );

  const toggleActivity = (activity: string) => {
    setData(prev => ({
      ...prev,
      regulatedActivities: prev.regulatedActivities.includes(activity)
        ? prev.regulatedActivities.filter(a => a !== activity)
        : [...prev.regulatedActivities, activity],
    }));
  };

  const handleTimelinePreferenceChange = (value: string) => {
    updateField("timelinePreference", value);
    if (value === "not-sure") {
      updateField("targetSubmissionDate", "");
      return;
    }
    const targetDate = deriveTargetSubmissionDate(value);
    if (targetDate) {
      updateField("targetSubmissionDate", targetDate);
    }
  };

  const handleTargetSubmissionDateChange = (value: string) => {
    updateField("targetSubmissionDate", value);
    if (!value) {
      updateField("timelinePreference", "");
      return;
    }
    const preference = deriveTimelinePreference(value);
    if (preference) {
      updateField("timelinePreference", preference);
    }
  };

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!data.permissionType;
      case 2:
        return !!data.projectName.trim() && !!data.legalName.trim() && !!data.entityType && !!data.jurisdiction;
      case 3:
        return data.regulatedActivities.length > 0 || !!data.regulatedActivitiesOther.trim();
      case 4:
        return !!data.primaryContact.trim() && !!data.contactEmail.trim() && isValidEmail(data.contactEmail);
      default:
        return true;
    }
  };

  const canProceed = validateStep(currentStep);

  const handleNext = () => {
    if (currentStep < STEPS.length && canProceed) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCreate = async () => {
    if (!canProceed) return;
    setIsSubmitting(true);
    setLoadError(null);

    try {
      const response = await fetch("/api/authorization-pack/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.projectName,
          templateCode: selected?.template_code,
          permissionCode: data.permissionType,
          targetSubmissionDate: data.targetSubmissionDate || null,
          assessmentData: {
            basics: {
              legalName: data.legalName,
              tradingName: data.tradingName,
              entityType: data.entityType === "other" ? data.entityTypeOther : data.entityType,
              companyNumber: data.companyNumber,
              incorporationDate: data.incorporationDate,
              sicCode: data.sicCode,
              primaryJurisdiction: data.jurisdiction,
              addressLine1: data.addressLine1,
              addressLine2: data.addressLine2,
              city: data.city,
              postcode: data.postcode,
              country: data.country,
              firmStage: data.firmStage === "other" ? data.firmStageOther : data.firmStage,
              headcount: data.employeeRange,
              primaryContact: data.primaryContact,
              contactEmail: data.contactEmail,
              contactPhone: data.contactPhone,
              regulatedActivities: data.regulatedActivities.includes("other")
                ? [...data.regulatedActivities.filter(a => a !== "other"), data.regulatedActivitiesOther].join(", ")
                : data.regulatedActivities.join(", "),
              targetMarkets: data.targetMarkets,
              estimatedTransactionVolume: data.estimatedTransactionVolume,
              timelinePreference: data.timelinePreference,
              consultantNotes: data.additionalNotes,
            },
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result?.project?.id) {
          router.push(`/authorization-pack/${result.project.id}`);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setLoadError(errorData.error || "Unable to create project. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = (currentStep / STEPS.length) * 100;

  const renderIntegrationList = (items: ReturnType<typeof getPolicyItems>, emptyLabel: string) => {
    if (!items.length) {
      return <p className="text-xs text-slate-400">{emptyLabel}</p>;
    }
    return (
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.key} className="rounded-md border border-slate-100 bg-white px-2 py-1.5 text-xs text-slate-600">
            {item.href ? (
              <Link href={item.href} className="text-teal-700 hover:text-teal-800">
                {item.label}
              </Link>
            ) : (
              item.label
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  // Step 1: Permission Type
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-base font-medium">Select the regulatory permission you need</Label>
        <p className="text-sm text-slate-500">
          Choose a permission type to instantly load the sections, policies, training, and Key Persons linked to that
          FCA application.
        </p>
      </div>

      {/* Show ecosystem preview if available */}
      {selected && (
        <Card className="border-teal-200 bg-teal-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-teal-800">Ecosystem Preview: {selected.name}</CardTitle>
            <CardDescription className="text-sm text-teal-700">
              Policies, registers, training, and Key Person requirements linked to this permission.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-md border border-teal-100 bg-white p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-teal-500">Sections</p>
                <p className="mt-2 text-2xl font-semibold text-teal-900">{selected.section_keys.length}</p>
                <p className="text-xs text-teal-600">Business plan spine</p>
              </div>
              <div className="rounded-md border border-teal-100 bg-white p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-teal-500">Policies</p>
                <p className="mt-2 text-2xl font-semibold text-teal-900">{policyItems.length}</p>
                <p className="text-xs text-teal-600">Templates to draft</p>
              </div>
              <div className="rounded-md border border-teal-100 bg-white p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-teal-500">Training</p>
                <p className="mt-2 text-2xl font-semibold text-teal-900">{trainingItems.length}</p>
                <p className="text-xs text-teal-600">Required modules</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-teal-500">
                  Policies ({policyItems.length})
                </p>
                {renderIntegrationList(policyItems, "Policies to be confirmed after assessment.")}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-teal-500">
                  Training ({trainingItems.length})
                </p>
                {renderIntegrationList(trainingItems, "Training plan to be finalised once roles are assigned.")}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-teal-500">
                  Key Persons / PSD Roles ({smcrItems.length})
                </p>
                {renderIntegrationList(smcrItems, "Role holders to be confirmed.")}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-teal-500">
                  Registers & Trackers ({registerItems.length})
                </p>
                {renderIntegrationList(registerItems, "Registers will populate once the pack is created.")}
              </div>
            </div>
            {selected.typical_timeline_weeks && (
              <div className="rounded-md border border-teal-100 bg-white px-3 py-2 text-xs text-teal-700">
                Typical timeline: {selected.typical_timeline_weeks} weeks
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Visual cards for quick selection */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {ecosystems.map((ecosystem) => (
          <Card
            key={ecosystem.permission_code}
            className={`cursor-pointer transition-all hover:shadow-md ${
              data.permissionType === ecosystem.permission_code
                ? "border-2 border-teal-500 bg-teal-50"
                : "border-slate-200"
            }`}
            onClick={() => updateField("permissionType", ecosystem.permission_code)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-900">{ecosystem.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{ecosystem.section_keys.length} sections</p>
                  <p className="mt-2 text-xs text-slate-500">{ecosystem.description}</p>
                </div>
                {data.permissionType === ecosystem.permission_code && (
                  <CheckCircle2 className="h-5 w-5 text-teal-500" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Step 2: Firm Details
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label>Project Name *</Label>
          <Input
            value={data.projectName}
            onChange={(e) => updateField("projectName", e.target.value)}
            placeholder="e.g., XYZ Payments Authorisation Project"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Company name (search Companies House) *</Label>
          <Input
            value={data.legalName}
            onChange={(e) => updateField("legalName", e.target.value)}
            placeholder="Start typing the registered company name"
          />
          {isCompanySearching ? (
            <p className="text-xs text-slate-500">Searching Companies House...</p>
          ) : null}
          {companySearchError ? (
            <p className="text-xs text-red-500">{companySearchError}</p>
          ) : null}
          {companyResults.length > 0 ? (
            <div className="max-h-48 overflow-y-auto rounded-md border border-slate-200 bg-white">
              {companyResults.map((item) => (
                <button
                  key={item.company_number}
                  type="button"
                  className="w-full border-b border-slate-100 px-3 py-2 text-left text-sm hover:bg-slate-50"
                  onClick={() => handleCompanySelect(item)}
                  disabled={isCompanyLookup}
                >
                  <div className="font-medium text-slate-900">{item.title}</div>
                  <div className="text-xs text-slate-500">
                    {item.company_number} {item.address_snippet ? `· ${item.address_snippet}` : ""}
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Trading Name (if different)</Label>
          <Input
            value={data.tradingName}
            onChange={(e) => updateField("tradingName", e.target.value)}
            placeholder="e.g., XYZ Pay"
          />
        </div>

        <div className="space-y-2">
          <Label>Entity Type *</Label>
          <Select value={data.entityType} onValueChange={(value) => updateField("entityType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select entity type" />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {data.entityType === "other" && (
          <div className="space-y-2">
            <Label>Specify Entity Type</Label>
            <Input
              value={data.entityTypeOther}
              onChange={(e) => updateField("entityTypeOther", e.target.value)}
              placeholder="e.g., Charitable Incorporated Organisation"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Company number (auto-filled)</Label>
          <Input
            value={data.companyNumber}
            onChange={(e) => updateField("companyNumber", e.target.value)}
            placeholder="e.g., 12345678"
            readOnly
            className="bg-slate-50"
          />
        </div>

        <div className="space-y-2">
          <Label>Incorporation Date</Label>
          <Input
            type="date"
            value={data.incorporationDate}
            onChange={(e) => updateField("incorporationDate", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>SIC code</Label>
          <Input
            value={data.sicCode}
            onChange={(e) => updateField("sicCode", e.target.value)}
            placeholder="e.g., 64999"
          />
        </div>

        <div className="space-y-2">
          <Label>Jurisdiction *</Label>
          <Select value={data.jurisdiction} onValueChange={(value) => updateField("jurisdiction", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select jurisdiction" />
            </SelectTrigger>
            <SelectContent>
              {JURISDICTIONS.map((j) => (
                <SelectItem key={j.value} value={j.value}>
                  {j.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Registered address - Street</Label>
          <Input
            value={data.addressLine1}
            onChange={(e) => updateField("addressLine1", e.target.value)}
            placeholder="Street address line 1"
          />
          <Input
            value={data.addressLine2}
            onChange={(e) => updateField("addressLine2", e.target.value)}
            placeholder="Street address line 2 (optional)"
            className="mt-2"
          />
        </div>
        <div className="space-y-2">
          <Label>City</Label>
          <Input
            value={data.city}
            onChange={(e) => updateField("city", e.target.value)}
            placeholder="e.g., London"
          />
        </div>
        <div className="space-y-2">
          <Label>Postcode</Label>
          <Input
            value={data.postcode}
            onChange={(e) => updateField("postcode", e.target.value)}
            placeholder="e.g., EC1A 1BB"
          />
        </div>
        <div className="space-y-2">
          <Label>Country</Label>
          <Input
            value={data.country}
            onChange={(e) => updateField("country", e.target.value)}
            placeholder="United Kingdom"
          />
        </div>
      </div>
    </div>
  );

  // Step 3: Regulatory Scope
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Primary Regulated Activities *</Label>
          <p className="text-sm text-slate-500">Select all activities you intend to carry out</p>
          {data.permissionType === "payments" ? (
            <p className="text-xs text-slate-400">
              Aligned to PSR 2017 Schedule 1, Part 1 payment services (PERG).
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {regulatedActivityOptions.map((activity) => (
            <div
              key={activity.value}
              className={`flex items-center space-x-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                data.regulatedActivities.includes(activity.value)
                  ? "border-teal-500 bg-teal-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              onClick={() => toggleActivity(activity.value)}
            >
              <Checkbox
                checked={data.regulatedActivities.includes(activity.value)}
                onCheckedChange={() => toggleActivity(activity.value)}
              />
              <Label className="cursor-pointer font-normal">{activity.label}</Label>
            </div>
          ))}
        </div>

        {regulatedActivityOptions.some((activity) => activity.value === "other") &&
          data.regulatedActivities.includes("other") && (
          <div className="space-y-2">
            <Label>Please specify other activities</Label>
            <Input
              value={data.regulatedActivitiesOther}
              onChange={(e) => updateField("regulatedActivitiesOther", e.target.value)}
              placeholder="e.g., Currency exchange, Bill payment services"
            />
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Target Markets</Label>
          <Select value={data.targetMarkets} onValueChange={(value) => updateField("targetMarkets", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select target market" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uk-only">UK Only</SelectItem>
              <SelectItem value="uk-eea">UK and EEA</SelectItem>
              <SelectItem value="uk-international">UK and International</SelectItem>
              <SelectItem value="global">Global</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Estimated Annual Transaction Volume</Label>
          <Select
            value={data.estimatedTransactionVolume}
            onValueChange={(value) => updateField("estimatedTransactionVolume", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select volume range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under-1m">Under 1M GBP</SelectItem>
              <SelectItem value="1m-10m">1M - 10M GBP</SelectItem>
              <SelectItem value="10m-50m">10M - 50M GBP</SelectItem>
              <SelectItem value="50m-100m">50M - 100M GBP</SelectItem>
              <SelectItem value="over-100m">Over 100M GBP</SelectItem>
              <SelectItem value="not-sure">Not sure yet</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  // Step 4: Team & Timeline
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Current Firm Stage</Label>
          <Select value={data.firmStage} onValueChange={(value) => updateField("firmStage", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              {FIRM_STAGES.map((stage) => (
                <SelectItem key={stage.value} value={stage.value}>
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {data.firmStage === "other" && (
          <div className="space-y-2">
            <Label>Specify Stage</Label>
            <Input
              value={data.firmStageOther}
              onChange={(e) => updateField("firmStageOther", e.target.value)}
              placeholder="Describe your current stage"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Employee Count</Label>
          <Select value={data.employeeRange} onValueChange={(value) => updateField("employeeRange", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYEE_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Primary Contact Name *</Label>
          <Input
            value={data.primaryContact}
            onChange={(e) => updateField("primaryContact", e.target.value)}
            placeholder="Full name"
          />
        </div>

        <div className="space-y-2">
          <Label>Contact Email *</Label>
          <Input
            type="email"
            value={data.contactEmail}
            onChange={(e) => updateField("contactEmail", e.target.value)}
            placeholder="email@company.com"
            className={data.contactEmail && !isValidEmail(data.contactEmail) ? "border-red-300" : ""}
          />
          {data.contactEmail && !isValidEmail(data.contactEmail) && (
            <p className="text-xs text-red-500">Please enter a valid email address</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Contact Phone</Label>
          <Input
            type="tel"
            value={data.contactPhone}
            onChange={(e) => updateField("contactPhone", e.target.value)}
            placeholder="+44 20 1234 5678"
          />
        </div>

        <div className="space-y-2">
          <Label>Timeline Preference</Label>
          <Select value={data.timelinePreference} onValueChange={handleTimelinePreferenceChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select timeline" />
            </SelectTrigger>
            <SelectContent>
              {TIMELINE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Target Submission Date</Label>
          <Input
            type="date"
            value={data.targetSubmissionDate}
            onChange={(e) => handleTargetSubmissionDateChange(e.target.value)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Additional Notes for Consultants</Label>
          <Textarea
            value={data.additionalNotes}
            onChange={(e) => updateField("additionalNotes", e.target.value)}
            placeholder="Any specific requirements, concerns, or information that would help the consultant team..."
            rows={3}
          />
        </div>
      </div>

      {/* Summary Card */}
      <Card className="border-slate-200 bg-slate-50">
        <CardHeader>
          <CardTitle className="text-base">Project Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Project Name:</span>
            <span className="font-medium">{data.projectName || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Permission Type:</span>
            <span className="font-medium">
              {selected?.name || data.permissionType || "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Legal Entity:</span>
            <span className="font-medium">{data.legalName || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Activities:</span>
            <span className="font-medium">{data.regulatedActivities.length} selected</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Primary Contact:</span>
            <span className="font-medium">{data.primaryContact || "-"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <Card className="border border-slate-200">
        <CardContent className="p-8 text-center text-slate-500">Loading setup wizard...</CardContent>
      </Card>
    );
  }

  if (loadError && ecosystems.length === 0) {
    return (
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Setup unavailable</CardTitle>
          <CardDescription>{loadError}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="bg-teal-600 hover:bg-teal-700" onClick={loadEcosystems}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-500">Authorisation Pack</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Create New Project</h1>
        <p className="mt-2 text-sm text-slate-500">
          Complete the setup wizard to create your authorisation project and unlock the full ecosystem.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Step {currentStep} of {STEPS.length}</span>
          <span className="font-medium text-teal-600">{Math.round(progressPercentage)}% complete</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />

        {/* Step indicators */}
        <div className="flex justify-between">
          {STEPS.map((step) => {
            const StepIcon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div
                key={step.id}
                className={`flex flex-col items-center gap-1 ${
                  isActive ? "text-teal-600" : isCompleted ? "text-teal-500" : "text-slate-400"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    isActive
                      ? "bg-teal-600 text-white"
                      : isCompleted
                      ? "bg-teal-100 text-teal-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                <span className="hidden text-xs font-medium md:block">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      {/* Error message */}
      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {loadError}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        {currentStep < STEPS.length ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="gap-2 bg-teal-600 hover:bg-teal-700"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleCreate}
            disabled={!canProceed || isSubmitting}
            className="gap-2 bg-teal-600 hover:bg-teal-700"
          >
            {isSubmitting ? "Creating Project..." : "Create Project"}
          </Button>
        )}
      </div>
    </div>
  );
}
