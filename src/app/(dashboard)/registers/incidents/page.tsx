import { Suspense } from "react";
import { IncidentRegisterClient } from "./IncidentRegisterClient";

export const metadata = {
  title: "Incident Register | Nasara Connect",
  description: "Track operational incidents and near-misses",
};

export default function IncidentRegisterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading...</div>}>
        <IncidentRegisterClient />
      </Suspense>
    </div>
  );
}
