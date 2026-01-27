"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { generateTrendData, getMonthKey, type TrendPoint } from "@/lib/chart-utils";
import { useToast } from "@/components/toast-provider";
import { Plus, Loader2, AlertOctagon, AlertTriangle, CheckCircle, Clock, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RegisterToolbar, ViewMode } from "@/components/registers/RegisterToolbar";
import { RegisterDataTable, Column, renderBadge, renderDate } from "@/components/registers/RegisterDataTable";
import { StatCard, DonutChart, BarChart, TrendChart } from "@/components/registers/RegisterCharts";
import { exportToCSV, transforms } from "@/lib/export-utils";
import { PaginationControls, usePagination } from "@/components/ui/pagination-controls";

interface RegulatoryBreachRecord {
  id: string;
  breach_reference: string;
  breach_title: string;
  breach_type: string;
  regulatory_rule?: string;
  regulator?: string;
  identified_date: string;
  identified_by?: string;
  breach_description: string;
  root_cause?: string;
  impact_assessment?: string;
  customers_affected: number;
  financial_impact?: number;
  severity: string;
  reported_to_regulator: boolean;
  report_date?: string;
  regulator_reference?: string;
  remediation_plan?: string;
  remediation_deadline?: string;
  remediation_status: string;
  lessons_learned?: string;
  status: string;
  notes?: string;
}

const typeLabels: Record<string, string> = {
  conduct: "Conduct",
  prudential: "Prudential",
  aml: "AML/Financial Crime",
  data_protection: "Data Protection",
  consumer_duty: "Consumer Duty",
  reporting: "Regulatory Reporting",
  operational: "Operational",
  governance: "Governance",
  other: "Other",
};

const statusColors: Record<string, string> = {
  open: "bg-red-100 text-red-700",
  investigating: "bg-amber-100 text-amber-700",
  remediation: "bg-blue-100 text-blue-700",
  closed: "bg-emerald-100 text-emerald-700",
  reported: "bg-purple-100 text-purple-700",
};

const severityColors: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const chartColors = {
  open: "#ef4444",
  investigating: "#f59e0b",
  remediation: "#3b82f6",
  closed: "#10b981",
  reported: "#8b5cf6",
};

