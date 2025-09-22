"use client";

import { use } from "react";
import { TrainingContentRenderer } from "../../components/TrainingContentRenderer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface LessonPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function LessonPage({ params }: LessonPageProps) {
  const router = useRouter();
  const { id } = use(params);

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

        {/* Training Content */}
        <TrainingContentRenderer
          contentId={id}
          onComplete={handleComplete}
          onProgress={handleProgress}
        />
      </div>
    </div>
  );
}