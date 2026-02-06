"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Requirement,
  RequirementCategory,
  RequirementDocument,
  requirementCategories,
} from "@/lib/requirements-by-permission";
import { getGuidanceByKey } from "@/lib/guidance-content";

// Icon components
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  );
}

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

interface RequirementsListProps {
  requirements: Requirement[];
  uploadedDocuments?: Map<string, string[]>; // Map of documentId to uploaded file names
  onUploadClick?: (documentId: string, requirementId: string) => void;
  onGuidanceClick?: (guidanceKey: string) => void;
}

export function RequirementsList({
  requirements,
  uploadedDocuments = new Map(),
  onUploadClick,
  onGuidanceClick,
}: RequirementsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<RequirementCategory | "all">("all");
  const [mandatoryFilter, setMandatoryFilter] = useState<"all" | "mandatory" | "optional">("all");
  const [expandedRequirements, setExpandedRequirements] = useState<Set<string>>(new Set());

  // Filter requirements
  const filteredRequirements = useMemo(() => {
    return requirements.filter((req) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = categoryFilter === "all" || req.category === categoryFilter;

      // Mandatory filter
      const matchesMandatory =
        mandatoryFilter === "all" ||
        (mandatoryFilter === "mandatory" && req.isMandatory) ||
        (mandatoryFilter === "optional" && !req.isMandatory);

      return matchesSearch && matchesCategory && matchesMandatory;
    });
  }, [requirements, searchQuery, categoryFilter, mandatoryFilter]);

  // Group filtered requirements by category
  const groupedRequirements = useMemo(() => {
    const grouped = new Map<RequirementCategory, Requirement[]>();

    filteredRequirements.forEach((req) => {
      const existing = grouped.get(req.category) || [];
      existing.push(req);
      grouped.set(req.category, existing);
    });

    return grouped;
  }, [filteredRequirements]);

  const toggleRequirement = (id: string) => {
    setExpandedRequirements((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isDocumentUploaded = (docId: string) => {
    return uploadedDocuments.has(docId) && (uploadedDocuments.get(docId)?.length || 0) > 0;
  };

  const getCategoryStats = (category: RequirementCategory) => {
    const categoryReqs = requirements.filter((r) => r.category === category);
    const mandatoryDocs = categoryReqs.flatMap((r) => r.documents.filter((d) => d.isMandatory));
    const uploadedCount = mandatoryDocs.filter((d) => isDocumentUploaded(d.id)).length;
    return { total: mandatoryDocs.length, uploaded: uploadedCount };
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card className="border border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <DocumentIcon className="h-5 w-5 text-teal-600" />
            FCA Requirements
          </CardTitle>
          <CardDescription>
            What you need to prepare for your authorization application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-2xl font-bold text-slate-900">{requirements.length}</p>
              <p className="text-xs text-slate-500">Total Requirements</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3 text-center">
              <p className="text-2xl font-bold text-red-600">
                {requirements.filter((r) => r.isMandatory).length}
              </p>
              <p className="text-xs text-red-700">Mandatory</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-2xl font-bold text-slate-600">
                {requirements.filter((r) => !r.isMandatory).length}
              </p>
              <p className="text-xs text-slate-500">Optional</p>
            </div>
            <div className="rounded-lg bg-teal-50 p-3 text-center">
              <p className="text-2xl font-bold text-teal-600">
                {requirements.reduce((acc, r) => acc + r.documents.filter((d) => d.isMandatory).length, 0)}
              </p>
              <p className="text-xs text-teal-700">Documents Needed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search requirements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(value) => setCategoryFilter(value as RequirementCategory | "all")}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(requirementCategories).map(([key, info]) => (
              <SelectItem key={key} value={key}>
                {info.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={mandatoryFilter}
          onValueChange={(value) => setMandatoryFilter(value as "all" | "mandatory" | "optional")}
        >
          <SelectTrigger className="w-full md:w-[160px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="mandatory">Mandatory Only</SelectItem>
            <SelectItem value="optional">Optional Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requirements by Category */}
      <div className="space-y-4">
        {Array.from(groupedRequirements.entries()).map(([category, reqs]) => {
          const categoryInfo = requirementCategories[category];
          const stats = getCategoryStats(category);

          return (
            <Card key={category} className="border border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{categoryInfo.label}</CardTitle>
                    <CardDescription>{categoryInfo.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {stats.uploaded}/{stats.total} docs
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {reqs.map((req) => {
                  const isExpanded = expandedRequirements.has(req.id);
                  const guidance = getGuidanceByKey(req.guidanceKey);
                  const mandatoryDocs = req.documents.filter((d) => d.isMandatory);
                  const optionalDocs = req.documents.filter((d) => !d.isMandatory);

                  return (
                    <div key={req.id} className="rounded-lg border border-slate-100 bg-white">
                      {/* Requirement Header */}
                      <button
                        onClick={() => toggleRequirement(req.id)}
                        className="flex w-full items-center justify-between p-4 text-left"
                        aria-expanded={isExpanded}
                        aria-controls={`requirement-detail-${req.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <h4 className="font-medium text-slate-900">{req.title}</h4>
                            {req.isMandatory && (
                              <Badge className="flex-shrink-0 bg-red-100 text-red-700 text-xs">Required</Badge>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-slate-500">{req.description}</p>
                          <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                            {req.fcaReference && <span>{req.fcaReference}</span>}
                            <span>{mandatoryDocs.length} mandatory documents</span>
                            {optionalDocs.length > 0 && <span>{optionalDocs.length} optional</span>}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUpIcon className="h-5 w-5 flex-shrink-0 text-slate-400" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5 flex-shrink-0 text-slate-400" />
                        )}
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div id={`requirement-detail-${req.id}`} className="border-t border-slate-100 p-4 space-y-4">
                          {/* Guidance Link */}
                          {guidance && (
                            <div className="rounded-lg bg-teal-50 p-3">
                              <div className="flex items-start gap-2">
                                <BookOpenIcon className="h-5 w-5 flex-shrink-0 text-teal-600" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-teal-800">Guidance Available</p>
                                  <p className="mt-1 text-xs text-teal-700 line-clamp-2">
                                    {guidance.plainEnglish.substring(0, 150)}...
                                  </p>
                                  {onGuidanceClick && (
                                    <button
                                      onClick={() => onGuidanceClick(req.guidanceKey)}
                                      className="mt-2 text-xs font-medium text-teal-600 hover:text-teal-700"
                                    >
                                      View full guidance
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Documents List */}
                          <div className="space-y-3">
                            <p className="text-sm font-medium text-slate-700">Required Documents</p>
                            {mandatoryDocs.map((doc) => (
                              <DocumentRow
                                key={doc.id}
                                document={doc}
                                requirementId={req.id}
                                isUploaded={isDocumentUploaded(doc.id)}
                                uploadedFiles={uploadedDocuments.get(doc.id) || []}
                                onUploadClick={onUploadClick}
                              />
                            ))}

                            {optionalDocs.length > 0 && (
                              <>
                                <p className="mt-4 text-sm font-medium text-slate-500">Optional Documents</p>
                                {optionalDocs.map((doc) => (
                                  <DocumentRow
                                    key={doc.id}
                                    document={doc}
                                    requirementId={req.id}
                                    isUploaded={isDocumentUploaded(doc.id)}
                                    uploadedFiles={uploadedDocuments.get(doc.id) || []}
                                    onUploadClick={onUploadClick}
                                  />
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredRequirements.length === 0 && (
        <Card className="border border-slate-200">
          <CardContent className="py-12 text-center">
            <SearchIcon className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm text-slate-500">No requirements match your filters</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
                setMandatoryFilter("all");
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Document Row Component
interface DocumentRowProps {
  document: RequirementDocument;
  requirementId: string;
  isUploaded: boolean;
  uploadedFiles: string[];
  onUploadClick?: (documentId: string, requirementId: string) => void;
}

function DocumentRow({ document, requirementId, isUploaded, uploadedFiles, onUploadClick }: DocumentRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <DocumentIcon className={`h-4 w-4 ${isUploaded ? "text-green-500" : "text-slate-400"}`} />
          <p className="text-sm font-medium text-slate-700">{document.name}</p>
          {document.isMandatory && (
            <Badge variant="outline" className="text-xs border-red-200 text-red-600">
              Required
            </Badge>
          )}
        </div>
        <p className="mt-1 text-xs text-slate-500">{document.description}</p>
        {isUploaded && uploadedFiles.length > 0 && (
          <p className="mt-1 text-xs text-green-600">
            Uploaded: {uploadedFiles.join(", ")}
          </p>
        )}
        <p className="mt-1 text-xs text-slate-400">
          Accepted: {document.evidenceTypes.join(", ")}
        </p>
      </div>
      <Button
        variant={isUploaded ? "outline" : "default"}
        size="sm"
        className={isUploaded ? "text-green-600 border-green-200" : "bg-teal-600 hover:bg-teal-700"}
        onClick={() => onUploadClick?.(document.id, requirementId)}
      >
        <UploadIcon className="mr-1.5 h-4 w-4" />
        {isUploaded ? "Replace" : "Upload"}
      </Button>
    </div>
  );
}
