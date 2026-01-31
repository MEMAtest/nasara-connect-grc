"use client";

import React, { useCallback, useMemo, useState } from "react";
import { FCAVerificationSheet } from "@/components/fca-register/FCAVerificationSheet";
import type { FCAVerificationResult } from "@/hooks/useFCAVerification";
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
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle2,
  ExternalLink,
  FileText,
  Info,
  Plus,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { allSMFs } from "../data/core-functions";
import { useSmcrData, RoleAssignment, RoleApprovalStatus, PersonRecord, FCAVerificationData } from "../context/SmcrDataContext";
import { useAllMismatches } from "@/hooks/useRoleMismatchDetection";
import { SmfIcon } from "../components/SmcrIcons";
import { formATips, sorTips, formCTips } from "../forms/form-data";

interface AssignmentRow {
  role: RoleAssignment;
  functionTitle: string;
  functionNumber: string;
  category: string;
  personName: string;
  personId: string;
  employeeId: string;
  email: string;
  irn?: string;
  fcaVerification?: FCAVerificationData;
  entity?: string;
}

const approvalColours: Record<RoleApprovalStatus, string> = {
  approved: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  draft: "bg-slate-100 text-slate-700",
  rejected: "bg-rose-100 text-rose-800",
};

const statusOptions: { value: RoleApprovalStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function toISO(date?: Date) {
  return date ? new Date(date).toISOString() : undefined;
}

export function SMFsClient() {
  const { state, isReady, assignRole, removeRole, updatePerson } = useSmcrData();
  const { people, roles } = state;
  const { byPerson: mismatchesByPerson } = useAllMismatches(people, roles);

  const smfAssignments: AssignmentRow[] = useMemo(() => {
    return roles
      .filter((role) => role.functionType === "SMF")
      .map((role) => {
        const meta = allSMFs.find((item) => item.id === role.functionId);
        const person = people.find((p) => p.id === role.personId);
        return {
          role,
          functionTitle: meta?.title ?? role.functionLabel,
          functionNumber: meta?.smf_number ?? role.functionLabel,
          category: meta?.category ?? "universal",
          personName: person?.name ?? "Unknown",
          personId: person?.id ?? "",
          employeeId: person?.employeeId ?? "",
          email: person?.email ?? "",
          irn: person?.irn,
          fcaVerification: person?.fcaVerification,
          entity: role.entity,
        } satisfies AssignmentRow;
      });
  }, [roles, people]);

  // FCA Verification Sheet state
  const [verificationSheetOpen, setVerificationSheetOpen] = useState(false);
  const [verificationPersonId, setVerificationPersonId] = useState<string | null>(null);

  // Close verification sheet if the target person was deleted
  React.useEffect(() => {
    if (!verificationPersonId) return;
    const personExists = people.some((p) => p.id === verificationPersonId && p.irn);
    if (!personExists) {
      setVerificationSheetOpen(false);
      setVerificationPersonId(null);
    }
  }, [verificationPersonId, people]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RoleApprovalStatus | "all">("all");
  const [functionFilter, setFunctionFilter] = useState<string>("all");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    personId: "",
    smfId: "",
    entity: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    approvalStatus: "pending" as RoleApprovalStatus,
    assessmentDate: undefined as Date | undefined,
    notes: "",
  });

  const filteredAssignments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return smfAssignments.filter(({ role, personName, employeeId, functionTitle, functionNumber }) => {
      const matchesSearch = !term
        || personName.toLowerCase().includes(term)
        || employeeId.toLowerCase().includes(term)
        || functionTitle.toLowerCase().includes(term)
        || functionNumber.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || role.approvalStatus === statusFilter;
      const matchesFunction = functionFilter === "all" || role.functionId === functionFilter;
      return matchesSearch && matchesStatus && matchesFunction;
    });
  }, [smfAssignments, searchTerm, statusFilter, functionFilter]);

  const stats = useMemo(() => {
    const total = smfAssignments.length;
    const approved = smfAssignments.filter(({ role }) => role.approvalStatus === "approved").length;
    const pending = smfAssignments.filter(({ role }) => role.approvalStatus === "pending").length;
    const overdue = smfAssignments.filter(({ role }) => {
      if (!role.assessmentDate) return false;
      const due = new Date(role.assessmentDate);
      if (Number.isNaN(due.getTime())) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return due < today;
    }).length;
    return { total, approved, pending, overdue };
  }, [smfAssignments]);

  const handleAssign = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!assignForm.personId || !assignForm.smfId || !assignForm.startDate) return;

    assignRole({
      personId: assignForm.personId,
      functionId: assignForm.smfId,
      functionType: "SMF",
      entity: assignForm.entity || undefined,
      startDate: toISO(assignForm.startDate) ?? new Date().toISOString(),
      endDate: toISO(assignForm.endDate),
      assessmentDate: toISO(assignForm.assessmentDate),
      approvalStatus: assignForm.approvalStatus,
      notes: assignForm.notes || undefined,
    });

    setAssignForm({
      personId: "",
      smfId: "",
      entity: "",
      startDate: undefined,
      endDate: undefined,
      approvalStatus: "pending",
      assessmentDate: undefined,
      notes: "",
    });
    setAssignDialogOpen(false);
  };

  const handleRemove = useCallback((id: string) => {
    if (!window.confirm("Remove this SMF assignment?")) return;
    removeRole(id);
  }, [removeRole]);

  if (!isReady) {
    return <div className="p-6 text-sm text-slate-600">Loading SMF assignments...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SmfIcon size={48} />
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Senior Management Functions</h1>
            <p className="text-slate-600 mt-1">Track SMF appointments, approval status, and assessment cadence.</p>
          </div>
        </div>
        <Button onClick={() => setAssignDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Assign SMF
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Assignments</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-sky-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Approved</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
              </div>
              <Shield className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pending Review</p>
                <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
              </div>
              <FileText className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Assessments Overdue</p>
                <p className="text-2xl font-bold text-rose-600">{stats.overdue}</p>
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
              <Input
                placeholder="Search by person, employee ID, or SMF title"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RoleApprovalStatus | "all") }>
                <SelectTrigger className="w-[170px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={functionFilter} onValueChange={setFunctionFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All functions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All SMFs</SelectItem>
                  {allSMFs.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.smf_number} - {item.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-slate-500">
              No senior management function assignments found.
            </CardContent>
          </Card>
        ) : (
          filteredAssignments.map(({ role, functionTitle, functionNumber, category, personName, personId, employeeId, email, irn, fcaVerification, entity }) => {
            const personMismatches = mismatchesByPerson.get(personId);
            const roleMismatch = personMismatches?.mismatches.find(
              (m) => m.smfNumber === functionNumber || m.localRole?.id === role.id
            );
            return (
            <Card key={role.id}>
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-lg text-slate-900">{functionNumber} &middot; {functionTitle}</CardTitle>
                  <CardDescription>{category.replace("_", " ")}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {roleMismatch && (
                    <Badge
                      variant="outline"
                      className={cn("text-xs",
                        roleMismatch.type === "status_conflict"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      )}
                    >
                      {roleMismatch.type === "missing_from_fca"
                        ? "Not on FCA Register"
                        : roleMismatch.type === "missing_locally"
                        ? "Not assigned locally"
                        : `FCA: ${roleMismatch.fcaFunction ? "Ceased" : "Conflict"}`}
                    </Badge>
                  )}
                  {irn && (
                    fcaVerification ? (
                      <Badge
                        variant="outline"
                        className={cn("text-xs",
                          fcaVerification.status === "Active" || fcaVerification.status === "Authorised"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : fcaVerification.hasEnforcementHistory || fcaVerification.status === "Banned"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        )}
                      >
                        {fcaVerification.status === "Active" || fcaVerification.status === "Authorised"
                          ? "FCA Verified"
                          : fcaVerification.hasEnforcementHistory || fcaVerification.status === "Banned"
                          ? "Issues Found"
                          : fcaVerification.status
                        }
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-slate-50 text-slate-500 border-slate-200">
                        Unverified
                      </Badge>
                    )
                  )}
                  <Badge className={cn("text-xs uppercase", approvalColours[role.approvalStatus])}>
                    {role.approvalStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Assigned Person</p>
                    <p className="font-medium text-slate-800">{personName}</p>
                    <p className="text-xs text-slate-500">{employeeId}</p>
                    <p className="text-xs text-slate-500">{email}</p>
                    {irn && <p className="text-xs text-slate-500">IRN: {irn}</p>}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Entity</p>
                    <p className="font-medium text-slate-800">{entity ?? "Not specified"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <InfoBlock label="Start Date" value={role.startDate} />
                  <InfoBlock label="End Date" value={role.endDate} />
                  <InfoBlock label="Last Assessment" value={role.assessmentDate} />
                </div>
                <div className="flex justify-end gap-2">
                  {irn && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setVerificationPersonId(personId);
                        setVerificationSheetOpen(true);
                      }}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Verify
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleRemove(role.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
            );
          })
        )}
      </div>

      {/* FCA Verification Sheet */}
      {verificationPersonId && (() => {
        const verifyPerson = people.find((p) => p.id === verificationPersonId);
        if (!verifyPerson || !verifyPerson.irn) return null;
        return (
          <FCAVerificationSheet
            open={verificationSheetOpen}
            onOpenChange={setVerificationSheetOpen}
            personName={verifyPerson.name}
            irn={verifyPerson.irn}
            onVerified={(result) => {
              const verificationData: FCAVerificationData = {
                status: result.status,
                lastChecked: result.lastChecked,
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
              updatePerson(verificationPersonId, {
                fcaVerification: verificationData,
              } as Partial<PersonRecord>);
              fetch(`/api/smcr/people/${verificationPersonId}/fca-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(verificationData),
              }).catch((err) => console.error('Failed to persist verification:', err));
            }}
          />
        );
      })()}

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Senior Management Function</DialogTitle>
            <DialogDescription>
              Link an SMF to a named individual and define entity responsibility.
            </DialogDescription>
          </DialogHeader>

          {/* FCA Form A Explainer */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-amber-900">{formATips.title}</h4>
                <p className="text-sm text-amber-800 mt-1">{formATips.description}</p>
              </div>
            </div>
            <ul className="space-y-1.5 ml-8">
              {formATips.tips.map((tip, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-amber-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
            <div className="ml-8">
              <a
                href={formATips.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-900"
              >
                Open FCA Connect
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Statement of Responsibilities Reminder */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">{sorTips.title}</h4>
                <p className="text-sm text-blue-800 mt-1">{sorTips.description}</p>
                <a
                  href={sorTips.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-900 mt-2"
                >
                  FCA SoR Guidance
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          <form onSubmit={handleAssign} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>Person *</Label>
                <Select
                  value={assignForm.personId}
                  onValueChange={(value) => setAssignForm((prev) => ({ ...prev, personId: value }))}
                  disabled={people.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select person" />
                  </SelectTrigger>
                  <SelectContent>
                    {people.length === 0 ? (
                      <SelectItem value="__no_people__" disabled>
                        No people available
                      </SelectItem>
                    ) : (
                      people.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name} ({person.employeeId})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>SMF Function *</Label>
                <Select
                  value={assignForm.smfId}
                  onValueChange={(value) => setAssignForm((prev) => ({ ...prev, smfId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select SMF" />
                  </SelectTrigger>
                  <SelectContent>
                    {allSMFs.map((smf) => (
                      <SelectItem key={smf.id} value={smf.id}>
                        {smf.smf_number} - {smf.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="entity">Entity / Booking Centre</Label>
                <Input
                  id="entity"
                  value={assignForm.entity}
                  onChange={(event) => setAssignForm((prev) => ({ ...prev, entity: event.target.value }))}
                  placeholder="e.g. Nasara Payments Ltd"
                />
              </div>
              <div>
                <Label>Approval Status</Label>
                <Select
                  value={assignForm.approvalStatus}
                  onValueChange={(value) => setAssignForm((prev) => ({ ...prev, approvalStatus: value as RoleApprovalStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions
                      .filter((option) => option.value !== "all")
                      .map((option) => (
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
                placeholder="Select start date"
                value={assignForm.startDate}
                onChange={(date) => setAssignForm((prev) => ({ ...prev, startDate: date ?? undefined }))}
              />
              <DatePickerField
                label="End Date"
                placeholder="Optional end date"
                value={assignForm.endDate}
                onChange={(date) => setAssignForm((prev) => ({ ...prev, endDate: date ?? undefined }))}
              />
              <DatePickerField
                label="Assessment Date"
                placeholder="Latest assessment"
                value={assignForm.assessmentDate}
                onChange={(date) => setAssignForm((prev) => ({ ...prev, assessmentDate: date ?? undefined }))}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                rows={3}
                value={assignForm.notes}
                onChange={(event) => setAssignForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Optional supporting context or prescribed responsibilities"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={!assignForm.personId || !assignForm.smfId || !assignForm.startDate}>
                Assign Function
              </Button>
            </div>
          </form>
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
      <Label className="text-sm text-slate-700">{label}</Label>
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
          <Calendar mode="single" selected={value} onSelect={onChange} initialFocus />
        </PopoverContent>
      </Popover>
    </div>
  );
}

type InfoBlockProps = {
  label: string;
  value?: string;
};

function InfoBlock({ label, value }: InfoBlockProps) {
  let display = "—";
  if (value) {
    try {
      display = format(new Date(value), "PPP");
    } catch {
      display = value;
    }
  }
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-700">{display}</p>
    </div>
  );
}
