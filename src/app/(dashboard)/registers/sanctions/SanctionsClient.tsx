"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft, Plus, Search, Filter, Download, Shield, AlertTriangle, CheckCircle, Clock, XCircle, FileSpreadsheet } from "lucide-react";
import { BatchScreeningModal } from "@/components/screening/BatchScreeningModal";
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
import { getMonthBuckets, getMonthKey } from "@/lib/chart-utils";
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

interface SanctionsRecord {
  id: string;
  screening_reference: string;
  entity_type: string;
  entity_name: string;
  entity_dob?: string;
  entity_country?: string;
  screening_date: string;
  screened_by?: string;
  screening_type: string;
  lists_checked?: string[];
  match_found: boolean;
  match_details?: string;
  match_score?: number;
  false_positive: boolean;
  false_positive_reason?: string;
  escalated: boolean;
  escalated_to?: string;
  escalated_date?: string;
  decision: string;
  decision_by?: string;
  decision_date?: string;
  decision_rationale?: string;
  status: string;
  notes?: string;
  created_at: string;
}

const ENTITY_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "company", label: "Company" },
  { value: "organization", label: "Organization" },
  { value: "vessel", label: "Vessel" },
  { value: "aircraft", label: "Aircraft" },
  { value: "other", label: "Other" },
];

const SCREENING_TYPES = [
  { value: "onboarding", label: "Onboarding" },
  { value: "periodic", label: "Periodic Review" },
  { value: "transaction", label: "Transaction" },
  { value: "ad_hoc", label: "Ad-hoc" },
  { value: "pep", label: "PEP Screening" },
  { value: "adverse_media", label: "Adverse Media" },
];

const DECISIONS = [
  { value: "pending", label: "Pending" },
  { value: "cleared", label: "Cleared" },
  { value: "match_confirmed", label: "Match Confirmed" },
  { value: "escalated", label: "Escalated" },
  { value: "blocked", label: "Blocked" },
];

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "in_review", label: "In Review" },
  { value: "completed", label: "Completed" },
  { value: "escalated", label: "Escalated" },
];

const SANCTIONS_LISTS = [
  "UK Sanctions List",
  "OFAC SDN List",
  "EU Sanctions List",
  "UN Consolidated List",
  "HM Treasury List",
];

const CHART_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6"];

