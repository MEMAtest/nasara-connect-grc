import { Suspense } from "react";
import { TcRecordClient } from "./TcRecordClient";

export const metadata = {
  title: "T&C Record Register | Nasara Connect",
  description: "Track employee training and competence records",
};

export default function TcRecordPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading...</div>}>
        <TcRecordClient />
      </Suspense>
    </div>
  );
}
