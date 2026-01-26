"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, RefreshCw, Sparkles, X } from "lucide-react";
import { CompaniesHouseLookup } from "@/components/inputs/CompaniesHouseLookup";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";
import {
  DEFAULT_PERMISSIONS,
  getRequiredPolicies,
  type FirmPermissions,
} from "@/lib/policies/permissions";
import { usePermissions, usePolicyProfile } from "@/lib/policies";
import {
  getApplicableClauses,
  POLICY_TEMPLATES,
  type PolicyClause,
  type PolicyTemplate,
} from "@/lib/policies/templates";
import type { StoredPolicy } from "@/lib/server/policy-store";
import {
  generateQuickPolicy,
  getQuickQuestions,
  type QuickAnswer,
  type QuickAnswers,
} from "@/lib/policies/quick-defaults";
import type { FirmProfile } from "@/components/policies/policy-wizard/types";
import { findMissingTemplateVariables } from "@/lib/policies/liquid-renderer";
import { TemplateGrid } from "./TemplateGrid";
import {
  buildFirmProfileFromBasics,
  buildPermissionsFromProject,
  mergeFirmProfiles,
  mergePermissions,
  type AuthorizationProjectContext,
} from "@/lib/policies/authorization-projects";

const STEP_LABELS = ["Firm setup", "Pick policy", "Policy gaps", "Done"] as const;

const KNOWN_FIRM_KEYS = new Set([
  "name",
  "tradingName",
  "registeredAddress",
  "companyNumber",
  "sicCodes",
  "fcaReference",
  "website",
]);

const PERMISSION_KEYS = Object.keys(DEFAULT_PERMISSIONS) as Array<keyof FirmPermissions>;
const PERMISSION_KEY_SET = new Set(PERMISSION_KEYS);

const PERMISSION_GROUPS = [
  {
    id: "core",
    title: "Core activities",
    permissions: [
      { key: "investmentServices", label: "Investment services", description: "Advising, arranging, managing investments" },
      { key: "paymentServices", label: "Payment services", description: "Payment initiation, account information" },
      { key: "eMoney", label: "E-money issuance", description: "Electronic money institution services" },
      { key: "creditBroking", label: "Credit broking", description: "Consumer credit intermediation" },
    ],
  },
  {
    id: "assets",
    title: "Client assets",
    permissions: [
      { key: "clientMoney", label: "Client money", description: "Hold or control client money (CASS 7)" },
      { key: "clientAssets", label: "Client assets", description: "Safeguard and administer (CASS 6)" },
      { key: "safeguarding", label: "Safeguarding", description: "Safeguard relevant funds (PSR/EMR)" },
    ],
  },
  {
    id: "mediation",
    title: "Mediation",
    permissions: [
      { key: "insuranceMediation", label: "Insurance mediation", description: "Insurance distribution activities" },
      { key: "mortgageMediation", label: "Mortgage mediation", description: "Home finance activities" },
    ],
  },
  {
    id: "clients",
    title: "Client types",
    permissions: [
      { key: "retailClients", label: "Retail clients", description: "Consumer Duty applies" },
      { key: "professionalClients", label: "Professional clients", description: "Per se or elective professionals" },
      { key: "eligibleCounterparties", label: "Eligible counterparties", description: "Large institutions" },
      { key: "complexProducts", label: "Complex products", description: "PRIIPs, derivatives, structured" },
    ],
  },
] as const;

const FIRM_FIELD_DEFS: Record<keyof FirmProfile, { label: string; placeholder: string; type?: string }> = {
  name: { label: "Firm name", placeholder: "Acme Financial Services Ltd" },
  tradingName: { label: "Trading name", placeholder: "Acme Payments" },
  registeredAddress: { label: "Registered address", placeholder: "Street, City, Postcode" },
  companyNumber: { label: "Company number", placeholder: "12345678" },
  sicCodes: { label: "SIC codes", placeholder: "64999, 66190" },
  fcaReference: { label: "FCA reference", placeholder: "123456" },
  website: { label: "Website", placeholder: "https://example.com", type: "url" },
};

const BUSINESS_PROFILE_FIELDS = [
  {
    key: "productsServices",
    label: "Products and services",
    placeholder: "e.g. UK/EU remittances, FX, business accounts",
  },
  {
    key: "customerSegments",
    label: "Customer segments",
    placeholder: "e.g. SMEs, micro-enterprises, retail customers",
  },
  {
    key: "deliveryChannels",
    label: "Delivery channels",
    placeholder: "e.g. Online portal, API partners, mobile app",
  },
  {
    key: "primaryGeographies",
    label: "Primary geographies",
    placeholder: "e.g. UK to EU corridors, domestic UK",
  },
];

const DEFAULT_EXTRA_FIRM_FIELDS = BUSINESS_PROFILE_FIELDS.reduce<Record<string, string>>((acc, field) => {
  acc[field.key] = "";
  return acc;
}, {});

const BUSINESS_PROFILE_FIELD_KEYS = new Set(Object.keys(DEFAULT_EXTRA_FIRM_FIELDS));

const REQUIRED_GOVERNANCE_FIELDS = [
  "owner",
  "version",
  "effectiveDate",
  "nextReviewAt",
  "scopeStatement",
] as const;

const REVIEW_CADENCE_OPTIONS = [
  { value: "quarterly", label: "Quarterly" },
  { value: "semi-annual", label: "Semi-annual" },
  { value: "annual", label: "Annual" },
  { value: "one-off", label: "One-off (no scheduled review)" },
] as const;

type ReviewCadence = (typeof REVIEW_CADENCE_OPTIONS)[number]["value"];

const REVIEW_CADENCE_VALUES = new Set(REVIEW_CADENCE_OPTIONS.map((option) => option.value));

const DISTRIBUTION_PRESETS = [
  "Board",
  "Compliance",
  "Risk",
  "Operations",
  "Executive",
  "Customer Support",
  "Finance",
  "All Staff",
] as const;

type GovernanceState = {
  owner: string;
  version: string;
  effectiveDate: string;
  nextReviewAt: string;
  scopeStatement: string;
  reviewCadence: ReviewCadence;
  distributionList: string[];
  linkedProcedures: string;
};

const DEFAULT_GOVERNANCE: GovernanceState = {
  owner: "",
  version: "",
  effectiveDate: "",
  nextReviewAt: "",
  scopeStatement: "",
  reviewCadence: "annual",
  distributionList: [],
  linkedProcedures: "",
};

interface AuthorizationProjectSummary {
  id: string;
  name?: string | null;
  permissionCode?: string | null;
  permissionName?: string | null;
  status?: string | null;
}

const humanizeLabel = (value: string) =>
  value
    .replace(/\./g, " ")
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatPlaceholder = (value: string) => `Enter ${humanizeLabel(value).toLowerCase()}`;

