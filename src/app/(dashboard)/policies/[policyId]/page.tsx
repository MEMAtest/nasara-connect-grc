import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";
import { renderClause } from "@/lib/policies/liquid-renderer";
import { getPolicyById } from "@/lib/server/policy-store";
import { listEntityLinks } from "@/lib/server/entity-link-store";
import { marked } from "marked";

interface PageParams {
  policyId: string;
}

marked.setOptions({
  breaks: true,
  gfm: true,
});

function formatDate(value: string) {
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

function renderMarkdown(content: string) {
  if (!content) return "";
  return marked.parse(content, { async: false }) as string;
}

export default async function PolicyDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { policyId } = await params;
  const policy = await getPolicyById(DEFAULT_ORGANIZATION_ID, policyId);

  if (!policy) {
    notFound();
  }

  const clauseLookup = new Map(policy.clauses.map((clause) => [clause.id, clause]));

  const customContent = (policy.customContent ?? {}) as {
    firmProfile?: Record<string, unknown>;
    sectionClauses?: Record<string, string[]>;
    sectionNotes?: Record<string, string>;
    clauseVariables?: Record<string, Record<string, string>>;
  };

  const firmProfile = (customContent.firmProfile ?? {}) as Record<string, unknown>;
  const sectionClauses = customContent.sectionClauses ?? {};
  const sectionNotes = customContent.sectionNotes ?? {};
  const clauseVariables = customContent.clauseVariables ?? {};

  const renderContext = {
    firm: firmProfile,
    firm_name: typeof firmProfile.name === "string" ? firmProfile.name : "",
    permissions: policy.permissions,
  };

  const sections = policy.template.sections.map((section) => {
    const clauseIds = Array.isArray(sectionClauses[section.id]) && sectionClauses[section.id].length
      ? sectionClauses[section.id]
      : section.suggestedClauses;
    const clauses = clauseIds
      .map((clauseId) => clauseLookup.get(clauseId))
      .filter((clause): clause is NonNullable<typeof clause> => Boolean(clause));
    return {
      id: section.id,
      title: section.title,
      summary: section.summary,
      customText: typeof sectionNotes[section.id] === "string" ? sectionNotes[section.id].trim() : "",
      clauses,
    };
  });

  const clauseIdsInSections = new Set(
    sections.flatMap((section) => section.clauses.map((clause) => clause?.id).filter(Boolean) as string[]),
  );
  const additionalClauses = policy.clauses.filter((clause) => !clauseIdsInSections.has(clause.id));

  const lastUpdatedLabel = formatDate(policy.updatedAt);
  const createdLabel = formatDate(policy.createdAt);
  const firmName = typeof firmProfile.name === "string" && firmProfile.name.trim().length > 0 ? firmProfile.name : null;
  const links = await listEntityLinks({ organizationId: DEFAULT_ORGANIZATION_ID, fromType: "policy", fromId: policyId });
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

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-indigo-500">Policy document</p>
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold text-slate-900">{policy.name}</h1>
              <p className="text-sm text-slate-500">{policy.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              {firmName ? <span>{firmName}</span> : null}
              <span>Created {createdLabel}</span>
              <span>Last updated {lastUpdatedLabel}</span>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <Badge variant="outline" className="capitalize text-sm">
              {policy.status.replace("_", " ")}
            </Badge>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href="/policies/register">Back to register</Link>
              </Button>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link href={`/policies/${policy.id}/edit`}>Edit policy</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

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
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">Mapped controls & evidence</h2>
            <p className="text-sm text-slate-500">
              Links connect policies to risks, CMP controls, training and evidence for coverage reporting across the platform.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/policies/${policy.id}/edit`}>Manage mapping</Link>
          </Button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <p className="text-sm font-semibold text-slate-900">Controls</p>
            <p className="mt-1 text-xs text-slate-500">{linksByType.control.length} linked</p>
            <div className="mt-3 space-y-2">
              {linksByType.control.length ? (
                linksByType.control.map((link) => (
                  <div key={link.toId} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{linkTitle(link)}</p>
                      {"owner" in link.metadata && typeof link.metadata.owner === "string" ? (
                        <p className="text-xs text-slate-500">Owner: {link.metadata.owner}</p>
                      ) : null}
                    </div>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/compliance-framework/cmp/${link.toId}?tab=summary`}>Open</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No controls mapped yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <p className="text-sm font-semibold text-slate-900">Risks</p>
            <p className="mt-1 text-xs text-slate-500">{linksByType.risk.length} linked</p>
            <div className="mt-3 space-y-2">
              {linksByType.risk.length ? (
                linksByType.risk.map((link) => (
                  <div key={link.toId} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{linkTitle(link)}</p>
                      {"riskId" in link.metadata && typeof link.metadata.riskId === "string" ? (
                        <p className="text-xs text-slate-500">Risk ID: {link.metadata.riskId}</p>
                      ) : (
                        <p className="text-xs text-slate-500">Risk reference: {link.toId}</p>
                      )}
                    </div>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/risk-assessment?riskId=${encodeURIComponent(link.toId)}`}>Open</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No risks mapped yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <p className="text-sm font-semibold text-slate-900">Training</p>
            <p className="mt-1 text-xs text-slate-500">{linksByType.training.length} linked</p>
            <div className="mt-3 space-y-2">
                  {linksByType.training.length ? (
                linksByType.training.map((link) => (
                  <div key={link.toId} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{linkTitle(link)}</p>
                      {"category" in link.metadata && typeof link.metadata.category === "string" ? (
                        <p className="text-xs text-slate-500">{link.metadata.category}</p>
                      ) : null}
                    </div>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/training-library/lesson/${link.toId}?stage=hook`}>Open</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No training mapped yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <p className="text-sm font-semibold text-slate-900">Evidence</p>
            <p className="mt-1 text-xs text-slate-500">{linksByType.evidence.length} items</p>
            <div className="mt-3 space-y-2">
              {linksByType.evidence.length ? (
                linksByType.evidence.map((link) => (
                  <div key={link.toId} className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-sm font-medium text-slate-800">{linkTitle(link)}</p>
                    {"url" in link.metadata && typeof link.metadata.url === "string" ? (
                      <a href={link.metadata.url} className="mt-1 block text-xs text-indigo-600 hover:underline" target="_blank" rel="noreferrer">
                        {link.metadata.url}
                      </a>
                    ) : null}
                    {"notes" in link.metadata && typeof link.metadata.notes === "string" ? (
                      <p className="mt-1 text-xs text-slate-500">{link.metadata.notes}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No evidence captured yet.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Firm-specific content</h2>
          <p className="text-sm text-slate-500">
            Each section combines the base template guidance with your bespoke wording and the clauses that were inserted from the
            clause library.
          </p>
        </div>

        {sections.map((section) => (
          <article key={section.id} className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <header className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">Section</p>
              <h3 className="text-xl font-semibold text-slate-900">{section.title}</h3>
              <p className="text-sm text-slate-500">{section.summary}</p>
            </header>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Firm notes</p>
              {section.customText ? (
                <div
                  className="prose prose-slate max-w-none prose-sm text-slate-700"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(section.customText) }}
                />
              ) : (
                <p className="text-sm italic text-slate-400">No bespoke content captured yet.</p>
              )}
            </div>

            {section.clauses.length ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Included clauses</p>
                <div className="space-y-3">
                  {section.clauses.map((clause) => (
                    <div key={clause.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{clause.title}</p>
                          <p className="text-xs text-slate-500">{clause.summary}</p>
                        </div>
                        {clause.isMandatory ? (
                          <Badge variant="secondary" className="text-[11px]">Mandatory</Badge>
                        ) : null}
                      </div>
                      <div
                        className="prose prose-slate mt-3 max-w-none prose-sm text-slate-700"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(
                            renderClause(clause.content, renderContext, clauseVariables[clause.id] ?? {}),
                          ),
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </article>
        ))}

        {additionalClauses.length ? (
          <article className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <header className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">Additional clauses</p>
              <h3 className="text-xl font-semibold text-slate-900">Supplementary requirements</h3>
              <p className="text-sm text-slate-500">Clauses inserted outside of the default template sections.</p>
            </header>
            <div className="space-y-3">
              {additionalClauses.map((clause) => (
                <div key={clause.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{clause.title}</p>
                      <p className="text-xs text-slate-500">{clause.summary}</p>
                    </div>
                    {clause.isMandatory ? (
                      <Badge variant="secondary" className="text-[11px]">Mandatory</Badge>
                    ) : null}
                  </div>
                  <div
                    className="prose prose-slate mt-3 max-w-none prose-sm text-slate-700"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(
                        renderClause(clause.content, renderContext, clauseVariables[clause.id] ?? {}),
                      ),
                    }}
                  />
                </div>
              ))}
            </div>
          </article>
        ) : null}
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Approvals & governance</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>
            SMF attestation:{" "}
            {policy.approvals.requiresSMF ? policy.approvals.smfRole ?? "SMF role to be assigned" : "Not required"}
          </li>
          <li>
            Board review:{" "}
            {policy.approvals.requiresBoard
              ? `Yes · ${policy.approvals.boardFrequency.replace("-", " ")}`
              : "Not required"}
          </li>
          <li>
            Additional approvers:{" "}
            {policy.approvals.additionalApprovers.length
              ? policy.approvals.additionalApprovers.join(", ")
              : "None"}
          </li>
        </ul>
      </section>
    </div>
  );
}
