"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart3,
  Download,
  Loader2,
  Save,
  Plus,
  Trash2,
  FileSpreadsheet,
  ScrollText,
  Calculator,
  Upload,
  FolderOpen,
  X,
  FileText,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface CapitalRequirements {
  shareCapital: number;
  instruments: string;
  ownFundsCalculation: number;
}

interface Assumption {
  key: string;
  note: string;
}

interface UploadedFinancialDoc {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  fileSizeBytes: number | null;
}

interface FinancialSectionProps {
  packId: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SUB_TABS = [
  { id: "templates", label: "FCA Templates", icon: FileSpreadsheet },
  { id: "upload", label: "Upload Completed", icon: Upload },
  { id: "assumptions", label: "Key Assumptions", icon: ScrollText },
  { id: "capital", label: "Capital & Prudential", icon: Calculator },
] as const;

type SubTabId = typeof SUB_TABS[number]["id"];

const FCA_TEMPLATES = [
  {
    id: "payments-digital",
    title: "Payments & Digital Assets",
    description:
      "For firms applying for Payment Institution, E-Money Institution, or Crypto/Digital Asset authorisation. Includes Guidance, Income Statement, Balance Sheet, Cash Flow, and Qualitative Questions.",
    detail: "Fill in 3 years historical + 3 years forecast data across all tabs.",
    fileName: "financial-data-template-payments-digital-assets.xlsx",
    href: "/templates/financial-data-template-payments-digital-assets.xlsx",
  },
  {
    id: "wholesale-consumer",
    title: "Wholesale, Consumer & Investment Firms",
    description:
      "For firms applying for investment firm, consumer credit, or wholesale authorisation. Includes Guidance, Income Statement, Balance Sheet, and Qualitative Questions.",
    detail: "Fill in 3 years historical + 3 years forecast data across all tabs.",
    fileName: "financial-data-template-wholesale-consumer-investment-firms.xlsx",
    href: "/templates/financial-data-template-wholesale-consumer-investment-firms.xlsx",
  },
];

// ============================================================================
// HELPER
// ============================================================================

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FinancialSection({ packId }: FinancialSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>("templates");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Assumptions state
  const [assumptions, setAssumptions] = useState<Assumption[]>([
    { key: "Revenue growth rate", note: "" },
    { key: "Customer acquisition rate", note: "" },
    { key: "Average transaction value", note: "" },
    { key: "Staff headcount plan", note: "" },
    { key: "Technology investment", note: "" },
  ]);

  // Capital state
  const [capitalReqs, setCapitalReqs] = useState<CapitalRequirements>({
    shareCapital: 0,
    instruments: "",
    ownFundsCalculation: 0,
  });

  // Upload state
  const [uploadedDocs, setUploadedDocs] = useState<UploadedFinancialDoc[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save handler (assumptions + capital only)
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/authorization-pack/packs/${packId}/financials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assumptions,
          capitalRequirements: capitalReqs,
        }),
      });
      if (!response.ok) throw new Error("Failed to save");
    } catch {
      setError("Failed to save financial data");
    } finally {
      setIsSaving(false);
    }
  };

  // Load saved data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/authorization-pack/packs/${packId}/financials`);
        if (response.ok) {
          const data = await response.json();
          if (data.financials) {
            if (data.financials.assumptions?.length) setAssumptions(data.financials.assumptions);
            if (data.financials.capitalRequirements) setCapitalReqs(data.financials.capitalRequirements);
          }
        }
      } catch {
        // No saved data yet
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [packId]);

  // Load uploaded financial docs
  const loadUploadedDocs = useCallback(async () => {
    try {
      const response = await fetch(`/api/authorization-pack/packs/${packId}/documents`);
      if (response.ok) {
        const data = await response.json();
        const financialDocs = (data.documents || []).filter(
          (d: { sectionCode: string | null }) => d.sectionCode === "financials"
        );
        setUploadedDocs(financialDocs);
      }
    } catch {
      // ignore
    }
  }, [packId]);

  useEffect(() => {
    loadUploadedDocs();
  }, [loadUploadedDocs]);

  // Upload handler
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    const totalFiles = files.length;
    let uploadedCount = 0;

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds 10 MB limit`);
        continue;
      }

      try {
        const response = await fetch(`/api/authorization-pack/packs/${packId}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            description: "Financial data template upload",
            sectionCode: "financials",
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Failed to upload");
        }

        uploadedCount++;
        setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to upload ${file.name}`);
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
    await loadUploadedDocs();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Delete uploaded doc
  const handleDeleteDoc = async (docId: string) => {
    try {
      const response = await fetch(
        `/api/authorization-pack/packs/${packId}/documents?documentId=${docId}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        setUploadedDocs((prev) => prev.filter((d) => d.id !== docId));
      }
    } catch {
      setError("Failed to delete document");
    }
  };

  // Drag handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base">Financial Projections</CardTitle>
                <CardDescription>
                  Download FCA templates, complete offline, then upload
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-teal-600 hover:bg-teal-700"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 pb-px">
        {SUB_TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-md border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? "border-teal-500 text-teal-700 bg-teal-50/50"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <TabIcon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {isLoading ? (
        <Card className="border border-slate-200">
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading financial data...
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* FCA Templates Tab */}
          {activeSubTab === "templates" && (
            <div className="grid gap-4 md:grid-cols-2">
              {FCA_TEMPLATES.map((tpl) => (
                <Card key={tpl.id} className="border border-slate-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-green-600" />
                      <CardTitle className="text-sm">{tpl.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-slate-600">{tpl.description}</p>
                    <p className="text-[11px] text-slate-400">{tpl.detail}</p>
                    <Button variant="outline" size="sm" asChild>
                      <a href={tpl.href} download={tpl.fileName}>
                        <Download className="h-4 w-4 mr-1" />
                        Download Template
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {/* Instructions */}
              <div className="md:col-span-2">
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <p className="text-xs text-blue-700 font-medium mb-2">How to use</p>
                  <ol className="text-[11px] text-blue-600 space-y-1 list-decimal list-inside">
                    <li>Download the template that matches your firm type</li>
                    <li>Read the Guidance tab carefully for FCA-specific instructions</li>
                    <li>Fill in 3 years historical data + 3 years forecast across all tabs</li>
                    <li>
                      Come back here and upload your completed template under the{" "}
                      <strong>Upload Completed</strong> tab
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Upload Completed Tab */}
          {activeSubTab === "upload" && (
            <div className="space-y-4">
              {/* Drop zone */}
              <Card
                className={`border-2 border-dashed transition-colors ${
                  isDragOver
                    ? "border-teal-400 bg-teal-50"
                    : "border-slate-300 bg-white hover:border-slate-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <Upload className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Upload completed FCA financial template
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        XLSX, XLS, PDF up to 10 MB — drag here or click to select
                      </p>
                    </div>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".xlsx,.xls,.pdf,.docx"
                      className="hidden"
                      onChange={(e) => handleUpload(e.target.files)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading... {uploadProgress}%
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Select Files
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Uploaded files list */}
              {uploadedDocs.length > 0 ? (
                <Card className="border border-slate-200">
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                      {uploadedDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 shrink-0">
                            <FileText className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {doc.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {doc.fileSizeBytes && (
                                <span className="text-[10px] text-slate-400">
                                  {formatFileSize(doc.fileSizeBytes)}
                                </span>
                              )}
                              <Badge className="text-[9px] h-4 bg-green-100 text-green-700 border-0">
                                financials
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = `/api/authorization-pack/packs/${packId}/documents/${doc.id}`;
                                link.download = doc.name;
                                link.click();
                              }}
                            >
                              <Download className="h-3.5 w-3.5 text-slate-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteDoc(doc.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border border-slate-200">
                  <CardContent className="p-8 text-center">
                    <FolderOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No financial files uploaded yet</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Download a template from the FCA Templates tab, fill it in, then upload here
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Key Assumptions */}
          {activeSubTab === "assumptions" && (
            <Card className="border border-slate-200">
              <CardContent className="p-4 space-y-3">
                {assumptions.map((a, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">{a.key}</Label>
                      <button
                        className="text-slate-400 hover:text-red-500"
                        onClick={() =>
                          setAssumptions((prev) => prev.filter((_, i) => i !== idx))
                        }
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <Textarea
                      value={a.note}
                      onChange={(e) =>
                        setAssumptions((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, note: e.target.value } : item
                          )
                        )
                      }
                      placeholder="Describe the assumption and basis..."
                      rows={2}
                      className="text-xs"
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setAssumptions((prev) => [
                      ...prev,
                      { key: `Assumption ${prev.length + 1}`, note: "" },
                    ])
                  }
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Assumption
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Capital & Prudential */}
          {activeSubTab === "capital" && (
            <Card className="border border-slate-200">
              <CardContent className="p-4 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Share Capital (GBP)</Label>
                    <Input
                      type="number"
                      value={capitalReqs.shareCapital || ""}
                      onChange={(e) =>
                        setCapitalReqs((prev) => ({
                          ...prev,
                          shareCapital: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Own Funds Calculation (GBP)</Label>
                    <Input
                      type="number"
                      value={capitalReqs.ownFundsCalculation || ""}
                      onChange={(e) =>
                        setCapitalReqs((prev) => ({
                          ...prev,
                          ownFundsCalculation: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Capital Instruments Description</Label>
                  <Textarea
                    value={capitalReqs.instruments}
                    onChange={(e) =>
                      setCapitalReqs((prev) => ({ ...prev, instruments: e.target.value }))
                    }
                    placeholder="Describe capital instruments (ordinary shares, preference shares, etc.)..."
                    rows={3}
                    className="text-xs"
                  />
                </div>
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                  <p className="text-xs text-blue-700 font-medium mb-1">FCA Capital Requirement</p>
                  <p className="text-[11px] text-blue-600">
                    Payment Institutions must hold minimum own funds of EUR 125,000 (or GBP
                    equivalent) for payment services under Article 7(b) PSR 2017. Method A, B, or C
                    may apply.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
