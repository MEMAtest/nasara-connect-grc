"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Plus, Search, Filter, Download, Package, CheckCircle, Clock, AlertTriangle, FileCheck } from "lucide-react";
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

interface ProductGovernanceRecord {
  id: string;
  product_reference: string;
  product_name: string;
  product_type: string;
  product_description?: string;
  target_market?: string;
  distribution_channels?: string[];
  risk_profile: string;
  key_risks?: string;
  manufacturer?: string;
  manufacturer_country?: string;
  launch_date?: string;
  last_review_date?: string;
  next_review_date?: string;
  review_frequency: string;
  product_owner?: string;
  compliance_owner?: string;
  approval_status: string;
  approved_by?: string;
  approval_date?: string;
  regulatory_requirements?: string;
  consumer_duty_assessment?: string;
  value_assessment?: string;
  fair_value_statement?: string;
  fair_value_confirmed?: boolean;
  status: string;
  notes?: string;
  created_at: string;
}

const PRODUCT_TYPES = [
  { value: "investment", label: "Investment" },
  { value: "insurance", label: "Insurance" },
  { value: "credit", label: "Credit" },
  { value: "payment", label: "Payment" },
  { value: "deposit", label: "Deposit" },
  { value: "other", label: "Other" },
];

const RISK_PROFILES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const REVIEW_FREQUENCIES = [
  { value: "quarterly", label: "Quarterly" },
  { value: "semi_annual", label: "Semi-Annual" },
  { value: "annual", label: "Annual" },
  { value: "biennial", label: "Biennial" },
];

const APPROVAL_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

const STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "approved", label: "Approved" },
  { value: "live", label: "Live" },
  { value: "withdrawn", label: "Withdrawn" },
  { value: "discontinued", label: "Discontinued" },
];

const CHART_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6"];

