// CSV Export Utilities

export interface ExportColumn {
  key: string;
  header: string;
  transform?: (value: unknown) => string;
}

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  filename: string
): void {
  if (data.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = columns.map((col) => escapeCSVValue(col.header));
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = getNestedValue(row, col.key);
      const transformed = col.transform ? col.transform(value) : value;
      return escapeCSVValue(String(transformed ?? ""));
    })
  );

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  downloadCSV(csvContent, filename);
}

export function downloadCSV(content: string, filename: string): void {
  const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${formatDateForFilename(new Date())}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSVValue(value: string): string {
  // If value contains comma, newline, or double quote, wrap in quotes
  if (value.includes(",") || value.includes("\n") || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((current: unknown, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function formatDateForFilename(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Common transforms for export
export const transforms = {
  date: (value: unknown): string => {
    if (!value) return "";
    try {
      return new Date(String(value)).toLocaleDateString("en-GB");
    } catch {
      return String(value);
    }
  },

  datetime: (value: unknown): string => {
    if (!value) return "";
    try {
      return new Date(String(value)).toLocaleString("en-GB");
    } catch {
      return String(value);
    }
  },

  currency: (value: unknown): string => {
    if (value === null || value === undefined || value === "") return "";
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(Number(value));
  },

  boolean: (value: unknown): string => {
    return value ? "Yes" : "No";
  },

  uppercase: (value: unknown): string => {
    return String(value ?? "").toUpperCase();
  },

  titleCase: (value: unknown): string => {
    return String(value ?? "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  },
};

// Template generators for bulk import
export interface ImportTemplate {
  headers: string[];
  sampleRow: string[];
  requiredFields: string[];
  fieldDescriptions: Record<string, string>;
}

export function generateImportTemplate(template: ImportTemplate): string {
  const lines = [
    template.headers.join(","),
    template.sampleRow.join(","),
  ];
  return lines.join("\n");
}

// CSV Parser for bulk import
export interface ParseResult<T> {
  data: T[];
  errors: { row: number; message: string }[];
  warnings: { row: number; message: string }[];
}

export function parseCSV<T>(
  csvText: string,
  fieldMapping: Record<string, keyof T>,
  validators?: Record<string, (value: string) => boolean>
): ParseResult<Partial<T>> {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) {
    return { data: [], errors: [{ row: 0, message: "CSV file is empty or has no data rows" }], warnings: [] };
  }

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, "").toLowerCase());
  const data: Partial<T>[] = [];
  const errors: { row: number; message: string }[] = [];
  const warnings: { row: number; message: string }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);

    if (values.length !== headers.length) {
      warnings.push({ row: i + 1, message: `Column count mismatch (expected ${headers.length}, got ${values.length})` });
    }

    const row: Partial<T> = {};
    let hasError = false;

    headers.forEach((header, idx) => {
      const mappedField = fieldMapping[header];
      if (mappedField) {
        const value = values[idx]?.trim() || "";

        if (validators && validators[header]) {
          if (!validators[header](value)) {
            errors.push({ row: i + 1, message: `Invalid value for ${header}: "${value}"` });
            hasError = true;
          }
        }

        (row as Record<string, unknown>)[mappedField as string] = value;
      }
    });

    if (!hasError) {
      data.push(row);
    }
  }

  return { data, errors, warnings };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }

  result.push(current);
  return result;
}
