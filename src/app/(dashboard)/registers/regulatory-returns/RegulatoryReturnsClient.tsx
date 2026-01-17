"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Plus, Search, Filter, Download, FileText, Clock, AlertTriangle, CheckCircle } from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface RegulatoryReturnsRecord {
  id: string;
  return_reference: string;
  return_name: string;
  regulator: string;
  frequency: string;
  due_date: string;
  owner: string;
  preparation_status: string;
  submission_status: string;
  late_submission: boolean;
  status: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

const REGULATORS = [
  { value: "fca", label: "FCA" },
  { value: "pra", label: "PRA" },
  { value: "boe", label: "Bank of England" },
  { value: "hmrc", label: "HMRC" },
  { value: "ico", label: "ICO" },
  { value: "nca", label: "NCA" },
  { value: "companies_house", label: "Companies House" },
  { value: "other", label: "Other" },
];

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semi_annual", label: "Semi-Annual" },
  { value: "annual", label: "Annual" },
  { value: "ad_hoc", label: "Ad-hoc" },
  { value: "event_driven", label: "Event Driven" },
];

const PREPARATION_STATUSES = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "under_review", label: "Under Review" },
  { value: "ready_for_submission", label: "Ready for Submission" },
  { value: "completed", label: "Completed" },
];

const SUBMISSION_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "submitted", label: "Submitted" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "resubmission_required", label: "Resubmission Required" },
];