export function ProductGovernanceClient() {
  const toast = useToast();
  const [records, setRecords] = useState<ProductGovernanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterApprovalStatus, setFilterApprovalStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ProductGovernanceRecord | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [formData, setFormData] = useState({
    product_reference: "",
    product_name: "",
    product_type: "other",
    product_description: "",
    target_market: "",
    distribution_channels: [] as string[],
    risk_profile: "medium",
    key_risks: "",
    manufacturer: "",
    manufacturer_country: "",
    launch_date: "",
    last_review_date: "",
    next_review_date: "",
    review_frequency: "annual",
    product_owner: "",
    compliance_owner: "",
    approval_status: "pending",
    approved_by: "",
    approval_date: "",
    regulatory_requirements: "",
    consumer_duty_assessment: "",
    value_assessment: "",
    fair_value_statement: "",
    fair_value_confirmed: false,
    status: "draft",
    notes: "",
  });

  const loadRecords = useCallback(async () => {
    try {
      const response = await fetch("/api/registers/product-governance");
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
        ? `/api/registers/product-governance/${editingRecord.id}`
        : "/api/registers/product-governance";
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
    if (!confirm("Are you sure you want to delete this product governance record?")) return;
    try {
      const response = await fetch(`/api/registers/product-governance/${id}`, {
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
      product_reference: "",
      product_name: "",
      product_type: "other",
      product_description: "",
      target_market: "",
      distribution_channels: [],
      risk_profile: "medium",
      key_risks: "",
      manufacturer: "",
      manufacturer_country: "",
      launch_date: "",
      last_review_date: "",
      next_review_date: "",
      review_frequency: "annual",
      product_owner: "",
      compliance_owner: "",
      approval_status: "pending",
      approved_by: "",
      approval_date: "",
      regulatory_requirements: "",
      consumer_duty_assessment: "",
      value_assessment: "",
      fair_value_statement: "",
      fair_value_confirmed: false,
      status: "draft",
      notes: "",
    });
    setEditingRecord(null);
  };

  const openEditDialog = (record: ProductGovernanceRecord) => {
    setEditingRecord(record);
    setFormData({
      product_reference: record.product_reference,
      product_name: record.product_name,
      product_type: record.product_type,
      product_description: record.product_description || "",
      target_market: record.target_market || "",
      distribution_channels: record.distribution_channels || [],
      risk_profile: record.risk_profile,
      key_risks: record.key_risks || "",
      manufacturer: record.manufacturer || "",
      manufacturer_country: record.manufacturer_country || "",
      launch_date: record.launch_date ? record.launch_date.split("T")[0] : "",
      last_review_date: record.last_review_date ? record.last_review_date.split("T")[0] : "",
      next_review_date: record.next_review_date ? record.next_review_date.split("T")[0] : "",
      review_frequency: record.review_frequency,
      product_owner: record.product_owner || "",
      compliance_owner: record.compliance_owner || "",
      approval_status: record.approval_status,
      approved_by: record.approved_by || "",
      approval_date: record.approval_date ? record.approval_date.split("T")[0] : "",
      regulatory_requirements: record.regulatory_requirements || "",
      consumer_duty_assessment: record.consumer_duty_assessment || "",
      value_assessment: record.value_assessment || "",
      fair_value_statement: record.fair_value_statement || "",
      fair_value_confirmed: record.fair_value_confirmed || false,
      status: record.status,
      notes: record.notes || "",
    });
    setIsDialogOpen(true);
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.product_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.target_market?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = filterStatus === "all" || record.status === filterStatus;
    const matchesApprovalStatus = filterApprovalStatus === "all" || record.approval_status === filterApprovalStatus;
    return matchesSearch && matchesStatus && matchesApprovalStatus;
  });

  const {
    paginatedData,
    paginationProps,
  } = usePagination(filteredRecords, { initialLimit: 25 });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      approved: "outline",
      live: "default",
      withdrawn: "destructive",
      discontinued: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.replace("_", " ")}</Badge>;
  };

  const getApprovalBadge = (approval: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      withdrawn: "bg-gray-100 text-gray-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[approval] || colors.pending}`}>
        {approval.replace("_", " ")}
      </span>
    );
  };

  const getRiskBadge = (risk: string) => {
    const colors: Record<string, string> = {
      low: "bg-green-100 text-green-700",
      medium: "bg-yellow-100 text-yellow-700",
      high: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[risk] || colors.medium}`}>
        {risk}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = [
      "Reference", "Product Name", "Product Type", "Target Market", "Risk Profile",
      "Fair Value Confirmed", "Approval Status", "Launch Date", "Next Review Date", "Status", "Notes"
    ];
    const rows = filteredRecords.map((r) => [
      r.product_reference,
      r.product_name,
      r.product_type,
      r.target_market || "",
      r.risk_profile,
      r.fair_value_confirmed ? "Yes" : "No",
      r.approval_status,
      r.launch_date ? new Date(r.launch_date).toLocaleDateString() : "",
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
    a.download = `product-governance-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate stats
  const stats = {
    total: records.length,
    live_products: records.filter((r) => r.status === "live").length,
    pending_approval: records.filter((r) => r.approval_status === "pending").length,
    needs_review: records.filter((r) => {
      if (!r.next_review_date) return false;
      const reviewDate = new Date(r.next_review_date);
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      return reviewDate <= thirtyDaysFromNow;
    }).length,
  };

  // Chart data
  const approvalStatusData = APPROVAL_STATUSES.map((s) => ({
    name: s.label,
    value: records.filter((r) => r.approval_status === s.value).length,
  })).filter((d) => d.value > 0);

  const productTypeData = PRODUCT_TYPES.map((t) => ({
    name: t.label,
    count: records.filter((r) => r.product_type === t.value).length,
  }));

  const riskProfileData = RISK_PROFILES.map((r) => ({
    name: r.label,
    value: records.filter((record) => record.risk_profile === r.value).length,
  })).filter((d) => d.value > 0);

  const statusData = STATUSES.map((s) => ({
    name: s.label,
    count: records.filter((r) => r.status === s.value).length,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading product governance records...</div>
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
            <h1 className="text-2xl font-bold text-slate-900">Product Governance Register</h1>
            <p className="text-slate-500">
              Manage product governance records and compliance oversight
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
            New Product
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
                  <Package className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-slate-500">Total Products</p>
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
                    <p className="text-xs text-slate-500">Live Products</p>
                    <p className="text-2xl font-bold">{stats.live_products}</p>
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
                    <p className="text-2xl font-bold">{stats.pending_approval}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-xs text-slate-500">Needs Review</p>
                    <p className="text-2xl font-bold">{stats.needs_review}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Products by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productTypeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" name="Products" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Approval Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={approvalStatusData}
                      layout="vertical"
                      margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                        {approvalStatusData.map((_, index) => (
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
                <CardTitle className="text-lg">Risk Profile Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={riskProfileData}
                      layout="vertical"
                      margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                        {riskProfileData.map((entry, index) => {
                          const riskColors: Record<string, string> = {
                            Low: "#10b981",
                            Medium: "#f59e0b",
                            High: "#ef4444",
                          };
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={riskColors[entry.name] || CHART_COLORS[index]}
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Products by Status</CardTitle>
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
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, reference, or target market..."
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
                    <TableHead>Product Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Target Market</TableHead>
                    <TableHead>Risk Profile</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead>Next Review</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                        No product governance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.product_reference}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.product_name}</p>
                            {record.fair_value_confirmed && (
                              <p className="text-xs text-green-600 flex items-center gap-1">
                                <FileCheck className="h-3 w-3" /> Fair Value Confirmed
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {PRODUCT_TYPES.find((t) => t.value === record.product_type)?.label || record.product_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600 truncate max-w-[150px] block">
                            {record.target_market || "-"}
                          </span>
                        </TableCell>
                        <TableCell>{getRiskBadge(record.risk_profile)}</TableCell>
                        <TableCell>{getApprovalBadge(record.approval_status)}</TableCell>
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
              {editingRecord ? "Edit Product Governance Record" : "New Product Governance Record"}
            </DialogTitle>
            <DialogDescription>
              Record product governance details and compliance information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product_reference">Product Reference *</Label>
                  <Input
                    id="product_reference"
                    value={formData.product_reference}
                    onChange={(e) =>
                      setFormData({ ...formData, product_reference: e.target.value })
                    }
                    placeholder="PRD-2024-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product_type">Product Type</Label>
                  <Select
                    value={formData.product_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, product_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_name">Product Name *</Label>
                <Input
                  id="product_name"
                  value={formData.product_name}
                  onChange={(e) =>
                    setFormData({ ...formData, product_name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_description">Product Description</Label>
                <Textarea
                  id="product_description"
                  value={formData.product_description}
                  onChange={(e) =>
                    setFormData({ ...formData, product_description: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_market">Target Market</Label>
                  <Textarea
                    id="target_market"
                    value={formData.target_market}
                    onChange={(e) =>
                      setFormData({ ...formData, target_market: e.target.value })
                    }
                    placeholder="Describe the intended target market"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="risk_profile">Risk Profile</Label>
                  <Select
                    value={formData.risk_profile}
                    onValueChange={(value) =>
                      setFormData({ ...formData, risk_profile: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RISK_PROFILES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="key_risks">Key Risks</Label>
                <Textarea
                  id="key_risks"
                  value={formData.key_risks}
                  onChange={(e) =>
                    setFormData({ ...formData, key_risks: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) =>
                      setFormData({ ...formData, manufacturer: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manufacturer_country">Manufacturer Country</Label>
                  <Input
                    id="manufacturer_country"
                    value={formData.manufacturer_country}
                    onChange={(e) =>
                      setFormData({ ...formData, manufacturer_country: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="launch_date">Launch Date</Label>
                  <Input
                    id="launch_date"
                    type="date"
                    value={formData.launch_date}
                    onChange={(e) =>
                      setFormData({ ...formData, launch_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_review_date">Last Review Date</Label>
                  <Input
                    id="last_review_date"
                    type="date"
                    value={formData.last_review_date}
                    onChange={(e) =>
                      setFormData({ ...formData, last_review_date: e.target.value })
                    }
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

              <div className="grid grid-cols-3 gap-4">
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
                      {REVIEW_FREQUENCIES.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product_owner">Product Owner</Label>
                  <Input
                    id="product_owner"
                    value={formData.product_owner}
                    onChange={(e) =>
                      setFormData({ ...formData, product_owner: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compliance_owner">Compliance Owner</Label>
                  <Input
                    id="compliance_owner"
                    value={formData.compliance_owner}
                    onChange={(e) =>
                      setFormData({ ...formData, compliance_owner: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="regulatory_requirements">Regulatory Requirements</Label>
                <Textarea
                  id="regulatory_requirements"
                  value={formData.regulatory_requirements}
                  onChange={(e) =>
                    setFormData({ ...formData, regulatory_requirements: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consumer_duty_assessment">Consumer Duty Assessment</Label>
                <Textarea
                  id="consumer_duty_assessment"
                  value={formData.consumer_duty_assessment}
                  onChange={(e) =>
                    setFormData({ ...formData, consumer_duty_assessment: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="value_assessment">Value Assessment</Label>
                <Textarea
                  id="value_assessment"
                  value={formData.value_assessment}
                  onChange={(e) =>
                    setFormData({ ...formData, value_assessment: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fair_value_statement">Fair Value Statement</Label>
                <Textarea
                  id="fair_value_statement"
                  value={formData.fair_value_statement}
                  onChange={(e) =>
                    setFormData({ ...formData, fair_value_statement: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fair_value_confirmed"
                  checked={formData.fair_value_confirmed}
                  onChange={(e) =>
                    setFormData({ ...formData, fair_value_confirmed: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="fair_value_confirmed">Fair Value Confirmed</Label>
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
