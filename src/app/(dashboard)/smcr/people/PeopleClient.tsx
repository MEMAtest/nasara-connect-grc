"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FCAVerificationSheet } from "@/components/fca-register/FCAVerificationSheet";
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
  CheckCircle2,
  Download,
  Edit,
  ExternalLink,
  FileText,
  HelpCircle,
  Info,
  Layers,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Search,
  Shield,
  Trash2,
  Upload,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  useSmcrData,
  PersonRecord,
  DocumentMetadata,
  DocumentCategory,
  RoleAssignment,
  RoleApprovalStatus,
  PersonAssessment,
  FCAVerificationData,
} from "../context/SmcrDataContext";
import { useToast } from "@/components/toast-provider";
import { fetchDocumentBlob } from "../utils/document-storage";
import { allSMFs, certificationFunctions } from "../data/core-functions";
import { useAllMismatches } from "@/hooks/useRoleMismatchDetection";
import { TrainingStatus } from "../data/role-training";
import { FirmSwitcher } from "../components/FirmSwitcher";
import { PeopleIcon } from "../components/SmcrIcons";
import { getRoleSummary } from "../data/role-descriptions";
import { formATips, certificationTips } from "../forms/form-data";
import { CVGenerator } from "./components/CVGenerator";
import { DBSRequestGenerator } from "./components/DBSRequestGenerator";
import { ReferenceRequestGenerator } from "./components/ReferenceRequestGenerator";
import { ProfileExporter } from "./components/ProfileExporter";

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

type AssessmentFrequency = "annual" | "semi-annual" | "quarterly";

type FormState = {
  name: string;
  email: string;
  department: string;
  title: string;
  phone: string;
  address: string;
  lineManager: string;
  irn: string;
  startDate?: Date;
  hireDate?: Date;
  assessmentStatus: AssessmentStatus;
  trainingCompletion: number;
  lastAssessment?: Date;
  nextAssessment?: Date;
  assessmentFrequency: AssessmentFrequency;
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
    irn: "",
    startDate: undefined,
    hireDate: undefined,
    assessmentStatus: "not_required",
    trainingCompletion: 0,
    lastAssessment: undefined,
    nextAssessment: undefined,
    assessmentFrequency: "annual",
    documents: createEmptyDocuments(),
  };
}

