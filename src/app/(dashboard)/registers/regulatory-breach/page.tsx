import { Suspense } from "react";
import { RegulatoryBreachClient } from "./RegulatoryBreachClient";

export const metadata = {
  title: "Regulatory Breach Log | Nasara Connect",
  description: "Track and manage regulatory breaches and compliance failures",
};

export default function RegulatoryBreachPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading...</div>}>
        <RegulatoryBreachClient />
      </Suspense>
    </div>
  );
}
