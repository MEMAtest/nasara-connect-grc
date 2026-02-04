"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target,
  Plus,
  Search,
  AlertTriangle,
  Eye,
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  User,
  FileText,
  Download,
  Trash2,
  ChevronRight,
  Scale,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConductRulesIcon } from "../components/SmcrIcons";
import { FirmSwitcher } from "../components/FirmSwitcher";
import {
  useSmcrData,
  ConductBreach,
  BreachSeverity,
  BreachStatus,
} from "../context/SmcrDataContext";
import {
  individualConductRules,
  seniorManagerConductRules,
  allConductRules,
  ConductRule,
} from "../data/conduct-rules";

const severityColors: Record<BreachSeverity, string> = {
  minor: "bg-amber-100 text-amber-800",
  serious: "bg-orange-100 text-orange-800",
  severe: "bg-red-100 text-red-800",
};

// HTML escape function to prevent XSS attacks
function escapeHtml(unsafe: string | undefined | null): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const statusColors: Record<BreachStatus, string> = {
  open: "bg-red-100 text-red-800",
  investigating: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  escalated: "bg-purple-100 text-purple-800",
};

const statusIcons: Record<BreachStatus, React.ReactNode> = {
  open: <AlertTriangle className="h-4 w-4" />,
  investigating: <Eye className="h-4 w-4" />,
  resolved: <CheckCircle2 className="h-4 w-4" />,
  escalated: <Target className="h-4 w-4" />,
};

interface BreachFormData {
  personId: string;
  personName: string;
  ruleId: string;
  dateIdentified: Date | undefined;
  dateOccurred: Date | undefined;
  description: string;
  severity: BreachSeverity;
}

const initialFormData: BreachFormData = {
  personId: "",
  personName: "",
  ruleId: "",
  dateIdentified: new Date(),
  dateOccurred: undefined,
  description: "",
  severity: "minor",
};

