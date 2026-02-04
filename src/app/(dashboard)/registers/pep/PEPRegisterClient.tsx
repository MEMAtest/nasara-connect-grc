"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { generateTrendData, getMonthKey, type TrendPoint } from "@/lib/chart-utils";
import { useToast } from "@/components/toast-provider";
import { Plus, Loader2, User, AlertTriangle, CheckCircle, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CountryPicker } from "@/components/registers/CountryPicker";
import { RegisterToolbar, ViewMode } from "@/components/registers/RegisterToolbar";
import { RegisterDataTable, Column, renderBadge, renderDate } from "@/components/registers/RegisterDataTable";
import { StatCard, DonutChart, BarChart, TrendChart } from "@/components/registers/RegisterCharts";
import { exportToCSV, transforms } from "@/lib/export-utils";
import { PaginationControls, usePagination } from "@/components/ui/pagination-controls";

interface PEPRecord {
  id: string;
  [key: string]: unknown;
  pep_type: string;
  full_name: string;
  date_of_birth?: string;
  nationality?: string;
  position_held?: string;
  pep_category: string;
  relationship_type?: string;
  risk_rating: string;
  status: string;
  identification_date: string;
  last_review_date?: string;
  next_review_date?: string;
  edd_completed: boolean;
  edd_completed_date?: string;
  source_of_wealth?: string;
  source_of_funds?: string;
  approval_status: string;
  notes?: string;
  created_at: string;
}

const pepTypeLabels: Record<string, string> = {
  customer: "Customer",
  beneficial_owner: "Beneficial Owner",
  director: "Director",
  shareholder: "Shareholder",
};

const pepCategoryLabels: Record<string, string> = {
  pep: "Politically Exposed Person",
  rca: "Close Associate (RCA)",
  family_member: "Family Member",
};

const riskColors: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-100 text-slate-700",
  archived: "bg-slate-100 text-slate-600",
  under_review: "bg-amber-100 text-amber-700",
};

const riskChartColors: Record<string, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

