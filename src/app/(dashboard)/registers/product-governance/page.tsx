import { Suspense } from "react";
import { ProductGovernanceClient } from "./ProductGovernanceClient";

export const metadata = {
  title: "Product Governance Register | Nasara Connect",
  description: "Manage product governance records and compliance",
};

export default function ProductGovernancePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading...</div>}>
        <ProductGovernanceClient />
      </Suspense>
    </div>
  );
}
