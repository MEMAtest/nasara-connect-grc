"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft, Plus, Search, Filter, Download, Activity, AlertTriangle, Clock, AlertCircle, FileText } from "lucide-react";
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

interface TxMonitoringRecord {
  id: string;
  alert_reference: string;
  alert_date: string;
  alert_type: string;
  alert_severity: string;
  customer_id?: string;
  customer_name: string;
  account_number?: string;
  transaction_amount?: number;
  transaction_currency?: string;
  transaction_date?: string;
  alert_description?: string;
  rule_triggered?: string;
  assigned_to?: string;
  assigned_date?: string;
  investigation_start_date?: string;
  investigation_end_date?: string;
  investigation_notes?: string;
  investigation_outcome: string;
  escalated: boolean;
  escalated_to?: string;
  escalated_date?: string;
  sar_reference?: string;
  sar_filed_date?: string;
  status: string;
  closed_date?: string;
  closed_by?: string;
  notes?: string;
  created_at: string;
}

const ALERT_TYPES = [
  { value: "high_value", label: "High Value Transaction" },
  { value: "unusual_pattern", label: "Unusual Pattern" },
  { value: "structuring", label: "Structuring" },
  { value: "rapid_movement", label: "Rapid Movement" },
  { value: "dormant_account", label: "Dormant Account" },
  { value: "geographic", label: "Geographic Risk" },
  { value: "other", label: "Other" },
];

const ALERT_SEVERITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const INVESTIGATION_OUTCOMES = [
  { value: "pending", label: "Pending" },
  { value: "cleared", label: "Cleared" },
  { value: "sar_filed", label: "SAR Filed" },
  { value: "account_closed", label: "Account Closed" },
  { value: "enhanced_monitoring", label: "Enhanced Monitoring" },
];

const STATUSES = [
  { value: "open", label: "Open" },
  { value: "assigned", label: "Assigned" },
  { value: "investigating", label: "Investigating" },
  { value: "escalated", label: "Escalated" },
  { value: "closed", label: "Closed" },
];

const CHART_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6"];

