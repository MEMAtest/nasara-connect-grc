import { Suspense } from "react";
import { GRCHubClient } from "./GRCHubClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "GRC Control Panel | Nasara Connect",
  description: "Central hub for all Governance, Risk, and Compliance tools",
};

export default function GRCHubPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <span className="ml-2 text-slate-500">Loading GRC Hub...</span>
          </div>
        }
      >
        <GRCHubClient />
      </Suspense>
    </div>
  );
}
