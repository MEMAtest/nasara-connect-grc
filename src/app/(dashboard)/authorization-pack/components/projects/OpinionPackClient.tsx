"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { FileText, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NasaraLoader } from "@/components/ui/nasara-loader";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { ProjectHeader } from "./ProjectHeader";
import { BusinessPlanProfileClient } from "./BusinessPlanProfileClient";
import { PredictiveInsights } from "./PredictiveInsights";
import {
  getProfileQuestions,
  isProfilePermissionCode,
  type ProfileQuestion,
  type ProfileResponse,
} from "@/lib/business-plan-profile";

interface ProjectDocument {
  id: string;
  name: string;
  description?: string;
  sectionCode?: string;
  storageKey?: string;
  version: number;
  status: "draft" | "review" | "approved" | "signed";
  uploadedBy?: string;
  uploadedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  signedBy?: string;
  signedAt?: string;
  mimeType?: string;
  fileSizeBytes?: number;
}

interface ProjectDetail {
  id: string;
  name: string;
  permissionCode: string;
  permissionName?: string | null;
  status: string;
  packId?: string | null;
}

interface GenerationJob {
  id: string;
  status: string;
  progress?: number | null;
  currentStep?: string | null;
  errorMessage?: string | null;
  documentId?: string | null;
  documentName?: string | null;
  payload?: { warnings?: string[] };
}

const sectionLabels: Record<string, string> = {
  "business-plan": "Perimeter Opinion Pack",
  "perimeter-opinion": "Perimeter Opinion Pack",
  "executive-summary": "Executive Summary",
  "business-model": "Business Model",
  "regulatory-permissions": "Regulatory Permissions",
  "corporate-structure": "Corporate Structure",
  "financial-projections": "Financial Projections",
  "aml-ctf": "AML/CTF Framework",
  "consumer-duty": "Consumer Duty",
};

