"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft, Plus, Search, Filter, Download, FileText, AlertTriangle, Clock, Send } from "lucide-react";
import { PaginationControls, usePagination } from "@/components/ui/pagination-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { getMonthBuckets, getMonthKey } from "@/lib/chart-utils";

interface SarNcaRecord {
  id: string;
  sar_reference: string;
  internal_reference?: string;
  subject_name: string;
  subject_type: string;
  suspicion_type: string;
  suspicion_description?: string;
  discovery_date?: string;
  reporter?: string;
  mlro_review_date?: string;
  mlro_decision: string;
  mlro_rationale?: string;
  submitted_to_nca: boolean;
  nca_submission_date?: string;
  nca_reference?: string;
  consent_required: boolean;
  consent_requested_date?: string;
  consent_received: boolean;
  consent_received_date?: string;
  consent_expiry_date?: string;
  daml_requested: boolean;
  daml_reference?: string;
  status: string;
  outcome?: string;
  notes?: string;
  created_at: string;
}

const SUBJECT_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "company", label: "Company" },
  { value: "trust", label: "Trust" },
  { value: "other", label: "Other" },
];

const SUSPICION_TYPES = [
  { value: "money_laundering", label: "Money Laundering" },
  { value: "terrorist_financing", label: "Terrorist Financing" },
  { value: "fraud", label: "Fraud" },
  { value: "tax_evasion", label: "Tax Evasion" },
  { value: "sanctions_breach", label: "Sanctions Breach" },
  { value: "other", label: "Other" },
];

const MLRO_DECISIONS = [
  { value: "pending", label: "Pending" },
  { value: "submit_sar", label: "Submit SAR" },
  { value: "no_sar", label: "No SAR Required" },
  { value: "escalate", label: "Escalate" },
];

const STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "under_review", label: "Under Review" },
  { value: "submitted", label: "Submitted" },
  { value: "consent_pending", label: "Consent Pending" },
  { value: "closed", label: "Closed" },
];

const CHART_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6"];

