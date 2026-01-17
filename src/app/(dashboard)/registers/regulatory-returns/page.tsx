import { Suspense } from "react";
import { RegulatoryReturnsClient } from "./RegulatoryReturnsClient";

export const metadata = {
  title: "Regulatory Returns Register | Nasara Connect",
  description: "Track regulatory return submissions and deadlines",
};

export default function RegulatoryReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading...</div>}>
        <RegulatoryReturnsClient />
      </Suspense>
    </div>
  );
}
