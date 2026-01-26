"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { generateTrendData, getMonthKey, type TrendPoint } from "@/lib/chart-utils";
import { useToast } from "@/components/toast-provider";
import { Plus, Loader2, Gift, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RegisterToolbar, ViewMode } from "@/components/registers/RegisterToolbar";
import { RegisterDataTable, Column, renderBadge, renderDate, renderCurrency } from "@/components/registers/RegisterDataTable";
import { StatCard, DonutChart, BarChart, TrendChart } from "@/components/registers/RegisterCharts";
import { exportToCSV, transforms } from "@/lib/export-utils";
import { PaginationControls, usePagination } from "@/components/ui/pagination-controls";

interface GiftRecord {
  id: string;
  entry_type: string;
  date_of_event: string;
  recipient_name?: string;
  recipient_organization?: string;
  provider_name?: string;
  provider_organization?: string;
  description: string;
  estimated_value_gbp?: number;
  business_justification?: string;
  approval_required: boolean;
  approval_status: string;
  approved_by?: string;
  declined: boolean;
  declined_reason?: string;
  notes?: string;
}

const typeLabels: Record<string, string> = {
  gift_received: "Gift Received",
  gift_given: "Gift Given",
  hospitality_received: "Hospitality Received",
  hospitality_given: "Hospitality Given",
};

const typeColors: Record<string, string> = {
  gift_received: "bg-emerald-100 text-emerald-700",
  gift_given: "bg-blue-100 text-blue-700",
  hospitality_received: "bg-purple-100 text-purple-700",
  hospitality_given: "bg-teal-100 text-teal-700",
};

