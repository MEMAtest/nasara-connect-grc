"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft, Plus, Search, Filter, Download, ShieldAlert, FileSearch, Clock } from "lucide-react";
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
import { useToast } from "@/components/toast-provider";
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

interface DataBreachDsarRecord {
  id: string;
  record_reference: string;
  record_type: string;
  // Data Breach fields
  breach_date?: string;
  breach_discovered_date?: string;
  breach_cause?: string;
  breach_description?: string;
  data_subjects_affected?: number;
  data_categories_affected?: string[];
  containment_actions?: string;
  ico_notified: boolean;
  ico_notification_date?: string;
  ico_reference?: string;
  data_subjects_notified: boolean;
  data_subjects_notification_date?: string;
  // DSAR fields
  dsar_received_date?: string;
  dsar_deadline?: string;
  dsar_requester_name?: string;
  dsar_requester_email?: string;
  dsar_request_type?: string;
  dsar_verification_status?: string;
  dsar_extension_applied: boolean;
  dsar_extension_reason?: string;
  dsar_response_date?: string;
  // Common fields
  assigned_to?: string;
  status: string;
  root_cause_analysis?: string;
  remediation_actions?: string;
  lessons_learned?: string;
  closed_date?: string;
  closed_by?: string;
  notes?: string;
  created_at: string;
}

const RECORD_TYPES = [
  { value: "data_breach", label: "Data Breach" },
  { value: "dsar", label: "DSAR" },
];

const BREACH_CAUSES = [
  { value: "human_error", label: "Human Error" },
  { value: "cyber_attack", label: "Cyber Attack" },
  { value: "system_failure", label: "System Failure" },
  { value: "theft", label: "Theft" },
  { value: "unauthorized_access", label: "Unauthorized Access" },
  { value: "other", label: "Other" },
];

const DSAR_VERIFICATION_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "failed", label: "Failed" },
];

const STATUSES = [
  { value: "open", label: "Open" },
  { value: "investigating", label: "Investigating" },
  { value: "remediation", label: "Remediation" },
  { value: "closed", label: "Closed" },
];

const CHART_COLORS = ["#ef4444", "#f59e0b", "#10b981", "#6366f1", "#8b5cf6", "#ec4899"];