export function ConductRulesClient() {
  const {
    state,
    isReady,
    firms,
    activeFirmId,
    addBreach,
    updateBreach,
    addBreachTimelineEntry,
    removeBreach,
  } = useSmcrData();

  const { people, breaches } = state;

  const firmPeople = useMemo(() => {
    if (!activeFirmId) return [];
    return people.filter((p) => p.firmId === activeFirmId);
  }, [people, activeFirmId]);

  const firmBreaches = useMemo(() => {
    if (!activeFirmId) return [];
    return breaches.filter((b) => b.firmId === activeFirmId);
  }, [breaches, activeFirmId]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedBreach, setSelectedBreach] = useState<ConductBreach | null>(null);
  const [formData, setFormData] = useState<BreachFormData>(initialFormData);
  const [updateForm, setUpdateForm] = useState({
    status: "" as BreachStatus | "",
    investigator: "",
    findings: "",
    action: "",
    description: "",
  });

  // Statistics
  const stats = useMemo(() => {
    const currentQuarter = new Date();
    currentQuarter.setMonth(currentQuarter.getMonth() - 3);

    return {
      total: firmBreaches.length,
      thisQuarter: firmBreaches.filter(
        (b) => new Date(b.createdAt) >= currentQuarter
      ).length,
      investigating: firmBreaches.filter((b) => b.status === "investigating").length,
      resolved: firmBreaches.filter((b) => b.status === "resolved").length,
      open: firmBreaches.filter((b) => b.status === "open").length,
      escalated: firmBreaches.filter((b) => b.status === "escalated").length,
    };
  }, [firmBreaches]);

  // Filtered breaches
  const filteredBreaches = useMemo(() => {
    return firmBreaches.filter((breach) => {
      const matchesSearch =
        !searchTerm ||
        breach.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        breach.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        breach.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || breach.status === statusFilter;
      const matchesSeverity = severityFilter === "all" || breach.severity === severityFilter;
      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [firmBreaches, searchTerm, statusFilter, severityFilter]);

  const handleReportBreach = async () => {
    if (!formData.personId || !formData.ruleId || !formData.dateIdentified || !formData.description) {
      return;
    }

    const rule = allConductRules.find((r) => r.id === formData.ruleId);
    if (!rule) return;

    await addBreach({
      personId: formData.personId,
      personName: formData.personName,
      ruleId: formData.ruleId,
      ruleName: `${rule.ruleNumber}: ${rule.title}`,
      dateIdentified: formData.dateIdentified.toISOString(),
      dateOccurred: formData.dateOccurred?.toISOString(),
      description: formData.description,
      severity: formData.severity,
    });

    setFormData(initialFormData);
    setReportDialogOpen(false);
  };

  const handleStatusUpdate = async () => {
    if (!selectedBreach || !updateForm.status) return;

    const updates: Partial<ConductBreach> = {
      status: updateForm.status,
    };

    if (updateForm.investigator) {
      updates.investigator = updateForm.investigator;
    }
    if (updateForm.findings) {
      updates.findings = updateForm.findings;
    }
    if (updateForm.status === "resolved") {
      updates.resolutionDate = new Date().toISOString();
    }

    await updateBreach(selectedBreach.id, updates);

    // Add timeline entry
    if (updateForm.action && updateForm.description) {
      await addBreachTimelineEntry(selectedBreach.id, {
        date: new Date().toISOString(),
        action: updateForm.action,
        description: updateForm.description,
        performedBy: updateForm.investigator || undefined,
      });
    }

    setUpdateForm({
      status: "",
      investigator: "",
      findings: "",
      action: "",
      description: "",
    });

    // Refresh selected breach
    const updated = firmBreaches.find((b) => b.id === selectedBreach.id);
    if (updated) {
      setSelectedBreach(updated);
    }
  };

  const handleDeleteBreach = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this breach record?")) return;
    await removeBreach(id);
    setDetailDialogOpen(false);
    setSelectedBreach(null);
  };

  const handleExport = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Conduct Breaches Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; }
    h1 { font-size: 24px; color: #0f172a; }
    h2 { font-size: 18px; margin-top: 24px; color: #334155; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
    th { background: #f1f5f9; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 500; }
    .minor { background: #fef3c7; color: #92400e; }
    .serious { background: #fed7aa; color: #c2410c; }
    .severe { background: #fecaca; color: #b91c1c; }
    .open { background: #fecaca; color: #b91c1c; }
    .investigating { background: #dbeafe; color: #1e40af; }
    .resolved { background: #dcfce7; color: #166534; }
    .escalated { background: #e9d5ff; color: #7e22ce; }
    .footer { margin-top: 32px; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <h1>Conduct Rules & Breaches Report</h1>
  <p>Generated: ${format(new Date(), "PPPpp")}</p>

  <h2>Summary</h2>
  <p>Total Breaches: ${stats.total} | This Quarter: ${stats.thisQuarter} | Open: ${stats.open} | Investigating: ${stats.investigating} | Resolved: ${stats.resolved}</p>

  <h2>Breach Records</h2>
  ${filteredBreaches.length === 0 ? "<p>No breach records found.</p>" : `
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Person</th>
        <th>Rule</th>
        <th>Severity</th>
        <th>Status</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      ${filteredBreaches.map((breach) => `
      <tr>
        <td>${format(new Date(breach.dateIdentified), "PP")}</td>
        <td>${escapeHtml(breach.personName)}</td>
        <td>${escapeHtml(breach.ruleName)}</td>
        <td><span class="badge ${escapeHtml(breach.severity)}">${escapeHtml(breach.severity)}</span></td>
        <td><span class="badge ${escapeHtml(breach.status)}">${escapeHtml(breach.status)}</span></td>
        <td>${escapeHtml(breach.description.substring(0, 100))}${breach.description.length > 100 ? "..." : ""}</td>
      </tr>
      `).join("")}
    </tbody>
  </table>
  `}

  <div class="footer">
    <p>Generated via Nasara Connect</p>
  </div>
</body>
</html>`;

    const printWindow = window.open("", "_blank", "width=960,height=720");
    if (!printWindow) {
      window.alert("Unable to open export window. Please allow pop-ups.");
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    // Close window after printing to prevent memory leak
    printWindow.onafterprint = () => printWindow.close();
    printWindow.print();
  };

  if (!isReady) {
    return (
      <div className="p-6 text-sm text-slate-600">
        Initialising SM&CR workspace...
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
              Add or select a firm to manage conduct rules and breaches.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <ConductRulesIcon size={48} />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Conduct Rules & Breaches</h1>
            <p className="text-gray-600 mt-1">Monitor conduct rules compliance and manage breaches</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FirmSwitcher />
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setReportDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Report Breach
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Breaches</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Quarter</p>
                <p className="text-2xl font-bold text-amber-600">{stats.thisQuarter}</p>
              </div>
              <Target className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold text-red-600">{stats.open}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Investigating</p>
                <p className="text-2xl font-bold text-blue-600">{stats.investigating}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="breaches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="breaches">Breach Records</TabsTrigger>
          <TabsTrigger value="rules">Conduct Rules Reference</TabsTrigger>
        </TabsList>

        <TabsContent value="breaches" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search breaches by person, rule, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="serious">Serious</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Breach List */}
          {filteredBreaches.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">No breach records found</p>
                <p className="text-sm text-gray-500 mt-1">
                  {firmBreaches.length === 0
                    ? "Report your first breach to start tracking conduct rule compliance."
                    : "Try adjusting your search or filters."}
                </p>
                <Button className="mt-4" onClick={() => setReportDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Report Breach
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredBreaches.map((breach) => (
                <Card
                  key={breach.id}
                  className="cursor-pointer hover:border-slate-300 transition-colors"
                  onClick={() => {
                    setSelectedBreach(breach);
                    setDetailDialogOpen(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{breach.ruleName}</span>
                          <Badge className={cn("text-xs", severityColors[breach.severity])}>
                            {breach.severity}
                          </Badge>
                          <Badge className={cn("text-xs", statusColors[breach.status])}>
                            {statusIcons[breach.status]}
                            <span className="ml-1">{breach.status}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {breach.personName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {format(new Date(breach.dateIdentified), "PP")}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">{breach.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-teal-600" />
                  Individual Conduct Rules
                </CardTitle>
                <CardDescription>Rules applicable to all SM&CR personnel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {individualConductRules.map((rule) => (
                    <RuleCard key={rule.id} rule={rule} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-amber-600" />
                  Senior Manager Conduct Rules
                </CardTitle>
                <CardDescription>Additional rules for Senior Managers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {seniorManagerConductRules.map((rule) => (
                    <RuleCard key={rule.id} rule={rule} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Report Breach Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Report Conduct Rule Breach
            </DialogTitle>
            <DialogDescription>
              Document a conduct rule breach for investigation and tracking.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Person *</Label>
                <Select
                  value={formData.personId}
                  onValueChange={(value) => {
                    const person = firmPeople.find((p) => p.id === value);
                    setFormData((prev) => ({
                      ...prev,
                      personId: value,
                      personName: person?.name || "",
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select person" />
                  </SelectTrigger>
                  <SelectContent>
                    {firmPeople.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Conduct Rule *</Label>
                <Select
                  value={formData.ruleId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, ruleId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rule" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">Individual Conduct Rules</div>
                    {individualConductRules.map((rule) => (
                      <SelectItem key={rule.id} value={rule.id}>
                        {rule.ruleNumber}: {rule.title}
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 border-t mt-1 pt-1.5">Senior Manager Rules</div>
                    {seniorManagerConductRules.map((rule) => (
                      <SelectItem key={rule.id} value={rule.id}>
                        {rule.ruleNumber}: {rule.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date Identified *</Label>
                <DatePicker
                  value={formData.dateIdentified}
                  onChange={(date) => setFormData((prev) => ({ ...prev, dateIdentified: date }))}
                  placeholder="Select date"
                />
              </div>
              <div>
                <Label>Date Occurred</Label>
                <DatePicker
                  value={formData.dateOccurred}
                  onChange={(date) => setFormData((prev) => ({ ...prev, dateOccurred: date }))}
                  placeholder="If different from identified"
                />
              </div>
            </div>

            <div>
              <Label>Severity *</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, severity: value as BreachSeverity }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minor">Minor - Limited impact, isolated incident</SelectItem>
                  <SelectItem value="serious">Serious - Significant impact or pattern</SelectItem>
                  <SelectItem value="severe">Severe - Major impact, regulatory concern</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the breach, including what happened, context, and any immediate actions taken..."
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReportBreach}
              disabled={!formData.personId || !formData.ruleId || !formData.dateIdentified || !formData.description}
              className="bg-red-600 hover:bg-red-700"
            >
              Report Breach
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Breach Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedBreach && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-slate-600" />
                  Breach Details
                </DialogTitle>
                <DialogDescription>
                  View and manage breach investigation and resolution.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Breach Summary */}
                <div className="rounded-lg border border-slate-200 p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{selectedBreach.ruleName}</h3>
                      <p className="text-sm text-slate-600 mt-1">{selectedBreach.personName}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={cn("text-xs", severityColors[selectedBreach.severity])}>
                        {selectedBreach.severity}
                      </Badge>
                      <Badge className={cn("text-xs", statusColors[selectedBreach.status])}>
                        {statusIcons[selectedBreach.status]}
                        <span className="ml-1">{selectedBreach.status}</span>
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700">{selectedBreach.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Identified: {format(new Date(selectedBreach.dateIdentified), "PPP")}</span>
                    {selectedBreach.dateOccurred && (
                      <span>Occurred: {format(new Date(selectedBreach.dateOccurred), "PPP")}</span>
                    )}
                    {selectedBreach.resolutionDate && (
                      <span>Resolved: {format(new Date(selectedBreach.resolutionDate), "PPP")}</span>
                    )}
                  </div>
                </div>

                {/* Investigation Details */}
                {(selectedBreach.investigator || selectedBreach.findings) && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-2">
                    <h4 className="font-medium text-blue-900">Investigation</h4>
                    {selectedBreach.investigator && (
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Investigator:</span> {selectedBreach.investigator}
                      </p>
                    )}
                    {selectedBreach.findings && (
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Findings:</span> {selectedBreach.findings}
                      </p>
                    )}
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Timeline</h4>
                  <div className="space-y-3">
                    {selectedBreach.timeline.map((entry, index) => (
                      <div key={entry.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-3 w-3 rounded-full bg-teal-500" />
                          {index < selectedBreach.timeline.length - 1 && (
                            <div className="w-0.5 flex-1 bg-slate-200" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-slate-900">{entry.action}</span>
                            <span className="text-slate-500">
                              {format(new Date(entry.date), "PPp")}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{entry.description}</p>
                          {entry.performedBy && (
                            <p className="text-xs text-slate-500 mt-1">By: {entry.performedBy}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update Form */}
                {selectedBreach.status !== "resolved" && (
                  <div className="rounded-lg border border-slate-200 p-4 space-y-4">
                    <h4 className="font-medium text-slate-900">Update Status</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>New Status</Label>
                        <Select
                          value={updateForm.status}
                          onValueChange={(value) =>
                            setUpdateForm((prev) => ({ ...prev, status: value as BreachStatus }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="investigating">Investigating</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="escalated">Escalated</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Investigator</Label>
                        <Input
                          value={updateForm.investigator}
                          onChange={(e) =>
                            setUpdateForm((prev) => ({ ...prev, investigator: e.target.value }))
                          }
                          placeholder="Name of investigator"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Action Taken</Label>
                      <Input
                        value={updateForm.action}
                        onChange={(e) =>
                          setUpdateForm((prev) => ({ ...prev, action: e.target.value }))
                        }
                        placeholder="e.g., Investigation Started, Interview Conducted"
                      />
                    </div>
                    <div>
                      <Label>Details</Label>
                      <Textarea
                        value={updateForm.description}
                        onChange={(e) =>
                          setUpdateForm((prev) => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="Describe the update or findings..."
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleStatusUpdate} disabled={!updateForm.status}>
                      Update Status
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteBreach(selectedBreach.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RuleCard({ rule }: { rule: ConductRule }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900">{rule.title}</span>
            <Badge variant="outline" className="text-xs">
              {rule.ruleNumber}
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">{rule.description}</p>
        </div>
        <ChevronRight
          className={cn("h-5 w-5 text-slate-400 transition-transform", expanded && "rotate-90")}
        />
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
          {rule.examples && rule.examples.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-700 mb-1">Examples of breaches:</p>
              <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                {rule.examples.map((example, i) => (
                  <li key={i}>{example}</li>
                ))}
              </ul>
            </div>
          )}
          {rule.indicators && rule.indicators.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-700 mb-1">Breach indicators:</p>
              <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                {rule.indicators.map((indicator, i) => (
                  <li key={i}>{indicator}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DatePicker({
  value,
  onChange,
  placeholder,
}: {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-slate-400"
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
          captionLayout="dropdown"
          fromYear={2020}
          toYear={2030}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
