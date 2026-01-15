import { Suspense } from "react";
import { ThirdPartyRegisterClient } from "./ThirdPartyRegisterClient";

export const metadata = {
  title: "Third-Party Register | Nasara Connect",
  description: "Manage vendors, outsourcing arrangements, and third-party relationships",
};

export default function ThirdPartyRegisterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading...</div>}>
        <ThirdPartyRegisterClient />
      </Suspense>
    </div>
  );
}
