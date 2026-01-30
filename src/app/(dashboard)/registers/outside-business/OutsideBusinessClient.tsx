"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft, Plus, Search, Filter, Download, Briefcase, AlertTriangle, CheckCircle, Clock } from "lucide-react";
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

interface OutsideBusinessRecord {
  id: string;
  declaration_reference: string;
  employee_name: string;
  employee_id?: string;
  employee_department?: string;
  employee_role?: string;
  interest_type: string;
  organization_name: string;
  organization_type?: string;
  organization_sector?: string;
  role_held?: string;
  is_remunerated: boolean;
  remuneration_details?: string;
  time_commitment?: string;
  start_date?: string;
  end_date?: string;
  conflict_assessment?: string;
  potential_conflicts?: string;
  mitigating_controls?: string;
  declaration_date: string;
  reviewed_by?: string;
  review_date?: string;
  approval_status: string;
  approved_by?: string;
  approval_date?: string;
  approval_conditions?: string;
  next_review_date?: string;
  status: string;
  ceased_date?: string;
  ceased_reason?: string;
  notes?: string;
  created_at: string;
}

const INTEREST_TYPES = [
  { value: "directorship", label: "Directorship" },
  { value: "employment", label: "Employment" },
  { value: "consultancy", label: "Consultancy" },
  { value: "investment", label: "Investment" },
  { value: "charity", label: "Charity/Non-Profit" },
  { value: "other", label: "Other" },
];

const APPROVAL_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "conditional", label: "Conditional" },
];

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "ceased", label: "Ceased" },
  { value: "withdrawn", label: "Withdrawn" },
];

const CHART_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6", "#ec4899"];

