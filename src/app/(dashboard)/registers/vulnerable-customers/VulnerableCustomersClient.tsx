"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { generateTrendData } from "@/lib/chart-utils";
import { useToast } from "@/components/toast-provider";
import { Plus, Loader2, Heart, AlertTriangle, CheckCircle, Clock, Users } from "lucide-react";
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

interface VulnerableCustomerRecord {
  id: string;
  customer_reference: string;
  customer_name?: string;
  vulnerability_type: string;
  vulnerability_details?: string;
  identified_date: string;
  identified_by?: string;
  risk_level: string;
  support_measures?: string;
  review_frequency: string;
  next_review_date?: string;
  last_review_date?: string;
  status: string;
  outcome_notes?: string;
  notes?: string;
}

const typeLabels: Record<string, string> = {
  health: "Health Condition",
  life_events: "Life Events",
  capability: "Capability",
  financial: "Financial Difficulty",
  age: "Age-Related",
  mental_health: "Mental Health",
  other: "Other",
};

const statusColors: Record<string, string> = {
  active: "bg-amber-100 text-amber-700",
  monitoring: "bg-blue-100 text-blue-700",
  resolved: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-100 text-slate-700",
};

const riskColors: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const chartColors = {
  active: "#f59e0b",
  monitoring: "#3b82f6",
  resolved: "#10b981",
  closed: "#64748b",
};

