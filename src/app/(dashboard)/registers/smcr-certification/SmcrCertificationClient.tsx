"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Plus, Search, Filter, Download, UserCheck, Clock, CheckCircle, AlertTriangle } from "lucide-react";
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

interface SmcrCertificationRecord {
  id: string;
  employee_reference: string;
  employee_name: string;
  certification_function: string;
  department: string;
  annual_assessment_due: string;
  assessment_outcome: string;
  fit_proper_confirmed: boolean;
  conduct_rules_training: boolean;
  certification_status: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

const CERTIFICATION_FUNCTIONS = [
  { value: "cass_oversight", label: "CASS Oversight" },
  { value: "benchmark_submission", label: "Benchmark Submission" },
  { value: "benchmark_administration", label: "Benchmark Administration" },
  { value: "significant_management", label: "Significant Management" },
  { value: "proprietary_trader", label: "Proprietary Trader" },
  { value: "algorithmic_trading", label: "Algorithmic Trading" },
  { value: "material_risk_taker", label: "Material Risk Taker" },
  { value: "client_dealing", label: "Client Dealing" },
  { value: "other", label: "Other" },
];

const DEPARTMENTS = [
  { value: "compliance", label: "Compliance" },
  { value: "risk", label: "Risk" },
  { value: "operations", label: "Operations" },
  { value: "finance", label: "Finance" },
  { value: "trading", label: "Trading" },
  { value: "sales", label: "Sales" },
  { value: "technology", label: "Technology" },
  { value: "legal", label: "Legal" },
  { value: "hr", label: "HR" },
  { value: "other", label: "Other" },
];

const ASSESSMENT_OUTCOMES = [
  { value: "passed", label: "Passed" },
  { value: "failed", label: "Failed" },
  { value: "pending", label: "Pending" },
  { value: "deferred", label: "Deferred" },
  { value: "not_applicable", label: "Not Applicable" },
];

const CERTIFICATION_STATUSES = [
  { value: "certified", label: "Certified" },
  { value: "pending_assessment", label: "Pending Assessment" },
  { value: "expired", label: "Expired" },
  { value: "revoked", label: "Revoked" },
  { value: "suspended", label: "Suspended" },
];

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under Review" },
];

const CHART_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6"];