export function TxMonitoringClient() {
  const [records, setRecords] = useState<TxMonitoringRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TxMonitoringRecord | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [monthFilter, setMonthFilter] = useState<{ key: string; label: string } | null>(null);

  const [formData, setFormData] = useState({
    alert_reference: "",
    alert_date: new Date().toISOString().split("T")[0],
    alert_type: "other",
    alert_severity: "medium",
    customer_id: "",
    customer_name: "",
    account_number: "",
    transaction_amount: "",
    transaction_currency: "GBP",
    transaction_date: "",
    alert_description: "",
    rule_triggered: "",
    assigned_to: "",
    assigned_date: "",
    investigation_start_date: "",
    investigation_end_date: "",
    investigation_notes: "",
    investigation_outcome: "pending",
    escalated: false,
    escalated_to: "",
    escalated_date: "",
    sar_reference: "",
    sar_filed_date: "",
    status: "open",
    closed_date: "",
    closed_by: "",
    notes: "",
  });

  const loadRecords = useCallback(async () => {
    try {
      const response = await fetch("/api/registers/tx-monitoring");
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
        ? `/api/registers/tx-monitoring/${editingRecord.id}`
        : "/api/registers/tx-monitoring";
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
    if (!confirm("Are you sure you want to delete this alert record?")) return;
    try {
      const response = await fetch(`/api/registers/tx-monitoring/${id}`, {
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
      alert_reference: "",
      alert_date: new Date().toISOString().split("T")[0],
      alert_type: "other",
      alert_severity: "medium",
      customer_id: "",
      customer_name: "",
      account_number: "",
      transaction_amount: "",
      transaction_currency: "GBP",
      transaction_date: "",
      alert_description: "",
      rule_triggered: "",
      assigned_to: "",
      assigned_date: "",
      investigation_start_date: "",
      investigation_end_date: "",
      investigation_notes: "",
      investigation_outcome: "pending",
      escalated: false,
      escalated_to: "",
      escalated_date: "",
      sar_reference: "",
      sar_filed_date: "",
      status: "open",
      closed_date: "",
      closed_by: "",
      notes: "",
    });
    setEditingRecord(null);
  };

  const openEditDialog = (record: TxMonitoringRecord) => {
    setEditingRecord(record);
    setFormData({
      alert_reference: record.alert_reference,
      alert_date: record.alert_date ? record.alert_date.split("T")[0] : "",
      alert_type: record.alert_type,
      alert_severity: record.alert_severity,
      customer_id: record.customer_id || "",
      customer_name: record.customer_name,
      account_number: record.account_number || "",
      transaction_amount: record.transaction_amount?.toString() || "",
      transaction_currency: record.transaction_currency || "GBP",
      transaction_date: record.transaction_date ? record.transaction_date.split("T")[0] : "",
      alert_description: record.alert_description || "",
      rule_triggered: record.rule_triggered || "",
      assigned_to: record.assigned_to || "",
      assigned_date: record.assigned_date ? record.assigned_date.split("T")[0] : "",
      investigation_start_date: record.investigation_start_date ? record.investigation_start_date.split("T")[0] : "",
      investigation_end_date: record.investigation_end_date ? record.investigation_end_date.split("T")[0] : "",
      investigation_notes: record.investigation_notes || "",
      investigation_outcome: record.investigation_outcome,
      escalated: record.escalated,
      escalated_to: record.escalated_to || "",
      escalated_date: record.escalated_date ? record.escalated_date.split("T")[0] : "",
      sar_reference: record.sar_reference || "",
      sar_filed_date: record.sar_filed_date ? record.sar_filed_date.split("T")[0] : "",
      status: record.status,
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
          record.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.alert_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (record.account_number?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
        const matchesStatus = filterStatus === "all" || record.status === filterStatus;
        const matchesSeverity = filterSeverity === "all" || record.alert_severity === filterSeverity;
        return matchesSearch && matchesStatus && matchesSeverity;
      }),
    [records, searchTerm, filterStatus, filterSeverity]
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
      assigned: "outline",
      investigating: "secondary",
      escalated: "destructive",
      closed: "default",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.replace("_", " ")}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      low: "bg-green-100 text-green-700",
      medium: "bg-yellow-100 text-yellow-700",
      high: "bg-orange-100 text-orange-700",
      critical: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[severity] || colors.medium}`}>
        {severity}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = [
      "Alert Reference", "Alert Date", "Customer Name", "Alert Type", "Severity",
      "Assigned To", "Investigation Outcome", "Escalated", "SAR Raised", "Status", "Notes"
    ];
    const rows = filteredRecords.map((r) => [
      r.alert_reference,
      r.alert_date ? new Date(r.alert_date).toLocaleDateString() : "",
      r.customer_name,
      r.alert_type,
      r.alert_severity,
      r.assigned_to || "",
      r.investigation_outcome,
      r.escalated ? "Yes" : "No",
      r.sar_reference ? "Yes" : "No",
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
    a.download = `tx-monitoring-alerts-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate stats
  const stats = {
    total: filteredRecords.length,
    open: filteredRecords.filter((r) => r.status === "open").length,
    investigating: filteredRecords.filter((r) => r.status === "investigating").length,
    escalated: filteredRecords.filter((r) => r.escalated).length,
    sarRaised: filteredRecords.filter((r) => r.sar_reference).length,
  };

  // Chart data
  const statusData = STATUSES.map((s) => ({
    name: s.label,
    value: filteredRecords.filter((r) => r.status === s.value).length,
  })).filter((d) => d.value > 0);

  const alertTypeData = ALERT_TYPES.map((t) => ({
    name: t.label,
    count: filteredRecords.filter((r) => r.alert_type === t.value).length,
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
          alerts: monthRecords.length,
          escalated: monthRecords.filter((r) => r.escalated).length,
          sarFiled: monthRecords.filter((r) => r.sar_reference).length,
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
        <div className="text-slate-500">Loading transaction monitoring alerts...</div>
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
            <h1 className="text-2xl font-bold text-slate-900">Transaction Monitoring Alerts</h1>
            <p className="text-slate-500">
              Track and manage transaction monitoring alerts and investigations
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
            New Alert
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-slate-500">Total Alerts</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-xs text-slate-500">Open</p>
                    <p className="text-2xl font-bold">{stats.open}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-xs text-slate-500">Investigating</p>
                    <p className="text-2xl font-bold">{stats.investigating}</p>
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
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-slate-500">SAR Raised</p>
                    <p className="text-2xl font-bold">{stats.sarRaised}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alert Trend</CardTitle>
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
                      <Bar dataKey="alerts" fill="#3b82f6" name="Alerts" onClick={(data) => handleMonthClick(data?.payload)} />
                      <Bar dataKey="escalated" fill="#f59e0b" name="Escalated" onClick={(data) => handleMonthClick(data?.payload)} />
                      <Bar dataKey="sarFiled" fill="#ef4444" name="SAR Filed" onClick={(data) => handleMonthClick(data?.payload)} />
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
                <CardTitle className="text-lg">Alerts by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={alertTypeData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={160} />
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
                  placeholder="Search by customer, reference, account..."
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
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                {ALERT_SEVERITIES.map((s) => (
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
                    <TableHead>Alert Reference</TableHead>
                    <TableHead>Alert Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Alert Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                        No alert records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.alert_reference}
                        </TableCell>
                        <TableCell>
                          {record.alert_date
                            ? new Date(record.alert_date).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.customer_name}</p>
                            {record.account_number && (
                              <p className="text-xs text-slate-500">{record.account_number}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {ALERT_TYPES.find((t) => t.value === record.alert_type)?.label || record.alert_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{getSeverityBadge(record.alert_severity)}</TableCell>
                        <TableCell>{record.assigned_to || "-"}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm">
                              {INVESTIGATION_OUTCOMES.find((o) => o.value === record.investigation_outcome)?.label || record.investigation_outcome}
                            </span>
                            {record.escalated && (
                              <Badge variant="destructive" className="text-xs w-fit">Escalated</Badge>
                            )}
                            {record.sar_reference && (
                              <Badge variant="secondary" className="text-xs w-fit">SAR: {record.sar_reference}</Badge>
                            )}
                          </div>
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
              {editingRecord ? "Edit Alert" : "New Transaction Monitoring Alert"}
            </DialogTitle>
            <DialogDescription>
              Record the details of a transaction monitoring alert
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alert_reference">Alert Reference *</Label>
                  <Input
                    id="alert_reference"
                    value={formData.alert_reference}
                    onChange={(e) =>
                      setFormData({ ...formData, alert_reference: e.target.value })
                    }
                    placeholder="TXM-2024-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alert_date">Alert Date</Label>
                  <Input
                    id="alert_date"
                    type="date"
                    value={formData.alert_date}
                    onChange={(e) =>
                      setFormData({ ...formData, alert_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Customer Name *</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_id">Customer ID</Label>
                  <Input
                    id="customer_id"
                    value={formData.customer_id}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_id: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alert_type">Alert Type</Label>
                  <Select
                    value={formData.alert_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, alert_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALERT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alert_severity">Severity</Label>
                  <Select
                    value={formData.alert_severity}
                    onValueChange={(value) =>
                      setFormData({ ...formData, alert_severity: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALERT_SEVERITIES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_number">Account Number</Label>
                  <Input
                    id="account_number"
                    value={formData.account_number}
                    onChange={(e) =>
                      setFormData({ ...formData, account_number: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transaction_amount">Transaction Amount</Label>
                  <Input
                    id="transaction_amount"
                    type="number"
                    step="0.01"
                    value={formData.transaction_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, transaction_amount: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transaction_currency">Currency</Label>
                  <Input
                    id="transaction_currency"
                    value={formData.transaction_currency}
                    onChange={(e) =>
                      setFormData({ ...formData, transaction_currency: e.target.value })
                    }
                    placeholder="GBP"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transaction_date">Transaction Date</Label>
                  <Input
                    id="transaction_date"
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) =>
                      setFormData({ ...formData, transaction_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rule_triggered">Rule Triggered</Label>
                  <Input
                    id="rule_triggered"
                    value={formData.rule_triggered}
                    onChange={(e) =>
                      setFormData({ ...formData, rule_triggered: e.target.value })
                    }
                    placeholder="e.g., Rule TM-001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alert_description">Alert Description</Label>
                <Textarea
                  id="alert_description"
                  value={formData.alert_description}
                  onChange={(e) =>
                    setFormData({ ...formData, alert_description: e.target.value })
                  }
                  rows={2}
                />
              </div>

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
                  <Label htmlFor="assigned_date">Assigned Date</Label>
                  <Input
                    id="assigned_date"
                    type="date"
                    value={formData.assigned_date}
                    onChange={(e) =>
                      setFormData({ ...formData, assigned_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="investigation_start_date">Investigation Start</Label>
                  <Input
                    id="investigation_start_date"
                    type="date"
                    value={formData.investigation_start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, investigation_start_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investigation_end_date">Investigation End</Label>
                  <Input
                    id="investigation_end_date"
                    type="date"
                    value={formData.investigation_end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, investigation_end_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investigation_notes">Investigation Notes</Label>
                <Textarea
                  id="investigation_notes"
                  value={formData.investigation_notes}
                  onChange={(e) =>
                    setFormData({ ...formData, investigation_notes: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="investigation_outcome">Investigation Outcome</Label>
                  <Select
                    value={formData.investigation_outcome}
                    onValueChange={(value) =>
                      setFormData({ ...formData, investigation_outcome: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVESTIGATION_OUTCOMES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
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

              {formData.escalated && (
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="escalated_date">Escalated Date</Label>
                    <Input
                      id="escalated_date"
                      type="date"
                      value={formData.escalated_date}
                      onChange={(e) =>
                        setFormData({ ...formData, escalated_date: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sar_reference">SAR Reference</Label>
                  <Input
                    id="sar_reference"
                    value={formData.sar_reference}
                    onChange={(e) =>
                      setFormData({ ...formData, sar_reference: e.target.value })
                    }
                    placeholder="If SAR was raised"
                  />
                </div>
                {formData.sar_reference && (
                  <div className="space-y-2">
                    <Label htmlFor="sar_filed_date">SAR Filed Date</Label>
                    <Input
                      id="sar_filed_date"
                      type="date"
                      value={formData.sar_filed_date}
                      onChange={(e) =>
                        setFormData({ ...formData, sar_filed_date: e.target.value })
                      }
                    />
                  </div>
                )}
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
                {editingRecord ? "Update Alert" : "Create Alert"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
