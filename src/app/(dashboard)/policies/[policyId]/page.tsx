import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, FileText, GraduationCap, Shield } from "lucide-react";
import { PolicyDocumentActions } from "@/components/policies/PolicyDocumentActions";
import { PolicyInlineEditor } from "@/components/policies/PolicyInlineEditor";
import { PolicyReaderClient, type PolicyReaderOverview, type PolicyReaderSection } from "@/components/policies/PolicyReaderClient";
import { PolicyStatusControl } from "@/components/policies/PolicyStatusControl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";
import { deriveOrganizationIdFromEmail } from "@/lib/auth-utils";
import { findMissingTemplateVariables, renderClause, renderLiquidTemplate } from "@/lib/policies/liquid-renderer";
import { normalizePolicyMarkdown, renderPolicyMarkdown } from "@/lib/policies/markdown";
import { sanitizeClauseContent, DEFAULT_SANITIZE_OPTIONS } from "@/lib/policies/content-sanitizer";
import { getNoteSections, getRequiredNoteSectionIds, resolveNotePlaceholders } from "@/lib/policies/section-notes";
import { listEntityLinks, upsertEntityLink } from "@/lib/server/entity-link-store";
import { getPolicyById } from "@/lib/server/policy-store";

interface PageParams {
  policyId: string;
}

