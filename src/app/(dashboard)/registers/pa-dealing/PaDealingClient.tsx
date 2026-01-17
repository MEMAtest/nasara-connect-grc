"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Plus, Search, Filter, Download, Briefcase, Clock, CheckCircle, PlayCircle } from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface PaDealingRecord {
  id: string;
  request_reference: string;
  employee_name: string;
  employee_id?: string;
  request_type: string;
  instrument_type: string;
  instrument_name?: string;
  isin?: string;
  quantity?: number;
  estimated_value?: number;
  currency?: string;
  broker_account?: string;
  reason_for_trade?: string;
  request_date: string;
  pre_clearance_status: string;
  approved_by?: string;
  approval_date?: string;
  approval_conditions?: string;
  execution_date?: string;
  execution_price?: number;
  holding_period_end?: string;
  restricted_list_check: boolean;
  conflict_check: boolean;
  status: string;
  notes?: string;
  created_at: string;
}

const REQUEST_TYPES = [
  { value: "buy", label: "Buy" },
  { value: "sell", label: "Sell" },
  { value: "transfer", label: "Transfer" },
];

const INSTRUMENT_TYPES = [
  { value: "equity", label: "Equity" },
  { value: "bond", label: "Bond" },
  { value: "fund", label: "Fund" },
  { value: "etf", label: "ETF" },
  { value: "derivative", label: "Derivative" },
  { value: "crypto", label: "Crypto" },
  { value: "other", label: "Other" },
];

const PRE_CLEARANCE_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
];

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "executed", label: "Executed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "expired", label: "Expired" },
];

const CHART_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6"];

