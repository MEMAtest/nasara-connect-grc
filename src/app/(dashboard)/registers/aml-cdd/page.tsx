import { Suspense } from "react";
import { AmlCddClient } from "./AmlCddClient";

export const metadata = {
  title: "AML CDD Register | Nasara Connect",
  description: "Track customer due diligence status and reviews",
};

export default function AmlCddPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading...</div>}>
        <AmlCddClient />
      </Suspense>
    </div>
  );
}