export function PEPRegisterClient() {
  const searchParams = useSearchParams();
  const packId = searchParams.get("packId");
  const toast = useToast();
  const [records, setRecords] = useState<PEPRecord[]>([]);
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
  const [editingRecord, setEditingRecord] = useState<PEPRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    pep_type: "customer",
    pep_category: "pep",
    nationality: "",
    position_held: "",
    relationship_type: "",
    risk_rating: "high",
    status: "active",
    identification_date: new Date().toISOString().split("T")[0],
    next_review_date: "",
    edd_completed: false,
    source_of_wealth: "",
    source_of_funds: "",
    notes: "",
  });

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = packId ? `/api/registers/pep?packId=${packId}` : "/api/registers/pep";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setRecords(data.records || []);
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  }, [packId]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const resetForm = () =>
    setFormData({
      full_name: "",
      pep_type: "customer",
      pep_category: "pep",
      nationality: "",
      position_held: "",
      relationship_type: "",
      risk_rating: "high",
      status: "active",
      identification_date: new Date().toISOString().split("T")[0],
      next_review_date: "",
      edd_completed: false,
      source_of_wealth: "",
      source_of_funds: "",
      notes: "",
    });

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      toast.error("Full name required");
      return;
    }
    setIsSaving(true);
    try {
      const payload = { ...formData, pack_id: packId || undefined };
      const url = editingRecord ? `/api/registers/pep/${editingRecord.id}` : "/api/registers/pep";
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
    if (!confirm("Delete this PEP record?")) return;
    try {
      await fetch(`/api/registers/pep/${id}`, { method: "DELETE" });
      loadRecords();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const openEdit = (r: PEPRecord) => {
    setEditingRecord(r);
    setFormData({
      full_name: r.full_name,
      pep_type: r.pep_type,
      pep_category: r.pep_category,
      nationality: r.nationality || "",
      position_held: r.position_held || "",
      relationship_type: r.relationship_type || "",
      risk_rating: r.risk_rating,
      status: r.status,
      identification_date: r.identification_date?.split("T")[0] || "",
      next_review_date: r.next_review_date?.split("T")[0] || "",
      edd_completed: r.edd_completed,
      source_of_wealth: r.source_of_wealth || "",
      source_of_funds: r.source_of_funds || "",
      notes: r.notes || "",
    });
    setShowAddDialog(true);
  };

  const handleBulkImport = async (data: Record<string, unknown>[]) => {
    const results = await Promise.allSettled(
      data.map((row) =>
        fetch("/api/registers/pep", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: row.full_name || row["Full Name"],
            pep_type: row.pep_type || row["Type"] || "customer",
            pep_category: row.pep_category || row["Category"] || "pep",
            nationality: row.nationality || row["Nationality"] || "",
            position_held: row.position_held || row["Position"] || "",
            risk_rating: row.risk_rating || row["Risk Rating"] || "high",
            status: row.status || row["Status"] || "active",
            identification_date: row.identification_date || row["Identification Date"] || new Date().toISOString(),
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
        r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.position_held?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.nationality?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterValues.status === "all" || r.status === filterValues.status;
      const matchesRisk = filterValues.risk_rating === "all" || r.risk_rating === filterValues.risk_rating;
      const matchesDrillDown =
        !drillDownFilter ||
        (drillDownFilter.key === "risk" && r.risk_rating === drillDownFilter.value) ||
        (drillDownFilter.key === "status" && r.status === drillDownFilter.value) ||
        (drillDownFilter.key === "category" && r.pep_category === drillDownFilter.value) ||
        (drillDownFilter.key === "edd" && (drillDownFilter.value === "completed" ? r.edd_completed : !r.edd_completed));
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
      highRisk: filteredRecords.filter((r) => r.risk_rating === "high" || r.risk_rating === "critical").length,
      pendingEDD: filteredRecords.filter((r) => !r.edd_completed).length,
      eddCompleted: filteredRecords.filter((r) => r.edd_completed).length,
    }),
    [filteredRecords]
  );

  // Chart data
  const riskChartData = useMemo(
    () => [
      { label: "Critical", value: filteredRecords.filter((r) => r.risk_rating === "critical").length, color: riskChartColors.critical },
      { label: "High", value: filteredRecords.filter((r) => r.risk_rating === "high").length, color: riskChartColors.high },
      { label: "Medium", value: filteredRecords.filter((r) => r.risk_rating === "medium").length, color: riskChartColors.medium },
      { label: "Low", value: filteredRecords.filter((r) => r.risk_rating === "low").length, color: riskChartColors.low },
    ],
    [filteredRecords]
  );

  const categoryChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      counts[r.pep_category] = (counts[r.pep_category] || 0) + 1;
    });
    return Object.entries(counts).map(([cat, count]) => ({
      label: pepCategoryLabels[cat] || cat,
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
  const columns: Column<PEPRecord>[] = [
    {
      key: "full_name",
      header: "Name",
      sortable: true,
      render: (value, row) => (
        <div>
          <span className="font-medium text-slate-900">{value as string}</span>
          {row.position_held && <p className="text-xs text-slate-500">{row.position_held}</p>}
        </div>
      ),
    },
    {
      key: "pep_category",
      header: "Category",
      sortable: true,
      render: (value) => pepCategoryLabels[value as string] || String(value),
    },
    {
      key: "risk_rating",
      header: "Risk",
      sortable: true,
      render: (value) => renderBadge(value as string, riskColors),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value) => renderBadge(value as string, statusColors),
    },
    {
      key: "edd_completed",
      header: "EDD",
      sortable: true,
      render: (value) => (
        <span className={value ? "text-emerald-600" : "text-amber-600"}>
          {value ? "Complete" : "Pending"}
        </span>
      ),
    },
    {
      key: "nationality",
      header: "Nationality",
      sortable: true,
      render: (value) => (value as string) || "-",
    },
    {
      key: "identification_date",
      header: "Identified",
      sortable: true,
      render: (value) => renderDate(value as string),
    },
  ];

  // Export handlers
  const handleExportSelected = () => {
    const selectedRecords = records.filter((r) => selectedIds.has(r.id));
    exportToCSV(
      selectedRecords,
      [
        { key: "full_name", header: "Full Name" },
        { key: "pep_type", header: "Type", transform: (v) => pepTypeLabels[v as string] || String(v) },
        { key: "pep_category", header: "Category", transform: (v) => pepCategoryLabels[v as string] || String(v) },
        { key: "nationality", header: "Nationality" },
        { key: "position_held", header: "Position Held" },
        { key: "risk_rating", header: "Risk Rating", transform: transforms.titleCase },
        { key: "status", header: "Status", transform: transforms.titleCase },
        { key: "edd_completed", header: "EDD Completed", transform: transforms.boolean },
        { key: "identification_date", header: "Identification Date", transform: transforms.date },
      ],
      "pep_selected"
    );
  };

  const handleExportAll = () => {
    exportToCSV(
      filteredRecords,
      [
        { key: "full_name", header: "Full Name" },
        { key: "pep_type", header: "Type", transform: (v) => pepTypeLabels[v as string] || String(v) },
        { key: "pep_category", header: "Category", transform: (v) => pepCategoryLabels[v as string] || String(v) },
        { key: "nationality", header: "Nationality" },
        { key: "position_held", header: "Position Held" },
        { key: "relationship_type", header: "Relationship Type" },
        { key: "risk_rating", header: "Risk Rating", transform: transforms.titleCase },
        { key: "status", header: "Status", transform: transforms.titleCase },
        { key: "edd_completed", header: "EDD Completed", transform: transforms.boolean },
        { key: "identification_date", header: "Identification Date", transform: transforms.date },
        { key: "source_of_wealth", header: "Source of Wealth" },
        { key: "source_of_funds", header: "Source of Funds" },
      ],
      "pep_register"
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
          <h1 className="text-2xl font-bold text-slate-900">PEP Register</h1>
          <p className="text-sm text-slate-500">Manage Politically Exposed Persons, family members, and close associates</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditingRecord(null);
            setShowAddDialog(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Add PEP Record
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
              { value: "inactive", label: "Inactive" },
              { value: "under_review", label: "Under Review" },
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
          headers: ["Full Name", "Type", "Category", "Nationality", "Position", "Risk Rating", "Status"],
          sampleRow: ["John Doe", "customer", "pep", "United Kingdom", "Member of Parliament", "high", "active"],
        }}
        registerName="PEP"
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
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-4 py-2">
          <span className="text-sm text-rose-700">
            Filtered by {drillDownFilter.key}: <strong>{drillDownFilter.value}</strong>
          </span>
          <Button variant="ghost" size="sm" onClick={() => setDrillDownFilter(null)} className="h-6 text-rose-600 hover:text-rose-700">
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
              title="Total Records"
              value={stats.total}
              icon={<User className="h-5 w-5" />}
              color="slate"
              onClick={() => setDrillDownFilter(null)}
              isActive={!drillDownFilter}
            />
            <StatCard
              title="Active"
              value={stats.active}
              icon={<CheckCircle className="h-5 w-5" />}
              color="emerald"
              onClick={() => handleDrillDown("status", "active")}
              isActive={drillDownFilter?.key === "status" && drillDownFilter?.value === "active"}
            />
            <StatCard
              title="High/Critical Risk"
              value={stats.highRisk}
              icon={<AlertTriangle className="h-5 w-5" />}
              color="orange"
              onClick={() => handleDrillDown("risk", "high")}
              isActive={drillDownFilter?.key === "risk" && drillDownFilter?.value === "high"}
            />
            <StatCard
              title="Pending EDD"
              value={stats.pendingEDD}
              icon={<FileCheck className="h-5 w-5" />}
              color="amber"
              onClick={() => handleDrillDown("edd", "pending")}
              isActive={drillDownFilter?.key === "edd" && drillDownFilter?.value === "pending"}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <DonutChart
              data={riskChartData}
              title="PEPs by Risk Rating"
              onSegmentClick={(label) => handleDrillDown("risk", label.toLowerCase())}
              activeSegment={drillDownFilter?.key === "risk" ? drillDownFilter.value : undefined}
            />
            <BarChart
              data={categoryChartData}
              title="PEPs by Category"
              onBarClick={(label) => {
                const catKey = Object.entries(pepCategoryLabels).find(([, v]) => v === label)?.[0];
                if (catKey) handleDrillDown("category", catKey);
              }}
              activeBar={drillDownFilter?.key === "category" ? pepCategoryLabels[drillDownFilter.value] : undefined}
            />
          </div>

          <TrendChart
            data={trendData}
            title="PEP Records Added (6 Months)"
            color="#f43f5e"
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
            emptyMessage="No PEP records found"
            emptyIcon={<User className="h-12 w-12" />}
          />
          <PaginationControls {...paginationProps} />
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit PEP Record" : "Add New PEP Record"}</DialogTitle>
            <DialogDescription>Enter the details of the politically exposed person</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label>Nationality</Label>
                <CountryPicker
                  value={formData.nationality}
                  onChange={(value) => setFormData({ ...formData, nationality: value })}
                  placeholder="Select nationality..."
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>PEP Type</Label>
                <Select value={formData.pep_type} onValueChange={(v) => setFormData({ ...formData, pep_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(pepTypeLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>PEP Category</Label>
                <Select value={formData.pep_category} onValueChange={(v) => setFormData({ ...formData, pep_category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(pepCategoryLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position_held">Position Held</Label>
              <Input
                id="position_held"
                value={formData.position_held}
                onChange={(e) => setFormData({ ...formData, position_held: e.target.value })}
                placeholder="e.g., Member of Parliament, Government Minister"
              />
            </div>
            {formData.pep_category !== "pep" && (
              <div className="space-y-2">
                <Label htmlFor="relationship_type">Relationship to PEP</Label>
                <Input
                  id="relationship_type"
                  value={formData.relationship_type}
                  onChange={(e) => setFormData({ ...formData, relationship_type: e.target.value })}
                  placeholder="e.g., Spouse, Business Partner"
                />
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Risk Rating</Label>
                <Select value={formData.risk_rating} onValueChange={(v) => setFormData({ ...formData, risk_rating: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="identification_date">Identification Date</Label>
                <Input
                  id="identification_date"
                  type="date"
                  value={formData.identification_date}
                  onChange={(e) => setFormData({ ...formData, identification_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="next_review_date">Next Review Date</Label>
                <Input
                  id="next_review_date"
                  type="date"
                  value={formData.next_review_date}
                  onChange={(e) => setFormData({ ...formData, next_review_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edd_completed"
                checked={formData.edd_completed}
                onChange={(e) => setFormData({ ...formData, edd_completed: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300"
              />
              <Label htmlFor="edd_completed">Enhanced Due Diligence Completed</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source_of_wealth">Source of Wealth</Label>
              <Textarea
                id="source_of_wealth"
                value={formData.source_of_wealth}
                onChange={(e) => setFormData({ ...formData, source_of_wealth: e.target.value })}
                placeholder="Describe the source of wealth..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source_of_funds">Source of Funds</Label>
              <Textarea
                id="source_of_funds"
                value={formData.source_of_funds}
                onChange={(e) => setFormData({ ...formData, source_of_funds: e.target.value })}
                placeholder="Describe the source of funds..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingRecord ? "Update Record" : "Add Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
