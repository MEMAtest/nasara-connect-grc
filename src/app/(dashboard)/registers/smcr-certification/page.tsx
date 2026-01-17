import { Suspense } from "react";
import { SmcrCertificationClient } from "./SmcrCertificationClient";

export const metadata = {
  title: "SM&CR Certification Register | Nasara Connect",
  description: "Track SM&CR certification assessments and fitness & propriety",
};

export default function SmcrCertificationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading...</div>}>
        <SmcrCertificationClient />
      </Suspense>
    </div>
  );
}
