"use client";

import { use } from "react";
import { TrainingContentRenderer } from "../../components/TrainingContentRenderer";
import { getTrainingModule } from "../../content";
import { trainingSimulations, dailyMicroChallenges, sampleMicroLessons } from "../../lib/trainingContent";
import { SimulationLab } from "../../components/SimulationLab";
import { DailyMicroChallenge } from "../../components/DailyMicroChallenge";
import { MicroLearning } from "../../components/MicroLearning";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LinkedPoliciesPanel } from "@/components/policies/LinkedPoliciesPanel";
import { Card, CardContent } from "@/components/ui/card";

interface LessonClientProps {
  params: Promise<{
    id: string;
  }>;
}

export function LessonClient({ params }: LessonClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { id } = use(params);

  const trainingModule = getTrainingModule(id);
  const simulation = trainingSimulations.find((item) => item.id === id);
  const microChallenge = dailyMicroChallenges.find((item) => item.id === id);
  const microLesson = sampleMicroLessons.find((item) => item.id === id);

  const deepLink = {
    stage: searchParams?.get("stage") ?? undefined,
    section: searchParams?.get("section") ?? undefined,
  };

  const handleDeepLinkChange = (next: { stage?: string; section?: string }) => {
    const nextParams = new URLSearchParams(searchParams?.toString());
    if (next.stage) {
      nextParams.set("stage", next.stage);
    } else {
      nextParams.delete("stage");
    }
    if (next.section) {
      nextParams.set("section", next.section);
    } else {
      nextParams.delete("section");
    }
    const nextQuery = nextParams.toString();
    const currentQuery = searchParams?.toString() ?? "";
    if (nextQuery === currentQuery) return;
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  };

  const handleComplete = (score: number, timeSpent: number) => {
    // Handle lesson completion - update progress, award points, etc.
    console.log(`Lesson completed with score: ${score}%, time: ${timeSpent}min`);
    // Navigate back to training library or next lesson
    router.push('/training-library');
  };

  const handleProgress = (progress: number) => {
    // Handle progress updates
    console.log(`Progress: ${progress}%`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/training-library')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Training Library
          </Button>
        </div>

        <div className="mb-6">
          <LinkedPoliciesPanel
            title="Linked policies"
            helperText="Policies that require or reference this training lesson."
            endpoint={`/api/training/lessons/${encodeURIComponent(id)}/links`}
          />
        </div>

        {trainingModule ? (
          <TrainingContentRenderer
            contentId={id}
            onComplete={handleComplete}
            onProgress={handleProgress}
            deepLink={deepLink}
            onDeepLinkChange={handleDeepLinkChange}
          />
        ) : microLesson ? (
          <MicroLearning
            lesson={microLesson}
            onComplete={() => {
            }}
            onProgress={handleProgress}
          />
        ) : simulation ? (
          <SimulationLab
            simulation={simulation}
            onComplete={() => {
            }}
          />
        ) : microChallenge ? (
          <DailyMicroChallenge
            challenge={microChallenge}
            onComplete={() => {
            }}
          />
        ) : (
          <div className="max-w-4xl mx-auto">
            <Card className="border border-red-200 bg-red-50">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-900 mb-2">Training Content Not Found</h2>
                <p className="text-red-700 mb-6">The requested training item “{id}” could not be found.</p>
                <Button onClick={() => router.push('/training-library')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Training Library
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
