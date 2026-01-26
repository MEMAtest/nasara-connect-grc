"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NasaraLoader } from "@/components/ui/nasara-loader";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, Calculator, ChevronDown, HelpCircle, Info, Loader2, Lock, Sparkles, XCircle } from "lucide-react";
import {
  buildProfileInsights,
  getPackSectionLabel,
  getProfileQuestions,
  getProfileSections,
  isProfilePermissionCode,
  SECTION_DEPENDENCIES,
  type ProfileQuestion,
  type ProfileResponse,
} from "@/lib/business-plan-profile";

interface BusinessPlanProfileClientProps {
  projectId: string;
  permissionCode?: string | null;
  permissionName?: string | null;
  onNextPhase?: () => void;
}

const CHART_COLORS = ["#0f766e", "#2563eb", "#f97316", "#7c3aed", "#e11d48", "#16a34a"];

const verdictStyles: Record<string, string> = {
  "in-scope": "bg-emerald-100 text-emerald-700",
  "possible-exemption": "bg-amber-100 text-amber-700",
  "out-of-scope": "bg-slate-100 text-slate-600",
  unknown: "bg-slate-100 text-slate-600",
};

type PrefillEntry = { label: string; value: ProfileResponse };

const PAYMENT_SERVICE_PREFILL_MAP: Record<string, string> = {
  "ps-cash-payment-account": "cash-deposit",
  "ps-cash-withdrawal": "cash-withdrawal",
  "ps-execution-payment-account": "execution-transfers",
  "ps-execution-credit-line": "execution-transfers",
  "ps-issuing-acquiring": "issuing-acquiring",
  "ps-money-remittance": "money-remittance",
  "ps-pis": "payment-initiation",
  "ps-ais": "account-info",
  "payment-initiation": "payment-initiation",
  "account-info-services": "account-info",
  "money-transmission": "money-remittance",
  "card-issuing": "issuing-acquiring",
  acquiring: "issuing-acquiring",
};

const TARGET_MARKET_PREFILL_MAP: Record<string, string> = {
  "uk-only": "uk",
  "uk-eea": "uk-eea",
  "uk-international": "global",
  global: "global",
};

