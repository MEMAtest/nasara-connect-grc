import { Suspense } from "react";
import { ConflictsRegisterClient } from "./ConflictsRegisterClient";

export const metadata = {
  title: "Conflicts of Interest | Nasara Connect",
  description: "Track and manage conflicts of interest declarations",
};

export default function ConflictsRegisterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading...</div>}>
        <ConflictsRegisterClient />
      </Suspense>
    </div>
  );
}
