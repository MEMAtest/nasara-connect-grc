import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import {
  createAssessment,
  getAssessments,
  initDatabase,
  Assessment,
} from '@/lib/database';
import { createNotification } from "@/lib/server/notifications-store";
import { logger, logError } from '@/lib/logger';
import { requireAuth } from '@/lib/auth-utils';

type AssessmentDto = {
  id: string;
  name: string;
  description: string;
  businessType: string;
  targetPermissions: string[];
  createdAt: string;
  lastModified: string;
  progress: number;
  status: 'draft' | 'in-progress' | 'completed' | 'submitted';
  completedSections: string[];
  totalSections: number;
};

const fallbackAssessments: AssessmentDto[] = [
  {
    id: 'demo-suitability',
    name: 'Suitability & Appropriateness Policy',
    description:
      'Readiness review covering PROD, Consumer Duty and suitability requirements.',
    businessType: 'investment-services',
    targetPermissions: ['MiFID investment advice', 'Retail investment distribution'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    progress: 65,
    status: 'in-progress',
    completedSections: ['business-model', 'governance', 'risk-management'],
    totalSections: 5,
  },
  {
    id: 'demo-payments',
    name: 'Payment Services Authorization Pack',
    description: 'FCA application readiness for PSD2 payment institution.',
    businessType: 'payment-services',
    targetPermissions: ['Payment initiation', 'Account information services'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    progress: 32,
    status: 'draft',
    completedSections: ['business-model'],
    totalSections: 5,
  },
];

function mapAssessmentToDto(assessment: Assessment): AssessmentDto {
  return {
    id: assessment.id,
    name: assessment.name,
    description: assessment.description ?? '',
    businessType: assessment.business_type ?? 'other',
    targetPermissions: assessment.target_permissions ?? [],
    createdAt: formatDate(assessment.created_at),
    lastModified: formatDate(assessment.last_modified),
    progress: assessment.progress ?? 0,
    status: assessment.status ?? 'draft',
    completedSections: assessment.completed_sections ?? [],
    totalSections: assessment.total_sections ?? 5,
  };
}

function formatDate(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value ?? new Date().toISOString();
}

function createFallbackAssessment(payload: {
  name: string;
  description?: string;
  businessType?: string;
  permissions?: string[];
}): AssessmentDto {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    name: payload.name,
    description: payload.description ?? '',
    businessType: payload.businessType ?? 'other',
    targetPermissions: payload.permissions ?? [],
    createdAt: now,
    lastModified: now,
    progress: 0,
    status: 'draft',
    completedSections: [],
    totalSections: 5,
  };
}

export async function GET(request: NextRequest) {
  const { auth, error } = await requireAuth();
  if (error) return error;

  try {
    const assessments = await getAssessments(auth.organizationId);
    return NextResponse.json(assessments.map(mapAssessmentToDto));
  } catch (error) {
    logError(error, 'Failed to fetch assessments', { organizationId: auth.organizationId });
    // Fall back to mock data so the dashboard still renders in dev environments
    return NextResponse.json(fallbackAssessments);
  }
}

export async function POST(request: NextRequest) {
  const { auth, error } = await requireAuth();
  if (error) return error;

  try {
    // Initialize database if needed
    await initDatabase();

    const body = await request.json();
    const { name, description, businessType, permissions } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Assessment name is required' },
        { status: 400 }
      );
    }

    const created = await createAssessment({
      name,
      description,
      business_type: businessType,
      target_permissions: permissions,
      organization_id: auth.organizationId,
    });

    const dto = mapAssessmentToDto(created);
    try {
      await createNotification({
        organizationId: auth.organizationId,
        title: "Risk assessment created",
        message: `"${dto.name}" started in the risk assessment tool.`,
        severity: "info",
        source: "risk",
        link: "/risk-assessment",
        metadata: { assessmentId: dto.id, status: dto.status },
      });
    } catch {
      // Non-blocking notification failures
    }
    return NextResponse.json(dto, { status: 201 });
  } catch (error) {
    logError(error, 'Failed to create assessment', { name, businessType, organizationId: auth.organizationId });
    const fallback = createFallbackAssessment({
      name,
      description,
      businessType,
      permissions,
    });
    try {
      await createNotification({
        organizationId: auth.organizationId,
        title: "Risk assessment created",
        message: `"${fallback.name}" started in the risk assessment tool.`,
        severity: "info",
        source: "risk",
        link: "/risk-assessment",
        metadata: { assessmentId: fallback.id, status: fallback.status },
      });
    } catch {
      // Non-blocking notification failures
    }
    fallbackAssessments.unshift(fallback);
    return NextResponse.json(fallback, { status: 201 });
  }
}