function calculateNextAssessment(lastAssessment: Date | undefined, frequency: AssessmentFrequency): Date | undefined {
  if (!lastAssessment) return undefined;
  const next = new Date(lastAssessment);
  switch (frequency) {
    case "annual":
      next.setFullYear(next.getFullYear() + 1);
      break;
    case "semi-annual":
      next.setMonth(next.getMonth() + 6);
      break;
    case "quarterly":
      next.setMonth(next.getMonth() + 3);
      break;
  }
  return next;
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
  const toast = useToast();

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

  const { byPerson: mismatchesByPerson } = useAllMismatches(firmPeople, firmRoles);

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

  // FCA Verification Sheet state
  const [verificationSheetOpen, setVerificationSheetOpen] = useState(false);
  const [verificationPersonId, setVerificationPersonId] = useState<string | null>(null);

  // Name mismatch dialog state
  const [nameMismatchOpen, setNameMismatchOpen] = useState(false);
  const [nameMismatchData, setNameMismatchData] = useState<{ personId: string; currentName: string; fcaName: string } | null>(null);

  // Inline IRN verification for create mode (no person saved yet)
  const [inlineVerifyLoading, setInlineVerifyLoading] = useState(false);
  const [inlineVerifyResult, setInlineVerifyResult] = useState<{ name: string; status: string } | null>(null);
  const [inlineVerifyError, setInlineVerifyError] = useState<string | null>(null);

  // Close verification sheet if the target person was deleted
  useEffect(() => {
    if (!verificationPersonId) return;
    const personExists = firmPeople.some((p) => p.id === verificationPersonId && p.irn);
    if (!personExists) {
      setVerificationSheetOpen(false);
      setVerificationPersonId(null);
    }
  }, [verificationPersonId, firmPeople]);

  // Generator dialogs state
  const [cvGeneratorOpen, setCvGeneratorOpen] = useState(false);
  const [dbsGeneratorOpen, setDbsGeneratorOpen] = useState(false);
  const [referenceGeneratorOpen, setReferenceGeneratorOpen] = useState(false);
  const [profileExportOpen, setProfileExportOpen] = useState(false);
  const [generatorPersonId, setGeneratorPersonId] = useState<string | null>(null);

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
        || (person.title || "").toLowerCase().includes(term)
        || (person.irn || "").toLowerCase().includes(term)
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
    setInlineVerifyResult(null);
    setInlineVerifyError(null);
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
      irn: person.irn ?? "",
      startDate: fromISO(person.startDate),
      hireDate: fromISO(person.hireDate),
      assessmentStatus: person.assessment.status,
      trainingCompletion: person.assessment.trainingCompletion ?? 0,
      lastAssessment: fromISO(person.assessment.lastAssessment),
      nextAssessment: fromISO(person.assessment.nextAssessment),
      assessmentFrequency: "annual",
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
        irn: formState.irn || undefined,
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
        personId = await addPerson(payload);
      } else if (personId) {
        await updatePerson(personId, payload as Partial<PersonRecord>);
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

  const [roleError, setRoleError] = useState<string | null>(null);

  const handleAssignRole = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRoleError(null);
    if (!rolePersonId || !roleForm.functionId || !roleForm.startDate) return;

    // Validate role start date is not before employment start date
    const person = firmPeople.find((p) => p.id === rolePersonId);
    if (person?.hireDate && roleForm.startDate) {
      const hireDate = new Date(person.hireDate);
      if (roleForm.startDate < hireDate) {
        setRoleError("Role start date cannot be before the person's employment start date.");
        return;
      }
    }

    try {
      const createdRole = await assignRole({
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
    } catch (error) {
      if (error instanceof Error) {
        setRoleError(error.message);
      } else {
        setRoleError("Failed to assign role. Please try again.");
      }
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    if (!window.confirm("Remove this role assignment?")) return;
    await removeRole(roleId);
  };

  const pendingDocumentsCount = useMemo(() => {
    return documentCategories.reduce((acc, category) => acc + formState.documents[category].length, 0);
  }, [formState.documents]);

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
        <div className="flex items-center gap-4">
          <PeopleIcon size={48} />
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">People Management</h1>
            <p className="text-slate-600 mt-1">
              Maintain SM&amp;CR personnel records, documents, and role assignments in one place.
            </p>
          </div>
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
                    <CardDescription>{person.title || person.department}</CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={cn("text-xs", statusBadgeClass[person.assessment.status])}>
                      F&amp;P {person.assessment.status.replace("_", " ")}
                    </Badge>
                    {person.irn && (
                      person.fcaVerification ? (
                        <Badge
                          variant="outline"
                          className={cn("text-xs",
                            person.fcaVerification.status === "Active" || person.fcaVerification.status === "Authorised"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : person.fcaVerification.hasEnforcementHistory || person.fcaVerification.status === "Banned"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          )}
                        >
                          {person.fcaVerification.status === "Active" || person.fcaVerification.status === "Authorised"
                            ? <><CheckCircle2 className="h-3 w-3 mr-1" />FCA Verified</>
                            : person.fcaVerification.hasEnforcementHistory || person.fcaVerification.status === "Banned"
                            ? <><AlertTriangle className="h-3 w-3 mr-1" />Issues Found</>
                            : <><Shield className="h-3 w-3 mr-1" />{person.fcaVerification.status}</>
                          }
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-slate-50 text-slate-500 border-slate-200">
                          Unverified
                        </Badge>
                      )
                    )}
                    {person.fcaVerification?.lastChecked && (() => {
                      const checkedDate = new Date(person.fcaVerification!.lastChecked);
                      // Allow up to 5 minutes of clock skew tolerance
                      if (Number.isNaN(checkedDate.getTime()) || checkedDate.getTime() > Date.now() + 5 * 60 * 1000) return null;
                      const daysSince = Math.max(0, Math.floor((Date.now() - checkedDate.getTime()) / (1000 * 60 * 60 * 24)));
                      const threshold = state.settings?.verificationStaleThresholdDays ?? 30;
                      if (daysSince >= threshold) {
                        return (
                          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Stale ({daysSince}d ago)
                          </Badge>
                        );
                      }
                      return null;
                    })()}
                    {person.fcaVerification?.name && person.fcaVerification.name.toLowerCase().trim() !== person.name.toLowerCase().trim() && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 cursor-help">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Name Mismatch
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>FCA Register name: {person.fcaVerification.name}</p>
                          <p>Record name: {person.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {mismatchesByPerson.has(person.id) && (
                      <Badge variant="outline" className="text-xs bg-rose-50 text-rose-700 border-rose-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {mismatchesByPerson.get(person.id)!.mismatches.length} role mismatch{mismatchesByPerson.get(person.id)!.mismatches.length !== 1 ? "es" : ""}
                      </Badge>
                    )}
                  </div>
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
                                onValueChange={(value) => {
                                  void updateTrainingItemStatus(person.id, item.id, value as TrainingStatus);
                                }}
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

                {person.fcaVerification && person.fcaVerification.controlFunctions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">FCA Register Roles</p>
                    <div className="space-y-2">
                      {person.fcaVerification.controlFunctions
                        .filter((cf) => cf.status === "Active" || cf.status === "Current")
                        .map((cf) => (
                          <div
                            key={`fca-${cf.function}-${cf.frn}-${cf.effectiveFrom}`}
                            className="flex items-start justify-between rounded-lg border border-emerald-200 bg-emerald-50/50 px-3 py-2 text-sm"
                          >
                            <div>
                              <div className="font-medium text-slate-800">{cf.function}</div>
                              <div className="text-xs text-slate-500 space-y-0.5">
                                <div>Firm: {cf.firmName} (FRN: {cf.frn})</div>
                                <div>Effective from: {cf.effectiveFrom}</div>
                                {cf.effectiveTo && <div>Effective to: {cf.effectiveTo}</div>}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs bg-emerald-100 text-emerald-700 border-emerald-300">
                              {cf.status}
                            </Badge>
                          </div>
                        ))}
                      {person.fcaVerification.controlFunctions.filter(
                        (cf) => cf.status !== "Active" && cf.status !== "Current"
                      ).length > 0 && (
                        <p className="text-xs text-slate-400">
                          + {person.fcaVerification.controlFunctions.filter(
                            (cf) => cf.status !== "Active" && cf.status !== "Current"
                          ).length} inactive role(s) on FCA Register
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {mismatchesByPerson.has(person.id) && (
                  <details className="space-y-2">
                    <summary className="text-sm font-semibold text-rose-700 cursor-pointer">
                      Role Mismatches ({mismatchesByPerson.get(person.id)!.mismatches.length})
                    </summary>
                    <div className="space-y-2 mt-2">
                      {mismatchesByPerson.get(person.id)!.mismatches.map((mismatch, idx) => (
                        <div
                          key={`mismatch-${person.id}-${idx}`}
                          className="flex items-start justify-between rounded-lg border border-rose-200 bg-rose-50/50 px-3 py-2 text-sm"
                        >
                          <div>
                            <div className="font-medium text-slate-800">{mismatch.smfNumber}</div>
                            <div className="text-xs text-slate-600">{mismatch.description}</div>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn("text-xs",
                              mismatch.type === "status_conflict"
                                ? "bg-rose-100 text-rose-700 border-rose-300"
                                : mismatch.type === "missing_from_fca"
                                ? "bg-amber-100 text-amber-700 border-amber-300"
                                : "bg-amber-100 text-amber-700 border-amber-300"
                            )}
                          >
                            {mismatch.type === "status_conflict"
                              ? "Conflict"
                              : mismatch.type === "missing_from_fca"
                              ? "Not on FCA"
                              : "Not Local"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                <div className="space-y-2 pt-2 border-t">
                  {person.irn && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setVerificationPersonId(person.id);
                        setVerificationSheetOpen(true);
                      }}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Verify on FCA Register
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setGeneratorPersonId(person.id);
                        setCvGeneratorOpen(true);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Generate CV
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setGeneratorPersonId(person.id);
                        setDbsGeneratorOpen(true);
                      }}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      DBS Request
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setGeneratorPersonId(person.id);
                        setReferenceGeneratorOpen(true);
                      }}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Reference
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setGeneratorPersonId(person.id);
                        setProfileExportOpen(true);
                      }}
                    >
                      <Download className="h-4 w-4 mr-1" />
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
                  type="text"
                  required
                  pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
                  title="Enter a valid email address (e.g., name@company.com)"
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="irn">FCA Individual Reference Number (IRN)</Label>
                <div className="flex gap-2">
                  <Input
                    id="irn"
                    value={formState.irn}
                    onChange={(event) => setFormState((prev) => ({ ...prev, irn: event.target.value }))}
                    placeholder="e.g. ABC12345"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!formState.irn.trim() || inlineVerifyLoading}
                    onClick={() => {
                      if (activePersonId && formState.irn.trim()) {
                        // Edit mode: open full verification sheet
                        setVerificationPersonId(activePersonId);
                        setVerificationSheetOpen(true);
                      } else if (formState.irn.trim()) {
                        // Create mode: inline lookup
                        setInlineVerifyLoading(true);
                        setInlineVerifyResult(null);
                        setInlineVerifyError(null);
                        fetch(`/api/fca-register/individual/${encodeURIComponent(formState.irn.trim())}`)
                          .then((res) => {
                            if (!res.ok) throw new Error("Not found on FCA Register");
                            return res.json();
                          })
                          .then((data) => {
                            setInlineVerifyResult({ name: data.individual.name, status: data.individual.status });
                            // Auto-populate name if empty
                            if (!formState.name.trim()) {
                              setFormState((prev) => ({ ...prev, name: data.individual.name }));
                            }
                          })
                          .catch(() => {
                            setInlineVerifyError("Individual not found on FCA Register");
                          })
                          .finally(() => setInlineVerifyLoading(false));
                      }
                    }}
                    className="shrink-0"
                  >
                    <Search className="h-4 w-4 mr-1" />
                    {inlineVerifyLoading ? "Checking..." : "Verify"}
                  </Button>
                </div>
                {inlineVerifyResult && (
                  <div className="mt-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
                    <p className="text-sm font-medium text-emerald-800">{inlineVerifyResult.name}</p>
                    <p className="text-xs text-emerald-600">{inlineVerifyResult.status}</p>
                  </div>
                )}
                {inlineVerifyError && (
                  <p className="text-xs text-rose-600 mt-1">{inlineVerifyError}</p>
                )}
                {!inlineVerifyResult && !inlineVerifyError && (
                  <p className="text-xs text-slate-500 mt-1">Used to verify this person against the FCA Register</p>
                )}
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

            <TooltipProvider>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Label htmlFor="roleStartDate">Role Start Date</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Date this person started in their current role/position</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <DatePickerField
                    label=""
                    placeholder="Select role start date"
                    value={formState.startDate}
                    onChange={(date) => setFormState((prev) => ({ ...prev, startDate: date ?? undefined }))}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Label htmlFor="employmentStartDate">Employment Start Date</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Date this person originally joined the firm</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <DatePickerField
                    label=""
                    placeholder="Select employment start date"
                    value={formState.hireDate}
                    onChange={(date) => setFormState((prev) => ({ ...prev, hireDate: date ?? undefined }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Label htmlFor="trainingCompletion">Training Completion %</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Percentage of required compliance training completed. This is auto-calculated from training records when roles are assigned.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="trainingCompletion"
                    type="number"
                    min={0}
                    max={100}
                    value={formState.trainingCompletion}
                    onChange={(event) => setFormState((prev) => ({ ...prev, trainingCompletion: Number(event.target.value) }))}
                    className="bg-slate-50"
                  />
                  <p className="text-xs text-slate-500 mt-1">Auto-calculated when training items are marked complete</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Label>F&amp;P Status *</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Fitness &amp; Propriety assessment tracks whether the individual meets regulatory standards for competence, honesty, and financial soundness</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
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
              </div>

              <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-3">
                <div className="min-w-0">
                  <Label className="mb-1.5 block">Last Assessment</Label>
                  <DatePickerField
                    label=""
                    placeholder="Last assessment date"
                    value={formState.lastAssessment}
                    onChange={(date) => {
                      const nextAssessment = calculateNextAssessment(date ?? undefined, formState.assessmentFrequency);
                      setFormState((prev) => ({
                        ...prev,
                        lastAssessment: date ?? undefined,
                        nextAssessment: nextAssessment,
                      }));
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <Label className="mb-1.5 block">Assessment Frequency</Label>
                  <Select
                    value={formState.assessmentFrequency}
                    onValueChange={(value) => {
                      const frequency = value as AssessmentFrequency;
                      const nextAssessment = calculateNextAssessment(formState.lastAssessment, frequency);
                      setFormState((prev) => ({
                        ...prev,
                        assessmentFrequency: frequency,
                        nextAssessment: nextAssessment ?? prev.nextAssessment,
                      }));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="semi-annual">Semi-annual (6 months)</SelectItem>
                      <SelectItem value="quarterly">Quarterly (3 months)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Label>Next Assessment</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Auto-calculated based on Last Assessment + Assessment Frequency</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <DatePickerField
                    label=""
                    placeholder="Auto-calculated"
                    value={formState.nextAssessment}
                    onChange={(date) => setFormState((prev) => ({ ...prev, nextAssessment: date ?? undefined }))}
                  />
                </div>
              </div>
            </TooltipProvider>

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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

              {/* FCA Requirements Explainer - shows based on selected role type */}
              {roleForm.functionType === "SMF" ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-amber-900">{formATips.title}</h4>
                      <p className="text-xs text-amber-800 mt-0.5">{formATips.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-1 ml-6">
                    {formATips.tips.slice(0, 3).map((tip, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-xs text-amber-800">
                        <CheckCircle2 className="h-3 w-3 text-amber-600 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={formATips.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 ml-6 text-xs font-medium text-amber-700 hover:text-amber-900"
                  >
                    Open FCA Connect <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ) : (
                <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-teal-900">{certificationTips.title}</h4>
                      <p className="text-xs text-teal-800 mt-0.5">{certificationTips.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-1 ml-6">
                    {certificationTips.tips.map((tip, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-xs text-teal-800">
                        <CheckCircle2 className="h-3 w-3 text-teal-600 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={certificationTips.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 ml-6 text-xs font-medium text-teal-700 hover:text-teal-900"
                  >
                    FCA Certification Guidance <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-700">{roleDialogPerson.name}</p>
                <p className="text-xs text-slate-500">{roleDialogPerson.title || roleDialogPerson.department}</p>
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
                {roleError && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
                    {roleError}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label>Role Type *</Label>
                    <Select
                      value={roleForm.functionType}
                      onValueChange={(value) => {
                        setRoleError(null);
                        setRoleForm((prev) => ({
                          ...prev,
                          functionType: value as "SMF" | "CF",
                          functionId: "",
                        }));
                      }}
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
                      onValueChange={(value) => {
                        setRoleError(null);
                        setRoleForm((prev) => ({ ...prev, functionId: value }));
                      }}
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

                {/* Role Description */}
                {roleForm.functionId && (
                  <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-sky-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-sky-800">About this role</p>
                        <p className="text-xs text-sky-700 mt-1">
                          {getRoleSummary(roleForm.functionId) || "No description available for this role."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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

      {/* FCA Verification Sheet */}
      {verificationPersonId && (() => {
        const verifyPerson = firmPeople.find((p) => p.id === verificationPersonId);
        if (!verifyPerson || !verifyPerson.irn) return null;
        return (
          <FCAVerificationSheet
            open={verificationSheetOpen}
            onOpenChange={setVerificationSheetOpen}
            personName={verifyPerson.name}
            irn={verifyPerson.irn}
            onVerified={async (result) => {
              const verificationData: FCAVerificationData = {
                status: result.status,
                lastChecked: result.lastChecked,
                name: result.name,
                controlFunctions: result.controlFunctions.map((cf) => ({
                  function: cf.function,
                  firmName: cf.firmName,
                  frn: cf.frn,
                  status: cf.status,
                  effectiveFrom: cf.effectiveFrom,
                  effectiveTo: cf.effectiveTo,
                })),
                hasEnforcementHistory: result.hasEnforcementHistory,
              };
              await updatePerson(verificationPersonId, {
                fcaVerification: verificationData,
              } as Partial<PersonRecord>);
              // If FCA name differs, prompt user to choose
              if (result.name && verifyPerson.name.toLowerCase().trim() !== result.name.toLowerCase().trim()) {
                setNameMismatchData({ personId: verificationPersonId, currentName: verifyPerson.name, fcaName: result.name });
                setNameMismatchOpen(true);
              }
              fetch(`/api/smcr/people/${verificationPersonId}/fca-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(verificationData),
              }).then((res) => {
                if (!res.ok) throw new Error(`Server returned ${res.status}`);
              }).catch(() => {
                toast.warning('Verification saved locally but failed to persist to server. Changes may be lost on refresh.');
              });
            }}
          />
        );
      })()}

      {/* Name Mismatch Dialog */}
      <Dialog open={nameMismatchOpen} onOpenChange={setNameMismatchOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Name Mismatch</DialogTitle>
            <DialogDescription>
              The name on your record does not match the FCA Register. Which name would you like to use?
            </DialogDescription>
          </DialogHeader>
          {nameMismatchData && (
            <div className="space-y-3 pt-2">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={async () => {
                  await updatePerson(nameMismatchData.personId, { name: nameMismatchData.fcaName } as Partial<PersonRecord>);
                  toast.success(`Name updated to "${nameMismatchData.fcaName}"`);
                  setNameMismatchOpen(false);
                  setNameMismatchData(null);
                }}
              >
                <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600" />
                Use FCA name: <span className="font-semibold ml-1">{nameMismatchData.fcaName}</span>
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => {
                  setNameMismatchOpen(false);
                  setNameMismatchData(null);
                }}
              >
                <User className="h-4 w-4 mr-2 text-slate-500" />
                Keep current: <span className="font-semibold ml-1">{nameMismatchData.currentName}</span>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Generator Dialogs */}
      {generatorPersonId && (() => {
        const generatorPerson = firmPeople.find((p) => p.id === generatorPersonId);
        const activeFirm = firms.find((f) => f.id === activeFirmId);
        if (!generatorPerson) return null;
        return (
          <>
            <CVGenerator
              person={generatorPerson}
              open={cvGeneratorOpen}
              onOpenChange={setCvGeneratorOpen}
            />
            <DBSRequestGenerator
              person={generatorPerson}
              firmName={activeFirm?.name || "Your Firm"}
              open={dbsGeneratorOpen}
              onOpenChange={setDbsGeneratorOpen}
            />
            <ReferenceRequestGenerator
              person={generatorPerson}
              firmName={activeFirm?.name || "Your Firm"}
              open={referenceGeneratorOpen}
              onOpenChange={setReferenceGeneratorOpen}
            />
            <ProfileExporter
              person={generatorPerson}
              firm={activeFirm}
              roles={rolesByPerson.get(generatorPersonId) ?? []}
              assessments={firmAssessments.filter((a) => a.personId === generatorPersonId)}
              documents={documentsByPerson.get(generatorPersonId) ?? []}
              open={profileExportOpen}
              onOpenChange={setProfileExportOpen}
            />
          </>
        );
      })()}
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
      {label && <Label>{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal min-w-[200px]",
              !value && "text-slate-400",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            {value ? format(value, "PPP") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            captionLayout="dropdown"
            fromYear={1950}
            toYear={2050}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
