import { Suspense } from "react";
import { VulnerableCustomersClient } from "./VulnerableCustomersClient";

export const metadata = {
  title: "Vulnerable Customers Log | Nasara Connect",
  description: "Track and manage vulnerable customer records for Consumer Duty compliance",
};

export default function VulnerableCustomersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading...</div>}>
        <VulnerableCustomersClient />
      </Suspense>
    </div>
  );
}
