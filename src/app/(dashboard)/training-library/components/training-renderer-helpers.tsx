"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  Search,
  Shield,
  Users,
  BarChart3,
  MapPin,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { marked } from "marked";

marked.setOptions({
  breaks: true,
  gfm: true,
});

const coerceMarkdownInput = (input: unknown): string => {
  if (input == null) return "";
  if (typeof input === "string") return input;
  if (typeof input === "number" || typeof input === "boolean") return String(input);
  if (Array.isArray(input)) {
    return input.map(coerceMarkdownInput).filter(Boolean).join("\n");
  }
  if (typeof input === "object") {
    const record = input as Record<string, unknown>;
    if (typeof record.mainContent === "string") return record.mainContent;
    if (typeof record.learningPoint === "string") return record.learningPoint;
    if (typeof record.content === "string") return record.content;
  }
  return "";
};

const normalizeMarkdown = (input: unknown) => {
  const normalizedInput = coerceMarkdownInput(input);
  if (!normalizedInput) return "";
  const normalized = normalizedInput.replace(/\r\n/g, "\n");
  const trimmed = normalized.replace(/^\s*\n/, "").replace(/\n\s*$/, "");
  const lines = trimmed.split("\n");
  const nonEmpty = lines.filter((line) => line.trim().length > 0);
  if (!nonEmpty.length) return trimmed;

  const indentOf = (line: string) => line.match(/^[ \t]*/)?.[0].length ?? 0;
  const firstIndent = indentOf(nonEmpty[0]);
  let minIndent = Math.min(...nonEmpty.map(indentOf));

  if (firstIndent === 0 && minIndent === 0) {
    const restIndents = nonEmpty.slice(1).map(indentOf).filter((indent) => indent > 0);
    if (restIndents.length) {
      minIndent = Math.min(...restIndents);
    }
  }

  if (!minIndent) return trimmed;

  return lines
    .map((line) => {
      if (!line.trim()) return "";
      const indent = indentOf(line);
      return line.slice(Math.min(indent, minIndent));
    })
    .join("\n");
};

