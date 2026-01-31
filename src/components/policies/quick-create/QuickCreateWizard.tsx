"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  GOLD_STANDARD_POLICY_CODES,
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
import {
  formatNoteValue,
  getNoteSections,
  parseNoteCustomText,
  parseNoteSelections,
} from "@/lib/policies/section-notes";
import { FirmSetupStep } from "./steps/FirmSetupStep";
import { PolicyGapsStep } from "./steps/PolicyGapsStep";
import {
  BUSINESS_PROFILE_FIELD_KEYS,
  BUSINESS_PROFILE_OPTION_LOOKUP,
  BUSINESS_PROFILE_OTHER_OPTION,
  PERMISSION_KEY_SET,
  REQUIRED_GOVERNANCE_FIELDS,
  STEP_LABELS,
} from "./constants";
import {
  addMonthsToDate,
  buildExtraFirmFields,
  buildFirmProfilePayload,
  buildGovernanceDefaultsPayload,
  coerceReviewCadence,
  normalizeDistributionList,
  normalizeFirmProfile,
  parseMultiSelectValue,
} from "./helpers";
import type { AuthorizationProjectSummary, GovernanceState } from "./types";

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
      const storedCadence = coerceReviewCadence(defaults.reviewCadence);
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
      ...(draftPayload?.policyInputs ?? {}),
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

  const noteSections = useMemo(
    () => (selectedTemplate ? getNoteSections(selectedTemplate) : []),
    [selectedTemplate],
  );
  const noteSectionMap = useMemo(() => new Map(noteSections.map((section) => [section.id, section])), [noteSections]);
  const requiredSections = useMemo(
    () => noteSections.filter((section) => section.required),
    [noteSections],
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
  const hasRequiredNotes = requiredSections.length > 0;
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
  const isSkippingSetup = hasStoredFirmProfile && !forceSetup;
  const resolvedStep = isSkippingSetup && step === 0 ? 1 : step;
  const activeSteps = isSkippingSetup ? STEP_LABELS.slice(1) : STEP_LABELS;
  const displayStepIndex = isSkippingSetup ? Math.max(resolvedStep - 1, 0) : resolvedStep;
  const progressValue = Math.round(((displayStepIndex + 1) / activeSteps.length) * 100);
  const isEditingSetup = resolvedStep === 0;

  const requiredPolicyCodes = useMemo(() => requiredPolicies.map((policy) => policy.code), [requiredPolicies]);
  const goldStandardSet = useMemo(() => new Set(GOLD_STANDARD_POLICY_CODES), []);
  const availableTemplates = useMemo(
    () => POLICY_TEMPLATES.filter((template) => goldStandardSet.has(template.code)),
    [goldStandardSet],
  );
  const orderedTemplates = useMemo(() => {
    if (!requiredPolicyCodes.length) return availableTemplates;
    const requiredSet = new Set(requiredPolicyCodes);
    const required = availableTemplates.filter((template) => requiredSet.has(template.code));
    const optional = availableTemplates.filter((template) => !requiredSet.has(template.code));
    return [...required, ...optional];
  }, [availableTemplates, requiredPolicyCodes]);

  const draftRequiredPolicies = useMemo(
    () => getRequiredPolicies(permissionsDraft),
    [permissionsDraft],
  );

  const firmName = typeof firmProfile.name === "string" ? firmProfile.name.trim() : "";

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

  const handleBusinessProfileToggle = (key: string, option: string, checked?: boolean) => {
    setExtraFirmFields((prev) => {
      const current = new Set(parseMultiSelectValue(prev[key]));
      const shouldSelect = typeof checked === "boolean" ? checked : !current.has(option);
      if (shouldSelect) {
        current.add(option);
      } else if (current.has(option)) {
        current.delete(option);
      }

      const next = {
        ...prev,
        [key]: Array.from(current).join(", "),
      } as Record<string, string>;

      if (option === BUSINESS_PROFILE_OTHER_OPTION && !current.has(option)) {
        next[`${key}Other`] = "";
        const knownOptions = new Set(BUSINESS_PROFILE_OPTION_LOOKUP[key] ?? []);
        Array.from(current).forEach((entry) => {
          if (entry !== BUSINESS_PROFILE_OTHER_OPTION && !knownOptions.has(entry)) {
            current.delete(entry);
          }
        });
        next[key] = Array.from(current).join(", ");
      }

      return next;
    });
  };

  const handleBusinessProfileOtherChange = (key: string, value: string) => {
    setExtraFirmFields((prev) => {
      const current = new Set(parseMultiSelectValue(prev[key]));
      if (value.trim()) {
        current.add(BUSINESS_PROFILE_OTHER_OPTION);
      }

      return {
        ...prev,
        [key]: Array.from(current).join(", "),
        [`${key}Other`]: value,
      };
    });
  };

  const handleSectionNoteToggle = (sectionId: string, option: string, checked: boolean) => {
    setSectionNotes((prev) => {
      const options = noteSectionMap.get(sectionId)?.options ?? [];
      const current = parseNoteSelections(prev[sectionId], options, firmName);
      const customText = parseNoteCustomText(prev[sectionId], options, firmName);
      const next = checked
        ? Array.from(new Set([...current, option]))
        : current.filter((value) => value !== option);
      return { ...prev, [sectionId]: formatNoteValue(next, customText) };
    });
  };

  const handleSectionNoteCustomChange = (sectionId: string, value: string) => {
    setSectionNotes((prev) => {
      const options = noteSectionMap.get(sectionId)?.options ?? [];
      const current = parseNoteSelections(prev[sectionId], options, firmName);
      return { ...prev, [sectionId]: formatNoteValue(current, value) };
    });
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
        Object.entries(sectionNotes)
          .map(([key, value]) => [key, value.trim()])
          .filter(([, value]) => value.length > 0),
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
  };

  const handleEditSetup = () => {
    setForceSetup(true);
    setStep(0);
  };

  const headerTitle = isEditingSetup
    ? "Update firm setup"
    : hasStoredFirmProfile
      ? "Generate clean policies"
      : "Set up once, then generate clean policies";
  const headerDescription = isEditingSetup
    ? "Adjust your saved firm profile, permissions, and governance defaults."
    : hasStoredFirmProfile
      ? "Your firm setup is saved. Pick a policy and answer only what is missing for this draft."
      : "Capture your firm profile once, link authorization projects, and generate policies without re-entering firm details each time.";

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
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-900">{headerTitle}</h1>
              {hasStoredFirmProfile && !isEditingSetup ? (
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-xs text-emerald-700">
                  Firm setup saved
                </Badge>
              ) : null}
            </div>
            <p className="mt-3 max-w-2xl text-sm text-slate-500">{headerDescription}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {hasStoredFirmProfile && !isEditingSetup ? (
              <Button type="button" variant="outline" size="sm" onClick={handleEditSetup}>
                Quick edit firm setup
              </Button>
            ) : null}
            <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-600">
              <Sparkles className="h-4 w-4" />
              Auto-selects recommended clauses
            </div>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Step {displayStepIndex + 1} of {activeSteps.length}
              </p>
              <h2 className="text-lg font-semibold text-slate-900">
                {activeSteps[displayStepIndex] ?? STEP_LABELS[resolvedStep]}
              </h2>
            </div>
            <div className="text-xs text-slate-400">Drafts save to the policy register automatically.</div>
          </div>
          <Progress value={progressValue} className="bg-slate-100" />
        </div>

        <div className="mt-6">
          {resolvedStep === 0 && (
            <FirmSetupStep
              firmProfile={firmProfile}
              extraFirmFields={extraFirmFields}
              additionalFirmFieldKeys={additionalFirmFieldKeys}
              permissionsDraft={permissionsDraft}
              governance={governance}
              missingGovernance={missingGovernance}
              draftRequiredPolicies={draftRequiredPolicies}
              policyProfileError={policyProfileError}
              error={error}
              isSavingSetup={isSavingSetup}
              isApplyingProjects={isApplyingProjects}
              isProjectsLoading={isProjectsLoading}
              projectsError={projectsError}
              authorizationProjects={authorizationProjects}
              selectedProjectIds={selectedProjectIds}
              onProjectToggle={handleProjectToggle}
              onApplyProjects={handleApplyProjects}
              onFirmProfileChange={handleFirmProfileChange}
              onSicCodesChange={handleSicCodesChange}
              onExtraFirmFieldChange={handleExtraFirmFieldChange}
              onBusinessProfileToggle={handleBusinessProfileToggle}
              onBusinessProfileOtherChange={handleBusinessProfileOtherChange}
              onPermissionChange={handlePermissionChange}
              onSave={handleSaveSetup}
              onCompaniesHouseSelect={(data) => {
                setFirmProfile((prev) => ({
                  ...prev,
                  name: data.legalName || prev.name,
                  companyNumber: data.companyNumber || prev.companyNumber,
                  registeredAddress: data.registeredAddress || prev.registeredAddress,
                  sicCodes: data.sicCodes.length ? data.sicCodes : prev.sicCodes,
                }));
              }}
              onGovernanceFieldChange={handleGovernanceChange}
              onAddDistribution={addDistributionEntry}
              onRemoveDistribution={removeDistributionEntry}
            />
          )}

          {resolvedStep === 1 && (
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
                    onClick={handleEditSetup}
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

          {resolvedStep === 2 && selectedTemplate && (
            <PolicyGapsStep
              selectedTemplate={selectedTemplate}
              firmProfile={firmProfile}
              extraFirmFields={extraFirmFields}
              missingFirmFields={missingFirmFields}
              missingExtraFirmFields={missingExtraFirmFields}
              gapSummary={gapSummary}
              missingGlobalVariables={missingGlobalVariables}
              gapVariables={gapVariables}
              noteSections={noteSections}
              sectionNotes={sectionNotes}
              missingNotes={missingNotes}
              hasRequiredNotes={hasRequiredNotes}
              questions={visibleQuestions}
              answers={answers}
              onAnswerChange={handleAnswerChange}
              onMultiToggle={handleMultiToggle}
              onSectionNoteToggle={handleSectionNoteToggle}
              onSectionNoteCustomChange={handleSectionNoteCustomChange}
              onGapVariableChange={(path, value) =>
                setGapVariables((prev) => ({
                  ...prev,
                  [path]: value,
                }))
              }
              onFirmProfileChange={handleFirmProfileChange}
              onSicCodesChange={handleSicCodesChange}
              onExtraFirmFieldChange={handleExtraFirmFieldChange}
              onEditSetup={() => {
                setForceSetup(true);
                setStep(0);
              }}
              onChangePolicy={() => setStep(1)}
              onCreatePolicy={handleCreatePolicy}
              isSubmitting={isSubmitting}
              isSetupLoading={isSetupLoading}
              totalGaps={totalGaps}
              showGovernanceSection={showGovernanceSection}
              missingGovernance={missingGovernance}
              onShowGovernance={() => setShowGovernanceEditor(true)}
              onHideGovernance={() => setShowGovernanceEditor(false)}
              governance={governance}
              onGovernanceFieldChange={handleGovernanceChange}
              onAddDistribution={addDistributionEntry}
              onRemoveDistribution={removeDistributionEntry}
              error={error}
            />
          )}

          {resolvedStep === 3 && createdPolicy && (
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
                  <Link href={`/policies/register?highlight=${createdPolicy.id}`}>Go to register</Link>
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
