"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft, Plus, Search, Filter, Download, Users, CheckCircle, XCircle, FileText } from "lucide-react";
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

interface InsiderListRecord {
  id: string;
  list_reference: string;
  project_name: string;
  insider_name: string;
  insider_role?: string;
  insider_company?: string;
  insider_email?: string;
  insider_phone?: string;
  date_added: string;
  date_removed?: string;
  reason_for_access?: string;
  access_granted_by?: string;
  acknowledgment_received: boolean;
  acknowledgment_date?: string;
  status: string;
  notes?: string;
  created_at: string;
}

const LIST_STATUSES = [
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
  { value: "archived", label: "Archived" },
];

const CHART_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6"];

export function InsiderListClient() {
  const [records, setRecords] = useState<InsiderListRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAcknowledgment, setFilterAcknowledgment] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<InsiderListRecord | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [monthFilter, setMonthFilter] = useState<{ key: string; label: string } | null>(null);

  const [formData, setFormData] = useState({
    list_reference: "",
    project_name: "",
    insider_name: "",
    insider_role: "",
    insider_company: "",
    insider_email: "",
    insider_phone: "",
    date_added: new Date().toISOString().split("T")[0],
    date_removed: "",
    reason_for_access: "",
    access_granted_by: "",
    acknowledgment_received: false,
    acknowledgment_date: "",
    status: "active",
    notes: "",
  });

  const loadRecords = useCallback(async () => {
    try {
      const response = await fetch("/api/registers/insider-list");
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
        ? `/api/registers/insider-list/${editingRecord.id}`
        : "/api/registers/insider-list";
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
    if (!confirm("Are you sure you want to delete this insider list entry?")) return;
    try {
      const response = await fetch(`/api/registers/insider-list/${id}`, {
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
      list_reference: "",
      project_name: "",
      insider_name: "",
      insider_role: "",
      insider_company: "",
      insider_email: "",
      insider_phone: "",
      date_added: new Date().toISOString().split("T")[0],
      date_removed: "",
      reason_for_access: "",
      access_granted_by: "",
      acknowledgment_received: false,
      acknowledgment_date: "",
      status: "active",
      notes: "",
    });
    setEditingRecord(null);
  };

  const openEditDialog = (record: InsiderListRecord) => {
    setEditingRecord(record);
    setFormData({
      list_reference: record.list_reference,
      project_name: record.project_name,
      insider_name: record.insider_name,
      insider_role: record.insider_role || "",
      insider_company: record.insider_company || "",
      insider_email: record.insider_email || "",
      insider_phone: record.insider_phone || "",
      date_added: record.date_added ? record.date_added.split("T")[0] : "",
      date_removed: record.date_removed ? record.date_removed.split("T")[0] : "",
      reason_for_access: record.reason_for_access || "",
      access_granted_by: record.access_granted_by || "",
      acknowledgment_received: record.acknowledgment_received,
      acknowledgment_date: record.acknowledgment_date ? record.acknowledgment_date.split("T")[0] : "",
      status: record.status,
      notes: record.notes || "",
    });
    setIsDialogOpen(true);
  };

  const baseFilteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const matchesSearch =
          record.insider_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.list_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (record.insider_company?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
        const matchesStatus = filterStatus === "all" || record.status === filterStatus;
        const matchesAcknowledgment =
          filterAcknowledgment === "all" ||
          (filterAcknowledgment === "received" && record.acknowledgment_received) ||
          (filterAcknowledgment === "pending" && !record.acknowledgment_received);
        return matchesSearch && matchesStatus && matchesAcknowledgment;
      }),
    [records, searchTerm, filterStatus, filterAcknowledgment]
  );

  const filteredRecords = useMemo(
    () =>
      monthFilter
        ? baseFilteredRecords.filter(
            (record) => getMonthKey(record.date_added) === monthFilter.key
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
      closed: "secondary",
      archived: "outline",
    };
    const colors: Record<string, string> = {
      active: "bg-green-500",
      closed: "",
      archived: "",
    };
    return (
      <Badge variant={variants[status] || "secondary"} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getAcknowledgmentBadge = (received: boolean) => {
    if (received) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          Received
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        Pending
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = [
      "Reference", "Project Name", "Insider Name", "Insider Role", "Insider Company",
      "Date Added", "Acknowledgment Received", "List Status", "Notes"
    ];
    const rows = filteredRecords.map((r) => [
      r.list_reference,
      r.project_name,
      r.insider_name,
      r.insider_role || "",
      r.insider_company || "",
      r.date_added ? new Date(r.date_added).toLocaleDateString() : "",
      r.acknowledgment_received ? "Yes" : "No",
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
    a.download = `insider-list-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate stats
  const stats = {
    total: records.length,
    active: records.filter((r) => r.status === "active").length,
    closed: records.filter((r) => r.status === "closed").length,
    acknowledgmentsPending: records.filter((r) => !r.acknowledgment_received).length,
  };

  // Chart data
  const statusData = LIST_STATUSES.map((s) => ({
    name: s.label,
    value: filteredRecords.filter((r) => r.status === s.value).length,
  })).filter((d) => d.value > 0);

  const acknowledgmentData = [
    { name: "Received", value: filteredRecords.filter((r) => r.acknowledgment_received).length },
    { name: "Pending", value: filteredRecords.filter((r) => !r.acknowledgment_received).length },
  ].filter((d) => d.value > 0);

  // Group by project
  const projectGroups = filteredRecords.reduce((acc, record) => {
    const project = record.project_name;
    if (!acc[project]) {
      acc[project] = 0;
    }
    acc[project]++;
    return acc;
  }, {} as Record<string, number>);

  const projectData = Object.entries(projectGroups)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const monthBuckets = getMonthBuckets(6);

  const monthlyData = useMemo(
    () =>
      monthBuckets.map((bucket) => {
        const monthRecords = baseFilteredRecords.filter(
          (r) => getMonthKey(r.date_added) === bucket.monthKey
        );
        return {
          month: bucket.label,
          monthKey: bucket.monthKey,
          added: monthRecords.length,
          active: monthRecords.filter((r) => r.status === "active").length,
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
        <div className="text-slate-500">Loading insider list records...</div>
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
            <h1 className="text-2xl font-bold text-slate-900">Insider List Register</h1>
            <p className="text-slate-500">
              Manage insider lists and track access to inside information
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
            Add Insider
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
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-slate-500">Total Entries</p>
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
                  <XCircle className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-slate-500">Closed</p>
                    <p className="text-2xl font-bold">{stats.closed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-xs text-slate-500">Ack. Pending</p>
                    <p className="text-2xl font-bold">{stats.acknowledgmentsPending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Insider Additions Trend</CardTitle>
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
                      <Bar dataKey="added" fill="#3b82f6" name="Added" onClick={(data) => handleMonthClick(data?.payload)} />
                      <Bar dataKey="active" fill="#10b981" name="Active" onClick={(data) => handleMonthClick(data?.payload)} />
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acknowledgment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={acknowledgmentData}
                      layout="vertical"
                      margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={140} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                        {acknowledgmentData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? "#10b981" : "#f59e0b"}
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
                <CardTitle className="text-lg">Insiders by Project</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectData} layout="vertical">
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
                  placeholder="Search by name, reference, project, or company..."
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
                {LIST_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterAcknowledgment} onValueChange={setFilterAcknowledgment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Acknowledgment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Acknowledgments</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
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
                    <TableHead>Project Name</TableHead>
                    <TableHead>Insider Name</TableHead>
                    <TableHead>Insider Role</TableHead>
                    <TableHead>Insider Company</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Acknowledgment</TableHead>
                    <TableHead>List Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                        No insider list records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.list_reference}
                        </TableCell>
                        <TableCell>{record.project_name}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.insider_name}</p>
                            {record.insider_email && (
                              <p className="text-xs text-slate-500">{record.insider_email}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{record.insider_role || "-"}</TableCell>
                        <TableCell>{record.insider_company || "-"}</TableCell>
                        <TableCell>
                          {record.date_added
                            ? new Date(record.date_added).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>{getAcknowledgmentBadge(record.acknowledgment_received)}</TableCell>
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
              {editingRecord ? "Edit Insider List Entry" : "Add New Insider"}
            </DialogTitle>
            <DialogDescription>
              Record an insider with access to inside information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="list_reference">List Reference *</Label>
                  <Input
                    id="list_reference"
                    value={formData.list_reference}
                    onChange={(e) =>
                      setFormData({ ...formData, list_reference: e.target.value })
                    }
                    placeholder="INS-2024-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project_name">Project Name *</Label>
                  <Input
                    id="project_name"
                    value={formData.project_name}
                    onChange={(e) =>
                      setFormData({ ...formData, project_name: e.target.value })
                    }
                    placeholder="e.g., Project Alpha"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insider_name">Insider Name *</Label>
                  <Input
                    id="insider_name"
                    value={formData.insider_name}
                    onChange={(e) =>
                      setFormData({ ...formData, insider_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insider_role">Insider Role</Label>
                  <Input
                    id="insider_role"
                    value={formData.insider_role}
                    onChange={(e) =>
                      setFormData({ ...formData, insider_role: e.target.value })
                    }
                    placeholder="e.g., Legal Advisor"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insider_company">Insider Company</Label>
                  <Input
                    id="insider_company"
                    value={formData.insider_company}
                    onChange={(e) =>
                      setFormData({ ...formData, insider_company: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insider_email">Insider Email</Label>
                  <Input
                    id="insider_email"
                    type="email"
                    value={formData.insider_email}
                    onChange={(e) =>
                      setFormData({ ...formData, insider_email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insider_phone">Insider Phone</Label>
                  <Input
                    id="insider_phone"
                    value={formData.insider_phone}
                    onChange={(e) =>
                      setFormData({ ...formData, insider_phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="access_granted_by">Access Granted By</Label>
                  <Input
                    id="access_granted_by"
                    value={formData.access_granted_by}
                    onChange={(e) =>
                      setFormData({ ...formData, access_granted_by: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_added">Date Added</Label>
                  <Input
                    id="date_added"
                    type="date"
                    value={formData.date_added}
                    onChange={(e) =>
                      setFormData({ ...formData, date_added: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_removed">Date Removed</Label>
                  <Input
                    id="date_removed"
                    type="date"
                    value={formData.date_removed}
                    onChange={(e) =>
                      setFormData({ ...formData, date_removed: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason_for_access">Reason for Access</Label>
                <Textarea
                  id="reason_for_access"
                  value={formData.reason_for_access}
                  onChange={(e) =>
                    setFormData({ ...formData, reason_for_access: e.target.value })
                  }
                  rows={2}
                  placeholder="Describe why this person needs access to inside information"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="acknowledgment_received"
                    checked={formData.acknowledgment_received}
                    onChange={(e) =>
                      setFormData({ ...formData, acknowledgment_received: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="acknowledgment_received">Acknowledgment Received</Label>
                </div>
                {formData.acknowledgment_received && (
                  <div className="space-y-2">
                    <Label htmlFor="acknowledgment_date">Acknowledgment Date</Label>
                    <Input
                      id="acknowledgment_date"
                      type="date"
                      value={formData.acknowledgment_date}
                      onChange={(e) =>
                        setFormData({ ...formData, acknowledgment_date: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">List Status</Label>
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
                    {LIST_STATUSES.map((s) => (
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
                {editingRecord ? "Update Entry" : "Add Insider"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
