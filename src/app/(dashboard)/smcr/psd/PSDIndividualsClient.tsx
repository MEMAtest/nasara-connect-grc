"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Paperclip, ChevronDown, ChevronUp, Download, Trash2, UserPlus } from "lucide-react";
import {
  useSmcrData,
  type DocumentMetadata,
  type DocumentCategory,
  type PersonRecord,
  type PsdStatus,
} from "../context/SmcrDataContext";
import { fetchDocumentBlob } from "../utils/document-storage";

const PSD_STATUS_OPTIONS: Array<{ value: PsdStatus; label: string; tone: string }> = [
  { value: "not_started", label: "Not started", tone: "bg-slate-100 text-slate-600" },
  { value: "in_progress", label: "In progress", tone: "bg-amber-100 text-amber-700" },
  { value: "complete", label: "Complete", tone: "bg-emerald-100 text-emerald-700" },
];

const documentCategoryLabels: Record<DocumentCategory, string> = {
  cv: "CV / Resume",
  dbs: "DBS / Background",
  reference: "References",
  qualification: "Qualifications",
  id: "ID Verification",
  other: "Other Documents",
};

const documentCategories: DocumentCategory[] = ["cv", "dbs", "reference", "qualification", "id", "other"];

const formatBytes = (bytes: number) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function PSDIndividualsClient() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { state, firms, activeFirmId, addPerson, updatePerson, attachDocuments, removeDocument } = useSmcrData();
  const { people, documents } = state;

  const packId = searchParams.get("packId");
  const workspaceHref = packId ? `/authorization-pack/workspace?packId=${packId}` : "/authorization-pack/workspace";
  const psdFormHref = packId ? `/smcr/forms?tab=psd-individual&packId=${packId}` : "/smcr/forms?tab=psd-individual";

  const firm = firms.find((item) => item.id === activeFirmId);

  const firmPeople = useMemo(() => {
    if (!activeFirmId) return [] as PersonRecord[];
    return people.filter((person) => person.firmId === activeFirmId);
  }, [people, activeFirmId]);

  const psdPeople = useMemo(
    () => firmPeople.filter((person) => person.isPsd),
    [firmPeople],
  );
  const availablePeople = useMemo(
    () => firmPeople.filter((person) => !person.isPsd),
    [firmPeople],
  );

  const documentsByPerson = useMemo(() => {
    const map = new Map<string, DocumentMetadata[]>();
    documents.forEach((doc) => {
      const list = map.get(doc.personId) ?? [];
      list.push(doc);
      map.set(doc.personId, list);
    });
    return map;
  }, [documents]);

  const [expandedPersonId, setExpandedPersonId] = useState<string | null>(null);
  const [selectedExistingId, setSelectedExistingId] = useState<string>("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPerson, setNewPerson] = useState({ name: "", email: "", department: "", notes: "" });
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdatingPersonId, setIsUpdatingPersonId] = useState<string | null>(null);

  const handleAddExisting = async () => {
    if (!selectedExistingId) return;
    try {
      setIsUpdatingPersonId(selectedExistingId);
      await updatePerson(selectedExistingId, { isPsd: true, psdStatus: "not_started" });
      setSelectedExistingId("");
    } catch (error) {
      toast({
        title: "Unable to add PSD individual",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPersonId(null);
    }
  };

  const handleCreatePerson = async () => {
    if (!newPerson.name.trim() || !newPerson.email.trim()) return;
    if (!activeFirmId) {
      toast({
        title: "Select a firm first",
        description: "Choose an active firm before adding PSD individuals.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsCreating(true);
      const createdId = await addPerson({
        name: newPerson.name.trim(),
        email: newPerson.email.trim(),
        department: newPerson.department.trim() || "Executive",
        assessment: { status: "not_required" },
      });
      await updatePerson(createdId, {
        notes: newPerson.notes.trim() || undefined,
        isPsd: true,
        psdStatus: "not_started",
      });
      setNewPerson({ name: "", email: "", department: "", notes: "" });
      setShowCreateDialog(false);
    } catch (error) {
      toast({
        title: "Unable to add PSD individual",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusChange = async (personId: string, value: PsdStatus) => {
    try {
      setIsUpdatingPersonId(personId);
      await updatePerson(personId, { psdStatus: value });
    } catch (error) {
      toast({
        title: "Unable to update PSD status",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPersonId(null);
    }
  };

  const handleUpload = async (personId: string, category: DocumentCategory, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const payload = Array.from(files).map((file) => ({ file, category }));
    try {
      await attachDocuments(personId, payload);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (doc: DocumentMetadata) => {
    try {
      const blob = await fetchDocumentBlob(doc.id);
      if (!blob) {
        toast({ title: "Download failed", description: "Document not found.", variant: "destructive" });
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveDocument = async (docId: string) => {
    try {
      await removeDocument(docId);
    } catch (error) {
      toast({
        title: "Unable to remove document",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumbs
          items={[
            { label: "Workspace", href: workspaceHref },
            { label: "SMCR", href: "/smcr" },
            { label: "PSD Individuals" },
          ]}
        />
        <Button variant="ghost" asChild className="text-slate-500 hover:text-slate-700">
          <Link href={workspaceHref}>Back to Workspace</Link>
        </Button>
      </div>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-600" />
            PSD Individuals
          </CardTitle>
          <CardDescription>
            Manage PSD individual forms, status, and supporting documents for {firm?.name ?? "your firm"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!activeFirmId ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-800">
              Select a firm in Governance & People before adding PSD individuals.
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            {availablePeople.length ? (
              <div className="flex flex-1 min-w-[220px] items-center gap-2">
                <Select value={selectedExistingId} onValueChange={setSelectedExistingId} disabled={!activeFirmId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add existing person to PSD list" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePeople.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={handleAddExisting}
                  disabled={!selectedExistingId || !activeFirmId || isUpdatingPersonId === selectedExistingId}
                >
                  Add
                </Button>
              </div>
            ) : null}
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={() => setShowCreateDialog(true)}
              disabled={!activeFirmId}
            >
              <UserPlus className="h-4 w-4 mr-2" /> New PSD individual
            </Button>
          </div>

          {psdPeople.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-sm text-slate-500">
              No PSD individuals added yet. Add someone to start tracking PSD forms and documents.
            </div>
          ) : (
            <div className="space-y-3">
              {psdPeople.map((person) => {
                const personDocs = documentsByPerson.get(person.id) ?? [];
                const docCount = personDocs.length;
                const isExpanded = expandedPersonId === person.id;
                const statusValue = (person.psdStatus as PsdStatus | undefined) ?? "not_started";
                return (
                  <div key={person.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{person.name}</p>
                        <p className="text-xs text-slate-500">{person.email}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {docCount} docs
                        </Badge>
                        <Select
                          value={statusValue}
                          onValueChange={(value) => handleStatusChange(person.id, value as PsdStatus)}
                          disabled={isUpdatingPersonId === person.id}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PSD_STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${option.tone}`}>
                                  {option.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedPersonId(isExpanded ? null : person.id)}
                        >
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={psdFormHref}>Open PSD form</Link>
                        </Button>
                      </div>
                    </div>

                    {isExpanded ? (
                      <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Documents</p>
                          {personDocs.length ? (
                            <div className="mt-3 space-y-2">
                              {personDocs.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                  <div className="flex items-center gap-2">
                                    <Paperclip className="h-3 w-3 text-slate-400" />
                                    <div>
                                      <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
                                      <p className="text-[11px] text-slate-500">
                                        {documentCategoryLabels[doc.category]} · {formatBytes(doc.size)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                                      <Download className="h-3 w-3 mr-1" /> Download
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleRemoveDocument(doc.id)}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-2 text-xs text-slate-500">No documents uploaded yet.</p>
                          )}
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          {documentCategories.map((category) => (
                            <div key={category} className="rounded-lg border border-slate-200 p-3">
                              <Label className="text-xs font-semibold text-slate-600">
                                {documentCategoryLabels[category]}
                              </Label>
                              <Input
                                type="file"
                                multiple
                                className="mt-2 text-xs"
                                onChange={(event) => handleUpload(person.id, category, event.target.files)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add PSD individual</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newPerson.name}
                onChange={(event) => setNewPerson((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={newPerson.email}
                onChange={(event) => setNewPerson((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Email address"
                type="email"
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                value={newPerson.department}
                onChange={(event) => setNewPerson((prev) => ({ ...prev, department: event.target.value }))}
                placeholder="Compliance, Operations, etc."
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={newPerson.notes}
                onChange={(event) => setNewPerson((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Add any context for this PSD individual."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleCreatePerson} disabled={isCreating}>
              Add individual
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