export function MarkdownContent({ content, className = "" }: { content: unknown; className?: string }) {
  const html = useMemo(() => {
    const normalized = normalizeMarkdown(content);
    if (!normalized) return "";
    return marked.parse(normalized, { async: false }) as string;
  }, [content]);

  return (
    <div
      className={`prose prose-slate max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export { normalizeMarkdown };

export const formatListItem = (item: unknown) => {
  if (typeof item === "string" || typeof item === "number") return String(item);
  if (!item || typeof item !== "object") return "";
  const record = item as Record<string, unknown>;
  const term = typeof record.term === "string" ? record.term : "";
  const definition = typeof record.definition === "string" ? record.definition : "";
  if (term && definition) return `${term}: ${definition}`;
  const title = typeof record.title === "string" ? record.title : "";
  const description = typeof record.description === "string" ? record.description : "";
  const outcome = typeof record.outcome === "string" ? record.outcome : "";
  const text = typeof record.text === "string" ? record.text : "";
  const parts = [title || text, description, outcome ? `Outcome: ${outcome}` : ""].filter(Boolean);
  return parts.join(" - ");
};

export const renderVisual = (visual?: Record<string, unknown>) => {
  if (!visual) return null;

  switch (visual.type) {
    case "infographic":
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {(visual.elements as Record<string, unknown>[] | undefined)?.map((element, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                element.color === "red"
                  ? "border-red-200 bg-red-50"
                  : element.color === "amber"
                  ? "border-amber-200 bg-amber-50"
                  : "border-green-200 bg-green-50"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                {element.icon === "alert-triangle" && (
                  <AlertTriangle
                    className={`h-6 w-6 ${
                      element.color === "red"
                        ? "text-red-600"
                        : element.color === "amber"
                        ? "text-amber-600"
                        : "text-green-600"
                    }`}
                  />
                )}
                {element.icon === "search" && (
                  <Search
                    className={`h-6 w-6 ${
                      element.color === "red"
                        ? "text-red-600"
                        : element.color === "amber"
                        ? "text-amber-600"
                        : "text-green-600"
                    }`}
                  />
                )}
                {element.icon === "shield" && (
                  <Shield
                    className={`h-6 w-6 ${
                      element.color === "red"
                        ? "text-red-600"
                        : element.color === "amber"
                        ? "text-amber-600"
                        : "text-green-600"
                    }`}
                  />
                )}
                <h4 className="font-semibold">{String(element.text || "")}</h4>
              </div>
              <p className="text-sm text-slate-600">{String(element.description || "")}</p>
            </div>
          ))}
        </div>
      );

    case "process_flow":
      return (
        <div className="space-y-6 my-8">
          {(visual.steps as Record<string, unknown>[] | undefined)?.map((step, index) => (
            <div key={index} className="relative">
              <div
                className={`border-l-4 ${
                  step.color === "red"
                    ? "border-red-500"
                    : step.color === "amber"
                    ? "border-amber-500"
                    : "border-green-500"
                } pl-6`}
              >
                <div
                  className={`absolute -left-3 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    step.color === "red"
                      ? "bg-red-500"
                      : step.color === "amber"
                      ? "bg-amber-500"
                      : "bg-green-500"
                  }`}
                >
                  {String(step.number ?? "")}
                </div>
                <div className="pb-6">
                  <h4 className="text-lg font-semibold mb-2">{String(step.title || "")}</h4>
                  <p className="text-slate-600 mb-4">{String(step.description || "")}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-emerald-800 mb-2">Common Examples:</h5>
                      <ul className="space-y-1">
                        {(step.examples as unknown[] | undefined)?.map((example, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                            {formatListItem(example)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-red-800 mb-2">Red Flags to Watch:</h5>
                      <ul className="space-y-1">
                        {(step.redFlags as unknown[] | undefined)?.map((flag, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                            {formatListItem(flag)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case "category_grid":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          {(visual.categories as Record<string, unknown>[] | undefined)?.map((category, index) => (
            <div
              key={index}
              className={`p-6 rounded-lg border-2 ${
                category.riskLevel === "high"
                  ? "border-red-200 bg-red-50"
                  : category.riskLevel === "medium"
                  ? "border-amber-200 bg-amber-50"
                  : "border-green-200 bg-green-50"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                {category.icon === "user" && (
                  <Users
                    className={`h-8 w-8 ${
                      category.riskLevel === "high"
                        ? "text-red-600"
                        : category.riskLevel === "medium"
                        ? "text-amber-600"
                        : "text-green-600"
                    }`}
                  />
                )}
                {category.icon === "credit-card" && (
                  <BarChart3
                    className={`h-8 w-8 ${
                      category.riskLevel === "high"
                        ? "text-red-600"
                        : category.riskLevel === "medium"
                        ? "text-amber-600"
                        : "text-green-600"
                    }`}
                  />
                )}
                {category.icon === "map-pin" && (
                  <MapPin
                    className={`h-8 w-8 ${
                      category.riskLevel === "high"
                        ? "text-red-600"
                        : category.riskLevel === "medium"
                        ? "text-amber-600"
                        : "text-green-600"
                    }`}
                  />
                )}
                {category.icon === "briefcase" && (
                  <FileText
                    className={`h-8 w-8 ${
                      category.riskLevel === "high"
                        ? "text-red-600"
                        : category.riskLevel === "medium"
                        ? "text-amber-600"
                        : "text-green-600"
                    }`}
                  />
                )}
                <div>
                  <h4 className="text-lg font-semibold">{String(category.title || "")}</h4>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs text-white ${
                      category.riskLevel === "high"
                        ? "bg-red-600"
                        : category.riskLevel === "medium"
                        ? "bg-amber-600"
                        : "bg-green-600"
                    }`}
                  >
                    {String(category.riskLevel || "low")} risk
                  </span>
                </div>
              </div>
              <p className="text-slate-700 mb-4">{String(category.description || "")}</p>
              <div>
                <h5 className="font-medium mb-2">Common Indicators:</h5>
                <ul className="space-y-2">
                  {(category.examples as unknown[] | undefined)?.map((example, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                          category.riskLevel === "high"
                            ? "bg-red-500"
                            : category.riskLevel === "medium"
                            ? "bg-amber-500"
                            : "bg-green-500"
                        }`}
                      ></div>
                      {formatListItem(example)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      );

    case "scenario_illustration":
      return (
        <div className="my-8 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-blue-600" />
          </div>
          <p className="text-slate-600 italic">{String(visual.description || "")}</p>
        </div>
      );

    default:
      return null;
  }
};
