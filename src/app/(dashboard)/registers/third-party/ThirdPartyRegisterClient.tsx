"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  Shield,
  Calendar,
  Loader2,
  Trash2,
  Edit,
  X,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CountryPicker } from "@/components/registers/CountryPicker";
import { RegisterToolbar, type ViewMode } from "@/components/registers/RegisterToolbar";
import {
  RegisterDataTable,
  Column,
  renderBadge,
  renderDate,
  renderCurrency,
} from "@/components/registers/RegisterDataTable";
import {
  StatCard,
  DonutChart,
  BarChart,
  TrendChart,
} from "@/components/registers/RegisterCharts";
import { exportToCSV, ExportColumn, transforms } from "@/lib/export-utils";
import { generateTrendData, getMonthKey, type TrendPoint } from "@/lib/chart-utils";
import { PaginationControls, usePagination } from "@/components/ui/pagination-controls";

interface ThirdPartyRecord {
  id: string;
  organization_id: string;
  pack_id?: string;
  vendor_name: string;
  vendor_type: string;
  service_description?: string;
  criticality: string;
  is_outsourcing: boolean;
  is_material_outsourcing: boolean;
  regulatory_notification_required: boolean;
  contract_start_date?: string;
  contract_end_date?: string;
  contract_value_gbp?: number;
  risk_rating: string;
  status: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  due_diligence_completed: boolean;
  due_diligence_date?: string;
  last_review_date?: string;
  next_review_date?: string;
  exit_strategy_documented: boolean;
  data_processing_agreement: boolean;
  sub_outsourcing_permitted: boolean;
  geographic_location?: string;
  approval_status: string;
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

const vendorTypeLabels: Record<string, string> = {
  technology: "Technology Provider",
  cloud_services: "Cloud Services",
  payment_processing: "Payment Processing",
  data_provider: "Data Provider",
  compliance_services: "Compliance Services",
  audit_services: "Audit Services",
  legal_services: "Legal Services",
  consulting: "Consulting",
  infrastructure: "Infrastructure",
  security: "Security Services",
  other: "Other",
};

const criticalityColors: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-100 text-slate-700",
  pending: "bg-amber-100 text-amber-700",
  terminated: "bg-red-100 text-red-700",
  under_review: "bg-blue-100 text-blue-700",
};

const riskColors: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

// CSV export configuration
const exportColumns: ExportColumn[] = [
  { key: "vendor_name", header: "Vendor Name" },
  { key: "vendor_type", header: "Vendor Type", transform: (v) => vendorTypeLabels[String(v)] || String(v) },
  { key: "service_description", header: "Service Description" },
  { key: "criticality", header: "Criticality", transform: transforms.titleCase },
  { key: "risk_rating", header: "Risk Rating", transform: transforms.titleCase },
  { key: "status", header: "Status", transform: transforms.titleCase },
  { key: "is_outsourcing", header: "Outsourcing", transform: transforms.boolean },
  { key: "is_material_outsourcing", header: "Material Outsourcing", transform: transforms.boolean },
  { key: "regulatory_notification_required", header: "FCA Notification Required", transform: transforms.boolean },
  { key: "contract_start_date", header: "Contract Start", transform: transforms.date },
  { key: "contract_end_date", header: "Contract End", transform: transforms.date },
  { key: "contract_value_gbp", header: "Contract Value", transform: transforms.currency },
  { key: "primary_contact_name", header: "Contact Name" },
  { key: "primary_contact_email", header: "Contact Email" },
  { key: "primary_contact_phone", header: "Contact Phone" },
  { key: "geographic_location", header: "Location" },
  { key: "due_diligence_completed", header: "DD Completed", transform: transforms.boolean },
  { key: "exit_strategy_documented", header: "Exit Strategy", transform: transforms.boolean },
  { key: "data_processing_agreement", header: "DPA", transform: transforms.boolean },
  { key: "next_review_date", header: "Next Review", transform: transforms.date },
  { key: "notes", header: "Notes" },
  { key: "created_at", header: "Created", transform: transforms.datetime },
];

