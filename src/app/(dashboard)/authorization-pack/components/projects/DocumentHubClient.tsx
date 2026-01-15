"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FileText, Loader2, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { ProjectHeader } from "./ProjectHeader";

interface ProjectDocument {
  id: string;
  name: string;
  description?: string;
  sectionCode?: string;
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

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  review: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  signed: "bg-teal-100 text-teal-700",
};

const sectionLabels: Record<string, string> = {
  "business-plan": "Business Plan",
  "executive-summary": "Executive Summary",
  "business-model": "Business Model",
  "regulatory-permissions": "Regulatory Permissions",
  "corporate-structure": "Corporate Structure",
  "financial-projections": "Financial Projections",
  "aml-ctf": "AML/CTF Framework",
  "consumer-duty": "Consumer Duty",
};

export function DocumentHubClient() {
  const params = useParams();
  const projectId = params?.projectId as string | undefined;
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Upload form state
  const [uploadName, setUploadName] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadSection, setUploadSection] = useState("");

  const loadData = async () => {
    if (!projectId) return;
    setIsLoading(true);
    setLoadError(null);
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
            permissionCode: proj.permission_code,
            permissionName: proj.permission_name,
            status: proj.status,
            packId: proj.pack_id,
          });
          packIdForDocs = proj.pack_id;
        }
      }

      if (packIdForDocs) {
        const docsRes = await fetchWithTimeout(`/api/packs/${packIdForDocs}/documents`).catch(() => null);
        if (docsRes?.ok) {
          const docsData = await docsRes.json();
          setDocuments(docsData.documents || []);
        }
      }
    } catch {
      setLoadError("Failed to load document hub.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleUpload = async () => {
    if (!project?.packId || !uploadName.trim()) return;
    setIsUploading(true);
    try {
      const response = await fetch(`/api/packs/${project.packId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: uploadName,
          description: uploadDescription,
          sectionCode: uploadSection || undefined,
          uploadedBy: "consultant", // In real app, get from auth
        }),
      });

      if (response.ok) {
        setUploadName("");
        setUploadDescription("");
        setUploadSection("");
        setShowUploadForm(false);
        await loadData();
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleStatusChange = async (docId: string, newStatus: string) => {
    if (!project?.packId) return;
    try {
      await fetch(`/api/packs/${project.packId}/documents`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: docId,
          status: newStatus,
          ...(newStatus === "review" ? { reviewedAt: new Date().toISOString(), reviewedBy: "consultant" } : {}),
          ...(newStatus === "signed" ? { signedAt: new Date().toISOString(), signedBy: "client" } : {}),
        }),
      });
      await loadData();
    } catch {
      // Handle error silently
    }
  };

  const handleGenerateBusinessPlan = async () => {
    if (!project?.packId) {
      setGenerateError("No pack associated with this project.");
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const response = await fetch(`/api/authorization-pack/packs/${project.packId}/generate-business-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        setGenerateError(errorData.error || "Failed to generate business plan");
        return;
      }

      // Download the PDF
      const blob = await response.blob();
      const documentName = response.headers.get("X-Document-Name") || "Business Plan";
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${documentName.replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Reload documents to show the new entry
      await loadData();
    } catch (err) {
      setGenerateError("Failed to connect to the server. Please try again.");
    } finally {
      setIsGenerating(false);
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
        <CardContent className="p-8 text-center text-slate-500">Loading document hub...</CardContent>
      </Card>
    );
  }

  if (loadError || !project) {
    return (
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Document hub unavailable</CardTitle>
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

  const draftDocs = documents.filter((d) => d.status === "draft");
  const reviewDocs = documents.filter((d) => d.status === "review");
  const approvedDocs = documents.filter((d) => d.status === "approved" || d.status === "signed");

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} active="documents" />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Document Hub</h2>
          <p className="text-sm text-slate-500">
            Business plan documents uploaded by Nasara consultants for client review and sign-off.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={handleGenerateBusinessPlan}
            disabled={isGenerating || !project?.packId}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Business Plan
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="border-teal-200 text-teal-700 hover:bg-teal-50"
            onClick={() => setShowUploadForm(!showUploadForm)}
            disabled={!project?.packId}
          >
            {showUploadForm ? (
              "Cancel"
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </div>

      {generateError && (
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-700">{generateError}</p>
          </CardContent>
        </Card>
      )}

      {isGenerating && (
        <Card className="border border-indigo-200 bg-indigo-50">
          <CardContent className="p-6 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
            <p className="mt-3 font-medium text-indigo-900">Generating your business plan...</p>
            <p className="mt-1 text-sm text-indigo-600">
              AI is synthesizing your pack narrative into a professional document. This may take a moment.
            </p>
          </CardContent>
        </Card>
      )}

      {showUploadForm && (
        <Card className="border border-teal-200 bg-teal-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Upload new document</CardTitle>
            <CardDescription>Add a business plan section or supporting document for client review.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Document name *</Label>
                <Input
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="e.g., Business Model Section v1"
                />
              </div>
              <div className="space-y-2">
                <Label>Section (optional)</Label>
                <select
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  value={uploadSection}
                  onChange={(e) => setUploadSection(e.target.value)}
                >
                  <option value="">Select section...</option>
                  {Object.entries(sectionLabels).map(([code, label]) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Brief description of this document..."
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleUpload} disabled={!uploadName.trim() || isUploading}>
                {isUploading ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Draft</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{draftDocs.length}</p>
            <p className="text-xs text-slate-500">Awaiting review</p>
          </CardContent>
        </Card>
        <Card className="border border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-amber-600">In Review</p>
            <p className="mt-1 text-2xl font-semibold text-amber-900">{reviewDocs.length}</p>
            <p className="text-xs text-amber-600">Client reviewing</p>
          </CardContent>
        </Card>
        <Card className="border border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-600">Approved / Signed</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-900">{approvedDocs.length}</p>
            <p className="text-xs text-emerald-600">Ready for submission</p>
          </CardContent>
        </Card>
      </div>

      {/* Document List */}
      {documents.length === 0 ? (
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center">
            <p className="text-slate-500">No documents uploaded yet.</p>
            <p className="mt-2 text-sm text-slate-400">
              Nasara consultants will upload business plan sections here for your review.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id} className={`border ${doc.sectionCode === "business-plan" ? "border-indigo-200 bg-indigo-50/30" : "border-slate-200"}`}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className={`h-5 w-5 ${doc.sectionCode === "business-plan" ? "text-indigo-500" : "text-slate-400"}`} />
                      <h3 className="font-semibold text-slate-900">{doc.name}</h3>
                      <Badge className={statusColors[doc.status]}>{doc.status}</Badge>
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
                    {doc.status === "draft" && (
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(doc.id, "review")}>
                        Submit for Review
                      </Button>
                    )}
                    {doc.status === "review" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(doc.id, "draft")}>
                          Request Changes
                        </Button>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleStatusChange(doc.id, "approved")}
                        >
                          Approve
                        </Button>
                      </>
                    )}
                    {doc.status === "approved" && (
                      <Button
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700"
                        onClick={() => handleStatusChange(doc.id, "signed")}
                      >
                        Sign Off
                      </Button>
                    )}
                    {doc.status === "signed" && (
                      <Badge className="bg-teal-600 text-white">Signed</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
