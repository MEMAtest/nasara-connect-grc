// ============================================================================
// API UTILITIES - Production Readiness
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z, ZodError, ZodIssue, ZodType } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logError } from "./logger";

// ============================================================================
// 1. STRUCTURED ERROR HANDLING
// ============================================================================

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(process.env.NODE_ENV !== "production" && { details: error.details }),
        },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          fields: error.issues.map((e: ZodIssue) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
      },
      { status: 400 }
    );
  }

  logError(error, "Unhandled API error");
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    },
    { status: 500 }
  );
}

// ============================================================================
// 2. INPUT VALIDATION WITH ZOD
// ============================================================================

export async function validateRequest<T>(
  request: NextRequest,
  schema: ZodType<T>
): Promise<T> {
  const body = await request.json();
  return schema.parse(body);
}

// Common schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export const UUIDSchema = z.string().uuid();

export const DateStringSchema = z.string().datetime().optional().nullable();

// ============================================================================
// 3. RATE LIMITING
// ============================================================================

let ratelimit: Ratelimit | null = null;
const rateLimiters = new Map<string, Ratelimit>();

function getRatelimiter(config?: Partial<RateLimitConfig>): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn("Rate limiting disabled: Missing Upstash Redis configuration");
    return null;
  }

  const requests = config?.requests ?? 100;
  const window = config?.window ?? "60 s";
  const key = `${requests}:${window}`;

  if (config && (requests !== 100 || window !== "60 s")) {
    if (!rateLimiters.has(key)) {
      rateLimiters.set(
        key,
        new Ratelimit({
          redis: Redis.fromEnv(),
          limiter: Ratelimit.slidingWindow(requests, window as "60 s"),
          analytics: true,
        })
      );
    }
    return rateLimiters.get(key) ?? null;
  }

  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(100, "60 s"), // 100 requests per minute default
      analytics: true,
    });
  }

  return ratelimit;
}

export interface RateLimitConfig {
  requests: number;
  window: string; // e.g., "60 s", "1 m", "1 h"
  identifier?: (request: NextRequest) => string;
}

export async function checkRateLimit(
  request: NextRequest,
  config?: Partial<RateLimitConfig>
): Promise<{ success: boolean; headers: Record<string, string> }> {
  const limiter = getRatelimiter(config);

  if (!limiter) {
    return { success: true, headers: {} };
  }

  const identifier = config?.identifier
    ? config.identifier(request)
    : request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "anonymous";

  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  const headers = {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": reset.toString(),
  };

  return { success, headers };
}

export function rateLimitExceeded(headers: Record<string, string>): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please try again later.",
      },
    },
    { status: 429, headers }
  );
}

// ============================================================================
// 4. PAGINATION HELPERS
// ============================================================================

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function paginate<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export function getPaginationParams(request: NextRequest): { page: number; limit: number; offset: number } {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// ============================================================================
// 5. SOFT DELETE HELPERS
// ============================================================================

export interface SoftDeleteFields {
  deleted_at: Date | null;
  deleted_by: string | null;
}

export function softDeleteClause(alias?: string): string {
  const prefix = alias ? `${alias}.` : "";
  return `${prefix}deleted_at IS NULL`;
}

// ============================================================================
// 6. OPTIMISTIC LOCKING
// ============================================================================

export class ConcurrencyError extends ApiError {
  constructor(entityType: string, currentVersion: number, updatedBy?: string) {
    super(
      409,
      "CONCURRENCY_CONFLICT",
      `This ${entityType} was modified by another user. Please refresh and try again.`,
      { currentVersion, updatedBy }
    );
  }
}

// ============================================================================
// 7. AUDIT LOGGING
// ============================================================================

export interface AuditLogEntry {
  entityType: string;
  entityId: string;
  action: "created" | "updated" | "deleted" | "viewed";
  actorId: string;
  organizationId: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
}

export async function logAuditEvent(
  pool: { query: (text: string, values?: unknown[]) => Promise<unknown> },
  entry: AuditLogEntry
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO authorization_pack_audit_log
       (entity_type, entity_id, action, actor_id, organization_id, changes, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        entry.entityType,
        entry.entityId,
        entry.action,
        entry.actorId,
        entry.organizationId,
        JSON.stringify(entry.changes || {}),
        JSON.stringify(entry.metadata || {}),
      ]
    );
  } catch (error) {
    logError(error, "Failed to write audit log");
    // Don't throw - audit logging should not break the main operation
  }
}
// Build trigger: 1769547391
