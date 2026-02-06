"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { PackType } from "@/lib/authorization-pack-templates";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

// Icon components
function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

interface PackRow {
  id: string;
  name: string;
  status: string;
  template_type: PackType;
}

interface ReadinessSummary {
  overall: number;
  narrative: number;
  evidence: number;
  review: number;
}

interface EvidenceItem {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  annex_number?: string | null;
  file_path?: string | null;
  file_size?: number | null;
  file_type?: string | null;
  uploaded_at?: string | null;
  version?: number | null;
  section_title?: string | null;
  section_key?: string | null;
}

interface EvidenceVersion {
  id: string;
  version: number;
  filename: string;
  file_size?: number | null;
  file_type?: string | null;
  uploaded_at?: string | null;
}

// Constants for file validation
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "text/plain",
];

const ALLOWED_FILE_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".png", ".jpg", ".jpeg", ".txt"];

// Sanitize filename to prevent XSS
function sanitizeFilename(filename: string): string {
  return filename.replace(/[<>:"\/\\|?*\x00-\x1f]/g, "_").slice(0, 255);
}

// Simplified status options - no approval workflow
const EVIDENCE_STATUS_OPTIONS = [
  { value: "required", label: "Required", color: "bg-slate-100 text-slate-700", icon: DocumentIcon },
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-700", icon: ClockIcon },
  { value: "uploaded", label: "Uploaded", color: "bg-green-100 text-green-700", icon: CheckCircleIcon },
];

const FILTER_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  ...EVIDENCE_STATUS_OPTIONS,
];

function getStatusColor(status: string) {
  const option = EVIDENCE_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.color || "bg-slate-100 text-slate-700";
}

function getStatusIcon(status: string) {
  const option = EVIDENCE_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.icon || DocumentIcon;
}

function formatSize(size?: number | null) {
  if (!size) return "0 KB";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateString?: string | null) {
  if (!dateString) return "Unknown date";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function EvidenceClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packIdParam = searchParams.get("packId");
  const [pack, setPack] = useState<PackRow | null>(null);
  const [readiness, setReadiness] = useState<ReadinessSummary | null>(null);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [versionMap, setVersionMap] = useState<Record<string, EvidenceVersion[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loadingVersions, setLoadingVersions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<string | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mutation error state
  const [mutationError, setMutationError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const packResponse = await fetchWithTimeout("/api/authorization-pack/packs?organizationId=default-org").catch(
          () => null
        );
        if (!packResponse || !packResponse.ok) {
          setLoadError("Unable to load packs. Check the database connection and try again.");
          return;
        }
        const packData = await packResponse.json();
        const activePack =
          (packIdParam ? packData.packs?.find((item: PackRow) => item.id === packIdParam) : null) ??
          packData.packs?.[0] ??
          null;
        setPack(activePack);

        if (!activePack) return;

        if (packIdParam !== activePack.id) {
          router.replace(`/authorization-pack/evidence?packId=${activePack.id}`);
        }

        const readinessResponse = await fetchWithTimeout(`/api/authorization-pack/packs/${activePack.id}`).catch(
          () => null
        );
        if (readinessResponse?.ok) {
          const readinessData = await readinessResponse.json();
          setReadiness(readinessData.readiness);
        }

        const evidenceResponse = await fetchWithTimeout(
          `/api/authorization-pack/packs/${activePack.id}/evidence`
        ).catch(() => null);
        if (evidenceResponse?.ok) {
          const evidenceData = await evidenceResponse.json();
          setEvidence(evidenceData.evidence || []);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [packIdParam, router]);

  const toggleVersions = async (itemId: string) => {
    setExpanded((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
    if (versionMap[itemId] || !pack) return;
    setLoadingVersions((prev) => ({ ...prev, [itemId]: true }));
    const response = await fetch(`/api/authorization-pack/packs/${pack.id}/evidence/${itemId}/versions`);
    if (response.ok) {
      const data = await response.json();
      setVersionMap((prev) => ({ ...prev, [itemId]: data.versions || [] }));
    }
    setLoadingVersions((prev) => ({ ...prev, [itemId]: false }));
  };

  const handleUpload = useCallback(async (itemId: string, file: File) => {
    if (!pack) return;
    setMutationError(null);

    // File validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setMutationError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit`);
      return;
    }
    if (ALLOWED_FILE_TYPES.length > 0 && !ALLOWED_FILE_TYPES.includes(file.type)) {
      setMutationError("File type not allowed. Please upload PDF, Word, Excel, image, or text files.");
      return;
    }
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_FILE_EXTENSIONS.includes(fileExt)) {
      setMutationError("File extension not allowed. Please upload PDF, Word, Excel, image, or text files.");
      return;
    }

    // Sanitize filename
    const sanitizedName = sanitizeFilename(file.name);

    // Store previous state for rollback
    const previousEvidence = [...evidence];

    // Optimistic update
    setEvidence((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, status: "uploaded", file_path: sanitizedName, file_size: file.size, file_type: file.type }
          : item
      )
    );

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("evidenceItemId", itemId);
      const response = await fetch(`/api/authorization-pack/packs/${pack.id}/evidence`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload evidence");
      }
      // Clear version cache to force refresh
      setVersionMap((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    } catch (error) {
      // Rollback on error
      setEvidence(previousEvidence);
      setMutationError(error instanceof Error ? error.message : "Failed to upload evidence. Please try again.");
    }
  }, [pack, evidence]);

  const handleStatusChange = async (itemId: string, status: string) => {
    if (!pack) return;
    setMutationError(null);

    // Store previous state for rollback
    const previousEvidence = [...evidence];

    // Optimistic update
    setEvidence((prev) => prev.map((item) => (item.id === itemId ? { ...item, status } : item)));

    try {
      const response = await fetch(`/api/authorization-pack/packs/${pack.id}/evidence/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Failed to update evidence status");
      }
    } catch (error) {
      // Rollback on error
      setEvidence(previousEvidence);
      setMutationError(error instanceof Error ? error.message : "Failed to update status. Please try again.");
    }
  };

  const handleDrag = useCallback((e: React.DragEvent, itemId: string, entering: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(entering ? itemId : null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, itemId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(null);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleUpload(itemId, files[0]);
      }
    },
    [handleUpload]
  );

  // Filter evidence
  const filteredEvidence = evidence.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Group by section
  const evidenceBySection = filteredEvidence.reduce((acc, item) => {
    const section = item.section_title || "General";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, EvidenceItem[]>);

  // Summary stats
  const stats = {
    total: evidence.length,
    uploaded: evidence.filter((e) => e.status === "uploaded").length,
    pending: evidence.filter((e) => ["required", "pending"].includes(e.status)).length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={pack} readiness={readiness} />
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
              Loading evidence library...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={pack} readiness={readiness} />
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Evidence unavailable</CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="space-y-6">
        <WorkspaceHeader pack={null} readiness={null} />
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center text-slate-500">Create a pack to manage evidence.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkspaceHeader pack={pack} readiness={readiness} />

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Total Documents</p>
                <p className="text-2xl font-semibold text-slate-900">{stats.total}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <DocumentIcon className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Uploaded</p>
                <p className="text-2xl font-semibold text-green-600">{stats.uploaded}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Pending Upload</p>
                <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                <ClockIcon className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Filters:</span>
            </div>
            <div className="flex-1">
              <Input
                placeholder="Search evidence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-slate-500">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILTER_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mutation Error Display */}
      {mutationError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {mutationError}
          <button
            onClick={() => setMutationError(null)}
            className="ml-2 text-red-500 underline hover:text-red-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Evidence Hub */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DocumentIcon className="h-5 w-5 text-teal-600" />
            Evidence Hub
          </CardTitle>
          <CardDescription>
            Upload, version, and manage evidence documentation across the pack.{" "}
            {filteredEvidence.length} of {evidence.length} items shown.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {filteredEvidence.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              {evidence.length === 0 ? "No evidence items configured." : "No evidence matches your filters."}
            </div>
          ) : (
            Object.entries(evidenceBySection).map(([section, items]) => (
              <div key={section} className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">{section}</h3>
                {items.map((item) => {
                  const StatusIcon = getStatusIcon(item.status);
                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border p-4 transition-all ${
                        dragActive === item.id
                          ? "border-teal-400 bg-teal-50"
                          : "border-slate-100 hover:border-slate-200 hover:shadow-sm"
                      }`}
                      onDragEnter={(e) => handleDrag(e, item.id, true)}
                      onDragLeave={(e) => handleDrag(e, item.id, false)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, item.id)}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${getStatusColor(
                              item.status
                            )}`}
                          >
                            <StatusIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{item.name}</p>
                            {item.description && (
                              <p className="mt-0.5 text-sm text-slate-500">{item.description}</p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {item.annex_number && (
                                <Badge variant="outline" className="text-xs">
                                  {item.annex_number}
                                </Badge>
                              )}
                              {item.file_path && (
                                <span className="text-xs text-slate-400">
                                  v{item.version ?? 1} • {formatSize(item.file_size)}
                                </span>
                              )}
                              {item.uploaded_at && (
                                <span className="text-xs text-slate-400">
                                  Uploaded: {formatDate(item.uploaded_at)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* File Upload */}
                      <div className="mt-4">
                        <Label className="text-xs text-slate-500">
                          {item.file_path ? "Upload New Version" : "Upload Document"}
                        </Label>
                        <div className="mt-1">
                          {!item.file_path && (
                            <div className="mb-2 flex items-center justify-center rounded-lg border-2 border-dashed border-slate-200 px-3 py-4 text-center text-xs text-slate-400">
                              <div>
                                <UploadIcon className="mx-auto h-6 w-6" />
                                <p className="mt-1">Drop file here or click below</p>
                              </div>
                            </div>
                          )}
                          <Input
                            type="file"
                            className="text-xs"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) handleUpload(item.id, file);
                            }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {item.file_path && (
                          <Button asChild size="sm" variant="outline" className="text-xs">
                            <a href={`/api/authorization-pack/packs/${pack.id}/evidence/${item.id}`}>
                              <DownloadIcon className="mr-1.5 h-3 w-3" />
                              Download Current
                            </a>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => toggleVersions(item.id)}
                        >
                          {expanded[item.id] ? "Hide Versions" : "View Versions"}
                        </Button>
                      </div>

                      {/* Version History */}
                      {expanded[item.id] && (
                        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
                          <h4 className="mb-2 text-xs font-semibold text-slate-600">Version History</h4>
                          {loadingVersions[item.id] ? (
                            <div className="flex items-center gap-2 py-2 text-xs text-slate-400">
                              <div className="h-3 w-3 animate-spin rounded-full border border-slate-400 border-t-transparent" />
                              Loading versions...
                            </div>
                          ) : versionMap[item.id]?.length ? (
                            <div className="space-y-2">
                              {versionMap[item.id].map((version) => (
                                <div
                                  key={version.id}
                                  className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white p-2 text-xs"
                                >
                                  <div>
                                    <p className="font-medium text-slate-700">
                                      v{version.version} • {version.filename}
                                    </p>
                                    <p className="text-slate-400">
                                      {formatDate(version.uploaded_at)} • {formatSize(version.file_size)}
                                    </p>
                                  </div>
                                  <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                                    <a
                                      href={`/api/authorization-pack/packs/${pack.id}/evidence/${item.id}/versions/${version.id}`}
                                    >
                                      <DownloadIcon className="mr-1 h-3 w-3" />
                                      Download
                                    </a>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="py-2 text-xs text-slate-400">No prior versions available.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
