
import { NextResponse } from "next/server";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";
import { DEFAULT_PERMISSIONS } from "@/lib/policies";
import { getApplicableClauses, getTemplateByCode } from "@/lib/policies/templates";
import { createPolicy, getPoliciesForOrganization } from "@/lib/server/policy-store";

export async function GET() {
  const policies = await getPoliciesForOrganization(DEFAULT_ORGANIZATION_ID);
  return NextResponse.json(policies);
}

export async function POST(request: Request) {
  const body = await request.json();
  const templateCode: string | undefined = body.templateCode;
  const template = templateCode ? getTemplateByCode(templateCode) : undefined;
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 400 });
  }

  const permissions = { ...DEFAULT_PERMISSIONS, ...(body.permissions ?? {}) };
  const primaryClauses = getApplicableClauses(template.code, permissions);
  const selectedClauses = Array.isArray(body.clauses) && body.clauses.length
    ? primaryClauses.filter((clause) => body.clauses.includes(clause.id))
    : primaryClauses.filter((clause) => clause.isMandatory);

  const approvals = body.approvals;
  if (!approvals) {
    return NextResponse.json({ error: "Approvals payload missing" }, { status: 400 });
  }

  const created = await createPolicy(DEFAULT_ORGANIZATION_ID, {
    id: body.id,
    code: template.code,
    name: template.name,
    description: template.description,
    permissions,
    template,
    clauses: selectedClauses,
    customContent: body.customContent ?? {},
    approvals,
    status: "draft",
  });

  return NextResponse.json(created, { status: 201 });
}
