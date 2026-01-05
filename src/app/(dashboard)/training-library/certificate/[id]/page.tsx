import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getSessionIdentity } from "@/lib/auth-utils";
import { getTrainingModule } from "../../content";
import { normalizeTrainingModule } from "../../lib/module-normalizer";
import { CertificateClient } from "./CertificateClient";

interface CertificatePageProps {
  params: {
    id: string;
  };
}

export default async function CertificatePage({ params }: CertificatePageProps) {
  const module = normalizeTrainingModule(getTrainingModule(params.id));

  if (!module) {
    notFound();
  }

  const session = await auth();
  const identity = getSessionIdentity(session);
  const learnerName = identity?.name || identity?.email || "Nasara Learner";

  return (
    <CertificateClient
      moduleId={module.id}
      moduleTitle={module.title}
      learnerName={learnerName}
    />
  );
}