export function DataBreachDsarClient() {
  const toast = useToast();
  const [records, setRecords] = useState<DataBreachDsarRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRecordType, setFilterRecordType] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DataBreachDsarRecord | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [monthFilter, setMonthFilter] = useState<{ key: string; label: string } | null>(null);

  const [formData, setFormData] = useState({
    record_reference: "",
    record_type: "data_breach",
    // Data Breach fields
    breach_date: "",
    breach_discovered_date: "",
    breach_cause: "",
    breach_description: "",
    data_subjects_affected: "",
    containment_actions: "",
    ico_notified: false,
    ico_notification_date: "",
    ico_reference: "",
    data_subjects_notified: false,
    data_subjects_notification_date: "",
    // DSAR fields
    dsar_received_date: "",
    dsar_deadline: "",
    dsar_requester_name: "",
    dsar_requester_email: "",
    dsar_request_type: "",
    dsar_verification_status: "pending",
    dsar_extension_applied: false,
    dsar_extension_reason: "",
    dsar_response_date: "",
    // Common fields
    assigned_to: "",
    status: "open",
    root_cause_analysis: "",
    remediation_actions: "",
    lessons_learned: "",
    closed_date: "",
    closed_by: "",
    notes: "",
  });

  const loadRecords = useCallback(async () => {
    try {
      const response = await fetch("/api/registers/data-breach-dsar");
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
        ? `/api/registers/data-breach-dsar/${editingRecord.id}`
        : "/api/registers/data-breach-dsar";
      const method = editingRecord ? "PATCH" : "POST";

      const payload = {
        ...formData,
        data_subjects_affected: formData.data_subjects_affected
          ? parseInt(formData.data_subjects_affected)
          : undefined,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await loadRecords();
        setIsDialogOpen(false);
        resetForm();
        toast.success(editingRecord ? "Record updated successfully" : "Record created successfully");
      } else {
        toast.error("Failed to save record");
      }
    } catch (error) {
      console.error("Error saving record:", error);
      toast.error("Failed to save record");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const response = await fetch(`/api/registers/data-breach-dsar/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await loadRecords();
        toast.success("Record deleted successfully");
      } else {
        toast.error("Failed to delete record");
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record");
    }
  };

  const resetForm = () => {
    setFormData({
      record_reference: "",
      record_type: "data_breach",
      breach_date: "",
      breach_discovered_date: "",
      breach_cause: "",
      breach_description: "",
      data_subjects_affected: "",
      containment_actions: "",
      ico_notified: false,
      ico_notification_date: "",
      ico_reference: "",
      data_subjects_notified: false,
      data_subjects_notification_date: "",
      dsar_received_date: "",
      dsar_deadline: "",
      dsar_requester_name: "",
      dsar_requester_email: "",
      dsar_request_type: "",
      dsar_verification_status: "pending",
      dsar_extension_applied: false,
      dsar_extension_reason: "",
      dsar_response_date: "",
      assigned_to: "",
      status: "open",
      root_cause_analysis: "",
      remediation_actions: "",
      lessons_learned: "",
      closed_date: "",
      closed_by: "",
      notes: "",
    });
    setEditingRecord(null);
  };

  const openEditDialog = (record: DataBreachDsarRecord) => {
    setEditingRecord(record);
    setFormData({
      record_reference: record.record_reference,
      record_type: record.record_type,
      breach_date: record.breach_date ? record.breach_date.split("T")[0] : "",
      breach_discovered_date: record.breach_discovered_date ? record.breach_discovered_date.split("T")[0] : "",
      breach_cause: record.breach_cause || "",
      breach_description: record.breach_description || "",
      data_subjects_affected: record.data_subjects_affected?.toString() || "",
      containment_actions: record.containment_actions || "",
      ico_notified: record.ico_notified,
      ico_notification_date: record.ico_notification_date ? record.ico_notification_date.split("T")[0] : "",
      ico_reference: record.ico_reference || "",
      data_subjects_notified: record.data_subjects_notified,
      data_subjects_notification_date: record.data_subjects_notification_date ? record.data_subjects_notification_date.split("T")[0] : "",
      dsar_received_date: record.dsar_received_date ? record.dsar_received_date.split("T")[0] : "",
      dsar_deadline: record.dsar_deadline ? record.dsar_deadline.split("T")[0] : "",
      dsar_requester_name: record.dsar_requester_name || "",
      dsar_requester_email: record.dsar_requester_email || "",
      dsar_request_type: record.dsar_request_type || "",
      dsar_verification_status: record.dsar_verification_status || "pending",
      dsar_extension_applied: record.dsar_extension_applied,
      dsar_extension_reason: record.dsar_extension_reason || "",
      dsar_response_date: record.dsar_response_date ? record.dsar_response_date.split("T")[0] : "",
      assigned_to: record.assigned_to || "",
      status: record.status,
      root_cause_analysis: record.root_cause_analysis || "",
      remediation_actions: record.remediation_actions || "",
      lessons_learned: record.lessons_learned || "",
      closed_date: record.closed_date ? record.closed_date.split("T")[0] : "",
      closed_by: record.closed_by || "",
      notes: record.notes || "",
    });
    setIsDialogOpen(true);
  };

  const baseFilteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const matchesSearch =
          record.record_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (record.dsar_requester_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
          (record.breach_description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
        const matchesStatus = filterStatus === "all" || record.status === filterStatus;
        const matchesRecordType = filterRecordType === "all" || record.record_type === filterRecordType;
        return matchesSearch && matchesStatus && matchesRecordType;
      }),
    [records, searchTerm, filterStatus, filterRecordType]
  );

  const filteredRecords = useMemo(
    () =>
      monthFilter
        ? baseFilteredRecords.filter(
            (record) => getMonthKey(record.created_at) === monthFilter.key
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
      open: "destructive",
      investigating: "secondary",
      remediation: "outline",
      closed: "default",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getRecordTypeBadge = (recordType: string) => {
    const colors: Record<string, string> = {
      data_breach: "bg-red-100 text-red-700",
      dsar: "bg-blue-100 text-blue-700",
    };
    const labels: Record<string, string> = {
      data_breach: "Data Breach",
      dsar: "DSAR",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[recordType] || "bg-gray-100 text-gray-700"}`}>
        {labels[recordType] || recordType}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = [
      "Reference", "Type", "Discovery Date", "Description", "Subjects Affected",
      "ICO Notified", "Requester Name", "DSAR Deadline", "Status", "Notes"
    ];
    const rows = filteredRecords.map((r) => [
      r.record_reference,
      r.record_type === "data_breach" ? "Data Breach" : "DSAR",
      r.breach_discovered_date ? new Date(r.breach_discovered_date).toLocaleDateString() : (r.dsar_received_date ? new Date(r.dsar_received_date).toLocaleDateString() : ""),
      r.breach_description || "",
      r.data_subjects_affected?.toString() || "",
      r.ico_notified ? "Yes" : "No",
      r.dsar_requester_name || "",
      r.dsar_deadline ? new Date(r.dsar_deadline).toLocaleDateString() : "",
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
    a.download = `data-breach-dsar-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate stats
  const stats = {
    total: filteredRecords.length,
    dataBreaches: filteredRecords.filter((r) => r.record_type === "data_breach").length,
    dsars: filteredRecords.filter((r) => r.record_type === "dsar").length,
    open: filteredRecords.filter((r) => r.status === "open" || r.status === "investigating" || r.status === "remediation").length,
  };

  // Chart data
  const recordTypeData = RECORD_TYPES.map((t) => ({
    name: t.label,
    value: filteredRecords.filter((r) => r.record_type === t.value).length,
  })).filter((d) => d.value > 0);

  const statusData = STATUSES.map((s) => ({
    name: s.label,
    count: filteredRecords.filter((r) => r.status === s.value).length,
  }));

  const breachCauseData = BREACH_CAUSES.map((c) => ({
    name: c.label,
    count: filteredRecords.filter((r) => r.record_type === "data_breach" && r.breach_cause === c.value).length,
  })).filter((d) => d.count > 0);

  const monthBuckets = getMonthBuckets(6);

  const monthlyData = useMemo(
    () =>
      monthBuckets.map((bucket) => {
        const monthRecords = baseFilteredRecords.filter(
          (r) => getMonthKey(r.created_at) === bucket.monthKey
        );
        return {
          month: bucket.label,
          monthKey: bucket.monthKey,
          breaches: monthRecords.filter((r) => r.record_type === "data_breach").length,
          dsars: monthRecords.filter((r) => r.record_type === "dsar").length,
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
        <div className="text-slate-500">Loading data breach and DSAR records...</div>
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
            <h1 className="text-2xl font-bold text-slate-900">Data Breach & DSAR Register</h1>
            <p className="text-slate-500">
              Track data breaches and data subject access requests
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
            New Record
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
                  <FileSearch className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-slate-500">Total Records</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-xs text-slate-500">Data Breaches</p>
                    <p className="text-2xl font-bold">{stats.dataBreaches}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <FileSearch className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-slate-500">DSARs</p>
                    <p className="text-2xl font-bold">{stats.dsars}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-xs text-slate-500">Open</p>
                    <p className="text-2xl font-bold">{stats.open}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Trend</CardTitle>
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
                      <Bar dataKey="breaches" fill="#ef4444" name="Breaches" onClick={(data) => handleMonthClick(data?.payload)} />
                      <Bar dataKey="dsars" fill="#6366f1" name="DSARs" onClick={(data) => handleMonthClick(data?.payload)} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Record Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={recordTypeData}
                      layout="vertical"
                      margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={140} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                        {recordTypeData.map((_, index) => (
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {breachCauseData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Breach Causes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={breachCauseData}
                        layout="vertical"
                        margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis dataKey="name" type="category" width={160} />
                        <Tooltip />
                        <Bar dataKey="count" radius={[6, 6, 6, 6]}>
                          {breachCauseData.map((_, index) => (
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
            )}
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by reference, requester, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterRecordType} onValueChange={setFilterRecordType}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {RECORD_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
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
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Discovery/Received Date</TableHead>
                    <TableHead>Description/Requester</TableHead>
                    <TableHead>Subjects Affected</TableHead>
                    <TableHead>ICO Notified / Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        No data breach or DSAR records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.record_reference}
                        </TableCell>
                        <TableCell>{getRecordTypeBadge(record.record_type)}</TableCell>
                        <TableCell>
                          {record.record_type === "data_breach"
                            ? (record.breach_discovered_date
                                ? new Date(record.breach_discovered_date).toLocaleDateString()
                                : "-")
                            : (record.dsar_received_date
                                ? new Date(record.dsar_received_date).toLocaleDateString()
                                : "-")}
                        </TableCell>
                        <TableCell>
                          {record.record_type === "data_breach" ? (
                            <div className="max-w-[200px] truncate">
                              {record.breach_description || "-"}
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium">{record.dsar_requester_name || "-"}</p>
                              <p className="text-xs text-slate-500">{record.dsar_requester_email}</p>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.record_type === "data_breach"
                            ? (record.data_subjects_affected?.toLocaleString() || "-")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {record.record_type === "data_breach" ? (
                            record.ico_notified ? (
                              <Badge variant="default">ICO Notified</Badge>
                            ) : (
                              <Badge variant="secondary">Not Notified</Badge>
                            )
                          ) : (
                            record.dsar_deadline ? (
                              <span className={new Date(record.dsar_deadline) < new Date() ? "text-red-600 font-medium" : ""}>
                                {new Date(record.dsar_deadline).toLocaleDateString()}
                              </span>
                            ) : "-"
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
              {editingRecord ? "Edit Record" : "New Data Breach / DSAR Record"}
            </DialogTitle>
            <DialogDescription>
              Record details of a data breach or data subject access request
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="record_reference">Record Reference *</Label>
                  <Input
                    id="record_reference"
                    value={formData.record_reference}
                    onChange={(e) =>
                      setFormData({ ...formData, record_reference: e.target.value })
                    }
                    placeholder="DB-2024-001 or DSAR-2024-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="record_type">Record Type *</Label>
                  <Select
                    value={formData.record_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, record_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RECORD_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Data Breach Fields */}
              {formData.record_type === "data_breach" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="breach_date">Breach Date</Label>
                      <Input
                        id="breach_date"
                        type="date"
                        value={formData.breach_date}
                        onChange={(e) =>
                          setFormData({ ...formData, breach_date: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="breach_discovered_date">Discovery Date</Label>
                      <Input
                        id="breach_discovered_date"
                        type="date"
                        value={formData.breach_discovered_date}
                        onChange={(e) =>
                          setFormData({ ...formData, breach_discovered_date: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="breach_cause">Breach Cause</Label>
                      <Select
                        value={formData.breach_cause}
                        onValueChange={(value) =>
                          setFormData({ ...formData, breach_cause: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select cause" />
                        </SelectTrigger>
                        <SelectContent>
                          {BREACH_CAUSES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="data_subjects_affected">Data Subjects Affected</Label>
                      <Input
                        id="data_subjects_affected"
                        type="number"
                        min="0"
                        value={formData.data_subjects_affected}
                        onChange={(e) =>
                          setFormData({ ...formData, data_subjects_affected: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="breach_description">Breach Description</Label>
                    <Textarea
                      id="breach_description"
                      value={formData.breach_description}
                      onChange={(e) =>
                        setFormData({ ...formData, breach_description: e.target.value })
                      }
                      rows={3}
                      placeholder="Describe what happened..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="containment_actions">Containment Actions</Label>
                    <Textarea
                      id="containment_actions"
                      value={formData.containment_actions}
                      onChange={(e) =>
                        setFormData({ ...formData, containment_actions: e.target.value })
                      }
                      rows={2}
                      placeholder="Actions taken to contain the breach..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="ico_notified"
                        checked={formData.ico_notified}
                        onChange={(e) =>
                          setFormData({ ...formData, ico_notified: e.target.checked })
                        }
                        className="rounded"
                      />
                      <Label htmlFor="ico_notified">ICO Notified</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="data_subjects_notified"
                        checked={formData.data_subjects_notified}
                        onChange={(e) =>
                          setFormData({ ...formData, data_subjects_notified: e.target.checked })
                        }
                        className="rounded"
                      />
                      <Label htmlFor="data_subjects_notified">Data Subjects Notified</Label>
                    </div>
                  </div>

                  {formData.ico_notified && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ico_notification_date">ICO Notification Date</Label>
                        <Input
                          id="ico_notification_date"
                          type="date"
                          value={formData.ico_notification_date}
                          onChange={(e) =>
                            setFormData({ ...formData, ico_notification_date: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ico_reference">ICO Reference</Label>
                        <Input
                          id="ico_reference"
                          value={formData.ico_reference}
                          onChange={(e) =>
                            setFormData({ ...formData, ico_reference: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* DSAR Fields */}
              {formData.record_type === "dsar" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dsar_requester_name">Requester Name</Label>
                      <Input
                        id="dsar_requester_name"
                        value={formData.dsar_requester_name}
                        onChange={(e) =>
                          setFormData({ ...formData, dsar_requester_name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dsar_requester_email">Requester Email</Label>
                      <Input
                        id="dsar_requester_email"
                        type="email"
                        value={formData.dsar_requester_email}
                        onChange={(e) =>
                          setFormData({ ...formData, dsar_requester_email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dsar_received_date">Received Date</Label>
                      <Input
                        id="dsar_received_date"
                        type="date"
                        value={formData.dsar_received_date}
                        onChange={(e) =>
                          setFormData({ ...formData, dsar_received_date: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dsar_deadline">Response Deadline</Label>
                      <Input
                        id="dsar_deadline"
                        type="date"
                        value={formData.dsar_deadline}
                        onChange={(e) =>
                          setFormData({ ...formData, dsar_deadline: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dsar_request_type">Request Type</Label>
                      <Input
                        id="dsar_request_type"
                        value={formData.dsar_request_type}
                        onChange={(e) =>
                          setFormData({ ...formData, dsar_request_type: e.target.value })
                        }
                        placeholder="e.g., Access, Erasure, Rectification"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dsar_verification_status">Verification Status</Label>
                      <Select
                        value={formData.dsar_verification_status}
                        onValueChange={(value) =>
                          setFormData({ ...formData, dsar_verification_status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DSAR_VERIFICATION_STATUSES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="dsar_extension_applied"
                      checked={formData.dsar_extension_applied}
                      onChange={(e) =>
                        setFormData({ ...formData, dsar_extension_applied: e.target.checked })
                      }
                      className="rounded"
                    />
                    <Label htmlFor="dsar_extension_applied">Extension Applied</Label>
                  </div>

                  {formData.dsar_extension_applied && (
                    <div className="space-y-2">
                      <Label htmlFor="dsar_extension_reason">Extension Reason</Label>
                      <Textarea
                        id="dsar_extension_reason"
                        value={formData.dsar_extension_reason}
                        onChange={(e) =>
                          setFormData({ ...formData, dsar_extension_reason: e.target.value })
                        }
                        rows={2}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="dsar_response_date">Response Date</Label>
                    <Input
                      id="dsar_response_date"
                      type="date"
                      value={formData.dsar_response_date}
                      onChange={(e) =>
                        setFormData({ ...formData, dsar_response_date: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              {/* Common Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assigned_to">Assigned To</Label>
                  <Input
                    id="assigned_to"
                    value={formData.assigned_to}
                    onChange={(e) =>
                      setFormData({ ...formData, assigned_to: e.target.value })
                    }
                  />
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
                <Label htmlFor="root_cause_analysis">Root Cause Analysis</Label>
                <Textarea
                  id="root_cause_analysis"
                  value={formData.root_cause_analysis}
                  onChange={(e) =>
                    setFormData({ ...formData, root_cause_analysis: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remediation_actions">Remediation Actions</Label>
                <Textarea
                  id="remediation_actions"
                  value={formData.remediation_actions}
                  onChange={(e) =>
                    setFormData({ ...formData, remediation_actions: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lessons_learned">Lessons Learned</Label>
                <Textarea
                  id="lessons_learned"
                  value={formData.lessons_learned}
                  onChange={(e) =>
                    setFormData({ ...formData, lessons_learned: e.target.value })
                  }
                  rows={2}
                />
              </div>

              {formData.status === "closed" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="closed_date">Closed Date</Label>
                    <Input
                      id="closed_date"
                      type="date"
                      value={formData.closed_date}
                      onChange={(e) =>
                        setFormData({ ...formData, closed_date: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closed_by">Closed By</Label>
                    <Input
                      id="closed_by"
                      value={formData.closed_by}
                      onChange={(e) =>
                        setFormData({ ...formData, closed_by: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

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