export function VulnerableCustomersClient() {
  const searchParams = useSearchParams();
  const packId = searchParams.get("packId");
  const toast = useToast();
  const [records, setRecords] = useState<VulnerableCustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    status: "all",
    risk_level: "all",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drillDownFilter, setDrillDownFilter] = useState<{ key: string; value: string } | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VulnerableCustomerRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    customer_reference: "",
    customer_name: "",
    vulnerability_type: "other",
    vulnerability_details: "",
    identified_date: new Date().toISOString().split("T")[0],
    identified_by: "",
    risk_level: "medium",
    support_measures: "",
    review_frequency: "quarterly",
    status: "active",
    notes: "",
  });

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const url = packId ? `/api/registers/vulnerable-customers?packId=${packId}` : "/api/registers/vulnerable-customers";
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
      customer_reference: "",
      customer_name: "",
      vulnerability_type: "other",
      vulnerability_details: "",
      identified_date: new Date().toISOString().split("T")[0],
      identified_by: "",
      risk_level: "medium",
      support_measures: "",
      review_frequency: "quarterly",
      status: "active",
      notes: "",
    });

  const handleSave = async () => {
    if (!formData.customer_reference.trim()) {
      toast.error("Customer reference is required");
      return;
    }
    setIsSaving(true);
    try {
      const payload = { ...formData, pack_id: packId || undefined };
      const url = editingRecord ? `/api/registers/vulnerable-customers/${editingRecord.id}` : "/api/registers/vulnerable-customers";
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
      await fetch(`/api/registers/vulnerable-customers/${id}`, { method: "DELETE" });
      loadRecords();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const openEdit = (r: VulnerableCustomerRecord) => {
    setEditingRecord(r);
    setFormData({
      customer_reference: r.customer_reference,
      customer_name: r.customer_name || "",
      vulnerability_type: r.vulnerability_type,
      vulnerability_details: r.vulnerability_details || "",
      identified_date: r.identified_date?.split("T")[0] || "",
      identified_by: r.identified_by || "",
      risk_level: r.risk_level,
      support_measures: r.support_measures || "",
      review_frequency: r.review_frequency,
      status: r.status,
      notes: r.notes || "",
    });
    setShowAddDialog(true);
  };

  const handleBulkImport = async (data: Record<string, unknown>[]) => {
    const results = await Promise.allSettled(
      data.map((row) =>
        fetch("/api/registers/vulnerable-customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_reference: row.customer_reference || row["Customer Reference"],
            customer_name: row.customer_name || row["Customer Name"] || "",
            vulnerability_type: row.vulnerability_type || row["Vulnerability Type"] || "other",
            vulnerability_details: row.vulnerability_details || row["Details"] || "",
            identified_date: row.identified_date || row["Identified Date"] || new Date().toISOString(),
            status: row.status || row["Status"] || "active",
            risk_level: row.risk_level || row["Risk Level"] || "medium",
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
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.customer_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesStatus = filterValues.status === "all" || r.status === filterValues.status;
      const matchesRisk = filterValues.risk_level === "all" || r.risk_level === filterValues.risk_level;
      const matchesDrillDown =
        !drillDownFilter ||
        (drillDownFilter.key === "status" && r.status === drillDownFilter.value) ||
        (drillDownFilter.key === "risk" && r.risk_level === drillDownFilter.value) ||
        (drillDownFilter.key === "type" && r.vulnerability_type === drillDownFilter.value);
      return matchesSearch && matchesStatus && matchesRisk && matchesDrillDown;
    });
  }, [records, searchQuery, filterValues, drillDownFilter]);

  // Pagination
  const {
    paginatedData,
    paginationProps,
  } = usePagination(filteredRecords, { initialLimit: 25 });

  // Statistics
  const stats = useMemo(
    () => ({
      total: records.length,
      active: records.filter((r) => r.status === "active").length,
      monitoring: records.filter((r) => r.status === "monitoring").length,
      resolved: records.filter((r) => r.status === "resolved").length,
      highRisk: records.filter((r) => r.risk_level === "high" || r.risk_level === "critical").length,
    }),
    [records]
  );

  // Chart data
  const statusChartData = useMemo(
    () => [
      { label: "Active", value: stats.active, color: chartColors.active },
      { label: "Monitoring", value: stats.monitoring, color: chartColors.monitoring },
      { label: "Resolved", value: stats.resolved, color: chartColors.resolved },
    ],
    [stats]
  );

  const typeChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach((r) => {
      counts[r.vulnerability_type] = (counts[r.vulnerability_type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      label: typeLabels[type] || type,
      value: count,
    }));
  }, [records]);

  const trendData = useMemo(() => {
    return generateTrendData(records, 6, 'created_at');
  }, [records]);

  // Table columns
  const columns: Column<VulnerableCustomerRecord>[] = [
    {
      key: "customer_reference",
      header: "Customer",
      sortable: true,
      render: (value, row) => (
        <div>
          <span className="font-medium text-slate-900">{value as string}</span>
          {row.customer_name && <p className="text-xs text-slate-500">{row.customer_name}</p>}
        </div>
      ),
    },
    {
      key: "vulnerability_type",
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
      key: "risk_level",
      header: "Risk",
      sortable: true,
      render: (value) => renderBadge(value as string, riskColors),
    },
    {
      key: "identified_date",
      header: "Identified",
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
        { key: "customer_reference", header: "Customer Reference" },
        { key: "customer_name", header: "Customer Name" },
        { key: "vulnerability_type", header: "Vulnerability Type", transform: (v) => typeLabels[v as string] || String(v) },
        { key: "status", header: "Status", transform: transforms.titleCase },
        { key: "risk_level", header: "Risk Level", transform: transforms.titleCase },
        { key: "identified_date", header: "Identified Date", transform: transforms.date },
        { key: "support_measures", header: "Support Measures" },
      ],
      "vulnerable_customers_selected"
    );
  };

  const handleExportAll = () => {
    exportToCSV(
      filteredRecords,
      [
        { key: "customer_reference", header: "Customer Reference" },
        { key: "customer_name", header: "Customer Name" },
        { key: "vulnerability_type", header: "Vulnerability Type", transform: (v) => typeLabels[v as string] || String(v) },
        { key: "vulnerability_details", header: "Details" },
        { key: "status", header: "Status", transform: transforms.titleCase },
        { key: "risk_level", header: "Risk Level", transform: transforms.titleCase },
        { key: "identified_date", header: "Identified Date", transform: transforms.date },
        { key: "support_measures", header: "Support Measures" },
        { key: "review_frequency", header: "Review Frequency" },
      ],
      "vulnerable_customers_register"
    );
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
            <Heart className="h-6 w-6 text-pink-600" />
            Vulnerable Customers Log
          </h1>
          <p className="text-sm text-slate-500">Track and support customers with vulnerabilities (Consumer Duty)</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditingRecord(null);
            setShowAddDialog(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Customer
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
              { value: "monitoring", label: "Monitoring" },
              { value: "resolved", label: "Resolved" },
              { value: "closed", label: "Closed" },
            ],
          },
          {
            key: "risk_level",
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
          headers: ["Customer Reference", "Customer Name", "Vulnerability Type", "Details", "Identified Date", "Risk Level", "Status"],
          sampleRow: ["CUST-001", "Jane Doe", "health", "Long-term illness affecting communication", "2024-01-15", "high", "active"],
        }}
        registerName="Vulnerable Customers Log"
      />

      {/* Drill-down indicator */}
      {drillDownFilter && (
        <div className="flex items-center gap-2 rounded-lg bg-pink-50 px-4 py-2">
          <span className="text-sm text-pink-700">
            Filtered by {drillDownFilter.key}: <strong>{drillDownFilter.value}</strong>
          </span>
          <Button variant="ghost" size="sm" onClick={() => setDrillDownFilter(null)} className="h-6 text-pink-600 hover:text-pink-700">
            Clear filter
          </Button>
        </div>
      )}

      {/* Dashboard View */}
      {viewMode === "dashboard" && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              title="Total Customers"
              value={stats.total}
              icon={<Users className="h-5 w-5" />}
              color="slate"
              onClick={() => setDrillDownFilter(null)}
              isActive={!drillDownFilter}
            />
            <StatCard
              title="Active Cases"
              value={stats.active}
              icon={<Clock className="h-5 w-5" />}
              color="amber"
              onClick={() => handleDrillDown("status", "active")}
              isActive={drillDownFilter?.key === "status" && drillDownFilter?.value === "active"}
            />
            <StatCard
              title="Monitoring"
              value={stats.monitoring}
              icon={<CheckCircle className="h-5 w-5" />}
              color="blue"
              onClick={() => handleDrillDown("status", "monitoring")}
              isActive={drillDownFilter?.key === "status" && drillDownFilter?.value === "monitoring"}
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
              title="Customers by Status"
              onSegmentClick={(label) => handleDrillDown("status", label.toLowerCase())}
              activeSegment={drillDownFilter?.key === "status" ? drillDownFilter.value : undefined}
            />
            <BarChart
              data={typeChartData}
              title="Customers by Vulnerability Type"
              onBarClick={(label) => {
                const typeKey = Object.entries(typeLabels).find(([, v]) => v === label)?.[0];
                if (typeKey) handleDrillDown("type", typeKey);
              }}
              activeBar={drillDownFilter?.key === "type" ? typeLabels[drillDownFilter.value] : undefined}
            />
          </div>

          <TrendChart data={trendData} title="New Cases Trend (6 Months)" color="#ec4899" />
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
              row.risk_level === "critical" ? "bg-red-50/50" : row.risk_level === "high" ? "bg-orange-50/50" : ""
            }
            emptyMessage="No vulnerable customers recorded"
            emptyIcon={<Heart className="h-12 w-12" />}
          />
          <PaginationControls {...paginationProps} />
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit" : "Add"} Vulnerable Customer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Customer Reference *</Label>
                <Input
                  value={formData.customer_reference}
                  onChange={(e) => setFormData({ ...formData, customer_reference: e.target.value })}
                  placeholder="e.g., CUST-001"
                />
              </div>
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Vulnerability Type</Label>
                <Select value={formData.vulnerability_type} onValueChange={(v) => setFormData({ ...formData, vulnerability_type: v })}>
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
                <Label>Identified Date</Label>
                <Input
                  type="date"
                  value={formData.identified_date}
                  onChange={(e) => setFormData({ ...formData, identified_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Vulnerability Details</Label>
              <Textarea
                value={formData.vulnerability_details}
                onChange={(e) => setFormData({ ...formData, vulnerability_details: e.target.value })}
                rows={3}
                placeholder="Describe the nature of the vulnerability..."
              />
            </div>
            <div className="space-y-2">
              <Label>Support Measures</Label>
              <Textarea
                value={formData.support_measures}
                onChange={(e) => setFormData({ ...formData, support_measures: e.target.value })}
                rows={3}
                placeholder="What support measures are in place?"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Risk Level</Label>
                <Select value={formData.risk_level} onValueChange={(v) => setFormData({ ...formData, risk_level: v })}>
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
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
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
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="semi_annual">Semi-Annual</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="ad_hoc">Ad-hoc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Identified By</Label>
              <Input
                value={formData.identified_by}
                onChange={(e) => setFormData({ ...formData, identified_by: e.target.value })}
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