function formatDate(value?: string | null) {
  if (!value) return "n/a";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "n/a";
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function injectGlossary(markdown: string, glossary: Record<string, string>) {
  const entries = Object.entries(glossary);
  if (!entries.length) return markdown;
  const parts = markdown.split(/(<[^>]+>)/g);
  return parts
    .map((part) => {
      if (part.startsWith("<")) return part;
      return entries.reduce((acc, [term, definition]) => {
        const safeDefinition = escapeHtml(definition);
        const safeTerm = escapeHtml(term);
        const pattern = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\b`, "g");
        return acc.replace(
          pattern,
          `<abbr class="policy-glossary" title="${safeDefinition}">${safeTerm}</abbr>`,
        );
      }, part);
    })
    .join("");
}

function renderMarkdown(content: string, glossary: Record<string, string>) {
  if (!content) return "";
  const normalized = normalizePolicyMarkdown(content);
  const withGlossary = Object.keys(glossary).length ? injectGlossary(normalized, glossary) : normalized;
  return renderPolicyMarkdown(withGlossary, { normalize: false });
}

const POLICY_SANITIZE_OPTIONS = {
  ...DEFAULT_SANITIZE_OPTIONS,
  preserveProceduralLists: false,
};

const NOTE_SANITIZE_OPTIONS = {
  ...DEFAULT_SANITIZE_OPTIONS,
  convertBulletsToProseText: false,
  preserveProceduralLists: false,
};

function sanitizeForSection(content: string, sectionType?: string) {
  const options = sectionType === "procedure" ? DEFAULT_SANITIZE_OPTIONS : POLICY_SANITIZE_OPTIONS;
  return sanitizeClauseContent(content, options);
}

function renderMissingChip(path: string) {
  const safe = escapeHtml(path);
  return `<span class="policy-missing-variable" title="Required value. Click to set." data-var="${safe}">${safe}</span>`;
}

function toExcerpt(value: string, maxLength = 220) {
  const cleaned = value
    .replace(/\r?\n/g, " ")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[#>*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).trimEnd()}...`;
}

function isTocClause(content: string) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 6) return false;
  const tocLines = lines.filter((line) => /\d{1,3}$/.test(line) && !/[.!?]$/.test(line));
  return tocLines.length / lines.length >= 0.7;
}

export default async function PolicyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { policyId } = await params;
  const resolvedSearchParams = await searchParams;
  const packId = typeof resolvedSearchParams?.packId === "string" ? resolvedSearchParams.packId : undefined;
  const session = await auth();
  const organizationId = session?.user?.email
    ? await deriveOrganizationIdFromEmail(session.user.email)
    : DEFAULT_ORGANIZATION_ID;
  const policy = await getPolicyById(organizationId, policyId);

  if (!policy) {
    notFound();
  }

  const clauseLookup = new Map(policy.clauses.map((clause) => [clause.id, clause]));

  const customContent = (policy.customContent ?? {}) as {
    firmProfile?: Record<string, unknown>;
    policyInputs?: Record<string, unknown>;
    sectionClauses?: Record<string, string[]>;
    sectionNotes?: Record<string, string>;
    clauseVariables?: Record<string, Record<string, string>>;
    governance?: Record<string, unknown>;
    metrics?: Record<string, number>;
  };

  const firmProfile = (customContent.firmProfile ?? {}) as Record<string, unknown>;
  const policyInputs = (customContent.policyInputs ?? {}) as Record<string, unknown>;
  const sectionClauses = customContent.sectionClauses ?? {};
  const sectionNotes = customContent.sectionNotes ?? {};
  const clauseVariables = customContent.clauseVariables ?? {};
  const governance = customContent.governance ?? {};
  const noteSections = getNoteSections(policy.template);

  const firmName = typeof firmProfile.name === "string" && firmProfile.name.trim().length > 0 ? firmProfile.name.trim() : null;
  const renderContext: Record<string, any> = { // eslint-disable-line @typescript-eslint/no-explicit-any
    firm: firmProfile,
    firm_name: firmName ?? "",
    permissions: policy.permissions,
    ...policyInputs,
  };

  const governanceOwner = typeof governance.owner === "string" ? governance.owner.trim() : "";
  const governanceVersion = typeof governance.version === "string" ? governance.version.trim() : "";
  const governanceScope = typeof governance.scopeStatement === "string" ? governance.scopeStatement.trim() : "";
  const governanceDistribution = Array.isArray(governance.distributionList)
    ? governance.distributionList.filter((value) => typeof value === "string" && value.trim().length > 0)
    : typeof governance.distributionList === "string"
      ? governance.distributionList
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : [];
  const governanceProcedures = typeof governance.linkedProcedures === "string" ? governance.linkedProcedures.trim() : "";
  const metrics = (customContent.metrics ?? {}) as Record<string, number>;

  const workspaceBaseHref = packId ? `/authorization-pack/workspace?packId=${packId}` : "/authorization-pack/workspace";
  const buildWorkspaceHref = (category?: string) => {
    if (!packId) return "/authorization-pack/workspace";
    if (!category) return workspaceBaseHref;
    const params = new URLSearchParams({ packId, tab: "documents", category });
    return `/authorization-pack/workspace?${params.toString()}`;
  };

  const policyFeedsMap: Record<string, Array<{ label: string; category?: string }>> = {
    AML_CTF: [{ label: "AML/CTF policies and procedures", category: "aml-ctf" }],
    INFO_SECURITY: [{ label: "IT & Security documentation", category: "it-security" }],
    OUTSOURCING: [{ label: "Outsourcing & structure documentation", category: "outsourcing-structure" }],
    COMPLAINTS: [{ label: "Complaints handling policy", category: "policies-procedures" }],
    SAFEGUARDING: [{ label: "Safeguarding policy & methodology", category: "safeguarding" }],
    BCP_RESILIENCE: [{ label: "Operational resilience / BCP policy", category: "policies-procedures" }],
    FIN_PROMOTIONS: [{ label: "Policies & procedures checklist", category: "policies-procedures" }],
    CONSUMER_DUTY: [{ label: "Policies & procedures checklist", category: "policies-procedures" }],
    RISK_MGMT: [{ label: "Governance & controls evidence", category: "governance-controls" }],
    COMPLIANCE_MON: [{ label: "Compliance monitoring programme", category: "governance-controls" }],
  };
  const feedsInto = policyFeedsMap[policy.template.code] ?? [
    { label: "Policies & procedures checklist", category: "policies-procedures" },
  ];

  const glossary =
    policy.code === "COMPLAINTS"
      ? {
          SRC: "Summary Resolution Communication",
          FOS: "Financial Ombudsman Service",
          PSD: "Payment Services Directive",
          DISP: "FCA Dispute Resolution: Complaints",
          PSR: "Payment Services Regulations 2017",
        }
      : {} as Record<string, string>;

  const templateSections = policy.template.sections.map((section) => {
    const rawClauseIds =
      Array.isArray(sectionClauses[section.id]) && sectionClauses[section.id].length
        ? sectionClauses[section.id]
        : section.suggestedClauses;
    const uniqueClauseIds = Array.from(new Set(rawClauseIds));
    const clauses = uniqueClauseIds
      .map((clauseId) => clauseLookup.get(clauseId))
      .filter((clause): clause is NonNullable<typeof clause> => Boolean(clause))
      .filter((clause) => !isTocClause(clause.content));
    return {
      id: section.id,
      title: section.title,
      summary: section.summary,
      sectionType: section.sectionType ?? (section.id.startsWith("appendix") ? "appendix" : "policy"),
      requiresFirmNotes: section.requiresFirmNotes ?? false,
      customText: typeof sectionNotes[section.id] === "string" ? sectionNotes[section.id].trim() : "",
      clauses,
    };
  });

  const clauseIdsInSections = new Set(
    templateSections.flatMap((section) => section.clauses.map((clause) => clause?.id).filter(Boolean) as string[]),
  );
  const additionalClauses = policy.clauses.filter(
    (clause) => !clauseIdsInSections.has(clause.id) && !isTocClause(clause.content),
  );

  const sections = additionalClauses.length
    ? [
        ...templateSections,
        {
          id: "supplementary-requirements",
          title: "Supplementary requirements",
          summary: "Clauses inserted outside of the default template sections.",
          sectionType: "policy" as const,
          requiresFirmNotes: false,
          customText: "",
          clauses: additionalClauses,
        },
      ]
    : templateSections;

  let links = await listEntityLinks({
    organizationId,
    fromType: "policy",
    fromId: policyId,
  });

  if (policy.template.suggestedMappings?.length) {
    const existing = new Set(links.map((link) => `${link.toType}:${link.toId}`));
    const missing = policy.template.suggestedMappings.filter(
      (mapping) => !existing.has(`${mapping.toType}:${mapping.toId}`),
    );
    if (missing.length) {
      await Promise.all(
        missing.map((mapping) =>
          upsertEntityLink({
            organizationId,
            fromType: "policy",
            fromId: policyId,
            toType: mapping.toType,
            toId: mapping.toId,
            metadata: mapping.metadata ?? {},
          }),
        ),
      );
      links = await listEntityLinks({
        organizationId,
        fromType: "policy",
        fromId: policyId,
      });
    }
  }

  const linksByType = links.reduce(
    (acc, link) => {
      acc[link.toType].push(link);
      return acc;
    },
    { policy: [], risk: [], control: [], training: [], evidence: [] } as Record<string, typeof links>,
  );

  const linkTitle = (link: (typeof links)[number]) => {
    const meta = link.metadata ?? {};
    const title = typeof meta.title === "string" ? meta.title : typeof meta.label === "string" ? meta.label : "";
    return title.trim().length ? title.trim() : link.toId;
  };

  const requiredNoteSectionIds = new Set(getRequiredNoteSectionIds(policy.template));
  const missingFirmNotes = sections
    .filter((section) => requiredNoteSectionIds.has(section.id) && !section.customText)
    .map((section) => section.title);

  const missingVariables = new Set<string>();
  for (const section of sections) {
    if (section.sectionType === "appendix") continue;
    for (const clause of section.clauses) {
      const context = { ...renderContext, ...(clauseVariables[clause.id] ?? {}) };
      findMissingTemplateVariables(clause.content, context).forEach((path) => missingVariables.add(path));
    }
  }

  const missingMetadata = [
    firmName ? null : "Firm name",
    governanceOwner ? null : "Policy owner",
    governanceVersion ? null : "Version",
    governance.effectiveDate ? null : "Effective date",
    governance.nextReviewAt ? null : "Next review date",
    governanceScope ? null : "Scope statement",
  ].filter(Boolean) as string[];

  const lastUpdatedLabel = formatDate(policy.updatedAt);
  const createdLabel = formatDate(policy.createdAt);

  const overview: PolicyReaderOverview | null =
    policy.code === "COMPLAINTS"
      ? {
          timeline: [
            { label: "3-day SRC", description: "DISP 1.5" },
            { label: "15 days (PSD)", description: "PSR" },
            { label: "35 days (PSD exception)", description: "PSR" },
            { label: "8 weeks (Non-PSD)", description: "DISP" },
          ],
          metrics: [
            { label: "% on-time final responses", value: metrics.onTimeFinalResponses, suffix: "%" },
            { label: "Avg days to resolve (PSD)", value: metrics.avgDaysPsd, suffix: "days" },
            { label: "FOS overturn rate", value: metrics.fosOverturnRate, suffix: "%" },
            { label: "Vulnerable complaints on time", value: metrics.vulnerableOnTime, suffix: "%" },
          ],
        }
      : null;

  const readerSections: PolicyReaderSection[] = sections.map((section) => {
    const sectionMissingVars = new Set<string>();
    const clauses = section.clauses.map((clause) => {
      const context = { ...renderContext, ...(clauseVariables[clause.id] ?? {}) };
      findMissingTemplateVariables(clause.content, context).forEach((path) => sectionMissingVars.add(path));
      const rendered = renderClause(clause.content, renderContext, clauseVariables[clause.id] ?? {}, {
        onMissingVariable: renderMissingChip,
      });
      const sanitized = sanitizeForSection(rendered, section.sectionType);
      return {
        id: clause.id,
        title: clause.title,
        summary: clause.summary,
        isMandatory: clause.isMandatory,
        contentHtml: renderMarkdown(sanitized, glossary),
        contentMd: clause.content,
      };
    });
    const renderedNotes = section.customText
      ? renderLiquidTemplate(section.customText, renderContext)
      : "";
    const resolvedNotes = renderedNotes ? resolveNotePlaceholders(renderedNotes, firmName ?? undefined) : "";
    const sanitizedNotes = renderedNotes
      ? sanitizeClauseContent(resolvedNotes, NOTE_SANITIZE_OPTIONS)
      : "";
    const customTextHtml = sanitizedNotes ? renderMarkdown(sanitizedNotes, glossary) : "";
    return {
      id: section.id,
      title: section.title,
      summary: section.summary,
      sectionType: section.sectionType,
      requiresFirmNotes: section.requiresFirmNotes,
      customTextHtml: customTextHtml || undefined,
      customTextExcerpt: sanitizedNotes ? toExcerpt(sanitizedNotes) : undefined,
      clauseCount: section.clauses.length,
      clauseHighlights: section.clauses.slice(0, 3).map((clause) => ({ id: clause.id, title: clause.title })),
      missingVariableCount: sectionMissingVars.size || undefined,
      clauses,
    };
  });

  const defaultSectionId = sections.some((section) => section.id === "overview")
    ? "overview"
    : sections[0]?.id;

  return (
    <div className="space-y-8 policy-print">
      <header className="policy-screen rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-indigo-500">Policy document</p>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-slate-900">{policy.name}</h1>
              <p className="text-sm text-slate-500">{policy.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              {firmName ? <span>{firmName}</span> : null}
              <span>Created {createdLabel}</span>
              <span>Last updated {lastUpdatedLabel}</span>
            </div>
            {policy.template.badges?.length ? (
              <div className="flex flex-wrap gap-2">
                {policy.template.badges.map((badge) => {
                  const tone = badge.tone ?? "slate";
                  const toneClasses = {
                    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
                    amber: "border-amber-200 bg-amber-50 text-amber-700",
                    sky: "border-sky-200 bg-sky-50 text-sky-700",
                    slate: "border-slate-200 bg-slate-50 text-slate-600",
                  }[tone] ?? "border-slate-200 bg-slate-50 text-slate-600";
                  return (
                    <span key={badge.label} className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses}`}>
                      {badge.label}
                    </span>
                  );
                })}
              </div>
            ) : null}
          </div>
          <div className="policy-actions flex flex-col items-start gap-3 lg:items-end">
            <PolicyStatusControl policyId={policy.id} initialStatus={policy.status} />
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href="/policies/register">Back to register</Link>
              </Button>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link href={`/policies/${policy.id}/edit`}>Edit policy</Link>
              </Button>
            </div>
            <PolicyDocumentActions policyId={policy.id} />
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Ownership</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">{governanceOwner || "Owner to be assigned"}</p>
            <p className="text-xs text-slate-500">
              {policy.approvals.requiresSMF ? policy.approvals.smfRole ?? "SMF role to be assigned" : "No SMF attestation"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Version & review</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">{governanceVersion || "Version not set"}</p>
            <p className="text-xs text-slate-500">
              Effective {formatDate(governance.effectiveDate as string | undefined)} · Next review {formatDate(
                governance.nextReviewAt as string | undefined,
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Distribution</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">
              {governanceDistribution.length ? governanceDistribution.join(", ") : "Distribution list pending"}
            </p>
            <p className="text-xs text-slate-500">{governanceProcedures || "Linked procedures not set"}</p>
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="space-y-6">
          <div className="policy-screen">
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Document overview</h2>
              <p className="mt-2 text-sm text-slate-600">{policy.template.description}</p>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Template</dt>
                  <dd className="mt-1 text-sm text-slate-700">{policy.template.name}</dd>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Category</dt>
                  <dd className="mt-1 text-sm text-slate-700">{policy.template.category}</dd>
                </div>
              </dl>
              {governanceScope ? (
                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Scope statement</dt>
                  <dd className="mt-2 text-sm text-slate-700">{governanceScope}</dd>
                </div>
              ) : null}
            </section>
          </div>
          <PolicyReaderClient
            sections={readerSections}
            defaultSectionId={defaultSectionId}
            overview={overview}
            reportMeta={{
              title: policy.name,
              subtitle: policy.description,
              firmName: firmName ?? "",
              status: policy.status.replace("_", " "),
              owner: governanceOwner,
              version: governanceVersion,
              effectiveDate: formatDate(governance.effectiveDate as string | undefined),
              nextReview: formatDate(governance.nextReviewAt as string | undefined),
              updatedAt: lastUpdatedLabel,
            }}
            policyId={policy.id}
            showActions={false}
            noteSections={noteSections}
            sectionNotes={sectionNotes}
            customContent={customContent as Record<string, unknown>}
            policyClauses={policy.clauses}
          />
        </div>

        <aside className="policy-screen space-y-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-2 lg:self-start">
          {missingMetadata.length || missingFirmNotes.length || missingVariables.size ? (
            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-1 h-5 w-5 text-amber-600" />
                <div>
                  <h3 className="text-sm font-semibold text-amber-900">Policy readiness gaps</h3>
                  <p className="text-xs text-amber-800">
                    Fill required metadata and firm notes to publish a complete document.
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-xs text-amber-800">
                {missingMetadata.map((item) => (
                  <li key={`meta-${item}`}>Missing {item}</li>
                ))}
                {missingFirmNotes.map((item) => (
                  <li key={`notes-${item}`}>Add firm notes for {item}</li>
                ))}
                {Array.from(missingVariables).map((item) => (
                  <li key={`var-${item}`}>Resolve {item}</li>
                ))}
              </ul>
              <Button asChild size="sm" variant="outline" className="mt-4 border-amber-200 text-amber-800">
                <Link href={`/policies/${policy.id}/edit`}>Resolve gaps</Link>
              </Button>
            </section>
          ) : null}

          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Feeds into</h3>
                <p className="text-xs text-slate-500">
                  Linked authorisation checklist items for this policy.
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                Authorisation
              </Badge>
            </div>
            <div className="mt-4 space-y-2">
              {feedsInto.map((item) => {
                const itemHref = buildWorkspaceHref(item.category);
                const content = (
                  <>
                    <span className="font-semibold text-slate-700">{item.label}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      Linked
                    </Badge>
                  </>
                );
                return packId ? (
                  <Link
                    key={item.label}
                    href={itemHref}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-600 hover:border-indigo-200 hover:text-indigo-700"
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-600"
                  >
                    {content}
                  </div>
                );
              })}
            </div>
            <Button asChild size="sm" className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700">
              <Link href={workspaceBaseHref}>View in Authorisation</Link>
            </Button>
            {!packId ? (
              <p className="mt-2 text-[11px] text-slate-400">
                Select a project pack to enable deep links from this policy.
              </p>
            ) : null}
          </section>

          <PolicyInlineEditor
            policyId={policy.id}
            templateCode={policy.template.code}
            sections={policy.template.sections.map((section) => ({
              id: section.id,
              title: section.title,
              summary: section.summary,
              sectionType: section.sectionType,
              requiresFirmNotes: section.requiresFirmNotes,
            }))}
            initialSectionNotes={sectionNotes}
            initialGovernance={{
              owner: governanceOwner,
              version: governanceVersion,
              effectiveDate: typeof governance.effectiveDate === "string" ? governance.effectiveDate : "",
              nextReviewAt: typeof governance.nextReviewAt === "string" ? governance.nextReviewAt : "",
              scopeStatement: governanceScope,
              distributionList: governanceDistribution.join(", "),
              linkedProcedures: governanceProcedures,
            }}
            initialCustomContent={customContent as Record<string, unknown>}
            firmName={firmName ?? undefined}
          />

          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Mapping & evidence</h3>
                <p className="text-xs text-slate-500">
                  Control, risk, training, and evidence links feed CMP coverage reporting.
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={`/policies/${policy.id}/edit`}>Add</Link>
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {[
                { label: "Controls", icon: Shield, items: linksByType.control },
                { label: "Risks", icon: AlertTriangle, items: linksByType.risk },
                { label: "Training", icon: GraduationCap, items: linksByType.training },
                { label: "Evidence", icon: FileText, items: linksByType.evidence },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-slate-500" />
                        <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                      </div>
                      <span className="text-xs text-slate-500">{item.items.length} linked</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.items.length ? (
                        item.items.slice(0, 2).map((link) => (
                          <span key={link.toId} className="rounded-full bg-white px-2 py-1 text-[11px] text-slate-600">
                            {linkTitle(link)}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">No links yet</span>
                      )}
                    </div>
                    <Button asChild size="sm" variant="outline" className="mt-3 w-full justify-center">
                      <Link href={`/policies/${policy.id}/edit`}>+ Add</Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Approvals & governance</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                SMF attestation: {policy.approvals.requiresSMF ? policy.approvals.smfRole ?? "SMF role to be assigned" : "Not required"}
              </li>
              <li>
                Board review: {policy.approvals.requiresBoard ? `Yes · ${policy.approvals.boardFrequency.replace("-", " ")}` : "Not required"}
              </li>
              <li>
                Additional approvers: {policy.approvals.additionalApprovers.length ? policy.approvals.additionalApprovers.join(", ") : "None"}
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
