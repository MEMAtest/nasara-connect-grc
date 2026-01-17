"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Plus, Search, Filter, Download, FileSearch, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react";
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

interface AmlCddRecord {
  id: string;
  customer_reference: string;
  customer_name: string;
  customer_type: string;
  onboarding_date?: string;
  cdd_level: string;
  risk_rating: string;
  id_verification_status: string;
  id_verification_date?: string;
  id_verification_method?: string;
  poa_verification_status: string;
  poa_verification_date?: string;
  source_of_funds?: string;
  source_of_wealth?: string;
  beneficial_owners?: string;
  pep_check_status: string;
  pep_check_date?: string;
  sanctions_check_status: string;
  sanctions_check_date?: string;
  adverse_media_status: string;
  adverse_media_date?: string;
  next_review_date?: string;
  last_review_date?: string;
  reviewer?: string;
  overall_status: string;
  approval_status: string;
  approved_by?: string;
  approval_date?: string;
  notes?: string;
  created_at: string;
}

const CUSTOMER_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "company", label: "Company" },
  { value: "trust", label: "Trust" },
  { value: "partnership", label: "Partnership" },
  { value: "charity", label: "Charity" },
  { value: "other", label: "Other" },
];

const CDD_LEVELS = [
  { value: "simplified", label: "Simplified (SDD)" },
  { value: "standard", label: "Standard (CDD)" },
  { value: "enhanced", label: "Enhanced (EDD)" },
];

const RISK_RATINGS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const VERIFICATION_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "expired", label: "Expired" },
];

const OVERALL_STATUSES = [
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "pending_review", label: "Pending Review" },
  { value: "on_hold", label: "On Hold" },
  { value: "rejected", label: "Rejected" },
];

const APPROVAL_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "conditional", label: "Conditional" },
];

const ID_METHODS = [
  "Passport",
  "Driving License",
  "National ID Card",
  "Biometric Verification",
  "Electronic Verification",
  "Document + Selfie",
];

const CHART_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6"];

