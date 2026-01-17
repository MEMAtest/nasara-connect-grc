import { Suspense } from "react";
import { SarNcaClient } from "./SarNcaClient";

export const metadata = {
  title: "SAR-NCA Reports Register | Nasara Connect",
  description: "Track Suspicious Activity Reports submitted to the NCA",
};

export default function SarNcaPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading...</div>}>
        <SarNcaClient />
      </Suspense>
    </div>
  );
}