export function SanctionsClient() {
  const [records, setRecords] = useState<SanctionsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDecision, setFilterDecision] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SanctionsRecord | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showBatchScreening, setShowBatchScreening] = useState(false);
  const [monthFilter, setMonthFilter] = useState<{ key: string; label: string } | null>(null);

  const [formData, setFormData] = useState({
    screening_reference: "",
    entity_type: "individual",
    entity_name: "",
    entity_dob: "",
    entity_country: "",
    screening_date: new Date().toISOString().split("T")[0],
    screened_by: "",
    screening_type: "onboarding",
    lists_checked: [] as string[],
    match_found: false,
    match_details: "",
    match_score: "",
    false_positive: false,
    false_positive_reason: "",
    escalated: false,
    escalated_to: "",
    decision: "pending",
    decision_rationale: "",
    status: "pending",
    notes: "",
  });

  const loadRecords = useCallback(async () => {
    try {
      const response = await fetch("/api/registers/sanctions");
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
        ? `/api/registers/sanctions/${editingRecord.id}`
        : "/api/registers/sanctions";
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
    if (!confirm("Are you sure you want to delete this screening record?")) return;
    try {
      const response = await fetch(`/api/registers/sanctions/${id}`, {
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
      screening_reference: "",
      entity_type: "individual",
      entity_name: "",
      entity_dob: "",
      entity_country: "",
      screening_date: new Date().toISOString().split("T")[0],
      screened_by: "",
      screening_type: "onboarding",
      lists_checked: [],
      match_found: false,
      match_details: "",
      match_score: "",
      false_positive: false,
      false_positive_reason: "",
      escalated: false,
      escalated_to: "",
      decision: "pending",
      decision_rationale: "",
      status: "pending",
      notes: "",
    });
    setEditingRecord(null);
  };

  const openEditDialog = (record: SanctionsRecord) => {
    setEditingRecord(record);
    setFormData({
      screening_reference: record.screening_reference,
      entity_type: record.entity_type,
      entity_name: record.entity_name,
      entity_dob: record.entity_dob ? record.entity_dob.split("T")[0] : "",
      entity_country: record.entity_country || "",
      screening_date: record.screening_date ? record.screening_date.split("T")[0] : "",
      screened_by: record.screened_by || "",
      screening_type: record.screening_type,
      lists_checked: record.lists_checked || [],
      match_found: record.match_found,
      match_details: record.match_details || "",
      match_score: record.match_score?.toString() || "",
      false_positive: record.false_positive,
      false_positive_reason: record.false_positive_reason || "",
      escalated: record.escalated,
      escalated_to: record.escalated_to || "",
      decision: record.decision,
      decision_rationale: record.decision_rationale || "",
      status: record.status,
      notes: record.notes || "",
    });
    setIsDialogOpen(true);
  };

  const baseFilteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const matchesSearch =
          record.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.screening_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (record.entity_country?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
        const matchesStatus = filterStatus === "all" || record.status === filterStatus;
        const matchesDecision = filterDecision === "all" || record.decision === filterDecision;
        return matchesSearch && matchesStatus && matchesDecision;
      }),
    [records, searchTerm, filterStatus, filterDecision]
  );

  const filteredRecords = useMemo(
    () =>
      monthFilter
        ? baseFilteredRecords.filter(
            (record) => getMonthKey(record.screening_date) === monthFilter.key
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
      pending: "secondary",
      in_review: "outline",
      completed: "default",
      escalated: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.replace("_", " ")}</Badge>;
  };

  const getDecisionBadge = (decision: string) => {
    const colors: Record<string, string> = {
      pending: "bg-gray-100 text-gray-700",
      cleared: "bg-green-100 text-green-700",
      match_confirmed: "bg-red-100 text-red-700",
      escalated: "bg-orange-100 text-orange-700",
      blocked: "bg-red-200 text-red-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[decision] || colors.pending}`}>
        {decision.replace("_", " ")}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = [
      "Reference", "Entity Name", "Entity Type", "Country", "Screening Date",
      "Screening Type", "Match Found", "Decision", "Status", "Notes"
    ];
    const rows = filteredRecords.map((r) => [
      r.screening_reference,
      r.entity_name,
      r.entity_type,
      r.entity_country || "",
      r.screening_date ? new Date(r.screening_date).toLocaleDateString() : "",
      r.screening_type,
      r.match_found ? "Yes" : "No",
      r.decision,
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
    a.download = `sanctions-screening-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate stats
  const stats = {
    total: filteredRecords.length,
    pending: filteredRecords.filter((r) => r.status === "pending").length,
    matches: filteredRecords.filter((r) => r.match_found).length,
    cleared: filteredRecords.filter((r) => r.decision === "cleared").length,
    falsePositives: filteredRecords.filter((r) => r.false_positive).length,
    escalated: filteredRecords.filter((r) => r.escalated).length,
  };

  // Chart data
  const decisionData = DECISIONS.map((d) => ({
    name: d.label,
    value: filteredRecords.filter((r) => r.decision === d.value).length,
  })).filter((d) => d.value > 0);

  const screeningTypeData = SCREENING_TYPES.map((t) => ({
    name: t.label,
    count: filteredRecords.filter((r) => r.screening_type === t.value).length,
  }));

  const monthBuckets = getMonthBuckets(6);

  const monthlyData = useMemo(
    () =>
      monthBuckets.map((bucket) => {
        const monthRecords = baseFilteredRecords.filter(
          (r) => getMonthKey(r.screening_date) === bucket.monthKey
        );
        return {
          month: bucket.label,
          monthKey: bucket.monthKey,
          screenings: monthRecords.length,
          matches: monthRecords.filter((r) => r.match_found).length,
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
        <div className="text-slate-500">Loading sanctions screening records...</div>
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
            <h1 className="text-2xl font-bold text-slate-900">Sanctions Screening Log</h1>
            <p className="text-slate-500">
              Document sanctions screening results and alerts
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowBatchScreening(true)}
            className="border-teal-200 text-teal-700 hover:bg-teal-50"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Batch Screen
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Screening
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-slate-500">Total Screenings</p>
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
                    <p className="text-xs text-slate-500">Pending</p>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-xs text-slate-500">Matches Found</p>
                    <p className="text-2xl font-bold">{stats.matches}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-xs text-slate-500">Cleared</p>
                    <p className="text-2xl font-bold">{stats.cleared}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-slate-500">False Positives</p>
                    <p className="text-2xl font-bold">{stats.falsePositives}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-xs text-slate-500">Escalated</p>
                    <p className="text-2xl font-bold">{stats.escalated}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Screening Trend</CardTitle>
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
                      <Bar dataKey="screenings" fill="#3b82f6" name="Screenings" onClick={(data) => handleMonthClick(data?.payload)} />
                      <Bar dataKey="matches" fill="#ef4444" name="Matches" onClick={(data) => handleMonthClick(data?.payload)} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Decision Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={decisionData}
                      layout="vertical"
                      margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={140} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                        {decisionData.map((_, index) => (
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
                <CardTitle className="text-lg">Screenings by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={screeningTypeData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
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
                  placeholder="Search by name, reference, or country..."
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
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Decision" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Decisions</SelectItem>
                {DECISIONS.map((d) => (
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
                    <TableHead>Reference</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Screening Date</TableHead>
                    <TableHead>Match</TableHead>
                    <TableHead>Decision</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        No screening records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.screening_reference}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.entity_name}</p>
                            <p className="text-xs text-slate-500">{record.entity_country}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {SCREENING_TYPES.find((t) => t.value === record.screening_type)?.label || record.screening_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.screening_date
                            ? new Date(record.screening_date).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {record.match_found ? (
                            <Badge variant="destructive">
                              Match ({record.match_score ? `${record.match_score}%` : "Yes"})
                            </Badge>
                          ) : (
                            <Badge variant="secondary">No Match</Badge>
                          )}
                        </TableCell>
                        <TableCell>{getDecisionBadge(record.decision)}</TableCell>
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
              {editingRecord ? "Edit Screening Record" : "New Sanctions Screening"}
            </DialogTitle>
            <DialogDescription>
              Record the details of a sanctions screening check
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="screening_reference">Screening Reference *</Label>
                  <Input
                    id="screening_reference"
                    value={formData.screening_reference}
                    onChange={(e) =>
                      setFormData({ ...formData, screening_reference: e.target.value })
                    }
                    placeholder="SCR-2024-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="screening_type">Screening Type</Label>
                  <Select
                    value={formData.screening_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, screening_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SCREENING_TYPES.map((t) => (
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
                  <Label htmlFor="entity_name">Entity Name *</Label>
                  <Input
                    id="entity_name"
                    value={formData.entity_name}
                    onChange={(e) =>
                      setFormData({ ...formData, entity_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entity_type">Entity Type</Label>
                  <Select
                    value={formData.entity_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, entity_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITY_TYPES.map((t) => (
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
                  <Label htmlFor="entity_dob">Date of Birth / Incorporation</Label>
                  <Input
                    id="entity_dob"
                    type="date"
                    value={formData.entity_dob}
                    onChange={(e) =>
                      setFormData({ ...formData, entity_dob: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entity_country">Country</Label>
                  <Input
                    id="entity_country"
                    value={formData.entity_country}
                    onChange={(e) =>
                      setFormData({ ...formData, entity_country: e.target.value })
                    }
                    placeholder="United Kingdom"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="screening_date">Screening Date</Label>
                  <Input
                    id="screening_date"
                    type="date"
                    value={formData.screening_date}
                    onChange={(e) =>
                      setFormData({ ...formData, screening_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="screened_by">Screened By</Label>
                  <Input
                    id="screened_by"
                    value={formData.screened_by}
                    onChange={(e) =>
                      setFormData({ ...formData, screened_by: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Lists Checked</Label>
                <div className="flex flex-wrap gap-2">
                  {SANCTIONS_LISTS.map((list) => (
                    <label key={list} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.lists_checked.includes(list)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              lists_checked: [...formData.lists_checked, list],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              lists_checked: formData.lists_checked.filter((l) => l !== list),
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{list}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="match_found"
                    checked={formData.match_found}
                    onChange={(e) =>
                      setFormData({ ...formData, match_found: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="match_found">Match Found</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="false_positive"
                    checked={formData.false_positive}
                    onChange={(e) =>
                      setFormData({ ...formData, false_positive: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="false_positive">False Positive</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="escalated"
                    checked={formData.escalated}
                    onChange={(e) =>
                      setFormData({ ...formData, escalated: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="escalated">Escalated</Label>
                </div>
              </div>

              {formData.match_found && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="match_score">Match Score (%)</Label>
                    <Input
                      id="match_score"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.match_score}
                      onChange={(e) =>
                        setFormData({ ...formData, match_score: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="match_details">Match Details</Label>
                    <Textarea
                      id="match_details"
                      value={formData.match_details}
                      onChange={(e) =>
                        setFormData({ ...formData, match_details: e.target.value })
                      }
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {formData.false_positive && (
                <div className="space-y-2">
                  <Label htmlFor="false_positive_reason">False Positive Reason</Label>
                  <Textarea
                    id="false_positive_reason"
                    value={formData.false_positive_reason}
                    onChange={(e) =>
                      setFormData({ ...formData, false_positive_reason: e.target.value })
                    }
                    rows={2}
                  />
                </div>
              )}

              {formData.escalated && (
                <div className="space-y-2">
                  <Label htmlFor="escalated_to">Escalated To</Label>
                  <Input
                    id="escalated_to"
                    value={formData.escalated_to}
                    onChange={(e) =>
                      setFormData({ ...formData, escalated_to: e.target.value })
                    }
                    placeholder="e.g., MLRO"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="decision">Decision</Label>
                  <Select
                    value={formData.decision}
                    onValueChange={(value) =>
                      setFormData({ ...formData, decision: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DECISIONS.map((d) => (
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
                <Label htmlFor="decision_rationale">Decision Rationale</Label>
                <Textarea
                  id="decision_rationale"
                  value={formData.decision_rationale}
                  onChange={(e) =>
                    setFormData({ ...formData, decision_rationale: e.target.value })
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

      {/* Batch Screening Modal */}
      <BatchScreeningModal
        open={showBatchScreening}
        onOpenChange={setShowBatchScreening}
        onScreeningComplete={(results) => {
          // Optionally create records from screening results
          console.log("Batch screening complete:", results);
        }}
      />
    </div>
  );
}
