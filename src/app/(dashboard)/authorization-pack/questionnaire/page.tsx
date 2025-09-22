"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { AssessmentQuestionnaire } from "../components/AssessmentQuestionnaire";
import { getSectionSummary } from "../lib/questionBank";

export default function QuestionnairePage() {
  const searchParams = useSearchParams();
  const [currentSection, setCurrentSection] = useState("business-model");
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string | null>(null);

  const sections = getSectionSummary();

  useEffect(() => {
    const assessmentId = searchParams.get('assessmentId');
    const section = searchParams.get('section');
    setCurrentAssessmentId(assessmentId);

    // Set the section from URL parameter, default to business-model
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
    console.log("Section completed:", currentSection, responses);

    if (!completedSections.includes(currentSection)) {
      setCompletedSections([...completedSections, currentSection]);
    }

    // Move to next section if available
    const currentIndex = sections.findIndex(s => s.id === currentSection);
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1].id);
    }
  };

  const handleProgress = (progress: number) => {
    console.log("Section progress:", currentSection, `${progress}%`);
  };

  const currentSectionData = sections.find(s => s.id === currentSection);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/authorization-pack">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Authorization Pack
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900">Assessment Questionnaire</h1>
          <p className="text-slate-600">
            Complete the FCA authorization readiness assessment
          </p>
        </div>
      </div>

      {/* Section Progress */}
      <Card className="border border-slate-100">
        <CardHeader>
          <CardTitle>Assessment Sections</CardTitle>
          <CardDescription>
            Navigate through different areas of the authorization assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {sections.map((section) => {
              const isActive = section.id === currentSection;
              const isCompleted = completedSections.includes(section.id);

              return (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.id)}
                  className={`p-4 text-left border rounded-lg transition-all ${
                    isActive
                      ? "border-teal-200 bg-teal-50"
                      : isCompleted
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {isCompleted && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    )}
                    <h3 className={`font-medium text-sm ${
                      isActive ? "text-teal-900" : isCompleted ? "text-emerald-900" : "text-slate-900"
                    }`}>
                      {section.name}
                    </h3>
                  </div>
                  <p className={`text-xs ${
                    isActive ? "text-teal-600" : isCompleted ? "text-emerald-600" : "text-slate-500"
                  }`}>
                    {section.description}
                  </p>
                  {isActive && (
                    <Badge className="mt-2 bg-teal-600 hover:bg-teal-700 text-xs">
                      Current
                    </Badge>
                  )}
                  {isCompleted && !isActive && (
                    <Badge variant="outline" className="mt-2 border-emerald-200 text-emerald-700 text-xs">
                      Completed
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Section */}
      {currentSectionData && (
        <Card className="border border-slate-100">
          <CardHeader>
            <CardTitle>{currentSectionData.name}</CardTitle>
            <CardDescription>{currentSectionData.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <AssessmentQuestionnaire
              sectionId={currentSection}
              assessmentId={currentAssessmentId || undefined}
              onComplete={handleSectionComplete}
              onProgress={handleProgress}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}