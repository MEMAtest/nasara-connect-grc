"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface RegisterDataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onEdit?: (row: T) => void;
  onDelete?: (id: string) => void;
  onView?: (row: T) => void;
  rowClassName?: (row: T) => string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

type SortDirection = "asc" | "desc" | null;

export function RegisterDataTable<T extends { id: string }>({
  columns,
  data,
  selectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
  onView,
  rowClassName,
  emptyMessage = "No records found",
  emptyIcon,
}: RegisterDataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn || !sortDirection) return 0;

    const aVal = getNestedValue(a, sortColumn);
    const bVal = getNestedValue(b, sortColumn);

    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const allSelected = data.length > 0 && data.every((row) => selectedIds.has(row.id));
  const someSelected = data.some((row) => selectedIds.has(row.id)) && !allSelected;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map((row) => row.id)));
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    onSelectionChange(newSelection);
  };

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        {emptyIcon && <div className="mx-auto mb-4 text-slate-300">{emptyIcon}</div>}
        <p className="text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) {
                      (el as HTMLButtonElement & { indeterminate?: boolean }).indeterminate = someSelected;
                    }
                  }}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </th>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600",
                    column.sortable && "cursor-pointer select-none hover:text-slate-900"
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && (
                      <span className="text-slate-400">
                        {sortColumn === String(column.key) ? (
                          sortDirection === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th className="w-20 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {sortedData.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className={cn(
                    "border-b border-slate-100 transition-colors",
                    selectedIds.has(row.id) ? "bg-teal-50" : "hover:bg-slate-50",
                    rowClassName?.(row)
                  )}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedIds.has(row.id)}
                      onCheckedChange={() => handleSelectRow(row.id)}
                      aria-label={`Select row ${index + 1}`}
                    />
                  </td>
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-4 py-3 text-sm text-slate-700"
                    >
                      {column.render
                        ? column.render(getNestedValue(row, String(column.key)), row)
                        : String(getNestedValue(row, String(column.key)) ?? "-")}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(row)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(row)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(row.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {selectedIds.size > 0 && (
        <div className="border-t border-slate-200 bg-teal-50 px-4 py-2">
          <p className="text-sm font-medium text-teal-700">
            {selectedIds.size} record{selectedIds.size > 1 ? "s" : ""} selected
          </p>
        </div>
      )}
    </div>
  );
}

// Utility to get nested values from objects
function getNestedValue(obj: unknown, path: string): unknown {
  return path.split(".").reduce((current: unknown, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

// Badge renderer helper
export function renderBadge(
  value: string,
  colorMap: Record<string, string>,
  labelMap?: Record<string, string>
) {
  const color = colorMap[value] || "bg-slate-100 text-slate-700";
  const label = labelMap?.[value] || value?.replace(/_/g, " ") || "-";
  return <Badge className={color}>{label}</Badge>;
}

// Date renderer helper
export function renderDate(value: string | null | undefined, format: "short" | "long" = "short") {
  if (!value) return "-";
  try {
    const date = new Date(value);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: format === "short" ? "short" : "long",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

// Currency renderer helper
export function renderCurrency(value: number | null | undefined, currency = "GBP") {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(value);
}
