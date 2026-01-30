"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { generateTrendData, getMonthKey, type TrendPoint } from "@/lib/chart-utils";
import { useToast } from "@/components/toast-provider";
import { Plus, Loader2, Scale, AlertTriangle, CheckCircle, Clock } from "lucide-react";
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

interface COIRecord {
  id: string;
  declarant_name: string;
  declarant_role?: string;
  declaration_date: string;
  conflict_type: string;
  description: string;
  parties_involved?: string;
  potential_impact?: string;
  mitigation_measures?: string;
  review_frequency: string;
  last_review_date?: string;
  next_review_date?: string;
  risk_rating: string;
  status: string;
  approved_by?: string;
  notes?: string;
}

const typeLabels: Record<string, string> = {
  personal_interest: "Personal Interest",
  family_relationship: "Family Relationship",
  outside_employment: "Outside Employment",
  financial_interest: "Financial Interest",
  gift_hospitality: "Gift/Hospitality",
  board_membership: "Board Membership",
  shareholder: "Shareholder",
  other: "Other",
};

const statusColors: Record<string, string> = {
  active: "bg-amber-100 text-amber-700",
  mitigated: "bg-blue-100 text-blue-700",
  resolved: "bg-emerald-100 text-emerald-700",
  archived: "bg-slate-100 text-slate-700",
};

const riskColors: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const chartColors = {
  active: "#f59e0b",
  mitigated: "#3b82f6",
  resolved: "#10b981",
  archived: "#64748b",
};

const riskChartColors: Record<string, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

