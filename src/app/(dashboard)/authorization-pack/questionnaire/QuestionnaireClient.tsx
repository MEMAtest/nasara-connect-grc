"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssessmentQuestionnaire } from "../components/AssessmentQuestionnaire";
import { getSectionSummary } from "../lib/questionBank";

export function QuestionnaireClient() {
  const searchParams = useSearchParams();
  const [currentSection, setCurrentSection] = useState("business-model");
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string | null>(null);

  const sections = getSectionSummary();

  useEffect(() => {
    const assessmentId = searchParams.get("assessmentId");
    const section = searchParams.get("section");
    setCurrentAssessmentId(assessmentId);

    if (section) {
      setCurrentSection(section);
    }
  }, [searchParams]);

  const handleSectionComplete = (responses: Array<{
    questionId: string;
    value: string | string[];
    score: number;
    notes?: string;
  }>) => {
    console.debug("Section completed", currentSection, responses.length);

    if (!completedSections.includes(currentSection)) {
      setCompletedSections([...completedSections, currentSection]);
    }
    const currentIndex = sections.findIndex((section) => section.id === currentSection);
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1].id);
    }
  };

  const handleProgress = (progress: number) => {
    console.debug("Section progress", currentSection, `${progress}%`);
  };

  const currentSectionData = sections.find((section) => section.id === currentSection);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/authorization-pack">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Authorization Pack
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900">Assessment Questionnaire</h1>
          <p className="text-slate-600">Complete the FCA authorization readiness assessment</p>
        </div>
      </div>

      <Card className="border border-slate-100">
        <CardHeader>
          <CardTitle>Assessment Sections</CardTitle>
          <CardDescription>Navigate through different areas of the authorization assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            {sections.map((section) => {
              const isActive = section.id === currentSection;
              const isCompleted = completedSections.includes(section.id);

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setCurrentSection(section.id)}
                  className={`p-4 text-left transition-all ${
                    isActive
                      ? "border border-teal-200 bg-teal-50"
                      : isCompleted
                      ? "border border-emerald-200 bg-emerald-50"
                      : "border border-slate-200 bg-white hover:border-slate-300"
                  } rounded-lg`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    {isCompleted ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : null}
                    <h3
                      className={`text-sm font-medium ${
                        isActive
                          ? "text-teal-900"
                          : isCompleted
                          ? "text-emerald-900"
                          : "text-slate-900"
                      }`}
                    >
                      {section.name}
                    </h3>
                  </div>
                  <p
                    className={`text-xs ${
                      isActive
                        ? "text-teal-600"
                        : isCompleted
                        ? "text-emerald-600"
                        : "text-slate-500"
                    }`}
                  >
                    {section.description}
                  </p>
                  {isActive ? (
                    <Badge className="mt-2 bg-teal-600 text-xs hover:bg-teal-700">Current</Badge>
                  ) : null}
                  {isCompleted && !isActive ? (
                    <Badge variant="outline" className="mt-2 border-emerald-200 text-xs text-emerald-700">
                      Completed
                    </Badge>
                  ) : null}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {currentSectionData ? (
        <Card className="border border-slate-100">
          <CardHeader>
            <CardTitle>{currentSectionData.name}</CardTitle>
            <CardDescription>{currentSectionData.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <AssessmentQuestionnaire
              sectionId={currentSection}
              assessmentId={currentAssessmentId ?? undefined}
              onComplete={handleSectionComplete}
              onProgress={handleProgress}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
