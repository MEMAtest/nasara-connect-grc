// =====================================================
// FILE: src/app/api/readiness/route.ts
// PURPOSE: Readiness probe - application is ready to serve traffic
// =====================================================

import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'
import { getOpenRouterApiKey } from '@/lib/openrouter'

export const dynamic = 'force-dynamic'

interface HealthCheck {
  name: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  latencyMs?: number
  message?: string
}

/**
 * GET /api/readiness
 *
 * Readiness probe - checks if the application can serve traffic.
 * Verifies all critical dependencies are available.
 * Used by load balancers to determine if traffic should be routed to this instance.
 * NOTE: No auth check — must remain accessible to load balancers and monitoring.
 */
export async function GET() {
  const checks: HealthCheck[] = []
  const startTime = Date.now()

  // Check 1: Environment variables
  const envCheck = checkEnvironmentVariables()
  checks.push(envCheck)

  // Check 2: Database connectivity
  const dbCheck = await checkDatabaseConnection()
  checks.push(dbCheck)

  // Determine overall status
  const hasUnhealthy = checks.some(c => c.status === 'unhealthy')
  const hasDegraded = checks.some(c => c.status === 'degraded')

  const overallStatus = hasUnhealthy ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy'
  const statusCode = hasUnhealthy ? 503 : 200

  return NextResponse.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    totalLatencyMs: Date.now() - startTime,
    checks
  }, { status: statusCode })
}

/**
 * Verify required environment variables are set
 */
function checkEnvironmentVariables(): HealthCheck {
  const required = [
    'DATABASE_URL'
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    return {
      name: 'environment',
      status: 'unhealthy',
      message: `Missing ${missing.length} required environment variable(s)`
    }
  }

  // Check optional but important vars
  const optional = ['NEXTAUTH_SECRET', 'NEXT_PUBLIC_APP_URL']
  const missingOptional = optional.filter(key => !process.env[key])
  if (!getOpenRouterApiKey()) {
    missingOptional.push('OPENROUTER_API_KEY')
  }

  if (missingOptional.length > 0) {
    return {
      name: 'environment',
      status: 'degraded',
      message: `${missingOptional.length} optional environment variable(s) not configured`
    }
  }

  return {
    name: 'environment',
    status: 'healthy'
  }
}

/**
 * Verify database connection is working
 */
async function checkDatabaseConnection(): Promise<HealthCheck> {
  const startTime = Date.now()

  try {
    const client = await pool.connect()

    try {
      // Simple query to test connectivity
      await client.query('SELECT 1')

      const latencyMs = Date.now() - startTime

      // Warn if latency is high
      if (latencyMs > 1000) {
        return {
          name: 'database',
          status: 'degraded',
          latencyMs,
          message: 'High latency detected'
        }
      }

      return {
        name: 'database',
        status: 'healthy',
        latencyMs
      }
    } finally {
      client.release()
    }

  } catch (error) {
    return {
      name: 'database',
      status: 'unhealthy',
      latencyMs: Date.now() - startTime,
      message: error instanceof Error ? error.message : 'Connection failed'
    }
  }
}
