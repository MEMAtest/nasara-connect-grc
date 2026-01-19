"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { usePermissions } from "@/lib/policies";
import { POLICY_TEMPLATES, type PolicyTemplate } from "@/lib/policies/templates";
import type { FirmPermissions } from "@/lib/policies/permissions";
import type { StoredPolicy } from "@/lib/server/policy-store";
import { generateQuickPolicy, getQuickQuestions, type QuickAnswers } from "@/lib/policies/quick-defaults";
import { QuickQuestionsForm } from "./QuickQuestionsForm";
import { TemplateGrid } from "./TemplateGrid";

const STEP_LABELS = ["Pick template", "Quick questions", "Done"] as const;

export function QuickCreateWizard() {
  const { permissions } = usePermissions();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<PolicyTemplate | null>(null);
  const [answers, setAnswers] = useState<QuickAnswers>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [createdPolicy, setCreatedPolicy] = useState<StoredPolicy | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questions = useMemo(
    () => (selectedTemplate ? getQuickQuestions(selectedTemplate.code) : []),
    [selectedTemplate]
  );

  useEffect(() => {
    if (!selectedTemplate || questions.length === 0) return;
    setAnswers((prev) => {
      const next = { ...prev };
      questions.forEach((question) => {
        if (touched[question.id]) return;
        if (question.type === "boolean") {
          if (question.id in permissions) {
            const key = question.id as keyof FirmPermissions;
            next[question.id] = permissions[key];
          } else if (next[question.id] === undefined) {
            next[question.id] = false;
          }
        } else if (next[question.id] === undefined) {
          next[question.id] = "";
        }
      });
      return next;
    });
  }, [permissions, questions, selectedTemplate, touched]);

  const progressValue = Math.round(((step + 1) / STEP_LABELS.length) * 100);

  const handleTemplateSelect = (template: PolicyTemplate) => {
    const firmName = typeof answers.firmName === "string" ? answers.firmName : "";
    setSelectedTemplate(template);
    setCreatedPolicy(null);
    setError(null);
    setStep(1);
    setAnswers({ firmName });
    setTouched({ firmName: Boolean(firmName) });
  };

  const handleAnswerChange = (id: string, value: string | boolean) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setTouched((prev) => ({ ...prev, [id]: true }));
  };

  const handleBack = () => {
    if (step === 0) return;
    if (step === 1) {
      setStep(0);
      setError(null);
      return;
    }
    setStep(1);
  };

  const handleCreatePolicy = async () => {
    if (!selectedTemplate) return;
    const firmName = typeof answers.firmName === "string" ? answers.firmName.trim() : "";
    if (!firmName) {
      setError("Firm name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = generateQuickPolicy({
        templateCode: selectedTemplate.code,
        answers: { ...answers, firmName },
        basePermissions: permissions,
      });

      const response = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to generate policy draft");
      }

      const created = (await response.json()) as StoredPolicy;
      setCreatedPolicy(created);
      setStep(2);

      toast({
        title: "Policy created",
        description: "Your draft is ready in the policy register.",
      });
    } catch (submitError) {
      console.error(submitError);
      toast({
        title: "Unable to create policy",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    const firmName = typeof answers.firmName === "string" ? answers.firmName : "";
    setStep(0);
    setSelectedTemplate(null);
    setCreatedPolicy(null);
    setError(null);
    setAnswers({ firmName });
    setTouched({ firmName: Boolean(firmName) });
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="gap-2 px-0 text-slate-500 hover:text-slate-700">
        <Link href="/policies">
          <ArrowLeft className="h-4 w-4" />
          Back to policy dashboard
        </Link>
      </Button>

      <header className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-indigo-500">Quick create</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Create a standard policy draft in minutes</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-500">
              Pick a template, answer a few questions, and we will assemble a draft with the recommended clauses and
              approvals already applied.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-600">
            <Sparkles className="h-4 w-4" />
            Auto-selects recommended clauses
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Step {step + 1} of 3</p>
              <h2 className="text-lg font-semibold text-slate-900">{STEP_LABELS[step]}</h2>
            </div>
            <div className="text-xs text-slate-400">Drafts save to the policy register automatically.</div>
          </div>
          <Progress value={progressValue} className="bg-slate-100" />
        </div>

        <div className="mt-6">
          {step === 0 && (
            <TemplateGrid
              templates={POLICY_TEMPLATES}
              selectedTemplateCode={selectedTemplate?.code}
              onSelect={handleTemplateSelect}
            />
          )}

          {step === 1 && selectedTemplate && (
            <QuickQuestionsForm
              template={selectedTemplate}
              questions={questions}
              answers={answers}
              error={error}
              isSubmitting={isSubmitting}
              onBack={handleBack}
              onChange={handleAnswerChange}
              onSubmit={handleCreatePolicy}
            />
          )}

          {step === 2 && createdPolicy && (
            <div className="space-y-6">
              <div className="flex items-start gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <CheckCircle2 className="mt-1 h-6 w-6 text-emerald-500" />
                <div>
                  <h3 className="text-base font-semibold text-emerald-900">Policy draft created</h3>
                  <p className="mt-1 text-sm text-emerald-700">
                    {createdPolicy.name} is ready for review in the policy register.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                  <Link href={`/policies/${createdPolicy.id}`}>View policy</Link>
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Create another
                </Button>
                <Button variant="ghost" asChild className="text-slate-500">
                  <Link href="/policies/register">Go to register</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
