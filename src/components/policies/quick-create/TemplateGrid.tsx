import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PolicyTemplate } from "@/lib/policies/templates";

interface TemplateGridProps {
  templates: PolicyTemplate[];
  selectedTemplateCode?: string;
  onSelect: (template: PolicyTemplate) => void;
}

export function TemplateGrid({ templates, selectedTemplateCode, onSelect }: TemplateGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {templates.map((template) => {
        const isSelected = template.code === selectedTemplateCode;
        return (
          <button
            key={template.code}
            type="button"
            onClick={() => onSelect(template)}
            className={cn(
              "flex h-full flex-col justify-between rounded-2xl border p-4 text-left transition",
              isSelected
                ? "border-indigo-500 bg-indigo-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
            )}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    {template.category}
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-slate-900">{template.name}</h3>
                </div>
                {isSelected ? <Check className="h-5 w-5 text-indigo-600" /> : null}
              </div>
              <p className="text-sm text-slate-500">{template.description}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-[11px]">
                {template.code}
              </Badge>
              <Badge variant="outline" className="text-[11px]">
                {template.sections.length} sections
              </Badge>
            </div>
          </button>
        );
      })}
    </div>
  );
}