// Bulk import template
const importTemplate = {
  headers: [
    "vendor_name",
    "vendor_type",
    "service_description",
    "criticality",
    "risk_rating",
    "status",
    "is_outsourcing",
    "is_material_outsourcing",
    "contract_start_date",
    "contract_end_date",
    "contract_value_gbp",
    "primary_contact_name",
    "primary_contact_email",
    "geographic_location",
    "notes",
  ],
  sampleRow: [
    "Acme Cloud Services",
    "cloud_services",
    "Cloud hosting and data storage",
    "high",
    "medium",
    "active",
    "true",
    "true",
    "2024-01-01",
    "2026-12-31",
    "50000",
    "John Smith",
    "john.smith@acme.com",
    "United Kingdom",
    "Primary cloud provider",
  ],
  requiredFields: ["vendor_name", "vendor_type", "criticality"],
  fieldDescriptions: {
    vendor_name: "Name of the third-party vendor (required)",
    vendor_type: "technology, cloud_services, payment_processing, compliance_services, etc.",
    service_description: "Description of services provided",
    criticality: "low, medium, high, critical",
    risk_rating: "low, medium, high, critical",
    status: "active, pending, inactive, under_review, terminated",
    is_outsourcing: "true/false - Whether this is an outsourcing arrangement",
    is_material_outsourcing: "true/false - Whether this is material outsourcing",
    contract_start_date: "YYYY-MM-DD format",
    contract_end_date: "YYYY-MM-DD format",
    contract_value_gbp: "Numeric value in GBP",
    primary_contact_name: "Main contact person name",
    primary_contact_email: "Contact email address",
    geographic_location: "Country or region",
    notes: "Additional notes",
  },
};

