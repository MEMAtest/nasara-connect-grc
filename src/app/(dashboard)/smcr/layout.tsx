import type { ReactNode } from "react";
import { requireModuleAccess } from "@/lib/module-access";
import SmcrLayoutClient from "./SmcrLayoutClient";

export default async function SmcrLayout({ children }: { children: ReactNode }) {
  await requireModuleAccess("smcr");
  return <SmcrLayoutClient>{children}</SmcrLayoutClient>;
}