const approvalColors: Record<string, string> = {
  not_required: "bg-slate-100 text-slate-700",
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const chartColors = {
  gift_received: "#10b981",
  gift_given: "#3b82f6",
  hospitality_received: "#8b5cf6",
  hospitality_given: "#14b8a6",
};

export function GiftsHospitalityClient() {
  const searchParams = useSearchParams();
  const packId = searchParams.get("packId");
  const toast = useToast();
  const [records, setRecords] = useState<GiftRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    entry_type: "all",
    approval_status: "all",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drillDownFilter, setDrillDownFilter] = useState<{ key: string; value: string } | null>(null);
  const [monthFilter, setMonthFilter] = useState<{ key: string; label: string } | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GiftRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    entry_type: "gift_received",
    date_of_event: new Date().toISOString().split("T")[0],
    recipient_name: "",
    recipient_organization: "",
    provider_name: "",
    provider_organization: "",
    description: "",
    estimated_value_gbp: "",
    business_justification: "",
    declined: false,
    declined_reason: "",
    notes: "",
  });

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const url = packId ? `/api/registers/gifts-hospitality?packId=${packId}` : "/api/registers/gifts-hospitality";
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
      entry_type: "gift_received",
      date_of_event: new Date().toISOString().split("T")[0],
      recipient_name: "",
      recipient_organization: "",
      provider_name: "",
      provider_organization: "",
      description: "",
      estimated_value_gbp: "",
      business_justification: "",
      declined: false,
      declined_reason: "",
      notes: "",
    });

  const handleSave = async () => {
    if (!formData.description.trim()) {
      toast.error("Description required");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        pack_id: packId || undefined,
        estimated_value_gbp: formData.estimated_value_gbp ? parseFloat(formData.estimated_value_gbp) : undefined,
      };
      const url = editingRecord ? `/api/registers/gifts-hospitality/${editingRecord.id}` : "/api/registers/gifts-hospitality";
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
      await fetch(`/api/registers/gifts-hospitality/${id}`, { method: "DELETE" });
      loadRecords();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const openEdit = (r: GiftRecord) => {
    setEditingRecord(r);
    setFormData({
      entry_type: r.entry_type,
      date_of_event: r.date_of_event?.split("T")[0] || "",
      recipient_name: r.recipient_name || "",
      recipient_organization: r.recipient_organization || "",
      provider_name: r.provider_name || "",
      provider_organization: r.provider_organization || "",
      description: r.description,
      estimated_value_gbp: r.estimated_value_gbp?.toString() || "",
      business_justification: r.business_justification || "",
      declined: r.declined,
      declined_reason: r.declined_reason || "",
      notes: r.notes || "",
    });
    setShowAddDialog(true);
  };

  const handleBulkImport = async (data: Record<string, unknown>[]) => {
    const results = await Promise.allSettled(
      data.map((row) =>
        fetch("/api/registers/gifts-hospitality", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entry_type: row.entry_type || row["Type"] || "gift_received",
            date_of_event: row.date_of_event || row["Date"] || new Date().toISOString(),
            description: row.description || row["Description"] || "",
            estimated_value_gbp: row.estimated_value_gbp || row["Value"] ? parseFloat(String(row.estimated_value_gbp || row["Value"])) : undefined,
            provider_name: row.provider_name || row["Provider"] || "",
            recipient_name: row.recipient_name || row["Recipient"] || "",
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
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.provider_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.recipient_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterValues.entry_type === "all" || r.entry_type === filterValues.entry_type;
      const matchesApproval = filterValues.approval_status === "all" || r.approval_status === filterValues.approval_status;
      const matchesDrillDown =
        !drillDownFilter ||
        (drillDownFilter.key === "type" && r.entry_type === drillDownFilter.value) ||
        (drillDownFilter.key === "approval" && r.approval_status === drillDownFilter.value);
      return matchesSearch && matchesType && matchesApproval && matchesDrillDown;
    });
  }, [records, searchQuery, filterValues, drillDownFilter]);

  const filteredRecords = useMemo(() => {
    if (!monthFilter) return baseFilteredRecords;
    return baseFilteredRecords.filter((r) => getMonthKey(r.date_of_event) === monthFilter.key);
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
      received: filteredRecords.filter((r) => r.entry_type.includes("received")).length,
      given: filteredRecords.filter((r) => r.entry_type.includes("given")).length,
      pendingApproval: filteredRecords.filter((r) => r.approval_status === "pending").length,
      totalValue: filteredRecords.reduce((sum, r) => sum + (r.estimated_value_gbp || 0), 0),
    }),
    [filteredRecords]
  );

  // Chart data
  const typeChartData = useMemo(
    () => [
      { label: "Gift Received", value: filteredRecords.filter((r) => r.entry_type === "gift_received").length, color: chartColors.gift_received },
      { label: "Gift Given", value: filteredRecords.filter((r) => r.entry_type === "gift_given").length, color: chartColors.gift_given },
      { label: "Hospitality Received", value: filteredRecords.filter((r) => r.entry_type === "hospitality_received").length, color: chartColors.hospitality_received },
      { label: "Hospitality Given", value: filteredRecords.filter((r) => r.entry_type === "hospitality_given").length, color: chartColors.hospitality_given },
    ],
    [filteredRecords]
  );

  const valueByTypeData = useMemo(() => {
    const sums: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      sums[r.entry_type] = (sums[r.entry_type] || 0) + (r.estimated_value_gbp || 0);
    });
    return Object.entries(sums).map(([type, value]) => ({
      label: typeLabels[type] || type,
      value: Math.round(value),
    }));
  }, [filteredRecords]);

  const trendData = useMemo(() => {
    return generateTrendData(baseFilteredRecords, 6, 'date_of_event');
  }, [baseFilteredRecords]);

  const isReceived = formData.entry_type.includes("received");

  // Table columns
  const columns: Column<GiftRecord>[] = [
    {
      key: "entry_type",
      header: "Type",
      sortable: true,
      render: (value) => renderBadge(value as string, typeColors, typeLabels),
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
      render: (value) => <span className="font-medium text-slate-900 line-clamp-1">{value as string}</span>,
    },
    {
      key: "provider_name",
      header: "From/To",
      sortable: true,
      render: (value, row) => (
        <span className="text-slate-600">
          {row.entry_type.includes("received") ? row.provider_name || row.provider_organization : row.recipient_name || row.recipient_organization}
        </span>
      ),
    },
    {
      key: "estimated_value_gbp",
      header: "Value",
      sortable: true,
      render: (value) => renderCurrency(value as number),
    },
    {
      key: "approval_status",
      header: "Approval",
      sortable: true,
      render: (value) => renderBadge(value as string, approvalColors),
    },
    {
      key: "date_of_event",
      header: "Date",
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
        { key: "entry_type", header: "Type", transform: (v) => typeLabels[v as string] || String(v) },
        { key: "description", header: "Description" },
        { key: "provider_name", header: "Provider" },
        { key: "recipient_name", header: "Recipient" },
        { key: "estimated_value_gbp", header: "Value (GBP)", transform: transforms.currency },
        { key: "approval_status", header: "Approval", transform: transforms.titleCase },
        { key: "date_of_event", header: "Date", transform: transforms.date },
        { key: "business_justification", header: "Justification" },
      ],
      "gifts_hospitality_selected"
    );
  };

  const handleExportAll = () => {
    exportToCSV(
      filteredRecords,
      [
        { key: "entry_type", header: "Type", transform: (v) => typeLabels[v as string] || String(v) },
        { key: "description", header: "Description" },
        { key: "provider_name", header: "Provider Name" },
        { key: "provider_organization", header: "Provider Organization" },
        { key: "recipient_name", header: "Recipient Name" },
        { key: "recipient_organization", header: "Recipient Organization" },
        { key: "estimated_value_gbp", header: "Value (GBP)", transform: transforms.currency },
        { key: "approval_status", header: "Approval", transform: transforms.titleCase },
        { key: "date_of_event", header: "Date", transform: transforms.date },
        { key: "business_justification", header: "Justification" },
        { key: "declined", header: "Declined", transform: transforms.boolean },
      ],
      "gifts_hospitality_register"
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
          <h1 className="text-2xl font-bold text-slate-900">Gifts & Hospitality</h1>
          <p className="text-sm text-slate-500">Track gifts and hospitality given and received</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditingRecord(null);
            setShowAddDialog(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> New Entry
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
            key: "entry_type",
            label: "Type",
            options: Object.entries(typeLabels).map(([k, v]) => ({ value: k, label: v })),
          },
          {
            key: "approval_status",
            label: "Approval",
            options: [
              { value: "not_required", label: "Not Required" },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
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
          headers: ["Type", "Description", "Provider", "Recipient", "Value", "Date"],
          sampleRow: ["gift_received", "Corporate dinner", "ABC Corp", "John Smith", "150", "2024-01-15"],
        }}
        registerName="Gifts & Hospitality"
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
              title="Total Entries"
              value={stats.total}
              icon={<Gift className="h-5 w-5" />}
              color="slate"
              onClick={() => setDrillDownFilter(null)}
              isActive={!drillDownFilter}
            />
            <StatCard
              title="Received"
              value={stats.received}
              icon={<ArrowDownLeft className="h-5 w-5" />}
              color="emerald"
              onClick={() => handleDrillDown("type", "gift_received")}
              isActive={drillDownFilter?.key === "type" && drillDownFilter?.value?.includes("received")}
            />
            <StatCard
              title="Given"
              value={stats.given}
              icon={<ArrowUpRight className="h-5 w-5" />}
              color="blue"
              onClick={() => handleDrillDown("type", "gift_given")}
              isActive={drillDownFilter?.key === "type" && drillDownFilter?.value?.includes("given")}
            />
            <StatCard
              title="Pending Approval"
              value={stats.pendingApproval}
              icon={<Clock className="h-5 w-5" />}
              color="amber"
              onClick={() => handleDrillDown("approval", "pending")}
              isActive={drillDownFilter?.key === "approval" && drillDownFilter?.value === "pending"}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <DonutChart
              data={typeChartData}
              title="Entries by Type"
              onSegmentClick={(label) => {
                const typeKey = Object.entries(typeLabels).find(([, v]) => v === label)?.[0];
                if (typeKey) handleDrillDown("type", typeKey);
              }}
              activeSegment={drillDownFilter?.key === "type" ? typeLabels[drillDownFilter.value] : undefined}
            />
            <BarChart
              data={valueByTypeData}
              title="Total Value by Type (GBP)"
              onBarClick={(label) => {
                const typeKey = Object.entries(typeLabels).find(([, v]) => v === label)?.[0];
                if (typeKey) handleDrillDown("type", typeKey);
              }}
              activeBar={drillDownFilter?.key === "type" ? typeLabels[drillDownFilter.value] : undefined}
            />
          </div>

          <TrendChart
            data={trendData}
            title="Entries Trend (6 Months)"
            color="#ec4899"
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
            rowClassName={(row) => (row.declined ? "bg-red-50/50" : row.approval_status === "pending" ? "bg-amber-50/50" : "")}
            emptyMessage="No entries found"
            emptyIcon={<Gift className="h-12 w-12" />}
          />
          <PaginationControls {...paginationProps} />
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit" : "New"} Entry</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.entry_type} onValueChange={(v) => setFormData({ ...formData, entry_type: v })}>
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
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date_of_event}
                  onChange={(e) => setFormData({ ...formData, date_of_event: e.target.value })}
                />
              </div>
            </div>
            {isReceived ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Provider Name</Label>
                  <Input value={formData.provider_name} onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Provider Organization</Label>
                  <Input value={formData.provider_organization} onChange={(e) => setFormData({ ...formData, provider_organization: e.target.value })} />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Recipient Name</Label>
                  <Input value={formData.recipient_name} onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Recipient Organization</Label>
                  <Input value={formData.recipient_organization} onChange={(e) => setFormData({ ...formData, recipient_organization: e.target.value })} />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Estimated Value (GBP)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.estimated_value_gbp}
                  onChange={(e) => setFormData({ ...formData, estimated_value_gbp: e.target.value })}
                  placeholder="Values over 50 require approval"
                />
              </div>
              <div className="flex items-center gap-3 pt-8">
                <Switch checked={formData.declined} onCheckedChange={(v) => setFormData({ ...formData, declined: v })} />
                <Label>Declined</Label>
              </div>
            </div>
            {formData.declined && (
              <div className="space-y-2">
                <Label>Reason for Declining</Label>
                <Textarea value={formData.declined_reason} onChange={(e) => setFormData({ ...formData, declined_reason: e.target.value })} rows={2} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Business Justification</Label>
              <Textarea
                value={formData.business_justification}
                onChange={(e) => setFormData({ ...formData, business_justification: e.target.value })}
                rows={2}
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
