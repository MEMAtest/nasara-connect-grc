import { Suspense } from "react";
import { EddCasesClient } from "./EddCasesClient";

export const metadata = {
  title: "EDD Cases Register | Nasara Connect",
  description: "Manage enhanced due diligence cases and approvals",
};

export default function EddCasesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading...</div>}>
        <EddCasesClient />
      </Suspense>
    </div>
  );
}