const normalizeDistributionList = (input: unknown): string[] => {
  if (Array.isArray(input)) {
    return input
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean);
  }
  if (typeof input === "string") {
    return input
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }
  return [];
};

const addMonthsToDate = (value: string, months: number) => {
  const parts = value.split("-").map((part) => Number(part));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return "";
  }
  const [year, month, day] = parts;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime())) return "";
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
};

const normalizeFirmProfile = (input?: Record<string, unknown> | null): FirmProfile => {
  const source = input ?? {};
  const sicCodes = Array.isArray(source.sicCodes)
    ? source.sicCodes
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
        .map((value) => value.trim())
    : typeof source.sicCodes === "string"
      ? source.sicCodes
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : [];

  return {
    name: typeof source.name === "string" ? source.name : "",
    tradingName: typeof source.tradingName === "string" ? source.tradingName : "",
    registeredAddress: typeof source.registeredAddress === "string" ? source.registeredAddress : "",
    companyNumber: typeof source.companyNumber === "string" ? source.companyNumber : "",
    fcaReference: typeof source.fcaReference === "string" ? source.fcaReference : "",
    website: typeof source.website === "string" ? source.website : "",
    sicCodes,
  };
};

const extractExtraFirmFields = (input?: Record<string, unknown> | null): Record<string, string> => {
  if (!input) return {};
  return Object.entries(input).reduce<Record<string, string>>((acc, [key, value]) => {
    if (KNOWN_FIRM_KEYS.has(key)) return acc;
    if (typeof value === "string" && value.trim().length > 0) {
      acc[key] = value.trim();
    }
    return acc;
  }, {});
};

const buildExtraFirmFields = (input?: Record<string, unknown> | null) => ({
  ...DEFAULT_EXTRA_FIRM_FIELDS,
  ...extractExtraFirmFields(input),
});

const buildFirmProfilePayload = (profile: FirmProfile, extras: Record<string, string>) => {
  const normalizedExtras = Object.fromEntries(
    Object.entries(extras)
      .map(([key, value]) => [key, value.trim()])
      .filter(([, value]) => value.length > 0),
  );

  return {
    ...normalizedExtras,
    name: profile.name.trim(),
    tradingName: profile.tradingName?.trim() || "",
    registeredAddress: profile.registeredAddress?.trim() || "",
    companyNumber: profile.companyNumber?.trim() || "",
    fcaReference: profile.fcaReference?.trim() || "",
    website: profile.website?.trim() || "",
    sicCodes: (profile.sicCodes ?? []).map((code) => code.trim()).filter(Boolean),
  };
};

const buildGovernanceDefaultsPayload = (state: GovernanceState) => ({
  owner: state.owner.trim(),
  version: state.version.trim(),
  effectiveDate: state.effectiveDate,
  nextReviewAt: state.reviewCadence === "one-off" ? "" : state.nextReviewAt,
  scopeStatement: state.scopeStatement.trim(),
  reviewCadence: state.reviewCadence,
  distributionList: state.distributionList.map((value) => value.trim()).filter(Boolean),
  linkedProcedures: state.linkedProcedures.trim(),
});

