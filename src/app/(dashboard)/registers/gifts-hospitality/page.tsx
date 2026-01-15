import { Suspense } from "react";
import { GiftsHospitalityClient } from "./GiftsHospitalityClient";

export const metadata = {
  title: "Gifts & Hospitality | Nasara Connect",
  description: "Track gifts and hospitality given and received",
};

export default function GiftsHospitalityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading...</div>}>
        <GiftsHospitalityClient />
      </Suspense>
    </div>
  );
}
