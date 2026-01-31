"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, ChevronRight, ArrowLeft, FileText, Info } from "lucide-react";
import { questions, getRecommendedForms, type ActionType, type RoleType, type FCAForm } from "../form-data";

interface FormSelectorProps {
  onSelectForm: (tabId: string) => void;
}

const tabMapping: Record<string, string> = {
  "form-a": "form-a",
  "form-c": "form-c",
  "form-d": "form-d",
  "form-e": "form-e",
  "psd-individual": "psd-individual",
};

export function FormSelector({ onSelectForm }: FormSelectorProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = step < questions.length ? questions[step] : null;
  const isComplete = step >= questions.length || answers.action === "payment-services";

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));

    // If payment-services is selected, skip the role type question
    if (questionId === "action" && value === "payment-services") {
      setStep(questions.length); // Jump to results
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({});
  };

  const recommendation = isComplete
    ? getRecommendedForms(
        (answers.action || "not-sure") as ActionType,
        (answers.roleType || "not-sure") as RoleType
      )
    : null;

  if (!isComplete && currentQuestion) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-teal-600" />
            Form Selection Guide
          </CardTitle>
          <CardDescription>
            Answer a few questions and we will recommend the right FCA form for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress */}
          <div className="flex items-center gap-2">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < step ? "bg-teal-500" : i === step ? "bg-teal-300" : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {currentQuestion.title}
            </h3>
            <div className="space-y-2">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleAnswer(currentQuestion.id, option.value)}
                  className="w-full text-left p-4 rounded-lg border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 transition-colors"
                >
                  <p className="font-medium text-slate-900">{option.label}</p>
                  {option.description && (
                    <p className="text-sm text-slate-500 mt-0.5">{option.description}</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {step > 0 && (
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Results view
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-teal-600" />
          Recommended Forms
        </CardTitle>
        <CardDescription>
          Based on your answers, here are the forms you need
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {recommendation && (
          <>
            {/* Recommended forms */}
            <div className="space-y-3">
              {recommendation.forms.map((form) => (
                <FormCard
                  key={form.id}
                  form={form}
                  onStart={() => {
                    const tab = tabMapping[form.id];
                    if (tab) {
                      onSelectForm(tab);
                    }
                  }}
                  hasTab={Boolean(tabMapping[form.id])}
                />
              ))}
            </div>

            {/* Additional notes */}
            {recommendation.additionalNotes.length > 0 && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900">Additional Guidance</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {recommendation.additionalNotes.map((note, i) => (
                        <li key={i}>• {note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Start Over
          </Button>
          <p className="text-xs text-slate-500">
            Or select a form tab above to go directly to a specific form
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function FormCard({
  form,
  onStart,
  hasTab,
}: {
  form: FCAForm;
  onStart: () => void;
  hasTab: boolean;
}) {
  return (
    <div className="rounded-lg border p-4 hover:border-teal-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-slate-500" />
            <h4 className="font-semibold text-slate-900">{form.name}</h4>
            <Badge variant="outline" className="text-[10px]">
              {form.category === "individual" ? "Individual" : "Responsibility"}
            </Badge>
          </div>
          <p className="text-sm text-slate-700">{form.fullName}</p>
          <p className="text-xs text-slate-500 mt-1">{form.whenNeeded}</p>
        </div>
        {hasTab && (
          <Button size="sm" onClick={onStart} className="flex-shrink-0">
            Start <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
      {form.tips.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <ul className="text-xs text-slate-600 space-y-1">
            {form.tips.slice(0, 3).map((tip, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-teal-500 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