export function QuickCreateWizard() {
  const { permissions, requiredPolicies, isLoading: isPermissionsLoading, refresh: refreshPermissions } = usePermissions();
  const {
    profile: policyProfile,
    isLoading: isProfileLoading,
    error: policyProfileError,
    save: savePolicyProfile,
    refresh: refreshPolicyProfile,
  } = usePolicyProfile();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [forceSetup, setForceSetup] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PolicyTemplate | null>(null);
  const [answers, setAnswers] = useState<QuickAnswers>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [firmProfile, setFirmProfile] = useState<FirmProfile>(() => normalizeFirmProfile());
  const [extraFirmFields, setExtraFirmFields] = useState<Record<string, string>>(() => buildExtraFirmFields());
  const [governance, setGovernance] = useState<GovernanceState>(DEFAULT_GOVERNANCE);
  const [sectionNotes, setSectionNotes] = useState<Record<string, string>>({});
  const [gapVariables, setGapVariables] = useState<Record<string, string>>({});
  const [createdPolicy, setCreatedPolicy] = useState<StoredPolicy | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingSetup, setIsSavingSetup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionsDraft, setPermissionsDraft] = useState<FirmPermissions>(DEFAULT_PERMISSIONS);
  const [authorizationProjects, setAuthorizationProjects] = useState<AuthorizationProjectSummary[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [isApplyingProjects, setIsApplyingProjects] = useState(false);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);
  const [showGovernanceEditor, setShowGovernanceEditor] = useState(false);
  const [distributionInput, setDistributionInput] = useState("");
  const [distributionPreset, setDistributionPreset] = useState("");

  const storedFirmName =
    typeof policyProfile?.firmProfile?.name === "string" ? policyProfile.firmProfile.name.trim() : "";
  const hasStoredFirmProfile = storedFirmName.length > 0;
  const hasFirmProfile = firmProfile.name.trim().length > 0 || hasStoredFirmProfile;

  useEffect(() => {
    if (!isPermissionsLoading) {
      setPermissionsDraft(permissions);
    }
  }, [permissions, isPermissionsLoading]);

  useEffect(() => {
    if (isProfileLoading || hasLoadedProfile) return;
    setHasLoadedProfile(true);
    if (policyProfile?.firmProfile) {
      const normalized = normalizeFirmProfile(policyProfile.firmProfile);
      setFirmProfile(normalized);
      setExtraFirmFields(buildExtraFirmFields(policyProfile.firmProfile));
    }
    if (policyProfile?.linkedProjectIds?.length) {
      setSelectedProjectIds(policyProfile.linkedProjectIds);
    }
    if (policyProfile?.governanceDefaults) {
      const defaults = policyProfile.governanceDefaults;
      const storedCadence =
        typeof defaults.reviewCadence === "string" && REVIEW_CADENCE_VALUES.has(defaults.reviewCadence)
          ? (defaults.reviewCadence as ReviewCadence)
          : undefined;
      const distributionDefaults = normalizeDistributionList(defaults.distributionList);
      setGovernance((prev) => ({
        ...prev,
        owner: typeof defaults.owner === "string" ? defaults.owner : prev.owner,
        version: typeof defaults.version === "string" ? defaults.version : prev.version,
        effectiveDate: typeof defaults.effectiveDate === "string" ? defaults.effectiveDate : prev.effectiveDate,
        nextReviewAt: typeof defaults.nextReviewAt === "string" ? defaults.nextReviewAt : prev.nextReviewAt,
        scopeStatement: typeof defaults.scopeStatement === "string" ? defaults.scopeStatement : prev.scopeStatement,
        reviewCadence: storedCadence ?? prev.reviewCadence,
        distributionList: distributionDefaults.length ? distributionDefaults : prev.distributionList,
        linkedProcedures: typeof defaults.linkedProcedures === "string" ? defaults.linkedProcedures : prev.linkedProcedures,
      }));
    }
  }, [policyProfile, isProfileLoading, hasLoadedProfile]);

  useEffect(() => {
    if (step === 0 && !forceSetup && !isProfileLoading && hasStoredFirmProfile) {
      setStep(1);
    }
  }, [step, forceSetup, isProfileLoading, hasStoredFirmProfile]);

  useEffect(() => {
    if (!governance.effectiveDate) return;
    if (governance.reviewCadence === "one-off") {
      setGovernance((prev) => (prev.nextReviewAt ? { ...prev, nextReviewAt: "" } : prev));
      return;
    }
    if (governance.nextReviewAt) return;
    const cadenceMonths =
      governance.reviewCadence === "quarterly"
        ? 3
        : governance.reviewCadence === "semi-annual"
          ? 6
          : 12;
    const nextReviewAt = addMonthsToDate(governance.effectiveDate, cadenceMonths);
    if (!nextReviewAt) return;
    setGovernance((prev) => (prev.nextReviewAt === nextReviewAt ? prev : { ...prev, nextReviewAt }));
  }, [governance.effectiveDate, governance.reviewCadence, governance.nextReviewAt]);

  useEffect(() => {
    let active = true;
    const loadProjects = async () => {
      setIsProjectsLoading(true);
      setProjectsError(null);
      try {
        const response = await fetch("/api/authorization-pack/projects");
        if (!response.ok) {
          throw new Error("Unable to load authorization projects");
        }
        const data = await response.json();
        if (!active) return;
        const projects = Array.isArray(data?.projects)
          ? (data.projects as Array<Record<string, unknown>>).map((project) => ({
              id: String(project.id),
              name: typeof project.name === "string" ? project.name : null,
              permissionCode:
                typeof project.permissionCode === "string"
                  ? project.permissionCode
                  : typeof project.permission_code === "string"
                    ? project.permission_code
                    : null,
              permissionName:
                typeof project.permissionName === "string"
                  ? project.permissionName
                  : typeof project.permission_name === "string"
                    ? project.permission_name
                    : null,
              status: typeof project.status === "string" ? project.status : null,
            }))
          : [];
        setAuthorizationProjects(projects);
        if (projects.length) {
          setSelectedProjectIds((prev) => (prev.length ? prev : projects.map((project) => project.id)));
        }
      } catch (err) {
        if (!active) return;
        setProjectsError(err instanceof Error ? err.message : "Unable to load authorization projects");
      } finally {
        if (!active) return;
        setIsProjectsLoading(false);
      }
    };

    void loadProjects();
    return () => {
      active = false;
    };
  }, []);

  const firmContext = useMemo(
    () => ({
      ...firmProfile,
      ...extraFirmFields,
    }),
    [firmProfile, extraFirmFields],
  );

  const additionalFirmFieldKeys = useMemo(
    () => Object.keys(extraFirmFields).filter((key) => !BUSINESS_PROFILE_FIELD_KEYS.has(key)),
    [extraFirmFields],
  );

  const effectivePermissions = useMemo(
    () => (isPermissionsLoading ? permissionsDraft : permissions),
    [isPermissionsLoading, permissionsDraft, permissions],
  );

  const rawQuestions = useMemo(
    () => (selectedTemplate ? getQuickQuestions(selectedTemplate.code).filter((q) => q.id !== "firmName") : []),
    [selectedTemplate],
  );

  const visibleQuestions = useMemo(
    () => rawQuestions.filter((question) => !PERMISSION_KEY_SET.has(question.id as keyof FirmPermissions)),
    [rawQuestions],
  );

  useEffect(() => {
    if (!selectedTemplate || rawQuestions.length === 0) return;
    setAnswers((prev) => {
      const next = { ...prev };
      rawQuestions.forEach((question) => {
        if (touched[question.id]) return;
        if (question.type === "boolean") {
          if (question.id in effectivePermissions) {
            const key = question.id as keyof FirmPermissions;
            next[question.id] = effectivePermissions[key];
          } else if (next[question.id] === undefined) {
            next[question.id] = false;
          }
        } else if (question.type === "multi") {
          if (!Array.isArray(next[question.id])) {
            next[question.id] = [];
          }
        } else if (next[question.id] === undefined) {
          next[question.id] = "";
        }
      });
      return next;
    });
  }, [effectivePermissions, rawQuestions, selectedTemplate, touched]);

  const draftPayload = useMemo(() => {
    if (!selectedTemplate) return null;
    try {
      return generateQuickPolicy({
        templateCode: selectedTemplate.code,
        answers,
        basePermissions: effectivePermissions,
        firmProfile: firmContext,
      });
    } catch {
      return null;
    }
  }, [selectedTemplate, answers, effectivePermissions, firmContext]);

  const selectedClauses = useMemo<PolicyClause[]>(() => {
    if (!selectedTemplate || !draftPayload) return [];
    const clauseIds = new Set<string>();
    Object.values(draftPayload.sectionClauses).forEach((ids) => {
      if (!Array.isArray(ids)) return;
      ids.forEach((id) => clauseIds.add(id));
    });
    (selectedTemplate.mandatoryClauses ?? []).forEach((id) => clauseIds.add(id));
    if (!clauseIds.size) return [];

    const applicableClauses = getApplicableClauses(selectedTemplate.code, draftPayload.permissions);
    return Array.from(clauseIds)
      .map((id) => applicableClauses.find((clause) => clause.id === id))
      .filter((clause): clause is PolicyClause => Boolean(clause));
  }, [draftPayload, selectedTemplate]);

  const variableAnalysis = useMemo(() => {
    const requiredFirmFields = new Set<keyof FirmProfile>(["name"]);
    const missingFirmExtras = new Set<string>();
    const missingGlobals = new Set<string>();
    const clauseVariableMap = new Map<string, Set<string>>();

    if (!selectedClauses.length) {
      return {
        requiredFirmFields: Array.from(requiredFirmFields),
        missingFirmExtras: Array.from(missingFirmExtras),
        missingGlobals: Array.from(missingGlobals),
        clauseVariableMap,
      };
    }

    const renderContext = {
      firm: firmContext,
      firm_name: firmProfile.name.trim(),
      permissions: draftPayload?.permissions ?? effectivePermissions,
    };

    selectedClauses.forEach((clause) => {
      const missing = findMissingTemplateVariables(clause.content, renderContext);
      if (!missing.length) return;
      missing.forEach((path) => {
        if (path === "firm_name") {
          requiredFirmFields.add("name");
          return;
        }
        if (path.startsWith("firm.")) {
          const rawKey = path.slice(5);
          if (KNOWN_FIRM_KEYS.has(rawKey)) {
            requiredFirmFields.add(rawKey as keyof FirmProfile);
          } else {
            missingFirmExtras.add(rawKey);
          }
          return;
        }
        missingGlobals.add(path);
        if (!clauseVariableMap.has(clause.id)) {
          clauseVariableMap.set(clause.id, new Set());
        }
        clauseVariableMap.get(clause.id)?.add(path);
      });
    });

    return {
      requiredFirmFields: Array.from(requiredFirmFields),
      missingFirmExtras: Array.from(missingFirmExtras),
      missingGlobals: Array.from(missingGlobals),
      clauseVariableMap,
    };
  }, [draftPayload?.permissions, firmContext, firmProfile.name, effectivePermissions, selectedClauses]);

  const requiredSections = useMemo(
    () => (selectedTemplate ? selectedTemplate.sections.filter((section) => section.requiresFirmNotes) : []),
    [selectedTemplate],
  );

  const isFirmFieldMissing = (key: keyof FirmProfile) => {
    if (key === "sicCodes") {
      return !Array.isArray(firmProfile.sicCodes) || firmProfile.sicCodes.length === 0;
    }
    const value = firmProfile[key];
    return typeof value !== "string" || value.trim().length === 0;
  };

  const missingFirmFields = variableAnalysis.requiredFirmFields.filter((key) => isFirmFieldMissing(key));
  const missingExtraFirmFields = variableAnalysis.missingFirmExtras.filter(
    (key) => !extraFirmFields[key]?.trim(),
  );
  const missingGovernance = REQUIRED_GOVERNANCE_FIELDS.filter((key) => {
    if (key === "nextReviewAt" && governance.reviewCadence === "one-off") {
      return false;
    }
    return !governance[key].trim();
  });
  const missingNotes = requiredSections.filter((section) => !(sectionNotes[section.id] ?? "").trim());
  const missingGlobalVariables = variableAnalysis.missingGlobals.filter((path) => !gapVariables[path]?.trim());
  const showGovernanceSection = missingGovernance.length > 0 || showGovernanceEditor;

  const gapSummary = {
    firm: missingFirmFields.length + missingExtraFirmFields.length,
    governance: missingGovernance.length,
    notes: missingNotes.length,
    placeholders: missingGlobalVariables.length,
  };

  const totalGaps = gapSummary.firm + gapSummary.governance + gapSummary.notes + gapSummary.placeholders;
  const isSetupLoading = isProfileLoading || isPermissionsLoading;
  const progressValue = Math.round(((step + 1) / STEP_LABELS.length) * 100);

  const requiredPolicyCodes = useMemo(() => requiredPolicies.map((policy) => policy.code), [requiredPolicies]);
  const orderedTemplates = useMemo(() => {
    if (!requiredPolicyCodes.length) return POLICY_TEMPLATES;
    const requiredSet = new Set(requiredPolicyCodes);
    const required = POLICY_TEMPLATES.filter((template) => requiredSet.has(template.code));
    const optional = POLICY_TEMPLATES.filter((template) => !requiredSet.has(template.code));
    return [...required, ...optional];
  }, [requiredPolicyCodes]);

  const draftRequiredPolicies = useMemo(
    () => getRequiredPolicies(permissionsDraft),
    [permissionsDraft],
  );

  const handlePermissionChange = (key: keyof FirmPermissions, checked: boolean) => {
    setPermissionsDraft((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const handleFirmProfileChange = (key: keyof FirmProfile, value: string) => {
    setFirmProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSicCodesChange = (value: string) => {
    const codes = value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
    setFirmProfile((prev) => ({
      ...prev,
      sicCodes: codes,
    }));
  };

  const handleGovernanceChange = (key: keyof GovernanceState, value: string) => {
    setGovernance((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleExtraFirmFieldChange = (key: string, value: string) => {
    setExtraFirmFields((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const addDistributionEntry = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setGovernance((prev) => ({
      ...prev,
      distributionList: Array.from(new Set([...prev.distributionList, trimmed])),
    }));
  };

  const removeDistributionEntry = (value: string) => {
    setGovernance((prev) => ({
      ...prev,
      distributionList: prev.distributionList.filter((entry) => entry !== value),
    }));
  };

  const handleDistributionPreset = (value: string) => {
    addDistributionEntry(value);
    setDistributionPreset("");
  };

  const governanceForm = (
    <>
      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Policy owner *</Label>
          <Input
            value={governance.owner}
            onChange={(event) => handleGovernanceChange("owner", event.target.value)}
            placeholder="e.g. MLRO"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Version *</Label>
          <Input
            value={governance.version}
            onChange={(event) => handleGovernanceChange("version", event.target.value)}
            placeholder="e.g. V1.0"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Effective date *</Label>
          <Input
            type="date"
            value={governance.effectiveDate}
            onChange={(event) => handleGovernanceChange("effectiveDate", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Review cadence</Label>
          <Select value={governance.reviewCadence} onValueChange={(value) => handleGovernanceChange("reviewCadence", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select cadence" />
            </SelectTrigger>
            <SelectContent>
              {REVIEW_CADENCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-400">Sets the next review date automatically.</p>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">
            Next review date {governance.reviewCadence === "one-off" ? "" : "*"}
          </Label>
          <Input
            type="date"
            value={governance.nextReviewAt}
            onChange={(event) => handleGovernanceChange("nextReviewAt", event.target.value)}
            disabled={governance.reviewCadence === "one-off"}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Scope statement *</Label>
          <Textarea
            value={governance.scopeStatement}
            onChange={(event) => handleGovernanceChange("scopeStatement", event.target.value)}
            placeholder="e.g. Covers payment services, client money, and SME onboarding across UK/EU corridors."
            className="h-24"
          />
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Optional</p>
        <div className="mt-3 space-y-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Distribution list</Label>
            <div className="space-y-2">
              <Select value={distributionPreset} onValueChange={handleDistributionPreset}>
                <SelectTrigger>
                  <SelectValue placeholder="Add a team or role" />
                </SelectTrigger>
                <SelectContent>
                  {DISTRIBUTION_PRESETS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={distributionInput}
                  onChange={(event) => setDistributionInput(event.target.value)}
                  placeholder="Add a person or team"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      if (!distributionInput.trim()) return;
                      addDistributionEntry(distributionInput);
                      setDistributionInput("");
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!distributionInput.trim()) return;
                    addDistributionEntry(distributionInput);
                    setDistributionInput("");
                  }}
                >
                  Add
                </Button>
              </div>
              {governance.distributionList.length ? (
                <div className="flex flex-wrap gap-2">
                  {governance.distributionList.map((entry) => (
                    <span
                      key={entry}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      {entry}
                      <button
                        type="button"
                        onClick={() => removeDistributionEntry(entry)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No distribution list added yet.</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Linked procedures</Label>
            <Textarea
              value={governance.linkedProcedures}
              onChange={(event) => handleGovernanceChange("linkedProcedures", event.target.value)}
              placeholder="e.g. Complaints SOP, FOS escalation, SAR reporting workflow"
              className="h-20"
            />
          </div>
        </div>
      </div>
    </>
  );

  const handleProjectToggle = (projectId: string, checked: boolean) => {
    setSelectedProjectIds((prev) => {
      if (checked) {
        return Array.from(new Set([...prev, projectId]));
      }
      return prev.filter((id) => id !== projectId);
    });
  };

  const handleApplyProjects = async () => {
    if (!selectedProjectIds.length) return;
    setIsApplyingProjects(true);
    setProjectsError(null);

    try {
      const results = await Promise.all(
        selectedProjectIds.map(async (projectId) => {
          const response = await fetch(`/api/authorization-pack/projects/${projectId}`);
          if (!response.ok) return null;
          const data = await response.json();
          return data?.project as AuthorizationProjectContext | undefined;
        }),
      );

      const contexts = results.filter(Boolean) as AuthorizationProjectContext[];
      if (!contexts.length) {
        setProjectsError("No project data available to apply.");
        return;
      }

      const profileUpdates = contexts.map((context) =>
        buildFirmProfileFromBasics(context.assessmentData?.basics, context.name ?? null),
      );
      const mergedProfile = mergeFirmProfiles(firmProfile, profileUpdates);
      setFirmProfile(mergedProfile);

      const permissionUpdates = contexts.map((context) =>
        buildPermissionsFromProject(context.permissionCode, context.assessmentData?.basics),
      );
      const mergedPermissions = mergePermissions(permissionsDraft, permissionUpdates);
      setPermissionsDraft(mergedPermissions);

      toast({
        title: "Authorization data applied",
        description: `Updated firm setup from ${contexts.length} authorization project${contexts.length === 1 ? "" : "s"}.`,
        variant: "success",
      });
    } catch (err) {
      setProjectsError(err instanceof Error ? err.message : "Unable to apply authorization projects");
    } finally {
      setIsApplyingProjects(false);
    }
  };

  const handleAnswerChange = (id: string, value: QuickAnswer) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setTouched((prev) => ({ ...prev, [id]: true }));
  };

  const handleMultiToggle = (id: string, option: string, checked: boolean) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[id]) ? (prev[id] as string[]) : [];
      const next = checked
        ? Array.from(new Set([...current, option]))
        : current.filter((value) => value !== option);
      return { ...prev, [id]: next };
    });
    setTouched((prev) => ({ ...prev, [id]: true }));
  };

  const handleSaveSetup = async () => {
    if (!firmProfile.name.trim()) {
      setError("Firm name is required.");
      return;
    }
    if (missingGovernance.length > 0) {
      setError("Complete the governance defaults before continuing.");
      return;
    }

    setIsSavingSetup(true);
    setError(null);

    try {
      const firmProfilePayload = buildFirmProfilePayload(firmProfile, extraFirmFields);
      const saved = await savePolicyProfile({
        firmProfile: firmProfilePayload,
        governanceDefaults: buildGovernanceDefaultsPayload(governance),
        linkedProjectIds: selectedProjectIds,
      });
      if (!saved) {
        throw new Error("Failed to save firm profile");
      }

      const permissionsResponse = await fetch(
        `/api/organizations/${DEFAULT_ORGANIZATION_ID}/permissions`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(permissionsDraft),
        },
      );

      if (!permissionsResponse.ok) {
        throw new Error("Failed to save permissions");
      }

      await refreshPermissions();
      await refreshPolicyProfile();
      setForceSetup(false);
      setStep(1);

      toast({
        title: "Firm setup saved",
        description: "You can now select the policies to generate.",
        variant: "success",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save firm setup");
    } finally {
      setIsSavingSetup(false);
    }
  };

  const handleTemplateSelect = (template: PolicyTemplate) => {
    setSelectedTemplate(template);
    setCreatedPolicy(null);
    setError(null);
    setStep(2);
    setSectionNotes({});
    setGapVariables({});
    setAnswers({});
    setTouched({});
  };

  const handleCreatePolicy = async () => {
    if (!selectedTemplate) return;
    if (isSetupLoading) return;
    if (totalGaps > 0) {
      setError("Complete the remaining gaps to generate the policy.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const firmProfilePayload = buildFirmProfilePayload(firmProfile, extraFirmFields);
      const normalizedSectionNotes = Object.fromEntries(
        Object.entries(sectionNotes).map(([key, value]) => [key, value.trim()]),
      );

      const clauseVariables: Record<string, Record<string, string>> = {};
      variableAnalysis.clauseVariableMap.forEach((paths, clauseId) => {
        const entries: Record<string, string> = {};
        paths.forEach((path) => {
          const value = gapVariables[path];
          if (typeof value === "string" && value.trim().length > 0) {
            entries[path] = value.trim();
          }
        });
        if (Object.keys(entries).length) {
          clauseVariables[clauseId] = entries;
        }
      });

      const distributionList = governance.distributionList
        .map((value) => value.trim())
        .filter(Boolean);
      const governancePayload = {
        owner: governance.owner.trim() || null,
        version: governance.version.trim() || null,
        effectiveDate: governance.effectiveDate || null,
        nextReviewAt: governance.reviewCadence === "one-off" ? null : governance.nextReviewAt || null,
        scopeStatement: governance.scopeStatement.trim() || null,
        reviewCadence: governance.reviewCadence,
        distributionList: distributionList.length ? distributionList : null,
        linkedProcedures: governance.linkedProcedures.trim() || null,
      };

      const payload = generateQuickPolicy({
        templateCode: selectedTemplate.code,
        answers: {
          ...answers,
          firmName: firmProfilePayload.name,
        },
        basePermissions: effectivePermissions,
        firmProfile: firmProfilePayload,
        sectionNotes: normalizedSectionNotes,
        clauseVariables,
        governance: governancePayload,
      });

      const response = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to generate policy draft");
      }

      const created = (await response.json()) as StoredPolicy;
      setCreatedPolicy(created);
      setStep(3);

      toast({
        title: "Policy created",
        description: "Your draft is ready to download and share.",
        variant: "success",
      });
    } catch (submitError) {
      console.error(submitError);
      toast({
        title: "Unable to create policy",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(hasFirmProfile ? 1 : 0);
    setSelectedTemplate(null);
    setCreatedPolicy(null);
    setError(null);
    setSectionNotes({});
    setGapVariables({});
    setAnswers({});
    setTouched({});
    setShowGovernanceEditor(false);
    setDistributionInput("");
    setDistributionPreset("");
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="gap-2 px-0 text-slate-500 hover:text-slate-700">
        <Link href="/policies">
          <ArrowLeft className="h-4 w-4" />
          Back to policy dashboard
        </Link>
      </Button>

      <header className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-indigo-500">Policy creator</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Set up once, then generate clean policies</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-500">
              Capture your firm profile once, link authorization projects, and generate policies without re-entering
              firm details each time.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-600">
            <Sparkles className="h-4 w-4" />
            Auto-selects recommended clauses
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Step {step + 1} of 4</p>
              <h2 className="text-lg font-semibold text-slate-900">{STEP_LABELS[step]}</h2>
            </div>
            <div className="text-xs text-slate-400">Drafts save to the policy register automatically.</div>
          </div>
          <Progress value={progressValue} className="bg-slate-100" />
        </div>

        <div className="mt-6">
          {step === 0 && (
            <form
              className="space-y-8"
              onSubmit={(event) => {
                event.preventDefault();
                handleSaveSetup();
              }}
            >
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">Firm setup</p>
                <p className="mt-1">This is your one-time onboarding for policy generation.</p>
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6">
                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                          Authorization projects
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-900">Link your permissions work</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Use authorization projects to prefill firm details and permissions.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleApplyProjects}
                        disabled={isApplyingProjects || !selectedProjectIds.length}
                        className="gap-2"
                      >
                        <RefreshCw className={`h-4 w-4 ${isApplyingProjects ? "animate-spin" : ""}`} />
                        {isApplyingProjects ? "Applying" : "Use selected"}
                      </Button>
                    </div>

                    {projectsError ? (
                      <p className="mt-4 text-sm text-rose-600">{projectsError}</p>
                    ) : isProjectsLoading ? (
                      <p className="mt-4 text-sm text-slate-400">Loading authorization projects...</p>
                    ) : authorizationProjects.length ? (
                      <div className="mt-4 space-y-3">
                        {authorizationProjects.map((project) => {
                          const isChecked = selectedProjectIds.includes(project.id);
                          return (
                            <label
                              key={project.id}
                              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3"
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => handleProjectToggle(project.id, checked === true)}
                                className="mt-0.5"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900">{project.name ?? "Project"}</p>
                                <p className="text-xs text-slate-500">
                                  {project.permissionName ?? project.permissionCode ?? "Permission"}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-slate-500">No authorization projects found.</p>
                    )}
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Firm essentials</p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-900">Tell us who the policies are for</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          These details appear in policy headers and template variables.
                        </p>
                      </div>
                      {hasFirmProfile ? (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Prefilled
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Companies House</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">Search and prefill firm details</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Look up your legal entity to prefill the registered name, address, and SIC codes.
                      </p>
                      <div className="mt-3">
                        <CompaniesHouseLookup
                          onSelect={(data) => {
                            setFirmProfile((prev) => ({
                              ...prev,
                              name: data.legalName || prev.name,
                              companyNumber: data.companyNumber || prev.companyNumber,
                              registeredAddress: data.registeredAddress || prev.registeredAddress,
                              sicCodes: data.sicCodes.length ? data.sicCodes : prev.sicCodes,
                            }));
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firmName" className="text-sm font-medium text-slate-700">
                          {FIRM_FIELD_DEFS.name.label} *
                        </Label>
                        <Input
                          id="firmName"
                          value={firmProfile.name}
                          onChange={(event) => handleFirmProfileChange("name", event.target.value)}
                          placeholder={FIRM_FIELD_DEFS.name.placeholder}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tradingName" className="text-sm font-medium text-slate-700">
                          {FIRM_FIELD_DEFS.tradingName.label}
                        </Label>
                        <Input
                          id="tradingName"
                          value={firmProfile.tradingName || ""}
                          onChange={(event) => handleFirmProfileChange("tradingName", event.target.value)}
                          placeholder={FIRM_FIELD_DEFS.tradingName.placeholder}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="registeredAddress" className="text-sm font-medium text-slate-700">
                          {FIRM_FIELD_DEFS.registeredAddress.label}
                        </Label>
                        <Input
                          id="registeredAddress"
                          value={firmProfile.registeredAddress || ""}
                          onChange={(event) => handleFirmProfileChange("registeredAddress", event.target.value)}
                          placeholder={FIRM_FIELD_DEFS.registeredAddress.placeholder}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyNumber" className="text-sm font-medium text-slate-700">
                          {FIRM_FIELD_DEFS.companyNumber.label}
                        </Label>
                        <Input
                          id="companyNumber"
                          value={firmProfile.companyNumber || ""}
                          onChange={(event) => handleFirmProfileChange("companyNumber", event.target.value)}
                          placeholder={FIRM_FIELD_DEFS.companyNumber.placeholder}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fcaReference" className="text-sm font-medium text-slate-700">
                          {FIRM_FIELD_DEFS.fcaReference.label}
                        </Label>
                        <Input
                          id="fcaReference"
                          value={firmProfile.fcaReference || ""}
                          onChange={(event) => handleFirmProfileChange("fcaReference", event.target.value)}
                          placeholder={FIRM_FIELD_DEFS.fcaReference.placeholder}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-sm font-medium text-slate-700">
                          {FIRM_FIELD_DEFS.website.label}
                        </Label>
                        <Input
                          id="website"
                          value={firmProfile.website || ""}
                          onChange={(event) => handleFirmProfileChange("website", event.target.value)}
                          placeholder={FIRM_FIELD_DEFS.website.placeholder}
                          type="url"
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="sicCodes" className="text-sm font-medium text-slate-700">
                          {FIRM_FIELD_DEFS.sicCodes.label}
                        </Label>
                        <Input
                          id="sicCodes"
                          value={(firmProfile.sicCodes || []).join(", ")}
                          onChange={(event) => handleSicCodesChange(event.target.value)}
                          placeholder={FIRM_FIELD_DEFS.sicCodes.placeholder}
                        />
                      </div>
                    </div>

                    {additionalFirmFieldKeys.length ? (
                      <div className="mt-5 border-t border-slate-100 pt-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                          Additional firm fields
                        </p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {additionalFirmFieldKeys.map((key) => (
                            <div key={key} className="space-y-2">
                              <Label className="text-sm font-medium text-slate-700">{humanizeLabel(key)}</Label>
                              <Input
                                value={extraFirmFields[key] ?? ""}
                                onChange={(event) =>
                                  handleExtraFirmFieldChange(key, event.target.value)
                                }
                                placeholder={formatPlaceholder(key)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Business profile</p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-900">Capture what the firm does</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          These details help tailor scope and product references across policies.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-4">
                      {BUSINESS_PROFILE_FIELDS.map((field) => (
                        <div key={field.key} className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">{field.label}</Label>
                          <Textarea
                            value={extraFirmFields[field.key] ?? ""}
                            onChange={(event) => handleExtraFirmFieldChange(field.key, event.target.value)}
                            placeholder={field.placeholder}
                            className="h-20"
                          />
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Permissions</p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-900">Confirm regulatory scope</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          We use this to work out which policies are required.
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                        {Object.values(permissionsDraft).filter(Boolean).length} selected
                      </span>
                    </div>

                    <div className="mt-4 space-y-4">
                      {PERMISSION_GROUPS.map((group) => (
                        <div key={group.id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-800">{group.title}</p>
                            <span className="text-xs text-slate-400">
                              {group.permissions.filter((permission) =>
                                permissionsDraft[permission.key as keyof FirmPermissions],
                              ).length}
                            </span>
                          </div>
                          <div className="mt-3 space-y-3">
                            {group.permissions.map((permission) => (
                              <label
                                key={permission.key}
                                className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3"
                              >
                                <Checkbox
                                  checked={permissionsDraft[permission.key as keyof FirmPermissions] ?? false}
                                  onCheckedChange={(checked) =>
                                    handlePermissionChange(permission.key as keyof FirmPermissions, checked === true)
                                  }
                                  className="mt-0.5"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-slate-900">{permission.label}</p>
                                  <p className="text-xs text-slate-500">{permission.description}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                          Governance defaults
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-900">Set policy ownership and review</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          These defaults prefill every policy. You can quick-edit them per policy later.
                        </p>
                      </div>
                      {missingGovernance.length ? (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          {missingGovernance.length} required
                        </span>
                      ) : (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Complete
                        </span>
                      )}
                    </div>
                    {governanceForm}
                  </section>
                </div>

                <aside className="space-y-6">
                  <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-400">Setup summary</p>
                    <h3 className="mt-2 text-lg font-semibold text-indigo-900">
                      {draftRequiredPolicies.length} required policies
                    </h3>
                    <p className="mt-2 text-sm text-indigo-700">
                      Based on your permissions, these policies will be generated after onboarding.
                    </p>
                    {policyProfileError ? (
                      <p className="mt-3 text-xs text-rose-600">{policyProfileError}</p>
                    ) : null}
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Next step</p>
                    <p className="mt-2 text-sm text-slate-600">
                      Save your firm setup to unlock policy generation.
                    </p>
                    <Button
                      type="submit"
                      className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700"
                      disabled={isSavingSetup || !firmProfile.name.trim() || missingGovernance.length > 0}
                    >
                      {isSavingSetup ? "Saving..." : "Save and continue"}
                    </Button>
                  </section>
                </aside>
              </div>

              {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            </form>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">{firmProfile.name || "Firm profile"}</p>
                    <p className="mt-1">Select a policy to generate from your saved firm setup.</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-slate-500"
                    onClick={() => {
                      setForceSetup(true);
                      setStep(0);
                    }}
                  >
                    Edit firm setup
                  </Button>
                </div>
              </div>

              <TemplateGrid
                templates={orderedTemplates}
                selectedTemplateCode={selectedTemplate?.code}
                requiredCodes={requiredPolicyCodes}
                onSelect={handleTemplateSelect}
              />
            </div>
          )}

          {step === 2 && selectedTemplate && (
            <form
              className="space-y-8"
              onSubmit={(event) => {
                event.preventDefault();
                handleCreatePolicy();
              }}
            >
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">{selectedTemplate.name}</p>
                    <p className="mt-1">{selectedTemplate.description}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStep(1)}
                  >
                    Change policy
                  </Button>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6">
                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Firm summary</p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-900">
                          {firmProfile.name || "Firm profile"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Firm details are pulled from onboarding. Edit them if needed.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-slate-500"
                        onClick={() => {
                          setForceSetup(true);
                          setStep(0);
                        }}
                      >
                        Edit firm setup
                      </Button>
                    </div>
                  </section>

                  {gapSummary.firm > 0 ? (
                    <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">Firm gaps</p>
                          <h3 className="mt-2 text-lg font-semibold text-amber-900">Fill missing firm details</h3>
                          <p className="mt-1 text-sm text-amber-800">
                            These placeholders are required by this policy template.
                          </p>
                        </div>
                        <span className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-700">
                          {gapSummary.firm} required
                        </span>
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {missingFirmFields.map((field) => {
                          if (field === "sicCodes") {
                            return (
                              <div key={field} className="space-y-2 sm:col-span-2">
                                <Label className="text-sm font-medium text-amber-900">
                                  {FIRM_FIELD_DEFS.sicCodes.label}
                                </Label>
                                <Input
                                  value={(firmProfile.sicCodes || []).join(", ")}
                                  onChange={(event) => handleSicCodesChange(event.target.value)}
                                  placeholder={FIRM_FIELD_DEFS.sicCodes.placeholder}
                                />
                              </div>
                            );
                          }

                          const meta = FIRM_FIELD_DEFS[field];
                          return (
                            <div key={field} className="space-y-2">
                              <Label className="text-sm font-medium text-amber-900">{meta.label}</Label>
                              <Input
                                value={(firmProfile[field] as string) ?? ""}
                                onChange={(event) =>
                                  handleFirmProfileChange(field, event.target.value)
                                }
                                placeholder={meta.placeholder}
                                type={meta.type}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {missingExtraFirmFields.length ? (
                        <div className="mt-4 border-t border-amber-100 pt-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">
                            Template-specific fields
                          </p>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            {missingExtraFirmFields.map((key) => (
                              <div key={key} className="space-y-2">
                                <Label className="text-sm font-medium text-amber-900">
                                  {humanizeLabel(key)}
                                </Label>
                                <Input
                                  value={extraFirmFields[key] ?? ""}
                                  onChange={(event) =>
                                    setExtraFirmFields((prev) => ({ ...prev, [key]: event.target.value }))
                                  }
                                  placeholder={formatPlaceholder(key)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </section>
                  ) : null}

                  {visibleQuestions.length ? (
                    <section className="rounded-2xl border border-slate-200 bg-white p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Policy switches</p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900">Answer a few policy-specific questions</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        These toggles tailor clauses and timelines for this policy.
                      </p>

                      <div className="mt-4 space-y-3">
                        {visibleQuestions.map((question) => {
                          if (question.type === "text") {
                            return (
                              <div key={question.id} className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">
                                  {question.label}
                                  {question.required ? " *" : ""}
                                </Label>
                                <Input
                                  value={
                                    typeof answers[question.id] === "string"
                                      ? (answers[question.id] as string)
                                      : ""
                                  }
                                  onChange={(event) => handleAnswerChange(question.id, event.target.value)}
                                  placeholder={question.description ?? "Enter value"}
                                />
                                {question.description ? (
                                  <p className="text-xs text-slate-400">{question.description}</p>
                                ) : null}
                              </div>
                            );
                          }

                          if (question.type === "multi") {
                            const selected = Array.isArray(answers[question.id])
                              ? (answers[question.id] as string[])
                              : [];
                            const options = question.options ?? [];
                            return (
                              <div key={question.id} className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">
                                  {question.label}
                                  {question.required ? " *" : ""}
                                </Label>
                                {question.description ? (
                                  <p className="text-xs text-slate-400">{question.description}</p>
                                ) : null}
                                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                  {options.length ? (
                                    options.map((option) => (
                                      <label
                                        key={option}
                                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2"
                                      >
                                        <Checkbox
                                          checked={selected.includes(option)}
                                          onCheckedChange={(checked) =>
                                            handleMultiToggle(question.id, option, checked === true)
                                          }
                                          className="mt-0.5"
                                        />
                                        <span className="text-sm text-slate-700">{option}</span>
                                      </label>
                                    ))
                                  ) : (
                                    <p className="text-xs text-slate-400">No options available.</p>
                                  )}
                                </div>
                              </div>
                            );
                          }

                          const checked = Boolean(answers[question.id]);
                          return (
                            <div
                              key={question.id}
                              className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"
                            >
                              <div>
                                <Label className="text-sm font-medium text-slate-700">{question.label}</Label>
                                {question.description ? (
                                  <p className="mt-1 text-xs text-slate-400">{question.description}</p>
                                ) : null}
                              </div>
                              <Switch checked={checked} onCheckedChange={(value) => handleAnswerChange(question.id, value)} />
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ) : null}

                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Required notes</p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-900">Capture firm-specific detail</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          These notes appear in the policy as tailored guidance.
                        </p>
                      </div>
                      {missingNotes.length ? (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          {missingNotes.length} required
                        </span>
                      ) : (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Complete
                        </span>
                      )}
                    </div>

                    {requiredSections.length ? (
                      <div className="mt-4 space-y-3">
                        {requiredSections.map((section) => (
                          <details key={section.id} className="group rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                            <summary className="flex cursor-pointer items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{section.title}</p>
                                <p className="text-xs text-slate-500">{section.summary}</p>
                              </div>
                              <span className="text-xs text-slate-400">Edit</span>
                            </summary>
                            <div className="mt-3">
                              <Textarea
                                value={sectionNotes[section.id] ?? ""}
                                onChange={(event) =>
                                  setSectionNotes((prev) => ({ ...prev, [section.id]: event.target.value }))
                                }
                                placeholder="Describe how this requirement applies to your firm"
                                className="h-28"
                              />
                            </div>
                          </details>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">No mandatory firm notes for this template.</p>
                    )}
                  </section>

                  {variableAnalysis.missingGlobals.length ? (
                    <section className="rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Template gaps</p>
                          <h3 className="mt-2 text-lg font-semibold text-slate-900">Fill remaining placeholders</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            These placeholders are embedded inside clauses and require a value.
                          </p>
                        </div>
                        {missingGlobalVariables.length ? (
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            {missingGlobalVariables.length} required
                          </span>
                        ) : (
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Complete
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {variableAnalysis.missingGlobals.map((path) => {
                          const isRequired = missingGlobalVariables.includes(path);
                          return (
                            <div key={path} className="space-y-2">
                              <Label className="text-sm font-medium text-slate-700">
                                {humanizeLabel(path)}{isRequired ? " *" : ""}
                              </Label>
                              <Input
                                value={gapVariables[path] ?? ""}
                                onChange={(event) =>
                                  setGapVariables((prev) => ({ ...prev, [path]: event.target.value }))
                                }
                                placeholder={formatPlaceholder(path)}
                              />
                              <p className="text-xs text-slate-400">Token: {path}</p>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ) : null}
                </div>

                <aside className="space-y-6">
                  {showGovernanceSection ? (
                    <section className="rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Governance</p>
                          <h3 className="mt-2 text-lg font-semibold text-slate-900">Quick edit governance</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Defaults come from onboarding. Update them for this policy if needed.
                          </p>
                        </div>
                        {missingGovernance.length === 0 ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-slate-500"
                            onClick={() => setShowGovernanceEditor(false)}
                          >
                            Hide
                          </Button>
                        ) : (
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            {missingGovernance.length} required
                          </span>
                        )}
                      </div>
                      {governanceForm}
                    </section>
                  ) : (
                    <section className="rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Governance</p>
                          <h3 className="mt-2 text-lg font-semibold text-slate-900">Defaults ready</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Using your onboarding defaults for this policy.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-slate-500"
                          onClick={() => setShowGovernanceEditor(true)}
                        >
                          Quick edit
                        </Button>
                      </div>
                      <div className="mt-4 space-y-2 text-xs text-slate-500">
                        <div className="flex items-center justify-between">
                          <span>Owner</span>
                          <span className="font-semibold text-slate-700">
                            {governance.owner || "Not set"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Version</span>
                          <span className="font-semibold text-slate-700">
                            {governance.version || "Not set"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Next review</span>
                          <span className="font-semibold text-slate-700">
                            {governance.nextReviewAt || "Not set"}
                          </span>
                        </div>
                      </div>
                    </section>
                  )}

                  <section
                    className={`rounded-2xl border p-5 ${
                      totalGaps > 0 ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Gap summary</p>
                    <div className="mt-2">
                      <p className="text-3xl font-semibold text-slate-900">{totalGaps}</p>
                      <p className="text-sm text-slate-600">gaps remaining</p>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>Firm details</span>
                        <span className="font-semibold">{gapSummary.firm}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Governance</span>
                        <span className="font-semibold">{gapSummary.governance}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Section notes</span>
                        <span className="font-semibold">{gapSummary.notes}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Placeholders</span>
                        <span className="font-semibold">{gapSummary.placeholders}</span>
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-slate-500">
                      Fill every required field to generate a clean policy draft.
                    </p>
                  </section>
                </aside>
              </div>

              {error ? <p className="text-sm text-rose-600">{error}</p> : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="text-slate-500">
                  Back
                </Button>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  type="submit"
                  disabled={Boolean(isSubmitting) || isSetupLoading || totalGaps > 0}
                >
                  {isSubmitting ? "Generating policy..." : "Generate policy"}
                </Button>
              </div>
            </form>
          )}

          {step === 3 && createdPolicy && (
            <div className="space-y-6">
              <div className="flex items-start gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <CheckCircle2 className="mt-1 h-6 w-6 text-emerald-500" />
                <div>
                  <h3 className="text-base font-semibold text-emerald-900">Policy draft created</h3>
                  <p className="mt-1 text-sm text-emerald-700">
                    {createdPolicy.name} is ready to download and share internally.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                  <a href={`/api/policies/${createdPolicy.id}/documents/docx`}>Download DOCX</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href={`/api/policies/${createdPolicy.id}/documents/pdf`}>Download PDF</a>
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Create another
                </Button>
                <Button variant="ghost" asChild className="text-slate-500">
                  <Link href="/policies/register">Go to register</Link>
                </Button>
              </div>
              <p className="text-xs text-slate-400">
                Need the full policy view? Open it from the policy register when you are ready.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
