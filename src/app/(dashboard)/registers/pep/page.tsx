import { Suspense } from "react";
import { PEPRegisterClient } from "./PEPRegisterClient";

export const metadata = {
  title: "PEP Register | Nasara Connect",
  description: "Manage Politically Exposed Persons register for AML compliance",
};

export default function PEPRegisterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading...</div>}>
        <PEPRegisterClient />
      </Suspense>
    </div>
  );
}
