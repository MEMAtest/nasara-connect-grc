import { Suspense } from "react";
import { DataBreachDsarClient } from "./DataBreachDsarClient";

export const metadata = {
  title: "Data Breach & DSAR Register | Nasara Connect",
  description: "Track data breaches and data subject access requests",
};

export default function DataBreachDsarPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading...</div>}>
        <DataBreachDsarClient />
      </Suspense>
    </div>
  );
}
