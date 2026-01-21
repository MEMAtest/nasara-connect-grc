"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FileText, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { ProjectHeader } from "./ProjectHeader";
import { BusinessPlanProfileClient } from "./BusinessPlanProfileClient";
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
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [missingQuestions, setMissingQuestions] = useState<ProfileQuestion[]>([]);
  const [isCheckingMissing, setIsCheckingMissing] = useState(false);

  const loadData = async () => {
    if (!projectId) return;
    setIsLoading(true);
    setLoadError(null);
    setDocsError(null);
    setDownloadError(null);
    try {
      const projectRes = await fetchWithTimeout(`/api/authorization-pack/projects/${projectId}`).catch(() => null);

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
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  useEffect(() => {
    if (activeTab !== "documents" || !projectId) return;
    let isMounted = true;
    setIsCheckingMissing(true);
    checkMissingQuestions()
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
  }, [activeTab, projectId, project?.permissionCode]);


  const isResponseComplete = (
    question: ProfileQuestion,
    response: ProfileResponse | undefined,
    allResponses?: Record<string, ProfileResponse>
  ) => {
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
  };

  const checkMissingQuestions = async (): Promise<ProfileQuestion[]> => {
    if (!projectId) return [];
    try {
      const response = await fetch(`/api/authorization-pack/projects/${projectId}/business-plan-profile`);
      if (!response.ok) return [];
      const data = await response.json();
      const responses = data?.profile?.responses ?? {};
      const permission = isProfilePermissionCode(project?.permissionCode) ? project?.permissionCode : null;
      const questions = getProfileQuestions(permission);
      const required = questions.filter((q) => q.required);
      return required.filter((q) => !isResponseComplete(q, responses[q.id], responses));
    } catch {
      return [];
    }
  };

  const handleGenerateOpinionPack = async () => {
    if (!project?.packId) {
      setGenerateError("No pack associated with this project.");
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);
    setDownloadError(null);
    setMissingQuestions([]);

    // Check for missing questions first
    const missing = await checkMissingQuestions();
    if (missing.length > 0) {
      setMissingQuestions(missing);
      setGenerateError(`Please complete ${missing.length} required question${missing.length > 1 ? "s" : ""} before generating the opinion pack.`);
      setIsGenerating(false);
      return;
    }

    try {
      const response = await fetch(`/api/authorization-pack/packs/${project.packId}/generate-business-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        setGenerateError(errorData.error || "Failed to generate opinion pack");
        // Also check for missing questions on server error
        const missingCheck = await checkMissingQuestions();
        if (missingCheck.length > 0) {
          setMissingQuestions(missingCheck);
        }
        return;
      }

      // Download the PDF
      const blob = await response.blob();
      const documentName =
        response.headers.get("X-Document-Filename") ||
        response.headers.get("X-Document-Name") ||
        "Perimeter Opinion Pack";
      const safeFilename = ensurePdfFilename(sanitizeFilename(documentName));
      triggerDownload(blob, safeFilename);

      // Reload documents to show the new entry
      await loadData();
    } catch (err) {
      setGenerateError("Failed to connect to the server. Please try again.");
    } finally {
      setIsGenerating(false);
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
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <p className="text-slate-500">Loading opinion pack...</p>
          </div>
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
          <Button className="bg-teal-600 hover:bg-teal-700" onClick={loadData}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const generatedDocs = documents.length;

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} active="opinion-pack" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap justify-start">
          <TabsTrigger value="profile">Phase 1 - Business Plan Profile</TabsTrigger>
          <TabsTrigger value="documents">Phase 2 - Opinion Pack</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <BusinessPlanProfileClient
            projectId={project.id}
            permissionCode={project.permissionCode}
            permissionName={project.permissionName}
            onNextPhase={() => setActiveTab("documents")}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Perimeter Opinion Pack</h2>
              <p className="text-sm text-slate-500">
                Auto-generated 5-7 page perimeter opinion based on Phase 1 profile responses.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={handleGenerateOpinionPack}
                disabled={isGenerating || isCheckingMissing || missingQuestions.length > 0 || !project?.packId}
              >
                {isGenerating || isCheckingMissing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isCheckingMissing ? "Checking..." : "Generating..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Opinion Pack
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">AI workflow</p>
            <p className="mt-2">
              Complete the Business Plan Profile in Phase 1 first. Then click Generate Opinion Pack to create your 5-7 page
              perimeter opinion. The AI will synthesize your answers into regulatory narrative. Regenerate anytime after updates.
            </p>
          </div>

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
                <p className="mt-1 text-sm text-indigo-600">
                  AI is synthesizing your profile answers into a perimeter opinion. This may take a moment.
                </p>
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
                  {documents[0]?.uploadedAt ? formatDate(documents[0].uploadedAt) : "—"}
                </p>
                <p className="text-xs text-slate-500">Last generated date</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-200">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Downloads</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{documents.filter((doc) => doc.storageKey).length}</p>
                <p className="text-xs text-slate-500">Available files</p>
              </CardContent>
            </Card>
          </div>

          {documents.length === 0 ? (
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
              {documents.map((doc) => (
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
