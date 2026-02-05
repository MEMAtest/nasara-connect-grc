import type { ReactNode } from "react";
import { requireModuleAccess } from "@/lib/module-access";

export default async function ComplaintsLayout({ children }: { children: ReactNode }) {
  await requireModuleAccess("complaints");
  return <>{children}</>;
}
