"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { generateTrendData, getMonthKey, type TrendPoint } from "@/lib/chart-utils";
import { useToast } from "@/components/toast-provider";
import { Plus, Loader2, Megaphone, AlertTriangle, CheckCircle, Clock, FileText, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FinPromUpload } from "@/components/fin-prom/FinPromUpload";
import { FinPromAnalysisResults, AnalysisResult } from "@/components/fin-prom/FinPromAnalysisResults";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RegisterToolbar, ViewMode } from "@/components/registers/RegisterToolbar";
import { RegisterDataTable, Column, renderBadge, renderDate } from "@/components/registers/RegisterDataTable";
import { StatCard, DonutChart, BarChart, TrendChart } from "@/components/registers/RegisterCharts";
import { exportToCSV, transforms } from "@/lib/export-utils";
import { PaginationControls, usePagination } from "@/components/ui/pagination-controls";

interface FinPromRecord {
  id: string;
  promotion_reference: string;
  promotion_title: string;
  promotion_type: string;
  channel: string;
  target_audience?: string;
  product_service?: string;
  content_summary?: string;
  created_date: string;
  created_by?: string;
  approved_by?: string;
  approval_date?: string;
  approval_status: string;
  compliance_reviewer?: string;
  compliance_notes?: string;
  version_number: number;
  live_date?: string;
  expiry_date?: string;
  risk_rating: string;
  status: string;
  notes?: string;
}

const typeLabels: Record<string, string> = {
  advertisement: "Advertisement",
  website: "Website Content",
  social_media: "Social Media",
  email: "Email Campaign",
  brochure: "Brochure/Leaflet",
  presentation: "Presentation",
  video: "Video Content",
  app: "App Content",
  sms: "SMS/Text",
  other: "Other",
};

const channelLabels: Record<string, string> = {
  online: "Online",
  print: "Print",
  broadcast: "Broadcast",
  social: "Social Media",
  email: "Email",
  direct_mail: "Direct Mail",
  phone: "Phone",
  in_person: "In Person",
  app: "Mobile App",
  other: "Other",
};

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  live: "bg-emerald-100 text-emerald-700",
  paused: "bg-amber-100 text-amber-700",
  expired: "bg-orange-100 text-orange-700",
  withdrawn: "bg-red-100 text-red-700",
};

const approvalColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  review: "bg-blue-100 text-blue-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-orange-100 text-orange-700",
};

const chartColors = {
  draft: "#64748b",
  live: "#10b981",
  paused: "#f59e0b",
  expired: "#f97316",
  withdrawn: "#ef4444",
};