const parseCommaList = (value: unknown) => {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const buildPrefilledResponses = (basics: Record<string, unknown> | null): Record<string, PrefillEntry> => {
  if (!basics) return {};
  const prefills: Record<string, PrefillEntry> = {};
  const headcount = basics.headcount;
  if ((typeof headcount === "string" || typeof headcount === "number") && String(headcount).trim().length) {
    prefills["pay-headcount"] = { label: "project setup", value: String(headcount) };
  }
  const targetMarket = typeof basics.targetMarkets === "string" ? basics.targetMarkets : "";
  const mappedTarget = TARGET_MARKET_PREFILL_MAP[targetMarket];
  if (mappedTarget) {
    prefills["core-geography"] = { label: "project setup", value: mappedTarget };
  }
  const regulatedActivities = parseCommaList(basics.regulatedActivities);
  if (regulatedActivities.length) {
    const mappedServices = Array.from(
      new Set(
        regulatedActivities
          .map((activity) => PAYMENT_SERVICE_PREFILL_MAP[activity])
          .filter((value): value is string => Boolean(value))
      )
    );
    if (mappedServices.length) {
      prefills["pay-services"] = { label: "project setup", value: mappedServices };
    }
  }
  return prefills;
};

const SECTION_TAB_LABELS: Record<string, string> = {
  scope: "Scope",
  model: "Business Model",
  operations: "Operations",
  governance: "Governance",
  financials: "Financials",
  payments: "Payments",
  "consumer-credit": "Consumer Credit",
  investments: "Investments",
};

function HelpTooltip({ label, description }: { label: string; description: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="rounded-full p-1 text-slate-400 transition hover:text-slate-600"
          aria-label={`${label} help`}
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={6} className="max-w-xs text-left">
        <p className="font-semibold">{label}</p>
        <p className="mt-1">{description}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function CollapsibleInsightCard({
  title,
  description,
  helpLabel,
  helpDescription,
  defaultOpen = false,
  children,
}: {
  title: string;
  description: string;
  helpLabel: string;
  helpDescription: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border border-slate-200">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <span>{title}</span>
              <HelpTooltip label={helpLabel} description={helpDescription} />
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-1 text-slate-500 hover:text-slate-700"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-2">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function BusinessPlanProfileClient({
  projectId,
  permissionCode,
  permissionName,
  onNextPhase,
}: BusinessPlanProfileClientProps) {
  const permission = isProfilePermissionCode(permissionCode)
    ? permissionCode
    : permissionCode?.startsWith("payments")
    ? "payments"
    : null;
  const sections = useMemo(() => getProfileSections(permission), [permission]);
  const questions = useMemo(() => getProfileQuestions(permission), [permission]);

  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id ?? "");
  const [responses, setResponses] = useState<Record<string, ProfileResponse>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingLabel, setLoadingLabel] = useState("Loading business plan profile...");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [otherTextValues, setOtherTextValues] = useState<Record<string, string>>({});
  const [setupBasics, setSetupBasics] = useState<Record<string, unknown> | null>(null);
  const [prefillOverrides, setPrefillOverrides] = useState<Set<string>>(new Set());

  const insights = useMemo(() => buildProfileInsights(permission, responses), [permission, responses]);
  const prefilledResponses = useMemo(() => buildPrefilledResponses(setupBasics), [setupBasics]);

  // Calculate section dependencies
  const sectionReadiness = useMemo(() => {
    const readiness: Record<string, { complete: boolean; blocked: boolean; blockedBy: string[] }> = {};
    const sectionCompletionMap: Record<string, boolean> = {};

    // First pass: determine completion status
    for (const section of sections) {
      const sectionQuestions = questions.filter((q) => q.sectionId === section.id);
      const requiredQuestions = sectionQuestions.filter((q) => q.required);
      const answeredRequired = requiredQuestions.filter((q) => {
        const response = responses[q.id];
        if (response === undefined || response === null) return false;
        if (Array.isArray(response)) return response.length > 0;
        if (typeof response === "string") return response.trim().length > 0;
        return true;
      });
      sectionCompletionMap[section.id] = requiredQuestions.length === 0 || answeredRequired.length === requiredQuestions.length;
    }

    // Second pass: determine blocking status
    for (const section of sections) {
      const deps = SECTION_DEPENDENCIES.find((d) => d.sectionId === section.id);
      const blockedBy: string[] = [];
      if (deps) {
        for (const depId of deps.dependsOn) {
          if (!sectionCompletionMap[depId]) {
            blockedBy.push(depId);
          }
        }
      }
      readiness[section.id] = {
        complete: sectionCompletionMap[section.id],
        blocked: blockedBy.length > 0,
        blockedBy,
      };
    }

    return readiness;
  }, [sections, questions, responses]);

  useEffect(() => {
    if (!sections.length) return;
    if (!sections.find((section) => section.id === activeSectionId)) {
      setActiveSectionId(sections[0].id);
    }
  }, [sections, activeSectionId]);

  useEffect(() => {
    let isActive = true;
    const loadProfileAndBasics = async () => {
      if (!projectId) {
        if (isActive) {
          setResponses({});
          setOtherTextValues({});
          setSetupBasics(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setLoadError(null);
      setLoadingProgress(10);
      setLoadingLabel("Loading business plan profile...");

      try {
        const response = await fetch(`/api/authorization-pack/projects/${projectId}/business-plan-profile`);
        if (!response.ok) {
          if (isActive) {
            setLoadError("Unable to load business plan profile.");
          }
          return;
        }

        const data = await response.json();
        if (!isActive) return;

        const nextResponses = data?.profile?.responses ?? {};
        setResponses(nextResponses);
        const extractedOtherTexts: Record<string, string> = {};
        for (const key of Object.keys(nextResponses)) {
          if (key.endsWith("_other_text") && typeof nextResponses[key] === "string") {
            const questionId = key.replace("_other_text", "");
            extractedOtherTexts[questionId] = nextResponses[key] as string;
          }
        }
        setOtherTextValues(extractedOtherTexts);

        setLoadingProgress(60);
        setLoadingLabel("Loading company setup...");

        const basicsResponse = await fetch(`/api/authorization-pack/projects/${projectId}`);
        const basicsData = await basicsResponse.json().catch(() => ({}));
        if (!isActive) return;

        if (basicsResponse.ok) {
          const basics = basicsData?.project?.assessmentData?.basics;
          if (basics && typeof basics === "object" && !Array.isArray(basics)) {
            setSetupBasics(basics as Record<string, unknown>);
          } else {
            setSetupBasics(null);
          }
        } else {
          setSetupBasics(null);
        }

        setLoadingProgress(90);
        setLoadingLabel("Preparing profile insights...");
      } catch (error) {
        if (isActive) {
          setLoadError(error instanceof Error ? error.message : "Unable to load business plan profile.");
        }
      } finally {
        if (isActive) {
          setLoadingProgress(100);
          setIsLoading(false);
        }
      }
    };

    void loadProfileAndBasics();
    return () => {
      isActive = false;
    };
  }, [projectId]);

  useEffect(() => {
    setPrefillOverrides(new Set());
  }, [projectId]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      // Merge otherTextValues into responses before saving
      const responsesWithOther = { ...responses };
      for (const [questionId, text] of Object.entries(otherTextValues)) {
        const question = questions.find((item) => item.id === questionId);
        const response = responses[questionId];
        const hasOtherSelected =
          question?.allowOther &&
          ((Array.isArray(response) && response.includes("other")) || response === "other");

        if (text.trim() && hasOtherSelected) {
          responsesWithOther[`${questionId}_other_text`] = text;
        } else if (responsesWithOther[`${questionId}_other_text`]) {
          delete responsesWithOther[`${questionId}_other_text`];
        }
      }
      const response = await fetch(`/api/authorization-pack/projects/${projectId}/business-plan-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: responsesWithOther }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setSaveMessage(errorData.error || "Failed to save profile.");
        return false;
      }

      setSaveMessage("Profile saved.");
      return true;
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Failed to save profile.");
      return false;
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 2500);
    }
  };

  const handleNextPhase = async () => {
    if (!onNextPhase || isSaving) return;
    const saved = await handleSave();
    if (saved) {
      onNextPhase();
    }
  };

  const scrollToTop = () => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const jumpToSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    scrollToTop();
  };

  const updateResponse = (questionId: string, value: ProfileResponse) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const enablePrefillOverride = (questionId: string) => {
    setPrefillOverrides((prev) => {
      const next = new Set(prev);
      next.add(questionId);
      return next;
    });
  };

  const resetPrefillOverride = (questionId: string) => {
    const prefill = prefilledResponses[questionId];
    if (prefill) {
      updateResponse(questionId, prefill.value);
    }
    setPrefillOverrides((prev) => {
      const next = new Set(prev);
      next.delete(questionId);
      return next;
    });
  };

  const parseNumericValue = (value: ProfileResponse | undefined) => {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (typeof value === "string") {
      const cleaned = value.replace(/,/g, "").trim();
      if (!cleaned) return null;
      const parsed = Number(cleaned);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  const buildCapitalHelper = () => {
    const method = typeof responses["pay-capital-method"] === "string" ? responses["pay-capital-method"] : null;
    const monthlyOpex = parseNumericValue(responses["pay-monthly-opex"]);
    const formatNumber = (value: number) => value.toLocaleString("en-GB");

    if (!method) {
      return {
        title: "Capital calculation helper",
        lines: ["Select a capital method to see the inputs needed for your calculation."],
      };
    }

    if (method === "method-a") {
      if (monthlyOpex === null) {
        return {
          title: "Method A (fixed overheads)",
          lines: ["Enter monthly operating expenditure to estimate 10% of annual fixed overheads."],
        };
      }
      const annualOverheads = monthlyOpex * 12;
      const ownFunds = annualOverheads * 0.1;
      return {
        title: "Method A (fixed overheads)",
        lines: [
          `Annual fixed overheads estimate: £${formatNumber(annualOverheads)}`,
          `Own funds estimate (10%): £${formatNumber(ownFunds)}`,
        ],
      };
    }

    if (method === "method-b") {
      return {
        title: "Method B (volume tiers)",
        lines: [
          "Requires expected transaction volume to apply tiered percentages.",
          "Complete the transaction volume question before calculating Method B.",
        ],
      };
    }

    if (method === "method-c") {
      return {
        title: "Method C (income-based)",
        lines: ["Requires forecasted income/fees to compute the own funds requirement."],
      };
    }

    return {
      title: "Capital calculation helper",
      lines: ["Select Method A, B, or C to see the calculation inputs."],
    };
  };

  const buildQuestionMeta = (question: ProfileQuestion) => {
    const regulatoryRefs = question.regulatoryRefs ?? [];
    const packLabels = (question.packSectionKeys ?? []).map(getPackSectionLabel);
    const parts: string[] = [];
    if (regulatoryRefs.length) {
      parts.push(`Regulatory source: ${regulatoryRefs.join(", ")}`);
    }
    if (packLabels.length) {
      parts.push(`Feeds into: ${packLabels.join(", ")}`);
    }
    return {
      text: parts.join(" - "),
      regulatoryRefs,
      packLabels,
    };
  };

  const isResponseComplete = (question: ProfileQuestion, response: ProfileResponse | undefined) => {
    if (
      question.allowOther &&
      ((Array.isArray(response) && response.includes("other")) || response === "other")
    ) {
      return Boolean(otherTextValues[question.id]?.trim());
    }
    if (response === undefined || response === null) return false;
    if (Array.isArray(response)) return response.length > 0;
    if (typeof response === "string") return response.trim().length > 0;
    return true;
  };

  const formatAnswer = (question: ProfileQuestion, response: ProfileResponse | undefined) => {
    if (response === undefined || response === null) return "";
    const resolveOption = (value: string) => {
      if (value === "other") {
        const otherText = otherTextValues[question.id]?.trim();
        return otherText ? `Other: ${otherText}` : "Other";
      }
      const option = question.options?.find((opt) => opt.value === value);
      return option?.label ?? value;
    };
    if (Array.isArray(response)) {
      return response.map((value) => resolveOption(String(value))).filter(Boolean).join(", ");
    }
    if (typeof response === "boolean") return response ? "Yes" : "No";
    if (typeof response === "number") return response.toLocaleString("en-GB");
    if (typeof response === "string") {
      if (response === "other") {
        const otherText = otherTextValues[question.id]?.trim();
        return otherText ? `Other: ${otherText}` : "Other";
      }
      const option = question.options?.find((opt) => opt.value === response);
      return option?.label ?? response;
    }
    return String(response);
  };

  const sectionProgress = useMemo(
    () =>
      sections.map((section) => {
        const sectionQuestions = questions.filter((question) => question.sectionId === section.id);
        const answered = sectionQuestions.filter((question) => isResponseComplete(question, responses[question.id])).length;
        const total = sectionQuestions.length;
        return {
          id: section.id,
          title: section.title,
          answered,
          total,
          remaining: Math.max(total - answered, 0),
        };
      }),
    [sections, questions, responses, otherTextValues]
  );

  const incompleteSections = sectionProgress.filter((section) => section.remaining > 0);
  const missingRequired = useMemo(
    () =>
      questions
        .filter((question) => question.required)
        .filter((question) => !isResponseComplete(question, responses[question.id])),
    [questions, responses, otherTextValues]
  );
  const remainingRequired = questions
    .filter((question) => question.required)
    .filter((question) => !isResponseComplete(question, responses[question.id])).length;
  const aiReady = remainingRequired === 0;
  const answerSummary = useMemo(
    () =>
      sections
        .map((section) => {
          const sectionQuestions = questions.filter((question) => question.sectionId === section.id);
          const answeredItems = sectionQuestions
            .map((question) => {
              const response = responses[question.id];
              if (!isResponseComplete(question, response)) return null;
              return {
                id: question.id,
                prompt: question.prompt,
                value: formatAnswer(question, response),
              };
            })
            .filter((item): item is { id: string; prompt: string; value: string } => Boolean(item && item.value));
          return {
            id: section.id,
            label: SECTION_TAB_LABELS[section.id] ?? section.title,
            items: answeredItems,
          };
        })
        .filter((section) => section.items.length > 0),
    [sections, questions, responses, otherTextValues]
  );
  const monthlyOpex = parseNumericValue(responses["pay-monthly-opex"]);
  const monthlyVolume = parseNumericValue(responses["pay-volume"]);
  const capitalEstimate = insights.capitalEstimate;
  const volumeSeries = useMemo(
    () =>
      monthlyVolume && Number.isFinite(monthlyVolume)
        ? Array.from({ length: 12 }, (_, idx) => ({
            month: `M${idx + 1}`,
            volume: monthlyVolume,
          }))
        : [],
    [monthlyVolume]
  );

  const toggleMultiChoice = (question: ProfileQuestion, optionValue: string) => {
    setResponses((prev) => {
      const current = Array.isArray(prev[question.id]) ? (prev[question.id] as string[]) : [];
      const alreadySelected = current.includes(optionValue);
      if (!alreadySelected && question.maxSelections && current.length >= question.maxSelections) {
        return prev;
      }
      const next = current.includes(optionValue)
        ? current.filter((value) => value !== optionValue)
        : [...current, optionValue];
      return { ...prev, [question.id]: next };
    });
  };

  const getSelectedImplication = (question: ProfileQuestion) => {
    const value = responses[question.id];
    if (!question.options || !value) return null;

    if (question.type === "single-choice" && typeof value === "string") {
      const option = question.options.find((opt) => opt.value === value);
      return option?.implication;
    }

    if (question.type === "multi-choice" && Array.isArray(value)) {
      const implications = question.options
        .filter((opt) => value.includes(opt.value) && opt.implication)
        .map((opt) => opt.implication);
      return implications.length > 0 ? implications : null;
    }

    return null;
  };

  const renderQuestionInput = (question: ProfileQuestion) => {
    const value = responses[question.id];
    const prefill = prefilledResponses[question.id];
    const isPrefillLocked = Boolean(prefill) && !prefillOverrides.has(question.id);
    const implication = getSelectedImplication(question);
    const implicationList = Array.isArray(implication) ? implication : implication ? [implication] : [];
    const hasOtherSelected =
      question.allowOther &&
      ((Array.isArray(value) && value.includes("other")) || value === "other");

    if (isPrefillLocked) {
      const displayValue = formatAnswer(question, value ?? prefill?.value);
      return (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
            <span>Imported from {prefill?.label ?? "project setup"}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-slate-600"
              onClick={() => enablePrefillOverride(question.id)}
            >
              Edit here
            </Button>
          </div>
          <p className="mt-1 text-sm text-slate-700">{displayValue || "Not provided in setup"}</p>
        </div>
      );
    }

    const prefillNote = prefill ? (
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>Imported from {prefill.label}. Editing here overrides it.</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-slate-600"
          onClick={() => resetPrefillOverride(question.id)}
        >
          Use setup value
        </Button>
      </div>
    ) : null;

    if (question.type === "single-choice" && question.options) {
      return (
        <div className="space-y-2">
          <Select value={typeof value === "string" ? value : ""} onValueChange={(val) => updateResponse(question.id, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasOtherSelected && (
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Please specify:</Label>
              <Input
                value={otherTextValues[question.id] || ""}
                onChange={(event) => {
                  setOtherTextValues((prev) => ({ ...prev, [question.id]: event.target.value }));
                }}
                placeholder="Describe your other option..."
                className="text-sm"
              />
            </div>
          )}
          {implicationList.length > 0 && (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
              <div className="space-y-1">
                {implicationList.map((item, index) => (
                  <p key={`${question.id}-implication-${index}`}>{item}</p>
                ))}
              </div>
            </div>
          )}
          {prefillNote}
        </div>
      );
    }

    if (question.type === "multi-choice" && question.options) {
      const selected = Array.isArray(value) ? value : [];
      const maxSelections = question.maxSelections ?? null;
      const selectionLimitReached = maxSelections ? selected.length >= maxSelections : false;
      return (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {question.options.map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-2 text-sm ${selectionLimitReached && !selected.includes(option.value) ? "text-slate-400" : "text-slate-700"}`}
              >
                <Checkbox
                  checked={selected.includes(option.value)}
                  disabled={selectionLimitReached && !selected.includes(option.value)}
                  onCheckedChange={() => toggleMultiChoice(question, option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {maxSelections ? (
            <p className="text-xs text-slate-500">
              Select up to {maxSelections}. {selected.length}/{maxSelections} selected.
            </p>
          ) : null}
          {hasOtherSelected && (
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Please specify:</Label>
              <Input
                value={otherTextValues[question.id] || ""}
                onChange={(event) => {
                  setOtherTextValues((prev) => ({ ...prev, [question.id]: event.target.value }));
                }}
                placeholder="Describe your other option..."
                className="text-sm"
              />
            </div>
          )}
          {implicationList.length > 0 && (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
              <div className="space-y-1">
                {implicationList.map((item, index) => (
                  <p key={`${question.id}-implication-${index}`}>{item}</p>
                ))}
              </div>
            </div>
          )}
          {prefillNote}
        </div>
      );
    }

    if (question.type === "number") {
      const numericValue = parseNumericValue(value);
      const thresholdTriggered =
        question.threshold &&
        numericValue !== null &&
        !isNaN(numericValue) &&
        ((question.threshold.comparison === "gt" && numericValue > question.threshold.value) ||
          (question.threshold.comparison === "gte" && numericValue >= question.threshold.value) ||
          (question.threshold.comparison === "lt" && numericValue < question.threshold.value) ||
          (question.threshold.comparison === "lte" && numericValue <= question.threshold.value) ||
          (question.threshold.comparison === "eq" && numericValue === question.threshold.value));
      const displayValue =
        typeof value === "number" ? String(value) : typeof value === "string" ? value : "";
      const sanitizeNumberInput = (raw: string) => {
        const cleaned = raw.replace(/[^\d.]/g, "");
        const [head, ...rest] = cleaned.split(".");
        return rest.length ? `${head}.${rest.join("")}` : head;
      };

      const capitalHelper = question.id === "pay-monthly-opex" ? buildCapitalHelper() : null;

      return (
        <div className="space-y-2">
          <Input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*[.]?[0-9]*"
            value={displayValue}
            onChange={(event) => {
              const rawValue = event.target.value;
              const sanitizedValue = sanitizeNumberInput(rawValue);
              updateResponse(question.id, sanitizedValue);
            }}
            placeholder={question.placeholder ?? "Enter value"}
          />
          {capitalHelper && (
            <div className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <Info className="mt-0.5 h-4 w-4 text-slate-400" />
              <div>
                <p className="font-semibold text-slate-700">{capitalHelper.title}</p>
                <ul className="mt-1 space-y-1">
                  {capitalHelper.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {thresholdTriggered && question.threshold && (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
              <p>{question.threshold.message}</p>
            </div>
          )}
          {prefillNote}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Textarea
          value={typeof value === "string" ? value : value ? String(value) : ""}
          onChange={(event) => updateResponse(question.id, event.target.value)}
          placeholder={question.placeholder ?? "Type your response"}
          rows={3}
        />
        {prefillNote}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-200">
        <CardContent className="space-y-4 p-8">
          <NasaraLoader label={loadingLabel} />
          <Progress value={loadingProgress} className="h-2" />
          <p className="text-xs text-slate-500">{loadingProgress}%</p>
        </CardContent>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Business plan profile unavailable</CardTitle>
          <CardDescription>{loadError}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const sectionChartData = insights.sectionScores.map((section) => ({
    name: section.label,
    percent: section.percent,
  }));

  const focusCoverage = [...insights.packSectionScores]
    .sort((a, b) => a.percent - b.percent)
    .slice(0, 8)
    .map((item) => ({ name: item.label, percent: item.percent }));

  const regulatoryChartData = insights.regulatorySignals.slice(0, 6);
  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 bg-white">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>Business Plan Profile</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full p-1 text-slate-400 transition hover:text-slate-600"
                    aria-label="Business plan profile help"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={6} className="max-w-xs text-left">
                  Answer in plain language. The AI will draft FCA-ready narrative, map to gold-standard sections,
                  and generate a 5-7 page perimeter opinion pack in Phase 2.
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription>
              Permission scope: {permissionName || permissionCode || "Not set"}.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-teal-200 text-teal-600">
              {insights.completionPercent}% complete
            </Badge>
            <Badge variant="outline" className={aiReady ? "border-emerald-200 text-emerald-700" : "border-slate-200 text-slate-500"}>
              {aiReady ? "Opinion pack ready" : "Opinion pack locked"}
            </Badge>
            {onNextPhase ? (
              <Button
                variant="outline"
                className="border-slate-200 text-slate-600"
                onClick={handleNextPhase}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Go to Opinion Pack"}
              </Button>
            ) : null}
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save profile"
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Profile completion</span>
              <span>{insights.completionPercent}%</span>
            </div>
            <Progress value={insights.completionPercent} className="h-2" />
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">What happens next</p>
            <p className="mt-2">
              Complete the scope and operations questions, then save. The AI will translate responses into FCA-ready
              narrative and generate a 5-7 page perimeter opinion pack (not a full business plan). {remainingRequired > 0
                ? `${remainingRequired} required responses remain before the AI draft is unlocked.`
                : "All required responses are complete."} Use the next phase button to generate the opinion pack.
            </p>
          </div>
          {/* Validation Conflicts */}
          {insights.conflicts.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-red-600">
                <XCircle className="h-4 w-4" />
                <span>Validation Issues ({insights.conflicts.length})</span>
              </div>
              <div className="mt-2 space-y-2">
                {insights.conflicts.map((conflict) => (
                  <div
                    key={conflict.id}
                    className={`rounded-md px-3 py-2 text-xs ${
                      conflict.severity === "error"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    <p className="font-medium">{conflict.message}</p>
                    {conflict.suggestion && (
                      <p className="mt-1 text-[11px] opacity-80">{conflict.suggestion}</p>
                    )}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {conflict.questionIds.map((qId) => (
                        <button
                          key={qId}
                          type="button"
                          onClick={() => {
                            const question = questions.find((q) => q.id === qId);
                            if (question) jumpToSection(question.sectionId);
                          }}
                          className="rounded bg-white/50 px-1.5 py-0.5 text-[10px] hover:bg-white"
                        >
                          Go to: {qId}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {permission === "payments" && insights.activityHighlights.length > 0 && (
            <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">Selected Payment Services</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {insights.activityHighlights.map((service) => (
                  <Badge key={service} className="bg-teal-100 text-teal-700 border-teal-200">
                    {service}
                  </Badge>
                ))}
              </div>
              <p className="mt-2 text-xs text-teal-600">
                These services determine your regulatory permissions and capital requirements.
              </p>
            </div>
          )}
          {saveMessage && (
            <p className="text-sm text-slate-500">{saveMessage}</p>
          )}
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span>Profile Questions</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="rounded-full p-1 text-slate-400 transition hover:text-slate-600"
                  aria-label="Profile questions help"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={6} className="max-w-xs text-left">
                These answers feed the perimeter opinion, readiness scores, and the gold-standard narrative.
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <CardDescription>
            Each question maps to PERG/PSD2/CONC/COBS and drives the perimeter opinion pack.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <HelpCircle className="mt-0.5 h-4 w-4 text-slate-400" />
            <p>
              Why we ask: each response updates the charts, perimeter opinion, and draft FCA narrative. Respond in
              plain language and the AI will translate it into regulatory terms for the opinion pack.
            </p>
          </div>
          {incompleteSections.length ? (
            <div className="mb-4 rounded-lg border border-slate-200 bg-white px-3 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sections still to complete</p>
                <Badge variant="outline" className="border-slate-200 text-slate-500">
                  {incompleteSections.length} sections
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {incompleteSections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => jumpToSection(section.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-slate-300 hover:text-slate-800"
                  >
                    {SECTION_TAB_LABELS[section.id] ?? section.title}
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                      {section.remaining} left
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              All sections complete. Use the next phase button to generate the opinion pack.
            </div>
          )}
          {missingRequired.length ? (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                  Required questions still missing
                </p>
                <Badge variant="outline" className="border-amber-200 text-amber-700">
                  {missingRequired.length} required
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {missingRequired.slice(0, 6).map((question) => (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => jumpToSection(question.sectionId)}
                    className="inline-flex items-center gap-2 rounded-full border border-amber-200 px-3 py-1 text-xs text-amber-800 hover:border-amber-300"
                  >
                    <span className="max-w-[220px] truncate">{question.prompt}</span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">
                      {SECTION_TAB_LABELS[question.sectionId] ?? question.sectionId}
                    </span>
                  </button>
                ))}
                {missingRequired.length > 6 ? (
                  <span className="text-xs text-amber-700">+ {missingRequired.length - 6} more</span>
                ) : null}
              </div>
            </div>
          ) : null}
          <Tabs value={activeSectionId} onValueChange={jumpToSection}>
            <TabsList className="flex h-auto w-full flex-wrap items-center justify-start gap-2 rounded-lg border border-slate-200 bg-slate-100/70 p-2">
              {sections.map((section) => {
                const readiness = sectionReadiness[section.id];
                const isBlocked = readiness?.blocked ?? false;
                const blockedBy = readiness?.blockedBy ?? [];
                const dep = SECTION_DEPENDENCIES.find((d) => d.sectionId === section.id);

                return (
                  <Tooltip key={section.id}>
                    <TooltipTrigger asChild>
                      <TabsTrigger
                        value={section.id}
                        className={`flex-none whitespace-nowrap px-3 py-1 text-xs sm:text-sm data-[state=active]:border-slate-900 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm ${
                          isBlocked ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        {isBlocked && <Lock className="mr-1 h-3 w-3" />}
                        <span>{SECTION_TAB_LABELS[section.id] ?? section.title}</span>
                        {sectionProgress.find((item) => item.id === section.id)?.remaining ? (
                          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">
                            {sectionProgress.find((item) => item.id === section.id)?.remaining}
                          </span>
                        ) : (
                          <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700">
                            Done
                          </span>
                        )}
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={6} className="max-w-xs text-left">
                      <p className="font-semibold">{section.title}</p>
                      <p className="mt-1">{section.description}</p>
                      {isBlocked && (
                        <p className="mt-2 text-amber-600">
                          Complete first: {blockedBy.map((id) => SECTION_TAB_LABELS[id] ?? id).join(", ")}
                        </p>
                      )}
                      {dep && !isBlocked && (
                        <p className="mt-2 text-slate-400 text-xs">{dep.reason}</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TabsList>
            {sections.map((section) => {
              const sectionQuestions = questions.filter((question) => question.sectionId === section.id);
              const sectionScore = insights.sectionScores.find((score) => score.id === section.id);
              const sectionTargets = (section.packSectionKeys ?? []).map(getPackSectionLabel);
              const sectionStats = sectionProgress.find((item) => item.id === section.id);
              const sectionIndex = sections.findIndex((item) => item.id === section.id);
              const prevSection = sectionIndex > 0 ? sections[sectionIndex - 1] : null;
              const nextSection = sectionIndex < sections.length - 1 ? sections[sectionIndex + 1] : null;
              return (
                <TabsContent key={section.id} value={section.id} className="mt-4 space-y-6">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {prevSection ? (
                      <Button variant="outline" size="sm" onClick={() => jumpToSection(prevSection.id)}>
                        Previous section
                      </Button>
                    ) : null}
                    {nextSection ? (
                      <Button variant="outline" size="sm" onClick={() => jumpToSection(nextSection.id)}>
                        Next section
                      </Button>
                    ) : null}
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{section.title}</p>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="rounded-full p-1 text-slate-400 transition hover:text-slate-600"
                                aria-label={`${section.title} help`}
                              >
                                <HelpCircle className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={6} className="max-w-xs text-left">
                              <p className="font-semibold">{section.title}</p>
                              <p className="mt-1">{section.description}</p>
                              {sectionTargets.length ? (
                                <p className="mt-2">Feeds into: {sectionTargets.join(", ")}</p>
                              ) : null}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="text-xs text-slate-500">{section.description}</p>
                        {sectionTargets.length ? (
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                              Feeds into
                            </span>
                            {sectionTargets.map((item) => (
                              <Badge key={item} variant="outline" className="border-slate-200 text-slate-500">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className="border-slate-300 text-slate-600">
                          {sectionScore?.percent ?? 0}% ready
                        </Badge>
                        {sectionStats ? (
                          <Badge variant="outline" className="border-slate-200 text-slate-500">
                            {sectionStats.answered}/{sectionStats.total} answered
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {section.id === "payments" && permission === "payments" ? (
                    <Dialog>
                      <Card className="border border-blue-200 bg-blue-50">
                        <CardHeader className="flex flex-row items-start justify-between gap-3">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-base text-blue-900">
                              <Calculator className="h-4 w-4 text-blue-600" />
                              <span>Capital requirement calculator</span>
                            </CardTitle>
                            <CardDescription className="text-blue-700">
                              Review your method, OpEx, and volume inputs before generating the opinion pack.
                            </CardDescription>
                          </div>
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="border-blue-200 text-blue-700 hover:bg-blue-100"
                            >
                              Open calculator
                            </Button>
                          </DialogTrigger>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-blue-900">
                          <div className="flex flex-wrap gap-3 text-xs text-blue-700">
                            <span>
                              Method: {capitalEstimate?.method ? `Method ${capitalEstimate.method}` : "Not selected"}
                            </span>
                            <span>
                              Monthly OpEx:{" "}
                              {monthlyOpex !== null
                                ? `£${Math.round(monthlyOpex).toLocaleString("en-GB")}`
                                : "Not set"}
                            </span>
                            <span>
                              Monthly volume:{" "}
                              {monthlyVolume !== null
                                ? `£${Math.round(monthlyVolume).toLocaleString("en-GB")}`
                                : "Not set"}
                            </span>
                          </div>
                          {capitalEstimate?.recommendation ? (
                            <p className="text-xs font-medium text-blue-900">{capitalEstimate.recommendation}</p>
                          ) : (
                            <p className="text-xs text-blue-700">
                              Enter OpEx and transaction volume to see the calculation.
                            </p>
                          )}
                        </CardContent>
                      </Card>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Capital requirement calculator</DialogTitle>
                          <DialogDescription>
                            Uses your payment services profile to estimate Method A/B and minimum capital in GBP.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 text-sm text-slate-700">
                          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Current inputs</p>
                            <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
                              <div>
                                <p className="text-xs text-slate-500">Method</p>
                                <p className="font-medium text-slate-900">
                                  {capitalEstimate?.method ? `Method ${capitalEstimate.method}` : "Not selected"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Monthly OpEx</p>
                                <p className="font-medium text-slate-900">
                                  {monthlyOpex !== null
                                    ? `£${Math.round(monthlyOpex).toLocaleString("en-GB")}`
                                    : "Not set"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Monthly volume</p>
                                <p className="font-medium text-slate-900">
                                  {monthlyVolume !== null
                                    ? `£${Math.round(monthlyVolume).toLocaleString("en-GB")}`
                                    : "Not set"}
                                </p>
                              </div>
                            </div>
                            {typeof capitalEstimate?.minimumCapital === "number" ? (
                              <p className="mt-3 text-xs text-slate-500">
                                FCA minimum capital (GBP): £{capitalEstimate.minimumCapital.toLocaleString("en-GB")}
                              </p>
                            ) : null}
                          </div>
                          {capitalEstimate?.breakdown?.length ? (
                            <div className="rounded-lg border border-slate-200 bg-white p-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Calculation breakdown
                              </p>
                              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                                {capitalEstimate.breakdown.map((line) => (
                                  <li key={line}>{line}</li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-500">
                              Enter OpEx and transaction volume to see the calculation breakdown.
                            </div>
                          )}
                          {capitalEstimate?.recommendation ? (
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                              {capitalEstimate.recommendation}
                            </div>
                          ) : null}
                          {volumeSeries.length > 0 ? (
                            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                                Monthly volume preview
                              </p>
                              <div className="mt-3 h-[120px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={volumeSeries}>
                                    <XAxis dataKey="month" hide />
                                    <YAxis hide domain={["dataMin", "dataMax"]} />
                                    <Line type="monotone" dataKey="volume" stroke="#4f46e5" strokeWidth={2} dot={false} />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-700">
                              Enter monthly volume to preview the capital tier curve.
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : null}

                  <div className="space-y-4">
                    {sectionQuestions.map((question) => {
                      const meta = buildQuestionMeta(question);
                      const response = responses[question.id];
                      const isAnswered = isResponseComplete(question, response);
                      const prefill = prefilledResponses[question.id];
                      const isOverride = Boolean(prefill) && prefillOverrides.has(question.id);
                      const explainer =
                        question.description ||
                        question.impact ||
                        "This response informs the FCA scope mapping and the opinion pack narrative.";
                      const showImpact = question.impact && question.impact !== explainer;
                      return (
                        <div key={question.id} className="rounded-lg border border-slate-200 p-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Label className="text-sm font-semibold text-slate-900">
                                    {question.prompt}
                                    {question.required ? " *" : ""}
                                  </Label>
                                  {prefill ? (
                                    <Badge variant="outline" className="border-teal-200 text-teal-700">
                                      {isOverride ? "Overriding setup" : "Imported from setup"}
                                    </Badge>
                                  ) : null}
                                  {!isAnswered ? (
                                    <Badge variant="outline" className="border-amber-200 text-amber-700">
                                      Not answered
                                    </Badge>
                                  ) : null}
                                </div>
                                {question.description && (
                                  <p className="text-xs text-slate-500">{question.description}</p>
                                )}
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-slate-400 transition hover:text-slate-600"
                                    aria-label={`Why we ask: ${question.prompt}`}
                                  >
                                    <HelpCircle className="h-4 w-4" />
                                    <span className="hidden sm:inline">Why we ask</span>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" sideOffset={6} className="max-w-xs text-left">
                                  <p className="font-semibold">Why we ask</p>
                                  <p className="mt-1">{explainer}</p>
                                  {showImpact ? (
                                    <p className="mt-2 font-medium text-amber-700">Impact: {question.impact}</p>
                                  ) : null}
                                  {question.aiHint ? <p className="mt-2">{question.aiHint}</p> : null}
                                  {meta.regulatoryRefs.length ? (
                                    <p className="mt-2">Regulatory source: {meta.regulatoryRefs.join(", ")}</p>
                                  ) : null}
                                  {meta.packLabels.length ? (
                                    <p className="mt-2">Feeds into: {meta.packLabels.join(", ")}</p>
                                  ) : null}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            {renderQuestionInput(question)}
                            {question.aiHint ? (
                              <div className="flex items-start gap-2 rounded-md border border-teal-100 bg-teal-50 px-3 py-2 text-xs text-teal-700">
                                <Sparkles className="mt-0.5 h-4 w-4 text-teal-500" />
                                <p>{question.aiHint}</p>
                              </div>
                            ) : null}
                            {meta.text ? (
                              <div className="flex items-start gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                <HelpCircle className="mt-0.5 h-4 w-4 text-slate-400" />
                                <p>{meta.text}</p>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
          {onNextPhase ? (
            <Collapsible>
              <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-start justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Answer summary</p>
                    <p className="text-xs text-slate-500">
                      Review what you've answered before generating the opinion pack.
                    </p>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="space-y-4 border-t border-slate-200 px-4 py-3">
                    {answerSummary.length ? (
                      answerSummary.map((section) => (
                        <div key={section.id} className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            {section.label}
                          </p>
                          <div className="space-y-2 text-sm text-slate-600">
                            {section.items.map((item) => (
                              <div key={item.id} className="flex flex-col gap-1 rounded-md bg-white px-3 py-2">
                                <span className="text-xs font-semibold text-slate-500">{item.prompt}</span>
                                <span className="text-sm text-slate-700">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No answers saved yet.</p>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ) : null}
          {onNextPhase ? (
            <div className="mt-6 flex justify-end">
              {(() => {
                const currentIndex = sections.findIndex((s) => s.id === activeSectionId);
                const isLastSection = currentIndex === sections.length - 1;
                const allSectionsComplete = incompleteSections.length === 0;
                const nextSection = sections[currentIndex + 1];

                if (allSectionsComplete && isLastSection) {
                  return (
                    <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleNextPhase} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Continue to Opinion Pack"}
                    </Button>
                  );
                }

                if (!isLastSection && nextSection) {
                  return (
                    <Button
                      className="bg-slate-600 hover:bg-slate-700"
                      onClick={() => jumpToSection(nextSection.id)}
                    >
                      Next Section
                    </Button>
                  );
                }

                return (
                  <Button
                    className="bg-slate-600 hover:bg-slate-700"
                      onClick={() => {
                        const firstIncomplete = incompleteSections[0];
                        if (firstIncomplete) {
                          jumpToSection(firstIncomplete.id);
                        }
                      }}
                    >
                    Complete Remaining Sections ({incompleteSections.length})
                  </Button>
                );
              })()}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <CollapsibleInsightCard
          title="Activity Highlights"
          description="Key regulated activities in scope."
          helpLabel="Activity Highlights"
          helpDescription="Signals pulled from your scope responses to spotlight regulated activity themes."
        >
          {insights.activityHighlights.length ? (
            <div className="flex flex-wrap gap-2">
              {insights.activityHighlights.map((item) => (
                <Badge key={item} variant="outline" className="border-slate-200 text-slate-600">
                  {item}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Add activities to see highlights.</p>
          )}
        </CollapsibleInsightCard>

        <CollapsibleInsightCard
          title="Regulatory Drivers"
          description="Top referenced perimeter sources."
          helpLabel="Regulatory Drivers"
          helpDescription="Counts of PERG/PSD2/CONC/COBS references behind your answers."
        >
          {regulatoryChartData.length ? (
            <ul className="space-y-2 text-sm text-slate-600">
              {regulatoryChartData.map((item) => (
                <li key={item.label} className="flex items-center justify-between">
                  <span>{item.label}</span>
                  <span className="text-xs text-slate-400">{item.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Answer scope questions to populate.</p>
          )}
        </CollapsibleInsightCard>

        <CollapsibleInsightCard
          title="Focus Areas"
          description="Lowest coverage sections to address."
          helpLabel="Focus Areas"
          helpDescription="Lowest-scoring sections based on what has been answered so far."
        >
          {insights.focusAreas.length ? (
            <ul className="space-y-2 text-sm text-slate-600">
              {insights.focusAreas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Complete the profile to highlight focus areas.</p>
          )}
        </CollapsibleInsightCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CollapsibleInsightCard
            title="Section Readiness"
            description="Scores by profile section. 100% means all mapped questions are answered with ready selections."
            helpLabel="Section Readiness"
            helpDescription="Scores rise when questions are answered. Higher-readiness selections lift the score. 100% means every mapped question is answered and marked ready."
          >
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectionChartData} layout="vertical" margin={{ left: 16, right: 16 }}>
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12 }} />
                  <RechartsTooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="percent" fill="#0f766e" radius={[4, 4, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-500">
              Tip: selecting "draft complete" or similar readiness options boosts the section score.
            </p>
          </CollapsibleInsightCard>
        </div>

        <CollapsibleInsightCard
          title="Regulatory Coverage"
          description="Signals by referenced sources."
          helpLabel="Regulatory Coverage"
          helpDescription="Mix of referenced sources inferred from your responses. This is a signal chart, not a percentage."
        >
          {regulatoryChartData.length ? (
            <>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={regulatoryChartData} dataKey="count" nameKey="label" innerRadius={44} outerRadius={84}>
                      {regulatoryChartData.map((entry, index) => (
                        <Cell key={entry.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                {regulatoryChartData.map((entry, index) => (
                  <div key={entry.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span>{entry.label}</span>
                    </div>
                    <span className="text-slate-400">{entry.count}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                Add more responses to surface additional regulatory drivers.
              </p>
            </>
          ) : (
            <div className="flex h-[240px] items-center justify-center text-sm text-slate-500">
              No regulatory signals yet.
            </div>
          )}
        </CollapsibleInsightCard>
      </div>

      <CollapsibleInsightCard
        title="Gold Standard Coverage"
        description="Lowest coverage sections from the gold-standard narrative."
        helpLabel="Gold Standard Coverage"
        helpDescription="Coverage gaps against the gold-standard narrative spine. 100% means every mapped question is answered and marked ready."
      >
        {focusCoverage.length ? (
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={focusCoverage} layout="vertical" margin={{ left: 16, right: 16 }}>
                <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <YAxis type="category" dataKey="name" width={220} tick={{ fontSize: 12 }} />
                <RechartsTooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="percent" fill="#2563eb" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[220px] items-center justify-center text-sm text-slate-500">
            Add profile responses to score coverage.
          </div>
        )}
        <p className="text-xs text-slate-500">
          Coverage rises as you answer questions mapped to each gold-standard narrative section.
        </p>
      </CollapsibleInsightCard>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span>Perimeter Opinion</span>
            <HelpTooltip
              label="Perimeter Opinion"
              description="Indicative FCA perimeter view generated from scope responses."
            />
          </CardTitle>
          <CardDescription>Indicative view based on the profile responses.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge className={verdictStyles[insights.perimeterOpinion.verdict]}>
            {insights.perimeterOpinion.verdict.replace("-", " ")}
          </Badge>
          <p className="text-sm text-slate-700">{insights.perimeterOpinion.summary}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Rationale</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                {insights.perimeterOpinion.rationale.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Key Obligations</p>
              {insights.perimeterOpinion.obligations.length ? (
                <ul className="mt-2 space-y-2 text-sm text-slate-600">
                  {insights.perimeterOpinion.obligations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-500">Complete scope questions to generate obligations.</p>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400">
            This is an indicative perimeter view only and does not constitute legal advice.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}
