"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Upload,
  Trash2,
  Download,
  FolderOpen,
  Pencil,
  X,
  Loader2,
} from "lucide-react";

interface PackDocument {
  id: string;
  packId: string;
  sectionCode: string | null;
  name: string;
  description: string | null;
  storageKey: string | null;
  fileSizeBytes: number | null;
  mimeType: string | null;
  status: string;
  uploadedAt: string | null;
  createdAt: string;
}

interface DocumentUploadSectionProps {
  packId: string;
}

const FILE_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "application/pdf": FileText,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": FileText,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": FileSpreadsheet,
  "application/msword": FileText,
  "application/vnd.ms-excel": FileSpreadsheet,
  "image/png": FileImage,
  "image/jpeg": FileImage,
  "image/jpg": FileImage,
};

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "connect-forms", label: "Connect Submission Forms" },
  { value: "corporate-legal", label: "Corporate & Legal" },
  { value: "programme-operations", label: "Programme of Operations" },
  { value: "business-plan-financials", label: "Business Plan & Financials" },
  { value: "capital-own-funds", label: "Capital & Own Funds" },
  { value: "safeguarding", label: "Safeguarding" },
  { value: "governance-controls", label: "Governance & Controls" },
  { value: "it-security", label: "IT & Security" },
  { value: "aml-ctf", label: "AML/CTF" },
  { value: "policies-procedures", label: "Policies & Procedures" },
  { value: "outsourcing-structure", label: "Outsourcing & Structure" },
];

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return File;
  return FILE_TYPE_ICONS[mimeType] || File;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentUploadSection({ packId }: DocumentUploadSectionProps) {
  const [documents, setDocuments] = useState<PackDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [uploadCategory, setUploadCategory] = useState("none");
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [editingDoc, setEditingDoc] = useState<PackDocument | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", sectionCode: "" });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = useCallback(async () => {
    try {
      const response = await fetch(`/api/authorization-pack/packs/${packId}/documents`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch {
      console.error("Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  }, [packId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    const totalFiles = files.length;
    let uploadedCount = 0;

    for (const file of Array.from(files)) {
      // Validate file size (10 MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds 10 MB limit`);
        continue;
      }

      try {
        // Upload file via FormData (multipart)
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", file.name);
        if (uploadCategory !== "none") {
          formData.append("sectionCode", uploadCategory);
        }

        const response = await fetch(`/api/authorization-pack/packs/${packId}/documents`, {
          method: "POST",
          body: formData,
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
    await loadDocuments();

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (docId: string) => {
    setDeletingIds((prev) => new Set(prev).add(docId));
    try {
      const response = await fetch(
        `/api/authorization-pack/packs/${packId}/documents?documentId=${docId}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
      }
    } catch {
      setError("Failed to delete document");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(docId);
        return next;
      });
    }
  };

  const handleDownload = (docId: string, fileName: string) => {
    const url = `/api/authorization-pack/packs/${packId}/documents/${docId}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
  };

  const handleOpenEditDoc = (doc: PackDocument) => {
    setEditingDoc(doc);
    setEditForm({ name: doc.name, description: doc.description || "", sectionCode: doc.sectionCode || "" });
  };

  const handleEditDocument = async () => {
    if (!editingDoc || !editForm.name.trim()) return;
    setIsSavingEdit(true);
    try {
      const response = await fetch(`/api/authorization-pack/packs/${packId}/documents`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: editingDoc.id,
          name: editForm.name.trim(),
          description: editForm.description.trim() || null,
          sectionCode: editForm.sectionCode === "none" || !editForm.sectionCode ? null : editForm.sectionCode,
        }),
      });
      if (response.ok) {
        const newSectionCode = editForm.sectionCode === "none" || !editForm.sectionCode ? null : editForm.sectionCode;
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === editingDoc.id
              ? { ...d, name: editForm.name.trim(), description: editForm.description.trim() || null, sectionCode: newSectionCode }
              : d
          )
        );
        setEditingDoc(null);
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Failed to rename document");
      }
    } catch {
      setError("Failed to rename document");
    } finally {
      setIsSavingEdit(false);
    }
  };

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

  const filteredDocuments =
    filterCategory === "all"
      ? documents
      : documents.filter((d) => d.sectionCode === filterCategory);

  const STATUS_COLORS: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    review: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    signed: "bg-teal-100 text-teal-700",
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-200">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading documents...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <FolderOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">Documents</CardTitle>
                <CardDescription>
                  {documents.length} document{documents.length !== 1 ? "s" : ""} uploaded
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[200px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Upload Area */}
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Upload className="h-6 w-6 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">
                Drag files here or click to upload
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PDF, DOCX, XLSX, PNG, JPG up to 10 MB each
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger className="w-[200px] h-8 text-xs">
                  <SelectValue placeholder="Category for upload" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {CATEGORY_OPTIONS.filter((c) => c.value !== "all").map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.xlsx,.doc,.xls,.png,.jpg,.jpeg"
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

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* File List */}
      {filteredDocuments.length > 0 && (
        <Card className="border border-slate-200">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {filteredDocuments.map((doc) => {
                const IconComponent = getFileIcon(doc.mimeType);
                const isDeleting = deletingIds.has(doc.id);

                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 shrink-0">
                      <IconComponent className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400">
                          {formatFileSize(doc.fileSizeBytes)}
                        </span>
                        {doc.sectionCode && (
                          <Badge variant="outline" className="text-[9px] h-4">
                            {CATEGORY_OPTIONS.find((c) => c.value === doc.sectionCode)?.label ||
                              doc.sectionCode}
                          </Badge>
                        )}
                        {doc.status && (
                          <Badge className={`text-[9px] h-4 ${STATUS_COLORS[doc.status] || ""}`}>
                            {doc.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {doc.storageKey && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDownload(doc.id, doc.name)}
                        >
                          <Download className="h-3.5 w-3.5 text-slate-500" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-teal-700 hover:bg-teal-50"
                        onClick={() => handleOpenEditDoc(doc)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(doc.id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredDocuments.length === 0 && !isLoading && (
        <Card className="border border-slate-200">
          <CardContent className="p-8 text-center">
            <FolderOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No documents uploaded yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Upload files using the area above
            </p>
          </CardContent>
        </Card>
      )}

      {/* Rename Document Dialog */}
      <Dialog open={!!editingDoc} onOpenChange={(open) => { if (!open) setEditingDoc(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
            <DialogDescription>Update the name and description for this document</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Document name"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={editForm.sectionCode || "none"}
                onValueChange={(value) => setEditForm((prev) => ({ ...prev, sectionCode: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {CATEGORY_OPTIONS.filter((c) => c.value !== "all").map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDoc(null)} disabled={isSavingEdit}>
              Cancel
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={handleEditDocument}
              disabled={!editForm.name.trim() || isSavingEdit}
            >
              {isSavingEdit ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
