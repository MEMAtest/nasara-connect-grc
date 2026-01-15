"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { CheckCircle2, ChevronLeft, ChevronRight, Building2, FileText, Users, Shield } from "lucide-react";

interface PermissionEcosystem {
  id: string;
  permission_code: string;
  name: string;
  description: string;
  pack_template_type: string;
  section_keys: string[];
  policy_templates: string[];
  training_requirements: string[];
  smcr_roles: string[];
  typical_timeline_weeks: number | null;
}

// Regulatory permission types with "Other" option
const PERMISSION_TYPES = [
  { value: "payments", label: "Payment Services (PI/EMI)", description: "Payment institution or e-money institution authorisation" },
  { value: "investments", label: "Investment Services", description: "MiFID investment firm authorisation" },
  { value: "consumer-credit", label: "Consumer Credit", description: "Consumer credit firm authorisation" },
  { value: "insurance", label: "Insurance Distribution", description: "Insurance intermediary authorisation" },
  { value: "mortgage", label: "Mortgage Lending/Broking", description: "Mortgage intermediary authorisation" },
  { value: "crypto", label: "Cryptoasset Services", description: "FCA cryptoasset registration" },
  { value: "other", label: "Other", description: "Specify a different permission type" },
];

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
const REGULATED_ACTIVITIES = [
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

// Timeline preferences
const TIMELINE_OPTIONS = [
  { value: "urgent", label: "Urgent (< 3 months)" },
  { value: "standard", label: "Standard (3-6 months)" },
  { value: "flexible", label: "Flexible (6+ months)" },
  { value: "not-sure", label: "Not sure yet" },
];

interface WizardData {
  // Step 1: Permission Type
  permissionType: string;
  permissionTypeOther: string;

  // Step 2: Firm Details
  projectName: string;
  legalName: string;
  tradingName: string;
  entityType: string;
  entityTypeOther: string;
  companyNumber: string;
  incorporationDate: string;
  jurisdiction: string;
  registeredAddress: string;

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
  permissionTypeOther: "",
  projectName: "",
  legalName: "",
  tradingName: "",
  entityType: "",
  entityTypeOther: "",
  companyNumber: "",
  incorporationDate: "",
  jurisdiction: "",
  registeredAddress: "",
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

  const selected = useMemo(
    () => ecosystems.find((item) => item.permission_code === data.permissionType) || null,
    [ecosystems, data.permissionType]
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
    if (data.permissionType && !data.projectName) {
      const permType = PERMISSION_TYPES.find(p => p.value === data.permissionType);
      if (permType && data.permissionType !== "other") {
        setData(prev => ({
          ...prev,
          projectName: `${permType.label} Authorisation Project`,
        }));
      }
    }
  }, [data.permissionType]);

  const updateField = <K extends keyof WizardData>(field: K, value: WizardData[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleActivity = (activity: string) => {
    setData(prev => ({
      ...prev,
      regulatedActivities: prev.regulatedActivities.includes(activity)
        ? prev.regulatedActivities.filter(a => a !== activity)
        : [...prev.regulatedActivities, activity],
    }));
  };

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!data.permissionType && (data.permissionType !== "other" || !!data.permissionTypeOther.trim());
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
          permissionCode: data.permissionType === "other" ? "custom" : data.permissionType,
          targetSubmissionDate: data.targetSubmissionDate || null,
          assessmentData: {
            basics: {
              legalName: data.legalName,
              tradingName: data.tradingName,
              entityType: data.entityType === "other" ? data.entityTypeOther : data.entityType,
              companyNumber: data.companyNumber,
              incorporationDate: data.incorporationDate,
              primaryJurisdiction: data.jurisdiction,
              registeredAddress: data.registeredAddress,
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
              permissionTypeOther: data.permissionTypeOther,
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
        <Label className="text-base font-medium">What type of regulatory permission do you need?</Label>
        <Select value={data.permissionType} onValueChange={(value) => updateField("permissionType", value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select permission type" />
          </SelectTrigger>
          <SelectContent>
            {PERMISSION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex flex-col">
                  <span>{type.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {data.permissionType && data.permissionType !== "other" && (
          <p className="text-sm text-slate-500">
            {PERMISSION_TYPES.find(t => t.value === data.permissionType)?.description}
          </p>
        )}
      </div>

      {data.permissionType === "other" && (
        <div className="space-y-2">
          <Label>Please specify the permission type</Label>
          <Input
            value={data.permissionTypeOther}
            onChange={(e) => updateField("permissionTypeOther", e.target.value)}
            placeholder="e.g., Fund Management, Claims Management"
          />
        </div>
      )}

      {/* Show ecosystem preview if available */}
      {selected && (
        <Card className="border-teal-200 bg-teal-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-teal-800">Ecosystem Preview: {selected.name}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium text-teal-700">{selected.section_keys.length} Sections</p>
              <p className="text-teal-600">Business plan sections required</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-teal-700">{selected.policy_templates.length} Policies</p>
              <p className="text-teal-600">Policy templates included</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-teal-700">{selected.training_requirements.length} Training</p>
              <p className="text-teal-600">Training modules required</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-teal-700">{selected.smcr_roles.length} SMCR Roles</p>
              <p className="text-teal-600">Senior management roles</p>
            </div>
            {selected.typical_timeline_weeks && (
              <div className="col-span-2 space-y-1">
                <p className="font-medium text-teal-700">Typical Timeline: {selected.typical_timeline_weeks} weeks</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Visual cards for quick selection */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {ecosystems.slice(0, 6).map((ecosystem) => (
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

        <div className="space-y-2">
          <Label>Legal Entity Name *</Label>
          <Input
            value={data.legalName}
            onChange={(e) => updateField("legalName", e.target.value)}
            placeholder="e.g., XYZ Payments Ltd"
          />
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
          <Label>Company Registration Number</Label>
          <Input
            value={data.companyNumber}
            onChange={(e) => updateField("companyNumber", e.target.value)}
            placeholder="e.g., 12345678"
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
          <Label>Registered Address</Label>
          <Textarea
            value={data.registeredAddress}
            onChange={(e) => updateField("registeredAddress", e.target.value)}
            placeholder="Full registered office address"
            rows={2}
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
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {REGULATED_ACTIVITIES.map((activity) => (
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

        {data.regulatedActivities.includes("other") && (
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
          <Select value={data.timelinePreference} onValueChange={(value) => updateField("timelinePreference", value)}>
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
            onChange={(e) => updateField("targetSubmissionDate", e.target.value)}
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
              {data.permissionType === "other"
                ? data.permissionTypeOther
                : PERMISSION_TYPES.find(t => t.value === data.permissionType)?.label || "-"}
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
