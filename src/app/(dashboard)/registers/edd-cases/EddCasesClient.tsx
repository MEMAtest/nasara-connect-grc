"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Plus, Search, Filter, Download, FileCheck, CheckCircle, Clock, AlertTriangle, XCircle, ShieldAlert } from "lucide-react";
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
} from "recharts";

interface EddCaseRecord {
  id: string;
  case_reference: string;
  customer_reference: string;
  customer_name: string;
  edd_trigger: string;
  trigger_description?: string;
  trigger_date: string;
  risk_factors?: string[];
  enhanced_measures?: string[];
  source_of_wealth_verified: boolean;
  source_of_funds_verified: boolean;
  ongoing_monitoring_level: string;
  senior_management_approval: boolean;
  approved_by?: string;
  approval_date?: string;
  approval_rationale?: string;
  next_review_date?: string;
  last_review_date?: string;
  review_frequency: string;
  status: string;
  decision: string;
  decision_rationale?: string;
  notes?: string;
  created_at: string;
}

const EDD_TRIGGERS = [
  { value: "pep", label: "PEP" },
  { value: "high_risk_country", label: "High Risk Country" },
  { value: "complex_structure", label: "Complex Structure" },
  { value: "high_value", label: "High Value Transaction" },
  { value: "sanctions_alert", label: "Sanctions Alert" },
  { value: "adverse_media", label: "Adverse Media" },
  { value: "unusual_activity", label: "Unusual Activity" },
  { value: "referral", label: "Internal Referral" },
  { value: "other", label: "Other" },
];

const MONITORING_LEVELS = [
  { value: "standard", label: "Standard" },
  { value: "enhanced", label: "Enhanced" },
  { value: "intensive", label: "Intensive" },
];

const REVIEW_FREQUENCIES = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semi_annual", label: "Semi-Annual" },
  { value: "annual", label: "Annual" },
];

const STATUSES = [
  { value: "open", label: "Open" },
  { value: "under_review", label: "Under Review" },
  { value: "closed", label: "Closed" },
  { value: "escalated", label: "Escalated" },
];

const DECISIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "terminated", label: "Terminated" },
  { value: "exited", label: "Exited" },
];

const RISK_FACTORS = [
  "PEP relationship",
  "High risk jurisdiction",
  "Complex ownership structure",
  "Bearer shares",
  "Nominee shareholders",
  "High value transactions",
  "Cash intensive business",
  "Sanctions proximity",
  "Adverse media findings",
  "Unusual transaction patterns",
];

const ENHANCED_MEASURES = [
  "Enhanced ongoing monitoring",
  "Senior management approval",
  "Source of wealth verification",
  "Source of funds verification",
  "Additional ID verification",
  "Third-party intelligence",
  "On-site visits",
  "Transaction limits",
  "Regular relationship reviews",
];

const CHART_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6", "#ec4899"];

