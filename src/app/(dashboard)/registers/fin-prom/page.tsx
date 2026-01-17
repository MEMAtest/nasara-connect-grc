import { Suspense } from "react";
import { FinPromClient } from "./FinPromClient";

export const metadata = {
  title: "FinProm Tracker | Nasara Connect",
  description: "Track financial promotions and marketing compliance",
};

export default function FinPromPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading...</div>}>
        <FinPromClient />
      </Suspense>
    </div>
  );
}
