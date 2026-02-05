import type { ReactNode } from "react";
import { requireModuleAccess } from "@/lib/module-access";

export default async function Layout({ children }: { children: ReactNode }) {
  await requireModuleAccess("payments");
  return <>{children}</>;
}