export function ConflictsRegisterClient() {
  const searchParams = useSearchParams();
  const packId = searchParams.get("packId");
  const toast = useToast();
  const [records, setRecords] = useState<COIRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    status: "all",
    risk_rating: "all",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drillDownFilter, setDrillDownFilter] = useState<{ key: string; value: string } | null>(null);
  const [monthFilter, setMonthFilter] = useState<{ key: string; label: string } | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<COIRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    declarant_name: "",
    declarant_role: "",
    declaration_date: new Date().toISOString().split("T")[0],
    conflict_type: "other",
    description: "",
    parties_involved: "",
    potential_impact: "",
    mitigation_measures: "",
    review_frequency: "annual",
    risk_rating: "medium",
    status: "active",
    notes: "",
  });

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const url = packId ? `/api/registers/conflicts?packId=${packId}` : "/api/registers/conflicts";
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
      declarant_name: "",
      declarant_role: "",
      declaration_date: new Date().toISOString().split("T")[0],
      conflict_type: "other",
      description: "",
      parties_involved: "",
      potential_impact: "",
      mitigation_measures: "",
      review_frequency: "annual",
      risk_rating: "medium",
      status: "active",
      notes: "",
    });

  const handleSave = async () => {
    if (!formData.declarant_name.trim() || !formData.description.trim()) {
      toast.error("Declarant name and description required");
      return;
    }
    setIsSaving(true);
    try {
      const payload = { ...formData, pack_id: packId || undefined };
      const url = editingRecord ? `/api/registers/conflicts/${editingRecord.id}` : "/api/registers/conflicts";
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
    if (!confirm("Delete this record?")) return;
    try {
      await fetch(`/api/registers/conflicts/${id}`, { method: "DELETE" });
      loadRecords();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const openEdit = (r: COIRecord) => {
    setEditingRecord(r);
    setFormData({
      declarant_name: r.declarant_name,
      declarant_role: r.declarant_role || "",
      declaration_date: r.declaration_date?.split("T")[0] || "",
      conflict_type: r.conflict_type,
      description: r.description,
      parties_involved: r.parties_involved || "",
      potential_impact: r.potential_impact || "",
      mitigation_measures: r.mitigation_measures || "",
      review_frequency: r.review_frequency,
      risk_rating: r.risk_rating,
      status: r.status,
      notes: r.notes || "",
    });
    setShowAddDialog(true);
  };

  const handleBulkImport = async (data: Record<string, unknown>[]) => {
    const results = await Promise.allSettled(
      data.map((row) =>
        fetch("/api/registers/conflicts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            declarant_name: row.declarant_name || row["Declarant Name"],
            declarant_role: row.declarant_role || row["Role"] || "",
            conflict_type: row.conflict_type || row["Type"] || "other",
            description: row.description || row["Description"] || "",
            declaration_date: row.declaration_date || row["Declaration Date"] || new Date().toISOString(),
            status: row.status || row["Status"] || "active",
            risk_rating: row.risk_rating || row["Risk Rating"] || "medium",
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
      const matchesSearch = r.declarant_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterValues.status === "all" || r.status === filterValues.status;
      const matchesRisk = filterValues.risk_rating === "all" || r.risk_rating === filterValues.risk_rating;
      const matchesDrillDown =
        !drillDownFilter ||
        (drillDownFilter.key === "status" && r.status === drillDownFilter.value) ||
        (drillDownFilter.key === "risk" && r.risk_rating === drillDownFilter.value) ||
        (drillDownFilter.key === "type" && r.conflict_type === drillDownFilter.value);
      return matchesSearch && matchesStatus && matchesRisk && matchesDrillDown;
    });
  }, [records, searchQuery, filterValues, drillDownFilter]);

  const filteredRecords = useMemo(() => {
    if (!monthFilter) return baseFilteredRecords;
    return baseFilteredRecords.filter((r) => getMonthKey(r.created_at) === monthFilter.key);
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
      active: filteredRecords.filter((r) => r.status === "active").length,
      mitigated: filteredRecords.filter((r) => r.status === "mitigated").length,
      resolved: filteredRecords.filter((r) => r.status === "resolved").length,
      highRisk: filteredRecords.filter((r) => r.risk_rating === "high" || r.risk_rating === "critical").length,
    }),
    [filteredRecords]
  );

  // Chart data
  const statusChartData = useMemo(
    () => [
      { label: "Active", value: stats.active, color: chartColors.active },
      { label: "Mitigated", value: stats.mitigated, color: chartColors.mitigated },
      { label: "Resolved", value: stats.resolved, color: chartColors.resolved },
    ],
    [stats]
  );

  const typeChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      counts[r.conflict_type] = (counts[r.conflict_type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      label: typeLabels[type] || type,
      value: count,
    }));
  }, [filteredRecords]);

  const trendData = useMemo(() => {
    return generateTrendData(baseFilteredRecords, 6, 'created_at');
  }, [baseFilteredRecords]);

  const monthOptions = useMemo(
    () =>
      trendData.map((point) => ({
        value: point.monthKey,
        label: new Date(point.startDate).toLocaleDateString("en-GB", {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }),
      })),
    [trendData]
  );

  // Table columns
  const columns: Column<COIRecord>[] = [
    {
      key: "declarant_name",
      header: "Declarant",
      sortable: true,
      render: (value, row) => (
        <div>
          <span className="font-medium text-slate-900">{value as string}</span>
          {row.declarant_role && <p className="text-xs text-slate-500">{row.declarant_role}</p>}
        </div>
      ),
    },
    {
      key: "conflict_type",
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
      key: "risk_rating",
      header: "Risk",
      sortable: true,
      render: (value) => renderBadge(value as string, riskColors),
    },
    {
      key: "declaration_date",
      header: "Declared",
      sortable: true,
      render: (value) => renderDate(value as string),
    },
    {
      key: "review_frequency",
      header: "Review",
      sortable: true,
      render: (value) => (value as string)?.replace("_", " ") || "-",
    },
  ];

  // Export handlers
  const handleExportSelected = () => {
    const selectedRecords = records.filter((r) => selectedIds.has(r.id));
    exportToCSV(
      selectedRecords,
      [
        { key: "declarant_name", header: "Declarant Name" },
        { key: "declarant_role", header: "Role" },
        { key: "conflict_type", header: "Conflict Type", transform: (v) => typeLabels[v as string] || String(v) },
        { key: "status", header: "Status", transform: transforms.titleCase },
        { key: "risk_rating", header: "Risk Rating", transform: transforms.titleCase },
        { key: "declaration_date", header: "Declaration Date", transform: transforms.date },
        { key: "description", header: "Description" },
        { key: "mitigation_measures", header: "Mitigation Measures" },
      ],
      "conflicts_selected"
    );
  };

  const handleExportAll = () => {
    exportToCSV(
      filteredRecords,
      [
        { key: "declarant_name", header: "Declarant Name" },
        { key: "declarant_role", header: "Role" },
        { key: "conflict_type", header: "Conflict Type", transform: (v) => typeLabels[v as string] || String(v) },
        { key: "status", header: "Status", transform: transforms.titleCase },
        { key: "risk_rating", header: "Risk Rating", transform: transforms.titleCase },
        { key: "declaration_date", header: "Declaration Date", transform: transforms.date },
        { key: "description", header: "Description" },
        { key: "parties_involved", header: "Parties Involved" },
        { key: "potential_impact", header: "Potential Impact" },
        { key: "mitigation_measures", header: "Mitigation Measures" },
      ],
      "conflicts_register"
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
      ? new Date(point.startDate).toLocaleDateString("en-GB", {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        })
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
          <h1 className="text-2xl font-bold text-slate-900">Conflicts of Interest</h1>
          <p className="text-sm text-slate-500">Track and manage COI declarations</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditingRecord(null);
            setShowAddDialog(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> New Declaration
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
              { value: "active", label: "Active" },
              { value: "mitigated", label: "Mitigated" },
              { value: "resolved", label: "Resolved" },
              { value: "archived", label: "Archived" },
            ],
          },
          {
            key: "risk_rating",
            label: "Risk",
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
          headers: ["Declarant Name", "Role", "Type", "Description", "Declaration Date", "Risk Rating", "Status"],
          sampleRow: ["John Smith", "Director", "financial_interest", "Shares in competitor company", "2024-01-15", "high", "active"],
        }}
        registerName="Conflicts of Interest"
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
        <div className="flex items-center gap-2 rounded-lg bg-violet-50 px-4 py-2">
          <span className="text-sm text-violet-700">
            Filtered by {drillDownFilter.key}: <strong>{drillDownFilter.value}</strong>
          </span>
          <Button variant="ghost" size="sm" onClick={() => setDrillDownFilter(null)} className="h-6 text-violet-600 hover:text-violet-700">
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
              title="Total Declarations"
              value={stats.total}
              icon={<Scale className="h-5 w-5" />}
              color="slate"
              onClick={() => setDrillDownFilter(null)}
              isActive={!drillDownFilter}
            />
            <StatCard
              title="Active"
              value={stats.active}
              icon={<Clock className="h-5 w-5" />}
              color="amber"
              onClick={() => handleDrillDown("status", "active")}
              isActive={drillDownFilter?.key === "status" && drillDownFilter?.value === "active"}
            />
            <StatCard
              title="Mitigated"
              value={stats.mitigated}
              icon={<CheckCircle className="h-5 w-5" />}
              color="blue"
              onClick={() => handleDrillDown("status", "mitigated")}
              isActive={drillDownFilter?.key === "status" && drillDownFilter?.value === "mitigated"}
            />
            <StatCard
              title="High Risk"
              value={stats.highRisk}
              icon={<AlertTriangle className="h-5 w-5" />}
              color="red"
              onClick={() => handleDrillDown("risk", "high")}
              isActive={drillDownFilter?.key === "risk" && drillDownFilter?.value === "high"}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <DonutChart
              data={statusChartData}
              title="Declarations by Status"
              onSegmentClick={(label) => handleDrillDown("status", label.toLowerCase())}
              activeSegment={drillDownFilter?.key === "status" ? drillDownFilter.value : undefined}
            />
            <BarChart
              data={typeChartData}
              title="Declarations by Type"
              onBarClick={(label) => {
                const typeKey = Object.entries(typeLabels).find(([, v]) => v === label)?.[0];
                if (typeKey) handleDrillDown("type", typeKey);
              }}
              activeBar={drillDownFilter?.key === "type" ? typeLabels[drillDownFilter.value] : undefined}
            />
          </div>

          <TrendChart
            data={trendData}
            title="Declarations Logged (6 Months)"
            color="#8b5cf6"
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
              row.risk_rating === "critical" ? "bg-red-50/50" : row.risk_rating === "high" ? "bg-orange-50/50" : ""
            }
            emptyMessage="No declarations found"
            emptyIcon={<Scale className="h-12 w-12" />}
          />
          <PaginationControls {...paginationProps} />
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit" : "New"} Declaration</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Declarant Name *</Label>
                <Input
                  value={formData.declarant_name}
                  onChange={(e) => setFormData({ ...formData, declarant_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={formData.declarant_role}
                  onChange={(e) => setFormData({ ...formData, declarant_role: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Conflict Type</Label>
                <Select value={formData.conflict_type} onValueChange={(v) => setFormData({ ...formData, conflict_type: v })}>
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
                <Label>Declaration Date</Label>
                <Input
                  type="date"
                  value={formData.declaration_date}
                  onChange={(e) => setFormData({ ...formData, declaration_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Parties Involved</Label>
              <Input
                value={formData.parties_involved}
                onChange={(e) => setFormData({ ...formData, parties_involved: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Potential Impact</Label>
              <Textarea
                value={formData.potential_impact}
                onChange={(e) => setFormData({ ...formData, potential_impact: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Mitigation Measures</Label>
              <Textarea
                value={formData.mitigation_measures}
                onChange={(e) => setFormData({ ...formData, mitigation_measures: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Risk Rating</Label>
                <Select value={formData.risk_rating} onValueChange={(v) => setFormData({ ...formData, risk_rating: v })}>
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="mitigated">Mitigated</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Review Frequency</Label>
                <Select value={formData.review_frequency} onValueChange={(v) => setFormData({ ...formData, review_frequency: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="semi_annual">Semi-Annual</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="ad_hoc">Ad-hoc</SelectItem>
                  </SelectContent>
                </Select>
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