export function ThirdPartyRegisterClient() {
  const searchParams = useSearchParams();
  const packId = searchParams.get("packId");

  const [records, setRecords] = useState<ThirdPartyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [criticalityFilter, setCriticalityFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ThirdPartyRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // New state for enhanced features
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drillDownFilter, setDrillDownFilter] = useState<{
    key: string;
    value: string;
  } | null>(null);
  const [monthFilter, setMonthFilter] = useState<{ key: string; label: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    vendor_name: "",
    vendor_type: "technology",
    service_description: "",
    criticality: "medium",
    is_outsourcing: false,
    is_material_outsourcing: false,
    regulatory_notification_required: false,
    contract_start_date: "",
    contract_end_date: "",
    contract_value_gbp: "",
    risk_rating: "medium",
    status: "active",
    primary_contact_name: "",
    primary_contact_email: "",
    primary_contact_phone: "",
    due_diligence_completed: false,
    next_review_date: "",
    exit_strategy_documented: false,
    data_processing_agreement: false,
    sub_outsourcing_permitted: false,
    geographic_location: "",
    notes: "",
  });

  const loadRecords = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = packId
        ? `/api/registers/third-party?packId=${packId}`
        : "/api/registers/third-party";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch records");
      const data = await response.json();
      setRecords(data.records || []);
    } catch (err) {
      setError("Failed to load third-party records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [packId]);

  const resetForm = () => {
    setFormData({
      vendor_name: "",
      vendor_type: "technology",
      service_description: "",
      criticality: "medium",
      is_outsourcing: false,
      is_material_outsourcing: false,
      regulatory_notification_required: false,
      contract_start_date: "",
      contract_end_date: "",
      contract_value_gbp: "",
      risk_rating: "medium",
      status: "active",
      primary_contact_name: "",
      primary_contact_email: "",
      primary_contact_phone: "",
      due_diligence_completed: false,
      next_review_date: "",
      exit_strategy_documented: false,
      data_processing_agreement: false,
      sub_outsourcing_permitted: false,
      geographic_location: "",
      notes: "",
    });
    setEditingRecord(null);
  };

  const handleSave = async () => {
    if (!formData.vendor_name.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      const url = editingRecord
        ? `/api/registers/third-party/${editingRecord.id}`
        : "/api/registers/third-party";
      const method = editingRecord ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          pack_id: packId || undefined,
          contract_value_gbp: formData.contract_value_gbp
            ? parseFloat(formData.contract_value_gbp)
            : null,
        }),
      });

      if (!response.ok) throw new Error("Failed to save record");

      setShowAddDialog(false);
      resetForm();
      await loadRecords();
    } catch (err) {
      setError("Failed to save third-party record");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (record: ThirdPartyRecord) => {
    setEditingRecord(record);
    setFormData({
      vendor_name: record.vendor_name,
      vendor_type: record.vendor_type,
      service_description: record.service_description || "",
      criticality: record.criticality,
      is_outsourcing: record.is_outsourcing,
      is_material_outsourcing: record.is_material_outsourcing,
      regulatory_notification_required: record.regulatory_notification_required,
      contract_start_date: record.contract_start_date?.split("T")[0] || "",
      contract_end_date: record.contract_end_date?.split("T")[0] || "",
      contract_value_gbp: record.contract_value_gbp?.toString() || "",
      risk_rating: record.risk_rating,
      status: record.status,
      primary_contact_name: record.primary_contact_name || "",
      primary_contact_email: record.primary_contact_email || "",
      primary_contact_phone: record.primary_contact_phone || "",
      due_diligence_completed: record.due_diligence_completed,
      next_review_date: record.next_review_date?.split("T")[0] || "",
      exit_strategy_documented: record.exit_strategy_documented,
      data_processing_agreement: record.data_processing_agreement,
      sub_outsourcing_permitted: record.sub_outsourcing_permitted,
      geographic_location: record.geographic_location || "",
      notes: record.notes || "",
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this third-party record?")) return;

    try {
      const response = await fetch(`/api/registers/third-party/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete record");
      await loadRecords();
    } catch (err) {
      setError("Failed to delete third-party record");
    }
  };

  // Filter records with drill-down
  const baseFilteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.service_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.vendor_type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || record.status === statusFilter;
      const matchesCriticality =
        criticalityFilter === "all" || record.criticality === criticalityFilter;

      // Apply drill-down filter
      let matchesDrillDown = true;
      if (drillDownFilter) {
        const { key, value } = drillDownFilter;
        if (key === "status") {
          matchesDrillDown = record.status === value;
        } else if (key === "criticality") {
          matchesDrillDown = record.criticality === value;
        } else if (key === "risk_rating") {
          matchesDrillDown = record.risk_rating === value;
        } else if (key === "vendor_type") {
          matchesDrillDown = record.vendor_type === value;
        } else if (key === "is_material_outsourcing") {
          matchesDrillDown = record.is_material_outsourcing === (value === "true");
        } else if (key === "due_diligence_completed") {
          matchesDrillDown = record.due_diligence_completed === (value === "true");
        }
      }

      return matchesSearch && matchesStatus && matchesCriticality && matchesDrillDown;
    });
  }, [records, searchQuery, statusFilter, criticalityFilter, drillDownFilter]);

  const filteredRecords = useMemo(() => {
    if (!monthFilter) return baseFilteredRecords;
    return baseFilteredRecords.filter((record) => getMonthKey(record.created_at) === monthFilter.key);
  }, [baseFilteredRecords, monthFilter]);

  // Pagination
  const {
    paginatedData,
    paginationProps,
  } = usePagination(filteredRecords, { initialLimit: 25 });

  // Statistics
  const stats = useMemo(() => {
    return {
      total: filteredRecords.length,
      active: filteredRecords.filter((r) => r.status === "active").length,
      critical: filteredRecords.filter(
        (r) => r.criticality === "critical" || r.criticality === "high"
      ).length,
      materialOutsourcing: filteredRecords.filter((r) => r.is_material_outsourcing).length,
      pendingDD: filteredRecords.filter((r) => !r.due_diligence_completed).length,
    };
  }, [filteredRecords]);

  // Chart data
  const criticalityChartData = useMemo(() => {
    const counts: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    filteredRecords.forEach((r) => {
      counts[r.criticality] = (counts[r.criticality] || 0) + 1;
    });
    return [
      { label: "Low", value: counts.low, color: "#10b981" },
      { label: "Medium", value: counts.medium, color: "#f59e0b" },
      { label: "High", value: counts.high, color: "#f97316" },
      { label: "Critical", value: counts.critical, color: "#ef4444" },
    ].filter((d) => d.value > 0);
  }, [filteredRecords]);

  const vendorTypeChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      counts[r.vendor_type] = (counts[r.vendor_type] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([type, count]) => ({
        label: vendorTypeLabels[type] || type,
        value: count,
        color: "#0d9488",
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredRecords]);

  const trendData = useMemo(() => {
    return generateTrendData(baseFilteredRecords, 6, "created_at");
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

  // Drill-down handlers
  const handleDrillDown = (key: string, value: string) => {
    if (drillDownFilter?.key === key && drillDownFilter?.value === value) {
      setDrillDownFilter(null);
    } else {
      setDrillDownFilter({ key, value });
      setViewMode("table");
    }
  };

  const clearDrillDown = () => {
    setDrillDownFilter(null);
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

  // Export handlers
  const handleExportSelected = () => {
    const selectedRecords = records.filter((r) => selectedIds.has(r.id));
    exportToCSV(selectedRecords, exportColumns, "third-party-register-selected");
  };

  const handleExportAll = () => {
    exportToCSV(filteredRecords, exportColumns, "third-party-register");
  };

  // Bulk import handler
  const handleBulkImport = async (importedRecords: Record<string, string>[]) => {
    try {
      for (const record of importedRecords) {
        await fetch("/api/registers/third-party", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vendor_name: record.vendor_name,
            vendor_type: record.vendor_type || "other",
            service_description: record.service_description || null,
            criticality: record.criticality || "medium",
            risk_rating: record.risk_rating || "medium",
            status: record.status || "active",
            is_outsourcing: record.is_outsourcing === "true",
            is_material_outsourcing: record.is_material_outsourcing === "true",
            regulatory_notification_required: record.regulatory_notification_required === "true",
            contract_start_date: record.contract_start_date || null,
            contract_end_date: record.contract_end_date || null,
            contract_value_gbp: record.contract_value_gbp
              ? parseFloat(record.contract_value_gbp)
              : null,
            primary_contact_name: record.primary_contact_name || null,
            primary_contact_email: record.primary_contact_email || null,
            geographic_location: record.geographic_location || null,
            notes: record.notes || null,
            pack_id: packId || undefined,
          }),
        });
      }
      await loadRecords();
    } catch (err) {
      setError("Failed to import some records");
    }
  };

  // Table columns
  const tableColumns: Column<ThirdPartyRecord>[] = [
    {
      key: "vendor_name",
      header: "Vendor",
      sortable: true,
      render: (_, row) => (
        <div>
          <p className="font-medium text-slate-900">{row.vendor_name}</p>
          {row.service_description && (
            <p className="text-xs text-slate-500 line-clamp-1">
              {row.service_description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "vendor_type",
      header: "Type",
      sortable: true,
      render: (value) => (
        <span className="text-sm">
          {vendorTypeLabels[String(value)] || String(value)}
        </span>
      ),
    },
    {
      key: "criticality",
      header: "Criticality",
      sortable: true,
      render: (value) =>
        renderBadge(String(value), criticalityColors),
    },
    {
      key: "risk_rating",
      header: "Risk",
      sortable: true,
      render: (value) =>
        renderBadge(String(value), riskColors),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value) =>
        renderBadge(String(value), statusColors),
    },
    {
      key: "contract_value_gbp",
      header: "Contract Value",
      sortable: true,
      render: (value) => renderCurrency(value as number | null),
    },
    {
      key: "contract_end_date",
      header: "Contract End",
      sortable: true,
      render: (value) => renderDate(value as string | null),
    },
    {
      key: "due_diligence_completed",
      header: "DD Status",
      render: (value) =>
        value ? (
          <Badge className="bg-emerald-100 text-emerald-700">
            <CheckCircle className="mr-1 h-3 w-3" />
            Complete
          </Badge>
        ) : (
          <Badge className="bg-amber-100 text-amber-700">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        ),
    },
  ];

  if (isLoading) {
    return (
      <Card className="border border-slate-200">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          <span className="ml-2 text-slate-500">Loading Third-Party Register...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Third-Party Register</h1>
          <p className="text-sm text-slate-500">
            Manage vendors, outsourcing arrangements, and third-party relationships
          </p>
        </div>
        <Dialog
          open={showAddDialog}
          onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Third Party
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? "Edit Third Party" : "Add New Third Party"}
              </DialogTitle>
              <DialogDescription>
                Enter the details of the vendor or third-party relationship
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vendor_name">Vendor Name *</Label>
                  <Input
                    id="vendor_name"
                    value={formData.vendor_name}
                    onChange={(e) =>
                      setFormData({ ...formData, vendor_name: e.target.value })
                    }
                    placeholder="Enter vendor name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vendor Type *</Label>
                  <Select
                    value={formData.vendor_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, vendor_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(vendorTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_description">Service Description</Label>
                <Textarea
                  id="service_description"
                  value={formData.service_description}
                  onChange={(e) =>
                    setFormData({ ...formData, service_description: e.target.value })
                  }
                  placeholder="Describe the services provided..."
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Criticality</Label>
                  <Select
                    value={formData.criticality}
                    onValueChange={(value) =>
                      setFormData({ ...formData, criticality: value })
                    }
                  >
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
                  <Label>Risk Rating</Label>
                  <Select
                    value={formData.risk_rating}
                    onValueChange={(value) =>
                      setFormData({ ...formData, risk_rating: value })
                    }
                  >
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Outsourcing flags */}
              <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-700">Outsourcing Classification</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_outsourcing"
                      checked={formData.is_outsourcing}
                      onChange={(e) =>
                        setFormData({ ...formData, is_outsourcing: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <Label htmlFor="is_outsourcing" className="text-sm">
                      Outsourcing Arrangement
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_material_outsourcing"
                      checked={formData.is_material_outsourcing}
                      onChange={(e) =>
                        setFormData({ ...formData, is_material_outsourcing: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <Label htmlFor="is_material_outsourcing" className="text-sm">
                      Material Outsourcing
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="regulatory_notification_required"
                      checked={formData.regulatory_notification_required}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          regulatory_notification_required: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <Label htmlFor="regulatory_notification_required" className="text-sm">
                      FCA Notification Required
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="sub_outsourcing_permitted"
                      checked={formData.sub_outsourcing_permitted}
                      onChange={(e) =>
                        setFormData({ ...formData, sub_outsourcing_permitted: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <Label htmlFor="sub_outsourcing_permitted" className="text-sm">
                      Sub-outsourcing Permitted
                    </Label>
                  </div>
                </div>
              </div>

              {/* Contract details */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="contract_start_date">Contract Start</Label>
                  <Input
                    id="contract_start_date"
                    type="date"
                    value={formData.contract_start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, contract_start_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contract_end_date">Contract End</Label>
                  <Input
                    id="contract_end_date"
                    type="date"
                    value={formData.contract_end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, contract_end_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contract_value_gbp">Contract Value (GBP)</Label>
                  <Input
                    id="contract_value_gbp"
                    type="number"
                    value={formData.contract_value_gbp}
                    onChange={(e) =>
                      setFormData({ ...formData, contract_value_gbp: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Contact details */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="primary_contact_name">Contact Name</Label>
                  <Input
                    id="primary_contact_name"
                    value={formData.primary_contact_name}
                    onChange={(e) =>
                      setFormData({ ...formData, primary_contact_name: e.target.value })
                    }
                    placeholder="Contact person"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary_contact_email">Contact Email</Label>
                  <Input
                    id="primary_contact_email"
                    type="email"
                    value={formData.primary_contact_email}
                    onChange={(e) =>
                      setFormData({ ...formData, primary_contact_email: e.target.value })
                    }
                    placeholder="email@vendor.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary_contact_phone">Contact Phone</Label>
                  <Input
                    id="primary_contact_phone"
                    value={formData.primary_contact_phone}
                    onChange={(e) =>
                      setFormData({ ...formData, primary_contact_phone: e.target.value })
                    }
                    placeholder="+44..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Geographic Location</Label>
                <CountryPicker
                  value={formData.geographic_location}
                  onChange={(value) =>
                    setFormData({ ...formData, geographic_location: value })
                  }
                  placeholder="Select country..."
                />
              </div>

              {/* Compliance flags */}
              <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-700">Compliance Status</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="due_diligence_completed"
                      checked={formData.due_diligence_completed}
                      onChange={(e) =>
                        setFormData({ ...formData, due_diligence_completed: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <Label htmlFor="due_diligence_completed" className="text-sm">
                      Due Diligence Completed
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="exit_strategy_documented"
                      checked={formData.exit_strategy_documented}
                      onChange={(e) =>
                        setFormData({ ...formData, exit_strategy_documented: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <Label htmlFor="exit_strategy_documented" className="text-sm">
                      Exit Strategy Documented
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="data_processing_agreement"
                      checked={formData.data_processing_agreement}
                      onChange={(e) =>
                        setFormData({ ...formData, data_processing_agreement: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <Label htmlFor="data_processing_agreement" className="text-sm">
                      Data Processing Agreement
                    </Label>
                  </div>
                </div>
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
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !formData.vendor_name.trim()}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingRecord ? (
                  "Update Record"
                ) : (
                  "Add Record"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-2 p-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-700">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Toolbar */}
      <RegisterToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCount={selectedIds.size}
        onExportSelected={handleExportSelected}
        onExportAll={handleExportAll}
        onBulkImport={handleBulkImport}
        importTemplate={importTemplate}
        filterContent={
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={criticalityFilter} onValueChange={setCriticalityFilter}>
              <SelectTrigger className="w-[140px]">
                <Shield className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Criticality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
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
        <div className="flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2">
          <span className="text-sm text-teal-700">
            Filtered by: <strong>{drillDownFilter.key.replace(/_/g, " ")}</strong> ={" "}
            <strong>{drillDownFilter.value}</strong>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearDrillDown}
            className="ml-auto h-6 text-teal-700 hover:text-teal-900"
          >
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        </div>
      )}
      {monthFilter && (
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
          <span className="text-sm text-slate-700">
            Filtered by month: <strong>{monthFilter.label}</strong>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMonthFilter(null)}
            className="ml-auto h-6 text-slate-700 hover:text-slate-900"
          >
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        </div>
      )}

      {/* Dashboard View */}
      {viewMode === "dashboard" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <StatCard
              title="Total Vendors"
              value={stats.total}
              icon={<Building2 className="h-5 w-5" />}
              color="slate"
              onClick={() => {
                setDrillDownFilter(null);
                setViewMode("table");
              }}
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
              title="High/Critical"
              value={stats.critical}
              icon={<AlertTriangle className="h-5 w-5" />}
              color="orange"
              onClick={() => handleDrillDown("criticality", "high")}
              isActive={drillDownFilter?.key === "criticality"}
            />
            <StatCard
              title="Material Outsourcing"
              value={stats.materialOutsourcing}
              icon={<ExternalLink className="h-5 w-5" />}
              color="violet"
              onClick={() => handleDrillDown("is_material_outsourcing", "true")}
              isActive={drillDownFilter?.key === "is_material_outsourcing"}
            />
            <StatCard
              title="Pending DD"
              value={stats.pendingDD}
              icon={<FileCheck className="h-5 w-5" />}
              color="amber"
              onClick={() => handleDrillDown("due_diligence_completed", "false")}
              isActive={drillDownFilter?.key === "due_diligence_completed"}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-3">
            <DonutChart
              data={criticalityChartData}
              title="By Criticality"
              onSegmentClick={(label) =>
                handleDrillDown("criticality", label.toLowerCase())
              }
              activeSegment={
                drillDownFilter?.key === "criticality"
                  ? drillDownFilter.value.charAt(0).toUpperCase() +
                    drillDownFilter.value.slice(1)
                  : undefined
              }
            />
            <BarChart
              data={vendorTypeChartData}
              title="By Vendor Type"
              onBarClick={(label) => {
                const key = Object.entries(vendorTypeLabels).find(
                  ([, v]) => v === label
                )?.[0];
                if (key) handleDrillDown("vendor_type", key);
              }}
              activeBar={
                drillDownFilter?.key === "vendor_type"
                  ? vendorTypeLabels[drillDownFilter.value]
                  : undefined
              }
            />
            <TrendChart
              data={trendData}
              title="Vendors Added (6 Months)"
              color="#0d9488"
              onPointClick={handleMonthFilter}
              activePointKey={monthFilter?.key}
            />
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <>
          <RegisterDataTable
            columns={tableColumns}
            data={paginatedData}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyMessage="No third-party records found"
            emptyIcon={<Building2 className="h-12 w-12" />}
          />
          <PaginationControls {...paginationProps} />
        </>
      )}
    </div>
  );
}
