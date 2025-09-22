import { LessonClient } from "./LessonClient";

export const dynamic = "force-dynamic";

interface LessonPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function LessonPage({ params }: LessonPageProps) {
  return <LessonClient params={params} />;
}