export function AmlCddClient() {
  const toast = useToast();
  const [records, setRecords] = useState<AmlCddRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AmlCddRecord | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [formData, setFormData] = useState({
    customer_reference: "",
    customer_name: "",
    customer_type: "individual",
    onboarding_date: new Date().toISOString().split("T")[0],
    cdd_level: "standard",
    risk_rating: "medium",
    id_verification_status: "pending",
    id_verification_date: "",
    id_verification_method: "",
    poa_verification_status: "pending",
    poa_verification_date: "",
    source_of_funds: "",
    source_of_wealth: "",
    beneficial_owners: "",
    pep_check_status: "pending",
    sanctions_check_status: "pending",
    adverse_media_status: "pending",
    next_review_date: "",
    reviewer: "",
    overall_status: "in_progress",
    approval_status: "pending",
    notes: "",
  });

  const loadRecords = useCallback(async () => {
    try {
      const response = await fetch("/api/registers/aml-cdd");
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
        ? `/api/registers/aml-cdd/${editingRecord.id}`
        : "/api/registers/aml-cdd";
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
    if (!confirm("Are you sure you want to delete this CDD record?")) return;
    try {
      const response = await fetch(`/api/registers/aml-cdd/${id}`, {
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
      customer_reference: "",
      customer_name: "",
      customer_type: "individual",
      onboarding_date: new Date().toISOString().split("T")[0],
      cdd_level: "standard",
      risk_rating: "medium",
      id_verification_status: "pending",
      id_verification_date: "",
      id_verification_method: "",
      poa_verification_status: "pending",
      poa_verification_date: "",
      source_of_funds: "",
      source_of_wealth: "",
      beneficial_owners: "",
      pep_check_status: "pending",
      sanctions_check_status: "pending",
      adverse_media_status: "pending",
      next_review_date: "",
      reviewer: "",
      overall_status: "in_progress",
      approval_status: "pending",
      notes: "",
    });
    setEditingRecord(null);
  };

  const openEditDialog = (record: AmlCddRecord) => {
    setEditingRecord(record);
    setFormData({
      customer_reference: record.customer_reference,
      customer_name: record.customer_name,
      customer_type: record.customer_type,
      onboarding_date: record.onboarding_date ? record.onboarding_date.split("T")[0] : "",
      cdd_level: record.cdd_level,
      risk_rating: record.risk_rating,
      id_verification_status: record.id_verification_status,
      id_verification_date: record.id_verification_date ? record.id_verification_date.split("T")[0] : "",
      id_verification_method: record.id_verification_method || "",
      poa_verification_status: record.poa_verification_status,
      poa_verification_date: record.poa_verification_date ? record.poa_verification_date.split("T")[0] : "",
      source_of_funds: record.source_of_funds || "",
      source_of_wealth: record.source_of_wealth || "",
      beneficial_owners: record.beneficial_owners || "",
      pep_check_status: record.pep_check_status,
      sanctions_check_status: record.sanctions_check_status,
      adverse_media_status: record.adverse_media_status,
      next_review_date: record.next_review_date ? record.next_review_date.split("T")[0] : "",
      reviewer: record.reviewer || "",
      overall_status: record.overall_status,
      approval_status: record.approval_status,
      notes: record.notes || "",
    });
    setIsDialogOpen(true);
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.customer_reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || record.overall_status === filterStatus;
    const matchesRisk = filterRisk === "all" || record.risk_rating === filterRisk;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const {
    paginatedData,
    paginationProps,
  } = usePagination(filteredRecords, { initialLimit: 25 });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      in_progress: "outline",
      completed: "default",
      pending_review: "secondary",
      on_hold: "secondary",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.replace(/_/g, " ")}</Badge>;
  };

  const getRiskBadge = (risk: string) => {
    const colors: Record<string, string> = {
      low: "bg-green-100 text-green-700",
      medium: "bg-yellow-100 text-yellow-700",
      high: "bg-orange-100 text-orange-700",
      critical: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[risk] || colors.medium}`}>
        {risk}
      </span>
    );
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Reference", "Customer Name", "Type", "CDD Level", "Risk Rating",
      "ID Verified", "PEP Check", "Sanctions Check", "Status", "Notes"
    ];
    const rows = filteredRecords.map((r) => [
      r.customer_reference,
      r.customer_name,
      r.customer_type,
      r.cdd_level,
      r.risk_rating,
      r.id_verification_status,
      r.pep_check_status,
      r.sanctions_check_status,
      r.overall_status,
      r.notes || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aml-cdd-register-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate stats
  const stats = {
    total: records.length,
    inProgress: records.filter((r) => r.overall_status === "in_progress").length,
    completed: records.filter((r) => r.overall_status === "completed").length,
    highRisk: records.filter((r) => r.risk_rating === "high" || r.risk_rating === "critical").length,
    pendingReview: records.filter((r) => r.overall_status === "pending_review").length,
    eddRequired: records.filter((r) => r.cdd_level === "enhanced").length,
  };

  // Chart data
  const riskData = RISK_RATINGS.map((r) => ({
    name: r.label,
    value: records.filter((rec) => rec.risk_rating === r.value).length,
  })).filter((d) => d.value > 0);

  const cddLevelData = CDD_LEVELS.map((c) => ({
    name: c.label,
    count: records.filter((rec) => rec.cdd_level === c.value).length,
  }));

  const statusData = OVERALL_STATUSES.map((s) => ({
    name: s.label,
    count: records.filter((r) => r.overall_status === s.value).length,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading AML CDD records...</div>
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
            <h1 className="text-2xl font-bold text-slate-900">AML CDD Register</h1>
            <p className="text-slate-500">
              Track customer due diligence status and reviews
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
            New CDD Record
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <FileSearch className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-slate-500">Total Customers</p>
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
                    <p className="text-xs text-slate-500">In Progress</p>
                    <p className="text-2xl font-bold">{stats.inProgress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-xs text-slate-500">Completed</p>
                    <p className="text-2xl font-bold">{stats.completed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-xs text-slate-500">High Risk</p>
                    <p className="text-2xl font-bold">{stats.highRisk}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-xs text-slate-500">Pending Review</p>
                    <p className="text-2xl font-bold">{stats.pendingReview}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <FileSearch className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-slate-500">EDD Required</p>
                    <p className="text-2xl font-bold">{stats.eddRequired}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {riskData.map((_, index) => (
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
                <CardTitle className="text-lg">CDD Level Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cddLevelData}>
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
                <CardTitle className="text-lg">Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" />
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
                  placeholder="Search by name or reference..."
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
                {OVERALL_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                {RISK_RATINGS.map((r) => (
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
                    <TableHead>Customer</TableHead>
                    <TableHead>CDD Level</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Verifications</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Review</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        No CDD records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.customer_reference}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.customer_name}</p>
                            <p className="text-xs text-slate-500">
                              {CUSTOMER_TYPES.find((t) => t.value === record.customer_type)?.label}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {CDD_LEVELS.find((c) => c.value === record.cdd_level)?.label || record.cdd_level}
                          </Badge>
                        </TableCell>
                        <TableCell>{getRiskBadge(record.risk_rating)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <span title="ID Verification">{getVerificationIcon(record.id_verification_status)}</span>
                            <span title="PEP Check">{getVerificationIcon(record.pep_check_status)}</span>
                            <span title="Sanctions Check">{getVerificationIcon(record.sanctions_check_status)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(record.overall_status)}</TableCell>
                        <TableCell>
                          {record.next_review_date
                            ? new Date(record.next_review_date).toLocaleDateString()
                            : "-"}
                        </TableCell>
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
              {editingRecord ? "Edit CDD Record" : "New CDD Record"}
            </DialogTitle>
            <DialogDescription>
              Record customer due diligence information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Customer Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_reference">Customer Reference *</Label>
                  <Input
                    id="customer_reference"
                    value={formData.customer_reference}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_reference: e.target.value })
                    }
                    placeholder="CUS-2024-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_type">Customer Type</Label>
                  <Select
                    value={formData.customer_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, customer_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CUSTOMER_TYPES.map((t) => (
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
                  <Label htmlFor="onboarding_date">Onboarding Date</Label>
                  <Input
                    id="onboarding_date"
                    type="date"
                    value={formData.onboarding_date}
                    onChange={(e) =>
                      setFormData({ ...formData, onboarding_date: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Risk & CDD Level */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cdd_level">CDD Level</Label>
                  <Select
                    value={formData.cdd_level}
                    onValueChange={(value) =>
                      setFormData({ ...formData, cdd_level: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CDD_LEVELS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="risk_rating">Risk Rating</Label>
                  <Select
                    value={formData.risk_rating}
                    onValueChange={(value) =>
                      setFormData({ ...formData, risk_rating: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RISK_RATINGS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* ID Verification */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id_verification_status">ID Verification</Label>
                  <Select
                    value={formData.id_verification_status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, id_verification_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VERIFICATION_STATUSES.map((v) => (
                        <SelectItem key={v.value} value={v.value}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id_verification_date">ID Verified Date</Label>
                  <Input
                    id="id_verification_date"
                    type="date"
                    value={formData.id_verification_date}
                    onChange={(e) =>
                      setFormData({ ...formData, id_verification_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id_verification_method">ID Method</Label>
                  <Select
                    value={formData.id_verification_method}
                    onValueChange={(value) =>
                      setFormData({ ...formData, id_verification_method: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {ID_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* POA Verification */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="poa_verification_status">POA Verification</Label>
                  <Select
                    value={formData.poa_verification_status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, poa_verification_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VERIFICATION_STATUSES.map((v) => (
                        <SelectItem key={v.value} value={v.value}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poa_verification_date">POA Verified Date</Label>
                  <Input
                    id="poa_verification_date"
                    type="date"
                    value={formData.poa_verification_date}
                    onChange={(e) =>
                      setFormData({ ...formData, poa_verification_date: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* AML Checks */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pep_check_status">PEP Check</Label>
                  <Select
                    value={formData.pep_check_status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, pep_check_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VERIFICATION_STATUSES.map((v) => (
                        <SelectItem key={v.value} value={v.value}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sanctions_check_status">Sanctions Check</Label>
                  <Select
                    value={formData.sanctions_check_status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sanctions_check_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VERIFICATION_STATUSES.map((v) => (
                        <SelectItem key={v.value} value={v.value}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adverse_media_status">Adverse Media</Label>
                  <Select
                    value={formData.adverse_media_status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, adverse_media_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VERIFICATION_STATUSES.map((v) => (
                        <SelectItem key={v.value} value={v.value}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Source of Funds/Wealth */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source_of_funds">Source of Funds</Label>
                  <Input
                    id="source_of_funds"
                    value={formData.source_of_funds}
                    onChange={(e) =>
                      setFormData({ ...formData, source_of_funds: e.target.value })
                    }
                    placeholder="e.g., Employment income"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source_of_wealth">Source of Wealth</Label>
                  <Input
                    id="source_of_wealth"
                    value={formData.source_of_wealth}
                    onChange={(e) =>
                      setFormData({ ...formData, source_of_wealth: e.target.value })
                    }
                    placeholder="e.g., Savings, Inheritance"
                  />
                </div>
              </div>

              {/* Beneficial Owners */}
              <div className="space-y-2">
                <Label htmlFor="beneficial_owners">Beneficial Owners</Label>
                <Textarea
                  id="beneficial_owners"
                  value={formData.beneficial_owners}
                  onChange={(e) =>
                    setFormData({ ...formData, beneficial_owners: e.target.value })
                  }
                  placeholder="List beneficial owners with ownership percentages"
                  rows={2}
                />
              </div>

              {/* Review & Status */}
              <div className="grid grid-cols-3 gap-4">
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
                  <Label htmlFor="overall_status">Overall Status</Label>
                  <Select
                    value={formData.overall_status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, overall_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OVERALL_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewer">Reviewer</Label>
                <Input
                  id="reviewer"
                  value={formData.reviewer}
                  onChange={(e) =>
                    setFormData({ ...formData, reviewer: e.target.value })
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