export function PaDealingClient() {
  const [records, setRecords] = useState<PaDealingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPreClearance, setFilterPreClearance] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PaDealingRecord | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [formData, setFormData] = useState({
    request_reference: "",
    employee_name: "",
    employee_id: "",
    request_type: "buy",
    instrument_type: "equity",
    instrument_name: "",
    isin: "",
    quantity: "",
    estimated_value: "",
    currency: "GBP",
    broker_account: "",
    reason_for_trade: "",
    request_date: new Date().toISOString().split("T")[0],
    pre_clearance_status: "pending",
    approved_by: "",
    approval_date: "",
    approval_conditions: "",
    execution_date: "",
    execution_price: "",
    holding_period_end: "",
    restricted_list_check: false,
    conflict_check: false,
    status: "pending",
    notes: "",
  });

  const loadRecords = useCallback(async () => {
    try {
      const response = await fetch("/api/registers/pa-dealing");
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
        ? `/api/registers/pa-dealing/${editingRecord.id}`
        : "/api/registers/pa-dealing";
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
    if (!confirm("Are you sure you want to delete this PA dealing request?")) return;
    try {
      const response = await fetch(`/api/registers/pa-dealing/${id}`, {
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
      request_reference: "",
      employee_name: "",
      employee_id: "",
      request_type: "buy",
      instrument_type: "equity",
      instrument_name: "",
      isin: "",
      quantity: "",
      estimated_value: "",
      currency: "GBP",
      broker_account: "",
      reason_for_trade: "",
      request_date: new Date().toISOString().split("T")[0],
      pre_clearance_status: "pending",
      approved_by: "",
      approval_date: "",
      approval_conditions: "",
      execution_date: "",
      execution_price: "",
      holding_period_end: "",
      restricted_list_check: false,
      conflict_check: false,
      status: "pending",
      notes: "",
    });
    setEditingRecord(null);
  };

  const openEditDialog = (record: PaDealingRecord) => {
    setEditingRecord(record);
    setFormData({
      request_reference: record.request_reference,
      employee_name: record.employee_name,
      employee_id: record.employee_id || "",
      request_type: record.request_type,
      instrument_type: record.instrument_type,
      instrument_name: record.instrument_name || "",
      isin: record.isin || "",
      quantity: record.quantity?.toString() || "",
      estimated_value: record.estimated_value?.toString() || "",
      currency: record.currency || "GBP",
      broker_account: record.broker_account || "",
      reason_for_trade: record.reason_for_trade || "",
      request_date: record.request_date ? record.request_date.split("T")[0] : "",
      pre_clearance_status: record.pre_clearance_status,
      approved_by: record.approved_by || "",
      approval_date: record.approval_date ? record.approval_date.split("T")[0] : "",
      approval_conditions: record.approval_conditions || "",
      execution_date: record.execution_date ? record.execution_date.split("T")[0] : "",
      execution_price: record.execution_price?.toString() || "",
      holding_period_end: record.holding_period_end ? record.holding_period_end.split("T")[0] : "",
      restricted_list_check: record.restricted_list_check,
      conflict_check: record.conflict_check,
      status: record.status,
      notes: record.notes || "",
    });
    setIsDialogOpen(true);
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.request_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.instrument_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = filterStatus === "all" || record.status === filterStatus;
    const matchesPreClearance = filterPreClearance === "all" || record.pre_clearance_status === filterPreClearance;
    return matchesSearch && matchesStatus && matchesPreClearance;
  });

  const {
    paginatedData,
    paginationProps,
  } = usePagination(filteredRecords, { initialLimit: 25 });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      executed: "default",
      cancelled: "destructive",
      expired: "outline",
    };
    const colors: Record<string, string> = {
      pending: "",
      approved: "bg-blue-500",
      executed: "bg-green-500",
      cancelled: "",
      expired: "",
    };
    return (
      <Badge variant={variants[status] || "secondary"} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPreClearanceBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      expired: "bg-gray-100 text-gray-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = [
      "Reference", "Employee Name", "Request Type", "Instrument Type", "Instrument Name",
      "Quantity", "Estimated Value", "Request Date", "Pre-Clearance Status", "Approved By",
      "Execution Date", "Status", "Notes"
    ];
    const rows = filteredRecords.map((r) => [
      r.request_reference,
      r.employee_name,
      r.request_type,
      r.instrument_type,
      r.instrument_name || "",
      r.quantity?.toString() || "",
      r.estimated_value?.toString() || "",
      r.request_date ? new Date(r.request_date).toLocaleDateString() : "",
      r.pre_clearance_status,
      r.approved_by || "",
      r.execution_date ? new Date(r.execution_date).toLocaleDateString() : "",
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
    a.download = `pa-dealing-log-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate stats
  const stats = {
    total: records.length,
    pending: records.filter((r) => r.status === "pending").length,
    approved: records.filter((r) => r.status === "approved").length,
    executed: records.filter((r) => r.status === "executed").length,
  };

  // Chart data
  const statusData = STATUSES.map((s) => ({
    name: s.label,
    value: records.filter((r) => r.status === s.value).length,
  })).filter((d) => d.value > 0);

  const requestTypeData = REQUEST_TYPES.map((t) => ({
    name: t.label,
    count: records.filter((r) => r.request_type === t.value).length,
  }));

  const instrumentTypeData = INSTRUMENT_TYPES.map((t) => ({
    name: t.label,
    count: records.filter((r) => r.instrument_type === t.value).length,
  })).filter((d) => d.count > 0);

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toLocaleDateString("en-US", { month: "short" });
    const monthRecords = records.filter((r) => {
      const recordDate = new Date(r.request_date);
      return (
        recordDate.getMonth() === date.getMonth() &&
        recordDate.getFullYear() === date.getFullYear()
      );
    });
    return {
      month: monthStr,
      requests: monthRecords.length,
      executed: monthRecords.filter((r) => r.status === "executed").length,
    };
  }).reverse();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading PA dealing records...</div>
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
            <h1 className="text-2xl font-bold text-slate-900">PA Dealing Log</h1>
            <p className="text-slate-500">
              Track personal account dealing requests and approvals
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
            New Request
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="records">All Records</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-slate-500">Total Requests</p>
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
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-slate-500">Approved</p>
                    <p className="text-2xl font-bold">{stats.approved}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-xs text-slate-500">Executed</p>
                    <p className="text-2xl font-bold">{stats.executed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Request Trend</CardTitle>
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
                      <Bar dataKey="requests" fill="#3b82f6" name="Requests" />
                      <Bar dataKey="executed" fill="#10b981" name="Executed" />
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
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {statusData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Requests by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={requestTypeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Instrument Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={instrumentTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        label={({ name, count }) => `${name}: ${count}`}
                      >
                        {instrumentTypeData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
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
                  placeholder="Search by name, reference, or instrument..."
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
            <Select value={filterPreClearance} onValueChange={setFilterPreClearance}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pre-Clearance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pre-Clearance</SelectItem>
                {PRE_CLEARANCE_STATUSES.map((s) => (
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
                    <TableHead>Employee</TableHead>
                    <TableHead>Request Type</TableHead>
                    <TableHead>Instrument</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Est. Value</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Pre-Clearance</TableHead>
                    <TableHead>Approved By</TableHead>
                    <TableHead>Execution Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-8 text-slate-500">
                        No PA dealing records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.request_reference}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.employee_name}</p>
                            {record.employee_id && (
                              <p className="text-xs text-slate-500">{record.employee_id}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {REQUEST_TYPES.find((t) => t.value === record.request_type)?.label || record.request_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {INSTRUMENT_TYPES.find((t) => t.value === record.instrument_type)?.label || record.instrument_type}
                            </p>
                            {record.instrument_name && (
                              <p className="text-xs text-slate-500">{record.instrument_name}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{record.quantity?.toLocaleString() || "-"}</TableCell>
                        <TableCell>
                          {record.estimated_value
                            ? `${record.currency || "GBP"} ${record.estimated_value.toLocaleString()}`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {record.request_date
                            ? new Date(record.request_date).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>{getPreClearanceBadge(record.pre_clearance_status)}</TableCell>
                        <TableCell>{record.approved_by || "-"}</TableCell>
                        <TableCell>
                          {record.execution_date
                            ? new Date(record.execution_date).toLocaleDateString()
                            : "-"}
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
              {editingRecord ? "Edit PA Dealing Request" : "New PA Dealing Request"}
            </DialogTitle>
            <DialogDescription>
              Record a personal account dealing request
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="request_reference">Request Reference *</Label>
                  <Input
                    id="request_reference"
                    value={formData.request_reference}
                    onChange={(e) =>
                      setFormData({ ...formData, request_reference: e.target.value })
                    }
                    placeholder="PA-2024-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="request_date">Request Date</Label>
                  <Input
                    id="request_date"
                    type="date"
                    value={formData.request_date}
                    onChange={(e) =>
                      setFormData({ ...formData, request_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_name">Employee Name *</Label>
                  <Input
                    id="employee_name"
                    value={formData.employee_name}
                    onChange={(e) =>
                      setFormData({ ...formData, employee_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee_id">Employee ID</Label>
                  <Input
                    id="employee_id"
                    value={formData.employee_id}
                    onChange={(e) =>
                      setFormData({ ...formData, employee_id: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="request_type">Request Type</Label>
                  <Select
                    value={formData.request_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, request_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REQUEST_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instrument_type">Instrument Type</Label>
                  <Select
                    value={formData.instrument_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, instrument_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INSTRUMENT_TYPES.map((t) => (
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
                  <Label htmlFor="instrument_name">Instrument Name</Label>
                  <Input
                    id="instrument_name"
                    value={formData.instrument_name}
                    onChange={(e) =>
                      setFormData({ ...formData, instrument_name: e.target.value })
                    }
                    placeholder="e.g., Apple Inc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isin">ISIN</Label>
                  <Input
                    id="isin"
                    value={formData.isin}
                    onChange={(e) =>
                      setFormData({ ...formData, isin: e.target.value })
                    }
                    placeholder="e.g., US0378331005"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_value">Estimated Value</Label>
                  <Input
                    id="estimated_value"
                    type="number"
                    step="0.01"
                    value={formData.estimated_value}
                    onChange={(e) =>
                      setFormData({ ...formData, estimated_value: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    placeholder="GBP"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="broker_account">Broker Account</Label>
                <Input
                  id="broker_account"
                  value={formData.broker_account}
                  onChange={(e) =>
                    setFormData({ ...formData, broker_account: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason_for_trade">Reason for Trade</Label>
                <Textarea
                  id="reason_for_trade"
                  value={formData.reason_for_trade}
                  onChange={(e) =>
                    setFormData({ ...formData, reason_for_trade: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pre_clearance_status">Pre-Clearance Status</Label>
                  <Select
                    value={formData.pre_clearance_status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, pre_clearance_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRE_CLEARANCE_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="approved_by">Approved By</Label>
                  <Input
                    id="approved_by"
                    value={formData.approved_by}
                    onChange={(e) =>
                      setFormData({ ...formData, approved_by: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="approval_date">Approval Date</Label>
                  <Input
                    id="approval_date"
                    type="date"
                    value={formData.approval_date}
                    onChange={(e) =>
                      setFormData({ ...formData, approval_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="execution_date">Execution Date</Label>
                  <Input
                    id="execution_date"
                    type="date"
                    value={formData.execution_date}
                    onChange={(e) =>
                      setFormData({ ...formData, execution_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="execution_price">Execution Price</Label>
                  <Input
                    id="execution_price"
                    type="number"
                    step="0.01"
                    value={formData.execution_price}
                    onChange={(e) =>
                      setFormData({ ...formData, execution_price: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="holding_period_end">Holding Period End</Label>
                  <Input
                    id="holding_period_end"
                    type="date"
                    value={formData.holding_period_end}
                    onChange={(e) =>
                      setFormData({ ...formData, holding_period_end: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="approval_conditions">Approval Conditions</Label>
                <Textarea
                  id="approval_conditions"
                  value={formData.approval_conditions}
                  onChange={(e) =>
                    setFormData({ ...formData, approval_conditions: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="restricted_list_check"
                    checked={formData.restricted_list_check}
                    onChange={(e) =>
                      setFormData({ ...formData, restricted_list_check: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="restricted_list_check">Restricted List Check</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="conflict_check"
                    checked={formData.conflict_check}
                    onChange={(e) =>
                      setFormData({ ...formData, conflict_check: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="conflict_check">Conflict Check</Label>
                </div>
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