export function OutsideBusinessClient() {
  const [records, setRecords] = useState<OutsideBusinessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterApprovalStatus, setFilterApprovalStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<OutsideBusinessRecord | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [monthFilter, setMonthFilter] = useState<{ key: string; label: string } | null>(null);

  const [formData, setFormData] = useState({
    declaration_reference: "",
    employee_name: "",
    employee_id: "",
    employee_department: "",
    employee_role: "",
    interest_type: "directorship",
    organization_name: "",
    organization_type: "",
    organization_sector: "",
    role_held: "",
    is_remunerated: false,
    remuneration_details: "",
    time_commitment: "",
    start_date: "",
    end_date: "",
    conflict_assessment: "",
    potential_conflicts: "",
    mitigating_controls: "",
    declaration_date: new Date().toISOString().split("T")[0],
    reviewed_by: "",
    review_date: "",
    approval_status: "pending",
    approved_by: "",
    approval_date: "",
    approval_conditions: "",
    next_review_date: "",
    status: "active",
    ceased_date: "",
    ceased_reason: "",
    notes: "",
  });

  const loadRecords = useCallback(async () => {
    try {
      const response = await fetch("/api/registers/outside-business");
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
        ? `/api/registers/outside-business/${editingRecord.id}`
        : "/api/registers/outside-business";
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
    if (!confirm("Are you sure you want to delete this outside business interest record?")) return;
    try {
      const response = await fetch(`/api/registers/outside-business/${id}`, {
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
      declaration_reference: "",
      employee_name: "",
      employee_id: "",
      employee_department: "",
      employee_role: "",
      interest_type: "directorship",
      organization_name: "",
      organization_type: "",
      organization_sector: "",
      role_held: "",
      is_remunerated: false,
      remuneration_details: "",
      time_commitment: "",
      start_date: "",
      end_date: "",
      conflict_assessment: "",
      potential_conflicts: "",
      mitigating_controls: "",
      declaration_date: new Date().toISOString().split("T")[0],
      reviewed_by: "",
      review_date: "",
      approval_status: "pending",
      approved_by: "",
      approval_date: "",
      approval_conditions: "",
      next_review_date: "",
      status: "active",
      ceased_date: "",
      ceased_reason: "",
      notes: "",
    });
    setEditingRecord(null);
  };

  const openEditDialog = (record: OutsideBusinessRecord) => {
    setEditingRecord(record);
    setFormData({
      declaration_reference: record.declaration_reference,
      employee_name: record.employee_name,
      employee_id: record.employee_id || "",
      employee_department: record.employee_department || "",
      employee_role: record.employee_role || "",
      interest_type: record.interest_type,
      organization_name: record.organization_name,
      organization_type: record.organization_type || "",
      organization_sector: record.organization_sector || "",
      role_held: record.role_held || "",
      is_remunerated: record.is_remunerated,
      remuneration_details: record.remuneration_details || "",
      time_commitment: record.time_commitment || "",
      start_date: record.start_date ? record.start_date.split("T")[0] : "",
      end_date: record.end_date ? record.end_date.split("T")[0] : "",
      conflict_assessment: record.conflict_assessment || "",
      potential_conflicts: record.potential_conflicts || "",
      mitigating_controls: record.mitigating_controls || "",
      declaration_date: record.declaration_date ? record.declaration_date.split("T")[0] : "",
      reviewed_by: record.reviewed_by || "",
      review_date: record.review_date ? record.review_date.split("T")[0] : "",
      approval_status: record.approval_status,
      approved_by: record.approved_by || "",
      approval_date: record.approval_date ? record.approval_date.split("T")[0] : "",
      approval_conditions: record.approval_conditions || "",
      next_review_date: record.next_review_date ? record.next_review_date.split("T")[0] : "",
      status: record.status,
      ceased_date: record.ceased_date ? record.ceased_date.split("T")[0] : "",
      ceased_reason: record.ceased_reason || "",
      notes: record.notes || "",
    });
    setIsDialogOpen(true);
  };

  const baseFilteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const matchesSearch =
          record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.declaration_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.organization_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || record.status === filterStatus;
        const matchesApprovalStatus = filterApprovalStatus === "all" || record.approval_status === filterApprovalStatus;
        return matchesSearch && matchesStatus && matchesApprovalStatus;
      }),
    [records, searchTerm, filterStatus, filterApprovalStatus]
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
      active: "default",
      ceased: "secondary",
      withdrawn: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getApprovalStatusBadge = (approvalStatus: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      conditional: "bg-blue-100 text-blue-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[approvalStatus] || colors.pending}`}>
        {approvalStatus}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = [
      "Reference", "Employee Name", "Interest Type", "Organization Name", "Role Held",
      "Remunerated", "Conflict Identified", "Approval Status", "Status", "Notes"
    ];
    const rows = filteredRecords.map((r) => [
      r.declaration_reference,
      r.employee_name,
      r.interest_type,
      r.organization_name,
      r.role_held || "",
      r.is_remunerated ? "Yes" : "No",
      r.potential_conflicts ? "Yes" : "No",
      r.approval_status,
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
    a.download = `outside-business-interests-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate stats
  const stats = {
    total: filteredRecords.length,
    active: filteredRecords.filter((r) => r.status === "active").length,
    pendingApproval: filteredRecords.filter((r) => r.approval_status === "pending").length,
    conflicts: filteredRecords.filter((r) => r.potential_conflicts && r.potential_conflicts.trim() !== "").length,
  };

  // Chart data
  const interestTypeData = INTEREST_TYPES.map((t) => ({
    name: t.label,
    value: filteredRecords.filter((r) => r.interest_type === t.value).length,
  })).filter((d) => d.value > 0);

  const approvalStatusData = APPROVAL_STATUSES.map((s) => ({
    name: s.label,
    count: filteredRecords.filter((r) => r.approval_status === s.value).length,
  }));

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
          declarations: monthRecords.length,
          approved: monthRecords.filter((r) => r.approval_status === "approved").length,
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
        <div className="text-slate-500">Loading outside business interest records...</div>
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
            <h1 className="text-2xl font-bold text-slate-900">Outside Business Interests Register</h1>
            <p className="text-slate-500">
              Track employee outside business interests and conflicts of interest
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
            New Declaration
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
                  <Briefcase className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-slate-500">Total Declarations</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-xs text-slate-500">Active</p>
                    <p className="text-2xl font-bold">{stats.active}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-xs text-slate-500">Pending Approval</p>
                    <p className="text-2xl font-bold">{stats.pendingApproval}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-xs text-slate-500">Conflicts Identified</p>
                    <p className="text-2xl font-bold">{stats.conflicts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Declaration Trend</CardTitle>
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
                      <Bar dataKey="declarations" fill="#3b82f6" name="Declarations" onClick={(data) => handleMonthClick(data?.payload)} />
                      <Bar dataKey="approved" fill="#10b981" name="Approved" onClick={(data) => handleMonthClick(data?.payload)} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interest Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={interestTypeData}
                      layout="vertical"
                      margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={140} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                        {interestTypeData.map((_, index) => (
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
                <CardTitle className="text-lg">Approval Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={approvalStatusData} layout="vertical">
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
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, reference, or organization..."
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
            <Select value={filterApprovalStatus} onValueChange={setFilterApprovalStatus}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Approval Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Approvals</SelectItem>
                {APPROVAL_STATUSES.map((s) => (
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
                    <TableHead>Interest Type</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Role Held</TableHead>
                    <TableHead>Remunerated</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                        No outside business interest records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.declaration_reference}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.employee_name}</p>
                            <p className="text-xs text-slate-500">{record.employee_department}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {INTEREST_TYPES.find((t) => t.value === record.interest_type)?.label || record.interest_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.organization_name}</p>
                            <p className="text-xs text-slate-500">{record.organization_sector}</p>
                          </div>
                        </TableCell>
                        <TableCell>{record.role_held || "-"}</TableCell>
                        <TableCell>
                          {record.is_remunerated ? (
                            <Badge variant="default">Yes</Badge>
                          ) : (
                            <Badge variant="secondary">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>{getApprovalStatusBadge(record.approval_status)}</TableCell>
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
              {editingRecord ? "Edit Declaration" : "New Outside Business Interest Declaration"}
            </DialogTitle>
            <DialogDescription>
              Record details of an outside business interest or activity
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="declaration_reference">Declaration Reference *</Label>
                  <Input
                    id="declaration_reference"
                    value={formData.declaration_reference}
                    onChange={(e) =>
                      setFormData({ ...formData, declaration_reference: e.target.value })
                    }
                    placeholder="OBI-2024-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="declaration_date">Declaration Date</Label>
                  <Input
                    id="declaration_date"
                    type="date"
                    value={formData.declaration_date}
                    onChange={(e) =>
                      setFormData({ ...formData, declaration_date: e.target.value })
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
                  <Label htmlFor="employee_department">Department</Label>
                  <Input
                    id="employee_department"
                    value={formData.employee_department}
                    onChange={(e) =>
                      setFormData({ ...formData, employee_department: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee_role">Role</Label>
                  <Input
                    id="employee_role"
                    value={formData.employee_role}
                    onChange={(e) =>
                      setFormData({ ...formData, employee_role: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interest_type">Interest Type *</Label>
                  <Select
                    value={formData.interest_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, interest_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTEREST_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization_name">Organization Name *</Label>
                  <Input
                    id="organization_name"
                    value={formData.organization_name}
                    onChange={(e) =>
                      setFormData({ ...formData, organization_name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organization_type">Organization Type</Label>
                  <Input
                    id="organization_type"
                    value={formData.organization_type}
                    onChange={(e) =>
                      setFormData({ ...formData, organization_type: e.target.value })
                    }
                    placeholder="e.g., Private Company, Charity"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization_sector">Sector</Label>
                  <Input
                    id="organization_sector"
                    value={formData.organization_sector}
                    onChange={(e) =>
                      setFormData({ ...formData, organization_sector: e.target.value })
                    }
                    placeholder="e.g., Financial Services, Technology"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role_held">Role Held</Label>
                  <Input
                    id="role_held"
                    value={formData.role_held}
                    onChange={(e) =>
                      setFormData({ ...formData, role_held: e.target.value })
                    }
                    placeholder="e.g., Director, Consultant"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time_commitment">Time Commitment</Label>
                  <Input
                    id="time_commitment"
                    value={formData.time_commitment}
                    onChange={(e) =>
                      setFormData({ ...formData, time_commitment: e.target.value })
                    }
                    placeholder="e.g., 5 hours/week"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_remunerated"
                  checked={formData.is_remunerated}
                  onChange={(e) =>
                    setFormData({ ...formData, is_remunerated: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="is_remunerated">Is this interest remunerated?</Label>
              </div>

              {formData.is_remunerated && (
                <div className="space-y-2">
                  <Label htmlFor="remuneration_details">Remuneration Details</Label>
                  <Textarea
                    id="remuneration_details"
                    value={formData.remuneration_details}
                    onChange={(e) =>
                      setFormData({ ...formData, remuneration_details: e.target.value })
                    }
                    rows={2}
                    placeholder="Describe compensation arrangements"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="potential_conflicts">Potential Conflicts</Label>
                <Textarea
                  id="potential_conflicts"
                  value={formData.potential_conflicts}
                  onChange={(e) =>
                    setFormData({ ...formData, potential_conflicts: e.target.value })
                  }
                  rows={2}
                  placeholder="Describe any potential conflicts of interest"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mitigating_controls">Mitigating Controls</Label>
                <Textarea
                  id="mitigating_controls"
                  value={formData.mitigating_controls}
                  onChange={(e) =>
                    setFormData({ ...formData, mitigating_controls: e.target.value })
                  }
                  rows={2}
                  placeholder="Describe controls to mitigate conflicts"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="approval_status">Approval Status</Label>
                  <Select
                    value={formData.approval_status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, approval_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {APPROVAL_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
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

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              {formData.approval_status === "conditional" && (
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
              )}

              <div className="space-y-2">
                <Label htmlFor="next_review_date">Next Review Date</Label>
                <Input
                  id="next_review_date"
                  type="date"
                  value={formData.next_review_date}
                  onChange={(e) =>
                    setFormData({ ...formData, next_review_date: e.target.value })
                  }
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
