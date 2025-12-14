"use client";

import { use } from "react";
import { TrainingContentRenderer } from "../../components/TrainingContentRenderer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LinkedPoliciesPanel } from "@/components/policies/LinkedPoliciesPanel";

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

        {/* Training Content */}
        <TrainingContentRenderer
          contentId={id}
          onComplete={handleComplete}
          onProgress={handleProgress}
          deepLink={deepLink}
          onDeepLinkChange={handleDeepLinkChange}
        />
      </div>
    </div>
  );
}
