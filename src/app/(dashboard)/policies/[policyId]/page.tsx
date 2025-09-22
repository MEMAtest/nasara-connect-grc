import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";
import { getPolicyById } from "@/lib/server/policy-store";

interface PageParams {
  policyId: string;
}

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

  const sections = policy.template.sections.map((section) => {
    const clauses = section.suggestedClauses
      .map((clauseId) => clauseLookup.get(clauseId))
      .filter((clause): clause is NonNullable<typeof clause> => Boolean(clause));
    return {
      id: section.id,
      title: section.title,
      summary: section.summary,
      customText: policy.customContent[section.id]?.trim() ?? "",
      clauses,
    };
  });

  const clauseIdsInSections = new Set(
    sections.flatMap((section) => section.clauses.map((clause) => clause?.id).filter(Boolean) as string[]),
  );
  const additionalClauses = policy.clauses.filter((clause) => !clauseIdsInSections.has(clause.id));

  const lastUpdatedLabel = formatDate(policy.updatedAt);
  const createdLabel = formatDate(policy.createdAt);

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
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{section.customText}</p>
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
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{clause.content}</p>
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
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{clause.content}</p>
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
