"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  Download,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  File,
  Shield,
  Users,
  Building,
  CreditCard
} from "lucide-react";

interface EvidenceDocument {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  status: "required" | "uploaded" | "approved" | "rejected";
  uploadedAt?: Date;
  fileSize?: number;
  fileType?: string;
  notes?: string;
}

interface EvidenceManagerProps {
  assessmentId?: string;
}

export function EvidenceManager({ assessmentId }: EvidenceManagerProps) {
  const [documents, setDocuments] = useState<EvidenceDocument[]>([]);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Load evidence documents from API
  useEffect(() => {
    const loadDocuments = async () => {
      if (!assessmentId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/assessments/${assessmentId}/evidence`);
        if (response.ok) {
          const docs = await response.json();
          setDocuments(docs);
        }
      } catch (error) {
        // Log error for production monitoring - replace with proper logging service
        if (process.env.NODE_ENV === 'production') {
          // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
          // logError('evidence-documents-load-failed', error, { assessmentId });
        } else {
          console.error('Error loading evidence documents:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, [assessmentId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-emerald-500 text-white";
      case "uploaded": return "bg-blue-500 text-white";
      case "rejected": return "bg-red-500 text-white";
      case "required": return "bg-amber-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return CheckCircle2;
      case "uploaded": return Clock;
      case "rejected": return AlertCircle;
      case "required": return Upload;
      default: return File;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "business-model": return Building;
      case "governance": return Users;
      case "risk-management": return Shield;
      case "financial-resources": return CreditCard;
      case "systems-controls": return FileText;
      default: return File;
    }
  };

  const filteredDocuments = selectedCategory === "all"
    ? documents
    : documents.filter(doc => doc.category === selectedCategory);

  const stats = {
    total: documents.length,
    approved: documents.filter(d => d.status === "approved").length,
    uploaded: documents.filter(d => d.status === "uploaded").length,
    required: documents.filter(d => d.status === "required").length,
    rejected: documents.filter(d => d.status === "rejected").length
  };

  const completionPercentage = Math.round(((stats.approved + stats.uploaded) / stats.total) * 100);

  const handleFileUpload = useCallback(async (documentId: string, file: File) => {
    if (!assessmentId) return;

    try {
      // Update document status to uploaded
      const response = await fetch(`/api/assessments/${assessmentId}/evidence`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          status: 'uploaded',
          file_size: file.size,
          file_type: file.type,
          uploaded_at: new Date().toISOString()
        }),
      });

      if (response.ok) {
        // Update local state
        setDocuments(prev => prev.map(doc =>
          doc.id === documentId
            ? {
                ...doc,
                status: "uploaded" as const,
                uploadedAt: new Date(),
                fileSize: file.size,
                fileType: file.type
              }
            : doc
        ));
      }
    } catch (error) {
      // Log error for production monitoring - replace with proper logging service
      if (process.env.NODE_ENV === 'production') {
        // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
        // logError('file-upload-failed', error, { documentId, fileName: file.name, assessmentId });
      } else {
        console.error('Error uploading file:', error);
      }
    }
  }, [assessmentId]);

  if (isLoading) {
    return (
      <Card className="border border-slate-100">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading evidence documents...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Evidence Overview */}
      <Card className="border border-slate-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-600" />
                Evidence Portfolio
              </CardTitle>
              <CardDescription>
                Manage and track all required documentation for your FCA application
              </CardDescription>
            </div>
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Evidence Document</DialogTitle>
                  <DialogDescription>
                    Select a document type and upload your file
                  </DialogDescription>
                </DialogHeader>
                <UploadForm
                  documents={documents}
                  onUpload={(docId, file) => {
                    handleFileUpload(docId, file);
                    setUploadDialogOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{stats.approved}</div>
              <div className="text-sm text-slate-600">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.uploaded}</div>
              <div className="text-sm text-slate-600">Under Review</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{stats.required}</div>
              <div className="text-sm text-slate-600">Required</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{completionPercentage}%</div>
              <div className="text-sm text-slate-600">Complete</div>
            </div>
          </div>
          <Progress value={completionPercentage} className="h-3" />
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border border-slate-100">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="category-filter" className="text-sm font-medium">
              Filter by Category:
            </Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="business-model">Business Model</SelectItem>
                <SelectItem value="governance">Governance</SelectItem>
                <SelectItem value="risk-management">Risk Management</SelectItem>
                <SelectItem value="financial-resources">Financial Resources</SelectItem>
                <SelectItem value="systems-controls">Systems & Controls</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="grid gap-4">
        {filteredDocuments.map((document) => {
          const StatusIcon = getStatusIcon(document.status);
          const CategoryIcon = getCategoryIcon(document.category);

          return (
            <Card key={document.id} className="border border-slate-100">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 rounded-lg bg-slate-50">
                      <CategoryIcon className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{document.name}</h3>
                        <Badge className={getStatusColor(document.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {document.status.replace("-", " ")}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {document.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{document.description}</p>
                      {document.uploadedAt && (
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>Uploaded: {document.uploadedAt.toLocaleDateString()}</span>
                          {document.fileSize && (
                            <span>Size: {(document.fileSize / 1024).toFixed(1)} KB</span>
                          )}
                          {document.fileType && (
                            <span>Type: {document.fileType}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {document.status === "uploaded" || document.status === "approved" ? (
                      <>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700"
                        onClick={() => {
                          // Trigger file upload for this specific document
                          const input = window.document.createElement('input');
                          input.type = 'file';
                          input.accept = '.pdf,.doc,.docx,.xls,.xlsx';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              handleFileUpload(document.id, file);
                            }
                          };
                          input.click();
                        }}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Upload
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function UploadForm({
  documents,
  onUpload
}: {
  documents: EvidenceDocument[];
  onUpload: (documentId: string, file: File) => void;
}) {
  const [selectedDocument, setSelectedDocument] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  const requiredDocuments = documents.filter(doc => doc.status === "required");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDocument && file) {
      onUpload(selectedDocument, file);
      setSelectedDocument("");
      setFile(null);
      setNotes("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="document-select">Document Type</Label>
        <Select value={selectedDocument} onValueChange={setSelectedDocument}>
          <SelectTrigger>
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent>
            {requiredDocuments.map((doc) => (
              <SelectItem key={doc.id} value={doc.id}>
                {doc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="file-upload">Choose File</Label>
        <Input
          id="file-upload"
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <p className="text-xs text-slate-500 mt-1">
          Supported formats: PDF, DOC, DOCX, XLS, XLSX (Max 10MB)
        </p>
      </div>

      <div>
        <Label htmlFor="upload-notes">Notes (Optional)</Label>
        <Textarea
          id="upload-notes"
          placeholder="Add any relevant notes about this document..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[80px]"
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!selectedDocument || !file}
          className="bg-teal-600 hover:bg-teal-700"
        >
          Upload Document
        </Button>
      </div>
    </form>
  );
}
