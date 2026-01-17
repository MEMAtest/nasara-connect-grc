"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Plus, Search, Filter, Download, Users, GraduationCap, CheckCircle, Clock, AlertTriangle } from "lucide-react";
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

interface TcRecordRecord {
  id: string;
  employee_reference: string;
  employee_name: string;
  employee_role: string;
  department: string;
  qualification_status: string;
  competency_status: string;
  supervision_level: string;
  cpd_hours_completed: number;
  cpd_hours_required: number;
  fit_proper_status: string;
  status: string;
  notes?: string;
  created_at: string;
}

const QUALIFICATION_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "qualified", label: "Qualified" },
  { value: "lapsed", label: "Lapsed" },
  { value: "exempt", label: "Exempt" },
];

const COMPETENCY_STATUSES = [
  { value: "not_assessed", label: "Not Assessed" },
  { value: "developing", label: "Developing" },
  { value: "competent", label: "Competent" },
  { value: "proficient", label: "Proficient" },
  { value: "needs_improvement", label: "Needs Improvement" },
];

const SUPERVISION_LEVELS = [
  { value: "none", label: "None Required" },
  { value: "light", label: "Light Touch" },
  { value: "standard", label: "Standard" },
  { value: "enhanced", label: "Enhanced" },
  { value: "close", label: "Close Supervision" },
];

const FIT_PROPER_STATUSES = [
  { value: "confirmed", label: "Confirmed" },
  { value: "pending_review", label: "Pending Review" },
  { value: "under_investigation", label: "Under Investigation" },
  { value: "not_fit", label: "Not Fit" },
];

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "on_leave", label: "On Leave" },
  { value: "terminated", label: "Terminated" },
  { value: "suspended", label: "Suspended" },
];

const DEPARTMENTS = [
  { value: "compliance", label: "Compliance" },
  { value: "operations", label: "Operations" },
  { value: "sales", label: "Sales" },
  { value: "finance", label: "Finance" },
  { value: "legal", label: "Legal" },
  { value: "risk", label: "Risk" },
  { value: "it", label: "IT" },
  { value: "hr", label: "HR" },
  { value: "other", label: "Other" },
];

const CHART_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6"];

