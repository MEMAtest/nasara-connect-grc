import { Suspense } from "react";
import { OpResilienceClient } from "./OpResilienceClient";

export const metadata = {
  title: "Operational Resilience Register | Nasara Connect",
  description: "Track important business services and operational resilience",
};

export default function OpResiliencePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading...</div>}>
        <OpResilienceClient />
      </Suspense>
    </div>
  );
}