const invalidFilenameChars = /[<>:"/\\|?*\x00-\x1f]/g;

function sanitizeFilename(input: string) {
  const safe = input.replace(invalidFilenameChars, "_").trim();
  return safe.length ? safe : "opinion-pack";
}

function ensurePdfFilename(input: string) {
  return input.toLowerCase().endsWith(".pdf") ? input : `${input}.pdf`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}

export function OpinionPackClient() {
  const params = useParams();
  const projectId = params?.projectId as string | undefined;
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStartingGeneration, setIsStartingGeneration] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [missingQuestions, setMissingQuestions] = useState<ProfileQuestion[]>([]);
  const [isCheckingMissing, setIsCheckingMissing] = useState(false);
  // Cache profile data to avoid redundant API calls
  const [cachedProfileResponses, setCachedProfileResponses] = useState<Record<string, ProfileResponse> | null>(null);
  const [generationJob, setGenerationJob] = useState<GenerationJob | null>(null);
  const generationInFlight = useRef(false);
  const orderedDocuments = useMemo(() => {
    const next = [...documents];
    next.sort((a, b) => {
      const aTime = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
      const bTime = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
      if (bTime !== aTime) return bTime - aTime;
      return b.version - a.version;
    });
    return next;
  }, [documents]);

  // Load data with cleanup to prevent race conditions
  useEffect(() => {
    if (!projectId) return;

    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);
      setDocsError(null);
      setDownloadError(null);
      try {
        // Fetch project and profile in parallel for faster initial load
        const [projectRes, profileRes] = await Promise.all([
          fetchWithTimeout(`/api/authorization-pack/projects/${projectId}`).catch(() => null),
          fetchWithTimeout(`/api/authorization-pack/projects/${projectId}/business-plan-profile`).catch(() => null),
        ]);

        // Check if component is still mounted before updating state
        if (!isMounted) return;

        let packIdForDocs: string | null = null;
        if (projectRes?.ok) {
          const projectData = await projectRes.json();
          const proj = projectData.project;
          if (proj) {
            setProject({
              id: proj.id,
              name: proj.name,
              permissionCode: proj.permissionCode,
              permissionName: proj.permissionName,
              status: proj.status,
              packId: proj.packId,
            });
            packIdForDocs = proj.packId;
          }
        }

        // Cache profile responses for missing questions check
        if (profileRes?.ok) {
          const profileData = await profileRes.json();
          if (isMounted) {
            setCachedProfileResponses(profileData?.profile?.responses ?? {});
          }
        }

        if (packIdForDocs && isMounted) {
          const docsRes = await fetchWithTimeout(
            `/api/authorization-pack/packs/${packIdForDocs}/documents`
          ).catch(() => null);
          if (!isMounted) return;
          if (docsRes?.ok) {
            const docsData = await docsRes.json();
            setDocuments(docsData.documents || []);
          } else if (docsRes) {
            const errorData = await docsRes.json().catch(() => ({}));
            setDocsError(errorData.error || "Failed to load opinion pack.");
          }
        }
      } catch {
        if (isMounted) {
          setLoadError("Failed to load opinion pack.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // Reload data function for manual refresh (e.g., after generation)
  const reloadData = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setLoadError(null);
    setDocsError(null);
    setDownloadError(null);
    try {
      const [projectRes, profileRes] = await Promise.all([
        fetchWithTimeout(`/api/authorization-pack/projects/${projectId}`).catch(() => null),
        fetchWithTimeout(`/api/authorization-pack/projects/${projectId}/business-plan-profile`).catch(() => null),
      ]);

      let packIdForDocs: string | null = null;
      if (projectRes?.ok) {
        const projectData = await projectRes.json();
        const proj = projectData.project;
        if (proj) {
          setProject({
            id: proj.id,
            name: proj.name,
            permissionCode: proj.permissionCode,
            permissionName: proj.permissionName,
            status: proj.status,
            packId: proj.packId,
          });
          packIdForDocs = proj.packId;
        }
      }

      if (profileRes?.ok) {
        const profileData = await profileRes.json();
        setCachedProfileResponses(profileData?.profile?.responses ?? {});
      }

      if (packIdForDocs) {
        const docsRes = await fetchWithTimeout(
          `/api/authorization-pack/packs/${packIdForDocs}/documents`
        ).catch(() => null);
        if (docsRes?.ok) {
          const docsData = await docsRes.json();
          setDocuments(docsData.documents || []);
        } else if (docsRes) {
          const errorData = await docsRes.json().catch(() => ({}));
          setDocsError(errorData.error || "Failed to load opinion pack.");
        }
      }
    } catch {
      setLoadError("Failed to load opinion pack.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const fetchGenerationStatus = useCallback(async () => {
    if (!project?.packId) return;
    const response = await fetch(`/api/authorization-pack/packs/${project.packId}/generate-business-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status" }),
    }).catch(() => null);
    if (response?.ok) {
      const data = await response.json();
      setGenerationJob(data.job ?? null);
    }
  }, [project?.packId]);

  const downloadGeneratedDocument = useCallback(
    async (documentId: string, documentName?: string | null) => {
      if (!project?.packId) return;
      setDownloadError(null);
      try {
        const response = await fetch(
          `/api/authorization-pack/packs/${project.packId}/documents/${documentId}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setDownloadError(errorData.error || "Failed to download document.");
          return;
        }

        const blob = await response.blob();
        const headerName = response.headers.get("X-Document-Filename") || documentName || "Perimeter Opinion Pack";
        const safeFilename = ensurePdfFilename(sanitizeFilename(headerName));
        triggerDownload(blob, safeFilename);
      } catch {
        setDownloadError("Failed to download document.");
      }
    },
    [project?.packId]
  );

  const runOpinionPackJob = useCallback(
    async (jobId: string) => {
      if (!project?.packId || generationInFlight.current) return;
      generationInFlight.current = true;
      setIsGenerating(true);
      setGenerateError(null);

      try {
        let completed = false;
        let attempts = 0;
        while (!completed && attempts < 30) {
          attempts += 1;
          const response = await fetch(
            `/api/authorization-pack/packs/${project.packId}/generate-business-plan`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "run", jobId, batchSize: 1 }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
            setGenerateError(errorData.details ? `${errorData.error}: ${errorData.details}` : errorData.error || "Failed to generate opinion pack");
            break;
          }

          const data = await response.json();
          const nextJob = data.job as GenerationJob | null;
          if (!nextJob) {
            setGenerateError("Generation status unavailable. Please try again.");
            break;
          }

          setGenerationJob(nextJob);

          if (nextJob.status === "completed") {
            const documentId = data.document?.id || nextJob.documentId;
            const documentName = data.document?.name || nextJob.documentName;
            if (documentId) {
              await downloadGeneratedDocument(documentId, documentName);
            }
            await reloadData();
            completed = true;
            break;
          }

          if (nextJob.status === "failed") {
            setGenerateError(nextJob.errorMessage || "Failed to generate opinion pack.");
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, 400));
        }

        if (!completed && attempts >= 30) {
          setGenerateError("Generation is taking longer than expected. Please click Generate again to continue.");
        }
      } catch {
        setGenerateError("Failed to connect to the server. Please try again.");
      } finally {
        generationInFlight.current = false;
        setIsGenerating(false);
      }
    },
    [project?.packId, downloadGeneratedDocument, reloadData]
  );

  // Helper function to check if a response is complete
  const isResponseComplete = useCallback((
    question: ProfileQuestion,
    response: ProfileResponse | undefined,
    allResponses?: Record<string, ProfileResponse>
  ): boolean => {
    if (
      question.allowOther &&
      ((Array.isArray(response) && response.includes("other")) || response === "other")
    ) {
      const otherText = allResponses?.[`${question.id}_other_text`];
      if (typeof otherText !== "string" || otherText.trim().length === 0) {
        return false;
      }
    }
    if (response === undefined || response === null) return false;
    if (Array.isArray(response)) return response.length > 0;
    if (question.type === "number") {
      if (typeof response === "number") return !Number.isNaN(response);
      if (typeof response === "string") {
        const parsed = Number(response);
        return response.trim().length > 0 && !Number.isNaN(parsed);
      }
      return false;
    }
    if (question.type === "boolean") return typeof response === "boolean";
    if (typeof response === "string") return response.trim().length > 0;
    return true;
  }, []);

  const computeMissingQuestions = useCallback((responses: Record<string, ProfileResponse> | null): ProfileQuestion[] => {
    if (!projectId || !responses) return [];
    const permission = isProfilePermissionCode(project?.permissionCode)
      ? project?.permissionCode
      : project?.permissionCode?.startsWith("payments")
      ? "payments"
      : null;
    const questions = getProfileQuestions(permission);
    const required = questions.filter((q) => q.required);
    return required.filter((q) => !isResponseComplete(q, responses[q.id], responses));
  }, [projectId, project?.permissionCode, isResponseComplete]);

  // Refreshes profile cache from server (only when needed, e.g., after profile changes)
  const refreshProfileCache = useCallback(async (): Promise<ProfileQuestion[]> => {
    if (!projectId) return [];
    try {
      const response = await fetch(`/api/authorization-pack/projects/${projectId}/business-plan-profile`);
      if (!response.ok) return [];
      const data = await response.json();
      const responses = data?.profile?.responses ?? {};
      setCachedProfileResponses(responses);
      const permission = isProfilePermissionCode(project?.permissionCode)
        ? project?.permissionCode
        : project?.permissionCode?.startsWith("payments")
        ? "payments"
        : null;
      const questions = getProfileQuestions(permission);
      const required = questions.filter((q) => q.required);
      return required.filter((q) => !isResponseComplete(q, responses[q.id], responses));
    } catch {
      return [];
    }
  }, [projectId, project?.permissionCode, isResponseComplete]);

  // Show cached missing questions immediately when entering the documents tab
  useEffect(() => {
    if (activeTab !== "documents") return;
    setMissingQuestions(computeMissingQuestions(cachedProfileResponses));
  }, [activeTab, cachedProfileResponses, computeMissingQuestions]);

  // Refresh missing questions from the server when entering the documents tab
  useEffect(() => {
    if (activeTab !== "documents" || !projectId) return;
    let isMounted = true;
    setIsCheckingMissing(true);
    refreshProfileCache()
      .then((missing) => {
        if (isMounted) {
          setMissingQuestions(missing);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsCheckingMissing(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [activeTab, projectId, refreshProfileCache]);

  useEffect(() => {
    if (activeTab !== "documents") return;
    fetchGenerationStatus();
  }, [activeTab, fetchGenerationStatus]);

  const handleGenerateOpinionPack = async () => {
    if (!project?.packId) {
      setGenerateError("No pack associated with this project.");
      return;
    }

    setIsStartingGeneration(true);
    setGenerateError(null);
    setDownloadError(null);
    setMissingQuestions([]);

    // Refresh profile cache and check for missing questions before generation
    const missing = await refreshProfileCache();
    if (missing.length > 0) {
      setMissingQuestions(missing);
      setGenerateError(`Please complete ${missing.length} required question${missing.length > 1 ? "s" : ""} before generating the opinion pack.`);
      setIsStartingGeneration(false);
      return;
    }

    try {
      const response = await fetch(`/api/authorization-pack/packs/${project.packId}/generate-business-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", force: documents.length > 0 }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Generation API error:", response.status, errorData);
        setGenerateError(errorData.details ? `${errorData.error}: ${errorData.details}` : errorData.error || "Failed to start opinion pack generation");
        setIsStartingGeneration(false);
        return;
      }

      const data = await response.json();
      const job = data.job as GenerationJob | null;
      if (!job?.id) {
        setGenerateError("Unable to start generation job. Please try again.");
        setIsStartingGeneration(false);
        return;
      }
      setGenerationJob(job);
      setIsStartingGeneration(false);
      await runOpinionPackJob(job.id);
    } catch (err) {
      setGenerateError("Failed to connect to the server. Please try again.");
      setIsStartingGeneration(false);
    }
  };

  const handleDownloadDocument = async (doc: ProjectDocument) => {
    if (!project?.packId) return;
    setDownloadError(null);

    try {
      const response = await fetch(
        `/api/authorization-pack/packs/${project.packId}/documents/${doc.id}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setDownloadError(errorData.error || "Failed to download document.");
        return;
      }

      const blob = await response.blob();
      const headerName = response.headers.get("X-Document-Filename") || doc.name || "Perimeter Opinion Pack";
      const safeFilename = ensurePdfFilename(sanitizeFilename(headerName));
      triggerDownload(blob, safeFilename);
    } catch {
      setDownloadError("Failed to download document.");
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-200">
        <CardContent className="p-8">
          <NasaraLoader label="Loading opinion pack..." />
        </CardContent>
      </Card>
    );
  }

  if (loadError || !project) {
    return (
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Opinion pack unavailable</CardTitle>
          <CardDescription>{loadError || "Project not found."}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="bg-teal-600 hover:bg-teal-700" onClick={reloadData}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const generatedDocs = orderedDocuments.length;
  const generationProgress = generationJob?.progress ?? 0;
  const generationStep = generationJob?.currentStep || (generationJob ? "Preparing opinion pack..." : "");
  const hasActiveJob = !!generationJob && generationJob.status !== "completed" && generationJob.status !== "failed";

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} active="opinion-pack" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap justify-start">
          <TabsTrigger value="profile">Phase 1 - Business Plan Profile</TabsTrigger>
          <TabsTrigger value="readiness">Readiness Assessment</TabsTrigger>
          <TabsTrigger value="documents">Phase 2 - Opinion Pack</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <BusinessPlanProfileClient
            projectId={project.id}
            permissionCode={project.permissionCode}
            permissionName={project.permissionName}
            onNextPhase={() => setActiveTab("readiness")}
          />
        </TabsContent>

        <TabsContent value="readiness" className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">FCA Authorization Readiness</h2>
              <p className="text-sm text-slate-500">
                Predictive assessment based on FCA historical decision patterns and failure analysis.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setActiveTab("documents")}
            >
              Continue to Opinion Pack →
            </Button>
          </div>

          <PredictiveInsights projectId={project.id} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Perimeter Opinion Pack</h2>
              <p className="text-sm text-slate-500">
                Generated 5-7 page perimeter opinion based on Phase 1 profile responses.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => {
                  if (hasActiveJob && generationJob?.id) {
                    runOpinionPackJob(generationJob.id);
                  } else {
                    handleGenerateOpinionPack();
                  }
                }}
                disabled={
                  isGenerating ||
                  isStartingGeneration ||
                  isCheckingMissing ||
                  (!hasActiveJob && missingQuestions.length > 0) ||
                  !project?.packId
                }
              >
                {isStartingGeneration || isGenerating || isCheckingMissing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isCheckingMissing ? "Checking..." : isStartingGeneration ? "Starting..." : "Generating..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {hasActiveJob ? "Continue Generation" : "Generate Opinion Pack"}
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Workflow</p>
            <p className="mt-2">
              Complete the Business Plan Profile in Phase 1 first. Then click Generate Opinion Pack to create your 5-7 page
              perimeter opinion. Regenerate anytime after updates.
            </p>
          </div>

          {isStartingGeneration && !generationJob ? (
            <Card className="border border-indigo-200 bg-indigo-50">
              <CardContent className="p-4">
                <NasaraLoader label="Preparing opinion pack..." />
              </CardContent>
            </Card>
          ) : null}

          {generationJob && generationJob.status !== "completed" ? (
            <Card className="border border-blue-200 bg-blue-50">
              <CardContent className="space-y-2 p-4 text-sm text-blue-900">
                <div className="flex items-center gap-2">
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> : null}
                  <span className="font-medium">
                    {generationJob.status === "failed" ? "Generation failed" : generationStep}
                  </span>
                </div>
                <Progress value={generationProgress} className="h-2" />
                <div className="flex items-center justify-between text-xs text-blue-700">
                  <span>{generationProgress}% complete</span>
                  {generationJob.payload?.warnings?.length ? (
                    <span>{generationJob.payload.warnings.length} warnings</span>
                  ) : null}
                </div>
                {generationJob.errorMessage ? (
                  <p className="text-xs text-blue-800">{generationJob.errorMessage}</p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {docsError && (
            <Card className="border border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <p className="text-sm text-amber-700">{docsError}</p>
              </CardContent>
            </Card>
          )}

          {isCheckingMissing && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                Checking required profile questions...
              </div>
            </div>
          )}

          {missingQuestions.length > 0 && !isCheckingMissing && (
            <Card className="border border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <p className="text-sm text-amber-800">
                  Complete {missingQuestions.length} required question{missingQuestions.length > 1 ? "s" : ""} to unlock the
                  opinion pack.
                </p>
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                    Missing Required Questions
                  </p>
                  <ul className="space-y-1">
                    {missingQuestions.map((q) => (
                      <li key={q.id} className="flex items-center justify-between text-sm">
                        <span className="text-amber-900">{q.prompt}</span>
                        <button
                          type="button"
                          onClick={() => setActiveTab("profile")}
                          className="text-xs text-amber-700 underline hover:text-amber-900"
                        >
                          Go to section: {q.sectionId}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 border-amber-300 text-amber-800 hover:bg-amber-100"
                    onClick={() => setActiveTab("profile")}
                  >
                    Complete Profile Questions
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {generateError && (
            <Card className="border border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-sm text-red-700">{generateError}</p>
                {missingQuestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                      Missing Required Questions
                    </p>
                    <ul className="space-y-1">
                      {missingQuestions.map((q) => (
                        <li key={q.id} className="flex items-center justify-between text-sm">
                          <span className="text-red-800">{q.prompt}</span>
                          <button
                            type="button"
                            onClick={() => setActiveTab("profile")}
                            className="text-xs text-red-600 underline hover:text-red-800"
                          >
                            Go to section: {q.sectionId}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                      onClick={() => setActiveTab("profile")}
                    >
                      Complete Profile Questions
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {downloadError && (
            <Card className="border border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-sm text-red-700">{downloadError}</p>
              </CardContent>
            </Card>
          )}

          {isGenerating && (
            <Card className="border border-indigo-200 bg-indigo-50">
              <CardContent className="p-6 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
                <p className="mt-3 font-medium text-indigo-900">Generating your opinion pack...</p>
                <p className="mt-1 text-sm text-indigo-600">This may take a moment.</p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border border-slate-200">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Generated</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{generatedDocs}</p>
                <p className="text-xs text-slate-500">Opinion pack versions</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-200">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Latest update</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {orderedDocuments[0]?.uploadedAt ? formatDate(orderedDocuments[0].uploadedAt) : "—"}
                </p>
                <p className="text-xs text-slate-500">Last generated date</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-200">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Downloads</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {orderedDocuments.filter((doc) => doc.storageKey).length}
                </p>
                <p className="text-xs text-slate-500">Available files</p>
              </CardContent>
            </Card>
          </div>

          {orderedDocuments.length === 0 ? (
            <Card className="border border-slate-200">
              <CardContent className="p-8 text-center">
                <p className="text-slate-500">No opinion pack generated yet.</p>
                <p className="mt-2 text-sm text-slate-400">
                  Generate the opinion pack from Phase 1 answers to review it here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orderedDocuments.map((doc) => (
                <Card
                  key={doc.id}
                  className={`border ${
                    doc.sectionCode === "business-plan" || doc.sectionCode === "perimeter-opinion"
                      ? "border-indigo-200 bg-indigo-50/30"
                      : "border-slate-200"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FileText
                            className={`h-5 w-5 ${
                              doc.sectionCode === "business-plan" || doc.sectionCode === "perimeter-opinion"
                                ? "text-indigo-500"
                                : "text-slate-400"
                            }`}
                          />
                          <h3 className="font-semibold text-slate-900">{doc.name}</h3>
                          <Badge className="bg-slate-100 text-slate-700">Generated</Badge>
                          {doc.sectionCode && (
                            <Badge variant="outline" className="border-slate-200 text-slate-600">
                              {sectionLabels[doc.sectionCode] || doc.sectionCode}
                            </Badge>
                          )}
                        </div>
                        {doc.description && <p className="mt-1 text-sm text-slate-500">{doc.description}</p>}
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                          <span>Version {doc.version}</span>
                          {doc.uploadedAt && <span>Uploaded {formatDate(doc.uploadedAt)}</span>}
                          {doc.fileSizeBytes && <span>{formatFileSize(doc.fileSizeBytes)}</span>}
                          {doc.reviewedAt && <span>Reviewed {formatDate(doc.reviewedAt)}</span>}
                          {doc.signedAt && <span>Signed {formatDate(doc.signedAt)}</span>}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {doc.storageKey ? (
                          <Button size="sm" variant="outline" onClick={() => handleDownloadDocument(doc)}>
                            Download
                          </Button>
                        ) : (
                          <Badge variant="outline" className="border-slate-200 text-slate-500">
                            File missing
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