export function EddCasesClient() {
  const toast = useToast();
  const [records, setRecords] = useState<EddCaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTrigger, setFilterTrigger] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EddCaseRecord | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [formData, setFormData] = useState({
    case_reference: "",
    customer_reference: "",
    customer_name: "",
    edd_trigger: "other",
    trigger_description: "",
    trigger_date: new Date().toISOString().split("T")[0],
    risk_factors: [] as string[],
    enhanced_measures: [] as string[],
    source_of_wealth_verified: false,
    source_of_funds_verified: false,
    ongoing_monitoring_level: "enhanced",
    senior_management_approval: false,
    approved_by: "",
    approval_rationale: "",
    next_review_date: "",
    review_frequency: "quarterly",
    status: "open",
    decision: "pending",
    decision_rationale: "",
    notes: "",
  });

  const loadRecords = useCallback(async () => {
    try {
      const response = await fetch("/api/registers/edd-cases");
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
        ? `/api/registers/edd-cases/${editingRecord.id}`
        : "/api/registers/edd-cases";
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
        toast.success(editingRecord ? "Case updated successfully" : "Case created successfully");
      } else {
        toast.error("Failed to save case");
      }
    } catch (error) {
      console.error("Error saving record:", error);
      toast.error("Failed to save case");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this EDD case?")) return;
    try {
      const response = await fetch(`/api/registers/edd-cases/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await loadRecords();
        toast.success("Case deleted successfully");
      } else {
        toast.error("Failed to delete case");
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete case");
    }
  };

  const resetForm = () => {
    setFormData({
      case_reference: "",
      customer_reference: "",
      customer_name: "",
      edd_trigger: "other",
      trigger_description: "",
      trigger_date: new Date().toISOString().split("T")[0],
      risk_factors: [],
      enhanced_measures: [],
      source_of_wealth_verified: false,
      source_of_funds_verified: false,
      ongoing_monitoring_level: "enhanced",
      senior_management_approval: false,
      approved_by: "",
      approval_rationale: "",
      next_review_date: "",
      review_frequency: "quarterly",
      status: "open",
      decision: "pending",
      decision_rationale: "",
      notes: "",
    });
    setEditingRecord(null);
  };

  const openEditDialog = (record: EddCaseRecord) => {
    setEditingRecord(record);
    setFormData({
      case_reference: record.case_reference,
      customer_reference: record.customer_reference,
      customer_name: record.customer_name,
      edd_trigger: record.edd_trigger,
      trigger_description: record.trigger_description || "",
      trigger_date: record.trigger_date ? record.trigger_date.split("T")[0] : "",
      risk_factors: record.risk_factors || [],
      enhanced_measures: record.enhanced_measures || [],
      source_of_wealth_verified: record.source_of_wealth_verified,
      source_of_funds_verified: record.source_of_funds_verified,
      ongoing_monitoring_level: record.ongoing_monitoring_level,
      senior_management_approval: record.senior_management_approval,
      approved_by: record.approved_by || "",
      approval_rationale: record.approval_rationale || "",
      next_review_date: record.next_review_date ? record.next_review_date.split("T")[0] : "",
      review_frequency: record.review_frequency,
      status: record.status,
      decision: record.decision,
      decision_rationale: record.decision_rationale || "",
      notes: record.notes || "",
    });
    setIsDialogOpen(true);
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.case_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.customer_reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || record.status === filterStatus;
    const matchesTrigger = filterTrigger === "all" || record.edd_trigger === filterTrigger;
    return matchesSearch && matchesStatus && matchesTrigger;
  });

  const {
    paginatedData,
    paginationProps,
  } = usePagination(filteredRecords, { initialLimit: 25 });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      open: "outline",
      under_review: "secondary",
      closed: "default",
      escalated: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.replace(/_/g, " ")}</Badge>;
  };

  const getDecisionBadge = (decision: string) => {
    const colors: Record<string, string> = {
      pending: "bg-gray-100 text-gray-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      terminated: "bg-orange-100 text-orange-700",
      exited: "bg-purple-100 text-purple-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[decision] || colors.pending}`}>
        {decision}
      </span>
    );
  };

  const getTriggerBadge = (trigger: string) => {
    const label = EDD_TRIGGERS.find((t) => t.value === trigger)?.label || trigger;
    return <Badge variant="outline">{label}</Badge>;
  };

  const exportToCSV = () => {
    const headers = [
      "Case Reference", "Customer Reference", "Customer Name", "EDD Trigger",
      "Monitoring Level", "SM Approval", "Status", "Decision", "Next Review", "Notes"
    ];
    const rows = filteredRecords.map((r) => [
      r.case_reference,
      r.customer_reference,
      r.customer_name,
      EDD_TRIGGERS.find((t) => t.value === r.edd_trigger)?.label || r.edd_trigger,
      r.ongoing_monitoring_level,
      r.senior_management_approval ? "Yes" : "No",
      r.status,
      r.decision,
      r.next_review_date ? new Date(r.next_review_date).toLocaleDateString() : "",
      r.notes || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `edd-cases-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate stats
  const stats = {
    total: records.length,
    open: records.filter((r) => r.status === "open").length,
    underReview: records.filter((r) => r.status === "under_review").length,
    approved: records.filter((r) => r.decision === "approved").length,
    pendingApproval: records.filter((r) => !r.senior_management_approval && r.status === "open").length,
    escalated: records.filter((r) => r.status === "escalated").length,
  };

  // Chart data
  const triggerData = EDD_TRIGGERS.map((t) => ({
    name: t.label,
    value: records.filter((r) => r.edd_trigger === t.value).length,
  })).filter((d) => d.value > 0);

  const statusData = STATUSES.map((s) => ({
    name: s.label,
    count: records.filter((r) => r.status === s.value).length,
  }));

  const decisionData = DECISIONS.map((d) => ({
    name: d.label,
    count: records.filter((r) => r.decision === d.value).length,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading EDD cases...</div>
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
            <h1 className="text-2xl font-bold text-slate-900">EDD Cases Register</h1>
            <p className="text-slate-500">
              Manage enhanced due diligence cases and approvals
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
            New EDD Case
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="records">All Cases</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-slate-500">Total Cases</p>
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
                    <p className="text-xs text-slate-500">Open Cases</p>
                    <p className="text-2xl font-bold">{stats.open}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-xs text-slate-500">Under Review</p>
                    <p className="text-2xl font-bold">{stats.underReview}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
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
                  <ShieldAlert className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-slate-500">Pending SM Approval</p>
                    <p className="text-2xl font-bold">{stats.pendingApproval}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
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
                <CardTitle className="text-lg">EDD Triggers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={triggerData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {triggerData.map((_, index) => (
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
                <CardTitle className="text-lg">Case Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData}>
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
                <CardTitle className="text-lg">Decision Outcomes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={decisionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
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
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterTrigger} onValueChange={setFilterTrigger}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trigger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Triggers</SelectItem>
                {EDD_TRIGGERS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
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
                    <TableHead>Case Ref</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Monitoring</TableHead>
                    <TableHead>SM Approval</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Decision</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        No EDD cases found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.case_reference}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.customer_name}</p>
                            <p className="text-xs text-slate-500">{record.customer_reference}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getTriggerBadge(record.edd_trigger)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {MONITORING_LEVELS.find((m) => m.value === record.ongoing_monitoring_level)?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.senior_management_approval ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>{getDecisionBadge(record.decision)}</TableCell>
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
              {editingRecord ? "Edit EDD Case" : "New EDD Case"}
            </DialogTitle>
            <DialogDescription>
              Record enhanced due diligence case details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Case & Customer Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="case_reference">Case Reference *</Label>
                  <Input
                    id="case_reference"
                    value={formData.case_reference}
                    onChange={(e) =>
                      setFormData({ ...formData, case_reference: e.target.value })
                    }
                    placeholder="EDD-2024-001"
                    required
                  />
                </div>
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
                  <Label htmlFor="trigger_date">Trigger Date</Label>
                  <Input
                    id="trigger_date"
                    type="date"
                    value={formData.trigger_date}
                    onChange={(e) =>
                      setFormData({ ...formData, trigger_date: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* EDD Trigger */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edd_trigger">EDD Trigger</Label>
                  <Select
                    value={formData.edd_trigger}
                    onValueChange={(value) =>
                      setFormData({ ...formData, edd_trigger: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EDD_TRIGGERS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ongoing_monitoring_level">Monitoring Level</Label>
                  <Select
                    value={formData.ongoing_monitoring_level}
                    onValueChange={(value) =>
                      setFormData({ ...formData, ongoing_monitoring_level: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONITORING_LEVELS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trigger_description">Trigger Description</Label>
                <Textarea
                  id="trigger_description"
                  value={formData.trigger_description}
                  onChange={(e) =>
                    setFormData({ ...formData, trigger_description: e.target.value })
                  }
                  placeholder="Describe why EDD was triggered..."
                  rows={2}
                />
              </div>

              {/* Risk Factors */}
              <div className="space-y-2">
                <Label>Risk Factors</Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                  {RISK_FACTORS.map((factor) => (
                    <label key={factor} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.risk_factors.includes(factor)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              risk_factors: [...formData.risk_factors, factor],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              risk_factors: formData.risk_factors.filter((f) => f !== factor),
                            });
                          }
                        }}
                        className="rounded"
                      />
                      {factor}
                    </label>
                  ))}
                </div>
              </div>

              {/* Enhanced Measures */}
              <div className="space-y-2">
                <Label>Enhanced Measures Applied</Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                  {ENHANCED_MEASURES.map((measure) => (
                    <label key={measure} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.enhanced_measures.includes(measure)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              enhanced_measures: [...formData.enhanced_measures, measure],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              enhanced_measures: formData.enhanced_measures.filter((m) => m !== measure),
                            });
                          }
                        }}
                        className="rounded"
                      />
                      {measure}
                    </label>
                  ))}
                </div>
              </div>

              {/* Verifications */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="source_of_wealth_verified"
                    checked={formData.source_of_wealth_verified}
                    onChange={(e) =>
                      setFormData({ ...formData, source_of_wealth_verified: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="source_of_wealth_verified">SoW Verified</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="source_of_funds_verified"
                    checked={formData.source_of_funds_verified}
                    onChange={(e) =>
                      setFormData({ ...formData, source_of_funds_verified: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="source_of_funds_verified">SoF Verified</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="senior_management_approval"
                    checked={formData.senior_management_approval}
                    onChange={(e) =>
                      setFormData({ ...formData, senior_management_approval: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="senior_management_approval">SM Approval</Label>
                </div>
              </div>

              {formData.senior_management_approval && (
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
                    <Label htmlFor="approval_rationale">Approval Rationale</Label>
                    <Textarea
                      id="approval_rationale"
                      value={formData.approval_rationale}
                      onChange={(e) =>
                        setFormData({ ...formData, approval_rationale: e.target.value })
                      }
                      rows={2}
                    />
                  </div>
                </div>
              )}

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
                  <Label htmlFor="review_frequency">Review Frequency</Label>
                  <Select
                    value={formData.review_frequency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, review_frequency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REVIEW_FREQUENCIES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
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
                {editingRecord ? "Update Case" : "Create Case"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
