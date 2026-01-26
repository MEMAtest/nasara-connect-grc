"use client";

import React, { useMemo, useState } from "react";
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
  Award,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Info,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { certificationFunctions } from "../data/core-functions";
import { useSmcrData, RoleApprovalStatus } from "../context/SmcrDataContext";
import { CertificationIcon } from "../components/SmcrIcons";
import { certificationTips } from "../forms/form-data";

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

export function CertificationsClient() {
  const { state, isReady, assignRole, removeRole } = useSmcrData();
  const { people, roles } = state;

  const certificationAssignments = useMemo(() => {
    return roles
      .filter((role) => role.functionType === "CF")
      .map((role) => {
        const meta = certificationFunctions.find((item) => item.id === role.functionId);
        const person = people.find((p) => p.id === role.personId);
        return {
          role,
          personName: person?.name ?? "Unknown",
          employeeId: person?.employeeId ?? "",
          email: person?.email ?? "",
          functionTitle: meta?.title ?? role.functionLabel,
          functionNumber: meta?.cf_number ?? role.functionLabel,
          appliesTo: meta?.applies_to?.join(", ") ?? "",
        };
      });
  }, [roles, people]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RoleApprovalStatus | "all">("all");
  const [functionFilter, setFunctionFilter] = useState<string>("all");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    personId: "",
    functionId: "",
    approvalStatus: "pending" as RoleApprovalStatus,
    startDate: undefined as Date | undefined,
    assessmentDate: undefined as Date | undefined,
    notes: "",
  });

  const filteredAssignments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return certificationAssignments.filter(({ role, personName, employeeId, functionTitle, functionNumber }) => {
      const matchesSearch = !term
        || personName.toLowerCase().includes(term)
        || employeeId.toLowerCase().includes(term)
        || functionTitle.toLowerCase().includes(term)
        || functionNumber.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || role.approvalStatus === statusFilter;
      const matchesFunction = functionFilter === "all" || role.functionId === functionFilter;
      return matchesSearch && matchesStatus && matchesFunction;
    });
  }, [certificationAssignments, searchTerm, statusFilter, functionFilter]);

  const stats = useMemo(() => {
    const total = certificationAssignments.length;
    const approved = certificationAssignments.filter(({ role }) => role.approvalStatus === "approved").length;
    const dueSoon = certificationAssignments.filter(({ role }) => {
      if (!role.assessmentDate) return false;
      const due = new Date(role.assessmentDate);
      if (Number.isNaN(due.getTime())) return false;
      const now = new Date();
      const diff = due.getTime() - now.getTime();
      const days = diff / (1000 * 60 * 60 * 24);
      return days >= 0 && days <= 45;
    }).length;
    const overdue = certificationAssignments.filter(({ role }) => {
      if (!role.assessmentDate) return false;
      const due = new Date(role.assessmentDate);
      return !Number.isNaN(due.getTime()) && due < new Date();
    }).length;
    return { total, approved, dueSoon, overdue };
  }, [certificationAssignments]);

  const handleAssign = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!assignForm.personId || !assignForm.functionId || !assignForm.startDate) return;

    assignRole({
      personId: assignForm.personId,
      functionId: assignForm.functionId,
      functionType: "CF",
      entity: undefined,
      startDate: toISO(assignForm.startDate) ?? new Date().toISOString(),
      endDate: undefined,
      assessmentDate: toISO(assignForm.assessmentDate),
      approvalStatus: assignForm.approvalStatus,
      notes: assignForm.notes || undefined,
    });

    setAssignForm({ personId: "", functionId: "", approvalStatus: "pending", startDate: undefined, assessmentDate: undefined, notes: "" });
    setAssignDialogOpen(false);
  };

  const handleRemove = (id: string) => {
    if (!window.confirm("Remove this certification assignment?")) return;
    removeRole(id);
  };

  if (!isReady) {
    return <div className="p-6 text-sm text-slate-600">Loading certification function data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <CertificationIcon size={48} />
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Certification Functions</h1>
            <p className="text-slate-600 mt-1">Monitor certification population, review cadence, and approvals.</p>
          </div>
        </div>
        <Button onClick={() => setAssignDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Certify Person
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Certified</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <Award className="h-8 w-8 text-sky-500" />
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
              <FileText className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Due Within 45 Days</p>
                <p className="text-2xl font-bold text-amber-500">{stats.dueSoon}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
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
                placeholder="Search by person or certification function"
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
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="All certification functions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Certification Functions</SelectItem>
                  {certificationFunctions.map((func) => (
                    <SelectItem key={func.id} value={func.id}>
                      {func.cf_number} - {func.title}
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
              No certification function assignments found.
            </CardContent>
          </Card>
        ) : (
          filteredAssignments.map(({ role, personName, employeeId, email, functionTitle, functionNumber, appliesTo }) => (
            <Card key={role.id}>
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-lg text-slate-900">{functionNumber} &middot; {functionTitle}</CardTitle>
                  <CardDescription>{appliesTo || "Applies to multiple business lines"}</CardDescription>
                </div>
                <Badge className={cn("text-xs uppercase", approvalColours[role.approvalStatus])}>
                  {role.approvalStatus}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Certified Person</p>
                    <p className="font-medium text-slate-800">{personName}</p>
                    <p className="text-xs text-slate-500">{employeeId}</p>
                    <p className="text-xs text-slate-500">{email}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Assessment Date</p>
                    <p className="font-medium text-slate-800">{role.assessmentDate ? safeFormat(role.assessmentDate) : "Not recorded"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <InfoBlock label="Start Date" value={role.startDate} />
                  <InfoBlock label="End Date" value={role.endDate} />
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Certify Person for Function</DialogTitle>
            <DialogDescription>
              Assign a certification function and record assessment cadence.
            </DialogDescription>
          </DialogHeader>

          {/* Certification Requirements Explainer */}
          <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-teal-900">{certificationTips.title}</h4>
                <p className="text-sm text-teal-800 mt-1">{certificationTips.description}</p>
              </div>
            </div>
            <ul className="space-y-1.5 ml-8">
              {certificationTips.tips.map((tip, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-teal-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
            <div className="ml-8">
              <a
                href={certificationTips.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-900"
              >
                FCA Certification Guidance
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
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
                <Label>Certification Function *</Label>
                <Select
                  value={assignForm.functionId}
                  onValueChange={(value) => setAssignForm((prev) => ({ ...prev, functionId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select certification" />
                  </SelectTrigger>
                  <SelectContent>
                    {certificationFunctions.map((func) => (
                      <SelectItem key={func.id} value={func.id}>
                        {func.cf_number} - {func.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <DatePickerField
                label="Start Date *"
                placeholder="Certification start"
                value={assignForm.startDate}
                onChange={(date) => setAssignForm((prev) => ({ ...prev, startDate: date ?? undefined }))}
              />
            </div>

            <DatePickerField
              label="Assessment Date"
              placeholder="Latest fit & proper assessment"
              value={assignForm.assessmentDate}
              onChange={(date) => setAssignForm((prev) => ({ ...prev, assessmentDate: date ?? undefined }))}
            />

            <div>
              <Label htmlFor="cf-notes">Notes</Label>
              <textarea
                id="cf-notes"
                rows={3}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                value={assignForm.notes}
                onChange={(event) => setAssignForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="E.g. annual assessment evidence, CPD hours completed"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={!assignForm.personId || !assignForm.functionId || !assignForm.startDate}>
                Certify Person
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

function safeFormat(value: string) {
  try {
    return format(new Date(value), "PPP");
  } catch {
    return value;
  }
}