export function SarNcaClient() {
  const [records, setRecords] = useState<SarNcaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDecision, setFilterDecision] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SarNcaRecord | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [monthFilter, setMonthFilter] = useState<{ key: string; label: string } | null>(null);

  const [formData, setFormData] = useState({
    sar_reference: "",
    internal_reference: "",
    subject_name: "",
    subject_type: "individual",
    suspicion_type: "money_laundering",
    suspicion_description: "",
    discovery_date: new Date().toISOString().split("T")[0],
    reporter: "",
    mlro_review_date: "",
    mlro_decision: "pending",
    mlro_rationale: "",
    submitted_to_nca: false,
    nca_submission_date: "",
    nca_reference: "",
    consent_required: false,
    consent_requested_date: "",
    consent_received: false,
    consent_received_date: "",
    consent_expiry_date: "",
    daml_requested: false,
    daml_reference: "",
    status: "draft",
    outcome: "",
    notes: "",
  });

  const loadRecords = useCallback(async () => {
    try {
      const response = await fetch("/api/registers/sar-nca");
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
      }
    } catch (error) {
      console.error("Error loading records:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingRecord
        ? `/api/registers/sar-nca/${editingRecord.id}`
        : "/api/registers/sar-nca";
      const method = editingRecord ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadRecords();
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving record:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this SAR record?")) return;
    try {
      const response = await fetch(`/api/registers/sar-nca/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await loadRecords();
      }
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      sar_reference: "",
      internal_reference: "",
      subject_name: "",
      subject_type: "individual",
      suspicion_type: "money_laundering",
      suspicion_description: "",
      discovery_date: new Date().toISOString().split("T")[0],
      reporter: "",
      mlro_review_date: "",
      mlro_decision: "pending",
      mlro_rationale: "",
      submitted_to_nca: false,
      nca_submission_date: "",
      nca_reference: "",
      consent_required: false,
      consent_requested_date: "",
      consent_received: false,
      consent_received_date: "",
      consent_expiry_date: "",
      daml_requested: false,
      daml_reference: "",
      status: "draft",
      outcome: "",
      notes: "",
    });
    setEditingRecord(null);
  };

  const openEditDialog = (record: SarNcaRecord) => {
    setEditingRecord(record);
    setFormData({
      sar_reference: record.sar_reference,
      internal_reference: record.internal_reference || "",
      subject_name: record.subject_name,
      subject_type: record.subject_type,
      suspicion_type: record.suspicion_type,
      suspicion_description: record.suspicion_description || "",
      discovery_date: record.discovery_date ? record.discovery_date.split("T")[0] : "",
      reporter: record.reporter || "",
      mlro_review_date: record.mlro_review_date ? record.mlro_review_date.split("T")[0] : "",
      mlro_decision: record.mlro_decision,
      mlro_rationale: record.mlro_rationale || "",
      submitted_to_nca: record.submitted_to_nca,
      nca_submission_date: record.nca_submission_date ? record.nca_submission_date.split("T")[0] : "",
      nca_reference: record.nca_reference || "",
      consent_required: record.consent_required,
      consent_requested_date: record.consent_requested_date ? record.consent_requested_date.split("T")[0] : "",
      consent_received: record.consent_received,
      consent_received_date: record.consent_received_date ? record.consent_received_date.split("T")[0] : "",
      consent_expiry_date: record.consent_expiry_date ? record.consent_expiry_date.split("T")[0] : "",
      daml_requested: record.daml_requested,
      daml_reference: record.daml_reference || "",
      status: record.status,
      outcome: record.outcome || "",
      notes: record.notes || "",
    });
    setIsDialogOpen(true);
  };

  const baseFilteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const matchesSearch =
          record.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.sar_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (record.nca_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
        const matchesStatus = filterStatus === "all" || record.status === filterStatus;
        const matchesDecision = filterDecision === "all" || record.mlro_decision === filterDecision;
        return matchesSearch && matchesStatus && matchesDecision;
      }),
    [records, searchTerm, filterStatus, filterDecision]
  );

  const filteredRecords = useMemo(
    () =>
      monthFilter
        ? baseFilteredRecords.filter(
            (record) => getMonthKey(record.discovery_date || record.created_at) === monthFilter.key
          )
        : baseFilteredRecords,
    [baseFilteredRecords, monthFilter]
  );

  const {
    paginatedData,
    paginationProps,
  } = usePagination(filteredRecords, { initialLimit: 25 });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      under_review: "outline",
      submitted: "default",
      consent_pending: "destructive",
      closed: "secondary",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.replace("_", " ")}</Badge>;
  };

  const getDecisionBadge = (decision: string) => {
    const colors: Record<string, string> = {
      pending: "bg-gray-100 text-gray-700",
      submit_sar: "bg-red-100 text-red-700",
      no_sar: "bg-green-100 text-green-700",
      escalate: "bg-orange-100 text-orange-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[decision] || colors.pending}`}>
        {decision.replace("_", " ")}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = [
      "SAR Reference", "Subject Name", "Subject Type", "Suspicion Type", "Discovery Date",
      "Reporter", "MLRO Decision", "Submitted to NCA", "NCA Reference", "Consent Required",
      "Consent Received", "Status", "Notes"
    ];
    const rows = filteredRecords.map((r) => [
      r.sar_reference,
      r.subject_name,
      r.subject_type,
      r.suspicion_type,
      r.discovery_date ? new Date(r.discovery_date).toLocaleDateString() : "",
      r.reporter || "",
      r.mlro_decision,
      r.submitted_to_nca ? "Yes" : "No",
      r.nca_reference || "",
      r.consent_required ? "Yes" : "No",
      r.consent_received ? "Yes" : "No",
      r.status,
      r.notes || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sar-nca-reports-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate stats
  const stats = {
    total: filteredRecords.length,
    pending: filteredRecords.filter((r) => r.mlro_decision === "pending").length,
    submitted: filteredRecords.filter((r) => r.submitted_to_nca).length,
    consentPending: filteredRecords.filter((r) => r.consent_required && !r.consent_received).length,
  };

  // Chart data
  const statusData = STATUSES.map((s) => ({
    name: s.label,
    value: filteredRecords.filter((r) => r.status === s.value).length,
  })).filter((d) => d.value > 0);

  const suspicionTypeData = SUSPICION_TYPES.map((t) => ({
    name: t.label,
    count: filteredRecords.filter((r) => r.suspicion_type === t.value).length,
  })).filter((d) => d.count > 0);

  const monthBuckets = getMonthBuckets(6);

  const monthlyData = useMemo(
    () =>
      monthBuckets.map((bucket) => {
        const monthRecords = baseFilteredRecords.filter(
          (r) => getMonthKey(r.discovery_date || r.created_at) === bucket.monthKey
        );
        return {
          month: bucket.label,
          monthKey: bucket.monthKey,
          reports: monthRecords.length,
          submitted: monthRecords.filter((r) => r.submitted_to_nca).length,
        };
      }),
    [baseFilteredRecords, monthBuckets]
  );

  const monthOptions = useMemo(
    () =>
      monthBuckets.map((bucket) => ({
        value: bucket.monthKey,
        label: new Date(bucket.startDate).toLocaleDateString("en-GB", {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }),
      })),
    [monthBuckets]
  );

  const handleMonthSelect = (value: string) => {
    if (value === "all") {
      setMonthFilter(null);
      return;
    }
    const label = monthOptions.find((opt) => opt.value === value)?.label || value;
    setMonthFilter({ key: value, label });
  };

  const handleMonthClick = (payload?: { monthKey?: string }) => {
    const key = payload?.monthKey;
    if (!key) return;
    if (monthFilter?.key === key) {
      setMonthFilter(null);
      return;
    }
    const label = monthOptions.find((opt) => opt.value === key)?.label || key;
    setMonthFilter({ key, label });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading SAR-NCA records...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/registers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Registers
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">SAR-NCA Reports Register</h1>
            <p className="text-slate-500">
              Track Suspicious Activity Reports submitted to the NCA
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New SAR Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="records">All Records</TabsTrigger>
        </TabsList>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Select value={monthFilter?.key || "all"} onValueChange={handleMonthSelect}>
            <SelectTrigger className="w-[170px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {monthOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {monthFilter && (
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1 text-sm text-slate-700">
              <span>
                Filtered by month: <strong>{monthFilter.label}</strong>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMonthFilter(null)}
                className="h-6 text-slate-600 hover:text-slate-700"
              >
                Clear
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-slate-500">Total SARs</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-xs text-slate-500">Pending Review</p>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-xs text-slate-500">Submitted to NCA</p>
                    <p className="text-2xl font-bold">{stats.submitted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-xs text-slate-500">Consent Pending</p>
                    <p className="text-2xl font-bold">{stats.consentPending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SAR Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="reports" fill="#3b82f6" name="Reports" onClick={(data) => handleMonthClick(data?.payload)} />
                      <Bar dataKey="submitted" fill="#10b981" name="Submitted" onClick={(data) => handleMonthClick(data?.payload)} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={statusData}
                      layout="vertical"
                      margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={140} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                        {statusData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Reports by Suspicion Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={suspicionTypeData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={140} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDecision} onValueChange={setFilterDecision}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="MLRO Decision" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Decisions</SelectItem>
                {MLRO_DECISIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SAR Reference</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Suspicion Type</TableHead>
                    <TableHead>Discovery Date</TableHead>
                    <TableHead>MLRO Decision</TableHead>
                    <TableHead>NCA Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        No SAR records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.sar_reference}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.subject_name}</p>
                            <p className="text-xs text-slate-500 capitalize">{record.subject_type}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {SUSPICION_TYPES.find((t) => t.value === record.suspicion_type)?.label || record.suspicion_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.discovery_date
                            ? new Date(record.discovery_date).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>{getDecisionBadge(record.mlro_decision)}</TableCell>
                        <TableCell>
                          {record.submitted_to_nca ? (
                            <Badge variant="default">
                              Submitted {record.nca_reference ? `(${record.nca_reference})` : ""}
                            </Badge>
                          ) : record.consent_required && !record.consent_received ? (
                            <Badge variant="destructive">Consent Pending</Badge>
                          ) : (
                            <Badge variant="secondary">Not Submitted</Badge>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(record)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => handleDelete(record.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <PaginationControls {...paginationProps} />
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? "Edit SAR Report" : "New SAR Report"}
            </DialogTitle>
            <DialogDescription>
              Record the details of a Suspicious Activity Report
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sar_reference">SAR Reference *</Label>
                  <Input
                    id="sar_reference"
                    value={formData.sar_reference}
                    onChange={(e) =>
                      setFormData({ ...formData, sar_reference: e.target.value })
                    }
                    placeholder="SAR-2024-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="internal_reference">Internal Reference</Label>
                  <Input
                    id="internal_reference"
                    value={formData.internal_reference}
                    onChange={(e) =>
                      setFormData({ ...formData, internal_reference: e.target.value })
                    }
                    placeholder="INT-2024-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject_name">Subject Name *</Label>
                  <Input
                    id="subject_name"
                    value={formData.subject_name}
                    onChange={(e) =>
                      setFormData({ ...formData, subject_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject_type">Subject Type</Label>
                  <Select
                    value={formData.subject_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, subject_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="suspicion_type">Suspicion Type</Label>
                  <Select
                    value={formData.suspicion_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, suspicion_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUSPICION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discovery_date">Discovery Date</Label>
                  <Input
                    id="discovery_date"
                    type="date"
                    value={formData.discovery_date}
                    onChange={(e) =>
                      setFormData({ ...formData, discovery_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="suspicion_description">Suspicion Description</Label>
                <Textarea
                  id="suspicion_description"
                  value={formData.suspicion_description}
                  onChange={(e) =>
                    setFormData({ ...formData, suspicion_description: e.target.value })
                  }
                  rows={3}
                  placeholder="Describe the suspicious activity..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reporter">Reporter</Label>
                  <Input
                    id="reporter"
                    value={formData.reporter}
                    onChange={(e) =>
                      setFormData({ ...formData, reporter: e.target.value })
                    }
                    placeholder="Name of person who reported"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mlro_review_date">MLRO Review Date</Label>
                  <Input
                    id="mlro_review_date"
                    type="date"
                    value={formData.mlro_review_date}
                    onChange={(e) =>
                      setFormData({ ...formData, mlro_review_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mlro_decision">MLRO Decision</Label>
                  <Select
                    value={formData.mlro_decision}
                    onValueChange={(value) =>
                      setFormData({ ...formData, mlro_decision: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MLRO_DECISIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mlro_rationale">MLRO Rationale</Label>
                <Textarea
                  id="mlro_rationale"
                  value={formData.mlro_rationale}
                  onChange={(e) =>
                    setFormData({ ...formData, mlro_rationale: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="submitted_to_nca"
                    checked={formData.submitted_to_nca}
                    onChange={(e) =>
                      setFormData({ ...formData, submitted_to_nca: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="submitted_to_nca">Submitted to NCA</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="consent_required"
                    checked={formData.consent_required}
                    onChange={(e) =>
                      setFormData({ ...formData, consent_required: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="consent_required">Consent Required</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="consent_received"
                    checked={formData.consent_received}
                    onChange={(e) =>
                      setFormData({ ...formData, consent_received: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="consent_received">Consent Received</Label>
                </div>
              </div>

              {formData.submitted_to_nca && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nca_submission_date">NCA Submission Date</Label>
                    <Input
                      id="nca_submission_date"
                      type="date"
                      value={formData.nca_submission_date}
                      onChange={(e) =>
                        setFormData({ ...formData, nca_submission_date: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nca_reference">NCA Reference</Label>
                    <Input
                      id="nca_reference"
                      value={formData.nca_reference}
                      onChange={(e) =>
                        setFormData({ ...formData, nca_reference: e.target.value })
                      }
                      placeholder="NCA reference number"
                    />
                  </div>
                </div>
              )}

              {formData.consent_required && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="consent_requested_date">Consent Requested Date</Label>
                    <Input
                      id="consent_requested_date"
                      type="date"
                      value={formData.consent_requested_date}
                      onChange={(e) =>
                        setFormData({ ...formData, consent_requested_date: e.target.value })
                      }
                    />
                  </div>
                  {formData.consent_received && (
                    <div className="space-y-2">
                      <Label htmlFor="consent_received_date">Consent Received Date</Label>
                      <Input
                        id="consent_received_date"
                        type="date"
                        value={formData.consent_received_date}
                        onChange={(e) =>
                          setFormData({ ...formData, consent_received_date: e.target.value })
                        }
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="daml_requested"
                    checked={formData.daml_requested}
                    onChange={(e) =>
                      setFormData({ ...formData, daml_requested: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="daml_requested">DAML Requested</Label>
                </div>
                {formData.daml_requested && (
                  <div className="space-y-2">
                    <Label htmlFor="daml_reference">DAML Reference</Label>
                    <Input
                      id="daml_reference"
                      value={formData.daml_reference}
                      onChange={(e) =>
                        setFormData({ ...formData, daml_reference: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="outcome">Outcome</Label>
                <Textarea
                  id="outcome"
                  value={formData.outcome}
                  onChange={(e) =>
                    setFormData({ ...formData, outcome: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingRecord ? "Update Record" : "Create Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
