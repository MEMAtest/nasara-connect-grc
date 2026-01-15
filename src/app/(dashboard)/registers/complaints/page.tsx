import { Suspense } from "react";
import { ComplaintsRegisterClient } from "./ComplaintsRegisterClient";

export const metadata = {
  title: "Complaints Register | Nasara Connect",
  description: "Manage customer complaints for FCA regulatory compliance",
};

export default function ComplaintsRegisterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading...</div>}>
        <ComplaintsRegisterClient />
      </Suspense>
    </div>
  );
}