export function SmcrCertificationClient() {
  const toast = useToast();
  const [records, setRecords] = useState<SmcrCertificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCertificationStatus, setFilterCertificationStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SmcrCertificationRecord | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [formData, setFormData] = useState({
    employee_reference: "",
    employee_name: "",
    certification_function: "significant_management",
    department: "compliance",
    annual_assessment_due: new Date().toISOString().split("T")[0],
    assessment_outcome: "pending",
    fit_proper_confirmed: false,
    conduct_rules_training: false,
    certification_status: "pending_assessment",
    status: "active",
    notes: "",
  });

  const loadRecords = useCallback(async () => {
    try {
      const response = await fetch("/api/registers/smcr-certification");
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
        ? `/api/registers/smcr-certification/${editingRecord.id}`
        : "/api/registers/smcr-certification";
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
    if (!confirm("Are you sure you want to delete this certification record?")) return;
    try {
      const response = await fetch(`/api/registers/smcr-certification/${id}`, {
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
      certification_function: "significant_management",
      department: "compliance",
      annual_assessment_due: new Date().toISOString().split("T")[0],
      assessment_outcome: "pending",
      fit_proper_confirmed: false,
      conduct_rules_training: false,
      certification_status: "pending_assessment",
      status: "active",
      notes: "",
    });
    setEditingRecord(null);
  };

  const openEditDialog = (record: SmcrCertificationRecord) => {
    setEditingRecord(record);
    setFormData({
      employee_reference: record.employee_reference,
      employee_name: record.employee_name,
      certification_function: record.certification_function,
      department: record.department,
      annual_assessment_due: record.annual_assessment_due ? record.annual_assessment_due.split("T")[0] : "",
      assessment_outcome: record.assessment_outcome,
      fit_proper_confirmed: record.fit_proper_confirmed,
      conduct_rules_training: record.conduct_rules_training,
      certification_status: record.certification_status,
      status: record.status,
      notes: record.notes || "",
    });
    setIsDialogOpen(true);
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employee_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || record.status === filterStatus;
    const matchesCertStatus = filterCertificationStatus === "all" || record.certification_status === filterCertificationStatus;
    return matchesSearch && matchesStatus && matchesCertStatus;
  });

  const {
    paginatedData,
    paginationProps,
  } = usePagination(filteredRecords, { initialLimit: 25 });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      inactive: "secondary",
      pending: "outline",
      under_review: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.replace("_", " ")}</Badge>;
  };

  const getCertificationStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      certified: "bg-green-100 text-green-700",
      pending_assessment: "bg-yellow-100 text-yellow-700",
      expired: "bg-red-100 text-red-700",
      revoked: "bg-red-200 text-red-800",
      suspended: "bg-orange-100 text-orange-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending_assessment}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = [
      "Employee Reference", "Employee Name", "Certification Function", "Department",
      "Assessment Due", "Assessment Outcome", "F&P Confirmed", "Conduct Rules Training",
      "Certification Status", "Status", "Notes"
    ];
    const rows = filteredRecords.map((r) => [
      r.employee_reference,
      r.employee_name,
      CERTIFICATION_FUNCTIONS.find(f => f.value === r.certification_function)?.label || r.certification_function,
      DEPARTMENTS.find(d => d.value === r.department)?.label || r.department,
      r.annual_assessment_due ? new Date(r.annual_assessment_due).toLocaleDateString() : "",
      r.assessment_outcome,
      r.fit_proper_confirmed ? "Yes" : "No",
      r.conduct_rules_training ? "Yes" : "No",
      r.certification_status,
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
    a.download = `smcr-certification-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate stats
  const stats = {
    total: records.length,
    active: records.filter((r) => r.status === "active").length,
    certified: records.filter((r) => r.certification_status === "certified").length,
    pending_assessment: records.filter((r) => r.certification_status === "pending_assessment").length,
  };

  // Chart data
  const certificationStatusData = CERTIFICATION_STATUSES.map((s) => ({
    name: s.label,
    value: records.filter((r) => r.certification_status === s.value).length,
  })).filter((d) => d.value > 0);

  const departmentData = DEPARTMENTS.map((d) => ({
    name: d.label,
    count: records.filter((r) => r.department === d.value).length,
  })).filter((d) => d.count > 0);

  const assessmentDueData = (() => {
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sixtyDays = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    return [
      {
        name: "Overdue",
        count: records.filter((r) => new Date(r.annual_assessment_due) < now).length,
      },
      {
        name: "Next 30 Days",
        count: records.filter((r) => {
          const due = new Date(r.annual_assessment_due);
          return due >= now && due <= thirtyDays;
        }).length,
      },
      {
        name: "30-60 Days",
        count: records.filter((r) => {
          const due = new Date(r.annual_assessment_due);
          return due > thirtyDays && due <= sixtyDays;
        }).length,
      },
      {
        name: "60-90 Days",
        count: records.filter((r) => {
          const due = new Date(r.annual_assessment_due);
          return due > sixtyDays && due <= ninetyDays;
        }).length,
      },
      {
        name: "90+ Days",
        count: records.filter((r) => new Date(r.annual_assessment_due) > ninetyDays).length,
      },
    ];
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading SM&CR certification records...</div>
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
            <h1 className="text-2xl font-bold text-slate-900">SM&CR Certification Register</h1>
            <p className="text-slate-500">
              Track certification assessments and fitness & propriety
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
            New Certification
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
                  <UserCheck className="h-5 w-5 text-blue-500" />
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
                  <UserCheck className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-xs text-slate-500">Certified</p>
                    <p className="text-2xl font-bold">{stats.certified}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-xs text-slate-500">Pending Assessment</p>
                    <p className="text-2xl font-bold">{stats.pending_assessment}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Certification Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={certificationStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {certificationStatusData.map((_, index) => (
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
                <CardTitle className="text-lg">Assessments Due Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={assessmentDueData}>
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

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Certifications by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3b82f6" name="Employees" />
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
                  placeholder="Search by name, reference, or department..."
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
            <Select value={filterCertificationStatus} onValueChange={setFilterCertificationStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Certification Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cert. Statuses</SelectItem>
                {CERTIFICATION_STATUSES.map((s) => (
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
                    <TableHead>Function</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Assessment Due</TableHead>
                    <TableHead>F&P</TableHead>
                    <TableHead>Cert. Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                        No certification records found
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
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {CERTIFICATION_FUNCTIONS.find((f) => f.value === record.certification_function)?.label || record.certification_function}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {DEPARTMENTS.find((d) => d.value === record.department)?.label || record.department}
                        </TableCell>
                        <TableCell>
                          {record.annual_assessment_due
                            ? new Date(record.annual_assessment_due).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {record.fit_proper_confirmed ? (
                            <Badge variant="default" className="bg-green-500">Yes</Badge>
                          ) : (
                            <Badge variant="secondary">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>{getCertificationStatusBadge(record.certification_status)}</TableCell>
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
              {editingRecord ? "Edit Certification Record" : "New SM&CR Certification"}
            </DialogTitle>
            <DialogDescription>
              Record certification details and assessment information
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
                  <Label htmlFor="certification_function">Certification Function</Label>
                  <Select
                    value={formData.certification_function}
                    onValueChange={(value) =>
                      setFormData({ ...formData, certification_function: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CERTIFICATION_FUNCTIONS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="annual_assessment_due">Annual Assessment Due</Label>
                  <Input
                    id="annual_assessment_due"
                    type="date"
                    value={formData.annual_assessment_due}
                    onChange={(e) =>
                      setFormData({ ...formData, annual_assessment_due: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assessment_outcome">Assessment Outcome</Label>
                  <Select
                    value={formData.assessment_outcome}
                    onValueChange={(value) =>
                      setFormData({ ...formData, assessment_outcome: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSESSMENT_OUTCOMES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
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
                    id="fit_proper_confirmed"
                    checked={formData.fit_proper_confirmed}
                    onChange={(e) =>
                      setFormData({ ...formData, fit_proper_confirmed: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="fit_proper_confirmed">Fit & Proper Confirmed</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="conduct_rules_training"
                    checked={formData.conduct_rules_training}
                    onChange={(e) =>
                      setFormData({ ...formData, conduct_rules_training: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="conduct_rules_training">Conduct Rules Training Complete</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="certification_status">Certification Status</Label>
                  <Select
                    value={formData.certification_status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, certification_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CERTIFICATION_STATUSES.map((s) => (
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
