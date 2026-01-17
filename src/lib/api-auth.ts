/**
 * API Authentication and Authorization utilities
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAuthDisabled } from "@/lib/auth-utils";

export interface AuthenticatedRequest {
  userId: string;
  userEmail: string;
  organizationId: string;
}

export interface AuthResult {
  authenticated: boolean;
  user?: AuthenticatedRequest;
  error?: NextResponse;
}

/**
 * Authenticate an API request and return user info
 * Returns error response if authentication fails
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthResult> {
  // In development with auth disabled, return default user
  if (isAuthDisabled()) {
    return {
      authenticated: true,
      user: {
        userId: "dev-user",
        userEmail: "dev@example.com",
        organizationId: "default-org",
      },
    };
  }

  const session = await auth();

  if (!session?.user) {
    return {
      authenticated: false,
      error: NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      ),
    };
  }

  // Get organization ID from query params or use default
  const { searchParams } = new URL(request.url);
  const requestedOrgId = searchParams.get("organizationId");

  // In a real app, you'd verify the user has access to this organization
  // For now, we'll use the requested org or default
  const organizationId = requestedOrgId || "default-org";

  return {
    authenticated: true,
    user: {
      userId: session.user.id || session.user.email || "unknown",
      userEmail: session.user.email || "",
      organizationId,
    },
  };
}

/**
 * Verify that a record belongs to the user's organization (IDOR protection)
 */
export function verifyRecordOwnership(
  record: { organization_id?: string } | null,
  userOrgId: string
): boolean {
  if (!record) return false;
  return record.organization_id === userOrgId;
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(message = "Unauthorized"): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Create a forbidden response
 */
export function forbiddenResponse(
  message = "You don't have permission to access this resource"
): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Create a not found response
 */
export function notFoundResponse(message = "Resource not found"): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}

/**
 * Create a bad request response
 */
export function badRequestResponse(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Create an internal server error response
 */
export function serverErrorResponse(
  message = "An internal error occurred"
): NextResponse {
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * Simple in-memory rate limiter
 * In production, use Redis or similar
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
};

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    // Start new window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: record.resetTime - now,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetIn: record.resetTime - now,
  };
}

/**
 * Rate limit middleware response
 */
export function rateLimitExceededResponse(resetIn: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil(resetIn / 1000)),
        "X-RateLimit-Reset": String(Math.ceil(resetIn / 1000)),
      },
    }
  );
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute
