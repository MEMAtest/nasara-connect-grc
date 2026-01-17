import { Suspense } from "react";
import { OutsideBusinessClient } from "./OutsideBusinessClient";

export const metadata = {
  title: "Outside Business Interests Register | Nasara Connect",
  description: "Track employee outside business interests and conflicts of interest",
};

export default function OutsideBusinessPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading...</div>}>
        <OutsideBusinessClient />
      </Suspense>
    </div>
  );
}
