"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plus,
  Loader2,
  MessageSquareWarning,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { RegisterToolbar, ViewMode } from "@/components/registers/RegisterToolbar";
import { RegisterDataTable, Column, renderBadge, renderDate, renderCurrency } from "@/components/registers/RegisterDataTable";
import { StatCard, DonutChart, BarChart, TrendChart } from "@/components/registers/RegisterCharts";
import { exportToCSV, transforms } from "@/lib/export-utils";

interface ComplaintRecord {
  id: string;
  complaint_reference?: string;
  complainant_name: string;
  complaint_type: string;
  complaint_category: string;
  received_date: string;
  acknowledged_date?: string;
  resolution_deadline?: string;
  resolved_date?: string;
  root_cause?: string;
  remedial_action?: string;
  compensation_amount?: number;
  fos_referred: boolean;
  status: string;
  assigned_to?: string;
  priority: string;
  notes?: string;
  created_at: string;
}

const typeLabels: Record<string, string> = {
  product: "Product Issue",
  service: "Service Issue",
  staff_conduct: "Staff Conduct",
  fees: "Fees/Charges",
  advice: "Advice Given",
  delay: "Delay",
  communication: "Communication",
  other: "Other",
};

const categoryLabels: Record<string, string> = {
  upheld: "Upheld",
  partially_upheld: "Partially Upheld",
  rejected: "Rejected",
  pending: "Pending",
};

const statusColors: Record<string, string> = {
  open: "bg-amber-100 text-amber-700",
  investigating: "bg-blue-100 text-blue-700",
  resolved: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-100 text-slate-700",
  escalated: "bg-red-100 text-red-700",
};

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const chartColors = {
  open: "#f59e0b",
  investigating: "#3b82f6",
  resolved: "#10b981",
  closed: "#64748b",
  escalated: "#ef4444",
};

