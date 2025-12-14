"use client";

import React, { useCallback, useMemo, useState } from "react";
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
  FileText,
  Plus,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { allSMFs } from "../data/core-functions";
import { useSmcrData, RoleAssignment, RoleApprovalStatus } from "../context/SmcrDataContext";

interface AssignmentRow {
  role: RoleAssignment;
  functionTitle: string;
  functionNumber: string;
  category: string;
  personName: string;
  employeeId: string;
  email: string;
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
  const { state, isReady, assignRole, removeRole } = useSmcrData();
  const { people, roles } = state;

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
          employeeId: person?.employeeId ?? "",
          email: person?.email ?? "",
          entity: role.entity,
        } satisfies AssignmentRow;
      });
  }, [roles, people]);

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
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Senior Management Functions</h1>
          <p className="text-slate-600 mt-1">Track SMF appointments, approval status, and assessment cadence.</p>
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
          filteredAssignments.map(({ role, functionTitle, functionNumber, category, personName, employeeId, email, entity }) => (
            <Card key={role.id}>
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-lg text-slate-900">{functionNumber} &middot; {functionTitle}</CardTitle>
                  <CardDescription>{category.replace("_", " ")}</CardDescription>
                </div>
                <Badge className={cn("text-xs uppercase", approvalColours[role.approvalStatus])}>
                  {role.approvalStatus}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Assigned Person</p>
                    <p className="font-medium text-slate-800">{personName}</p>
                    <p className="text-xs text-slate-500">{employeeId}</p>
                    <p className="text-xs text-slate-500">{email}</p>
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
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => handleRemove(role.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Senior Management Function</DialogTitle>
            <DialogDescription>
              Link an SMF to a named individual and define entity responsibility.
            </DialogDescription>
          </DialogHeader>
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
