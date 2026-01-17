import { Suspense } from "react";
import { SanctionsClient } from "./SanctionsClient";

export const metadata = {
  title: "Sanctions Screening Log | Nasara Connect",
  description: "Track sanctions screening results and alerts",
};

export default function SanctionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading...</div>}>
        <SanctionsClient />
      </Suspense>
    </div>
  );
}
