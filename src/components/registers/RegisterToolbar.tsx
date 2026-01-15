"use client";

import { useState, useRef } from "react";
import {
  LayoutGrid,
  Table2,
  Download,
  Upload,
  Search,
  Filter,
  Check,
  X,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { cn } from "@/lib/utils";

export type ViewMode = "table" | "dashboard";

interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface RegisterToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters?: FilterOption[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  selectedCount: number;
  onExportSelected: () => void;
  onExportAll: () => void;
  onBulkImport: (data: Record<string, unknown>[]) => Promise<void>;
  importTemplate: { headers: string[]; sampleRow: string[] };
  registerName: string;
}

export function RegisterToolbar({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  filters = [],
  filterValues = {},
  onFilterChange,
  selectedCount,
  onExportSelected,
  onExportAll,
  onBulkImport,
  importTemplate,
  registerName,
}: RegisterToolbarProps) {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState<Record<string, unknown>[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importStep, setImportStep] = useState<"upload" | "preview" | "complete">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csvContent = [
      importTemplate.headers.join(","),
      importTemplate.sampleRow.join(","),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${registerName.toLowerCase().replace(/\s+/g, "_")}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): Record<string, unknown>[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const data: Record<string, unknown>[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }

      const row: Record<string, unknown> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx];
      });
      data.push(row);
    }

    setImportErrors(errors);
    return data;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const data = parseCSV(text);
      setImportData(data);
      setImportStep("preview");
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (importData.length === 0) return;

    setIsImporting(true);
    try {
      await onBulkImport(importData);
      setImportStep("complete");
    } catch (err) {
      setImportErrors(["Failed to import records. Please try again."]);
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setImportData([]);
    setImportErrors([]);
    setImportStep("upload");
    setShowImportDialog(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left side - Search and Filters */}
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={filterValues[filter.key] || "all"}
              onValueChange={(value) => onFilterChange?.(filter.key, value)}
            >
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {filter.label}</SelectItem>
                {filter.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>

        {/* Right side - View Toggle and Actions */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-slate-200 p-1">
            <button
              onClick={() => onViewModeChange("dashboard")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                viewMode === "dashboard"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Dashboard
            </button>
            <button
              onClick={() => onViewModeChange("table")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                viewMode === "table"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Table2 className="h-4 w-4" />
              Table
            </button>
          </div>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
                {selectedCount > 0 && (
                  <Badge className="ml-2 bg-teal-100 text-teal-700">
                    {selectedCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExportSelected} disabled={selectedCount === 0}>
                <Check className="mr-2 h-4 w-4" />
                Export Selected ({selectedCount})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportAll}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export All Records
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Import Button */}
          <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
        </div>
      </div>

      {/* Bulk Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={(open) => !open && resetImport()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Import {registerName}</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import multiple records at once
            </DialogDescription>
          </DialogHeader>

          {importStep === "upload" && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border-2 border-dashed border-slate-200 p-8 text-center">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-sm text-slate-600">
                  Drag and drop a CSV file, or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  style={{ position: "relative" }}
                />
                <Button variant="outline" className="mt-4" onClick={() => fileInputRef.current?.click()}>
                  Choose File
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">Need a template?</p>
                  <p className="text-xs text-slate-500">Download our CSV template with the correct format</p>
                </div>
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>
            </div>
          )}

          {importStep === "preview" && (
            <div className="space-y-4 py-4">
              {importErrors.length > 0 && (
                <div className="rounded-lg bg-amber-50 p-4">
                  <div className="flex items-center gap-2 text-amber-700">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Warnings</span>
                  </div>
                  <ul className="mt-2 text-sm text-amber-600">
                    {importErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-lg border border-slate-200">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="font-medium text-slate-900">
                    Preview ({importData.length} records)
                  </p>
                </div>
                <div className="max-h-64 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        {importData[0] && Object.keys(importData[0]).map((key) => (
                          <th key={key} className="px-4 py-2 text-left font-medium text-slate-600">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importData.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="px-4 py-2 text-slate-700">
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importData.length > 5 && (
                    <p className="px-4 py-2 text-center text-xs text-slate-500">
                      ... and {importData.length - 5} more records
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {importStep === "complete" && (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <Check className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="mt-4 text-lg font-medium text-slate-900">Import Complete!</p>
              <p className="mt-1 text-sm text-slate-500">
                Successfully imported {importData.length} records
              </p>
            </div>
          )}

          <DialogFooter>
            {importStep === "upload" && (
              <Button variant="outline" onClick={resetImport}>Cancel</Button>
            )}
            {importStep === "preview" && (
              <>
                <Button variant="outline" onClick={() => setImportStep("upload")}>
                  Back
                </Button>
                <Button onClick={handleImport} disabled={isImporting || importData.length === 0}>
                  {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Import {importData.length} Records
                </Button>
              </>
            )}
            {importStep === "complete" && (
              <Button onClick={resetImport}>Done</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