export function TcRecordClient() {
  const toast = useToast();
  const [records, setRecords] = useState<TcRecordRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCompetency, setFilterCompetency] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TcRecordRecord | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [formData, setFormData] = useState({
    employee_reference: "",
    employee_name: "",
    employee_role: "",
    department: "compliance",
    qualification_status: "pending",
    competency_status: "not_assessed",
    supervision_level: "standard",
    cpd_hours_completed: 0,
    cpd_hours_required: 35,
    fit_proper_status: "confirmed",
    status: "active",
    notes: "",
  });

  const loadRecords = useCallback(async () => {
    try {
      const response = await fetch("/api/registers/tc-record");
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
        ? `/api/registers/tc-record/${editingRecord.id}`
        : "/api/registers/tc-record";
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
    if (!confirm("Are you sure you want to delete this T&C record?")) return;
    try {
      const response = await fetch(`/api/registers/tc-record/${id}`, {
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
      employee_reference: "",
      employee_name: "",
      employee_role: "",
      department: "compliance",
      qualification_status: "pending",
      competency_status: "not_assessed",
      supervision_level: "standard",
      cpd_hours_completed: 0,
      cpd_hours_required: 35,
      fit_proper_status: "confirmed",
      status: "active",
      notes: "",
    });
    setEditingRecord(null);
  };

  const openEditDialog = (record: TcRecordRecord) => {
    setEditingRecord(record);
    setFormData({
      employee_reference: record.employee_reference,
      employee_name: record.employee_name,
      employee_role: record.employee_role,
      department: record.department,
      qualification_status: record.qualification_status,
      competency_status: record.competency_status,
      supervision_level: record.supervision_level,
      cpd_hours_completed: record.cpd_hours_completed,
      cpd_hours_required: record.cpd_hours_required,
      fit_proper_status: record.fit_proper_status,
      status: record.status,
      notes: record.notes || "",
    });
    setIsDialogOpen(true);
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employee_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employee_role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || record.status === filterStatus;
    const matchesCompetency = filterCompetency === "all" || record.competency_status === filterCompetency;
    return matchesSearch && matchesStatus && matchesCompetency;
  });

  const {
    paginatedData,
    paginationProps,
  } = usePagination(filteredRecords, { initialLimit: 25 });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      on_leave: "outline",
      terminated: "destructive",
      suspended: "secondary",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.replace("_", " ")}</Badge>;
  };

  const getCompetencyBadge = (competency: string) => {
    const colors: Record<string, string> = {
      not_assessed: "bg-gray-100 text-gray-700",
      developing: "bg-blue-100 text-blue-700",
      competent: "bg-green-100 text-green-700",
      proficient: "bg-purple-100 text-purple-700",
      needs_improvement: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[competency] || colors.not_assessed}`}>
        {competency.replace(/_/g, " ")}
      </span>
    );
  };

  const getQualificationBadge = (qualification: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      in_progress: "bg-blue-100 text-blue-700",
      qualified: "bg-green-100 text-green-700",
      lapsed: "bg-red-100 text-red-700",
      exempt: "bg-gray-100 text-gray-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[qualification] || colors.pending}`}>
        {qualification.replace(/_/g, " ")}
      </span>
    );
  };

  const getCpdProgress = (completed: number, required: number) => {
    const percentage = required > 0 ? Math.min((completed / required) * 100, 100) : 0;
    const color = percentage >= 100 ? "bg-green-500" : percentage >= 50 ? "bg-yellow-500" : "bg-red-500";
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 h-2 bg-gray-200 rounded-full">
          <div className={`h-2 ${color} rounded-full`} style={{ width: `${percentage}%` }} />
        </div>
        <span className="text-xs text-slate-500">{completed}/{required}</span>
      </div>
    );
  };

  const exportToCSV = () => {
    const headers = [
      "Reference", "Employee Name", "Role", "Department", "Qualification Status",
      "Competency Status", "Supervision Level", "CPD Completed", "CPD Required",
      "Fit & Proper Status", "Status", "Notes"
    ];
    const rows = filteredRecords.map((r) => [
      r.employee_reference,
      r.employee_name,
      r.employee_role,
      r.department,
      r.qualification_status,
      r.competency_status,
      r.supervision_level,
      r.cpd_hours_completed.toString(),
      r.cpd_hours_required.toString(),
      r.fit_proper_status,
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
    a.download = `tc-record-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate stats
  const stats = {
    total: records.length,
    active: records.filter((r) => r.status === "active").length,
    competent: records.filter((r) => r.competency_status === "competent" || r.competency_status === "proficient").length,
    pending_qualification: records.filter((r) => r.qualification_status === "pending" || r.qualification_status === "in_progress").length,
  };

  // Chart data
  const competencyData = COMPETENCY_STATUSES.map((c) => ({
    name: c.label,
    value: records.filter((r) => r.competency_status === c.value).length,
  })).filter((d) => d.value > 0);

  const qualificationData = QUALIFICATION_STATUSES.map((q) => ({
    name: q.label,
    value: records.filter((r) => r.qualification_status === q.value).length,
  })).filter((d) => d.value > 0);

  const departmentData = DEPARTMENTS.map((d) => ({
    name: d.label,
    count: records.filter((r) => r.department === d.value).length,
  })).filter((d) => d.count > 0);

  const supervisionData = SUPERVISION_LEVELS.map((s) => ({
    name: s.label,
    count: records.filter((r) => r.supervision_level === s.value).length,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading T&C records...</div>
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
            <h1 className="text-2xl font-bold text-slate-900">Training & Competence Record</h1>
            <p className="text-slate-500">
              Track employee training, competence, and CPD requirements
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

        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-slate-500">Total Employees</p>
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
                  <GraduationCap className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-slate-500">Competent</p>
                    <p className="text-2xl font-bold">{stats.competent}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-xs text-slate-500">Pending Qualification</p>
                    <p className="text-2xl font-bold">{stats.pending_qualification}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Competency Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={competencyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {competencyData.map((_, index) => (
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
                <CardTitle className="text-lg">Qualification Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={qualificationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {qualificationData.map((_, index) => (
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
                <CardTitle className="text-lg">Employees by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData} layout="vertical">
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Supervision Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={supervisionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" />
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
                  placeholder="Search by name, reference, role, or department..."
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
            <Select value={filterCompetency} onValueChange={setFilterCompetency}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Competency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Competency</SelectItem>
                {COMPETENCY_STATUSES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
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
                    <TableHead>Department</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>Competency</TableHead>
                    <TableHead>CPD Progress</TableHead>
                    <TableHead>Supervision</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                        No T&C records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.employee_reference}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.employee_name}</p>
                            <p className="text-xs text-slate-500">{record.employee_role}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {DEPARTMENTS.find((d) => d.value === record.department)?.label || record.department}
                          </Badge>
                        </TableCell>
                        <TableCell>{getQualificationBadge(record.qualification_status)}</TableCell>
                        <TableCell>{getCompetencyBadge(record.competency_status)}</TableCell>
                        <TableCell>{getCpdProgress(record.cpd_hours_completed, record.cpd_hours_required)}</TableCell>
                        <TableCell>
                          <span className="text-xs">
                            {SUPERVISION_LEVELS.find((s) => s.value === record.supervision_level)?.label || record.supervision_level}
                          </span>
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
              {editingRecord ? "Edit T&C Record" : "New T&C Record"}
            </DialogTitle>
            <DialogDescription>
              Record the training and competence details for an employee
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_reference">Employee Reference *</Label>
                  <Input
                    id="employee_reference"
                    value={formData.employee_reference}
                    onChange={(e) =>
                      setFormData({ ...formData, employee_reference: e.target.value })
                    }
                    placeholder="EMP-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee_name">Employee Name *</Label>
                  <Input
                    id="employee_name"
                    value={formData.employee_name}
                    onChange={(e) =>
                      setFormData({ ...formData, employee_name: e.target.value })
                    }
                    placeholder="John Smith"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_role">Role *</Label>
                  <Input
                    id="employee_role"
                    value={formData.employee_role}
                    onChange={(e) =>
                      setFormData({ ...formData, employee_role: e.target.value })
                    }
                    placeholder="Compliance Officer"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      setFormData({ ...formData, department: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qualification_status">Qualification Status</Label>
                  <Select
                    value={formData.qualification_status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, qualification_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUALIFICATION_STATUSES.map((q) => (
                        <SelectItem key={q.value} value={q.value}>
                          {q.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="competency_status">Competency Status</Label>
                  <Select
                    value={formData.competency_status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, competency_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPETENCY_STATUSES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supervision_level">Supervision Level</Label>
                  <Select
                    value={formData.supervision_level}
                    onValueChange={(value) =>
                      setFormData({ ...formData, supervision_level: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPERVISION_LEVELS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fit_proper_status">Fit & Proper Status</Label>
                  <Select
                    value={formData.fit_proper_status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, fit_proper_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIT_PROPER_STATUSES.map((f) => (
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
                  <Label htmlFor="cpd_hours_completed">CPD Hours Completed</Label>
                  <Input
                    id="cpd_hours_completed"
                    type="number"
                    min="0"
                    value={formData.cpd_hours_completed}
                    onChange={(e) =>
                      setFormData({ ...formData, cpd_hours_completed: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpd_hours_required">CPD Hours Required</Label>
                  <Input
                    id="cpd_hours_required"
                    type="number"
                    min="0"
                    value={formData.cpd_hours_required}
                    onChange={(e) =>
                      setFormData({ ...formData, cpd_hours_required: parseInt(e.target.value) || 0 })
                    }
                  />
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
                  rows={3}
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