const STATUSES = [
  { value: "upcoming", label: "Upcoming" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
];

const CHART_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6"];

export function RegulatoryReturnsClient() {
  const toast = useToast();
  const [records, setRecords] = useState<RegulatoryReturnsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRegulator, setFilterRegulator] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RegulatoryReturnsRecord | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [formData, setFormData] = useState({
    return_reference: "",
    return_name: "",
    regulator: "fca",
    frequency: "quarterly",
    due_date: new Date().toISOString().split("T")[0],
    owner: "",
    preparation_status: "not_started",
    submission_status: "pending",
    late_submission: false,
    status: "upcoming",
    notes: "",
  });

  const loadRecords = useCallback(async () => {
    try {
      const response = await fetch("/api/registers/regulatory-returns");
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
        ? `/api/registers/regulatory-returns/${editingRecord.id}`
        : "/api/registers/regulatory-returns";
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
    if (!confirm("Are you sure you want to delete this regulatory return record?")) return;
    try {
      const response = await fetch(`/api/registers/regulatory-returns/${id}`, {
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
      return_reference: "",
      return_name: "",
      regulator: "fca",
      frequency: "quarterly",
      due_date: new Date().toISOString().split("T")[0],
      owner: "",
      preparation_status: "not_started",
      submission_status: "pending",
      late_submission: false,
      status: "upcoming",
      notes: "",
    });
    setEditingRecord(null);
  };

  const openEditDialog = (record: RegulatoryReturnsRecord) => {
    setEditingRecord(record);
    setFormData({
      return_reference: record.return_reference,
      return_name: record.return_name,
      regulator: record.regulator,
      frequency: record.frequency,
      due_date: record.due_date ? record.due_date.split("T")[0] : "",
      owner: record.owner,
      preparation_status: record.preparation_status,
      submission_status: record.submission_status,
      late_submission: record.late_submission,
      status: record.status,
      notes: record.notes || "",
    });
    setIsDialogOpen(true);
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.return_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.return_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || record.status === filterStatus;
    const matchesRegulator = filterRegulator === "all" || record.regulator === filterRegulator;
    return matchesSearch && matchesStatus && matchesRegulator;
  });

  const {
    paginatedData,
    paginationProps,
  } = usePagination(filteredRecords, { initialLimit: 25 });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      upcoming: "outline",
      in_progress: "secondary",
      completed: "default",
      overdue: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.replace("_", " ")}</Badge>;
  };

  const getSubmissionStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-gray-100 text-gray-700",
      submitted: "bg-blue-100 text-blue-700",
      accepted: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      resubmission_required: "bg-orange-100 text-orange-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = [
      "Reference", "Return Name", "Regulator", "Frequency", "Due Date",
      "Owner", "Preparation Status", "Submission Status", "Late", "Status", "Notes"
    ];
    const rows = filteredRecords.map((r) => [
      r.return_reference,
      r.return_name,
      REGULATORS.find(reg => reg.value === r.regulator)?.label || r.regulator,
      FREQUENCIES.find(f => f.value === r.frequency)?.label || r.frequency,
      r.due_date ? new Date(r.due_date).toLocaleDateString() : "",
      r.owner,
      r.preparation_status,
      r.submission_status,
      r.late_submission ? "Yes" : "No",
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
    a.download = `regulatory-returns-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate stats
  const now = new Date();
  const stats = {
    total: records.length,
    upcoming: records.filter((r) => r.status === "upcoming").length,
    in_progress: records.filter((r) => r.status === "in_progress").length,
    overdue: records.filter((r) => r.status === "overdue" || (new Date(r.due_date) < now && r.submission_status !== "accepted")).length,
  };

  // Chart data
  const statusData = STATUSES.map((s) => ({
    name: s.label,
    value: records.filter((r) => r.status === s.value).length,
  })).filter((d) => d.value > 0);

  const regulatorData = REGULATORS.map((r) => ({
    name: r.label,
    count: records.filter((rec) => rec.regulator === r.value).length,
  })).filter((d) => d.count > 0);

  const upcomingDueData = (() => {
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sixtyDays = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    return [
      {
        name: "Overdue",
        count: records.filter((r) => new Date(r.due_date) < now && r.submission_status !== "accepted").length,
      },
      {
        name: "Next 30 Days",
        count: records.filter((r) => {
          const due = new Date(r.due_date);
          return due >= now && due <= thirtyDays;
        }).length,
      },
      {
        name: "30-60 Days",
        count: records.filter((r) => {
          const due = new Date(r.due_date);
          return due > thirtyDays && due <= sixtyDays;
        }).length,
      },
      {
        name: "60-90 Days",
        count: records.filter((r) => {
          const due = new Date(r.due_date);
          return due > sixtyDays && due <= ninetyDays;
        }).length,
      },
      {
        name: "90+ Days",
        count: records.filter((r) => new Date(r.due_date) > ninetyDays).length,
      },
    ];
  })();

  const monthlySubmissionsData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toLocaleDateString("en-US", { month: "short" });
    const monthRecords = records.filter((r) => {
      const recordDate = new Date(r.due_date);
      return (
        recordDate.getMonth() === date.getMonth() &&
        recordDate.getFullYear() === date.getFullYear()
      );
    });
    return {
      month: monthStr,
      total: monthRecords.length,
      submitted: monthRecords.filter((r) => r.submission_status === "submitted" || r.submission_status === "accepted").length,
    };
  }).reverse();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading regulatory returns records...</div>
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
            <h1 className="text-2xl font-bold text-slate-900">Regulatory Returns Register</h1>
            <p className="text-slate-500">
              Track regulatory return submissions and deadlines
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
            New Return
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
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-slate-500">Total Returns</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-slate-500">Upcoming</p>
                    <p className="text-2xl font-bold">{stats.upcoming}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-xs text-slate-500">In Progress</p>
                    <p className="text-2xl font-bold">{stats.in_progress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-xs text-slate-500">Overdue</p>
                    <p className="text-2xl font-bold">{stats.overdue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
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
                <CardTitle className="text-lg">Due Date Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={upcomingDueData}>
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
                <CardTitle className="text-lg">Returns by Regulator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regulatorData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Submissions Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlySubmissionsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" fill="#94a3b8" name="Total Due" />
                      <Bar dataKey="submitted" fill="#10b981" name="Submitted" />
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
                  placeholder="Search by name, reference, or owner..."
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
            <Select value={filterRegulator} onValueChange={setFilterRegulator}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Regulator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regulators</SelectItem>
                {REGULATORS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
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
                    <TableHead>Return Name</TableHead>
                    <TableHead>Regulator</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Submission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                        No regulatory return records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.return_reference}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.return_name}</p>
                            {record.late_submission && (
                              <Badge variant="destructive" className="text-xs mt-1">Late</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {REGULATORS.find((r) => r.value === record.regulator)?.label || record.regulator}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {FREQUENCIES.find((f) => f.value === record.frequency)?.label || record.frequency}
                        </TableCell>
                        <TableCell>
                          {record.due_date
                            ? new Date(record.due_date).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>{record.owner}</TableCell>
                        <TableCell>{getSubmissionStatusBadge(record.submission_status)}</TableCell>
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
              {editingRecord ? "Edit Regulatory Return" : "New Regulatory Return"}
            </DialogTitle>
            <DialogDescription>
              Record regulatory return details and submission information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="return_reference">Return Reference *</Label>
                  <Input
                    id="return_reference"
                    value={formData.return_reference}
                    onChange={(e) =>
                      setFormData({ ...formData, return_reference: e.target.value })
                    }
                    placeholder="REG-2024-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="return_name">Return Name *</Label>
                  <Input
                    id="return_name"
                    value={formData.return_name}
                    onChange={(e) =>
                      setFormData({ ...formData, return_name: e.target.value })
                    }
                    placeholder="FCA Gabriel Return"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="regulator">Regulator</Label>
                  <Select
                    value={formData.regulator}
                    onValueChange={(value) =>
                      setFormData({ ...formData, regulator: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REGULATORS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, frequency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner">Owner</Label>
                  <Input
                    id="owner"
                    value={formData.owner}
                    onChange={(e) =>
                      setFormData({ ...formData, owner: e.target.value })
                    }
                    placeholder="Compliance Team"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preparation_status">Preparation Status</Label>
                  <Select
                    value={formData.preparation_status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, preparation_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PREPARATION_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="submission_status">Submission Status</Label>
                  <Select
                    value={formData.submission_status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, submission_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBMISSION_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="late_submission"
                    checked={formData.late_submission}
                    onChange={(e) =>
                      setFormData({ ...formData, late_submission: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="late_submission">Late Submission</Label>
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
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Additional notes or comments..."
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
