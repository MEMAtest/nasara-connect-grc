"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Plus, Search, Filter, Download, Shield, AlertTriangle, Clock, Settings } from "lucide-react";
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
} from "recharts";

interface OpResilienceRecord {
  id: string;
  service_reference: string;
  service_name: string;
  service_owner: string;
  is_important_business_service: boolean;
  impact_tolerance_defined: boolean;
  scenario_test_result: string;
  remediation_status: string;
  next_review_date?: string;
  status: string;
  notes?: string;
  created_at: string;
}

const SCENARIO_TEST_RESULTS = [
  { value: "not_tested", label: "Not Tested" },
  { value: "passed", label: "Passed" },
  { value: "passed_with_issues", label: "Passed with Issues" },
  { value: "failed", label: "Failed" },
  { value: "in_progress", label: "In Progress" },
];

const REMEDIATION_STATUSES = [
  { value: "not_required", label: "Not Required" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
];

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "under_review", label: "Under Review" },
  { value: "inactive", label: "Inactive" },
  { value: "retired", label: "Retired" },
];

const CHART_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6"];

export function OpResilienceClient() {
  const toast = useToast();
  const [records, setRecords] = useState<OpResilienceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRemediation, setFilterRemediation] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<OpResilienceRecord | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [formData, setFormData] = useState({
    service_reference: "",
    service_name: "",
    service_owner: "",
    is_important_business_service: false,
    impact_tolerance_defined: false,
    scenario_test_result: "not_tested",
    remediation_status: "not_required",
    next_review_date: "",
    status: "active",
    notes: "",
  });

  const loadRecords = useCallback(async () => {
    try {
      const response = await fetch("/api/registers/op-resilience");
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
        ? `/api/registers/op-resilience/${editingRecord.id}`
        : "/api/registers/op-resilience";
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
    if (!confirm("Are you sure you want to delete this service record?")) return;
    try {
      const response = await fetch(`/api/registers/op-resilience/${id}`, {
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
      service_reference: "",
      service_name: "",
      service_owner: "",
      is_important_business_service: false,
      impact_tolerance_defined: false,
      scenario_test_result: "not_tested",
      remediation_status: "not_required",
      next_review_date: "",
      status: "active",
      notes: "",
    });
    setEditingRecord(null);
  };

  const openEditDialog = (record: OpResilienceRecord) => {
    setEditingRecord(record);
    setFormData({
      service_reference: record.service_reference,
      service_name: record.service_name,
      service_owner: record.service_owner,
      is_important_business_service: record.is_important_business_service,
      impact_tolerance_defined: record.impact_tolerance_defined,
      scenario_test_result: record.scenario_test_result,
      remediation_status: record.remediation_status,
      next_review_date: record.next_review_date ? record.next_review_date.split("T")[0] : "",
      status: record.status,
      notes: record.notes || "",
    });
    setIsDialogOpen(true);
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.service_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.service_owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || record.status === filterStatus;
    const matchesRemediation = filterRemediation === "all" || record.remediation_status === filterRemediation;
    return matchesSearch && matchesStatus && matchesRemediation;
  });

  const {
    paginatedData,
    paginationProps,
  } = usePagination(filteredRecords, { initialLimit: 25 });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      under_review: "outline",
      inactive: "secondary",
      retired: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.replace("_", " ")}</Badge>;
  };

  const getRemediationBadge = (remediation: string) => {
    const colors: Record<string, string> = {
      not_required: "bg-gray-100 text-gray-700",
      pending: "bg-yellow-100 text-yellow-700",
      in_progress: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      overdue: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[remediation] || colors.pending}`}>
        {remediation.replace("_", " ")}
      </span>
    );
  };

  const getTestResultBadge = (result: string) => {
    const colors: Record<string, string> = {
      not_tested: "bg-gray-100 text-gray-700",
      passed: "bg-green-100 text-green-700",
      passed_with_issues: "bg-yellow-100 text-yellow-700",
      failed: "bg-red-100 text-red-700",
      in_progress: "bg-blue-100 text-blue-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[result] || colors.not_tested}`}>
        {result.replace(/_/g, " ")}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = [
      "Reference", "Service Name", "Service Owner", "Important Business Service",
      "Impact Tolerance Defined", "Scenario Test Result", "Remediation Status",
      "Next Review Date", "Status", "Notes"
    ];
    const rows = filteredRecords.map((r) => [
      r.service_reference,
      r.service_name,
      r.service_owner,
      r.is_important_business_service ? "Yes" : "No",
      r.impact_tolerance_defined ? "Yes" : "No",
      r.scenario_test_result,
      r.remediation_status,
      r.next_review_date ? new Date(r.next_review_date).toLocaleDateString() : "",
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
    a.download = `op-resilience-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate stats
  const stats = {
    total: records.length,
    important_services: records.filter((r) => r.is_important_business_service).length,
    needs_testing: records.filter((r) => r.scenario_test_result === "not_tested" || r.scenario_test_result === "failed").length,
    remediation_pending: records.filter((r) => r.remediation_status === "pending" || r.remediation_status === "in_progress" || r.remediation_status === "overdue").length,
  };

  // Chart data
  const testResultData = SCENARIO_TEST_RESULTS.map((t) => ({
    name: t.label,
    value: records.filter((r) => r.scenario_test_result === t.value).length,
  })).filter((d) => d.value > 0);

  const remediationData = REMEDIATION_STATUSES.map((r) => ({
    name: r.label,
    count: records.filter((rec) => rec.remediation_status === r.value).length,
  }));

  const ibsData = [
    { name: "Important Business Service", value: records.filter((r) => r.is_important_business_service).length },
    { name: "Non-IBS", value: records.filter((r) => !r.is_important_business_service).length },
  ].filter((d) => d.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading operational resilience records...</div>
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
            <h1 className="text-2xl font-bold text-slate-900">Operational Resilience Register</h1>
            <p className="text-slate-500">
              Track important business services and operational resilience
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
            New Service
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
                  <Settings className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-slate-500">Total Services</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-slate-500">Important Services</p>
                    <p className="text-2xl font-bold">{stats.important_services}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-xs text-slate-500">Needs Testing</p>
                    <p className="text-2xl font-bold">{stats.needs_testing}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-xs text-slate-500">Remediation Pending</p>
                    <p className="text-2xl font-bold">{stats.remediation_pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scenario Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={testResultData}
                      layout="vertical"
                      margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={180} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                        {testResultData.map((_, index) => (
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
                <CardTitle className="text-lg">Important Business Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ibsData}
                      layout="vertical"
                      margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={170} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                        {ibsData.map((_, index) => (
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
                <CardTitle className="text-lg">Remediation Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={remediationData} layout="vertical">
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
            <Select value={filterRemediation} onValueChange={setFilterRemediation}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Remediation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Remediation</SelectItem>
                {REMEDIATION_STATUSES.map((r) => (
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
                    <TableHead>Service Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>IBS</TableHead>
                    <TableHead>Test Result</TableHead>
                    <TableHead>Remediation</TableHead>
                    <TableHead>Next Review</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                        No service records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.service_reference}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.service_name}</p>
                          </div>
                        </TableCell>
                        <TableCell>{record.service_owner}</TableCell>
                        <TableCell>
                          {record.is_important_business_service ? (
                            <Badge variant="default">Yes</Badge>
                          ) : (
                            <Badge variant="secondary">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>{getTestResultBadge(record.scenario_test_result)}</TableCell>
                        <TableCell>{getRemediationBadge(record.remediation_status)}</TableCell>
                        <TableCell>
                          {record.next_review_date
                            ? new Date(record.next_review_date).toLocaleDateString()
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
              {editingRecord ? "Edit Service Record" : "New Business Service"}
            </DialogTitle>
            <DialogDescription>
              Record the details of a business service for operational resilience tracking
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service_reference">Service Reference *</Label>
                  <Input
                    id="service_reference"
                    value={formData.service_reference}
                    onChange={(e) =>
                      setFormData({ ...formData, service_reference: e.target.value })
                    }
                    placeholder="SVC-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service_name">Service Name *</Label>
                  <Input
                    id="service_name"
                    value={formData.service_name}
                    onChange={(e) =>
                      setFormData({ ...formData, service_name: e.target.value })
                    }
                    placeholder="Payment Processing"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service_owner">Service Owner *</Label>
                  <Input
                    id="service_owner"
                    value={formData.service_owner}
                    onChange={(e) =>
                      setFormData({ ...formData, service_owner: e.target.value })
                    }
                    placeholder="John Smith"
                    required
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_important_business_service"
                    checked={formData.is_important_business_service}
                    onChange={(e) =>
                      setFormData({ ...formData, is_important_business_service: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="is_important_business_service">Important Business Service (IBS)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="impact_tolerance_defined"
                    checked={formData.impact_tolerance_defined}
                    onChange={(e) =>
                      setFormData({ ...formData, impact_tolerance_defined: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="impact_tolerance_defined">Impact Tolerance Defined</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scenario_test_result">Scenario Test Result</Label>
                  <Select
                    value={formData.scenario_test_result}
                    onValueChange={(value) =>
                      setFormData({ ...formData, scenario_test_result: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SCENARIO_TEST_RESULTS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remediation_status">Remediation Status</Label>
                  <Select
                    value={formData.remediation_status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, remediation_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REMEDIATION_STATUSES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