export function FinPromClient() {
  const searchParams = useSearchParams();
  const packId = searchParams.get("packId");
  const toast = useToast();
  const [records, setRecords] = useState<FinPromRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    status: "all",
    approval_status: "all",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drillDownFilter, setDrillDownFilter] = useState<{ key: string; value: string } | null>(null);
  const [monthFilter, setMonthFilter] = useState<{ key: string; label: string } | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinPromRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // AI Analysis state
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showAnalysisResults, setShowAnalysisResults] = useState(false);

  const [formData, setFormData] = useState({
    promotion_reference: "",
    promotion_title: "",
    promotion_type: "other",
    channel: "online",
    target_audience: "",
    product_service: "",
    content_summary: "",
    created_date: new Date().toISOString().split("T")[0],
    approved_by: "",
    approval_status: "draft",
    compliance_reviewer: "",
    compliance_notes: "",
    risk_rating: "medium",
    status: "draft",
    notes: "",
  });

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const url = packId ? `/api/registers/fin-prom?packId=${packId}` : "/api/registers/fin-prom";
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
      promotion_reference: "",
      promotion_title: "",
      promotion_type: "other",
      channel: "online",
      target_audience: "",
      product_service: "",
      content_summary: "",
      created_date: new Date().toISOString().split("T")[0],
      approved_by: "",
      approval_status: "draft",
      compliance_reviewer: "",
      compliance_notes: "",
      risk_rating: "medium",
      status: "draft",
      notes: "",
    });

  const handleSave = async () => {
    if (!formData.promotion_reference.trim() || !formData.promotion_title.trim()) {
      toast.error("Reference and title are required");
      return;
    }
    setIsSaving(true);
    try {
      const payload = { ...formData, pack_id: packId || undefined };
      const url = editingRecord ? `/api/registers/fin-prom/${editingRecord.id}` : "/api/registers/fin-prom";
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
    if (!confirm("Delete this promotion record?")) return;
    try {
      await fetch(`/api/registers/fin-prom/${id}`, { method: "DELETE" });
      loadRecords();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const openEdit = (r: FinPromRecord) => {
    setEditingRecord(r);
    setFormData({
      promotion_reference: r.promotion_reference,
      promotion_title: r.promotion_title,
      promotion_type: r.promotion_type,
      channel: r.channel,
      target_audience: r.target_audience || "",
      product_service: r.product_service || "",
      content_summary: r.content_summary || "",
      created_date: r.created_date?.split("T")[0] || "",
      approved_by: r.approved_by || "",
      approval_status: r.approval_status,
      compliance_reviewer: r.compliance_reviewer || "",
      compliance_notes: r.compliance_notes || "",
      risk_rating: r.risk_rating,
      status: r.status,
      notes: r.notes || "",
    });
    setShowAddDialog(true);
  };

  const handleBulkImport = async (data: Record<string, unknown>[]) => {
    const results = await Promise.allSettled(
      data.map((row) =>
        fetch("/api/registers/fin-prom", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            promotion_reference: row.promotion_reference || row["Reference"],
            promotion_title: row.promotion_title || row["Title"],
            promotion_type: row.promotion_type || row["Type"] || "other",
            channel: row.channel || row["Channel"] || "online",
            created_date: row.created_date || row["Created Date"] || new Date().toISOString(),
            status: row.status || row["Status"] || "draft",
            approval_status: row.approval_status || row["Approval Status"] || "draft",
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
        r.promotion_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.promotion_title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterValues.status === "all" || r.status === filterValues.status;
      const matchesApproval = filterValues.approval_status === "all" || r.approval_status === filterValues.approval_status;
      const matchesDrillDown =
        !drillDownFilter ||
        (drillDownFilter.key === "status" && r.status === drillDownFilter.value) ||
        (drillDownFilter.key === "approval" && r.approval_status === drillDownFilter.value) ||
        (drillDownFilter.key === "type" && r.promotion_type === drillDownFilter.value);
      return matchesSearch && matchesStatus && matchesApproval && matchesDrillDown;
    });
  }, [records, searchQuery, filterValues, drillDownFilter]);

  const filteredRecords = useMemo(() => {
    if (!monthFilter) return baseFilteredRecords;
    return baseFilteredRecords.filter((r) => getMonthKey(r.created_date) === monthFilter.key);
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
      live: filteredRecords.filter((r) => r.status === "live").length,
      draft: filteredRecords.filter((r) => r.status === "draft").length,
      pendingApproval: filteredRecords.filter((r) => r.approval_status === "review").length,
      approved: filteredRecords.filter((r) => r.approval_status === "approved").length,
    }),
    [filteredRecords]
  );

  // Chart data
  const statusChartData = useMemo(
    () => [
      { label: "Live", value: stats.live, color: chartColors.live },
      { label: "Draft", value: stats.draft, color: chartColors.draft },
      { label: "Paused", value: filteredRecords.filter((r) => r.status === "paused").length, color: chartColors.paused },
    ],
    [stats, filteredRecords]
  );

  const typeChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      counts[r.promotion_type] = (counts[r.promotion_type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      label: typeLabels[type] || type,
      value: count,
    }));
  }, [filteredRecords]);

  const trendData = useMemo(() => {
    return generateTrendData(baseFilteredRecords, 6, 'created_date');
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
  const columns: Column<FinPromRecord>[] = [
    {
      key: "promotion_reference",
      header: "Reference",
      sortable: true,
      render: (value, row) => (
        <div>
          <span className="font-medium text-slate-900">{value as string}</span>
          <p className="text-xs text-slate-500 truncate max-w-[200px]">{row.promotion_title}</p>
        </div>
      ),
    },
    {
      key: "promotion_type",
      header: "Type",
      sortable: true,
      render: (value) => typeLabels[value as string] || value,
    },
    {
      key: "channel",
      header: "Channel",
      sortable: true,
      render: (value) => channelLabels[value as string] || value,
    },
    {
      key: "approval_status",
      header: "Approval",
      sortable: true,
      render: (value) => renderBadge(value as string, approvalColors),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value) => renderBadge(value as string, statusColors),
    },
    {
      key: "created_date",
      header: "Created",
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
        { key: "promotion_reference", header: "Reference" },
        { key: "promotion_title", header: "Title" },
        { key: "promotion_type", header: "Type", transform: (v) => typeLabels[v as string] || String(v) },
        { key: "channel", header: "Channel", transform: (v) => channelLabels[v as string] || String(v) },
        { key: "status", header: "Status", transform: transforms.titleCase },
        { key: "approval_status", header: "Approval Status", transform: transforms.titleCase },
        { key: "created_date", header: "Created Date", transform: transforms.date },
      ],
      "fin_prom_selected"
    );
  };

  const handleExportAll = () => {
    exportToCSV(
      filteredRecords,
      [
        { key: "promotion_reference", header: "Reference" },
        { key: "promotion_title", header: "Title" },
        { key: "promotion_type", header: "Type", transform: (v) => typeLabels[v as string] || String(v) },
        { key: "channel", header: "Channel", transform: (v) => channelLabels[v as string] || String(v) },
        { key: "target_audience", header: "Target Audience" },
        { key: "product_service", header: "Product/Service" },
        { key: "status", header: "Status", transform: transforms.titleCase },
        { key: "approval_status", header: "Approval Status", transform: transforms.titleCase },
        { key: "approved_by", header: "Approved By" },
        { key: "created_date", header: "Created Date", transform: transforms.date },
      ],
      "fin_prom_register"
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

  // AI Analysis handlers
  const handleFileAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/fin-prom/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Analysis failed");
      }

      const result = await res.json();
      setAnalysisResult(result);
      setShowUploadDialog(false);
      setShowAnalysisResults(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to analyze promotion");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUrlAnalysis = async (url: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/fin-prom/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Analysis failed");
      }

      const result = await res.json();
      setAnalysisResult(result);
      setShowUploadDialog(false);
      setShowAnalysisResults(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to analyze URL");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAcceptAnalysis = () => {
    if (!analysisResult) return;

    // Pre-populate form with extracted details
    const typeMap: Record<string, string> = {
      advertisement: "advertisement",
      website: "website",
      social_media: "social_media",
      email: "email",
      brochure: "brochure",
      presentation: "presentation",
      video: "video",
      app: "app",
      sms: "sms",
      other: "other",
    };

    const channelMap: Record<string, string> = {
      online: "online",
      print: "print",
      broadcast: "broadcast",
      social: "social",
      email: "email",
      direct_mail: "direct_mail",
      phone: "phone",
      in_person: "in_person",
      app: "app",
      other: "other",
    };

    // Determine risk rating based on compliance score
    let riskRating = "low";
    if (analysisResult.complianceScore < 60) riskRating = "high";
    else if (analysisResult.complianceScore < 80) riskRating = "medium";

    setFormData({
      promotion_reference: `FP-${Date.now().toString(36).toUpperCase()}`,
      promotion_title: analysisResult.extractedDetails.productService || "AI Analyzed Promotion",
      promotion_type: typeMap[analysisResult.extractedDetails.promotionType] || "other",
      channel: channelMap[analysisResult.extractedDetails.channel] || "online",
      target_audience: analysisResult.extractedDetails.targetAudience || "",
      product_service: analysisResult.extractedDetails.productService || "",
      content_summary: analysisResult.summary,
      created_date: new Date().toISOString().split("T")[0],
      approved_by: "",
      approval_status: "review",
      compliance_reviewer: "",
      compliance_notes: analysisResult.issues
        .map((i) => `[${i.severity.toUpperCase()}] ${i.category}: ${i.description} - ${i.recommendation}`)
        .join("\n"),
      risk_rating: riskRating,
      status: "draft",
      notes: `AI Compliance Score: ${analysisResult.complianceScore}/100\nRisk warnings found: ${analysisResult.extractedDetails.riskWarningsFound ? "Yes" : "No"}\nClaims: ${analysisResult.extractedDetails.claimsIdentified.join(", ") || "None identified"}`,
    });

    setShowAnalysisResults(false);
    setAnalysisResult(null);
    setEditingRecord(null);
    setShowAddDialog(true);
  };

  const handleEditBeforeSaving = () => {
    handleAcceptAnalysis();
  };

  const handleRescan = () => {
    setShowAnalysisResults(false);
    setAnalysisResult(null);
    setShowUploadDialog(true);
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
            <Megaphone className="h-6 w-6 text-blue-600" />
            FinProm Tracker
          </h1>
          <p className="text-sm text-slate-500">Track financial promotions and marketing compliance</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowUploadDialog(true)}
            className="border-teal-200 text-teal-700 hover:bg-teal-50"
          >
            <Sparkles className="mr-2 h-4 w-4" /> AI Analysis
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setEditingRecord(null);
              setShowAddDialog(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Promotion
          </Button>
        </div>
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
              { value: "draft", label: "Draft" },
              { value: "live", label: "Live" },
              { value: "paused", label: "Paused" },
              { value: "expired", label: "Expired" },
              { value: "withdrawn", label: "Withdrawn" },
            ],
          },
          {
            key: "approval_status",
            label: "Approval",
            options: [
              { value: "draft", label: "Draft" },
              { value: "review", label: "In Review" },
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
          headers: ["Reference", "Title", "Type", "Channel", "Created Date", "Status", "Approval Status"],
          sampleRow: ["FP-2024-001", "New Product Launch Email", "email", "email", "2024-01-15", "draft", "draft"],
        }}
        registerName="FinProm Tracker"
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
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2">
          <span className="text-sm text-blue-700">
            Filtered by {drillDownFilter.key}: <strong>{drillDownFilter.value}</strong>
          </span>
          <Button variant="ghost" size="sm" onClick={() => setDrillDownFilter(null)} className="h-6 text-blue-600 hover:text-blue-700">
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
              title="Total Promotions"
              value={stats.total}
              icon={<FileText className="h-5 w-5" />}
              color="slate"
              onClick={() => setDrillDownFilter(null)}
              isActive={!drillDownFilter}
            />
            <StatCard
              title="Live"
              value={stats.live}
              icon={<CheckCircle className="h-5 w-5" />}
              color="emerald"
              onClick={() => handleDrillDown("status", "live")}
              isActive={drillDownFilter?.key === "status" && drillDownFilter?.value === "live"}
            />
            <StatCard
              title="Pending Approval"
              value={stats.pendingApproval}
              icon={<Clock className="h-5 w-5" />}
              color="amber"
              onClick={() => handleDrillDown("approval", "review")}
              isActive={drillDownFilter?.key === "approval" && drillDownFilter?.value === "review"}
            />
            <StatCard
              title="Approved"
              value={stats.approved}
              icon={<CheckCircle className="h-5 w-5" />}
              color="blue"
              onClick={() => handleDrillDown("approval", "approved")}
              isActive={drillDownFilter?.key === "approval" && drillDownFilter?.value === "approved"}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <DonutChart
              data={statusChartData}
              title="Promotions by Status"
              onSegmentClick={(label) => handleDrillDown("status", label.toLowerCase())}
              activeSegment={drillDownFilter?.key === "status" ? drillDownFilter.value : undefined}
            />
            <BarChart
              data={typeChartData}
              title="Promotions by Type"
              onBarClick={(label) => {
                const typeKey = Object.entries(typeLabels).find(([, v]) => v === label)?.[0];
                if (typeKey) handleDrillDown("type", typeKey);
              }}
              activeBar={drillDownFilter?.key === "type" ? typeLabels[drillDownFilter.value] : undefined}
            />
          </div>

          <TrendChart
            data={trendData}
            title="Promotions Created (6 Months)"
            color="#3b82f6"
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
            emptyMessage="No financial promotions recorded"
            emptyIcon={<Megaphone className="h-12 w-12" />}
          />
          <PaginationControls {...paginationProps} />
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit" : "Add"} Financial Promotion</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Promotion Reference *</Label>
                <Input
                  value={formData.promotion_reference}
                  onChange={(e) => setFormData({ ...formData, promotion_reference: e.target.value })}
                  placeholder="e.g., FP-2024-001"
                />
              </div>
              <div className="space-y-2">
                <Label>Promotion Type</Label>
                <Select value={formData.promotion_type} onValueChange={(v) => setFormData({ ...formData, promotion_type: v })}>
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
              <Label>Promotion Title *</Label>
              <Input
                value={formData.promotion_title}
                onChange={(e) => setFormData({ ...formData, promotion_title: e.target.value })}
                placeholder="Title of the promotion"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select value={formData.channel} onValueChange={(v) => setFormData({ ...formData, channel: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(channelLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Created Date</Label>
                <Input
                  type="date"
                  value={formData.created_date}
                  onChange={(e) => setFormData({ ...formData, created_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Input
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  placeholder="e.g., Retail customers"
                />
              </div>
              <div className="space-y-2">
                <Label>Product/Service</Label>
                <Input
                  value={formData.product_service}
                  onChange={(e) => setFormData({ ...formData, product_service: e.target.value })}
                  placeholder="Related product or service"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Content Summary</Label>
              <Textarea
                value={formData.content_summary}
                onChange={(e) => setFormData({ ...formData, content_summary: e.target.value })}
                rows={3}
                placeholder="Brief summary of the promotion content..."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Approval Status</Label>
                <Select value={formData.approval_status} onValueChange={(v) => setFormData({ ...formData, approval_status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">In Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
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
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Approved By</Label>
                <Input
                  value={formData.approved_by}
                  onChange={(e) => setFormData({ ...formData, approved_by: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Compliance Reviewer</Label>
                <Input
                  value={formData.compliance_reviewer}
                  onChange={(e) => setFormData({ ...formData, compliance_reviewer: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Compliance Notes</Label>
              <Textarea
                value={formData.compliance_notes}
                onChange={(e) => setFormData({ ...formData, compliance_notes: e.target.value })}
                rows={2}
                placeholder="Notes from compliance review..."
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

      {/* AI Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-teal-600" />
              AI Compliance Analysis
            </DialogTitle>
            <DialogDescription>
              Upload a financial promotion to analyze for FCA compliance
            </DialogDescription>
          </DialogHeader>
          <FinPromUpload
            onFileSelect={handleFileAnalysis}
            onUrlSubmit={handleUrlAnalysis}
            onCancel={() => setShowUploadDialog(false)}
            isAnalyzing={isAnalyzing}
          />
        </DialogContent>
      </Dialog>

      {/* Analysis Results Dialog */}
      <Dialog open={showAnalysisResults} onOpenChange={setShowAnalysisResults}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-teal-600" />
              AI Compliance Analysis Results
            </DialogTitle>
          </DialogHeader>
          {analysisResult && (
            <FinPromAnalysisResults
              result={analysisResult}
              onAccept={handleAcceptAnalysis}
              onEdit={handleEditBeforeSaving}
              onRescan={handleRescan}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
