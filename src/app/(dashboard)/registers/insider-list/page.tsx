import { Suspense } from "react";
import { InsiderListClient } from "./InsiderListClient";

export const metadata = {
  title: "Insider List Register | Nasara Connect",
  description: "Manage insider lists and track access to inside information",
};

export default function InsiderListPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading...</div>}>
        <InsiderListClient />
      </Suspense>
    </div>
  );
}
