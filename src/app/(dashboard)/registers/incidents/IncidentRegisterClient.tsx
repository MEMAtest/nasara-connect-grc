"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { generateTrendData, getMonthKey, type TrendPoint } from "@/lib/chart-utils";
import { useToast } from "@/components/toast-provider";
import {
  Plus,
  Loader2,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { RegisterToolbar, ViewMode } from "@/components/registers/RegisterToolbar";
import { RegisterDataTable, Column, renderBadge, renderDate, renderCurrency } from "@/components/registers/RegisterDataTable";
import { StatCard, DonutChart, BarChart, TrendChart } from "@/components/registers/RegisterCharts";
import { exportToCSV, transforms } from "@/lib/export-utils";
import { PaginationControls, usePagination } from "@/components/ui/pagination-controls";

interface IncidentRecord {
  id: string;
  incident_reference?: string;
  incident_title: string;
  incident_type: string;
  severity: string;
  detected_date: string;
  occurred_date?: string;
  resolved_date?: string;
  description?: string;
  root_cause?: string;
  impact_assessment?: string;
  immediate_actions?: string;
  remedial_actions?: string;
  lessons_learned?: string;
  regulatory_notification_required: boolean;
  status: string;
  assigned_to?: string;
  affected_customers_count: number;
  financial_impact?: number;
  notes?: string;
}

const typeLabels: Record<string, string> = {
  operational: "Operational",
  security: "Security",
  data_breach: "Data Breach",
  system_failure: "System Failure",
  fraud: "Fraud",
  compliance: "Compliance",
  human_error: "Human Error",
  third_party: "Third Party",
  other: "Other",
};

const severityColors: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const statusColors: Record<string, string> = {
  detected: "bg-amber-100 text-amber-700",
  investigating: "bg-blue-100 text-blue-700",
  contained: "bg-purple-100 text-purple-700",
  resolved: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-100 text-slate-700",
};

const chartColors = {
  detected: "#f59e0b",
  investigating: "#3b82f6",
  contained: "#8b5cf6",
  resolved: "#10b981",
  closed: "#64748b",
};

const severityChartColors: Record<string, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

export function IncidentRegisterClient() {
  const searchParams = useSearchParams();
  const packId = searchParams.get("packId");
  const toast = useToast();
  const [records, setRecords] = useState<IncidentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    severity: "all",
    status: "all",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drillDownFilter, setDrillDownFilter] = useState<{ key: string; value: string } | null>(null);
  const [monthFilter, setMonthFilter] = useState<{ key: string; label: string } | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IncidentRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    incident_title: "",
    incident_type: "other",
    severity: "medium",
    detected_date: new Date().toISOString().split("T")[0],
    status: "detected",
    assigned_to: "",
    description: "",
    root_cause: "",
    impact_assessment: "",
    immediate_actions: "",
    remedial_actions: "",
    lessons_learned: "",
    regulatory_notification_required: false,
    affected_customers_count: "0",
    financial_impact: "",
    notes: "",
  });

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const url = packId ? `/api/registers/incidents?packId=${packId}` : "/api/registers/incidents";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRecords(data.records || []);
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [packId]);

  const resetForm = () =>
    setFormData({
      incident_title: "",
      incident_type: "other",
      severity: "medium",
      detected_date: new Date().toISOString().split("T")[0],
      status: "detected",
      assigned_to: "",
      description: "",
      root_cause: "",
      impact_assessment: "",
      immediate_actions: "",
      remedial_actions: "",
      lessons_learned: "",
      regulatory_notification_required: false,
      affected_customers_count: "0",
      financial_impact: "",
      notes: "",
    });

  const handleSave = async () => {
    if (!formData.incident_title.trim()) {
      toast.error("Title required");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        pack_id: packId || undefined,
        affected_customers_count: parseInt(formData.affected_customers_count) || 0,
        financial_impact: formData.financial_impact ? parseFloat(formData.financial_impact) : undefined,
      };
      const url = editingRecord ? `/api/registers/incidents/${editingRecord.id}` : "/api/registers/incidents";
      const res = await fetch(url, {
        method: editingRecord ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      setShowAddDialog(false);
      setEditingRecord(null);
      resetForm();
      loadRecords();
    } catch {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this incident?")) return;
    try {
      await fetch(`/api/registers/incidents/${id}`, { method: "DELETE" });
      loadRecords();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const openEdit = (r: IncidentRecord) => {
    setEditingRecord(r);
    setFormData({
      incident_title: r.incident_title,
      incident_type: r.incident_type,
      severity: r.severity,
      detected_date: r.detected_date?.split("T")[0] || "",
      status: r.status,
      assigned_to: r.assigned_to || "",
      description: r.description || "",
      root_cause: r.root_cause || "",
      impact_assessment: r.impact_assessment || "",
      immediate_actions: r.immediate_actions || "",
      remedial_actions: r.remedial_actions || "",
      lessons_learned: r.lessons_learned || "",
      regulatory_notification_required: r.regulatory_notification_required,
      affected_customers_count: r.affected_customers_count?.toString() || "0",
      financial_impact: r.financial_impact?.toString() || "",
      notes: r.notes || "",
    });
    setShowAddDialog(true);
  };

  const handleBulkImport = async (data: Record<string, unknown>[]) => {
    const results = await Promise.allSettled(
      data.map((row) =>
        fetch("/api/registers/incidents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            incident_title: row.incident_title || row["Title"],
            incident_type: row.incident_type || row["Type"] || "other",
            severity: row.severity || row["Severity"] || "medium",
            detected_date: row.detected_date || row["Detected Date"] || new Date().toISOString(),
            status: row.status || row["Status"] || "detected",
            assigned_to: row.assigned_to || row["Assigned To"] || "",
            description: row.description || row["Description"] || "",
            pack_id: packId || undefined,
          }),
        })
      )
    );

    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) toast.error(`${failed} records failed to import`);
    loadRecords();
  };

  // Filter records
  const baseFilteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.incident_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.incident_reference?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = filterValues.severity === "all" || r.severity === filterValues.severity;
      const matchesStatus = filterValues.status === "all" || r.status === filterValues.status;
      const matchesDrillDown =
        !drillDownFilter ||
        (drillDownFilter.key === "severity" && r.severity === drillDownFilter.value) ||
        (drillDownFilter.key === "status" && r.status === drillDownFilter.value) ||
        (drillDownFilter.key === "type" && r.incident_type === drillDownFilter.value);
      return matchesSearch && matchesSeverity && matchesStatus && matchesDrillDown;
    });
  }, [records, searchQuery, filterValues, drillDownFilter]);

  const filteredRecords = useMemo(() => {
    if (!monthFilter) return baseFilteredRecords;
    return baseFilteredRecords.filter((r) => getMonthKey(r.detected_date) === monthFilter.key);
  }, [baseFilteredRecords, monthFilter]);

  // Pagination
  const {
    paginatedData,
    paginationProps,
  } = usePagination(filteredRecords, { initialLimit: 25 });

  // Statistics
  const stats = useMemo(
    () => ({
      total: filteredRecords.length,
      critical: filteredRecords.filter((r) => r.severity === "critical").length,
      high: filteredRecords.filter((r) => r.severity === "high").length,
      open: filteredRecords.filter((r) => ["detected", "investigating", "contained"].includes(r.status)).length,
      resolved: filteredRecords.filter((r) => r.status === "resolved" || r.status === "closed").length,
    }),
    [filteredRecords]
  );

  // Chart data
  const severityChartData = useMemo(
    () => [
      { label: "Critical", value: stats.critical, color: severityChartColors.critical },
      { label: "High", value: stats.high, color: severityChartColors.high },
      { label: "Medium", value: filteredRecords.filter((r) => r.severity === "medium").length, color: severityChartColors.medium },
      { label: "Low", value: filteredRecords.filter((r) => r.severity === "low").length, color: severityChartColors.low },
    ],
    [filteredRecords, stats]
  );

  const typeChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      counts[r.incident_type] = (counts[r.incident_type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      label: typeLabels[type] || type,
      value: count,
    }));
  }, [filteredRecords]);

  const trendData = useMemo(() => {
    return generateTrendData(baseFilteredRecords, 6, 'detected_date');
  }, [baseFilteredRecords]);

  const monthOptions = useMemo(
    () =>
      trendData.map((point) => ({
        value: point.monthKey,
        label: new Date(point.startDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
      })),
    [trendData]
  );

  // Table columns
  const columns: Column<IncidentRecord>[] = [
    {
      key: "incident_reference",
      header: "Reference",
      sortable: true,
      width: "120px",
      render: (value) => <span className="font-mono text-xs text-slate-500">{(value as string) || "-"}</span>,
    },
    {
      key: "incident_title",
      header: "Title",
      sortable: true,
      render: (value) => <span className="font-medium text-slate-900">{value as string}</span>,
    },
    {
      key: "incident_type",
      header: "Type",
      sortable: true,
      render: (value) => typeLabels[value as string] || value,
    },
    {
      key: "severity",
      header: "Severity",
      sortable: true,
      render: (value) => renderBadge(value as string, severityColors),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value) => renderBadge(value as string, statusColors),
    },
    {
      key: "detected_date",
      header: "Detected",
      sortable: true,
      render: (value) => renderDate(value as string),
    },
    {
      key: "affected_customers_count",
      header: "Affected",
      sortable: true,
      render: (value) => (value as number) || 0,
    },
  ];

  // Export handlers
  const handleExportSelected = () => {
    const selectedRecords = records.filter((r) => selectedIds.has(r.id));
    exportToCSV(
      selectedRecords,
      [
        { key: "incident_reference", header: "Reference" },
        { key: "incident_title", header: "Title" },
        { key: "incident_type", header: "Type", transform: (v) => typeLabels[v as string] || String(v) },
        { key: "severity", header: "Severity", transform: transforms.titleCase },
        { key: "status", header: "Status", transform: transforms.titleCase },
        { key: "detected_date", header: "Detected Date", transform: transforms.date },
        { key: "affected_customers_count", header: "Affected Customers" },
        { key: "financial_impact", header: "Financial Impact", transform: transforms.currency },
        { key: "description", header: "Description" },
      ],
      "incidents_selected"
    );
  };

  const handleExportAll = () => {
    exportToCSV(
      filteredRecords,
      [
        { key: "incident_reference", header: "Reference" },
        { key: "incident_title", header: "Title" },
        { key: "incident_type", header: "Type", transform: (v) => typeLabels[v as string] || String(v) },
        { key: "severity", header: "Severity", transform: transforms.titleCase },
        { key: "status", header: "Status", transform: transforms.titleCase },
        { key: "detected_date", header: "Detected Date", transform: transforms.date },
        { key: "affected_customers_count", header: "Affected Customers" },
        { key: "financial_impact", header: "Financial Impact", transform: transforms.currency },
        { key: "description", header: "Description" },
        { key: "root_cause", header: "Root Cause" },
        { key: "remedial_actions", header: "Remedial Actions" },
      ],
      "incidents_register"
    );
  };

  const handleDrillDown = (key: string, value: string) => {
    if (drillDownFilter?.key === key && drillDownFilter?.value === value) {
      setDrillDownFilter(null);
    } else {
      setDrillDownFilter({ key, value });
    }
  };

  const handleMonthFilter = (point: TrendPoint) => {
    const key = point.monthKey || point.label;
    if (!key) return;
    if (monthFilter?.key === key) {
      setMonthFilter(null);
      return;
    }
    const label = point.startDate
      ? new Date(point.startDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
      : point.label;
    setMonthFilter({ key, label });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Incident Register</h1>
          <p className="text-sm text-slate-500">Track operational incidents and near-misses</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditingRecord(null);
            setShowAddDialog(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> New Incident
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
            key: "severity",
            label: "Severity",
            options: [
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "critical", label: "Critical" },
            ],
          },
          {
            key: "status",
            label: "Status",
            options: [
              { value: "detected", label: "Detected" },
              { value: "investigating", label: "Investigating" },
              { value: "contained", label: "Contained" },
              { value: "resolved", label: "Resolved" },
              { value: "closed", label: "Closed" },
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
          headers: ["Title", "Type", "Severity", "Status", "Detected Date", "Description"],
          sampleRow: ["Server Outage", "system_failure", "high", "detected", "2024-01-15", "Main server went down"],
        }}
        registerName="Incidents"
        monthFilter={{
          value: monthFilter?.key || "all",
          options: monthOptions,
          onChange: (value) => {
            if (value === "all") {
              setMonthFilter(null);
              return;
            }
            const label = monthOptions.find((opt) => opt.value === value)?.label || value;
            setMonthFilter({ key: value, label });
          },
          label: "Month",
        }}
      />

      {/* Drill-down indicator */}
      {drillDownFilter && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2">
          <span className="text-sm text-red-700">
            Filtered by {drillDownFilter.key}: <strong>{drillDownFilter.value}</strong>
          </span>
          <Button variant="ghost" size="sm" onClick={() => setDrillDownFilter(null)} className="h-6 text-red-600 hover:text-red-700">
            Clear filter
          </Button>
        </div>
      )}
      {monthFilter && (
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2">
          <span className="text-sm text-slate-700">
            Filtered by month: <strong>{monthFilter.label}</strong>
          </span>
          <Button variant="ghost" size="sm" onClick={() => setMonthFilter(null)} className="h-6 text-slate-600 hover:text-slate-700">
            Clear month
          </Button>
        </div>
      )}

      {/* Dashboard View */}
      {viewMode === "dashboard" && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              title="Total Incidents"
              value={stats.total}
              icon={<ShieldAlert className="h-5 w-5" />}
              color="slate"
              onClick={() => setDrillDownFilter(null)}
              isActive={!drillDownFilter}
            />
            <StatCard
              title="Critical"
              value={stats.critical}
              icon={<Zap className="h-5 w-5" />}
              color="red"
              onClick={() => handleDrillDown("severity", "critical")}
              isActive={drillDownFilter?.key === "severity" && drillDownFilter?.value === "critical"}
            />
            <StatCard
              title="Open"
              value={stats.open}
              icon={<Clock className="h-5 w-5" />}
              color="amber"
              onClick={() => handleDrillDown("status", "detected")}
              isActive={drillDownFilter?.key === "status" && drillDownFilter?.value === "detected"}
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
              data={severityChartData}
              title="Incidents by Severity"
              onSegmentClick={(label) => handleDrillDown("severity", label.toLowerCase())}
              activeSegment={drillDownFilter?.key === "severity" ? drillDownFilter.value : undefined}
            />
            <BarChart
              data={typeChartData}
              title="Incidents by Type"
              onBarClick={(label) => {
                const typeKey = Object.entries(typeLabels).find(([, v]) => v === label)?.[0];
                if (typeKey) handleDrillDown("type", typeKey);
              }}
              activeBar={drillDownFilter?.key === "type" ? typeLabels[drillDownFilter.value] : undefined}
            />
          </div>

          <TrendChart
            data={trendData}
            title="Incidents Trend (6 Months)"
            color="#ef4444"
            onPointClick={handleMonthFilter}
            activePointKey={monthFilter?.key}
          />
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <>
          <RegisterDataTable
            columns={columns}
            data={paginatedData}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onEdit={openEdit}
            onDelete={handleDelete}
            rowClassName={(row) =>
              row.severity === "critical" ? "bg-red-50/50" : row.severity === "high" ? "bg-orange-50/50" : ""
            }
            emptyMessage="No incidents found"
            emptyIcon={<ShieldAlert className="h-12 w-12" />}
          />
          <PaginationControls {...paginationProps} />
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit" : "New"} Incident</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.incident_title}
                  onChange={(e) => setFormData({ ...formData, incident_title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Detected Date</Label>
                <Input
                  type="date"
                  value={formData.detected_date}
                  onChange={(e) => setFormData({ ...formData, detected_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.incident_type} onValueChange={(v) => setFormData({ ...formData, incident_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select value={formData.severity} onValueChange={(v) => setFormData({ ...formData, severity: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="detected">Detected</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="contained">Contained</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Root Cause</Label>
              <Textarea
                value={formData.root_cause}
                onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Affected Customers</Label>
                <Input
                  type="number"
                  value={formData.affected_customers_count}
                  onChange={(e) => setFormData({ ...formData, affected_customers_count: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Financial Impact (GBP)</Label>
                <Input
                  type="number"
                  value={formData.financial_impact}
                  onChange={(e) => setFormData({ ...formData, financial_impact: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
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
