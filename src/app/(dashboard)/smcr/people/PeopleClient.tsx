"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  Download,
  Edit,
  FileText,
  Layers,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Shield,
  Trash2,
  Upload,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useSmcrData,
  PersonRecord,
  DocumentMetadata,
  DocumentCategory,
  RoleAssignment,
  RoleApprovalStatus,
  PersonAssessment,
} from "../context/SmcrDataContext";
import { fetchDocumentBlob } from "../utils/document-storage";
import { allSMFs, certificationFunctions } from "../data/core-functions";
import { TrainingStatus } from "../data/role-training";
import { FirmSwitcher } from "../components/FirmSwitcher";

const departments = [
  "Executive",
  "Compliance",
  "Risk Management",
  "Operations",
  "Finance",
  "Legal",
  "HR",
  "Technology",
  "Customer Service",
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

const approvalStatusOptions: { value: RoleApprovalStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

type AssessmentStatus = PersonAssessment["status"];

type FormState = {
  name: string;
  email: string;
  department: string;
  title: string;
  phone: string;
  address: string;
  lineManager: string;
  startDate?: Date;
  hireDate?: Date;
  assessmentStatus: AssessmentStatus;
  trainingCompletion: number;
  lastAssessment?: Date;
  nextAssessment?: Date;
  documents: Record<DocumentCategory, File[]>;
};

type RoleFormState = {
  functionType: "SMF" | "CF";
  functionId: string;
  entity: string;
  startDate?: Date;
  endDate?: Date;
  assessmentDate?: Date;
  approvalStatus: RoleApprovalStatus;
  notes: string;
};

function createEmptyDocuments(): Record<DocumentCategory, File[]> {
  return {
    cv: [],
    dbs: [],
    reference: [],
    qualification: [],
    id: [],
    other: [],
  };
}

function createInitialFormState(): FormState {
  return {
    name: "",
    email: "",
    department: "",
    title: "",
    phone: "",
    address: "",
    lineManager: "",
    startDate: undefined,
    hireDate: undefined,
    assessmentStatus: "not_required",
    trainingCompletion: 0,
    lastAssessment: undefined,
    nextAssessment: undefined,
    documents: createEmptyDocuments(),
  };
}

function createDefaultRoleForm(): RoleFormState {
  return {
    functionType: "SMF",
    functionId: "",
    entity: "",
    startDate: undefined,
    endDate: undefined,
    assessmentDate: undefined,
    approvalStatus: "pending",
    notes: "",
  };
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function safeFormatDate(value?: string) {
  if (!value) return "—";
  try {
    return format(new Date(value), "PPP");
  } catch {
    return "—";
  }
}

function toISO(date?: Date) {
  return date ? new Date(date).toISOString() : undefined;
}

function fromISO(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

const trainingStatusBadge: Record<TrainingStatus, string> = {
  not_started: "bg-slate-100 text-slate-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
};

const statusBadgeClass: Record<AssessmentStatus, string> = {
  current: "bg-green-100 text-green-800",
  due: "bg-amber-100 text-amber-800",
  overdue: "bg-red-100 text-red-800",
  not_required: "bg-slate-100 text-slate-700",
};

export function PeopleClient() {
  const {
    state,
    isReady,
    addPerson,
    updatePerson,
    removePerson,
    attachDocuments,
    removeDocument,
    assignRole,
    removeRole,
    updateTrainingItemStatus,
    firms,
    activeFirmId,
  } = useSmcrData();

  const { people, documents, roles, assessments } = state;
  const firmPeople = useMemo(() => {
    if (!activeFirmId) return [] as PersonRecord[];
    return people.filter((person) => person.firmId === activeFirmId);
  }, [people, activeFirmId]);

  const firmPersonIds = useMemo(() => new Set(firmPeople.map((person) => person.id)), [firmPeople]);

  const firmDocuments = useMemo(() => {
    if (!activeFirmId) return [] as DocumentMetadata[];
    return documents.filter((doc) => firmPersonIds.has(doc.personId));
  }, [documents, firmPersonIds, activeFirmId]);

  const firmRoles = useMemo(() => {
    if (!activeFirmId) return [] as RoleAssignment[];
    return roles.filter((role) => role.firmId === activeFirmId);
  }, [roles, activeFirmId]);

  const firmAssessments = useMemo(() => {
    if (!activeFirmId) return [] as typeof assessments;
    return assessments.filter((assessment) => assessment.firmId === activeFirmId);
  }, [assessments, activeFirmId]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [personDialogOpen, setPersonDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [activePersonId, setActivePersonId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(createInitialFormState);
  const [submitting, setSubmitting] = useState(false);

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [rolePersonId, setRolePersonId] = useState<string | null>(null);
  const [roleForm, setRoleForm] = useState<RoleFormState>(createDefaultRoleForm);
  const [roleFeedback, setRoleFeedback] = useState<string | null>(null);
  const [recentRoleId, setRecentRoleId] = useState<string | null>(null);

  useEffect(() => {
    if (!roleDialogOpen) {
      setRoleFeedback(null);
      setRecentRoleId(null);
    }
  }, [roleDialogOpen]);

  const documentsByPerson = useMemo(() => {
    const map = new Map<string, DocumentMetadata[]>();
    firmDocuments.forEach((doc) => {
      const list = map.get(doc.personId) ?? [];
      list.push(doc);
      map.set(doc.personId, list);
    });
    return map;
  }, [firmDocuments]);

  const rolesByPerson = useMemo(() => {
    const map = new Map<string, RoleAssignment[]>();
    firmRoles.forEach((role) => {
      const list = map.get(role.personId) ?? [];
      list.push(role);
      map.set(role.personId, list);
    });
    return map;
  }, [firmRoles]);

  const filteredPeople = useMemo(() => {
    return firmPeople.filter((person) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch = !term
        || person.name.toLowerCase().includes(term)
        || person.employeeId.toLowerCase().includes(term)
        || person.email.toLowerCase().includes(term);
      const matchesDepartment = selectedDepartment === "all" || person.department === selectedDepartment;
      const matchesStatus = selectedStatus === "all" || person.assessment.status === selectedStatus;
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [firmPeople, searchTerm, selectedDepartment, selectedStatus]);

  const totalRoles = firmRoles.length;
  const currentCount = firmPeople.filter((p) => p.assessment.status === "current").length;
  const overdueCount = firmPeople.filter((p) => p.assessment.status === "overdue").length;

  const resetForm = useCallback(() => {
    setFormState(createInitialFormState());
    setActivePersonId(null);
    setDialogMode("create");
  }, []);

  const openCreateDialog = () => {
    resetForm();
    setPersonDialogOpen(true);
  };

  const openEditDialog = (person: PersonRecord) => {
    setDialogMode("edit");
    setActivePersonId(person.id);
    setFormState({
      name: person.name,
      email: person.email,
      department: person.department,
      title: person.title ?? "",
      phone: person.phone ?? "",
      address: person.address ?? "",
      lineManager: person.lineManager ?? "",
      startDate: fromISO(person.startDate),
      hireDate: fromISO(person.hireDate),
      assessmentStatus: person.assessment.status,
      trainingCompletion: person.assessment.trainingCompletion ?? 0,
      lastAssessment: fromISO(person.assessment.lastAssessment),
      nextAssessment: fromISO(person.assessment.nextAssessment),
      documents: createEmptyDocuments(),
    });
    setPersonDialogOpen(true);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = {
        name: formState.name,
        email: formState.email,
        department: formState.department,
        title: formState.title,
        phone: formState.phone,
        address: formState.address,
        lineManager: formState.lineManager,
        startDate: toISO(formState.startDate),
        hireDate: toISO(formState.hireDate),
        assessment: {
          status: formState.assessmentStatus,
          trainingCompletion: formState.trainingCompletion,
          lastAssessment: toISO(formState.lastAssessment),
          nextAssessment: toISO(formState.nextAssessment),
        },
      };

      let personId = activePersonId;

      if (dialogMode === "create") {
        personId = addPerson(payload);
      } else if (personId) {
        updatePerson(personId, payload as Partial<PersonRecord>);
      }

      if (personId) {
        const uploads = documentCategories.flatMap((category) =>
          formState.documents[category].map((file) => ({ file, category })),
        );
        if (uploads.length > 0) {
          await attachDocuments(personId, uploads);
        }
      }

      setPersonDialogOpen(false);
      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePerson = async (id: string) => {
    if (!window.confirm("Delete this person and all related data?")) return;
    await removePerson(id);
  };

  const handleDownload = useCallback(async (doc: DocumentMetadata) => {
    const blob = await fetchDocumentBlob(doc.id);
    if (!blob) {
      window.alert("The requested document is no longer available.");
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
  }, []);

  const handleRemoveDocument = async (docId: string) => {
    if (!window.confirm("Remove this document?")) return;
    await removeDocument(docId);
  };

  const openRoleDialog = (personId: string) => {
    setRolePersonId(personId);
    setRoleForm(createDefaultRoleForm());
    setRoleDialogOpen(true);
  };

  const handleAssignRole = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rolePersonId || !roleForm.functionId || !roleForm.startDate) return;

    const createdRole = assignRole({
      personId: rolePersonId,
      functionId: roleForm.functionId,
      functionType: roleForm.functionType,
      entity: roleForm.entity || undefined,
      startDate: toISO(roleForm.startDate) ?? new Date().toISOString(),
      endDate: toISO(roleForm.endDate),
      assessmentDate: toISO(roleForm.assessmentDate),
      approvalStatus: roleForm.approvalStatus,
      notes: roleForm.notes || undefined,
    });

    const assignedPerson = firmPeople.find((person) => person.id === rolePersonId);
    setRoleFeedback(
      `${createdRole.functionLabel} assigned to ${assignedPerson?.name ?? "selected person"}.`
    );
    setRecentRoleId(createdRole.id);

    setRoleForm((prev) => ({
      ...createDefaultRoleForm(),
      functionType: prev.functionType,
    }));
  };

  const handleRemoveRole = (roleId: string) => {
    if (!window.confirm("Remove this role assignment?")) return;
    removeRole(roleId);
  };

  const pendingDocumentsCount = useMemo(() => {
    return documentCategories.reduce((acc, category) => acc + formState.documents[category].length, 0);
  }, [formState.documents]);

  const handleExportProfile = (person: PersonRecord) => {
    const linkedRoles = rolesByPerson.get(person.id) ?? [];
    const linkedDocuments = documentsByPerson.get(person.id) ?? [];
    const personAssessments = firmAssessments
      .filter((assessment) => assessment.personId === person.id)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const latestAssessment = personAssessments[0];

    const html = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${person.name} – SM&CR Profile</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; }
          h1 { font-size: 28px; margin-bottom: 4px; }
          h2 { font-size: 18px; margin-top: 24px; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
          th, td { border: 1px solid #cbd5f5; padding: 8px; text-align: left; }
          th { background: #e2e8f0; }
          .muted { color: #64748b; font-size: 12px; }
          .tag { display: inline-block; padding: 2px 6px; border-radius: 9999px; background: #e0f2fe; color: #0284c7; font-size: 10px; margin-left: 4px; }
        </style>
      </head>
      <body>
        <h1>${person.name}</h1>
        <p class="muted">Employee ID ${person.employeeId} · ${person.title ?? "Role not captured"}</p>

        <h2>Summary</h2>
        <p><strong>Department:</strong> ${person.department}</p>
        <p><strong>Line manager:</strong> ${person.lineManager ?? "Not recorded"}</p>
        <p><strong>Training completion:</strong> ${person.assessment.trainingCompletion}%</p>
        <p><strong>Latest assessment:</strong> ${latestAssessment ? format(new Date(latestAssessment.updatedAt), "PPP") : "N/A"}</p>

        <h2>SMF / CF Roles</h2>
        ${linkedRoles.length === 0 ? "<p>No roles assigned.</p>" : `<table>
          <thead>
            <tr>
              <th>Role</th>
              <th>Type</th>
              <th>Entity</th>
              <th>Start</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${linkedRoles.map((role) => `
              <tr>
                <td>${role.functionLabel}</td>
                <td>${role.functionType}</td>
                <td>${role.entity ?? "—"}</td>
                <td>${role.startDate ? format(new Date(role.startDate), "PPP") : "—"}</td>
                <td>${role.approvalStatus}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>`}

        <h2>Training Plan</h2>
        ${person.trainingPlan.length === 0 ? "<p>No training requirements recorded.</p>" : `<table>
          <thead>
            <tr>
              <th>Module</th>
              <th>Role context</th>
              <th>Status</th>
              <th>Due</th>
            </tr>
          </thead>
          <tbody>
            ${person.trainingPlan.map((item) => `
              <tr>
                <td>${item.title}${item.required ? " <span class='tag'>Required</span>" : ""}</td>
                <td>${item.roleContext}</td>
                <td>${item.status}</td>
                <td>${item.dueDate ? format(new Date(item.dueDate), "PPP") : "—"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>`}

        <h2>Fitness &amp; Propriety Assessments</h2>
        ${personAssessments.length === 0 ? "<p>No assessments filed.</p>" : `<table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Determination</th>
              <th>Reviewer</th>
            </tr>
          </thead>
          <tbody>
            ${personAssessments.map((assessment) => `
              <tr>
                <td>${assessment.assessmentDate ? format(new Date(assessment.assessmentDate), "PPP") : "—"}</td>
                <td>${assessment.status}</td>
                <td>${assessment.overallDetermination ?? "—"}</td>
                <td>${assessment.reviewer ?? "—"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>`}

        <h2>Evidence</h2>
        ${linkedDocuments.length === 0 ? "<p>No documents uploaded.</p>" : `<table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Uploaded</th>
            </tr>
          </thead>
          <tbody>
            ${linkedDocuments.map((doc) => `
              <tr>
                <td>${doc.name}</td>
                <td>${documentCategoryLabels[doc.category]}</td>
                <td>${doc.uploadedAt ? format(new Date(doc.uploadedAt), "PPP") : "—"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>`}

        <p class="muted" style="margin-top:32px;">Generated ${format(new Date(), "PPPpp")} via Nasara Connect.</p>
      </body>
    </html>`;

    const printWindow = window.open("", "_blank", "width=960,height=720");
    if (!printWindow) {
      window.alert("Unable to open export window. Please allow pop-ups for this site.");
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (!isReady) {
    return (
      <div className="p-6 text-sm text-slate-600">
        Initialising SM&amp;CR workspace...
      </div>
    );
  }

  if (!activeFirmId || firms.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <FirmSwitcher />
            <p className="text-sm text-slate-600">
              Add or select a firm to start managing SM&amp;CR people. Each firm maintains its own personnel, roles, and evidence.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleDialogPerson = rolePersonId ? firmPeople.find((person) => person.id === rolePersonId) : null;
  const roleDialogAssignments = rolePersonId ? rolesByPerson.get(rolePersonId) ?? [] : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">People Management</h1>
          <p className="text-slate-600 mt-1">
            Maintain SM&amp;CR personnel records, documents, and role assignments in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FirmSwitcher />
          <Button onClick={openCreateDialog}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Person
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total People</p>
                <p className="text-2xl font-bold text-slate-900">{firmPeople.length}</p>
              </div>
              <Users className="h-8 w-8 text-sky-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Active SM&amp;CR Roles</p>
                <p className="text-2xl font-bold text-slate-900">{totalRoles}</p>
              </div>
              <Shield className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Current Fitness &amp; Propriety</p>
                <p className="text-2xl font-bold text-emerald-600">{currentCount}</p>
              </div>
              <Layers className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Overdue Assessments</p>
                <p className="text-2xl font-bold text-rose-600">{overdueCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-rose-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="relative">
                <Input
                  placeholder="Search by name, employee ID, or email..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-4"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="F&amp;P Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="due">Due Soon</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="not_required">Not Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {filteredPeople.map((person) => {
          const personDocuments = documentsByPerson.get(person.id) ?? [];
          const personRoles = rolesByPerson.get(person.id) ?? [];
          const trainingCompletion = person.assessment.trainingCompletion ?? 0;

          return (
            <Card key={person.id} className="flex flex-col">
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg text-slate-900">{person.name}</CardTitle>
                    <CardDescription>{person.employeeId}</CardDescription>
                  </div>
                  <Badge className={cn("text-xs", statusBadgeClass[person.assessment.status])}>
                    F&amp;P {person.assessment.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  {person.title && (
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {person.title}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    {person.department}
                  </span>
                  {person.lineManager && (
                    <span className="inline-flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" />
                      Line Manager: {person.lineManager}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="truncate">{person.email}</span>
                  </div>
                  {person.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{person.phone}</span>
                    </div>
                  )}
                  {person.address && (
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>{person.address}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Assessment Dates</p>
                    <div className="mt-1 text-sm text-slate-700 space-y-1">
                      <div>Last: {safeFormatDate(person.assessment.lastAssessment)}</div>
                      <div>Next: {safeFormatDate(person.assessment.nextAssessment)}</div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                      <span>Training Completion</span>
                      <span>{person.trainingPlan.length} items</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-700">{trainingCompletion}%</div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-sky-500"
                        style={{ width: `${Math.min(trainingCompletion, 100)}%` }}
                      />
                    </div>
                    {person.trainingPlan.length > 0 && (
                      <div className="space-y-2 border-t border-slate-200 pt-2">
                        {person.trainingPlan.map((item) => (
                          <div key={item.id} className="rounded-md border border-slate-200 p-2 text-xs text-slate-600">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                  <Badge variant="outline" className={trainingStatusBadge[item.status]}>
                                    {item.status.replace("_", " ")}
                                  </Badge>
                                  {item.required && (
                                    <Badge variant="secondary" className="text-[10px] uppercase">
                                      Required
                                    </Badge>
                                  )}
                                  <span>Due: {item.dueDate ? safeFormatDate(item.dueDate) : "TBC"}</span>
                                </div>
                              </div>
                              <Select
                                value={item.status}
                                onValueChange={(value) => updateTrainingItemStatus(person.id, item.id, value as TrainingStatus)}
                              >
                                <SelectTrigger className="h-8 w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="not_started">Not started</SelectItem>
                                  <SelectItem value="in_progress">In progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">Document Library</p>
                    <span className="text-xs text-slate-500">{personDocuments.length} files</span>
                  </div>
                  {personDocuments.length === 0 ? (
                    <p className="text-sm text-slate-500">No documents uploaded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {personDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        >
                          <div>
                            <div className="font-medium text-slate-800">{doc.name}</div>
                            <div className="text-xs text-slate-500">
                              {documentCategoryLabels[doc.category]} · {formatBytes(doc.size)} · Uploaded {safeFormatDate(doc.uploadedAt)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDownload(doc)}
                              aria-label={`Download ${doc.name}`}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveDocument(doc.id)}
                              aria-label={`Remove ${doc.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">Assigned Roles</p>
                    <Button size="sm" variant="outline" onClick={() => openRoleDialog(person.id)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Manage Roles
                    </Button>
                  </div>
                  {personRoles.length === 0 ? (
                    <p className="text-sm text-slate-500">No SMF or CF roles assigned.</p>
                  ) : (
                    <div className="space-y-2">
                      {personRoles.map((role) => (
                        <div
                          key={role.id}
                          className="flex items-start justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        >
                          <div>
                            <div className="font-medium text-slate-800">{role.functionLabel}</div>
                            <div className="text-xs text-slate-500 space-y-0.5">
                              <div>Type: {role.functionType}</div>
                              {role.entity && <div>Entity: {role.entity}</div>}
                              <div>Start: {safeFormatDate(role.startDate)}</div>
                              {role.assessmentDate && <div>Assessment: {safeFormatDate(role.assessmentDate)}</div>}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline" className="text-xs uppercase">
                              {role.approvalStatus}
                            </Badge>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveRole(role.id)}
                              aria-label="Remove role"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleExportProfile(person)}>
                    <FileText className="h-4 w-4 mr-1" />
                    Export Profile
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => openEditDialog(person)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleDeletePerson(person.id)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPeople.length === 0 && (
        <div className="py-12 text-center">
          <User className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-600">
            {firmPeople.length === 0
              ? "Start by adding your first SM&amp;CR person."
              : "No people match your filters right now."}
          </p>
          <Button className="mt-3" onClick={openCreateDialog}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Person
          </Button>
        </div>
      )}

      <Dialog open={personDialogOpen} onOpenChange={(open) => {
        setPersonDialogOpen(open);
        if (!open) {
          resetForm();
        }
      }}>
        <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{dialogMode === "create" ? "Add New Person" : "Update Person"}</DialogTitle>
            <DialogDescription>
              Capture core details, fitness &amp; propriety dates, and supporting documents.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  required
                  value={formState.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formState.email}
                  onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Enter work email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={formState.title}
                  onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Chief Executive Officer"
                />
              </div>
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={formState.department}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, department: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formState.phone}
                  onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="+44 20 7123 4567"
                />
              </div>
              <div>
                <Label htmlFor="lineManager">Line Manager</Label>
                <Input
                  id="lineManager"
                  value={formState.lineManager}
                  onChange={(event) => setFormState((prev) => ({ ...prev, lineManager: event.target.value }))}
                  placeholder="Enter line manager name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formState.address}
                onChange={(event) => setFormState((prev) => ({ ...prev, address: event.target.value }))}
                placeholder="Full correspondence address"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <DatePickerField
                label="Start Date"
                placeholder="Select start date"
                value={formState.startDate}
                onChange={(date) => setFormState((prev) => ({ ...prev, startDate: date ?? undefined }))}
              />
              <DatePickerField
                label="Hire Date"
                placeholder="Select hire date"
                value={formState.hireDate}
                onChange={(date) => setFormState((prev) => ({ ...prev, hireDate: date ?? undefined }))}
              />
              <div>
                <Label htmlFor="trainingCompletion">Training Completion %</Label>
                <Input
                  id="trainingCompletion"
                  type="number"
                  min={0}
                  max={100}
                  value={formState.trainingCompletion}
                  onChange={(event) => setFormState((prev) => ({ ...prev, trainingCompletion: Number(event.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label>F&amp;P Status *</Label>
                <Select
                  value={formState.assessmentStatus}
                  onValueChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      assessmentStatus: value as AssessmentStatus,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current</SelectItem>
                    <SelectItem value="due">Due</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="not_required">Not Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DatePickerField
                label="Last Assessment"
                placeholder="Last assessment date"
                value={formState.lastAssessment}
                onChange={(date) => setFormState((prev) => ({ ...prev, lastAssessment: date ?? undefined }))}
              />
              <DatePickerField
                label="Next Assessment"
                placeholder="Next assessment due"
                value={formState.nextAssessment}
                onChange={(date) => setFormState((prev) => ({ ...prev, nextAssessment: date ?? undefined }))}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Supporting Documents</p>
                  <p className="text-xs text-slate-500">Upload CVs, DBS checks, references, and other evidence.</p>
                </div>
                <Badge variant="outline" className="text-xs">{pendingDocumentsCount} files ready to upload</Badge>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {documentCategories.map((category) => (
                  <div key={category} className="rounded-lg border border-slate-200 p-3">
                    <Label className="text-sm font-semibold text-slate-700">
                      {documentCategoryLabels[category]}
                    </Label>
                    <div className="mt-2">
                      <Input
                        type="file"
                        multiple
                        onChange={(event) => {
                          const files = event.target.files ? Array.from(event.target.files) : [];
                          setFormState((prev) => ({
                            ...prev,
                            documents: { ...prev.documents, [category]: files },
                          }));
                        }}
                      />
                    </div>
                    {formState.documents[category].length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs text-slate-600">
                        {formState.documents[category].map((file) => (
                          <li key={file.name}>{file.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPersonDialogOpen(false);
                  resetForm();
                }}
              >
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                <Save className="h-4 w-4 mr-2" />
                {dialogMode === "create" ? "Add Person" : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage SMF / CF Roles</DialogTitle>
            <DialogDescription>
              Assign Senior Manager Functions and Certification Functions to this person.
            </DialogDescription>
          </DialogHeader>
          {roleDialogPerson ? (
            <div className="space-y-6">
              {roleFeedback && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
                  {roleFeedback}
                </div>
              )}
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-700">{roleDialogPerson.name}</p>
                <p className="text-xs text-slate-500">{roleDialogPerson.employeeId}</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-700">Existing Assignments</p>
                {roleDialogAssignments.length === 0 ? (
                  <p className="text-sm text-slate-500">No roles assigned yet.</p>
                ) : (
                  <div className="space-y-2">
                    {roleDialogAssignments.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-start justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800">{role.functionLabel}</span>
                            {role.id === recentRoleId && (
                              <Badge variant="secondary" className="text-[10px] uppercase">
                                Recently added
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 space-y-0.5">
                            <div>Type: {role.functionType}</div>
                            {role.entity && <div>Entity: {role.entity}</div>}
                            <div>Start: {safeFormatDate(role.startDate)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs uppercase">
                            {role.approvalStatus}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveRole(role.id)}
                            aria-label="Remove role"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={handleAssignRole} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label>Role Type *</Label>
                    <Select
                      value={roleForm.functionType}
                      onValueChange={(value) =>
                        setRoleForm((prev) => ({
                          ...prev,
                          functionType: value as "SMF" | "CF",
                          functionId: "",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SMF">Senior Management Function</SelectItem>
                        <SelectItem value="CF">Certification Function</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Function *</Label>
                    <Select
                      value={roleForm.functionId}
                      onValueChange={(value) => setRoleForm((prev) => ({ ...prev, functionId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select function" />
                      </SelectTrigger>
                      <SelectContent>
                        {(roleForm.functionType === "SMF" ? allSMFs : certificationFunctions).map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {"smf_number" in item ? `${item.smf_number} - ${item.title}` : `${item.cf_number} - ${item.title}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="role-entity">Entity / Booking Centre</Label>
                    <Input
                      id="role-entity"
                      value={roleForm.entity}
                      onChange={(event) => setRoleForm((prev) => ({ ...prev, entity: event.target.value }))}
                      placeholder="e.g. Nasara Payments Ltd"
                    />
                  </div>
                  <div>
                    <Label>Approval Status</Label>
                    <Select
                      value={roleForm.approvalStatus}
                      onValueChange={(value) =>
                        setRoleForm((prev) => ({
                          ...prev,
                          approvalStatus: value as RoleApprovalStatus,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {approvalStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <DatePickerField
                    label="Start Date *"
                    placeholder="Role start date"
                    value={roleForm.startDate}
                    onChange={(date) => setRoleForm((prev) => ({ ...prev, startDate: date ?? undefined }))}
                  />
                  <DatePickerField
                    label="End Date"
                    placeholder="Optional end date"
                    value={roleForm.endDate}
                    onChange={(date) => setRoleForm((prev) => ({ ...prev, endDate: date ?? undefined }))}
                  />
                  <DatePickerField
                    label="Assessment Date"
                    placeholder="Latest assessment"
                    value={roleForm.assessmentDate}
                    onChange={(date) => setRoleForm((prev) => ({ ...prev, assessmentDate: date ?? undefined }))}
                  />
                </div>

                <div>
                  <Label htmlFor="role-notes">Notes</Label>
                  <Textarea
                    id="role-notes"
                    rows={3}
                    value={roleForm.notes}
                    onChange={(event) => setRoleForm((prev) => ({ ...prev, notes: event.target.value }))}
                    placeholder="Optional context, prescribed responsibilities, or evidence references."
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={!roleForm.functionId || !roleForm.startDate}>
                    <Upload className="h-4 w-4 mr-2" />
                    Assign Role
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Select a person to manage their roles.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

type DatePickerFieldProps = {
  label: string;
  placeholder: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
};

function DatePickerField({ label, placeholder, value, onChange }: DatePickerFieldProps) {
  return (
    <div>
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-slate-400",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
