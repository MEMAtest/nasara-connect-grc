import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { PolicyTemplate } from "@/lib/policies/templates";
import type { QuickAnswers, QuickQuestion } from "@/lib/policies/quick-defaults";

interface QuickQuestionsFormProps {
  template: PolicyTemplate;
  questions: QuickQuestion[];
  answers: QuickAnswers;
  error?: string | null;
  isSubmitting?: boolean;
  onChange: (id: string, value: string | boolean) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function QuickQuestionsForm({
  template,
  questions,
  answers,
  error,
  isSubmitting,
  onChange,
  onSubmit,
  onBack,
}: QuickQuestionsFormProps) {
  const requiredMissing = questions.some((question) => {
    if (!question.required) return false;
    const value = answers[question.id];
    if (typeof value === "string") return value.trim().length === 0;
    return value === undefined;
  });

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">{template.name}</p>
        <p className="mt-1">Answer a few questions so we can tailor the default policy draft.</p>
      </div>

      <div className="space-y-4">
        {questions.map((question) => {
          if (question.type === "text") {
            return (
              <div key={question.id} className="space-y-2">
                <Label htmlFor={question.id} className="text-sm font-medium text-slate-700">
                  {question.label}
                  {question.required ? " *" : ""}
                </Label>
                <Input
                  id={question.id}
                  value={typeof answers[question.id] === "string" ? (answers[question.id] as string) : ""}
                  onChange={(event) => onChange(question.id, event.target.value)}
                  placeholder="Enter firm name"
                />
                {question.description ? (
                  <p className="text-xs text-slate-400">{question.description}</p>
                ) : null}
              </div>
            );
          }

          const checked = Boolean(answers[question.id]);
          return (
            <div key={question.id} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div>
                <Label className="text-sm font-medium text-slate-700">{question.label}</Label>
                {question.description ? (
                  <p className="mt-1 text-xs text-slate-400">{question.description}</p>
                ) : null}
              </div>
              <Switch checked={checked} onCheckedChange={(value) => onChange(question.id, value)} />
            </div>
          );
        })}
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="ghost" onClick={onBack} className="text-slate-500">
          Back
        </Button>
        <Button
          className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          type="submit"
          disabled={Boolean(isSubmitting) || requiredMissing}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating policy...
            </>
          ) : (
            "Create policy"
          )}
        </Button>
      </div>
      {isSubmitting ? (
        <div className="space-y-2">
          <Progress value={60} className="bg-slate-100" />
          <p className="text-xs text-slate-500">Generating policy draft...</p>
        </div>
      ) : null}
    </form>
  );
}