export function RegulatoryBreachClient() {
  const searchParams = useSearchParams();
  const packId = searchParams.get("packId");
  const toast = useToast();
  const [records, setRecords] = useState<RegulatoryBreachRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    status: "all",
    severity: "all",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drillDownFilter, setDrillDownFilter] = useState<{ key: string; value: string } | null>(null);
  const [monthFilter, setMonthFilter] = useState<{ key: string; label: string } | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RegulatoryBreachRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    breach_reference: "",
    breach_title: "",
    breach_type: "other",
    regulatory_rule: "",
    regulator: "FCA",
    identified_date: new Date().toISOString().split("T")[0],
    identified_by: "",
    breach_description: "",
    root_cause: "",
    impact_assessment: "",
    customers_affected: 0,
    financial_impact: "",
    severity: "medium",
    reported_to_regulator: false,
    remediation_plan: "",
    remediation_status: "pending",
    status: "open",
    notes: "",
  });

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const url = packId ? `/api/registers/regulatory-breach?packId=${packId}` : "/api/registers/regulatory-breach";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed");
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
      breach_reference: "",
      breach_title: "",
      breach_type: "other",
      regulatory_rule: "",
      regulator: "FCA",
      identified_date: new Date().toISOString().split("T")[0],
      identified_by: "",
      breach_description: "",
      root_cause: "",
      impact_assessment: "",
      customers_affected: 0,
      financial_impact: "",
      severity: "medium",
      reported_to_regulator: false,
      remediation_plan: "",
      remediation_status: "pending",
      status: "open",
      notes: "",
    });

  const handleSave = async () => {
    if (!formData.breach_reference.trim() || !formData.breach_title.trim() || !formData.breach_description.trim()) {
      toast.error("Reference, title, and description are required");
      return;
    }
    setIsSaving(true);
    try {
      const payload = { ...formData, pack_id: packId || undefined };
      const url = editingRecord ? `/api/registers/regulatory-breach/${editingRecord.id}` : "/api/registers/regulatory-breach";
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
    if (!confirm("Delete this breach record?")) return;
    try {
      await fetch(`/api/registers/regulatory-breach/${id}`, { method: "DELETE" });
      loadRecords();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const openEdit = (r: RegulatoryBreachRecord) => {
    setEditingRecord(r);
    setFormData({
      breach_reference: r.breach_reference,
      breach_title: r.breach_title,
      breach_type: r.breach_type,
      regulatory_rule: r.regulatory_rule || "",
      regulator: r.regulator || "FCA",
      identified_date: r.identified_date?.split("T")[0] || "",
      identified_by: r.identified_by || "",
      breach_description: r.breach_description,
      root_cause: r.root_cause || "",
      impact_assessment: r.impact_assessment || "",
      customers_affected: r.customers_affected || 0,
      financial_impact: r.financial_impact?.toString() || "",
      severity: r.severity,
      reported_to_regulator: r.reported_to_regulator,
      remediation_plan: r.remediation_plan || "",
      remediation_status: r.remediation_status,
      status: r.status,
      notes: r.notes || "",
    });
    setShowAddDialog(true);
  };

  const handleBulkImport = async (data: Record<string, unknown>[]) => {
    const results = await Promise.allSettled(
      data.map((row) =>
        fetch("/api/registers/regulatory-breach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            breach_reference: row.breach_reference || row["Reference"],
            breach_title: row.breach_title || row["Title"],
            breach_type: row.breach_type || row["Type"] || "other",
            breach_description: row.breach_description || row["Description"],
            identified_date: row.identified_date || row["Identified Date"] || new Date().toISOString(),
            status: row.status || row["Status"] || "open",
            severity: row.severity || row["Severity"] || "medium",
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
        r.breach_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.breach_title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterValues.status === "all" || r.status === filterValues.status;
      const matchesSeverity = filterValues.severity === "all" || r.severity === filterValues.severity;
      const matchesDrillDown =
        !drillDownFilter ||
        (drillDownFilter.key === "status" && r.status === drillDownFilter.value) ||
        (drillDownFilter.key === "severity" && r.severity === drillDownFilter.value) ||
        (drillDownFilter.key === "type" && r.breach_type === drillDownFilter.value);
      return matchesSearch && matchesStatus && matchesSeverity && matchesDrillDown;
    });
  }, [records, searchQuery, filterValues, drillDownFilter]);

  const filteredRecords = useMemo(() => {
    if (!monthFilter) return baseFilteredRecords;
    return baseFilteredRecords.filter((r) => getMonthKey(r.identified_date) === monthFilter.key);
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
      open: filteredRecords.filter((r) => r.status === "open").length,
      investigating: filteredRecords.filter((r) => r.status === "investigating").length,
      remediation: filteredRecords.filter((r) => r.status === "remediation").length,
      critical: filteredRecords.filter((r) => r.severity === "critical").length,
      reportedToRegulator: filteredRecords.filter((r) => r.reported_to_regulator).length,
    }),
    [filteredRecords]
  );

  // Chart data
  const statusChartData = useMemo(
    () => [
      { label: "Open", value: stats.open, color: chartColors.open },
      { label: "Investigating", value: stats.investigating, color: chartColors.investigating },
      { label: "Remediation", value: stats.remediation, color: chartColors.remediation },
    ],
    [stats]
  );

  const typeChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      counts[r.breach_type] = (counts[r.breach_type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      label: typeLabels[type] || type,
      value: count,
    }));
  }, [filteredRecords]);

  const trendData = useMemo(() => {
    return generateTrendData(baseFilteredRecords, 6, 'identified_date');
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
  const columns: Column<RegulatoryBreachRecord>[] = [
    {
      key: "breach_reference",
      header: "Reference",
      sortable: true,
      render: (value, row) => (
        <div>
          <span className="font-medium text-slate-900">{value as string}</span>
          <p className="text-xs text-slate-500 truncate max-w-[200px]">{row.breach_title}</p>
        </div>
      ),
    },
    {
      key: "breach_type",
      header: "Type",
      sortable: true,
      render: (value) => typeLabels[value as string] || value,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value) => renderBadge(value as string, statusColors),
    },
    {
      key: "severity",
      header: "Severity",
      sortable: true,
      render: (value) => renderBadge(value as string, severityColors),
    },
    {
      key: "identified_date",
      header: "Identified",
      sortable: true,
      render: (value) => renderDate(value as string),
    },
    {
      key: "reported_to_regulator",
      header: "Reported",
      sortable: true,
      render: (value) => (
        <span className={value ? "text-purple-600 font-medium" : "text-slate-400"}>
          {value ? "Yes" : "No"}
        </span>
      ),
    },
  ];

  // Export handlers
  const handleExportSelected = () => {
    const selectedRecords = records.filter((r) => selectedIds.has(r.id));
    exportToCSV(
      selectedRecords,
      [
        { key: "breach_reference", header: "Reference" },
        { key: "breach_title", header: "Title" },
        { key: "breach_type", header: "Type", transform: (v) => typeLabels[v as string] || String(v) },
        { key: "status", header: "Status", transform: transforms.titleCase },
        { key: "severity", header: "Severity", transform: transforms.titleCase },
        { key: "identified_date", header: "Identified Date", transform: transforms.date },
        { key: "breach_description", header: "Description" },
      ],
      "regulatory_breaches_selected"
    );
  };

  const handleExportAll = () => {
    exportToCSV(
      filteredRecords,
      [
        { key: "breach_reference", header: "Reference" },
        { key: "breach_title", header: "Title" },
        { key: "breach_type", header: "Type", transform: (v) => typeLabels[v as string] || String(v) },
        { key: "regulatory_rule", header: "Regulatory Rule" },
        { key: "status", header: "Status", transform: transforms.titleCase },
        { key: "severity", header: "Severity", transform: transforms.titleCase },
        { key: "identified_date", header: "Identified Date", transform: transforms.date },
        { key: "breach_description", header: "Description" },
        { key: "root_cause", header: "Root Cause" },
        { key: "customers_affected", header: "Customers Affected" },
        { key: "reported_to_regulator", header: "Reported to Regulator" },
      ],
      "regulatory_breaches_register"
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
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <AlertOctagon className="h-6 w-6 text-red-600" />
            Regulatory Breach Log
          </h1>
          <p className="text-sm text-slate-500">Track and manage regulatory breaches and compliance failures</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditingRecord(null);
            setShowAddDialog(true);
          }}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Log Breach
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
              { value: "remediation", label: "Remediation" },
              { value: "closed", label: "Closed" },
              { value: "reported", label: "Reported" },
            ],
          },
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
        ]}
        filterValues={filterValues}
        onFilterChange={(key, value) => setFilterValues({ ...filterValues, [key]: value })}
        selectedCount={selectedIds.size}
        onExportSelected={handleExportSelected}
        onExportAll={handleExportAll}
        onBulkImport={handleBulkImport}
        importTemplate={{
          headers: ["Reference", "Title", "Type", "Description", "Identified Date", "Severity", "Status"],
          sampleRow: ["BRE-2024-001", "Late regulatory return", "reporting", "Failed to submit REP008 on time", "2024-01-15", "medium", "open"],
        }}
        registerName="Regulatory Breach Log"
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
              title="Total Breaches"
              value={stats.total}
              icon={<FileWarning className="h-5 w-5" />}
              color="slate"
              onClick={() => setDrillDownFilter(null)}
              isActive={!drillDownFilter}
            />
            <StatCard
              title="Open"
              value={stats.open}
              icon={<AlertTriangle className="h-5 w-5" />}
              color="red"
              onClick={() => handleDrillDown("status", "open")}
              isActive={drillDownFilter?.key === "status" && drillDownFilter?.value === "open"}
            />
            <StatCard
              title="In Remediation"
              value={stats.remediation}
              icon={<Clock className="h-5 w-5" />}
              color="blue"
              onClick={() => handleDrillDown("status", "remediation")}
              isActive={drillDownFilter?.key === "status" && drillDownFilter?.value === "remediation"}
            />
            <StatCard
              title="Critical"
              value={stats.critical}
              icon={<AlertOctagon className="h-5 w-5" />}
              color="red"
              onClick={() => handleDrillDown("severity", "critical")}
              isActive={drillDownFilter?.key === "severity" && drillDownFilter?.value === "critical"}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <DonutChart
              data={statusChartData}
              title="Breaches by Status"
              onSegmentClick={(label) => handleDrillDown("status", label.toLowerCase())}
              activeSegment={drillDownFilter?.key === "status" ? drillDownFilter.value : undefined}
            />
            <BarChart
              data={typeChartData}
              title="Breaches by Type"
              onBarClick={(label) => {
                const typeKey = Object.entries(typeLabels).find(([, v]) => v === label)?.[0];
                if (typeKey) handleDrillDown("type", typeKey);
              }}
              activeBar={drillDownFilter?.key === "type" ? typeLabels[drillDownFilter.value] : undefined}
            />
          </div>

          <TrendChart
            data={trendData}
            title="Breaches Trend (6 Months)"
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
            emptyMessage="No regulatory breaches recorded"
            emptyIcon={<AlertOctagon className="h-12 w-12" />}
          />
          <PaginationControls {...paginationProps} />
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit" : "Log"} Regulatory Breach</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Breach Reference *</Label>
                <Input
                  value={formData.breach_reference}
                  onChange={(e) => setFormData({ ...formData, breach_reference: e.target.value })}
                  placeholder="e.g., BRE-2024-001"
                />
              </div>
              <div className="space-y-2">
                <Label>Breach Type</Label>
                <Select value={formData.breach_type} onValueChange={(v) => setFormData({ ...formData, breach_type: v })}>
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
            </div>
            <div className="space-y-2">
              <Label>Breach Title *</Label>
              <Input
                value={formData.breach_title}
                onChange={(e) => setFormData({ ...formData, breach_title: e.target.value })}
                placeholder="Short description of the breach"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Regulatory Rule</Label>
                <Input
                  value={formData.regulatory_rule}
                  onChange={(e) => setFormData({ ...formData, regulatory_rule: e.target.value })}
                  placeholder="e.g., SUP 16.12"
                />
              </div>
              <div className="space-y-2">
                <Label>Identified Date</Label>
                <Input
                  type="date"
                  value={formData.identified_date}
                  onChange={(e) => setFormData({ ...formData, identified_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Breach Description *</Label>
              <Textarea
                value={formData.breach_description}
                onChange={(e) => setFormData({ ...formData, breach_description: e.target.value })}
                rows={3}
                placeholder="Detailed description of the breach..."
              />
            </div>
            <div className="space-y-2">
              <Label>Root Cause Analysis</Label>
              <Textarea
                value={formData.root_cause}
                onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                rows={2}
                placeholder="What caused this breach?"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Customers Affected</Label>
                <Input
                  type="number"
                  value={formData.customers_affected}
                  onChange={(e) => setFormData({ ...formData, customers_affected: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Financial Impact</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.financial_impact}
                  onChange={(e) => setFormData({ ...formData, financial_impact: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
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
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="remediation">Remediation</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="reported">Reported</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Remediation Status</Label>
                <Select value={formData.remediation_status} onValueChange={(v) => setFormData({ ...formData, remediation_status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Remediation Plan</Label>
              <Textarea
                value={formData.remediation_plan}
                onChange={(e) => setFormData({ ...formData, remediation_plan: e.target.value })}
                rows={2}
                placeholder="Actions to remediate the breach..."
              />
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
            <Button onClick={handleSave} disabled={isSaving} className="bg-red-600 hover:bg-red-700">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingRecord ? "Update" : "Log Breach"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
