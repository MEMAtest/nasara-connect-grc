import { Suspense } from "react";
import { PaDealingClient } from "./PaDealingClient";

export const metadata = {
  title: "PA Dealing Log | Nasara Connect",
  description: "Track personal account dealing requests and approvals",
};

export default function PaDealingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading...</div>}>
        <PaDealingClient />
      </Suspense>
    </div>
  );
}
