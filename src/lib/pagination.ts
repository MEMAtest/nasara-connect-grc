/**
 * Pagination utilities for API and UI
 */

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Default pagination values
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 25;
export const MAX_LIMIT = 100;

/**
 * Parse pagination parameters from URL search params
 */
export function parsePaginationParams(
  searchParams: URLSearchParams
): PaginationParams {
  let page = parseInt(searchParams.get("page") || String(DEFAULT_PAGE), 10);
  let limit = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10);
  const sortBy = searchParams.get("sortBy") || undefined;
  const sortOrderParam = searchParams.get("sortOrder");
  const sortOrder: "asc" | "desc" =
    sortOrderParam === "asc" || sortOrderParam === "desc"
      ? sortOrderParam
      : "desc";

  // Validate and clamp values
  if (isNaN(page) || page < 1) page = DEFAULT_PAGE;
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  return { page, limit, sortBy, sortOrder };
}

/**
 * Calculate offset for database queries
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Build pagination metadata
 */
export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginatedResult<never>["pagination"] {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Apply pagination to an array (for client-side pagination)
 */
export function paginateArray<T>(
  items: T[],
  page: number,
  limit: number
): PaginatedResult<T> {
  const total = items.length;
  const offset = calculateOffset(page, limit);
  const data = items.slice(offset, offset + limit);

  return {
    data,
    pagination: buildPaginationMeta(page, limit, total),
  };
}

/**
 * Build SQL ORDER BY clause with validated column
 */
export function buildOrderByClause(
  sortBy: string | undefined,
  sortOrder: "asc" | "desc",
  allowedColumns: readonly string[],
  defaultColumn = "created_at"
): string {
  // Validate sort column against allowed list
  const column = sortBy && allowedColumns.includes(sortBy) ? sortBy : defaultColumn;
  const order = sortOrder === "asc" ? "ASC" : "DESC";

  return `ORDER BY "${column}" ${order}`;
}

/**
 * Build SQL LIMIT OFFSET clause
 */
export function buildLimitOffsetClause(page: number, limit: number): string {
  const offset = calculateOffset(page, limit);
  return `LIMIT ${limit} OFFSET ${offset}`;
}

/**
 * Pagination component props
 */
export interface PaginationControlsProps {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
  limit: number;
  total: number;
}
