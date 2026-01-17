import { Suspense } from "react";
import { TxMonitoringClient } from "./TxMonitoringClient";

export const metadata = {
  title: "Transaction Monitoring Alerts | Nasara Connect",
  description: "Track and manage transaction monitoring alerts and investigations",
};

export default function TxMonitoringPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading...</div>}>
        <TxMonitoringClient />
      </Suspense>
    </div>
  );
}