export function ComplaintsRegisterClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const packId = searchParams.get("packId");

  const [records, setRecords] = useState<ComplaintRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    status: "all",
    priority: "all",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drillDownFilter, setDrillDownFilter] = useState<{ key: string; value: string } | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ComplaintRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    complainant_name: "",
    complaint_type: "other",
    complaint_category: "pending",
    received_date: new Date().toISOString().split("T")[0],
    status: "open",
    priority: "medium",
    assigned_to: "",
    root_cause: "",
    remedial_action: "",
    compensation_amount: "",
    fos_referred: false,
    notes: "",
  });

  const loadRecords = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = packId
        ? `/api/registers/complaints?packId=${packId}`
        : "/api/registers/complaints";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch records");
      const data = await res.json();
      setRecords(data.records || []);
    } catch (err) {
      setError("Failed to load complaints");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [packId]);

  const resetForm = () => {
    setFormData({
      complainant_name: "",
      complaint_type: "other",
      complaint_category: "pending",
      received_date: new Date().toISOString().split("T")[0],
      status: "open",
      priority: "medium",
      assigned_to: "",
      root_cause: "",
      remedial_action: "",
      compensation_amount: "",
      fos_referred: false,
      notes: "",
    });
  };

  const handleSave = async () => {
    if (!formData.complainant_name.trim()) {
      alert("Complainant name is required");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        pack_id: packId || undefined,
        compensation_amount: formData.compensation_amount
          ? parseFloat(formData.compensation_amount)
          : undefined,
      };

      const url = editingRecord
        ? `/api/registers/complaints/${editingRecord.id}`
        : "/api/registers/complaints";
      const method = editingRecord ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save");

      setShowAddDialog(false);
      setEditingRecord(null);
      resetForm();
      loadRecords();
    } catch (err) {
      alert("Failed to save complaint");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this complaint?")) return;
    try {
      const res = await fetch(`/api/registers/complaints/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      loadRecords();
    } catch (err) {
      alert("Failed to delete complaint");
    }
  };

  const handleViewDetail = (record: ComplaintRecord) => {
    router.push(`/registers/complaints/${record.id}`);
  };

  const openEditDialog = (record: ComplaintRecord) => {
    setEditingRecord(record);
    setFormData({
      complainant_name: record.complainant_name,
      complaint_type: record.complaint_type,
      complaint_category: record.complaint_category,
      received_date: record.received_date?.split("T")[0] || "",
      status: record.status,
      priority: record.priority,
      assigned_to: record.assigned_to || "",
      root_cause: record.root_cause || "",
      remedial_action: record.remedial_action || "",
      compensation_amount: record.compensation_amount?.toString() || "",
      fos_referred: record.fos_referred,
      notes: record.notes || "",
    });
    setShowAddDialog(true);
  };

  const handleBulkImport = async (data: Record<string, unknown>[]) => {
    const results = await Promise.allSettled(
      data.map((row) =>
        fetch("/api/registers/complaints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            complainant_name: row.complainant_name || row["Complainant Name"],
            complaint_type: row.complaint_type || row["Type"] || "other",
            complaint_category: row.complaint_category || row["Category"] || "pending",
            received_date: row.received_date || row["Received Date"] || new Date().toISOString(),
            status: row.status || row["Status"] || "open",
            priority: row.priority || row["Priority"] || "medium",
            assigned_to: row.assigned_to || row["Assigned To"] || "",
            notes: row.notes || row["Notes"] || "",
            pack_id: packId || undefined,
          }),
        })
      )
    );

    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) {
      alert(`${failed} records failed to import`);
    }
    loadRecords();
  };

  // Filter and search records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.complainant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.complaint_reference?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterValues.status === "all" || r.status === filterValues.status;
      const matchesPriority = filterValues.priority === "all" || r.priority === filterValues.priority;
      const matchesDrillDown = !drillDownFilter ||
        (drillDownFilter.key === "status" && r.status === drillDownFilter.value) ||
        (drillDownFilter.key === "type" && r.complaint_type === drillDownFilter.value) ||
        (drillDownFilter.key === "priority" && r.priority === drillDownFilter.value);
      return matchesSearch && matchesStatus && matchesPriority && matchesDrillDown;
    });
  }, [records, searchQuery, filterValues, drillDownFilter]);

  // Statistics
  const stats = useMemo(() => ({
    total: records.length,
    open: records.filter((r) => r.status === "open").length,
    investigating: records.filter((r) => r.status === "investigating").length,
    resolved: records.filter((r) => r.status === "resolved" || r.status === "closed").length,
    escalated: records.filter((r) => r.status === "escalated").length,
    urgent: records.filter((r) => r.priority === "urgent" || r.priority === "high").length,
  }), [records]);

  // Chart data
  const statusChartData = useMemo(() => [
    { label: "Open", value: stats.open, color: chartColors.open },
    { label: "Investigating", value: stats.investigating, color: chartColors.investigating },
    { label: "Resolved", value: stats.resolved, color: chartColors.resolved },
    { label: "Escalated", value: stats.escalated, color: chartColors.escalated },
  ], [stats]);

  const typeChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach((r) => {
      counts[r.complaint_type] = (counts[r.complaint_type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      label: typeLabels[type] || type,
      value: count,
    }));
  }, [records]);

  const trendData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((label) => ({
      label,
      value: Math.floor(Math.random() * 20) + 5, // Placeholder - replace with real data
    }));
  }, []);

  // Table columns
  const columns: Column<ComplaintRecord>[] = [
    {
      key: "complaint_reference",
      header: "Reference",
      sortable: true,
      width: "120px",
      render: (value, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/registers/complaints/${row.id}`);
          }}
          className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline"
        >
          {value as string || "-"}
        </button>
      ),
    },
    {
      key: "complainant_name",
      header: "Complainant",
      sortable: true,
      render: (value, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/registers/complaints/${row.id}`);
          }}
          className="font-medium text-slate-900 hover:text-blue-600 hover:underline"
        >
          {value as string}
        </button>
      ),
    },
    {
      key: "complaint_type",
      header: "Type",
      sortable: true,
      render: (value, _row) => typeLabels[value as string] || String(value),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value, _row) => renderBadge(value as string, statusColors),
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (value, _row) => renderBadge(value as string, priorityColors),
    },
    {
      key: "received_date",
      header: "Received",
      sortable: true,
      render: (value, _row) => renderDate(value as string),
    },
    {
      key: "assigned_to",
      header: "Assigned To",
      sortable: true,
      render: (value, _row) => (value as string) || "-",
    },
  ];

  // Export handlers
  const handleExportSelected = () => {
    const selectedRecords = records.filter((r) => selectedIds.has(r.id));
    exportToCSV(selectedRecords as unknown as Record<string, unknown>[], [
      { key: "complaint_reference", header: "Reference" },
      { key: "complainant_name", header: "Complainant" },
      { key: "complaint_type", header: "Type", transform: (v) => typeLabels[v as string] || String(v) },
      { key: "status", header: "Status", transform: transforms.titleCase },
      { key: "priority", header: "Priority", transform: transforms.titleCase },
      { key: "received_date", header: "Received Date", transform: transforms.date },
      { key: "assigned_to", header: "Assigned To" },
      { key: "compensation_amount", header: "Compensation", transform: transforms.currency },
      { key: "notes", header: "Notes" },
    ], "complaints_selected");
  };

  const handleExportAll = () => {
    exportToCSV(filteredRecords as unknown as Record<string, unknown>[], [
      { key: "complaint_reference", header: "Reference" },
      { key: "complainant_name", header: "Complainant" },
      { key: "complaint_type", header: "Type", transform: (v) => typeLabels[v as string] || String(v) },
      { key: "status", header: "Status", transform: transforms.titleCase },
      { key: "priority", header: "Priority", transform: transforms.titleCase },
      { key: "received_date", header: "Received Date", transform: transforms.date },
      { key: "assigned_to", header: "Assigned To" },
      { key: "compensation_amount", header: "Compensation", transform: transforms.currency },
      { key: "root_cause", header: "Root Cause" },
      { key: "remedial_action", header: "Remedial Action" },
      { key: "notes", header: "Notes" },
    ], "complaints_register");
  };

  const handleDrillDown = (key: string, value: string) => {
    if (drillDownFilter?.key === key && drillDownFilter?.value === value) {
      setDrillDownFilter(null);
    } else {
      setDrillDownFilter({ key, value });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Complaints Register</h1>
          <p className="text-sm text-slate-500">Track and manage customer complaints</p>
        </div>
        <Button onClick={() => { resetForm(); setEditingRecord(null); setShowAddDialog(true); }}>
          <Plus className="mr-2 h-4 w-4" /> New Complaint
        </Button>
      </div>

      {/* Toolbar */}
      <RegisterToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "open", label: "Open" },
              { value: "investigating", label: "Investigating" },
              { value: "resolved", label: "Resolved" },
              { value: "closed", label: "Closed" },
              { value: "escalated", label: "Escalated" },
            ],
          },
          {
            key: "priority",
            label: "Priority",
            options: [
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "urgent", label: "Urgent" },
            ],
          },
        ]}
        filterValues={filterValues}
        onFilterChange={(key, value) => setFilterValues({ ...filterValues, [key]: value })}
        selectedCount={selectedIds.size}
        onExportSelected={handleExportSelected}
        onExportAll={handleExportAll}
        onBulkImport={handleBulkImport}
        importTemplate={{
          headers: ["Complainant Name", "Type", "Priority", "Status", "Received Date", "Assigned To", "Notes"],
          sampleRow: ["John Smith", "service", "medium", "open", "2024-01-15", "Jane Doe", "Initial complaint"],
        }}
        registerName="Complaints"
      />

      {/* Drill-down indicator */}
      {drillDownFilter && (
        <div className="flex items-center gap-2 rounded-lg bg-teal-50 px-4 py-2">
          <span className="text-sm text-teal-700">
            Filtered by {drillDownFilter.key}: <strong>{drillDownFilter.value}</strong>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDrillDownFilter(null)}
            className="h-6 text-teal-600 hover:text-teal-700"
          >
            Clear filter
          </Button>
        </div>
      )}

      {/* Dashboard View */}
      {viewMode === "dashboard" && (
        <div className="space-y-6">
          {/* Stat Cards - Drill-down enabled */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              title="Total Complaints"
              value={stats.total}
              icon={<MessageSquareWarning className="h-5 w-5" />}
              color="slate"
              onClick={() => setDrillDownFilter(null)}
              isActive={!drillDownFilter}
            />
            <StatCard
              title="Open"
              value={stats.open}
              icon={<Clock className="h-5 w-5" />}
              color="amber"
              onClick={() => handleDrillDown("status", "open")}
              isActive={drillDownFilter?.key === "status" && drillDownFilter?.value === "open"}
            />
            <StatCard
              title="Investigating"
              value={stats.investigating}
              icon={<AlertTriangle className="h-5 w-5" />}
              color="blue"
              onClick={() => handleDrillDown("status", "investigating")}
              isActive={drillDownFilter?.key === "status" && drillDownFilter?.value === "investigating"}
            />
            <StatCard
              title="Resolved"
              value={stats.resolved}
              icon={<CheckCircle className="h-5 w-5" />}
              color="emerald"
              onClick={() => handleDrillDown("status", "resolved")}
              isActive={drillDownFilter?.key === "status" && drillDownFilter?.value === "resolved"}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <DonutChart
              data={statusChartData}
              title="Complaints by Status"
              onSegmentClick={(label) => handleDrillDown("status", label.toLowerCase())}
              activeSegment={drillDownFilter?.key === "status" ? drillDownFilter.value : undefined}
            />
            <BarChart
              data={typeChartData}
              title="Complaints by Type"
              onBarClick={(label) => {
                const typeKey = Object.entries(typeLabels).find(([, v]) => v === label)?.[0];
                if (typeKey) handleDrillDown("type", typeKey);
              }}
              activeBar={drillDownFilter?.key === "type" ? typeLabels[drillDownFilter.value] : undefined}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <TrendChart
              data={trendData}
              title="Complaints Trend (6 Months)"
              color="#f59e0b"
            />
            <StatCard
              title="High Priority"
              value={stats.urgent}
              subtitle="Urgent + High priority complaints"
              icon={<XCircle className="h-5 w-5" />}
              color="red"
              onClick={() => handleDrillDown("priority", "high")}
              isActive={drillDownFilter?.key === "priority" && drillDownFilter?.value === "high"}
            />
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <RegisterDataTable
          columns={columns}
          data={filteredRecords}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onView={handleViewDetail}
          onEdit={openEditDialog}
          onDelete={handleDelete}
          rowClassName={(row) =>
            row.priority === "urgent" ? "bg-red-50/50" :
            row.priority === "high" ? "bg-orange-50/50" : ""
          }
          emptyMessage="No complaints found"
          emptyIcon={<MessageSquareWarning className="h-12 w-12" />}
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? "Edit Complaint" : "New Complaint"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Complainant Name *</Label>
                <Input
                  value={formData.complainant_name}
                  onChange={(e) => setFormData({ ...formData, complainant_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Received Date</Label>
                <Input
                  type="date"
                  value={formData.received_date}
                  onChange={(e) => setFormData({ ...formData, received_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Complaint Type</Label>
                <Select
                  value={formData.complaint_type}
                  onValueChange={(v) => setFormData({ ...formData, complaint_type: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setFormData({ ...formData, priority: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Outcome</Label>
                <Select
                  value={formData.complaint_category}
                  onValueChange={(v) => setFormData({ ...formData, complaint_category: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Assigned To</Label>
                <Input
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Compensation (GBP)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.compensation_amount}
                  onChange={(e) => setFormData({ ...formData, compensation_amount: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Root Cause</Label>
              <Textarea
                value={formData.root_cause}
                onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Remedial Action</Label>
              <Textarea
                value={formData.remedial_action}
                onChange={(e) => setFormData({ ...formData, remedial_action: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingRecord ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
