import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getSessionIdentity } from "@/lib/auth-utils";
import { getTrainingModule } from "../../content";
import { normalizeTrainingModule } from "../../lib/module-normalizer";
import { CertificateClient } from "./CertificateClient";

interface CertificatePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CertificatePage({ params }: CertificatePageProps) {
  const { id } = await params;
  const trainingModule = normalizeTrainingModule(getTrainingModule(id) as Parameters<typeof normalizeTrainingModule>[0]);

  if (!trainingModule) {
    notFound();
  }

  const session = await auth();
  const identity = getSessionIdentity(session);
  const learnerName = identity?.name || identity?.email || "Nasara Learner";

  return (
    <CertificateClient
      moduleId={trainingModule.id}
      moduleTitle={trainingModule.title}
      learnerName={learnerName}
    />
  );
}
